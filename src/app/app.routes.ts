import { Routes } from '@angular/router';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { AnalyticsComponent } from './pages/dashboard/analytics/analytics.component';
import { MarketingComponent } from './pages/dashboard/marketing/marketing.component';
import { CrmComponent } from './pages/dashboard/crm/crm.component';
import { StocksComponent } from './pages/dashboard/stocks/stocks.component';
import { SaasComponent } from './pages/dashboard/saas/saas.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileNewComponent } from './pages/profile/profile-new/profile-new.component';
import { ProfileQrComponent } from './pages/profile/profile-qr/profile-qr.component';
import { TaskListComponent } from './pages/task/task-list/task-list.component';
import { TaskKanbanComponent } from './pages/task/task-kanban/task-kanban.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { FormLayoutComponent } from './pages/forms/form-layout/form-layout.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { DataTablesComponent } from './pages/tables/data-tables/data-tables.component';
import { FileManagerComponent } from './pages/file-manager/file-manager.component';
import { PricingTablesComponent } from './pages/pricing-tables/pricing-tables.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { Error500Component } from './pages/other-page/error-500/error-500.component';
import { Error503Component } from './pages/other-page/error-503/error-503.component';
import { ComingSoonComponent } from './pages/other-page/coming-soon/coming-soon.component';
import { MaintenanceComponent } from './pages/other-page/maintenance/maintenance.component';
import { SuccessComponent } from './pages/other-page/success/success.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { EmailInboxComponent } from './pages/email/email-inbox/email-inbox.component';
import { EmailDetailsComponent } from './pages/email/email-details/email-details.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { PieChartComponent } from './pages/charts/pie-chart/pie-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { BreadcrumbComponent } from './pages/ui-elements/breadcrumb/breadcrumb.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ButtonGroupComponent } from './pages/ui-elements/button-group/button-group.component';
import { CardsComponent } from './pages/ui-elements/cards/cards.component';
import { CarouselComponent } from './pages/ui-elements/carousel/carousel.component';
import { DropdownsComponent } from './pages/ui-elements/dropdowns/dropdowns.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { LinksComponent } from './pages/ui-elements/links/links.component';
import { ListsComponent } from './pages/ui-elements/lists/lists.component';
import { ModalsComponent } from './pages/ui-elements/modals/modals.component';
import { NotificationsComponent } from './pages/ui-elements/notifications/notifications.component';
import { PaginationsComponent } from './pages/ui-elements/paginations/paginations.component';
import { PopoversComponent } from './pages/ui-elements/popovers/popovers.component';
import { ProgressBarComponent } from './pages/ui-elements/progress-bar/progress-bar.component';
import { RibbonsComponent } from './pages/ui-elements/ribbons/ribbons.component';
import { SpinnersComponent } from './pages/ui-elements/spinners/spinners.component';
import { TabsComponent } from './pages/ui-elements/tabs/tabs.component';
import { TooltipsComponent } from './pages/ui-elements/tooltips/tooltips.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { ResetPasswordComponent } from './pages/auth-pages/reset-password/reset-password.component';
import { TwoStepVerificationComponent } from './pages/auth-pages/two-step-verification/two-step-verification.component';
import { LogisticsComponent } from './pages/dashboard/logistics/logistics.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { TextGeneratorComponent } from './pages/ai/text-generator/text-generator.component';
import { AlternativeLayoutComponent } from './shared/layout/alternative-layout/alternative-layout.component';
import { ImageGeneratorComponent } from './pages/ai/image-generator/image-generator.component';
import { CodeGeneratorComponent } from './pages/ai/code-generator/code-generator.component';
import { VideoGeneratorComponent } from './pages/ai/video-generator/video-generator.component';
import { ProductListComponent } from './pages/ecommerce/product-list/product-list.component';
import { AddProductComponent } from './pages/ecommerce/add-product/add-product.component';
import { ProductListComponent as AdminProductListComponent } from './pages/pub/admin/product-list/product-list.component';
import { AddProductComponent as AdminAddProductComponent } from './pages/pub/admin/add-product/add-product.component';
import { BillingComponent } from './pages/ecommerce/billing/billing.component';
import { InvoiceComponent } from './pages/ecommerce/invoice/invoice.component';
import { SingleInvoiceComponent } from './pages/ecommerce/single-invoice/single-invoice.component';
import { CreateInvoiceComponent } from './pages/ecommerce/create-invoice/create-invoice.component';
import { TransactionsComponent } from './pages/ecommerce/transactions/transactions.component';
import { SingleTransactionComponent } from './pages/ecommerce/single-transaction/single-transaction.component';
import { TicketListComponent } from './pages/support/ticket-list/ticket-list.component';
import { TicketReplyComponent } from './pages/support/ticket-reply/ticket-reply.component';
import { ApiKeysComponent } from './pages/other-page/api-keys/api-keys.component';
import { IntegrationsComponent } from './pages/other-page/integrations/integrations.component';
import { CheckUserStatusComponent } from './pages/home/check-user-status/check-user-status.component';
import { HomeAdminComponent } from './pages/pub/admin/home-admin/home-admin.component';
import { HomeMasterComponent } from './pages/pub/master/home-master/home-master.component';
import { HomeUserComponent } from './pages/pub/user/home-user/home-user.component';
import { HomeWaiterComponent } from './pages/pub/waiter/home-waiter/home-waiter.component';
import { OrdersComponent } from './pages/pub/waiter/orders/orders.component';
import { MenuComponent } from './pages/pub/waiter/menu/menu.component';
import { TablesComponent } from './pages/pub/waiter/tables/tables.component';
import { PaymentsComponent } from './pages/pub/waiter/payments/payments.component';
import { AdminDashboardComponent } from './pages/pub/admin/admin-dashboard/admin-dashboard.component';
import { ConfigComponent } from './pages/pub/admin/config/config.component';

