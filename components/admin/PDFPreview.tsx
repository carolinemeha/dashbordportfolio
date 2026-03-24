'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PDFPreviewProps {
  fileUrl: string;
}

export default function PDFPreview({ fileUrl }: PDFPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [numPages, setNumPages] = useState<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading PDF and getting page count
    const timer = setTimeout(() => {
      setNumPages(1); // In a real app, you would use a PDF library to get the actual page count
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [fileUrl]);

  return (
    <div className="border rounded-lg overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="relative pb-[120%]">
          <iframe
            src={`${fileUrl}#view=fitH`}
            className="absolute top-0 left-0 w-full h-full border-0"
            title="PDF Preview"
          />
        </div>
      )}
      {numPages && !isLoading && (
        <div className="p-2 bg-gray-50 text-sm text-gray-500 text-center">
          {numPages} page{numPages > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}