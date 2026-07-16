import React, { useMemo } from 'react';

const HEX_BLUE = '#102C57';

export default function AdminLayout({ title, subtitle, children, rightActions }) {
    const headerStyle = useMemo(
        () => ({
            color: HEX_BLUE,
        }),
        []
    );

    return (
        <div className="w-full">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold" style={headerStyle}>
                        {title}
                    </h1>
                    {subtitle ? (
                        <p className="mt-2 text-sm sm:text-base" style={headerStyle}>
                            {subtitle}
                        </p>
                    ) : null}
                </div>
                {rightActions ? <div>{rightActions}</div> : null}
            </div>

            <div className="mt-6">{children}</div>

            <div className="mt-6 text-xs text-gray-500" style={{ color: HEX_BLUE, opacity: 0.75 }}>
                Powered by BackendPOSPBP • UI Admin
            </div>
        </div>
    );
}

