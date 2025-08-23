'use client';

import React from 'react';
import { Video, Upload, X } from 'lucide-react';

interface VideoUploadProps {
  useVideoFile: boolean;
  videoPreview: string | null;
  selectedVideo: File | null;
  videoLink: string;
  onToggleMode: (useFile: boolean) => void;
  onVideoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoRemove: () => void;
  onVideoLinkChange: (link: string) => void;
}

export default function VideoUpload({
  useVideoFile,
  videoPreview,
  selectedVideo,
  videoLink,
  onToggleMode,
  onVideoSelect,
  onVideoRemove,
  onVideoLinkChange
}: VideoUploadProps) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Video className="w-4 h-4" />
        Video
      </label>
      
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => onToggleMode(true)}
          className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
            useVideoFile 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => onToggleMode(false)}
          className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
            !useVideoFile 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Use URL
        </button>
      </div>
      
      {useVideoFile ? (
        !videoPreview ? (
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="video/*"
              onChange={onVideoSelect}
              className="hidden"
            />
            <div className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50 text-center">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-sm text-gray-600">Click to upload video</p>
              <p className="text-xs text-gray-500">MP4, WebM up to 100MB</p>
            </div>
          </label>
        ) : (
          <div className="relative">
            <video
              src={videoPreview}
              controls
              className="w-full h-32 bg-black rounded-lg"
            />
            <button
              type="button"
              onClick={onVideoRemove}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
            {selectedVideo && (
              <p className="text-xs text-gray-600 mt-1">
                {selectedVideo.name} ({(selectedVideo.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )
      ) : (
        <input
          type="url"
          value={videoLink}
          onChange={(e) => onVideoLinkChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://youtube.com/watch?v=..."
        />
      )}
    </div>
  );
}