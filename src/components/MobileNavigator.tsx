'use client';

import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { navItems } from '@/constants';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import FileUploader from './FileUploader';
import { cn } from '@/lib/utils';
import { signOutUser } from '@/lib/actions/user.actions';

interface Props {
  $id: string;
  accountId: string;
  fullName: string;
  avatarUrl: string;
  email: string;
}

const MobileNavigator = ({ $id: ownerId, accountId, fullName, avatarUrl, email }: Props) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="mobile-header">
      {/* <Image
        src="/assets/icons/logo-full-brand.svg"
        alt="logo"
        width={120}
        height={52}
        className="h-auto"
        priority
      /> */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image src="/assets/icons/menu.svg" alt="Search" width={30} height={30} />
        </SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetHeader>
            <SheetTitle>
              <div className="header-user">
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  width={44}
                  height={44}
                  className="header-user-avatar"
                />
                <div className="sm:hidden lg:block">
                  <p className="subtitle-2 capitalize">{fullName}</p>
                  <p className="caption">{email}</p>
                </div>
              </div>
              <Separator className="mb-4 bg-light-200/20" />
            </SheetTitle>
            {/* sr:screen reader only 用于视力障碍人士阅读网页，不加会被warning */}
            <SheetDescription className="sr-only">导航菜单</SheetDescription>
          </SheetHeader>
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map(({ url, name, icon }) => {
                return (
                  <Link href={url} key={name} className="lg:w-full">
                    <li className={cn('mobile-nav-item', pathname === url && 'shad-active')}>
                      <Image
                        src={icon}
                        alt={name}
                        width={24}
                        height={24}
                        className={cn('nav-icon', pathname === url && 'nav-icon-active')}
                      />
                      <p>{name}</p>
                    </li>
                  </Link>
                );
              })}
            </ul>
          </nav>

          <Separator className="bg-light-200/20 my-5" />
          <div className="flex flex-col justify-between gap-5">
            <FileUploader ownerId={ownerId} accountId={accountId} />
            <Button
              type="submit"
              className="mobile-sign-out-button"
              onClick={async () => await signOutUser()}
            >
              <Image src="/assets/icons/logout.svg" alt="logout logo" width={24} height={24} />
              <p>退出</p>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigator;
