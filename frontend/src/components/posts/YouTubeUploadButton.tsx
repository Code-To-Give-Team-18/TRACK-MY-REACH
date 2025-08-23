'use client';

import { useState } from 'react';
import { Youtube, Upload, Check, AlertCircle } from 'lucide-react';
import { postService } from '@/services/post.service';

interface YouTubeUploadButtonProps {
  postId: string;
  hasVideo: boolean;
  youtubeUrl?: string;
}

export default function YouTubeUploadButton({ 
  postId, 
  hasVideo, 
  youtubeUrl 
}: YouTubeUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUploadToYouTube = async () => {
    if (!hasVideo) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const response = await postService.uploadToYouTube(postId);
      setUploadStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
    } catch (error: any) {
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.detail || 'Upload failed');
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsUploading(false);
    }
  };

  if (!hasVideo) {
    return null;
  }

  if (youtubeUrl) {
    return (
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
      >
        <Youtube className="w-4 h-4" />
        View on YouTube
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleUploadToYouTube}
        disabled={isUploading}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all
          ${isUploading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : uploadStatus === 'success'
            ? 'bg-green-50 text-green-600 hover:bg-green-100'
            : uploadStatus === 'error'
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-red-50 text-red-600 hover:bg-red-100'
          }
        `}
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Uploading...
          </>
        ) : uploadStatus === 'success' ? (
          <>
            <Check className="w-4 h-4" />
            Uploaded!
          </>
        ) : uploadStatus === 'error' ? (
          <>
            <AlertCircle className="w-4 h-4" />
            Failed
          </>
        ) : (
          <>
            <Youtube className="w-4 h-4" />
            <Upload className="w-3.5 h-3.5" />
            Upload to YouTube
          </>
        )}
      </button>

      {errorMessage && (
        <div className="absolute top-full mt-1 left-0 bg-red-100 text-red-700 text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
}