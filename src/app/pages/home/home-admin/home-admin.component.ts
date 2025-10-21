import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-home-admin',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './home-admin.component.html',
  styles: ``
})
export class HomeAdminComponent {

}

