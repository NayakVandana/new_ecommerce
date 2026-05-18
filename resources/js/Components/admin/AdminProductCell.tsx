import { adminTableMobileMeta, adminTableTdStrong } from '@/admin/adminTheme';
import type { ReactNode } from 'react';

export function AdminProductThumb({
    src,
    name,
}: {
    src?: string | null;
    name: string;
}) {
    return (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200/90 bg-gradient-to-br from-violet-100 to-indigo-100 shadow-sm ring-1 ring-white dark:border-slate-600 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700">
            {src ? (
                <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            ) : (
                <span
                    className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-wide text-violet-700/90 dark:text-violet-300/90"
                    aria-hidden
                >
                    {name.trim().slice(0, 2) || '—'}
                </span>
            )}
        </div>
    );
}

type AdminProductCellProps = {
    name: string;
    thumbUrl?: string | null;
    slug?: string | null;
    meta?: ReactNode;
};

export default function AdminProductCell({
    name,
    thumbUrl,
    slug,
    meta,
}: AdminProductCellProps) {
    return (
        <div className="flex gap-3">
            <AdminProductThumb src={thumbUrl} name={name} />
            <div className="min-w-0">
                <div className={`font-semibold ${adminTableTdStrong}`}>{name}</div>
                {slug ? (
                    <div className="mt-0.5 truncate text-xs font-medium text-slate-600 dark:text-slate-400">
                        {slug}
                    </div>
                ) : null}
                {meta ? (
                    <p className={`${adminTableMobileMeta} mt-0.5`}>{meta}</p>
                ) : null}
            </div>
        </div>
    );
}
