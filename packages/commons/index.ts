export const childLogger = (meta: any) => ({
    info: (msg: any) => console.log('INFO', meta, msg),
    error: (msg: any) => console.error('ERROR', meta, msg),
    warn: (msg: any) => console.warn('WARN', meta, msg),
    debug: (msg: any) => console.debug('DEBUG', meta, msg),
})
