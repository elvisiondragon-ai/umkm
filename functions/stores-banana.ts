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
        console.log("Receiving Nano Banana Request...");
        const { prompt, imageBase64 } = await req.json()
        const openRouterApiKey = Deno.env.get("OPENROUTER_APIKEY") // Set in Supabase Secrets

        if (!openRouterApiKey) {
            console.error("CRITICAL: Missing OPENROUTER_APIKEY environment variable.");
            throw new Error("Missing OPENROUTER_APIKEY secret in Supabase")
        }

        const systemPrompt = `Generate a beautiful e-commerce banner. Focus on vibrant, professional aesthetics. The user's specific requirement is: ${prompt}`;

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

        const rawText = await response.text();

        // Strip out any keep-alive spacing or weird markdown wrappers before parsing
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        const cleanJsonToken = (firstBrace !== -1 && lastBrace !== -1)
            ? rawText.substring(firstBrace, lastBrace + 1)
            : rawText.trim();

        console.log("OpenRouter Cleaned Response (First 200chars):", cleanJsonToken.slice(0, 200));

        let data: any;
        try {
            data = JSON.parse(cleanJsonToken);
        } catch (parseEr) {
            console.error("Failed to parse OpenRouter response as JSON:", parseEr, "Cleaned JSON:", cleanJsonToken.slice(0, 100));
            throw new Error(`Invalid JSON from OpenRouter`);
        }

        if (!response.ok || data.error) {
            console.error("OpenRouter API Error:", data.error || data);
            throw new Error(data.error?.message || "OpenRouter Request Failed");
        }

        console.log("OpenRouter Parsed Successfully. Choices count:", data.choices?.length);

        // Helper functions copied from 'photo' project for robust image extraction
        function isHttpUrl(val: any) { return typeof val === 'string' && /^https?:\/\//i.test(val); }
        function isDataUrl(val: any) { return typeof val === 'string' && /^data:image\//i.test(val); }
        function extractContentType(node: any, fallback?: string): string {
            if (node && typeof node === 'object') {
                const candidates = [node.mime_type, node.media_type, node.content_type, node.type?.startsWith?.('image/') ? node.type : null];
                for (const c of candidates) { if (typeof c === 'string' && c.includes('/')) return c; }
            }
            return fallback || 'image/jpeg';
        }
        function findImageCandidate(payload: any): { kind: string, value: string } | null {
            const visited = new Set();
            const stack = [payload];
            while (stack.length) {
                const current = stack.pop();
                if (current == null) continue;
                if (typeof current === 'string' || typeof current === 'number' || typeof current === 'boolean') continue;
                if (Array.isArray(current)) {
                    for (const item of current) stack.push(item);
                    continue;
                }
                if (typeof current === 'object') {
                    if (visited.has(current)) continue;
                    visited.add(current);
                    const contentType = extractContentType(current);
                    const base64Keys = ['b64_json', 'base64', 'image_base64', 'b64'];
                    for (const key of base64Keys) {
                        const val = current[key];
                        if (typeof val === 'string' && val.length > 16) return { kind: 'base64', value: val };
                    }
                    if (typeof current?.image_url === 'string') {
                        if (isDataUrl(current.image_url)) return { kind: 'base64', value: current.image_url };
                        if (isHttpUrl(current.image_url)) return { kind: 'url', value: current.image_url };
                    }
                    if (current?.image_url && typeof current.image_url === 'object' && typeof current.image_url.url === 'string') {
                        if (isDataUrl(current.image_url.url)) return { kind: 'base64', value: current.image_url.url };
                        if (isHttpUrl(current.image_url.url)) return { kind: 'url', value: current.image_url.url };
                    }
                    const urlKeys = ['url', 'href', 'image'];
                    for (const key of urlKeys) {
                        const val = current[key];
                        if (typeof val === 'string') {
                            if (isDataUrl(val)) return { kind: 'base64', value: val };
                            if (isHttpUrl(val)) return { kind: 'url', value: val };
                        }
                    }
                    if (current?.imageUrl) {
                        const node = current.imageUrl;
                        if (typeof node === 'string') {
                            if (isDataUrl(node)) return { kind: 'base64', value: node };
                            if (isHttpUrl(node)) return { kind: 'url', value: node };
                        } else if (node && typeof node === 'object' && typeof node.url === 'string') {
                            if (isDataUrl(node.url)) return { kind: 'base64', value: node.url };
                            if (isHttpUrl(node.url)) return { kind: 'url', value: node.url };
                        }
                    }
                    if (current?.images && Array.isArray(current.images)) {
                        for (const img of current.images) {
                            if (img && typeof img === 'object' && Array.isArray(img.content)) {
                                for (const node of img.content) stack.push(node);
                            }
                            stack.push(img);
                        }
                    }
                    if (Array.isArray(current?.content)) {
                        for (const item of current.content) stack.push(item);
                    }
                    for (const value of Object.values(current)) {
                        if (value != null && (typeof value === 'object' || Array.isArray(value))) stack.push(value);
                    }
                }
            }
            return null;
        }

        const candidate = findImageCandidate(data);
        let imageUrlOrBase64 = "";

        if (candidate) {
            imageUrlOrBase64 = candidate.value;
            if (candidate.kind === 'base64' && !imageUrlOrBase64.startsWith('data:image')) {
                imageUrlOrBase64 = `data:image/jpeg;base64,${imageUrlOrBase64}`;
            }
            console.log("Successfully extracted image candidate of kind:", candidate.kind);
        } else {
            // Fallback: Check if the assistant just printed raw base64 or markdown in text
            const content = data?.choices?.[0]?.message?.content || "";
            const base64Match = content.match(/data:image\/[^;]+;base64,([a-zA-Z0-9+/=]+)/) || content.match(/!\[.*?\]\((.*?)\)/);
            if (base64Match && base64Match[1]) {
                imageUrlOrBase64 = base64Match[1];
                if (!imageUrlOrBase64.startsWith('data:image')) imageUrlOrBase64 = `data:image/jpeg;base64,${imageUrlOrBase64}`;
            } else if (!content.startsWith('http') && content.length > 500) {
                imageUrlOrBase64 = `data:image/jpeg;base64,${content.replace(/[^a-zA-Z0-9+/=]/g, '')}`;
            } else {
                console.error("Could not find any image payload in OpenRouter response.");
                throw new Error("No image generated by AI model.");
            }
        }

        return new Response(JSON.stringify({ image: imageUrlOrBase64, raw: data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error("Nano Banana Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
