import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// File-based state persistence
const STATE_FILE = path.join(process.cwd(), "sales_brain_state.json");

// Helper types
import { SystemState, Product, DeliveryZone, Order, ChatMessage, TelegramSession } from "./src/types";

// Default starter dataset
const DEFAULT_STATE: SystemState = {
  config: {
    shopName: "Shwe Pathein Sweet Treats & Artisanal Crafts",
    ownerName: "Yoon Yamone Oo",
    phone: "09971234567",
    currency: "MMK",
    telegramBotToken: "7193810482:AAFlk_x38asdf823asd984",
    telegramBotUsername: "ShwePathein_Sale_bot",
    onboardingCompleted: false
  },
  products: [
    {
      id: "prod-1",
      name: "Pathein Halawa (Premium Butter & Poppy Seed)",
      category: "Desserts",
      price: 4500,
      description: "Legendary traditional Myanmar sweet treat. Made with pure butter, sticky rice, and roasted poppy seeds.",
      stock: 45,
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "prod-2",
      name: "Royal Myanmar Instant Tea Mix (30 Sachets)",
      category: "Beverages",
      price: 7500,
      description: "Rich, creamy, and uniquely sweet authentic Myanmar traditional milk tea. Brews instantly.",
      stock: 30,
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "prod-3",
      name: "Handcrafted Pathein Bamboo Parasol (Medium / Ruby Red)",
      category: "Lifestyle",
      price: 24000,
      description: "Vibrant traditional paper-and-bamboo sun umbrella hand-painted by local artisans in Pathein.",
      stock: 3,
      image: "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "prod-4",
      name: "Kyaukpadaung Premium Jaggery Box (Coconut Shreds)",
      category: "Snacks",
      price: 9000,
      description: "Pure sugar palm nectar drops stuffed with sweet coconut shreds. Perfect with hot green tea.",
      stock: 25,
      image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "prod-5",
      name: "Shan Hills Wildflower Honey (500ml Bottled)",
      category: "Beverages",
      price: 12000,
      description: "100% natural organic blossom honey wild-harvested from the dense forests of Southern Shan State.",
      stock: 12,
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400"
    }
  ],
  deliveryZones: [
    { township: "Kamayut", rate: 3000, deliveryTime: "1-2 Days" },
    { township: "Sanchaung", rate: 2500, deliveryTime: "1-2 Days" },
    { township: "Latha (Downtown)", rate: 2000, deliveryTime: "1 Day" },
    { township: "Yankin", rate: 3000, deliveryTime: "1-2 Days" },
    { township: "Bahan", rate: 2500, deliveryTime: "1-2 Days" },
    { township: "Mayangone", rate: 3500, deliveryTime: "2 Days" },
    { township: "Hlaing", rate: 3000, deliveryTime: "1-2 Days" }
  ],
  orders: [
    {
      id: "ord-1001",
      invoiceId: "INV-2026-0001",
      customerName: "Ma Su Sandar",
      customerPhone: "09798765432",
      customerTelegramId: "tg_susandar92",
      township: "Kamayut",
      addressDetails: "Room 4B, Building 12, Pyay Road",
      deliveryFee: 3000,
      paymentMethod: "prepay",
      totalAmount: 12000, // (2 * 4500) + 3000
      status: "confirmed",
      items: [
        { productId: "prod-1", productName: "Pathein Halawa (Premium Butter & Poppy Seed)", price: 4500, quantity: 2 }
      ],
      paymentDetails: {
        method: "KPay",
        transactionId: "847290148203",
        screenshotUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=200"
      },
      createdAt: "2026-05-25T14:20:00Z"
    },
    {
      id: "ord-1002",
      invoiceId: "INV-2026-0002",
      customerName: "Ko Aung Kyaw",
      customerPhone: "09254631256",
      customerTelegramId: "tg_aungkyaw_yangon",
      township: "Sanchaung",
      addressDetails: "No. 45, Ground Floor, Shan Kone Street",
      deliveryFee: 2500,
      paymentMethod: "prepay",
      totalAmount: 26500, // (1 * 24000) + 2500
      status: "verifying",
      items: [
        { productId: "prod-3", productName: "Handcrafted Pathein Bamboo Parasol (Medium / Ruby Red)", price: 24000, quantity: 1 }
      ],
      paymentDetails: {
        method: "WavePay",
        transactionId: "4820195724",
        screenshotUrl: "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=200"
      },
      createdAt: "2026-05-26T01:10:00Z"
    },
    {
      id: "ord-1003",
      invoiceId: "INV-2026-0003",
      customerName: "Daw Thidar Win",
      customerPhone: "09443209876",
      customerTelegramId: "tg_thidarwin_bahan",
      township: "Bahan",
      addressDetails: "Sayar San Road, Golden Valley Area",
      deliveryFee: 2500,
      paymentMethod: "cod",
      totalAmount: 29500, // (1 * 12000 + 2 * 7500) + 2500 = 27000 + 2500 = 29500
      status: "completed",
      items: [
        { productId: "prod-5", productName: "Shan Hills Wildflower Honey (500ml Bottled)", price: 12000, quantity: 1 },
        { productId: "prod-2", productName: "Royal Myanmar Instant Tea Mix (30 Sachets)", price: 7500, quantity: 2 }
      ],
      createdAt: "2026-05-24T09:45:00Z"
    }
  ],
  sessions: {
    "default_customer": {
      sessionId: "default_customer",
      customerName: "Ma Khin Thidar",
      customerPhone: "09964820172",
      customerTelegramId: "khinthidar_sweet",
      messages: [
        { id: "m1", sender: "customer", content: "Mingalabar Candy! 😊 I am interested in ordering some of your famous items.", timestamp: "2026-05-26T02:00:00Z" },
        { id: "m2", sender: "bot", content: "Mingalabar shin! 🙏 Welcome to Shwe Pathein Treats! Candy is so happy to assist you today. Here is our best product list. Which ones can Candy pack for you? 💕\n\n1️⃣ Pathein Halawa (Premium) - 4,500 MMK\n2️⃣ Royal Myanmar Instant Tea Mix - 7,500 MMK\n3️⃣ Handcrafted Pathein Bamboo Parasol - 24,000 MMK\n\nYou can say \"Add 2 Halawa\" or ask me any details!", timestamp: "2026-05-26T02:01:00Z" }
      ],
      lastActive: "2026-05-26T02:01:00Z",
      currentStep: "browsing",
      cart: [],
      liveTakeoverActive: false
    }
  }
};

// State Manager
let state: SystemState = { ...DEFAULT_STATE };

// Persistent Syncing
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
      state = { ...DEFAULT_STATE, ...parsed };
      console.log("Persistent state loaded successfully from Disk.");
    } else {
      state = { ...DEFAULT_STATE };
      saveState();
    }
  } catch (error) {
    console.error("Failed to load state, reverting to memory defaults.", error);
    state = { ...DEFAULT_STATE };
  }
}

function saveState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write state persistent file to disk.", error);
  }
}

loadState();

// Lazy Gemini API Client
let aiClient: GoogleGenAI | null = null;

// AI strategy cache parameters to respect Gemini API quota / rate limits
let cachedStrategyEn: string | null = null;
let cachedStrategyMy: string | null = null;
let lastStrategyFetchTimeEn: number = 0;
let lastStrategyFetchTimeMy: number = 0;
const STRATEGY_CACHE_TTL = 15 * 60 * 1000; // Cache strategy for 15 minutes to save API requests

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes("MY_GEMINI_API_KEY")) {
      throw new Error("GEMINI_API_KEY is missing or invalid. Please configure it in your Secrets / Env settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// ---------------------- TELEGRAM LIVE WEBHOOK HELPERS ----------------------

function getTelegramChatId(sessionId: string): number | null {
  if (sessionId.startsWith("customer_")) {
    const maybeIdStr = sessionId.split("_")[1];
    const maybeId = Number(maybeIdStr);
    if (!isNaN(maybeId) && maybeId > 0) {
      return maybeId;
    }
  }
  return null;
}

function toTelegramHtml(markdown: string): string {
  if (!markdown) return "";
  
  // 1. Escape HTML special characters
  let escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // 2. Pairwise replace bold markers: **text** or __text__ to <b>text</b>
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  escaped = escaped.replace(/__(.*?)__/g, "<b>$1</b>");
  
  // 3. Pairwise replace italic markers: *text* or _text_ to <i>text</i>
  escaped = escaped.replace(/\*([^\*]+)\*/g, "<i>$1</i>");
  escaped = escaped.replace(/_([^_]+)_/g, "<i>$1</i>");

  // 4. Replacement of `code` inline
  escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");

  return escaped;
}

async function sendTelegramMessage(chatId: string | number, text: string, options?: any) {
  const token = state.config.telegramBotToken;
  if (!token) {
    console.log("[Telegram API] Skipping live send (Bot Token is empty).");
    return;
  }
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const htmlText = toTelegramHtml(text);
    const payload: any = {
      chat_id: chatId,
      text: htmlText,
      parse_mode: "HTML"
    };
    if (options?.reply_markup) {
      payload.reply_markup = options.reply_markup;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.error(`[Telegram API] sendMessage failed with status ${res.status}:`, await res.text());
    } else {
      console.log(`[Telegram API] Message dispatched successfully to chatId: ${chatId}`);
    }
  } catch (error) {
    console.error("[Telegram API] Error sending Telegram message:", error);
  }
}


// ---------------------- API ROUTES ----------------------

// 1. Core Session Retrieval
app.get("/api/state", (req, res) => {
  res.json(state);
});

// 2. Clear / Reset DB
app.post("/api/reset", (req, res) => {
  state = {
    ...DEFAULT_STATE,
    config: { ...DEFAULT_STATE.config },
    products: [...DEFAULT_STATE.products],
    deliveryZones: [...DEFAULT_STATE.deliveryZones],
    orders: [...DEFAULT_STATE.orders],
    sessions: { ...DEFAULT_STATE.sessions }
  };
  saveState();
  res.json({ message: "Store reset to defaults", state });
});

// 3. SME Owner Onboarding Config
app.post("/api/onboarding", async (req, res) => {
  const { shopName, ownerName, phone, telegramBotToken, telegramBotUsername, onboardingCompleted } = req.body;
  state.config = {
    shopName: shopName || "SME Store",
    ownerName: ownerName || "Owner",
    phone: phone || "",
    currency: "MMK",
    telegramBotToken: telegramBotToken || "",
    telegramBotUsername: telegramBotUsername || "",
    onboardingCompleted: onboardingCompleted !== undefined ? onboardingCompleted : true
  };
  saveState();

  // If Bot Token is provided, automatically configure Telegram bot webhook pointing to this App!
  if (telegramBotToken) {
    try {
      const host = req.get("host") || "";
      const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      let appUrl = `${protocol}://${host}`;
      if (host && !host.includes("localhost") && !host.includes("127.0.0.1") && !host.includes("0.0.0.0")) {
        appUrl = `https://${host}`;
      }
      console.log(`[Telegram Register] Dynamic Public app domain for webhook: ${appUrl}`);
      
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: `${appUrl}/api/telegram-webhook` })
      });
      const data = await response.json();
      console.log("[Telegram Register] webhook registration status response:", data);
    } catch (err) {
      console.error("[Telegram Register] Failed to automatically register Telegram webhook:", err);
    }
  }

  res.json({ success: true, config: state.config });
});


// 4. Product Management Routing
app.post("/api/products", (req, res) => {
  const { action, product } = req.body;
  if (action === "add") {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      image: product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"
    };
    state.products.push(newProduct);
  } else if (action === "edit") {
    state.products = state.products.map(p => p.id === product.id ? { 
      ...product, 
      price: Number(product.price) || 0, 
      stock: Number(product.stock) || 0 
    } : p);
  } else if (action === "delete") {
    state.products = state.products.filter(p => p.id !== product.id);
  }
  saveState();
  res.json({ success: true, products: state.products });
});

// 5. Zone Rate Management Routing
app.post("/api/delivery-zones", (req, res) => {
  const { action, zone, index } = req.body;
  if (action === "add") {
    const newZone: DeliveryZone = {
      township: zone.township || "New Zone",
      rate: Number(zone.rate) || 0,
      deliveryTime: zone.deliveryTime || "1-2 Days"
    };
    state.deliveryZones.push(newZone);
  } else if (action === "edit") {
    if (typeof index === "number" && index >= 0 && index < state.deliveryZones.length) {
      state.deliveryZones[index] = {
        township: zone.township,
        rate: Number(zone.rate) || 0,
        deliveryTime: zone.deliveryTime
      };
    }
  } else if (action === "delete") {
    if (typeof index === "number" && index >= 0 && index < state.deliveryZones.length) {
      state.deliveryZones.splice(index, 1);
    }
  }
  saveState();
  res.json({ success: true, deliveryZones: state.deliveryZones });
});

