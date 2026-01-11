/**
 * XOS Hotfolder Watcher
 *
 * Überwacht data/hotfolder/ auf neue XML-Dateien und importiert sie automatisch.
 * Erfolgreich importierte Dateien werden nach data/processed/ verschoben.
 * Fehlerhafte Dateien werden nach data/failed/ verschoben mit Error-Log.
 */

import chokidar, { FSWatcher } from 'chokidar';
import fs from 'fs/promises';
import path from 'path';
import { parseXML } from './xml-parser';
import { importAuftrag } from './import-service';

// ============================================================
// Configuration
// ============================================================

const CONFIG = {
  HOTFOLDER_PATH: path.join(process.cwd(), 'data', 'hotfolder'),
  PROCESSED_PATH: path.join(process.cwd(), 'data', 'processed'),
  FAILED_PATH: path.join(process.cwd(), 'data', 'failed'),
  FILE_STABLE_CHECKS: 3,        // 3x gleiche Größe = Datei ist stabil
  FILE_STABLE_INTERVAL_MS: 100, // Prüfintervall in ms
  FILE_STABLE_MAX_WAIT_MS: 5000 // Max. Wartezeit in ms
};

// ============================================================
// Types
// ============================================================

export interface WatcherStatus {
  isRunning: boolean;
  hotfolderPath: string;
  processedCount: number;
  failedCount: number;
  processingFiles: string[];
  lastActivity: Date | null;
}

interface WatcherState {
  watcher: FSWatcher | null;
  isProcessing: Set<string>;
  processedCount: number;
  failedCount: number;
  lastActivity: Date | null;
}

// ============================================================
// State
// ============================================================

const state: WatcherState = {
  watcher: null,
  isProcessing: new Set(),
  processedCount: 0,
  failedCount: 0,
  lastActivity: null
};

// ============================================================
// Directory Management
// ============================================================

/**
 * Stellt sicher, dass alle notwendigen Verzeichnisse existieren
 */
async function ensureDirectories(): Promise<void> {
  const dirs = [CONFIG.HOTFOLDER_PATH, CONFIG.PROCESSED_PATH, CONFIG.FAILED_PATH];

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Ignoriere Fehler wenn Verzeichnis bereits existiert
    }
  }
}

// ============================================================
// File Stability Check
// ============================================================

/**
 * Wartet bis eine Datei vollständig geschrieben wurde
 * (Dateigröße ändert sich nicht mehr)
 */
async function waitForFileStable(filePath: string): Promise<void> {
  let lastSize = -1;
  let stableCount = 0;
  let totalWait = 0;

  while (stableCount < CONFIG.FILE_STABLE_CHECKS && totalWait < CONFIG.FILE_STABLE_MAX_WAIT_MS) {
    try {
      const stats = await fs.stat(filePath);

      if (stats.size === lastSize) {
        stableCount++;
      } else {
        lastSize = stats.size;
        stableCount = 0;
      }
    } catch {
      // Datei wurde möglicherweise gelöscht/verschoben
      throw new Error(`Datei nicht mehr verfügbar: ${filePath}`);
    }

    await new Promise(resolve => setTimeout(resolve, CONFIG.FILE_STABLE_INTERVAL_MS));
    totalWait += CONFIG.FILE_STABLE_INTERVAL_MS;
  }

  if (stableCount < CONFIG.FILE_STABLE_CHECKS) {
    throw new Error(`Datei wurde nicht stabil innerhalb von ${CONFIG.FILE_STABLE_MAX_WAIT_MS}ms`);
  }
}

// ============================================================
// File Movement
// ============================================================

/**
 * Verschiebt erfolgreich importierte Datei nach processed/
 */
async function moveToProcessed(filePath: string, auftragsnummer: string): Promise<void> {
  const filename = path.basename(filePath, '.xml');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const newFilename = `${filename}_${timestamp}.xml`;
  const destPath = path.join(CONFIG.PROCESSED_PATH, newFilename);

  await fs.rename(filePath, destPath);
  console.log(`[Hotfolder] Verschoben nach processed: ${newFilename}`);
}

/**
 * Verschiebt fehlerhafte Datei nach failed/ und erstellt Error-Log
 */
async function moveToFailed(filePath: string, error: string, stack?: string): Promise<void> {
  const filename = path.basename(filePath);
  const destPath = path.join(CONFIG.FAILED_PATH, filename);
  const errorLogPath = path.join(CONFIG.FAILED_PATH, `${path.basename(filePath, '.xml')}.error.txt`);

  // Fehlerlog erstellen
  const errorContent = [
    `Fehler beim Import: ${filename}`,
    `Zeitpunkt: ${new Date().toISOString()}`,
    `Fehler: ${error}`,
    '',
    stack ? `Stack:\n${stack}` : ''
  ].join('\n');

  try {
    await fs.writeFile(errorLogPath, errorContent, 'utf-8');
    await fs.rename(filePath, destPath);
    console.error(`[Hotfolder] Fehler - verschoben nach failed: ${filename}`);
  } catch (moveError) {
    console.error(`[Hotfolder] Konnte Datei nicht nach failed verschieben: ${filename}`, moveError);
  }
}

