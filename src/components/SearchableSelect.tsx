import React, { useState, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  lang?: "en" | "my";
}

export function SearchableSelect({ label, options, value, onChange, placeholder, lang }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt => 
      opt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const displayValue = value || placeholder || "";

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
        {label}
      </label>
      <div className="relative">
        <div
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between h-10.5"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={value ? "text-slate-800" : "text-slate-400"}>
            {displayValue}
          </span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={lang === "my" ? "ရှာဖွေပါ..." : "Search..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-indigo-50 transition-colors"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-xs text-slate-400">
                  {lang === "my" ? "မတွေ့ရှိပါ" : "No results found"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}