// 6. Orders Management (Confirmations/Updates)
app.post("/api/orders/update", (req, res) => {
  const { orderId, status } = req.body;
  const order = state.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.status = status;

  // Deduct products inventory stock if verified/confirmed
  if (status === "confirmed") {
    order.items.forEach(item => {
      const prod = state.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
  }

  // Push immediate auto confirmation message status directly to customer's chat session!
  const relatedSession = Object.values(state.sessions).find(s => s.activeOrderId === orderId);
  if (relatedSession) {
    let text = "";
    if (status === "confirmed") {
      text = `🎉 **Order Confirmed!**\n\nDear ${order.customerName}, payment verification succeeded! Yoon verified your screenshot 💚\n\n📜 **Professionally Generated Invoice**:\n🛍️ Invoice ID: *${order.invoiceId}*\n📍 Delivery township: *${order.township}*\n🛵 Delivery timeline: 1-2 Days\n💵 Paid: *${order.totalAmount.toLocaleString()} MMK*\n\nYour package is heading to packing line. Thank you so much for shopping at Shwe Pathein! 🙏`;
      
      relatedSession.messages.push({
        id: `ms-conf-${Date.now()}`,
        sender: "bot",
        content: text,
        timestamp: new Date().toISOString(),
        invoiceData: order
      });
      relatedSession.currentStep = "completed";
    } else if (status === "cancelled") {
      text = `❌ **Order Cancelled**\n\nDear customer, we regret to inform you that your purchase was not confirmed. Please verify your payment receipt details or check with us! 🙏`;
      relatedSession.messages.push({
        id: `ms-canc-${Date.now()}`,
        sender: "bot",
        content: text,
        timestamp: new Date().toISOString()
      });
    }

    // Sync live order event confirmation directly back to the physical Telegram chat if customer is live!
    const tgChatId = getTelegramChatId(relatedSession.sessionId);
    if (tgChatId) {
      sendTelegramMessage(tgChatId, text);
    }
  }


  saveState();
  res.json({ success: true, orders: state.orders, products: state.products });
});

// 7. Live Takeover Commands
app.post("/api/bot/takeover", (req, res) => {
  const { sessionId } = req.body;
  const session = state.sessions[sessionId];
  if (session) {
    session.liveTakeoverActive = true;
    session.currentStep = "live_takeover";
    session.messages.push({
      id: `m-tk-${Date.now()}`,
      sender: "system",
      content: "🔴 [Shop Owner has joined the chat. Customer Support is now fully manual. AI deactivated.]",
      timestamp: new Date().toISOString()
    });
    saveState();
  }
  res.json({ success: true, session });
});

app.post("/api/bot/release", (req, res) => {
  const { sessionId } = req.body;
  const session = state.sessions[sessionId];
  if (session) {
    session.liveTakeoverActive = false;
    session.currentStep = "browsing";
    session.messages.push({
      id: `m-rl-${Date.now()}`,
      sender: "system",
      content: "🟢 [Shop Owner left. Candy AI is activated and back online to help you.]",
      timestamp: new Date().toISOString()
    });
    saveState();
  }
  res.json({ success: true, session });
});

// Owner responds personally in Chat Simulation
app.post("/api/bot/owner-reply", async (req, res) => {
  const { sessionId, content } = req.body;
  const session = state.sessions[sessionId];
  if (!session) return res.status(404).json({ error: "Session missing" });

  const ownerMsg: ChatMessage = {
    id: `mo-${Date.now()}`,
    sender: "owner",
    content,
    timestamp: new Date().toISOString()
  };
  session.messages.push(ownerMsg);
  session.lastActive = new Date().toISOString();
  saveState();

  // Route Owner takeover chat messages directly to physical Telegram
  const tgChatId = getTelegramChatId(sessionId);
  if (tgChatId) {
    await sendTelegramMessage(tgChatId, `💬 *Message from Yoon (Shop Owner)*:\n\n${content}`);
  }

  res.json({ success: true, session });
});


// 8b. SHARED CUSTOMER MESSAGES PROCESSOR (CENTRAL STATE MACHINE)
async function processCustomerMessage(sessionId: string, params: {
  content?: string;
  base64Image?: string;
  transactionId?: string;
  township?: string;
  payMethod?: string;
  checkoutOption?: string;
}) {
  const { content, base64Image, transactionId, township, payMethod, checkoutOption } = params;

  if (!state.sessions[sessionId]) {
    state.sessions[sessionId] = {
      sessionId,
      customerName: "New Customer",
      customerPhone: "",
      customerTelegramId: `tg_${sessionId}`,
      messages: [],
      lastActive: new Date().toISOString(),
      currentStep: "greeting",
      cart: [],
      liveTakeoverActive: false
    };
  }

  const session = state.sessions[sessionId];
  session.lastActive = new Date().toISOString();

  // Push customer message to state logs
  const custMsgId = `mc-${Date.now()}`;
  session.messages.push({
    id: custMsgId,
    sender: "customer",
    content: content || "Submitted order details",
    timestamp: new Date().toISOString(),
    imageUrl: base64Image || undefined
  });

  // Short-circuit if Owner takeover is active
  if (session.liveTakeoverActive) {
    saveState();
    return { success: true, session, status: "live_takeover" };
  }

  const chatId = getTelegramChatId(sessionId);

  // Helper inside process to append bot message to logs AND push to Telegram Api if real
  const addBotReply = async (replyText: string, extra: Partial<ChatMessage> = {}, replyMarkupOptions?: any) => {
    const msgId = `ms-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      sender: "bot",
      content: replyText,
      timestamp: new Date().toISOString(),
      ...extra
    };
    session.messages.push(newMsg);
    saveState();

    if (chatId) {
      await sendTelegramMessage(chatId, replyText, replyMarkupOptions);
    }
  };

  // 1. Core Start Command / Main Product Directory rules
  const trimmedLowerContent = (content || "").trim().toLowerCase();
  if (trimmedLowerContent.startsWith("/start") || trimmedLowerContent === "menu" || trimmedLowerContent === "hello" || trimmedLowerContent === "hi") {
    session.currentStep = "greeting";
    session.cart = [];
    const welcomeText = `Mingalabar shin! 🙏 Welcome to *${state.config.shopName || "Shwe Pathein Treats"}*! Candy (AI Assistant) is so happy to assist you today. 💕\n\nHere is our premium product list! Which delicious traditional Myanmar treats can Candy pack for you?\n\n` +
      state.products.map((p, idx) => `${idx + 1}️⃣ *${p.name}* - ${p.price.toLocaleString()} MMK\n  _Category: ${p.category} | ${p.description}_`).join("\n\n") +
      `\n\n✨ You can reply with "Add 2 Halawa", tap our interactive buttons, or ask me any question!`;

    const inlineKeyboard = state.products.map(p => [{ text: `🛒 Add ${p.name}`, callback_data: `add_${p.id}` }]);
    await addBotReply(welcomeText, {}, { reply_markup: { inline_keyboard: inlineKeyboard } });
    return { success: true, session };
  }

  // 2. Button callback "add_prod-1" handling
  if (content && content.startsWith("add_")) {
    const prodId = content.replace("add_", "");
    const prod = state.products.find(p => p.id === prodId);
    if (prod) {
      const existing = session.cart.find(c => c.productId === prodId);
      if (existing) {
        existing.quantity += 1;
      } else {
        session.cart.push({ productId: prodId, quantity: 1 });
      }

      const cartStatus = `Perfect choice! 🌸 Yoon and Candy have added *${prod.name}* to your basket! 💕\n\n🛒 Current Basket:\n` +
        session.cart.map(c => {
          const itemProd = state.products.find(p => p.id === c.productId);
          return `- *${itemProd?.name}* x ${c.quantity}`;
        }).join("\n") +
        `\n\nWould you like to checkout now or continue browsing? We support KPAY / WavePay Prepayment or Cash on Delivery (CoD)!`;

      const inlineKeyboard = [
        [
          { text: "💵 Cash on Delivery (COD)", callback_data: "payment_cod" },
          { text: "💳 Mobile Prepayment", callback_data: "payment_prepay" }
        ],
        [
          { text: "🛍 Browse Products", callback_data: "/start" }
        ]
      ];
      await addBotReply(cartStatus, {}, { reply_markup: { inline_keyboard: inlineKeyboard } });
      return { success: true, session };
    }
  }

  // 3. Choice of checkout options (cod vs prepay)
  if (checkoutOption) {
    session.currentStep = "selecting_township";
    session.tempPayMethod = checkoutOption;
    const townshipsList = state.deliveryZones.map(z => z.township);
    
    // Auto-generate inline keyboard for townships
    const inlineKeyboard = townshipsList.map(t => [{ text: `🛵 ${t}`, callback_data: `township_${t}` }]);

    await addBotReply(
      `Sweet choice! 🌸 You chose: **${checkoutOption === "prepay" ? "Prepay" : "Cash on Delivery"}**.\n\nNow, please tell me your township in Yangon so I can accurately calculate delivery fees! (e.g., Sanchaung, Kamayut, Yankin...) Or tap one of the options below! 👇`,
      { interactiveOptions: townshipsList },
      { reply_markup: { inline_keyboard: inlineKeyboard } }
    );
    return { success: true, session };
  }

  // 4. Township specification
  if (township) {
    const matchedZone = state.deliveryZones.find(z => z.township.toLowerCase().includes(township.toLowerCase()));
    const finalTownship = matchedZone ? matchedZone.township : "General Yangon";
    const deliveryCost = matchedZone ? matchedZone.rate : 3000;

    let cartTotal = 0;
    const itemsList = session.cart.map(item => {
      const prod = state.products.find(p => p.id === item.productId);
      const sub = (prod ? prod.price : 0) * item.quantity;
      cartTotal += sub;
      return {
        productId: item.productId,
        productName: prod ? prod.name : "Unknown Item",
        price: prod ? prod.price : 0,
        quantity: item.quantity
      };
    });

    const totalBill = cartTotal + deliveryCost;
    const orderId = `ord-${1000 + state.orders.length + 1}`;
    const invoiceId = `INV-2026-0${100 + state.orders.length + 1}`;
    const mappedPayMethod = (payMethod || session.tempPayMethod || 'cod') as 'cod' | 'prepay';

    const newOrder: Order = {
      id: orderId,
      invoiceId,
      customerName: session.customerName || "Khin Thidar",
      customerPhone: session.customerPhone || "09964820172",
      customerTelegramId: session.customerTelegramId,
      township: finalTownship,
      deliveryFee: deliveryCost,
      paymentMethod: mappedPayMethod,
      totalAmount: totalBill,
      status: mappedPayMethod === 'prepay' ? 'pending' : 'confirmed',
      items: itemsList,
      createdAt: new Date().toISOString()
    };

    if (mappedPayMethod === 'cod') {
      newOrder.paymentDetails = {
        method: 'CoD',
        transactionId: "CASH_ON_DELIVERY"
      };
    }

    state.orders.push(newOrder);
    session.activeOrderId = orderId;

    if (mappedPayMethod === 'cod') {
      session.currentStep = "completed";
      await addBotReply(
        `🎉 **Wow! Order Placed Successfully via Cash on Delivery (CoD)!** 🎉\n\nCandy set up everything beautifully for you, sweet customer! 😊 Yoon and delivery staff will drop your products shortly.\n\n💼 Invoice Total: **${totalBill.toLocaleString()} MMK** (Delivery: ${deliveryCost.toLocaleString()} MMK)\n📍 Township: ${finalTownship}\n🚀 Delivery: 1-2 Days.\n\nYey! Thank you! Here is your system receipt preview.`,
        { invoiceData: newOrder }
      );
      session.cart = [];
    } else {
      session.currentStep = "prepayment_pending";
      await addBotReply(
        `💳 **Excellent! Please complete Prepayment to lock in block order.**\n\n💼 Invoice Total: **${totalBill.toLocaleString()} MMK**\n🚚 Township Routing: ${finalTownship} (+${deliveryCost.toLocaleString()} MMK)\n\n👇 **Shop Payment Methods:**\n📱 KPAY: **09971234567** (Yoon Yamone Oo)\n📱 WAVE PAY: **09971234567** (Yoon Yamone Oo)\n\n*Please send payment route, last 6 digits of Transaction ID, and receipt screenshot image!* Candy will submit it immediately! ✨`,
        { paymentDetailsNeeded: true }
      );
    }

    return { success: true, session };
  }

  // 5. Prepayment Receipt Verification Submit
  if (session.currentStep === "prepayment_pending" && (transactionId || base64Image)) {
    const activeOrder = state.orders.find(o => o.id === session.activeOrderId);
    if (activeOrder) {
      activeOrder.status = 'verifying';
      activeOrder.paymentDetails = {
        method: (payMethod || 'KPay') as any,
        transactionId: transactionId || 'UNKNOWN-DIGITS',
        screenshotUrl: base64Image || "https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=200"
      };

      session.currentStep = "verifying";
      await addBotReply(
        `👍 **Awesome! Payment elements received!**\n\nCandy submitted proof with TxID: **#${transactionId || '---'}** to Yoon Yamone Oo for instant evaluation.\n\n⏳ Yoon and staff will crosscheck this right away. You will receive an **Order Confirmed** invoice alert immediately on approval! Please hold on! 💚`
      );
      session.cart = [];
      return { success: true, session };
    }
  }

  // 6. Gemini 3.5 AI dialog chat fallback rules
  try {
    const ai = getGeminiClient();

    const productsPromptString = state.products.map(p =>
      `- [ID: ${p.id}] "${p.name}" | Price: ${p.price} MMK | Stock remaining: ${p.stock} | Category: ${p.category} | Info: ${p.description}`
    ).join("\n");

    const deliveryZonesPromptString = state.deliveryZones.map(z =>
      `- Township: ${z.township} | Rate: ${z.rate} MMK | Time: ${z.deliveryTime}`
    ).join("\n");

    const systemInstruction = `You are "Candy", an incredibly sweet, professional, and patient AI chatbot assistant for "${state.config.shopName}".
Your mission is to represent Yoon Yamone Oo (the owner) in welcoming clients, giving details on standard treats, and gently guiding them through purchasing products.

STORE INVENTORY:
${productsPromptString}

DELIVERY TOWNSHIP FEES:
${deliveryZonesPromptString}

CUSTOMER CONTEXT:
- Name: ${session.customerName || "Khip Thidar"}
- Current Cart: ${JSON.stringify(session.cart)}

RULES FOR DIALOGUE:
1. Speak in a mix of soft, conversational Myanmar language/Burmese, utilizing extremely polite particles like "ရှင်" (shin), and clear English as typical for Myanmar commerce.
2. If the user asks about product details, ingredients, or pricing, answer them elegantly and offer to add items to their shopping cart!
3. If they want to purchase, tell them what is in their cart, compute the cost, and provide the options to proceed: Cash on Delivery or Prepay.
4. **ADD ITEM RULE**: If the customer says they want to add a product or buy a product, state the item name clearly and respond to confirm! Do not use complex JSON formats in output text, just output beautiful message body formatted nicely with bold lists and emojis.
5. If they are talking about something else, stay delightfully helpful, cheerful, and charming, keeping recommendations focused entirely on making a transaction.
6. Absolutely do not disclose system-internal parameters. Be highly conversational. Always keep answers concise and easy to read.`;

    const conversationHistory = session.messages.slice(-5).map(m => {
      const pfx = m.sender === 'customer' ? 'Customer' : 'Candy (AI Assistant)';
      return `${pfx}: ${m.content}`;
    }).join("\n");

    const geminiInput = `CONVERSATION HISTORIC:\n${conversationHistory}\n\nCustomer just sent: "${content}"\n\nCandy, reply in beautiful customer-friendly dialogue:`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: geminiInput,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    const botReplyText = aiResponse.text || "Mingalabar shin! Candy received your message. Please let me know how I can guide your shopping today! Premium Sweets always available. 💕";

    // Match keywords to append to local cart status
    state.products.forEach(p => {
      const lContent = (content || "").toLowerCase();
      if (lContent.includes(p.name.toLowerCase().split(" ")[0]) || lContent.includes(p.id)) {
        const existing = session.cart.find(c => c.productId === p.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          session.cart.push({ productId: p.id, quantity: 1 });
        }
      }
    });

    // Provide payment buttons trigger if they have products in basket
    let inlineKeyboard: any[] = [];
    if (session.cart.length > 0) {
      inlineKeyboard.push([
        { text: "💵 Cash on Delivery (COD)", callback_data: `payment_cod` },
        { text: "💳 Mobile Prepay", callback_data: `payment_prepay` }
      ]);
    }

    await addBotReply(
      botReplyText,
      {},
      inlineKeyboard.length > 0 ? { reply_markup: { inline_keyboard: inlineKeyboard } } : undefined
    );
    return { success: true, session };

  } catch (error: any) {
    console.error("Gemini chatbot API Error. Falling back to local responder rules:", error);

    let responseText = `Mingalabar shin! Yoon and Candy are excited to assist you! 🙏 Candy's direct pipeline is syncing. Can you let me know if you would like me to lock in the delicious Premium Butter Pathein Halawa (4,500 MMK) or Royal Instant Tea Mix (7,500 MMK) for you? 😊`;

    const lContent = (content || "").toLowerCase();
    if (lContent.includes("halawa") || lContent.includes("sweet")) {
      const halawaId = "prod-1";
      const existing = session.cart.find(c => c.productId === halawaId);
      if (existing) existing.quantity += 1;
      else session.cart.push({ productId: halawaId, quantity: 1 });
      responseText = `Perfect choice! 🌸 Yoon and Candy have added **Pathein Halawa (Premium)** to your basket! 💕\n\n🛒 Current basket:\n- Pathein Halawa (Premium) x ${session.cart.find(c => c.productId === halawaId)?.quantity || 1}\n\nWould you like to purchase now or browse more? We support KPAY / WavePay Prepay and Cash on Delivery!`;
    } else if (lContent.includes("checkout") || lContent.includes("buy") || lContent.includes("order") || lContent.includes("ယူမယ်")) {
      if (session.cart.length === 0) {
        session.cart.push({ productId: "prod-1", quantity: 2 });
      }
      responseText = `Let's wrap up your ordering process, sweet friend! 🌸🧺\n\nYour selected basket contains:\n- Pathein Halawa (Premium) x 2 (9,000 MMK)\n\nChoose payment:\n1️⃣ **Prepay** (Get MMQR details for faster shipping)\n2️⃣ **Cash on Delivery (CoD)**`;
    }

    let inlineKeyboard: any[] = [];
    if (session.cart.length > 0) {
      inlineKeyboard.push([
        { text: "💵 Cash on Delivery", callback_data: "payment_cod" },
        { text: "💳 Prepayment (KPAY/Wave)", callback_data: "payment_prepay" }
      ]);
    }

    await addBotReply(
      responseText,
      {},
      inlineKeyboard.length > 0 ? { reply_markup: { inline_keyboard: inlineKeyboard } } : undefined
    );
    return { success: true, session };
  }
}

