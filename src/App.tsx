import React, { useState, useRef } from 'react';
import { 
  Upload, Download, Layout, Palette, 
  Loader2, Image as ImageIcon, Layers, 
  Maximize, MoveHorizontal, MoveVertical,
  Square
} from 'lucide-react';
// @ts-ignore
import domToImage from 'dom-to-image-more'; 

// --- 渐变背景配置 ---
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
  
  // 核心样式状态
  const [gradient, setGradient] = useState(GRADIENTS[2].value);
  
  // 恢复：长宽边距分开调整
  const [paddingX, setPaddingX] = useState(64); 
  const [paddingY, setPaddingY] = useState(64);
  
  const [rounded, setRounded] = useState(16);
  const [shadow, setShadow] = useState(0.4); // 阴影浓度
  
  // 新增：窗口描边开关（解决白色背景看不清问题）
  const [showBorder, setShowBorder] = useState(true);
  
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
        scale: 3 // 保持高清
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
                <p className="text-xs text-neutral-400 font-medium group-hover:text-white transition-colors">Click to Upload Image</p>
              </div>
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            </label>
          </section>

          {/* 背景选择 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-widest">
              <Palette size={12} />
              <span>Background</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g.name}
                  onClick={() => setGradient(g.value)}
                  className={`h-8 rounded-md transition-all border ${gradient === g.value ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ background: g.value }}
                  title={g.name}
                />
              ))}
            </div>
          </section>

          {/* 尺寸调节区域 */}
          <div className="space-y-6 border-t border-white/5 pt-6">
            
            {/* 水平边距 */}
            <section className="space-y-3">
              <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <MoveHorizontal size={12} />
                  <span>Padding X</span>
                </div>
                <span className="text-white font-mono">{paddingX}px</span>
              </div>
              <input 
                type="range" min="0" max="150" value={paddingX} 
                onChange={(e) => setPaddingX(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </section>

            {/* 垂直边距 */}
            <section className="space-y-3">
              <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <MoveVertical size={12} />
                  <span>Padding Y</span>
                </div>
                <span className="text-white font-mono">{paddingY}px</span>
              </div>
              <input 
                type="range" min="0" max="150" value={paddingY} 
                onChange={(e) => setPaddingY(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </section>

            {/* 圆角 */}
            <section className="space-y-3">
              <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Layers size={12} />
                  <span>Rounding</span>
                </div>
                <span className="text-white font-mono">{rounded}px</span>
              </div>
              <input 
                type="range" min="0" max="60" value={rounded} 
                onChange={(e) => setRounded(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </section>

            {/* 阴影与描边 */}
            <section className="space-y-4">
              <div className="flex justify-between items-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Maximize size={12} />
                  <span>Shadow Depth</span>
                </div>
                <span className="text-white font-mono">{Math.round(shadow * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05" value={shadow} 
                onChange={(e) => setShadow(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
              
              {/* 描边开关 */}
              <button 
                onClick={() => setShowBorder(!showBorder)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${showBorder ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-neutral-500 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-2">
                  <Square size={14} />
                  <span>Window Border</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${showBorder ? 'bg-green-500' : 'bg-neutral-600'}`} />
              </button>
            </section>

          </div>
        </div>

        {/* 右侧预览区 */}
        <div className="flex-1 bg-[#050505] p-12 flex items-center justify-center overflow-auto relative">
          <div 
            ref={containerRef}
            className="transition-all duration-200 ease-out flex items-center justify-center min-w-[100px]"
            style={{ 
              background: gradient,
              padding: `${paddingY}px ${paddingX}px`, // 修复：长宽分开应用
            }}
          >
            {/* 图片容器 */}
            <div 
              className="relative transition-all duration-200 overflow-hidden bg-white"
              style={{ 
                borderRadius: `${rounded}px`,
                // 修复阴影逻辑：让阴影更柔和自然
                boxShadow: `0 20px 50px -10px rgba(0,0,0,${shadow}), 0 10px 20px -10px rgba(0,0,0,${shadow * 0.5})`,
                // 修复白色背景看不清：添加可选的细边框
                border: showBorder ? '1px solid rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {image ? (
                <img 
                  src={image} 
                  alt="Preview" 
                  className="block w-full h-auto max-h-[800px] max-w-full object-contain"
                  // 移除任何可能的 padding，让图片完全贴合
                  style={{ display: 'block' }} 
                />
              ) : (
                <div className="w-[500px] h-[300px] flex flex-col items-center justify-center text-neutral-400 gap-3 bg-neutral-900">
                  <ImageIcon size={40} className="opacity-20"/>
                  <p className="text-sm font-medium">Please upload an image</p>
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
