import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Category, Transaction, TransactionType, DateRange } from '@/types';
import TransactionItem from './TransactionItem';
import { formatCurrency } from '@/utils/transactionUtils';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (searchTerm) {
      const category = categories.find(c => c.id === transaction.categoryId);
      const searchFields = [
        category?.name || '',
        transaction.notes,
        transaction.amount.toString(),
      ].join(' ').toLowerCase();
      
      if (!searchFields.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    
    // Type filter
    if (typeFilter.length > 0 && !typeFilter.includes(transaction.type)) {
      return false;
    }
    
    // Category filter
    if (categoryFilter.length > 0 && !categoryFilter.includes(transaction.categoryId)) {
      return false;
    }
    
    // Date range filter
    if (dateRange.from || dateRange.to) {
      const transactionDate = new Date(transaction.date);
      
      if (dateRange.from && transactionDate < dateRange.from) {
        return false;
      }
      
      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        if (transactionDate > endDate) {
          return false;
        }
      }
    }
    
    return true;
  });
  
  // Calculate summary ONLY from filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });
  
  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  
  sortedTransactions.forEach(transaction => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd');
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(transaction);
  });
  
  // Toggle type filter
  const toggleTypeFilter = (type: TransactionType) => {
    setTypeFilter(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  // Toggle category filter
  const toggleCategoryFilter = (categoryId: string) => {
    setCategoryFilter(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter([]);
    setCategoryFilter([]);
    setDateRange({ from: undefined, to: undefined });
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索交易..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4" />
                  筛选
                  {(typeFilter.length > 0 || categoryFilter.length > 0 || dateRange.from || dateRange.to) && (
                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      ✓
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">日期范围</h4>
                    <div className="grid gap-2">
                      <div>
                        <Label htmlFor="from">开始日期</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !dateRange.from && "text-muted-foreground"
                              )}
                            >
                              {dateRange.from ? (
                                format(dateRange.from, "yyyy-MM-dd")
                              ) : (
                                <span>选择日期</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.from}
                              onSelect={(date) => 
                                setDateRange(prev => ({ ...prev, from: date }))
                              }
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="to">结束日期</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !dateRange.to && "text-muted-foreground"
                              )}
                            >
                              {dateRange.to ? (
                                format(dateRange.to, "yyyy-MM-dd")
                              ) : (
                                <span>选择日期</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.to}
                              onSelect={(date) => 
                                setDateRange(prev => ({ ...prev, to: date }))
                              }
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-2 font-medium">交易类型</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="income" 
                          checked={typeFilter.includes('income')}
                          onCheckedChange={() => toggleTypeFilter('income')}
                        />
                        <Label htmlFor="income" className="text-sm">收入</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="expense" 
                          checked={typeFilter.includes('expense')}
                          onCheckedChange={() => toggleTypeFilter('expense')}
                        />
                        <Label htmlFor="expense" className="text-sm">支出</Label>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="mb-2 font-medium">类别</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category.id}`}
                            checked={categoryFilter.includes(category.id)}
                            onCheckedChange={() => toggleCategoryFilter(category.id)}
                          />
                          <Label htmlFor={`category-${category.id}`} className="text-sm">
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      resetFilters();
                      setIsFilterOpen(false);
                    }}
                  >
                    重置筛选
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleSortOrder}
              title={sortOrder === 'desc' ? '从新到旧' : '从旧到新'}
            >
              {sortOrder === 'desc' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-income-muted border border-income/10 text-center">
            <div className="text-sm text-muted-foreground">总收入</div>
            <div className="text-xl font-semibold text-income mt-1">
              {formatCurrency(totalIncome)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-expense-muted border border-expense/10 text-center">
            <div className="text-sm text-muted-foreground">总支出</div>
            <div className="text-xl font-semibold text-expense mt-1">
              {formatCurrency(totalExpense)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <div key={date} className="animate-slide-up" style={{ 
              animationDelay: `${Object.keys(groupedTransactions).indexOf(date) * 50}ms` 
            }}>
              <div className="sticky top-[76px] z-[2] backdrop-blur-sm py-2 mb-2 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    {format(new Date(date), 'yyyy年MM月dd日', { locale: zhCN })}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {dayTransactions.length} 笔交易
                  </div>
                </div>
              </div>
              {dayTransactions.map((transaction) => {
                const category = categories.find(
                  (c) => c.id === transaction.categoryId
                );
                if (!category) return null;
                
                return (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    category={category}
                    onEdit={onEditTransaction}
                    onDelete={onDeleteTransaction}
                  />
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">未找到符合条件的交易记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
