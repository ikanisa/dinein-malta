/**
 * RolloutDashboard - Admin console for managing AI rollout
 * 
 * Features:
 * - Feature flag toggles
 * - Kill switch controls
 * - Venue rollout mode management
 * - KPI overview & gate status
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../shared/services/supabase';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

interface FeatureFlag {
    id: string;
    flag_key: string;
    default_enabled: boolean;
    scope: string[];
    description: string;
}

interface KillSwitch {
    id: string;
    description: string;
    is_active: boolean;
    scope: string;
    activated_at: string | null;
    reason: string | null;
}

interface VenueRollout {
    venue_id: string;
    mode: 'off' | 'shadow_ui' | 'assisted' | 'full';
    updated_at: string;
    venue_name?: string;
}

interface KPISnapshot {
    venue_id: string;
    snapshot_at: string;
    uiplan_valid_rate: number | null;
    tool_error_rate: number | null;
    tenant_mismatch_count: number;
    approval_bypass_attempts: number;
    avg_order_value: number | null;
}

interface Cohort {
    id: string;
    name: string;
    phase: string;
    venue_count?: number;
}

type TabType = 'overview' | 'flags' | 'switches' | 'venues' | 'cohorts';

// =============================================================================
// HELPERS
// =============================================================================

function getModeColor(mode: string): string {
    switch (mode) {
        case 'off': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'shadow_ui': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'assisted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'full': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getModeLabel(mode: string): string {
    switch (mode) {
        case 'off': return 'Off';
        case 'shadow_ui': return 'Shadow UI';
        case 'assisted': return 'Assisted';
        case 'full': return 'Full';
        default: return mode;
    }
}

function formatPercent(value: number | null): string {
    if (value === null || value === undefined) return '—';
    return `${(value * 100).toFixed(1)}%`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function RolloutDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [loading, setLoading] = useState(true);

    // Data states
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [switches, setSwitches] = useState<KillSwitch[]>([]);
    const [venues, setVenues] = useState<VenueRollout[]>([]);
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [kpis, setKpis] = useState<KPISnapshot[]>([]);

    // Summary stats
    const [stats, setStats] = useState({
        totalVenues: 0,
        venuesByMode: {} as Record<string, number>,
        activeKillSwitches: 0,
        enabledFlags: 0,
    });

    // ==========================================================================
    // DATA LOADING
    // ==========================================================================

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Load feature flags
            const { data: flagData } = await supabase
                .from('feature_flags')
                .select('*')
                .order('flag_key');
            setFlags(flagData ?? []);

            // Load kill switches
            const { data: switchData } = await supabase
                .from('kill_switches')
                .select('*')
                .order('id');
            setSwitches(switchData ?? []);

            // Load venue rollout modes
            const { data: rolloutData } = await supabase
                .from('rollout_modes')
                .select('venue_id, mode, updated_at, venues(name)')
                .order('updated_at', { ascending: false });

            const venueRollouts: VenueRollout[] = (rolloutData ?? []).map((r: any) => ({
                venue_id: r.venue_id,
                mode: r.mode,
                updated_at: r.updated_at,
                venue_name: r.venues?.name ?? 'Unknown',
            }));
            setVenues(venueRollouts);

            // Load cohorts with venue counts
            const { data: cohortData } = await supabase
                .from('rollout_cohorts')
                .select('*, venue_cohort_assignments(count)')
                .order('created_at');

            const cohortList: Cohort[] = (cohortData ?? []).map((c: any) => ({
                id: c.id,
                name: c.name,
                phase: c.phase,
                venue_count: c.venue_cohort_assignments?.[0]?.count ?? 0,
            }));
            setCohorts(cohortList);

            // Load latest KPIs
            const { data: kpiData } = await supabase
                .from('kpi_snapshots')
                .select('*')
                .order('snapshot_at', { ascending: false })
                .limit(20);
            setKpis(kpiData ?? []);

            // Calculate stats
            const activeKillSwitches = (switchData ?? []).filter((s: any) => s.is_active).length;
            const enabledFlags = (flagData ?? []).filter((f: any) => f.default_enabled).length;
            const venuesByMode: Record<string, number> = {};
            for (const v of venueRollouts) {
                venuesByMode[v.mode] = (venuesByMode[v.mode] ?? 0) + 1;
            }

            setStats({
                totalVenues: venueRollouts.length,
                venuesByMode,
                activeKillSwitches,
                enabledFlags,
            });

        } catch (error) {
            console.error('Error loading rollout data:', error);
            toast.error('Failed to load rollout data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ==========================================================================
    // ACTIONS
    // ==========================================================================

    const toggleKillSwitch = async (switchId: string, activate: boolean) => {
        try {
            const { error } = await supabase
                .from('kill_switches')
                .update({
                    is_active: activate,
                    activated_at: activate ? new Date().toISOString() : null,
                    reason: activate ? 'Activated via Admin Dashboard' : null,
                })
                .eq('id', switchId);

            if (error) throw error;

            toast.success(`Kill switch ${activate ? 'activated' : 'deactivated'}`);
            loadData();
        } catch (error) {
            toast.error('Failed to toggle kill switch');
        }
    };

    const changeVenueMode = async (venueId: string, newMode: string) => {
        try {
            const { error } = await supabase
                .from('rollout_modes')
                .upsert({
                    venue_id: venueId,
                    mode: newMode,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'venue_id' });

            if (error) throw error;

            toast.success(`Venue mode changed to ${getModeLabel(newMode)}`);
            loadData();
        } catch (error) {
            toast.error('Failed to change venue mode');
        }
    };

    // ==========================================================================
    // RENDER
    // ==========================================================================

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'flags', label: 'Feature Flags' },
        { id: 'switches', label: 'Kill Switches' },
        { id: 'venues', label: 'Venue Modes' },
        { id: 'cohorts', label: 'Cohorts' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        AI Rollout Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage progressive rollout of Moltbot AI capabilities
                    </p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`py-2 px-4 text-sm font-medium border-b-2 -mb-px ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <OverviewTab stats={stats} kpis={kpis} venues={venues} />
                )}
                {activeTab === 'flags' && (
                    <FlagsTab flags={flags} />
                )}
                {activeTab === 'switches' && (
                    <SwitchesTab switches={switches} onToggle={toggleKillSwitch} />
                )}
                {activeTab === 'venues' && (
                    <VenuesTab venues={venues} onModeChange={changeVenueMode} />
                )}
                {activeTab === 'cohorts' && (
                    <CohortsTab cohorts={cohorts} />
                )}
            </div>
        </div>
    );
}

// =============================================================================
// TAB COMPONENTS
// =============================================================================

function OverviewTab({ stats, kpis, venues: _venues }: {
    stats: { totalVenues: number; venuesByMode: Record<string, number>; activeKillSwitches: number; enabledFlags: number };
    kpis: KPISnapshot[];
    venues: VenueRollout[];
}) {

    const modes = ['off', 'shadow_ui', 'assisted', 'full'];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Venues</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalVenues}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Mode</p>
                    <p className="text-2xl font-bold text-green-600">{stats.venuesByMode['full'] ?? 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Kill Switches</p>
                    <p className={`text-2xl font-bold ${stats.activeKillSwitches > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {stats.activeKillSwitches}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enabled Flags</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.enabledFlags}</p>
                </div>
            </div>

            {/* Mode Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Mode Distribution</h3>
                <div className="flex gap-2">
                    {modes.map(mode => (
                        <div key={mode} className="flex-1">
                            <div className={`rounded-lg p-3 text-center ${getModeColor(mode)}`}>
                                <p className="text-lg font-bold">{stats.venuesByMode[mode] ?? 0}</p>
                                <p className="text-xs">{getModeLabel(mode)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent KPIs */}
            {kpis.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">Latest KPI Snapshots</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400">
                                    <th className="pb-2">Venue</th>
                                    <th className="pb-2">UIPlan Valid</th>
                                    <th className="pb-2">Tool Errors</th>
                                    <th className="pb-2">Security</th>
                                    <th className="pb-2">Snapshot</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {kpis.slice(0, 5).map(kpi => (
                                    <tr key={`${kpi.venue_id}-${kpi.snapshot_at}`}>
                                        <td className="py-2 text-gray-900 dark:text-white">
                                            {kpi.venue_id.slice(0, 8)}...
                                        </td>
                                        <td className="py-2">
                                            <span className={kpi.uiplan_valid_rate && kpi.uiplan_valid_rate >= 0.99 ? 'text-green-600' : 'text-yellow-600'}>
                                                {formatPercent(kpi.uiplan_valid_rate)}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <span className={kpi.tool_error_rate && kpi.tool_error_rate < 0.02 ? 'text-green-600' : 'text-red-600'}>
                                                {formatPercent(kpi.tool_error_rate)}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            {(kpi.tenant_mismatch_count ?? 0) + (kpi.approval_bypass_attempts ?? 0) === 0
                                                ? <span className="text-green-600">✓</span>
                                                : <span className="text-red-600">⚠ {kpi.tenant_mismatch_count + kpi.approval_bypass_attempts}</span>
                                            }
                                        </td>
                                        <td className="py-2 text-gray-500 dark:text-gray-400">
                                            {new Date(kpi.snapshot_at).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function FlagsTab({ flags }: { flags: FeatureFlag[] }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Feature Flags</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Default states. Use overrides for per-venue control.
                </p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {flags.map(flag => (
                    <div key={flag.id} className="px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="font-mono text-sm text-gray-900 dark:text-white">{flag.flag_key}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{flag.description}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Scopes: {flag.scope.join(', ')}
                            </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${flag.default_enabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {flag.default_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                ))}
                {flags.length === 0 && (
                    <p className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No feature flags configured
                    </p>
                )}
            </div>
        </div>
    );
}

function SwitchesTab({ switches, onToggle }: {
    switches: KillSwitch[];
    onToggle: (id: string, activate: boolean) => void;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Kill Switches</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Emergency controls for immediate AI shutdown
                </p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {switches.map(sw => (
                    <div key={sw.id} className="px-4 py-4 flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <p className="font-mono text-sm text-gray-900 dark:text-white">{sw.id}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{sw.description}</p>
                            {sw.is_active && sw.reason && (
                                <p className="text-xs text-red-500 mt-1">
                                    Reason: {sw.reason}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => onToggle(sw.id, !sw.is_active)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sw.is_active
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {sw.is_active ? 'ACTIVE - Click to Deactivate' : 'Activate'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function VenuesTab({ venues, onModeChange }: {
    venues: VenueRollout[];
    onModeChange: (venueId: string, newMode: string) => void;
}) {
    const modes = ['off', 'shadow_ui', 'assisted', 'full'];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Venue Rollout Modes</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Progressive AI capability levels per venue
                </p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {venues.map(v => (
                    <div key={v.venue_id} className="px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                {v.venue_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {v.venue_id.slice(0, 8)}... • Updated {new Date(v.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                        <select
                            value={v.mode}
                            onChange={(e) => onModeChange(v.venue_id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 ${getModeColor(v.mode)}`}
                        >
                            {modes.map(m => (
                                <option key={m} value={m}>{getModeLabel(m)}</option>
                            ))}
                        </select>
                    </div>
                ))}
                {venues.length === 0 && (
                    <p className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No venues in rollout yet
                    </p>
                )}
            </div>
        </div>
    );
}

function CohortsTab({ cohorts }: { cohorts: Cohort[] }) {
    const phaseColors: Record<string, string> = {
        pilot: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        expansion_1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        expansion_2: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
        general: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white">Rollout Cohorts</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Venue groups for staged rollout
                </p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {cohorts.map(c => (
                    <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {c.venue_count} venues
                            </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${phaseColors[c.phase] ?? 'bg-gray-100 text-gray-800'}`}>
                            {c.phase}
                        </span>
                    </div>
                ))}
                {cohorts.length === 0 && (
                    <p className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No cohorts configured
                    </p>
                )}
            </div>
        </div>
    );
}