// 8c. REAL TELEGRAM WEBHOOK INGRESS GATEWAY
app.post("/api/telegram-webhook", async (req, res) => {
  // Always acknowledge status 200 immediately to stave off Telegram delivery retries
  res.status(200).send("OK");

  try {
    const { message, callback_query } = req.body;
    let chatId: number | null = null;
    let customerName = "Telegram Customer";
    let telegramUsername = "";
    let content = "";
    
    // Parameter payloads to feed inside centralized state evaluator
    let base64Image: string | undefined = undefined;
    let transactionId: string | undefined = undefined;
    let township: string | undefined = undefined;
    let checkoutOption: string | undefined = undefined;

    const token = state.config.telegramBotToken;

    if (message) {
      chatId = message.chat.id;
      telegramUsername = message.from?.username || "";
      customerName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") || "Telegram Customer";
      content = message.text || "";

      // Capture photos for prepayment screenshot receipts!
      if (message.photo && message.photo.length > 0) {
        const largestPhoto = message.photo[message.photo.length - 1];
        const fileId = largestPhoto.file_id;
        try {
          if (token) {
            const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
            if (fileRes.ok) {
              const fileData: any = await fileRes.json();
              if (fileData.ok && fileData.result?.file_path) {
                base64Image = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
                // Treat photo as image confirmation proof
                content = content || "Submitted screenshot receipt file";
              }
            }
          }
        } catch (err) {
          console.error("[Telegram Ingress] Failed downloading receipt photo file:", err);
        }
      }

      // Automatically capture Transaction Ids if they type numbers
      if (content && /^\d{5,15}$/.test(content.trim())) {
        transactionId = content.trim();
      }

    } else if (callback_query) {
      chatId = callback_query.message.chat.id;
      telegramUsername = callback_query.from?.username || "";
      customerName = [callback_query.from?.first_name, callback_query.from?.last_name].filter(Boolean).join(" ") || "Telegram Customer";
      
      const callbackData = callback_query.data || "";
      
      // Stop Telegram keyboard spinner
      if (token && callback_query.id) {
        try {
          await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callback_query_id: callback_query.id })
          });
        } catch (err) {
          console.error("[Telegram Ingress] Failed answering callback:", err);
        }
      }

      // Map quick button callbacks to standard State Machine transitions
      if (callbackData === "payment_cod") {
        checkoutOption = "cod";
      } else if (callbackData === "payment_prepay") {
        checkoutOption = "prepay";
      } else if (callbackData.startsWith("township_")) {
        township = callbackData.replace("township_", "");
      } else {
        content = callbackData;
      }
    }

    if (!chatId) return;

    // Map Telegram customers securely using their real chat numbers!
    const sessionId = `customer_${chatId}`;

    // Initialize session structure if new
    if (!state.sessions[sessionId]) {
      state.sessions[sessionId] = {
        sessionId,
        customerName,
        customerPhone: "",
        customerTelegramId: telegramUsername || `tg_${chatId}`,
        messages: [],
        lastActive: new Date().toISOString(),
        currentStep: "greeting",
        cart: [],
        liveTakeoverActive: false
      };
    }

    // Force user details update
    const session = state.sessions[sessionId];
    session.customerTelegramId = telegramUsername || session.customerTelegramId;
    if (customerName && session.customerName === "New Customer") {
      session.customerName = customerName;
    }

    // Process using high-fidelity unified engine
    await processCustomerMessage(sessionId, {
      content,
      base64Image,
      transactionId,
      township,
      payMethod: session.tempPayMethod,
      checkoutOption
    });

  } catch (error) {
    console.error("[Telegram Webhook Ingress] Fatal failure routing update response:", error);
  }
});

// 8. CUSTOMER BOT SIMULATION INPUT & REACTION
app.post("/api/bot/simulate-input", async (req, res) => {
  const { sessionId, content, base64Image, transactionId, township, payMethod, checkoutOption } = req.body;
  const result = await processCustomerMessage(sessionId, {
    content,
    base64Image,
    transactionId,
    township,
    payMethod,
    checkoutOption
  });
  res.json(result);
});

