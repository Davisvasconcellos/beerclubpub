import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SwitchComponent } from '../../form/input/switch.component';
import { AddApiKeyModalComponent } from '../add-api-key-modal/add-api-key-modal.component';

interface ApiKey {
  id: string;
  name: string;
  value: string;
  status: "Active" | "Disabled";
  created: string;
  lastUsed: string;
  hasToggle: boolean;
}

@Component({
  selector: 'app-api-key-table',
  imports: [
    CommonModule,
    SwitchComponent,
    AddApiKeyModalComponent,
  ],
  templateUrl: './api-key-table.component.html',
  styles: ``
})
export class ApiKeyTableComponent {

  copiedId: string | null = null;


  apiKeysData: ApiKey[] = [
    {
      id: "1",
      name: "Production API key",
      value: "sk_live_**********4248",
      status: "Disabled",
      created: "25 Jan, 2025",
      lastUsed: "Today, 10:45 AM",
      hasToggle: true,
    },
    {
      id: "2",
      name: "Development API key",
      value: "dev_live_**********4923",
      status: "Active",
      created: "29 Dec, 2024",
      lastUsed: "Today, 12:40 AM",
      hasToggle: false,
    },
    {
      id: "3",
      name: "Legacy API Key",
      value: "leg_live_**********0932",
      status: "Active",
      created: "12 Mar, 2024",
      lastUsed: "Today, 11:45 PM",
      hasToggle: false,
    },
  ];

  handleCopy(apiKey: ApiKey) {
    navigator.clipboard.writeText(apiKey.value).then(() => {
      this.copiedId = apiKey.id;
      setTimeout(() => (this.copiedId = null), 1500);
    });
  }

  handleToggle(apiKey: ApiKey, checked: boolean) {
    apiKey.status = checked ? 'Active' : 'Disabled';
  }
}
