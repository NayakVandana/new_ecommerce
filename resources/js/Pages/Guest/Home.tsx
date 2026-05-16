import ProductCard from '@/Components/store/ProductCard';
import { catalogBrandsList, catalogProductsList } from '@/api/catalogClient';
import type { CatalogBrand, CatalogProduct } from '@/store/catalogTypes';
import { useWomenStore } from '@/hooks/useWomenStore';
import { catalogUrl, catalogUrlForCategory } from '@/store/fashionBrand';
import {
    storeBtnGhost,
    storeBtnPrimary,
    storeBtnSecondary,
    storeCategoryTile,
    storeHero,
    storeHeroLead,
    storeHeroActions,
    storeHeroBtn,
    storeHeroTitle,
    storeMutedText,
    storeProductGrid,
    storeSectionEyebrow,
    storeSectionTitle,
} from '@/store/storeTheme';
import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Home() {
    const { shopCategories, defaultProductFilters, ready } = useWomenStore();
    const [featured, setFeatured] = useState<CatalogProduct[]>([]);
    const [brands, setBrands] = useState<CatalogBrand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ready) {
            return;
        }

        void Promise.all([
            catalogProductsList({
                per_page: 8,
                featured_only: true,
                ...defaultProductFilters,
            }),
            catalogBrandsList(),
        ])
            .then(([productsRes, brandsRes]) => {
                if (productsRes.success && productsRes.data) {
                    setFeatured(productsRes.data.data);
                }
                if (brandsRes.success && brandsRes.data) {
                    setBrands(brandsRes.data.data.slice(0, 6));
                }
            })
            .finally(() => setLoading(false));
    }, [ready, defaultProductFilters]);

    return (
        <GuestPanelLayout>
            <Head title="Suhaag · Women's ethnic wear" />

            <section className={storeHero}>
                <div className="mx-auto max-w-3xl">
                    <p className={storeSectionEyebrow}>Handpicked ethnic</p>
                    <h1 className={`${storeHeroTitle} mt-3`}>
                        Sarees, kurtas & tunics for every occasion
                    </h1>
                    <p className={storeHeroLead}>
                        Shop women&apos;s ethnic wear only — Banarasi silks, kurta sets, salwar
                        suits, and everyday tunics. Live stock from our catalog API.
                    </p>
                    <div className={storeHeroActions}>
                        {shopCategories[0] ? (
                            <Link
                                href={catalogUrlForCategory(shopCategories[0].id)}
                                className={`${storeBtnPrimary} ${storeHeroBtn}`}
                            >
                                Shop sarees
                            </Link>
                        ) : (
                            <Link
                                href={route('guest.catalog')}
                                className={`${storeBtnPrimary} ${storeHeroBtn}`}
                            >
                                Shop collection
                            </Link>
                        )}
                        <Link
                            href={catalogUrl({ featured_only: true })}
                            className={`${storeBtnSecondary} ${storeHeroBtn}`}
                        >
                            New arrivals
                        </Link>
                    </div>
                </div>
            </section>

            {shopCategories.length > 0 ? (
                <section className="mt-10 grid grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-4">
                    {shopCategories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={catalogUrlForCategory(cat.id)}
                            className={storeCategoryTile}
                        >
                            <span className="absolute inset-0 bg-gradient-to-t from-rose-950/90 via-stone-900/30 to-rose-900/10" />
                            <span className="relative font-display text-2xl text-white">{cat.name}</span>
                            <span className="relative mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-100/90">
                                Shop now →
                            </span>
                        </Link>
                    ))}
                </section>
            ) : null}

            <section className="mt-16">
                <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-stone-800">
                    <div>
                        <p className={storeSectionEyebrow}>Editor&apos;s pick</p>
                        <h2 className={`${storeSectionTitle} mt-1`}>New & featured</h2>
                    </div>
                    <Link href={catalogUrl({ featured_only: true })} className={storeBtnGhost}>
                        View all
                    </Link>
                </div>
                {loading ? (
                    <p className={`mt-8 ${storeMutedText}`}>Loading collection…</p>
                ) : featured.length === 0 ? (
                    <p className={`mt-8 ${storeMutedText}`}>
                        New pieces arriving soon.{' '}
                        <Link href={route('guest.catalog')} className="underline">
                            Browse ethnic wear
                        </Link>
                    </p>
                ) : (
                    <div className={`mt-8 ${storeProductGrid}`}>
                        {featured.map((product) => (
                            <ProductCard key={product.id} product={product} compact />
                        ))}
                    </div>
                )}
            </section>

            {brands.length > 0 ? (
                <section className="mt-16 border-t border-stone-200 pt-12 dark:border-stone-800">
                    <p className={storeSectionEyebrow}>Labels</p>
                    <h2 className={`${storeSectionTitle} mt-2`}>Our designers</h2>
                    <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={catalogUrl({ brand_id: brand.id })}
                                className="font-display text-lg text-stone-800 hover:underline dark:text-stone-200"
                            >
                                {brand.name}
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className="mt-12 grid grid-cols-1 gap-6 border border-stone-200 bg-stone-100 p-5 dark:border-stone-800 dark:bg-stone-900/50 sm:mt-16 sm:grid-cols-3 sm:p-8">
                {[
                    {
                        title: 'Pure ethnic',
                        text: 'Every piece is listed under sarees, kurtas & suits, or tunics.',
                    },
                    {
                        title: 'Sizes & drapes',
                        text: 'Choose variant size and colour — stock updates in real time.',
                    },
                    {
                        title: 'Your account',
                        text: 'Save orders and profile across web and mobile with one login.',
                    },
                ].map((item) => (
                    <div key={item.title}>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-900 dark:text-stone-100">
                            {item.title}
                        </p>
                        <p className={`mt-2 ${storeMutedText}`}>{item.text}</p>
                    </div>
                ))}
            </section>
        </GuestPanelLayout>
    );
}
