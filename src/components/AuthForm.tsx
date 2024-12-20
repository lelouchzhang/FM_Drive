'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createAccount, signInUser } from '@/lib/actions/user.actions';
import OTPModal from './OTPModal';

type FormType = 'sign-in' | 'sign-up';

// 1. 修改form schema

const myformSchema = (type: FormType) => {
  return z.object({
    email: z.string().email({ message: '请输入可用邮箱,格式为xxx@xxx.xxx' }),
    fullName:
      type === 'sign-up'
        ? z.string().min(2, { message: '昵称不应小于两个字符.' }).max(50)
        : z.string().optional(),
  });
};
// 2. form details
export const AuthForm = ({ type }: { type: FormType }) => {
  // ...
  const [isLoading, setIsLoading] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [accountId, setAccountId] = useState(null);
  // a. Define your form.
  const formSchema = myformSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      fullName: '',
    },
  });

  // b. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrMessage('');
    try {
      const user =
        type === 'sign-up'
          ? await createAccount({
              fullName: values.fullName || '',
              email: values.email,
            })
          : await signInUser({ email: values.email });
      setAccountId(user.accountId);
    } catch (error) {
      setErrMessage('发生错误,请联系管理员或稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">{type === 'sign-in' ? '登录' : '注册'}</h1>
          {type === 'sign-up' && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">昵称</FormLabel>
                    <FormControl>
                      <Input placeholder="在此处输入你的昵称" {...field} className="shad-input" />
                    </FormControl>
                  </div>
                  {/* <FormDescription>This is your public display name.</FormDescription> */}
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">邮箱地址</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="我们会向您发送一封邮件用于验证..."
                      {...field}
                      className="shad-input"
                    />
                  </FormControl>
                </div>
                {/* <FormDescription>This is your public display name.</FormDescription> */}
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
          <Button type="submit" className="form-submit-button" disabled={isLoading}>
            {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>
          {errMessage && <p className="form-error-message">*{errMessage}</p>}
          <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <Link
              href={type === 'sign-in' ? '/sign-up' : '/sign-in'}
              className="ml-1 font-medium text-brand"
            >
              {type === 'sign-in' ? '点我注册' : '点我登录'}
            </Link>
          </div>
        </form>
      </Form>

      {/* OTP (One Time Password) verfication */}
      {accountId && <OTPModal accountId={accountId} email={form.getValues('email')} />}
    </>
  );
};
