import { catalogSearchSuggestions } from '@/api/catalogClient';
import { catalogUrl } from '@/store/fashionBrand';
import type { CatalogSearchSuggestion } from '@/store/catalogTypes';
import { productImageSrc } from '@/store/productUtils';
import {
    storeHeaderSearchBtn,
    storeHeaderSearchDropdown,
    storeHeaderSearchForm,
    storeHeaderSearchInput,
    storeHeaderSearchOption,
    storeHeaderSearchOptionActive,
    storeHeaderSearchOptionMeta,
    storeHeaderSearchViewAll,
} from '@/store/storeTheme';
import { Link, router, usePage } from '@inertiajs/react';
import {
    FormEvent,
    KeyboardEvent,
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 280;

function isGuestCatalogRoute(): boolean {
    try {
        return route().current('guest.catalog') === true;
    } catch {
        return false;
    }
}

function readKeywordFromLocation(): string {
    if (typeof window === 'undefined') {
        return '';
    }

    return new URLSearchParams(window.location.search).get('keyword') ?? '';
}

type HeaderCatalogSearchProps = {
    className?: string;
    id?: string;
};

export default function HeaderCatalogSearch({ className = '', id }: HeaderCatalogSearchProps) {
    const listboxId = useId();
    const { url } = usePage();
    const onCatalog = isGuestCatalogRoute();
    const rootRef = useRef<HTMLDivElement>(null);
    const fetchIdRef = useRef(0);

    const [draft, setDraft] = useState(() => (onCatalog ? readKeywordFromLocation() : ''));
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<CatalogSearchSuggestion[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => {
        if (onCatalog) {
            setDraft(readKeywordFromLocation());
        }
    }, [url, onCatalog]);

    const navigateToKeyword = useCallback(
        (keyword: string) => {
            const trimmed = keyword.trim();
            const href = trimmed ? catalogUrl({ keyword: trimmed }) : route('guest.catalog');
            const visitOptions = onCatalog
                ? { preserveState: true, preserveScroll: true, only: [] as string[] }
                : {};

            setOpen(false);
            router.get(href, {}, visitOptions);
        },
        [onCatalog],
    );

    const fetchSuggestions = useCallback(async (query: string) => {
        const fetchId = ++fetchIdRef.current;

        if (query.length < MIN_QUERY_LENGTH) {
            setSuggestions([]);
            setLoading(false);

            return;
        }

        setLoading(true);

        try {
            const res = await catalogSearchSuggestions(query);
            if (fetchId !== fetchIdRef.current) {
                return;
            }

            setSuggestions(res.success && res.data ? res.data : []);
        } catch {
            if (fetchId === fetchIdRef.current) {
                setSuggestions([]);
            }
        } finally {
            if (fetchId === fetchIdRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const query = draft.trim();
        if (query.length < MIN_QUERY_LENGTH) {
            setSuggestions([]);
            setLoading(false);
            setActiveIndex(-1);

            return;
        }

        const timer = window.setTimeout(() => {
            void fetchSuggestions(query);
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [draft, open, fetchSuggestions]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onDocClick);

        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    const optionCount = suggestions.length;
    const viewAllIndex = optionCount;

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        navigateToKeyword(draft);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            setOpen(true);

            return;
        }

        if (e.key === 'Escape') {
            setOpen(false);
            setActiveIndex(-1);

            return;
        }

        if (!open || optionCount === 0) {
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => (i < viewAllIndex ? i + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => (i > 0 ? i - 1 : viewAllIndex));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            if (activeIndex < optionCount) {
                const item = suggestions[activeIndex];
                setOpen(false);
                router.visit(route('guest.product.show', item.slug));
            } else {
                navigateToKeyword(draft);
            }
        }
    };

    const showDropdown = open && draft.trim().length >= MIN_QUERY_LENGTH;

    return (
        <div ref={rootRef} className={`${storeHeaderSearchForm} ${className}`.trim()}>
            <form id={id} role="search" onSubmit={submitSearch}>
                <input
                    type="search"
                    value={draft}
                    onChange={(e) => {
                        setDraft(e.target.value);
                        setOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder="Search name or SKU"
                    autoComplete="off"
                    enterKeyHint="search"
                    aria-label="Search products"
                    aria-expanded={showDropdown}
                    aria-controls={showDropdown ? listboxId : undefined}
                    aria-autocomplete="list"
                    className={storeHeaderSearchInput}
                />
                <button type="submit" className={storeHeaderSearchBtn} aria-label="Search">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </button>
            </form>

            {showDropdown ? (
                <ul
                    id={listboxId}
                    role="listbox"
                    className={storeHeaderSearchDropdown}
                    aria-label="Search suggestions"
                >
                    {loading && suggestions.length === 0 ? (
                        <li className="px-3 py-2.5 text-sm text-stone-500 dark:text-stone-400">
                            Searching…
                        </li>
                    ) : null}
                    {!loading && suggestions.length === 0 ? (
                        <li className="px-3 py-2.5 text-sm text-stone-500 dark:text-stone-400">
                            No matching products
                        </li>
                    ) : null}
                    {suggestions.map((item, index) => {
                        const thumb = productImageSrc(item.image_path);
                        const meta = [item.sku, item.category].filter(Boolean).join(' · ');

                        return (
                            <li key={item.id} role="option" aria-selected={activeIndex === index}>
                                <Link
                                    href={route('guest.product.show', item.slug)}
                                    className={`${storeHeaderSearchOption} ${
                                        activeIndex === index ? storeHeaderSearchOptionActive : ''
                                    }`}
                                    onClick={() => setOpen(false)}
                                >
                                    {thumb ? (
                                        <img
                                            src={thumb}
                                            alt=""
                                            className="h-10 w-10 shrink-0 object-cover bg-stone-100 dark:bg-stone-800"
                                        />
                                    ) : (
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-stone-100 text-[10px] uppercase text-stone-400 dark:bg-stone-800">
                                            —
                                        </span>
                                    )}
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium text-stone-900 dark:text-stone-100">
                                            {item.name}
                                        </span>
                                        {meta ? (
                                            <span className={storeHeaderSearchOptionMeta}>
                                                {meta}
                                            </span>
                                        ) : null}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                    {!loading ? (
                        <li role="option" aria-selected={activeIndex === viewAllIndex}>
                            <button
                                type="button"
                                className={`${storeHeaderSearchViewAll} ${
                                    activeIndex === viewAllIndex ? storeHeaderSearchOptionActive : ''
                                }`}
                                onClick={() => navigateToKeyword(draft)}
                            >
                                View all results for &ldquo;{draft.trim()}&rdquo;
                            </button>
                        </li>
                    ) : null}
                </ul>
            ) : null}
        </div>
    );
}
