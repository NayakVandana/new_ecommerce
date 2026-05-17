/** Fashion storefront & account — editorial stone / cream palette. */

const scrollX =
    'overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

const ptSafe = 'pt-[max(0px,env(safe-area-inset-top))]';

const pbSafe = 'pb-[max(1rem,env(safe-area-inset-bottom))]';

export const storeShell =
    'min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100';

export const storeAnnounceBar =
    'bg-stone-900 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-stone-100 sm:text-[11px] sm:tracking-[0.2em]';

export const storeHeader =
    `border-b border-stone-200/90 bg-stone-50/95 backdrop-blur-md ${ptSafe} dark:border-stone-800 dark:bg-stone-950/95`;

export const storeHeaderBar = storeHeader;

export const storeHeaderInner =
    'mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 px-3 py-3 sm:gap-x-3 sm:px-6 sm:py-4';

export const storeHeaderActions =
    'flex items-center justify-end gap-2 sm:gap-3';

export const storeHeaderIconBtn =
    'relative flex min-h-10 min-w-10 items-center justify-center text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100';

export const storeHeaderCartBadge =
    'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-stone-900 px-0.5 text-[9px] font-bold leading-none text-white dark:bg-stone-100 dark:text-stone-900';

export const storeHeaderAccount =
    'inline-flex min-h-10 max-w-[7rem] items-center gap-1.5 bg-stone-900 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-stone-800 sm:max-w-[10rem] sm:gap-2 sm:px-4 sm:text-[11px] sm:tracking-[0.15em] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200';

export const storeMobileCategoryStrip =
    'border-b border-stone-200 bg-stone-50/95 dark:border-stone-800 dark:bg-stone-950/95 lg:hidden';

export const storeMobileCategoryScroll =
    `${scrollX} flex gap-2 px-3 py-2.5 sm:px-4`;

export const storeMobileNavLink =
    'flex min-h-11 items-center rounded-lg px-3 text-[11px] font-semibold uppercase tracking-[0.18em]';

export const storeBrand =
    'font-display text-xl font-medium tracking-[0.1em] text-stone-900 dark:text-stone-50 sm:text-2xl sm:tracking-[0.12em] lg:text-3xl';

export const storeBrandSub =
    'text-[10px] font-medium uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400';

export const storeNavLink =
    'px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition';

export const storeNavActive =
    `${storeNavLink} text-stone-900 underline decoration-2 underline-offset-8 dark:text-stone-50`;

export const storeNavInactive =
    `${storeNavLink} text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100`;

export const storePageTitleBar =
    'border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900';

export const storePageTitleInner = 'mx-auto max-w-7xl px-4 py-6 sm:px-6';

export const storePageTitle =
    'font-display text-xl font-medium tracking-wide text-stone-900 dark:text-stone-50 sm:text-2xl';

export const storeMain =
    `mx-auto max-w-7xl px-3 py-6 ${pbSafe} sm:px-6 sm:py-8 sm:pb-10 lg:py-10`;

export const storeHero =
    'relative -mx-3 overflow-hidden bg-gradient-to-br from-rose-950 via-stone-900 to-stone-950 px-4 py-12 text-stone-50 sm:mx-0 sm:rounded-none sm:px-8 sm:py-16 lg:px-12 lg:py-24';

export const storeHeroTitle =
    'font-display text-3xl font-medium leading-tight tracking-wide sm:text-4xl sm:leading-tight lg:text-5xl xl:text-6xl';

export const storeHeroLead =
    'mt-5 max-w-lg text-sm leading-relaxed text-stone-300 sm:text-base';

export const storeSectionTitle =
    'font-display text-2xl font-medium tracking-wide text-stone-900 dark:text-stone-50';

export const storeSectionEyebrow =
    'text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400';

export const storeProductGrid =
    'grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4';

export const storeProductCard =
    'group flex h-full flex-col';

export const storeProductImageWrap =
    'relative aspect-[3/4] overflow-hidden bg-stone-200 dark:bg-stone-800';

