import MaskIcon from "./MaskIcon";

const NAV_ITEMS = [
  { key: 'home',    label: 'Katalog',           icon: '/public/home.svg' },
  { key: 'shift',   label: 'Shift Kerja',       icon: '/public/clock.svg' },
  { key: 'history', label: 'Riwayat Transaksi', icon: '/public/history.svg' },
];

export default function Sidebar({ activeView, onNavigate, onLogout }) {
    return (
        <aside className="w-20 shrink-0 bg-beige flex flex-col items-center py-5 gap-5">
        <img
            src="/public/logo.svg"
            alt="Logo"
            className="w-10 h-10 rounded-lg"/>

        <nav className="flex flex-col items-center gap-3">
            {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.key;

            return (
                <button
                key={item.key}
                type="button"
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNavigate(item.key)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
                    isActive ? 'bg-navy' : 'hover:bg-cream/60'
                }`}
                >
                <MaskIcon
                    src={item.icon}
                    colorClass={isActive ? 'bg-white' : 'bg-brown'}
                    className="w-5 h-5"
                />
                </button>
            );
            })}
        </nav>

        <button
            type="button"
            onClick={onLogout}
            className="mt-auto w-11 h-11 rounded-xl flex items-center justify-center hover:bg-cream/60 transition">
            <MaskIcon
            src="/public/logout.svg"
            colorClass="bg-brown"
            className="w-5 h-5"/>
        </button>
        </aside>
    );
}
