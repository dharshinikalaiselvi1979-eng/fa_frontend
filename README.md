# FIN AI - Smart Personal Finance 💰

A modern, AI-powered personal finance management application with bank synchronization, budget tracking, and automated insights.

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Running locally or a cloud instance)

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (copy from `.env.example`) and add your credentials:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure string for authentication
   - `OPENROUTER_API_KEY`: (Optional) For real AI responses
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate back to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

## ✨ Key Features
- **AI Chat & Categorization**: Chat with your finances or let AI categorize your expenses.
- **Bank Sync**: Securely connect accounts via Account Aggregator.
- **Budget Tracking**: Set monthly limits and get real-time alerts.
- **Insights & Reports**: Beautiful charts and exportable PDF/CSV reports.
- **Mobile First**: Fully responsive and premium glassmorphism design.

## 🛠 Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Lucide, Recharts
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: OpenRouter / OpenAI (with local fallbacks)
