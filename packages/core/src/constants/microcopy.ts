export const MICROCOPY = {
    errors: {
        general: "Something went wrong. Please try again.",
        network: "Please check your internet connection.",
        cart: {
            addFailed: "Could not add item. Try again.",
            updateFailed: "Could not update cart.",
            removeFailed: "Could not remove item.",
            checkoutFailed: "Checkout failed. Please try again."
        },
        venue: {
            notFound: "Venue not found.",
            menuLoadFailed: "Could not load menu. Swipe down to retry.",
            scanFailed: "Invalid QR code. Please scan a valid DineIn code."
        },
        auth: {
            loginFailed: "Login failed. Check your credentials.",
            claimFailed: "Could not claim venue. Contact support.",
            unauthorized: "You don't have permission to access this."
        },
        logs: {
            loadFailed: "Couldn't load logs. Check connection."
        }
    },
    states: {
        loading: {
            general: "Loading...",
            menu: "Curating the menu...",
            order: "Sending your order to the kitchen...",
            payment: "Securely processing...",
        },
        empty: {
            cart: {
                title: "Your cart is empty",
                description: "Looks like you haven't added anything yet.",
                action: "Browse Menu"
            },
            orders: {
                title: "No orders yet",
                description: "Your past orders will appear here.",
                action: "Start Ordering"
            },
            menu: {
                title: "Menu unavailable",
                description: "The kitchen is updating the menu. Check back soon.",
            },
            search: {
                title: "No results found",
                description: "Try adjusting your search terms.",
            },
            venues: {
                title: "No venues found",
                description: "There are no active venues in your area yet.",
                action: "Scan a QR code"
            },
            // Venue Portal
            venueOrders: {
                title: "No orders yet",
                description: "Orders will appear here when customers place them.",
            },
            bellCalls: {
                title: "No bell calls",
                description: "Customers can ring the bell to request service.",
            },
            // Customer
            favorites: {
                title: "No favorites yet",
                description: "Long-press items to add them here.",
            },
            // Admin Portal
            claims: {
                title: "No pending claims",
                description: "Venue claim requests will appear here.",
            },
            logs: {
                title: "No logs found",
                description: "Activity logs will appear here.",
            }
        }
    },
    actions: {
        confirm: "Confirm",
        cancel: "Cancel",
        retry: "Retry",
        back: "Back",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        checkout: "Checkout",
        placeOrder: "Place Order",
        scanQr: "Scan QR Code",
        addToHome: "Add to Home Screen",
        // Venue specific
        markReceived: "Mark Received",
        markServed: "Mark Served",
        uploadMenu: "Upload Menu",
        publish: "Publish",
        // Admin specific
        approve: "Approve",
        reject: "Reject",
        disable: "Disable"
    },
    // Payment handoff copy - CRITICAL: never imply verification
    paymentHandoff: {
        rw: {
            title: "Pay with MoMo",
            instruction: "MoMo USSD will open. Complete payment there.",
            confirmation: "Show your MoMo confirmation to staff.",
            disclaimer: "Payment happens in the other app."
        },
        mt: {
            title: "Pay with Revolut",
            instruction: "Revolut will open. Complete payment there.",
            confirmation: "Show your Revolut confirmation to staff.",
            disclaimer: "Payment happens in the other app."
        },
        cash: {
            title: "Pay with Cash",
            instruction: "Pay at the counter or table.",
            confirmation: "Staff will collect payment."
        }
    },
    // Confirmation dialogs for destructive actions
    confirmations: {
        cancelOrder: {
            title: "Cancel order?",
            body: "This action cannot be undone.",
            confirm: "Yes, cancel",
            cancel: "Keep order"
        },
        rejectClaim: {
            title: "Reject claim?",
            body: "The owner will be notified.",
            confirm: "Reject",
            cancel: "Cancel"
        },
        disableVenue: {
            title: "Disable venue?",
            body: "Customers won't be able to order.",
            confirm: "Disable",
            cancel: "Cancel"
        }
    }
} as const;

