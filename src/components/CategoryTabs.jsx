const CATEGORIES = [
    { value: 'coffee',     label: 'Coffee' },
    { value: 'non-coffee', label: 'Non-Coffee' },
    { value: 'pastry',     label: 'Pastry' },
    { value: 'others',     label: 'Lainnya' },
];

export default function CategoryTabs({ active, onChange }) {
    return (
        <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((cat) => {
            const isActive = active === cat.value;
            return (
                <button
                    key={cat.value}
                    type="button"
                    onClick={() => onChange(cat.value)}
                    className={`rounded-md px-5 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-navy text-white' : 'bg-beige text-navy hover:brightness-95'
                    }`}
                >
                {cat.label}
            </button>
            );
        })}
        </div>
    );
}
