
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Category, Transaction, TransactionType } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { generateId } from '@/utils/transactionUtils';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  categories: Category[];
  editTransaction?: Transaction;
}

const formSchema = z.object({
  amount: z.coerce.number().positive('金额必须大于零'),
  date: z.date(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1, { message: '请选择类别' }),
  notes: z.string().optional(),
});

const TransactionForm: React.FC<TransactionFormProps> = ({
  open,
  onClose,
  onSave,
  categories,
  editTransaction,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      date: new Date(),
      type: 'expense' as TransactionType,
      categoryId: '',
      notes: '',
    },
  });

  // Set form values when editing a transaction
  useEffect(() => {
    if (editTransaction) {
      form.reset({
        amount: editTransaction.amount,
        date: new Date(editTransaction.date),
        type: editTransaction.type,
        categoryId: editTransaction.categoryId,
        notes: editTransaction.notes,
      });
    } else {
      form.reset({
        amount: 0,
        date: new Date(),
        type: 'expense',
        categoryId: '',
        notes: '',
      });
    }
  }, [editTransaction, form]);

  // Filter categories by transaction type
  const filteredCategories = categories.filter(
    (category) => category.type === form.watch('type')
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const transaction: Transaction = {
      id: editTransaction?.id || generateId(),
      amount: values.amount,
      date: values.date.toISOString(),
      type: values.type,
      categoryId: values.categoryId,
      notes: values.notes || '',
    };
    onSave(transaction);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md animate-slide-up">
        <DialogHeader>
          <DialogTitle>
            {editTransaction ? '编辑交易' : '新增交易'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>交易类型</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value: TransactionType) => {
                        field.onChange(value);
                        // Reset category when type changes
                        form.setValue('categoryId', '');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择交易类型" />
                      </SelectTrigger>
                      <SelectContent className="min-w-[8rem]">
                        <SelectItem value="income">收入</SelectItem>
                        <SelectItem value="expense">支出</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>金额</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>日期</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "yyyy-MM-dd")
                          ) : (
                            <span>选择日期</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>类别</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择类别" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="添加备注（可选）"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
