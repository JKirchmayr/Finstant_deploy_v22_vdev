import React from "react";
import { cn } from "../../lib/utils";
import { Markdown } from "../markdown";

import TypingDots from "../TypingDots";
import { Loader2 } from "lucide-react";
import CompanyProfileCard from "../company-profile/CompanyProfileCard";
import { PROFILESTAGES } from "@/lib/chat-helpers";
import StageProgress from "../StageProgress";
import { AnimatePresence, motion } from "framer-motion";

type Message = {
  role: "user" | "assistant" | "system" | "company-profile" | "data";
  content: string;
  data?: any;
  createdAt?: Date;
};

type MessagesProps = {
  messages: Message[];
  isStreaming: boolean;
  streamingMessage: string | null;
  activeStageIndex: number | null;
  endRef: React.RefObject<HTMLDivElement>;
  isProfileStreaming: boolean;
  onCardClick: (data: any) => void;
};

export const Messages = ({
  messages,
  isStreaming,
  streamingMessage,
  activeStageIndex,
  endRef,
  isProfileStreaming,
  onCardClick,
}: MessagesProps) => {
  return (
    <div
      className={cn(
        "overflow-y-auto px-2 pt-4 space-y-2 noscroll flex-1 min-h-0"
      )}
    >
      {messages.map((m, i) => {
        const isUser = m.role === "user";
        const isAssistant = m.role === "assistant";
        const isCompanyProfile = m.role === "company-profile";
        if (isProfileStreaming && (isAssistant || isCompanyProfile)) {
          return null;
        }

        return (
          <div
            key={i}
            className={cn("flex", {
              "justify-end": isUser,
              "justify-start": !isUser,
            })}
          >
            <div
              className={cn(
                "max-w-full text-sm leading-relaxed px-1 py-1 rounded-md",
                {
                  "ml-auto bg-secondary/40 border font-normal px-4 py-1 rounded-md max-w-xs  ":
                    isUser,
                  "text-gray-800 mr-auto border-none rounded-md": !isUser,
                }
              )}
            >
              {/* {isCompanyProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CompanyProfileCard key={i} data={m.data} />
                </motion.div>
              )}
              <Markdown>{m.role !== "data" && m.content}</Markdown> */}
              {isCompanyProfile ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => onCardClick(m.data)} 
                  >
                    <CompanyProfileCard key={i} data={m.data} />
                  </div>
                </motion.div>
              ) : (
                <Markdown>{m.content}</Markdown>
              )}
            </div>
          </div>
        );
      })}

      {isStreaming && streamingMessage && (
        <div className="flex justify-start">
          <div className="max-w-full text-sm leading-relaxed px-1 py-1 mr-auto border-none rounded-md">
            <Markdown>{streamingMessage}</Markdown>
          </div>
        </div>
      )}

      {isStreaming && (
        <div className="flex justify-start">
          <div className="rounded-2xl text-sm text-gray-600 max-w-[75%]">
            {activeStageIndex !== null && activeStageIndex !== undefined ? (
              <StageProgress
                steps={PROFILESTAGES.map((s) => s.label)}
                currentStep={activeStageIndex + 1}
                isAnimating={isStreaming}
              />
            ) : (
              <div className="px-2">
                <TypingDots />
              </div>
            )}
          </div>
        </div>
      )}

      {messages.length > 1 && (
        <div
          className={cn("h-1 opacity-0", { "h-5": messages.length > 1 })}
          ref={endRef}
        />
      )}
    </div>
  );
};
