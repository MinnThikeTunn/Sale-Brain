import type { SystemState } from "../types";

export function createEmptyShopState(): SystemState {
  return {
    config: {
      shopName: "",
      ownerName: "",
      phone: "",
      currency: "MMK",
      telegramBotToken: "",
      telegramBotUsername: "",
      messengerPageAccessToken: "",
      messengerVerifyToken: "",
      messengerBotId: "messenger",
      messengerBotName: "Messenger Bot",
      onboardingCompleted: false,
    },
    products: [],
    deliveryZones: [],
    orders: [],
    sessions: {},
  };
}
