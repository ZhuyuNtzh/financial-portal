
import { 
  Category, 
  Transaction, 
  TransactionSummary, 
  FilterOptions,
  TransactionType
} from '@/types';

// Initial categories
export const defaultCategories: Category[] = [
  { id: 'salary', name: '工资', type: 'income' },
  { id: 'bonus', name: '奖金', type: 'income' },
  { id: 'investment', name: '投资收益', type: 'income' },
  { id: 'gift', name: '礼金', type: 'income' },
  { id: 'other-income', name: '其他收入', type: 'income' },
  
  { id: 'food', name: '餐饮', type: 'expense' },
  { id: 'shopping', name: '购物', type: 'expense' },
  { id: 'housing', name: '住房', type: 'expense' },
  { id: 'transportation', name: '交通', type: 'expense' },
  { id: 'entertainment', name: '娱乐', type: 'expense' },
  { id: 'medical', name: '医疗', type: 'expense' },
  { id: 'education', name: '教育', type: 'expense' },
  { id: 'utilities', name: '水电', type: 'expense' },
  { id: 'other-expense', name: '其他支出', type: 'expense' },
];

// Store transactions in localStorage
export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem('transactions', JSON.stringify(transactions));
};

// Get transactions from localStorage
export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem('transactions');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse transactions:', e);
    return [];
  }
};

// Get categories from localStorage or use defaults
export const getCategories = (): Category[] => {
  const stored = localStorage.getItem('categories');
  if (!stored) return defaultCategories;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse categories:', e);
    return defaultCategories;
  }
};

// Save categories to localStorage
export const saveCategories = (categories: Category[]): void => {
  localStorage.setItem('categories', JSON.stringify(categories));
};

// Format amount as currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(amount);
};

// Filter transactions by options
export const filterTransactions = (
  transactions: Transaction[],
  options: FilterOptions
): Transaction[] => {
  return transactions.filter(transaction => {
    // Filter by date range
    if (options.dateRange.from || options.dateRange.to) {
      const transactionDate = new Date(transaction.date);
      
      if (options.dateRange.from && transactionDate < options.dateRange.from) {
        return false;
      }
      
      if (options.dateRange.to) {
        const endDate = new Date(options.dateRange.to);
        endDate.setHours(23, 59, 59, 999); // End of day
        if (transactionDate > endDate) {
          return false;
        }
      }
    }
    
    // Filter by transaction type
    if (options.types.length > 0 && !options.types.includes(transaction.type)) {
      return false;
    }
    
    // Filter by category
    if (options.categoryIds.length > 0 && !options.categoryIds.includes(transaction.categoryId)) {
      return false;
    }
    
    return true;
  });
};

// Generate summary for transactions
export const generateSummary = (transactions: Transaction[], categories: Category[]): TransactionSummary => {
  let totalIncome = 0;
  let totalExpense = 0;
  const categorySummary: { categoryId: string; amount: number }[] = [];
  
  // Initialize all categories with zero amount
  categories.forEach(category => {
    categorySummary.push({
      categoryId: category.id,
      amount: 0
    });
  });
  
  // Sum up transactions
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
    
    // Add to category summary
    const categoryIndex = categorySummary.findIndex(c => c.categoryId === transaction.categoryId);
    if (categoryIndex !== -1) {
      categorySummary[categoryIndex].amount += transaction.amount;
    }
  });
  
  return {
    totalIncome,
    totalExpense,
    netAmount: totalIncome - totalExpense,
    categorySummary
  };
};

// Generate a new transaction ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get transactions by type
export const getTransactionsByType = (
  transactions: Transaction[],
  type: TransactionType
): Transaction[] => {
  return transactions.filter(transaction => transaction.type === type);
};

// Get category by ID
export const getCategoryById = (
  categories: Category[],
  categoryId: string
): Category | undefined => {
  return categories.find(category => category.id === categoryId);
};

// Get transactions by category
export const getTransactionsByCategory = (
  transactions: Transaction[],
  categoryId: string
): Transaction[] => {
  return transactions.filter(transaction => transaction.categoryId === categoryId);
};
