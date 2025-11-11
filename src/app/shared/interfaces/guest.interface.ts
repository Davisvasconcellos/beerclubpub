export interface Guest {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'Confirmado' | 'Pendente' | 'Cancelado';
  image?: string;
  instagram?: string;
  documentNumber?: string;
  documentType?: 'rg' | 'cpf' | 'passport';
  guestType?: 'normal' | 'premium' | 'vip';
}