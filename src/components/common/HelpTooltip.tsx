import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, BookOpen } from 'lucide-react';

interface HelpTooltipProps {
  title?: string;
  content?: React.ReactNode;
  baseRegulatoria?: string;
  className?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  baseRegulatoria,
  className = '',
  placement = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const placementClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible((prev) => !prev);
        }}
        aria-label="Informações e Base Regulatória"
        className="w-4 h-4 rounded-full bg-zinc-200 hover:bg-[#FFCC01] text-zinc-700 hover:text-black text-[10px] font-bold inline-flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-110 focus:outline-none"
      >
        ?
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 w-72 sm:w-80 p-3 bg-zinc-900 text-white rounded-lg shadow-2xl border border-zinc-700 text-xs animate-in fade-in zoom-in-95 duration-150 ${placementClasses[placement]}`}
        >
          {title && (
            <div className="font-bold text-[#FFCC01] text-xs pb-1.5 mb-1.5 border-b border-zinc-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#FFCC01] shrink-0" />
              <span>{title}</span>
            </div>
          )}

          {content && (
            <div className="text-zinc-300 text-[11px] leading-relaxed mb-2">
              {content}
            </div>
          )}

          {baseRegulatoria && (
            <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 flex items-start gap-1.5">
              <BookOpen className="w-3 h-3 text-[#FFCC01] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-zinc-300 block uppercase text-[9px] tracking-wider">Base Regulatória:</span>
                <span className="text-zinc-300 font-mono text-[10px]">{baseRegulatoria}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
