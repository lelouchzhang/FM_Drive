'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { avatarPlaceholderUrl, navItems } from '@/constants';
import { cn } from '@/lib/utils';

const Sidebar = ({
  fullName,
  email,
  avatarUrl,
}: {
  fullName: string;
  email: string;
  avatarUrl: string;
}) => {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/">
        <Image
          src="/assets/icons/logo-full-brand.svg"
          alt="logo"
          width={180}
          height={40}
          className="hidden lg:block"
          priority
        />
        <Image
          src="assets/icons/logo-brand.svg"
          alt="logo"
          width={52}
          height={52}
          className="lg:hidden"
        />
      </Link>
      <nav className="sidebar-nav">
        <ul className="flex flex-1 flex-col gap-6">
          {navItems.map(({ url, name, icon }) => {
            return (
              <Link href={url} key={name} className="lg:w-full">
                <li className={cn('sidebar-nav-item', pathname === url && 'shad-active')}>
                  <Image
                    src={icon}
                    alt={name}
                    width={24}
                    height={24}
                    className={cn('nav-icon', pathname === url && 'nav-icon-active')}
                  />
                  <p className="hidden lg:block">{name}</p>
                </li>
              </Link>
            );
          })}
        </ul>
      </nav>

      <Image
        src="/assets/images/files-2.png"
        alt="logo"
        width={506}
        height={418}
        className="w-full"
        priority
      />
      <div className="sidebar-user-info">
        <Image
          src={avatarUrl || avatarPlaceholderUrl}
          alt="avatar"
          width={40}
          height={40}
          className="sidebar-user-avatar"
        />
        <div className="hidden lg:block">
          <p className="subtitle-2">{fullName}</p>
          <p className="caption">{email}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
