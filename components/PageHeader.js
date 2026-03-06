'use client';

export default function PageHeader({ title, subtitle, children }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="animate-slide-in">
                <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-text-secondary mt-1">{subtitle}</p>}
            </div>
            {children && (
                <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    {children}
                </div>
            )}
        </div>
    );
}
