import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  ArrowRight, 
  Percent, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  RotateCw, 
  ShoppingBag, 
  CheckSquare, 
  Share2, 
  Sliders, 
  Award,
  BookOpen
} from "lucide-react";
import { SystemState, Product } from "../types";
import { CustomChart } from "./CustomChart";

interface SmartMarketingProps {
  state: SystemState;
}

interface CampaignRecommendation {
  campaignTitle: string;
  rationale: string;
  targetAudience: string;
  discountPercentage: string;
  duration: string;
  expectedImpact: string;
  implementationSteps: string[];
}

interface CopywritingDetail {
  en: string;
  my: string;
}

interface MarketingInsights {
  trendingProducts: string[];
  underperformingProducts: string[];
  lowStockAlerts: string[];
  analyticsSummary: {
    salesGrowthEstimate: string;
    engagementLevel: string;
    bestSellingCategory: string;
  };
  recommendations: CampaignRecommendation[];
  copywriting: {
    facebookCaption: CopywritingDetail;
    instagramCaption: CopywritingDetail;
    adCopy: CopywritingDetail;
    email: CopywritingDetail;
    hashtags: string;
  };
  bannerPrompt: string;
}

const PRESET_CAMPAIGNS = [
  { id: "BackToSchool", name: "Back-to-School 🎒", desc: "Nutritious school snack boxes & study treats", color: "from-sky-400 to-blue-500", bannerStyle: "school" },
  { id: "MonsoonSale", name: "Monsoon Sale 🌧️", desc: "Cozy hot brews & sweet comforts for rainy days", color: "from-teal-500 to-cyan-600", bannerStyle: "monsoon" },
  { id: "FlashSale", name: "Weekend Flash Sale ⚡", desc: "Limited-time high urgency conversions boost", color: "from-amber-400 to-orange-500", bannerStyle: "flash" },
  { id: "Thingyan", name: "Thingyan Water Festival 💦", desc: "Traditional food & cooling drink promos", color: "from-yellow-400 to-amber-500", bannerStyle: "thingyan" },
  { id: "Christmas", name: "Christmas Season 🎄", desc: "Warm family sharing & gift baskets", color: "from-emerald-500 to-rose-600", bannerStyle: "christmas" },
  { id: "NewYear", name: "New Year Bash 🥳", desc: "Crunchy snack boards & year-end clearance", color: "from-indigo-500 to-purple-600", bannerStyle: "newyear" },
  { id: "Valentine", name: "Valentine's Day 💖", desc: "Sweet traditional dessert couple boxes", color: "from-pink-400 to-red-500", bannerStyle: "valentine" },
];

