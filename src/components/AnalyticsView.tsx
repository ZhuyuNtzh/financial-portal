import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon,
  Filter,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';
import { Category, Transaction, DateRange, TransactionType } from '@/types';
import { formatCurrency, filterTransactions, generateSummary } from '@/utils/transactionUtils';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#A4DE6C', '#D0ED57', '#F56954', '#FFA726'
];

const timeRanges = [
  { value: '7days', label: '最近7天' },
  { value: '30days', label: '最近30天' },
  { value: '90days', label: '最近90天' },
  { value: 'thisMonth', label: '本月' },
  { value: 'lastMonth', label: '上月' },
  { value: 'thisYear', label: '今年' },
  { value: 'custom', label: '自定义' }
];

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, categories }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30days');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>(['income', 'expense']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getDateRangeFromTimeRange = (): DateRange => {
    const today = new Date();
    let to = new Date(today);
    let from: Date;

    switch (timeRange) {
      case '7days':
        from = new Date(today);
        from.setDate(today.getDate() - 7);
        return { from, to };
      case '30days':
        from = new Date(today);
        from.setDate(today.getDate() - 30);
        return { from, to };
      case '90days':
        from = new Date(today);
        from.setDate(today.getDate() - 90);
        return { from, to };
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from, to };
      case 'lastMonth':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        return { from, to };
      case 'thisYear':
        from = new Date(today.getFullYear(), 0, 1);
        return { from, to };
      case 'custom':
        return dateRange;
      default:
        from = new Date(today);
        from.setDate(today.getDate() - 30);
        return { from, to };
    }
  };

  const getFilteredTransactions = () => {
    const computedDateRange = timeRange === 'custom' ? dateRange : getDateRangeFromTimeRange();
    
    return filterTransactions(transactions, {
      dateRange: computedDateRange,
      types: selectedTypes,
      categoryIds: selectedCategories,
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const summary = generateSummary(filteredTransactions, categories);

  const toggleType = (type: TransactionType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const prepareBarChartData = () => {
    const dateMap = new Map<string, {
      date: string;
      income: number;
      expense: number;
    }>();
    
    const computedDateRange = timeRange === 'custom' ? dateRange : getDateRangeFromTimeRange();
    if (!computedDateRange.from) return [];
    
    let currentDate = new Date(computedDateRange.from);
    const endDate = computedDateRange.to || new Date();
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      dateMap.set(dateStr, {
        date: dateStr,
        income: 0,
        expense: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    filteredTransactions.forEach(transaction => {
      const dateStr = format(new Date(transaction.date), 'yyyy-MM-dd');
      const existing = dateMap.get(dateStr);
      
      if (existing) {
        if (transaction.type === 'income') {
          existing.income += transaction.amount;
        } else {
          existing.expense += transaction.amount;
        }
      }
    });
    
    return Array.from(dateMap.values());
  };

  const preparePieChartData = (type: TransactionType) => {
    const categoryMap = new Map<string, {
      name: string;
      value: number;
      categoryId: string;
    }>();
    
    categories
      .filter(category => category.type === type)
      .forEach(category => {
        categoryMap.set(category.id, {
          name: category.name,
          value: 0,
          categoryId: category.id,
        });
      });
    
    filteredTransactions
      .filter(transaction => transaction.type === type)
      .forEach(transaction => {
        const existing = categoryMap.get(transaction.categoryId);
        if (existing) {
          existing.value += transaction.amount;
        }
      });
    
    return Array.from(categoryMap.values())
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const barChartData = prepareBarChartData();
  const incomePieData = preparePieChartData('income');
  const expensePieData = preparePieChartData('expense');

  const displayDateRange = () => {
    if (timeRange === 'custom') {
      if (dateRange.from && dateRange.to) {
        return `${format(dateRange.from, 'yyyy-MM-dd')} 至 ${format(dateRange.to, 'yyyy-MM-dd')}`;
      }
      return '自定义日期';
    }
    
    const range = getDateRangeFromTimeRange();
    if (range.from && range.to) {
      return `${format(range.from, 'yyyy-MM-dd')} 至 ${format(range.to, 'yyyy-MM-dd')}`;
    }
    
    return timeRanges.find(r => r.value === timeRange)?.label || '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择时间范围" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {timeRange === 'custom' && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[120px] justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    format(dateRange.from, "MM-dd")
                  ) : (
                    <span>开始日期</span>
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
            <span className="text-muted-foreground">至</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[120px] justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? (
                    format(dateRange.to, "MM-dd")
                  ) : (
                    <span>结束日期</span>
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
        )}
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              筛选
              {(selectedTypes.length < 2 || selectedCategories.length > 0) && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  ✓
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">交易类型</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-income" 
                      checked={selectedTypes.includes('income')}
                      onCheckedChange={() => toggleType('income')}
                    />
                    <Label htmlFor="filter-income" className="text-sm">收入</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-expense" 
                      checked={selectedTypes.includes('expense')}
                      onCheckedChange={() => toggleType('expense')}
                    />
                    <Label htmlFor="filter-expense" className="text-sm">支出</Label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="mb-2 font-medium">类别</h4>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {categories
                    .filter(category => selectedTypes.includes(category.type))
                    .map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`filter-category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label htmlFor={`filter-category-${category.id}`} className="text-sm">
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
                  setSelectedTypes(['income', 'expense']);
                  setSelectedCategories([]);
                  setIsFilterOpen(false);
                }}
              >
                重置筛选
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="text-sm text-muted-foreground">
        显示: {displayDateRange()}
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">收入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
              {formatCurrency(summary.totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">支出</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">
              {formatCurrency(summary.totalExpense)}
            </div>
          </CardContent>
        </Card>
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">净额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              summary.netAmount >= 0 ? "text-income" : "text-expense"
            )}>
              {formatCurrency(summary.netAmount)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center justify-center">
            <BarChartIcon className="mr-2 h-4 w-4" />
            <span>收支概览</span>
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center justify-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            <span>类别分析</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>收支趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MM-dd')}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(value) => format(new Date(value), 'yyyy-MM-dd')}
                      />
                      <Legend />
                      <Bar 
                        dataKey="income" 
                        name="收入" 
                        fill="rgba(16, 185, 129, 0.8)" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="expense" 
                        name="支出" 
                        fill="rgba(239, 68, 68, 0.8)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">无数据</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="category" className="pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>收入类别分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {incomePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {incomePieData.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">无收入数据</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 space-y-2">
                  {incomePieData.map((item, index) => (
                    <div key={item.categoryId} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span>{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>支出类别分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {expensePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensePieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expensePieData.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">无支出数据</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 space-y-2">
                  {expensePieData.map((item, index) => (
                    <div key={item.categoryId} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span>{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsView;
