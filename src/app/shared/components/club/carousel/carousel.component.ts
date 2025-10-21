import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styles: ``
})
export class CarouselComponent implements OnInit {
  @Input() itemsPerView: number = 2;
  @Input() showIndicators: boolean = true;
  @Input() items: any[] = [];
  
  currentIndex = 0; // Inicia com os cards visíveis
  totalPages = 0;
  
  // Drag functionality
  isDragging = false;
  startX = 0;
  currentTranslate = 0;
  prevTranslate = 0;
  dragThreshold = 50; // Minimum drag distance to trigger page change
  
  ngOnInit() {
    this.totalPages = Math.ceil(this.items.length / this.itemsPerView);
  }
  
  next() {
    if (this.currentIndex < this.totalPages - 1) {
      this.currentIndex++;
    }
  }
  
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
  
  goToPage(page: number) {
    this.currentIndex = page;
  }
  
  getPages() {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
  
  getCurrentItems() {
    const start = this.currentIndex * this.itemsPerView;
    const end = start + this.itemsPerView;
    return this.items.slice(start, end);
  }
  
  // Drag functionality
  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX;
    event.preventDefault();
  }
  
  startDragTouch(event: TouchEvent) {
    this.isDragging = true;
    this.startX = event.touches[0].clientX;
  }
  
  onDrag(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const currentPosition = event.clientX;
    const diff = currentPosition - this.startX;
    
    if (Math.abs(diff) > this.dragThreshold) {
      if (diff > 0 && this.currentIndex > 0) {
        this.prev();
      } else if (diff < 0 && this.currentIndex < this.totalPages - 1) {
        this.next();
      }
      this.endDrag();
    }
  }
  
  onDragTouch(event: TouchEvent) {
    if (!this.isDragging) return;
    
    const currentPosition = event.touches[0].clientX;
    const diff = currentPosition - this.startX;
    
    if (Math.abs(diff) > this.dragThreshold) {
      if (diff > 0 && this.currentIndex > 0) {
        this.prev();
      } else if (diff < 0 && this.currentIndex < this.totalPages - 1) {
        this.next();
      }
      this.endDrag();
    }
  }
  
  endDrag() {
    this.isDragging = false;
  }
}