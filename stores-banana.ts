import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { prompt, imageBase64 } = await req.json()
        const openRouterApiKey = Deno.env.get("OPENROUTER_APIKEY") // Set in Supabase Secrets

        if (!openRouterApiKey) {
            throw new Error("Missing OPENROUTER_APIKEY secret in Supabase")
        }

        const systemPrompt = `Generate a beautiful 16:9 banner suitable for an Indonesian UMKM store. Focus on e-commerce vibes and aesthetic quality. The output MUST contain the product image integrated beautifully into the background, a striking HEADLINE, and a short compelling DESKRIPSI. The user's specific theme is: ${prompt}`

        let messageContent: any = systemPrompt;

        if (imageBase64) {
            messageContent = [
                { type: "text", text: systemPrompt },
                {
                    type: "image_url",
                    image_url: {
                        url: imageBase64
                    }
                }
            ];
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-3.1-flash-image-preview",
                messages: [{
                    role: "user",
                    content: messageContent
                }]
            })
        })

        const data = await response.json()

        let imageUrlOrBase64 = ""
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const content = data.choices[0].message.content || "";

            // The Gemini model often returns raw base64 or markdown with base64
            const base64Match = content.match(/data:image\/[^;]+;base64,([a-zA-Z0-9+/=]+)/) || content.match(/!\[.*?\]\((.*?)\)/);

            if (base64Match && base64Match[1]) {
                imageUrlOrBase64 = base64Match[1];
                if (!imageUrlOrBase64.startsWith('data:image')) {
                    imageUrlOrBase64 = `data:image/jpeg;base64,${imageUrlOrBase64}`;
                }
            } else {
                // Try to just take it as raw content if it looks like base64
                if (!content.startsWith('http') && content.length > 500) {
                    imageUrlOrBase64 = `data:image/jpeg;base64,${content.replace(/[^a-zA-Z0-9+/=]/g, '')}`;
                } else {
                    imageUrlOrBase64 = content;
                }
            }
        }

        return new Response(JSON.stringify({ image: imageUrlOrBase64, raw: data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
