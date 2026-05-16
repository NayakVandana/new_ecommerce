import { UserIcon, userFirstName } from '@/Components/store/StoreHeaderIcons';
import { storeHeaderAccount } from '@/store/storeTheme';
import { Link } from '@inertiajs/react';

export default function AccountHeaderButton({ name }: { name: string }) {
    const label = userFirstName(name);

    return (
        <Link href={route('dashboard')} className={storeHeaderAccount} title={`Account — ${name}`}>
            <UserIcon className="h-4 w-4 shrink-0" />
            <span className="max-w-[5.5rem] truncate sm:max-w-[7rem]">{label}</span>
        </Link>
    );
}
