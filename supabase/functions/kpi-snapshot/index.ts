/**
 * Scheduled KPI Snapshot Edge Function
 * 
 * This function should be called periodically (e.g., every hour via cron)
 * to generate KPI snapshots for all active venues in the rollout.
 * 
 * Can be triggered by:
 * - Supabase pg_cron extension
 * - External cron service (e.g., Cloudflare, GitHub Actions)
 * - Manual invocation for specific venues
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_lib/cors.ts";
import {
    generateKPISnapshot,
    saveKPISnapshot,
    evaluateGateThresholds,
} from "../_lib/kpi_tracking.ts";
import { processAllVenuesFallback } from "../_lib/cohort_manager.ts";

interface SnapshotRequest {
    venueIds?: string[];          // Specific venues (default: all active)
    periodMinutes?: number;        // Snapshot period (default: 60)
    checkGates?: boolean;          // Evaluate gate thresholds (default: false)
    checkFallback?: boolean;       // Check for automatic fallback (default: true)
    dryRun?: boolean;              // Don't save, just return results (default: false)
}


serve(async (req) => {
    // CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Parse request options
        let options: SnapshotRequest = {};
        try {
            options = await req.json();
        } catch {
            // Empty body OK, use defaults
        }

        const periodMinutes = options.periodMinutes ?? 60;
        const checkGates = options.checkGates ?? false;
        const checkFallback = options.checkFallback ?? true;
        const dryRun = options.dryRun ?? false;


        // Get venues to snapshot
        let venueIds: string[] = options.venueIds ?? [];

        if (venueIds.length === 0) {
            // Get all venues that are in a non-off rollout mode
            const { data: rolloutModes } = await supabase
                .from("rollout_modes")
                .select("venue_id")
                .neq("mode", "off");

            venueIds = rolloutModes?.map(rm => rm.venue_id) ?? [];
        }

        if (venueIds.length === 0) {
            return new Response(
                JSON.stringify({
                    message: "No venues in active rollout mode",
                    snapshotsGenerated: 0
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Generate snapshots for each venue
        const results: Array<{
            venueId: string;
            success: boolean;
            kpis?: Record<string, number | null>;
            gateCheck?: { gate: string; passed: boolean; blockers: string[] };
            error?: string;
        }> = [];

        for (const venueId of venueIds) {
            try {
                // Generate snapshot
                const snapshot = await generateKPISnapshot(supabase, venueId, periodMinutes);

                // Save unless dry run
                if (!dryRun) {
                    const saveResult = await saveKPISnapshot(supabase, snapshot);
                    if (!saveResult.success) {
                        results.push({ venueId, success: false, error: saveResult.error });
                        continue;
                    }
                }

                // Optionally check gate thresholds
                let gateCheck: { gate: string; passed: boolean; blockers: string[] } | undefined;
                if (checkGates) {
                    // Get current rollout mode to determine which gate to check
                    const { data: modeData } = await supabase
                        .from("rollout_modes")
                        .select("mode")
                        .eq("venue_id", venueId)
                        .single();

                    if (modeData?.mode === "shadow_ui") {
                        const eval1to2 = evaluateGateThresholds(snapshot.kpis, "RM1_to_RM2");
                        gateCheck = { gate: "RM1_to_RM2", ...eval1to2 };
                    } else if (modeData?.mode === "assisted") {
                        const eval2to3 = evaluateGateThresholds(snapshot.kpis, "RM2_to_RM3");
                        gateCheck = { gate: "RM2_to_RM3", ...eval2to3 };
                    }
                }

                results.push({
                    venueId,
                    success: true,
                    kpis: snapshot.kpis as Record<string, number | null>,
                    gateCheck,
                });

            } catch (error) {
                results.push({
                    venueId,
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        // Summary
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;
        const gatesPassedCount = results.filter(r => r.gateCheck?.passed).length;

        // Log summary
        console.log(JSON.stringify({
            type: "kpi_snapshot_batch",
            venueCount: venueIds.length,
            successCount,
            failureCount,
            gatesPassedCount,
            periodMinutes,
            dryRun,
            timestamp: new Date().toISOString(),
        }));

        // Process automatic fallback monitoring (after snapshots are saved)
        let fallbackResult: { warnings: number; fallbacks: number } | undefined;
        if (checkFallback && !dryRun) {
            const fb = await processAllVenuesFallback(supabase);
            fallbackResult = { warnings: fb.warnings, fallbacks: fb.fallbacks };

            // Log fallback activity
            if (fb.warnings > 0 || fb.fallbacks > 0) {
                console.log(JSON.stringify({
                    type: "rollout_fallback_check",
                    processed: fb.processed,
                    warnings: fb.warnings,
                    fallbacks: fb.fallbacks,
                    details: fb.details,
                    timestamp: new Date().toISOString(),
                }));
            }
        }

        return new Response(
            JSON.stringify({
                snapshotsGenerated: successCount,
                failures: failureCount,
                gatesPassed: gatesPassedCount,
                fallbackWarnings: fallbackResult?.warnings,
                fallbackTriggered: fallbackResult?.fallbacks,
                dryRun,
                results: dryRun ? results : undefined, // Only include details in dry run
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );


    } catch (error) {
        console.error("KPI Snapshot error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
