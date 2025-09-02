import React from 'react';
import { motion } from 'framer-motion';
import { ListBulletIcon } from '@heroicons/react/24/outline';

type CompanyListCardProps = {
  title?: string;
  itemCount?: number;
  onClick?: () => void;
  isStreaming: boolean;
};

export const CompanyListCard = ({
  title,
  itemCount,
  onClick,
  isStreaming,
}: CompanyListCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full items-center gap-3 p-3 px-6 bg-gray-100 rounded-lg ${
        !isStreaming ? 'cursor-pointer hover:bg-gray-200' : 'cursor-default'
      } transition-colors`}
      role="button"
      tabIndex={isStreaming ? -1 : 0}
      onClick={onClick}
    >
      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
        <ListBulletIcon className="h-4 w-4 text-gray-800" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500">
          {itemCount && <span>~{itemCount} companies</span>}
        </p>
      </div>
    </motion.div>
  );
};