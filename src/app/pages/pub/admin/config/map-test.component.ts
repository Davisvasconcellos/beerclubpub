import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

// Corrige os caminhos dos ícones padrão do Leaflet
const iconRetinaUrl = 'images/leaflet/marker-icon-2x.png';
const iconUrl = 'images/leaflet/marker-icon.png';
const shadowUrl = 'images/leaflet/marker-shadow.png';
const iconDefault = L.icon({ iconRetinaUrl, iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], tooltipAnchor: [16, -28], shadowSize: [41, 41] });
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-test.component.html',
})
export class MapTestComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.map = L.map('map-test-div').setView([-22.9068, -43.1729], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    }, 0);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}