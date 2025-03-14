
import React from 'react';
import { cn } from '@/lib/utils';
import { Category } from '@/types';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className }) => {
  const baseClass = category.type === 'income' ? 'income-badge' : 'expense-badge';
  
  return (
    <span className={cn(baseClass, className)}>
      {category.name}
    </span>
  );
};

export default CategoryBadge;
