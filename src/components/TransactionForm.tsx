
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { Category, Transaction, TransactionType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import TransactionTypeSelector from './transaction/TransactionTypeSelector';
import AmountInput from './transaction/AmountInput';
import DateTimePicker from './transaction/DateTimePicker';
import CategorySelector from './transaction/CategorySelector';
import NotesInput from './transaction/NotesInput';
import DialogFooterButtons from './transaction/DialogFooterButtons';
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
  time: z.string(),
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
      time: format(new Date(), 'HH:mm'),
      type: 'expense' as TransactionType,
      categoryId: '',
      notes: '',
    },
  });

  // Set form values when editing a transaction
  useEffect(() => {
    if (editTransaction) {
      const transactionDate = new Date(editTransaction.date);
      form.reset({
        amount: editTransaction.amount,
        date: transactionDate,
        time: format(transactionDate, 'HH:mm'),
        type: editTransaction.type,
        categoryId: editTransaction.categoryId,
        notes: editTransaction.notes,
      });
    } else {
      form.reset({
        amount: 0,
        date: new Date(),
        time: format(new Date(), 'HH:mm'),
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
    // Combine date and time
    const dateTime = new Date(values.date);
    const [hours, minutes] = values.time.split(':').map(Number);
    dateTime.setHours(hours, minutes);

    const transaction: Transaction = {
      id: editTransaction?.id || generateId(),
      amount: values.amount,
      date: dateTime.toISOString(),
      type: values.type,
      categoryId: values.categoryId,
      notes: values.notes || '',
    };
    onSave(transaction);
    onClose();
  };

  const handleTypeChange = (type: TransactionType) => {
    // Reset category when type changes
    form.setValue('categoryId', '');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md animate-slide-up">
        <DialogHeader>
          <DialogTitle>
            {editTransaction ? '编辑交易' : '新增交易'}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TransactionTypeSelector onTypeChange={handleTypeChange} />
              <AmountInput />
              <DateTimePicker />
              <CategorySelector categories={filteredCategories} />
              <NotesInput />
              <DialogFooterButtons onCancel={onClose} />
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
