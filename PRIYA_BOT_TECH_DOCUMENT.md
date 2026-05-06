# Priya Bot — Technology & Framework Document

## Overview

Priya is a shopping assistant chatbot embedded in the SkinLab e-commerce application. It guides users through a questionnaire to recommend products across three categories: Specs (eyewear), Bags, and Cosmetics. It fetches real product data from the backend API and displays interactive product cards directly inside the chat.

---

## Architecture Summary

```
┌──────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│                                                      │
│   PriyaBot.jsx          usePriyaBot.js               │
│   (UI Component)   ◄──  (State Machine / Hook)       │
│        │                        │                    │
│        │                        ▼                    │
│        │               services/api.js               │
│        │               (Axios HTTP client)            │
└────────┼───────────────────────┼────────────────────┘
         │                       │
         │ render                │ HTTP requests
         ▼                       ▼
    Browser DOM          ┌───────────────┐
                         │  BACKEND      │
                         │  Express.js   │
                         │  Port 5000    │
                         │               │
                         │  /api/specs   │
                         │  /api/bags    │
                         │  /api/cosmetics│
                         │  /images/*    │
                         └───────┬───────┘
                                 │
                                 ▼
                          db.json (flat file DB)
```

---

## Frontend Technologies

### Core Framework
| Technology | Version | Role |
|---|---|---|
| **React** | 19.2.5 | UI component framework |
| **Vite** | 8.0.9 | Build tool and dev server |
| **JavaScript (ES Modules)** | ES2022+ | Language (no TypeScript) |

### Styling
| Technology | Version | Role |
|---|---|---|
| **Tailwind CSS** | 3.4.19 | Utility-first CSS framework |
| **PostCSS** | 8.5.10 | CSS processing pipeline |
| **Autoprefixer** | 10.5.0 | CSS vendor prefix automation |

### Routing & HTTP
| Technology | Version | Role |
|---|---|---|
| **React Router DOM** | 7.14.2 | Client-side page routing |
| **Axios** | 1.15.2 | HTTP client for API calls |

---

## Backend Technologies

### Core Framework
| Technology | Version | Role |
|---|---|---|
| **Node.js** | LTS | JavaScript runtime |
| **Express.js** | 5.2.1 | HTTP server and REST API |
| **CORS** | 2.8.6 | Cross-origin request handling |
| **UUID** | 14.0.0 | Unique ID generation for new records |

### Data Storage
| Technology | Role |
|---|---|
| **JSON flat file (`data/db.json`)** | Product database (specs, bags, cosmetics) |
| **`express.static`** | Serves product images from `public/images/` |

---

## Bot-Specific Implementation Details

### 1. Custom React Hook — `usePriyaBot.js`

The entire bot brain lives in a single custom hook. It manages:

- **Conversation state** — the message list rendered in the chat window
- **Flow state** — which questionnaire the user is in and which step they are on
- **API calls** — fetching filtered products at the end of each flow
- **Typing animation** — toggling a `isTyping` flag that renders animated dots

### 2. State Management Pattern

| Pattern | Why Used |
|---|---|
| `useState` for messages | Message list triggers re-renders to update the chat UI |
| `useRef` for flow state (`flowRef`) | Avoids stale closures — async handlers always read the current flow step without needing it as a dependency |
| `useRef` for busy lock (`busyRef`) | Prevents double-firing if the user clicks a quick-reply button rapidly |

### 3. Conversation Flow — State Machine

The bot uses a **declarative step-based state machine** defined in a plain `FLOWS` object:

```
User picks category
        │
        ▼
   showStep(0)     ← asks first question (e.g. face shape)
        │
   User answers
        │
        ▼
   showStep(1)     ← asks second question (e.g. style)
        │
   User answers
        │
        ▼
   showStep(2)     ← asks third question (e.g. budget)
        │
   User answers
        │
        ▼
  showProducts()   ← fetches from API with filters, renders cards
        │
        ▼
  Action buttons   ← Add to Cart / Compare / Reviews / Buy now / Restart
```

**Three flows available:** `specs` (3 steps), `bags` (3 steps), `cosmetics` (3 steps).  
**Shortcut flows:** `complete` (shows 2 items from each category) and `best_sellers` / `trending` (same as complete).

### 4. API Integration

Products are fetched from the real backend at the end of each flow. Filters are built from the user's answers:

