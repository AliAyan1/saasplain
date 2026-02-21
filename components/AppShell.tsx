"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

const HIDE_SIDEBAR_ROUTES = [
  "/create-bot",
  "/training-data",
  "/bot-personality",
  "/bot-preview",
  "/integration",
  "/test-chatbot",
  "/demo-website",
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = HIDE_SIDEBAR_ROUTES.some((p) =>
    pathname.startsWith(p)
  );

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="flex">
        {!hideSidebar && <Sidebar />}
        <main className="min-h-[calc(100vh-56px)] flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
