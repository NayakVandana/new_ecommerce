import {
    adminBackLink,
    adminCancelBtn,
    adminCheckbox,
    adminErrorBanner,
    adminFormSection,
    adminInput,
    adminLabel,
    adminMutedText,
    adminProductPageWrap,
    adminStickyAside,
    adminVariantCard,
    adminVariantCardHeader,
} from '@/admin/adminTheme';
import {
    AdminFieldError,
    AdminFormField,
    PublishPanel,
    VariantColorField,
    VariantMediaToggle,
} from '@/Pages/Admin/Products/ProductFormUi';
import {
    adminApiPost,
    adminApiPostMultipart,
    type AdminApiEnvelope,
} from '@/api/adminClient';
import {
    FASHION_SIZE_FORM_OTHER,
    FASHION_SIZE_OPTION_GROUPS,
    FASHION_SIZE_OTHER,
    fashionCustomSizeInputValue,
    fashionSizeSelectValue,
    isCustomFashionSize,
    normalizeVariantSizeForApi,
} from '@/constants/fashionSizes';
import {
    isHexColorString,
    normalizeColorHexForApi,
    normalizeHexColor6,
} from '@/lib/variantColor';
import {
    variantHasColor,
    variantHasImage,
    variantHasSize,
    variantSizeColorKey,
} from '@/lib/productVariant';
import {
    emptyProductFormErrors,
    hasAnyFieldErrors,
    mergeApiFailure,
    setVariantFieldError,
    scrollToFirstProductError,
    validateProductFormClient,
    type ProductFormErrors,
    type VariantFieldErrors,
} from '@/lib/productFormErrors';
import VariantPricingGrid, {
    type VariantPricingRow,
} from '@/Components/admin/VariantPricingGrid';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps as AppPageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type Variant = {
    id: number;
    sku: string;
    price: string | number;
    compare_at_price?: string | number | null;
    list_price?: string | number | null;
    cost?: string | number | null;
    discount_percent?: string | number | null;
    commission_percent?: string | number | null;
    stock_quantity: number;
    is_default: boolean;
    is_active?: boolean;
    size?: string | null;
    color?: string | null;
    color_hex?: string | null;
    barcode?: string | null;
    images?: ProductImage[];
    videos?: ProductVideo[];
};

type ProductImage = {
    id: number;
    path: string;
    alt_text?: string | null;
    sort_order?: number;
    is_primary?: boolean;
    product_variant_id?: number | null;
};

type ProductVideo = {
    id: number;
    url: string;
    provider?: string | null;
    sort_order?: number;
    product_variant_id?: number | null;
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

const emptyMeta: Meta = {
    brands: [],
    subcategories: [],
    genders: [],
};

type PageProps = AppPageProps<{
    productId: number | null;
}>;

type VariantFormRow = VariantPricingRow & {
    id?: number;
    sku: string;
    size: string;
    color: string;
    color_hex: string;
    barcode: string;
    is_default: boolean;
    images: ImageFormRow[];
    videos: VideoFormRow[];
};

type ImageFormRow = {
    id?: number;
    path: string;
    alt_text: string;
    is_primary: boolean;
};

type VideoFormRow = {
    id?: number;
    url: string;
    provider: string;
};

function mapApiImageToFormRow(img: ProductImage): ImageFormRow {
    return {
        id: img.id,
        path: img.path,
        alt_text: img.alt_text ?? '',
        is_primary: Boolean(img.is_primary),
    };
}

function mapApiVideoToFormRow(v: ProductVideo): VideoFormRow {
    return {
        id: v.id,
        url: v.url,
        provider: v.provider ?? '',
    };
}

function productImagePreviewSrc(path: string): string {
    const p = path.trim();
    if (!p) {
        return '';
    }
    if (/^https?:\/\//i.test(p)) {
        return p;
    }
    if (p.startsWith('/')) {
        return p;
    }

    return `/storage/${p}`;
}

function isExternalHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(value.trim());
}

function isHostedEmbedVideoUrl(url: string): boolean {
    const u = url.trim().toLowerCase();
    if (!/^https?:\/\//i.test(u)) {
        return false;
    }

    return (
        u.includes('youtube.com') ||
        u.includes('youtu.be') ||
        u.includes('vimeo.com')
    );
}

function emptyVariantRow(isDefault: boolean): VariantFormRow {
    return {
        sku: '',
        cost: '',
        mrp: '',
        discountPercent: '0',
        finalPrice: '',
        is_active: true,
        stock: 0,
        size: '',
        color: '',
        color_hex: '',
        barcode: '',
        is_default: isDefault,
        images: [{ path: '', alt_text: '', is_primary: true }],
        videos: [{ url: '', provider: '' }],
    };
}

