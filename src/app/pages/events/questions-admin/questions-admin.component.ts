import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EventService, EventListItem } from '../event.service';

type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating' | 'music_preference';

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
    { value: 'rating', label: 'Avaliação' },
    { value: 'music_preference', label: 'Preferência musical' }
  ];

  // Eventos vindos da API, já respeitando regras de acesso (master vê todos; demais, apenas os próprios)
  events: EventListItem[] = [];

  newQuestion = {
    text: '',
    type: 'text' as QuestionType,
    optionsText: '',
    options: [] as string[],
    is_required: false,
    show_results: true,
    order_index: 1,
    // Vincular por id_code para operações futuras
    event_id_code: '' as string,
    config: {}
  };

  savedMessage = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEventsForSelect();
  }

  private loadEventsForSelect(): void {
    this.eventService.getEvents().subscribe({
      next: (items) => {
        this.events = items;
        // Define seleção inicial se não houver
        if (!this.newQuestion.event_id_code && this.events.length > 0) {
          this.newQuestion.event_id_code = this.events[0]?.id_code || '';
          this.loadQuestionsForSelectedEvent();
        }
      },
      error: () => {
        // Mantém lista vazia em caso de falha
        this.events = [];
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
    order_index?: number;
    config?: any;
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
    const text = (this.newQuestion.text || '').trim();
    const type = this.newQuestion.type;
    if (!text) { this.savedMessage = 'Texto da pergunta é obrigatório.'; return; }
    if (!type) { this.savedMessage = 'Tipo da pergunta é obrigatório.'; return; }

    let options: string[] | undefined;
    if (this.isMultipleChoice()) {
      options = this.newQuestion.options.map(o => (o || '').trim()).filter(o => !!o);
      if (!options.length) { this.savedMessage = 'Informe ao menos uma opção.'; return; }
    }

    const payload = {
      text,
      type,
      options,
      is_required: this.newQuestion.is_required,
      show_results: this.newQuestion.show_results,
      order_index: this.newQuestion.order_index,
    };

    this.eventService.createEventQuestion(this.newQuestion.event_id_code, payload).subscribe({
      next: (created) => {
        const q = {
          id: created.id,
          event_id_code: this.newQuestion.event_id_code,
          text: created.text || '',
          type: (created.type as QuestionType) || type,
          options: created.options || options,
          is_required: created.is_required ?? this.newQuestion.is_required,
          show_results: created.show_results ?? this.newQuestion.show_results,
          order_index: created.order_index ?? this.newQuestion.order_index,
          config: {}
        };
        this.questions.push(q);
        this.savedMessage = 'Pergunta salva com sucesso!';

        // Reset básico (mantendo evento selecionado e ordem)
        this.newQuestion.text = '';
        this.newQuestion.type = 'text';
        this.newQuestion.optionsText = '';
        this.newQuestion.options = [];
        this.newQuestion.is_required = true;
        this.newQuestion.show_results = true;
        this.newQuestion.order_index = (this.questions.length + 1);

        setTimeout(() => (this.savedMessage = ''), 3000);
      },
      error: (err) => {
        this.savedMessage = (err?.message as string) || 'Falha ao salvar pergunta.';
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
    if (!idCode) { this.questions = []; return; }
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
          order_index: q.order_index ?? 0,
          config: {}
        }));
      },
      error: () => {
        this.questions = [];
      }
    });
  }
}