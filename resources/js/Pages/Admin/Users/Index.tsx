import AdminListToolbar from '@/admin/AdminListToolbar';
import {
    adminBadgeNo,
    adminBadgeYes,
    adminErrorBanner,
    adminListPageWrap,
    adminMutedText,
    adminPaginationBtn,
    adminPaginationRow,
    adminSearchInput,
    adminTable,
    adminTableCellHiddenMd,
    adminTableCellHiddenSm,
    adminTableHead,
    adminTableMobileMeta,
    adminTableRowHover,
    adminTableTd,
    adminTableTdMuted,
    adminTableTdStrong,
    adminTableTh,
    adminTableWrap,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
    type LaravelPaginator,
} from '@/api/adminClient';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type UserRow = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
    is_admin: boolean;
    email_verified_at: string | null;
    created_at: string;
};

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }
    const d = new Date(value);

    return Number.isNaN(d.getTime())
        ? '—'
        : d.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          });
}

function statusBadge(status: string) {
    const active = status === 'active';

    return (
        <span className={active ? adminBadgeYes : adminBadgeNo}>
            {status}
        </span>
    );
}

export default function Index() {
    const [page, setPage] = useState(1);
    const [paginator, setPaginator] =
        useState<LaravelPaginator<UserRow> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const t = window.setTimeout(() => {
            setKeyword(searchInput.trim());
        }, 320);

        return () => window.clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [keyword, statusFilter]);

    const load = useCallback(
        (p: number) => {
            setLoading(true);
            adminApiPost<AdminApiEnvelope<LaravelPaginator<UserRow>>>(
                '/users/list',
                {
                    per_page: 15,
                    current_page: p,
                    ...(keyword ? { keyword } : {}),
                    ...(statusFilter ? { status: statusFilter } : {}),
                },
            )
                .then((res) => {
                    if (res.success && res.data) {
                        setPaginator(res.data);
                        setError(null);
                    } else {
                        setError(res.message || 'Failed to load users.');
                    }
                })
                .catch(() => setError('Failed to load users.'))
                .finally(() => setLoading(false));
        },
        [keyword, statusFilter],
    );

    useEffect(() => {
        load(page);
    }, [page, load]);

    return (
        <>
            <Head title="Admin users" />
            <AdminLayout heading="Users">
                <div className={adminListPageWrap}>
                    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <AdminListToolbar
                            searchPlaceholder="Search name, email, or phone…"
                            searchValue={searchInput}
                            onSearchChange={setSearchInput}
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`${adminSearchInput} w-full md:w-auto md:min-w-[10rem]`}
                            aria-label="Filter by status"
                        >
                            <option value="">All statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    {error && <div className={adminErrorBanner}>{error}</div>}

                    <div className={adminTableWrap}>
                        <table className={adminTable}>
                            <thead className={adminTableHead}>
                                <tr>
                                    <th className={adminTableTh}>User</th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenSm}`}
                                    >
                                        Phone
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Role
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Status
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Verified
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenSm}`}
                                    >
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className={`px-5 py-10 text-center ${adminMutedText}`}
                                        >
                                            Loading…
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    paginator?.data.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={adminTableRowHover}
                                        >
                                            <td className={adminTableTd}>
                                                <div
                                                    className={
                                                        adminTableTdStrong
                                                    }
                                                >
                                                    {row.name}
                                                    {row.is_admin ? (
                                                        <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                                                            Admin
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p
                                                    className={`${adminTableMobileMeta} text-slate-600 dark:text-slate-400`}
                                                >
                                                    {row.email}
                                                </p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 md:hidden">
                                                    {statusBadge(row.status)}
                                                    <span className="text-xs text-slate-500">
                                                        {row.role}
                                                    </span>
                                                </div>
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenSm}`}
                                            >
                                                {row.phone ?? '—'}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} capitalize ${adminTableCellHiddenMd}`}
                                            >
                                                {row.role}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableCellHiddenMd}`}
                                            >
                                                {statusBadge(row.status)}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableCellHiddenMd}`}
                                            >
                                                {row.email_verified_at ? (
                                                    <span
                                                        className={
                                                            adminBadgeYes
                                                        }
                                                    >
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={
                                                            adminBadgeNo
                                                        }
                                                    >
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenSm}`}
                                            >
                                                {formatDate(row.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                {!loading &&
                                    paginator &&
                                    paginator.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className={`px-5 py-10 text-center ${adminMutedText}`}
                                            >
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>

                    {paginator && paginator.last_page > 1 && (
                        <div className={adminPaginationRow}>
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                className={adminPaginationBtn}
                            >
                                Previous
                            </button>
                            <span className="text-center text-slate-600 dark:text-slate-400">
                                Page {paginator.current_page} of{' '}
                                {paginator.last_page}
                            </span>
                            <button
                                type="button"
                                disabled={page >= paginator.last_page}
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(paginator.last_page, p + 1),
                                    )
                                }
                                className={adminPaginationBtn}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
