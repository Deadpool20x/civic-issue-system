'use client';

export default function EmptyState({ icon, title, description, action }) {
    return (
        <div className="card flex flex-col items-center justify-center py-16 text-center border-dashed border-2">
            <div className="w-16 h-16 rounded-full bg-border/30 flex items-center justify-center text-3xl mb-4 grayscale opacity-60">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-text-secondary max-w-sm mb-6">{description}</p>
            {action}
        </div>
    );
}
