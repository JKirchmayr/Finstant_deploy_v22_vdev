import React from "react";
import { cn } from "../../lib/utils";
import { Markdown } from "../markdown";
import { Streamdown } from "streamdown";
import TypingDots from "../TypingDots";
import { Building2Icon, Loader2 } from "lucide-react";
import CompanyProfileCard from "../company-profile/CompanyProfileCard";
import { PROFILESTAGES } from "@/lib/chat-helpers";
import StageProgress from "../StageProgress";
import { AnimatePresence, motion } from "framer-motion";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

type Message = {
  role: "user" | "assistant" | "system" | "company-profile" | "data" | "company_profile_card";
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
        const isCompanyCard = m.role === "company_profile_card";

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
                  "ml-auto bg-secondary/40 border font-normal px-4 py-1 rounded-md max-w-xs": isUser,
                  "text-gray-800 mr-auto border-none rounded-md": !isUser,
                }
              )}
            >
              {isCompanyProfile && m.data ? (
                <>
                  {/* <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => onCardClick(m.data)}
                  >
                    <CompanyProfileCard data={m.data} />
                  </motion.div> */}
                </>
              ) : isCompanyCard && m.data ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => onCardClick(m.data)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2Icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">
                        <span>{m.data.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {m.data.city && m.data.country ? `${m.data.city}, ${m.data.country}` : ''}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
                  <Markdown>{m.role !== "data" && m.content}</Markdown>
                </>
              )}
            </div>
          </div>
        );
      })}
      {isStreaming && streamingMessage && !isProfileStreaming && (
        <div className="flex justify-start">
          <div className="max-w-full text-sm leading-relaxed px-1 py-1 mr-auto border-none rounded-md">
            <Streamdown>{streamingMessage}</Streamdown>
          </div>
        </div>
      )}
      {isStreaming && (
        <div className="flex justify-start">
          <div className="rounded-2xl text-sm text-gray-600 max-w-[75%]">
            {isProfileStreaming && (
              <div className="px-2">
                <TypingDots />
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};