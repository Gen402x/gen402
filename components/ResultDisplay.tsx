'use client';

import { Download, Share2, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import JSZip from 'jszip';
import { useState } from 'react';

interface ResultDisplayProps {
  type: 'image' | 'video';
  url: string;
  urls?: string[]; // Multiple results (for 4o Image variants)
  prompt: string;
  modelName: string;
  onShare: () => void;
}

export default function ResultDisplay({
  type,
  url,
  urls,
  prompt,
  modelName,
  onShare,
}: ResultDisplayProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const handleDownload = async (imageUrl?: string, index?: number) => {
    const downloadUrl = imageUrl || url;
    const timestamp = Date.now();
    const fileName = index !== undefined 
      ? `ai-studio-image-${index + 1}-${timestamp}.png`
      : `ai-studio-${type}-${timestamp}.${type === 'image' ? 'png' : 'mp4'}`;

    try {
      // Since images are now from our Supabase, direct fetch should work
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAll = async () => {
    try {
      const zip = new JSZip();
      const timestamp = Date.now();
      
      // Since images are from our Supabase, fetch should work without CORS issues
      for (let i = 0; i < displayUrls.length; i++) {
        try {
          const response = await fetch(displayUrls[i]);
          const blob = await response.blob();
          const extension = displayUrls[i].split('.').pop()?.split('?')[0] || 'png';
          zip.file(`image-${i + 1}.${extension}`, blob);
          console.log(`Added image ${i + 1} to ZIP`);
        } catch (error) {
          console.error(`Failed to add image ${i + 1} to ZIP:`, error);
        }
      }
      
      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `payper402-images-${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      // Fallback: download individually
      for (let i = 0; i < displayUrls.length; i++) {
        await handleDownload(displayUrls[i], i);
        if (i < displayUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
  };

  const displayUrls = urls && urls.length > 0 ? urls : [url];
  const hasMultipleImages = displayUrls.length > 1 && type === 'image';

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Preview */}
      {hasMultipleImages ? (
        <div>
          <div className="text-[10px] sm:text-xs text-white/50 mb-2 sm:mb-3 uppercase tracking-wider font-semibold">
            {displayUrls.length} Variants
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {displayUrls.map((imgUrl, index) => (
              <div key={index} className="group relative border border-white/10 overflow-hidden bg-white/5 rounded-lg cursor-pointer">
                <div 
                  className="relative w-full aspect-square"
                  onClick={() => setLightboxImage(imgUrl)}
                >
                  <Image
                    src={imgUrl}
                    alt={`${prompt} - ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(imgUrl, index);
                  }}
                  className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-dark/90 hover:bg-dark
                           border border-white/20 opacity-0 group-hover:opacity-100 rounded-lg
                           transition-opacity duration-200 z-10"
                  title={`Download image ${index + 1}`}
                >
                  <Download className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-white/10 overflow-hidden bg-white/5 rounded-lg group">
          {type === 'image' ? (
            <div 
              className="relative w-full aspect-square cursor-pointer"
              onClick={() => setLightboxImage(url)}
            >
              <Image
                src={url}
                alt={prompt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center bg-white/5">
              <video src={url} controls className="max-w-md w-full rounded" />
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="text-[10px] sm:text-xs text-white/50 mb-1.5 sm:mb-2 uppercase tracking-wider font-semibold">Prompt</div>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{prompt}</p>
        </div>
        <div className="pt-3 sm:pt-4 border-t border-white/10">
          <div className="text-[10px] sm:text-xs text-white/50 mb-1.5 sm:mb-2 uppercase tracking-wider font-semibold">Model</div>
          <p className="text-xs sm:text-sm text-white font-semibold">{modelName}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
        <button
          onClick={() => hasMultipleImages ? handleDownloadAll() : handleDownload()}
          className="py-2.5 sm:py-3 px-3 sm:px-4 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg
                   transition-all duration-300
                   flex flex-col items-center justify-center gap-1.5 sm:gap-2"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
          <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-semibold">
            {hasMultipleImages ? 'Download ZIP' : 'Save'}
          </span>
        </button>

        <button
          onClick={onShare}
          className="py-2.5 sm:py-3 px-3 sm:px-4 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg
                   transition-all duration-300
                   flex flex-col items-center justify-center gap-1.5 sm:gap-2"
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
          <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-semibold">Share</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div 
            className="relative max-w-[90vw] max-h-[90vh] w-auto h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt={prompt}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(lightboxImage);
              }}
              className="absolute bottom-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-bold">Download</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
