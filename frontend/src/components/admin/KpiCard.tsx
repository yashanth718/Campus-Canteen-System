import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'teal' | 'blue' | 'amber' | 'emerald' | 'purple' | 'slate';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'teal',
}) => {
  const variantStyles = {
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100' },
  }[variant];

  return (
    <div className={`p-6 rounded-3xl bg-white border ${variantStyles.border} shadow-xs hover:shadow-md transition`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-2xl ${variantStyles.bg} ${variantStyles.text} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};
