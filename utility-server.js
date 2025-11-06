const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sharp = require('sharp');

const app = express();
const PORT = 3001;

// ============================================
// FRONTEND UTILITY SERVER
// ============================================
// Servidor utilitário para funcionalidades que o Angular não pode fazer sozinho
// Atualmente: Upload de imagens
// Futuro: Redimensionamento, QR Codes, PDF, etc.

console.log('🚀 Iniciando Frontend Utility Server...');

// Configurar CORS para permitir requisições do Angular
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:4200',
      'http://localhost:4300'
    ];
    // Permitir chamadas sem origin (ex.: ferramentas locais) e as portas permitidas
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

// ============================================
// CONFIGURAÇÕES GLOBAIS
// ============================================

// Diretórios base
const DIRECTORIES = {
  images: path.join(__dirname, 'public', 'images'),
  user: path.join(__dirname, 'public', 'images', 'user'),
  stores: path.join(__dirname, 'public', 'images', 'stores'),
  temp: path.join(__dirname, 'temp'),
  cache: path.join(__dirname, 'cache')
};

// Garantir que os diretórios existem
Object.values(DIRECTORIES).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('📁 Diretórios configurados:', DIRECTORIES);

// ============================================
// MÓDULO: UPLOAD DE IMAGENS
// ============================================

// Usar armazenamento em memória para ter acesso ao req.body antes de salvar
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limite
  },
  fileFilter: function (req, file, cb) {
    // Aceitar apenas imagens JPG e PNG
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JPG e PNG são permitidos!'), false);
    }
  }
});

// ============================================
// ROTAS: UPLOAD DE IMAGENS
// ============================================

function sanitizeFolderName(name) {
  if (!name || typeof name !== 'string') return null;
  const trimmed = name.trim().toLowerCase();
  // permitir apenas letras, números, hífen e underscore; sem espaços, sem barras
  const safe = trimmed.replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
  if (!safe) return null;
  // impedir nomes reservados
  const reserved = new Set(['..', '.', 'images', 'cache', 'temp']);
  if (reserved.has(safe)) return null;
  return safe;
}

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Endpoint para upload de avatar
const MAX_FINAL_SIZE = 500 * 1024; // 500KB

