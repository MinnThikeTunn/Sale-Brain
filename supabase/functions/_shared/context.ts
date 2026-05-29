import type { GoogleGenAI } from "npm:@google/genai@2.4.0";
import type { SystemState } from "./types.ts";
import { getGeminiClient } from "./gemini.ts";
import { getTelegramChatId, sendTelegramMessage } from "./telegram.ts";
import { loadState, saveState } from "./state.ts";

export type ShopContext = {
  userId: string;
  state: SystemState;
  save: () => Promise<void>;
  getGemini: () => GoogleGenAI;
  getTelegramChatId: (sessionId: string) => number | null;
  sendTelegram: (chatId: string | number, text: string, options?: { reply_markup?: unknown }) => Promise<void>;
};

export async function createShopContext(userId: string): Promise<ShopContext> {
  const state = await loadState(userId);
  const ctx: ShopContext = {
    userId,
    state,
    save: async () => {
      await saveState(userId, ctx.state);
    },
    getGemini: getGeminiClient,
    getTelegramChatId,
    sendTelegram: (chatId, text, options) => sendTelegramMessage(ctx.state, chatId, text, options),
  };
  return ctx;
}
