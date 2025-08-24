import React from "react";
import { cn } from "../../lib/utils";
import { Markdown } from "../markdown";
import { FileCard } from "./CompanyProfileCard";
import TypingDots from "../TypingDots";
import { Loader2 } from "lucide-react";
import CompanyProfileCard from "../company-profile/CompanyProfileCard";
import { PROFILESTAGES } from "@/lib/chat-helpers";
import StageProgress from "../StageProgress";
import { AnimatePresence, motion } from "framer-motion";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import Streamdown from "streamdown";
import { useFileStore } from "@/store/useCompanyProfile";

type Message = {
  role:
    | "user"
    | "assistant"
    | "system"
    | "company-profile"
    | "data"
    | "company_profile_card";
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
  // isProfileStreaming: boolean;
  onCardClick: (data: any) => void;
};

export const Messages = ({
  messages,
  isStreaming,
  streamingMessage,
  activeStageIndex,
  endRef,
  // isProfileStreaming,
  onCardClick,
}: MessagesProps) => {
  const { isProfileStreaming } = useFileStore();
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
                  "ml-auto bg-secondary/40 border font-normal px-4 py-1 rounded-md max-w-xs  ":
                    isUser,
                  "text-gray-800 mr-auto border-none rounded-md": !isUser,
                }
              )}
            >
              {isCompanyCard && m.data ? (
                // <motion.div
                //   initial={{ opacity: 0, y: 10 }}
                //   animate={{ opacity: 1, y: 0 }}
                //   transition={{ duration: 0.2 }}
                //   className="cursor-pointer "
                //   onClick={() => onCardClick(m.data)}
                // >
                //   <div className="flex items-center p-4 hover:scale-115 gap-3">
                //     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                //       <BuildingOffice2Icon className="w-4 h-4 text-gray-700" />
                //     </div>
                //     <div className="flex-1">
                //       <div className="font-semibold text-sm text-gray-900">
                //         <span>{m.data.name}</span>
                //       </div>
                //       <div className="text-xs text-gray-500">
                //         {m.data.city && m.data.country ? `${m.data.city}, ${m.data.country}` : ''}
                //       </div>
                //     </div>
                //   </div>

                // </motion.div>
                <FileCard
                  name={m.data.name}
                  city={m.data.city}
                  country={m.data.country}
                  onClick={() => onCardClick(m.data)}
                />
              ) : (
                <Streamdown>{m.content}</Streamdown>
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
            <div className="px-2">
              <TypingDots />
            </div>
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