export const storeChip =
    'inline-flex shrink-0 items-center border border-stone-300 bg-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-700 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white dark:border-stone-600 dark:text-stone-300 dark:hover:border-stone-100 dark:hover:bg-stone-100 dark:hover:text-stone-900';

export const storeChipActive =
    'inline-flex shrink-0 items-center border border-stone-900 bg-stone-900 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900';

export const storeFooter =
    'border-t border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900';

export const storeFooterInner =
    'mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:justify-between';

export const storeSidebar =
    'border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:p-5 lg:sticky lg:top-36 lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto';

export const storeFilterToggle =
    'flex min-h-11 w-full items-center justify-center gap-2 border border-stone-300 bg-white text-[11px] font-semibold uppercase tracking-wider text-stone-800 lg:hidden dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200';

export const storeCartLine =
    'flex flex-col gap-3 border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:gap-4 sm:p-5';

export const storeCartLineBody =
    'flex min-w-0 flex-1 gap-3 sm:gap-4';

export const storeCard =
    'border border-stone-200 bg-white p-5 sm:p-6 dark:border-stone-800 dark:bg-stone-900';

export const storeCardMuted =
    'border border-dashed border-stone-300 bg-stone-100/80 p-5 text-sm dark:border-stone-700 dark:bg-stone-900/50';

export const storeBtnPrimary =
    'inline-flex min-h-11 items-center justify-center bg-stone-900 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-stone-800 sm:px-6 sm:text-[11px] sm:tracking-[0.2em] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200';

export const storeBtnSecondary =
    'inline-flex min-h-11 items-center justify-center border border-stone-900 bg-transparent px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-900 transition hover:bg-stone-900 hover:text-white sm:px-6 sm:text-[11px] sm:tracking-[0.2em] dark:border-stone-100 dark:text-stone-100 dark:hover:bg-stone-100 dark:hover:text-stone-900';

export const storeBtnCompact =
    'inline-flex min-h-10 min-w-10 items-center justify-center px-3 py-2 text-[10px] font-semibold uppercase tracking-wider sm:min-h-11 sm:px-5 sm:py-2.5 sm:text-[11px]';

export const storeBtnGhost =
    'inline-flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 underline-offset-4 hover:underline dark:text-stone-400';

export const storeInput =
    'w-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:focus:border-stone-300 dark:focus:ring-stone-300';

export const storeInputError =
    'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-400';

export const storeFieldError = 'mt-1 text-xs text-red-600 dark:text-red-400';

export const storeCheckoutStepper =
    'mb-8 border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:p-5';

export const storeCheckoutStepTrack =
    'grid grid-cols-3 gap-1 sm:gap-2';

export const storeCheckoutStepBtn =
    'flex min-h-11 flex-col items-center justify-center gap-1 px-1 py-2 text-center transition sm:px-2';

export const storeCheckoutStepBtnActive =
    `${storeCheckoutStepBtn} bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900`;

export const storeCheckoutStepBtnDone =
    `${storeCheckoutStepBtn} bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-100`;

export const storeCheckoutStepBtnPending =
    `${storeCheckoutStepBtn} text-stone-400 dark:text-stone-500`;

export const storeCheckoutNav =
    'mt-8 flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:justify-between dark:border-stone-800';

export const storeLabel =
    'text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400';

export const storeErrorBanner =
    'border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200';

export const storeMutedText = 'text-sm text-stone-500 dark:text-stone-400';

export const storeUserShell = storeShell;

export const storeUserTopBar =
    'border-b border-stone-200 bg-stone-50/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95';

export const storeUserTopBarInner =
    'mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6';

export const storeUserMobileHeader =
    `border-b border-stone-200 bg-stone-50/95 backdrop-blur-md ${ptSafe} dark:border-stone-800 dark:bg-stone-950/95`;

export const storeUserMobileHeaderRow =
    'flex min-h-12 items-center justify-between gap-2 px-3 py-2 sm:px-4';

