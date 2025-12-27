import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Layout, Palette, Loader2, Type, MousePointer2 } from 'lucide-react';
// @ts-ignore
import domToImage from 'dom-to-image-more'; 

const ScreenshotStudio: React.FC = () => {
  // --- 核心状态 ---
  const [image, setImage] = useState<string | null>(null);
  
  // 尺寸与样式
  const [padding, setPadding] = useState(64);
  const [windowWidth, setWindowWidth] = useState(1000); 
  const [windowHeight, setWindowHeight] = useState(800); 
  const [borderRadius, setBorderRadius] = useState(16);
  
  // 1. 修复：初始值现在完全匹配 "Medium" 选项的值，确保下拉菜单显示正确
  const [shadow, setShadow] = useState('0 25px 50px -12px rgba(0, 0, 0, 0.5)'); 
  
  // 背景色 (默认选第一个深蓝色)
  const [background, setBackground] = useState('#0f172a'); 

  // --- 文字编辑状态 ---
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(100); 
  const [textColor, setTextColor] = useState('#ffffff');
  const [textPos, setTextPos] = useState({ x: 50, y: 15 }); 
  
  const [isExporting, setIsExporting] = useState(false); 
  const exportRef = useRef<HTMLDivElement>(null);

  // --- 字体加载 ---
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;800&family=Playfair+Display:ital,wght@0,700;1,700&family=Oswald:wght@500&family=Dancing+Script:wght@700&family=Courier+Prime:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // --- 经典的 8 种背景 ---
  const gradients = [
    { name: 'Navy', value: '#0f172a' },
    { name: 'White', value: '#ffffff' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: 'linear-gradient(135deg, #c084fc 0%, #6366f1 100%)' },
    { name: 'Sunset', value: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' },
    { name: 'Pink', value: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
    { name: 'Black', value: '#000000' },
    { name: 'Cyan', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
  ];

  const fonts = [
    { name: 'Modern', value: "'Inter', sans-serif" },
    { name: 'Serif', value: "'Playfair Display', serif" },
    { name: 'Bold', value: "'Oswald', sans-serif" },
    { name: 'Hand', value: "'Dancing Script', cursive" },
    { name: 'Mono', value: "'Courier Prime', monospace" },
  ];
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader(); 
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- 优化后的下载逻辑 ---
  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsExporting(true); 

    await new Promise(resolve => setTimeout(resolve, 100)); 
        
    try {
        const node = exportRef.current;
        const scale = 2; 
        
        const dataUrl = await domToImage.toPng(node, {
            width: node.offsetWidth * scale,
            height: node.offsetHeight * scale,
            style: {
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${node.offsetWidth}px`,
                height: `${node.offsetHeight}px`,
                margin: 0, 
            },
            filter: (fnode: any) => !(fnode.tagName === 'BUTTON') 
        });
        
        const link = document.createElement('a');
        link.download = `brandshot-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed, please try again.");
    } finally {
      setIsExporting(false); 
    }
  };

  const windowBorderClass = shadow === 'none' ? 'border-2 border-black/30' : 'border border-black/10'; 
  const getRingColor = (bgValue: string) => bgValue === '#ffffff' ? 'ring-neutral-400' : 'ring-white';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans selection:bg-violet-500/30">
      
      {/* --- 左侧控制面板 --- */}
      <div className="w-full lg:w-96 bg-neutral-900 text-white border-r border-neutral-800 flex flex-col h-screen z-20 shadow-2xl shrink-0">
        
        <div className="p-6 border-b border-neutral-800 bg-neutral-900 sticky top-0 z-10">
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-500">
            BrandShot
            </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* 1. 图片上传 */}
            <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Upload size={14} /> Source
            </label>
            <label className="flex items-center justify-center w-full h-24 border border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition group">
                <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-neutral-800 rounded-full text-neutral-400 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition">
                    <Upload size={18} />
                </div>
                <span className="text-xs text-neutral-400 font-medium group-hover:text-violet-400 transition-colors">
                    {image ? 'Replace Image' : 'Click to Upload'}
                </span>
                </div>
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
            </div>

            {/* 2. 背景设置 (8色) */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                    <Palette size={14}/> Background
                </label>
                <div className="grid grid-cols-4 gap-3">
                    {gradients.map((g, i) => (
                        <button 
                            key={i}
                            title={g.name}
                            className={`w-full aspect-square rounded-full border border-white/10 shadow-sm transition-all hover:scale-110 active:scale-95 ${background === g.value ? `ring-2 ${getRingColor(g.value)} scale-110` : ''}`}
                            style={{ background: g.value }}
                            onClick={() => setBackground(g.value)}
                        />
                    ))}
                </div>
            </div>

            {/* 3. 尺寸与边距 */}
            <div className="space-y-6 border-t border-neutral-800 pt-6">
                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        <span className="flex items-center gap-2"><Layout size={14}/> Padding</span>
                        <span className="text-white">{padding}px</span>
                    </div>
                    <input type="range" min="0" max="200" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-500"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-500 font-bold uppercase">Width</label>
                        <input type="range" min="400" max="1600" value={windowWidth} onChange={(e) => setWindowWidth(Number(e.target.value))} className="w-full h-1.5 bg-neutral-700 rounded-lg accent-violet-500"/>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-neutral-500 font-bold uppercase">Height</label>
                        <input type="range" min="300" max="1200" value={windowHeight} onChange={(e) => setWindowHeight(Number(e.target.value))} className="w-full h-1.5 bg-neutral-700 rounded-lg accent-violet-500"/>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider">
                         <span>Radius</span>
                         <span className="text-white">{borderRadius}px</span>
                    </div>
                    <input type="range" min="0" max="40" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full h-1.5 bg-neutral-700 rounded-lg accent-violet-500"/>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Shadow</label>
                    <select 
                        value={shadow} 
                        onChange={(e) => setShadow(e.target.value)} 
                        className="w-full bg-neutral-800 border border-neutral-700 text-xs p-2.5 rounded-lg text-neutral-200 focus:border-violet-500 outline-none"
                    >
                        <option value="none">No Shadow</option>
                        <option value="0 10px 15px rgba(0, 0, 0, 0.2)">Soft</option>
                        {/* 这里的 value 必须和 useState 初始值一模一样 */}
                        <option value="0 25px 50px -12px rgba(0, 0, 0, 0.5)">Medium</option>
                        <option value="0 50px 70px -12px rgba(0, 0, 0, 0.7)">Heavy</option>
                    </select>
                </div>
            </div>

            {/* 4. 文字编辑器 */}
            <div className="space-y-4 border-t border-neutral-800 pt-6">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                    <Type size={14}/> Text Overlay
                </label>
                
                <input 
                    type="text" 
                    placeholder="Enter title (e.g. New Feature)" 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none placeholder-neutral-600"
                />

                <div className="grid grid-cols-2 gap-2">
                    <select 
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-2 text-xs text-white focus:border-violet-500 outline-none"
                    >
                        {fonts.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
                    </select>
                    <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-lg px-2" title="Text Color">
                        <input 
                            type="color" 
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-6 h-6 bg-transparent border-none cursor-pointer"
                        />
                        <span className="text-xs text-neutral-400">Color</span>
                    </div>
                </div>

                <div className="space-y-2">
                     <div className="flex justify-between text-xs text-neutral-500">
                        <span>Size</span>
                        <span>{fontSize}px</span>
                     </div>
                     <input type="range" min="20" max="300" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full h-1.5 bg-neutral-700 rounded-lg accent-violet-500"/>
                </div>

                <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                        <MousePointer2 size={14} /> Position (X / Y)
                    </label>
                    <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-500 w-4">X</span>
                            <input type="range" min="0" max="100" value={textPos.x} onChange={(e) => setTextPos({...textPos, x: Number(e.target.value)})} className="flex-1 h-1.5 bg-neutral-700 rounded-lg accent-violet-500"/>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-500 w-4">Y</span>
                            <input type="range" min="0" max="100" value={textPos.y} onChange={(e) => setTextPos({...textPos, y: Number(e.target.value)})} className="flex-1 h-1.5 bg-neutral-700 rounded-lg accent-violet-500"/>
                         </div>
                    </div>
                </div>
            </div>
            
            <div className="h-12"/> 
        </div>
      </div>

      {/* --- 右侧预览区域 (浅灰+棋盘格) --- */}
      <div className="flex-1 bg-neutral-200 relative overflow-hidden flex flex-col">
         
         <div className="absolute inset-0 opacity-40 pointer-events-none" 
              style={{ 
                  backgroundImage: 'linear-gradient(45deg, #d4d4d4 25%, transparent 25%), linear-gradient(-45deg, #d4d4d4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d4 75%), linear-gradient(-45deg, transparent 75%, #d4d4d4 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}>
         </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-10 relative">
             
            {/* 导出容器 */}
            <div 
            ref={exportRef}
            style={{ 
                width: `${windowWidth + padding * 2}px`,
                minHeight: `${windowHeight + padding * 2}px`,
                padding: `${padding}px`, 
                background: background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxSizing: 'border-box' 
            }}
            className="transition-all duration-300 ease-out shadow-xl shrink-0"
            >
                {/* 文字层 (修复了白框问题) */}
                {text && (
                    <div 
                        style={{
                            position: 'absolute',
                            left: `${textPos.x}%`,
                            top: `${textPos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            color: textColor,
                            fontFamily: fontFamily,
                            fontSize: `${fontSize}px`,
                            textAlign: 'center',
                            zIndex: 50, 
                            whiteSpace: 'pre',
                            lineHeight: 1,
                            pointerEvents: 'none',
                            width: '100%',
                            background: 'transparent', // 确保透明
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            textShadow: '0 10px 30px rgba(0,0,0,0.3)'
                        }}
                    >
                        {text}
                    </div>
                )}

                {/* 窗口主体 */}
                <div 
                style={{ 
                    width: `${windowWidth}px`, 
                    height: `${windowHeight}px`, 
                    borderRadius: `${borderRadius}px`, 
                    boxShadow: shadow, 
                }}
                className={`bg-white relative overflow-hidden flex flex-col ${windowBorderClass} z-10`}
                >
                    <div className="h-10 bg-white border-b border-black/5 flex items-center px-4 gap-2 shrink-0 select-none">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"/>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"/>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"/>
                    </div>

                    <div className="flex-1 w-full h-full bg-neutral-50 flex items-center justify-center relative overflow-hidden">
                        {image ? (
                            <img src={image} alt="Preview" className="w-full h-full object-contain"/>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-neutral-400 gap-3">
                                <Upload size={48} className="text-neutral-300"/>
                                <p className="font-medium text-neutral-400">Upload Image</p>
                            </div>
                        )}
                    </div>
                </div> 
            </div> 
        </div>
      </div>

      <button 
        onClick={handleDownload}
        disabled={isExporting || !image}
        className="fixed bottom-8 right-8 bg-black text-white hover:bg-neutral-800 font-bold px-8 py-3 rounded-full shadow-2xl transition transform hover:-translate-y-1 flex items-center gap-2 z-50 border border-neutral-700"
      >
        {isExporting ? <Loader2 size={20} className="animate-spin"/> : <Download size={20}/>}
        {isExporting ? 'Exporting...' : 'Download PNG'}
      </button>
    </div>
  );
};

export default ScreenshotStudio;
