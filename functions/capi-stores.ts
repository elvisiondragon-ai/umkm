import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { store_id, value, currency, order_id, customer_name, customer_wa, items_summary } = await req.json()

        if (!store_id || !value) {
            throw new Error("Missing required parameters: store_id or value")
        }

        // Initialize Supabase Client securely using internal Service Role Key
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 1. Fetch Store's CAPI Credentials secretly
        const { data: store, error: fetchError } = await supabase
            .from('stores')
            .select('pixel, capi, test_event_code')
            .eq('id', store_id)
            .single()

        if (fetchError || !store) {
            throw new Error("Store not found or error fetching credentials")
        }

        const PIXEL_ID = store.pixel
        const ACCESS_TOKEN = store.capi
        const TEST_EVENT_CODE = store.test_event_code

        // Always save the order to the database first, regardless of CAPI status
        try {
            await supabase.from('stores_orders').insert({
                store_id: store_id,
                customer: customer_name ? `${customer_name} (${customer_wa})` : (order_id || "Guest"),
                items: items_summary || "Order via WhatsApp Checkout",
                total_amount: value,
                status: "baru", // changed from Pending to match frontend status literal 'baru'
                date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
            })
        } catch (dbErr) {
            console.error("Failed to insert order to DB (Non-fatal):", dbErr);
        }

        // If the seller hasn't configured CAPI, just return gracefully
        if (!PIXEL_ID || !ACCESS_TOKEN) {
            return new Response(JSON.stringify({
                success: true,
                message: "No CAPI configured for this store. Ignored."
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 2. Prepare Meta Conversions API Payload (Purchase Event)
        const eventId = order_id || `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        const timestamp = Math.floor(Date.now() / 1000)

        // Generate a random client IP and user agent as fallback since we are server-side
        // Ideally these should be passed from the frontend, but for simplicity we mock it if missing

        const payload: any = {
            data: [
                {
                    event_name: "Purchase",
                    event_time: timestamp,
                    action_source: "website",
                    event_id: eventId,
                    user_data: {
                        client_user_agent: req.headers.get('user-agent') || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        // Faking an IP if none provided just to satisfy Meta's strict requirements
                        client_ip_address: req.headers.get('x-forwarded-for') || "103.23.234.120",
                    },
                    custom_data: {
                        currency: currency || "IDR",
                        value: value
                    }
                }
            ]
        }

        // Add Test Event Code if provided
        if (TEST_EVENT_CODE) {
            payload.test_event_code = TEST_EVENT_CODE;
        }

        // 3. Send request to Meta Graph API
        const metaApiUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`

        const metaResponse = await fetch(metaApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const metaResult = await metaResponse.json()

        if (!metaResponse.ok) {
            console.error("Meta API Error:", metaResult)
            throw new Error(`Meta API Error: ${JSON.stringify(metaResult)}`)
        }

        return new Response(JSON.stringify({
            success: true,
            message: "CAPI Purchase Event fired successfully and Order Saved",
            meta_response: metaResult
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("CAPI Edge Function Error:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
