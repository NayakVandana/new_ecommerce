/** Shared Tailwind classes — admin UI (light/dark, modern styling). */

export const adminLayoutShell =
    'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100';

export const adminLayoutSidebar =
    'border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900';

export const adminLayoutHeader =
    'sticky top-0 z-30 flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/95';

export const adminLayoutMain =
    'flex w-full min-w-0 flex-1 flex-col overflow-x-hidden px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-8';

export const adminPageTitle =
    'mb-4 text-xl font-semibold tracking-tight text-slate-900 sm:mb-6 sm:text-2xl dark:text-white';

export const adminMobilePageTitle =
    'min-w-0 flex-1 truncate text-lg font-semibold text-slate-900 dark:text-white';

export const adminNavActive =
    'flex min-h-11 items-center gap-2.5 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-900 dark:bg-slate-800 dark:text-white';

export const adminNavInactive =
    'flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white';

/** @deprecated flat nav — unused */
export const adminNavSectionLabel =
    'px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500';

/** @deprecated flat nav — unused */
export const adminNavSubActive =
    'block rounded-lg py-2 pl-10 pr-3 text-sm font-semibold text-violet-700 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300';

/** @deprecated flat nav — unused */
export const adminNavSubInactive =
    'block rounded-lg py-2 pl-10 pr-3 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200';

/** @deprecated use adminLayoutShell — kept for login page */
export const adminPageGradient =
    'min-h-screen bg-slate-100 dark:bg-slate-950';

export const adminInput =
    'mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-violet-400 dark:focus:ring-violet-400/25';

export const adminLabel =
    'block text-sm font-medium text-slate-700 dark:text-slate-300';

/** Inline validation — red text directly under the input (reference form style) */
export const adminFieldError =
    'mt-1 block text-sm font-normal leading-snug text-red-600 dark:text-red-400';

/** Narrow admin forms (brand, etc.) */
export const adminFormPageWrap =
    'w-full max-w-2xl space-y-4 sm:space-y-6';

/** Wide stacks (category + subcategories) */
export const adminStackPageWrap = 'w-full space-y-6';

/** Product create/edit — full main area width */
export const adminProductPageWrap =
    'w-full space-y-4 pb-8 sm:space-y-6 sm:pb-10';

export const adminFormSection =
    'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900';

export const adminFormSectionTitle =
    'text-base font-semibold tracking-tight text-slate-900 dark:text-white';

export const adminFormSectionDesc =
    'mt-0.5 text-sm text-slate-500 dark:text-slate-400';

export const adminVariantCard =
    'overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-900/60 dark:ring-white/5';

export const adminVariantCardHeader =
    'flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/90 px-4 py-3 dark:border-slate-700/80 dark:bg-slate-800/50';

export const adminStickyAside =
    'space-y-4 lg:sticky lg:top-6 lg:self-start';

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
    'inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-50 sm:w-auto sm:min-w-[9rem] max-sm:w-full';

/** List index pages — full width of main content */
export const adminListPageWrap = 'w-full space-y-3 sm:space-y-4';

/** Toolbar row above list tables */
export const adminPageToolbar =
    'flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4';

export const adminPageToolbarSearch = 'min-w-0 w-full flex-1 sm:max-w-xl';

export const adminSearchInput =
    'block w-full min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:text-sm';

/** Add button in list toolbars — full width on mobile only */
export const adminToolbarAddBtn =
    'inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:w-auto';

/** Table shell — horizontal scroll on small screens */
export const adminTableWrap =
    'overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 bg-white [-webkit-overflow-scrolling:touch] dark:border-slate-800 dark:bg-slate-900';

export const adminTable =
    'w-full min-w-[20rem] text-sm text-slate-700 dark:text-slate-300';

export const adminTableWide =
    'w-full text-sm text-slate-700 dark:text-slate-300';

export const adminTableHead =
    'border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80';

export const adminTableTh =
    'px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400';

/** Default cell padding for list tables */
export const adminTableTd = 'px-4 py-3 align-middle';

export const adminTableTdStrong =
    'font-semibold text-slate-950 dark:text-white';

/** Secondary cells (slug, counts) — still high contrast on white */
export const adminTableTdMuted =
    'text-slate-800 dark:text-slate-200';

export const adminTableRowHover =
    'border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50';

/** Hide non-critical columns on small screens (pair header + cells) */
export const adminTableCellHiddenSm = 'hidden md:table-cell';

export const adminTableCellHiddenMd = 'hidden md:table-cell';

