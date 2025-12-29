export type TipoDespesaMenor = 'vale' | 'caixa' | 'reembolso' | 'outro';

export interface DespesaMenor {
  id: string;
  type: TipoDespesaMenor;
  description: string;
  amount: number;
  date: Date | string;
  employee_id?: string; // user id
}

