"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../utils/supabase";
import { Product } from "../types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ShopChatbotProps {
  shopId: string;
  businessName: string;
  fullPage?: boolean;
  suggestedPrompts?: string[];
  products?: Product[];
  onOpenInfo?: () => void;
}

type Language = "en" | "my";

const MYANMAR_COPY = {
  eyebrow: "AI အရောင်း Chat",
  online: "အွန်လိုင်း",
  greeting: "ဘာရှာပေးရမလဲ?",
  helper: "ပစ္စည်း၊ ပို့ဆောင်မှု၊ ငွေပေးချေမှု၊ စတော့ အကြောင်း မေးနိုင်ပါတယ်။",
  placeholder: "ဆိုင် assistant ကို စာပို့ပါ...",
  send: "ပို့",
  thinking: "စဉ်းစားနေပါတယ်...",
  error: "တုံ့ပြန်လို့မရပါဘူး။ ထပ်စမ်းကြည့်ပါ။",
  connectionError: "ချိတ်ဆက်မှု ပြဿနာရှိပါတယ်။ ထပ်စမ်းကြည့်ပါ။",
  quickPrompts: "အမြန်မေးခွန်းများ",
  productsTitle: "ရနိုင်သော ပစ္စည်းများ",
  productsHint: "များကို scroll လုပ်ကြည့်ပါ။",
  info: "ဆိုင် info",
  language: "ဘာသာစကား",
  openChat: "Chat ဖွင့်ရန်",
  closeChat: "Chat ပိတ်ရန်",
};

const ENGLISH_COPY = {
  eyebrow: "AI Sales Chat",
  online: "Online",
  greeting: "What can I help you find?",
  helper: "Ask about products, delivery, payment, or stock.",
  placeholder: "Message the shop assistant...",
  send: "Send",
  thinking: "Thinking...",
  error: "Sorry, I couldn't respond. Try again.",
  connectionError: "Connection error. Please try again.",
  quickPrompts: "Quick prompts",
  productsTitle: "Available products",
  productsHint: "Scroll sideways through the cards.",
  info: "Shop info",
  language: "Language",
  openChat: "Open chat",
  closeChat: "Close chat",
};

