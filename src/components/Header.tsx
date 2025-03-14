
import React from 'react';
import { PlusCircle, BarChart3, List, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface HeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onNewTransaction: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewTransaction
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('已成功退出登录');
  };

  return (
    <header className="sticky top-0 z-10 w-full px-6 py-4 glass-panel animate-fade-in">
      <div className="container flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">财务记账</h1>
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              ({user.email})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Tabs value={activeTab} onValueChange={onTabChange} className="hidden sm:block">
            <TabsList className="grid w-60 grid-cols-2">
              <TabsTrigger value="transactions" className="flex items-center">
                <List className="w-4 h-4 mr-2" />
                <span>交易明细</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span>统计分析</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            onClick={onNewTransaction}
            className={cn(
              "transition-all duration-300",
              "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            <span>新增交易</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleLogout} 
            title="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="container mt-3 sm:hidden max-w-screen-xl mx-auto">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions" className="flex items-center justify-center">
              <List className="w-4 h-4 mr-2" />
              <span>交易明细</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center justify-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span>统计分析</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};

export default Header;
