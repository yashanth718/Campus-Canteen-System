import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  range: string;
  onRangeChange: (range: string) => void;
  startDate?: string;
  endDate?: string;
  onCustomDateChange?: (start: string, end: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  range,
  onRangeChange,
  startDate,
  endDate,
  onCustomDateChange,
}) => {
  const options = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7', label: 'Last 7 Days' },
    { id: 'last30', label: 'Last 30 Days' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onRangeChange(opt.id)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            range === opt.id
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {opt.label}
        </button>
      ))}

      {range === 'custom' && onCustomDateChange && (
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => onCustomDateChange(e.target.value, endDate || e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate || ''}
            onChange={(e) => onCustomDateChange(startDate || e.target.value, e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      )}
    </div>
  );
};
