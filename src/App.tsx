import React, { useState, useRef } from 'react';
import { 
  Upload, Download, Layout, Palette, 
  Loader2, Image as ImageIcon, Layers, Maximize
} from 'lucide-react';
// @ts-ignore
import domToImage from 'dom-to-image-more'; 

// --- 配置数据 ---
const GRADIENTS = [
  { name: 'Midnight', value: '#0f172a' },
  { name: 'Clean White', value: '#ffffff' },
  { name: 'Oceanic', value: 'linear-gradient(to right bottom, #3b82f6, #6366f1)' },
  { name: 'Sunset', value: 'linear-gradient(to right bottom, #f43f5e, #1d4ed8)' },
  { name: 'Gold Dust', value: 'linear-gradient(to right bottom, #fbbf24, #ef4444)' },
  { name: 'Neon Cyber', value: 'linear-gradient(to right, #f472b6, #d946ef, #8b5cf6)' },
  { name: 'Deep Sea', value: 'linear-gradient(to right, #000000, #434343)' },
  { name: 'Aurora', value: 'linear-gradient(to bottom right, #00f2fe, #4facfe)' },
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [gradient, setGradient] = useState(GRADIENTS[2].value);
  const [padding, setPadding] = useState(64); // 默认边距
  const [rounded, setRounded] = useState(24); // 默认圆角
  const [shadowOpacity, setShadowOpacity] = useState(0.3); // 默认阴影深浅
  const [isExporting, setIsExporting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await domToImage.toPng(containerRef.current, {
        quality: 1,
        scale: 3 // 高清导出
      });
      const link = document.createElement('a');
      link.download = `brandshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-white/20">
      
      {/* 顶部导航 */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <span className="font-bold tracking-tight text-lg">BrandShot Studio</span>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧控制栏 */}
        <div className="w-80 border-r border-white/5 bg-[#0a0a0a] overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
          
          {/* 上传区域 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-widest">
              <Upload size={12} />
              <span>Image Source</span>
            </div>
            <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/10 rounded-xl hover:border-white/30 hover:bg-white/[0.02] transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs text-neutral-400 font-medium group-hover:text-white transition-colors">Choose Image</p>
              </div>
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            </label>
          </section>

          {/* 背景选择 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-widest">
              <Palette size={12} />
              <span>Background Style</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setGradient(g.value)}
                  className={`h-8 rounded-md transition-all border ${gradient === g.value ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ background: g.value }}
                />
              ))}
            </div>
          </section>

          {/* 边距滑块 */}
          <section className="space-y-4">
            <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Layout size={12} />
                <span>Padding</span>
              </div>
              <span className="text-white font-mono">{padding}px</span>
            </div>
            <input 
              type="range" min="0" max="128" value={padding} 
              onChange={(e) => setPadding(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </section>

          {/* 圆角滑块 */}
          <section className="space-y-4">
            <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Layers size={12} />
                <span>Rounding</span>
              </div>
              <span className="text-white font-mono">{rounded}px</span>
            </div>
            <input 
              type="range" min="0" max="80" value={rounded} 
              onChange={(e) => setRounded(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </section>

          {/* 阴影深浅 */}
          <section className="space-y-4">
            <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Maximize size={12} />
                <span>Shadow</span>
              </div>
              <span className="text-white font-mono">{(shadowOpacity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.1" value={shadowOpacity} 
              onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </section>
        </div>

        {/* 右侧预览区 */}
        <div className="flex-1 bg-[#050505] p-12 flex items-center justify-center overflow-auto relative">
          <div 
            ref={containerRef}
            className="transition-all duration-300 ease-out flex items-center justify-center"
            style={{ 
              background: gradient,
              padding: `${padding}px`
            }}
          >
            <div 
              className="relative transition-all duration-300 overflow-hidden bg-black/5"
              style={{ 
                borderRadius: `${rounded}px`,
                boxShadow: `0 25px 50px -12px rgba(0,0,0,${shadowOpacity})`
              }}
            >
              {image ? (
                <img src={image} alt="Preview" className="max-w-[800px] block w-full h-auto" />
              ) : (
                <div className="w-[500px] h-[300px] flex flex-col items-center justify-center text-neutral-600 gap-3 bg-white/5 border border-white/5">
                  <ImageIcon size={40} className="opacity-20"/>
                  <p className="text-sm">Upload a screenshot</p>
                </div>
              )}
            </div>
          </div> 
        </div> 
      </div>

      {/* 导出按钮 */}
      <button 
        onClick={handleDownload}
        disabled={isExporting || !image}
        className="fixed bottom-8 right-8 bg-white text-black hover:scale-105 active:scale-95 disabled:bg-neutral-800 disabled:text-neutral-500 font-bold px-6 py-3 rounded-xl shadow-2xl transition-all flex items-center gap-2 z-50 group"
      >
        {isExporting ? <Loader2 size={18} className="animate-spin"/> : <Download size={18} />}
        <span>Download PNG</span>
      </button>

    </div>
  );
}
