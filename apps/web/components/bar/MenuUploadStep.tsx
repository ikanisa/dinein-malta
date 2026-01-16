import React, { useState, useRef } from 'react';
import { GlassCard } from '../GlassCard';
import { Spinner } from '../Loading';
import { Button } from '../ui';
import { parseMenuWithOCR } from '../../services/barService';
import { MenuItem } from '../../types';

interface MenuUploadStepProps {
    onComplete: (items: MenuItem[]) => void;
    onBack: () => void;
    onSkip: () => void;
}

export const MenuUploadStep: React.FC<MenuUploadStepProps> = ({
    onComplete,
    onBack,
    onSkip,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Please upload an image (JPEG, PNG, WebP) or PDF');
            return;
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        setError(null);

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleProcess = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const items = await parseMenuWithOCR(file);

            if (items.length === 0) {
                setError('No menu items could be extracted. Please try a clearer image or add items manually.');
                return;
            }

            onComplete(items);
        } catch (err) {
            console.error('OCR processing failed:', err);
            setError('Failed to process menu. Please try again or skip this step.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            const input = fileInputRef.current;
            if (input) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(droppedFile);
                input.files = dataTransfer.files;
                handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="text-5xl mb-4">📷</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your Menu</h2>
                <p className="text-muted text-sm">
                    Take a photo of your menu and we&apos;ll extract the items automatically
                </p>
            </div>

            {/* Upload Area */}
            <GlassCard className="p-0 overflow-hidden">
                <div
                    className={`relative border-2 border-dashed rounded-xl transition-all ${file ? 'border-primary-500' : 'border-border hover:border-primary-400'
                        }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isProcessing}
                    />

                    {preview ? (
                        <div className="relative">
                            <img
                                src={preview}
                                alt="Menu preview"
                                className="w-full h-64 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <span className="text-white font-medium">Click to change</span>
                            </div>
                        </div>
                    ) : file ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-2">📄</div>
                            <p className="text-foreground font-medium">{file.name}</p>
                            <p className="text-sm text-muted">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-3">📤</div>
                            <p className="text-foreground font-medium mb-1">
                                Drag & drop your menu here
                            </p>
                            <p className="text-sm text-muted">
                                or click to browse (JPEG, PNG, PDF)
                            </p>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
            )}

            {/* AI Info */}
            <GlassCard className="flex items-start gap-3">
                <div className="text-2xl">✨</div>
                <div>
                    <p className="text-sm font-medium text-foreground">AI-Powered Extraction</p>
                    <p className="text-xs text-muted">
                        Our AI will read your menu and extract items, descriptions, and prices automatically
                    </p>
                </div>
            </GlassCard>

            {/* Processing State */}
            {isProcessing && (
                <div className="flex flex-col items-center gap-4 py-8">
                    <Spinner className="w-4 h-4" />
                    <div className="text-center">
                        <p className="text-foreground font-medium">Analyzing your menu...</p>
                        <p className="text-sm text-muted">This may take a moment</p>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
                {file && !isProcessing && (
                    <Button
                        onClick={handleProcess}
                        variant="primary"
                        size="lg"
                        className="w-full"
                    >
                        Extract Menu Items
                    </Button>
                )}

                <div className="flex gap-3">
                    <Button
                        onClick={onBack}
                        disabled={isProcessing}
                        variant="outline"
                        className="flex-1"
                    >
                        ← Back
                    </Button>
                    <Button
                        onClick={onSkip}
                        disabled={isProcessing}
                        variant="ghost"
                        className="flex-1"
                    >
                        Skip for now
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MenuUploadStep;
