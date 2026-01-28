/**
 * UIPlanRenderer - Universal renderer for UIPlan v1
 *
 * Maps sections to UI components based on type.
 * Handles actions via useActionHandler hook.
 */

import { useMemo, useState, useCallback } from 'react';
import { useActionHandler } from '../../hooks/useActionHandler';
import type {
    UIPlan,
    UIPlanSection,
    SectionItem,
    ActionIntent,
} from '@dinein/core';
import './UIPlanRenderer.css';

// Local action type (compatible with hook)
interface LocalUIPlanAction {
    intent: ActionIntent;
    params?: Record<string, unknown>;
    requiresConfirmation?: boolean;
    confirmationText?: string;
}

// =============================================================================
// PROPS
// =============================================================================

interface UIPlanRendererProps {
    plan: UIPlan;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UIPlanRenderer({ plan }: UIPlanRendererProps) {
    const [confirmDialog, setConfirmDialog] = useState<{
        action: LocalUIPlanAction;
        actionId: string;
        onConfirm: () => void;
    } | null>(null);

    // Convert actions to local compatible format
    const actionsById = useMemo(() => {
        const result: Record<string, LocalUIPlanAction> = {};
        for (const [key, action] of Object.entries(plan.actions.byId)) {
            result[key] = {
                intent: action.intent,
                params: action.params ?? undefined,
                requiresConfirmation: action.requiresConfirmation ?? undefined,
                confirmationText: action.confirmationText ?? undefined,
            };
        }
        return result;
    }, [plan.actions.byId]);

    const handleConfirmRequired = useCallback((
        action: LocalUIPlanAction,
        actionId: string,
        onConfirm: () => void
    ) => {
        setConfirmDialog({ action, actionId, onConfirm });
    }, []);

    const { executeAction } = useActionHandler({
        actions: actionsById,
        onConfirmRequired: handleConfirmRequired,
    });

    const handleConfirm = () => {
        if (confirmDialog) {
            confirmDialog.onConfirm();
            setConfirmDialog(null);
        }
    };

    return (
        <div className="uiplan-container">
            {/* Screen title */}
            {plan.screen.title && (
                <header className="uiplan-header">
                    <h1 className="uiplan-title">{plan.screen.title}</h1>
                    {plan.screen.breadcrumbs && (
                        <nav className="uiplan-breadcrumbs">
                            {plan.screen.breadcrumbs.map((bc, i) => (
                                <span key={i}>
                                    {bc.actionRef ? (
                                        <button
                                            className="uiplan-breadcrumb-link"
                                            onClick={() => executeAction(bc.actionRef)}
                                        >
                                            {bc.label}
                                        </button>
                                    ) : (
                                        <span className="uiplan-breadcrumb-current">{bc.label}</span>
                                    )}
                                    {i < plan.screen.breadcrumbs!.length - 1 && ' / '}
                                </span>
                            ))}
                        </nav>
                    )}
                </header>
            )}

            {/* Sections */}
            <main className="uiplan-sections">
                {plan.sections.map((section) => (
                    <SectionRenderer
                        key={section.id}
                        section={section}
                        executeAction={executeAction}
                    />
                ))}
            </main>

            {/* Empty state fallback */}
            {plan.sections.length === 0 && (
                <div className="uiplan-empty">
                    <p>No content available</p>
                </div>
            )}

            {/* Confirmation dialog */}
            {confirmDialog && (
                <div className="uiplan-confirm-overlay" onClick={() => setConfirmDialog(null)}>
                    <div className="uiplan-confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <p>{confirmDialog.action.confirmationText || 'Confirm this action?'}</p>
                        <div className="uiplan-confirm-actions">
                            <button
                                className="uiplan-confirm-cancel"
                                onClick={() => setConfirmDialog(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="uiplan-confirm-ok"
                                onClick={handleConfirm}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// SECTION RENDERER
// =============================================================================

interface SectionRendererProps {
    section: UIPlanSection;
    executeAction: (actionRef: string | null | undefined) => void;
}

function SectionRenderer({ section, executeAction }: SectionRendererProps) {
    const emphasisClass = section.style?.emphasis ? `emphasis-${section.style.emphasis}` : '';
    const densityClass = section.style?.density === 'compact' ? 'density-compact' : '';

    switch (section.type) {
        case 'hero':
            return (
                <section className={`uiplan-section uiplan-hero ${emphasisClass}`}>
                    {section.title && <h2 className="uiplan-section-title">{section.title}</h2>}
                    {section.subtitle && <p className="uiplan-section-subtitle">{section.subtitle}</p>}
                    {section.items.map((item) => (
                        <HeroItem key={item.id} item={item} executeAction={executeAction} />
                    ))}
                </section>
            );

        case 'chips':
            return (
                <section className={`uiplan-section uiplan-chips ${densityClass}`}>
                    {section.title && <h3 className="uiplan-section-title">{section.title}</h3>}
                    <div className="uiplan-chips-container">
                        {section.items.map((item) => (
                            <ChipItem key={item.id} item={item} executeAction={executeAction} />
                        ))}
                    </div>
                </section>
            );

        case 'carousel':
            return (
                <section className={`uiplan-section uiplan-carousel ${emphasisClass}`}>
                    {section.title && <h3 className="uiplan-section-title">{section.title}</h3>}
                    <div className="uiplan-carousel-container">
                        {section.items.map((item) => (
                            <CardItem key={item.id} item={item} executeAction={executeAction} />
                        ))}
                    </div>
                </section>
            );

        case 'grid':
            return (
                <section className={`uiplan-section uiplan-grid ${emphasisClass}`}>
                    {section.title && <h3 className="uiplan-section-title">{section.title}</h3>}
                    <div className="uiplan-grid-container">
                        {section.items.map((item) => (
                            <CardItem key={item.id} item={item} executeAction={executeAction} />
                        ))}
                    </div>
                </section>
            );

        case 'list':
            return (
                <section className={`uiplan-section uiplan-list ${densityClass}`}>
                    {section.title && <h3 className="uiplan-section-title">{section.title}</h3>}
                    <ul className="uiplan-list-container">
                        {section.items.map((item) => (
                            <ListItem key={item.id} item={item} executeAction={executeAction} />
                        ))}
                    </ul>
                </section>
            );

        case 'banner':
            return (
                <section className="uiplan-section uiplan-banner">
                    {section.items.map((item) => (
                        <BannerItem key={item.id} item={item} executeAction={executeAction} />
                    ))}
                </section>
            );

        case 'metrics':
            return (
                <section className={`uiplan-section uiplan-metrics ${emphasisClass}`}>
                    {section.title && <h3 className="uiplan-section-title">{section.title}</h3>}
                    <dl className="uiplan-metrics-container">
                        {section.items.map((item) => (
                            <MetricItem key={item.id} item={item} />
                        ))}
                    </dl>
                </section>
            );

        case 'cta':
            return (
                <section className="uiplan-section uiplan-cta">
                    {section.items.map((item) => (
                        <CTAItem key={item.id} item={item} executeAction={executeAction} />
                    ))}
                </section>
            );

        case 'divider':
            return <hr className="uiplan-divider" />;

        default:
            return null;
    }
}

// =============================================================================
// ITEM COMPONENTS
// =============================================================================

interface ItemProps {
    item: SectionItem;
    executeAction: (actionRef: string | null | undefined) => void;
}

function HeroItem({ item, executeAction }: ItemProps) {
    return (
        <div
            className={`uiplan-hero-item ${item.actionRef ? 'clickable' : ''}`}
            onClick={() => executeAction(item.actionRef)}
        >
            <p className="uiplan-hero-primary">{item.primaryText}</p>
            {item.secondaryText && <p className="uiplan-hero-secondary">{item.secondaryText}</p>}
        </div>
    );
}

function ChipItem({ item, executeAction }: ItemProps) {
    return (
        <button
            className="uiplan-chip"
            onClick={() => executeAction(item.actionRef)}
            disabled={!item.actionRef}
        >
            {item.primaryText}
        </button>
    );
}

function CardItem({ item, executeAction }: ItemProps) {
    return (
        <article
            className={`uiplan-card ${item.actionRef ? 'clickable' : ''}`}
            onClick={() => executeAction(item.actionRef)}
        >
            {item.media?.imageUrl && (
                <img
                    className="uiplan-card-image"
                    src={item.media.imageUrl}
                    alt={item.primaryText}
                    loading="lazy"
                />
            )}
            <div className="uiplan-card-content">
                <h4 className="uiplan-card-title">{item.primaryText}</h4>
                {item.secondaryText && <p className="uiplan-card-subtitle">{item.secondaryText}</p>}
                {item.meta && (
                    <div className="uiplan-card-meta">
                        {item.meta.badge && <span className="uiplan-badge">{item.meta.badge}</span>}
                        {item.meta.priceText && <span className="uiplan-price">{item.meta.priceText}</span>}
                        {item.meta.ratingText && <span className="uiplan-rating">{item.meta.ratingText}</span>}
                    </div>
                )}
            </div>
        </article>
    );
}

function ListItem({ item, executeAction }: ItemProps) {
    return (
        <li
            className={`uiplan-list-item ${item.actionRef ? 'clickable' : ''}`}
            onClick={() => executeAction(item.actionRef)}
        >
            <div className="uiplan-list-item-content">
                <span className="uiplan-list-item-primary">{item.primaryText}</span>
                {item.secondaryText && (
                    <span className="uiplan-list-item-secondary">{item.secondaryText}</span>
                )}
            </div>
            {item.meta && (
                <div className="uiplan-list-item-meta">
                    {item.meta.badge && <span className="uiplan-badge">{item.meta.badge}</span>}
                    {item.meta.priceText && <span className="uiplan-price">{item.meta.priceText}</span>}
                </div>
            )}
        </li>
    );
}

function BannerItem({ item, executeAction }: ItemProps) {
    return (
        <div
            className={`uiplan-banner-item ${item.actionRef ? 'clickable' : ''}`}
            onClick={() => executeAction(item.actionRef)}
        >
            <span className="uiplan-banner-text">{item.primaryText}</span>
            {item.secondaryText && <span className="uiplan-banner-subtext">{item.secondaryText}</span>}
            {item.meta?.badge && <span className="uiplan-badge">{item.meta.badge}</span>}
        </div>
    );
}

function MetricItem({ item }: { item: SectionItem }) {
    return (
        <div className="uiplan-metric">
            <dt className="uiplan-metric-label">{item.primaryText}</dt>
            <dd className="uiplan-metric-value">
                {item.meta?.priceText || item.secondaryText}
                {item.meta?.badge && <span className="uiplan-badge">{item.meta.badge}</span>}
            </dd>
        </div>
    );
}

function CTAItem({ item, executeAction }: ItemProps) {
    return (
        <button
            className="uiplan-cta-button"
            onClick={() => executeAction(item.actionRef)}
            disabled={!item.actionRef}
        >
            {item.primaryText}
        </button>
    );
}

export default UIPlanRenderer;
