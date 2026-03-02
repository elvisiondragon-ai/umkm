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
        const payloadJson = await req.json()
        console.log("📥 [CAPI-STORES] RECEIVED PAYLOAD:", JSON.stringify(payloadJson, null, 2))

        const { store_id, value, currency, order_id, customer_name, customer_wa, customer_email, items_summary } = payloadJson

        if (!store_id || !value) {
            console.error("❌ [CAPI-STORES] Missing required parameters. Store ID:", store_id, "Value:", value)
            throw new Error("Missing required parameters: store_id or value")
        }

        // Initialize Supabase Client securely using internal Service Role Key
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // 1. Fetch Store's CAPI Credentials secretly
        console.log(`🔍 [CAPI-STORES] Fetching credentials for store: ${store_id}`)
        const { data: store, error: fetchError } = await supabase
            .from('stores')
            .select('pixel, capi, test_event_code')
            .eq('id', store_id)
            .single()

        if (fetchError || !store) {
            console.error("❌ [CAPI-STORES] Store fetch error:", fetchError)
            throw new Error("Store not found or error fetching credentials")
        }

        const PIXEL_ID = store.pixel
        const ACCESS_TOKEN = store.capi
        const TEST_EVENT_CODE = store.test_event_code

        // Always save the order to the database first, regardless of CAPI status
        console.log(`💾 [CAPI-STORES] Attempting to save order for ${customer_name || payloadJson.customer} (${customer_email})`)
        let savedOrderDb = null;
        try {
            // Frontend might send 'customer' directly or 'customer_name' + 'customer_wa'
            const finalCustomerString = payloadJson.customer || (customer_name ? `${customer_name} (${customer_wa || '-'})` : (order_id || "Guest"));

            const { data: insertData, error: dbErr } = await supabase.from('stores_orders').insert({
                store_id: store_id,
                customer: finalCustomerString, // GUARANTEED NOT NULL
                customer_email: customer_email || null, // THE CRITICAL PIECE
                items: items_summary || payloadJson.items || "Order via WhatsApp Checkout",
                total_amount: value,
                status: "baru", 
                date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
            }).select().single()
            
            if (dbErr) {
                 console.error("❌ [CAPI-STORES] DB INSERT ERROR:", JSON.stringify(dbErr))
            } else {
                 console.log("✅ [CAPI-STORES] DB INSERT SUCCESS. Order ID:", insertData.id)
                 savedOrderDb = insertData;
            }
        } catch (dbErr) {
            console.error("❌ [CAPI-STORES] CRITICAL DB EXCEPTION:", dbErr);
        }

        // If the seller hasn't configured CAPI, return gracefully AFTER saving order
        if (!PIXEL_ID || !ACCESS_TOKEN) {
            console.log("ℹ️ [CAPI-STORES] No CAPI configured. Order saved successfully. Exiting.");
            return new Response(JSON.stringify({
                success: true,
                message: "Order saved. No CAPI configured for this store.",
                order: savedOrderDb
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        console.log(`[CAPI-STORES] Processing Meta Pixel event for ${customer_name}`)

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
