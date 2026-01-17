/**
 * XOS Import API
 *
 * POST /api/import - Importiert XML-Datei in die Datenbank
 *
 * Body: FormData mit 'file' (XML-Datei) oder JSON mit 'xml' (String)
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseXML, summarizeAuftrag } from '@/lib/xml-parser';
import { importAuftrag } from '@/lib/import-service';

// Max file size: 50MB (Sample XMLs sind ~100-200KB, aber großzügig für komplexe Aufträge)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    let xmlContent: string;

    const contentType = request.headers.get('content-type') || '';

    // Check content-length header for size limit
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 413 }
      );
    }

    // Handle different content types
    if (contentType.includes('multipart/form-data')) {
      // File upload
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 50MB.' },
          { status: 413 }
        );
      }

      xmlContent = await file.text();
    } else if (contentType.includes('application/json')) {
      // JSON with XML string
      const body = await request.json();
      xmlContent = body.xml;

      if (!xmlContent) {
        return NextResponse.json({ error: 'No XML content provided' }, { status: 400 });
      }
    } else {
      // Raw XML
      xmlContent = await request.text();

      // Check size for raw XML (content-length header may not be set)
      if (xmlContent.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 50MB.' },
          { status: 413 }
        );
      }
    }

    if (!xmlContent.trim()) {
      return NextResponse.json({ error: 'Empty XML content' }, { status: 400 });
    }

    // Parse XML
    console.log('Parsing XML...');
    const parsed = parseXML(xmlContent);
    console.log('Parsed:', summarizeAuftrag(parsed));

    // Import to database
    console.log('Importing to database...');
    const result = await importAuftrag(parsed);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, auftragsnummer: result.auftragsnummer },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      auftragsnummer: result.auftragsnummer,
      isUpdate: result.isUpdate,
      arbeitsgaengeCount: result.arbeitsgaengeCount,
      maschinenCreated: result.maschinenCreated,
      message: result.isUpdate
        ? `Auftrag ${result.auftragsnummer} aktualisiert`
        : `Auftrag ${result.auftragsnummer} importiert`,
    });
  } catch (error) {
    console.error('Import API error:', error);

    // Only show stack traces in development
    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Import fehlgeschlagen',
        ...(isDev && {
          details: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/import - Zeigt Import-Status und Hilfe
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/import',
    method: 'POST',
    description: 'Importiert Prinance XML-Dateien in die XOS-Datenbank',
    usage: {
      multipart: 'FormData mit file=<XML-Datei>',
      json: 'JSON mit { xml: "<XML-String>" }',
      raw: 'Raw XML im Body mit Content-Type: application/xml',
    },
    example: 'curl -X POST -F "file=@GP25-7647.xml" http://localhost:3000/api/import',
  });
}
