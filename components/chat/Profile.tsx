import React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Streamdown } from "streamdown"; 

type ProfileMessagesProps = {
  streamingMarkdownContent: string;
};

export const ProfileMessages = ({  
  streamingMarkdownContent,
}: ProfileMessagesProps) => {
  return (
    <div className={cn("overflow-y-auto px-2 pt-4 space-y-2 noscroll flex-1 min-h-0")}>
      <AnimatePresence mode="wait">        
        
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