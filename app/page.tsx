
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Code, Plus, Save, Trash2, Copy, Check, RefreshCw, FileType } from 'lucide-react';

export default function SinglePageWorkspace() {
  // 状态管理
  const [projects, setProjects] = useState<any[]>([]);
  const [text, setText] = useState('你好，世界！FontMinify Pro 123');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewFontFamily, setPreviewFontFamily] = useState<string>('inherit');

  // 初始化
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
  };

  // 处理文件上传预览
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      const fontName = `TempFont-${Math.random().toString(36).slice(2, 7)}`;
      
      const style = document.createElement('style');
      style.textContent = `@font-face { font-family: '${fontName}'; src: url(${url}); }`;
      document.head.appendChild(style);
      setPreviewFontFamily(fontName);
      setCurrentProjectId(null); // 重置为新项目
    }
  };

  // 执行生成
  const handleGenerate = async () => {
    if (!text || (!file && !currentProjectId)) return;
    setIsProcessing(true);
    
    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('text', text);
    if (currentProjectId) formData.append('id', currentProjectId);

    try {
      const res = await fetch('/api/subset', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        await fetchProjects();
        // 注入新生成的子集字体用于预览
        const fontName = `Subset-${data.id}`;
        const style = document.createElement('style');
        style.textContent = `@font-face { font-family: '${fontName}'; src: url('/api/fonts/${data.id}?t=${Date.now()}'); }`;
        document.head.appendChild(style);
        setPreviewFontFamily(fontName);
        setCurrentProjectId(data.id);
        setFile(null); // 清理原始文件状态，进入编辑模式
      }
    } catch (err) {
      alert('生成失败，请检查字体格式或内网连接');
    } finally {
      setIsProcessing(false);
    }
  };

  // 删除项目
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个字体项目吗？')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      setPreviewFontFamily('inherit');
    }
    fetchProjects();
  };

  // 复制链接
  const copyLink = (id: string) => {
    const url = `${window.location.origin}/api/fonts/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 加载已有项目
  const loadProject = (project: any) => {
    setCurrentProjectId(project.id);
    setText(project.subset_text);
    setFile(null);
    const fontName = `Subset-${project.id}`;
    const style = document.createElement('style');
    style.textContent = `@font-face { font-family: '${fontName}'; src: url('/api/fonts/${project.id}'); }`;
    document.head.appendChild(style);
    setPreviewFontFamily(fontName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-slate-200 h-14 shrink-0 flex items-center px-6 justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded text-white"><FileType size={18} /></div>
          <h1 className="font-bold text-slate-900 tracking-tight text-sm md:text-base">FontMinify <span className="text-indigo-600">Workspace</span></h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="bg-slate-100 px-2 py-1 rounded">SQLite Mode</span>
          <span className="bg-slate-100 px-2 py-1 rounded">Intranet Ready</span>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 左侧：输入控制区 */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">1. 字体源文件</label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:border-indigo-400 transition-all group cursor-pointer">
                  <input type="file" accept=".ttf,.otf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <Upload size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                      {file ? file.name : (currentProjectId ? projects.find(p => p.id === currentProjectId)?.original_filename : '点击或拖拽上传')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase">TTF / OTF (MAX 50MB)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">2. 提取字符范围</label>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-48 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all font-mono text-sm leading-relaxed resize-none"
                  placeholder="在此输入需要提取的文字..."
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isProcessing || (!file && !currentProjectId) || !text}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                  isProcessing ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.98]'
                }`}
              >
                {isProcessing ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                {isProcessing ? '正在处理字体...' : (currentProjectId ? '更新并重新生成' : '立即提取子集')}
              </button>
            </section>
          </div>

          {/* 右侧：实时预览与结果区 */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-slate-900 rounded-2xl p-8 shadow-xl min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Live Preview
                </h3>
                {currentProjectId && (
                  <div className="flex gap-2">
                    <button onClick={() => copyLink(currentProjectId)} className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full font-bold transition-colors flex items-center gap-1.5">
                      {copiedId === currentProjectId ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === currentProjectId ? '已复制' : '复制 API'}
                    </button>
                    <a href={`/api/fonts/${currentProjectId}`} download className="text-[10px] bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded-full font-bold transition-colors flex items-center gap-1.5">
                      <Download size={12} /> 下载 .TTF
                    </a>
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <p 
                  className="text-white text-center break-all transition-all duration-500"
                  style={{ 
                    fontFamily: previewFontFamily,
                    fontSize: text.length > 20 ? '2rem' : '4rem',
                    lineHeight: '1.4'
                  }}
                >
                  {text || '请输入文字查看效果'}
                </p>
              </div>
            </section>

            {/* 历史管理列表 */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">历史生成的子集 ({projects.length})</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                {projects.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => loadProject(p)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                      currentProjectId === p.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 ${
                        currentProjectId === p.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'
                      }`}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{Math.round(p.subset_size/1024)}KB · {new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); copyLink(p.id); }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(p.id, e)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="py-10 text-center text-slate-400 text-xs italic">
                    暂无生成记录，请在左侧开始
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
