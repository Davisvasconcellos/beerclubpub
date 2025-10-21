import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/ui/modal/modal.component';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, ModalComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  // Variáveis para controle do carrossel
  currentRecommendPage = 0;
  
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

  // Função para rolar para um item específico
  scrollToItem(carouselId: string, index: number): void {
    const carousel = document.getElementById(carouselId);
    if (carousel) {
      const items = carousel.querySelectorAll('.snap-start');
      if (items.length > index) {
        items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        
        // Atualiza o indicador de página atual
        if (carouselId === 'recommend-carousel') {
          this.currentRecommendPage = Math.floor(index / 2);
        }
      }
    }
  }

  // Dados das categorias
  categories = [
    { name: 'Meat', icon: '🥩', active: true },
    { name: 'Fast Food', icon: '🍔', active: false },
    { name: 'Drinks', icon: '🧃', active: false },
    { name: 'Pizza', icon: '🍕', active: false },
    { name: 'Desserts', icon: '🍰', active: false },
    { name: 'Salads', icon: '🥗', active: false },
    { name: 'Coffee', icon: '☕', active: false },
    { name: 'Snacks', icon: '🍿', active: false }
  ];

  // Dados dos produtos por categoria
  products = {
    'Meat': [
      {
        id: 1,
        name: 'Grilled Steak',
        description: 'Premium beef steak',
        price: '$18.99',
        image: '🥩',
        quantity: 0
      },
      {
        id: 2,
        name: 'BBQ Ribs',
        description: 'Smoky barbecue ribs',
        price: '$22.50',
        image: '🍖',
        quantity: 0
      },
      {
        id: 3,
        name: 'Lamb Chops',
        description: 'Tender lamb chops',
        price: '$24.99',
        image: '🐑',
        quantity: 0
      }
    ],
    'Fast Food': [
      {
        id: 4,
        name: 'Cheese Burger',
        description: 'Burger Hunt',
        price: '$4.99',
        image: '🍔',
        quantity: 0
      },
      {
        id: 5,
        name: 'Chicken Nuggets',
        description: 'Crispy chicken pieces',
        price: '$6.50',
        image: '🍗',
        quantity: 0
      },
      {
        id: 6,
        name: 'French Fries',
        description: 'Golden crispy fries',
        price: '$3.99',
        image: '🍟',
        quantity: 0
      }
    ],
    'Drinks': [
      {
        id: 7,
        name: 'Fresh Orange Juice',
        description: 'Natural orange juice',
        price: '$4.50',
        image: '🍊',
        quantity: 0
      },
      {
        id: 8,
        name: 'Iced Coffee',
        description: 'Cold brew coffee',
        price: '$5.99',
        image: '☕',
        quantity: 0
      },
      {
        id: 9,
        name: 'Smoothie Bowl',
        description: 'Mixed fruit smoothie',
        price: '$7.50',
        image: '🥤',
        quantity: 0
      }
    ],
    'Pizza': [
      {
        id: 10,
        name: 'Melting Cheese Pizza',
        description: 'Pizza Italiano',
        price: '$11.88',
        image: '🍕',
        quantity: 0
      },
      {
        id: 11,
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni',
        price: '$13.50',
        image: '🍕',
        quantity: 0
      }
    ],
    'Desserts': [
      {
        id: 12,
        name: 'Chocolate Cake',
        description: 'Rich chocolate dessert',
        price: '$6.99',
        image: '🍰',
        quantity: 0
      },
      {
        id: 13,
        name: 'Ice Cream',
        description: 'Vanilla ice cream',
        price: '$4.50',
        image: '🍦',
        quantity: 0
      }
    ],
    'Salads': [
      {
        id: 14,
        name: 'Chicken Salad',
        description: 'Meli House',
        price: '$4.56',
        image: '🥗',
        quantity: 0
      },
      {
        id: 15,
        name: 'Caesar Salad',
        description: 'Classic caesar',
        price: '$8.99',
        image: '🥗',
        quantity: 0
      }
    ],
    'Coffee': [
      {
        id: 16,
        name: 'Espresso',
        description: 'Strong coffee shot',
        price: '$3.50',
        image: '☕',
        quantity: 0
      },
      {
        id: 17,
        name: 'Cappuccino',
        description: 'Creamy coffee',
        price: '$4.99',
        image: '☕',
        quantity: 0
      }
    ],
    'Snacks': [
      {
        id: 18,
        name: 'Popcorn',
        description: 'Buttery popcorn',
        price: '$2.99',
        image: '🍿',
        quantity: 0
      },
      {
        id: 19,
        name: 'Nachos',
        description: 'Cheese nachos',
        price: '$5.50',
        image: '🌮',
        quantity: 0
      }
    ]
  };

  // Getter para produtos da categoria ativa
  get currentCategoryProducts() {
    const activeCategory = this.categories.find((cat: any) => cat.active);
    return activeCategory ? this.products[activeCategory.name as keyof typeof this.products] || [] : [];
  }

  // Getter para nome da categoria ativa
  get activeCategoryName() {
    const activeCategory = this.categories.find((cat: any) => cat.active);
    return activeCategory ? activeCategory.name : 'Products';
  }

  // Métodos para controle de quantidade
  incrementQuantity(product: any) {
    product.quantity++;
    this.triggerItemCountAnimation();
    this.triggerCardClickAnimation(product.id);
  }

  decrementQuantity(product: any) {
    if (product.quantity > 0) {
      product.quantity--;
      this.triggerItemCountAnimation();
      this.triggerCardClickAnimation(product.id);
    }
  }

  // New methods for modal quantity adjustment
  increaseQuantity(item: any) {
    // Check if it's a recommended product
    if (item.category === 'Recomendados') {
      const recommendedProduct = this.recommendedProducts.find(p => p.id === item.id);
      if (recommendedProduct) {
        recommendedProduct.quantity++;
        this.triggerItemCountAnimation();
      }
    } else {
      // Find the original product in the products array and update it
      const category = item.category;
      const product = this.products[category as keyof typeof this.products]?.find(p => p.id === item.id);
      if (product) {
        product.quantity++;
        this.triggerItemCountAnimation();
      }
    }
  }

  decreaseQuantity(item: any) {
    // Check if it's a recommended product
    if (item.category === 'Recomendados') {
      const recommendedProduct = this.recommendedProducts.find(p => p.id === item.id);
      if (recommendedProduct) {
        if (recommendedProduct.quantity > 1) {
          recommendedProduct.quantity--;
        } else {
          // If quantity becomes 0, remove from cart
          recommendedProduct.quantity = 0;
        }
        this.triggerItemCountAnimation();
      }
    } else {
      // Find the original product in the products array and update it
      const category = item.category;
      const product = this.products[category as keyof typeof this.products]?.find(p => p.id === item.id);
      if (product) {
        if (product.quantity > 1) {
          product.quantity--;
        } else {
          // If quantity becomes 0, remove from cart
          product.quantity = 0;
        }
        this.triggerItemCountAnimation();
      }
    }
  }

  // TrackBy function for better change detection
  trackByItemId(index: number, item: any): any {
    return item.id;
  }

  // Dados dos produtos recomendados
  recommendedProducts = [
    {
      id: 20,
      name: 'Lemon tea',
      price: 'R$ 12,00',
      image: '🍋',
      favorite: false,
      quantity: 0
    },
    {
      id: 21,
      name: 'Green ginger tea',
      price: 'R$ 14,00',
      image: '🫖',
      favorite: true,
      quantity: 0
    },
    {
      id: 22,
      name: 'Kiwi smoothie',
      price: 'R$ 16,00',
      image: '🥝',
      favorite: false,
      quantity: 0
    },
    {
      id: 23,
      name: 'Orange juice',
      price: 'R$ 10,00',
      image: '🍊',
      favorite: true,
      quantity: 0
    }
  ];

  // Método para adicionar produto recomendado ao carrinho
  addRecommendedToCart(product: any, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Adicionar produto ao carrinho
    product.quantity = (product.quantity || 0) + 1;
    
    // Disparar animação do contador
    this.triggerItemCountAnimation();
    
    // Disparar animação do card clicado
    this.triggerCardClickAnimation(product.id);
    
    console.log('Produto recomendado adicionado:', product);
  }

  private triggerItemCountAnimation(): void {
    this.itemCountChanged = true;
    setTimeout(() => {
      this.itemCountChanged = false;
    }, 600);
  }

  // Novo método para animação de clique nos cards
  private triggerCardClickAnimation(productId: number): void {
    this.clickedCardId = productId;
    setTimeout(() => {
      this.clickedCardId = null;
    }, 300);
  }

  // Método para selecionar categoria
  selectCategory(index: number): void {
    // Reset all categories
    this.categories.forEach(cat => cat.active = false);
    // Set selected category as active
    this.categories[index].active = true;
  }

  // Informações da mesa
  tableNumber = 'Mesa 05';

  // Modal properties
  isCartModalOpen = false;

  // Animation properties
  itemCountChanged = false;

  // Propriedade para controlar animação de clique nos cards
  clickedCardId: number | null = null;

  // Calcular total do carrinho
  get cartTotal(): number {
    let total = 0;
    
    // Calcular total dos produtos das categorias
    Object.values(this.products).forEach(categoryProducts => {
      categoryProducts.forEach(product => {
        if (product.quantity > 0) {
          const price = parseFloat(product.price.replace('$', ''));
          total += price * product.quantity;
        }
      });
    });
    
    // Calcular total dos produtos recomendados
    this.recommendedProducts.forEach(product => {
      if (product.quantity > 0) {
        const price = parseFloat(product.price.replace('R$ ', '').replace(',', '.'));
        total += price * product.quantity;
      }
    });
    
    return total;
  }

  // Calcular quantidade total de itens
  get totalItems(): number {
    let count = 0;
    
    // Contar produtos das categorias
    Object.values(this.products).forEach(categoryProducts => {
      categoryProducts.forEach(product => {
        count += product.quantity;
      });
    });
    
    // Contar produtos recomendados
    this.recommendedProducts.forEach(product => {
      count += product.quantity;
    });
    
    return count;
  }

  // Método para adicionar ao carrinho (finalizar pedido)
  addToCart(): void {
    console.log('Adicionando ao carrinho...');
  }

  // Modal methods
  openCartModal(): void {
    this.isCartModalOpen = true;
  }

  closeCartModal(): void {
    this.isCartModalOpen = false;
  }

  // Get cart items with quantities > 0
  get cartItems() {
    const items: any[] = [];
    
    // Adicionar produtos das categorias
    Object.keys(this.products).forEach(category => {
      this.products[category as keyof typeof this.products].forEach(product => {
        if (product.quantity > 0) {
          items.push({
            ...product,
            category: category
          });
        }
      });
    });
    
    // Adicionar produtos recomendados
    this.recommendedProducts.forEach(product => {
      if (product.quantity > 0) {
        items.push({
          ...product,
          category: 'Recomendados'
        });
      }
    });
    
    return items;
  }
}
