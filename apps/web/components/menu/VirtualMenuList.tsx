/**
 * VirtualMenuList Component
 * Efficiently renders large menu item lists using windowing (react-window)
 * Automatically falls back to simple list for small item counts (<50)
 * 
 * Features:
 * - Windowing for 50+ items
 * - Auto-sizing to container
 * - Smooth scrolling
 * - Memory efficient
 */

import React, { useCallback, useRef } from 'react';
import { MenuItem } from '@/types';
import type { ListChildComponentProps } from 'react-window';

// Types for dynamically loaded virtualization components
interface FixedSizeListProps {
    height: number;
    width: number;
    itemCount: number;
    itemSize: number;
    overscanCount?: number;
    children: React.ComponentType<ListChildComponentProps>;
}

interface AutoSizerChildProps {
    height: number;
    width: number;
}

type FixedSizeListComponent = React.ComponentType<FixedSizeListProps>;
type AutoSizerComponent = React.ComponentType<{ children: (size: AutoSizerChildProps) => React.ReactNode }>;

// Dynamic import for virtualization libs
let FixedSizeList: FixedSizeListComponent | null = null;
let AutoSizer: AutoSizerComponent | null = null;
let libsLoaded = false;

const loadVirtualizationLibs = async () => {
    if (libsLoaded) return;
    try {
        const [reactWindow, autoSizer] = await Promise.all([
            import('react-window'),
            import('react-virtualized-auto-sizer'),
        ]);
        FixedSizeList = reactWindow.FixedSizeList as FixedSizeListComponent;
        AutoSizer = (autoSizer.default || autoSizer) as AutoSizerComponent;
        libsLoaded = true;
    } catch (err) {
        console.warn('[VirtualMenuList] Failed to load virtualization libs:', err);
    }
};

export interface VirtualMenuListProps {
    items: MenuItem[];
    onAddToCart: (item: MenuItem) => void;
    onToggleFavorite: (item: MenuItem) => void;
    isFavorite: (itemId: string) => boolean;
    /**
     * Render function for each menu item
     * If not provided, a default card renderer is used
     */
    renderItem?: (item: MenuItem, index: number) => React.ReactNode;
    /** Height of each item in pixels (default: 128) */
    itemHeight?: number;
    /** Force virtualization even for small lists (for testing) */
    forceVirtual?: boolean;
    /** Minimum items before enabling virtualization */
    virtualThreshold?: number;
}

/** 
 * Default menu item card renderer
 */
const DefaultMenuItemCard: React.FC<{
    item: MenuItem;
    onAddToCart: (item: MenuItem) => void;
    onToggleFavorite: (item: MenuItem) => void;
    isFavorite: boolean;
}> = React.memo(({ item, onAddToCart, onToggleFavorite, isFavorite }) => {
    return (
        <article
            className="flex gap-4 p-0 overflow-hidden bg-surface shadow-sm rounded-xl border border-border"
            role="article"
            aria-labelledby={`menu-item-${item.id}-name`}
        >
            <div
                className="w-28 h-28 bg-surface-highlight relative flex-shrink-0"
                role="img"
                aria-label={`${item.name} image`}
                style={{ aspectRatio: '1 / 1' }}
            >
                {item.imageUrl && (
                    <img
                        src={item.imageUrl}
                        alt={`${item.name}${item.description ? ` - ${item.description}` : ''}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width={112}
                        height={112}
                    />
                )}
            </div>
            <div className="flex-1 py-3 pr-3 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <h3
                            id={`menu-item-${item.id}-name`}
                            className="font-bold text-base leading-tight mb-1 text-foreground flex-1"
                        >
                            {item.name}
                        </h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(item);
                            }}
                            className="min-w-[48px] min-h-[48px] flex items-center justify-center text-xl flex-shrink-0 active:scale-90 transition-transform focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 rounded-full"
                            aria-label={isFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                            aria-pressed={isFavorite}
                        >
                            <span aria-hidden="true">{isFavorite ? '⭐' : '☆'}</span>
                        </button>
                    </div>
                    {item.description && (
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                            {item.description}
                        </p>
                    )}
                </div>

                <div className="flex justify-between items-end mt-2">
                    <span
                        className="font-bold text-lg text-foreground"
                        aria-label={`Price: €${item.price.toFixed(2)}`}
                    >
                        €{item.price.toFixed(2)}
                    </span>
                    <button
                        onClick={() => onAddToCart(item)}
                        aria-label={`Add ${item.name} to cart for €${item.price.toFixed(2)}`}
                        className="min-w-[48px] min-h-[48px] w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xl active:scale-90 transition-transform shadow-lg focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                    >
                        <span aria-hidden="true">+</span>
                    </button>
                </div>
            </div>
        </article>
    );
});

DefaultMenuItemCard.displayName = 'DefaultMenuItemCard';

/**
 * Simple menu list - renders all items without virtualization
 * Used for lists under the threshold or when virtualization fails to load
 */
export const SimpleMenuList: React.FC<VirtualMenuListProps> = ({
    items,
    onAddToCart,
    onToggleFavorite,
    isFavorite,
    renderItem,
}) => {
    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                renderItem ? (
                    <div key={item.id}>{renderItem(item, index)}</div>
                ) : (
                    <DefaultMenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={onAddToCart}
                        onToggleFavorite={onToggleFavorite}
                        isFavorite={isFavorite(item.id)}
                    />
                )
            ))}
        </div>
    );
};

/**
 * Virtual menu list - uses windowing for large lists
 * Falls back to SimpleMenuList for small lists or if loading fails
 */
export const VirtualMenuList: React.FC<VirtualMenuListProps> = ({
    items,
    onAddToCart,
    onToggleFavorite,
    isFavorite,
    renderItem,
    itemHeight = 128,
    forceVirtual = false,
    virtualThreshold = 50,
}) => {
    const [ready, setReady] = React.useState(libsLoaded);
    const containerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!libsLoaded) {
            loadVirtualizationLibs().then(() => setReady(true));
        }
    }, []);

    // Don't use virtualization for small lists
    const useVirtual = (forceVirtual || items.length >= virtualThreshold) && ready && FixedSizeList && AutoSizer;

    const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
        const item = items[index];
        return (
            <div style={{ ...style, paddingRight: 16, paddingBottom: 16 }}>
                {renderItem ? (
                    renderItem(item, index)
                ) : (
                    <DefaultMenuItemCard
                        item={item}
                        onAddToCart={onAddToCart}
                        onToggleFavorite={onToggleFavorite}
                        isFavorite={isFavorite(item.id)}
                    />
                )}
            </div>
        );
    }, [items, renderItem, onAddToCart, onToggleFavorite, isFavorite]);

    if (!useVirtual) {
        return (
            <SimpleMenuList
                items={items}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite}
                renderItem={renderItem}
            />
        );
    }

    const ListComponent = FixedSizeList!;
    const SizerComponent = AutoSizer!;

    return (
        <div ref={containerRef} className="h-full min-h-[400px]" style={{ height: 'calc(100vh - 300px)' }}>
            <SizerComponent>
                {({ height, width }: { height: number; width: number }) => (
                    <ListComponent
                        height={height}
                        itemCount={items.length}
                        itemSize={itemHeight}
                        width={width}
                        overscanCount={5}
                    >
                        {Row}
                    </ListComponent>
                )}
            </SizerComponent>
        </div>
    );
};

VirtualMenuList.displayName = 'VirtualMenuList';

export default VirtualMenuList;