function mapVariantToRow(
    v: Variant,
    options: {
        prependImages?: ProductImage[];
        prependVideos?: ProductVideo[];
    } = {},
): VariantFormRow {
    const rawName = v.color ?? '';
    const rawHex = v.color_hex ?? '';
    const nameLooksHex = isHexColorString(rawName);

    let color = '';
    let color_hex = '';

    const hexFromField = rawHex ? normalizeHexColor6(rawHex) : null;
    const hexFromName = nameLooksHex ? normalizeHexColor6(rawName) : null;

    if (hexFromField) {
        color_hex = hexFromField;
        color = nameLooksHex ? '' : rawName.trim();
    } else if (hexFromName) {
        color_hex = hexFromName;
        color = '';
    } else {
        color = rawName.trim();
    }

    const prependImages = (options.prependImages ?? []).map(mapApiImageToFormRow);
    const prependVideos = (options.prependVideos ?? []).map(mapApiVideoToFormRow);
    const variantImages = (v.images ?? []).map(mapApiImageToFormRow);
    const variantVideos = (v.videos ?? []).map(mapApiVideoToFormRow);

    let images = [...prependImages, ...variantImages];
    if (images.length === 0) {
        images = [{ path: '', alt_text: '', is_primary: true }];
    } else if (!images.some((img) => img.is_primary)) {
        images = images.map((r, idx) => ({
            ...r,
            is_primary: idx === 0,
        }));
    }

    let videos = [...prependVideos, ...variantVideos];
    if (videos.length === 0) {
        videos = [{ url: '', provider: '' }];
    }

    return {
        id: v.id,
        sku: v.sku,
        cost: v.cost != null ? String(v.cost) : '',
        mrp: v.compare_at_price != null ? String(v.compare_at_price) : '',
        discountPercent:
            v.discount_percent != null ? String(v.discount_percent) : '0',
        finalPrice: String(v.price),
        is_active: v.is_active !== false,
        stock: v.stock_quantity,
        size: v.size ?? '',
        color,
        color_hex,
        barcode: v.barcode ?? '',
        is_default: v.is_default,
        images,
        videos,
    };
}

function buildInitialVariants(existing: Product | null): VariantFormRow[] {
    if (!existing?.variants?.length) {
        return [emptyVariantRow(true)];
    }

    const defaultVariant =
        existing.variants.find((v) => v.is_default) ?? existing.variants[0];
    const orphanImages = (existing.images ?? []).filter(
        (img) => !img.product_variant_id,
    );
    const orphanVideos = (existing.videos ?? []).filter(
        (vid) => !vid.product_variant_id,
    );

    return existing.variants.map((v) =>
        mapVariantToRow(v, {
            prependImages: v.id === defaultVariant.id ? orphanImages : [],
            prependVideos: v.id === defaultVariant.id ? orphanVideos : [],
        }),
    );
}

