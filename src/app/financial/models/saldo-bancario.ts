export interface SaldoBancarioDiario {
  id: string;
  date: Date | string;
  bank: string;
  balance: number;
  notes?: string;
}

