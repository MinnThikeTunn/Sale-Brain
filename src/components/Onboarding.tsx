import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Smartphone,
  Shirt,
  Utensils,
  ShoppingBasket,
  Globe,
  Home,
  TrendingDown,
  UserPlus,
  Users,
  Archive,
  Megaphone,
  Truck,
  TrendingUp,
  Sparkles,
  Heart,
  Share2,
  ArrowRight,
  ArrowLeft,
  Check,
  Store,
  Compass,
  Briefcase,
  Layers,
  HelpCircle,
  FileText,
  CreditCard,
  Package,
  Target,
  Smile
} from "lucide-react";
import { supabase } from "../utils/supabase";
import { BusinessOnboarding } from "../types";

interface OnboardingProps {
  lang: "en" | "my";
  onComplete: (data: BusinessOnboarding, aiSummary: string) => void;
  initialShopName?: string;
  initialOwnerName?: string;
  onLangChange?: (l: "en" | "my") => void;
}

export function Onboarding({
  lang,
  onComplete,
  initialShopName = "",
  initialOwnerName = "",
  onLangChange
}: OnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 5 is processing
  const [formData, setFormData] = useState<BusinessOnboarding>({
    business_name: initialShopName || "",
    business_category: "",
    selling_platform: "",
    weekly_order_volume: "",
    payment_method: "",
    delivery_method: "",
    business_goal: "",
    bot_personality: "Friendly"
  });

  const [error, setError] = useState<string | null>(null);

  // Options Definitions
  const categoriesList = [
    { id: "Electronics & Gadgets", labelEn: "Electronics & Gadgets", labelMy: "လျှပ်စစ်နှင့် စမတ်ပစ္စည်းများ", icon: Smartphone },
    { id: "Fashion & Clothing", labelEn: "Fashion & Clothing", labelMy: "ဖက်ရှင်နှင့် အဝတ်အထည်", icon: Shirt },
    { id: "Food, FMCG & Groceries", labelEn: "Food, FMCG & Groceries", labelMy: "စားသောက်ဖွယ်ရာနှင့် လူသုံးကုန်", icon: ShoppingBasket },
    { id: "Digital Products & Services", labelEn: "Digital Products & Services", labelMy: "ဒစ်ဂျစ်တယ် ဝန်ဆောင်မှုများ", icon: Globe },
    { id: "Home & Lifestyle Products", labelEn: "Home & Lifestyle Products", labelMy: "အိမ်သုံးနှင့် လူနေမှုအသုံးအဆောင်", icon: Home }
  ];

  const platformsList = [
    { id: "Facebook", labelEn: "Facebook", labelMy: "ဖေ့စ်ဘွတ်ခ်" },
    { id: "Telegram", labelEn: "Telegram", labelMy: "တယ်လီဂရမ်" },
    { id: "Website", labelEn: "Website", labelMy: "ဝဘ်ဆိုက်" },
    { id: "Physical Store", labelEn: "Physical Store", labelMy: "ဆိုင်တိုက်ရိုက်" },
    { id: "Marketplace", labelEn: "Marketplace", labelMy: "ပလက်ဖောင်းများ" },
    { id: "Multiple Channels", labelEn: "Multiple Channels", labelMy: "ချန်နယ်စုံ" }
  ];

  const volumesList = [
    { id: "1-10", labelEn: "1-10 Orders", labelMy: "၁ - ၁၀ အော်ဒါ" },
    { id: "11-50", labelEn: "11-50 Orders", labelMy: "၁၁ - ၅၀ အော်ဒါ" },
    { id: "51-100", labelEn: "51-100 Orders", labelMy: "၅၁ - ၁၀၀ အော်ဒါ" },
    { id: "100+", labelEn: "100+ Orders", labelMy: "၁၀၀ ကျော်" }
  ];

  const paymentsList = [
    { id: "Cash on Delivery", labelEn: "Cash on Delivery", labelMy: "ပစ္စည်းရောက်ငွေချေ" },
    { id: "KBZPay", labelEn: "KBZPay", labelMy: "KBZPay" },
    { id: "WavePay", labelEn: "WavePay", labelMy: "WavePay" },
    { id: "Bank Transfer", labelEn: "Bank Transfer", labelMy: "ဘဏ်မှတဆင့်ပေးချေမှု" },
    { id: "Mixed Payments", labelEn: "Mixed Payments", labelMy: "ပေးချေမှုစုံ" }
  ];

  const deliveriesList = [
    { id: "Own Delivery Team", labelEn: "Own Delivery Team", labelMy: "ကိုယ်ပိုင်ပို့ဆောင်ရေး" },
    { id: "Delivery Service", labelEn: "Delivery Service", labelMy: "ပို့ဆောင်ရေးဝန်ဆောင်မှု" },
    { id: "Bus Gate", labelEn: "Bus Gate", labelMy: "ကားဂိတ်မှတဆင့်" },
    { id: "Digital Delivery", labelEn: "Digital Delivery", labelMy: "အွန်လိုင်းမှတဆင့်" },
    { id: "In-store Pickup", labelEn: "In-store Pickup", labelMy: "ဆိုင်လာယူခြင်း" }
  ];

  const goalsList = [
    { id: "Increase Sales", labelEn: "Increase Sales", labelMy: "ရောင်းအားမြှင့်တင်ရန်" },
    { id: "Customer Support Automation", labelEn: "Customer Support Automation", labelMy: "ဖောက်သည်ဝန်ဆောင်မှု" },
    { id: "Order Management", labelEn: "Order Management", labelMy: "အော်ဒါစီမံခန့်ခွဲမှု" },
    { id: "Product Recommendations", labelEn: "Product Recommendations", labelMy: "ပစ္စည်းအကြံပြုချက်များ" },
    { id: "Marketing & Promotions", labelEn: "Marketing & Promotions", labelMy: "မားကက်တင်းနှင့် ပရိုမိုးရှင်း" }
  ];

  const personalitiesList = [
    { id: "Professional", labelEn: "Professional", labelMy: "ကျွမ်းကျင်ပိုင်နိုင်သော" },
    { id: "Friendly", labelEn: "Friendly", labelMy: "ဖော်ရွေသော" },
    { id: "Fast & Short Replies", labelEn: "Fast & Short Replies", labelMy: "မြန်ဆန်သွက်လက်သော" },
    { id: "Detailed Explainer", labelEn: "Detailed Explainer", labelMy: "အသေးစိတ်ရှင်းပြသော" },
    { id: "Casual Myanmar Style", labelEn: "Casual Myanmar Style", labelMy: "မြန်မာဆန်ဆန် ဖော်ရွေသော" }
  ];

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.business_name.trim() !== "" && formData.business_category !== "";
      case 2:
        return formData.selling_platform !== "" && formData.weekly_order_volume !== "";
      case 3:
        return formData.payment_method !== "" && formData.delivery_method !== "";
      case 4:
        return formData.business_goal !== "" && formData.bot_personality !== "";
      default:
        return true;
    }
  };

  const handleFinalSubmit = async () => {
    setStep(5);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: insertError } = await supabase
        .from('business_onboarding')
        .insert([
          {
            user_id: user?.id,
            business_name: formData.business_name,
            business_category: formData.business_category,
            selling_platform: formData.selling_platform,
            weekly_order_volume: formData.weekly_order_volume,
            payment_method: formData.payment_method,
            delivery_method: formData.delivery_method,
            business_goal: formData.business_goal,
            bot_personality: formData.bot_personality,
            onboarding_completed: true
          }
        ]);

      if (insertError) throw insertError;

      onComplete(formData, "Onboarding completed successfully! Your personalized SME dashboard is ready.");
    } catch (err: any) {
      console.error("Onboarding submission error:", err);
      setError(err.message || "Failed to save onboarding data. Please try again.");
      setStep(4);
    }
  };

  const currentStepLabel = () => {
    if (lang === "my") {
      switch (step) {
        case 1: return "လုပ်ငန်းသတင်းအချက်အလက်";
        case 2: return "အရောင်းနှင့် ပမာဏ";
        case 3: return "ငွေပေးချေမှုနှင့် ပို့ဆောင်ရေး";
        case 4: return "ရည်မှန်းချက်နှင့် AI စရိုက်";
        default: return "စီစစ်နေသည်";
      }
    } else {
      switch (step) {
        case 1: return "Business Identity";
        case 2: return "Sales & Volume";
        case 3: return "Payments & Logistics";
        case 4: return "Goals & AI Persona";
        default: return "Processing";
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-sky-300/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl space-y-8 relative z-20">
        
        {/* Progress Stepper */}
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-[9px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl border border-slate-200/50 w-full gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <Compass size={12} className="text-indigo-500" />
              <span>{lang === "my" ? "လုပ်ငန်းလမ်းညွှန်" : "BUSINESS ONBOARDING"}</span>
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-200/60 p-0.5 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => onLangChange?.("en")}
                className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                  lang === "en" ? "bg-black text-white" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLangChange?.("my")}
                className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                  lang === "my" ? "bg-black text-white" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                မြန်မာ
              </button>
            </div>

            <div className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md shrink-0">
              {lang === "my" ? `အဆင့် ${step > 4 ? 4 : step} / ၄` : `Step ${step > 4 ? 4 : step} of 4`}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
                {currentStepLabel()}
              </h1>
              <span className="text-[10px] font-bold text-indigo-500 font-mono">
                {Math.round(((step - 1) / 4) * 100)}% Completed
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/20">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500 ease-out"
                style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-slate-200/75 rounded-3xl p-6 sm:p-8 shadow-sm h-full flex flex-col min-h-[460px] justify-between relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex-1"
              >
                <div className="space-y-4">
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
                        placeholder="e.g., Shwe Pathein Sweets"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-10.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "လုပ်ငန်းအမျိုးအစား" : "Business Category"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categoriesList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setFormData({ ...formData, business_category: item.id })}
                          className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                            formData.business_category === item.id
                              ? "bg-indigo-50/50 border-indigo-600 shadow-inner"
                              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <div className={`p-2 rounded-xl border ${
                            formData.business_category === item.id ? "bg-indigo-600 text-white border-indigo-100" : "bg-slate-50 text-slate-400"
                          }`}>
                            <item.icon size={14} />
                          </div>
                          <span className="text-[10.5px] font-bold text-slate-800">
                            {lang === "my" ? item.labelMy : item.labelEn}
                          </span>
                          {formData.business_category === item.id && (
                            <div className="ml-auto w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                              <Check size={9} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex-1"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "အရောင်းပလက်ဖောင်း" : "Selling Platform"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {platformsList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setFormData({ ...formData, selling_platform: item.id })}
                          className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                            formData.selling_platform === item.id
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-[10px] font-bold">
                            {lang === "my" ? item.labelMy : item.labelEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "အပတ်စဉ် အော်ဒါပမာဏ" : "Weekly Order Volume"}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {volumesList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setFormData({ ...formData, weekly_order_volume: item.id })}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            formData.weekly_order_volume === item.id
                              ? "bg-indigo-50 border-indigo-600"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-[11px] font-bold text-slate-800">
                            {lang === "my" ? item.labelMy : item.labelEn}
                          </span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            formData.weekly_order_volume === item.id ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                          }`}>
                            {formData.weekly_order_volume === item.id && <Check size={10} strokeWidth={3} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex-1"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "ငွေပေးချေမှုပုံစံ" : "Payment Method"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paymentsList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setFormData({ ...formData, payment_method: item.id })}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                            formData.payment_method === item.id
                              ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <CreditCard size={14} className={formData.payment_method === item.id ? "text-indigo-400" : "text-slate-400"} />
                          <span className="text-[10.5px] font-bold">
                            {lang === "my" ? item.labelMy : item.labelEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "ပို့ဆောင်ရေးပုံစံ" : "Delivery Method"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {deliveriesList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setFormData({ ...formData, delivery_method: item.id })}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                            formData.delivery_method === item.id
                              ? "bg-indigo-50 border-indigo-600 text-slate-900"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <Package size={14} className={formData.delivery_method === item.id ? "text-indigo-600" : "text-slate-400"} />
                          <span className="text-[10.5px] font-bold">
                            {lang === "my" ? item.labelMy : item.labelEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex-1"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "အဓိကလုပ်ငန်းရည်မှန်းချက်" : "Main Business Goal"}
                    </label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {goalsList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setFormData({ ...formData, business_goal: item.id })}
                          className={`p-3 px-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            formData.business_goal === item.id
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Target size={14} className={formData.business_goal === item.id ? "text-sky-400" : "text-slate-400"} />
                            <span className="text-[10.5px] font-bold">
                              {lang === "my" ? item.labelMy : item.labelEn}
                            </span>
                          </div>
                          {formData.business_goal === item.id && <Check size={12} strokeWidth={3} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "AI Bot စရိုက်" : "AI Bot Personality"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {personalitiesList.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, bot_personality: item.id })}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            formData.bot_personality === item.id
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {lang === "my" ? item.labelMy : item.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
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
                    {lang === "my" ? "သိမ်းဆည်းနေပါသည်..." : "Finalizing Setup..."}
                  </h3>
                  <p className="text-xs text-slate-400/85 max-w-sm leading-relaxed mx-auto font-medium">
                    {lang === "my"
                      ? "သင့်လုပ်ငန်းအချက်အလက်များကို စနစ်အတွင်း ထည့်သွင်းသိမ်းဆည်းနေပါသည်"
                      : "Storing your business preferences and configuring your AI agent personality."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-bold text-center">
              {error}
            </div>
          )}

          {/* Navigation */}
          {step <= 4 && (
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
                  if (step === 4) {
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
                <span>{step === 4 ? (lang === "my" ? "အချက်အလက်သိမ်းမည်" : "Finish Setup") : (lang === "my" ? "ရှေ့သို့" : "Next")}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
