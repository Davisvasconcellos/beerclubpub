export interface Comissao {
  id: string;
  vendor_id: string; // vendedor
  value: number; // valor comissão
  payment_date?: Date | string;
  status_paid: boolean;
  period?: { start: Date | string; end: Date | string };
}

