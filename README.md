<p align="center">
  <img width="1200" height="475" alt="Sales Brain AI Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</p>

# Sales Brain AI

AI-powered Telegram commerce bot for Myanmar businesses. Enable your shop to sell products via Telegram with AI-assisted customer service.

---

## 📋 Description

**Sales Brain AI** is a full-stack JavaScript application that transforms Telegram into a powerful sales channel. Shop owners can manage products, track orders, and leverage AI to handle customer conversations automatically.

Built for Myanmar businesses, featuring:
- Multi-language support (English / Burmese)
- AI-powered customer service via Google Gemini
- Real-time order management
- Telegram bot simulator for testing

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Lucide React |
| **Backend** | Supabase Edge Functions (`api`, `telegram-webhook`) |
| **Auth** | Supabase Auth (email/password) |
| **Database** | Supabase Storage (`shop-states/{userId}/state.json`) |
| **AI** | Google Gemini API (Edge Function secret) |

---

## ✨ Features

- **Multi-step Onboarding Wizard** — Shop configuration in minutes
- **Product Catalog Management** — Full CRUD operations
- **Order Management** — Status tracking from pending to completed
- **Telegram Bot Simulator** — Test conversations without Telegram
- **AI Marketing Campaigns** — Generate campaigns with Gemini AI
- **Data Visualization** — Custom charts for business insights
- **Delivery Zone Management** — Configure township-based shipping fees

---

## 📁 Project Structure

```
sales-brain-ai/
├── supabase/                     # Migrations + Edge Functions
├── src/
│   ├── App.tsx                   # Main React application
│   ├── main.tsx                   # React DOM renderer
│   ├── index.css                  # Tailwind CSS entry
│   ├── types.ts                   # TypeScript interfaces
│   ├── components/
│   │   ├── Onboarding.tsx         # Shop setup wizard
│   │   ├── SmartMarketing.tsx     # AI marketing campaigns
│   │   ├── TelegramSimulator.tsx  # Telegram UI simulator
│   │   └── CustomChart.tsx        # Data visualization
│   ├── contexts/AuthContext.tsx
│   ├── services/                  # shopState + api invoke
│   └── utils/supabase.ts
├── architecture-design/
│   └── architecture.md            # System architecture docs
├── decision-log/                  # Architectural Decision Records
├── sales_brain_state.json         # Legacy demo state (optional seed)
├── package.json                   # Dependencies
├── vite.config.ts                 # Vite configuration
└── tsconfig.json                  # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sales-brain-ai

# Install dependencies
npm install

# Create environment file
cp .env.local .env
```

### Configuration

Edit `.env` (see `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Set Edge secrets in Supabase: `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Apply migration: `supabase db push`. Deploy functions: `supabase functions deploy api` and `telegram-webhook`.

### Running the Application

```bash
npm run dev          # Vite SPA on :3000
npm run build
npm run preview
npm run lint
```

Access the application at **http://localhost:3000**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/state` | Get full system state |
| `POST` | `/api/products` | Add new product |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |
| `POST` | `/api/orders` | Create new order |
| `PUT` | `/api/orders/:id` | Update order status |
| `POST` | `/api/ai/chat` | Chat with Gemini AI |
| `POST` | `/api/marketing/generate` | Generate marketing campaign |

---

## 💻 Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | TypeScript type checking |
| `npm run clean` | Remove build artifacts |

---

## 🔧 Architecture

For detailed architecture documentation, see [architecture-design/architecture.md](./architecture-design/architecture.md).

### High-Level System Diagram

```
┌─────────────────────────────┐
│      User (Browser)        │
└──────────────┬──────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────┐
│   Express Server (server.ts)│
│  ┌─────────┐ ┌───────────┐  │
│  │API Endp.│ │Vite SSR   │  │
│  └────┬────┘ └─────┬─────┘  │
└───────┼────────────┼────────┘
        │            │
        ▼            ▼
┌──────────────┐  ┌──────────┐
│  Gemini AI   │  │ File JSON│
│  (AI Bot)    │  │ (State)  │
└──────────────┘  └──────────┘
        │
        ▼
┌──────────────────────┐
│    Telegram Bot      │
│    (External)        │
└──────────────────────┘
```

---

## 🔐 Security Notes

- **Environment Variables** — Store API keys in `.env` file (never committed)
- **Current Implementation** — No authentication (local development only)
- **Production Recommendations:**
  - Add JWT/Session authentication
  - Enable HTTPS/TLS
  - Implement API rate limiting
  - Use Supabase for encrypted database

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@supabase/supabase-js": "^2.106.2",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3"
  }
}
```

---

## 🛣️ Roadmap

### Near-term
- [ ] Supabase database integration
- [ ] Telegram Bot API webhook integration
- [ ] User authentication for dashboard
- [ ] Real-time order updates

### Long-term
- [ ] Multi-shop support (SaaS)
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration (KBPay, WavePay)

---

## 📄 License

MIT License

---

## 📞 Support

For questions or issues, please refer to the documentation in `architecture-design/architecture.md` or create an issue in the repository.

---

*Last Updated: 2025-05-28*
*Project: Sales Brain AI — AI-Powered Telegram Commerce*