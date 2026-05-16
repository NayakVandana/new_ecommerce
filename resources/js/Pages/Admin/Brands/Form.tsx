import {
    adminBackLink,
    adminCancelBtn,
    adminCheckbox,
    adminErrorBanner,
    adminFormCard,
    adminFormPageWrap,
    adminInput,
    adminLabel,
    adminMutedText,
    adminPrimaryBtn,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
} from '@/api/adminClient';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps as AppPageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type Brand = {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
    is_active: boolean;
    sort_order: number;
};

type PageProps = AppPageProps<{
    brandId: number | null;
}>;

export default function Form() {
    const { brandId } = usePage<PageProps>().props;

    const [existing, setExisting] = useState<Brand | null>(null);
    const [loading, setLoading] = useState(brandId !== null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const initial = useMemo(
        () => ({
            name: existing?.name ?? '',
            slug: existing?.slug ?? '',
            logo_url: existing?.logo_url ?? '',
            description: existing?.description ?? '',
            is_active: existing?.is_active ?? true,
            sort_order: existing?.sort_order ?? 0,
        }),
        [existing],
    );

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!brandId) {
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
                const res = await adminApiPost<AdminApiEnvelope<Brand>>(
                    '/brands/show',
                    { id: brandId },
                );
                if (cancelled) {
                    return;
                }
                if (!res.success || !res.data) {
                    setLoadError(res.message || 'Could not load brand.');

                    return;
                }
                setExisting(res.data);
            } catch {
                if (!cancelled) {
                    setLoadError('Could not load brand.');
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
    }, [brandId]);

    useEffect(() => {
        setName(initial.name);
        setSlug(initial.slug);
        setLogoUrl(initial.logo_url);
        setDescription(initial.description);
        setIsActive(initial.is_active);
        setSortOrder(initial.sort_order);
    }, [initial]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);
        try {
            const payload: Record<string, unknown> = {
                name,
                slug: slug.trim() || null,
                logo_url: logoUrl.trim() || null,
                description: description.trim() || null,
                is_active: isActive,
                sort_order: Number(sortOrder) || 0,
            };

            let res: AdminApiEnvelope<Brand>;

            if (existing) {
                res = await adminApiPost<AdminApiEnvelope<Brand>>('/brands/update', {
                    id: existing.id,
                    ...payload,
                });
            } else {
                res = await adminApiPost<AdminApiEnvelope<Brand>>('/brands/store', payload);
            }

            if (!res.success) {
                setError(res.message || 'Could not save.');

                return;
            }

            router.visit(route('admin.brands.index'));
        } catch {
            setError('Could not save.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title={existing ? 'Edit brand' : 'New brand'} />
            <AdminLayout heading={existing ? 'Edit brand' : 'New brand'}>
                <div className={adminFormPageWrap}>
                <div>
                    <Link href={route('admin.brands.index')} className={adminBackLink}>
                        ← Brands
                    </Link>
                </div>

                {(loadError || error) && (
                    <div className={adminErrorBanner}>{loadError ?? error}</div>
                )}

                {loading && <p className={adminMutedText}>Loading…</p>}

                {!loading && !loadError && (
                <form
                    onSubmit={(e) => void submit(e)}
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
                            placeholder="auto from name"
                            className={adminInput}
                        />
                    </div>
                    <div>
                        <label htmlFor="logo_url" className={adminLabel}>
                            Logo URL
                        </label>
                        <input
                            id="logo_url"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
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
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                        <Link
                            href={route('admin.brands.index')}
                            className={`inline-flex items-center justify-center ${adminCancelBtn}`}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
                )}
                </div>
            </AdminLayout>
        </>
    );
}
