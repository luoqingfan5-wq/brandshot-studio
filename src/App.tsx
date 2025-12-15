import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, Layout, Palette, Lock, 
  Loader2, CheckCircle, X, Zap, Crown, Image as ImageIcon, Layers 
} from 'lucide-react';
import * as domToImage from 'dom-to-image-more'; 
import { AnimatePresence, motion } from 'framer-motion';

// --- 类型定义 ---
type GradientOption = {
  name: string;
  value: string;
  isPro: boolean;
};

// --- 配置数据 ---
const GRADIENTS: GradientOption[] = [
  { name: 'Midnight', value: '#0f172a', isPro: false },
  { name: 'Clean White', value: '#ffffff', isPro: false },
  { name: 'Oceanic', value: 'linear-gradient(to right bottom, #3b82f6, #6366f1)', isPro: false },
  { name: 'Sunset', value: 'linear-gradient(to right bottom, #f43f5e, #1d4ed8)', isPro: false },
  { name: 'Gold Dust', value: 'linear-gradient(to right bottom, #fbbf24, #ef4444)', isPro: false },
  // Pro Gradients
  { name: 'Neon Cyber', value: 'linear-gradient(to right, #f472b6, #d946ef, #8b5cf6)', isPro: true },
  { name: 'Deep Space', value: 'linear-gradient(to bottom, #000000, #434343)', isPro: true },
  { name: 'Aurora', value: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', isPro: true },
];

const ScreenshotStudio: React.FC = () => {
  // --- State Definitions ---
  const [image, setImage] = useState<string | null>(null);
  const [padding, setPadding] = useState(64);
  const [background, setBackground] = useState(GRADIENTS[2].value);
  
  // Window dimensions
  const [windowWidth, setWindowWidth] = useState(800); 
  const [windowHeight, setWindowHeight] = useState(600); 
  
  const [borderRadius, setBorderRadius] = useState(16);
  const [shadow, setShadow] = useState('0 20px 25px rgba(0, 0, 0, 0.3)'); 
  
  // 商业化状态
  const [isPro, setIsPro] = useState(false); 
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  const [isExporting, setIsExporting] = useState(false); 
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader(); 
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 处理背景选择 (Feature Gate)
  const handleBackgroundChange = (gradient: GradientOption) => {
    if (gradient.isPro && !isPro) {
      setShowPricingModal(true); // 触发付费墙
    } else {
      setBackground(gradient.value);
    }
  };

  // 处理批量导出点击 (Feature Gate)
  const handleBatchExportClick = () => {
    if (!isPro) {
      setShowPricingModal(true);
    } else {
      alert("Pro功能：批量上传逻辑将在此处触发");
    }
  };

  // 🚀 核心修改：真正的 API 调用
  const handleStripePayment = async (plan: 'monthly' | 'lifetime') => {
    setIsSimulatingPayment(true);
    
    try {
        // 🚨 关键：调用 Netlify Functions 路由
        const response = await fetch('/.netlify/functions/checkout', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planType: plan }) 
        });
        
        const data = await response.json();

        if (data.error || !response.ok) {
            alert(`支付创建失败: ${data.error || '未知错误'}`);
            setIsSimulatingPayment(false);
            return;
        }

        // 跳转到 Stripe 结账页面
        window.location.href = data.url;

    } catch (err) {
        console.error("Payment initiation failed", err);
        alert("无法连接到支付服务。请检查网络或稍后重试。");
        setIsSimulatingPayment(false);
    }
    // 注意：setIsPro(true) 必须在 Stripe 成功回调 URL 处处理
  };

  const handleDownload = async () => {
    if (!exportRef.current || !image) return;
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
            },
            bgcolor: null,
            filter: (fnode) => (
                !(fnode.tagName === 'BUTTON') 
            )
        });
        
        const link = document.createElement('a');
        link.download = `brandshot-${isPro ? 'pro' : 'free'}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      await new Promise(resolve => setTimeout(resolve, 200)); 
      setIsExporting(false); 
    }
  };

  const windowBorderClass = shadow === 'none' 
    ? 'border-2 border-black/30' 
    : 'border border-black/10'; 
    
  // --- URL 参数处理 ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setIsPro(true); // 假设支付成功，激活 Pro
      // 清除 URL，保持界面干净
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // 您还需要处理 'payment=canceled' 的情况
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row font-sans">
      
      {/* --- Pricing Modal (弹窗) --- */}
      <AnimatePresence>
        {showPricingModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
            >
              <button 
                onClick={() => setShowPricingModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white z-10"
              >
                <X size={24} />
              </button>

              {/* Left Side: Features */}
              <div className="p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-neutral-800">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-violet-600/20 rounded-xl text-violet-400">
                     <Crown size={32} strokeWidth={1.5} />
                   </div>
                   <div>
                     <h2 className="text-2xl font-bold text-white">Go Pro</h2>
                     <p className="text-neutral-400 text-sm">Unlock the full creative power.</p>
                   </div>
                </div>
                
                <ul className="space-y-4">
                  {[
                    "Remove BrandShot Watermark",
                    "Unlock 10+ Pro Gradients & Styles",
                    "Batch Export (Multiple Images)",
                    "Custom Device Models (iPhone 15, etc.)",
                    "4K High-Res Export"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-neutral-300">
                      <CheckCircle size={18} className="text-green-400 shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Side: Pricing Options */}
              <div className="p-8 md:w-1/2 bg-neutral-800/30 flex flex-col justify-center gap-4">
                {/* Subscription Card */}
                <button 
                  onClick={() => handleStripePayment('monthly')}
                  disabled={isSimulatingPayment}
                  className="group relative p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition text-left"
                >
                  <div className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                    MOST POPULAR
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-violet-300">Monthly Subscription</span>
                    <span className="text-xl font-bold text-white">$4.99<span className="text-sm text-neutral-400 font-normal">/mo</span></span>
                  </div>
                  <p className="text-xs text-neutral-400">Cancel anytime. Perfect for consistent creators.</p>
                </button>

                {/* Lifetime Card */}
                <button 
                  onClick={() => handleStripePayment('lifetime')}
                  disabled={isSimulatingPayment}
                  className="p-4 rounded-xl border border-neutral-700 bg-neutral-800 hover:border-neutral-600 transition text-left"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-neutral-200">Lifetime Deal</span>
                    <span className="text-xl font-bold text-white">$19.00</span>
                  </div>
                  <p className="text-xs text-neutral-400">One-time payment. Own it forever.</p>
                </button>

                {isSimulatingPayment && (
                  <div className="flex items-center justify-center text-violet-400 mt-4">
                    <Loader2 size={18} className="animate-spin mr-2" /> Creating secure checkout session...
                  </div>
                )}
                <p className="text-center text-xs text-neutral-500 mt-4">
                  Secured by Stripe. 100% Money-back guarantee.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Left Control Panel --- */}
      <div className="w-full lg:w-96 bg-neutral-900 p-6 flex flex-col gap-8 border-r border-neutral-800 shadow-xl lg:h-screen lg:overflow-y-auto z-10">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-500 cursor-pointer" onClick={() => setShowPricingModal(true)}>
          BrandShot Studio
        </h1>
        
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm text-neutral-400 font-medium flex items-center gap-2">
             <Upload size={16} /> 1. Upload Screenshot
          </label>
          <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-violet-500 transition hover:bg-neutral-800 group">
            <div className="flex flex-col items-center group-hover:scale-105 transition">
              <span className="text-xs text-neutral-400 font-semibold">{image ? 'Uploaded (Click to replace)' : 'Click or drag to upload image'}</span>
            </div>
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
          
          {/* Batch Export Button (Pro Feature) */}
          <button 
            onClick={handleBatchExportClick}
            className="w-full flex items-center justify-center gap-2 py-2 mt-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-xs font-medium text-neutral-400 transition"
          >
            {isPro ? <Layers size={14} /> : <Lock size={12} className="text-yellow-500" />}
            Batch Upload (Pro)
          </button>
        </div>

        {/* Style Controls */}
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-neutral-200 border-b border-neutral-800 pb-2">2. Adjust Parameters</h2>
          
            <div className="space-y-2">
                <label className="text-sm text-neutral-400 font-medium flex items-center justify-between">
                    <span>Padding: {padding}px</span>
                    <Layout size={16}/>
                </label>
                <input type="range" min="0" max="150" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-500"/>
            </div>

            {/* Background Selector with Feature Gates */}
            <div className="space-y-2">
                <label className="text-sm text-neutral-400 font-medium flex items-center gap-2">
                    <Palette size={16}/> Background Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {GRADIENTS.map((g, i) => (
                        <button 
                            key={i}
                            className={`relative w-full aspect-square rounded-lg border-2 shadow-sm transition-transform hover:scale-105 ${background === g.value ? 'border-violet-400 ring-2 ring-violet-400/20' : 'border-neutral-600'}`}
                            style={{ background: g.value }}
                            onClick={() => handleBackgroundChange(g)}
                        >
                          {/* Lock Icon for Pro Gradients */}
                          {g.isPro && !isPro && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md backdrop-blur-[1px]">
                              <Lock size={12} className="text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                    ))}
                </div>
            </div>

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

        {/* Upgrade / Status Card */}
        <div className={`p-4 rounded-xl border mt-auto transition-all ${isPro ? 'bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 border-violet-500/30' : 'bg-neutral-800 border-neutral-700'}`}>
           <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
                {isPro ? <Zap size={16} className="text-yellow-400 fill-yellow-400"/> : <Lock size={16} className="text-neutral-400"/>}
                <span className={`text-sm font-bold ${isPro ? 'text-white' : 'text-neutral-200'}`}>
                  {isPro ? 'Pro Active' : 'Free Plan'}
                </span>
             </div>
             {isPro && <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full">PRO</span>}
           </div>
           
           {!isPro ? (
             <button 
               onClick={() => setShowPricingModal(true)}
               className="w-full text-center text-sm font-bold bg-yellow-500 text-black py-2.5 rounded-lg hover:bg-yellow-400 transition shadow-lg shadow-yellow-500/10"
             >
               Upgrade to Pro
             </button>
           ) : (
             <div className="text-xs text-neutral-400 text-center">
               Thanks for supporting indie developers! ❤️
             </div>
           )}
        </div>
      </div>

      {/* --- Right Preview Area --- */}
      <div className="flex-1 bg-neutral-950 overflow-auto flex items-center justify-center p-8 relative">
        
        {/* Watermark Notice (Only for Free Users) */}
        {!isPro && (
          <div className="absolute top-6 right-6 bg-neutral-900/80 backdrop-blur text-neutral-400 text-xs px-3 py-1.5 rounded-full border border-neutral-800 flex items-center gap-2 pointer-events-none z-10">
            <Lock size={10} /> Watermark Active
          </div>
        )}

        <div 
          ref={exportRef}
          style={{ 
            width: `${windowWidth + padding * 2}px`,
            minHeight: `${windowHeight + 36 + padding * 2}px`,
            padding: `${padding}px`, 
            background: background 
          }}
          className="flex items-center justify-center relative transition-all duration-300 ease-in-out"
        >
            
            {/* Mac Window Frame */}
            <div 
              style={{ 
                width: `${windowWidth}px`, 
                height: `${windowHeight + 36}px`, 
                borderRadius: `${borderRadius}px`, 
                boxShadow: shadow, 
              }}
              className={`bg-white relative overflow-hidden flex flex-col ${windowBorderClass} will-change-transform z-50 shadow-2xl scale-100`}
            >
                <div className="h-9 bg-white border-b border-black/5 flex items-center px-4 gap-2 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>

                <div className="flex-1 w-full h-full bg-white flex items-center justify-center relative p-1">
                  {image ? (
                    <img 
                      src={image} 
                      alt="Preview" 
                      className="absolute top-0 left-0 w-full h-full object-contain"
                      style={{ objectFit: 'contain' }} 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400 gap-3">
                      <ImageIcon size={48} className="text-neutral-200"/>
                      <p className="font-medium">Drag image or click upload</p>
                    </div>
                  )}
                </div>

                {/* 水印逻辑: 只有 Free 用户显示 */}
                {!isPro && image && (
                  <div className="absolute bottom-4 right-5 z-50">
                    <div className="bg-black/20 backdrop-blur-md text-white/90 text-[10px] font-bold px-2 py-1 rounded border border-white/10 tracking-wider shadow-sm select-none">
                      BrandShot
                    </div>
                  </div>
                )}

            </div> 
        </div> 
      </div>

      {/* Export Button */}
      <button 
        onClick={handleDownload}
        disabled={isExporting || !image}
        className="hidden lg:flex fixed bottom-10 right-10 bg-white text-black hover:bg-neutral-200 font-bold px-8 py-3 rounded-full shadow-2xl transition transform hover:-translate-y-1 items-center gap-2 z-50"
      >
        {isExporting ? <Loader2 size={20} className="animate-spin"/> : <Download size={20}/>}
        {isExporting ? 'Export Image' : 'Export Image'}
      </button>
    </div>
  );
};

export default ScreenshotStudio;