import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, AlertCircle, Users, Code, Palette, Zap } from 'lucide-react';

const WorkflowDashboard = () => {
    const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});

    const togglePhase = (phaseId: string) => {
        setExpandedPhases(prev => ({
            ...prev,
            [phaseId]: !prev[phaseId]
        }));
    };

    const phases = [
        {
            id: 'phase0',
            name: 'Phase 0: Foundation Setup',
            duration: '1 Week',
            priority: 'P0',
            team: ['Tech Lead', 'DevOps'],
            status: 'ready',
            objective: 'Establish development infrastructure and design system foundation',
            deliverables: [
                'Design system architecture',
                'Component library setup',
                'Development environment standardization',
                'CI/CD pipeline enhancement'
            ],
            tasks: [
                {
                    category: 'Design System Foundation',
                    items: [
                        'Create design-tokens.ts with color palette, typography, spacing',
                        'Set up CSS variables for theme switching (light/dark)',
                        'Install and configure shadcn/ui components',
                        'Create base component architecture (Button, Card, Input, Badge)',
                        'Document design system in Storybook'
                    ]
                },
                {
                    category: 'Development Tooling',
                    items: [
                        'Install Framer Motion for animations',
                        'Add @use-gesture/react for swipe gestures',
                        'Set up React Hook Form + Zod for validation',
                        'Configure Recharts for data visualization',
                        'Install react-window for virtual scrolling'
                    ]
                },
                {
                    category: 'Build Optimization',
                    items: [
                        'Implement code splitting strategy by route/role',
                        'Add webpack-bundle-analyzer to CI',
                        'Set Lighthouse performance budgets (JS < 200KB)',
                        'Configure image optimization pipeline (WebP, lazy loading)',
                        'Set up Cloudflare Images or similar CDN'
                    ]
                },
                {
                    category: 'Testing Infrastructure',
                    items: [
                        'Set up Playwright for E2E tests',
                        'Configure axe-core for automated A11Y testing',
                        'Add Chromatic or Percy for visual regression',
                        'Create testing standards document',
                        'Set up mobile device testing matrix'
                    ]
                }
            ]
        },
        {
            id: 'phase1',
            name: 'Phase 1: Critical UX Fixes',
            duration: '2 Weeks',
            priority: 'P0',
            team: ['Frontend Lead', '2 Engineers', 'Designer'],
            status: 'upcoming',
            objective: 'Fix critical UX gaps that prevent production readiness',
            deliverables: [
                'Bottom navigation component',
                'Skeleton loading system',
                'Safe area support',
                'Basic accessibility compliance'
            ],
            tasks: [
                {
                    category: 'Navigation System',
                    items: [
                        'Build BottomNav component with 5 tabs (Home, Explore, Orders, Profile, More)',
                        'Add route-level state persistence (scroll position, filters)',
                        'Implement gesture-based back navigation (swipe from edge)',
                        'Create breadcrumb navigation for nested views',
                        'Add FAB for QR scanner (always visible, bottom-right)',
                        'Build navigation transition animations'
                    ]
                },
                {
                    category: 'Loading States',
                    items: [
                        'Create skeleton components: RestaurantCard, MenuItem, OrderCard, Profile',
                        'Build shimmer animation utility',
                        'Implement progressive loading strategy',
                        'Add suspense boundaries at route level',
                        'Create loading state design system (spinners, progress bars)'
                    ]
                },
                {
                    category: 'Mobile-First Fixes',
                    items: [
                        'Add safe-area-inset support for iOS notch/home indicator',
                        'Enforce 44px minimum touch targets across all buttons',
                        'Implement thumb-zone optimization (primary actions in bottom 60%)',
                        'Add input optimization (type=tel, email, autocomplete)',
                        'Create sticky CTA components (Add to Cart, Place Order)'
                    ]
                },
                {
                    category: 'Accessibility Baseline',
                    items: [
                        'Run axe DevTools audit and fix critical issues',
                        'Add focus-visible styles to all interactive elements',
                        'Implement keyboard navigation (Tab, Enter, Escape)',
                        'Add ARIA labels to all icons and buttons',
                        'Create skip-to-main-content link',
                        'Test with VoiceOver (iOS) and TalkBack (Android)'
                    ]
                }
            ]
        },
        {
            id: 'phase2',
            name: 'Phase 2: Visual Polish & Theming',
            duration: '1.5 Weeks',
            priority: 'P0',
            team: ['UI Designer', 'Frontend Engineer'],
            status: 'upcoming',
            objective: 'Transform visual design to match world-class apps',
            deliverables: [
                'Complete dark mode',
                'Animation system',
                'Empty state illustrations',
                'Micro-interactions'
            ],
            tasks: [
                {
                    category: 'Dark Mode Implementation',
                    items: [
                        'Create ThemeContext with localStorage persistence',
                        'Build theme toggle component (iOS-style switch)',
                        'Define dark mode color palette (ensure 4.5:1 contrast)',
                        'Update all components with dark mode variants',
                        'Add system preference detection (prefers-color-scheme)',
                        'Implement smooth theme transition animations'
                    ]
                },
                {
                    category: 'Animation & Motion',
                    items: [
                        'Create animation design system (enter, exit, hover, focus)',
                        'Implement page transition animations (fade + slide)',
                        'Add micro-interactions: button press, card hover, toggle switch',
                        'Build animated counter components for stats',
                        'Create loading animations (beyond skeletons)',
                        'Add prefers-reduced-motion support'
                    ]
                },
                {
                    category: 'Empty States & Illustrations',
                    items: [
                        'Design/source illustrations for: no restaurants, empty cart, no orders, error states',
                        'Create EmptyState component with illustration + CTA',
                        'Add friendly copy for each empty state',
                        'Build 404 and error boundary pages',
                        'Implement offline fallback UI'
                    ]
                },
                {
                    category: 'Visual Enhancements',
                    items: [
                        'Add glassmorphism to sticky headers and modals',
                        'Implement gradient accents on CTAs',
                        'Use variable fonts (Inter Variable or Geist)',
                        'Add subtle shadows and elevation system',
                        'Create card hover effects with transform + shadow',
                        'Implement color-coded status badges'
                    ]
                }
            ]
        },
        {
            id: 'phase3',
            name: 'Phase 3: Real-Time & Interaction',
            duration: '2 Weeks',
            priority: 'P0',
            team: ['Backend Engineer', 'Frontend Engineer'],
            status: 'upcoming',
            objective: 'Add real-time features and advanced interactions',
            deliverables: [
                'Real-time order updates',
                'Vendor notifications',
                'Haptic feedback',
                'Gesture controls'
            ],
            tasks: [
                {
                    category: 'Real-Time Features',
                    items: [
                        'Set up Supabase Realtime subscriptions for orders table',
                        'Build real-time order notification system for vendors',
                        'Add WebSocket connection status indicator',
                        'Implement optimistic UI updates (instant cart changes)',
                        'Create live order status visualization (animated timeline)',
                        'Add real-time vendor availability updates'
                    ]
                },
                {
                    category: 'Notifications',
                    items: [
                        'Request notification permissions (just-in-time)',
                        'Implement browser Push Notifications API',
                        'Add audio alerts for vendors (new order sound)',
                        'Create toast notification system (Sonner library)',
                        'Build in-app notification center',
                        'Add notification badge on app icon'
                    ]
                },
                {
                    category: 'Haptic Feedback',
                    items: [
                        'Integrate Vibration API for mobile devices',
                        'Add haptics to: button taps, item added to cart, order placed',
                        'Implement pull-to-refresh haptic feedback',
                        'Create haptic feedback design system (light, medium, heavy)',
                        'Test haptics on iOS and Android devices'
                    ]
                },
                {
                    category: 'Gesture Controls',
                    items: [
                        'Implement pull-to-refresh on all list views',
                        'Add swipe-to-delete on cart items',
                        'Build swipe actions for orders (accept/reject)',
                        'Create swipeable image carousel for menu items',
                        'Add long-press context menus',
                        'Implement pinch-to-zoom on images'
                    ]
                }
            ]
        },
        {
            id: 'phase4',
            name: 'Phase 4: Search & Discovery',
            duration: '1.5 Weeks',
            priority: 'P1',
            team: ['Frontend Engineer', 'Backend Engineer'],
            status: 'upcoming',
            objective: 'Build powerful search and filtering system',
            deliverables: [
                'Instant search',
                'Advanced filters',
                'Map view',
                'AI recommendations UI'
            ],
            tasks: [
                {
                    category: 'Search Implementation',
                    items: [
                        'Build SearchBar component with debounced input',
                        'Implement fuzzy search algorithm (Fuse.js)',
                        'Add search suggestions dropdown',
                        'Create search history persistence',
                        'Show popular searches',
                        'Add "no results" empty state with suggestions'
                    ]
                },
                {
                    category: 'Filtering System',
                    items: [
                        'Create FilterPanel component (bottom sheet on mobile)',
                        'Add filters: cuisine, price range, distance, rating, open now',
                        'Implement filter chips (removable tags)',
                        'Build filter count badge',
                        'Add "Clear all filters" action',
                        'Persist filters in URL query params'
                    ]
                },
                {
                    category: 'Map View',
                    items: [
                        'Integrate Google Maps or Mapbox',
                        'Build list/map toggle view',
                        'Implement restaurant pin clustering',
                        'Add map marker click → restaurant card preview',
                        'Show user location on map',
                        'Create distance calculation utilities'
                    ]
                },
                {
                    category: 'AI Recommendations',
                    items: [
                        'Build AI chat interface for Gemini integration',
                        'Add "Surprise me" recommendation button',
                        'Create personalized suggestion cards',
                        'Implement natural language search',
                        'Add AI-powered dietary restriction filtering'
                    ]
                }
            ]
        },
        {
            id: 'phase5',
            name: 'Phase 5: Onboarding & First-Time UX',
            duration: '1 Week',
            priority: 'P1',
            team: ['Designer', 'Frontend Engineer'],
            status: 'upcoming',
            objective: 'Guide new users to successful first order',
            deliverables: [
                'Welcome flow',
                'Feature tour',
                'Permission requests',
                'QR scanning tutorial'
            ],
            tasks: [
                {
                    category: 'Welcome Experience',
                    items: [
                        'Design welcome screen with value proposition',
                        'Create swipeable feature highlights carousel',
                        'Build "Get Started" CTA flow',
                        'Add option to skip onboarding',
                        'Implement onboarding completion tracking'
                    ]
                },
                {
                    category: 'Progressive Permissions',
                    items: [
                        'Request location permission when user opens map',
                        'Request notification permission after first order placed',
                        'Add camera permission for QR scanning',
                        'Create permission explanation modals',
                        'Implement fallback UI for denied permissions'
                    ]
                },
                {
                    category: 'Guided Tours',
                    items: [
                        'Integrate react-joyride for feature tooltips',
                        'Create QR scanning tutorial overlay',
                        'Add first-time badges on key features',
                        'Build contextual help tooltips',
                        'Implement tour completion tracking'
                    ]
                },
                {
                    category: 'User Education',
                    items: [
                        'Create help center with FAQs',
                        'Add in-app chat support widget',
                        'Build video tutorials for complex flows',
                        'Create "Tips & Tricks" section',
                        'Add contextual help links throughout app'
                    ]
                }
            ]
        },
        {
            id: 'phase6',
            name: 'Phase 6: Checkout & Payments',
            duration: '2 Weeks',
            priority: 'P1',
            team: ['Backend Engineer', 'Frontend Engineer', 'Security'],
            status: 'upcoming',
            objective: 'Build seamless, secure checkout experience',
            deliverables: [
                'Multi-step checkout',
                'Address autofill',
                'Payment method management',
                'Cart persistence'
            ],
            tasks: [
                {
                    category: 'Checkout Flow',
                    items: [
                        'Build wizard-style checkout (1. Cart Review, 2. Delivery, 3. Payment)',
                        'Add progress indicator with step numbers',
                        'Implement back navigation between steps',
                        'Create "Save & continue later" functionality',
                        'Add order summary sidebar (sticky)',
                        'Build checkout success animation'
                    ]
                },
                {
                    category: 'Address Management',
                    items: [
                        'Integrate Google Places Autocomplete API',
                        'Build address book (save multiple addresses)',
                        'Add current location detection',
                        'Create map-based address picker',
                        'Implement delivery zone validation',
                        'Add delivery instructions text area'
                    ]
                },
                {
                    category: 'Payment System',
                    items: [
                        'Integrate Stripe Elements or similar',
                        'Show payment method icons (Visa, Mastercard, Amex)',
                        'Build saved payment methods management',
                        'Add CVV security badge',
                        'Implement PCI compliance measures',
                        'Create payment error handling'
                    ]
                },
                {
                    category: 'Cart Features',
                    items: [
                        'Add cart persistence (localStorage + backend sync)',
                        'Implement abandoned cart recovery',
                        'Build special instructions per item',
                        'Add quantity steppers with animations',
                        'Create cart total breakdown (subtotal, delivery, tax)',
                        'Implement promo code system'
                    ]
                }
            ]
        },
        {
            id: 'phase7',
            name: 'Phase 7: Vendor Dashboard Excellence',
            duration: '2 Weeks',
            priority: 'P1',
            team: ['2 Frontend Engineers', 'Designer'],
            status: 'upcoming',
            objective: 'Transform vendor experience with Toast POS-level UX',
            deliverables: [
                'Real-time order management',
                'Analytics dashboard',
                'Menu management',
                'Table management'
            ],
            tasks: [
                {
                    category: 'Order Management',
                    items: [
                        'Build kitchen display mode (full-screen order queue)',
                        'Add auto-scroll and auto-refresh',
                        'Implement color-coded urgency indicators',
                        'Create swipe actions: accept, reject, complete',
                        'Add order audio alerts with volume control',
                        'Build order history with search'
                    ]
                },
                {
                    category: 'Analytics Dashboard',
                    items: [
                        'Integrate Recharts for data visualization',
                        'Create revenue line chart (daily, weekly, monthly)',
                        'Build popular items bar chart',
                        'Add peak hours heatmap',
                        'Implement animated counter components',
                        'Create exportable reports (CSV, PDF)'
                    ]
                },
                {
                    category: 'Menu Management',
                    items: [
                        'Build drag-and-drop menu item reordering',
                        'Add bulk operations (enable/disable, price update)',
                        'Create image upload with crop/resize',
                        'Implement menu item variants system',
                        'Add availability scheduling',
                        'Build menu preview mode (customer view)'
                    ]
                },
                {
                    category: 'Table Management',
                    items: [
                        'Create visual floor plan builder',
                        'Add drag-and-drop table assignment',
                        'Implement QR code generation per table',
                        'Build table status indicators',
                        'Add reservation system integration',
                        'Create table turnover analytics'
                    ]
                }
            ]
        },
        {
            id: 'phase8',
            name: 'Phase 8: Admin Panel & Data Management',
            duration: '1.5 Weeks',
            priority: 'P1',
            team: ['Full-stack Engineer', 'Backend Engineer'],
            status: 'upcoming',
            objective: 'Build powerful admin tools for platform management',
            deliverables: [
                'Advanced data tables',
                'Bulk operations',
                'Audit logs',
                'System analytics'
            ],
            tasks: [
                {
                    category: 'Data Tables',
                    items: [
                        'Implement TanStack Table (React Table v8)',
                        'Add sortable columns with indicators',
                        'Build column filters with multi-select',
                        'Create pagination with page size selector',
                        'Add column visibility toggle',
                        'Implement export to CSV/Excel'
                    ]
                },
                {
                    category: 'Bulk Admin Actions',
                    items: [
                        'Add multi-select checkboxes',
                        'Build bulk activate/deactivate vendors',
                        'Create batch user operations',
                        'Implement bulk email notifications',
                        'Add confirmation modals for destructive actions'
                    ]
                },
                {
                    category: 'Audit System',
                    items: [
                        'Build audit log table (who, what, when)',
                        'Add action filtering (create, update, delete)',
                        'Implement date range picker',
                        'Create exportable audit reports',
                        'Add user activity timeline'
                    ]
                },
                {
                    category: 'Platform Analytics',
                    items: [
                        'Build system health dashboard',
                        'Add total revenue graph',
                        'Create active vendors map visualization',
                        'Implement order volume trends',
                        'Add user growth analytics',
                        'Create automated reporting system'
                    ]
                }
            ]
        },
        {
            id: 'phase9',
            name: 'Phase 9: Performance Optimization',
            duration: '1.5 Weeks',
            priority: 'P2',
            team: ['Senior Engineer', 'DevOps'],
            status: 'upcoming',
            objective: 'Achieve Lighthouse score > 90 and instant perceived performance',
            deliverables: [
                'Bundle size optimization',
                'Image optimization',
                'Caching strategy',
                'Performance monitoring'
            ],
            tasks: [
                {
                    category: 'Bundle Optimization',
                    items: [
                        'Analyze bundle with webpack-bundle-analyzer',
                        'Implement route-based code splitting',
                        'Remove duplicate dependencies',
                        'Tree-shake unused code',
                        'Add dynamic imports for heavy components',
                        'Set bundle size budget in CI/CD'
                    ]
                },
                {
                    category: 'Image Optimization',
                    items: [
                        'Implement responsive images (srcset, sizes)',
                        'Convert all images to WebP format',
                        'Add blur placeholders (base64 or LQIP)',
                        'Implement lazy loading with Intersection Observer',
                        'Set up Cloudflare Images or Imgix',
                        'Add image compression in upload flow'
                    ]
                },
                {
                    category: 'Caching Strategy',
                    items: [
                        'Configure Service Worker cache-first strategy',
                        'Implement stale-while-revalidate for API calls',
                        'Add offline page caching',
                        'Build background sync for failed orders',
                        'Create cache invalidation strategy',
                        'Add cache version management'
                    ]
                },
                {
                    category: 'Performance Monitoring',
                    items: [
                        'Set up Web Vitals tracking (CLS, FID, LCP)',
                        'Integrate performance monitoring (Sentry, LogRocket)',
                        'Add real user monitoring (RUM)',
                        'Create performance dashboard',
                        'Set Lighthouse CI in GitHub Actions',
                        'Implement performance budgets enforcement'
                    ]
                }
            ]
        },
        {
            id: 'phase10',
            name: 'Phase 10: Accessibility & Testing',
            duration: '1.5 Weeks',
            priority: 'P0',
            team: ['QA Engineer', 'Frontend Engineer', 'A11Y Specialist'],
            status: 'upcoming',
            objective: 'Achieve WCAG 2.1 AA compliance and comprehensive test coverage',
            deliverables: [
                'A11Y compliance',
                'E2E test suite',
                'Visual regression testing',
                'Device testing matrix'
            ],
            tasks: [
                {
                    category: 'Accessibility Compliance',
                    items: [
                        'Run comprehensive axe-core audit',
                        'Fix all color contrast issues (4.5:1 minimum)',
                        'Add ARIA landmarks to all pages',
                        'Implement roving tabindex for complex components',
                        'Test with screen readers (NVDA, JAWS, VoiceOver)',
                        'Create A11Y testing checklist for new features'
                    ]
                },
                {
                    category: 'End-to-End Testing',
                    items: [
                        'Write Playwright tests for critical user flows',
                        'Test: Browse → QR Scan → Order → Checkout',
                        'Test vendor order management flow',
                        'Test admin user management',
                        'Add mobile viewport testing',
                        'Implement visual regression tests (Percy/Chromatic)'
                    ]
                },
                {
                    category: 'Cross-Device Testing',
                    items: [
                        'Test on iOS Safari (iPhone 12, 13, 14, 15)',
                        'Test on Android Chrome (Samsung, Pixel)',
                        'Test on desktop Chrome, Firefox, Safari',
                        'Verify PWA install on all platforms',
                        'Test offline functionality',
                        'Create device compatibility matrix'
                    ]
                },
                {
                    category: 'Quality Assurance',
                    items: [
                        'Create QA checklist document',
                        'Build error tracking dashboard',
                        'Implement bug reporting workflow',
                        'Add session replay for debugging',
                        'Create regression test suite',
                        'Set up automated smoke tests'
                    ]
                }
            ]
        },
        {
            id: 'phase11',
            name: 'Phase 11: PWA Enhancement',
            duration: '1 Week',
            priority: 'P1',
            team: ['Frontend Engineer', 'DevOps'],
            status: 'upcoming',
            objective: 'Maximize PWA capabilities for near-native experience',
            deliverables: [
                'Enhanced offline support',
                'Install prompts',
                'Background sync',
                'Push notifications'
            ],
            tasks: [
                {
                    category: 'PWA Installation',
                    items: [
                        'Create custom install prompt (iOS & Android)',
                        'Add "Add to Home Screen" tutorial',
                        'Build install banner with dismissal',
                        'Track install conversion rates',
                        'Create app icons for all sizes',
                        'Generate splash screens for iOS'
                    ]
                },
                {
                    category: 'Offline Capabilities',
                    items: [
                        'Cache all critical routes in Service Worker',
                        'Build offline queue for failed requests',
                        'Implement background sync for orders',
                        'Create offline indicator banner',
                        'Add offline fallback pages',
                        'Test offline scenarios thoroughly'
                    ]
                },
                {
                    category: 'Push Notifications',
                    items: [
                        'Set up push notification server',
                        'Implement Web Push API',
                        'Create notification templates',
                        'Add notification preferences panel',
                        'Build notification action buttons',
                        'Test push on all platforms'
                    ]
                },
                {
                    category: 'Native Features',
                    items: [
                        'Add camera access for QR scanning',
                        'Implement geolocation for nearby restaurants',
                        'Add contact picker for referrals',
                        'Integrate share API for menu items',
                        'Add clipboard API for order codes',
                        'Implement Web Bluetooth (future: payment terminals)'
                    ]
                }
            ]
        },
        {
            id: 'phase12',
            name: 'Phase 12: Polish & Launch Prep',
            duration: '1 Week',
            priority: 'P1',
            team: ['All Team', 'Product Manager'],
            status: 'upcoming',
            objective: 'Final polish, documentation, and production readiness',
            deliverables: [
                'Documentation',
                'Error handling',
                'Analytics',
                'Launch checklist'
            ],
            tasks: [
                {
                    category: 'Documentation',
                    items: [
                        'Write component documentation in Storybook',
                        'Create user guide documentation',
                        'Build developer onboarding guide',
                        'Document API integration patterns',
                        'Create architecture decision records (ADRs)',
                        'Write deployment runbook'
                    ]
                },
                {
                    category: 'Error Handling',
                    items: [
                        'Add global error boundary',
                        'Create friendly error messages',
                        'Implement error reporting to Sentry',
                        'Build fallback UI for errors',
                        'Add retry mechanisms',
                        'Create error recovery flows'
                    ]
                },
                {
                    category: 'Analytics Implementation',
                    items: [
                        'Integrate Google Analytics 4',
                        'Add event tracking (page views, clicks, conversions)',
                        'Implement funnel tracking',
                        'Create conversion dashboards',
                        'Add heatmap tracking (Hotjar)',
                        'Build A/B testing framework'
                    ]
                },
                {
                    category: 'Launch Preparation',
                    items: [
                        'Create pre-launch checklist',
                        'Run security audit (OWASP)',
                        'Perform load testing',
                        'Set up monitoring alerts',
                        'Create rollback plan',
                        'Prepare launch communications'
                    ]
                }
            ]
        }
    ];

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            P0: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
            P1: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
            P2: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, React.ReactNode> = {
            ready: <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />,
            upcoming: <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500" />,
            inProgress: <Circle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
            blocked: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        };
        return icons[status] || icons.upcoming;
    };

    const totalWeeks = phases.reduce((sum, phase) => {
        const weeks = parseFloat(phase.duration.split(' ')[0]);
        return sum + weeks;
    }, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6 pb-20">
            {/* Header */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                                DineIn Malta Transformation
                            </h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">
                                Strategic technology roadmap to build a world-class PWA experience
                            </p>
                        </div>
                        <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalWeeks}</div>
                                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Weeks</div>
                            </div>
                            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{phases.length}</div>
                                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Phases</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical Priority</span>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{phases.filter(p => p.priority === 'P0').length}</div>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">High Priority</span>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{phases.filter(p => p.priority === 'P1').length}</div>
                            </div>
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tasks</span>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{phases.reduce((sum, p) => sum + p.tasks.reduce((s, t) => s + t.items.length, 0), 0)}</div>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Deliverables</span>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{phases.reduce((sum, p) => sum + p.deliverables.length, 0)}</div>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Palette className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="max-w-7xl mx-auto space-y-6">
                {phases.map((phase) => (
                    <div
                        key={phase.id}
                        className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${expandedPhases[phase.id]
                            ? 'border-purple-200 dark:border-purple-800 ring-1 ring-purple-100 dark:ring-purple-900'
                            : 'border-slate-200 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md'
                            }`}
                    >
                        {/* Phase Header */}
                        <div
                            className="p-6 cursor-pointer"
                            onClick={() => togglePhase(phase.id)}
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="mt-1 flex-shrink-0">
                                        {getStatusIcon(phase.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                {phase.name}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(phase.priority)}`}>
                                                {phase.priority === 'P0' ? 'Critical' : phase.priority === 'P1' ? 'High' : 'Normal'}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {phase.duration}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
                                            {phase.objective}
                                        </p>

                                        {/* Team & Progress Snippet - Visible when collapsed */}
                                        {!expandedPhases[phase.id] && (
                                            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {phase.team.length} members
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                <div>{phase.deliverables.length} deliverables</div>
                                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                <div>{phase.tasks.reduce((sum, t) => sum + t.items.length, 0)} tasks</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 self-start md:self-center">
                                    {/* Status Badge */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${phase.status === 'ready'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : phase.status === 'inProgress'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                        }`}>
                                        {phase.status === 'inProgress' ? 'In Progress' : phase.status}
                                    </span>
                                    {expandedPhases[phase.id] ? (
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Detail View */}
                        {expandedPhases[phase.id] && (
                            <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-6 animate-in slide-in-from-top-2 duration-200">
                                <div className="grid md:grid-cols-12 gap-8">

                                    {/* Left Column: Team & Deliverables */}
                                    <div className="md:col-span-4 space-y-6">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-wider">Team Required</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {phase.team.map((member, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                                                        <Users className="w-3 h-3 mr-1.5 opacity-70" />
                                                        {member}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-wider">Key Deliverables</h4>
                                            <ul className="space-y-2">
                                                {phase.deliverables.map((item, i) => (
                                                    <li key={i} className="flex items-start text-sm text-slate-700 dark:text-slate-300">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-2.5 flex-shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Right Column: Detailed Tasks */}
                                    <div className="md:col-span-8">
                                        <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-4 tracking-wider flex items-center gap-2">
                                            <Code className="w-4 h-4" />
                                            Implementation Tasks
                                        </h4>
                                        <div className="space-y-4">
                                            {phase.tasks.map((taskGroup, groupIndex) => (
                                                <div key={groupIndex} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 font-medium text-sm text-slate-800 dark:text-slate-200">
                                                        {taskGroup.category}
                                                    </div>
                                                    <div className="p-4 grid gap-2">
                                                        {taskGroup.items.map((item, itemIndex) => (
                                                            <label key={itemIndex} className="flex items-start gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 -mx-2 rounded transition-colors">
                                                                <div className="relative flex items-center mt-0.5">
                                                                    <input type="checkbox" disabled className="peer h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600 disabled:opacity-50" />
                                                                </div>
                                                                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                                                                    {item}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkflowDashboard;
