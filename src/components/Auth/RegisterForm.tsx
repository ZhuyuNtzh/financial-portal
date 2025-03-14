
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  password: z.string().min(6, { message: '密码长度至少为6位' }),
  confirmPassword: z.string().min(6, { message: '密码长度至少为6位' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    // Check if user already exists
    const usersJson = localStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    const userExists = users.some((user: any) => user.email === values.email);
    
    if (userExists) {
      toast.error('该邮箱已注册');
      return;
    }
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      email: values.email,
      password: values.password,
    };
    
    // Save user to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set current user
    localStorage.setItem('currentUser', JSON.stringify({ id: newUser.id, email: newUser.email }));
    
    toast.success('注册成功');
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder="请输入邮箱" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input type="password" placeholder="请输入密码" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认密码</FormLabel>
              <FormControl>
                <Input type="password" placeholder="请再次输入密码" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">注册</Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
