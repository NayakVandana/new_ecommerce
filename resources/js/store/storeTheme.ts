/** Shared Tailwind classes — guest storefront & user account (light/dark). */

export const storeShell =
    'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100';

export const storeHeader =
    'sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95';

export const storeHeaderInner =
    'mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6';

export const storeBrand =
    'text-lg font-bold tracking-tight text-slate-900 dark:text-white';

export const storeBrandSub =
    'text-xs text-slate-500 dark:text-slate-400';

export const storeNavLink =
    'rounded-full px-3 py-1.5 text-sm font-medium transition';

export const storeNavActive =
    `${storeNavLink} bg-slate-900 text-white dark:bg-indigo-600`;

export const storeNavInactive =
    `${storeNavLink} text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`;

export const storePageTitleBar =
    'border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900';

export const storePageTitleInner = 'mx-auto max-w-6xl px-4 py-4 sm:px-6';

export const storePageTitle =
    'text-xl font-semibold tracking-tight text-slate-900 dark:text-white';

export const storeMain = 'mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8';

export const storeCard =
    'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900';

export const storeCardMuted =
    'rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm dark:border-slate-600 dark:bg-slate-900/40';

export const storeBtnPrimary =
    'inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500';

export const storeBtnSecondary =
    'inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500';

export const storeInput =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400';

export const storeLabel =
    'block text-sm font-medium text-slate-700 dark:text-slate-300';

export const storeErrorBanner =
    'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200';

export const storeMutedText = 'text-sm text-slate-500 dark:text-slate-400';

export const storeUserSidebar =
    'hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex';

export const storeUserNavActive =
    'rounded-lg bg-indigo-50 px-3 py-2.5 text-sm font-medium text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-100';

export const storeUserNavInactive =
    'rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800';

export const storeTableWrap =
    'overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900';

export const storeTable = 'min-w-full text-left text-sm';

export const storeTableHead =
    'border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400';

export const storeTableTh = 'px-4 py-3';

export const storeTableTd = 'px-4 py-3.5 text-slate-700 dark:text-slate-300';

export const storeTableTdStrong =
    'font-medium text-slate-900 dark:text-white';

export const storePaginationRow =
    'mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between';

export const storePaginationBtn =
    'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800';

export const storeBadgePending =
    'inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold capitalize text-amber-900 dark:bg-amber-950/60 dark:text-amber-200';

export const storeBadgeSuccess =
    'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold capitalize text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200';

export const storeBadgeMuted =
    'inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300';

export const storeBadgeDanger =
    'inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold capitalize text-red-800 dark:bg-red-950/60 dark:text-red-200';
