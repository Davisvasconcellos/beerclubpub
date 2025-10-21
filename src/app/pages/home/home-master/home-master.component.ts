import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-home-master',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './home-master.component.html',
  styles: ``
})
export class HomeMasterComponent {

}

