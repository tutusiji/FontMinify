
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import db, { STORAGE_DIR } from '@/lib/db';
import { generateSubset } from '@/lib/font-utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const text = formData.get('text') as string;
    const existingId = formData.get('id') as string;

    if (!file && !existingId) {
      return NextResponse.json({ error: '请上传字体文件或选择一个项目' }, { status: 400 });
    }

    const id = existingId || crypto.randomBytes(8).toString('hex');
    const projectDir = path.join(STORAGE_DIR, id);
    if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

    let buffer: Buffer;
    let fileName: string;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      fileName = file.name;
      fs.writeFileSync(path.join(projectDir, 'original.ttf'), buffer);
    } else {
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
      if (!project) throw new Error('项目不存在');
      buffer = fs.readFileSync(path.join(projectDir, 'original.ttf'));
      fileName = project.original_filename;
    }

    const subsetBuffer = await generateSubset(buffer, text, fileName.split('.')[0]);
    fs.writeFileSync(path.join(projectDir, 'subset.ttf'), subsetBuffer);

    const statement = db.prepare(`
      INSERT INTO projects (id, name, original_filename, subset_text, original_size, subset_size, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        subset_text = excluded.subset_text,
        subset_size = excluded.subset_size,
        updated_at = CURRENT_TIMESTAMP
    `);

    statement.run(id, fileName.split('.')[0], fileName, text, buffer.length, subsetBuffer.length);

    return NextResponse.json({ id, success: true });
  } catch (error: any) {
    console.error('Subsetting error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
