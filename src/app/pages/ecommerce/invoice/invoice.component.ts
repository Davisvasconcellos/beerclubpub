import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { InvoiceMetricsComponent } from '../../../shared/components/invoice/invoice-metrics/invoice-metrics.component';
import { InvoiceListComponent } from '../../../shared/components/invoice/invoice-list/invoice-list.component';

@Component({
  selector: 'app-invoice',
  imports: [
    PageBreadcrumbComponent,
    InvoiceMetricsComponent,
    InvoiceListComponent
  ],
  templateUrl: './invoice.component.html',
  styles: ``
})
export class InvoiceComponent {

}
