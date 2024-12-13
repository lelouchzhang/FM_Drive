import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNavigator from '@/components/MobileNavigator';
import React from 'react';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';

// 页面因使用了cookie，不能静态渲染，所以需要动态渲染-force
export const dynamic = 'force-dynamic';

const layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/sign-in');
  }
  return (
    <main className="flex h-screen">
      <Sidebar {...currentUser} />
      <section className="flex flex-1 h-full flex-col">
        <Header userId={currentUser.$id} accountId={currentUser.accountId} />
        <MobileNavigator {...currentUser} />
        <div className="main-content">{children}</div>
      </section>
      <Toaster />
    </main>
  );
};

export default layout;
