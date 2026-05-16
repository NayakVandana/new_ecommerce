import { FASHION_ANNOUNCEMENT } from '@/store/fashionBrand';
import { storeAnnounceBar } from '@/store/storeTheme';

export default function FashionAnnouncementBar() {
    return (
        <div className={storeAnnounceBar}>
            <p className="px-3 py-2 leading-snug sm:px-4 sm:py-2.5">{FASHION_ANNOUNCEMENT}</p>
        </div>
    );
}
