"use client";
import { cn, tryParseJSON } from "@/lib/utils";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PromptField } from "@/components/chat/PromptField";
import {
  BottomSuggestions,
  SUGGESTION_BANK,
  Suggestions,
  TabKey,
} from "./Suggestions";
import { Messages } from "./Messages";
import { useChatStore } from "@/store/chatStore";
import { PROFILESTAGES } from "@/lib/chat-helpers";
import { ProfileMessages } from "./Profile";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useFileStore } from "@/store/useCompanyProfile";

type Company = {
  company_name: string;
  company_description: string;
  similarity_score: number;
};

type CompanyCardData = {
  name: string;
  city: string;
  country: string;
};

const backendURL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const Chat = () => {
  const { user, loading } = useAuth();
  const userId = user?.user_id ?? "";

  const { messages, input, append, setInput } = useChatStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("research");
  const endRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isCanvasOpen, setCanvasOpen] = useState<boolean>(false);
  //const [isProfileStreaming, setIsProfileStreaming] = useState<boolean>(false);
  const [canvasData, setCanvasData] = useState<Record<string, any> | null>(
    null
  );
  const [streamingCanvasContent, setStreamingCanvasContent] =
    useState<string>("");
  //const [companyCard, setCompanyCard] = useState<CompanyCardData | null>(null);
  const [Sources, setSources] = useState<
    Array<{ id: number; title: string; url: string }>
  >([]);

  const { addFile, setIsProfileStreaming } = useFileStore();

  // Overlay for Sources over the LEFT pane
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const handleCardClick = (data: any) => {
    setCanvasData(data);
    setCanvasOpen(true);
  };

  const scrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) return;
    scrollTimeoutRef.current = setTimeout(() => {
      const end = endRef.current;
      if (end) {
        end.scrollIntoView({ behavior: "smooth", block: "end" });
      }
      scrollTimeoutRef.current = null;
    }, 100);
  }, []);

  let processingBuffer = "";

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const promptToSend = input.trim();
    setStreamingMessage("");
    setStreamingCanvasContent("");

    append({ role: "user", content: promptToSend });
    setInput("");
    scrollToBottom();
    setIsStreaming(true);
    //setIsProfileStreaming(false);
    setCanvasOpen(false);
    setCanvasData(null);
    //setCompanyCard(null);
    setSources([]);

    let companyProfileSections: Record<string, any> = {};
    let isProfileStreamDetected = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("Request timeout after 30 seconds");
        controller.abort();
      }, 30000);

      const response = await fetch(`${backendURL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          user_prompt: promptToSend,
          user_id: userId,
          session_id: sessionId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available.");

      const decoder = new TextDecoder();

      let parsed: any;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (processingBuffer.trim()) {
            append({ role: "assistant", content: processingBuffer });
          }
          setIsStreaming(false);
          setActiveStageIndex(null);
          if (parsed?.data?.session_id) {
            setSessionId(parsed.data.session_id);
          }

          if (
            companyProfileSections &&
            Object.keys(companyProfileSections).length > 0
          ) {
            append({
              role: "company-profile",
              content: "",
              data: companyProfileSections,
            });
          }

          companyProfileSections = {};
          setStreamingMessage("");
          scrollToBottom();
          setIsProfileStreaming(false);

          break;
        }

        const rawChunk = decoder.decode(value, { stream: true });
        const events = rawChunk.split("\n\n");

        for (const event of events) {
          if (!event.trim() || !event.startsWith("data:")) continue;

          const cleaned = event.replace(/^data:/, "").trim();
          parsed = tryParseJSON(cleaned);
          if (!parsed) {
            console.warn("⚠️ Skipping invalid JSON chunk:", cleaned);
            continue;
          }

          const { data, event: eventType } = parsed;

          if (eventType === "text") {
            if (data?.meta?.stage === "processing") {
              const newText = data?.text || "";
              setStreamingMessage((prev) => prev + newText);
              processingBuffer += newText;

              if (processingBuffer.length % 50 === 0) {
                scrollToBottom();
              }
            }
          }

          if (eventType === "company_profile_card") {
            const newCompanyCardData: CompanyCardData = {
              name: data?.company_name,
              city: data?.company_city,
              country: data?.company_country,
            };
            // setCompanyCard(newCompanyCardData);
            addFile(newCompanyCardData);
            append({
              role: "company_profile_card",
              content: "",
              data: newCompanyCardData,
              createdAt: new Date(),
            });
          }

          if (eventType === "company_profile") {
            const section = data?.section;
            const sectionData = data?.data;
            const text = data?.text || "";

            setIsProfileStreaming(true);
            setCanvasOpen(true);
            setStreamingCanvasContent((prev) => prev + text);

            setCanvasData((prevData) => {
              const newData = { ...prevData, ...sectionData };
              if (section === "company_news_item") {
                const news = prevData?.company_news || [];
                return { ...newData, company_news: [...news, sectionData] };
              }
              if (section === "financial_information_year") {
                const financials = prevData?.financial_information || [];
                return {
                  ...newData,
                  financial_information: [...financials, sectionData],
                };
              }
              return { ...newData, [section]: sectionData };
            });
            if (data?.meta?.stage === "sources") {
              console.log("sources recieved");
              const incoming = Array.isArray(data?.sources) ? data.sources : [];
              console.log(incoming);
              setSources(incoming);
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Error during streaming:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          append({
            role: "assistant",
            content: "Request timed out. Please try again.",
          });
        } else {
          append({
            role: "assistant",
            content: `Error: ${error.message}`,
          });
        }
      } else {
        append({
          role: "assistant",
          content: "An error occurred while processing your request.",
        });
      }

      setIsStreaming(false);
      setActiveStageIndex(null);
      setStreamingMessage("");
      setIsProfileStreaming(false);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    }
  };

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* LEFT PANE: messages + prompt */}
      <motion.div
        className="flex flex-col flex-1 h-screen relative z-0"
        initial={false} // no animation on first render
        animate={{ width: isCanvasOpen ? "35%" : "100%" }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        layout
      >
        {/* Suggestions (centered look based on your original) */}
        {messages.length <= 0 && (
          <div className="max-w-3xl pt-10 mx-auto w-full px-2">
            <Suggestions activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto overflow-hidden">
          {messages.length > 0 && (
            <div className="flex-1 min-h-0 flex flex-col">
              <Messages
                messages={messages}
                isStreaming={isStreaming}
                streamingMessage={streamingMessage}
                activeStageIndex={activeStageIndex}
                endRef={endRef}
                // isProfileStreaming={isProfileStreaming}
                onCardClick={handleCardClick}
              />
            </div>
          )}
        </div>

        {/* Prompt box */}
        <div className="w-full max-w-3xl mx-auto  z-10">
          <PromptField
            handleSend={handleSend}
            input={input}
            handleInputChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
            isLoading={isStreaming}
            messages={messages}
          />
        </div>

        {/* Bottom suggestions (just like your screenshot) */}
        {messages.length <= 0 && (
          <div className="w-full max-w-3xl pb-24 text-muted-foreground mx-auto px-2">
            <BottomSuggestions
              items={SUGGESTION_BANK[activeTab] ?? []}
              setInput={setInput}
            />
          </div>
        )}

        {sourcesOpen && (
          <div
            className="absolute inset-0 z-50"
            onClick={() => setSourcesOpen(false)}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div
              className="relative bg-white w-full h-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white">
                <h2 className="font-semibold">Sources</h2>
                <button
                  className="text-gray-600 hover:text-black"
                  onClick={() => setSourcesOpen(false)}
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="h-[calc(100%-52px)] overflow-y-auto px-4 py-3">
                {Sources.length ? (
                  <ul className="list-decimal pl-5 space-y-2">
                    {Sources.map((s) => (
                      <li key={s.id} className="text-sm">
                        {" "}
                        {/* Added key={s.id} for better performance */}
                        <div className="font-semibold text-gray-800">
                          {s.title}
                        </div>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:underline break-all" 
                        >
                          {s.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No sources available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* RIGHT PANE: canvas */}
      <AnimatePresence initial={false}>
        {isCanvasOpen && (
          <motion.div
            className="flex flex-col bg-gray-50 p-6 border-l shadow-xl"
            style={{ width: "65%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            layout
          >
            <div className="border-b pb-4 mb-4 flex items-center justify-between sticky top-0 bg-gray-50 z-10">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Company Profile
              </h1>
              <button
                onClick={() => setCanvasOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-800 transition-colors duration-200"
                aria-label="Close canvas"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-1 scrollbar-hide">
              <ProfileMessages
                streamingMarkdownContent={streamingCanvasContent}
                sources={Sources}
                onOpenSources={() => setSourcesOpen(true)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
