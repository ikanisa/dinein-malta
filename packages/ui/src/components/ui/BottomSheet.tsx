import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                />
                <DialogPrimitive.Content
                    className={cn(
                        "fixed inset-x-0 bottom-0 z-[101] flex flex-col bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom max-h-[85vh] sm:max-w-md sm:mx-auto sm:inset-x-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-top-[48%] dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800",
                        className
                    )}
                >
                    {/* Handle for drag (visual cue) */}
                    <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-12 h-1.5 bg-zinc-200 rounded-full dark:bg-zinc-700" />
                    </div>

                    {/* Header */}
                    <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                        <DialogPrimitive.Title className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            {title}
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Close className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <X size={20} />
                            <span className="sr-only">Close</span>
                        </DialogPrimitive.Close>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 text-zinc-900 dark:text-zinc-100">
                        {children}
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
