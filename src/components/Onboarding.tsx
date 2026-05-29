import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { RadioGroup } from "./RadioGroup";
import { supabase } from "../utils/supabase";
import { useAuth } from "../contexts/AuthContext";
import { BusinessOnboarding } from "../types";
import { generateShopId, buildShopPublicUrl } from "../utils/shopId";

interface OnboardingProps {
  lang: "en" | "my";
  onComplete: (profile: any, aiSummary: string) => void;
  initialShopName?: string;
  initialOwnerName?: string;
  onLangChange?: (l: "en" | "my") => void;
}

export function Onboarding({
  lang,
  onComplete,
  initialShopName = "",
  onLangChange
}: OnboardingProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [saving, setSaving] = useState(false);
  const [generatedShopId, setGeneratedShopId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: initialShopName || "",
    business_category: "",
    selling_platform: "",
    weekly_order_volume: "",
    payment_method: "",
    delivery_method: "",
    business_goal: "",
    bot_personality: "Friendly"
  });

  const categories = [
    { id: "Electronics & Gadgets", labelEn: "Electronics & Gadgets", labelMy: "လျှပ်စစ်နှင့် စမတ်ပစ္စည်းများ" },
    { id: "Fashion & Clothing", labelEn: "Fashion & Clothing", labelMy: "ဖက်ရှင်နှင့် အဝတ်အထည်" },
    { id: "Food, FMCG & Groceries", labelEn: "Food, FMCG & Groceries", labelMy: "စားသောက်ဖွယ်ရာနှင့် လူသုံးကုန်" },
    { id: "Digital Products & Services", labelEn: "Digital Products & Services", labelMy: "ဒစ်ဂျစ်တယ် ဝန်ဆောင်မှုများ" },
    { id: "Home & Lifestyle Products", labelEn: "Home & Lifestyle Products", labelMy: "အိမ်သုံးနှင့် လူနေမှုအသုံးအဆောင်" }
  ];

  const platforms = [
    { id: "Facebook", labelEn: "Facebook", labelMy: "ဖေ့စ်ဘွတ်ခ်" },
    { id: "Telegram", labelEn: "Telegram", labelMy: "တယ်လီဂရမ်" },
    { id: "Website", labelEn: "Website", labelMy: "ဝဘ်ဆိုက်" },
    { id: "Physical Store", labelEn: "Physical Store", labelMy: "ဆိုင်တိုက်ရိုက်" },
    { id: "Marketplace", labelEn: "Marketplace", labelMy: "Marketplace" },
    { id: "Multiple Channels", labelEn: "Multiple Channels", labelMy: "ချန်နယ်စုံ" }
  ];

  const volumes = [
    { id: "1-10", labelEn: "1-10", labelMy: "၁-၁၀" },
    { id: "11-50", labelEn: "11-50", labelMy: "၁၁-၅၀" },
    { id: "51-100", labelEn: "51-100", labelMy: "၅၁-၁၀၀" },
    { id: "100+", labelEn: "100+", labelMy: "၁၀၀ ကျော်" }
  ];

  const payments = [
    { id: "Cash on Delivery", labelEn: "Cash on Delivery", labelMy: "ပစ္စည်းရောက်ငွေချေ" },
    { id: "KBZPay", labelEn: "KBZPay", labelMy: "KBZPay" },
    { id: "WavePay", labelEn: "WavePay", labelMy: "WavePay" },
    { id: "Bank Transfer", labelEn: "Bank Transfer", labelMy: "ဘဏ်မှတဆင့်ပေးချေမှု" },
    { id: "Mixed Payments", labelEn: "Mixed Payments", labelMy: "ပေးချေမှုစုံ" }
  ];

  const deliveries = [
    { id: "Own Delivery Team", labelEn: "Own Delivery Team", labelMy: "ကိုယ်ပိုင်ပို့ဆောင်ရေး" },
    { id: "Delivery Service", labelEn: "Delivery Service", labelMy: "ပို့ဆောင်ရေးဝန်ဆောင်မှု" },
    { id: "Bus Gate", labelEn: "Bus Gate", labelMy: "ကားဂိတ်မှတဆင့်" },
    { id: "Digital Delivery", labelEn: "Digital Delivery", labelMy: "ဒစ်ဂျစ်တယ် ပို့ဆောင်မှု" },
    { id: "In-store Pickup", labelEn: "In-store Pickup", labelMy: "ဆိုင်သို့လာရောက်ယူရန်" }
  ];

  const goals = [
    { id: "Increase Sales", labelEn: "Increase Sales", labelMy: "အရောင်းမြှင့်တင်ရန်" },
    { id: "Customer Support Automation", labelEn: "Customer Support Automation", labelMy: "ဝယ်သူဝန်ဆောင်မှု အလိုအလျောက်လုပ်ရန်" },
    { id: "Order Management", labelEn: "Order Management", labelMy: "အော်ဒါစီမံခန့်ခွဲရန်" },
    { id: "Product Recommendations", labelEn: "Product Recommendations", labelMy: "ပစ္စည်းအကြံပြုချက်များပေးရန်" },
    { id: "Marketing & Promotions", labelEn: "Marketing & Promotions", labelMy: "မားကက်တင်းနှင့် ပရိုမိုးရှင်းများ" }
  ];

  const personalities = [
    { id: "Professional", labelEn: "Professional", labelMy: "ကျွမ်းကျင်ပိုင်နိုင်သောပုံစံ" },
    { id: "Friendly", labelEn: "Friendly", labelMy: "ဖော်ရွေသောပုံစံ" },
    { id: "Fast & Short Replies", labelEn: "Fast & Short Replies", labelMy: "လျင်မြန်ပြီး တိုတိုတုတ်တုတ်" },
    { id: "Detailed Explainer", labelEn: "Detailed Explainer", labelMy: "အသေးစိတ် ရှင်းပြပေးသောပုံစံ" },
    { id: "Casual Myanmar Style", labelEn: "Casual Myanmar Style", labelMy: "မြန်မာဆန်ဆန် ပေါ့ပေါ့ပါးပါး" }
  ];

  const isStepValid = () => {
    if (step === 1) {
      return formData.business_name.trim() !== "" && formData.business_category !== "" && formData.selling_platform !== "";
    }
    if (step === 2) {
      return formData.weekly_order_volume !== "" && formData.payment_method !== "" && formData.delivery_method !== "";
    }
    if (step === 3) {
      return formData.business_goal !== "" && formData.bot_personality !== "";
    }
    return true;
  };

  const handleFinalSubmit = async () => {
    if (!user) return;
    setSaving(true);
    setStep(4);

    const shopId = generateShopId();
    setGeneratedShopId(shopId);

    const onboardingData: BusinessOnboarding = {
      user_id: user.id,
      shop_id: shopId,
      business_name: formData.business_name,
      business_category: formData.business_category,
      selling_platform: formData.selling_platform,
      weekly_order_volume: formData.weekly_order_volume,
      payment_method: formData.payment_method,
      delivery_method: formData.delivery_method,
      business_goal: formData.business_goal,
      bot_personality: formData.bot_personality,
      onboarding_completed: true
    };

    try {
      const { error } = await supabase
        .from('business_onboarding')
        .upsert(onboardingData, { onConflict: 'user_id' });

      if (error) throw error;

      setTimeout(() => {
        setStep(5);
        setSaving(false);
      }, 2000);

    } catch (err: any) {
      console.error("Error saving onboarding data:", err);
      setSaving(false);
      setStep(3);
      alert(`Failed to save onboarding data: ${err.message || "Unknown error"}. Please ensure you have run the database setup SQL.`);
    }
  };

  const handleComplete = () => {
    if (!user) return;
    const aiSummary = `Business Profile Saved! Based on your goal of ${formData.business_goal} and ${formData.bot_personality} personality, Sales Brain AI is now optimized for your ${formData.business_category} store.`;
    
    onComplete({
      shopName: formData.business_name,
      ownerName: user.email?.split('@')[0] || "Owner",
      shopId: generatedShopId
    }, aiSummary);
  };

  const copyToClipboard = () => {
    const url = buildShopPublicUrl(generatedShopId);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStepLabel = () => {
    if (lang === "my") {
      switch (step) {
        case 1: return "လုပ်ငန်းအခြေခံ အချက်အလက်";
        case 2: return "လုပ်ငန်းလည်ပတ်မှု ပုံစံ";
        case 3: return "ဘော့တ် မဟာဗျူဟာ";
        case 5: return "ဂုဏ်ယူပါတယ်";
        default: return "အချက်အလက် သိမ်းဆည်းနေပါသည်";
      }
    } else {
      switch (step) {
        case 1: return "Business Basics";
        case 2: return "Operations";
        case 3: return "Bot Strategy";
        case 5: return "Congratulations";
        default: return "Processing";
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-sky-300/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-3xl space-y-8 relative z-20">
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-[9px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl border border-slate-200/50 w-full gap-2">
            <div className="flex items-center gap-1.5">
              <Compass size={12} className="text-indigo-500" />
              <span>{lang === "my" ? "အရောင်းဆိုင် အေအိုင် လုပ်ငန်းလမ်းညွှန်" : "SALES BRAIN AI ONBOARDING"}</span>
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-200/60 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => onLangChange?.("en")}
                className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all ${
                  lang === "en" ? "bg-black text-white" : "text-slate-500"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLangChange?.("my")}
                className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all ${
                  lang === "my" ? "bg-black text-white" : "text-slate-500"
                }`}
              >
                မြန်မာ
              </button>
            </div>

            <div className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
              {step === 5 ? (lang === "my" ? "ပြီးစီးပါပြီ" : "Done") : (lang === "my" ? `အဆင့် ${step} / ၃` : `Step ${step} of 3`)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
                {currentStepLabel()}
              </h1>
              <span className="text-[10px] font-bold text-indigo-500 font-mono">
                {step === 5 ? "100" : Math.round(((step - 1) / 3) * 100)}% Completed
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/20">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500 ease-out"
                style={{ width: `${step === 5 ? 100 : (step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/75 rounded-3xl p-6 sm:p-8 shadow-sm h-full flex flex-col min-h-[460px] justify-between relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                    {lang === "my" ? "လုပ်ငန်းအမည်" : "Business Name"}
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-[13px] text-slate-400" size={14} />
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      placeholder={lang === "my" ? "ဥပမာ - ရွှေပုသိမ် ဟလာဝါ" : "e.g., Shwe Pathein Halawa"}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-10.5"
                    />
                  </div>
                </div>

                <RadioGroup
                  label={lang === "my" ? "လုပ်ငန်းအမျိုးအစား" : "Business Category"}
                  options={categories}
                  value={formData.business_category}
                  onChange={(val) => setFormData({ ...formData, business_category: val })}
                  lang={lang}
                />

                <RadioGroup
                  label={lang === "my" ? "အရောင်းပလက်ဖောင်း" : "Selling Platform"}
                  options={platforms}
                  value={formData.selling_platform}
                  onChange={(val) => setFormData({ ...formData, selling_platform: val })}
                  lang={lang}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <RadioGroup
                  label={lang === "my" ? "အပတ်စဉ် အော်ဒါပမာဏ" : "Weekly Order Volume"}
                  options={volumes}
                  value={formData.weekly_order_volume}
                  onChange={(val) => setFormData({ ...formData, weekly_order_volume: val })}
                  lang={lang}
                />

                <RadioGroup
                  label={lang === "my" ? "ငွေပေးချေမှုစနစ်" : "Payment Method"}
                  options={payments}
                  value={formData.payment_method}
                  onChange={(val) => setFormData({ ...formData, payment_method: val })}
                  lang={lang}
                />

                <RadioGroup
                  label={lang === "my" ? "ပို့ဆောင်မှုစနစ်" : "Delivery Method"}
                  options={deliveries}
                  value={formData.delivery_method}
                  onChange={(val) => setFormData({ ...formData, delivery_method: val })}
                  lang={lang}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <RadioGroup
                  label={lang === "my" ? "အဓိက လုပ်ငန်းရည်မှန်းချက်" : "Main Business Goal"}
                  options={goals}
                  value={formData.business_goal}
                  onChange={(val) => setFormData({ ...formData, business_goal: val })}
                  lang={lang}
                />

                <RadioGroup
                  label={lang === "my" ? "AI Bot စရိုက်လက္ခဏာ" : "AI Bot Personality"}
                  options={personalities}
                  value={formData.bot_personality}
                  onChange={(val) => setFormData({ ...formData, bot_personality: val })}
                  lang={lang}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col justify-center items-center text-center space-y-6 min-h-[350px]"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xl text-indigo-600">
                    <Sparkles className="animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold tracking-widest uppercase font-mono text-indigo-600 animate-pulse">
                    {lang === "my" ? "အချက်အလက်များ သိမ်းဆည်းနေပါသည်..." : "Saving Your Business Profile..."}
                  </h3>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col justify-center items-center text-center space-y-8 py-4"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <Check size={40} />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-extrabold text-slate-800">
                    {lang === "my" ? "အချက်အလက်များ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ" : "Your Shop is Ready!"}
                  </h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    {lang === "my" 
                      ? "သင်၏ အွန်လိုင်းအရောင်းဆိုင်အတွက် အေအိုင်စနစ်ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။ အောက်ပါလင့်ခ်ကို အသုံးပြု၍ သင်၏ ဆိုင်ကို ဝင်ရောက်ကြည့်ရှုနိုင်ပါသည်။" 
                      : "We've generated a unique link for your shop. You can use this link to access your store or share it with your customers."}
                  </p>
                </div>

                <div className="w-full max-w-md space-y-3">
                  <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider text-left">
                    {lang === "my" ? "သင်၏ ဆိုင်လင့်ခ်" : "Your Shop Link"}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-slate-600 truncate flex items-center">
                      {buildShopPublicUrl(generatedShopId)}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className={`px-4 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
                        copied 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? (lang === "my" ? "ကူးယူပြီး" : "Copied") : (lang === "my" ? "ကူးမည်" : "Copy")}</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 w-full max-w-md pt-4">
                  <a
                    href={buildShopPublicUrl(generatedShopId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <ExternalLink size={14} />
                    {lang === "my" ? "ဆိုင်ကို ကြည့်မည်" : "Visit Store"}
                  </a>
                  <button
                    onClick={handleComplete}
                    className="flex-1 bg-black text-white font-bold py-3.5 rounded-2xl text-xs hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
                  >
                    {lang === "my" ? "ဒက်ရှ်ဘုတ်သို့ သွားမည်" : "Go to Dashboard"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 4 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6 shrink-0">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={12} />
                <span>{lang === "my" ? "နောက်သို့" : "Back"}</span>
              </button>

              <button
                type="button"
                disabled={!isStepValid()}
                onClick={() => {
                  if (step === 3) {
                    handleFinalSubmit();
                  } else {
                    setStep((prev) => (prev + 1) as any);
                  }
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-semibold text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center gap-1.5 ${
                  isStepValid()
                    ? "bg-black hover:bg-slate-800 shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>{step === 3 ? (lang === "my" ? "သိမ်းဆည်းမည်" : "Finish & Save") : (lang === "my" ? "ရှေ့သို့" : "Next")}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
