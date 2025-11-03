import { AfterViewInit, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../../../shared/components/form/label/label.component';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { SelectComponent } from '../../../../shared/components/form/select/select.component';
import { TextAreaComponent } from '../../../../shared/components/form/input/text-area.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { CheckboxComponent } from '../../../../shared/components/form/input/checkbox.component';
import { SwitchComponent } from '../../../../shared/components/form/input/switch.component';
import { ConfigService, StoreDetails } from './config.service'; // Certifique-se que StoreDetails está exportado
import { LocalStorageService } from '../../../../shared/services/local-storage.service';
import { Store } from '../home-admin/store.service';
import * as L from 'leaflet';

// Corrige os caminhos dos ícones padrão do Leaflet
const iconRetinaUrl = 'images/leaflet/marker-icon-2x.png';
const iconUrl = 'images/leaflet/marker-icon.png';
const shadowUrl = 'images/leaflet/marker-shadow.png';
const iconDefault = L.icon({ iconRetinaUrl, iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], tooltipAnchor: [16, -28], shadowSize: [41, 41] });
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LabelComponent, // Mantendo os labels
    ButtonComponent,
    CheckboxComponent,
    SwitchComponent,
    HttpClientModule,
    NgIf,
  ],
  templateUrl: './config.component.html',
  styleUrls: []
})
export class ConfigComponent implements OnInit, AfterViewInit, OnDestroy {
  activeTab: string = 'establishment';
  isLoading: boolean = false;
  error: string | null = null;

  private readonly STORE_KEY = 'selectedStore';

  // Estabelecimento
  establishmentName: string = '';
  capacity: string = '';
  establishmentType: string = '';
  banner_url: string = '';
  logo_url: string = '';
  facebook_handle: string = '';
  instagram_handle: string = '';
  website: string = '';
  establishmentDescription: string = '';
  establishmentTypes = [
    { value: 'bar', label: 'Bar' },
    { value: 'restaurant', label: 'Restaurante' },
    { value: 'pub', label: 'Pub' },
    { value: 'brewery', label: 'Cervejaria' },
    { value: 'nightclub', label: 'Casa Noturna' }
  ];

  // Dados da empresa
  companyName: string = '';
  cnpj: string = '';
  phone: string = '';
  email: string = '';
  zip_code: string = '';
  address_street: string = '';
  address_number: string = '';
  address_complement: string = '';
  address_neighborhood: string = '';
  address_city: string = '';
  address_state: string = '';
  latitude: string = '-22.9068'; // Coordenadas padrão (Rio de Janeiro)
  longitude: string = '-43.1729'; // Coordenadas padrão (Rio de Janeiro)
  private map!: L.Map;
  private marker!: L.Marker;

  // Horários de funcionamento
  mondayOpen: string = '';
  mondayClose: string = '';
  mondayEnabled: boolean = false;
  tuesdayEnabled: boolean = false;
  wednesdayEnabled: boolean = false;
  thursdayEnabled: boolean = false;
  fridayEnabled: boolean = false;
  saturdayEnabled: boolean = false;
  sundayEnabled: boolean = false;
  tuesdayOpen: string = '';
  tuesdayClose: string = '';
  wednesdayOpen: string = '';
  wednesdayClose: string = '';
  thursdayOpen: string = '';
  thursdayClose: string = '';
  fridayOpen: string = '';
  fridayClose: string = '';
  saturdayOpen: string = '';
  saturdayClose: string = '';
  sundayOpen: string = '';
  sundayClose: string = '';

  // Métodos de pagamento
  acceptCash: boolean = false;
  acceptCard: boolean = false;
  acceptPix: boolean = false;
  acceptVoucher: boolean = false;

  // Integração com delivery
  deliveryEnabled: boolean = false;
  deliveryRadius: string = '';
  deliveryFee: string = '';
  minOrderValue: string = '';

  private configService = inject(ConfigService);
  private localStorageService = inject(LocalStorageService);
  private http = inject(HttpClient);

  ngOnInit(): void {
    this.loadStoreDetails();
  }

  ngAfterViewInit(): void {
    // A inicialização do mapa principal é tratada pelo setActiveTab
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private loadStoreDetails(): void {
    const selectedStore = this.localStorageService.getData<Store>(this.STORE_KEY);
    console.log('Loja selecionada do localStorage:', selectedStore);

    if (!selectedStore) {
      this.error = 'Nenhuma loja selecionada. Por favor, selecione uma loja na página inicial.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.configService.getStoreById(selectedStore.id_code).subscribe({
      next: (storeDetails: StoreDetails) => {
        console.log('Dados da loja recebidos da API:', storeDetails);
        this.populateForm(storeDetails);
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.message || 'Falha ao carregar os dados da loja.';
        this.isLoading = false;
      }
    });
  }

