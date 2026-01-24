import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import {
    handleCors,
    jsonResponse,
    errorResponse,
    createLogger,
    getOrCreateRequestId,
    optionalAuth,
} from "../_lib/mod.ts";

const paymentIntentSchema = z.object({
    amount: z.number().positive(), // Amount in cents
    currency: z.string().length(3).default("eur"),
    description: z.string().optional(),
    metadata: z.record(z.string()).optional(),
    receipt_email: z.string().email().optional(),
});

Deno.serve(async (req) => {
    const requestId = getOrCreateRequestId(req);
    const logger = createLogger({ requestId, action: "create_payment_intent" });

    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    if (req.method !== "POST") {
        return errorResponse("Method not allowed", 405);
    }

    try {
        // Auth check (optional but recommended for logging)
        const authResult = await optionalAuth(req, logger);
        const userId = authResult?.user?.id;

        // Initialize Stripe
        const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
        if (!STRIPE_SECRET_KEY) {
            logger.error("Missing STRIPE_SECRET_KEY");
            return errorResponse("Configuration error", 500);
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: "2023-10-16",
            httpClient: Stripe.createFetchHttpClient(),
        });

        // Parse body
        const body = await req.json();
        const parsed = paymentIntentSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Invalid request data", 400, parsed.error.issues);
        }

        const { amount, currency, description, metadata, receipt_email } = parsed.data;

        logger.info("Creating payment intent", { amount, currency });

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Ensure integer
            currency: currency.toLowerCase(),
            automatic_payment_methods: { enabled: true },
            description,
            receipt_email,
            metadata: {
                ...metadata,
                userId: userId || "anonymous",
            },
        });

        return jsonResponse({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
        });

    } catch (error) {
        logger.error("Payment intent creation error", { error: String(error) });
        return errorResponse("Failed to create payment intent", 500, String(error));
    }
});
