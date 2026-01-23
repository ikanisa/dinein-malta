'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ParsedMenuItem {
    name: string;
    description: string | null;
    price: number;
    currency: string;
    category: string;
    dietary_tags: string[];
}

export function MenuUploadDialog() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [parsedItems, setParsedItems] = useState<ParsedMenuItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("venueId", "demo-venue-id"); // In real app, get from context

        try {
            const res = await fetch("/api/ai/extract-menu", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.items) {
                setParsedItems(data.items);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = () => {
        // Here you would send parsedItems to your save API
        console.log("Saving items:", parsedItems);
        setIsOpen(false);
        setParsedItems([]);
        setFile(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Menu Image (AI)
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Analyze Menu Image</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    {!parsedItems.length ? (
                        <div className="space-y-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="menu-image">Menu Image</Label>
                                <Input id="menu-image" type="file" accept="image/*" onChange={handleFileChange} />
                            </div>
                            <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing with Gemini...
                                    </>
                                ) : (
                                    "Analyze"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto p-1">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">{parsedItems.length} Items Found</h3>
                                <Button variant="outline" size="sm" onClick={() => setParsedItems([])}>Reset</Button>
                            </div>
                            <div className="h-[400px] border rounded-md p-4 overflow-auto">
                                <div className="space-y-6">
                                    {/* Group by Category for display */}
                                    {Object.entries(parsedItems.reduce((acc, item) => {
                                        const cat = item.category || 'Uncategorized';
                                        if (!acc[cat]) acc[cat] = [];
                                        acc[cat].push(item);
                                        return acc;
                                    }, {} as Record<string, ParsedMenuItem[]>)).map(([category, items]) => (
                                        <div key={category} className="space-y-3">
                                            <h4 className="font-medium text-primary sticky top-0 bg-background py-1">{category}</h4>
                                            <div className="grid gap-3">
                                                {items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-start border p-3 rounded-lg text-sm">
                                                        <div>
                                                            <div className="font-medium">{item.name}</div>
                                                            <div className="text-muted-foreground text-xs">{item.description}</div>
                                                            <div className="flex gap-1 mt-1">
                                                                {item.dietary_tags.map(tag => (
                                                                    <Badge key={tag} variant="secondary" className="px-1 py-0 text-[10px]">{tag}</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="font-mono">
                                                            {item.price} {item.currency}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {parsedItems.length > 0 && (
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>
                            <Check className="w-4 h-4 mr-2" />
                            Confirm & Save
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
