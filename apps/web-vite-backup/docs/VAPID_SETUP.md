# VAPID Keys Setup for Push Notifications

## Overview
VAPID (Voluntary Application Server Identification) keys are used to identify your application server when sending push notifications. This document explains how to set up VAPID keys for the DineIn PWA.

## Generating VAPID Keys

### Option 1: Using web-push CLI
```bash
npx web-push generate-vapid-keys
```

This will output:
```
Public Key: <your-public-key>
Private Key: <your-private-key>
```

### Option 2: Using Node.js
```javascript
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

## Frontend Configuration

1. Add the public key to your `.env` file:
```env
VITE_VAPID_PUBLIC_KEY=your-public-key-here
```

2. The public key is automatically used by the push notification service when registering subscriptions.

## Backend Configuration

1. Store the **private key** securely in your backend environment variables (never commit it to git).

2. Use the private key when sending push notifications:

```javascript
const webpush = require('web-push');

// Configure VAPID details
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Contact email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send notification
const payload = JSON.stringify({
  title: 'Order Update',
  body: 'Your order is ready!',
  icon: '/icons/icon-192.png',
});

webpush.sendNotification(subscription, payload)
  .then(() => console.log('Push notification sent'))
  .catch(err => console.error('Error sending notification:', err));
```

## Backend Endpoint Implementation

You'll need to create endpoints to:
1. Save push subscriptions when users enable notifications
2. Remove subscriptions when users disable notifications
3. Send notifications when order status changes

### Example: Save Subscription Endpoint

```typescript
// POST /api/push-subscriptions
app.post('/api/push-subscriptions', async (req, res) => {
  const { subscription, userId } = req.body;
  
  // Save to database
  await db.pushSubscriptions.upsert({
    userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });
  
  res.json({ success: true });
});
```

### Example: Send Notification

```typescript
// When order status changes
async function notifyOrderUpdate(orderId: string, status: string) {
  const order = await db.orders.findById(orderId);
  const subscription = await db.pushSubscriptions.findByUserId(order.userId);
  
  if (subscription) {
    const payload = JSON.stringify({
      title: 'Order Update',
      body: `Order ${order.orderCode} is now ${status}`,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `order-${orderId}`,
      data: { orderId, status },
    });
    
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      payload
    );
  }
}
```

## Service Worker Configuration

The service worker should handle push events:

```javascript
// In your service worker (sw.js)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    title: data.title || 'DineIn',
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    tag: data.tag || 'notification',
    data: data.data || {},
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data;
  if (data.orderId) {
    event.waitUntil(
      clients.openWindow(`/order/${data.orderId}`)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
```

## Testing

1. Enable notifications in the app settings
2. Check that subscription is saved to your backend
3. Send a test notification from your backend
4. Verify notification appears on the device

## Security Notes

- **Never expose the private key** in client-side code
- Store private key securely in environment variables
- Use HTTPS in production (required for push notifications)
- Validate subscription data on the backend before saving

## Troubleshooting

### "VAPID_PUBLIC_KEY not configured"
- Ensure `VITE_VAPID_PUBLIC_KEY` is set in your `.env` file
- Restart your dev server after adding the key

### "Push subscription failed"
- Ensure service worker is registered
- Check browser console for errors
- Verify VAPID public key format (should be base64 URL-safe)

### Notifications not appearing
- Check notification permissions in browser settings
- Verify service worker is active
- Check backend logs for errors when sending notifications
