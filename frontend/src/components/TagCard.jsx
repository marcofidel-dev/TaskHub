import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SWIPE_THRESHOLD = 50;
const ACTIONS_WIDTH = 70;

export default function TagCard({ tag, onDelete }) {
  const { t } = useTranslation('common');

  const [dragX, setDragX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lockedAxis = useRef(null);

  const resolvedX = isDragging ? dragX : (isOpen ? ACTIONS_WIDTH : 0);

  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeActions();
      }
    };
    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  }, [isOpen]);

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    lockedAxis.current = null;
    setIsDragging(true);
    setDragX(isOpen ? ACTIONS_WIDTH : 0);
  };

  const handleTouchMove = (e) => {
    const dx = startXRef.current - e.touches[0].clientX;
    const dy = Math.abs(startYRef.current - e.touches[0].clientY);
    if (!lockedAxis.current) {
      if (Math.abs(dx) > 5 || dy > 5) {
        lockedAxis.current = Math.abs(dx) > dy ? 'horizontal' : 'vertical';
      }
      return;
    }
    if (lockedAxis.current !== 'horizontal') return;
    e.preventDefault();
    const base = isOpen ? ACTIONS_WIDTH : 0;
    setDragX(Math.max(0, Math.min(ACTIONS_WIDTH, base + dx)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragX > SWIPE_THRESHOLD) {
      setIsOpen(true);
      setDragX(ACTIONS_WIDTH);
      if (navigator.vibrate) navigator.vibrate(40);
    } else {
      setIsOpen(false);
      setDragX(0);
    }
  };

  const closeActions = () => {
    setIsOpen(false);
    setDragX(0);
    setIsDragging(false);
  };

  const transition = isDragging ? 'none' : 'transform 200ms ease';
  const contentStyle = { transform: `translateX(-${resolvedX}px)`, transition };
  const panelStyle = {
    transform: `translateX(${ACTIONS_WIDTH - resolvedX}px)`,
    transition,
    opacity: resolvedX > 0 ? 1 : 0,
    pointerEvents: resolvedX > 0 ? 'auto' : 'none',
  };

  return (
    <div
      ref={containerRef}
      className={`group relative rounded-xl border overflow-hidden mb-3 transition-shadow duration-200 animate-fadeIn ${
        isOpen ? 'shadow-lg' : 'border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={(e) => e.key === 'Escape' && closeActions()}
    >
      {/* Swipe action panel */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-stretch"
        style={{ width: ACTIONS_WIDTH, ...panelStyle }}
        aria-hidden={!isOpen}
      >
        <button
          onClick={() => { onDelete(tag.id); closeActions(); }}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white transition-colors min-w-[44px]"
          aria-label={t('delete')}
          tabIndex={isOpen ? 0 : -1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
          <span className="text-xs font-semibold">{t('delete')}</span>
        </button>
      </div>

      {/* Main content */}
      <div
        className="bg-white dark:bg-slate-800 p-4 flex items-center gap-4 will-change-transform"
        style={contentStyle}
      >
        {/* Tag pill */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shrink-0"
          style={{
            backgroundColor: (tag.color || '#6366F1') + '20',
            color: tag.color || '#6366F1',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: tag.color || '#6366F1' }}
          />
          #{tag.name}
        </span>

        {/* Usage count */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            {t('used_in', { count: tag.usageCount ?? 0 })}
          </p>
        </div>

        {/* Desktop hover delete */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 touch-none pointer-events-none group-hover:pointer-events-auto shrink-0">
          <button
            onClick={() => onDelete(tag.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors min-h-[36px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
