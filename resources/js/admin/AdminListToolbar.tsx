import {
    adminInput,
    adminPageToolbar,
    adminPrimaryBtn,
    adminToolbarHelpText,
} from '@/admin/adminTheme';
import { Link } from '@inertiajs/react';

type Props = {
    description?: string;
    addHref: string;
    addLabel: string;
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
};

export default function AdminListToolbar({
    description,
    addHref,
    addLabel,
    searchPlaceholder,
    searchValue,
    onSearchChange,
}: Props) {
    return (
        <div className={adminPageToolbar}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
                {description ? (
                    <p
                        className={`max-w-full shrink-0 lg:max-w-[min(100%,20rem)] xl:max-w-md ${adminToolbarHelpText}`}
                    >
                        {description}
                    </p>
                ) : null}
                <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3 lg:flex-1">
                    <input
                        type="search"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder ?? 'Search…'}
                        autoComplete="off"
                        className={`${adminInput} box-border !mt-0 h-11 min-h-11 max-h-11 flex-1 py-2 leading-snug border-slate-200 bg-white text-slate-900 shadow-sm sm:min-w-[12rem]`}
                    />
                    <Link
                        href={addHref}
                        className={`${adminPrimaryBtn} box-border h-11 min-h-11 max-h-11 min-w-[9rem] shrink-0 !py-0 whitespace-nowrap px-6`}
                    >
                        {addLabel}
                    </Link>
                </div>
            </div>
        </div>
    );
}
