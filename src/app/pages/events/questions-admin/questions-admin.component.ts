import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

type QuestionType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'rating' | 'poll';

@Component({
  selector: 'app-questions-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './questions-admin.component.html',
  styleUrl: './questions-admin.component.css'
})
export class QuestionsAdminComponent {
  questionTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'textarea', label: 'Texto longo' },
    { value: 'radio', label: 'Múltipla escolha (uma opção)' },
    { value: 'checkbox', label: 'Múltipla escolha (várias opções)' },
    { value: 'rating', label: 'Avaliação' },
    { value: 'poll', label: 'Enquete' }
  ];

  events = [
    { id: 1, name: 'Festival de Música Vibehood' },
    { id: 2, name: 'Conferência de Tecnologia' },
    { id: 3, name: 'Feira Gastronômica' },
  ];

  newQuestion = {
    text: '',
    type: 'text' as QuestionType,
    optionsText: '',
    options: [] as Array<{ text: string; correct: boolean }>,
    is_required: false,
    show_results: true,
    order_index: 1,
    event_id: 1,
    config: {
      allow_multiple_answers: false,
      visible_to_guests: true,
    }
  };

  savedMessage = '';

  questions: Array<{
    id: number;
    event_id: number;
    text: string;
    type: QuestionType;
    options?: Array<{ text: string; correct: boolean }>;
    is_required?: boolean;
    show_results?: boolean;
    order_index?: number;
    config?: any;
  }> = [];

  isMultipleChoice(): boolean {
    return ['radio', 'checkbox', 'poll'].includes(this.newQuestion.type);
  }

  addOption(): void {
    this.newQuestion.options.push({ text: '', correct: false });
  }

  removeOption(index: number): void {
    this.newQuestion.options.splice(index, 1);
  }

  toggleCorrect(index: number): void {
    if (this.newQuestion.type === 'poll') return; // Enquete não usa "correta"
    if (this.newQuestion.type === 'radio') {
      this.newQuestion.options = this.newQuestion.options.map((opt, i) => ({
        ...opt,
        correct: i === index ? !opt.correct : false,
      }));
    } else {
      this.newQuestion.options[index].correct = !this.newQuestion.options[index].correct;
    }
  }

  saveQuestion() {
    const nextId = (this.questions.at(-1)?.id ?? 0) + 1;

    const options = this.isMultipleChoice()
      ? this.newQuestion.options.filter(o => o.text.trim())
      : undefined;

    const q = {
      id: nextId,
      event_id: this.newQuestion.event_id,
      text: this.newQuestion.text,
      type: this.newQuestion.type,
      options,
      is_required: this.newQuestion.is_required,
      show_results: this.newQuestion.show_results,
      order_index: this.newQuestion.order_index,
      config: this.newQuestion.config
    };

    this.questions.push(q);
    this.savedMessage = 'Pergunta salva com sucesso!';

    // Reset básico (mantendo evento selecionado e ordem)
    this.newQuestion.text = '';
    this.newQuestion.type = 'text';
    this.newQuestion.optionsText = '';
    this.newQuestion.options = [];
    this.newQuestion.is_required = false;
    this.newQuestion.show_results = true;
    this.newQuestion.order_index = (this.questions.length + 1);

    setTimeout(() => (this.savedMessage = ''), 3000);
  }

  getEventNameById(eventId: number | undefined | null): string {
    if (eventId == null) return '';
    const ev = this.events.find(e => e.id === eventId);
    return ev ? ev.name : '';
  }
}