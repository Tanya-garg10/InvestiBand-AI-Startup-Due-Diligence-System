
<p align="center">
  <br/>
  <img src="https://raw.githubusercontent.com/natively/InvestiBand/main/public/og-image.png" alt="InvestiBand Logo" width="600"/>
  <br/>
</p>

<p align="center">
  <strong>AI-Powered Multi-Agent Startup Due Diligence Platform</strong>
  <br/>
  <sub>Simulate a virtual VC committee — in seconds.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-React%20%2B%20TypeScript-3b82f6?style=flat-square&logo=react" alt="React + TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind-CSS-06b6d4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/AI-Gemini-8E75B2?style=flat-square&logo=googlegemini" alt="Gemini AI"/>
  <img src="https://img.shields.io/badge/Database-Supabase-3ecf8e?style=flat-square&logo=supabase" alt="Supabase"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License"/>
</p>

## 🚀 Overview

**InvestiBand** is a cutting-edge AI due diligence platform that evaluates startups like a real Venture Capital committee. A "Band Room" of three specialist AI agents — **Research**, **Analyst**, **Contrarian** — and a **Decision** agent converge on an investment verdict.

Built for:
- 🏦 **VC Analysts** — Rapid screening of deal flow
- 👨‍💻 **Founders** — Understand how investors perceive your startup
- 💰 **Angel Investors** — Data-driven investment decisions
- 📚 **Students & Educators** — Learn startup evaluation frameworks

## ⚡ Quick Demo

Enter any startup name → 3 AI agents analyze it in parallel → Get a final **INVEST ✅ / DON'T INVEST ❌ / UNDECIDED ⏳** verdict with confidence & risk scores — all in **under 30 seconds**.

## ✨ Key Features

### 🧠 Multi-Agent Committee System
| Agent | Role |
|-------|------|
| 🔬 **Research** | Company overview, business model, market size, competitors, recent news, funding history |
| 💰 **Analyst (Financial)** | Investment recommendation, valuation, key risks/opportunities, growth prediction |
| ⚠️ **Contrarian (Devil's Advocate)** | Challenge the thesis — overlooked risks, bad assumptions, counter-arguments |
| 🏆 **Decision (Managing Partner)** | Synthesize everything into final verdict with confidence % and risk scoring |

### 📈 Structured Scorecards
Every analysis produces quantified scores:

```
Risk Score:   30/100  ━━━━━━━━━━━━━━╸━━━━━━━━ (Low Risk)
Potential:    78/100  ━━━━━━━━━━━━━━━━━━━╸━━━ (High Potential)
─────────────────────────────────────────────
Verdict:   INVEST ✅  Confidence: 78%
```

### 🎛️ Customizable Parameters
- **Investment Amount** — Simulate $100K to $10M rounds
- **Risk Preference** — Low / Medium / High
- **Startup Name** — Any real or hypothetical company

### 📚 History & Reports
- All analyses saved to the cloud
- Browse past reports from the History panel
- Full expandable view of every agent's output and final verdict

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 with custom design tokens |
| **UI Icons** | Lucide React + React Icons |
| **AI/LLM** | Google Gemini 2.0 Flash (via Edge Function) |
| **Database** | Supabase (PostgreSQL) |
| **Backend** | Supabase Edge Functions (Deno) |
| **Storage** | Firebase Firestore (history) |

## 🏁 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** / **yarn**
- **Gemini API Key** — [Get one free from Google AI Studio](https://aistudio.google.com/apikey)
- **(Optional)** Supabase project for edge function deployment

### Installation

```bash
# Clone the repository
git clone https://github.com/natively/InvestiBand.git
cd InvestiBand

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at `http://localhost:5173`.

### Configuration

1. **Open the app** in your browser — you'll see a **"Set API Key"** button in the header
2. **Get your key** from [Google AI Studio](https://aistudio.google.com/apikey)
3. **Paste the key** (starts with `AIza...`) into the modal — stored securely in your browser (localStorage)

> 🔒 **Privacy first**: Your Gemini API key never leaves your browser. All AI calls go through a Supabase Edge Function.

## 🎯 How It Works

### The Analysis Pipeline

```
┌─────────────┐
│  User Input │  Startup Name + Amount + Risk
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         🚀 Parallel Agent Analysis           │
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Research │ │  Analyst │ │  Contrarian  │ │
│  │  Gemini  │ │  Gemini  │ │   Gemini     │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└──────────────────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         🏆 Final Verdict                    │
│  Decision Agent aggregates all inputs        │
│  ┌────────────────────────────────────────┐  │
│  │  INVEST ✅ | Confidence: 78%           │  │
│  │  Risk: 30/100 | Potential: 78/100      │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### Streaming Architecture
Results are streamed in real-time via Supabase Edge Function — no waiting for the full analysis. Agent cards populate live as each result arrives.

## 📖 Usage Guide

### Analyze a Startup

1. Enter a startup name (e.g., "Stripe", "Zepto", "Anthropic")
2. Adjust investment amount and risk preference (optional)
3. Click **"Analyze"** — watch the agent cards populate in real-time
4. Read the final verdict with confidence score

### View History

1. Click **"History"** in the top-right header
2. Browse past analyses sorted by date
3. Click any report to view the full analysis

### Change API Key

1. Click the key indicator in the header
2. Enter your new Gemini API key (AIza...)
3. Click **"Save Key"**

## 🗺️ Roadmap

- [x] **MVP** — 3-agent analysis + final verdict (Gemini AI)
- [x] **History** — Saved reports with Firebase
- [ ] **Web Search** — Real-time data enrichment
- [ ] **PDF Export** — Download full investment reports
- [ ] **Compare Mode** — Side-by-side startup evaluation
- [ ] **Custom Agents** — Configure agent personalities & prompts
- [ ] **Live Debate Panel** — Agents challenge each other in real-time

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

## 🙏 Acknowledgments

- **[Google Gemini](https://deepmind.google/technologies/gemini/)** — Next-gen AI model
- **[Supabase](https://supabase.com/)** — Open-source Firebase alternative
- **[Firebase](https://firebase.google.com/)** — Cloud storage & backend
- **[Lucide](https://lucide.dev/)** — Beautiful icon library

<p align="center">
  Made with ❤️ by the InvestiBand Team
  <br/>
  <sub>Built with React + TypeScript + Tailwind CSS + Gemini AI</sub>
</p>
