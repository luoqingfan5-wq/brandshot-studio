import React, { useState, useRef } from 'react';
import { Upload, Download, Layout, Palette, Loader2 } from 'lucide-react';
// @ts-ignore
import domToImage from 'dom-to-image-more'; 

const ScreenshotStudio: React.FC = () => {
  // --- 状态定义 ---
  const [image, setImage] = useState<string | null>(null);
  const [padding, setPadding] = useState(64);
  const [background, setBackground] = useState('linear-gradient(to right bottom, #3b82f6, #6366f1)'); 
  
  // 窗口尺寸
  const [windowWidth, setWindowWidth] = useState(800); 
  const [windowHeight, setWindowHeight] = useState(600); 
  
  const [borderRadius, setBorderRadius] = useState(16);
  const [shadow, setShadow] = useState('0 20px 25px rgba(0, 0, 0, 0.3)'); 
  // 移除 isPro 状态
  const [isExporting, setIsExporting] = useState(false); 

  const exportRef = useRef<HTMLDivElement>(null);

  // 背景预设
  const gradients = [
    '#0f172a', 
    '#ffffff', 
    'linear-gradient(to right bottom, #3b82f6, #6366f1)', 
    'linear-gradient(to right bottom, #f43f5e, #1d4ed8)', 
    'linear-gradient(to right bottom, #fbbf24, #ef4444)', 
  ];
  
  // 图片上传处理
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader(); 
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 下载处理
  const handleDownload = async () => {
    if (!exportRef.current || !image) return;
    setIsExporting(true); 

    await new Promise(resolve => setTimeout(resolve, 50)); 
        
    try {
        const node = exportRef.current;
        
        // 阴影偏移量，防止阴影被切断
        const shadowOffset = 50; 
        const originalWidth = node.offsetWidth;
        const originalHeight = node.offsetHeight;
        
        const dataUrl = await domToImage.toPng(node, {
            width: originalWidth + shadowOffset * 2,
            height: originalHeight + shadowOffset * 2,
            
            style: {
                'object-fit': 'contain', 
                'overflow': 'hidden', 
                // 关键：强制居中，防止增加宽高后内容偏左上
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
            },
            
            bgcolor: null,
            filter: (fnode: any) => (
                !(fnode.tagName === 'BUTTON' && fnode.className?.includes?.('fixed')) 
            )
        });
        
        const link = document.createElement('a');
        link.download = `brandshot-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 200)); 
      setIsExporting(false); 
    }
  };

  // 根据阴影状态决定边框样式
  const windowBorderClass = shadow === 'none' 
    ? 'border-2 border-black/30' // 无阴影时显示明显边框
    : 'border border-black/10'; // 有阴影时显示细微边框

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row font-sans">
      
      {/* --- 左侧控制面板 --- */}
      <div className="w-full lg:w-96 bg-neutral-900 p-6 flex flex-col gap-8 border-r border-neutral-800 shadow-xl lg:h-screen lg:overflow-y-auto z-20">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-500">
          BrandShot Studio
        </h1>
        
        {/* 图片上传 */}
        <div className="space-y-2">
          <label className="text-sm text-neutral-400 font-medium flex items-center gap-2">
             <Upload size={16} /> 1. Upload Screenshot
          </label>
          <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-violet-500 transition hover:bg-neutral-800">
            <div className="flex flex-col items-center">
              <span className="text-xs text-neutral-400 font-semibold">{image ? 'Uploaded (Click to replace)' : 'Click or drag to upload image'}</span>
            </div>
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
        </div>

        {/* 样式控制 */}
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-neutral-200 border-b border-neutral-800 pb-2">2. Adjust Parameters</h2>
          
            {/* 边距 Padding */}
            <div className="space-y-2">
                <label className="text-sm text-neutral-400 font-medium flex items-center justify-between">
                    <span>Padding: {padding}px</span>
                    <Layout size={16}/>
                </label>
                <input type="range" min="0" max="150" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-500"/>
            </div>

            {/* 背景 Background */}
            <div className="space-y-2">
                <label className="text-sm text-neutral-400 font-medium flex items-center gap-2">
                    <Palette size={16}/> Background Style
                </label>
                <div className="flex gap-2 flex-wrap">
                    {gradients.map((g, i) => (
                        <button 
                            key={i}
                            className={`w-10 h-10 rounded-lg border-2 shadow-sm transition-transform hover:scale-105 ${background === g ? 'border-violet-400 ring-2 ring-violet-400/20' : 'border-neutral-600'}`}
                            style={{ background: g }}
                            onClick={() => setBackground(g)}
                        />
                    ))}
                </div>
            </div>

            {/* 尺寸控制 Window Width/Height */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-neutral-400 font-medium">Window Width</label>
                    <input type="range" min="300" max="1200" value={windowWidth} onChange={(e) => setWindowWidth(Number(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg accent-violet-500"/>
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-neutral-400 font-medium">Window Height</label>
                    <input type="range" min="300" max="1000" value={windowHeight} onChange={(e) => setWindowHeight(Number(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg accent-violet-500"/>
                </div>
            </div>

            {/* 圆角和阴影 Radius & Shadow */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm text-neutral-400 font-medium flex justify-between">
                        <span>Border Radius: {borderRadius}px</span>
                    </label>
                    <input type="range" min="0" max="32" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-500"/>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm text-neutral-400 font-medium">Shadow Intensity</label>
                    <select 
                        value={shadow} 
                        onChange={(e) => setShadow(e.target.value)} 
                        className="w-full bg-neutral-800 border border-neutral-700 text-sm p-2 rounded text-neutral-200 focus:border-violet-500 outline-none"
                    >
                        <option value="none">No Shadow (Flat)</option>
                        <option value="0 10px 15px rgba(0, 0, 0, 0.1)">Light Shadow</option>
                        <option value="0 20px 25px rgba(0, 0, 0, 0.3)">Standard Shadow (Mac)</option>
                        <option value="0 25px 50px rgba(0, 0, 0, 0.7)">Deep Shadow</option>
                    </select>
                </div>
            </div>
        </div>
      </div>

      {/* --- 右侧预览区域 --- */}
      <div className="flex-1 bg-neutral-950 overflow-auto flex items-center justify-center p-8 relative">
        
        {/* 外层容器 (exportRef) */}
        <div 
          ref={exportRef}
          style={{ 
            width: `${windowWidth + padding * 2}px`,
            minHeight: `${windowHeight + 36 + padding * 2}px`,
            padding: `${padding}px`, 
            background: background,
            display: 'flex',            // 确保内容居中
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="relative transition-all duration-300 ease-in-out shrink-0"
        >
            
            {/* 中间层 (Mac 窗口): 处理圆角、阴影和边框 */}
            <div 
              style={{ 
                width: `${windowWidth}px`, 
                height: `${windowHeight + 36}px`, 
                borderRadius: `${borderRadius}px`, 
                boxShadow: shadow, 
              }}
              className={`bg-white relative overflow-hidden flex flex-col ${windowBorderClass} will-change-transform z-10 shadow-2xl scale-100 shrink-0`}
            >
                
                {/* 标题栏 (Title Bar) */}
                <div className="h-9 bg-white border-b border-black/5 flex items-center px-4 gap-2 shrink-0 select-none">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>

                {/* 图片容器 (Image Container) */}
                <div className="flex-1 w-full h-full bg-white flex items-center justify-center relative p-1 overflow-hidden">
                  {image ? (
                    <img 
                      src={image} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400 gap-3">
                      <Upload size={48} className="text-neutral-200"/>
                      <p className="font-medium">Drag image or click upload on the left</p>
                    </div>
                  )}
                </div>

                {/* 🔥 这里原本是 Pro 水印代码，我已经删掉了。
                   现在所有用户导出的图片都是纯净无水印的。
                */}

            </div> 
        </div> 
      </div>

      {/* 底部导出按钮 (移动端) */}
      <button 
        onClick={handleDownload}
        disabled={isExporting || !image}
        className="lg:hidden fixed bottom-6 left-6 right-6 bg-violet-600 text-white font-bold py-3 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition z-50"
      >
        {isExporting ? <Loader2 size={18} className="animate-spin"/> : <Download size={18}/>}
        {isExporting ? 'Generating...' : 'Save Image'}
      </button>

      {/* 侧边导出按钮 (桌面端) */}
      <button 
        onClick={handleDownload}
        disabled={isExporting || !image}
        className="hidden lg:flex fixed bottom-10 right-10 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3 rounded-full shadow-2xl transition transform hover:-translate-y-1 items-center gap-2 z-50"
      >
        {isExporting ? <Loader2 size={20} className="animate-spin"/> : <Download size={20}/>}
        {isExporting ? 'Processing...' : 'Export Image'}
      </button>
    </div>
  );
};

export default ScreenshotStudio;
