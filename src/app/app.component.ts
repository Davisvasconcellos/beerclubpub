// AppComponent
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Angular Template';

  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang') || 'pt-br';
    this.translate.addLangs(['pt-br', 'en']);
    this.translate.setDefaultLang('pt-br');
    this.translate.use(savedLang);
  }
}
