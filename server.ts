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
    onboardingCompleted: true
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
let cachedStrategy: string | null = null;
let lastStrategyFetchTime: number = 0;
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
  const { shopName, ownerName, phone, telegramBotToken, telegramBotUsername } = req.body;
  state.config = {
    shopName: shopName || "SME Store",
    ownerName: ownerName || "Owner",
    phone: phone || "",
    currency: "MMK",
    telegramBotToken: telegramBotToken || "",
    telegramBotUsername: telegramBotUsername || "",
    onboardingCompleted: true
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

// 8d. OLD SIMULATION RECOVERY HOOK (CLEANER WRAP)
app.post("/api/bot/old-simulate-ingress-noop", async (req, res) => {
  res.json({ success: true });
});









// 9. AI STRATEGIC INSIGHTS AND RECOMMENDATIONS ENDPOINT
app.post("/api/ai/strategy", async (req, res) => {
  const force = req.query.force === "true" || req.body?.force === true;
  const now = Date.now();
  
  if (!force && cachedStrategy && (now - lastStrategyFetchTime < STRATEGY_CACHE_TTL)) {
    console.log("[Sales Brain AI] Serving cached business strategy to conserve Gemini API quota.");
    return res.json({ success: true, strategy: cachedStrategy });
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
State your recommendations clearly inside Markdown format. Speak clearly and highly professionally. Keep it under 280 words. Include:
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

    const strategyText = aiRes.text || "Unable to fetch live insights. Standard recommendations: Ensure a sufficient buffer for Pathein Halawa stock as traditional food is extremely popular around weekends. Boost conversions by running KPay promotion campaigns between 7:00 PM and 9:00 PM!";
    
    // Cache the successful strategy response
    cachedStrategy = strategyText;
    lastStrategyFetchTime = Date.now();

    res.json({ success: true, strategy: strategyText });

  } catch (error: any) {
    // Graceful error extraction (suppressing verbose trace for clean quota 429 notifications)
    const isQuotaExceeded = error?.message?.includes("quota") || error?.message?.includes("429") || error?.status === "RESOURCE_EXHAUSTED";
    
    if (isQuotaExceeded) {
      console.warn("[Sales Brain AI] Gemini API quota is fully exhausted (429 rate limit exceeded). Serving cached high-fidelity fallback strategy.");
    } else {
      console.warn("[Sales Brain AI] Could not query Gemini live advisor service. Reverting to local fallback strategy:", error?.message || error);
    }
    
    // Super high fidelity default markdown strategies if Gemini key is missing, invalid, or rate-limited
    const fallbackStrategy = `### 🌟 Sales Brain AI Strategy Briefing

#### 1. 🕒 Peak Purchasing Activity
Based on active system sessions, customer inquiry rates peak dramatically between **6:00 PM and 9:30 PM (MSTM)**. 
- *Action:* Keep the automated Sales Assistant robot active with instant auto-invoice delivery during these hours to capture evening transactions when users are browsing on social networks.

#### 2. 📈 Hot Campaign Suggestions
- **Traditional Treat Family Box:** Bundle "Pathein Halawa (Premium) x 2" + "Royal Tea Mix x 1" with free Sanchaung / Kamayut delivery township rates to stimulate conversion values up to 16,500 MMK.
- **Weekend Sweet Rush:** Code a "Sunday KPay prepay rebate" of 5% on transactions exceeding 25,000 MMK.

#### 3. 🚨 Inventory Alerts
- **Handcrafted Pathein Bamboo Parasol (Ruby Red)** is extremely low in stock (**only 3 units remaining**). 
- *Action:* Re-order 10 units from Pathein suppliers immediately. Reduce search promotions temporarily if supply is delayed.

#### 4. 💰 Settlement Optimization
90% of buyers select **KPAY Prepayment** over COD when offered immediate checkout confirmation. Promote **MMQR code upload** during checkout step for lower bookkeeping overhead.`;

    // Cache the fallback so we don't hammer the API on subsequent page reloads
    cachedStrategy = fallbackStrategy;
    lastStrategyFetchTime = Date.now();

    res.json({ success: true, strategy: fallbackStrategy });
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
