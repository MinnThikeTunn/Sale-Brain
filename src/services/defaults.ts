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
      onboardingCompleted: false,
    },
    products: [],
    deliveryZones: [],
    orders: [],
    sessions: {},
  };
}
