import React, { useState, useEffect } from 'react';
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';

type BasicSource = {
  id: number;
  title: string;
  url: string;
};

type EnrichedSource = BasicSource & {
  description?: string;
  image?: string;
  favicon?: string;
};

const SourceImage: React.FC<{ src?: string; favicon?: string; title: string }> = ({ src, favicon, title }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 p-2">
        {favicon ? (
          <img src={favicon} alt="" className="h-8 w-8 rounded-lg" />
        ) : (
          <LinkIcon className="h-8 w-8 text-slate-400" />
        )}
        <p className="text-center text-xs font-semibold text-slate-600 line-clamp-2">{title}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}      
      onError={() => setHasError(true)}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  );
};

const SkeletonItem = () => (
    <div className="flex items-start gap-3">
        <Skeleton className="h-6 w-6 flex-shrink-0 rounded-md" />
        <div className="flex-1">
            <Skeleton className="h-28 w-full rounded-lg" />
            <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
            </div>
        </div>
    </div>
);

type SourcesProps = {
  open: boolean;
  onClose: () => void;
  sources: BasicSource[];
  isStreaming: boolean;
};

const SourcesComponent: React.FC<SourcesProps> = ({ open, onClose, sources, isStreaming }) => {
  const [enrichedSources, setEnrichedSources] = useState<EnrichedSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open || !sources.length) return;
    const fetchAllMetadata = async () => {
      setIsLoading(true);
      const sourcesPromises = sources.map(async (source) => {
        try {
          const response = await fetch(`/api/scrape?url=${encodeURIComponent(source.url)}`);
          if (!response.ok) return source;
          const richData = await response.json();
          return { ...source, ...richData };
        } catch (error) {
          return source;
        }
      });
      const finalSources = await Promise.all(sourcesPromises);
      setEnrichedSources(finalSources);
      setIsLoading(false);
    };
    fetchAllMetadata();
  }, [open, sources]);

  if (!open || isStreaming) return null;

  return (
    <motion.div
      className="absolute inset-0 z-50 flex justify-end"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
    >
      <div className="absolute inset-0 bg-black/10" onClick={onClose} />
      <div className="relative bg-white w-full h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2 border-b sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-base">Sources</h2>
          <Button size="xs" onClick={onClose} aria-label="Close" variant="secondary">
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        <div className="h-[calc(100%-52px)] overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </div>
          ) : enrichedSources.length ? (
            <div className="space-y-4">
              {enrichedSources.map((s, index) => (
                
                <div key={s.id} className="flex items-start gap-3">
                  
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-600">
                    {index + 1}
                  </div>

                  <motion.a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block flex-1 rounded-lg border bg-white shadow-sm transition-shadow duration-200 group hover:shadow-md"
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="h-38 w-full overflow-hidden rounded-t-lg">
                      <SourceImage src={s.image} favicon={s.favicon} title={s.title} />
                    </div>
                    <div className="space-y-2 p-3">
                      <div className="flex items-center">
                        {s.favicon && (
                            <img src={s.favicon} alt="" className="mr-2 h-4 w-4 flex-shrink-0 rounded-full" />
                        )}
                        <span className="truncate text-xs text-gray-500">{new URL(s.url).hostname}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:underline">
                        {s.title}
                      </h3>
                      {s.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{s.description}</p>
                      )}
                    </div>
                  </motion.a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No sources available</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SourcesComponent;