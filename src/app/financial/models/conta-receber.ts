export type StatusReceber = 'pending' | 'approved' | 'scheduled' | 'received' | 'overdue' | 'canceled';

export interface ParcelaReceber {
  number: number; // ex.: 1
  total: number; // total parcelas
  value: number;
  due_date: Date | string;
  paid_date?: Date | string;
  paid?: boolean;
}

export interface ContaReceber {
  id_code: string;
  client_id: string; // Cliente
  vendor_id?: string; // Vendedor
  nf?: string;
  description?: string;
  sale_total: number; // total da venda
  parcelas?: ParcelaReceber[];
  commission_rate?: number; // taxa de comissão (%), ex.: 5
  due_date: Date | string; // próxima parcela
  status: StatusReceber;
}

