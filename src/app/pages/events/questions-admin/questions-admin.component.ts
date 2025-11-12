import { Component, OnInit, ApplicationRef, Injector, EnvironmentInjector, createComponent } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EventService, EventListItem } from '../event.service';
import { NotificationComponent } from '../../../shared/components/ui/notification/notification/notification.component';
import { forkJoin } from 'rxjs';

type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating';

@Component({
  selector: 'app-questions-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './questions-admin.component.html',
  styleUrl: './questions-admin.component.css'
})
export class QuestionsAdminComponent implements OnInit {
  questionTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'textarea', label: 'Texto longo' },
    { value: 'radio', label: 'Múltipla escolha (uma opção)' },
    { value: 'checkbox', label: 'Múltipla escolha (várias opções)' },
    { value: 'rating', label: 'Avaliação' }
  ];

  // Eventos vindos da API, já respeitando regras de acesso (master vê todos; demais, apenas os próprios)
  events: EventListItem[] = [];
  isLoadingEvents: boolean = false;

  newQuestion = {
    text: '',
    type: 'text' as QuestionType,
    optionsText: '',
    options: [] as string[],
    is_required: false,
    show_results: true,
    is_public: false,
    order_index: 1,
    // Vincular por id_code para operações futuras
    event_id_code: '' as string,
    config: {} as { correctIndex?: number; maxSelected?: number }
  };

  savedMessage = '';
  isLoadingQuestions: boolean = false;
  hasLoadedQuestions: boolean = false;
  // Drag & Drop
  dragIndex: number | null = null;
  isSavingOrder: boolean = false;

  constructor(
    private eventService: EventService,
    private appRef: ApplicationRef,
    private injector: Injector,
    private envInjector: EnvironmentInjector
  ) {}

  ngOnInit(): void {
    this.loadEventsForSelect();
  }

  private loadEventsForSelect(): void {
    this.isLoadingEvents = true;
    this.eventService.getEvents().subscribe({
      next: (items) => {
        this.events = items;
        // Não selecionar automaticamente: usuário escolherá no select
        this.isLoadingEvents = false;
      },
      error: () => {
        // Mantém lista vazia em caso de falha
        this.events = [];
        this.isLoadingEvents = false;
      }
    });
  }

  questions: Array<{
    id: number;
    event_id_code: string;
    text: string;
    type: QuestionType;
    options?: string[];
    is_required?: boolean;
    show_results?: boolean;
    is_public?: boolean;
    order_index?: number;
    config?: { correct_option_index?: number } | any;
  }> = [];

  isMultipleChoice(): boolean {
    return ['radio', 'checkbox'].includes(this.newQuestion.type);
  }

  addOption(): void {
    this.newQuestion.options.push('');
  }

  removeOption(index: number): void {
    this.newQuestion.options.splice(index, 1);
  }

  // Mantém DOM estável ao editar strings de opções
  trackOptionByIndex(index: number, _opt: string): number {
    return index;
  }

  // Sem noção de opção correta no backend; mantemos apenas textos das opções.

  saveQuestion() {
    if (!this.newQuestion.event_id_code) { this.savedMessage = 'Selecione um evento antes de salvar.'; return; }
    const text = (this.newQuestion.text || '').trim();
    const type = this.newQuestion.type;
    if (!text) { this.savedMessage = 'Texto da pergunta é obrigatório.'; return; }
    if (!type) { this.savedMessage = 'Tipo da pergunta é obrigatório.'; return; }

    let options: string[] | undefined;
    if (this.isMultipleChoice()) {
      options = this.newQuestion.options.map(o => (o || '').trim()).filter(o => !!o);
      if (!options.length) { this.savedMessage = 'Informe ao menos uma opção.'; return; }
    }

    const correctIndex = (this.newQuestion.type === 'radio')
      ? (typeof (this.newQuestion as any).config?.correctIndex === 'number' ? (this.newQuestion as any).config.correctIndex : undefined)
      : undefined;
    const maxSelected = (this.newQuestion.type === 'checkbox')
      ? (typeof (this.newQuestion as any).config?.maxSelected === 'number' ? Math.max(0, Math.floor((this.newQuestion as any).config.maxSelected)) : undefined)
      : undefined;

    // Se for rádio e houver correta, embute marcador na opção conforme documentação
    if (this.newQuestion.type === 'radio' && correctIndex !== undefined && options) {
      options = options.map((o, i) => i === correctIndex ? `${o} [c]` : o);
    }

    const payload: any = {
      text,
      type,
      options,
      is_required: this.newQuestion.is_required,
      // Permitir exibição de resultados para radio e checkbox
      show_results: (this.newQuestion.type === 'radio' || this.newQuestion.type === 'checkbox') ? this.newQuestion.show_results : false,
      is_public: !!this.newQuestion.is_public,
      // Inserir no fim da lista; drag & drop cuidará de reordenação
      order_index: (this.questions.length + 1),
    };

    if (this.newQuestion.type === 'radio' && correctIndex !== undefined) {
      // Persistir no campo top-level da tabela
      payload.correct_option_index = correctIndex;
      // Manter compat: também em config, se o backend aceitar
      payload.config = { ...(payload.config || {}), correct_option_index: correctIndex };
    }
    if (this.newQuestion.type === 'checkbox' && maxSelected !== undefined) {
      // Persistir no campo top-level da tabela
      (payload as any).max_choices = maxSelected;
      // Manter compat: também em config, se o backend aceitar
      payload.config = { ...(payload.config || {}), max_selected_options: maxSelected };
    }

    this.eventService.createEventQuestion(this.newQuestion.event_id_code, payload).subscribe({
      next: (created) => {
        const q = {
          id: created.id,
          event_id_code: this.newQuestion.event_id_code,
          text: created.text || '',
          type: (created.type as QuestionType) || type,
          options: created.options || options,
          is_required: created.is_required ?? this.newQuestion.is_required,
          show_results: created.show_results ?? ((this.newQuestion.type === 'radio' || this.newQuestion.type === 'checkbox') ? this.newQuestion.show_results : false),
          is_public: (typeof created.is_public === 'boolean') ? created.is_public : Number(created.is_public) === 1,
          order_index: created.order_index ?? this.newQuestion.order_index,
          config: (created as any).config ?? (payload.config ?? {})
        };
        this.questions.push(q);
        this.savedMessage = 'Pergunta salva com sucesso!';
        this.triggerToast('success', 'Pergunta salva', 'Cadastro realizado com sucesso.');

        // Reset básico (mantendo evento selecionado e ordem)
        this.newQuestion.text = '';
        this.newQuestion.type = 'text';
        this.newQuestion.optionsText = '';
        this.newQuestion.options = [];
        this.newQuestion.is_required = true;
        this.newQuestion.show_results = true;
        this.newQuestion.is_public = false;
        this.newQuestion.order_index = (this.questions.length + 1);

        setTimeout(() => (this.savedMessage = ''), 3000);
      },
      error: (err) => {
        const msg = (err?.error?.message || err?.message || 'Falha ao salvar pergunta.');
        this.savedMessage = msg;
        this.triggerToast('error', 'Erro ao salvar', msg);
        setTimeout(() => (this.savedMessage = ''), 4000);
      }
    });
  }

  getEventNameByCode(eventCode: string | undefined | null): string {
    if (!eventCode) return '';
    const ev = this.events.find(e => e.id_code === eventCode);
    return ev ? (ev.eventName || '') : '';
  }

  ngOnChanges(): void {
    // Caso necessário, poderíamos reagir a mudanças, mas usaremos watcher manual.
  }

  // Carrega perguntas do evento selecionado
  loadQuestionsForSelectedEvent(): void {
    const idCode = this.newQuestion.event_id_code;
    if (!idCode) { this.questions = []; this.hasLoadedQuestions = false; return; }
    this.isLoadingQuestions = true;
    this.eventService.getEventQuestions(idCode).subscribe({
      next: (items) => {
        // Normaliza para nosso formato de exibição
        this.questions = items.map(q => ({
          id: q.id,
          event_id_code: idCode,
          text: q.text || '',
          type: (q.type as QuestionType) || 'text',
          options: q.options || [],
          is_required: q.is_required ?? true,
          show_results: q.show_results ?? true,
          is_public: (typeof q.is_public === 'boolean') ? q.is_public : Number(q.is_public) === 1,
          order_index: q.order_index ?? 0,
          config: {}
        }));
        // Ordena visualmente por order_index
        this.questions.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        this.isLoadingQuestions = false;
        this.hasLoadedQuestions = true;
      },
      error: () => {
        this.questions = [];
        this.isLoadingQuestions = false;
        this.hasLoadedQuestions = true;
      }
    });
  }

  // Drag helpers
  trackQuestionById(index: number, q: { id: number }): number { return q.id; }
  onDragStart(index: number) { this.dragIndex = index; }
  onDragOver(index: number, event: DragEvent) { event.preventDefault(); }
  onDrop(index: number) {
    if (this.dragIndex == null || index === this.dragIndex) { this.dragIndex = null; return; }
    const [moved] = this.questions.splice(this.dragIndex, 1);
    this.questions.splice(index, 0, moved);
    this.dragIndex = null;
    this.persistOrderIndices();
  }

  private persistOrderIndices(): void {
    const idCode = this.newQuestion.event_id_code;
    if (!idCode) return;
    const updates = [] as any[];
    this.isSavingOrder = true;
    this.questions.forEach((q, idx) => {
      const newIndex = idx + 1;
      if ((q.order_index ?? 0) !== newIndex) {
        q.order_index = newIndex;
        updates.push(this.eventService.updateEventQuestion(idCode, q.id, { order_index: newIndex }));
      }
    });
    if (updates.length === 0) { this.isSavingOrder = false; return; }
    forkJoin(updates).subscribe({
      next: () => {
        this.isSavingOrder = false;
        this.savedMessage = 'Ordem atualizada com sucesso!';
        this.triggerToast('success', 'Ordem atualizada', 'A nova ordem foi salva.');
        setTimeout(() => (this.savedMessage = ''), 3000);
      },
      error: (err) => {
        this.isSavingOrder = false;
        const msg = (err?.error?.message || err?.message || 'Falha ao atualizar ordem');
        this.savedMessage = msg;
        this.triggerToast('error', 'Erro ao atualizar ordem', msg);
        setTimeout(() => (this.savedMessage = ''), 4000);
      }
    });
  }

  // Alterna visibilidade pública da pergunta (soft delete/habilitar)
  toggleQuestionVisibility(q: { id: number; is_public?: boolean }): void {
    const idCode = this.newQuestion.event_id_code;
    if (!idCode) return;
    const nextVal = !(q.is_public ?? false);
    this.eventService.updateEventQuestion(idCode, q.id, { is_public: nextVal }).subscribe({
      next: (updated) => {
        const isPub = (typeof updated.is_public === 'boolean') ? updated.is_public : Number(updated.is_public) === 1;
        q.is_public = isPub;
        if (isPub) {
          this.triggerToast('success', 'Visibilidade: Pública', 'A pergunta agora é pública.');
        } else {
          this.triggerToast('info', 'Visibilidade: Privada', 'A pergunta agora é privada.');
        }
      },
      error: (err) => {
        const msg = (err?.error?.message || err?.message || 'Falha ao atualizar visibilidade da pergunta');
        this.triggerToast('error', 'Erro ao atualizar visibilidade', msg);
      }
    });
  }

  // Alterna permissão (ativo/inativo) da pergunta
  toggleQuestionActive(q: { id: number; show_results?: boolean }): void {
    const idCode = this.newQuestion.event_id_code;
    if (!idCode) return;
    const nextVal = !(q.show_results ?? false);
    this.eventService.updateEventQuestion(idCode, q.id, { show_results: nextVal }).subscribe({
      next: (updated) => {
        const isActive = (typeof updated.show_results === 'boolean') ? updated.show_results : Number(updated.show_results) === 1;
        q.show_results = isActive;
        if (isActive) {
          this.triggerToast('success', 'Permissão: Ativa', 'A pergunta foi ativada.');
        } else {
          this.triggerToast('warning', 'Permissão: Inativa', 'A pergunta foi desativada.');
        }
      },
      error: (err) => {
        const msg = (err?.error?.message || err?.message || 'Falha ao atualizar permissão da pergunta');
        this.triggerToast('error', 'Erro ao atualizar permissão', msg);
      }
    });
  }

  private triggerToast(
    variant: 'success' | 'info' | 'warning' | 'error',
    title: string,
    description?: string
  ) {
    const compRef = createComponent(NotificationComponent, {
      environmentInjector: this.envInjector,
      elementInjector: this.injector,
    });
    compRef.setInput('variant', variant);
    compRef.setInput('title', title);
    compRef.setInput('description', description);
    compRef.setInput('hideDuration', 3000);

    this.appRef.attachView(compRef.hostView);
    const host = compRef.location.nativeElement as HTMLElement;
    host.style.position = 'fixed';
    host.style.top = '16px';
    host.style.right = '16px';
    host.style.zIndex = '2147483647';
    host.style.pointerEvents = 'auto';
    document.body.appendChild(host);

    setTimeout(() => {
      this.appRef.detachView(compRef.hostView);
      compRef.destroy();
    }, 3200);
  }
}