// app.config.ts (providers bootstrap)
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';

// ngx-translate v17 providers
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

// Auth interceptor
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Remover o factory antigo do TranslateHttpLoader (v17 não aceita parâmetros no construtor)
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    // Configuração recomendada no v17: usar provider functions
    provideTranslateService({
      // Idioma de fallback (quando não encontrar uma chave)
      fallbackLang: 'pt-br',
      // Loader HTTP com prefix/suffix configurados para a pasta public/i18n
      loader: provideTranslateHttpLoader({
        prefix: 'i18n/lang-',
        suffix: '.json'
      })
    })
  ]
};
