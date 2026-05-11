import GuestPanelLayout from '@/Layouts/Guest/GuestPanelLayout';
import { Head, Link } from '@inertiajs/react';

export default function Cart() {
    return (
        <GuestPanelLayout title="Cart">
            <Head title="Store · Cart" />
            <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Guest cart</h2>
                <p className="mt-3 text-sm text-slate-600">
                    This screen is part of the <strong>guest panel</strong>. Wire your cart API or session-backed cart here — for
                    example persist line items with a guest session id and merge into the user account after login.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href={route('guest.catalog')}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Continue shopping
                    </Link>
                    <Link href={route('login')} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
                        Log in to checkout
                    </Link>
                </div>
            </div>
        </GuestPanelLayout>
    );
}