export function SmartMarketing({ state }: SmartMarketingProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("BackToSchool");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [insights, setInsights] = useState<MarketingInsights | null>(null);
  const [copyLang, setCopyLang] = useState<"en" | "my">("my");
  const [activeTabCopy, setActiveTabCopy] = useState<"facebook" | "instagram" | "ad" | "email">("facebook");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<boolean[]>([]);
  
  // Custom AI Marketing Campaign selections
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<string>("3:4");

  // Keep selected product ids synchronized with catalog at start
  useEffect(() => {
    if (selectedProductIds.length === 0 && state.products.length > 0) {
      setSelectedProductIds(state.products.map(p => p.id));
    }
  }, [state.products]);

  // Custom Poster Maker States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [posterTitle, setPosterTitle] = useState<string>("ရိုးရာ နှစ်သစ်ကူး အထူးဗူး");
  const [posterSubtitle, setPosterSubtitle] = useState<string>("၁၅% အထူးလျှော့စျေးယူလိုက်ပါဗျာ");
  const [posterDiscount, setPosterDiscount] = useState<string>("15% OFF");
  const [posterAccent, setPosterAccent] = useState<string>("#eab308"); // Gold
  const [posterBg, setPosterBg] = useState<string>("gradient-gold"); // gradient selection
  const [selectedProduct, setSelectedProduct] = useState<string>(state.products[0]?.id || "");
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiImageLoading, setAiImageLoading] = useState<boolean>(false);
  const [aiImageError, setAiImageError] = useState<string | null>(null);

  const [productImgElement, setProductImgElement] = useState<HTMLImageElement | null>(null);
  const [lastLoadedUrl, setLastLoadedUrl] = useState<string>("");

  useEffect(() => {
    const product = state.products.find(p => p.id === (selectedProduct || state.products[0]?.id));
    if (product && product.image) {
      if (product.image !== lastLoadedUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setProductImgElement(img);
          setLastLoadedUrl(product.image);
        };
        img.onerror = () => {
          setProductImgElement(null);
          setLastLoadedUrl(product.image);
        };
        img.src = product.image;
      }
    } else {
      setProductImgElement(null);
      setLastLoadedUrl("");
    }
  }, [selectedProduct, state.products, lastLoadedUrl]);

  // Derive dynamic analytics from the state
  const totalOrders = state.orders.length;
  const verifiedOrders = state.orders.filter(o => o.status !== "cancelled");
  const calculatedLoss = state.orders.filter(o => o.status === "cancelled").reduce((sum, o) => sum + (o.totalAmount - o.deliveryFee), 0);
  const totalRevenue = verifiedOrders.reduce((sum, o) => sum + (o.totalAmount - o.deliveryFee), 0);

  // Dynamic product metrics calculations
  const itemsSold: { [name: string]: number } = {};
  verifiedOrders.forEach(o => {
    o.items.forEach(i => {
      itemsSold[i.productName] = (itemsSold[i.productName] || 0) + i.quantity;
    });
  });

  const productMetrics = state.products.map(p => {
    return {
      name: p.name,
      category: p.category,
      sold: itemsSold[p.name] || 0,
      stock: p.stock,
      price: p.price
    };
  });

  const bestSellers = [...productMetrics].sort((a, b) => b.sold - a.sold).slice(0, 2);
  const slowSellers = [...productMetrics].sort((a, b) => a.sold - b.sold || b.stock - a.stock).slice(0, 2);

  // Customer engagement metrics stats
  const activeConversationsCount = Object.keys(state.sessions).length;
  const liveTakeoverActive = Object.values(state.sessions).filter(s => s.liveTakeoverActive).length;
  const aiRepliedCount = Object.values(state.sessions).filter(s => !s.liveTakeoverActive).length;

  // Render dummy metrics trend over last 6 months (based on actual revenue or realistic intervals)
  const chartData = [
    { label: "Dec", value: Math.round(totalRevenue * 0.4 + 40000) },
    { label: "Jan", value: Math.round(totalRevenue * 0.55 + 65000) },
    { label: "Feb", value: Math.round(totalRevenue * 0.7 + 90000) },
    { label: "Mar", value: Math.round(totalRevenue * 0.85 + 110000) },
    { label: "Apr", value: Math.round(totalRevenue * 1.1 + 180000) }, // Searing high seasonal performance
    { label: "May", value: totalRevenue }
  ];

  // Load backend insights
  const fetchMarketingInsights = async (campaign: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/marketing/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          campaignType: campaign,
          productIds: selectedProductIds
        }),
      });
      const data = await response.json();
      if (data.success && data.insights) {
        setInsights(data.insights);
        // Prepopulate text poster configurations based on AI descriptions
        const rec = data.insights.recommendations[0];
        if (rec) {
          setPosterTitle(rec.campaignTitle.substring(0, 28));
          setPosterSubtitle(`Get ${rec.discountPercentage} storewide discount!`);
          setPosterDiscount(rec.discountPercentage || "10% OFF");
          setChecklist(new Array(rec.implementationSteps.length).fill(false));
        }
        
        // Auto select beautiful poster maker accents depending on campaign themes
        if (campaign === "Thingyan") {
          setPosterAccent("#eab308"); // Golden
          setPosterBg("gradient-gold");
        } else if (campaign === "Christmas") {
          setPosterAccent("#ef4444"); // Christmas Red
          setPosterBg("gradient-christmas");
        } else if (campaign === "NewYear") {
          setPosterAccent("#8b5cf6"); // Deep purple
          setPosterBg("gradient-newyear");
        } else if (campaign === "Valentine") {
          setPosterAccent("#ec4899"); // Pink
          setPosterBg("gradient-valentine");
        } else if (campaign === "BackToSchool") {
          setPosterAccent("#0ea5e9"); // Sky Blue
          setPosterBg("gradient-school");
        } else if (campaign === "MonsoonSale") {
          setPosterAccent("#0d9488"); // Teal
          setPosterBg("gradient-monsoon");
        } else if (campaign === "FlashSale") {
          setPosterAccent("#f59e0b"); // Amber
          setPosterBg("gradient-flash");
        } else {
          setPosterAccent("#6366f1"); // Indigo modern
          setPosterBg("gradient-midnight");
        }
      }
    } catch (err) {
      console.error("Could not fetch smart marketing insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingInsights(selectedPreset);
  }, [selectedPreset]);

  // Handle caption clipboard copy feedback
  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate poster with Imagen
  const handleGenerateAiImage = async () => {
    if (!insights) return;
    setAiImageLoading(true);
    setAiImageError(null);
    try {
      const response = await fetch("/api/ai/marketing/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: insights.bannerPrompt,
          campaignType: selectedPreset,
          productId: selectedProduct,
          aspectRatio: aspectRatio
        }),
      });
      const data = await response.json();
      if (data.success && data.imageUrl) {
        setAiImage(data.imageUrl);
      } else {
        setAiImageError(data.error || "Failed to generate AI graphic.");
      }
    } catch (err) {
      setAiImageError("API Key Offline / Quota limit exceeded for Multimodal Imagen tasks.");
    } finally {
      setAiImageLoading(false);
    }
  };

  // HTML5 Poster drawing inside the Canvas for 100% reliable customized poster graphic creation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Aspect Ratio 3:4 Vertical Poster Size
    const width = 360;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    // Draw background based on selector gradient
    let bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (posterBg === "gradient-gold") {
      bgGrad.addColorStop(0, "#1e1b4b"); // Indigo midnight
      bgGrad.addColorStop(1, "#120e2e");
    } else if (posterBg === "gradient-christmas") {
      bgGrad.addColorStop(0, "#022c22"); // Dark forest green
      bgGrad.addColorStop(1, "#021c15");
    } else if (posterBg === "gradient-newyear") {
      bgGrad.addColorStop(0, "#0f172a"); // Dark slate starry sky
      bgGrad.addColorStop(1, "#1e1b4b");
    } else if (posterBg === "gradient-valentine") {
      bgGrad.addColorStop(0, "#3e0a16"); // Deep romantic maroon
      bgGrad.addColorStop(1, "#180206");
    } else if (posterBg === "gradient-school") {
      bgGrad.addColorStop(0, "#0c1f30"); // Royal academic dark blue
      bgGrad.addColorStop(1, "#060f18");
    } else if (posterBg === "gradient-monsoon") {
      bgGrad.addColorStop(0, "#042f2e"); // Dark teal monsoon
      bgGrad.addColorStop(1, "#0f172a");
    } else if (posterBg === "gradient-flash") {
      bgGrad.addColorStop(0, "#2c1704"); // Warm charcoal/chocolate-amber flash
      bgGrad.addColorStop(1, "#0c0a09");
    } else {
      bgGrad.addColorStop(0, "#090d16"); // Classic dark metallic
      bgGrad.addColorStop(1, "#1e293b");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Render themed decorative background shapes/elements
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.beginPath();
    ctx.arc(width, 0, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, height, 220, 0, Math.PI * 2);
    ctx.fill();

    // Render specialized seasonal stickers/patterns
    ctx.font = "26px system-ui";
    if (posterBg === "gradient-gold") {
      ctx.fillText("💦", width - 50, 60);
      ctx.fillText("💦", 45, height - 120);
    } else if (posterBg === "gradient-christmas") {
      ctx.fillText("🎄", width - 50, 60);
      ctx.fillText("❄️", 45, 60);
    } else if (posterBg === "gradient-newyear") {
      ctx.fillText("🥳", width - 50, 60);
      ctx.fillText("✨", 45, 60);
    } else if (posterBg === "gradient-valentine") {
      ctx.fillText("💖", width - 50, 60);
      ctx.fillText("🌹", 45, height - 120);
    } else if (posterBg === "gradient-school") {
      ctx.fillText("🎒", 45, 60);
      ctx.fillText("📚", width - 50, 60);
    } else if (posterBg === "gradient-monsoon") {
      ctx.fillText("🌧️", 45, 60);
      ctx.fillText("☔", width - 50, 60);
    } else if (posterBg === "gradient-flash") {
      ctx.fillText("⚡", 45, 60);
      ctx.fillText("🔥", width - 50, 60);
    }

    // Outer Thin Accent Border
    ctx.strokeStyle = posterAccent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    // Campaign Main Title (persuasive center)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px system-ui, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(posterTitle, width / 2, 60);

    // Divider Line
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 80);
    ctx.lineTo(280, 80);
    ctx.stroke();

    // Subtitle (Burmese / English localized)
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(posterSubtitle, width / 2, 105);

    // Product Section Y offset from Y=130 to Y=370
    const product = state.products.find(p => p.id === selectedProduct);
    if (product) {
      // Draw a polished card background frame for the catalog product
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(40, 130, 280, 240, 12);
        ctx.fill();
      } else {
        ctx.fillRect(40, 130, 280, 240);
      }

      // Draw product image inside the frame!
      const imgX = 85;
      const imgY = 145;
      const imgW = 190;
      const imgH = 140;

      if (productImgElement) {
        ctx.save();
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, imgW, imgH, 8);
          ctx.clip();
        }
        ctx.drawImage(productImgElement, imgX, imgY, imgW, imgH);
        ctx.restore();

        // Outline image with thin elegant border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, imgW, imgH, 8);
          ctx.stroke();
        } else {
          ctx.strokeRect(imgX, imgY, imgW, imgH);
        }
      } else {
        // Fallback placeholders while loading or without photo
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, imgW, imgH, 8);
          ctx.fill();
        } else {
          ctx.fillRect(imgX, imgY, imgW, imgH);
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "italic 11px sans-serif";
        ctx.fillText("[ Product Artwork Loading... ]", width / 2, 220);
      }

      // Product Product Name Y=310
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px system-ui, sans-serif";
      ctx.fillText(product.name, width / 2, 315);

      // Category and Price unit
      ctx.fillStyle = posterAccent;
      ctx.font = "bold 13px monospace";
      ctx.fillText(`${product.price.toLocaleString()} MMK`, width / 2, 345);

    } else {
      // General fallbacks message if catalog is completely empty
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "italic 12px sans-serif";
      ctx.fillText("[ Select catalog item below to embed ]", width / 2, 230);
    }

    // Dynamic Discount Badge left-aligned
    ctx.fillStyle = posterAccent;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(25, 410, 110, 32, 8);
      ctx.fill();
    } else {
      ctx.fillRect(25, 410, 110, 32);
    }
    ctx.fillStyle = "#000000";
    ctx.font = "extrabold 12px system-ui, sans-serif";
    ctx.fillText(posterDiscount, 80, 431);

    // Small footer note / CTA for Telegram Bot right-aligned
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`@${state.config.telegramBotUsername || "SmeBot"}`, width - 30, 420);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "9px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Order on Telegram Store", width - 30, 436);

  }, [posterTitle, posterSubtitle, posterDiscount, posterAccent, posterBg, selectedProduct, state.products, state.config, productImgElement]);

  // Handle Download HTML5 generated poster
  const downloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `promotion-${selectedPreset}-${posterDiscount.replace(/%/g, "") || "sale"}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-6">
      
      {/* STEPPER NAVIGATOR CARD */}
      <div className="bg-white border border-slate-250/70 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs font-mono select-none">
            0{currentStep}
          </div>
          <div className="text-left select-none">
            <span className="text-xs font-extrabold text-slate-900 block font-sans">
              {currentStep === 1 && "Diagnostics & Campaign Selection"}
              {currentStep === 2 && "AI Campaign Strategy & Copywriting"}
              {currentStep === 3 && "Custom Poster Studio & Graphic Builder"}
            </span>
          </div>
        </div>
        
        {/* STEP BUTTONS */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none w-full md:w-auto">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer font-sans ${
              currentStep === 1 
                ? "bg-slate-900 text-white shadow-sm" 
                : "bg-slate-105 text-slate-600 hover:bg-slate-200 bg-slate-100"
            }`}
          >
            <span>1. Theme & Metrics</span>
          </button>
          <span className="text-slate-300 text-xs hidden sm:block">➔</span>
          <button
            type="button"
            onClick={() => {
              if (insights) setCurrentStep(2);
            }}
            disabled={!insights}
            title={!insights ? "Please select a theme first" : "Go to Step 2"}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-sans ${
              currentStep === 2 
                ? "bg-slate-900 text-white shadow-sm" 
                : "bg-slate-105 text-slate-600 hover:bg-slate-200 bg-slate-100"
            }`}
          >
            <span>2. Strategy & Copy</span>
          </button>
          <span className="text-slate-300 text-xs hidden sm:block">➔</span>
          <button
            type="button"
            onClick={() => {
              if (insights) setCurrentStep(3);
            }}
            disabled={!insights}
            title={!insights ? "Please select a theme first" : "Go to Step 3"}
            className={`flex-1 md:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-sans ${
              currentStep === 3 
                ? "bg-slate-900 text-white shadow-sm" 
                : "bg-slate-105 text-slate-600 hover:bg-slate-200 bg-slate-100"
            }`}
          >
            <span>3. Visual Studio</span>
          </button>
        </div>
      </div>

      {/* STEP 1: PRESET THEME SELECTION & PRODUCT CHANNELS */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* STEP 1.1: CHOOSE PRODUCTS TO PROMOTE */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-4">
              <div className="flex items-center gap-1.5 justify-start">
                <CheckSquare size={15} className="text-indigo-600 animate-pulse" />
                <h3 className="text-xs font-bold font-mono text-slate-400 tracking-widest uppercase">Step 1.1 Choose Products to Promote</h3>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  Select which items from your inventory you want to actively spotlight. Your campaign copywriting will be specially customized to drive high conversions for these items.
                </p>

                <div className="space-y-2 max-h-[385px] overflow-y-auto pr-1">
                  {state.products.map((p) => {
                    const isChecked = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        id={`product-promote-${p.id}`}
                        onClick={() => {
                          if (isChecked) {
                            if (selectedProductIds.length > 1) {
                              setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                            }
                          } else {
                            setSelectedProductIds([...selectedProductIds, p.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer hover:shadow-sm select-none ${
                          isChecked
                            ? "border-indigo-600 bg-indigo-50/40 text-indigo-950"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-750"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                        }`}>
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-md border border-slate-200" referrerPolicy="no-referrer" />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold block truncate leading-tight text-slate-900">{p.name}</span>
                          <span className="text-[10px] text-slate-500 font-sans">{p.category}</span>
                          <span className="text-[10px] font-mono block mt-0.5 text-slate-755 text-slate-700">{p.price.toLocaleString()} MMK</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STEP 1.2: SELECT AI CAMPAIGN THEME */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-4">
              <div className="flex items-center gap-1.5 justify-start">
                <Sparkles size={15} className="text-amber-500 animate-pulse" />
                <h3 className="text-xs font-bold font-mono text-slate-400 tracking-widest uppercase">Step 1.2 Select Campaign Theme / Festival</h3>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-left">
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  Select a festival, regional celebration, rainy season sale, or quick flash discount. Clicking any theme will instantly trigger Gemini AI to synthesize tailored copywriting and strategic workflows.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {PRESET_CAMPAIGNS.map((c) => (
                    <button
                      key={c.id}
                      id={`campaign-preset-${c.id}`}
                      onClick={() => {
                        setSelectedPreset(c.id);
                        setCurrentStep(2);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group hover:shadow-md ${
                        selectedPreset === c.id
                          ? "border-slate-900 bg-slate-50 text-slate-900"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <span className="font-extrabold text-xs block transition-transform group-hover:translate-x-1 text-slate-900">{c.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-1 leading-normal font-sans font-medium">{c.desc}</span>
                      
                      {selectedPreset === c.id && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 2: AI STRATEGY PACKAGE & COPYWRITING */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 shadow-sm text-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 font-sans">Synthesizing Strategy Package...</h4>
                <p className="text-xs text-slate-400 animate-pulse font-mono max-w-sm mx-auto">
                  Drawing recommendations and copywriting translations from Gemini AI model...
                </p>
              </div>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                
                {/* RECOMMENDED SALES CAMPAIGN PACKAGE */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={16} className="text-indigo-600" />
                      <h3 className="text-sm font-black text-slate-900">Recommended Sales Campaign Package</h3>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono">Step 2.1</span>
                  </div>

                  {insights.recommendations?.map((rec, idx) => (
                    <div key={idx} className="space-y-4">
                      <div>
                        <h4 className="text-base font-extrabold text-indigo-700 font-sans">
                          🎬 {rec.campaignTitle}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans mt-2.5 bg-slate-50 p-3 rounded-lg border border-slate-150">
                          {rec.rationale}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pb-1">
                        <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                          <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">Target Audience</span>
                          <span className="text-xs font-bold text-slate-800 mt-1 block leading-tight font-sans">{rec.targetAudience}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                          <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">Expected Impact</span>
                          <span className="text-xs font-bold text-slate-800 mt-1 block leading-tight font-sans">{rec.expectedImpact}</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                          <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">Promo Discount</span>
                          <span className="text-xs font-extrabold text-amber-600 mt-1 block flex items-center gap-1 font-mono">
                            <Percent size={11} /> {rec.discountPercentage}
                          </span>
                        </div>

                        <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                          <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">Campaign Duration</span>
                          <span className="text-xs font-bold text-slate-800 mt-1 block flex items-center gap-1 font-sans">
                            <Calendar size={11} /> {rec.duration}
                          </span>
                        </div>
                      </div>


                    </div>
                  ))}
                </div>

                {/* AI HIGH-CONVERSION SOCIAL COPYWRITING */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={16} className="text-indigo-650" />
                      <h3 className="text-sm font-black text-slate-900">AI High-Conversion Social Copywriting</h3>
                    </div>
                    
                    {/* Language Toggler */}
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shrink-0 select-none">
                      <button
                        onClick={() => setCopyLang("en")}
                        className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-all ${
                          copyLang === "en" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setCopyLang("my")}
                        className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-all ${
                          copyLang === "my" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        မြန်မာ
                      </button>
                    </div>
                  </div>

                  {/* Caption tabs selectors */}
                  <div className="flex border-b border-slate-150 gap-2 shrink-0 overflow-x-auto select-none no-scrollbar">
                    {(["facebook", "instagram", "ad", "email"] as const).map((tab) => {
                      const labels = {
                        facebook: "📘 FB Caption",
                        instagram: "📸 IG Headline",
                        ad: "📣 Ad Copy",
                        email: "📧 Email Copy"
                      };
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTabCopy(tab)}
                          className={`pb-2 px-1 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-all ${
                            activeTabCopy === tab 
                              ? "border-indigo-600 text-indigo-700" 
                              : "border-transparent text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {labels[tab]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Render Selected Tab content */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-155 border-slate-150 relative group min-h-[160px]">
                    <p className="text-xs text-slate-750 leading-relaxed font-sans whitespace-pre-line select-all">
                      {activeTabCopy === "facebook" && (insights.copywriting?.facebookCaption?.[copyLang] || "No Facebook template generated")}
                      {activeTabCopy === "instagram" && (insights.copywriting?.instagramCaption?.[copyLang] || "No Instagram template generated")}
                      {activeTabCopy === "ad" && (insights.copywriting?.adCopy?.[copyLang] || "No Ad copy template generated")}
                      {activeTabCopy === "email" && (insights.copywriting?.email?.[copyLang] || "No Email template generated")}
                    </p>

                    {/* Tags section */}
                    {insights.copywriting?.hashtags && (activeTabCopy === "facebook" || activeTabCopy === "instagram") && (
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <span className="text-[10px] text-indigo-650 font-extrabold block">HASHTAG CLUSTER:</span>
                        <span className="text-[11px] font-mono text-slate-500 block mt-1 leading-snug">{insights.copywriting.hashtags}</span>
                      </div>
                    )}

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => {
                        let text = "";
                        if (activeTabCopy === "facebook") text = insights.copywriting?.facebookCaption?.[copyLang] || "";
                        if (activeTabCopy === "instagram") text = insights.copywriting?.instagramCaption?.[copyLang] || "";
                        if (activeTabCopy === "ad") text = insights.copywriting?.adCopy?.[copyLang] || "";
                        if (activeTabCopy === "email") text = insights.copywriting?.email?.[copyLang] || "";
                        copyText(text, activeTabCopy);
                      }}
                      className="absolute bottom-2.5 right-2.5 bg-white text-slate-800 hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                    >
                      {copiedKey === activeTabCopy ? (
                        <>
                          <Check size={11} className="text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 select-none">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-sans"
                >
                  ⇠ Back to Theme Selection
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm font-sans"
                >
                  Configure Posters Studio (Step 3) ➔
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center">
              <Sparkles size={30} className="text-amber-400 mx-auto mb-3" />
              <h4 className="text-xs font-bold text-slate-950 font-mono tracking-widest uppercase mb-1">No Theme Selected</h4>
              <p className="text-xs text-slate-400">Please choose a campaign theme in Step 1 first.</p>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                Go to Step 1
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: CREATIVE SOCIAL POSTERS & AI IMAGEN GENERATOR */}
      {/* STEP 3: CREATIVE SOCIAL POSTERS */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 shadow-sm text-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 font-sans">Updating Creative assets...</h4>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              
              {/* HTML5 POSTER STUDIO BUILDER CARD */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 font-sans">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-indigo-650" />
                    <h3 className="text-sm font-black text-slate-900">Custom Promotional Poster Studio</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono">Phase 3</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Vertical Canvas Preview */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 p-4 rounded-2xl border border-slate-200/60 relative">
                    <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-2 select-none">
                      Vertical Poster Live Preview (3:4)
                    </span>
                    <div className="w-full max-w-[280px] drop-shadow-xl">
                      <canvas 
                        ref={canvasRef} 
                        className="w-full rounded-xl border border-slate-200/80 select-none bg-slate-950 aspect-[3/4]" 
                      />
                    </div>
                  </div>

                  {/* Right Column: Custom poster typography and selection tools */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Poster Title</label>
                        <input 
                          type="text" 
                          value={posterTitle} 
                          onChange={(e) => setPosterTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-sans font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Promo discount text</label>
                        <input 
                          type="text" 
                          value={posterDiscount} 
                          onChange={(e) => setPosterDiscount(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Subheading / Call-To-Action</label>
                      <input 
                        type="text" 
                        value={posterSubtitle} 
                        onChange={(e) => setPosterSubtitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-sans text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Catalog Product Item</label>
                        <select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-sans font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        >
                          {state.products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.price.toLocaleString()} MMK)</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Theme Template Style</label>
                        <select
                          value={posterBg}
                          onChange={(e) => {
                            setPosterBg(e.target.value);
                            // Match presets
                            if (e.target.value === "gradient-gold") setPosterAccent("#eab308");
                            else if (e.target.value === "gradient-christmas") setPosterAccent("#ef4444");
                            else if (e.target.value === "gradient-newyear") setPosterAccent("#8b5cf6");
                            else if (e.target.value === "gradient-valentine") setPosterAccent("#ec4899");
                            else if (e.target.value === "gradient-school") setPosterAccent("#0ea5e9");
                            else if (e.target.value === "gradient-monsoon") setPosterAccent("#0d9488");
                            else if (e.target.value === "gradient-flash") setPosterAccent("#f59e0b");
                            else setPosterAccent("#6366f1");
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-sans font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="gradient-school">Ocean Wave (Students 🎒)</option>
                          <option value="gradient-monsoon">Monsoon Rain (Cozy 🌧️)</option>
                          <option value="gradient-flash">Lightning Rush (Flash Sale ⚡)</option>
                          <option value="gradient-gold">Golden Splash (Thingyan 💦)</option>
                          <option value="gradient-christmas">Classic Red (Christmas 🎄)</option>
                          <option value="gradient-newyear">Midnight Glow (New Year 🥳)</option>
                          <option value="gradient-valentine">Maroon Love (Valentine 💖)</option>
                          <option value="gradient-midnight">Classic Midnight (General 🌟)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={downloadPoster}
                      className="w-full mt-4 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer box-border font-sans shadow-sm"
                    >
                      <Download size={14} />
                      Download 3:4 Custom Campaign Flyer
                    </button>
                  </div>
                </div>
              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="flex items-center justify-between border-t border-slate-150 pt-4 select-none font-sans">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  ⇠ Back to AI Strategy (Step 2)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  ↩ Start New Campaign Builder
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center">
              <Sparkles size={30} className="text-amber-400 mx-auto mb-3" />
              <h4 className="text-xs font-bold text-slate-950 font-mono tracking-widest uppercase mb-1">No Active Theme</h4>
              <p className="text-xs text-slate-400">Please choose a campaign theme in Step 1 first.</p>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                Go to Step 1
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
