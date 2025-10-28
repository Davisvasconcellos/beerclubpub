const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

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
  origin: 'http://localhost:4200',
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// ============================================
// CONFIGURAÇÕES GLOBAIS
// ============================================

// Diretórios base
const DIRECTORIES = {
  images: path.join(__dirname, 'public', 'images'),
  user: path.join(__dirname, 'public', 'images', 'user'),
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

// Configurar o multer para salvar arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, DIRECTORIES.user);
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const extension = path.extname(file.originalname);
    const filename = `user-${timestamp}-${randomNum}${extension}`;
    cb(null, filename);
  }
});

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

// Endpoint para upload de avatar
app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum arquivo foi enviado' 
      });
    }

    const filePath = `/images/user/${req.file.filename}`;
    
    console.log('✅ Upload realizado com sucesso:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      path: filePath
    });

    res.json({
      success: true,
      message: 'Upload realizado com sucesso!',
      filename: req.file.filename,
      path: filePath,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
});

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

// Endpoint de status do servidor
app.get('/status', (req, res) => {
  res.json({
    success: true,
    server: 'Frontend Utility Server',
    version: '1.0.0',
    port: PORT,
    uptime: process.uptime(),
    features: {
      upload: true,
      resize: false,      // Futuro
      qrcode: false,      // Futuro
      pdf: false,         // Futuro
      proxy: false        // Futuro
    },
    directories: DIRECTORIES
  });
});

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
  console.log('   ✅ Exclusão de imagens (/delete-avatar/:filename)');
  console.log('   ✅ Status do servidor (/status)');
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