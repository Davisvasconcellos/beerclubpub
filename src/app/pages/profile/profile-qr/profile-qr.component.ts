import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserInfoCardComponent } from '../../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../../shared/components/user-profile/user-address-card/user-address-card.component';

@Component({
  selector: 'app-profile-qr',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserInfoCardComponent,
    UserAddressCardComponent,
  ],
  templateUrl: './profile-qr.component.html',
  styles: ``
})
export class ProfileQrComponent {
  user = {
    name: 'Bagus Yuliono',
    email: 'bagusy@mail.com',
    handleUrl: 'wall.et/bagusy',
    avatar: '/images/user/owner.jpg',
    plan: 'Gold' as 'Bronze' | 'Silver' | 'Gold',
    favoriteTeam: 'VASCO'
  };

  get qrData() {
    return `user:${this.user.email}`;
  }

  get qrUrl() {
    const encoded = encodeURIComponent(this.qrData);
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encoded}`;
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
}