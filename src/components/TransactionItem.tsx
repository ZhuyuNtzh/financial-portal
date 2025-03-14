
import React from 'react';
import { format } from 'date-fns';
import { Category, Transaction } from '@/types';
import { formatCurrency } from '@/utils/transactionUtils';
import CategoryBadge from './CategoryBadge';
import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TransactionItemProps {
  transaction: Transaction;
  category: Category;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  onEdit,
  onDelete,
}) => {
  return (
    <div 
      className={cn(
        "p-4 mb-3 rounded-lg border hover-card animate-scale-in",
        "bg-card shadow-sm"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full mr-3",
            transaction.type === 'income' 
              ? "bg-income-muted text-income" 
              : "bg-expense-muted text-expense"
          )}>
            {transaction.type === 'income' ? (
              <ArrowUp className="w-5 h-5" />
            ) : (
              <ArrowDown className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center">
              <CategoryBadge category={category} />
              <span className="ml-2 text-xs text-muted-foreground">
                {format(new Date(transaction.date), 'yyyy-MM-dd HH:mm')}
              </span>
            </div>
            <p className={cn(
              "font-medium mt-1",
              transaction.type === 'income' ? "text-income" : "text-expense"
            )}>
              {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
            </p>
            {transaction.notes && (
              <p className="mt-1 text-sm text-muted-foreground">{transaction.notes}</p>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => onEdit(transaction)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
