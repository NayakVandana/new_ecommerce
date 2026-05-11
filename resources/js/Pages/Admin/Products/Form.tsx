import {
    adminBackLink,
    adminCancelBtn,
    adminCheckbox,
    adminErrorBanner,
    adminInput,
    adminLabel,
    adminPrimaryBtn,
    adminStackPageWrap,
    adminWideFormCard,
} from '@/admin/adminTheme';
import {
    adminApiPost,
    type AdminApiEnvelope,
} from '@/api/adminClient';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps as AppPageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

type Variant = {
    id: number;
    sku: string;
    price: string | number;
    stock_quantity: number;
    is_default: boolean;
};

type Product = {
    id: number;
    brand_id: number | null;
    subcategory_id: number | null;
    gender_id: number | null;
    name: string;
    slug: string;
    base_sku: string | null;
    summary: string | null;
    description: string | null;
    status: string;
    meta_title: string | null;
    meta_description: string | null;
    is_featured: boolean;
    variants?: Variant[];
};

type Meta = {
    brands: { id: number; name: string }[];
    subcategories: {
        id: number;
        category_id: number;
        name: string;
        category?: { id: number; name: string } | null;
    }[];
    genders: { id: number; name: string }[];
};

type PageProps = AppPageProps<{
    product: Product | null;
    meta: Meta;
}>;

function pickDefaultVariant(p: Product | null): Variant | null {
    if (!p?.variants?.length) return null;
    const d = p.variants.find((v) => v.is_default);

    return d ?? p.variants[0] ?? null;
}

