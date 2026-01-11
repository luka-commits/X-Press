/**
 * Next.js Instrumentation Hook
 *
 * Wird beim Server-Start ausgeführt.
 * Startet den Hotfolder-Watcher in Development-Umgebung
 * oder wenn HOTFOLDER_ENABLED=true gesetzt ist.
 */

export async function register() {
  // Nur auf Node.js Runtime ausführen (nicht Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const isDev = process.env.NODE_ENV === 'development';
    const isEnabled = process.env.HOTFOLDER_ENABLED === 'true';

    if (isDev || isEnabled) {
      // Dynamischer Import um Client-Bundling zu vermeiden
      const { startHotfolderWatcher } = await import('./lib/hotfolder-watcher');

      console.log('[XOS] Hotfolder-Watcher wird gestartet...');
      await startHotfolderWatcher();
    } else {
      console.log('[XOS] Hotfolder-Watcher deaktiviert (setze HOTFOLDER_ENABLED=true zum Aktivieren)');
    }
  }
}
