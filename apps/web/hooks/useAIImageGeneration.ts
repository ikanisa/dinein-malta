import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type ImageGenerationType = 'venue' | 'menu-item';

interface GenerateImageParams {
    prompt: string;
    entityId: string;
    type: ImageGenerationType;
}

interface UseAIImageGenerationReturn {
    generateImage: (params: GenerateImageParams) => Promise<string | null>;
    isGenerating: boolean;
    error: string | null;
}

export function useAIImageGeneration(): UseAIImageGenerationReturn {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const generateImage = async ({ prompt, entityId, type }: GenerateImageParams) => {
        setIsGenerating(true);
        setError(null);

        try {
            // Map frontend type to database table name
            const table = type === 'venue' ? 'vendors' : 'menu_items';
            const column = type === 'venue' ? 'ai_image_url' : 'ai_image_url'; // Using dedicated column

            const { data, error: apiError } = await supabase.functions.invoke('gemini-features', {
                body: {
                    action: 'generate-asset',
                    payload: {
                        prompt,
                        entityId,
                        table,
                        column
                    }
                }
            });

            if (apiError) throw apiError;

            if (!data?.data?.success) {
                throw new Error(data?.error || 'Failed to generate image');
            }

            return data.data.url;

        } catch (err: unknown) {
            console.error('Error generating image:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        generateImage,
        isGenerating,
        error
    };
}
