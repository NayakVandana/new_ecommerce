import {
    adminBackLink,
    adminCancelBtn,
    adminCheckbox,
    adminDividerTop,
    adminErrorBanner,
    adminInput,
    adminLabel,
    adminMutedText,
    adminPrimaryBtn,
    adminSmallHeading,
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
import { FormEvent, useEffect, useMemo, useState } from 'react';

type Variant = {
    id: number;
    sku: string;
    price: string | number;
    stock_quantity: number;
    is_default: boolean;
    size?: string | null;
    color?: string | null;
    barcode?: string | null;
};

type ProductImage = {
    id: number;
    path: string;
    alt_text?: string | null;
    sort_order?: number;
    is_primary?: boolean;
};

type ProductVideo = {
    id: number;
    url: string;
    provider?: string | null;
    sort_order?: number;
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
    images?: ProductImage[];
    videos?: ProductVideo[];
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

type VariantFormRow = {
    id?: number;
    sku: string;
    price: string;
    stock: number;
    size: string;
    color: string;
    barcode: string;
    is_default: boolean;
};

type ImageFormRow = {
    path: string;
    alt_text: string;
    is_primary: boolean;
};

type VideoFormRow = {
    url: string;
    provider: string;
};

function emptyVariantRow(isDefault: boolean): VariantFormRow {
    return {
        sku: '',
        price: '',
        stock: 0,
        size: '',
        color: '',
        barcode: '',
        is_default: isDefault,
    };
}

function mapVariantToRow(v: Variant): VariantFormRow {
    return {
        id: v.id,
        sku: v.sku,
        price: String(v.price),
        stock: v.stock_quantity,
        size: v.size ?? '',
        color: v.color ?? '',
        barcode: v.barcode ?? '',
        is_default: v.is_default,
    };
}

export default function Form() {
    const { product: existing, meta } = usePage<PageProps>().props;

    const initialProductFields = useMemo(
        () => ({
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
        }),
        [existing],
    );

    const [name, setName] = useState(initialProductFields.name);
    const [slug, setSlug] = useState(initialProductFields.slug);
    const [baseSku, setBaseSku] = useState(initialProductFields.base_sku);
    const [summary, setSummary] = useState(initialProductFields.summary);
    const [description, setDescription] = useState(
        initialProductFields.description,
    );
    const [status, setStatus] = useState(initialProductFields.status);
    const [metaTitle, setMetaTitle] = useState(initialProductFields.meta_title);
    const [metaDescription, setMetaDescription] = useState(
        initialProductFields.meta_description,
    );
    const [isFeatured, setIsFeatured] = useState(
        initialProductFields.is_featured,
    );
    const [brandId, setBrandId] = useState<number | null>(
        initialProductFields.brand_id,
    );
    const [subcategoryId, setSubcategoryId] = useState<number | null>(
        initialProductFields.subcategory_id,
    );
    const [genderId, setGenderId] = useState<number | null>(
        initialProductFields.gender_id,
    );

    const [variants, setVariants] = useState<VariantFormRow[]>(() =>
        existing?.variants?.length
            ? existing.variants.map(mapVariantToRow)
            : [emptyVariantRow(true)],
    );

    const [imageRows, setImageRows] = useState<ImageFormRow[]>(() =>
        existing ? [] : [{ path: '', alt_text: '', is_primary: true }],
    );

    const [additionalImages, setAdditionalImages] = useState<ImageFormRow[]>(
        [],
    );

    const [videoRows, setVideoRows] = useState<VideoFormRow[]>(() =>
        existing ? [] : [{ url: '', provider: '' }],
    );

    const [additionalVideos, setAdditionalVideos] = useState<VideoFormRow[]>(
        [],
    );

    useEffect(() => {
        setName(initialProductFields.name);
        setSlug(initialProductFields.slug);
        setBaseSku(initialProductFields.base_sku);
        setSummary(initialProductFields.summary);
        setDescription(initialProductFields.description);
        setStatus(initialProductFields.status);
        setMetaTitle(initialProductFields.meta_title);
        setMetaDescription(initialProductFields.meta_description);
        setIsFeatured(initialProductFields.is_featured);
        setBrandId(initialProductFields.brand_id);
        setSubcategoryId(initialProductFields.subcategory_id);
        setGenderId(initialProductFields.gender_id);

        if (existing?.variants?.length) {
            setVariants(existing.variants.map(mapVariantToRow));
        } else {
            setVariants([emptyVariantRow(true)]);
        }

        if (!existing) {
            setImageRows([{ path: '', alt_text: '', is_primary: true }]);
            setVideoRows([{ url: '', provider: '' }]);
        } else {
            setImageRows([]);
            setAdditionalImages([]);
            setVideoRows([]);
            setAdditionalVideos([]);
        }
    }, [existing?.id, initialProductFields, existing]);

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setDefaultVariant = (index: number) => {
        setVariants((rows) =>
            rows.map((r, i) => ({
                ...r,
                is_default: i === index,
            })),
        );
    };

    const setImagePrimary = (index: number, isCreate: boolean) => {
        const updater = isCreate ? setImageRows : setAdditionalImages;
        updater((rows) =>
            rows.map((r, i) => ({
                ...r,
                is_primary: i === index,
            })),
        );
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        for (const row of variants) {
            const priceNum = Number(row.price);
            if (!row.sku.trim()) {
                setError('Each variant needs a SKU.');
                setProcessing(false);

                return;
            }
            if (Number.isNaN(priceNum) || priceNum < 0) {
                setError(`Invalid price for SKU "${row.sku}".`);

                return;
            }
        }

        const variantsPayload = variants.map((v) => ({
            ...(v.id ? { id: v.id } : {}),
            sku: v.sku.trim(),
            price: Number(v.price),
            stock_quantity: Number(v.stock) || 0,
            size: v.size.trim() || null,
            color: v.color.trim() || null,
            barcode: v.barcode.trim() || null,
            is_default: v.is_default,
        }));

        const buildImagePayload = (rows: ImageFormRow[]) =>
            rows
                .filter((r) => r.path.trim() !== '')
                .map((r, i) => ({
                    path: r.path.trim(),
                    alt_text: r.alt_text.trim() || null,
                    sort_order: i,
                    is_primary: r.is_primary,
                }));

        const imagesPayloadCreate = buildImagePayload(imageRows);
        const newImagesPayloadEdit = buildImagePayload(additionalImages);

        const buildVideoPayload = (rows: VideoFormRow[]) =>
            rows
                .filter((r) => r.url.trim() !== '')
                .map((r, i) => ({
                    url: r.url.trim(),
                    provider: r.provider.trim() || null,
                    sort_order: i,
                }));

        const videosPayloadCreate = buildVideoPayload(videoRows);
        const newVideosPayloadEdit = buildVideoPayload(additionalVideos);

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
                variants: variantsPayload,
            };

            let res: AdminApiEnvelope<Product>;

            if (existing) {
                payload.new_images = newImagesPayloadEdit;
                payload.new_videos = newVideosPayloadEdit;
                res = await adminApiPost<AdminApiEnvelope<Product>>(
                    '/products/update',
                    {
                        id: existing.id,
                        ...payload,
                    },
                );
            } else {
                payload.images = imagesPayloadCreate;
                payload.videos = videosPayloadCreate;
                res = await adminApiPost<AdminApiEnvelope<Product>>(
                    '/products/store',
                    payload,
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

    const addVariant = () => {
        setVariants((rows) => [...rows, emptyVariantRow(rows.length === 0)]);
    };

    const removeVariant = (index: number) => {
        setVariants((rows) => {
            if (rows.length <= 1) return rows;
            const next = rows.filter((_, i) => i !== index);
            if (!next.some((r) => r.is_default)) {
                next[0] = { ...next[0], is_default: true };
            }

            return next;
        });
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
                                    onChange={(e) =>
                                        setMetaTitle(e.target.value)
                                    }
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

                        <div className={adminDividerTop}>
                            <h3 className={adminSmallHeading}>Variants</h3>
                            <p className={`mt-1 ${adminMutedText}`}>
                                At least one variant (SKU + price). Mark one as
                                default for storefront pricing. Optional size /
                                color / barcode per row.
                            </p>
                            <div className="mt-4 space-y-4">
                                {variants.map((row, index) => (
                                    <div
                                        key={
                                            row.id
                                                ? `v-${row.id}`
                                                : `new-${index}`
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                                    >
                                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                <input
                                                    type="radio"
                                                    name="default_variant"
                                                    checked={row.is_default}
                                                    onChange={() =>
                                                        setDefaultVariant(index)
                                                    }
                                                    className="border-slate-300 text-violet-600 focus:ring-violet-500"
                                                />
                                                Default variant
                                            </label>
                                            {variants.length > 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeVariant(index)
                                                    }
                                                    className="text-sm font-semibold text-red-600 hover:text-red-500 dark:text-red-400"
                                                >
                                                    Remove
                                                </button>
                                            ) : null}
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="sm:col-span-2 lg:col-span-1">
                                                <label
                                                    className={adminLabel}
                                                >
                                                    SKU *
                                                </label>
                                                <input
                                                    value={row.sku}
                                                    onChange={(e) =>
                                                        setVariants((rows) =>
                                                            rows.map((r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          sku: e
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : r,
                                                            ),
                                                        )
                                                    }
                                                    required
                                                    className={adminInput}
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className={adminLabel}
                                                >
                                                    Price *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min={0}
                                                    value={row.price}
                                                    onChange={(e) =>
                                                        setVariants((rows) =>
                                                            rows.map((r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          price: e
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : r,
                                                            ),
                                                        )
                                                    }
                                                    required
                                                    className={adminInput}
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className={adminLabel}
                                                >
                                                    Stock
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={row.stock}
                                                    onChange={(e) =>
                                                        setVariants((rows) =>
                                                            rows.map((r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          stock: Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          ),
                                                                      }
                                                                    : r,
                                                            ),
                                                        )
                                                    }
                                                    className={adminInput}
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className={adminLabel}
                                                >
                                                    Size
                                                </label>
                                                <input
                                                    value={row.size}
                                                    onChange={(e) =>
                                                        setVariants((rows) =>
                                                            rows.map((r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          size: e
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : r,
                                                            ),
                                                        )
                                                    }
                                                    className={adminInput}
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className={adminLabel}
                                                >
                                                    Color
                                                </label>
                                                <input
                                                    value={row.color}
                                                    onChange={(e) =>
                                                        setVariants((rows) =>
                                                            rows.map((r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          color: e
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : r,
                                                            ),
                                                        )
                                                    }
                                                    className={adminInput}
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    className={adminLabel}
                                                >
                                                    Barcode
                                                </label>
                                                <input
                                                    value={row.barcode}
                                                    onChange={(e) =>
                                                        setVariants((rows) =>
                                                            rows.map((r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          barcode:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : r,
                                                            ),
                                                        )
                                                    }
                                                    className={adminInput}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addVariant}
                                className={`mt-4 ${adminCancelBtn}`}
                            >
                                + Add variant
                            </button>
                        </div>

                        <div className={adminDividerTop}>
                            <h3 className={adminSmallHeading}>Images</h3>
                            <p className={`mt-1 ${adminMutedText}`}>
                                Full image URL (https://…) or storage path
                                under your public disk (e.g.{' '}
                                <span className="font-mono text-xs">
                                    products/photo.jpg
                                </span>
                                ). One primary image for thumbnails.
                            </p>

                            {existing &&
                            existing.images &&
                            existing.images.length > 0 ? (
                                <ul className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/30">
                                    {existing.images.map((img) => (
                                        <li
                                            key={img.id}
                                            className="flex flex-wrap items-center justify-between gap-2 text-slate-700 dark:text-slate-300"
                                        >
                                            <span className="break-all font-mono text-xs">
                                                {img.path}
                                            </span>
                                            {img.is_primary ? (
                                                <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                                                    Primary
                                                </span>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            ) : null}

                            <div className="mt-4 space-y-4">
                                {(existing ? additionalImages : imageRows).map(
                                    (row, index) => {
                                        const rows = existing
                                            ? additionalImages
                                            : imageRows;
                                        const setRows = existing
                                            ? setAdditionalImages
                                            : setImageRows;

                                        return (
                                            <div
                                                key={`img-${index}`}
                                                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                                            >
                                                <div className="mb-2 flex justify-end">
                                                    {rows.length > 1 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setRows(
                                                                    rows.filter(
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) =>
                                                                            i !==
                                                                            index,
                                                                    ),
                                                                )
                                                            }
                                                            className="text-sm font-semibold text-red-600 dark:text-red-400"
                                                        >
                                                            Remove
                                                        </button>
                                                    ) : null}
                                                </div>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            className={
                                                                adminLabel
                                                            }
                                                        >
                                                            Image URL / path
                                                        </label>
                                                        <input
                                                            value={row.path}
                                                            onChange={(e) =>
                                                                setRows(
                                                                    rs =>
                                                                        rs.map(
                                                                            (
                                                                                r,
                                                                                i,
                                                                            ) =>
                                                                                i ===
                                                                                index
                                                                                    ? {
                                                                                          ...r,
                                                                                          path: e
                                                                                              .target
                                                                                              .value,
                                                                                      }
                                                                                    : r,
                                                                        ),
                                                                )
                                                            }
                                                            className={
                                                                adminInput
                                                            }
                                                            placeholder="https://… or products/image.jpg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            className={
                                                                adminLabel
                                                            }
                                                        >
                                                            Alt text
                                                        </label>
                                                        <input
                                                            value={
                                                                row.alt_text
                                                            }
                                                            onChange={(e) =>
                                                                setRows(
                                                                    rs =>
                                                                        rs.map(
                                                                            (
                                                                                r,
                                                                                i,
                                                                            ) =>
                                                                                i ===
                                                                                index
                                                                                    ? {
                                                                                          ...r,
                                                                                          alt_text:
                                                                                              e
                                                                                                  .target
                                                                                                  .value,
                                                                                      }
                                                                                    : r,
                                                                        ),
                                                                )
                                                            }
                                                            className={
                                                                adminInput
                                                            }
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-2 pt-7 sm:pt-8">
                                                        <input
                                                            type="radio"
                                                            name={
                                                                existing
                                                                    ? 'new_img_primary'
                                                                    : 'img_primary'
                                                            }
                                                            checked={
                                                                row.is_primary
                                                            }
                                                            onChange={() =>
                                                                setImagePrimary(
                                                                    index,
                                                                    !existing,
                                                                )
                                                            }
                                                            className="border-slate-300 text-violet-600 focus:ring-violet-500"
                                                        />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                                            Primary image
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    existing
                                        ? setAdditionalImages((r) => [
                                              ...r,
                                              {
                                                  path: '',
                                                  alt_text: '',
                                                  is_primary: r.length === 0,
                                              },
                                          ])
                                        : setImageRows((r) => [
                                              ...r,
                                              {
                                                  path: '',
                                                  alt_text: '',
                                                  is_primary: false,
                                              },
                                          ])
                                }
                                className={`mt-4 ${adminCancelBtn}`}
                            >
                                + Add image row
                            </button>
                        </div>

                        <div className={adminDividerTop}>
                            <h3 className={adminSmallHeading}>Videos</h3>
                            <p className={`mt-1 ${adminMutedText}`}>
                                Embed URLs (YouTube, Vimeo, or direct file).
                                Provider is optional.
                            </p>

                            {existing &&
                            existing.videos &&
                            existing.videos.length > 0 ? (
                                <ul className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/30">
                                    {existing.videos.map((v) => (
                                        <li
                                            key={v.id}
                                            className="break-all font-mono text-xs text-slate-700 dark:text-slate-300"
                                        >
                                            {v.url}
                                            {v.provider
                                                ? ` · ${v.provider}`
                                                : ''}
                                        </li>
                                    ))}
                                </ul>
                            ) : null}

                            <div className="mt-4 space-y-4">
                                {(existing ? additionalVideos : videoRows).map(
                                    (row, index) => {
                                        const rows = existing
                                            ? additionalVideos
                                            : videoRows;
                                        const setRows = existing
                                            ? setAdditionalVideos
                                            : setVideoRows;

                                        return (
                                            <div
                                                key={`vid-${index}`}
                                                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                                            >
                                                <div className="mb-2 flex justify-end">
                                                    {rows.length > 1 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setRows(
                                                                    rows.filter(
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) =>
                                                                            i !==
                                                                            index,
                                                                    ),
                                                                )
                                                            }
                                                            className="text-sm font-semibold text-red-600 dark:text-red-400"
                                                        >
                                                            Remove
                                                        </button>
                                                    ) : null}
                                                </div>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="sm:col-span-2">
                                                        <label
                                                            className={
                                                                adminLabel
                                                            }
                                                        >
                                                            Video URL
                                                        </label>
                                                        <input
                                                            value={row.url}
                                                            onChange={(e) =>
                                                                setRows(
                                                                    rs =>
                                                                        rs.map(
                                                                            (
                                                                                r,
                                                                                i,
                                                                            ) =>
                                                                                i ===
                                                                                index
                                                                                    ? {
                                                                                          ...r,
                                                                                          url: e
                                                                                              .target
                                                                                              .value,
                                                                                      }
                                                                                    : r,
                                                                        ),
                                                                )
                                                            }
                                                            className={
                                                                adminInput
                                                            }
                                                            placeholder="https://…"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            className={
                                                                adminLabel
                                                            }
                                                        >
                                                            Provider
                                                        </label>
                                                        <select
                                                            value={
                                                                row.provider
                                                            }
                                                            onChange={(e) =>
                                                                setRows(
                                                                    rs =>
                                                                        rs.map(
                                                                            (
                                                                                r,
                                                                                i,
                                                                            ) =>
                                                                                i ===
                                                                                index
                                                                                    ? {
                                                                                          ...r,
                                                                                          provider:
                                                                                              e
                                                                                                  .target
                                                                                                  .value,
                                                                                      }
                                                                                    : r,
                                                                        ),
                                                                )
                                                            }
                                                            className={
                                                                adminInput
                                                            }
                                                        >
                                                            <option value="">
                                                                — Auto / none —
                                                            </option>
                                                            <option value="youtube">
                                                                YouTube
                                                            </option>
                                                            <option value="vimeo">
                                                                Vimeo
                                                            </option>
                                                            <option value="other">
                                                                Other
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    existing
                                        ? setAdditionalVideos((r) => [
                                              ...r,
                                              { url: '', provider: '' },
                                          ])
                                        : setVideoRows((r) => [
                                              ...r,
                                              { url: '', provider: '' },
                                          ])
                                }
                                className={`mt-4 ${adminCancelBtn}`}
                            >
                                + Add video row
                            </button>
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