| User Answer | Filter Applied |
|---|---|
| Budget "Under $50" | `maxPrice=50` on specs API |
| Budget "$50–$100" | `minPrice=50&maxPrice=100` |
| Budget "Premium ($100+)" | `minPrice=100` |
| Looking for "Lipstick" | `subCategory=lips` on cosmetics API |
| Looking for "Skincare" | `subCategory=face` on cosmetics API |

If the filtered result returns zero products, the bot falls back to an unfiltered fetch automatically.

### 5. Greeting — StrictMode Fix

React 18+ **StrictMode** mounts, unmounts, then remounts every component in development. Without a fix, this causes the greeting message to appear twice.

**Fix used:** cancellation flag pattern in `useEffect`:
```javascript
useEffect(() => {
  let cancelled = false;
  (async () => {
    await sleep(550);
    if (cancelled) return;   // ← guard after every await
    // ... send greeting messages
  })();
  return () => { cancelled = true; };  // ← cleanup cancels the first mount
}, []);
```

### 6. UI Component — `PriyaBot.jsx`

The UI is a floating chat widget with these sub-components:

| Component | Purpose |
|---|---|
| `PriyaBot` | Floating button + chat window container, unread badge |
| `MessageBubble` | Renders a single message (bot or user) with all attachments |
| `ChatProductCard` | Compact 176px product card with image, price, Cart + View buttons |
| `TypingIndicator` | Three animated bouncing dots shown while bot is processing |
| `PhotoUploadButton` | Hidden `<input type="file">` triggered by a pill button |
| `Avatar` | Circular "P" avatar in `skin-500` color |

### 7. Quick Reply Button States

Each quick-reply button tracks three visual states:

| State | Appearance | Condition |
|---|---|---|
| **Active** | Terracotta border, hover fills solid | No reply selected yet |
| **Selected** | Solid `skin-500` fill, white text | This button was the user's choice |
| **Disabled** | Light gray border, gray text, no cursor | Another button was selected |

---

## File Structure (Bot-Related Files)

```
skinlab-app/
├── fe/
│   ├── src/
│   │   ├── hooks/
│   │   │   └── usePriyaBot.js       ← all bot logic (state machine, API calls)
│   │   ├── components/
│   │   │   └── PriyaBot.jsx         ← chat UI widget
│   │   ├── services/
│   │   │   └── api.js               ← Axios API client (specsApi, bagsApi, cosmeticsApi)
│   │   └── context/
│   │       └── CartContext.jsx      ← cart state (used by ChatProductCard)
│   └── tailwind.config.js           ← custom skin color palette
│
└── be/
    ├── server.js                    ← Express server + /images static serving
    ├── routes/
    │   ├── specs.js
    │   ├── bags.js
    │   └── cosmetics.js
    ├── data/
    │   └── db.json                  ← product database
    └── public/
        └── images/
            ├── specs/               ← 4 eyewear JPEGs
            ├── bags/                ← 4 bag JPEGs
            └── cosmetics/           ← 5 cosmetics JPEGs
```

---

## Custom Design System

Tailwind is extended with a custom `skin` color palette (warm terracotta tones) used throughout the bot UI:

| Token | Hex | Usage |
|---|---|---|
| `skin-50` | `#FFF8F3` | Chat bubble background |
| `skin-100` | `#F5E6D8` | Borders, card backgrounds |
| `skin-400` | `#C9956E` | Quick reply borders |
| `skin-500` | `#B8784A` | Primary buttons, avatar, selected states |
| `skin-600` | `#9B5E33` | Hover states |
| `skin-700` | `#7A4526` | Chat header gradient start |

---

## Data Flow Summary

```
User clicks quick reply
        │
        ▼
handleQuickReply() in usePriyaBot.js
        │
        ├── marks reply as "used" (disables other buttons)
        ├── adds user message to messages[]
        └── routes to: handleSpecial() | startFlow() | advanceStep()
                                                │
                                          (last step)
                                                │
                                                ▼
                                       fetchProducts(flow, answers)
                                                │
                                         Axios GET /api/bags
                                         ?minPrice=50&maxPrice=100
                                                │
                                                ▼
                                       Express route handler
                                                │
                                       filters db.json in memory
                                                │
                                                ▼
                                       returns { data: [...] }
                                                │
                                                ▼
                                  addMsg({ products: [...] })
                                                │
                                                ▼
                              ChatProductCard renders for each product
```

---

*Document generated for SkinLab — Priya Shopping Assistant Bot*
