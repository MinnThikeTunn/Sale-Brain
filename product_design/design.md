# Design System & UI Specifications

This document outlines the design architecture, user interface elements, and style guidelines for the **Sales Brain AI** web application (SME Hub).

## 1. Global Themes & Layout

The app employs two primary view states with distinct themes:
- **Loading / Initializing State:** A dark, immersive theme (`#070f21`) conveying a tech-focused AI initialization process. 
- **Main Dashboard State:** A light, airy, and minimal "SME Hub" interface (`#f0f9ff`). The background features subtle abstract blurred orbs (`sky-400/10` and `blue-300/10`) to provide an elegant, spacious aesthetic.

## 2. Typography

The application strictly utilizes **Inter** as the primary sans-serif font, augmented with monospace stylings for data-heavy or technical accents.

* **Primary Font:** `Inter` (`ui-sans-serif, system-ui, sans-serif`)
* **Monospace Font:** Tailwind default `font-mono`. Used for badges, badges, loading text (e.g., "AI"), and strict data labels.
* **Styling details:** 
  * App Titles & Badges often use `font-mono`, `text-xs`, `font-extrabold`, `uppercase`, and `tracking-widest` to create a robust and structured layout.

## 3. Color Palette

### 3.1 Background Colors
- **App Background (Dashboard):** `#f0f9ff` (Soft Sky Blue)
- **App Background (Loader):** `#070f21` (Deep Space Dark)
- **Header / Cards:** `#ffffff` (White) with subtle borders (`border-sky-100`)
- **Simulator Background:** `#020617` (Slate 950) for the phone container.

### 3.2 Accents & Actions
- **Primary Indigo:** `indigo-500` used heavily for loaders and active highlights.
- **Brand Telegram Blue:** `#229ED9` for live chat/bot redirection links.
- **Success / Online Green:** `emerald-400` / `emerald-500` for system active states and webhooks.
- **Notification / Webhook Tag:** `sky-50` with `sky-200` borders and `slate-650` text for ambient states.
- **Sandbox Action:** `amber-500` used for the phone simulator toggle button.
- **Action Buttons:** Standard operations use sleek contrasting backgrounds (e.g., `bg-black`, `hover:bg-slate-800` containing white text).

### 3.3 Text Colors
- **Main Body:** `text-slate-900`
- **Secondary Body:** `text-slate-500` 
- **Dark Mode Texts (Loading):** `text-slate-100` and `text-slate-400`

## 4. UI Layout & Structural Components 

### 4.1 Navigation / Header (Dashboard)
- **Sticky positioning** (`sticky top-0`) to maintain context as users scroll through ledger or products.
- **Glassmorphic Shadows:** Borders on containers (`border-sky-100`) accompanied by slight drop shadows (`shadow-xs`).
- **Interactive Toggles:** 
  - Language options (EN / MY) utilizing rounded rectangles, swapping active states to white backgrounds on selection.
  - Action buttons containing Lucide-react iconography (e.g., `Smartphone`, `Send`, `ExternalLink`).

### 4.2 Loading Screen HUD
- Absolute centered flexbox layout.
- Spinner component built with partial borders: `border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin`.
- Center label "AI" styled with `font-mono` inside the loader ring, followed by pulse-animated status text.

### 4.3 Chat / Telegram Simulator (`TelegramSimulator.tsx`)
- Mimics a mobile smartphone with a prominent physical frame logic:
  - Container padding/height: `max-w-sm w-full h-[670px]`
  - Borders: Heavy dark border (`border-slate-800` and `ring-slate-900/40`) with a pill-shaped `rounded-[38px]`.
- Top speaker notch detailing, simulated battery / LTE bars inside a sub-header, and chat backgrounds to maintain deep dark theme (`Slate 900`/`950`).
- AI assistant uses warm pink-to-amber gradient avatars (`from-pink-500 to-amber-400`) providing a stark, friendly contrast against the dark tech-focused slate colors.

## 5. Interactions & Feedback
- **Toast Notifications:** Bounce animations (`animate-bounce`) appearing top right, dark backgrounds (`bg-black/95`) with emerald checkmarks. Used purely for success and informational system events.
- **Icons:** Extensive use of `lucide-react` forms the basis of all visual imagery (Sparkles, Smartphone, Check, Settings, etc.) minimizing the need for raster graphics across the admin interface.
- **Transitions:** Frequent application of `transition-all` on hover states (buttons, links, card tables) to preserve a refined interactive feel.