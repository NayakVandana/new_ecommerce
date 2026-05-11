import {
    adminBackLink,
    adminCancelBtn,
    adminCheckbox,
    adminErrorBanner,
    adminFormCard,
    adminInput,
    adminLabel,
    adminPrimaryBtn,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
} from '@/api/adminClient';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps as AppPageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

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
    brand: Brand | null;
}>;

export default function Form() {
    const { brand: existing } = usePage<PageProps>().props;

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

    const [name, setName] = useState(initial.name);
    const [slug, setSlug] = useState(initial.slug);
    const [logoUrl, setLogoUrl] = useState(initial.logo_url);
    const [description, setDescription] = useState(initial.description);
    const [isActive, setIsActive] = useState(initial.is_active);
    const [sortOrder, setSortOrder] = useState(initial.sort_order);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                <div className="mb-6">
                    <Link href={route('admin.brands.index')} className={adminBackLink}>
                        ← Brands
                    </Link>
                </div>

                {error && <div className={adminErrorBanner}>{error}</div>}

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
                    <div className="flex gap-6">
                        <div>
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
                                className={`${adminInput} max-w-[8rem]`}
                            />
                        </div>
                        <label className="mt-7 flex items-center gap-2">
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
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className={adminPrimaryBtn}
                        >
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                        <Link
                            href={route('admin.brands.index')}
                            className={`inline-flex items-center ${adminCancelBtn}`}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </AdminLayout>
        </>
    );
}
