
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
