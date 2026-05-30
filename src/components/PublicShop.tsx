"use client";

import { useState, useEffect } from "react";
import { ShopStorefront, type PublicShop as PublicShopData } from "./ShopStorefront";
import { supabase } from "../utils/supabase";
import { Product, DeliveryZone } from "../types";

export function PublicShop({ shopId }: { shopId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shop, setShop] = useState<PublicShopData | null>(null);

  useEffect(() => {
    async function fetchShop() {
      try {
        const { data, error } = await supabase.functions.invoke("shop", {
          body: { action: "get-state", shopId }
        });

        if (error) throw error;
        
        // Map backend state to PublicShopData
        const publicShop: PublicShopData = {
          shopId,
          businessName: data.config.shopName,
          description: data.config.description || "Welcome to our shop!",
          paymentInfo: data.config.paymentInfo || "We accept KPay and WavePay.",
          deliveryInfo: data.config.deliveryInfo || "Delivery available across Yangon.",
          products: data.products,
          deliveryZones: data.deliveryZones,
        };
        
        setShop(publicShop);
      } catch (err: any) {
        console.error("Failed to load shop:", err);
        setError(err.message || "Shop not found");
      } finally {
        setLoading(false);
      }
    }

    fetchShop();
  }, [shopId]);

  if (loading) {
    return (
      <div className="h-[100dvh] bg-[#f8fafc] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Loading Shop...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="h-[100dvh] bg-[#f8fafc] flex items-center justify-center font-sans p-4">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-slate-950 mb-2">Shop Not Found</h2>
          <p className="text-sm text-slate-500 mb-8">The shop link might be expired or incorrect. Please check with the owner.</p>
          <a href="/" className="inline-block bg-slate-950 text-white px-8 py-3 rounded-full text-sm font-bold transition hover:bg-slate-800">
            Go to Sales Brain AI
          </a>
        </div>
      </div>
    );
  }

  return <ShopStorefront shop={shop} />;
}
