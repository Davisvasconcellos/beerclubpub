import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { EventService, ApiQuestion, AnswerItemPayload, QuestionOptionCount, ApiResponseItem, QuestionWithAnswer } from '../event.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TextAreaComponent } from '../../../shared/components/form/input/text-area.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { RadioComponent } from '../../../shared/components/form/input/radio.component';
import { CheckboxComponent } from '../../../shared/components/form/input/checkbox.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { ThemeToggleTwoComponent } from '../../../shared/components/common/theme-toggle-two/theme-toggle-two.component';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexPlotOptions, ApexDataLabels, ApexXAxis, ApexLegend, ApexYAxis } from 'ng-apexcharts';

type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating' | 'music_preference';

@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    // Form components padrão
    TextAreaComponent,
    InputFieldComponent,
    RadioComponent,
    CheckboxComponent,
    // Botão padrão
    ButtonComponent,
    // Gráficos para resultados de múltipla escolha
    NgApexchartsModule,
    // Botão flutuante de tema
    ThemeToggleTwoComponent,
  ],
  templateUrl: './questionnaire.component.html',
  styleUrl: './questionnaire.component.css',
  animations: [
    trigger('slideFade', [
      transition(':increment', [
        style({ opacity: 0, transform: 'translateX(16px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':decrement', [
        style({ opacity: 0, transform: 'translateX(-16px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      // Fallback para alterações diretas
      transition('* => *', [
        style({ opacity: 0 }),
        animate('180ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class QuestionnaireComponent implements OnInit {
  idCode = '';
  questions: ApiQuestion[] = [];
  currentIndex = 0;
  submitting = false;
  loadError = '';
  done = false;
  // Loader para checagem da pergunta atual
  checkingCurrent = false;

  // Flag: rota plain sem layout
  isPlain: boolean = false;

  // Dados do evento para banner
  eventName: string = '';
  eventBannerUrl: string = '';

  // Resultado da pergunta atual (quando show_results=true)
  showingResults = false;
  resultError = '';
  resultTotal = 0;
  resultCounts: { label: string; count: number }[] = [];
  resultAccuracyPercent?: number;
  // Loading dos resultados (evita render instável do gráfico)
  resultLoading = false;
  // Controle de autoavanço
  autoAdvanceMs = 4000;
  autoProgress = 0; // 0..100
  private autoTimer?: any;

  // Classe de cor da barra do temporizador nos resultados
  timerBarClass: string = 'bg-amber-500';

  // Config do gráfico horizontal (reuso do estilo do event-view)
  barChart: ApexChart = { fontFamily: 'Outfit, sans-serif', type: 'bar', height: 220, toolbar: { show: false } };
  barPlot: ApexPlotOptions = { bar: { horizontal: true, barHeight: '60%', borderRadius: 6, borderRadiusApplication: 'end' } };
  barLabels: ApexDataLabels = { enabled: false };
  barLegend: ApexLegend = { show: false };
  barYAxis: ApexYAxis = { title: { text: undefined } };
  barColors: string[] = ['#465fff'];
  // Props estáveis para o apx-chart (evitam recriação a cada ciclo de detecção)
  chartSeries: ApexAxisChartSeries = [{ name: 'Respostas', data: [] }];
  chartXAxis: ApexXAxis = { categories: [], axisBorder: { show: false }, axisTicks: { show: false } };
  chartYAxis: ApexYAxis = { title: { text: undefined } };

  // Respostas coletadas por id de pergunta
  answers: Record<number, string | string[] | number> = {};
  // Controle de envio por pergunta
  submittedByQuestion: Record<number, { responseId?: number } | true> = {};
  private guestCode: string = '';
  // Estado somente leitura por pergunta (quando já respondida pelo usuário atual)
  readonlyByQuestion: Record<number, boolean> = {};
  // Flag global: evento já iniciado pelo usuário autenticado (detectado via 409)
  eventAlreadyStarted: boolean = false;
  // Mapa de respostas existentes do usuário por pergunta (checado uma vez no carregamento)
  existingAnswersByQuestion: Record<number, ApiResponseItem | null> = {};
  existingCheckDone: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    // Detecta se está na rota sem layout e inicia em modo escuro
    this.isPlain = this.router.url.includes('/events/answer-plain/');
    if (this.isPlain) {
      this.themeService.setTheme('dark');
    }

    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id_code');
      if (id) {
        this.idCode = id;
        try { console.log('[Questionário] init \u2192 id_code:', this.idCode); } catch {}
        // guest_code único para o ciclo do questionário
        this.guestCode = this.uuidv4();
        // Carrega dados do evento para banner
        this.loadEventDetail(id);
        this.loadQuestions(id);
      }
    });
  }

  private loadEventDetail(idCode: string) {
    this.eventService.getEventByIdCodeDetail(idCode).subscribe({
      next: ({ event }) => {
        const name = event.name || event.title || '';
        const banner = (event.banner_url || event.image || '') as string;
        this.eventName = name;
        this.eventBannerUrl = banner || '/images/cards/event2.jpg';
      },
      error: (err) => {
        try { console.warn('[Questionário] Falha ao obter evento para banner:', err?.message || err); } catch {}
      }
    });
  }

  private loadQuestions(idCode: string) {
    try { console.log('[Questionário] GET questions-with-answers \u2192', idCode); } catch {}
    const guestCode = this.authService.isAuthenticated() ? undefined : this.guestCode;
    this.eventService.getQuestionsWithAnswers(idCode, guestCode).subscribe({
      next: (items: QuestionWithAnswer[]) => {
        // Sem filtro: backend já controla visibilidade público/privado conforme token
        this.questions = items
          .map((i) => i.question)
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

        // Mapeia respostas existentes por pergunta e sinaliza questionário iniciado, se houver
        const byQ: Record<number, ApiResponseItem | null> = {};
        for (const item of items) { byQ[item.question.id] = item.answer || null; }
        this.existingAnswersByQuestion = byQ;
        this.eventAlreadyStarted = Object.values(byQ).some((r) => !!r);
        this.existingCheckDone = true;

        this.currentIndex = 0;
        this.loadError = '';
        try { console.log('[Questionário] Perguntas+respostas carregadas:', this.questions.length, 'iniciado?', this.eventAlreadyStarted); } catch {}
        this.prepareCurrentQuestion();
      },
      error: (err) => {
        this.loadError = err?.error?.message || err?.message || 'Falha ao carregar perguntas';
        try { console.log('[Questionário] ERRO ao carregar perguntas:', this.loadError); } catch {}
      }
    });
  }

  get progressPercent(): number {
    if (!this.questions.length) return 0;
    return Math.round(((this.currentIndex) / this.questions.length) * 100);
  }

  isRequired(q: ApiQuestion | undefined): boolean {
    return !!q?.is_required;
  }

  currentQuestion(): ApiQuestion | undefined {
    return this.questions[this.currentIndex];
  }

  getType(q: ApiQuestion | undefined): QuestionType {
    const t = (q?.type || q?.question_type || 'text') as QuestionType;
    return t;
  }

  // Helpers de UI
  asOptions(q: ApiQuestion | undefined): string[] { return q?.options || []; }

  // Navegação
  canGoNext(): boolean {
    const q = this.currentQuestion();
    if (!q) return false;
    // Se pergunta já foi respondida (somente leitura), sempre permite avançar
    if (this.isSubmitted(q)) return true;
    if (!this.isRequired(q)) return true;
    const val = this.answers[q.id];
    if (this.getType(q) === 'checkbox') return Array.isArray(val) && (val as string[]).length > 0;
    return val !== undefined && val !== null && (Array.isArray(val) ? (val as string[]).length > 0 : String(val).trim().length > 0);
  }

  next(): void {
    const q = this.currentQuestion();
    if (!q) return;
    // Salva resposta atual (via PATCH) antes de avançar ou exibir resultados
    const proceed = () => {
      // Exibe tela de resultados apenas para tipos radio/checkbox quando show_results=true
      if (q.show_results) {
        const type = this.getType(q);
        if (type === 'radio') {
          // Atualiza config do servidor e exibe resultados específicos de radio
          this.refreshQuestionConfig(q.id, () => this.showRadioResults(this.currentQuestion()!));
          return;
        }
        if (type === 'checkbox') {
          // Para múltipla escolha (checkbox), exibir estatísticas agregadas
          this.fetchAndShowResults(q);
          return;
        }
        // Para outros tipos (text, textarea, rating, music_preference), não há tela de resultados
        // segue direto para a próxima pergunta
      }
      // Caso contrário, segue fluxo normal
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
        this.prepareCurrentQuestion();
      } else {
        // Última pergunta: envio em lote se ainda não existe questionário, senão apenas finalizar
        if (!this.eventAlreadyStarted) {
          this.submitAll();
          return;
        }
        try { this.router.navigateByUrl('/end-quest-success'); } catch { this.done = true; }
      }
    };

    this.submitSingleIfNeeded(q, proceed);
  }

  back(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.prepareCurrentQuestion();
    }
  }

  skip(): void {
    const q = this.currentQuestion();
    if (!q) return;
    if (!this.isRequired(q)) this.next();
  }

  private fetchAndShowResults(q: ApiQuestion) {
    this.showingResults = true;
    this.resultError = '';
    this.resultLoading = true;
    this.resultCounts = [];
    this.resultTotal = 0;
    this.resultAccuracyPercent = undefined;

    this.eventService.getPublicQuestionStats(this.idCode, q.id).subscribe({
      next: (data) => {
        // Preferir opções vindas das stats; fallback para opções da pergunta
        const labels: string[] = (Array.isArray((data as any).options) && (data as any).options.length > 0
          ? ((data as any).options as any[]).map((o: any) => String(o))
          : ((q.options || []) as string[]).map((o: string) => String(o)));
        // Mapear counts conforme labels das opções (garante ordem estável)
        const countsByLabel: Record<string, number> = {};
        (data.counts || []).forEach((c: QuestionOptionCount) => { countsByLabel[String(c.option_label)] = c.count; });
        this.resultCounts = labels.map((label: string) => ({ label, count: countsByLabel[label] ?? 0 }));
        this.resultTotal = data.total_responses || 0;
        this.resultAccuracyPercent = typeof data.accuracy_percent === 'number' ? data.accuracy_percent : undefined;
        // Atualiza props estáveis do gráfico (renderiza apenas quando dados completos)
        this.chartSeries = [{ name: 'Respostas', data: this.resultCounts.map((c) => c.count) }];
        // Em ApexCharts, mesmo em barras horizontais, as categorias ficam em xaxis
        this.chartXAxis = { categories: labels, axisBorder: { show: false }, axisTicks: { show: false } };
        this.chartYAxis = { title: { text: undefined } };
        this.resultLoading = false;
        try { console.log('[Resultados] labels:', labels, 'counts:', data.counts, 'series:', this.chartSeries); } catch {}
        this.startAutoAdvance();
      },
      error: (err) => {
        this.resultError = err?.error?.message || err?.message || 'Falha ao carregar estatísticas da pergunta.';
        this.resultLoading = false;
        this.startAutoAdvance(); // ainda autoavança mesmo sem stats
      }
    });
  }

  // Resultados para radio: não usa estatísticas agregadas
  private showRadioResults(q: ApiQuestion) {
    this.showingResults = true;
    this.resultError = '';
    this.resultCounts = [];
    this.resultTotal = 0;
    this.resultAccuracyPercent = undefined;
    // Log para conferência no console do navegador
    try {
      const correctLabel = this.getRadioCorrectLabel(q);
      const correctIndex = this.getCorrectIndex(q);
      const selectedLabel = this.getRadioSelectedLabel(q);
      // eslint-disable-next-line no-console
      console.log('[Questionário] Correta:', correctLabel, '(índice:', correctIndex, ')');
      // eslint-disable-next-line no-console
      console.log('[Questionário] Sua escolha:', selectedLabel);
    } catch {}
    this.startAutoAdvance();
  }

  // Labels auxiliares na tela de resultados de rádio
  getRadioSelectedLabel(q: ApiQuestion | undefined): string {
    if (!q) return '';
    const selected = this.answers[q.id];
    return selected ? String(selected) : '';
  }

  getRadioCorrectLabel(q: ApiQuestion | undefined): string {
    if (!q || !Array.isArray(q.options)) return '';
    const idx = this.getCorrectIndex(q);
    if (idx < 0 || idx >= q.options.length) return '';
    return String(q.options[idx]);
  }

  // Índice da opção correta (suporta correct_option_index e correctIndex)
  getCorrectIndex(q: ApiQuestion | undefined): number {
    if (!q) return -1;
    const cfg: any = (q as any).config || {};
    // Suporta top-level 'correct_option_index', config.correct_option_index e config.correctIndex
    let raw: any = -1;
    if (typeof (q as any).correct_option_index === 'number') raw = (q as any).correct_option_index;
    else if (typeof cfg.correct_option_index === 'number') raw = cfg.correct_option_index;
    else if (typeof cfg.correctIndex === 'number') raw = cfg.correctIndex;
    return typeof raw === 'number' ? Math.max(-1, Math.floor(raw)) : -1;
  }

  // Salvar resposta individual via PATCH se ainda não enviado
  private submitSingleIfNeeded(q: ApiQuestion, onDone: () => void): void {
    const already = !!this.submittedByQuestion[q.id];
    const payload = this.buildSinglePayload(q);
    // Se não há resposta (permitido para não obrigatórias), apenas segue
    if (!payload) { onDone(); return; }
    if (already) { onDone(); return; }
    const guestCode = this.authService.isAuthenticated() ? undefined : this.guestCode;
    try { console.log('[Questionário] PATCH resposta (única) \u2192 q.id:', q.id, 'payload:', payload); } catch {}
    this.submitting = true;
    this.eventService.patchEventResponses(this.idCode, { guest_code: guestCode, answers: [payload] }).subscribe({
      next: (resp) => {
        this.submitting = false;
        this.submittedByQuestion[q.id] = true;
        this.readonlyByQuestion[q.id] = true;
        this.eventAlreadyStarted = true;
        try { console.log('[Questionário] OK salvo (PATCH)'); } catch {}
        onDone();
      },
      error: (err) => {
        this.submitting = false;
        const msg = err?.error?.message || err?.message || 'Falha ao enviar resposta';
        if (err?.status === 409) {
          // Usuário já possui submission para o evento (Duplicate entry)
          this.eventAlreadyStarted = true;
          try { console.log('[Questionário] 409 Duplicate entry \u2192 Já existe um questionário iniciado:', msg, err?.error, '\u2192 Marcando eventAlreadyStarted=true'); } catch {}
          // Não bloquear fluxo: apenas seguir sem marcar como enviado
          onDone();
          return;
        }
        try { console.log('[Questionário] ERRO ao enviar resposta:', msg); } catch {}
        // Mantém mensagem visível para outros erros
        this.loadError = msg;
        // Não avança em caso de erro real
      }
    });
  }

  private buildSinglePayload(q: ApiQuestion): AnswerItemPayload | null {
    const raw = this.answers[q.id];
    const type = this.getType(q);
    if (raw === undefined || raw === null) return null;
    if (Array.isArray(raw) && raw.length === 0) return null;
    if (typeof raw === 'string' && raw.trim().length === 0) return null;
    if (type === 'checkbox') {
      return { question_id: q.id, answer_json: Array.isArray(raw) ? [...raw] : [] } as AnswerItemPayload;
    }
    if (type === 'rating') {
      if (typeof raw === 'number') return { question_id: q.id, answer_json: { value: raw } } as AnswerItemPayload;
      const num = Number(raw);
      return { question_id: q.id, answer_json: { value: isNaN(num) ? 0 : num } } as AnswerItemPayload;
    }
    return { question_id: q.id, answer_text: String(raw) } as AnswerItemPayload;
  }

  // Refresca a pergunta pelo backend (para obter índice correto atualizado)
  private refreshQuestionConfig(questionId: number, cb?: () => void): void {
    try { console.log('[Questionário] Refresh pergunta config \u2192 questionId:', questionId); } catch {}
    this.eventService.getEventQuestions(this.idCode).subscribe({
      next: (items) => {
        const latest = items.find((qq) => qq.id === questionId);
        if (latest) {
          const idx = this.questions.findIndex((qq) => qq.id === questionId);
          if (idx >= 0) this.questions[idx] = latest;
        }
        try { console.log('[Questionário] Refresh concluído para questionId:', questionId); } catch {}
        cb?.();
      },
      error: () => cb?.()
    });
  }

  isSubmitted(q: ApiQuestion | undefined): boolean {
    if (!q) return false;
    return !!this.submittedByQuestion[q.id];
  }

  private startAutoAdvance() {
    this.stopAutoAdvance();
    this.autoProgress = 0;
    const stepMs = 100; // 100ms por tick
    const steps = Math.max(1, Math.floor(this.autoAdvanceMs / stepMs));
    let tick = 0;
    this.autoTimer = setInterval(() => {
      tick++;
      this.autoProgress = Math.min(100, Math.round((tick / steps) * 100));
      if (tick >= steps) {
        this.advanceFromResults();
      }
    }, stepMs);
  }

  private stopAutoAdvance() {
    if (this.autoTimer) { clearInterval(this.autoTimer); this.autoTimer = undefined; }
  }

  advanceFromResults(): void {
    this.stopAutoAdvance();
    this.showingResults = false;
    // Avança para próxima pergunta ou envia
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.prepareCurrentQuestion();
    } else {
      // Ao terminar os resultados da última pergunta, ir para a tela de sucesso
      try { this.router.navigateByUrl('/end-quest-success'); } catch { this.done = true; }
    }
  }

  // Mantido para compatibilidade (não usado no template para evitar recriação)
  getChartSeries(): ApexAxisChartSeries { return this.chartSeries; }
  getChartXAxis(): ApexXAxis { return this.chartXAxis; }
  getChartYAxis(): ApexYAxis { return this.chartYAxis; }

  toggleCheckbox(option: string): void {
    const q = this.currentQuestion();
    if (!q) return;
    // Bloqueia interação se já respondida
    if (this.isSubmitted(q)) return;
    const arr = (this.answers[q.id] as string[]) || [];
    const idx = arr.indexOf(option);

    // Limite máximo permitido (0 ou ausente = sem limite)
    const max = this.getMaxSelected(q);

    if (idx >= 0) {
      // Já está selecionado -> desmarcar
      arr.splice(idx, 1);
    } else {
      // Não selecionado -> checar limite antes de adicionar
      if (max > 0 && arr.length >= max) {
        // Respeitar limite: não adiciona nova opção
        this.answers[q.id] = [...arr];
        return;
      }
      arr.push(option);
    }
    this.answers[q.id] = [...arr];
  }

  setRadio(option: string): void {
    const q = this.currentQuestion();
    if (!q) return;
    if (this.isSubmitted(q)) return;
    this.answers[q.id] = option;
  }

  setRating(value: number): void {
    const q = this.currentQuestion();
    if (!q) return;
    if (this.isSubmitted(q)) return;
    this.answers[q.id] = value;
  }

  // Helpers para template (evitar casts em HTML)
  hasCheckbox(option: string): boolean {
    const q = this.currentQuestion();
    if (!q) return false;
    const val = this.answers[q.id];
    return Array.isArray(val) && (val as string[]).includes(option);
  }

  // Máximo de opções selecionáveis vindo de config
  getMaxSelected(q: ApiQuestion | undefined): number {
    const cfg: any = (q as any)?.config || {};
    const raw = (cfg.max_selected_options !== undefined) ? cfg.max_selected_options : cfg.maxSelected;
    let n = 0;
    if (typeof raw === 'number') n = Math.max(0, Math.floor(raw));
    else if (typeof raw === 'string' && raw.trim().length) {
      const parsed = Number(raw);
      n = isNaN(parsed) ? 0 : Math.max(0, Math.floor(parsed));
    }
    return n;
  }

  // Desabilita checkbox quando atingiu o limite e a opção não está marcada
  isCheckboxDisabled(option: string): boolean {
    const q = this.currentQuestion();
    if (!q) return false;
    const max = this.getMaxSelected(q);
    if (max <= 0) return false;
    const arr = (this.answers[q.id] as string[]) || [];
    const alreadySelected = arr.includes(option);
    return !alreadySelected && arr.length >= max;
  }

  isStarActive(star: number): boolean {
    const q = this.currentQuestion();
    if (!q) return false;
    const val = this.answers[q.id];
    return typeof val === 'number' && (val as number) >= star;
  }

  toStringAnswer(id: number): string {
    const v = this.answers[id];
    if (Array.isArray(v)) return (v as string[]).join(', ');
    return v !== undefined && v !== null ? String(v) : '';
  }

  starLabel(star: number): string {
    switch (star) {
      case 1: return 'Muito ruim';
      case 2: return 'Ruim';
      case 3: return 'Bom';
      case 4: return 'Muito bom';
      case 5: return 'Excelente';
      default: return `${star} estrela(s)`;
    }
  }

  submitAll(): void {
    this.submitting = true;

    // Se já detectamos que existe questionário do usuário, não tente envio
    if (this.eventAlreadyStarted) {
      this.submitting = false;
      try { console.log('[Questionário] questionário existente \u2192 pulando envio em lote'); } catch {}
      try { this.router.navigateByUrl('/end-quest-success'); } catch { this.done = true; }
      return;
    }

    const answers: AnswerItemPayload[] = this.questions
      .map((q) => {
        const raw = this.answers[q.id];
        const type = this.getType(q);

        // Ignora se não há resposta (permitido para não obrigatórias)
        if (raw === undefined || raw === null) return null;
        if (Array.isArray(raw) && raw.length === 0) return null;
        if (typeof raw === 'string' && raw.trim().length === 0) return null;

        // Mapeia conforme contrato da API
        if (type === 'checkbox') {
          return { question_id: q.id, answer_json: Array.isArray(raw) ? [...raw] : [] } as AnswerItemPayload;
        }
        if (type === 'rating') {
          if (typeof raw === 'number') return { question_id: q.id, answer_json: { value: raw } } as AnswerItemPayload;
          const num = Number(raw);
          return { question_id: q.id, answer_json: { value: isNaN(num) ? 0 : num } } as AnswerItemPayload;
        }
        // text / textarea / radio / music_preference -> answer_text
        return { question_id: q.id, answer_text: String(raw) } as AnswerItemPayload;
      })
      .filter((item): item is AnswerItemPayload => !!item);

    // Se não houver nenhuma resposta válida, apenas finaliza.
    if (answers.length === 0) {
      this.submitting = false;
      this.done = true;
      return;
    }

    const guestCode = this.authService.isAuthenticated() ? undefined : this.guestCode;

    try { console.log('[Questionário] PATCH respostas (bulk) \u2192 total:', answers.length); } catch {}
    this.eventService.patchEventResponses(this.idCode, { guest_code: guestCode, answers }).subscribe({
      next: () => {
        this.submitting = false;
        try { console.log('[Questionário] OK envio bulk (PATCH)'); } catch {}
        // Redireciona para página de sucesso dedicada
        try { this.router.navigateByUrl('/end-quest-success'); } catch { this.done = true; }
      },
      error: (err) => {
        this.submitting = false;
        const msg = err?.error?.message || err?.message || 'Falha ao enviar respostas';
        if (err?.status === 409) {
          // Duplicate entry: usuário já respondeu o evento
          try { console.log('[Questionário] 409 Duplicate entry (bulk) \u2192 Já existe um questionário iniciado:', msg, err?.error); } catch {}
          // Não bloquear: finalizar fluxo visual sem erro
          this.done = true;
          return;
        }
        try { console.log('[Questionário] ERRO envio bulk:', msg); } catch {}
        this.loadError = msg;
      }
    });
  }

  // -----------------
  // Checagem única: carregar respostas existentes do usuário por pergunta
  // -----------------
  private preloadExistingAnswersForUser(): void {
    // Se não autenticado, não há checagem de respostas existentes
    if (!this.authService.isAuthenticated()) {
      this.existingCheckDone = true;
      this.prepareCurrentQuestion();
      return;
    }
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.existingCheckDone = true;
      this.prepareCurrentQuestion();
      return;
    }
    try { console.log('[Questionário] Checando respostas existentes (uma vez) \u2192 usuário.id:', (user as any)?.id, 'total perguntas:', this.questions.length); } catch {}
    const requests = this.questions.map((q) => this.eventService.getEventResponses(this.idCode, { question_id: q.id }).pipe(catchError(() => of({ items: [] } as any))));
    forkJoin(requests).subscribe({
      next: (all) => {
        const byQ: Record<number, ApiResponseItem | null> = {};
        all.forEach((resp: any, idx: number) => {
          const q = this.questions[idx];
          const items: ApiResponseItem[] = resp?.items || resp || [];
          const mine = items.find((r) => r?.user && (r.user.id === (user as any).id));
          byQ[q.id] = mine || null;
        });
        this.existingAnswersByQuestion = byQ;
        this.existingCheckDone = true;
        // Sinaliza que já existe algum questionário iniciado (caso tenha qualquer resposta)
        this.eventAlreadyStarted = Object.values(byQ).some((r) => !!r);
        try { console.log('[Questionário] Respostas existentes mapeadas \u2192', this.existingAnswersByQuestion); } catch {}
        this.prepareCurrentQuestion();
      },
      error: (err) => {
        try { console.log('[Questionário] ERRO checando respostas existentes:', err?.message || err); } catch {}
        this.existingCheckDone = true;
        this.prepareCurrentQuestion();
      }
    });
  }

  // -----------------
  // Prefill de respostas e marcação de somente leitura por pergunta
  // -----------------
  private prepareCurrentQuestion(): void {
    const q = this.currentQuestion();
    if (!q) return;
    // Se já realizamos a checagem única, usar respostas existentes para prefill
    const existing = this.existingAnswersByQuestion[q.id] || null;
    if (existing) {
      const type = this.getType(q);
      const localVal = this.mapApiResponseToLocalValue(existing, type);
      if (localVal !== null && localVal !== undefined) {
        this.answers[q.id] = localVal as any;
      }
      this.readonlyByQuestion[q.id] = true;
      this.submittedByQuestion[q.id] = true;
      try { console.log('[Questionário] Prefill encontrado \u2192 q.id:', q.id, 'somente leitura=true'); } catch {}
    } else {
      // Fallback: usar preseleções vindas do backend (ex.: selected_labels/prefill_labels)
      const cfg: any = (q as any).config || {};
      const type = this.getType(q);
      // Rating: ler valor preferencial de config ou top-level
      if (type === 'rating') {
        const rawRating = (typeof cfg.prefill_rating_value === 'number' ? cfg.prefill_rating_value : Number((q as any).selected_value));
        if (!isNaN(rawRating) && rawRating > 0) {
          this.answers[q.id] = Math.floor(rawRating);
          this.readonlyByQuestion[q.id] = true;
          this.submittedByQuestion[q.id] = true;
          try { console.log('[Questionário] Prefill rating \u2192 q.id:', q.id, 'value:', rawRating); } catch {}
          this.checkingCurrent = false;
          return;
        }
      }
      const prefill: string[] = Array.isArray(cfg.prefill_labels) ? cfg.prefill_labels : (Array.isArray((q as any).selected_labels) ? (q as any).selected_labels : []);
      if (Array.isArray(prefill) && prefill.length > 0) {
        const opts = this.asOptions(q).map((o) => String(o).trim());
        if (type === 'checkbox') {
          const normalized = prefill.map((x) => {
            const sx = String(x).trim();
            const match = opts.find((o) => o.toLowerCase() === sx.toLowerCase());
            return match ?? sx;
          });
          this.answers[q.id] = normalized;
        } else if (type === 'radio' || type === 'music_preference' || type === 'text' || type === 'textarea') {
          const sx = String(prefill[0]).trim();
          const match = opts.find((o) => o.toLowerCase() === sx.toLowerCase());
          this.answers[q.id] = match ?? sx;
        }
        // Bloqueia edição se veio preseleção
        this.readonlyByQuestion[q.id] = true;
        this.submittedByQuestion[q.id] = true;
        try { console.log('[Questionário] Prefill via selected_labels \u2192 q.id:', q.id, 'labels:', prefill); } catch {}
      } else {
        this.readonlyByQuestion[q.id] = false;
        // Não marcar como enviado; permitirá envio da resposta da pergunta atual
        try { console.log('[Questionário] Sem resposta existente para q.id:', q.id, '\u2192 edição liberada'); } catch {}
      }
    }
    this.checkingCurrent = false;
  }

  private mapApiResponseToLocalValue(r: ApiResponseItem, type: QuestionType): string | string[] | number | null {
    if (type === 'checkbox') {
      const arr = Array.isArray(r.answer_json) ? r.answer_json : (Array.isArray(r.answer_text) ? r.answer_text : []);
      return Array.isArray(arr) ? arr.map((x) => String(x)) : [];
    }
    if (type === 'rating') {
      const value = (r.answer_json && typeof r.answer_json.value === 'number') ? r.answer_json.value : Number(r.answer_text);
      return isNaN(value) ? null : Math.max(0, Math.floor(value));
    }
    // text / textarea / radio / music_preference -> usar texto
    return (r.answer_text !== undefined && r.answer_text !== null) ? String(r.answer_text) : null;
  }

  private uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}