import FashionLogo from '@/Components/store/FashionLogo';
import AppearanceSync from '@/Components/AppearanceSync';
import { storeShell } from '@/store/storeTheme';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className={`${storeShell} flex min-h-screen flex-col`}>
            <AppearanceSync />
            <header className="border-b border-stone-200 px-6 py-8 dark:border-stone-800">
                <Link href={route('home')} className="mx-auto block w-fit">
                    <FashionLogo subline="Sign in to your wardrobe" />
                </Link>
            </header>
            <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
                <div className="w-full max-w-md border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                    {children}
                </div>
            </main>
        </div>
    );
}
