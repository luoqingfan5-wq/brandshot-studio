import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Layout, Palette, Loader2, Type, Move } from 'lucide-react';
// @ts-ignore
import domToImage from 'dom-to-image-more'; 

const ScreenshotStudio: React.FC = () => {
  // --- 核心状态 ---
  const [image, setImage] = useState<string | null>(null);
  
  // 尺寸与样式
  const [padding, setPadding] = useState(64);
  const [windowWidth, setWindowWidth] = useState(800); 
  const [windowHeight, setWindowHeight] = useState(600); 
  const [borderRadius, setBorderRadius] = useState(16);
  const [shadow, setShadow] = useState('0 20px 25px rgba(0, 0, 0, 0.3)'); 
  
  // 背景色状态（默认给一个好看的蓝色渐变）
  const [background, setBackground] = useState('linear-gradient(to right bottom, #3b82f6, #6366f1)'); 

  // --- 新增：文字编辑状态 ---
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textPos, setTextPos] = useState({ x: 50, y: 15 }); // 百分比坐标 (50% 15% 默认在顶部居中)
  
  const [isExporting, setIsExporting] = useState(false); 
  const exportRef = useRef<HTMLDivElement>(null);

  // --- 字体加载 ---
  // 在组件加载时引入 Google Fonts，确保导出时字体有效
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;800&family=Playfair+Display:ital,wght@0,700;1,700&family=Oswald:wght@500&family=Dancing+Script:wght@700&family=Courier+Prime:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // --- 背景列表 (包含你要求的黑灰和青色) ---
  const gradients = [
    // 1. 纯白
    { name: 'White', value: '#ffffff' },
    // 2. 黑灰渐变 (你要求的)
    { name: 'Midnight', value: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)' },
    // 3. 青色渐变 (你要求的)
    { name: 'Cyan', value: 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%)' },
    // 4. 经典蓝紫
    { name: 'Blue', value: 'linear-gradient(to right bottom, #3b82f6, #6366f1)' },
    // 5. 红蓝夕阳
    { name: 'Sunset', value: 'linear-gradient(to right bottom, #f43f5e, #1d4ed8)' },
    // 6. 金红
    { name: 'Gold', value: 'linear-gradient(to right bottom, #fbbf24, #ef4444)' },
  ];

  // 字体列表
  const fonts = [
    { name: 'Modern (Inter)', value: "'Inter', sans-serif" },
    { name: 'Serif (Playfair)', value: "'Playfair Display', serif" },
    { name: 'Bold (Oswald)', value: "'Oswald', sans-serif" },
    { name: 'Hand (Script)', value: "'Dancing Script', cursive" },
    { name: 'Mono (Courier)', value: "'Courier Prime', monospace" },
  ];
  
  // 图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader(); 
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 下载逻辑 (保持老代码的稳定性)
  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsExporting(true); 

    await new Promise(resolve => setTimeout(resolve, 50)); 
        
    try {
        const node = exportRef.current;
        const shadowOffset = 50; 
        const originalWidth = node.offsetWidth;
        const originalHeight = node.offsetHeight;
        
        const dataUrl = await domToImage.toPng(node, {
            width: originalWidth + shadowOffset * 2,
            height: originalHeight + shadowOffset * 2,
            style: {
                'object-fit': 'contain', 
                'overflow': 'hidden', 
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
            },
            bgcolor: null,
            filter: (fnode: any) => !(fnode.tagName === 'BUTTON' && fnode.className?.includes?.('fixed')) 
        });
        
        const link = document.createElement('a');
        link.download = `brandshot-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false); 
    }
  };

  const windowBorderClass = shadow === 'none' ? 'border-2 border-black/30' : 'border border-black/10'; 

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row font-sans selection:bg-violet-500/30">
      
      {/* --- 左侧控制面板 --- */}
      <div className="w-full lg:w-96 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen z-20 shadow-2xl">
        
        {/* 标题 */}
        <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-500">
            BrandShot
            </h1>
        </div>

        {/* 可滚动区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* 1. 图片上传 */}
            <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Upload size={14} /> Source
            </label>
            <label className="flex items-center justify-center w-full h-20 border border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition group">
                <div className="flex flex-col items-center">
                <span className="text-xs text-neutral-400 font-medium group-hover:text-violet-400 transition-colors">
                    {image ? 'Replace Image' : 'Upload Screenshot'}
                </span>
                </div>
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
            </div>

            {/* 2. 背景设置 */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                    <Palette size={14}/> Background
                </label>
                <div className="grid grid-cols-6 gap-2">
                    {gradients.map((g, i) => (
                        <button 
                            key={i}
                            title={g.name}
                            className={`w-full aspect-square rounded-full border-2 transition-transform hover:scale-110 ${background === g.value ? 'border-white ring-2 ring-white/20 scale-110' : 'border-transparent'}`}
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
                        <input type="range" min="300" max="1400" value={windowWidth} onChange={(e) => setWindowWidth(Number(e.target.value))} className="w-full h-1.5 bg-neutral-700 rounded-lg accent-violet-500"/>
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
                        <option value="0 20px 25px rgba(0, 0, 0, 0.3)">Medium</option>
                        <option value="0 40px 60px rgba(0, 0, 0, 0.6)">Heavy</option>
                    </select>
                </div>
            </div>

            {/* 4. 新增：文字编辑器 */}
            <div className="space-y-4 border-t border-neutral-800 pt-6">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                    <Type size={14}/> Text Overlay
                </label>
                
                {/* 文字输入 */}
                <input 
                    type="text" 
                    placeholder="Enter title here..." 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500 outline-none placeholder-neutral-600"
                />

                {/* 字体与颜色 */}
                <div className="grid grid-cols-2 gap-2">
                    <select 
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-2 text-xs text-white focus:border-violet-500 outline-none"
                    >
                        {fonts.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
                    </select>
                    <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded-lg px-2">
                        <input 
                            type="color" 
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-6 h-6 bg-transparent border-none cursor-pointer"
                        />
                        <span className="text-xs text-neutral-400">{textColor}</span>
                    </div>
                </div>

                {/* 文字大小 */}
                <div className="space-y-2">
                     <div className="flex justify-between text-xs text-neutral-500">
                        <span>Size</span>
                        <span>{fontSize}px</span>
                     </div>
                     <input type="range" min="12" max="200" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full h-1.5 bg-neutral-700 rounded-lg accent-violet-500"/>
                </div>

                {/* 文字位置控制 */}
                <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                        <Move size={14}/> Position
                    </label>
                    <div className="space-y-2">
                         <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-600 w-4">X</span>
                            <input type="range" min="0" max="100" value={textPos.x} onChange={(e) => setTextPos({...textPos, x: Number(e.target.value)})} className="flex-1 h-1.5 bg-neutral-700 rounded-lg accent-violet-500"/>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-600 w-4">Y</span>
                            <input type="range" min="0" max="100" value={textPos.y} onChange={(e) => setTextPos({...textPos, y: Number(e.target.value)})} className="flex-1 h-1.5 bg-neutral-700 rounded-lg accent-violet-500"/>
                         </div>
                    </div>
                </div>
            </div>

        </div>
      </div>

      {/* --- 右侧预览区域 --- */}
      {/* 修复背景混淆问题：
          我们在预览区域的底部增加了一个 'bg-[url(...)]' 棋盘格背景。
          这样，即使你选择了全黑背景图，因为外围有棋盘格，你也能清楚看到边界。
      */}
      <div className="flex-1 bg-neutral-950 relative overflow-hidden flex flex-col">
        
        {/* 顶部工具栏占位 (可选) */}
        <div className="h-14 border-b border-neutral-800 bg-neutral-900/50 flex items-center px-6 justify-end">
             {/* 可以在这里放缩放比例等，目前留空 */}
        </div>

        {/* 画布区域 */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-10 relative">
             
             {/* 棋盘格背景层 (视觉辅助，不会被导出) */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(#404040 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
             </div>

             {/* 真正的导出容器 */}
            <div 
            ref={exportRef}
            style={{ 
                width: `${windowWidth + padding * 2}px`,
                minHeight: `${windowHeight + 36 + padding * 2}px`,
                padding: `${padding}px`, 
                background: background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative' // 为文字绝对定位做准备
            }}
            className="transition-all duration-300 ease-out shadow-[0_0_50px_rgba(0,0,0,0.5)] shrink-0"
            >
                
                {/* --- 渲染文字层 --- */}
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
                            zIndex: 50, // 确保文字在最上层
                            whiteSpace: 'pre-wrap', // 支持换行
                            lineHeight: 1.2,
                            textShadow: '0 4px 12px rgba(0,0,0,0.3)' // 给文字加一点点阴影增加可读性
                        }}
                        className="pointer-events-none select-none"
                    >
                        {text}
                    </div>
                )}

                {/* Mac 窗口主体 */}
                <div 
                style={{ 
                    width: `${windowWidth}px`, 
                    height: `${windowHeight + 36}px`, 
                    borderRadius: `${borderRadius}px`, 
                    boxShadow: shadow, 
                }}
                className={`bg-white relative overflow-hidden flex flex-col ${windowBorderClass} z-10`}
                >
                    {/* 标题栏 */}
                    <div className="h-9 bg-white border-b border-black/5 flex items-center px-4 gap-2 shrink-0 select-none">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"/>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"/>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"/>
                    </div>

                    {/* 图片区域 */}
                    <div className="flex-1 w-full h-full bg-white flex items-center justify-center relative p-1 overflow-hidden">
                        {image ? (
                            <img src={image} alt="Preview" className="w-full h-full object-contain"/>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-neutral-400 gap-3">
                                <Upload size={48} className="text-neutral-200"/>
                                <p className="font-medium">Upload Image</p>
                            </div>
                        )}
                    </div>
                </div> 
            </div> 
        </div>
      </div>

      {/* 导出按钮 */}
      <button 
        onClick={handleDownload}
        disabled={isExporting || !image}
        className="fixed bottom-8 right-8 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3 rounded-full shadow-2xl transition transform hover:-translate-y-1 flex items-center gap-2 z-50"
      >
        {isExporting ? <Loader2 size={20} className="animate-spin"/> : <Download size={20}/>}
        {isExporting ? 'Processing...' : 'Export Image'}
      </button>
    </div>
  );
};

export default ScreenshotStudio;
