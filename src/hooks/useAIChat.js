import { useState, useEffect, useCallback } from "react";
import { aiService } from "@/services";

/**
 * Hook for the AI Chat page.
 * Sends messages to the real backend and falls back to local logic if unavailable.
 */
export function useAIChat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "👋 Hello! I'm your **FIN AI** assistant powered by AI. Ask me anything about your finances!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const token = localStorage.getItem("fin.token");

  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim()) return;

      // Add user message immediately
      setMessages((prev) => [...prev, { role: "user", text }]);
      setLoading(true);

      try {
        if (!token) throw new Error("No token");
        const reply = await aiService.chat(text);
        setMessages((prev) => [...prev, { role: "ai", text: reply }]);
        setBackendAvailable(true);
      } catch (err) {
        setBackendAvailable(false);
        // Fallback to a helpful message
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "🔌 AI backend is not configured yet. Please add your OpenRouter API key to `server/.env` to enable real AI responses. For now, check your Dashboard for spending insights!",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { messages, loading, backendAvailable, sendMessage };
}

export default useAIChat;
