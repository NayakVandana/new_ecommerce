import { PropsWithChildren, useEffect, useRef, useState } from 'react';

/** Fixed top header + dynamic spacer so main content is never hidden underneath. */
export default function StoreFixedHeader({
    children,
    className = '',
}: PropsWithChildren<{ className?: string }>) {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) {
            return;
        }

        const measure = () => setHeight(el.offsetHeight);
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <div
                ref={ref}
                className={`fixed inset-x-0 top-0 z-50 flex flex-col ${className}`}
            >
                {children}
            </div>
            <div aria-hidden className="shrink-0" style={{ height }} />
        </>
    );
}
