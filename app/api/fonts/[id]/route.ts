
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { STORAGE_DIR } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const filePath = path.join(STORAGE_DIR, id, 'subset.ttf');

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Font not found' }, { status: 404 });
  }

  const fontBuffer = fs.readFileSync(filePath);
  
  return new NextResponse(fontBuffer, {
    headers: {
      'Content-Type': 'font/ttf',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
