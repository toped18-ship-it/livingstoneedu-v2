import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MoreVertical, ChevronDown, Check, Loader2, AlertTriangle } from 'lucide-react';

export interface ActionDropdownItem {
  label: string;
  icon?: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  isDanger?: boolean;
  isLoading?: boolean;
  confirmMessage?: string; // Optional confirmation text
}

interface ActionDropdownProps {
  label?: string;
  trigger?: React.ReactNode;
  items: ActionDropdownItem[];
  align?: 'left' | 'right' | 'center';
  className?: string;
}

export function ActionDropdown({
  label,
  trigger,
  items,
  align = 'right',
  className = '',
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmingIndex, setConfirmingIndex] = useState<number | null>(null);
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on click outside or Escape press
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setConfirmingIndex(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setConfirmingIndex(null);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleItemClick = async (item: ActionDropdownItem, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (item.disabled || item.isLoading || executingIndex !== null) return;

    if (item.confirmMessage && confirmingIndex !== index) {
      setConfirmingIndex(index);
      return;
    }

    setConfirmingIndex(null);
    setExecutingIndex(index);

    try {
      await item.onClick();
    } catch (err) {
      console.error('Error executing action:', err);
    } finally {
      setExecutingIndex(null);
      setIsOpen(false);
    }
  };

  const renderIcon = (icon: ActionDropdownItem['icon']) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as React.ComponentType<{ size?: number; className?: string }>;
    return <IconComponent size={15} className="shrink-0" />;
  };

  const alignmentClasses = {
    right: 'right-0 origin-top-right',
    left: 'left-0 origin-top-left',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  };

  return (
    <div className={`relative inline-block text-left z-30`} ref={dropdownRef}>
      {trigger ? (
        <button
          ref={triggerRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            setConfirmingIndex(null);
          }}
          type="button"
          className="focus:outline-none"
        >
          {trigger}
        </button>
      ) : (
        <button
          ref={triggerRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            setConfirmingIndex(null);
          }}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black transition-all duration-150 shadow-sm active:scale-95 cursor-pointer select-none ${className}`}
        >
          <span>{label || 'Actions'}</span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute ${alignmentClasses[align]} mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-xl overflow-hidden focus:outline-none`}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="py-1.5 divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, index) => {
                const isConfirming = confirmingIndex === index;
                const isExecuting = executingIndex === index;
                const isDisabled = item.disabled || isExecuting;

                return (
                  <button
                    key={index}
                    onClick={(e) => handleItemClick(item, index, e)}
                    disabled={isDisabled}
                    type="button"
                    className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-xs transition-all duration-150 ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500'
                        : isConfirming
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40'
                        : item.isDanger
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden w-full">
                      {isExecuting ? (
                        <Loader2 className="animate-spin text-slate-400" size={15} />
                      ) : isConfirming ? (
                        <AlertTriangle className="text-amber-500 shrink-0" size={15} />
                      ) : (
                        renderIcon(item.icon)
                      )}
                      
                      <span className="truncate">
                        {isConfirming ? 'Click to confirm' : item.label}
                      </span>
                    </div>

                    {item.confirmMessage && !isConfirming && (
                      <span className="text-[9px] uppercase font-bold text-slate-400 shrink-0 ml-1 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                        Confirm
                      </span>
                    )}

                    {isConfirming && (
                      <span className="text-[10px] uppercase font-black text-amber-600 shrink-0 ml-1">
                        !
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
