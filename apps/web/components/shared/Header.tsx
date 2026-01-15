import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showSettings?: boolean;
  backPath?: string;
  rightContent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  showSettings = false,
  backPath,
  rightContent,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="sticky top-0 z-40 px-6 pt-12 pb-4 bg-glass border-b border-glassBorder backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-foreground active:scale-95 transition-transform flex-shrink-0"
              aria-label="Go back"
            >
              ←
            </button>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
            )}
            {subtitle && (
              <p className="text-xs text-muted truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {rightContent || (showSettings && (
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-foreground active:scale-95 transition-transform flex-shrink-0"
            aria-label="Settings"
          >
            ⚙️
          </button>
        ))}
      </div>
    </div>
  );
};