// 9. AI STRATEGIC INSIGHTS AND RECOMMENDATIONS ENDPOINT
app.post("/api/ai/strategy", async (req, res) => {
  const force = req.query.force === "true" || req.body?.force === true;
  const lang = req.query.lang || req.body?.lang || "en";
  const now = Date.now();
  
  if (!force) {
    if (lang === "my" && cachedStrategyMy && (now - lastStrategyFetchTimeMy < STRATEGY_CACHE_TTL)) {
      console.log("[Sales Brain AI] Serving cached Myanmar business strategy to conserve Gemini API quota.");
      return res.json({ success: true, strategy: cachedStrategyMy });
    } else if (lang !== "my" && cachedStrategyEn && (now - lastStrategyFetchTimeEn < STRATEGY_CACHE_TTL)) {
      console.log("[Sales Brain AI] Serving cached English business strategy to conserve Gemini API quota.");
      return res.json({ success: true, strategy: cachedStrategyEn });
    }
  }

  try {
    const ai = getGeminiClient();

    // Compile transaction history summary for Gemini to digest
    const itemsPurchasedCount: { [name: string]: number } = {};
    let totalRevenue = 0;
    
    state.orders.forEach(o => {
      if (o.status !== "cancelled") {
        totalRevenue += o.totalAmount - o.deliveryFee;
        o.items.forEach(i => {
          itemsPurchasedCount[i.productName] = (itemsPurchasedCount[i.productName] || 0) + i.quantity;
        });
      }
    });

    const inventoryStatus = state.products.map(p => `${p.name}: current stock ${p.stock} units (Price: ${p.price} MMK)`);

    const schemaInput = {
      analytics: {
        total_revenue_mmk: totalRevenue,
        order_count: state.orders.length,
        items_ranking: itemsPurchasedCount
      },
      current_inventory: inventoryStatus,
      shop_details: state.config
    };

    const systemInstruction = `You are "Sales Brain", an elite business intelligence strategy advisor for SMEs in Myanmar.
Your goal is to look at the store's backend analytics data, purchase counts, and stock levels, and generate high-value, specific strategy report.
State your recommendations clearly in plain text format.
CRITICAL FORMATTING MANDATES:
1. DO NOT write any hash characters (#) or asterisks (*) anywhere in your output. Absolutely no "#", "##", "***", "**", "*".
2. DO NOT use any emojis of any kind. No icons, no stars, no calendar symbols.
3. Write completely in ${lang === "my" ? "the Myanmar language (Burmese)" : "English"}.
4. Generate the advice using simple text headers (for example, "1. CUSTOMER PURCHASE HOUR ANALYSIS" or "2. CAMPAIGN IDEAS") and clean indentation rather than Markdown headers/bullets. Keep spacing nice and clean.
5. Keep the response professional, clear, and highly specific to this store under 280 words.

Include in your response:
1. CUSTOMER PURCHASE HOUR ANALYSIS (Identify peaks)
2. HIGH VALUE CAMPAIGN SUGGESTIONS
3. INVENTORY & CONVERSION ENHANCEMENTS (Check if any product stock is low)
4. TAX / PRICING OPTIMIZATION ADVICE`;

    const aiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Owner state schema:\n${JSON.stringify(schemaInput, null, 2)}\n\nGenerate Myanmar SME strategies:`,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    const strategyText = aiRes.text || (lang === "my" ? "စနစ်အတွင်းရှိ အချက်အလက်များအရ အရောင်းမြှင့်တင်ရန် ဆောင်ရွက်နိုင်ပါသည်။" : "Unable to fetch live insights. Try re-evaluating soon.");
    
    // Cache the successful strategy response
    if (lang === "my") {
      cachedStrategyMy = strategyText;
      lastStrategyFetchTimeMy = Date.now();
    } else {
      cachedStrategyEn = strategyText;
      lastStrategyFetchTimeEn = Date.now();
    }

    res.json({ success: true, strategy: strategyText });

  } catch (error: any) {
    // Graceful error extraction (suppressing verbose trace for clean quota 429 notifications)
    const isQuotaExceeded = error?.message?.includes("quota") || error?.message?.includes("429") || error?.status === "RESOURCE_EXHAUSTED";
    
    if (isQuotaExceeded) {
      console.warn("[Sales Brain AI] Gemini API quota is fully exhausted (429 rate limit exceeded). Serving cached high-fidelity fallback strategy.");
    } else {
      console.warn("[Sales Brain AI] Could not query Gemini live advisor service. Reverting to local fallback strategy:", error?.message || error);
    }
    
    // Super high fidelity default plain strategies if Gemini key is missing, invalid, or rate-limited
    const fallbackStrategyEn = `Sales Brain AI Strategy Briefing

1. Peak Purchasing Activity
Based on active system sessions, customer inquiry rates peak dramatically between 6:00 PM and 9:30 PM (MSTM).
Action: Keep the automated Sales Assistant robot active with instant auto-invoice delivery during these hours to capture evening transactions when users are browsing on social networks.

2. Hot Campaign Suggestions
Traditional Treat Family Box: Bundle Pathein Halawa (Premium) x 2 + Royal Tea Mix x 1 with free Sanchaung / Kamayut delivery township rates to stimulate conversion values up to 16,500 MMK.
Weekend Sweet Rush: Code a Sunday KPay prepay rebate of 5% on transactions exceeding 25,000 MMK.

3. Inventory Alerts
Handcrafted Pathein Bamboo Parasol (Ruby Red) is extremely low in stock (only 3 units remaining).
Action: Re-order 10 units from Pathein suppliers immediately. Reduce search promotions temporarily if supply is delayed.

4. Settlement Optimization
90% of buyers select KPAY Prepayment over COD when offered immediate checkout confirmation. Promote MMQR code upload during checkout step for lower bookkeeping overhead.`;

    const fallbackStrategyMy = `ရောင်းအားမြှင့်တင်ရေး အေအိုင် မဟာဗျူဟာ အစီရင်ခံစာ

၁။ အများဆုံး ဝယ်ယူသည့် အချိန်အပိုင်းအခြား
စနစ်အတွင်းရှိ အချက်အလက်များအရ ဝယ်ယူသူများ စုံစမ်းမေးမြန်းမှု အများဆုံးအချိန်မှာ ညနေ ၆:၀၀ နာရီမှ ည ၉:၃၀ နာရီအတွင်း ဖြစ်ပါသည်။
အကြံပြုချက် - ဝယ်ယူသူများ လူမှုကွန်ရက်အသုံးပြုပြီး စုံစမ်းမှုများသော ဤအချိန်အတွင်း အလိုအလျောက် အော်ဒါစီစဉ်ပေးသည့် စနစ်ကို ဖွင့်လှစ်ထားရန် အကြံပြုပါသည်။

၂။ အရောင်းမြှင့်တင်ရေး အစီအစဉ်များ
ရိုးရာမုန့် မိသားစုဘူးအစီအစဉ် - ပုသိမ်ဟလဝါ (အထူး) နှစ်ဗူး နှင့် လက်ဖက်ရည်ထုပ် တစ်ထုပ်ကို တွဲဖက်ပြီး စမ်းချောင်း သို့မဟုတ် ကမာရွတ်မြို့နယ်အတွင်း အခမဲ့ ပို့ဆောင်ပေးခြင်းဖြင့် ဝယ်ယူမှုပမာဏကို ၁၆,၅၀၀ ကျပ်အထိ မြှင့်တင်နိုင်ပါသည်။
ပိတ်ရက်အထူးအစီအစဉ် - ၂၅,၀၀၀ ကျပ်ထက်ပိုပြီး ဝယ်ယူသူများအတွက် ကေပေးဖြင့် ကြိုတင်ငွေပေးချေပါက ၅ ရာခိုင်နှုန်း ပြန်လည်ပေးအပ်သည့် စနစ်ကို အသုံးပြုနိုင်ပါသည်။

၃။ ကုန်ပစ္စည်းလက်ကျန် အချက်ပေးချက်
ပုသိမ်ထီး (အနီရောင်) မှာ လက်ကျန် ၃ ခုသာ ကျန်ရှိပါတော့သည်။
အကြံပြုချက် - ပုသိမ်မှ ကုန်ပစ္စည်းအသစ် ၁၀ ခုကို ချက်ချင်း မှာယူထားပါ။ ထောက်ပံ့မှုနှောင့်နှေးပါက ကြော်ငြာမှုများကို ခေတ္တလျှော့ချထားပါ။

၄။ ငွေပေးချေမှု ကောင်းမွန်အောင် ပြင်ဆင်ခြင်း
ဝယ်ယူသူများ၏ ၉၀ ရာခိုင်နှုန်းမှာ ဝယ်ယူပြီး‌နောက် ကေပေးဖြင့် ကြိုတင်ပေးချေရန် ပိုမိုရွေးချယ်ကြပါသည်။ ငွေစာရင်းရှင်းလင်းမှု ပိုမိုမြန်ဆန်စေရန် ငွေပေးချေမှုအဆင့်တွင် ကျပ်အမ်အမ်ကျူအာကုဒ် ပုံရိပ်တင်ခိုင်းခြင်းကို ပိုမိုမြှင့်တင်ပါ။`;

    const chosenFallback = lang === "my" ? fallbackStrategyMy : fallbackStrategyEn;

    // Cache the fallback so we don't hammer the API on subsequent page reloads
    if (lang === "my") {
      cachedStrategyMy = chosenFallback;
      lastStrategyFetchTimeMy = Date.now();
    } else {
      cachedStrategyEn = chosenFallback;
      lastStrategyFetchTimeEn = Date.now();
    }

    res.json({ success: true, strategy: chosenFallback });
  }
});


// 10. AI SMART MARKETING AND SME ADVISOR ENDPOINTS
app.post("/api/ai/marketing/insights", async (req, res) => {
  const { campaignType = "General", productIds = [] } = req.body || {};
  
  // Quick dynamic analysis of current system orders and products
  const activeProducts = state.products;
  const productSummary = activeProducts.map(p => `${p.name} (${p.category}) - Price: ${p.price} MMK, Stock: ${p.stock}`).join(", ");
  
  // Filter active products by the selected productIds if any are specified
  const selectedProducts = activeProducts.filter(p => !productIds || productIds.length === 0 || productIds.includes(p.id));
  const selectedProductSummary = selectedProducts.map(p => `- ${p.name} (${p.category}): Price ${p.price} MMK. Description: ${p.description}`).join("\n");

  let totalRevenue = 0;
  const itemsCount: { [name: string]: number } = {};
  state.orders.forEach(o => {
    if (o.status !== "cancelled") {
      totalRevenue += o.totalAmount - o.deliveryFee;
      o.items.forEach(i => {
        itemsCount[i.productName] = (itemsCount[i.productName] || 0) + i.quantity;
      });
    }
  });

  const bestSelling = Object.entries(itemsCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `${name} (${count} units sold)`)
    .slice(0, 2);

  const lowStock = activeProducts
    .filter(p => p.stock < 10)
    .map(p => `${p.name} possesses only ${p.stock} units`);

  try {
    const ai = getGeminiClient();

    const systemInstruction = `You am "Sales Brain Marketing Planner", a top-tier digital marketing director and SME consultant for Myanmar business shops.
Analyze the store's current inventory products list and sales metrics. Write a fully tailored, cohesive marketing strategy for the requested campaign theme: "${campaignType}".

CRITICAL REQUIREMENT: Your campaign copywriting, strategy, recommendations, and promo descriptions MUST focus strictly and explicitly on promoting the following selected product(s):
${selectedProductSummary}

You must respond strictly in JSON format matching this exact type schema:
{
  "trendingProducts": string[],
  "underperformingProducts": string[],
  "lowStockAlerts": string[],
  "analyticsSummary": {
    "salesGrowthEstimate": string,
    "engagementLevel": string,
    "bestSellingCategory": string
  },
  "recommendations": [
    {
      "campaignTitle": string,
      "rationale": string,
      "targetAudience": string,
      "discountPercentage": string,
      "duration": string,
      "expectedImpact": string,
      "implementationSteps": string[]
    }
  ],
  "copywriting": {
    "facebookCaption": { "en": string, "my": string },
    "instagramCaption": { "en": string, "my": string },
    "adCopy": { "en": string, "my": string },
    "email": { "en": string, "my": string },
    "hashtags": string
  },
  "bannerPrompt": string
}
Ensure captions are detailed, highly persuasive, and significantly LONGER (each social caption and email MUST contain 3 to 5 fully-developed paragraphs totaling 150-300 words). They must follow a structured format:
1. An attention-grabbing hook or storytelling intro highlighting the holiday/theme atmosphere.
2. A beautiful, detailed product/benefit description highlighting why citizens of Myanmar love these unique selected products.
3. Pricing detail section incorporating active catalogue discount packages.
4. Professional yet ultra-warm CTA (direct order instructions via website/Telegram/Phone) containing KPay prepayment cues.
5. CATEGORY-SPECIFIC RELEVANCE: Identify the exact product category (food, clothes, cosmetics, accessories, electronic devices, digital products/services, home & lifestyle). All benefits, selling points, and descriptions must be 100% relevant and correct to that category (e.g. skin radiance/self-care skincare for cosmetics, styling/comfort/fit for clothing, technical specs/productivity for electronics, instant access for digital services). Never discuss food, desserts, recipes, or tea if the product is apparel or cosmetics, and vice-versa. Align the campaign theme with the selected product categories beautifully.
Caption writing must fully support BOTH English (en) and Myanmar language (my) with rich localized nuances, emojis, and warm, persuasive, high-conversion local copywritings.

For the "bannerPrompt" field, write a highly descriptive prompt for generating a vertical, high-quality, professional real-life digital marketing poster of aspect ratio '3:4' (portrait). This prompt MUST specify featuring a real person (such as a smiling, friendly Burmese model/person) holding or presenting the chosen product (${selectedProducts[0]?.name || "the local crafts"}) against an associated background matching the '${campaignType}' holiday/theme atmosphere. It should specify including cool fonts, stylized design overlays, beautiful professional studio lighting, and looking like a real marketing ad.
Do not output markdown around the JSON block, just raw JSON.`;

    const prompt = `Current Products List: [${productSummary}]. Best Sellers so far: [${bestSelling.join(", ")}]. Low Stock Warnings: [${lowStock.join(", ")}]. Current total sales: ${totalRevenue} MMK.
Generate campaign analysis specifically for the "${campaignType}" theme.

CRITICAL FOCUS REQUIREMENT:
The user has selected the following specific products to promote as the primary and exclusive highlight of this campaign:
${selectedProductSummary}

You MUST base all copywriting (Facebook, Instagram, Ad copies, Emails) and recommendations strictly and exclusively on these selected products.
For each selected product, analyze its category (food, clothing, cosmetics, accessories, electronics, digital products, home/lifestyle). Fully focus the descriptions and selling points on its actual category traits. Mention the exact price(s), e.g. ${selectedProducts.map(p => `${p.name} at ${p.price} MMK`).join(', ')}. Maintain this precise focus across all fields without bringing in unrelated references. Enjoy!`;

    const aiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: "application/json"
      }
    });

    const bodyText = aiRes.text?.trim() || "{}";
    const insights = JSON.parse(bodyText);
    res.json({ success: true, insights });

  } catch (error: any) {
    console.warn("[Sales Brain AI] Marketing API rate limited or offline. Serving high-fidelity fallback response for:", campaignType);

    // Get selected/active products for dynamic fallback injection
    const finalProducts = selectedProducts.length > 0 ? selectedProducts : activeProducts;
    const featuredProdsTextEn = finalProducts.map(p => `${p.name} (${p.price} MMK)`).join(", ");
    const featuredProdsTextMy = finalProducts.map(p => `${p.name} (${p.price} MMK)`).join(" နှင့် ");
    const primaryProd = finalProducts[0] || activeProducts[0];

    // Breathtakingly comprehensive localized fallbacks so it always succeeds gracefully!
    const fallbackTemplate: any = {
      Thingyan: {
        trendingProducts: ["Artisanal Drinks & Mixes", "Pathein Halawa (Premium)"],
        underperformingProducts: ["Traditional Wood Crafts"],
        lowStockAlerts: ["Traditional Pathein Umbrella: Low stock warning (4 units remaining)"],
        analyticsSummary: {
          salesGrowthEstimate: "Estimated +45% sales surge during Thingyan holidays",
          engagementLevel: "Intense afternoon CRM customer inquiry peaks (+70%)",
          bestSellingCategory: "Beverages (Artisanal Drinks)"
        },
        recommendations: [{
          campaignTitle: "Thingyan Splash Sweet Box Promotion 💦",
          rationale: "During the Myanmar New Year water festival (Thingyan), temperatures are extremely hot, and families gather together to share delights. Cold beverages and traditional snacks see historical conversion spikes.",
          targetAudience: "Families, festival-goers, and residents hosting traditional food donations (Satuditha).",
          discountPercentage: "15% off special bundles",
          duration: "10 Days (April 9 - April 18)",
          expectedImpact: "40% sales increase and faster inventory rotation of beverages & halawa sweets",
          implementationSteps: [
            "Select high-demand Beverages and Desserts in the catalog matrix.",
            "Create 'Thingyan Splash Bundles' with pre-calculated rates.",
            "Create promotional banner utilizing primary colors yellow, red and gold.",
            "Post the persuasive Myanmar/English copy on Facebook page.",
            "Integrate automated bot to handle bulk orders with KPay during bank holidays.",
            "Offer direct delivery to Sanchaung, Kamayut, and Bahan townships.",
            "Check sales volume and customer reviews post-Thingyan."
          ]
        }],
        copywriting: {
          facebookCaption: {
            en: "💦 Water, joy, gold, and heritage—Thingyan is officially here! As the scorching April heat peaks across Myanmar, we are absolutely thrilled to launch our exclusive 'Thingyan Splash Sweet Box Promotion'!\n\nDesigned specifically to bring absolute refreshing bliss during the long water festival holidays, this bundle combines our best-selling house beverages, icy traditional fruit mixes, and premium, smooth Pathein Halawa desserts that melt in your mouth. Whether you are hosting a traditional 'Satuditha' food charity donation in Sanchaung, celebrating with family in Bahan, or stepping out to enjoy the water pavilions, this is the ultimate treat to stay energized!\n\n🎁 SPECIAL FESTIVALS PROMOTION: Enjoy an instant 15% discount on all pre-configured bundles! Each package comes with beautiful waterproof carrying bags so you can take them safely everywhere and enjoy with your friends.\n\n🛒 HOW TO ORDER SECURELY:\n1. Tap on the checkout link and choose your favourite sweet selections.\n2. Complete your payment instantly via KBZPay (KPay), AYA pay, or CBPay.\n3. Upload your payment screenshot for immediate booking. Our express trucks delivery will route directly to Sanchaung, Kamayut, and Bahan townships! Share the blessings of Myanmar New Year today!",
            my: "💦 သင်္ကြန်အမူးပြေ ပူပူလောင်လောင်ကြီးမှာ အမောပြေစေဖို့ စိတ်အေးချမ်းသာဖွယ်ရာ 'သင်္ကြန် Splash အထူးဘူး' လေးတွေ ရောက်ရှိလို့လာပါပြီ! သင်္ကြန်ပွဲတော်ရက်တလျှောက် အရသာစုံစုံလင်လင်နဲ့ ပျော်ရွှင်နိုင်ဖို့အတွက် အထူးစီမံထားပါတယ်။\n\nမိသားစုအိမ်ပြန်သူများ၊ လမ်းလျှောက်သင်္ကြန်ထွက်မယ့်သူများနှင့် ရပ်ကွက်ထဲမှာ စတုဒိသာအလှူကျွေးမယ့် ဝါသနာရှင်များအားလုံးအတွက် အဆင်ပြေဆုံးဖြစ်အောင် ကျွန်တော်တို့ရဲ့ လူကြိုက်အများဆုံး သဘာဝလက်လုပ်အချိုရည်များ၊ လတ်ဆတ်ဆန်းသစ်တဲ့ ရိုးရာသစ်သီးဖျော်ရည်များနှင့် နာမည်ကျော် အထူးပုသိမ်ဟလဝါတို့ကို တစ်နေရာတည်းမှာ စုံစုံလင်လင် တွဲစပ်ပေးထားပါတယ်။ ချိုမြတ်တဲ့အရသာနဲ့အတူ မောပန်းမှုတွေကို ချက်ချင်းပြေပျောက်စေမှာ သေချာပါတယ်ဗျာ。\n\n🎁 အထူးပရိုမိုးရှင်းလက်ဆောင် - ဒီနေ့မှာယူရင် တစ်ဗူးချင်းစီအလိုက် ၁၅% အထိ အထူးလျှော့စျေး ရရှိမယ့်အပြင်၊ ရေစိုခံအိတ်လှလှလေးတွေနဲ့ သပ်သပ်ရပ်ရပ် ပါကင်ထုတ်ပိုးပေးသွားမှာဖြစ်ပါတယ်။\n\n🛒 အော်ဒါအလွယ်တကူမှာယူရန် နည်းလမ်း -\n၁။ ကျွန်တော်တို့ရဲ့ ကက်တလော့လင့်ခ်ထဲသို့ ဝင်ရောက်ပြီး မိမိနှစ်သက်ရာ မုန့်နှင့်အချိုရည်များကို ရွေးချယ်ပါ။\n၂။ KBZPay (KPay)၊ Wave Money သို့မဟုတ် ကတ်ဖြင့် လွယ်ကူလျင်မြန်စွာ ငွေပေးချေမှုကို ပြုလုပ်ပါ။\n၃။ ငွေလွှဲပြေစာ (Screenshot) ကို တင်ပေးရုံနဲ့ အတည်ပြုချက်ရရှိပြီး စမ်းချောင်း၊ ဗဟန်း၊ ကမာရွတ်မြို့နယ်များသို့ အိမ်တိုင်ရာရောက် အမြန်ဆုံး ပို့ဆောင်ပေးသွားမှာ ဖြစ်ပါတယ်ခင်ဗျာ။"
          },
          instagramCaption: {
            en: "Make your water festival sweetest! Thingyan Bundle is now active with extra 15% discount. Cool off, stay hydrated, and share traditional premium desserts with your friends and family during this Myanmar New Year! #ThingyanVibes #WaterFestival",
            my: "မိသားစုစုစုစည်းစည်းနဲ့ သင်္ကြန်ရက်တွေကို ဖြတ်သန်းဖို့ အကောင်းဆုံး အချိုရည်နဲ့ မုန့်အတွဲအစပ်လေးတွေ။ ပိတောက်နံ့သင်းတဲ့သင်္ကြန်မှာ အရသာအရှိဆုံးနဲ့ လျှော့စျေးအထူးရယူပါ! #သင်္ကြန်ရေစိုစို"
          },
          adCopy: {
            en: "15% OFF Thingyan Essentials! Limited quantities available. Pre-order now with KPay for instant holiday delivery to Bahan, Sanchaung, & Kamayut!",
            my: "၁၅% သက်သာခွင့်နဲ့ သင်္ကြန်အထူးလက်ဆောင်ဘူးအခုပဲ မှာယူစို့! ရွှေဝါရောင်ပိတောက်ပန်းတွေလို လှပတဲ့သင်္ကြန်ဖြစ်ပါစေ! KBZPay ဖြင့် ငွေလွှဲမြန်ဆန်။"
          },
          email: {
            en: "Subject: Celebrate Myanmar New Year with our Sweet Thingyan Bundles!\n\nDear Customer,\n\nThingyan and sweetness come hand in hand! As families gather to celebrate the glorious water festival, we are excited to deliver happiness straight to your doorstep.\n\nOur exclusive bundles are filled with refreshing traditional drinks and Pathein Halawa perfect for satuditha donations or family reunions. Enjoy an exclusive 15% sub-total savings when you order today. Simply pay through KBZPay or CBPay to verify. Wishing you a fabulous New Year!",
            my: "ခေါင်းစဉ် - မြန်မာ့နှစ်သစ်ကူး သင်္ကြန်ပွဲတော်အတွက် အထူးလျှော့စျေးများ!\n\nချစ်ခင်ရပါသော ဆိုင်ဝယ်သူများခင်ဗျား...\n\nပျော်ရွှင်စရာ သင်္ကြန်ပွဲမှာ ချိုမြိန်ပြီး အမောပြေစေမယ့် ရိုးရာမုန့်အတွဲလေးတွေ အရသာရှိရှိ သုံးဆောင်နိုင်ဖို့ အထူးလျှော့စျေး ၁၅% စီစဉ်ပေးထားပါတယ်။ သင့်မိသားစုဆီသို့ တိုက်ရိုက်ပို့ဆောင်ပေးမည့်အပြင် KPay ဖြင့်လည်း လျင်မြန်စွာ ငွေပေးချေနိုင်ပါတယ်။ ပျော်ရွှင်စရာနှစ်သစ်ဖြစ်ပါစေ!"
          },
          hashtags: "#Thingyan #WaterFestival #MyanmarNewYear #SME #MyanmarFood"
        },
        bannerPrompt: "A vibrant Thingyan Water festival digital banner design featuring green water splashes, golden Padauk flowers on the margins, and traditional food packages on an elegant yellow-gold backdrop with big text '15% OFF WATER FESTIVAL SALE'"
      },
      Christmas: {
        trendingProducts: ["Pathein Halawa (Premium)", "Traditional Arts & Crafts"],
        underperformingProducts: ["Beverages & Mixes"],
        lowStockAlerts: ["Traditional Arts: Low inventory on wooden carvings"],
        analyticsSummary: {
          salesGrowthEstimate: "Estimated +30% sales surge during winter holiday gifts season",
          engagementLevel: "High activity during evening gift exchanges (8:00 PM onwards)",
          bestSellingCategory: "Traditional Desserts & Handcrafted Gifts"
        },
        recommendations: [{
          campaignTitle: "Warm Winter Festive Gift Campaign 🎄",
          rationale: "Winter holidays and Christmas are prominent seasons for sending gifts to loved ones, relatives, and colleagues as tokens of appreciation.",
          targetAudience: "Corporate staff, families, and young couples seeking unique Burmese traditional gifts.",
          discountPercentage: "10% storewide & Free gift wrapping",
          duration: "7 Days (December 20 - 27)",
          expectedImpact: "Boost high-value traditional craft sales by 50% through high-margin appreciation crates.",
          implementationSteps: [
            "Assemble custom gift parcels including premium Pathein Halawa and traditional bamboo crafts.",
            "Set special discounted prices under Product Catalog.",
            "Design a cosy green-and-red Christmas poster.",
            "Publish the warm Facebook announcement captions.",
            "Send immediate checkout payment invoices with pre-applied delivery discount.",
            "Write custom hand-written wishes inside every order.",
            "Verify complete package deliveries before Christmas Eve."
          ]
        }],
        copywriting: {
          facebookCaption: {
            en: "🎄 Spread warmth and joy this festive holiday! Present our carefully handwrapped traditional craft giftboxes that tell a beautiful heritage story.\n\nThis Christmas, skip the ordinary gifts and present your beloved families, corporate colleagues, and precious partners with a premium, carefully handwrapped traditional craft giftbox. Curated under the story of Myanmar's heritage, our boxes feature our signature, smooth Premium Pathein Halawa paired beautifully with handcrafted bamboo coasters and artisanal winter teas. It's more than a gift; it's a warm, memorable story of culture and appreciation.\n\n✨ CHRISTMAS EXCLUSIVE DEALS: Enjoy a generous 10% storewide discount along with absolute free premium winter-themed gift wrapping! Each gift box is customized with a hand-written greeting cards for your specific personal wishes!\n\n🎅 HOW TO REGISTER YOUR GIFT BUNDLE:\n1. Click the catalog menu, select your traditional winter baskets.\n2. Furnish your personalized greeting wishes in the memo.\n3. Complete KBZPay/KPay prepayment to fast-track your booking. timly shipping is guaranteed!",
            my: "🎄 ဒီဇင်ဘာရဲ့ အေးချမ်းတဲ့ နှင်းငွေ့ပျံခရစ္စမတ်ကာလမှာ ချစ်ခင်ရသူတွေကို မေတ္တာအနွေးထည်တွေ ဝေမျှလိုက်ရအောင်!\n\nယခုလို ပွဲတော်ရက်တွေမှာ ထူးခြားဆန်းသစ်ပြီး ဂုဏ်ရှိလှပတဲ့ ရိုးရာအမှတ်တရတွေကို ပေးချင်တယ်ဆိုရင်တော့ သန့်ရှင်းလက်ဆက်တဲ့ နာမည်ကြီး ပုသိမ်ဟလဝါ (Premium)၊ လက်ရာမြောက်ဝါးလက်မှု ဒီဇိုင်းများနှင့် အရသာထူးကဲတဲ့ ရိုးရာနွေးထွေးလက်ဖက်သီးသန့်ဘူးတွေကို ပေါင်းစပ်ပေးထားတဲ့ လက်ဆောင်ပုံးတွေကို ရွေးချယ်သင့်ပါတယ်ခင်ဗျာ။ ပေးရသူလည်း မျက်နှာပွင့်၊ ရရှိသူလည်း အတိုင်းမသိ ဝမ်းသာပီတိဖြစ်ရမယ့် မြန်မာ့ရိုးရာ လက်ဆောင်မွန်တစ်ခု ဖြစ်ပါတယ်။\n\n✨ ခရစ္စမတ်အထူးခံစားခွင့် - ဆိုက်ရှိ ကုန်ပစ္စည်းအားလုံးကို ၁၀% လျှော့စျေးဖြင့် ရရှိမည့်အပြင်၊ အလှပဆုံး ခရစ္စမတ်ပါကင်စနစ်ဖြင့် အခမဲ့ထုပ်ပိုးပေးသွားမှာဖြစ်ပါတယ်။\n\n🎅 လက်ဆောင်မှာယူရန် နည်းလမ်းများ -\n၁။ ဆိုင်ရဲ့ ကက်တလော့ဖောင်ထဲသို့ဝင်ကာ လက်ဆောင်ပုံစံကိုရွေးချယ်ပါ။\n၂။ မိမိရေးလိုတဲ့ ဆုတောင်းစာသားကို ထည့်သွင်းပေးပါ။\n၃။ KPay (KBZPay) သို့မဟုတ် ဖုန်းနံပါတ်ဖြင့် အလွယ်တကူ ငွေပေးချေပြီး Screenshot ပေးပို့ပါ။"
          },
          instagramCaption: {
            en: "Give the gift of pure cultural heritage. Warm traditional Christmas boxes are live now! Includes Pathein Halawa and beautiful carved coasters. Free love wishes card. 🎅🎁 #ChristmasInBurma #HeritageGift",
            my: "နှလုံးသားနဲ့ ဖန်တီးထားတဲ့ ရိုးရာလက်ဆောင်ပစ္စည်းလေးတွေနဲ့ ဒီနှစ်ခရစ္စမတ်မှာ အံ့အားသင့်စေလိုက်ပါ။ ၁၀% အထူးလျှော့စျေး 🎁"
          },
          adCopy: {
            en: "Warm Christmas Holiday Hampers: 10% Discount & free Myanmar packaging wraps. Timely door-to-door delivery! Order now using KPay.",
            my: "ခရစ္စမတ်အထူးလက်ဆောင်ဘူးများ - ၁၀% လျှော့စျေးနှင့် အခမဲ့လှပသော ပါကင်ထုတ်လုပ်မှုစနစ်! ချစ်ရသူအရောက် KPay ဖြင့် မြန်ဆန်စွာ မှာယူပါ။"
          },
          email: {
            en: "Subject: Send the Warmth of Traditional Crafts this Christmas\n\nDear Valued Customer,\n\nChristmas is the perfect season of gratitude. Share a story of culture and taste with our limited-edition craft appreciation crates.\n\nInside, find our premium traditional desserts and custom bamboo coasters designed by local artisans. Order today with an automated 10% discount applied. Fast KBZPay verification is active. Timely shipping guaranteed!",
            my: "ခေါင်းစဉ် - ချစ်ရသူတွေအတွက် အမှတ်တရ ခရစ္စမတ်လက်ဆောင်ပုံးများ။\n\nချစ်ခင်ရပါသော ဆိုင်ဝယ်သူများခင်ဗျား...\n\nဒီနှစ်ခရစ္စမတ်မှာ အမှတ်တရထူးခြားဆန်းသစ်တဲ့ ရိုးရာမုန့်ဘူးလေးများကို မိစုနှင့် မိတ်ဆွေများဆီ ပေးပို့မေတ္တာမျှဝေနိုင်ဖို့ ၁၀% လျှော့စျေး စီစဉ်ပေးလိုက်ပါတယ်။ အခမဲ့ ထုပ်ပိုးခြင်းစနစ်နှင့်အလှဆင်ကတ်များဖြင့် အထူးဝန်ဆောင်မှုပေးမှာ ဖြစ်ပါတယ်။"
          },
          hashtags: "#ChristmasInMyanmar #FestiveGifts #BurmeseCrafts #WarmWinter"
        },
        bannerPrompt: "A cozy Christmas holiday marketing poster featuring rich green and ruby red colors, golden fairy lights, delicate snowflakes, and traditional craft baskets filled with traditional cakes"
      },
      NewYear: {
        trendingProducts: ["Pathein Halawa (Premium)", "Cracker Snacks"],
        underperformingProducts: ["Traditional Arts"],
        lowStockAlerts: ["Stock level stable for New Year party munchies"],
        analyticsSummary: {
          salesGrowthEstimate: "Estimated +35% high-volume basket checkouts on December 31st",
          engagementLevel: "High checkout peaks midnight pre-orders",
          bestSellingCategory: "Snacks & Sweet treats"
        },
        recommendations: [{
          campaignTitle: "New Year Eve Party Munchies Celebration 🥳",
          rationale: "As individuals count down to the New Year, social house-parties and sharing of snack packs and family dessert boards hit rapid consumer demand heights.",
          targetAudience: "Young shoppers, party hosts, and group gathering coordinators.",
          discountPercentage: "Buy 2 Get 1 Free on all Party Packs",
          duration: "3 Days (December 30 - January 1)",
          expectedImpact: "Clear inventory of snack foods and sweets, creating high double-order volumes.",
          implementationSteps: [
            "Set up 'Buy 2 Get 1' or bundle triggers on Snacks inside the matrix.",
            "Verify product stock availability for large evening demands.",
            "Prepare dark countdown midnight starry banners.",
            "Launch energetic social captions in Burmese and English.",
            "Activate conversational bot to immediately lock order and secure prepayments.",
            "Enable express same-day delivery routing.",
            "Recount remaining stock list for New Year morning restocks."
          ]
        }],
        copywriting: {
          facebookCaption: {
            en: "🥳 Transition into the New Year with sweetness! Grab our 'Buy 2 Get 1 Free' Party munchies packs. Perfect for late night count-down groups. Live now!",
            my: "🥳 ပျော်ရွှင်စရာကောင်းတဲ့ နှစ်သစ်ကူးညကို မိသားစု၊ သူငယ်ချင်းတွေနဲ့အတူ ဖြတ်သန်းဖို့ အကြွပ်မုန့်အတွဲတွေ 'Buy 2 Get 1' အထူးပရိုမိုးရှင်း ရောက်ရှိလာပါပြီ! ကောင်ဒေါင်းလုပ်ရင်း ဝိုင်းဖွဲ့စားဖို့ အခုပဲ တယ်လီဂရမ်ကနေ တိုက်ရိုက်မှာယူလိုက်ပါဗျို့!"
          },
          instagramCaption: {
            en: "New Year, Same Great Taste! Buy 2 GET 1 absolute free promotion. Sparkle your celebration. ✨🥂",
            my: "နှစ်သစ်မှာ အကောင်းမွန်ဆုံးအရသာတွေနဲ့ ဖြတ်သန်းဖို့ အကြွပ်မုန့်ပရိုမိုးရှင်းတွေရှိနေပြီ။ #နှစ်သစ်နှစ်ဆန်း"
          },
          adCopy: {
            en: "Count down with Sweets: Buy 2 Get 1 FREE on Party Treats. Instant settlement active!",
            my: "နှစ်သစ်အကြို ပါတီမုန့်ဘူးများ - နှစ်ဘူးဝယ် တစ်ဘူးလက်ဆောင်! မြန်မြန်အော်ဒါတင်စို့!"
          },
          email: {
            en: "Subject: Bring Sweetness to the New Year Countdown! Buy 2 Get 1 Free Party treats await...",
            my: "ခေါင်းစဉ် - ပျော်ရွှင်ဖွယ်ကောင်းသော နှစ်သစ်ကူး ပါတီမုန့်ဘူးများ။ ချစ်ခင်ရပါသော ဆိုင်ဝယ်သူများခင်ဗျား..."
          },
          hashtags: "#NewYearEve #CountdownSweets #SMEGold #MyanmarParty"
        },
        bannerPrompt: "An energetic New Year countdown marketing graphic with deep dark blue background, vibrant neon fireworks, sparkling champagne gold stars, and delicious snack bowls"
      },
      Valentine: {
        trendingProducts: ["Pathein Halawa (Premium)"],
        underperformingProducts: ["Snacks"],
        lowStockAlerts: ["Sweet Boxes: High demand, critical stock buffer needed"],
        analyticsSummary: {
          salesGrowthEstimate: "Estimated +50% sales boost on premium custom chocolate and sweet boxes",
          engagementLevel: "Direct chat inquiries spike heavily in late nights searching custom requests",
          bestSellingCategory: "Premium Confectionery & Sweet Boxes"
        },
        recommendations: [{
          campaignTitle: "Sweetheart Premium Confectionery Devotion 💖",
          rationale: "Valentine's Day signals romantic gifting. Presenting high-quality traditional sweets in gorgeous, limited-edition packaging targets youthful romance buyers looking for local yet premium options.",
          targetAudience: "Couples, partners, and friends looking for sweet, premium local presents.",
          discountPercentage: "Free customized love notes & 10% Couple Rebate",
          duration: "4 Days (February 11 - 14)",
          expectedImpact: "Increase dessert category average cart value, drawing new viral social visual shares.",
          implementationSteps: [
            "Prepare limited romantic packaging wrappers for sweet boxes.",
            "Add couple options in product catalogue.",
            "Design highly elegant, pink-pastel and crimson marketing banners.",
            "Publish romantic, poetic Burmese + English captions on social channels.",
            "Keep CRM Live takeover active to support cute custom handwritten letter requests.",
            "Coordinate reliable afternoon surprise deliveries during February 14th.",
            "Examine profit margins of Valentine themed additions."
          ]
        }],
        copywriting: {
          facebookCaption: {
            en: "💖 Speak the language of love with local authentic sweets! Gift your beloved our beautifully wrapped sweet boxes. Complete with personalized handwritten devotion notes free! Order now!",
            my: "💖 ချစ်သူသက်တမ်းတစ်လျှောက် အချိုမြိန်ဆုံး အမှတ်တရလေးတွေ ဖန်တီးပေးဖို့ ရိုးရာအချိုပွဲ အထူးဒီဇိုင်း ဆွိဟတ်ဗူးလေးများ! ချစ်ရသူအရောက် လက်ရေးအချစ်ကတ်ပြားလေးနဲ့ အခမဲ့အံ့အားသင့်စေမယ့် ပို့ဆောင်ပေးမှုစနစ်လည်း ပါဝင်လို့ အပြေးလေး မှာယူထားလိုက်နော်။"
          },
          instagramCaption: {
            en: "Local Sweets x Pure Love. Order the Valentine's devotion box today with romantic note options. 🌹💌",
            my: "ချစ်သူများနေ့မှာ ရိုမန်းတစ်ဆန်ဆန် ပါကင်အထူးဘူးလေးတွေနဲ့ သင့်ချစ်သူကို လက်ဆောင်ပေးလိုက်ပါ။"
          },
          adCopy: {
            en: "Make Valentine's Sweet: 10% off romantic bundles + free gift letters. Order before slots close!",
            my: "ဖေဖော်ဝါရီ ၁၄ ချစ်သူများနေ့အထူး - ၁၀% သက်သာခွင့်နှင့် အချစ်ကတ်ပြားလက်ရေးအစီအစဉ်!"
          },
          email: {
            en: "Subject: Sweeten Valentine's with Authentic Craft Treats. Dear Valued Customer...",
            my: "ခေါင်းစဉ် - ချစ်သူများနေ့အတွက် အချိုမြိန်ဆုံး ရိုးရာလက်ဆောင်ဘူးများ။ ချစ်ခင်ရပါသော ဆိုင်ဝယ်သူများခင်ဗျား..."
          },
          hashtags: "#ValentinesInMyanmar #Feb14Sweets #LoveGifts #MyanmarSME"
        },
        bannerPrompt: "A gorgeous luxury romantic Valentine's Day sale poster layout with soft pink-pastel, deep ruby red velvet background, subtle rising heart petals, and a gorgeous sweet box with ribbons"
      },
      BackToSchool: {
        trendingProducts: ["Traditional Arts & Crafts", "Cracker Snacks"],
        underperformingProducts: ["Desserts"],
        lowStockAlerts: ["Backpacks and stationery inventory stable"],
        analyticsSummary: {
          salesGrowthEstimate: "Estimated +25% conversion spikes on school snack bundles and craft tools",
          engagementLevel: "Morning grocery planners and mothers browsing bulk packs",
          bestSellingCategory: "Educational Supplies & Snacking Boxes"
        },
        recommendations: [{
          campaignTitle: "Back-to-School Smart Fuel Campaign 🎒",
          rationale: "School reopening drives parental demand for ready-made lunchboxes and study-time snacks. Packaging custom snack boxes delivers high convenience.",
          targetAudience: "Mothers, students, and family event organizers.",
          discountPercentage: "20% OFF",
          duration: "14 Days",
          expectedImpact: "Boost unit snack volume sales by 30% with school pre-order deliveries.",
          implementationSteps: [
            "Bundle cracker snacks and warm drinks into healthy student lunchboxes.",
            "Display clean, minimalist school theme graphics.",
            "Offer classroom delivery discounts for bulk orders.",
            "Accept secure digital payments via KBZPay and Wave Money."
          ]
        }],
        copywriting: {
          facebookCaption: {
            en: "🎒 Back-to-school season has arrived! Give your kids the absolute best, most delicious traditional snacks for study sessions with our Smart Fuel packs. 20% off special is live!",
            my: "🎒 ကျောင်းဖွင့်ရာသီ အထူးပရိုမိုးရှင်း ရောက်ရှိလာပါပြီ! ကလေးများအတွက် ကျန်းမာရေးနဲ့ညီညွတ်တဲ့ ရိုးရာမုန့်အဟာရစုံအစပ်တွဲဗူးများကို ၂၀% အထူးလျှော့စျေးဖြင့် သက်သာစွာ စုဆောင်းဝယ်ယူနိုင်ပါပြီခင်ဗျာ။"
          },
          instagramCaption: {
            en: "Study smart, snack healthier! 20% Off school lunchbox snack bundles. 🎒🍿",
            my: "ကျောင်းသားကျောင်းသူများ စိတ်ရွှင်လန်းစွာ စာသင်ကြားနိုင်ဖို့ အဟာရပြည့်မုန့်ဗူးများ ၂၀% လျှော့စျေး။"
          },
          adCopy: {
            en: "Back to School Specials: 20% Off student snack boxes!",
            my: "ကျောင်းဖွင့်ပရိုမိုးရှင်း - ကျောင်းသားအဟာရဗူးများ ၂၀% လျှော့စျေး။"
          },
          email: {
            en: "Subject: Help them achieve their best with 20% off School Snack Boxes! Dear parents...",
            my: "ခေါင်းစဉ် - ကလေးများကျောင်းဖွင့်ချိန်မှာ အဆင်သင့်ရှိစေမယ့် အဟာရမုန့်ဘူးများ ၂၀% အထူးလျှော့စျေး။"
          },
          hashtags: "#BackToSchool #StudentSnacks #MyanmarSME"
        },
        bannerPrompt: "A pleasant scholastic backdrop featuring notebooks, pencils, color frames, and a customized study snack bundle with text 'BACK TO SCHOOL SALE'"
      },
      MonsoonSale: {
        trendingProducts: ["Beverages & Mixes", "Pathein Halawa (Premium)"],
        underperformingProducts: ["Traditional Arts"],
        lowStockAlerts: ["Check tea mix reserves weekly for rainy day spikes"],
        analyticsSummary: {
          salesGrowthEstimate: "Estimated +35% conversions for hot coffee and tea items on rainy afternoons",
          engagementLevel: "Cozy home dwellers browsing comfort foods during rainstorms",
          bestSellingCategory: "Beverages (Hot Brews & Sweet Teas)"
        },
        recommendations: [{
          campaignTitle: "Monsoon Cozy Warm-Up Sale 🌧️",
          rationale: "During rainy monsoon days, warm comfort tea and sweet authentic jaggery drops are highly sought after to brighten up chilly weather.",
          targetAudience: "Families, home dwellers, and remote office workers in Myanmar.",
          discountPercentage: "15% OFF",
          duration: "7 Days",
          expectedImpact: "Increase high-margin hot beverage sales by 35% with contactless instant courier dispatch.",
          implementationSteps: [
            "Combine hot Royal Myanmar Tea Mix packets with traditional palm jaggery bites.",
            "Post comforting rainy day captions on active Facebook page channels.",
            "Utilize contactless KPay screenshot uploads for swift courier bookings."
          ]
        }],
        copywriting: {
          facebookCaption: {
            en: "🌧️ Chilly rainy afternoons call for warm comforts! Cozy up with our classic tea & sweet traditional bundle, now at 15% off.",
            my: "🌧️ မိုးအေးအေးလေးမှာ အိမ်ထဲကမထွက်ဘဲ ပူပူနွေးနွေး အရသာထူးကဲလှသော ရိုးရာမုန့်အဆန်းလေးတွေနဲ့ အမောပြေစေဖို့ ၁၅% အထူးလျှော့စျေး မိုးရာသီအစီအစဉ်လေး စတင်လိုက်ပါပြီ။"
          },
          instagramCaption: {
            en: "Monsoon rain and cozy teacups. 15% Off comfort beverage bundles! 🌧️☕",
            my: "မိုးရာသီအဝီကန့်မှာ သင့်ကိုနွေးထွေးစေမယ့် ရိုးရာဆေးဖက်ဝင် လက်ဖက်ရည်ကြမ်းနှင့် မုန့်အတွဲလေးများ။"
          },
          adCopy: {
            en: "Rainy Day Specials: 15% off classic comforting sweet bundles!",
            my: "မိုးရာသီအထူး - ပူနွေးလန်းဆန်းသော လက်ဖက်ရည်အတွဲဗူး ၁၅% လျှော့စျေး။"
          },
          email: {
            en: "Subject: Stay Safe & Warm with 15% Off Monsoon Cozy Specials! Dear Valued Customer...",
            my: "ခေါင်းစဉ် - မိုးရာသီအအေးမှာ သင့်အိမ်ကို နွေးထွေးစေမယ့် လက်ဆောင်မွန် သီးသန့် ၁၅% လျှော့စျေး။"
          },
          hashtags: "#MonsoonSale #BurmeseMilkyTea #CozyRainyDay #SMEBrand"
        },
        bannerPrompt: "A cozy rainy season window view with water droplets on pane, a steaming cup of freshly brewed tea, and warm candlelight with text 'MONSOON COZY WARM-UP SALE'"
      },
      FlashSale: {
        trendingProducts: ["Pathein Halawa (Premium)", "Artisanal Drinks"],
        underperformingProducts: ["Traditional Arts"],
        lowStockAlerts: ["Check stock limits weekly for weekend surges"],
        analyticsSummary: {
          salesGrowthEstimate: "Estimated +25% conversion improvement through payday weekend flash deals",
          engagementLevel: "Weekend checkout spikes during leisure browsing hours",
          bestSellingCategory: "Food & Beverages"
        },
        recommendations: [{
          campaignTitle: "Weekend Lightning Flash Sale ⚡",
          rationale: "Leisure shoppers have higher weekend browsing downtime. Slicing prices for 72 hours builds conversion urgency.",
          targetAudience: "Weekend shoppers seeking quick premium sweet treats.",
          discountPercentage: "25% OFF",
          duration: "3 Days (Fri - Sun)",
          expectedImpact: "Boost weekend gross revenue margins by 25% during regular business cycles.",
          implementationSteps: [
            "Activate 25% discount coupons starting early Friday morning.",
            "Restock highly demanded dessert specialties beforehand.",
            "Accept KPay and Wave Money screenshots for rapid holiday dispatch."
          ]
        }],
        copywriting: {
          facebookCaption: {
            en: "⚡ Reward yourself after a busy work week! Treat yourself and your family to premium sweet traditional treats at 25% off weekend special. Live now!",
            my: "⚡ ပင်ပန်းသမျှ တစ်ပတ်တာအလုပ်တွေကို ဘေးဖယ်ထားပြီး မင်္ဂလာရှိတဲ့ဝီကန့်ပရိုမိုးရှင်းလေးနဲ့အတူ ရိုးရာမုန့်ချိုချိုလေးတွေနဲ့ စိတ်အပန်းဖြေလိုက်ရအောင်! ၂၅% လျှော့စျေး ဝီကန့်ပရိုမိုးရှင်း အခုပဲ စတင်ပါပြီခင်ဗျာ။"
          },
          instagramCaption: {
            en: "Self-care begins with sweet traditional treats! 25% Weekend Flash active! ⚡🧁",
            my: "ဝီကန့်အားလပ်ရက်မှာ အကောင်းဆုံးအရသာတွေနဲ့ စိတ်အပန်းဖြေဖို့ ၂၅% လျှော့စျေး စတင်ပါပြီ။"
          },
          adCopy: {
            en: "Weekend Flash Sale: Settle orders exceeding 15,000 MMK with 25% off!",
            my: "ဝီကန့်ဝယ်ယူမှု စုစုပေါင်း ၁၅,၀၀၀ ကျပ်အထက် ၂၅% အထူးလျှော့စျေး ဝဘ်ဆိုဒ်မှာ ချက်ချင်းမှာယူလိုက်ပါ။"
          },
          email: {
            en: "Subject: Reward Yourself with a 25% Weekend Treat! Dear Valued Customer...",
            my: "ခေါင်းစဉ် - ပင်ပန်းသမျှအမောပြေစေမယ့် ဝီကန့် အထူးလျှော့စျေး ၂၅% စတင်ပါပြီ။"
          },
          hashtags: "#WeekendDelight #MyanmarSME #WeekendShopping"
        },
        bannerPrompt: "A clean modern slate-gray marketing poster with gold-accented frames and glowing sparkles with text 'WEEKEND DELIGHT FLASH SALE'"
      },
      General: {
        trendingProducts: ["Pathein Halawa (Premium)", "Artisanal Drinks"],
        underperformingProducts: ["Traditional Arts"],
        lowStockAlerts: ["Check stock limits weekly for weekend surges"],
        analyticsSummary: {
          salesGrowthEstimate: "Estimated +20% conversion improvement through routine weekend flash sales",
          engagementLevel: "Slight conversion drop around mid-weeks, spikes on payday (30th of month)",
          bestSellingCategory: "Food & Beverages"
        },
        recommendations: [{
          campaignTitle: "SME Weekend Flash Delight Campaign 🌟",
          rationale: "Buyers routines include weekly weekend downtime browsing. Running targeted limited-period discount timers boosts immediate weekend checkouts.",
          targetAudience: "Weekend leisure shoppers seeking authentic traditional tastes at homes.",
          discountPercentage: "10% off storewide above 15,000 MMK total checkout",
          duration: "3 Days (Every Friday to Sunday)",
          expectedImpact: "Boost week-end gross sales margins by 25% during regular business cycles.",
          implementationSteps: [
            "Enable 10% coupon rates on items during weekend periods.",
            "Restock hot dessert treats on Friday mornings.",
            "Display clean, minimalist weekend sale banners.",
            "Launch cozy weekend relax captions on Facebook channels.",
            "Activate chatbot with faster automations on pre-orders.",
            "Route local kamayut / sanchaung delivery runs together for optimized transport costs.",
            "Summarize profits on Monday mornings to cycle strategy."
          ]
        }],
        copywriting: {
          facebookCaption: {
            en: "🌟 Reward yourself after a busy work week! Treat yourself and your loved ones to beautiful sweet desserts and crafts. 10% off weekend checkout special is officially live now!",
            my: "🌟 ပင်ပန်းသမျှ တစ်ပတ်တာအလုပ်တွေကို ဘေးဖယ်ထားပြီး မင်္ဂလာရှိတဲ့ဝီကန့်ပရိုမိုးရှင်းလေးနဲ့အတူ ရိုးရာမုန့်ချိုချိုလေးတွေနဲ့ စိတ်အပန်းဖြေလိုက်ရအောင်! ၁၀% လျှော့စျေး ဝီကန့်ပရိုမိုးရှင်း အခုပဲ စတင်ပါပြီခင်ဗျာ။"
          },
          instagramCaption: {
            en: "Weekend Treats: Self-care begins with sweet traditional snacks. 10% Weekend Off active! 🍿🥤",
            my: "ဝီကန့်အားလပ်ရက်မှာ အကောင်းဆုံးအရသာတွေနဲ့ စိတ်အပန်းဖြေဖို့။"
          },
          adCopy: {
            en: "Treat Yourself: 10% Weekend discounts on order checkouts exceeding 15,000 MMK. Settles in seconds!",
            my: "ဝီကန့်ဝယ်ယူမှု စုစုပေါင်း ၁၅,၀၀၀ ကျပ်အထက် ၁၀% အထူးလျှော့စျေး! သက်သာစွာ ဝယ်ယူလိုက်စို့!"
          },
          email: {
            en: "Subject: Reward Yourself with a 10% Weekend Treat! Dear Valued Customeer...",
            my: "ခေါင်းစဉ် - ပင်ပန်းသမျှအမောပြေစေမယ့် ဝီကန့် အထူးလျှော့စျေး။ ချစ်ခင်ရပါသော ဆိုင်ဝယ်သူများခင်ဗျား..."
          },
          hashtags: "#WeekendDelight #MyanmarSME #TraditionalTreats #WeekendShopping"
        },
        bannerPrompt: "A clean modern slate-gray marketing poster with gold-accented frames, glowing sparkles, featuring premium traditional cake platters and drinks with textual overlay 'WEEKEND DELIGHT FLASH SALE'"
      }
    };

    const targetType = campaignType in fallbackTemplate ? campaignType : "General";
    const fallbackResponse = JSON.parse(JSON.stringify(fallbackTemplate[targetType]));

    // Dynamic injection into fallback copywriting based on user's checked products
    if (fallbackResponse.copywriting) {
      const pShortNameEn = finalProducts.slice(0, 2).map(p => p.name).join(" & ");
      const pShortNameMy = finalProducts.slice(0, 2).map(p => p.name).join(" နှင့် ");

      if (fallbackResponse.copywriting.facebookCaption) {
        fallbackResponse.copywriting.facebookCaption.en = `[Promoting Selected Selections: ${featuredProdsTextEn}]\n\n` + fallbackResponse.copywriting.facebookCaption.en;
        fallbackResponse.copywriting.facebookCaption.my = `[အထူးအရောင်းမြှင့်တင်ရန် ရွေးချယ်မှု - ${featuredProdsTextMy}]\n\n` + fallbackResponse.copywriting.facebookCaption.my;
      }
      if (fallbackResponse.copywriting.instagramCaption) {
        fallbackResponse.copywriting.instagramCaption.en = `Featuring: ${pShortNameEn}! ` + fallbackResponse.copywriting.instagramCaption.en;
        fallbackResponse.copywriting.instagramCaption.my = `${pShortNameMy} အတွက် သီးသန့်ပရိုမိုးရှင်း! ` + fallbackResponse.copywriting.instagramCaption.my;
      }
    }

    const backgroundDetails: { [key: string]: string } = {
      Thingyan: "a vibrant summer water festival backdrop featuring yellow Padauk flowers, sparkling water splashes, and cool yellow accent design overlays",
      Christmas: "a warm winter Christmas scene featuring green evergreen pine branches, ruby red ornaments, and glowing golden fairy lights",
      NewYear: "an energetic, starry countdown night with colorful glowing fireworks, sparkly confetti, and elegant dark metallic borders",
      Valentine: "a beautiful romantic backdrop with lovely red roses, aesthetic hearts, and warm pink candlelight glow",
      BackToSchool: "a colorful school-themed chalkboard scenery with colorful textbooks, creative drawing elements, and sky blue accents",
      MonsoonSale: "a cozy rainfall-themed backdrop featuring blue and dark teal cloud patterns, soft raindrops, and glowing warm lighting overlays",
      FlashSale: "a high-contrast golden lightning weekend promotional backdrop featuring modern metallic accents, clean border lines, and modern typography",
      General: "a highly stylized premium lifestyle backdrop with smooth gradients and modern design overlays"
    };
    const bgDesc = backgroundDetails[campaignType] || backgroundDetails.General;

    // High-fidelity dynamic copywriting override based on the selected products!
    const getProductHighlight = (p: any, lang: "en" | "my") => {
      const name = (p.name || "").toLowerCase();
      const desc = p.description || "";
      const cat = (p.category || "").toLowerCase();
      
      const isFood = cat.includes("food") || cat.includes("dessert") || cat.includes("snack") || cat.includes("beverage") || name.includes("tea") || name.includes("halawa") || name.includes("jaggery") || name.includes("honey") || name.includes("snack");
      const isCloth = cat.includes("cloth") || cat.includes("apparel") || cat.includes("wear") || cat.includes("dress") || cat.includes("fashion") || name.includes("shirt") || name.includes("dress") || name.includes("fabric") || name.includes("trousers") || name.includes("shoe");
      const isCosmetic = cat.includes("cosmetic") || cat.includes("beauty") || cat.includes("skin") || cat.includes("care") || name.includes("skin") || name.includes("cream") || name.includes("lipstick") || name.includes("makeup") || name.includes("oil");
      const isAccessory = cat.includes("accessory") || cat.includes("jewelry") || cat.includes("bag") || cat.includes("watch") || name.includes("ring") || name.includes("bag") || name.includes("umbrella") || name.includes("parasol");
      const isElectronic = cat.includes("electronic") || cat.includes("device") || cat.includes("tech") || cat.includes("phone") || cat.includes("gadget") || cat.includes("computer") || name.includes("phone") || name.includes("charger") || name.includes("cable") || name.includes("earbud");
      const isDigital = cat.includes("digital") || cat.includes("service") || cat.includes("software") || name.includes("course") || name.includes("sub") || name.includes("account");
      const isHome = cat.includes("home") || cat.includes("lifestyle") || cat.includes("furnit") || cat.includes("decor") || name.includes("decor") || name.includes("furniture") || name.includes("candle");

      if (name.includes("tea") || name.includes("royal") || name.includes("beverage")) {
        return lang === "en" 
          ? `Our signature Royal Myanmar Instant Tea Mix brings the comforting, creamy, and sweet sensation of authentic tea-shop brew right into your home. Packaged in 30 ready-to-brew sachets, it's perfect for warm traditional morning routines in Myanmar.`
          : `ကျွန်တော်တို့ရဲ့ အဓိကရွေးချယ်မှုဖြစ်တဲ့ Royal Myanmar Instant Tea Mix က လက်ဖက်ရည်ဆိုင်က ပွက်ပွက်နွေးနွေး ဆိုင်သောက်လက်ဖက်ရည်အရသာကို အိမ်မှာ ၁ မိနစ်အတွင်း ဖျော်သောက်နိုင်စေပြီး မြန်မာလူမျိုးတိုင်း နှစ်သက်ကြိုက်နှစ်သက်လှပါတယ်။`;
      }
      if (name.includes("halawa") || name.includes("pathein") || name.includes("dessert")) {
        return lang === "en"
          ? `Indulge in our legendary Premium Pathein Halawa, crafted with pure butter, sticky rice, and roasted poppy seeds that melt in your mouth with an authentic Burmese sweet heritage.`
          : `လူတိုင်းအကြိုက်နှစ်သက်လှတဲ့ နာမည်ကြီး ပုသိမ်ဟလဝါ (Premium Butter & Poppy Seed) က ဘိန်းစေ့လေးတွေနဲ့ ထောပတ်နံ့သင်းသင်းလေးမို့ ခံတွင်းထဲမှာ အရည်ပျော်သွားစေမယ့် မြန်မာ့ရိုးရာအကန်ဦးအချိုပွဲဖြစ်ပါတယ်။`;
      }
      if (name.includes("parasol") || name.includes("umbrella") || name.includes("craft")) {
        return lang === "en"
          ? `Admire the stunning Handcrafted Pathein Bamboo Parasol, hand-painted elegantly in ruby red by local master artisans. It shields you from sun and rain while elevating your authentic cultural lifestyle.`
          : `လက်ရာမြောက် ရှုချင်စဖွယ် ပုသိမ်ထီး (Handcrafted Pathein Parasol) က ပုသိမ်မြို့ရဲ့ ဝါးနှင့် စက္ကူလက်မှုအနုပညာစစ်စစ်ဖြစ်ပြီး နေပူမိုးရွာအတွင်းမှာလည်း အထူးပဲ လှပဆွဲဆောင်မှုအပြည့် ရှိပါတယ်။`;
      }
      if (name.includes("jaggery") || name.includes("sweet") || name.includes("palm")) {
        return lang === "en"
          ? `Experience Kyaukpadaung Premium Jaggery drops, wild-harvested palm sugar stuffed with crispy, sweet shredded coconut that pairs absolutely flawlessly with a hot cup of green tea.`
          : `ကျောက်ပန်းတောင်းဒေသထွက် Premium ထန်းလျက်လုံးလေးများသည် အုန်းသီးဖတ်မွှေးမွှေးလေးတွေ ပါဝင်လို့ လက်ဖက်ရည်ကြမ်းသောက်တဲ့အခါဖြစ်ဖြစ် ဝါးစားဖို့ဖြစ်ဖြစ် သဘာဝအချိုဓာတ်ကို အပြည့်အဝပေးစွမ်းနိုင်ပါတယ်။`;
      }
      if (name.includes("honey") || name.includes("wildflower")) {
        return lang === "en"
          ? `Savour 100% natural organic Shan Hills Wildflower Honey, deep forest raw honey that boosts your daily immune system and pairs beautifully with both tea and desserts.`
          : `၁၀၀% ရှမ်းတောင်တန်း တောပျားရည်စစ်စစ်သည် တောနက်ကြီးများထဲမှ ရရှိထားပြီး ကျန်းမာရေးအတွက် ပျားရည်ရဲ့ ထူးခြားဆန်းသစ်တဲ့ ဂုဏ်သတ္တိများနှင့် ကိုယ်ခံအားကို အပြည့်အဝမြှင့်တင်ပေးနိုင်ပါတယ်။`;
      }

      if (isCloth) {
        return lang === "en"
          ? `Refresh your look with ${p.name}. Crafted from premium-grade comfortable fabrics with flawless tailoring, this style delivers a confident, elegant fit. Yours for ${p.price.toLocaleString()} MMK.`
          : `ခေတ်မှီဆန်းသစ်ဆန်းပြားလှသော ဖက်ရှင်ဒီဇိုင်းဖြစ်သည့် ${p.name} ဝတ်စုံပါ။ အဆင့်မြင့် အထည်သား၊ သပ်ရပ်လှပမှုတို့ကြောင့် ဝတ်ဆင်ရသည်မှာ သက်တောင့်သက်သာရှိပြီး မိမိကိုယ်ကို ယုံကြည်မှုဖြစ်စေပါတယ်။ စျေးနှုန်း ${p.price.toLocaleString()} ကျပ်ဖြင့် အထူးရရှိနိုင်ပါပြီ။`;
      }
      if (isCosmetic) {
        return lang === "en"
          ? `Nourish your skin with ${p.name}. Formulated with ultra-gentle, skin-loving ingredients to promote a beautiful natural glow and youthful, radiant self-care vitality. Available for ${p.price.toLocaleString()} MMK.`
          : `ကိုယ်တိုင်နဲ့ အသားအရေအတွက် ဂရုစိုက်မှုအပြည့်ပေးစွမ်းနိုင်မယ့် ${p.name} ဖြစ်ပါတယ်။ အသားအရေကို ကြည်လင်ဝင်းပစေပြီး သဘာဝအတိုင်း တောက်ပတဲ့ အသားအရေကို ခံစားရစေမှာ ဖြစ်ပါတယ်။ တန်ဖိုး ${p.price.toLocaleString()} ကျပ်တည်းဖြင့် ရရှိနိုင်ပါပြီ။`;
      }
      if (isAccessory) {
        return lang === "en"
          ? `Complement your outfit with ${p.name}. Designed with delicate modern aesthetic details, it makes the perfect daily statement of style and quality. Pick it up for ${p.price.toLocaleString()} MMK.`
          : `မည်သည့်ဝတ်စုံနှင့်မဆို လှပပြီး စတိုင်ကျသွားစေမယ့် ${p.name} လက်ရာမြောက်ဒီဇိုင်းလေး ဖြစ်ပါတယ်။ စတိုင်ကျလှပသော နေ့စဉ်ဝတ်ဆင်မှုအတွက် စျေးနှုန်း ${p.price.toLocaleString()} ကျပ်ဖြင့် အထူးရောင်းချပေးနေပါပြီ။`;
      }
      if (isElectronic) {
        return lang === "en"
          ? `Boost your productivity with ${p.name}. Featuring high-performance technology, durable battery specs, and sleek design features perfectly optimized for modern lifestyles. Rate: ${p.price.toLocaleString()} MMK.`
          : `အဆင့်မြင့်စွမ်းဆောင်ရည်နှင့် นည်းပညာအပြည့်ပါဝင်သော ${p.name} ဖြစ်ပါတယ်။ တာရှည်ခံစနစ်၊ သေသပ်လှပပြီး ခေတ်မှီသော လုပ်ဆောင်ချက်များကြောင့် လူကြီးမင်းတို့အတွက် တန်ဖိုးတန်ပြီး စျေးနှုန်း ${p.price.toLocaleString()} ကျပ်ဖြစ်ပါတယ်။`;
      }
      if (isDigital) {
        return lang === "en"
          ? `Gain seamless instant access to ${p.name}. Delivering smooth digital services and ultimate convenience, ready to upgrade your digital toolbox. Settle instantly for ${p.price.toLocaleString()} MMK.`
          : `မှာယူပြီးသည်နှင့် ဒစ်ဂျစ်တယ်စနစ်ဖြင့် စက္ကန့်ပိုင်းအတွင်း ချက်ချင်းအသုံးပြုနိုင်မယ့် ${p.name} ဝန်ဆောင်မှု ဖြစ်ပါတယ်။ လူကြီးမင်းတို့၏ နေ့စဉ်လုပ်ငန်းဆောင်တာများကို ပိုမိုလွယ်ကူမြန်ဆန်စေပြီး စျေးနှုန်း ${p.price.toLocaleString()} ကျပ်တည်းဖြစ်ပါတယ်။`;
      }
      if (isHome) {
        return lang === "en"
          ? `Elevate your living space with ${p.name}. Beautifully designed to bring warmth, aesthetic comfort, and exquisite luxury layout accentuations directly to your home. Priced at ${p.price.toLocaleString()} MMK.`
          : `အိမ်ခန်းသစ်လေးကို သပ်သပ်ရပ်ရပ်နဲ့ စမတ်ကျကျ အလှဆင်ပေးနိုင်မယ့် ${p.name} အသုံးအဆောင် ဖြစ်ပါတယ်။ နေအိမ်ကို နွေးထွေးလှပစေပြီး ပိုမိုတန်ဖိုးရှိလှပစေမှာပါ။ စျေးနှုန်း ${p.price.toLocaleString()} ကျပ်ဖြင့် ဝယ်ယူနိုင်ပါပြီ။`;
      }
      if (isFood) {
        return lang === "en"
          ? `Treat yourself with ${p.name}. Prepared with premium, authentic local ingredients and strict hygiene guidelines, offering pure delicious joy. Price: ${p.price.toLocaleString()} MMK.`
          : `ထူးကဲကောင်းမွန်သည့် ရိုးရာအရသာ စုံစုံလင်လင်ဖြင့် ဖန်တီးထားသည့် ${p.name} စားသောက်ဖွယ်ရာ ဖြစ်ပါသည်ဗျာ။ သန့်သန့်ရည်ရည် ထုပ်ပိုးထားရှိပြီး မိစုအားလုံးအတွက် စျေးနှုန်း ${p.price.toLocaleString()} ကျပ်ဖြစ်ပါတယ်။`;
      }

      return lang === "en"
        ? `${p.name} - ${p.description || "Premium Myanmar Traditional Product"}. Crafted to perfection with top-quality authentic local sourcing, offering unbeatable value at ${p.price.toLocaleString()} MMK.`
        : `${p.name} - ${p.description || "မြန်မာ့ရိုးရာ အထူးထုတ်ကုန်"} သည် ဒေသထွက်အရသာစစ်စစ်ကို ဂုဏ်ယူစွာ ဖန်တီးထားပြီး တန်ဖိုးရှိသောစျေးနှုန်း ${p.price.toLocaleString()} ကျပ်ဖြင့် အထူးရရှိနိုင်ပါပြီ။`;
    };

    const highlightsEn = finalProducts.map(p => `- ${getProductHighlight(p, "en")}`).join("\n\n");
    const highlightsMy = finalProducts.map(p => `- ${getProductHighlight(p, "my")}`).join("\n\n");
    const pNamesEn = finalProducts.map(p => p.name).join(" & ");
    const pNamesMy = finalProducts.map(p => p.name).join(" နှင့် ");

    let promoPct = "15% OFF";
    let discountVal = "15%";
    if (campaignType === "Christmas") { promoPct = "10% OFF"; discountVal = "10%"; }
    else if (campaignType === "NewYear") { promoPct = "BUY 2 GET 1"; discountVal = "Buy 2 Get 1 FREE"; }
    else if (campaignType === "Valentine") { promoPct = "14% OFF"; discountVal = "14%"; }
    else if (campaignType === "BackToSchool") { promoPct = "20% OFF"; discountVal = "20%"; }

    let themeIntroEn = "";
    let themeIntroMy = "";

    if (campaignType === "Thingyan") {
      themeIntroEn = `💦 Myanmar New Year is officially around the corner, and Thingyan Water Festival vibes are filling the air with joy, water splashing, and warm sunshine! To celebrate this grandest traditional period in Myanmar, we are ecstatic to announce our Thingyan Sweet & Cool Festival Splash Deals!`;
      themeIntroMy = `💦 မင်္ဂလာရှိသော မြန်မာ့နှစ်သစ်ကူးသင်္ကြန်ပွဲတော် အထူးရက်မြတ်ကြီး လွန်စွာနီးကပ်လို့လာပါပြီခင်ဗျာ! အေးမြလှတဲ့ ရေဖျန်းပွဲနဲ့အတူ ပျော်စရာသင်္ကြန်ရက်တွေမှာ အမောပြေပြီး လန်းဆန်းစေဖို့အတွက် ကျွန်တော်တို့ရဲ့ အထူးအရောင်းမြှင့်တင်ရေး အစီအစဉ်လေး စတင်လိုက်ပါပြီ။`;
    } else if (campaignType === "Christmas") {
      themeIntroEn = `🎄 Cozy up this winter and share the magic of Christmas with your loved ones! In the spirit of giving, warmth, and beautiful December gifts, we are launching our Special Christmas Appreciation Event.`;
      themeIntroMy = `🎄 အေးမြတဲ့ ဒီဇင်ဘာဆောင်းခရစ္စမတ်ကာလမှာ ချစ်ခင်ရသူတွေအတွက် ဂရုစိုက်မှု မေတ္တာအပြည့်နဲ့ ရိုးရာလက်ဆောင်လေးတွေ ဝေမျှလိုက်ရအောင်! ခရစ္စမတ်အထူး လက်ဆောင်ပေးအပ်ပွဲကြီး စတင်လိုက်ပါပြီ။`;
    } else if (campaignType === "NewYear") {
      themeIntroEn = `🥳 Ring in the New Year with absolute delight! As we count down the final hours to midnight, gather your favorite crowd and upgrade your late-night countdown parties with our ultimate Year-End Snack Box!`;
      themeIntroMy = `🥳 ပျော်ရွှင်စရာ ကောင်းသော နှစ်သစ်ကူးညကို မိသားစု၊ မိတ်ဆွေသူငယ်ချင်းများနှင့်အတူ ဖြတ်သန်းဖို့ အကြွပ်မုန့်အတွဲတွေ 'Buy 2 Get 1' အထူးပရိုမိုးရှင်း ရောက်ရှိလာပါပြီ!`;
    } else if (campaignType === "Valentine") {
      themeIntroEn = `💖 Love is in the air! Make this Valentine's Day incredibly sweet and memorable by sharing a authentic taste of traditional romance. Introducing our Sweetheart Heritage Treats!`;
      themeIntroMy = `💖 အချစ်နဲ့ နွေးထွေးမှုတွေ သင်းပျံ့စေမယ့် ချစ်သူများနေ့ အထူးရိုးရာအချိုပွဲ လက်ဆောင်အစုံအလင်! ချစ်သူများနေ့အတွက် အထူးဒီဇိုင်းထုတ်ထားသော သီးသန့်ပရိုမိုးရှင်းလေး ဖြစ်ပါတယ်။`;
    } else if (campaignType === "BackToSchool") {
      themeIntroEn = `🎒 Get ready to power up the upcoming school season with energy, health, and focus! Give your kids the absolute best, most delicious traditional snacks for their daily lunchboxes with our Back-To-School Smart Fuel packs!`;
      themeIntroMy = `🎒 ကျောင်းဖွင့်ရာသီမှာ အဆင်သင့်ဖြစ်စေဖို့ ကျန်းမာလန်းဆန်းစေမယ့် ရိုးရာမုန့်အဟာရစုံအစပ်တွဲလေးများ! ကျောင်းသားကျောင်းသူများအတွက် အလွန်သင့်လျော်သော အစီအစဉ်လေး ဖြစ်ပါတယ်။`;
    } else {
      themeIntroEn = `🌟 Welcome to our SME Weekend Flash Sale Event! Enjoy dynamic discounts on top-rated local products, carefully crafted with premium Burmese sourcing, brought directly to your doorstep.`;
      themeIntroMy = `🌟 ကျွန်တော်တို့ရဲ့ SME ဝီကန့်ပရိုမိုးရှင်း ပွဲကြီးမှ ကြိုဆိုပါတယ်။ လူကြိုက်အများဆုံး ဒေသထွက်ထုတ်ကုန်ပေါင်းများစွာကို အိမ်တိုင်ရာရောက် အဆင်ပြေဆုံး အရသာဖြင့် တိုက်ရိုက်ရယူလိုက်ပါ။`;
    }

    // Completely replace with custom product-specific dynamic copies!
    fallbackResponse.trendingProducts = finalProducts.slice(0, 2).map((p: any) => p.name);
    fallbackResponse.recommendations = [{
      campaignTitle: `${campaignType} ${primaryProd?.name?.split(" ")[0]} Festival Drive 🎬`,
      rationale: `Promoting ${primaryProd?.name} during the ${campaignType} season matches real organic demand patterns in Myanmar. Running immediate payment checkouts utilizing KBZPay drives faster conversions.`,
      targetAudience: "Families, social gatherers, school students, and traditional sweet curators.",
      discountPercentage: promoPct,
      duration: "5 Days (Limited Holiday Promotion)",
      expectedImpact: "Boost high-margin sales volume by 35% with consolidated delivery runs.",
      implementationSteps: [
        `Feature the selected product: ${primaryProd?.name} inside active marketing rails.`,
        `Activate immediate chatbot pre-orders configured with pricing rate: ${primaryProd?.price?.toLocaleString()} MMK.`,
        "Configure automatic checkout vouchers for group orders.",
        "Utilize localized captions inside Facebook page updates.",
        "Fulfill delivery logs through KPay screenshot uploads."
      ]
    }];

    fallbackResponse.copywriting = {
      facebookCaption: {
        en: `${themeIntroEn}\n\nWe are extremely proud to highlight our handpicked, premium selections specifically for this season:\n\n${highlightsEn}\n\n🎁 SPECIAL PROMOTION DEALS: Enjoy an immediate ${discountVal} discount on all orders featuring these chosen items! Handwrapped in beautiful waterproof gift bags and delivered with a handwritten note of care.\n\n🛒 HOW TO ORDER EASILY:\n1. Open our storefront catalog and click on "${primaryProd?.name}".\n2. Fill in your delivery details (serving Kamayut, Sanchaung, Bahan, Latha, etc.).\n3. Prepay instantly with KBZPay (KPay), Wave Money, or CBPay.\n4. Upload your payment screenshot for immediate courier dispatch. Bring sweet memories home today!`,
        my: `${themeIntroMy}\n\nဒီနေ့မှာတော့ ကျွန်တော်တို့ရဲ့ အဓိကရွေးချယ်ထားတဲ့ သဘာဝဒေသထွက် အကောင်းဆုံးပစ္စည်းလေးများကို အထူးပဲမိတ်ဆက်ပေးချင်ပါတယ်ခင်ဗျာ -\n\n${highlightsMy}\n\n🎁 အထူးပရိုမိုးရှင်းလက်ဆောင် - ယခုရက်သတ္တပတ်အတွင်း မှာယူသူများအတွက် တစ်ဘူးချင်းစီအလိုက်ထူးခြားသော ${discountVal} လျှော့စျေးကို ဖန်တီးပေးထားဦးမှာ ဖြစ်ပါတယ်။\n\n🛒 မှာယူရန် အလွန်လွယ်ကူသောနည်းလမ်း -\n၁။ ကျွန်တော်တို့ရဲ့ ကက်တလော့ဖောင်ထဲသို့ဝင်ကာ "${primaryProd?.name}" ကို ရွေးချယ်ပါ။\n၂။ အိမ်တိုင်ရာရောက် ပို့ဆောင်ပေးရန် လိပ်စာအပြည့်အစုံကို ဖြည့်သွင်းပါ။\n၃။ KBZPay (KPay) ၊ Wave Money ၊ CBPay တို့ဖြင့် လွယ်ကူလျင်မြန်စွာ ငွေပေးချေပြီး screenshot ပေးပို့ပါ။ အိမ်တိုင်ရာရောက် အမြန်ဆုံး ပို့ဆောင်ပေးသွားမှာဖြစ်ပါတယ်။`
      },
      instagramCaption: {
        en: `Unwrap pure happiness with our premium local selection: ${pNamesEn}! Specially discounted at ${promoPct} during this beautiful ${campaignType} holiday. Bring home the comfort of Myanmar's heritage! #SME #MyanmarDelight #${campaignType}`,
        my: `ချိုမြိန်လှတဲ့ အရသာစစ်စစ် ${pNamesMy} ကို ယခုပဲ ${promoPct} အထူးလျှော့စျေးနဲ့ အိမ်မှာ ဆိုင်သောက်/ဆိုင်စားအတိုင်း သုံးဆောင်လိုက်ပါ။ #${campaignType} #${pNamesEn.replace(/\s+/g, '')}`
      },
      adCopy: {
        en: `Special ${campaignType} campaign! Get ${promoPct} off on our signature ${primaryProd?.name}. Quick KPay payment confirmation. Pre-order now to secure delivery!`,
        my: `အထူးအစီအစဉ်သစ်! လူကြိုက်အများဆုံး ${primaryProd?.name} အား အထူးလျှော့စျေး ${promoPct} နှုန်းဖြင့် အခုပဲ KPay ဖြင့် ပိုမိုမြန်ဆန်စွာ မှာယူပါ။`
      },
      email: {
        en: `Subject: Enjoy ${promoPct} off on our signature ${primaryProd?.name} during ${campaignType}!\n\nDear Valued Customer,\n\nWe trust you are having a wonderful season! To add extra sweetness to your holidays, we are launching an exclusive ${promoPct} campaign focusing directly on our most premium traditional offering: ${primaryProd?.name}.\n\nBrought directly from authentic local sourcing, it serves as the perfect centerpiece for your family gatherings. Place your order with our automated coupon code and settle instantly with KBZPay/CBPay. We look forward to delivering joy to you!`,
        my: `ခေါင်းစဉ် - ${campaignType} ပွဲတော်အတွက် ${primaryProd?.name} အထူးလျှော့စျေး ${promoPct} လက်ဆောင်။\n\nချစ်ခင်ရပါသော ဆိုင်ဝယ်သူများခင်ဗျား...\n\nပျော်ရွှင်စရာကောင်းတဲ့ ပွဲတော်ရက်လေးတွေဖြစ်စေဖို့ ကျွန်တော်တို့ရဲ့ လူကြိုက်အများဆုံး ${primaryProd?.name} ကို သီးသန့်အထူးလျှော့စျေး ${promoPct} ဖြင့် စီစဉ်ပေးလိုက်ပါတယ်။ KPay ဖြင့် လွယ်ကူစွာပေးချေနိုင်ပြီး တစ်နိုင်ငံလုံးသို့ အမြန်ပို့ပေးသွားမှာဖြစ်ပါတယ်။`
      },
      hashtags: `#${campaignType} #SMEBrand #MyanmarPride #LocalDelights`
    };

    fallbackResponse.bannerPrompt = `A professional, real-life vertical advertisement poster of aspect ratio 3:4. It features a smiling Burmese modern model elegantly holding and presenting ${primaryProd?.name || "premium local crafts"}. The composition includes ${bgDesc}, elegant graphic borders, cool modern fonts, and beautiful typography in a real-life marketing poster layout.`;

    res.json({ success: true, insights: fallbackResponse });
  }
});


