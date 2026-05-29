import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Store,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { RadioGroup } from "./RadioGroup";
import { supabase } from "../utils/supabase";
import { useAuth } from "../contexts/AuthContext";
import { BusinessOnboarding } from "../types";

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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);
  
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

    const onboardingData: BusinessOnboarding = {
      user_id: user.id,
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

      // Also update the shop config in App state via onComplete
      const aiSummary = `Business Profile Saved! Based on your goal of ${formData.business_goal} and ${formData.bot_personality} personality, Sales Brain AI is now optimized for your ${formData.business_category} store.`;
      
      onComplete({
        shopName: formData.business_name,
        ownerName: user.email?.split('@')[0] || "Owner"
      }, aiSummary);

    } catch (err: any) {
      console.error("Error saving onboarding data:", err);
      setSaving(false);
      setStep(3);
      alert(`Failed to save onboarding data: ${err.message || "Unknown error"}. Please ensure you have run the database setup SQL.`);
    }
  };

  const currentStepLabel = () => {
    if (lang === "my") {
      switch (step) {
        case 1: return "လုပ်ငန်းအခြေခံ အချက်အလက်";
        case 2: return "လုပ်ငန်းလည်ပတ်မှု ပုံစံ";
        case 3: return "ဘော့တ် မဟာဗျူဟာ";
        default: return "အချက်အလက် သိမ်းဆည်းနေပါသည်";
      }
    } else {
      switch (step) {
        case 1: return "Business Basics";
        case 2: return "Operations";
        case 3: return "Bot Strategy";
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
              {lang === "my" ? `အဆင့် ${step} / ၃` : `Step ${step} of 3`}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
                {currentStepLabel()}
              </h1>
              <span className="text-[10px] font-bold text-indigo-500 font-mono">
                {Math.round(((step - 1) / 3) * 100)}% Completed
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/20">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
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
