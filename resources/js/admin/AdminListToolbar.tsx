import { adminSearchInput, adminToolbarAddBtn } from '@/admin/adminTheme';
import { Link } from '@inertiajs/react';

type Props = {
    addHref: string;
    addLabel: string;
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
};

export default function AdminListToolbar({
    addHref,
    addLabel,
    searchPlaceholder,
    searchValue,
    onSearchChange,
}: Props) {
    return (
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full min-w-0 md:max-w-md md:flex-1">
                <input
                    type="search"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder ?? 'Search…'}
                    autoComplete="off"
                    enterKeyHint="search"
                    className={adminSearchInput}
                />
            </div>
            <Link
                href={addHref}
                className={`${adminToolbarAddBtn} w-full md:w-auto md:shrink-0`}
            >
                {addLabel}
            </Link>
        </div>
    );
}