import React from 'react';

export default function Modal({ open, title, onClose, children, footer }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    className="w-full max-w-2xl rounded-2xl bg-white border max-h-[80vh] flex flex-col"
                    style={{ borderColor: '#E5E7EB' }}
                >
                    <div
                        className="p-5 border-b flex items-center justify-between gap-3 flex-none"
                        style={{ borderColor: '#E5E7EB' }}
                    >
                        <div className="font-bold text-lg">{title}</div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                            style={{ borderColor: '#E5E7EB' }}
                        >
                            Tutup
                        </button>
                    </div>

                    <div className="p-5 overflow-auto flex-1">{children}</div>

                    {footer ? (
                        <div className="p-5 border-t flex-none" style={{ borderColor: '#E5E7EB' }}>
                            {footer}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