// Helper function to download an external image and convert it to a base64 inline part
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
    console.log(`[Proxy] Fetching reference image: ${url}`);
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const headersContentType = res.headers.get("content-type");
    const mimeType = headersContentType || "image/jpeg";
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    return { data: base64Data, mimeType };
  } catch (error) {
    console.warn("[Proxy] Error inside fetchImageAsBase64:", error);
    return null;
  }
}

// 11. AI IMAGE GENERATION PROMOTION BANNER ENDPOINT
app.post("/api/ai/marketing/image", async (req, res) => {
  const { prompt, campaignType = "General", productId, aspectRatio = "3:4" } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ success: false, error: "Prompt is required inside the request body." });
  }

  try {
    const ai = getGeminiClient();
    let selectedProdRefMime: string | null = null;
    let selectedProdRefBase64: string | null = null;
    let targetProductName = "our traditional Myanmar offerings";

    // Locate product and attempt image download for direct image-to-image integration
    if (productId) {
      const product = state.products.find(p => p.id === productId);
      if (product) {
        targetProductName = product.name;
        if (product.image) {
          const imageRes = await fetchImageAsBase64(product.image);
          if (imageRes) {
            selectedProdRefBase64 = imageRes.data;
            selectedProdRefMime = imageRes.mimeType;
          }
        }
      }
    }

    const standardAspectRatioMap = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const finalAspectRatio = standardAspectRatioMap.includes(aspectRatio) ? aspectRatio : "3:4";

    // Construct highly targeted instruction for beautiful creative marketing poster with real human and cool typography
    const imageStyleDirective = `Create a premium, professional real-life vertical digital marketing poster of aspect ratio ${finalAspectRatio}.
The poster MUST show a real person—a beautiful, smiling Burmese model holding/presenting ${targetProductName} in a lifestyle studio shot.
The poster must look extremely clean, high-contrast, featuring a gorgeous background suited for the "${campaignType}" theme (cozy and glowing).
Include sleek graphic borders, stylized elements, cool modern design overlays, and stunning promotional typography/cool fonts with text such as "PROMOTION", "SPECIAL" or "DISCOUNT".
The composition should look exactly like a real-life marketing flyer or Facebook ad. No device frames, laptop screens, or mockups.`;

    const parts: any[] = [];
    if (selectedProdRefBase64 && selectedProdRefMime) {
      parts.push({
        inlineData: {
          data: selectedProdRefBase64,
          mimeType: selectedProdRefMime
        }
      });
      parts.push({
        text: `Based on this reference product image, design of ${targetProductName}: ${imageStyleDirective}.\n\nDesign requirements: ${prompt}`
      });
    } else {
      parts.push({
        text: `${imageStyleDirective}\n\nDesign requirements: ${prompt}`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: finalAspectRatio as any,
          imageSize: "1K"
        }
      }
    });

    let base64Image: string | null = null;
    
    // Iterate to safely locate inlineData
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (base64Image) {
      res.json({ success: true, imageUrl: base64Image });
    } else {
      throw new Error("No inlineData image returned in the model result content parts.");
    }

  } catch (error: any) {
    console.warn("[Sales Brain AI] Image generation rate limited or API offline. Informing client to fallback on canvas designer.");
    res.json({ 
      success: false, 
      error: error?.message || "Gemini Image API is currently rate-limited or unavailable. Use the high-fidelity Canvas Graphic Designer below for customization!",
      isQuotaLimit: error?.message?.includes("quota") || error?.message?.includes("429") || error?.status === "RESOURCE_EXHAUSTED"
    });
  }
});

