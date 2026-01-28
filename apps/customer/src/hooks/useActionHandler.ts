/**
 * useActionHandler - Hook for handling UIPlan action intents
 *
 * Maps actionRef strings to navigation/state actions.
 * Only handles known intents; unknown intents are ignored.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ActionIntent } from '@dinein/core';

interface UIPlanAction {
    intent: ActionIntent;
    params?: Record<string, unknown>;
    requiresConfirmation?: boolean;
    confirmationText?: string;
}

interface CartActions {
    addItem?: (itemId: string, qty: number, options?: Record<string, unknown>) => void;
    updateItem?: (lineId: string, patch: Record<string, unknown>) => void;
    removeItem?: (lineId: string) => void;
}

interface ActionHandlerOptions {
    actions: Record<string, UIPlanAction>;
    cartActions?: CartActions;
    onConfirmRequired?: (action: UIPlanAction, actionId: string, onConfirm: () => void) => void;
}

/**
 * Hook for handling UIPlan action intents.
 * Returns a function that executes an action by its actionRef.
 */
export function useActionHandler({ actions, cartActions, onConfirmRequired }: ActionHandlerOptions) {
    const navigate = useNavigate();

    const executeAction = useCallback((actionRef: string | null | undefined) => {
        if (!actionRef) return;

        const action = actions[actionRef];
        if (!action) {
            console.warn(`Unknown actionRef: ${actionRef}`);
            return;
        }

        const { intent, params = {}, requiresConfirmation } = action;

        const doExecute = () => {
            switch (intent) {
                // Navigation intents
                case 'openHome':
                    navigate('/');
                    break;

                case 'openSearch':
                    navigate(`/search${params.query ? `?q=${encodeURIComponent(String(params.query))}` : ''}`);
                    break;

                case 'openVenue':
                    if (params.venueId) {
                        navigate(`/v/${params.venueId}`);
                    }
                    break;

                case 'openMenu':
                    if (params.venueId) {
                        const path = params.categoryId
                            ? `/v/${params.venueId}/menu?cat=${params.categoryId}`
                            : `/v/${params.venueId}/menu`;
                        navigate(path);
                    }
                    break;

                case 'openItem':
                    if (params.itemId) {
                        navigate(`/item/${params.itemId}`);
                    }
                    break;

                case 'openCheckout':
                    navigate('/checkout');
                    break;

                case 'openOrders':
                    navigate('/orders');
                    break;

                case 'openChatWaiter':
                    navigate('/chat');
                    break;

                case 'trackOrder':
                    if (params.orderId) {
                        navigate(`/orders/${params.orderId}`);
                    }
                    break;

                // Filter intents
                case 'applyFilter':
                    // Emit event for parent to handle
                    window.dispatchEvent(new CustomEvent('uiplan:filter', {
                        detail: { filters: params.filters }
                    }));
                    break;

                case 'clearFilters':
                    window.dispatchEvent(new CustomEvent('uiplan:filter', {
                        detail: { filters: {} }
                    }));
                    break;

                // Cart intents
                case 'addToCart':
                    if (cartActions?.addItem && params.itemId && typeof params.qty === 'number') {
                        cartActions.addItem(String(params.itemId), params.qty, {
                            addons: params.addons as string[] | undefined,
                            notes: params.notes as string | undefined,
                        });
                    }
                    break;

                case 'updateCartItem':
                    if (cartActions?.updateItem && params.lineId && params.patch) {
                        cartActions.updateItem(String(params.lineId), params.patch as Record<string, unknown>);
                    }
                    break;

                case 'removeFromCart':
                    if (cartActions?.removeItem && params.lineId) {
                        cartActions.removeItem(String(params.lineId));
                    }
                    break;

                // Visit/order intents
                case 'startVisit':
                    if (params.venueId) {
                        // Store visit context and navigate to menu
                        sessionStorage.setItem('activeVisit', JSON.stringify({
                            venueId: params.venueId,
                            tableId: params.tableId,
                            startedAt: new Date().toISOString(),
                        }));
                        navigate(`/v/${params.venueId}/menu`);
                    }
                    break;

                case 'confirmOrder':
                    window.dispatchEvent(new CustomEvent('uiplan:confirmOrder', {
                        detail: { visitId: params.visitId, paymentMethod: params.paymentMethod }
                    }));
                    break;

                // Service intents
                case 'sendWaiterMessage':
                    window.dispatchEvent(new CustomEvent('uiplan:waiterMessage', {
                        detail: { message: params.message, visitId: params.visitId }
                    }));
                    break;

                case 'callStaff':
                    window.dispatchEvent(new CustomEvent('uiplan:callStaff', {
                        detail: { reason: params.reason, visitId: params.visitId }
                    }));
                    break;

                case 'requestBill':
                    window.dispatchEvent(new CustomEvent('uiplan:requestBill', {
                        detail: { visitId: params.visitId }
                    }));
                    break;

                // External URL
                case 'openExternalUrl':
                    if (params.url && typeof params.url === 'string') {
                        window.open(params.url, '_blank', 'noopener,noreferrer');
                    }
                    break;

                default:
                    console.warn(`Unhandled intent: ${intent}`);
            }
        };

        // Handle confirmation requirement
        if (requiresConfirmation && onConfirmRequired) {
            onConfirmRequired(action, actionRef, doExecute);
        } else {
            doExecute();
        }
    }, [actions, navigate, cartActions, onConfirmRequired]);

    return { executeAction };
}