export default function Form() {
    const { product: existing, meta } = usePage<PageProps>().props;

    const defaultVariant = useMemo(
        () => pickDefaultVariant(existing),
        [existing],
    );

    const initial = useMemo(() => {
        return {
            name: existing?.name ?? '',
            slug: existing?.slug ?? '',
            base_sku: existing?.base_sku ?? '',
            summary: existing?.summary ?? '',
            description: existing?.description ?? '',
            status: existing?.status ?? 'draft',
            meta_title: existing?.meta_title ?? '',
            meta_description: existing?.meta_description ?? '',
            is_featured: existing?.is_featured ?? false,
            brand_id: existing?.brand_id ?? null,
            subcategory_id: existing?.subcategory_id ?? null,
            gender_id: existing?.gender_id ?? null,
            variant_sku: defaultVariant?.sku ?? '',
            variant_price:
                defaultVariant != null ? String(defaultVariant.price) : '',
            variant_stock: defaultVariant?.stock_quantity ?? 0,
        };
    }, [existing, defaultVariant]);

    const [name, setName] = useState(initial.name);
    const [slug, setSlug] = useState(initial.slug);
    const [baseSku, setBaseSku] = useState(initial.base_sku);
    const [summary, setSummary] = useState(initial.summary);
    const [description, setDescription] = useState(initial.description);
    const [status, setStatus] = useState(initial.status);
    const [metaTitle, setMetaTitle] = useState(initial.meta_title);
    const [metaDescription, setMetaDescription] = useState(
        initial.meta_description,
    );
    const [isFeatured, setIsFeatured] = useState(initial.is_featured);
    const [brandId, setBrandId] = useState<number | null>(initial.brand_id);
    const [subcategoryId, setSubcategoryId] = useState<number | null>(
        initial.subcategory_id,
    );
    const [genderId, setGenderId] = useState<number | null>(initial.gender_id);
    const [variantSku, setVariantSku] = useState(initial.variant_sku);
    const [variantPrice, setVariantPrice] = useState(initial.variant_price);
    const [variantStock, setVariantStock] = useState(initial.variant_stock);

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        const priceNum = Number(variantPrice);
        if (Number.isNaN(priceNum) || priceNum < 0) {
            setError('Variant price must be a valid number.');
            setProcessing(false);

            return;
        }

        try {
            const payload: Record<string, unknown> = {
                name,
                slug: slug.trim() || null,
                base_sku: baseSku.trim() || null,
                summary: summary.trim() || null,
                description: description.trim() || null,
                status,
                meta_title: metaTitle.trim() || null,
                meta_description: metaDescription.trim() || null,
                is_featured: isFeatured,
                brand_id: brandId,
                subcategory_id: subcategoryId,
                gender_id: genderId,
            };

            let res: AdminApiEnvelope<Product>;

            if (existing) {
                res = await adminApiPost<AdminApiEnvelope<Product>>(
                    '/products/update',
                    {
                        id: existing.id,
                        ...payload,
                        variant_sku: variantSku.trim() || null,
                        variant_price: priceNum,
                        variant_stock_quantity: Number(variantStock) || 0,
                    },
                );
            } else {
                if (!variantSku.trim()) {
                    setError('Variant SKU is required for new products.');
                    setProcessing(false);

                    return;
                }
                res = await adminApiPost<AdminApiEnvelope<Product>>(
                    '/products/store',
                    {
                        ...payload,
                        variant_sku: variantSku.trim(),
                        variant_price: priceNum,
                        variant_stock_quantity: Number(variantStock) || 0,
                    },
                );
            }

            if (!res.success) {
                setError(res.message || 'Could not save.');

                return;
            }

            router.visit(route('admin.products.index'));
        } catch {
            setError('Could not save.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title={existing ? 'Edit product' : 'New product'} />
            <AdminLayout heading={existing ? 'Edit product' : 'New product'}>
                <div className={adminStackPageWrap}>
                <div>
                    <Link
                        href={route('admin.products.index')}
                        className={adminBackLink}
                    >
                        ← Products
                    </Link>
                </div>

                {error && <div className={adminErrorBanner}>{error}</div>}

                <form
                    onSubmit={(e) => void submit(e)}
                    className={adminWideFormCard}
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="name"
                                className={adminLabel}
                            >
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
                            <label
                                htmlFor="slug"
                                className={adminLabel}
                            >
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
                            <label
                                htmlFor="base_sku"
                                className={adminLabel}
                            >
                                Base SKU
                            </label>
                            <input
                                id="base_sku"
                                value={baseSku}
                                onChange={(e) => setBaseSku(e.target.value)}
                                className={adminInput}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="brand_id"
                                className={adminLabel}
                            >
                                Brand
                            </label>
                            <select
                                id="brand_id"
                                value={brandId ?? ''}
                                onChange={(e) =>
                                    setBrandId(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                                className={adminInput}
                            >
                                <option value="">— None —</option>
                                {meta.brands.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="subcategory_id"
                                className={adminLabel}
                            >
                                Subcategory
                            </label>
                            <select
                                id="subcategory_id"
                                value={subcategoryId ?? ''}
                                onChange={(e) =>
                                    setSubcategoryId(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                                className={adminInput}
                            >
                                <option value="">— None —</option>
                                {meta.subcategories.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                        {s.category?.name
                                            ? ` (${s.category.name})`
                                            : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="gender_id"
                                className={adminLabel}
                            >
                                Gender
                            </label>
                            <select
                                id="gender_id"
                                value={genderId ?? ''}
                                onChange={(e) =>
                                    setGenderId(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                                className={adminInput}
                            >
                                <option value="">— None —</option>
                                {meta.genders.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="status"
                                className={adminLabel}
                            >
                                Status
                            </label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={adminInput}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 sm:col-span-2">
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) =>
                                    setIsFeatured(e.target.checked)
                                }
                                className={adminCheckbox}
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                Featured
                            </span>
                        </label>
                    </div>

                    <div>
                        <label
                            htmlFor="summary"
                            className={adminLabel}
                        >
                            Summary
                        </label>
                        <textarea
                            id="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows={2}
                            className={adminInput}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="description"
                            className={adminLabel}
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            className={adminInput}
                        />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="meta_title"
                                className={adminLabel}
                            >
                                Meta title
                            </label>
                            <input
                                id="meta_title"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                className={adminInput}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="meta_description"
                                className={adminLabel}
                            >
                                Meta description
                            </label>
                            <input
                                id="meta_description"
                                value={metaDescription}
                                onChange={(e) =>
                                    setMetaDescription(e.target.value)
                                }
                                className={adminInput}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            Default variant
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            New products require one SKU and price. Editing
                            updates the default variant (or the first variant).
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <div>
                                <label
                                    htmlFor="variant_sku"
                                    className={adminLabel}
                                >
                                    SKU
                                    {!existing && (
                                        <span className="text-red-600 dark:text-red-400">
                                            *
                                        </span>
                                    )}
                                </label>
                                <input
                                    id="variant_sku"
                                    value={variantSku}
                                    onChange={(e) =>
                                        setVariantSku(e.target.value)
                                    }
                                    required={!existing}
                                    className={adminInput}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="variant_price"
                                    className={adminLabel}
                                >
                                    Price
                                </label>
                                <input
                                    id="variant_price"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={variantPrice}
                                    onChange={(e) =>
                                        setVariantPrice(e.target.value)
                                    }
                                    required
                                    className={adminInput}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="variant_stock"
                                    className={adminLabel}
                                >
                                    Stock
                                </label>
                                <input
                                    id="variant_stock"
                                    type="number"
                                    min={0}
                                    value={variantStock}
                                    onChange={(e) =>
                                        setVariantStock(Number(e.target.value))
                                    }
                                    className={adminInput}
                                />
                            </div>
                        </div>
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
                            href={route('admin.products.index')}
                            className={`inline-flex items-center justify-center ${adminCancelBtn}`}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
                </div>
            </AdminLayout>
        </>
    );
}
