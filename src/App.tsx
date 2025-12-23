import React, { useState, useRef } from 'react';
import { 
  Upload, Download, Layout, Palette, 
  Loader2, Image as ImageIcon, Layers 
} from 'lucide-react';
// @ts-ignore
import domToImage from 'dom-to-image-more'; 
import { motion } from 'framer-motion';

// --- 类型定义 ---
type GradientOption = {
  name: string;
  value: string;
};

// --- 配置数据 ---
// 所有背景现在都是免费可用的
const GRADIENTS: GradientOption[] = [
  { name: 'Midnight', value: '#0f172a' },
  { name: 'Clean White', value: '#ffffff' },
  { name: 'Oceanic', value: 'linear-gradient(to right bottom, #3b82f6, #6366f1)' },
  { name: 'Sunset', value: 'linear-gradient(to right bottom, #f43f5e, #1d4ed8)' },
  { name: 'Gold Dust', value: 'linear-gradient(to right bottom, #fbbf24, #ef4444)' },
  { name: 'Neon Cyber', value: 'linear-gradient(to right, #f472b6, #d946ef, #8b5cf6)' },
  { name: 'Deep Sea', value: 'linear-gradient(to right, #000000, #434343)' },
  { name: 'Aurora', value: 'linear-gradient(to bottom right, #00f2fe, #4facfe)' },
];

const PADDINGS = [
  { name: 'Small', value: 'p-8' },
  { name: 'Medium', value: 'p-16' },
  { name: 'Large', value: 'p-24' },
  { name: 'Extra', value: 'p-32' }
];

const ROUNDED = [
  { name: 'None', value: 'rounded-none' },
  { name: 'Small', value: 'rounded-lg' },
  { name: 'Large', value: 'rounded-3xl' },
  { name: 'Full', value: 'rounded-[3rem]' }
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [gradient, setGradient] = useState(GRADIENTS[0].value);
  const [padding, setPadding] = useState(PADDINGS[1].value);
  const [rounded, setRounded] = useState(ROUNDED[2].value);
  const [isExporting, setIsExporting] = useState(false);
  const [shadow, setShadow] = useState('shadow-2xl');

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
        scale: 2
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
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm" />
          </div>
          <span className="font-bold tracking-tight text-lg">BrandShot</span>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧控制栏 */}
        <div className="w-80 border-r border-white/5 bg-[#0a0a0a] overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
          
          {/* 上传区域 */}
          <section>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload size={24} className="text-neutral-500 group-hover:text-white transition-colors mb-2" />
                <p className="text-sm text-neutral-400 font-medium">Click to upload</p>
              </div>
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            </label>
          </section>

          {/* 背景设置 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm font-bold uppercase tracking-widest">
              <Palette size={14} />
              <span>Background</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {GRADIENTS.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setGradient(g.value)}
                  className={`h-10 rounded-lg transition-all border-2 ${gradient === g.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                  style={{ background: g.value }}
                  title={g.name}
                />
              ))}
            </div>
          </section>

          {/* 边距设置 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm font-bold uppercase tracking-widest">
              <Layout size={14} />
              <span>Padding</span>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl">
              {PADDINGS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPadding(p.value)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${padding === p.value ? 'bg-white text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </section>

          {/* 圆角设置 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-neutral-400 text-sm font-bold uppercase tracking-widest">
              <Layers size={14} />
              <span>Rounded</span>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl">
              {ROUNDED.map((r) => (
                <button
                  key={r.name}
                  onClick={() => setRounded(r.value)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${rounded === r.value ? 'bg-white text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* 右侧预览区 */}
        <div className="flex-1 bg-[#050505] p-12 flex items-center justify-center overflow-auto relative">
          <div 
            ref={containerRef}
            className={`transition-all duration-500 ease-out ${padding} min-w-[400px] flex items-center justify-center`}
            style={{ background: gradient }}
          >
            <div className={`relative group transition-all duration-500 ${rounded} ${shadow} overflow-hidden bg-black/10 backdrop-blur-sm`}>
              {image ? (
                <img 
                  src={image} 
                  alt="Preview" 
                  className="max-w-[800px] block w-full h-auto"
                  style={{ objectFit: 'contain' }} 
                />
              ) : (
                <div className="w-[600px] h-[400px] flex flex-col items-center justify-center text-neutral-400 gap-3 border border-white/5 bg-white/[0.02]">
                  <ImageIcon size={48} className="text-neutral-800 animate-pulse"/>
                  <p className="font-medium text-neutral-500">Upload an image to get started</p>
                </div>
              )}
            </div>
          </div> 
        </div> 
      </div>

      {/* 悬浮导出按钮 */}
      <button 
        onClick={handleDownload}
        disabled={isExporting || !image}
        className="fixed bottom-8 right-8 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 font-bold px-8 py-4 rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center gap-3 z-50 group"
      >
        {isExporting ? <Loader2 size={20} className="animate-spin"/> : <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />}
        <span>{isExporting ? 'Exporting...' : 'Download Image'}</span>
      </button>

    </div>
  );
}
