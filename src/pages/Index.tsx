
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Transaction, Category } from '@/types';
import Header from '@/components/Header';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import AnalyticsView from '@/components/AnalyticsView';
import { 
  getTransactions, 
  saveTransactions, 
  getCategories,
  saveCategories,
  defaultCategories
} from '@/utils/transactionUtils';

const Index = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editTransaction, setEditTransaction] = useState<Transaction | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load transactions and categories from localStorage
  useEffect(() => {
    const loadedTransactions = getTransactions();
    const loadedCategories = getCategories();
    
    setTransactions(loadedTransactions);
    setCategories(loadedCategories);
    
    // Initialize categories if none exist
    if (loadedCategories.length === 0) {
      saveCategories(defaultCategories);
      setCategories(defaultCategories);
    }
  }, []);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Open transaction form for new transaction
  const handleNewTransaction = () => {
    setEditTransaction(undefined);
    setIsFormOpen(true);
  };

  // Open transaction form for editing
  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setIsFormOpen(true);
  };

  // Save transaction (new or edited)
  const handleSaveTransaction = (transaction: Transaction) => {
    const isEdit = transactions.some(t => t.id === transaction.id);
    let updatedTransactions: Transaction[];
    
    if (isEdit) {
      updatedTransactions = transactions.map(t => 
        t.id === transaction.id ? transaction : t
      );
      toast.success('交易已更新');
    } else {
      updatedTransactions = [...transactions, transaction];
      toast.success('交易已添加');
    }
    
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
  };

  // Delete transaction
  const handleDeleteTransaction = (transactionId: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    toast.success('交易已删除');
  };

  return (
    <div className="min-h-screen bg-background font-sans animate-fade-in">
      <Header 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onNewTransaction={handleNewTransaction} 
      />
      
      <main className="container max-w-screen-xl py-6 px-4 sm:px-6">
        {activeTab === 'transactions' ? (
          <TransactionList 
            transactions={transactions}
            categories={categories}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        ) : (
          <AnalyticsView 
            transactions={transactions}
            categories={categories}
          />
        )}
      </main>
      
      <TransactionForm 
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTransaction}
        categories={categories}
        editTransaction={editTransaction}
      />
    </div>
  );
};

export default Index;
