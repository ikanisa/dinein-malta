import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const geminiKey = Deno.env.get('GEMINI_API_KEY')!

serve(async (req) => {
    try {
        const { record } = await req.json()
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Get venue context
        const { data: venue } = await supabase
            .from('venues')
            .select('*')
            .eq('id', record.venue_id)
            .single()

        // Generate image with Gemini
        const imagePrompt = `
      Professional food photography of ${record.name}.
      Description: ${record.description}
      Cuisine: ${venue.cuisine_types?.join(', ')}
      Style: Editorial, appetizing, hero shot
    `

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
        )

        const imageData = await geminiResponse.json()
        const imageBase64 = imageData.generated_images[0].image.image_bytes

        // Upload to Supabase Storage
        const fileName = `${record.id}.jpg`
        const { error: uploadError } = await supabase.storage
            .from('menu-images')
            .upload(fileName, decode(imageBase64), {
                contentType: 'image/jpeg',
                upsert: true
            })

        if (uploadError) throw uploadError

        // Update menu item with image URL
        const imageUrl = `${supabaseUrl}/storage/v1/object/public/menu-images/${fileName}`

        await supabase
            .from('menu_items')
            .update({
                image_url: imageUrl,
                ai_generated_image: true,
                last_ai_update: new Date().toISOString()
            })
            .eq('id', record.id)

        return new Response(
            JSON.stringify({ success: true, image_url: imageUrl }),
            { headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
})

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}
