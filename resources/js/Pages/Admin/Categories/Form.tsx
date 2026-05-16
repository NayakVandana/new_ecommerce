import {
    adminBackLink,
    adminCancelBtn,
    adminCheckbox,
    adminDangerText,
    adminDarkSubmitBtn,
    adminDividerTop,
    adminErrorBanner,
    adminFormCard,
    adminStackPageWrap,
    adminHighlightPanel,
    adminInput,
    adminLabel,
    adminLinkAction,
    adminMutedText,
    adminNestedTableWrap,
    adminPrimaryBtn,
    adminSectionCard,
    adminSmallHeading,
    adminSmallMuted,
    adminTable,
    adminTableHead,
    adminTableRowHover,
    adminTableTdMuted,
    adminTableTdStrong,
    adminTableTh,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
} from '@/api/adminClient';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps as AppPageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

type SubcategoryRow = {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
};

type Category = {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    subcategories?: SubcategoryRow[];
};

type PageProps = AppPageProps<{
    categoryId: number | null;
}>;

export default function Form() {
    const { categoryId } = usePage<PageProps>().props;

    const [existing, setExisting] = useState<Category | null>(null);
    const [loading, setLoading] = useState(categoryId !== null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const reloadCategory = useCallback(async () => {
        if (!categoryId) {
            return;
        }
        const res = await adminApiPost<AdminApiEnvelope<Category>>(
            '/categories/show',
            { id: categoryId },
        );
        if (res.success && res.data) {
            setExisting(res.data);
        }
    }, [categoryId]);

    useEffect(() => {
        if (!categoryId) {
            setExisting(null);
            setLoading(false);
            setLoadError(null);

            return;
        }

        let cancelled = false;

        (async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const res = await adminApiPost<AdminApiEnvelope<Category>>(
                    '/categories/show',
                    { id: categoryId },
                );
                if (cancelled) {
                    return;
                }
                if (!res.success || !res.data) {
                    setLoadError(res.message || 'Could not load category.');

                    return;
                }
                setExisting(res.data);
            } catch {
                if (!cancelled) {
                    setLoadError('Could not load category.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [categoryId]);

    const initial = useMemo(
        () => ({
            name: existing?.name ?? '',
            slug: existing?.slug ?? '',
            image_url: existing?.image_url ?? '',
            description: existing?.description ?? '',
            is_active: existing?.is_active ?? true,
            sort_order: existing?.sort_order ?? 0,
        }),
        [existing],
    );

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState(0);

    useEffect(() => {
        setName(initial.name);
        setSlug(initial.slug);
        setImageUrl(initial.image_url);
        setDescription(initial.description);
        setIsActive(initial.is_active);
        setSortOrder(initial.sort_order);
    }, [initial]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [subName, setSubName] = useState('');
    const [subSlug, setSubSlug] = useState('');
    const [subSort, setSubSort] = useState(0);
    const [subProcessing, setSubProcessing] = useState(false);

    const [editingSub, setEditingSub] = useState<SubcategoryRow | null>(null);

    const submitCategory = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        try {
            const payload: Record<string, unknown> = {
                name,
                slug: slug.trim() || null,
                image_url: imageUrl.trim() || null,
                description: description.trim() || null,
                is_active: isActive,
                sort_order: Number(sortOrder) || 0,
            };

            if (existing) {
                const res = await adminApiPost<AdminApiEnvelope<Category>>(
                    '/categories/update',
                    { id: existing.id, ...payload },
                );
                if (!res.success) {
                    setError(res.message || 'Could not save.');

                    return;
                }
                router.visit(route('admin.categories.index'));
            } else {
                const res = await adminApiPost<AdminApiEnvelope<Category>>(
                    '/categories/store',
                    payload,
                );
                if (!res.success || !res.data?.id) {
                    setError(res.message || 'Could not save.');

                    return;
                }
                router.visit(route('admin.categories.edit', res.data.id));
            }
        } catch {
            setError('Could not save.');
        } finally {
            setProcessing(false);
        }
    };

    const addSubcategory = async (e: FormEvent) => {
        e.preventDefault();
        if (!existing) return;
        setSubProcessing(true);
        setError(null);
        try {
            const res = await adminApiPost<AdminApiEnvelope<SubcategoryRow>>(
                '/subcategories/store',
                {
                    category_id: existing.id,
                    name: subName,
                    slug: subSlug.trim() || null,
                    sort_order: subSort,
                    is_active: true,
                },
            );
            if (!res.success) {
                setError(res.message || 'Could not add subcategory.');

                return;
            }
            setSubName('');
            setSubSlug('');
            setSubSort(0);
            await reloadCategory();
        } catch {
            setError('Could not add subcategory.');
        } finally {
            setSubProcessing(false);
        }
    };

    const saveEditedSub = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingSub) return;
        setSubProcessing(true);
        setError(null);
        try {
            const res = await adminApiPost<AdminApiEnvelope<SubcategoryRow>>(
                '/subcategories/update',
                {
                    id: editingSub.id,
                    name: editingSub.name,
                    slug: editingSub.slug.trim() || null,
                    sort_order: editingSub.sort_order,
                    is_active: editingSub.is_active,
                },
            );
            if (!res.success) {
                setError(res.message || 'Could not update subcategory.');

                return;
            }
            setEditingSub(null);
            await reloadCategory();
        } catch {
            setError('Could not update subcategory.');
        } finally {
            setSubProcessing(false);
        }
    };

    const destroySub = async (id: number) => {
        if (!confirm('Delete this subcategory?')) return;
        setSubProcessing(true);
        setError(null);
        try {
            const res = await adminApiPost<AdminApiEnvelope<unknown>>(
                '/subcategories/destroy',
                { id },
            );
            if (!res.success) {
                setError(res.message || 'Could not delete.');

                return;
            }
            if (editingSub?.id === id) setEditingSub(null);
            await reloadCategory();
        } catch {
            setError('Could not delete.');
        } finally {
            setSubProcessing(false);
        }
    };

    const subs = existing?.subcategories ?? [];

    const subTh = `${adminTableTh} px-3 py-2`;

    return (
        <>
            <Head title={existing ? 'Edit category' : 'New category'} />
            <AdminLayout heading={existing ? 'Edit category' : 'New category'}>
                <div className={adminStackPageWrap}>
                <div>
                    <Link
                        href={route('admin.categories.index')}
                        className={adminBackLink}
                    >
                        ← Categories
                    </Link>
                </div>

                {(loadError || error) && (
                    <div className={adminErrorBanner}>{loadError ?? error}</div>
                )}

                {loading && <p className={adminMutedText}>Loading…</p>}

                {!loading && !loadError && (
                <>
                <form
                    onSubmit={(e) => void submitCategory(e)}
                    className={adminFormCard}
                >
                    <div>
                        <label htmlFor="name" className={adminLabel}>
                            Name
                        </label>
                        <input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={adminInput}
                        />
                    </div>
                    <div>
                        <label htmlFor="slug" className={adminLabel}>
                            Slug (optional)
                        </label>
                        <input
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className={adminInput}
                        />
                    </div>
                    <div>
                        <label htmlFor="image_url" className={adminLabel}>
                            Image URL
                        </label>
                        <input
                            id="image_url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className={adminInput}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className={adminLabel}>
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className={adminInput}
                        />
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                        <div className="min-w-0 shrink-0">
                            <label htmlFor="sort_order" className={adminLabel}>
                                Sort order
                            </label>
                            <input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={sortOrder}
                                onChange={(e) =>
                                    setSortOrder(Number(e.target.value))
                                }
                                className={`${adminInput} max-w-full sm:max-w-[8rem]`}
                            />
                        </div>
                        <label className="flex items-center gap-2 pb-1 sm:pb-2">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className={adminCheckbox}
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                Active
                            </span>
                        </label>
                    </div>
                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:flex-wrap">
                        <button
                            type="submit"
                            disabled={processing}
                            className={adminPrimaryBtn}
                        >
                            {processing ? 'Saving…' : existing ? 'Save' : 'Create'}
                        </button>
                        <Link
                            href={route('admin.categories.index')}
                            className={`inline-flex items-center justify-center ${adminCancelBtn}`}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>

                {existing && (
                    <div className={adminSectionCard}>
                        <h2 className={adminSmallHeading}>Subcategories</h2>
                        <p className={adminSmallMuted}>
                            Used when assigning products to a category segment.
                        </p>

                        <div className={adminNestedTableWrap}>
                            <table className={adminTable}>
                                <thead className={adminTableHead}>
                                    <tr>
                                        <th className={subTh}>Name</th>
                                        <th className={subTh}>Slug</th>
                                        <th className={subTh}>Sort</th>
                                        <th className={`${subTh} text-right`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {subs.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className={`px-3 py-6 text-center ${adminMutedText}`}
                                            >
                                                No subcategories yet.
                                            </td>
                                        </tr>
                                    )}
                                    {subs.map((s) => (
                                        <tr key={s.id} className={adminTableRowHover}>
                                            <td
                                                className={`px-3 py-2 ${adminTableTdStrong}`}
                                            >
                                                {s.name}
                                            </td>
                                            <td
                                                className={`px-3 py-2 ${adminTableTdMuted}`}
                                            >
                                                {s.slug}
                                            </td>
                                            <td
                                                className={`px-3 py-2 ${adminTableTdMuted}`}
                                            >
                                                {s.sort_order}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <button
                                                    type="button"
                                                    disabled={subProcessing}
                                                    onClick={() => setEditingSub(s)}
                                                    className={`mr-2 ${adminLinkAction}`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={subProcessing}
                                                    onClick={() => void destroySub(s.id)}
                                                    className={adminDangerText}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {editingSub && (
                            <form
                                onSubmit={(e) => void saveEditedSub(e)}
                                className={adminHighlightPanel}
                            >
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    Edit subcategory
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={adminLabel}>Name</label>
                                        <input
                                            value={editingSub.name}
                                            onChange={(e) =>
                                                setEditingSub({
                                                    ...editingSub,
                                                    name: e.target.value,
                                                })
                                            }
                                            required
                                            className={adminInput}
                                        />
                                    </div>
                                    <div>
                                        <label className={adminLabel}>
                                            Slug (optional)
                                        </label>
                                        <input
                                            value={editingSub.slug}
                                            onChange={(e) =>
                                                setEditingSub({
                                                    ...editingSub,
                                                    slug: e.target.value,
                                                })
                                            }
                                            className={adminInput}
                                        />
                                    </div>
                                    <div>
                                        <label className={adminLabel}>
                                            Sort order
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={editingSub.sort_order}
                                            onChange={(e) =>
                                                setEditingSub({
                                                    ...editingSub,
                                                    sort_order: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            className={adminInput}
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 sm:mt-6">
                                        <input
                                            type="checkbox"
                                            checked={editingSub.is_active}
                                            onChange={(e) =>
                                                setEditingSub({
                                                    ...editingSub,
                                                    is_active: e.target.checked,
                                                })
                                            }
                                            className={adminCheckbox}
                                        />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            Active
                                        </span>
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={subProcessing}
                                        className={adminPrimaryBtn}
                                    >
                                        Update subcategory
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingSub(null)}
                                        className={adminCancelBtn}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <form
                            onSubmit={(e) => void addSubcategory(e)}
                            className={adminDividerTop}
                        >
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                Add subcategory
                            </p>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="sm:col-span-1">
                                    <label className={adminLabel}>Name</label>
                                    <input
                                        value={subName}
                                        onChange={(e) =>
                                            setSubName(e.target.value)
                                        }
                                        required
                                        className={adminInput}
                                    />
                                </div>
                                <div>
                                    <label className={adminLabel}>
                                        Slug (optional)
                                    </label>
                                    <input
                                        value={subSlug}
                                        onChange={(e) =>
                                            setSubSlug(e.target.value)
                                        }
                                        className={adminInput}
                                    />
                                </div>
                                <div>
                                    <label className={adminLabel}>Sort</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={subSort}
                                        onChange={(e) =>
                                            setSubSort(Number(e.target.value))
                                        }
                                        className={adminInput}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={subProcessing}
                                className={adminDarkSubmitBtn}
                            >
                                Add
                            </button>
                        </form>
                    </div>
                )}
                </>
                )}
                </div>
            </AdminLayout>
        </>
    );
}