// ============================================================
// File Processing
// ============================================================

/**
 * Verarbeitet eine einzelne XML-Datei
 */
async function processFile(filePath: string): Promise<void> {
  const filename = path.basename(filePath);

  // Nur .xml Dateien verarbeiten
  if (!filename.toLowerCase().endsWith('.xml')) {
    console.log(`[Hotfolder] Ignoriere Nicht-XML-Datei: ${filename}`);
    return;
  }

  // .gitkeep ignorieren
  if (filename === '.gitkeep') {
    return;
  }

  // Doppelverarbeitung verhindern
  if (state.isProcessing.has(filePath)) {
    console.log(`[Hotfolder] Datei wird bereits verarbeitet: ${filename}`);
    return;
  }

  state.isProcessing.add(filePath);
  state.lastActivity = new Date();

  console.log(`[Hotfolder] Verarbeite: ${filename}`);

  try {
    // Warten bis Datei vollständig geschrieben wurde
    await waitForFileStable(filePath);

    // XML-Inhalt lesen
    const xmlContent = await fs.readFile(filePath, 'utf-8');

    // Prüfen ob Datei leer ist
    if (!xmlContent.trim()) {
      throw new Error('Leere Datei');
    }

    // XML parsen
    const parsed = parseXML(xmlContent);

    // In Datenbank importieren
    const result = await importAuftrag(parsed);

    if (result.success) {
      await moveToProcessed(filePath, result.auftragsnummer);
      state.processedCount++;
      console.log(`[Hotfolder] Erfolgreich importiert: ${result.auftragsnummer} (${result.isUpdate ? 'Update' : 'Neu'})`);
    } else {
      throw new Error(result.error || 'Unbekannter Importfehler');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    const errorStack = error instanceof Error ? error.stack : undefined;

    await moveToFailed(filePath, errorMessage, errorStack);
    state.failedCount++;
    console.error(`[Hotfolder] Import fehlgeschlagen für ${filename}: ${errorMessage}`);

  } finally {
    state.isProcessing.delete(filePath);
  }
}

// ============================================================
// Watcher Management
// ============================================================

/**
 * Startet den Hotfolder-Watcher
 */
export async function startHotfolderWatcher(): Promise<void> {
  if (state.watcher) {
    console.log('[Hotfolder] Watcher läuft bereits');
    return;
  }

  // Verzeichnisse erstellen
  await ensureDirectories();

  console.log(`[Hotfolder] Starte Watcher für: ${CONFIG.HOTFOLDER_PATH}`);

  // Watcher initialisieren
  state.watcher = chokidar.watch(CONFIG.HOTFOLDER_PATH, {
    persistent: true,
    ignoreInitial: false,  // Auch bestehende Dateien verarbeiten
    awaitWriteFinish: false, // Wir machen eigene Stabilitätsprüfung
    depth: 0,  // Nur Hauptverzeichnis, keine Unterordner
    ignored: [
      /(^|[\/\\])\../, // Versteckte Dateien ignorieren (außer .gitkeep wird separat geprüft)
    ]
  });

  // Event Handler
  state.watcher.on('add', async (filePath) => {
    try {
      await processFile(filePath);
    } catch (error) {
      console.error(`[Hotfolder] Unerwarteter Fehler bei ${filePath}:`, error);
    }
  });

  state.watcher.on('error', (error) => {
    console.error('[Hotfolder] Watcher-Fehler:', error);
  });

  state.watcher.on('ready', () => {
    console.log(`[Hotfolder] Watcher aktiv - überwache: ${CONFIG.HOTFOLDER_PATH}`);
  });
}

/**
 * Stoppt den Hotfolder-Watcher
 */
export function stopHotfolderWatcher(): void {
  if (state.watcher) {
    state.watcher.close();
    state.watcher = null;
    console.log('[Hotfolder] Watcher gestoppt');
  }
}

/**
 * Gibt den aktuellen Status des Watchers zurück
 */
export function getWatcherStatus(): WatcherStatus {
  return {
    isRunning: state.watcher !== null,
    hotfolderPath: CONFIG.HOTFOLDER_PATH,
    processedCount: state.processedCount,
    failedCount: state.failedCount,
    processingFiles: Array.from(state.isProcessing),
    lastActivity: state.lastActivity
  };
}
