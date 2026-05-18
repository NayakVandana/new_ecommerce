import Dropdown from '@/Components/Dropdown';
import { BagIcon, UserIcon, userFirstName, userInitials } from '@/Components/store/StoreHeaderIcons';
import {
    storeUserMenuAvatar,
    storeUserMenuDivider,
    storeUserMenuDropdown,
    storeUserMenuItem,
    storeUserMenuTrigger,
} from '@/store/storeTheme';
import { Link } from '@inertiajs/react';
import type { ComponentType, ReactNode } from 'react';

type IconProps = { className?: string };

function ChevronDownIcon({ className = 'h-4 w-4' }: IconProps) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    );
}

function TagIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
    );
}

function LogoutIcon({ className = 'h-5 w-5' }: IconProps) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
        </svg>
    );
}

function MenuItem({
    href,
    icon: Icon,
    children,
    onClick,
}: {
    href: string;
    icon: ComponentType<IconProps>;
    children: ReactNode;
    onClick?: () => void;
}) {
    return (
        <Link href={href} className={storeUserMenuItem} onClick={onClick}>
            <Icon className="h-5 w-5 shrink-0 text-stone-400 dark:text-stone-500" />
            <span>{children}</span>
        </Link>
    );
}

export default function UserAccountMenu({
    name,
    onLogout,
}: {
    name: string;
    onLogout: () => void | Promise<void>;
}) {
    const firstName = userFirstName(name);
    const initials = userInitials(name);

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    className={storeUserMenuTrigger}
                    aria-haspopup="menu"
                    aria-label={`Account menu for ${name}`}
                >
                    <span className={storeUserMenuAvatar} aria-hidden>
                        {initials}
                    </span>
                    <span className="hidden truncate sm:inline">{firstName}</span>
                    <ChevronDownIcon className="hidden h-4 w-4 shrink-0 text-stone-400 sm:block dark:text-stone-500" />
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content width="56" contentClasses={storeUserMenuDropdown}>
                <nav aria-label="Account">
                    <MenuItem href={route('user.orders.index')} icon={BagIcon}>
                        Orders
                    </MenuItem>
                    <MenuItem href={route('user.recently-viewed.index')} icon={TagIcon}>
                        Recently viewed
                    </MenuItem>
                    <MenuItem href={route('profile.edit')} icon={UserIcon}>
                        Profile
                    </MenuItem>

                    <div className={storeUserMenuDivider} role="separator" />

                    <button type="button" className={storeUserMenuItem} onClick={() => void onLogout()}>
                        <LogoutIcon className="h-5 w-5 shrink-0 text-stone-400 dark:text-stone-500" />
                        <span>Logout</span>
                    </button>
                </nav>
            </Dropdown.Content>
        </Dropdown>
    );
}
