import { getPriorityLabel, getPriorityColors } from '@/lib/priority-calculator';

export default function PriorityBadge({ priority, size = 'md' }) {
  const colors = getPriorityColors(priority);
  const label = getPriorityLabel(priority);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${colors.bg} ${colors.text} ${colors.border}
      ${sizeClasses[size]}
    `}>
      {label}
    </span>
  );
}
