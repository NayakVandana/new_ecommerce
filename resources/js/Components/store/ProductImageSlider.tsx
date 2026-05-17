import type { GalleryImage } from '@/store/productUtils';
import {
    useCallback,
    useEffect,
    useState,
    type MouseEvent,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type Props = {
    images: GalleryImage[];
    productName: string;
    resetKey?: string | number;
};

function NavButton({
    label,
    onClick,
    className,
    children,
}: {
    label: string;
    onClick: (e: MouseEvent<HTMLButtonElement>) => void;
    className: string;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
            aria-label={label}
        >
            {children}
        </button>
    );
}

export default function ProductImageSlider({
    images,
    productName,
    resetKey,
}: Props) {
    const [index, setIndex] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const count = images.length;
    const safeIndex = count > 0 ? Math.min(index, count - 1) : 0;
    const current = images[safeIndex];

    useEffect(() => {
        setIndex(0);
        setFullscreen(false);
    }, [resetKey]);

    const go = useCallback(
        (delta: number) => {
            if (count <= 1) {
                return;
            }
            setIndex((i) => (i + delta + count) % count);
        },
        [count],
    );

    const openFullscreen = useCallback(() => {
        if (count > 0) {
            setFullscreen(true);
        }
    }, [count]);

    const closeFullscreen = useCallback(() => {
        setFullscreen(false);
    }, []);

    useEffect(() => {
        if (!fullscreen) {
            return;
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeFullscreen();
            } else if (e.key === 'ArrowLeft') {
                go(-1);
            } else if (e.key === 'ArrowRight') {
                go(1);
            }
        };

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [fullscreen, closeFullscreen, go]);

    const navBtnClass =
        'flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl font-medium text-stone-900 shadow-lg transition hover:bg-white dark:bg-stone-900/90 dark:text-stone-100';

    const fullscreenOverlay =
        fullscreen && typeof document !== 'undefined'
            ? createPortal(
                  <div
                      className="fixed inset-0 z-[200] flex flex-col bg-black/95"
                      role="dialog"
                      aria-modal="true"
                      aria-label={`${productName} gallery fullscreen`}
                  >
                      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white">
                          <p className="truncate text-sm font-medium">
                              {productName}
                              {count > 1 ? (
                                  <span className="ml-2 text-white/70">
                                      {safeIndex + 1} / {count}
                                  </span>
                              ) : null}
                          </p>
                          <button
                              type="button"
                              onClick={closeFullscreen}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl leading-none transition hover:bg-white/20"
                              aria-label="Close fullscreen"
                          >
                              ×
                          </button>
                      </div>

                      <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 py-4">
                          {count > 1 ? (
                              <NavButton
                                  label="Previous image"
                                  onClick={() => go(-1)}
                                  className={`absolute left-3 top-1/2 z-10 -translate-y-1/2 sm:left-6 ${navBtnClass}`}
                              >
                                  ‹
                              </NavButton>
                          ) : null}

                          <img
                              key={`fs-${current.key}`}
                              src={current.src}
                              alt={current.alt || productName}
                              className="max-h-[calc(100dvh-10rem)] max-w-full object-contain"
                          />

                          {count > 1 ? (
                              <NavButton
                                  label="Next image"
                                  onClick={() => go(1)}
                                  className={`absolute right-3 top-1/2 z-10 -translate-y-1/2 sm:right-6 ${navBtnClass}`}
                              >
                                  ›
                              </NavButton>
                          ) : null}
                      </div>

                      {count > 1 ? (
                          <div className="shrink-0 border-t border-white/10 px-4 py-4">
                              <div className="mx-auto flex max-w-3xl justify-center gap-2 overflow-x-auto pb-1">
                                  {images.map((img, i) => (
                                      <button
                                          key={`fs-thumb-${img.key}`}
                                          type="button"
                                          onClick={() => setIndex(i)}
                                          className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                              i === safeIndex
                                                  ? 'border-white ring-2 ring-white/30'
                                                  : 'border-transparent opacity-60 hover:opacity-100'
                                          }`}
                                          aria-label={`View image ${i + 1}`}
                                      >
                                          <img
                                              src={img.src}
                                              alt=""
                                              className="h-full w-full object-cover"
                                          />
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ) : null}
                  </div>,
                  document.body,
              )
            : null;

    if (count === 0) {
        return (
            <div className="flex aspect-[3/4] items-center justify-center bg-stone-200 sm:aspect-square dark:bg-stone-800">
                <span className="text-sm text-stone-400">No image</span>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                <div className="group relative aspect-[3/4] overflow-hidden bg-stone-200 sm:aspect-square dark:bg-stone-800">
                    <button
                        type="button"
                        onClick={openFullscreen}
                        className="absolute inset-0 z-[1] cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 dark:focus-visible:ring-stone-100"
                        aria-label="View images fullscreen"
                    >
                        <img
                            key={current.key}
                            src={current.src}
                            alt={current.alt || productName}
                            className="pointer-events-none h-full w-full object-cover transition-opacity duration-300"
                        />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            openFullscreen();
                        }}
                        className="absolute left-3 top-3 z-[2] flex min-h-9 items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                        aria-label="Open full screen gallery"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4 shrink-0"
                            aria-hidden
                        >
                            <path d="M3 3a1 1 0 0 0-1 1v2.586a1 1 0 0 0 .293.707l3.414 3.414a1 1 0 0 0 1.414-1.414L4.414 6H6a1 1 0 1 0 0-2H3zm11.293 7.707a1 1 0 0 0-1.414 1.414L15.586 14H14a1 1 0 1 0 0 2h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-2 0v1.586l-3.293-3.293zM6 14H4.414l3.293 3.293a1 1 0 0 0 1.414-1.414L6 15.414V17a1 1 0 1 0-2 0v-3a1 1 0 0 0 1-1zm9-11h1.586l-3.293-3.293a1 1 0 0 0-1.414 1.414L14 4.414V3a1 1 0 0 0 2 0v3a1 1 0 0 0-1 1h-3a1 1 0 0 0 0-2z" />
                        </svg>
                        Full screen
                    </button>

                    {count > 1 ? (
                        <>
                            <NavButton
                                label="Previous image"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    go(-1);
                                }}
                                className={`absolute left-2 top-1/2 z-[2] -translate-y-1/2 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 ${navBtnClass}`}
                            >
                                ‹
                            </NavButton>
                            <NavButton
                                label="Next image"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    go(1);
                                }}
                                className={`absolute right-2 top-1/2 z-[2] -translate-y-1/2 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 ${navBtnClass}`}
                            >
                                ›
                            </NavButton>
                            <p className="pointer-events-none absolute bottom-3 left-1/2 z-[2] -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
                                {safeIndex + 1} / {count}
                            </p>
                        </>
                    ) : null}
                </div>

                {count > 1 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {images.map((img, i) => (
                            <button
                                key={img.key}
                                type="button"
                                onClick={() => setIndex(i)}
                                onDoubleClick={openFullscreen}
                                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                    i === safeIndex
                                        ? 'border-stone-900 ring-2 ring-stone-900/20 dark:border-stone-100 dark:ring-stone-100/20'
                                        : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                                aria-label={`View image ${i + 1}`}
                                aria-current={i === safeIndex}
                            >
                                <img
                                    src={img.src}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                ) : null}

                <p className="text-center text-xs text-stone-500 dark:text-stone-400 sm:text-left">
                    Tap the image or use{' '}
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                        Full screen
                    </span>{' '}
                    to view photos larger.
                </p>
            </div>

            {fullscreenOverlay}
        </>
    );
}
