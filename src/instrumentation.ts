/**
 * Next.js Instrumentation Hook
 *
 * Initializes:
 * - Sentry error tracking (server-side)
 * - Structured JSON logging (pino via next-logger)
 * - Hotfolder watcher (development/when enabled)
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 1. Initialize Sentry (server-side)
    await import('../sentry.server.config');

    // 2. Initialize structured logging (patches console)
    await import('pino');
    await import('next-logger');

    // 3. Hotfolder watcher
    const isDev = process.env.NODE_ENV === 'development';
    const isEnabled = process.env.HOTFOLDER_ENABLED === 'true';

    if (isDev || isEnabled) {
      const { startHotfolderWatcher } = await import('./lib/hotfolder-watcher');
      console.log('[XOS] Hotfolder-Watcher wird gestartet...');
      await startHotfolderWatcher();
    } else {
      console.log(
        '[XOS] Hotfolder-Watcher deaktiviert (setze HOTFOLDER_ENABLED=true zum Aktivieren)'
      );
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
