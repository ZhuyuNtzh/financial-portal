
import { v4 as uuidv4 } from 'uuid';
import { Transaction, Category, FilterOptions, TransactionSummary, DateRange } from '@/types';

// Get user-specific storage key
const getUserKey = (userId: string, key: string) => `${key}_${userId}`;

// Load transactions from localStorage
export const getTransactions = (userId: string): Transaction[] => {
  const storageKey = getUserKey(userId, 'transactions');
  const transactions = localStorage.getItem(storageKey);
  return transactions ? JSON.parse(transactions) : [];
};

// Save transactions to localStorage
export const saveTransactions = (transactions: Transaction[], userId: string): void => {
  const storageKey = getUserKey(userId, 'transactions');
  localStorage.setItem(storageKey, JSON.stringify(transactions));
};

// Load categories from localStorage
export const getCategories = (userId: string): Category[] => {
  const storageKey = getUserKey(userId, 'categories');
  const categories = localStorage.getItem(storageKey);
  return categories ? JSON.parse(categories) : [];
};

// Save categories to localStorage
export const saveCategories = (categories: Category[], userId: string): void => {
  const storageKey = getUserKey(userId, 'categories');
  localStorage.setItem(storageKey, JSON.stringify(categories));
};

// Default categories for new users
export const defaultCategories: Category[] = [
  { id: uuidv4(), name: '工资', type: 'income', icon: '💰' },
  { id: uuidv4(), name: '奖金', type: 'income', icon: '🎁' },
  { id: uuidv4(), name: '投资', type: 'income', icon: '📈' },
  { id: uuidv4(), name: '其他收入', type: 'income', icon: '💸' },
  { id: uuidv4(), name: '餐饮', type: 'expense', icon: '🍔' },
  { id: uuidv4(), name: '购物', type: 'expense', icon: '🛒' },
  { id: uuidv4(), name: '交通', type: 'expense', icon: '🚗' },
  { id: uuidv4(), name: '住房', type: 'expense', icon: '🏠' },
  { id: uuidv4(), name: '娱乐', type: 'expense', icon: '🎬' },
  { id: uuidv4(), name: '医疗', type: 'expense', icon: '💊' },
  { id: uuidv4(), name: '教育', type: 'expense', icon: '📚' },
  { id: uuidv4(), name: '其他支出', type: 'expense', icon: '📝' },
];

// Filter transactions based on filter options
export const filterTransactions = (
  transactions: Transaction[], 
  filterOptions: FilterOptions
): Transaction[] => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const { dateRange, types, categoryIds } = filterOptions;
    
    // Filter by date range
    if (dateRange.from && transactionDate < dateRange.from) return false;
    if (dateRange.to) {
      const endOfDay = new Date(dateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      if (transactionDate > endOfDay) return false;
    }
    
    // Filter by transaction type
    if (types.length > 0 && !types.includes(transaction.type)) return false;
    
    // Filter by category
    if (categoryIds.length > 0 && !categoryIds.includes(transaction.categoryId)) return false;
    
    return true;
  });
};

// Calculate transaction summary
export const calculateTransactionSummary = (
  transactions: Transaction[],
  categories: Category[]
): TransactionSummary => {
  const summary: TransactionSummary = {
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    categorySummary: []
  };
  
  // Initialize category summary with zero amounts
  const categoryMap = new Map<string, number>();
  
  // Calculate totals
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      summary.totalIncome += transaction.amount;
    } else {
      summary.totalExpense += transaction.amount;
    }
    
    // Update category amount
    const currentAmount = categoryMap.get(transaction.categoryId) || 0;
    categoryMap.set(transaction.categoryId, currentAmount + transaction.amount);
  });
  
  // Set net amount
  summary.netAmount = summary.totalIncome - summary.totalExpense;
  
  // Convert category map to array
  summary.categorySummary = Array.from(categoryMap.entries()).map(([categoryId, amount]) => ({
    categoryId,
    amount
  }));
  
  return summary;
};

// Get transaction type color
export const getTransactionTypeColor = (type: 'income' | 'expense'): string => {
  return type === 'income' ? 'text-green-500' : 'text-red-500';
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(amount);
};

// Generate a new transaction ID - Adding this function
export const generateId = (): string => {
  return uuidv4();
};

// Alias for backward compatibility
export const generateTransactionId = generateId;

// Sort transactions by date (newest first)
export const sortTransactionsByDate = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

// Generate a summary of transactions - Adding this function
export const generateSummary = (
  transactions: Transaction[],
  categories: Category[]
): TransactionSummary => {
  return calculateTransactionSummary(transactions, categories);
};
