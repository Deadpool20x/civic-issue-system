'use client';

export default function StatCard({ label, value, icon, trend, subLabel }) {
    return (
        <div className="stat-card card-hover">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-xl">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        trend.positive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {trend.positive ? '↑' : '↓'} {trend.value}%
                    </span>
                )}
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {subLabel && <div className="text-[10px] text-text-muted mt-2 uppercase tracking-tight">{subLabel}</div>}
        </div>
    );
}
