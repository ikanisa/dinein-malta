import React, { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { Spinner } from '../Loading';
import { generateMenuItemImage } from '../../services/barService';
import { MenuItem } from '../../types';

interface MenuReviewStepProps {
    items: MenuItem[];
    onComplete: (items: MenuItem[]) => void;
    onBack: () => void;
}

export const MenuReviewStep: React.FC<MenuReviewStepProps> = ({
    items: initialItems,
    onComplete,
    onBack,
}) => {
    const [items, setItems] = useState<MenuItem[]>(initialItems);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [generatingImageIds, setGeneratingImageIds] = useState<Set<string>>(new Set());
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

    const handleEdit = (id: string, field: keyof MenuItem, value: string | number) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, [field]: field === 'price' ? parseFloat(value as string) || 0 : value }
                    : item
            )
        );
    };

    const handleRemove = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleGenerateImage = async (item: MenuItem) => {
        setGeneratingImageIds((prev) => new Set(prev).add(item.id));

        try {
            const imageUrl = await generateMenuItemImage(item);
            if (imageUrl) {
                setItems((prev) =>
                    prev.map((i) => (i.id === item.id ? { ...i, imageUrl } : i))
                );
            }
        } catch (error) {
            console.error('Image generation failed:', error);
        } finally {
            setGeneratingImageIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(item.id);
                return newSet;
            });
        }
    };

    const handleGenerateAllImages = async () => {
        const itemsWithoutImages = items.filter((item) => !item.imageUrl);
        if (itemsWithoutImages.length === 0) return;

        setIsGeneratingAll(true);

        for (const item of itemsWithoutImages) {
            await handleGenerateImage(item);
        }

        setIsGeneratingAll(false);
    };

    const handleConfirm = () => {
        onComplete(items);
    };

    const categories = [...new Set(items.map((item) => item.category))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="text-5xl mb-4">✏️</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Review Menu Items</h2>
                <p className="text-muted text-sm">
                    Edit extracted items and generate AI images
                </p>
            </div>

            {/* Summary */}
            <GlassCard className="flex justify-between items-center">
                <div>
                    <span className="font-bold text-foreground text-lg">{items.length}</span>
                    <span className="text-muted ml-1">items extracted</span>
                </div>
                <button
                    onClick={handleGenerateAllImages}
                    disabled={isGeneratingAll || items.every((i) => i.imageUrl)}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 active:scale-95 transition-all"
                >
                    {isGeneratingAll ? 'Generating...' : '✨ Generate All Images'}
                </button>
            </GlassCard>

            {/* Items by Category */}
            {categories.map((category) => (
                <div key={category} className="space-y-3">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wide">
                        {category}
                    </h3>

                    {items
                        .filter((item) => item.category === category)
                        .map((item) => (
                            <GlassCard key={item.id} className="p-0 overflow-hidden">
                                <div className="flex">
                                    {/* Image Section */}
                                    <div className="w-24 h-24 flex-shrink-0 bg-surface-highlight relative">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : generatingImageIds.has(item.id) ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Spinner className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleGenerateImage(item)}
                                                className="w-full h-full flex flex-col items-center justify-center text-muted hover:text-primary-500 transition-colors"
                                            >
                                                <span className="text-2xl">🎨</span>
                                                <span className="text-xs">Generate</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 p-3">
                                        {editingId === item.id ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleEdit(item.id, 'name', e.target.value)}
                                                    className="w-full px-2 py-1 bg-surface-highlight border border-border rounded text-sm text-foreground"
                                                    placeholder="Item name"
                                                />
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => handleEdit(item.id, 'description', e.target.value)}
                                                    className="w-full px-2 py-1 bg-surface-highlight border border-border rounded text-xs text-foreground"
                                                    placeholder="Description"
                                                />
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-muted">€</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.price}
                                                        onChange={(e) => handleEdit(item.id, 'price', e.target.value)}
                                                        className="w-20 px-2 py-1 bg-surface-highlight border border-border rounded text-sm text-foreground"
                                                    />
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="ml-auto text-xs text-primary-500 font-medium"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-foreground text-sm line-clamp-1">
                                                            {item.name}
                                                        </h4>
                                                        {item.description && (
                                                            <p className="text-xs text-muted line-clamp-1">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-primary-500 text-sm ml-2">
                                                        €{item.price.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => setEditingId(item.id)}
                                                        className="text-xs text-muted hover:text-foreground transition-colors"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(item.id)}
                                                        className="text-xs text-red-400 hover:text-red-500 transition-colors"
                                                    >
                                                        🗑️ Remove
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                </div>
            ))}

            {/* Empty State */}
            {items.length === 0 && (
                <GlassCard className="text-center py-8">
                    <div className="text-4xl mb-3">🍽️</div>
                    <p className="text-muted">No menu items</p>
                    <p className="text-sm text-muted">Go back to upload a menu</p>
                </GlassCard>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={onBack}
                    className="flex-1 py-3 px-6 bg-surface-highlight border border-border text-foreground font-medium rounded-xl active:scale-95 transition-all"
                >
                    ← Back
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={items.length === 0}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
                >
                    Confirm Menu →
                </button>
            </div>
        </div>
    );
};

export default MenuReviewStep;