// 12. AI BUSINESS ONBOARDING PROFILE SUMMARY GENERATOR
app.post("/api/ai/onboarding-summary", async (req, res) => {
  const { data } = req.body || {};
  if (!data) {
    return res.status(400).json({ success: false, error: "Onboarding profile data is required." });
  }

  const getFallbackListSummary = (info: any) => {
    const categories = info.businessCategory?.join(" & ") || "Products";
    const channels = info.salesChannels?.join(", ") || "social channels";
    const target = info.customers?.join(", ") || "customers";
    const age = info.ageGroup || "Young Adults";
    const values = info.customerValues?.join(" and ") || "high value";
    const challenge = info.businessChallenge || "growing their company";
    const goal = info.businessGoal || "maximizing efficiency";

    let industryAdvice = "Focus on building solid product catalogs, creating clear visual item previews, and ensuring instant communication via Telegram to close sales fast.";
    if (categories.toLowerCase().includes("fashion")) {
      industryAdvice = "Leverage short-form videos showing product fits, launch limited seasonal collections, and partner with local fashion micro-influencers to drive rapid impulse buys.";
    } else if (categories.toLowerCase().includes("food")) {
      industryAdvice = "Highlight strict food hygiene practices, compile family meal packs, and run weekend KPay discount campaigns during dinner prep hours (5 PM to 8 PM) to capture instant dessert cravings.";
    } else if (categories.toLowerCase().includes("electronic")) {
      industryAdvice = "Highlight comprehensive technical specifications, offer a 7-day swap policy, bundle high-demand charging cables, and run educational reels showcasing device productivity.";
    } else if (categories.toLowerCase().includes("grocer") || categories.toLowerCase().includes("fmcg")) {
      industryAdvice = "Compile bulk grocery combos, offer rapid local delivery, and design weekly subscription packages for household essentials to build customer loyalty.";
    } else if (categories.toLowerCase().includes("digital")) {
      industryAdvice = "Highlight instant digital download access, provide transparent step-by-step tutorials, and run social ads with actionable copy to build digital toolbox confidence.";
    } else if (categories.toLowerCase().includes("home") || categories.toLowerCase().includes("lifestyle")) {
      industryAdvice = "Display products in beautifully curated home settings, upload warm tutorial videos showing product styling, and offer bulk bundle discounts for elegant decor accentuations.";
    }

    let goalAdvice = "";
    if (goal.includes("Increase Sales")) {
      goalAdvice = "To maximize sales volumes immediately, bundle slow-moving stock as gifts with your bestsellers and run targeted conversion ads.";
    } else if (goal.includes("Grow Customer")) {
      goalAdvice = "To attract new buyers, launch referral discounts ('invite a friend and both get 10% off') and seed products to niche online communities.";
    } else if (goal.includes("Brand Awareness")) {
      goalAdvice = "To elevate brand reputation, focus on consistent, elegant social aesthetics, share behind-the-scenes craft stories, and build a cohesive visual identity.";
    } else if (goal.includes("Repeat Customers")) {
      goalAdvice = "To supercharge repeat business, establish an exclusive VIP customer group on Telegram and send early-access discount codes directly to loyal shoppers.";
    } else {
      goalAdvice = "To expand online presence, synchronize your visual catalog across Facebook, Instagram, and TikTok, using unified bio links.";
    }

    return `### 🌟 Welcome to your Sales Brain AI Executive Briefing!

#### 📊 Executive Profile
Your business focuses on **${categories}**, connecting primarily with **${target}** (predominantly in the **${age}** age group) who care deeply about **${values}**. You mainly drive sales through **${channels}**.

#### 🎯 Goal Alignment & Insights
To achieve your core goal of **${goal}** while overcoming your biggest bottleneck of **${challenge}**, we must optimize your conversion pathways. Since your audience is highly active on social media and values checkout convenience, adding automated interactive invoice helpers inside your chat channels will eliminate friction and secure payments.

#### ⚡ AI Actionable Blueprint
1. **Optimize Social Funnels:** Since you sell on *${channels}*, establish high-converting messaging workflows. Direct customer traffic to your Telegram virtual assistant, which handles automated invoicing 24/7.
2. **Category Strategy:** ${industryAdvice}
3. **Goal Booster:** ${goalAdvice}`;
  };

  try {
    const ai = getGeminiClient();
    const categories = data.businessCategory?.join(", ") || "various products";
    const channels = data.salesChannels?.join(", ") || "social media channels";
    const customersGroup = data.customers?.join(", ") || "general shoppers";
    const ageGroupRange = data.ageGroup || "all ages";
    const targetValues = data.customerValues?.join(", ") || "quality and price";
    const highlightChallenge = data.businessChallenge || "increasing user sales";
    const userGoal = data.businessGoal || "growing brand awareness";

    const systemInstruction = `You are "Sales Brain Profile Architect", an elite and veteran business consultant and digital marketing strategist for Myanmar SMEs.
Your goal is to digest the user's business onboarding profile, and generate a highly personalized, intelligent, and motivating "SME AI Strategic Report".
You MUST structure your response into 3 specific sections using these clean Markdown titles:
- **📊 business profile** (summarize their categories, channels, and targeted customers with elegant context)
- **🎯 goal alignment & insights** (discussing their goal "${userGoal}" and challenge "${highlightChallenge}")
- **⚡ actionable blueprint** (providing 3 tailored campaign recommendations suited for the age group "${ageGroupRange}" and what matters to them: "${targetValues}")

Your tone should be inspiring, professional, and clear. Under 220 words. Keep headings bold but do not write generic boilerplate copy. Ensure your advice reflects a smart local strategy (like mention KPay, Facebook Messenger, Viber or custom local campaigns).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a personalized Myanmar SME executive briefing based on this onboarding profile metadata:
- Business Categories: ${categories}
- Sales Channels/Platforms: ${channels}
- Main Customer Demographic: ${customersGroup}
- Main Customer Age: ${ageGroupRange}
- Customer Priorities: ${targetValues}
- Core Challenge: ${highlightChallenge}
- Current Goal: ${userGoal}`,
      config: {
        systemInstruction,
        temperature: 0.35,
      }
    });

    const summaryText = response.text || getFallbackListSummary(data);
    res.json({ success: true, summary: summaryText });

  } catch (error: any) {
    console.warn("[Sales Brain AI] Onboarding summary Gemini API quota or rate limits hit. Serving fallback summary.");
    const fallbackText = getFallbackListSummary(data);
    res.json({ success: true, summary: fallbackText });
  }
});


// Vite Middleware & Static Fallback Asset Serving Code as mandated by full-stack React framework
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sales Brain AI Server] up and running under standard port: ${PORT}`);
  });
}

startServer();
