import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-check-user-status',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './check-user-status.component.html',
  styleUrl: './check-user-status.component.css'
})
export class CheckUserStatusComponent implements OnInit {
  user: { name: string; email: string; plan: 'Bronze' | 'Silver' | 'Gold'; avatar: string } = {
    name: 'Bagus Yuliono',
    email: 'bagusy@mail.com',
    plan: 'Bronze',
    avatar: '/images/user/owner.jpg',
  };
  selectedPlan: 'Bronze' | 'Silver' | 'Gold' = 'Gold';
  checkedIn: boolean = false;
  plans: ('Bronze' | 'Silver' | 'Gold')[] = ['Bronze', 'Silver', 'Gold'];

  ngOnInit(): void {
    this.user.plan = this.selectedPlan; // Inicializa o plano do usuário com o plano selecionado
  }

  selectPlan(plan: 'Bronze' | 'Silver' | 'Gold') {
    this.selectedPlan = plan;
    this.user.plan = plan; // Atualiza o plano do usuário ao selecionar um novo plano
    this.checkedIn = false; // Resetar o status de check-in ao mudar de plano
  }

  doCheckin() {
    this.checkedIn = true;
  }

  getPlanGradientStyle(plan: 'Bronze' | 'Silver' | 'Gold'): string {
    switch (plan) {
      case 'Bronze':
        return 'radial-gradient(ellipse farthest-corner at right bottom, #CD7F32 0%, #B87333 8%, #A57164 30%, #8B4513 40%, transparent 80%), radial-gradient(ellipse farthest-corner at left top, #F0D8C0 0%, #E0C8A0 8%, #C0A080 25%, #806040 62.5%, #806040 100%)';
      case 'Silver':
        return 'radial-gradient(ellipse farthest-corner at right bottom, #C0C0C0 0%, #B0B0B0 8%, #A0A0A0 30%, #909090 40%, transparent 80%), radial-gradient(ellipse farthest-corner at left top, #E0E0E0 0%, #D0D0D0 8%, #C0C0C0 25%, #A0A0A0 62.5%, #A0A0A0 100%)';
      case 'Gold':
        return 'radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 0%, #FDB931 8%, #9f7928 30%, #8A6E2F 40%, transparent 80%), radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%, #5d4a1f 62.5%, #5d4a1f 100%)';
      default:
        return '';
    }
  }

  getPlanBorderClass(plan: 'Bronze' | 'Silver' | 'Gold'): string {
    switch (plan) {
      case 'Bronze':
        return 'border-amber-500';
      case 'Silver':
        return 'border-gray-500';
      case 'Gold':
        return 'border-yellow-500';
      default:
        return '';
    }
  }

  getBorderClass(status: 'valid' | 'delinquent' | 'blocked'): string {
    switch (status) {
      case 'valid':
        return 'border-green-500';
      case 'delinquent':
        return 'border-yellow-500';
      case 'blocked':
        return 'border-red-500';
      default:
        return '';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }
}
