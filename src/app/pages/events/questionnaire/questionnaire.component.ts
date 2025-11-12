import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService, ApiQuestion, AnswerItemPayload } from '../event.service';
import { TextAreaComponent } from '../../../shared/components/form/input/text-area.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { RadioComponent } from '../../../shared/components/form/input/radio.component';
import { CheckboxComponent } from '../../../shared/components/form/input/checkbox.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

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

  // Respostas coletadas por id de pergunta
  answers: Record<number, string | string[] | number> = {};

  constructor(private route: ActivatedRoute, private eventService: EventService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id_code');
      if (id) {
        this.idCode = id;
        this.loadQuestions(id);
      }
    });
  }

  private loadQuestions(idCode: string) {
    this.eventService.getEventQuestions(idCode).subscribe({
      next: (apiQuestions) => {
        this.questions = apiQuestions
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        this.currentIndex = 0;
        this.loadError = '';
      },
      error: (err) => {
        this.loadError = err?.error?.message || err?.message || 'Falha ao carregar perguntas';
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
    if (!this.isRequired(q)) return true;
    const val = this.answers[q.id];
    if (this.getType(q) === 'checkbox') return Array.isArray(val) && (val as string[]).length > 0;
    return val !== undefined && val !== null && (Array.isArray(val) ? (val as string[]).length > 0 : String(val).trim().length > 0);
  }

  next(): void {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    } else {
      this.submitAll();
    }
  }

  back(): void { if (this.currentIndex > 0) this.currentIndex--; }

  skip(): void {
    const q = this.currentQuestion();
    if (!q) return;
    if (!this.isRequired(q)) this.next();
  }

  toggleCheckbox(option: string): void {
    const q = this.currentQuestion();
    if (!q) return;
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
    this.answers[q.id] = option;
  }

  setRating(value: number): void {
    const q = this.currentQuestion();
    if (!q) return;
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
  private getMaxSelected(q: ApiQuestion | undefined): number {
    const raw = q?.config?.max_selected_options;
    const n = typeof raw === 'number' ? Math.max(0, Math.floor(raw)) : 0;
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

    // Gera guest_code para fluxo público (será ignorado se houver JWT)
    const guestCode = this.uuidv4();

    this.eventService.submitEventResponses(this.idCode, { guest_code: guestCode, answers }).subscribe({
      next: () => {
        this.submitting = false;
        this.done = true;
      },
      error: (err) => {
        this.submitting = false;
        if (err?.status === 409) {
          this.loadError = 'Você já respondeu este evento.';
        } else {
          this.loadError = err?.error?.message || err?.message || 'Falha ao enviar respostas';
        }
      }
    });
  }

  private uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}