export const routes: Routes = [
  {
    path:'',
    component:AppLayoutComponent,
    children:[
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
        title:
          'Angular Ecommerce Dashboard | TailAdmin - Angular Admin Dashboard Template',
      },
      {
        path:'analytics',
        component:AnalyticsComponent,
        title:'Angular Analytics Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'marketing',
        component:MarketingComponent,
        title:'Angular Marketing Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'crm',
        component:CrmComponent,
        title:'Angular CRM Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'stocks',
        component:StocksComponent,
        title:'Angular Stocks Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'saas',
        component:SaasComponent,
        title:'Angular SaaS Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'logistics',
        component:LogisticsComponent,
        title:'Angular Logistics Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'calendar',
        component:CalenderComponent,
        title:'Angular Calender | TailAdmin - Angular Admin Dashboard Template'
      },
      // ecommerce pages
      {
        path:'products-list',
        component:ProductListComponent,
        title:'Angular Product List Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'add-product',
        component:AddProductComponent,
        title:'Angular Add Product Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'billing',
        component:BillingComponent,
        title:'Angular Ecommerce Billing Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'invoices',
        component:InvoiceComponent,
        title:'Angular Ecommerce Invoice Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'single-invoice',
        component:SingleInvoiceComponent,
        title:'Angular Single Invoice Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'create-invoice',
        component:CreateInvoiceComponent,
        title:'Angular Create Invoice Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'transactions',
        component:TransactionsComponent,
        title:'Angular Transactions Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'single-transaction',
        component:SingleTransactionComponent,
        title:'Angular Single Transaction Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'profile',
        component:ProfileComponent,
        title:'Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'profile-new',
        component:ProfileNewComponent,
        title:'Angular New Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'profile-qr',
        component:ProfileQrComponent,
        title:'Angular Profile QR Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'task-list',
        component:TaskListComponent,
        title:'Angular Task List Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'task-kanban',
        component:TaskKanbanComponent,
        title:'Angular Task Kanban Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'form-elements',
        component:FormElementsComponent,
        title:'Angular Form Elements Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'form-layout',
        component:FormLayoutComponent,
        title:'Angular Form Layout Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'basic-tables',
        component:BasicTablesComponent,
        title:'Angular Basic Tables Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'data-tables',
        component:DataTablesComponent,
        title:'Angular Data Tables Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'file-manager',
        component:FileManagerComponent,
        title:'Angular File Manager Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'pricing-tables',
        component:PricingTablesComponent,
        title:'Angular Pricing Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'faq',
        component:FaqsComponent,
        title:'Angular Faqs Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'api-keys',
        component:ApiKeysComponent,
        title:'Angular Api Keys Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'integrations',
        component:IntegrationsComponent,
        title:'Angular Integrations Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'check-user-status',
        component:CheckUserStatusComponent,
        title:'Angular Check User Status | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'pub/admin',
        component:HomeAdminComponent,
        title:'Angular Pub Admin | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/master',
        component:HomeMasterComponent,
        title:'Angular Pub Master | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/user',
        component:HomeUserComponent,
        title:'Angular Pub User | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/waiter',
        component:HomeWaiterComponent,
        title:'Angular Pub Waiter | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/waiter/orders',
        component:OrdersComponent,
        title:'Angular Pub Pedidos | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/waiter/menu',
        component:MenuComponent,
        title:'Angular Pub Cardápio | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/waiter/tables',
        component:TablesComponent,
        title:'Angular Pub Mesas | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/waiter/payments',
        component:PaymentsComponent,
        title:'Angular Pub Pagamentos | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/admin/admin-dashboard',
        component:AdminDashboardComponent,
        title:'Angular Pub Dashboard Admin | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/admin/product-list',
        component:AdminProductListComponent,
        title:'Angular Pub Lista de Produtos | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/admin/add-product',
        component:AdminAddProductComponent,
        title:'Angular Pub Cadastro de Produto | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'pub/admin/config',
        component:ConfigComponent,
        title:'Angular Pub Configurações | BeerClubPub - Angular Admin Dashboard Template'
      },
      {
        path:'blank',
        component:BlankComponent,
        title:'Angular Blank Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'chat',
        component:ChatsComponent,
        title:'Angular Chats Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      // support tickets
      {
        path:'support-tickets',
        component:TicketListComponent,
        title:'Angular Support Tickets Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'support-ticket-reply',
        component:TicketReplyComponent,
        title:'Angular Ticket Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'inbox',
        component:EmailInboxComponent,
        title:'Angular Email Inbox Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'inbox-details',
        component:EmailDetailsComponent,
        title:'Angular Email Inbox Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'invoice',
        component:InvoicesComponent,
        title:'Angular Invoice Details Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'line-chart',
        component:LineChartComponent,
        title:'Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'bar-chart',
        component:BarChartComponent,
        title:'Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'pie-chart',
        component:PieChartComponent,
        title:'Angular Pie Chart Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'alerts',
        component:AlertsComponent,
        title:'Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'avatars',
        component:AvatarElementComponent,
        title:'Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'badge',
        component:BadgesComponent,
        title:'Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'breadcrumb',
        component:BreadcrumbComponent,
        title:'Angular Breadcrumb Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'buttons',
        component:ButtonsComponent,
        title:'Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'buttons-group',
        component:ButtonGroupComponent,
        title:'Angular Buttons Group Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'cards',
        component:CardsComponent,
        title:'Angular Cards Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'carousel',
        component:CarouselComponent,
        title:'Angular Carousel Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'dropdowns',
        component:DropdownsComponent,
        title:'Angular Dropdown Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'images',
        component:ImagesComponent,
        title:'Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'links',
        component:LinksComponent,
        title:'Angular Links Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'list',
        component:ListsComponent,
        title:'Angular Lists Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'modals',
        component:ModalsComponent,
        title:'Angular Modals Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'notifications',
        component:NotificationsComponent,
        title:'Angular Notifications Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'pagination',
        component:PaginationsComponent,
        title:'Angular Pagination Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'popovers',
        component:PopoversComponent,
        title:'Angular Popovers Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'progress-bar',
        component:ProgressBarComponent,
        title:'Angular Progressbar Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'ribbons',
        component:RibbonsComponent,
        title:'Angular Ribbons Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'spinners',
        component:SpinnersComponent,
        title:'Angular Spinners Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'tabs',
        component:TabsComponent,
        title:'Angular Tabs Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'tooltips',
        component:TooltipsComponent,
        title:'Angular Tooltips Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'videos',
        component:VideosComponent,
        title:'Angular Videos Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
    ]
  },
  {
    path:'',
    component:AlternativeLayoutComponent,
    children:[
       // ai pages
      {
        path:'text-generator',
        component:TextGeneratorComponent,
        title:'Angular AI Text Generator | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'image-generator',
        component:ImageGeneratorComponent,
        title:'Angular AI Image Generator | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'code-generator',
        component:CodeGeneratorComponent,
        title:'Angular AI Code Generator | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path:'video-generator',
        component:VideoGeneratorComponent,
        title:'Angular AI Video Generator | TailAdmin - Angular Admin Dashboard Template'
      },
    ]
  },
  {
    path:'coming-soon',
    component:ComingSoonComponent,
    title:'Angular Coming soon Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'maintenance',
    component:MaintenanceComponent,
    title:'Angular Maintenance Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'success',
    component:SuccessComponent,
    title:'Angular Success Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  // auth pages
  {
    path:'signin',
    component:SignInComponent,
    title:'Angular Sign In Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'signup',
    component:SignUpComponent,
    title:'Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'reset-password',
    component:ResetPasswordComponent,
    title:'Angular Reset Password Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'two-step-verification',
    component:TwoStepVerificationComponent,
    title:'Angular Two Step Verification Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  // error pages
  {
    path:'error-500',
    component:Error500Component,
    title:'Angular Error 500 Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'error-503',
    component:Error503Component,
    title:'Angular Error 503 Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'**',
    component:NotFoundComponent,
    title:'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
];
