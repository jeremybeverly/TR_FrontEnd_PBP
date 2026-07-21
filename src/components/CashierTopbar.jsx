import MaskIcon from './MaskIcon';

const ICONS = {
  search: '/public/search.svg',
};

export default function CashierTopbar({ search, onSearchChange }) {
    return (
        <div className="flex items-center gap-4">
        <div className="relative flex-1">
            <MaskIcon
            src={ICONS.search}
            colorClass="bg-brown"
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
            />
            <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari menu kopi atau makanan..."
            className="w-full rounded-lg border border-beige bg-cream py-3 pl-11 pr-4 text-sm text-navy placeholder:text-brown/60 focus:border-navy focus:outline-none"
            />
        </div>
        </div>
    );
}