export const adminTableCellHiddenLg = 'hidden lg:table-cell';

/** Secondary line under primary cell — mobile only */
export const adminTableMobileMeta =
    'mt-1 text-xs font-normal text-slate-500 dark:text-slate-400';

export const adminTableActions =
    'flex flex-wrap items-center justify-end gap-1 sm:gap-2';

export const adminTableActionLink =
    'inline-flex min-h-10 items-center rounded-lg px-2.5 py-1.5';

export const adminPaginationRow =
    'mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between';

export const adminPaginationBtn =
    'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 sm:w-auto sm:min-w-[7rem] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';

export const adminMutedText = 'text-sm text-slate-600 dark:text-slate-300';

/** Toolbar / helper copy — readable on tinted backgrounds */
export const adminToolbarHelpText =
    'text-sm leading-relaxed text-slate-600 dark:text-slate-300';

export const adminStatCard =
    'rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900';

export const adminDashboardHero =
    'rounded-xl border border-violet-200/80 bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-800 px-4 py-4 text-white shadow-md sm:px-5 sm:py-4 dark:border-violet-500/30 dark:from-violet-700 dark:via-violet-800 dark:to-indigo-950';

export const adminDashboardHeroBtn =
    'inline-flex min-h-9 items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium transition';

export const adminDashboardHeroBtnPrimary =
    `${adminDashboardHeroBtn} bg-white text-violet-800 shadow-sm hover:bg-violet-50`;

export const adminDashboardHeroBtnGhost =
    `${adminDashboardHeroBtn} border border-white/35 text-white hover:bg-white/10`;

export const adminDashboardStatLink =
    'group block rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-600';

export const adminDashboardSectionCard =
    'flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-600';

export const adminDashboardQuickBtn =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-violet-500 dark:hover:bg-violet-950/40';

export const adminDashboardTwoCol =
    'grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6';

export const adminDashboardPanel =
    'flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900';

export const adminDashboardMetricList =
    'mt-3 divide-y divide-slate-100 dark:divide-slate-800';

export const adminDashboardMetricRow =
    'flex items-center justify-between gap-3 py-2.5 sm:gap-4 sm:py-3';

export const adminDashboardMetricRowToday =
    'flex items-center justify-between gap-3 rounded-lg bg-violet-50 px-2 py-2.5 ring-1 ring-inset ring-violet-200/80 sm:gap-4 sm:px-3 sm:py-3 dark:bg-violet-950/40 dark:ring-violet-700/50';

export const adminDashboardStatLinkToday =
    'group block rounded-xl border border-violet-300/90 bg-violet-50/90 p-4 shadow-sm ring-2 ring-violet-200/60 transition hover:border-violet-400 hover:shadow-md dark:border-violet-600 dark:bg-violet-950/50 dark:ring-violet-800/60 dark:hover:border-violet-500';

export const adminDashboardKpiGrid =
    'grid grid-cols-1 gap-3 sm:grid-cols-3';

export const adminDashboardKpiMetrics =
    'mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800';

export const adminDashboardMetricCountValueToday =
    'text-sm font-bold tabular-nums text-violet-700 dark:text-violet-300';

export const adminDashboardMetricCounts =
    'flex shrink-0 items-stretch gap-3 sm:gap-5';

export const adminDashboardMetricCountCell =
    'min-w-[3.25rem] text-right sm:min-w-[3.5rem]';

export const adminDashboardMetricCountLabel =
    'text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500';

export const adminDashboardMetricCountValue =
    'text-sm font-semibold tabular-nums text-slate-900 dark:text-white';

export const adminBadgeYes =
    'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';

export const adminBadgeNo =
    'inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300';

export const adminLinkAction =
    'text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400';

export const adminDangerText =
    'text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400';

export const adminBadgeNeutral =
    'inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300';

/** Product (or entity) workflow status — use with normalized lowercase status */
export const adminBadgePublished =
    'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-200 dark:ring-emerald-800/60';

export const adminBadgeDraft =
    'inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-800 ring-1 ring-slate-200/90 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600';

export const adminBadgeArchived =
    'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold capitalize text-amber-950 ring-1 ring-amber-200/90 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900/50';

const adminScrollX =
    'overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export const adminTabList =
    `${adminScrollX} flex gap-1 rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/60`;

export const adminTabBtnActive =
    'shrink-0 whitespace-nowrap rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white';

export const adminTabBtnInactive =
    'shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100';

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
