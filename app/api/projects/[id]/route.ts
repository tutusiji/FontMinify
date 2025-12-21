
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import db, { STORAGE_DIR } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    // 1. 从数据库中删除
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    // 2. 从文件系统中删除
    const projectDir = path.join(STORAGE_DIR, id);
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
