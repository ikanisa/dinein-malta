/**
 * Data Quality Jobs
 * 
 * Automated checks and report definitions.
 */

export interface DataQualityJob {
    id: string;
    name: string;
    frequency: "daily" | "weekly";
    check: string;
    outputTarget: "venue_manager_inbox" | "platform_admin_inbox" | "report";
}

export const DATA_QUALITY_JOBS: DataQualityJob[] = [
    // Daily jobs
    {
        id: "DQ-01",
        name: "Venue Completeness",
        frequency: "daily",
        check: "venues missing heroImage, hours, or tags",
        outputTarget: "venue_manager_inbox"
    },
    {
        id: "DQ-02",
        name: "Menu Anomalies",
        frequency: "daily",
        check: "items missing price/currency, duplicate names, empty categories",
        outputTarget: "venue_manager_inbox"
    },
    {
        id: "DQ-03",
        name: "Offer Expiry",
        frequency: "daily",
        check: "offers expiring within 7 days",
        outputTarget: "venue_manager_inbox"
    },

    // Weekly jobs
    {
        id: "DQ-04",
        name: "Content Performance",
        frequency: "weekly",
        check: "top clicked but low conversion items/venues",
        outputTarget: "platform_admin_inbox"
    },
    {
        id: "DQ-05",
        name: "Broken Assets",
        frequency: "weekly",
        check: "dead image URLs",
        outputTarget: "venue_manager_inbox"
    }
];

export interface QualityIssue {
    jobId: string;
    venueId: string;
    entityType: "venue" | "menu" | "item" | "offer" | "asset";
    entityId: string;
    issueType: string;
    severity: "low" | "medium" | "high";
    suggestion?: string;
    detectedAt: string;
}

/**
 * Run a data quality check (stub implementation).
 */
export async function runQualityJob(
    jobId: string,
    _venueId?: string
): Promise<QualityIssue[]> {
    const job = DATA_QUALITY_JOBS.find(j => j.id === jobId);
    if (!job) {
        throw new Error(`Unknown job: ${jobId}`);
    }

    console.log(`[DQ] Running ${job.name} (${job.id})`);

    // In production: query database for issues
    // Return stub for now
    return [];
}

/**
 * Generate a data quality report summary.
 */
export function generateQualityReport(issues: QualityIssue[]): {
    totalIssues: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    topVenues: { venueId: string; count: number }[];
} {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const venueCount: Record<string, number> = {};

    for (const issue of issues) {
        byType[issue.issueType] = (byType[issue.issueType] || 0) + 1;
        bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
        venueCount[issue.venueId] = (venueCount[issue.venueId] || 0) + 1;
    }

    const topVenues = Object.entries(venueCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([venueId, count]) => ({ venueId, count }));

    return {
        totalIssues: issues.length,
        byType,
        bySeverity,
        topVenues
    };
}
