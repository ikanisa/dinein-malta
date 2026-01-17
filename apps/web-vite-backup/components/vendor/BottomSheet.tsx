import React from 'react';

interface BottomSheetProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ onClose, title, children }) => (
  <div
    className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
    onClick={onClose}
  >
    <div
      className="bg-surface border-t border-border rounded-t-3xl p-6 pb-safe-bottom w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl relative"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-12 h-1.5 bg-surface-highlight rounded-full mx-auto mb-6" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-muted"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);
