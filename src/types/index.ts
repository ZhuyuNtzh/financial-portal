
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO string
  type: TransactionType;
  categoryId: string;
  notes: string;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  categorySummary: {
    categoryId: string;
    amount: number;
  }[];
}

export interface FilterOptions {
  dateRange: DateRange;
  types: TransactionType[];
  categoryIds: string[];
}
