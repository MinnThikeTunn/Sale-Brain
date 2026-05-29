import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const lines = fs.readFileSync(path.join(root, "server.ts"), "utf8").split("\n");

const processBody = lines.slice(575, 895).join("\n");
const telegramBody = lines.slice(902, 1020).join("\n");

const adapt = (code) =>
  code
    .replace(/\bstate\./g, "ctx.state.")
    .replace(/\bstate\b(?=[\s,;\)\]\}])/g, "ctx.state")
    .replace(/saveState\(\)/g, "await ctx.save()")
    .replace(/getGeminiClient\(\)/g, "ctx.getGemini()")
    .replace(/sendTelegramMessage\(/g, "ctx.sendTelegram(")
    .replace(/getTelegramChatId\(/g, "ctx.getTelegramChatId(")
    .replace(/req\.body/g, "body");

const out = `// AUTO-GENERATED from server.ts — re-run scripts/port-bot-engine.mjs
import type { ShopContext } from "./context.ts";

export async function processCustomerMessage(
  ctx: ShopContext,
  sessionId: string,
  params: {
    content?: string;
    base64Image?: string;
    transactionId?: string;
    township?: string;
    payMethod?: string;
    checkoutOption?: string;
  }
) {
${adapt(processBody)}
}

export async function handleTelegramWebhook(ctx: ShopContext, body: Record<string, unknown>) {
${adapt(telegramBody)}
}
`;

fs.writeFileSync(path.join(root, "supabase/functions/_shared/botEngine.ts"), out);
console.log("Wrote botEngine.ts");