  private populateForm(data: StoreDetails): void {
    // Aba: Estabelecimento
    this.establishmentName = data.name || '';
    this.capacity = data.capacity?.toString() || '';
    this.establishmentType = data.type || '';
    this.banner_url = data.banner_url || '';
    this.logo_url = data.logo_url || '';
    this.facebook_handle = data.facebook_handle || '';
    this.instagram_handle = data.instagram_handle || '';
    this.website = data.website || '';
    // this.establishmentDescription = data.establishmentDescription || '';

    // Aba: Dados da Empresa
    this.companyName = data.legal_name || '';
    this.cnpj = data.cnpj || '';
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.zip_code = data.zip_code || '';
    this.address_street = data.address_street || '';
    this.address_number = data.address_number || '';
    this.address_complement = data.address_complement || '';
    this.address_neighborhood = data.address_neighborhood || '';
    // O campo 'address_city' não existe na interface `StoreDetails`,
    // mas é necessário para a busca de CEP.
    this.address_city = data.address_city || '';
    this.address_state = data.address_state || '';
    this.latitude = data.latitude?.toString() || '-22.9068';
    this.longitude = data.longitude?.toString() || '-43.1729';

    // Outras abas podem ser populadas aqui (horários, pagamentos, delivery)
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'company') {
      setTimeout(() => {
        // A inicialização ou atualização do mapa agora é centralizada em initMap.
        // Apenas garantimos que ele seja chamado quando a aba se torna visível.
        const lat = parseFloat(this.latitude || '0');
        const lon = parseFloat(this.longitude || '0');
        this.initMap(lat, lon);
      }, 0);
    }
  }

  onSave(): void {
    // Save configuration
    console.log('Saving configuration...');
    console.log({
      establishment: {
        name: this.establishmentName,
        capacity: this.capacity,
        type: this.establishmentType,
        description: this.establishmentDescription,
        facebook: this.facebook_handle,
        instagram: this.instagram_handle,
        website: this.website,

      },
      company: {
        name: this.companyName,
        cnpj: this.cnpj,
        phone: this.phone,
        email: this.email,
        zip_code: this.zip_code,
        address_street: this.address_street,
        address_number: this.address_number,
        address_complement: this.address_complement,
        address_neighborhood: this.address_neighborhood,
        address_city: this.address_city,
        address_state: this.address_state,
        latitude: this.latitude,
        longitude: this.longitude
      },
      hours: {
        monday: { open: this.mondayOpen, close: this.mondayClose },
        tuesday: { open: this.tuesdayOpen, close: this.tuesdayClose },
        wednesday: { open: this.wednesdayOpen, close: this.wednesdayClose },
        thursday: { open: this.thursdayOpen, close: this.thursdayClose },
        friday: { open: this.fridayOpen, close: this.fridayClose },
        saturday: { open: this.saturdayOpen, close: this.saturdayClose },
        sunday: { open: this.sundayOpen, close: this.sundayClose }
      },
      payments: {
        cash: this.acceptCash,
        card: this.acceptCard,
        pix: this.acceptPix,
        voucher: this.acceptVoucher
      },
      delivery: {
        enabled: this.deliveryEnabled,
        radius: this.deliveryRadius,
        fee: this.deliveryFee,
        minOrder: this.minOrderValue
      }
    });
  }

  onCancel(): void {
    // Cancel changes
    console.log('Cancelling changes...');
  }

  onCepBlur(): void {
    const cep = this.zip_code.replace(/\D/g, '');

    if (cep.length !== 8) {
      return;
    }

    this.http.get(`https://viacep.com.br/ws/${cep}/json/`).subscribe((data: any) => {
      if (data.erro) {
        console.error('CEP não encontrado');
        // Limpar campos ou mostrar erro
        return;
      }
      this.address_street = data.logradouro;
      this.address_neighborhood = data.bairro;
      this.address_city = data.localidade;
      this.address_state = data.uf;
      this.geocodeAddress(); // Busca as coordenadas após preencher o endereço
      // Opcional: focar no campo de número após a busca
      // document.querySelector('[name="address_number"]')?.focus();
    }, error => {
      console.error('Erro ao buscar CEP', error);
    });
  }

  onAddressNumberChange(): void {
    this.geocodeAddress();
  }

  geocodeAddress(): void {
    const address = `${this.address_street}, ${this.address_number}, ${this.address_city}, ${this.address_state}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

    if (!this.address_street || !this.address_city) {
      console.error('Endereço insuficiente para geocodificação.');
      // Opcional: Adicionar um alerta para o usuário
      return;
    }

    this.http.get<any[]>(url).subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.latitude = data[0].lat;
          this.longitude = data[0].lon;
          this.updateMap(parseFloat(this.latitude), parseFloat(this.longitude));
          console.log(`Coordenadas encontradas: Lat ${this.latitude}, Lon ${this.longitude}`);
        } else {
          console.error('Não foi possível encontrar as coordenadas para o endereço fornecido.');
          // Opcional: Adicionar um alerta para o usuário
        }
      },
      (error) => console.error('Erro na geocodificação:', error)
    );
  }

  private initMap(lat: number, lon: number): void {
    // Se o mapa não existe e o container está disponível, crie o mapa.
    if (!this.map && document.getElementById('map')) {
      this.map = L.map('map', { scrollWheelZoom: false }).setView([lat, lon], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      this.marker = L.marker([lat, lon], { draggable: false }).addTo(this.map);
    }
    // Se o mapa já existe, apenas atualize a visão.
    else if (this.map) {
      this.updateMap(lat, lon);
    }
  }

  private updateMap(lat: number, lon: number): void {
    this.map.setView([lat, lon], 15);
    this.marker.setLatLng([lat, lon]);
    setTimeout(() => this.map.invalidateSize(), 10);
  }
}