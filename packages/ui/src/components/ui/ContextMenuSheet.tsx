import { ReactNode, useState, useCallback, createContext, useContext } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DraggableBottomSheet } from './DraggableBottomSheet';
import { useLongPress } from '../../hooks/useLongPress';

export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: ReactNode;
    /** Callback when item is selected */
    onSelect: () => void;
    /** Whether this is a destructive action (shows warning style) */
    destructive?: boolean;
    /** Disabled state */
    disabled?: boolean;
}

export interface ContextMenuSheetProps {
    /** Menu items to display */
    items: ContextMenuItem[];
    /** The element to attach long-press to */
    children: ReactNode;
    /** Title shown in the sheet header */
    title?: string;
    /** Whether to show the "..." button (default: true) */
    showMenuButton?: boolean;
    /** Custom trigger button className */
    menuButtonClassName?: string;
    /** Additional className for the wrapper */
    className?: string;
    /** Disable long-press detection */
    disableLongPress?: boolean;
}

// Context for nested components
const ContextMenuContext = createContext<{
    open: () => void;
    close: () => void;
} | null>(null);

/**
 * Hook to access context menu controls from child components.
 */
export function useContextMenu() {
    const ctx = useContext(ContextMenuContext);
    if (!ctx) {
        throw new Error('useContextMenu must be used within ContextMenuSheet');
    }
    return ctx;
}

/**
 * Context menu that opens via long-press OR button tap.
 * Uses DraggableBottomSheet for the menu display.
 * Non-destructive actions only; destructive actions show warning style.
 */
export function ContextMenuSheet({
    items,
    children,
    title,
    showMenuButton = true,
    menuButtonClassName,
    className,
    disableLongPress = false,
}: ContextMenuSheetProps) {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    const longPressHandlers = useLongPress({
        onLongPress: open,
        disabled: disableLongPress,
    });

    const handleItemSelect = useCallback(
        (item: ContextMenuItem) => {
            if (item.disabled) return;
            close();
            // Delay action to allow sheet close animation
            setTimeout(() => {
                item.onSelect();
            }, 100);
        },
        [close]
    );

    return (
        <ContextMenuContext.Provider value={{ open, close }}>
            <div className={cn('relative', className)}>
                {/* Long-press target wrapper */}
                <div
                    {...longPressHandlers}
                    className="touch-none select-none"
                >
                    {children}
                </div>

                {/* Menu trigger button */}
                {showMenuButton && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            open();
                        }}
                        className={cn(
                            'absolute top-2 right-2 p-2 rounded-full',
                            'bg-muted/80 hover:bg-muted transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            menuButtonClassName
                        )}
                        aria-label="Open menu"
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                    >
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                )}

                {/* Menu sheet */}
                <DraggableBottomSheet
                    isOpen={isOpen}
                    onClose={close}
                    header={title ? <h2 className="text-lg font-semibold">{title}</h2> : undefined}
                >
                    <nav
                        role="menu"
                        className="py-2"
                        aria-label={title || 'Actions'}
                    >
                        {items.map((item) => (
                            <button
                                key={item.id}
                                role="menuitem"
                                onClick={() => handleItemSelect(item)}
                                disabled={item.disabled}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-3 text-left',
                                    'transition-colors rounded-lg',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    item.disabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : item.destructive
                                            ? 'text-destructive hover:bg-destructive/10'
                                            : 'hover:bg-muted'
                                )}
                            >
                                {item.icon && (
                                    <span className="flex-shrink-0">{item.icon}</span>
                                )}
                                <span className="text-base font-medium">
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </nav>
                </DraggableBottomSheet>
            </div>
        </ContextMenuContext.Provider>
    );
}
