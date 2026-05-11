import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import { Head } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';

type ProductRow = {
    id: number;
    name: string;
    slug: string;
    status: string;
    is_featured: boolean;
    brand?: { name: string } | null;
    variants?: { sku: string; price: string }[];
};

type PaginatorPayload = {
    data: ProductRow[];
    current_page: number;
    last_page: number;
};

type ApiListResponse = {
    success: boolean;
    message: string;
    data: PaginatorPayload;
};

export default function Catalog() {
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [payload, setPayload] = useState<PaginatorPayload | null>(null);

    const load = async (p: number, kw: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await window.axios.post<ApiListResponse>('/api/v1/catalog/products/list', {
                per_page: 12,
                current_page: p,
                keyword: kw || undefined,
                status: 'published',
            });
            if (!res.data.success || !res.data.data) {
                setError(res.data.message || 'Could not load catalog');
                setPayload(null);

                return;
            }
            setPayload(res.data.data);
        } catch {
            setError('Network error loading catalog.');
            setPayload(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load(1, '');
    }, []);

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        setPage(1);
        void load(1, keyword);
    };

    const goPage = (p: number) => {
        setPage(p);
        void load(p, keyword);
    };

    return (
        <GuestPanelLayout title="Browse">
            <Head title="Store · Browse" />
            <form onSubmit={onSearch} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search products"
                    className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button type="submit" className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
                    Search
                </button>
            </form>

            {error ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
            ) : null}

            {loading ? (
                <p className="text-sm text-slate-500">Loading products…</p>
            ) : payload && payload.data.length === 0 ? (
                <p className="text-sm text-slate-600">No products found. Try another search or seed the database.</p>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {payload?.data.map((product) => {
                            const price = product.variants?.[0]?.price;

                            return (
                                <article
                                    key={product.id}
                                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    {product.is_featured ? (
                                        <span className="mb-2 w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                            Featured
                                        </span>
                                    ) : null}
                                    <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
                                    {product.brand ? (
                                        <p className="text-xs font-medium uppercase text-slate-500">{product.brand.name}</p>
                                    ) : null}
                                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{product.slug}</p>
                                    {price !== undefined ? (
                                        <p className="mt-4 text-base font-bold text-slate-900">${price}</p>
                                    ) : (
                                        <p className="mt-4 text-sm text-slate-400">No variant price</p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                    {payload && payload.last_page > 1 ? (
                        <div className="mt-8 flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => goPage(page - 1)}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-slate-600">
                                Page {payload.current_page} of {payload.last_page}
                            </span>
                            <button
                                type="button"
                                disabled={page >= payload.last_page}
                                onClick={() => goPage(page + 1)}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    ) : null}
                </>
            )}
        </GuestPanelLayout>
    );
}
