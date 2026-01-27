import { useState, useEffect } from 'react';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AnimatePresence, motion } from 'framer-motion';
import { Hash, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export interface TableNumberSheetProps {
    isOpen: boolean;
    onClose: () => void;
    /** Current table number if set */
    currentTable?: string;
    /** Callback when table is confirmed */
    onConfirm: (table: string) => void;
    /** If true, user can't close without setting a table (for checkout) */
    isRequired?: boolean;
}

/**
 * Table Number Sheet
 * Small bottom sheet to set/edit table number.
 * Can auto-fill from query param but that logic stays in the app layer.
 */
export function TableNumberSheet({
    isOpen,
    onClose,
    currentTable = '',
    onConfirm,
    isRequired = false,
}: TableNumberSheetProps) {
    const [table, setTable] = useState(currentTable);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTable(currentTable);
            setError('');
        }
    }, [isOpen, currentTable]);

    const handleConfirm = () => {
        if (!table.trim()) {
            setError('Please enter your table number');
            return;
        }
        onConfirm(table.trim());
        // Close is handled by parent or usually implies success
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={() => {
                if (!isRequired) onClose();
            }}
            title="What's your table number?"
        >
            <div className="flex flex-col gap-6 pb-8 pt-2 px-4">
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                        We need this to know where to bring your food.
                        Look for the number on your table.
                    </p>

                    <div className="relative mt-2">
                        <Hash className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                            autoFocus
                            placeholder="e.g. 12"
                            value={table}
                            onChange={(e) => {
                                setTable(e.target.value);
                                if (error) setError('');
                            }}
                            className={cn(
                                "pl-10 text-lg h-12 font-medium bg-secondary/30 border-transparent focus:border-primary/50 focus:ring-0",
                                error && "border-destructive focus:border-destructive"
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirm();
                            }}
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-destructive text-sm font-medium ml-1"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <Button
                    size="lg"
                    onClick={handleConfirm}
                    disabled={!table.trim()}
                    className="w-full gap-2 text-base font-semibold"
                >
                    <Check className="h-4 w-4" />
                    Confirm Table {table ? `#${table}` : ''}
                </Button>
            </div>
        </BottomSheet>
    );
}
