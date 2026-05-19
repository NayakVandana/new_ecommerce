import AdminListToolbar from '@/admin/AdminListToolbar';
import {
    adminBadgeNo,
    adminBadgeYes,
    adminDangerText,
    adminErrorBanner,
    adminFormSection,
    adminFormSectionTitle,
    adminLinkAction,
    adminListPageWrap,
    adminMutedText,
    adminPaginationBtn,
    adminPaginationRow,
    adminTable,
    adminTableActionLink,
    adminTableActions,
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
import { Fragment, useCallback, useEffect, useState } from 'react';

type ContactRow = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    read_at: string | null;
    created_at: string;
};

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }
    const d = new Date(value);

    return Number.isNaN(d.getTime())
        ? '—'
        : d.toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          });
}

function excerpt(text: string, max = 72): string {
    const trimmed = text.replace(/\s+/g, ' ').trim();

    return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max)}…`;
}

export default function Index() {
    const [page, setPage] = useState(1);
    const [paginator, setPaginator] =
        useState<LaravelPaginator<ContactRow> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [markingId, setMarkingId] = useState<number | null>(null);

    useEffect(() => {
        const t = window.setTimeout(() => {
            setKeyword(searchInput.trim());
        }, 320);

        return () => window.clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        setPage(1);
    }, [keyword, unreadOnly]);

    const load = useCallback(
        (p: number) => {
            setLoading(true);
            adminApiPost<AdminApiEnvelope<LaravelPaginator<ContactRow>>>(
                '/contact-messages/contact-messages-list',
                {
                    per_page: 15,
                    current_page: p,
                    ...(keyword ? { keyword } : {}),
                    ...(unreadOnly ? { unread_only: true } : {}),
                },
            )
                .then((res) => {
                    if (res.success && res.data) {
                        setPaginator(res.data);
                        setError(null);
                    } else {
                        setError(res.message || 'Failed to load messages.');
                    }
                })
                .catch(() => setError('Failed to load messages.'))
                .finally(() => setLoading(false));
        },
        [keyword, unreadOnly],
    );

    useEffect(() => {
        load(page);
    }, [page, load]);

    const destroy = async (id: number) => {
        if (!confirm('Delete this message?')) {
            return;
        }

        try {
            const res = await adminApiPost<AdminApiEnvelope<unknown>>(
                '/contact-messages/contact-message-destroy',
                { id },
            );
            if (res.success) {
                if (expandedId === id) {
                    setExpandedId(null);
                }
                load(page);
            } else {
                setError(res.message || 'Could not delete.');
            }
        } catch {
            setError('Could not delete.');
        }
    };

    const markRead = async (id: number) => {
        setMarkingId(id);
        try {
            const res = await adminApiPost<AdminApiEnvelope<ContactRow>>(
                '/contact-messages/contact-message-mark-read',
                { id },
            );
            if (res.success && res.data) {
                setPaginator((prev) => {
                    if (!prev) {
                        return prev;
                    }

                    return {
                        ...prev,
                        data: prev.data.map((row) =>
                            row.id === id ? { ...row, read_at: res.data!.read_at } : row,
                        ),
                    };
                });
            } else {
                setError(res.message || 'Could not mark as read.');
            }
        } catch {
            setError('Could not mark as read.');
        } finally {
            setMarkingId(null);
        }
    };

    return (
        <>
            <Head title="Contact messages" />
            <AdminLayout heading="Contact messages">
                <div className={adminListPageWrap}>
                    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <AdminListToolbar
                            searchPlaceholder="Search name, email, subject, message…"
                            searchValue={searchInput}
                            onSearchChange={setSearchInput}
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <input
                                type="checkbox"
                                checked={unreadOnly}
                                onChange={(e) => setUnreadOnly(e.target.checked)}
                                className="rounded border-slate-300"
                            />
                            Unread only
                        </label>
                    </div>

                    {error ? <div className={adminErrorBanner}>{error}</div> : null}

                    <div className={adminTableWrap}>
                        <table className={adminTable}>
                            <thead className={adminTableHead}>
                                <tr>
                                    <th className={adminTableTh}>From</th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenMd}`}
                                    >
                                        Subject
                                    </th>
                                    <th className={adminTableTh}>Preview</th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenSm}`}
                                    >
                                        Status
                                    </th>
                                    <th
                                        className={`${adminTableTh} ${adminTableCellHiddenSm}`}
                                    >
                                        Received
                                    </th>
                                    <th className={adminTableTh}>
                                        <span className="sr-only">Actions</span>
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
                                    paginator?.data.map((row) => {
                                        const unread = !row.read_at;
                                        const expanded = expandedId === row.id;

                                        return (
                                            <Fragment key={row.id}>
                                                <tr
                                                    className={`${adminTableRowHover} cursor-pointer`}
                                                    onClick={() =>
                                                        setExpandedId(expanded ? null : row.id)
                                                    }
                                                >
                                                    <td className={adminTableTd}>
                                                        <div className={adminTableTdStrong}>
                                                            {row.name}
                                                            {unread ? (
                                                                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                                                    New
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <p
                                                            className={`${adminTableMobileMeta} text-slate-600 dark:text-slate-400`}
                                                        >
                                                            <a
                                                                href={`mailto:${row.email}`}
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                                className="hover:underline"
                                                            >
                                                                {row.email}
                                                            </a>
                                                            {row.phone ? (
                                                                <span className="ml-2">
                                                                    · {row.phone}
                                                                </span>
                                                            ) : null}
                                                        </p>
                                                    </td>
                                                    <td
                                                        className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenMd}`}
                                                    >
                                                        {row.subject ?? '—'}
                                                    </td>
                                                    <td
                                                        className={`${adminTableTd} ${adminTableTdMuted}`}
                                                    >
                                                        {excerpt(row.message)}
                                                    </td>
                                                    <td
                                                        className={`${adminTableTd} ${adminTableCellHiddenSm}`}
                                                    >
                                                        {unread ? (
                                                            <span className={adminBadgeNo}>
                                                                Unread
                                                            </span>
                                                        ) : (
                                                            <span className={adminBadgeYes}>
                                                                Read
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td
                                                        className={`${adminTableTd} ${adminTableTdMuted} ${adminTableCellHiddenSm}`}
                                                    >
                                                        {formatDate(row.created_at)}
                                                    </td>
                                                    <td className={adminTableTd}>
                                                        <div
                                                            className={adminTableActions}
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setExpandedId(
                                                                        expanded
                                                                            ? null
                                                                            : row.id,
                                                                    )
                                                                }
                                                                className={`${adminLinkAction} ${adminTableActionLink}`}
                                                            >
                                                                {expanded ? 'Hide' : 'View'}
                                                            </button>
                                                            {unread ? (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        markingId ===
                                                                        row.id
                                                                    }
                                                                    onClick={() =>
                                                                        void markRead(row.id)
                                                                    }
                                                                    className={`${adminLinkAction} ${adminTableActionLink}`}
                                                                >
                                                                    {markingId === row.id
                                                                        ? '…'
                                                                        : 'Mark read'}
                                                                </button>
                                                            ) : null}
                                                            <a
                                                                href={`mailto:${row.email}?subject=${encodeURIComponent(
                                                                    row.subject
                                                                        ? `Re: ${row.subject}`
                                                                        : 'Re: Your message',
                                                                )}`}
                                                                className={`${adminLinkAction} ${adminTableActionLink}`}
                                                            >
                                                                Reply
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void destroy(row.id)
                                                                }
                                                                className={`${adminDangerText} ${adminTableActionLink} hover:bg-red-50 dark:hover:bg-red-950/40`}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expanded ? (
                                                    <tr>
                                                        <td
                                                            colSpan={6}
                                                            className="bg-slate-50/80 px-5 py-4 dark:bg-slate-900/50"
                                                        >
                                                            <div className={adminFormSection}>
                                                                <p
                                                                    className={
                                                                        adminFormSectionTitle
                                                                    }
                                                                >
                                                                    {row.subject ||
                                                                        'Message'}
                                                                </p>
                                                                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                                                                    {row.message}
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : null}
                                            </Fragment>
                                        );
                                    })}
                                {!loading &&
                                    paginator &&
                                    paginator.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className={`px-5 py-10 text-center ${adminMutedText}`}
                                            >
                                                No contact messages yet.
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
                                Page {paginator.current_page} of {paginator.last_page}
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
