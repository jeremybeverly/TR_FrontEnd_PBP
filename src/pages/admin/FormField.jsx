import React from 'react';

export default function FormField({ label, children }) {
    return (
        <label className="block">
            <div className="text-xs font-semibold text-gray-600 mb-2">{label}</div>
            {children}
        </label>
    );
}

