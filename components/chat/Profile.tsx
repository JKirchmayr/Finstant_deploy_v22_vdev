import React from "react";
import { cn } from "@/lib/utils";
import StageProgress from "../StageProgress"; 
import { PROFILESTAGES } from "@/lib/chat-helpers"; 
import { AnimatePresence, motion } from "framer-motion";
import { Streamdown } from "streamdown"; 

type ProfileMessagesProps = {
  isProfileStreaming: boolean;
  activeStageIndex: number | null;
  streamingMarkdownContent: string;
};

export const ProfileMessages = ({
  isProfileStreaming,
  activeStageIndex,
  streamingMarkdownContent,
}: ProfileMessagesProps) => {
  return (
    <div className={cn("overflow-y-auto px-2 pt-4 space-y-2 noscroll flex-1 min-h-0")}>
      <AnimatePresence mode="wait">
        
        {isProfileStreaming && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center mb-4"
          >
            <div className="rounded-2xl text-sm text-gray-600 max-w-full w-full">
              <StageProgress
                steps={PROFILESTAGES.map((s) => s.label)}
                currentStep={activeStageIndex !== null ? activeStageIndex + 1 : 1}
                isAnimating={isProfileStreaming}
              />
            </div>
          </motion.div>
        )}
        {streamingMarkdownContent.length > 0 && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-white rounded-lg shadow-sm"
          >
            <Streamdown>{streamingMarkdownContent}</Streamdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};