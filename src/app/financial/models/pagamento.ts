export type MetodoPagamento = 'cash' | 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'boleto';

export interface Pagamento {
  id: string;
  related_account_id_code: string; // conta pagar/receber id_code
  type: 'pagar' | 'receber';
  amount: number; // valor pago/recebido
  partial?: boolean;
  method: MetodoPagamento;
  date: Date | string;
  notes?: string;
}

