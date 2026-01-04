/**
 * Offline Queue Service
 * Queues failed API requests for retry when back online
 * Implements background sync for offline-first experience
 */

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  retries: number;
  maxRetries?: number;
}

const QUEUE_KEY = 'offline_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Add a request to the offline queue
 */
export async function queueRequest(
  url: string,
  options: RequestInit,
  maxRetries: number = MAX_RETRIES
): Promise<void> {
  const queue = getQueue();

  const queuedRequest: QueuedRequest = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    url,
    method: options.method || 'GET',
    headers: Object.fromEntries(
      Object.entries(options.headers || {})
        .map(([key, value]) => [key, String(value)])
    ),
    body: options.body,
    timestamp: Date.now(),
    retries: 0,
    maxRetries,
  };

  queue.push(queuedRequest);
  saveQueue(queue);

  // Register background sync if available
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // @ts-ignore
      await registration.sync.register('sync-queue');
    } catch (error) {
      console.warn('Background sync registration failed:', error);
    }
  }
}

/**
 * Get all queued requests
 */
export function getQueue(): QueuedRequest[] {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading offline queue:', error);
    return [];
  }
}

/**
 * Save queue to localStorage
 */
function saveQueue(queue: QueuedRequest[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving offline queue:', error);
  }
}

/**
 * Process the offline queue when back online
 */
export async function processQueue(): Promise<{ success: number; failed: number }> {
  const queue = getQueue();
  if (queue.length === 0) return { success: 0, failed: 0 };

  const results = { success: 0, failed: 0 };
  const remainingQueue: QueuedRequest[] = [];

  for (const request of queue) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      if (response.ok) {
        results.success++;
        // Request succeeded, remove from queue
      } else {
        // Request failed, retry if not exceeded max retries
        if (request.retries < (request.maxRetries || MAX_RETRIES)) {
          request.retries++;
          remainingQueue.push(request);
          results.failed++;
        } else {
          // Max retries exceeded, remove from queue
          console.error(`Request ${request.id} exceeded max retries`);
          results.failed++;
        }
      }
    } catch (error) {
      // Network error, retry if not exceeded max retries
      if (request.retries < (request.maxRetries || MAX_RETRIES)) {
        request.retries++;
        remainingQueue.push(request);
        results.failed++;
      } else {
        console.error(`Request ${request.id} failed after max retries:`, error);
        results.failed++;
      }
    }
  }

  // Save remaining queue
  saveQueue(remainingQueue);

  return results;
}

/**
 * Clear the queue
 */
export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

/**
 * Initialize queue processing on online event
 */
export function initQueueProcessor(): void {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    console.log('Online - processing queued requests...');
    const results = await processQueue();
    console.log(`Queue processed: ${results.success} succeeded, ${results.failed} failed`);
  };

  window.addEventListener('online', handleOnline);

  // Also process queue if already online
  if (navigator.onLine) {
    handleOnline();
  }
}

