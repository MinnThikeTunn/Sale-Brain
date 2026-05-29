import React from 'react';

interface RadioOption {
  id: string;
  labelEn: string;
  labelMy: string;
}

interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  lang: 'en' | 'my';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  lang,
}) => {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
        {label}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((option) => (
          <label
            key={option.id}
            className={`px-4 py-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              value === option.id
                ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10.5px] font-bold">
              {lang === 'my' ? option.labelMy : option.labelEn}
            </span>
            <input
              type="radio"
              name={label}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="hidden"
            />
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
              value === option.id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
            }`}>
              {value === option.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
