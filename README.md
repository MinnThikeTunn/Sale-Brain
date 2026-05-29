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
| **Backend** | Express.js (embedded in `server.ts`) |
| **Database** | File-based JSON (`sales_brain_state.json`) |
| **Future DB** | Supabase (client ready) |
| **AI** | Google Gemini API (`@google/genai`) |

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
├── server.ts                     # Express backend + Vite SSR server
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
│   └── utils/
│       └── supabase.ts            # Supabase client (future)
├── architecture-design/
│   └── architecture.md            # System architecture docs
├── decision-log/                  # Architectural Decision Records
├── sales_brain_state.json         # Persistent state file
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

Edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://ai.studio.google.com/app/apikey).

### Running the Application

```bash
# Development mode (Express + Vite hot reload)
npm run dev

# Production build
npm run build
npm run start

# Type checking
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