export const storeUserMobileTabs =
    `${scrollX} flex gap-1.5 border-t border-stone-100 px-3 py-2 dark:border-stone-800`;

export const storeUserMobileTabActive =
    'shrink-0 bg-stone-900 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white dark:bg-stone-100 dark:text-stone-900';

export const storeUserMobileTabInactive =
    'shrink-0 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400';

export const storeUserSidebar =
    'hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 lg:fixed lg:bottom-0 lg:left-0 lg:top-16 lg:z-30 lg:flex';

export const storeUserMobileMenu =
    'border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900';

export const storeUserMain =
    `mx-auto w-full min-w-0 max-w-7xl flex-1 px-3 py-5 ${pbSafe} sm:px-6 sm:py-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] lg:px-8 lg:py-10`;

export const storeUserPageTitle =
    'mb-6 hidden font-display text-2xl text-stone-900 dark:text-stone-50 sm:text-3xl lg:block';

export const storeTabList =
    `${scrollX} flex border-b border-stone-200 bg-stone-50/90 dark:border-stone-800 dark:bg-stone-900/60`;

export const storeTabBtnActive =
    'shrink-0 whitespace-nowrap border-b-2 border-stone-900 px-4 py-3 text-sm font-medium text-stone-900 dark:border-stone-100 dark:text-stone-50';

export const storeTabBtnInactive =
    'shrink-0 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-stone-500 transition hover:border-stone-300 hover:text-stone-900 dark:text-stone-400 dark:hover:border-stone-600 dark:hover:text-stone-100';

export const storePanel =
    'overflow-hidden border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900';

export const storePanelBody = 'p-4 sm:p-6';

export const storeUserNavActive =
    'border-l-2 border-stone-900 bg-stone-50 py-3 pl-4 text-[11px] font-semibold uppercase tracking-wider text-stone-900 dark:border-stone-100 dark:bg-stone-900/80 dark:text-stone-50';

export const storeUserNavInactive =
    'py-3 pl-4 text-[11px] font-semibold uppercase tracking-wider text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100';

export const storeUserSubNav =
    'mb-2 ml-3 flex flex-col gap-0.5 border-l border-stone-200 pl-3 dark:border-stone-700';

export const storeTableWrap =
    'overflow-x-auto border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900';

export const storeTable = 'min-w-full text-left text-sm';

export const storeTableHead =
    'border-b border-stone-100 bg-stone-50 text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-400';

export const storeTableTh = 'px-4 py-3';

export const storeTableTd = 'px-4 py-3.5 text-stone-700 dark:text-stone-300';

export const storeTableTdStrong =
    'font-medium text-stone-900 dark:text-stone-50';

export const storePaginationRow =
    'mt-10 flex flex-col items-stretch gap-3 border-t border-stone-200 pt-8 sm:flex-row sm:items-center sm:justify-between dark:border-stone-800';

export const storePaginationBtn =
    'border border-stone-300 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-700 transition hover:border-stone-900 disabled:opacity-40 dark:border-stone-600 dark:text-stone-300';

export const storeBadgePending =
    'inline-flex bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-950/60 dark:text-amber-200';

export const storeBadgeSuccess =
    'inline-flex bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200';

export const storeBadgeMuted =
    'inline-flex bg-stone-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 dark:bg-stone-800 dark:text-stone-300';

export const storeBadgeDanger =
    'inline-flex bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-800 dark:bg-red-950/60 dark:text-red-200';

export const storeEditorialBanner =
    'relative flex min-h-[420px] flex-col justify-end overflow-hidden bg-stone-300 dark:bg-stone-800';

export const storeCategoryTile =
    'group relative flex min-h-[200px] aspect-[4/5] items-end overflow-hidden bg-stone-200 p-4 sm:min-h-0 sm:p-6 dark:bg-stone-800';

export const storeHeroActions =
    'mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4';

export const storeHeroBtn =
    'w-full justify-center sm:w-auto';
