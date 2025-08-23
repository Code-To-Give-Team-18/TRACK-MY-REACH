'use client';

import React from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  imagePreview: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
}

export default function ImageUpload({ 
  imagePreview, 
  onImageChange, 
  onImageRemove 
}: ImageUploadProps) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Upload className="w-4 h-4" />
        Profile Picture
      </label>
      <div className="flex items-center gap-4">
        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
          />
          <span className="text-gray-700">Choose Image</span>
        </label>
        {imagePreview && (
          <div className="relative w-20 h-20">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={onImageRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}