
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<string>('login');

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-background border rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold text-center mb-6">财务记账</h1>
      
      <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">登录</TabsTrigger>
          <TabsTrigger value="register">注册</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <LoginForm onSuccess={onAuthSuccess} />
        </TabsContent>
        
        <TabsContent value="register">
          <RegisterForm onSuccess={onAuthSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForm;
