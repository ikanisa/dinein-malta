import { useState } from 'react';
import { Server, Smartphone, Zap, Layers, GitBranch, Cloud, Shield, Activity } from 'lucide-react';

const ArchitectureDiagrams = () => {
    const [activeView, setActiveView] = useState('system');

    const views = [
        { id: 'system', name: 'System Architecture', icon: Server },
        { id: 'frontend', name: 'Frontend Layers', icon: Layers },
        { id: 'data', name: 'Data Flow', icon: GitBranch },
        { id: 'ui', name: 'UI/UX Structure', icon: Smartphone },
        { id: 'security', name: 'Security Model', icon: Shield },
        { id: 'deployment', name: 'Deployment', icon: Cloud }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-3xl font-bold text-gray-900">DineIn Malta</h1>
                    <p className="text-gray-600 mt-1">Complete Technical Architecture Diagrams</p>
                </div>
            </div>

            <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-2 overflow-x-auto py-3">
                        {views.map(view => {
                            const Icon = view.icon;
                            return (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveView(view.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeView === view.id
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {view.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeView === 'system' && <SystemArchitecture />}
                {activeView === 'frontend' && <FrontendLayers />}
                {activeView === 'data' && <DataFlow />}
                {activeView === 'ui' && <UIStructure />}
                {activeView === 'security' && <SecurityModel />}
                {activeView === 'deployment' && <DeploymentArchitecture />}
            </div>
        </div>
    );
};

const SystemArchitecture = () => (
    <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">High-Level System Architecture</h2>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-indigo-200">
                        <h3 className="font-bold text-indigo-900 mb-3">CLIENT LAYER</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-purple-50 p-4 rounded border border-purple-300">
                                <div className="font-semibold text-purple-900">PWA (React 18 + Vite)</div>
                                <div className="text-xs text-purple-700 mt-1">Service Worker • IndexedDB • Cache API</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded border border-purple-300">
                                <div className="font-semibold text-purple-900">Mobile Apps</div>
                                <div className="text-xs text-purple-700 mt-1">iOS / Android</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-blue-200">
                        <h3 className="font-bold text-blue-900 mb-3">API GATEWAY</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded border border-blue-300">
                                <div className="font-semibold text-blue-900">Supabase Edge Functions</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded border border-blue-300">
                                <div className="font-semibold text-blue-900">REST API Gateway</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-amber-200">
                        <h3 className="font-bold text-amber-900 mb-3">BACKEND SERVICES</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-amber-50 p-4 rounded border border-amber-300">
                                <div className="font-semibold text-amber-900">Supabase PostgreSQL</div>
                                <div className="text-xs text-amber-700 mt-1">Database + Realtime</div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded border border-amber-300">
                                <div className="font-semibold text-amber-900">Auth Service (GoTrue)</div>
                                <div className="text-xs text-amber-700 mt-1">JWT + RLS</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-3">EXTERNAL INTEGRATIONS</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-50 p-3 rounded border text-center">
                                <div className="font-semibold text-sm">Stripe</div>
                                <div className="text-xs text-gray-600">Payments</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border text-center">
                                <div className="font-semibold text-sm">Google Maps</div>
                                <div className="text-xs text-gray-600">Location</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border text-center">
                                <div className="font-semibold text-sm">Gemini AI</div>
                                <div className="text-xs text-gray-600">Recommendations</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border text-center">
                                <div className="font-semibold text-sm">Cloudflare</div>
                                <div className="text-xs text-gray-600">CDN</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border text-center">
                                <div className="font-semibold text-sm">Sentry</div>
                                <div className="text-xs text-gray-600">Errors</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border text-center">
                                <div className="font-semibold text-sm">SendGrid</div>
                                <div className="text-xs text-gray-600">Email</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold">Performance</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Edge-first architecture</li>
                    <li>• Response time under 100ms</li>
                    <li>• CDN-backed assets</li>
                    <li>• Service Worker caching</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Security</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Row Level Security (RLS)</li>
                    <li>• JWT authentication</li>
                    <li>• HTTPS everywhere</li>
                    <li>• PCI compliant payments</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Scalability</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Serverless functions</li>
                    <li>• Auto-scaling database</li>
                    <li>• Connection pooling</li>
                    <li>• Horizontal scaling ready</li>
                </ul>
            </div>
        </div>
    </div>
);

const FrontendLayers = () => (
    <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Frontend Architecture Layers</h2>
            <div className="space-y-4">
                <div className="bg-indigo-50 p-5 rounded-lg border-2 border-indigo-200">
                    <h3 className="font-bold text-indigo-900 mb-3">PRESENTATION LAYER</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded border border-indigo-300 text-center">
                            <div className="font-semibold text-sm">Pages & Routes</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-indigo-300 text-center">
                            <div className="font-semibold text-sm">Layout Components</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-indigo-300 text-center">
                            <div className="font-semibold text-sm">UI Components</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-indigo-300 text-center">
                            <div className="font-semibold text-sm">Animations</div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-3">BUSINESS LOGIC LAYER</h3>
                    <div className="grid grid-cols-5 gap-3">
                        <div className="bg-white p-3 rounded border border-blue-300">
                            <div className="font-semibold text-sm text-center">Custom Hooks</div>
                            <div className="text-xs text-blue-700 mt-1 text-center">useCart, useOrders</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-blue-300">
                            <div className="font-semibold text-sm text-center">State Machines</div>
                            <div className="text-xs text-blue-700 mt-1 text-center">XState</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-blue-300">
                            <div className="font-semibold text-sm text-center">Validators</div>
                            <div className="text-xs text-blue-700 mt-1 text-center">Zod Schemas</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-blue-300">
                            <div className="font-semibold text-sm text-center">Utils</div>
                            <div className="text-xs text-blue-700 mt-1 text-center">Formatters</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-blue-300">
                            <div className="font-semibold text-sm text-center">Feature Modules</div>
                            <div className="text-xs text-blue-700 mt-1 text-center">Orders, Menu</div>
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 p-5 rounded-lg border-2 border-amber-200">
                    <h3 className="font-bold text-amber-900 mb-3">STATE MANAGEMENT LAYER</h3>
                    <div className="grid grid-cols-5 gap-3">
                        <div className="bg-white p-3 rounded border border-amber-300">
                            <div className="font-semibold text-sm text-center">Global State</div>
                            <div className="text-xs text-amber-700 mt-1 text-center">Zustand</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-amber-300">
                            <div className="font-semibold text-sm text-center">Server State</div>
                            <div className="text-xs text-amber-700 mt-1 text-center">React Query</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-amber-300">
                            <div className="font-semibold text-sm text-center">Form State</div>
                            <div className="text-xs text-amber-700 mt-1 text-center">RHF</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-amber-300">
                            <div className="font-semibold text-sm text-center">URL State</div>
                            <div className="text-xs text-amber-700 mt-1 text-center">Router</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-amber-300">
                            <div className="font-semibold text-sm text-center">Local State</div>
                            <div className="text-xs text-amber-700 mt-1 text-center">useState</div>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                    <h3 className="font-bold text-green-900 mb-3">DATA LAYER</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded border border-green-300">
                            <div className="font-semibold text-sm text-center">API Client</div>
                            <div className="text-xs text-green-700 mt-1 text-center">Supabase Client</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-green-300">
                            <div className="font-semibold text-sm text-center">Data Adapters</div>
                            <div className="text-xs text-green-700 mt-1 text-center">DTO Transformers</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-green-300">
                            <div className="font-semibold text-sm text-center">Cache Layer</div>
                            <div className="text-xs text-green-700 mt-1 text-center">IndexedDB</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-green-300">
                            <div className="font-semibold text-sm text-center">Realtime</div>
                            <div className="text-xs text-green-700 mt-1 text-center">WebSocket</div>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-3">INFRASTRUCTURE LAYER</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded border border-purple-300">
                            <div className="font-semibold text-sm text-center">Service Worker</div>
                            <div className="text-xs text-purple-700 mt-1 text-center">Workbox</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-purple-300">
                            <div className="font-semibold text-sm text-center">Error Boundary</div>
                            <div className="text-xs text-purple-700 mt-1 text-center">Sentry</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-purple-300">
                            <div className="font-semibold text-sm text-center">Analytics</div>
                            <div className="text-xs text-purple-700 mt-1 text-center">GA4, Mixpanel</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-purple-300">
                            <div className="font-semibold text-sm text-center">Feature Flags</div>
                            <div className="text-xs text-purple-700 mt-1 text-center">LaunchDarkly</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold mb-4">Project Structure</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div>src/</div>
                <div className="ml-4">├── app/ <span className="text-gray-500"># App-level configuration</span></div>
                <div className="ml-4">├── components/ <span className="text-gray-500"># Reusable UI components</span></div>
                <div className="ml-8">├── ui/ <span className="text-gray-500"># Design system primitives</span></div>
                <div className="ml-8">├── features/ <span className="text-gray-500"># Feature-specific components</span></div>
                <div className="ml-8">└── layouts/ <span className="text-gray-500"># Layout components</span></div>
                <div className="ml-4">├── features/ <span className="text-gray-500"># Business logic modules</span></div>
                <div className="ml-8">├── orders/</div>
                <div className="ml-8">├── menu/</div>
                <div className="ml-8">└── auth/</div>
                <div className="ml-4">├── hooks/ <span className="text-gray-500"># Custom React hooks</span></div>
                <div className="ml-4">├── lib/ <span className="text-gray-500"># Utilities and helpers</span></div>
                <div className="ml-4">├── services/ <span className="text-gray-500"># API clients</span></div>
                <div className="ml-4">├── stores/ <span className="text-gray-500"># State management</span></div>
                <div className="ml-4">├── types/ <span className="text-gray-500"># TypeScript definitions</span></div>
                <div className="ml-4">└── pages/ <span className="text-gray-500"># Route components</span></div>
            </div>
        </div>
    </div>
);

const DataFlow = () => (
    <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Data Flow Architecture</h2>
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Order Flow Example</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold min-w-32 text-center">1. User Action</div>
                            <div className="flex-1 bg-white p-3 rounded border">Customer adds item to cart → Click "Add to Cart"</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold min-w-32 text-center">2. UI Update</div>
                            <div className="flex-1 bg-white p-3 rounded border">Optimistic UI update → Cart badge increments immediately</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold min-w-32 text-center">3. State Update</div>
                            <div className="flex-1 bg-white p-3 rounded border">Zustand store updated → useCartStore.addItem()</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold min-w-32 text-center">4. Persistence</div>
                            <div className="flex-1 bg-white p-3 rounded border">localStorage sync → Background save to Supabase</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold min-w-32 text-center">5. Validation</div>
                            <div className="flex-1 bg-white p-3 rounded border">Server validates → Check inventory, pricing</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold min-w-32 text-center">6. Confirmation</div>
                            <div className="flex-1 bg-white p-3 rounded border">Success toast → "Item added to cart"</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-3">Read Operations</h4>
                        <div className="space-y-2 text-sm">
                            <div className="bg-white p-2 rounded">1. React Query checks cache</div>
                            <div className="bg-white p-2 rounded">2. If stale → fetch from API</div>
                            <div className="bg-white p-2 rounded">3. Transform with adapter</div>
                            <div className="bg-white p-2 rounded">4. Update cache</div>
                            <div className="bg-white p-2 rounded">5. Re-render components</div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-900 mb-3">Write Operations</h4>
                        <div className="space-y-2 text-sm">
                            <div className="bg-white p-2 rounded">1. Validate with Zod</div>
                            <div className="bg-white p-2 rounded">2. Optimistic update</div>
                            <div className="bg-white p-2 rounded">3. Send to Supabase</div>
                            <div className="bg-white p-2 rounded">4. On success → confirm</div>
                            <div className="bg-white p-2 rounded">5. On error → rollback</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-4">Realtime Data Sync</h3>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg">
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
                        <div className="font-semibold text-orange-900 mb-2">Vendor Dashboard → New Order</div>
                        <div className="text-sm text-gray-700">Supabase Realtime subscription broadcasts INSERT → Vendor receives notification → UI updates + audio alert plays</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
                        <div className="font-semibold text-orange-900 mb-2">Customer App → Order Status</div>
                        <div className="text-sm text-gray-700">Vendor updates status → WebSocket broadcasts UPDATE → Customer sees animated progress bar update</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
                        <div className="font-semibold text-orange-900 mb-2">Multi-device Sync</div>
                        <div className="text-sm text-gray-700">Cart updated on mobile → localStorage + Supabase sync → Desktop tab receives update via broadcast channel</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const UIStructure = () => (
    <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">UI/UX Component Structure</h2>

            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-4 text-indigo-900">Client App Navigation</h3>
                    <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border-2 border-indigo-300">
                            <div className="font-semibold mb-2">Bottom Navigation (Persistent)</div>
                            <div className="flex justify-around gap-2">
                                <div className="bg-indigo-100 px-3 py-2 rounded text-sm text-center flex-1">Home</div>
                                <div className="bg-indigo-100 px-3 py-2 rounded text-sm text-center flex-1">Explore</div>
                                <div className="bg-indigo-100 px-3 py-2 rounded text-sm text-center flex-1">Orders</div>
                                <div className="bg-indigo-100 px-3 py-2 rounded text-sm text-center flex-1">Profile</div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-indigo-200">
                            <div className="font-semibold mb-2">Floating Actions</div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-purple-100 px-3 py-2 rounded text-sm text-center">QR Scanner (FAB)</div>
                                <div className="bg-purple-100 px-3 py-2 rounded text-sm text-center">Cart (Badge)</div>
                                <div className="bg-purple-100 px-3 py-2 rounded text-sm text-center">Notifications</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-3">Component Hierarchy</h4>
                        <div className="space-y-2 text-sm bg-white p-3 rounded">
                            <div className="font-mono">Page</div>
                            <div className="font-mono ml-4">└── Layout</div>
                            <div className="font-mono ml-8">├── Header</div>
                            <div className="font-mono ml-8">├── Content</div>
                            <div className="font-mono ml-12">├── Feature Module</div>
                            <div className="font-mono ml-16">└── UI Components</div>
                            <div className="font-mono ml-8">└── BottomNav</div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-900 mb-3">Interaction Patterns</h4>
                        <div className="space-y-2 text-sm">
                            <div className="bg-white p-2 rounded border">Pull-to-refresh on lists</div>
                            <div className="bg-white p-2 rounded border">Swipe actions on items</div>
                            <div className="bg-white p-2 rounded border">Long-press context menus</div>
                            <div className="bg-white p-2 rounded border">Haptic feedback on taps</div>
                            <div className="bg-white p-2 rounded border">Skeleton loading states</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-4 text-amber-900">Design System Tokens</h3>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Colors</div>
                            <div className="flex gap-1">
                                <div className="w-8 h-8 bg-purple-600 rounded"></div>
                                <div className="w-8 h-8 bg-pink-500 rounded"></div>
                                <div className="w-8 h-8 bg-indigo-600 rounded"></div>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Typography</div>
                            <div className="space-y-1">
                                <div className="text-xs">12px - Small</div>
                                <div className="text-sm">14px - Base</div>
                                <div className="text-base">16px - Body</div>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Spacing</div>
                            <div className="space-y-1 text-xs">
                                <div>4px, 8px, 16px</div>
                                <div>24px, 32px, 48px</div>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Radius</div>
                            <div className="space-y-1">
                                <div className="bg-gray-200 h-6 rounded-sm"></div>
                                <div className="bg-gray-200 h-6 rounded-md"></div>
                                <div className="bg-gray-200 h-6 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
const SecurityModel = () => (
    <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Security Architecture</h2>
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-4 text-red-900">Authentication Flow</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-600 text-white px-4 py-2 rounded font-semibold min-w-24 text-center text-sm">Step 1</div>
                            <div className="flex-1 bg-white p-3 rounded border">User enters credentials → Client-side validation with Zod</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-red-600 text-white px-4 py-2 rounded font-semibold min-w-24 text-center text-sm">Step 2</div>
                            <div className="flex-1 bg-white p-3 rounded border">Supabase Auth (GoTrue) → Generates JWT token</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-red-600 text-white px-4 py-2 rounded font-semibold min-w-24 text-center text-sm">Step 3</div>
                            <div className="flex-1 bg-white p-3 rounded border">Token stored in httpOnly cookie + localStorage</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-red-600 text-white px-4 py-2 rounded font-semibold min-w-24 text-center text-sm">Step 4</div>
                            <div className="flex-1 bg-white p-3 rounded border">All API requests include Authorization header</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-red-600 text-white px-4 py-2 rounded font-semibold min-w-24 text-center text-sm">Step 5</div>
                            <div className="flex-1 bg-white p-3 rounded border">RLS policies enforce data access permissions</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-3">Row Level Security</h4>
                        <div className="bg-white p-3 rounded text-sm space-y-2">
                            <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                                CREATE POLICY "users_select"<br />
                                ON users FOR SELECT<br />
                                USING (auth.uid() = id)
                            </div>
                            <div className="text-xs text-gray-600">Users can only read their own data</div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-900 mb-3">Role-Based Access</h4>
                        <div className="space-y-2 text-sm">
                            <div className="bg-white p-2 rounded border flex justify-between">
                                <span>Client</span>
                                <span className="text-xs text-gray-600">View menus, Order</span>
                            </div>
                            <div className="bg-white p-2 rounded border flex justify-between">
                                <span>Vendor</span>
                                <span className="text-xs text-gray-600">Manage menu, Orders</span>
                            </div>
                            <div className="bg-white p-2 rounded border flex justify-between">
                                <span>Admin</span>
                                <span className="text-xs text-gray-600">Full access</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-bold text-purple-900 mb-3">Data Protection</h4>
                        <div className="space-y-2 text-sm">
                            <div className="bg-white p-2 rounded">✓ HTTPS/TLS encryption</div>
                            <div className="bg-white p-2 rounded">✓ Password hashing (bcrypt)</div>
                            <div className="bg-white p-2 rounded">✓ SQL injection prevention</div>
                            <div className="bg-white p-2 rounded">✓ XSS protection</div>
                            <div className="bg-white p-2 rounded">✓ CSRF tokens</div>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                    <h4 className="font-bold text-yellow-900 mb-2">Payment Security (PCI Compliance)</h4>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="bg-white p-3 rounded text-sm">
                            <div className="font-semibold mb-1">Stripe Integration</div>
                            <div className="text-xs text-gray-600">• Card data never touches our servers<br />• Tokenization via Stripe Elements<br />• 3D Secure authentication</div>
                        </div>
                        <div className="bg-white p-3 rounded text-sm">
                            <div className="font-semibold mb-1">Compliance</div>
                            <div className="text-xs text-gray-600">• PCI DSS Level 1 (via Stripe)<br />• Regular security audits<br />• Encrypted data at rest</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
const DeploymentArchitecture = () => (
    <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Deployment & Infrastructure</h2>
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-4 text-cyan-900">CI/CD Pipeline</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-600 text-white px-4 py-2 rounded font-semibold min-w-32 text-center text-sm">1. Push Code</div>
                            <div className="flex-1 bg-white p-3 rounded border">Developer pushes to GitHub main branch</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-600 text-white px-4 py-2 rounded font-semibold min-w-32 text-center text-sm">2. Run Tests</div>
                            <div className="flex-1 bg-white p-3 rounded border">GitHub Actions: Lint, TypeCheck, Unit Tests, E2E Tests</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-600 text-white px-4 py-2 rounded font-semibold min-w-32 text-center text-sm">3. Build</div>
                            <div className="flex-1 bg-white p-3 rounded border">Vite builds optimized bundles + generates Service Worker</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-600 text-white px-4 py-2 rounded font-semibold min-w-32 text-center text-sm">4. Lighthouse</div>
                            <div className="flex-1 bg-white p-3 rounded border">Performance audit (must score over 90)</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-600 text-white px-4 py-2 rounded font-semibold min-w-32 text-center text-sm">5. Deploy</div>
                            <div className="flex-1 bg-white p-3 rounded border">Vercel deploys to edge network globally</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-600 text-white px-4 py-2 rounded font-semibold min-w-32 text-center text-sm">6. Monitor</div>
                            <div className="flex-1 bg-white p-3 rounded border">Sentry tracks errors + performance in production</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <h4 className="font-bold text-indigo-900 mb-3">Hosting Stack</h4>
                        <div className="space-y-2">
                            <div className="bg-white p-3 rounded border">
                                <div className="font-semibold text-sm">Frontend</div>
                                <div className="text-xs text-gray-600 mt-1">Vercel Edge Network (150+ locations)</div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <div className="font-semibold text-sm">Database</div>
                                <div className="text-xs text-gray-600 mt-1">Supabase (AWS eu-west-1)</div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <div className="font-semibold text-sm">CDN</div>
                                <div className="text-xs text-gray-600 mt-1">Cloudflare Images + Assets</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-900 mb-3">Environments</h4>
                        <div className="space-y-2 text-sm">
                            <div className="bg-white p-3 rounded border">
                                <div className="font-semibold">Development</div>
                                <div className="text-xs text-gray-600">Local + Supabase local dev</div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <div className="font-semibold">Staging</div>
                                <div className="text-xs text-gray-600">Preview deployments on Vercel</div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                                <div className="font-semibold">Production</div>
                                <div className="text-xs text-gray-600">dinein.mt (custom domain)</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-3">Performance Optimization</h4>
                    <div className="grid grid-cols-4 gap-3 text-sm">
                        <div className="bg-white p-3 rounded text-center">
                            <div className="font-semibold">Code Splitting</div>
                            <div className="text-xs text-gray-600 mt-1">Route-based chunks</div>
                        </div>
                        <div className="bg-white p-3 rounded text-center">
                            <div className="font-semibold">Tree Shaking</div>
                            <div className="text-xs text-gray-600 mt-1">Remove unused code</div>
                        </div>
                        <div className="bg-white p-3 rounded text-center">
                            <div className="font-semibold">Image Optimization</div>
                            <div className="text-xs text-gray-600 mt-1">WebP + lazy loading</div>
                        </div>
                        <div className="bg-white p-3 rounded text-center">
                            <div className="font-semibold">Compression</div>
                            <div className="text-xs text-gray-600 mt-1">Brotli + Gzip</div>
                        </div>
                    </div>
                </div>

                <div className="bg-orange-50 p-5 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-orange-900 mb-3">Monitoring & Observability</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded">
                            <div className="font-semibold text-sm mb-2">Error Tracking</div>
                            <div className="text-xs text-gray-600">Sentry for client & server errors</div>
                        </div>
                        <div className="bg-white p-3 rounded">
                            <div className="font-semibold text-sm mb-2">Performance</div>
                            <div className="text-xs text-gray-600">Web Vitals + Lighthouse CI</div>
                        </div>
                        <div className="bg-white p-3 rounded">
                            <div className="font-semibold text-sm mb-2">Analytics</div>
                            <div className="text-xs text-gray-600">GA4 + Mixpanel events</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-4">Disaster Recovery & Backup</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">Database Backups</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Automated daily backups (Supabase)</li>
                        <li>• Point-in-time recovery (7 days)</li>
                        <li>• Weekly snapshots to S3</li>
                        <li>• Tested restore procedures</li>
                    </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Rollback Strategy</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Git-based version control</li>
                        <li>• Instant rollback via Vercel</li>
                        <li>• Database migration rollback scripts</li>
                        <li>• Blue-green deployment option</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
);
export default ArchitectureDiagrams;
