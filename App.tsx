
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Header, Card } from './components/Layout';
import { FontProject } from './types';
import { subsetFont, arrayBufferToBase64 } from './services/fontProcessor';
import { analyzeFontProject } from './services/geminiService';

const Workspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('Type your subset text here...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      // Inject @font-face for preview
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'PreviewFont';
          src: url(${url});
        }
      `;
      document.head.appendChild(style);
    }
  };

  const handleProcess = async () => {
    if (!file || !text.trim()) return;
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const subsetUint8 = await subsetFont(buffer, text, file.name);
      const base64 = arrayBufferToBase64(subsetUint8);
      
      const aiAnalysis = await analyzeFontProject(file.name, text);

      const newProject: FontProject = {
        id: Math.random().toString(36).substring(2, 11),
        name: `${file.name.split('.')[0]}_subset`,
        originalFileName: file.name,
        subsetText: text,
        createdAt: Date.now(),
        fontData: base64,
        aiAnalysis: aiAnalysis
      };

      // Save to local storage
      const existing = JSON.parse(localStorage.getItem('font_projects') || '[]');
      localStorage.setItem('font_projects', JSON.stringify([newProject, ...existing]));

      setIsProcessing(false);
      navigate(`/project/${newProject.id}`);
    } catch (err) {
      console.error(err);
      alert('Error processing font. Ensure it is a valid TTF/OTF file.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <section className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900">Create a New Subset</h2>
        <p className="text-slate-500 max-w-xl mx-auto">Upload your font file and enter the specific characters you need. Our AI will analyze the font's personality while we extract the glyphs.</p>
      </section>

      <Card className="p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">1. Upload Font Source (TTF/OTF)</label>
          <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 transition-all hover:border-indigo-400 group flex flex-col items-center justify-center gap-4 bg-slate-50/50">
            <input 
              type="file" 
              accept=".ttf,.otf" 
              onChange={handleFileChange} 
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">{file ? file.name : 'Click or drag to upload'}</p>
              <p className="text-xs text-slate-400 mt-1">Maximum size 10MB</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">2. Subset Characters</label>
          <textarea 
            className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm"
            placeholder="Enter the characters you want to keep..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">3. Live Preview</label>
          <div className="p-6 rounded-xl border border-slate-100 bg-slate-50 min-h-[100px] flex items-center justify-center overflow-auto">
             <p className="text-4xl text-center break-words" style={{ fontFamily: previewUrl ? 'PreviewFont' : 'inherit' }}>
               {text || 'Preview will appear here'}
             </p>
          </div>
        </div>

        <button 
          onClick={handleProcess}
          disabled={!file || isProcessing || !text.trim()}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
            !file || isProcessing || !text.trim() 
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              AI Processing...
            </>
          ) : 'Generate Optimized Subset'}
        </button>
      </Card>
    </div>
  );
};

const ProjectHistory: React.FC = () => {
  const [projects, setProjects] = useState<FontProject[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('font_projects') || '[]');
    setProjects(saved);
  }, []);

  const deleteProject = (id: string) => {
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem('font_projects', JSON.stringify(filtered));
    setProjects(filtered);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Saved Projects</h2>
        <p className="text-sm text-slate-500">{projects.length} subsets generated</p>
      </div>
      
      {projects.length === 0 ? (
        <Card className="p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
          </div>
          <p className="text-slate-500">No subsets generated yet. Start by optimizing a font!</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Workspace</button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="hover:border-indigo-300 transition-colors group">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase">
                    {project.name.charAt(0)}
                  </div>
                  <button onClick={() => deleteProject(project.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 line-clamp-1">{project.name}</h3>
                  <p className="text-xs text-slate-400">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 italic">"{project.subsetText}"</p>
                <div className="pt-4 border-t border-slate-50 flex gap-2">
                  <button 
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="flex-1 py-2 bg-slate-100 rounded-lg text-slate-700 text-sm font-semibold hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectDetails: React.FC = () => {
  const [project, setProject] = useState<FontProject | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [tab, setTab] = useState<'preview' | 'code' | 'ai'>('preview');

  useEffect(() => {
    const id = window.location.hash.split('/').pop();
    const saved = JSON.parse(localStorage.getItem('font_projects') || '[]');
    const found = saved.find((p: any) => p.id === id);
    if (found) {
      setProject(found);
      
      // Inject the subsetted font for preview
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'SubsetFont-${found.id}';
          src: url(data:font/ttf;base64,${found.fontData});
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const downloadFont = () => {
    if (!project) return;
    const binary = window.atob(project.fontData);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([array], { type: 'font/ttf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.ttf`;
    a.click();
  };

  const copyCss = () => {
    if (!project) return;
    const css = `@font-face {
  font-family: '${project.name}';
  src: url('data:font/ttf;base64,${project.fontData.substring(0, 30)}...'); /* Truncated for display */
  font-display: swap;
}`;
    navigator.clipboard.writeText(css);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  if (!project) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl shadow-indigo-100">
               {project.name.charAt(0).toUpperCase()}
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
               <p className="text-sm text-slate-500 font-mono">ID: {project.id}</p>
             </div>
          </div>

          <div className="flex border-b border-slate-200">
             <button onClick={() => setTab('preview')} className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'preview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Visual Preview</button>
             <button onClick={() => setTab('code')} className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'code' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Integration Code</button>
             <button onClick={() => setTab('ai')} className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'ai' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>AI Analysis</button>
          </div>

          <Card className="min-h-[400px]">
             {tab === 'preview' && (
               <div className="p-10 flex items-center justify-center min-h-[400px]">
                 <p className="text-6xl text-center leading-relaxed" style={{ fontFamily: `SubsetFont-${project.id}` }}>
                   {project.subsetText}
                 </p>
               </div>
             )}
             {tab === 'code' && (
               <div className="p-6 space-y-6">
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-bold text-slate-700">Embedded Data URI (CSS)</span>
                     <button onClick={copyCss} className="text-xs font-semibold text-indigo-600 hover:underline">
                       {copyStatus === 'copied' ? 'Copied!' : 'Copy Snippet'}
                     </button>
                   </div>
                   <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-indigo-300 overflow-auto max-h-60">
                     <pre>
{`@font-face {
  font-family: '${project.name}';
  src: url('data:font/ttf;base64,${project.fontData.substring(0, 100)}...');
  font-display: swap;
}`}
                     </pre>
                   </div>
                   <p className="text-xs text-slate-400">Note: Data URIs are great for small subsets to avoid network requests.</p>
                 </div>
                 <div className="space-y-3">
                    <span className="text-sm font-bold text-slate-700">Remote Access Link (Mock API)</span>
                    <div className="flex gap-2">
                       <input readOnly value={`https://fontminify-ai.api/v1/fonts/${project.id}.ttf`} className="flex-1 bg-slate-100 border-none rounded-lg px-4 py-2 text-sm text-slate-600 font-mono" />
                       <button className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors">Copy Link</button>
                    </div>
                 </div>
               </div>
             )}
             {tab === 'ai' && (
               <div className="p-8 prose prose-slate max-w-none">
                 <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-indigo-900 whitespace-pre-wrap text-sm leading-relaxed">
                   {project.aiAnalysis}
                 </div>
               </div>
             )}
          </Card>
        </div>

        <div className="w-full md:w-80 space-y-6">
          <Card className="p-6 space-y-6 bg-slate-900 text-white border-none shadow-xl">
            <h3 className="font-bold text-lg">Actions</h3>
            <button 
              onClick={downloadFont}
              className="w-full py-4 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download .TTF
            </button>
            <div className="space-y-4 pt-4 border-t border-slate-800">
               <div className="flex justify-between text-xs">
                 <span className="text-slate-500">Subset Size</span>
                 <span className="text-green-400 font-mono">{(project.fontData.length * 0.75 / 1024).toFixed(1)} KB</span>
               </div>
               <div className="flex justify-between text-xs">
                 <span className="text-slate-500">Original Source</span>
                 <span className="text-slate-300 truncate ml-4">{project.originalFileName}</span>
               </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12" y1="8" y2="8"/></svg>
              Subsetting Info
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This font contains only the specific characters used in your input. All other glyphs, including kerning pairs for omitted characters, have been stripped to ensure maximum compression.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1 bg-slate-50">
          <Routes>
            <Route path="/" element={<Workspace />} />
            <Route path="/history" element={<ProjectHistory />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-8">
           <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
             &copy; 2024 FontMinify AI. Professional-grade font subsetting for the modern web.
           </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