async function processImageToLimit(buffer, options) {
  const {
    width,
    height,
    fit = 'cover',
    format, // jpeg|png|webp|avif
    quality: initialQuality = 80,
    originalExt
  } = options;

  // decidir formato alvo
  let targetFormat = (format || '').toLowerCase();
  if (!targetFormat) {
    // se png, usar webp para melhor compressão por padrão
    if (originalExt === '.png') targetFormat = 'webp';
    else if (originalExt === '.jpg' || originalExt === '.jpeg') targetFormat = 'jpeg';
    else targetFormat = 'webp';
  }

  let quality = initialQuality;
  let currentWidth = width || null;
  let currentHeight = height || null;

  for (let attempts = 0; attempts < 8; attempts++) {
    let pipeline = sharp(buffer).rotate().resize({ width: currentWidth, height: currentHeight, fit, withoutEnlargement: true });

    if (targetFormat === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (targetFormat === 'png') {
      // png é pouco eficiente para fotos; se estourar o limite, trocaremos para webp
      pipeline = pipeline.png({ compressionLevel: 9 });
    } else if (targetFormat === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (targetFormat === 'avif') {
      pipeline = pipeline.avif({ quality });
    }

    const outBuffer = await pipeline.toBuffer();

    if (outBuffer.length <= MAX_FINAL_SIZE) {
      return { buffer: outBuffer, ext: `.${targetFormat}` };
    }

    // se PNG e muito grande, migrar para WEBP na próxima tentativa
    if (targetFormat === 'png') {
      targetFormat = 'webp';
      continue;
    }

    // reduzir qualidade até um mínimo
    if (quality > 35) {
      quality = Math.max(35, quality - 10);
      continue;
    }

    // reduzir dimensões em 10% quando qualidade já está baixa
    if (currentWidth || currentHeight) {
      if (currentWidth) currentWidth = Math.max(64, Math.floor(currentWidth * 0.9));
      if (currentHeight) currentHeight = Math.max(64, Math.floor(currentHeight * 0.9));
      continue;
    } else {
      // se nenhum tamanho foi informado, reduzir para 90% do tamanho original automaticamente
      const meta = await sharp(buffer).metadata();
      currentWidth = Math.max(64, Math.floor((meta.width || 0) * 0.9));
      currentHeight = Math.max(64, Math.floor((meta.height || 0) * 0.9));
      continue;
    }
  }

  // última tentativa: retornar mesmo assim (pode exceder)
  const finalBuffer = await sharp(buffer).rotate().toFormat('webp', { quality: 35 }).toBuffer();
  return { buffer: finalBuffer, ext: '.webp' };
}

const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum arquivo foi enviado' 
      });
    }

    // Agora req.body está disponível e podemos determinar o destino e o nome do arquivo
    const uploadType = req.body.type || 'user'; // 'banner' | 'profile' | 'user' | 'store-*'
    const { entityId } = req.body;
    const w = req.body.w ? parseInt(req.body.w, 10) : undefined;
    const h = req.body.h ? parseInt(req.body.h, 10) : undefined;
    const fit = (req.body.fit || 'cover').toLowerCase();
    const requestedFormat = req.body.format ? String(req.body.format).toLowerCase() : undefined;
    const q = req.body.q ? parseInt(req.body.q, 10) : undefined;
    const rawFolder = req.body.folder ? String(req.body.folder) : undefined;
    const customFolder = sanitizeFolderName(rawFolder);

    let subfolder = 'user';
    if (customFolder) {
      subfolder = customFolder;
    } else if (uploadType.startsWith('store-')) {
      subfolder = 'stores';
    }
    const destDir = path.join(DIRECTORIES.images, subfolder);
    ensureDirExists(destDir);

    // Gerar nome de arquivo simples: (user|store)-timestamp.ext
    const extension = path.extname(req.file.originalname).toLowerCase();
    const baseType = subfolder;
    
    // Processar imagem com limite de 500KB
    const { buffer: outBuffer, ext: finalExt } = await processImageToLimit(req.file.buffer, {
      width: w,
      height: h,
      fit,
      format: requestedFormat,
      quality: q || 80,
      originalExt: extension
    });

    const filename = `${baseType}-${Date.now()}${finalExt}`;
    const finalPath = path.join(destDir, filename);
    const fileUrl = `${req.protocol}://${req.get('host')}/images/${subfolder}/${filename}`;

    // Salvar o buffer processado no disco
    fs.writeFileSync(finalPath, outBuffer);
    
    console.log('✅ Upload realizado com sucesso:', {
      originalName: req.file.originalname,
      filename: filename,
      size: outBuffer.length,
      url: fileUrl,
      folder: subfolder
    });

    res.json({
      success: true,
      message: 'Upload realizado com sucesso!',
      filename: filename,
      url: fileUrl,
      size: outBuffer.length,
      folder: subfolder
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Novo endpoint genérico
app.post('/upload/image', upload.single('image'), handleUpload);

// Endpoint antigo para compatibilidade (redireciona internamente)
app.post('/upload-avatar', upload.single('avatar'), handleUpload);

// Endpoint para deletar avatar
app.delete('/delete-avatar/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(DIRECTORIES.user, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ Arquivo deletado:', filename);
      
      res.json({
        success: true,
        message: 'Arquivo deletado com sucesso!',
        filename: filename
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar arquivo',
      error: error.message 
    });
  }
});

// ============================================
// ROTAS: INFORMAÇÕES DO SERVIDOR
// ============================================

// (endpoint /status removido do escopo atual)

// Endpoint para listar arquivos de usuário
app.get('/files/user', (req, res) => {
  try {
    const files = fs.readdirSync(DIRECTORIES.user)
      .filter(file => file.match(/\.(jpg|jpeg|png)$/i))
      .map(file => {
        const filePath = path.join(DIRECTORIES.user, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          path: `/images/user/${file}`,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      });

    res.json({
      success: true,
      count: files.length,
      files: files
    });
  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar arquivos',
      error: error.message
    });
  }
});

// ============================================
// MIDDLEWARE DE ERRO E INICIALIZAÇÃO
// ============================================

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro no servidor:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Máximo 5MB permitido.'
      });
    }
  }

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: error.message
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('🎯 ============================================');
  console.log('🚀 FRONTEND UTILITY SERVER INICIADO');
  console.log('🎯 ============================================');
  console.log(`📡 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📁 Diretório de imagens: ${DIRECTORIES.user}`);
  console.log('');
  console.log('📋 Funcionalidades ativas:');
  console.log('   ✅ Upload de imagens (/upload-avatar)');
  console.log('   ✅ Upload genérico de imagens (/upload/image)');
  console.log('   ✅ Listagem de arquivos (/files/user)');
  console.log('');
  console.log('🔮 Funcionalidades futuras:');
  console.log('   ⏳ Redimensionamento de imagens');
  console.log('   ⏳ Geração de QR Codes');
  console.log('   ⏳ Geração de PDF');
  console.log('   ⏳ Proxy reverso');
  console.log('🎯 ============================================');
  console.log('');
});