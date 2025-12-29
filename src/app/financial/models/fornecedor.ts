export interface Fornecedor {
  id_code: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  bank?: {
    account?: string;
    agency?: string;
  };
}