export function ShopChatbot({
  shopId,
  businessName,
  fullPage = false,
  suggestedPrompts = [],
  products = [],
  onOpenInfo,
}: ShopChatbotProps) {
  const [open, setOpen] = useState(fullPage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [composerExpanded, setComposerExpanded] = useState(false);
  
  // NEW: Local Chat State (Mimicking the backend agent)
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("greeting");

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerInputRef = useRef<HTMLTextAreaElement>(null);
  const hasStarted = messages.length > 0;
  const copy = language === "en" ? ENGLISH_COPY : MYANMAR_COPY;

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  // NEW: Calculate Total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = products.find(prod => prod.id === item.productId);
      return sum + (p ? p.price * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  useEffect(() => {
    if (!sessionId) {
      const stored = localStorage.getItem(`shop_session_${shopId}`);
      if (stored) setSessionId(stored);
      else {
        const id = `pub_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem(`shop_session_${shopId}`, id);
        setSessionId(id);
      }
    }
  }, [shopId]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    requestAnimationFrame(() => {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, loading]);

  function localizePrompt(prompt: string) {
    if (language === "en") return prompt;

    if (prompt === "What products do you sell?") {
      return "ဘာပစ္စည်းတွေ ရောင်းပါသလဲ?";
    }

    if (prompt === "What are your delivery options?") {
      return "ပို့ဆောင်မှု ရွေးချယ်စရာတွေက ဘာတွေလဲ?";
    }

    if (prompt === "What payment methods do you accept?") {
      return "ဘယ်ငွေပေးချေမှုနည်းလမ်းတွေ လက်ခံပါသလဲ?";
    }

    if (prompt === "Recommend a product for me") {
      return "ကျွန်တော်/ကျွန်မအတွက် ပစ္စည်းတစ်ခု ညွှန်းပေးပါ";
    }

    const productMatch = prompt.match(/^Tell me about (.+)$/);
    if (productMatch?.[1]) {
      return `${productMatch[1]} အကြောင်း ပြောပြပါ`;
    }

    return prompt;
  }

  function shouldShowProductCards(index: number) {
    if (!featuredProducts.length || messages[index]?.role !== "assistant") {
      return false;
    }

    const previousUserMessage = [...messages]
      .slice(0, index)
      .reverse()
      .find((message) => message.role === "user")?.content;

    return Boolean(
      previousUserMessage &&
        /(what products|products do you sell|catalog|show.*products|recommend|available products|ဘာပစ္စည်း|ပစ္စည်း)/i.test(
          previousUserMessage
        )
    );
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setComposerExpanded(false);
    if (composerInputRef.current) {
      composerInputRef.current.style.height = "44px";
    }
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      // 1. Try Supabase Edge Function first
      console.log("[Chatbot] Attempting backend chat...");
      const { data, error } = await supabase.functions.invoke("shop", {
        body: {
          action: "chat",
          shopId,
          sessionId,
          content: trimmed
        }
      });

      if (!error && data?.session) {
        const session = data.session;
        const lastMsg = session.messages[session.messages.length - 1];
        if (lastMsg && lastMsg.sender === "bot") {
          // Check if the backend returned the "syncing" fallback message
          if (lastMsg.content.includes("direct pipeline is syncing")) {
            console.warn("[Chatbot] Backend AI is syncing. Forcing frontend fallback.");
          } else {
            setMessages((current) => [
              ...current,
              { role: "assistant", content: lastMsg.content },
            ]);
            setLoading(false);
            return;
          }
        }
      } else if (error) {
        console.warn("[Chatbot] Supabase function error:", error);
      }
      
      // 2. Fallback: Call Gemini Directly
      console.log("[Chatbot] Calling direct Gemini AI via fetch...");
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "undefined" || apiKey === "") {
        console.error("[Chatbot] ERROR: VITE_GEMINI_API_KEY is missing or invalid.");
        setMessages((current) => [
          ...current,
          { role: "assistant", content: "Configuration Error: API Key is missing. Please check Vercel settings and REDEPLOY." },
        ]);
        setLoading(false);
        return;
      }

      // Build a mini-knowledge base from the products prop
      const productContext = products && products.length > 0 
        ? `Here are our products:\n${products.map(p => `- ${p.name} (ID: ${p.id}): ${p.price} MMK (${p.stock} left). ${p.description}`).join("\n")}`
        : "We are currently updating our product catalog.";

      const systemPrompt = `You are "Candy", a sweet, charming, and professional AI assistant for the shop "${businessName}". 
      You speak a mix of Myanmar (Burmese) and English (soft and polite).
      
      SHOP CONTEXT:
      ${productContext}
      
      CUSTOMER STATE:
      - Current Cart: ${JSON.stringify(cart)}
      - Current Total: ${cartTotal} MMK
      - Step: ${currentStep}
      
      INSTRUCTIONS:
      1. If the customer wants to buy/add a product, reply with your charming text AND include a special tag: [ACTION:ADD, ID:product_id]. 
      2. If they ask about total/checkout, reply with the total AND tag: [ACTION:CHECKOUT].
      3. Be extremely polite (use particles like "shin"). Keep replies concise.
      
      Customer asked: ${trimmed}
      Candy's reply:`;

      try {
        console.log("[Chatbot] Sending fetch request to Gemini 3.1 Flash-Lite (v1)...");
        // Using the latest Gemini 3.1 Flash-Lite model (GA as of May 2026)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey.trim()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[Chatbot API Error Details]", errorData);
          throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
        }

        const resData = await response.json();
        const botText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!botText) throw new Error("Empty response from Gemini API");

        // Parse actions logic
        const actionMatch = botText.match(/\[ACTION:(.+?)\]/);
        if (actionMatch) {
          const actionStr = actionMatch[1];
          if (actionStr.startsWith("ADD, ID:")) {
            const prodId = actionStr.split("ID:")[1].trim();
            setCart(curr => {
              const existing = curr.find(c => c.productId === prodId);
              if (existing) return curr.map(c => c.productId === prodId ? { ...c, quantity: c.quantity + 1 } : c);
              return [...curr, { productId: prodId, quantity: 1 }];
            });
          } else if (actionStr === "CHECKOUT") {
            setCurrentStep("checkout");
          }
        }

        const cleanText = botText.replace(/\[ACTION:.+?\]/g, "").trim();
        setMessages((current) => [...current, { role: "assistant", content: cleanText }]);
      } catch (innerErr: any) {
        console.error("[Chatbot Gemini Fetch Error]", innerErr);
        let msg = "AI Error: ";
        if (innerErr.message?.includes("Failed to fetch")) msg += "Network blocked. Check VPN or Region restrictions.";
        else msg += (innerErr.message || "Unknown error");
        setMessages((current) => [...current, { role: "assistant", content: msg }]);
      }
    } catch (err: any) {
      console.error("[Chatbot Fatal Error]", err);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: `Error: ${err.message || "Could not connect to AI"}. Please try again.` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submitCurrentInput() {
    void sendMessage(input);
  }

  function resizeComposerInput(textarea: HTMLTextAreaElement) {
    textarea.style.height = "44px";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 44), 144);
    textarea.style.height = `${nextHeight}px`;
    setComposerExpanded(nextHeight > 52);
  }

  const languageToggle = (
    <div
      className="grid grid-cols-2 rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-semibold"
      aria-label={copy.language}
    >
      {(["en", "my"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          className={`rounded-full px-3 py-1.5 transition ${
            language === option
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {option === "en" ? "EN" : "မြန်"}
        </button>
      ))}
    </div>
  );

  const promptBar = suggestedPrompts.length > 0 && (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-1">
      <p className="text-xs font-medium text-slate-500">{copy.quickPrompts}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              void sendMessage(prompt);
            }}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            {localizePrompt(prompt)}
          </button>
        ))}
      </div>
    </div>
  );

  const productCards = (
    <div className="mt-3 w-full max-w-full">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {copy.productsTitle}
          </p>
          <p className="text-xs text-slate-500">
            {copy.productsHint} Showing {featuredProducts.length} of{" "}
            {products.length}.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {products.length}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {featuredProducts.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => void sendMessage(`Tell me about ${product.name}`)}
            className="w-52 shrink-0 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-3 text-center text-xs font-medium text-slate-500">
                  {product.name}
                </span>
              )}
            </div>
            <p className="mt-3 line-clamp-1 text-sm font-semibold text-slate-950">
              {product.name}
            </p>
            <p className="mt-1 line-clamp-2 min-h-[40px] text-xs leading-5 text-slate-500">
              {product.description || "Ask for details, price, and stock."}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-950">
                {product.price.toLocaleString()} MMK
              </span>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                  product.stock > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {product.stock > 0 ? `${product.stock} left` : "Out"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const composer = (
    <div
      className={`mx-auto grid w-full max-w-3xl grid-cols-[1fr_auto] rounded-[28px] border border-slate-200 bg-white py-2.5 pl-6 pr-4 shadow-[0_18px_60px_rgba(15,23,42,0.12)] sm:rounded-[34px] sm:pl-7 ${
        composerExpanded ? "gap-x-2 gap-y-1" : "items-end gap-2"
      }`}
    >
      <textarea
        ref={composerInputRef}
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
          resizeComposerInput(event.currentTarget);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submitCurrentInput();
          }
        }}
        placeholder={language === "en" ? "Ask anything" : "ဘာမဆို မေးပါ"}
        rows={1}
        className="col-start-1 h-11 max-h-36 min-h-11 resize-none overflow-y-auto bg-transparent py-2 text-[18px] leading-7 text-slate-950 outline-none placeholder:text-slate-400 sm:text-[20px]"
      />
      <div
        className={
          composerExpanded
            ? "col-start-2 row-start-2 flex justify-end"
            : "col-start-2 row-start-1 mb-0.5"
        }
      >
        <button
          type="button"
          onClick={submitCurrentInput}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-2xl font-medium leading-none text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:h-11 sm:w-11"
          aria-label={copy.send}
        >
          ↑
        </button>
      </div>
    </div>
  );

  const chatShell = (
    <div className="flex h-full min-h-0 flex-col bg-white text-slate-950">
      <div className="shrink-0 border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {onOpenInfo && (
              <button
                type="button"
                onClick={onOpenInfo}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
                aria-label={copy.info}
              >
                <span className="flex flex-col gap-1" aria-hidden="true">
                  <span className="h-0.5 w-4 rounded-full bg-current" />
                  <span className="h-0.5 w-4 rounded-full bg-current" />
                  <span className="h-0.5 w-4 rounded-full bg-current" />
                </span>
              </button>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {copy.eyebrow}
              </p>
              <h2 className="mt-1 truncate text-lg font-semibold text-slate-950">
                {businessName}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {languageToggle}
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:block">
              {copy.online}
            </div>
          </div>
        </div>
      </div>

      {!hasStarted ? (
        <div className="flex min-h-0 flex-1 items-center bg-slate-50/80 px-4 py-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl -translate-y-8 flex-col gap-5">
            <div className="text-center">
              <h3 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {copy.greeting}
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                {copy.helper}
              </p>
            </div>
            <div className="space-y-3">
              {promptBar}
              {composer}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 scroll-smooth overflow-y-auto overscroll-contain bg-slate-50/80 px-4 py-6 sm:px-6 no-scrollbar"
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className="space-y-3">
                  <div
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[92%] rounded-[26px] px-5 py-3 text-sm leading-7 shadow-sm sm:max-w-[78%] ${
                        message.role === "user"
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                  {shouldShowProductCards(index) && productCards}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-[26px] border border-slate-200 bg-white px-5 py-3 text-sm text-slate-500 shadow-sm">
                    {copy.thinking}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="space-y-3">
              {promptBar}
              {composer}
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (fullPage) {
    return chatShell;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-sm font-medium text-white shadow-lg transition hover:bg-slate-800 cursor-pointer"
        aria-label={open ? copy.closeChat : copy.openChat}
      >
        {open ? "X" : "Chat"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 h-[min(620px,calc(100dvh-8rem))] w-[min(380px,calc(100vw-3rem))] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
          {chatShell}
        </div>
      )}
    </>
  );
}