export default function Form() {
    const { productId } = usePage<PageProps>().props;

    const [existing, setExisting] = useState<Product | null>(null);
    const [meta, setMeta] = useState<Meta>(emptyMeta);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const metaRes = await adminApiPost<AdminApiEnvelope<Meta>>(
                    '/products/form-meta',
                    {},
                );
                if (cancelled) {
                    return;
                }
                if (!metaRes.success || !metaRes.data) {
                    setLoadError(metaRes.message || 'Could not load form data.');

                    return;
                }
                setMeta(metaRes.data);

                if (productId) {
                    const productRes = await adminApiPost<
                        AdminApiEnvelope<Product>
                    >('/products/product-show', { id: productId });
                    if (cancelled) {
                        return;
                    }
                    if (!productRes.success || !productRes.data) {
                        setLoadError(
                            productRes.message || 'Could not load product.',
                        );

                        return;
                    }
                    setExisting(productRes.data);
                } else {
                    setExisting(null);
                }
            } catch {
                if (!cancelled) {
                    setLoadError('Could not load form data.');
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
    }, [productId]);

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
        buildInitialVariants(existing),
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
            setVariants(buildInitialVariants(existing));
        } else {
            setVariants([emptyVariantRow(true)]);
        }
    }, [existing?.id, initialProductFields, existing]);

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<ProductFormErrors>({});
    const [uploadBusyKey, setUploadBusyKey] = useState<string | null>(null);

    const handleVariantImageUpload = async (
        variantIndex: number,
        imageIndex: number,
        file: File | undefined,
        input: HTMLInputElement,
    ) => {
        if (!file || uploadBusyKey) {
            return;
        }
        if (!file.type.startsWith('image/')) {
            setErrors((prev) =>
                setVariantFieldError(
                    prev,
                    variantIndex,
                    'media',
                    'Only image files can be uploaded here.',
                ),
            );

            return;
        }

        const key = `v${variantIndex}-img${imageIndex}`;
        setUploadBusyKey(key);
        setErrors((prev) => {
            const next = { ...prev };
            if (next.variants?.[variantIndex]) {
                const variants = { ...next.variants };
                const row = { ...variants[variantIndex] };
                delete row.media;
                delete row.images;
                variants[variantIndex] = row;
                next.variants = variants;
            }
            return next;
        });

        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await adminApiPostMultipart<
                AdminApiEnvelope<{ path: string; disk: string; url: string }>
            >('/media/upload-product-image', fd);

            if (!res.success || !res.data?.path) {
                setErrors((prev) =>
                    setVariantFieldError(
                        prev,
                        variantIndex,
                        'media',
                        res.message || 'Image upload failed.',
                    ),
                );

                return;
            }

            const newPath = res.data.path;
            setVariants((rows) =>
                rows.map((r, i) => {
                    if (i !== variantIndex) {
                        return r;
                    }

                    return {
                        ...r,
                        images: r.images.map((img, j) =>
                            j === imageIndex ? { ...img, path: newPath } : img,
                        ),
                    };
                }),
            );
        } catch {
            setErrors((prev) =>
                setVariantFieldError(
                    prev,
                    variantIndex,
                    'media',
                    'Image upload failed.',
                ),
            );
        } finally {
            setUploadBusyKey(null);
            input.value = '';
        }
    };

    const handleVariantVideoUpload = async (
        variantIndex: number,
        videoIndex: number,
        file: File | undefined,
        input: HTMLInputElement,
    ) => {
        if (!file || uploadBusyKey) {
            return;
        }
        if (!file.type.startsWith('video/')) {
            setErrors((prev) =>
                setVariantFieldError(
                    prev,
                    variantIndex,
                    'media',
                    'Only video files can be uploaded here.',
                ),
            );

            return;
        }

        const key = `v${variantIndex}-vid${videoIndex}`;
        setUploadBusyKey(key);
        setErrors((prev) => {
            const next = { ...prev };
            if (next.variants?.[variantIndex]) {
                const variants = { ...next.variants };
                const row = { ...variants[variantIndex] };
                delete row.media;
                variants[variantIndex] = row;
                next.variants = variants;
            }
            return next;
        });

        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await adminApiPostMultipart<
                AdminApiEnvelope<{ url: string; path: string }>
            >('/media/upload-product-video', fd);

            if (!res.success || !res.data?.url) {
                setErrors((prev) =>
                    setVariantFieldError(
                        prev,
                        variantIndex,
                        'media',
                        res.message || 'Video upload failed.',
                    ),
                );

                return;
            }

            const newUrl = res.data.url;
            setVariants((rows) =>
                rows.map((r, i) => {
                    if (i !== variantIndex) {
                        return r;
                    }

                    return {
                        ...r,
                        videos: r.videos.map((vr, j) =>
                            j === videoIndex
                                ? { ...vr, url: newUrl, provider: '' }
                                : vr,
                        ),
                    };
                }),
            );
        } catch {
            setErrors((prev) =>
                setVariantFieldError(
                    prev,
                    variantIndex,
                    'media',
                    'Video upload failed.',
                ),
            );
        } finally {
            setUploadBusyKey(null);
            input.value = '';
        }
    };

    const setDefaultVariant = (index: number) => {
        setVariants((rows) =>
            rows.map((r, i) => ({
                ...r,
                is_default: i === index,
            })),
        );
    };

    const setVariantImagePrimary = (
        variantIndex: number,
        imageIndex: number,
    ) => {
        setVariants((rows) =>
            rows.map((r, i) => {
                if (i !== variantIndex) {
                    return r;
                }

                return {
                    ...r,
                    images: r.images.map((img, j) => ({
                        ...img,
                        is_primary: j === imageIndex,
                    })),
                };
            }),
        );
    };

    const applyVariantColorHex = (variantIndex: number, hex: string) => {
        const normalized = normalizeHexColor6(hex);
        if (!normalized) {
            return;
        }
        setVariants((rows) =>
            rows.map((r, i) =>
                i === variantIndex ? { ...r, color_hex: normalized } : r,
            ),
        );
    };

    const [variantMediaOpen, setVariantMediaOpen] = useState<
        Record<number, boolean>
    >({});

    const toggleVariantMedia = (index: number) => {
        setVariantMediaOpen((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const variantFieldErrors = (index: number) => errors.variants?.[index];

    const clearVariantFieldError = (
        index: number,
        field: keyof VariantFieldErrors,
    ) => {
        setErrors((prev) => {
            const row = prev.variants?.[index];
            if (!row?.[field]) {
                return prev;
            }
            const variants = { ...prev.variants };
            const nextRow = { ...variants[index] };
            delete nextRow[field];
            variants[index] = nextRow;

            return { ...prev, variants };
        });
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const clientErrors = validateProductFormClient({
            subcategoryId,
            genderId,
            name,
            variants,
            variantHasSize,
            variantHasColor,
            variantHasImage,
            variantSizeColorKey,
        });

        if (hasAnyFieldErrors(clientErrors)) {
            setErrors(clientErrors);
            if (clientErrors.variants) {
                const openMedia: Record<number, boolean> = {};
                Object.entries(clientErrors.variants).forEach(([i, v]) => {
                    if (v.images) {
                        openMedia[Number(i)] = true;
                    }
                });
                if (Object.keys(openMedia).length > 0) {
                    setVariantMediaOpen((prev) => ({ ...prev, ...openMedia }));
                }
            }
            scrollToFirstProductError(clientErrors);
            setProcessing(false);

            return;
        }

        const buildVariantImagePayload = (rows: ImageFormRow[]) =>
            rows
                .filter((r) => r.path.trim() !== '')
                .map((r, i) => ({
                    ...(r.id != null && r.id > 0 ? { id: r.id } : {}),
                    path: r.path.trim(),
                    alt_text: r.alt_text.trim() || null,
                    sort_order: i,
                    is_primary: r.is_primary,
                }));

        const buildVariantVideoPayload = (rows: VideoFormRow[]) =>
            rows
                .filter((r) => r.url.trim() !== '')
                .map((r, i) => ({
                    ...(r.id != null && r.id > 0 ? { id: r.id } : {}),
                    url: r.url.trim(),
                    provider: r.provider.trim() || null,
                    sort_order: i,
                }));

        const variantsPayload = variants.map((v) => ({
            ...(v.id ? { id: v.id } : {}),
            sku: v.sku.trim(),
            cost: Number(v.cost) || 0,
            compare_at_price: Number(v.mrp) || null,
            list_price: Number(v.mrp) || null,
            discount_percent: Number(v.discountPercent) || 0,
            commission_percent: 0,
            price: Number(v.finalPrice),
            is_active: v.is_active,
            stock_quantity: Number(v.stock) || 0,
            size: normalizeVariantSizeForApi(v.size),
            color: v.color.trim() || null,
            color_hex: normalizeColorHexForApi(v.color_hex),
            barcode: v.barcode.trim() || null,
            is_default: v.is_default,
            images: buildVariantImagePayload(v.images),
            videos: buildVariantVideoPayload(v.videos),
        }));

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
                res = await adminApiPost<AdminApiEnvelope<Product>>(
                    '/products/product-update',
                    {
                        id: existing.id,
                        ...payload,
                    },
                );
            } else {
                res = await adminApiPost<AdminApiEnvelope<Product>>(
                    '/products/product-store',
                    payload,
                );
            }

            if (!res.success) {
                const apiErrors = mergeApiFailure(
                    res.message || 'Could not save.',
                    res.data,
                    variants.map((v) => ({ sku: v.sku })),
                );
                setErrors(apiErrors);
                scrollToFirstProductError(apiErrors);

                return;
            }

            router.visit(route('admin.products.index'));
        } catch {
            const fallback = mergeApiFailure(
                'Could not save.',
                null,
                variants.map((v) => ({ sku: v.sku })),
            );
            setErrors(fallback);
            scrollToFirstProductError(fallback);
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
                <div className={adminProductPageWrap}>
                    <div>
                        <Link
                            href={route('admin.products.index')}
                            className={adminBackLink}
                        >
                            ← Products
                        </Link>
                    </div>

                    {loadError ? (
                        <div className={adminErrorBanner}>{loadError}</div>
                    ) : null}

                    {errors.form ? (
                        <div data-error-anchor="form" className={adminErrorBanner}>
                            {errors.form}
                        </div>
                    ) : null}

                    {loading && (
                        <p className={`mt-4 ${adminMutedText}`}>Loading…</p>
                    )}

                    {!loading && !loadError && (
                    <form
                        noValidate
                        onSubmit={(e) => void submit(e)}
                        className="mt-4 grid gap-6 lg:grid-cols-3 lg:items-start"
                    >
                        <div className="space-y-5 lg:col-span-2">
                        <section className={`${adminFormSection} space-y-4`}>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                            Product details
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <AdminFormField
                                id="name"
                                label="Name"
                                required
                                error={errors.name}
                                dataErrorField="name"
                            >
                                <input
                                    id="name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            name: undefined,
                                        }));
                                    }}
                                    className={adminInput}
                                    placeholder="Enter product name"
                                />
                            </AdminFormField>
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
                        <details className="rounded-xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30">
                            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                SEO (optional)
                            </summary>
                            <div className="grid gap-4 border-t border-slate-200/80 p-4 sm:grid-cols-2 dark:border-slate-700">
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
                        </details>

                        </section>

                        <section className={`${adminFormSection} space-y-4`}>
                            <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                Variants
                            </h3>
                            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                                {variants.length}
                            </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                One row per SKU. Each variant needs a unique size,
                                color, and at least one image. Mark a default;
                                expand media when needed.
                            </p>
                            <div className="mt-4 space-y-4">
                                {variants.map((row, index) => (
                                    <div
                                        key={
                                            row.id
                                                ? `v-${row.id}`
                                                : `new-${index}`
                                        }
                                        className={adminVariantCard}
                                    >
                                        <div className={adminVariantCardHeader}>
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                                                    {index + 1}
                                                </span>
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
                                            </div>
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
                                        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                                            <div className="sm:col-span-2 lg:col-span-1" data-error-field={`variant-${index}-sku`}>
                                                <label
                                                    className={adminLabel}
                                                >
                                                    SKU *
                                                </label>
                                                <input
                                                    value={row.sku}
                                                    onChange={(e) => {
                                                        clearVariantFieldError(index, 'sku');
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
                                                        );
                                                    }}
                                                    required
                                                    className={adminInput}
                                                />
                                                <AdminFieldError message={variantFieldErrors(index)?.sku} />
                                            </div>
                                            <div data-error-field={`variant-${index}-size`}>
                                                <label
                                                    className={adminLabel}
                                                >
                                                    Size{' '}
                                                    <span className="text-red-600 dark:text-red-400">
                                                        *
                                                    </span>
                                                </label>
                                                <select
                                                    required
                                                    value={fashionSizeSelectValue(
                                                        row.size,
                                                    )}
                                                    onChange={(e) => {
                                                        clearVariantFieldError(index, 'size');
                                                        clearVariantFieldError(index, 'combination');
                                                        const v = e.target.value;
                                                        setVariants((rows) =>
                                                            rows.map((r, i) => {
                                                                if (i !== index) {
                                                                    return r;
                                                                }
                                                                if (
                                                                    v ===
                                                                    FASHION_SIZE_OTHER
                                                                ) {
                                                                    return {
                                                                        ...r,
                                                                        size:
                                                                            isCustomFashionSize(
                                                                                r.size,
                                                                            )
                                                                                ? r.size
                                                                                : FASHION_SIZE_FORM_OTHER,
                                                                    };
                                                                }
                                                                if (v === '') {
                                                                    return {
                                                                        ...r,
                                                                        size: '',
                                                                    };
                                                                }

                                                                return {
                                                                    ...r,
                                                                    size: v,
                                                                };
                                                            }),
                                                        );
                                                    }}
                                                    className={adminInput}
                                                >
                                                    <option value="">
                                                        — None —
                                                    </option>
                                                    {FASHION_SIZE_OPTION_GROUPS.map(
                                                        (group) => (
                                                            <optgroup
                                                                key={
                                                                    group.label
                                                                }
                                                                label={
                                                                    group.label
                                                                }
                                                            >
                                                                {group.options.map(
                                                                    (s) => (
                                                                        <option
                                                                            key={
                                                                                s
                                                                            }
                                                                            value={
                                                                                s
                                                                            }
                                                                        >
                                                                            {
                                                                                s
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </optgroup>
                                                        ),
                                                    )}
                                                    <option value={FASHION_SIZE_OTHER}>
                                                        Other (custom)…
                                                    </option>
                                                </select>
                                                {fashionSizeSelectValue(
                                                    row.size,
                                                ) === FASHION_SIZE_OTHER ? (
                                                    <input
                                                        value={fashionCustomSizeInputValue(
                                                            row.size,
                                                        )}
                                                        onChange={(e) =>
                                                            setVariants(
                                                                (rows) =>
                                                                    rows.map(
                                                                        (
                                                                            r,
                                                                            i,
                                                                        ) =>
                                                                            i ===
                                                                            index
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
                                                        placeholder="e.g. 42½, 6–8Y"
                                                        className={`${adminInput} mt-2`}
                                                    />
                                                ) : null}
                                                <AdminFieldError message={variantFieldErrors(index)?.size} />
                                                <AdminFieldError message={variantFieldErrors(index)?.combination} />
                                            </div>
                                            <div className="sm:col-span-2 lg:col-span-3" data-error-field={`variant-${index}-color`}>
                                                <VariantColorField
                                                    row={row}
                                                    onColorNameChange={(value) => {
                                                        clearVariantFieldError(index, 'color');
                                                        clearVariantFieldError(index, 'combination');
                                                        setVariants((rows) =>
                                                            rows.map((r, i) =>
                                                                i === index ? { ...r, color: value } : r,
                                                            ),
                                                        );
                                                    }}
                                                    onColorHexChange={(value) => {
                                                        clearVariantFieldError(index, 'color');
                                                        clearVariantFieldError(index, 'combination');
                                                        setVariants((rows) =>
                                                            rows.map((r, i) =>
                                                                i === index ? { ...r, color_hex: value } : r,
                                                            ),
                                                        );
                                                    }}
                                                    onPresetPick={(hex) => {
                                                        clearVariantFieldError(index, 'color');
                                                        clearVariantFieldError(index, 'combination');
                                                        applyVariantColorHex(index, hex);
                                                    }}
                                                    colorNameError={variantFieldErrors(index)?.color}
                                                    colorError={variantFieldErrors(index)?.color}
                                                    colorHexError={variantFieldErrors(index)?.color_hex}
                                                    combinationError={variantFieldErrors(index)?.combination}
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
                                        <VariantPricingGrid
                                            row={row}
                                            onChange={(next) => {
                                                clearVariantFieldError(
                                                    index,
                                                    'price',
                                                );
                                                setVariants((rows) =>
                                                    rows.map((r, i) =>
                                                        i === index
                                                            ? { ...r, ...next }
                                                            : r,
                                                    ),
                                                );
                                            }}
                                            priceError={
                                                variantFieldErrors(index)?.price
                                            }
                                        />
                                        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700" data-error-field={`variant-${index}-media`}>
                                            <VariantMediaToggle
                                                open={variantMediaOpen[index] ?? false}
                                                onToggle={() => toggleVariantMedia(index)}
                                                imageCount={row.images.filter((img) => img.path.trim() !== '').length}
                                                videoCount={row.videos.filter((vid) => vid.url.trim() !== '').length}
                                            />
                                            <AdminFieldError message={variantFieldErrors(index)?.media} />
                                            {!(variantMediaOpen[index] ?? false) ? (
                                                <AdminFieldError
                                                    message={
                                                        variantFieldErrors(index)
                                                            ?.images
                                                    }
                                                />
                                            ) : null}
                                            {(variantMediaOpen[index] ?? false) ? (
                                            <div className="mt-3 space-y-5">
                                            <div data-error-field={`variant-${index}-images`}>
                                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    Images{' '}
                                                    <span className="text-red-600 dark:text-red-400">*</span>
                                                </h4>
                                                <AdminFieldError message={variantFieldErrors(index)?.images} />
                                                <div className="mt-3 space-y-4">
                                                    {row.images.map(
                                                        (imgRow, imgIndex) => (
                                                            <div
                                                                key={`v-${index}-img-${imgRow.id ?? imgIndex}`}
                                                                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                                                            >
                                                                <div className="mb-2 flex justify-end">
                                                                    {row.images
                                                                        .length >
                                                                    1 ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setVariants(
                                                                                    (
                                                                                        rows,
                                                                                    ) =>
                                                                                        rows.map(
                                                                                            (
                                                                                                r,
                                                                                                i,
                                                                                            ) =>
                                                                                                i ===
                                                                                                index
                                                                                                    ? {
                                                                                                          ...r,
                                                                                                          images:
                                                                                                              r.images.filter(
                                                                                                                  (
                                                                                                                      _,
                                                                                                                      j,
                                                                                                                  ) =>
                                                                                                                      j !==
                                                                                                                      imgIndex,
                                                                                                              ),
                                                                                                      }
                                                                                                    : r,
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
                                                                    <div className="space-y-2 sm:col-span-2">
                                                                        <label
                                                                            className={
                                                                                adminLabel
                                                                            }
                                                                        >
                                                                            Image
                                                                            file
                                                                        </label>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            disabled={
                                                                                uploadBusyKey ===
                                                                                `v${index}-img${imgIndex}`
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) => {
                                                                                const f =
                                                                                    e
                                                                                        .target
                                                                                        .files?.[0];
                                                                                void handleVariantImageUpload(
                                                                                    index,
                                                                                    imgIndex,
                                                                                    f,
                                                                                    e.currentTarget,
                                                                                );
                                                                            }}
                                                                            className={`block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-500 dark:text-slate-200 dark:file:bg-violet-500 dark:hover:file:bg-violet-400`}
                                                                        />
                                                                        {uploadBusyKey ===
                                                                        `v${index}-img${imgIndex}` ? (
                                                                            <p
                                                                                className={`text-xs ${adminMutedText}`}
                                                                            >
                                                                                Uploading…
                                                                            </p>
                                                                        ) : null}
                                                                        {imgRow.path.trim() !==
                                                                        '' ? (
                                                                            <div className="mt-2 flex flex-wrap items-start gap-3">
                                                                                {productImagePreviewSrc(
                                                                                    imgRow.path,
                                                                                ) ? (
                                                                                    <img
                                                                                        src={productImagePreviewSrc(
                                                                                            imgRow.path,
                                                                                        )}
                                                                                        alt=""
                                                                                        className="h-24 w-24 rounded-lg border border-slate-200 object-cover dark:border-slate-600"
                                                                                    />
                                                                                ) : null}
                                                                                <div className="min-w-0 flex-1 space-y-2">
                                                                                    {isExternalHttpUrl(
                                                                                        imgRow.path,
                                                                                    ) ? (
                                                                                        <p
                                                                                            className={`text-xs ${adminMutedText}`}
                                                                                        >
                                                                                            External
                                                                                            image
                                                                                            URL
                                                                                            (upload
                                                                                            a
                                                                                            file
                                                                                            to
                                                                                            replace).
                                                                                        </p>
                                                                                    ) : null}
                                                                                    <p className="truncate font-mono text-xs text-slate-600 dark:text-slate-400">
                                                                                        {
                                                                                            imgRow.path
                                                                                        }
                                                                                    </p>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            setVariants(
                                                                                                (
                                                                                                    rows,
                                                                                                ) =>
                                                                                                    rows.map(
                                                                                                        (
                                                                                                            r,
                                                                                                            i,
                                                                                                        ) =>
                                                                                                            i ===
                                                                                                            index
                                                                                                                ? {
                                                                                                                      ...r,
                                                                                                                      images:
                                                                                                                          r.images.map(
                                                                                                                              (
                                                                                                                                  ir,
                                                                                                                                  j,
                                                                                                                              ) =>
                                                                                                                                  j ===
                                                                                                                                  imgIndex
                                                                                                                                      ? {
                                                                                                                                            ...ir,
                                                                                                                                            path: '',
                                                                                                                                            id: undefined,
                                                                                                                                        }
                                                                                                                                      : ir,
                                                                                                                          ),
                                                                                                                  }
                                                                                                                : r,
                                                                                                    ),
                                                                                            )
                                                                                        }
                                                                                        className={`text-sm font-semibold text-slate-600 underline dark:text-slate-300`}
                                                                                    >
                                                                                        Clear
                                                                                        image
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <p
                                                                                className={`text-xs ${adminMutedText}`}
                                                                            >
                                                                                No
                                                                                image
                                                                                selected
                                                                                yet.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <label
                                                                            className={
                                                                                adminLabel
                                                                            }
                                                                        >
                                                                            Alt
                                                                            text
                                                                        </label>
                                                                        <input
                                                                            value={
                                                                                imgRow.alt_text
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setVariants(
                                                                                    (
                                                                                        rows,
                                                                                    ) =>
                                                                                        rows.map(
                                                                                            (
                                                                                                r,
                                                                                                i,
                                                                                            ) =>
                                                                                                i ===
                                                                                                index
                                                                                                    ? {
                                                                                                          ...r,
                                                                                                          images:
                                                                                                              r.images.map(
                                                                                                                  (
                                                                                                                      ir,
                                                                                                                      j,
                                                                                                                  ) =>
                                                                                                                      j ===
                                                                                                                      imgIndex
                                                                                                                          ? {
                                                                                                                                ...ir,
                                                                                                                                alt_text:
                                                                                                                                    e
                                                                                                                                        .target
                                                                                                                                        .value,
                                                                                                                            }
                                                                                                                          : ir,
                                                                                                              ),
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
                                                                            name={`variant-${index}-img-primary`}
                                                                            checked={
                                                                                imgRow.is_primary
                                                                            }
                                                                            onChange={() =>
                                                                                setVariantImagePrimary(
                                                                                    index,
                                                                                    imgIndex,
                                                                                )
                                                                            }
                                                                            className="border-slate-300 text-violet-600 focus:ring-violet-500"
                                                                        />
                                                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                                                            Primary
                                                                            for this
                                                                            variant
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setVariants((rows) =>
                                                            rows.map((r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          images: [
                                                                              ...r.images,
                                                                              {
                                                                                  path: '',
                                                                                  alt_text:
                                                                                      '',
                                                                                  is_primary:
                                                                                      false,
                                                                              },
                                                                          ],
                                                                      }
                                                                    : r,
                                                            ),
                                                        )
                                                    }
                                                    className={`mt-3 ${adminCancelBtn}`}
                                                >
                                                    + Add image row
                                                </button>
                                            </div>
                                            <div>
                                                <h4
                                                    className={`text-sm font-semibold text-slate-800 dark:text-slate-100`}
                                                >
                                                    Videos (this variant)
                                                </h4>
                                                <p
                                                    className={`mt-1 ${adminMutedText}`}
                                                >
                                                    Upload video files only
                                                    (MP4, WebM, and similar). Existing
                                                    YouTube or Vimeo links stay
                                                    attached until you upload a
                                                    replacement file.
                                                </p>
                                                <div className="mt-3 space-y-4">
                                                    {row.videos.map(
                                                        (vidRow, vidIndex) => (
                                                            <div
                                                                key={`v-${index}-vid-${vidRow.id ?? vidIndex}`}
                                                                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                                                            >
                                                                <div className="mb-2 flex justify-end">
                                                                    {row.videos
                                                                        .length >
                                                                    1 ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setVariants(
                                                                                    (
                                                                                        rows,
                                                                                    ) =>
                                                                                        rows.map(
                                                                                            (
                                                                                                r,
                                                                                                i,
                                                                                            ) =>
                                                                                                i ===
                                                                                                index
                                                                                                    ? {
                                                                                                          ...r,
                                                                                                          videos:
                                                                                                              r.videos.filter(
                                                                                                                  (
                                                                                                                      _,
                                                                                                                      j,
                                                                                                                  ) =>
                                                                                                                      j !==
                                                                                                                      vidIndex,
                                                                                                              ),
                                                                                                      }
                                                                                                    : r,
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
                                                                    <div className="space-y-2 sm:col-span-2">
                                                                        <label
                                                                            className={
                                                                                adminLabel
                                                                            }
                                                                        >
                                                                            Video
                                                                            file
                                                                        </label>
                                                                        <input
                                                                            type="file"
                                                                            accept="video/*"
                                                                            disabled={
                                                                                uploadBusyKey ===
                                                                                `v${index}-vid${vidIndex}`
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) => {
                                                                                const f =
                                                                                    e
                                                                                        .target
                                                                                        .files?.[0];
                                                                                void handleVariantVideoUpload(
                                                                                    index,
                                                                                    vidIndex,
                                                                                    f,
                                                                                    e.currentTarget,
                                                                                );
                                                                            }}
                                                                            className={`block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-500 dark:text-slate-200 dark:file:bg-violet-500 dark:hover:file:bg-violet-400`}
                                                                        />
                                                                        {uploadBusyKey ===
                                                                        `v${index}-vid${vidIndex}` ? (
                                                                            <p
                                                                                className={`text-xs ${adminMutedText}`}
                                                                            >
                                                                                Uploading…
                                                                            </p>
                                                                        ) : null}
                                                                        {vidRow.url.trim() !==
                                                                        '' ? (
                                                                            <div className="mt-2 space-y-2">
                                                                                {isHostedEmbedVideoUrl(
                                                                                    vidRow.url,
                                                                                ) ? (
                                                                                    <p
                                                                                        className={`text-xs ${adminMutedText}`}
                                                                                    >
                                                                                        Embedded
                                                                                        video
                                                                                        link
                                                                                        (upload
                                                                                        a
                                                                                        file
                                                                                        to
                                                                                        replace):{' '}
                                                                                        <span className="break-all font-mono text-slate-600 dark:text-slate-400">
                                                                                            {
                                                                                                vidRow.url
                                                                                            }
                                                                                        </span>
                                                                                    </p>
                                                                                ) : (
                                                                                    <div className="space-y-2">
                                                                                        <video
                                                                                            src={
                                                                                                vidRow.url
                                                                                            }
                                                                                            controls
                                                                                            className="max-h-48 max-w-full rounded-lg border border-slate-200 dark:border-slate-600"
                                                                                        />
                                                                                        <p className="break-all font-mono text-xs text-slate-600 dark:text-slate-400">
                                                                                            {
                                                                                                vidRow.url
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                )}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        setVariants(
                                                                                            (
                                                                                                rows,
                                                                                            ) =>
                                                                                                rows.map(
                                                                                                    (
                                                                                                        r,
                                                                                                        i,
                                                                                                    ) =>
                                                                                                        i ===
                                                                                                        index
                                                                                                            ? {
                                                                                                                  ...r,
                                                                                                                  videos:
                                                                                                                      r.videos.map(
                                                                                                                          (
                                                                                                                              vr,
                                                                                                                              j,
                                                                                                                          ) =>
                                                                                                                              j ===
                                                                                                                              vidIndex
                                                                                                                                  ? {
                                                                                                                                        ...vr,
                                                                                                                                        url: '',
                                                                                                                                        id: undefined,
                                                                                                                                        provider:
                                                                                                                                            '',
                                                                                                                                    }
                                                                                                                                  : vr,
                                                                                                                      ),
                                                                                                              }
                                                                                                            : r,
                                                                                                ),
                                                                                        )
                                                                                    }
                                                                                    className={`text-sm font-semibold text-slate-600 underline dark:text-slate-300`}
                                                                                >
                                                                                    Clear
                                                                                    video
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <p
                                                                                className={`text-xs ${adminMutedText}`}
                                                                            >
                                                                                No
                                                                                video
                                                                                selected
                                                                                yet.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setVariants((rows) =>
                                                            rows.map((r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          videos: [
                                                                              ...r.videos,
                                                                              {
                                                                                  url: '',
                                                                                  provider:
                                                                                      '',
                                                                              },
                                                                          ],
                                                                      }
                                                                    : r,
                                                            ),
                                                        )
                                                    }
                                                    className={`mt-3 ${adminCancelBtn}`}
                                                >
                                                    + Add video row
                                                </button>
                                            </div>
                                            </div>
                                            ) : null}
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
                        </section>
                        </div>

                        <aside className={`${adminStickyAside} lg:col-span-1`}>
                            <section className={`${adminFormSection} space-y-4`}>
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Catalog &amp; status</h2>
                                <div>
                                    <label htmlFor="brand_id" className={adminLabel}>Brand</label>
                                    <select id="brand_id" value={brandId ?? ''} onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : null)} className={adminInput}>
                                        <option value="">— None —</option>
                                        {meta.brands.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                                    </select>
                                </div>
                                <div data-error-field="subcategory_id">
                                    <label htmlFor="subcategory_id" className={adminLabel}>
                                        Subcategory{' '}
                                        <span className="text-red-600 dark:text-red-400">*</span>
                                    </label>
                                    <select
                                        id="subcategory_id"
                                        required
                                        value={subcategoryId ?? ''}
                                        onChange={(e) => {
                                            setSubcategoryId(
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : null,
                                            );
                                            setErrors((prev) => ({
                                                ...prev,
                                                subcategory_id: undefined,
                                            }));
                                        }}
                                        className={adminInput}
                                    >
                                        <option value="" disabled>
                                            Select subcategory
                                        </option>
                                        {meta.subcategories.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                                {s.category?.name
                                                    ? ` (${s.category.name})`
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <AdminFieldError message={errors.subcategory_id} />
                                    {meta.subcategories.length === 0 ? (
                                        <p className={`mt-1 ${adminMutedText}`}>
                                            No subcategories yet. Add one under Categories.
                                        </p>
                                    ) : null}
                                </div>
                                <div data-error-field="gender_id">
                                    <label htmlFor="gender_id" className={adminLabel}>
                                        Gender{' '}
                                        <span className="text-red-600 dark:text-red-400">*</span>
                                    </label>
                                    <select
                                        id="gender_id"
                                        required
                                        value={genderId ?? ''}
                                        onChange={(e) => {
                                            setGenderId(
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : null,
                                            );
                                            setErrors((prev) => ({
                                                ...prev,
                                                gender_id: undefined,
                                            }));
                                        }}
                                        className={adminInput}
                                    >
                                        <option value="" disabled>
                                            Select gender
                                        </option>
                                        {meta.genders.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.name}
                                            </option>
                                        ))}
                                    </select>
                                    <AdminFieldError message={errors.gender_id} />
                                    {meta.genders.length === 0 ? (
                                        <p className={`mt-1 ${adminMutedText}`}>
                                            No active genders. Add genders in catalog settings.
                                        </p>
                                    ) : null}
                                </div>
                                <div>
                                    <label htmlFor="status" className={adminLabel}>Status</label>
                                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={adminInput}>
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className={adminCheckbox} />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Featured</span>
                                </label>
                            </section>
                            <PublishPanel processing={processing} cancelHref={route('admin.products.index')} />
                        </aside>
                    </form>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
