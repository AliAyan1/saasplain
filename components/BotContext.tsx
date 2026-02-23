"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Personality =
  | "Friendly"
  | "Professional"
  | "Sales-focused"
  | "Premium Luxury";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

export type ForwardMode = "email" | "ticket";

export interface ForwardedConversation {
  id: string;
  conversationId: string;
  customer: string;
  preview: string;
  forwardedAs: ForwardMode;
  createdAt: number;
}

export interface ScrapedData {
  url: string;
  title: string;
  description: string;
  content: string;
  products?: { name: string }[];
}

export type ActivityType = "resolved" | "query" | "forwarded" | "system" | "warning";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  createdAt: number;
}

interface BotContextValue {
  scrapedData: ScrapedData | null;
  setScrapedData: (data: ScrapedData | null) => void;

  personality: Personality | null;
  setPersonality: (p: Personality | null) => void;

  conversationRemaining: number;
  setConversationRemaining: (n: number) => void;
  decrementConversations: () => void;

  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: Omit<ChatMessage, "id" | "createdAt"> & Partial<Pick<ChatMessage, "id" | "createdAt">>) => string;
  updateMessage: (id: string, patch: Partial<Pick<ChatMessage, "content">>) => void;
  clearMessages: () => void;

  forwarded: ForwardedConversation[];
  addForwarded: (
    item: Omit<ForwardedConversation, "id" | "createdAt"> &
      Partial<Pick<ForwardedConversation, "id" | "createdAt">>
  ) => string;
  clearForwarded: () => void;

  recentActivity: ActivityItem[];
  addActivity: (item: Omit<ActivityItem, "id" | "createdAt"> & Partial<Pick<ActivityItem, "id" | "createdAt">>) => string;
}

const BotContext = createContext<BotContextValue | undefined>(undefined);

const STORAGE_KEY = "bot-state-v1";

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function BotProvider({ children }: { children: ReactNode }) {
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [personality, setPersonality] = useState<Personality | null>(null);
  // Free plan includes 100 conversations
  const [conversationRemaining, setConversationRemaining] = useState<number>(100);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [forwarded, setForwarded] = useState<ForwardedConversation[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // Persist state client-side (still "no DB")
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromStorage = safeParseJson<{
      scrapedData: ScrapedData | null;
      personality: Personality | null;
      conversationRemaining: number;
      messages: ChatMessage[];
      forwarded: ForwardedConversation[];
      recentActivity: ActivityItem[];
    }>(window.localStorage.getItem(STORAGE_KEY));

    if (fromStorage) {
      setScrapedData(fromStorage.scrapedData ?? null);
      setPersonality(fromStorage.personality ?? null);
      setConversationRemaining(
        typeof fromStorage.conversationRemaining === "number"
          ? fromStorage.conversationRemaining
          : 100
      );
      setMessages(Array.isArray(fromStorage.messages) ? fromStorage.messages : []);
      setForwarded(Array.isArray(fromStorage.forwarded) ? fromStorage.forwarded : []);
      setRecentActivity(Array.isArray(fromStorage.recentActivity) ? fromStorage.recentActivity : []);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        scrapedData,
        personality,
        conversationRemaining,
        messages,
        forwarded,
        recentActivity,
      })
    );
  }, [scrapedData, personality, conversationRemaining, messages, forwarded, recentActivity]);

  const decrementConversations = useCallback(() => {
    setConversationRemaining((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const addMessage = useCallback(
    (
      msg: Omit<ChatMessage, "id" | "createdAt"> &
        Partial<Pick<ChatMessage, "id" | "createdAt">>
    ) => {
      const id = msg.id ?? makeId(msg.role);
      const createdAt = msg.createdAt ?? Date.now();
      setMessages((prev) => [...prev, { id, createdAt, role: msg.role, content: msg.content }]);
      return id;
    },
    []
  );

  const updateMessage = useCallback((id: string, patch: Partial<Pick<ChatMessage, "content">>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  const addForwarded = useCallback(
    (
      item: Omit<ForwardedConversation, "id" | "createdAt"> &
        Partial<Pick<ForwardedConversation, "id" | "createdAt">>
    ) => {
      const id = item.id ?? makeId("fwd");
      const createdAt = item.createdAt ?? Date.now();
      setForwarded((prev) => [...prev, { ...item, id, createdAt }]);
      return id;
    },
    []
  );

  const clearForwarded = useCallback(() => setForwarded([]), []);

  const addActivity = useCallback(
    (item: Omit<ActivityItem, "id" | "createdAt"> & Partial<Pick<ActivityItem, "id" | "createdAt">>) => {
      const id = item.id ?? makeId("act");
      const createdAt = item.createdAt ?? Date.now();
      setRecentActivity((prev) => [{ ...item, id, createdAt }, ...prev].slice(0, 20));
      return id;
    },
    []
  );

  const value = useMemo<BotContextValue>(
    () => ({
      scrapedData,
      setScrapedData,
      personality,
      setPersonality,
      conversationRemaining,
      setConversationRemaining,
      decrementConversations,
      messages,
      setMessages,
      addMessage,
      updateMessage,
      clearMessages,
      forwarded,
      addForwarded,
      clearForwarded,
      recentActivity,
      addActivity,
    }),
    [
      scrapedData,
      personality,
      conversationRemaining,
      decrementConversations,
      messages,
      addMessage,
      updateMessage,
      clearMessages,
      forwarded,
      addForwarded,
      clearForwarded,
      recentActivity,
      addActivity,
    ]
  );

  return <BotContext.Provider value={value}>{children}</BotContext.Provider>;
}

export function useBot() {
  const ctx = useContext(BotContext);
  if (!ctx) throw new Error("useBot must be used inside BotProvider");
  return ctx;
}

