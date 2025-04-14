
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionType } from '@/types';
import { useFormContext } from 'react-hook-form';

interface TransactionTypeSelectorProps {
  onTypeChange: (value: TransactionType) => void;
}

const TransactionTypeSelector: React.FC<TransactionTypeSelectorProps> = ({ 
  onTypeChange 
}) => {
  const form = useFormContext();
  
  return (
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
                onTypeChange(value);
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
  );
};

export default TransactionTypeSelector;
