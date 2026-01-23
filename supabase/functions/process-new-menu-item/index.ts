import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiKey = Deno.env.get('GEMINI_API_KEY')!;

Deno.serve(async (req: Request) => {
    try {
        const { record } = await req.json();
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get venue context
        const { data: venue, error: venueError } = await supabase
            .from('venues')
            .select('*')
            .eq('id', record.venue_id)
            .single();

        if (venueError) throw venueError;

        // Generate image with Gemini
        const imagePrompt = `
      Professional food photography of ${record.name}.
      Description: ${record.description}
      Cuisine: ${venue.cuisine_types?.join(', ')}
      Style: Editorial, appetizing, hero shot
    `;

        const geminiResponse = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:generateImages',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': geminiKey
                },
                body: JSON.stringify({
                    prompt: imagePrompt,
                    number_of_images: 1,
                    aspect_ratio: '4:3'
                })
            }
        );

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            throw new Error(`Gemini API error: ${errorText}`);
        }

        const imageData = await geminiResponse.json();
        const imageBase64 = imageData.generated_images?.[0]?.image?.image_bytes;

        if (!imageBase64) {
            throw new Error("No image data returned from Gemini");
        }

        // Upload to Supabase Storage
        const fileName = `${record.id}.jpg`;
        const { error: uploadError } = await supabase.storage
            .from('menu-images')
            .upload(fileName, decode(imageBase64), {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Update menu item with image URL
        const imageUrl = `${supabaseUrl}/storage/v1/object/public/menu-images/${fileName}`;

        await supabase
            .from('menu_items')
            .update({
                image_url: imageUrl,
                ai_generated_image: true,
                last_ai_update: new Date().toISOString()
            })
            .eq('id', record.id);

        return new Response(
            JSON.stringify({ success: true, image_url: imageUrl }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
