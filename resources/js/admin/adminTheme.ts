/** Shared Tailwind classes — admin UI (light/dark, modern styling). */

export const adminPageGradient =
    'min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/40';

export const adminInput =
    'mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-violet-400 dark:focus:ring-violet-400/25';

export const adminLabel =
    'block text-sm font-medium text-slate-700 dark:text-slate-300';

/** Narrow admin forms — centers on large screens, full width on mobile */
export const adminFormPageWrap =
    'mx-auto w-full max-w-xl space-y-6 lg:max-w-2xl';

/** Wide stacks (product form, category + subcategories) */
export const adminStackPageWrap =
    'mx-auto w-full max-w-3xl space-y-6 xl:max-w-4xl';

export const adminFormCard =
    'w-full space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100 sm:p-6 dark:border-slate-600/70 dark:bg-slate-900 dark:shadow-black/25 dark:ring-white/10';

export const adminWideFormCard =
    'w-full space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100 sm:p-6 dark:border-slate-600/70 dark:bg-slate-900 dark:shadow-black/25 dark:ring-white/10';

export const adminErrorBanner =
    'mb-4 rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200';

export const adminBackLink =
    'inline-flex items-center gap-1 text-sm font-medium text-violet-600 transition hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300';

export const adminCancelBtn =
    'rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';

export const adminPrimaryBtn =
    'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold !text-white shadow-lg shadow-violet-600/35 ring-2 ring-violet-800/25 transition hover:from-violet-500 hover:via-violet-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-violet-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 disabled:opacity-50 visited:!text-white dark:shadow-violet-900/50 dark:ring-violet-400/20';

/** List index pages — aligns with page gradient */
export const adminListPageWrap =
    'mx-auto w-full max-w-7xl space-y-5 pb-8';

/** Toolbar strip above data tables (inner layout lives in AdminListToolbar) */
export const adminPageToolbar =
    'rounded-2xl border border-violet-200/80 bg-gradient-to-br from-white via-violet-50/60 to-indigo-50/50 p-5 shadow-lg shadow-violet-200/30 ring-1 ring-violet-100/70 dark:border-violet-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/60 dark:shadow-black/40 dark:ring-white/10';

/** Table shell — solid surface + depth (readable body text) */
export const adminTableWrap =
    'overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-300/25 ring-1 ring-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/50 dark:ring-white/10';

export const adminTable =
    'min-w-full divide-y divide-slate-100 text-[15px] leading-snug dark:divide-slate-700/80';

export const adminTableHead =
    'border-b border-violet-200/80 bg-gradient-to-r from-violet-100/90 via-white to-indigo-50/90 dark:border-slate-700 dark:from-slate-800 dark:via-slate-800/95 dark:to-slate-800/90';

export const adminTableTh =
    'whitespace-nowrap px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200';

/** Default cell padding for list tables */
export const adminTableTd = 'px-5 py-4 align-middle';

export const adminTableTdStrong =
    'font-semibold text-slate-950 dark:text-white';

/** Secondary cells (slug, counts) — still high contrast on white */
export const adminTableTdMuted =
    'text-slate-800 dark:text-slate-200';

export const adminTableRowHover =
    'transition-colors odd:bg-white even:bg-slate-50/90 hover:bg-violet-50 dark:odd:bg-slate-900/70 dark:even:bg-slate-800/50 dark:hover:bg-violet-950/35';

/** Hide non-critical columns on small screens (pair header + cells with `hidden md:table-cell`) */
export const adminTableCellHiddenSm = 'hidden md:table-cell';

export const adminPaginationBtn =
    'rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/50 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-800 dark:hover:bg-slate-700';

export const adminMutedText = 'text-sm text-slate-600 dark:text-slate-300';

/** Toolbar / helper copy — readable on tinted backgrounds */
export const adminToolbarHelpText =
    'text-sm leading-relaxed text-slate-600 dark:text-slate-300';

export const adminStatCard =
    'group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100 transition hover:shadow-xl hover:shadow-violet-500/10 dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-black/25 dark:ring-white/5 dark:hover:shadow-violet-900/20';

export const adminBadgeYes =
    'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';

export const adminBadgeNo =
    'inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300';

export const adminLinkAction =
    'font-semibold text-violet-600 transition hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300';

export const adminDangerText =
    'font-semibold text-red-600 transition hover:text-red-500 dark:text-red-400';

export const adminBadgeNeutral =
    'inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300';

/** Product (or entity) workflow status — use with normalized lowercase status */
export const adminBadgePublished =
    'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-200 dark:ring-emerald-800/60';

export const adminBadgeDraft =
    'inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-800 ring-1 ring-slate-200/90 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600';

export const adminBadgeArchived =
    'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold capitalize text-amber-950 ring-1 ring-amber-200/90 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900/50';

export const adminSectionCard =
    'mt-10 w-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100 sm:p-6 dark:border-slate-600/70 dark:bg-slate-900 dark:shadow-black/25 dark:ring-white/10';

export const adminNestedTableWrap =
    'mt-4 overflow-x-auto rounded-xl border border-violet-200/50 bg-white/80 ring-1 ring-violet-100/40 dark:border-slate-700 dark:bg-transparent dark:ring-0';

export const adminHighlightPanel =
    'mt-6 space-y-4 rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-indigo-50/50 p-4 dark:border-violet-900/50 dark:from-violet-950/40 dark:to-indigo-950/30';

export const adminCheckbox =
    'rounded border-slate-300 text-violet-600 focus:ring-violet-500 dark:border-slate-500 dark:bg-slate-800';

export const adminSmallHeading =
    'text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100';

export const adminSmallMuted =
    'mt-1 text-sm text-slate-500 dark:text-slate-400';

export const adminDividerTop =
    'mt-6 space-y-3 border-t border-slate-200 pt-6 dark:border-slate-700';

export const adminDarkSubmitBtn =
    'rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50 dark:bg-gradient-to-r dark:from-violet-600 dark:to-indigo-600 dark:hover:from-violet-500 dark:hover:to-indigo-500';

/** Dashboard metric accent — use as top border or decorative bar */
export const adminStatAccent = {
    products: 'bg-gradient-to-r from-violet-500 to-purple-500',
    brands: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    orders: 'bg-gradient-to-r from-amber-500 to-orange-500',
    customers: 'bg-gradient-to-r from-emerald-500 to-teal-500',
} as const;
