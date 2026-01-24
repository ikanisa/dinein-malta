export async function logStructuredEvent(
    event: string,
    data: Record<string, any> = {}
) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        ...data,
        environment: Deno.env.get('ENVIRONMENT') || 'development'
    }

    console.log(JSON.stringify(logEntry))

    // In production, also send to monitoring service
    if (Deno.env.get('DATADOG_API_KEY')) {
        try {
            await fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
                method: 'POST',
                headers: {
                    'DD-API-KEY': Deno.env.get('DATADOG_API_KEY')!,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...logEntry,
                    service: 'waiter-ai',
                    source: 'edge-function'
                })
            })
        } catch (error) {
            console.error('Failed to send log to Datadog:', error)
        }
    }
}
