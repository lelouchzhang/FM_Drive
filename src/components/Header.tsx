import React from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { signOutUser } from '@/lib/actions/user.actions';
import Search from './Search';
import FileUploader from './FileUploader';

const Header = ({ ownerId, accountId }: { ownerId: string; accountId: string }) => {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader ownerId={ownerId} accountId={accountId} />
        <form
          action={async () => {
            'use server';
            await signOutUser();
          }}
        >
          <Button type="submit" className="sign-out-button">
            <Image
              src="/assets/icons/logout.svg"
              alt="logout logo"
              width={24}
              height={24}
              className="w-6"
            />
          </Button>
        </form>
      </div>
    </header>
  );
};

export default Header;
