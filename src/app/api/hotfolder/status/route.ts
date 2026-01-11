/**
 * API-Endpoint: Hotfolder Status
 *
 * GET /api/hotfolder/status
 *
 * Gibt den aktuellen Status des Hotfolder-Watchers zurück.
 */

import { getWatcherStatus } from '@/lib/hotfolder-watcher';

export async function GET() {
  const status = getWatcherStatus();

  return Response.json({
    running: status.isRunning,
    hotfolderPath: status.hotfolderPath,
    processedCount: status.processedCount,
    failedCount: status.failedCount,
    currentlyProcessing: status.processingFiles,
    lastActivity: status.lastActivity?.toISOString() || null,
  });
}
