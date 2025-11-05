import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../../shared/services/auth.service';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { EstablishmentCardComponent } from '../../../../shared/components/club/establishment-card/establishment-card.component';
import { ProductCardComponent } from '../../../../shared/components/club/product-card/product-card.component';
import { BrandCardComponent } from '../../../../shared/components/club/brand-card/brand-card.component';
import { PromotionCardComponent } from '../../../../shared/components/club/promotion-card/promotion-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home-user',
  imports: [RouterModule, CommonModule, TranslateModule, InputFieldComponent, EstablishmentCardComponent, ProductCardComponent, BrandCardComponent, PromotionCardComponent],
  templateUrl: './home-user.component.html',
  styleUrl: './home-user.component.css'
})
export class HomeUserComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
  // Variáveis para controle dos carrosséis
  currentPromoPage = 0;
  currentBrandPage = 0;
  currentPrestigiousPage = 0;
  
  // Variáveis para controle do drag
  isDragging = false;
  startX = 0;
  scrollLeft = 0;
  currentCarousel: HTMLElement | null = null;
  
  // Método para iniciar o drag com mouse
  startDrag(e: MouseEvent, carouselId: string): void {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    this.isDragging = true;
    this.startX = e.pageX - carousel.offsetLeft;
    this.scrollLeft = carousel.scrollLeft;
    this.currentCarousel = carousel;
    
    // Adicionar eventos globais
    document.addEventListener('mousemove', this.doDrag);
    document.addEventListener('mouseup', this.stopDrag);
  }
  
  // Método para iniciar o drag com touch
  startDragTouch(e: TouchEvent, carouselId: string): void {
    const carousel = document.getElementById(carouselId);
    if (!carousel || !e.touches[0]) return;
    
    this.isDragging = true;
    this.startX = e.touches[0].pageX - carousel.offsetLeft;
    this.scrollLeft = carousel.scrollLeft;
    this.currentCarousel = carousel;
    
    // Adicionar eventos globais
    document.addEventListener('touchmove', this.doDragTouch);
    document.addEventListener('touchend', this.stopDragTouch);
  }
  
  // Método para realizar o drag com mouse
  doDrag = (e: MouseEvent): void => {
    if (!this.isDragging || !this.currentCarousel) return;
    e.preventDefault();
    
    const x = e.pageX - this.currentCarousel.offsetLeft;
    const walk = (x - this.startX) * 1.5; // Multiplicador ajustado para movimento mais suave
    this.currentCarousel.scrollLeft = this.scrollLeft - walk;
  }
  
  // Método para realizar o drag com touch
  doDragTouch = (e: TouchEvent): void => {
    if (!this.isDragging || !this.currentCarousel || !e.touches[0]) return;
    e.preventDefault(); // Previne comportamentos padrão do navegador
    
    const x = e.touches[0].pageX - this.currentCarousel.offsetLeft;
    const walk = (x - this.startX) * 1.5; // Multiplicador ajustado para movimento mais suave
    this.currentCarousel.scrollLeft = this.scrollLeft - walk;
  }
  
  // Método para parar o drag com mouse
  stopDrag = (): void => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.doDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  }
  
  // Método para parar o drag com touch
  stopDragTouch = (): void => {
    this.isDragging = false;
    document.removeEventListener('touchmove', this.doDragTouch);
    document.removeEventListener('touchend', this.stopDragTouch);
  }
  
  ngAfterViewInit() {
    // Configurar observadores de scroll para todos os carrosséis
    this.setupScrollObserver('promo-carousel', 2);
    this.setupScrollObserver('brand-carousel', 3);
    this.setupScrollObserver('prestigious-carousel', 3);
  }
  
  // Configura um observador de scroll para atualizar os indicadores automaticamente
  setupScrollObserver(carouselId: string, itemsPerPage: number): void {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    // Usar IntersectionObserver para detectar itens visíveis
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const item = entry.target as HTMLElement;
            const items = Array.from(carousel.querySelectorAll('.snap-start'));
            const index = items.indexOf(item);
            
            // Atualizar o indicador de página
            if (carouselId === 'promo-carousel') {
              this.currentPromoPage = Math.floor(index / itemsPerPage);
            } else if (carouselId === 'brand-carousel') {
              this.currentBrandPage = Math.floor(index / itemsPerPage);
            } else if (carouselId === 'prestigious-carousel') {
              this.currentPrestigiousPage = Math.floor(index / itemsPerPage);
            }
          }
        });
      },
      { threshold: 0.7, root: carousel }
    );
    
    // Observar todos os itens do carrossel
    carousel.querySelectorAll('.snap-start').forEach(item => {
      observer.observe(item);
    });
  }
  
  // Função para rolar para um item específico
  scrollToItem(carouselId: string, index: number): void {
    const carousel = document.getElementById(carouselId);
    if (carousel) {
      const items = carousel.querySelectorAll('.snap-start');
      if (items.length > index) {
        items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        
        // Atualiza o indicador de página atual
        if (carouselId === 'promo-carousel') {
          this.currentPromoPage = Math.floor(index / 2);
        } else if (carouselId === 'brand-carousel') {
          this.currentBrandPage = Math.floor(index / 3);
        } else if (carouselId === 'prestigious-carousel') {
          this.currentPrestigiousPage = Math.floor(index / 3);
        }
      }
    }
  }
  
  // Dados mockados para demonstração
  promotions = [
    {
      title: 'PROMOÇÃO',
      subtitle: 'PIZZA',
      discount: '50% OFF',
      backgroundColor: 'bg-gradient-to-r from-red-500 to-orange-500',
      textColor: 'text-white'
    },
    {
      title: 'Entrega grátis',
      subtitle: 'APROVEITE',
      discount: 'R$ 0,00',
      backgroundColor: 'bg-orange-500',
      textColor: 'text-white'
    },
    {
      title: 'HAPPY HOUR',
      subtitle: 'CERVEJAS',
      discount: '30% OFF',
      backgroundColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
      textColor: 'text-white'
    },
    {
      title: 'COMBO',
      subtitle: 'PETISCOS',
      discount: 'R$ 25,90',
      backgroundColor: 'bg-gradient-to-r from-green-500 to-teal-500',
      textColor: 'text-white'
    },
    {
      title: 'FERIADO',
      subtitle: 'ESPECIAL',
      discount: '40% OFF',
      backgroundColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      textColor: 'text-white'
    },
    {
      title: 'SEXTA-FEIRA',
      subtitle: 'CHOPP',
      discount: '2 POR 1',
      backgroundColor: 'bg-gradient-to-r from-yellow-500 to-red-500',
      textColor: 'text-white'
    },
    {
      title: 'DELIVERY',
      subtitle: 'RÁPIDO',
      discount: '15min',
      backgroundColor: 'bg-gradient-to-r from-blue-400 to-cyan-500',
      textColor: 'text-white'
    },
    {
      title: 'NOVIDADE',
      subtitle: 'DRINKS',
      discount: '25% OFF',
      backgroundColor: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      textColor: 'text-white'
    }
  ];

  // Renomeando para brands para corresponder ao template
  brands = [
    { name: 'BRAHMA', backgroundColor: 'bg-red-600', textColor: 'text-white', isLarge: true },
    { name: 'SKOL', backgroundColor: 'bg-yellow-400', textColor: 'text-black', isLarge: true },
    { name: 'ANTARCTICA', backgroundColor: 'bg-blue-600', textColor: 'text-white', isLarge: true },
    { name: 'KAISER', backgroundColor: 'bg-green-600', textColor: 'text-white', isLarge: true },
    { name: 'ITAIPAVA', backgroundColor: 'bg-orange-500', textColor: 'text-white', isLarge: true },
    { name: 'ORIGINAL', backgroundColor: 'bg-amber-700', textColor: 'text-white', isLarge: true },
    { name: 'DEVASSA', backgroundColor: 'bg-red-400', textColor: 'text-white', isLarge: true },
    { name: 'PETRA', backgroundColor: 'bg-slate-700', textColor: 'text-white', isLarge: true },
    { name: 'EISENBAHN', backgroundColor: 'bg-amber-800', textColor: 'text-white', isLarge: true },
    { name: 'CORONA', backgroundColor: 'bg-blue-300', textColor: 'text-black', isLarge: true }
  ];

  prestigiousBrands = [
    { name: 'STELLA ARTOIS', backgroundColor: 'bg-white', textColor: 'text-black', isLarge: false },
    { name: 'BOHEMIA', backgroundColor: 'bg-white', textColor: 'text-black', isLarge: false },
    { name: 'CORONA', backgroundColor: 'bg-white', textColor: 'text-black', isLarge: false },
    { name: 'HEINEKEN', backgroundColor: 'bg-white', textColor: 'text-black', isLarge: false },
    { name: 'BUDWEISER', backgroundColor: 'bg-white', textColor: 'text-black', isLarge: false }
  ];

  beerPacks = [
    {
      name: 'Antarctica Pilsen 473ml',
      description: 'Pack de 30 unidades',
      originalPrice: 'R$ 113,70',
      discountedPrice: 'R$ 108,02',
      discount: '-5%',
      quantity: '30'
    },
    {
      name: 'Stella Artois 350ml',
      description: 'Pack de 24 unidades',
      originalPrice: 'R$ 100,56',
      discountedPrice: 'R$ 95,53',
      discount: '-5%',
      quantity: '24'
    },
    {
      name: 'Skol 350ml',
      description: 'Pack de 24 unidades',
      originalPrice: 'R$ 66,96',
      discountedPrice: 'R$ 63,61',
      discount: '-5%',
      quantity: '24'
    }
  ];

  establishments = [
    {
      name: 'Lanchonete Napolitana',
      category: 'lanches • pizza',
      distance: '4,2km',
      deliveryTime: '40 a 60min',
      rating: '4,9',
      deliveryFee: undefined,
      isFreeDelivery: true,
      iconColor: 'bg-green-500'
    },
    {
      name: 'Pizzaria Central',
      category: 'pizzas • massas',
      distance: '2,3km',
      deliveryTime: '40 a 60min',
      rating: undefined,
      deliveryFee: 'R$ 9,90',
      isFreeDelivery: false,
      iconColor: 'bg-red-500'
    },
    {
      name: 'Sorvetes Miramar',
      category: 'sorvetes • doces',
      distance: '1,2km',
      deliveryTime: '40 a 60min',
      rating: '4,8',
      deliveryFee: 'R$ 9,90',
      isFreeDelivery: false,
      iconColor: 'bg-yellow-400'
    }
  ];
}
