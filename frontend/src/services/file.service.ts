import { apiClient } from '@/lib/axios';

export interface FileUploadResponse {
  id: string;
  filename: string;
  meta: {
    content_type: string;
    size: number;
    path: string;
  };
}

export const fileService = {
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/files/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async uploadImage(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/files/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async getFileUrl(fileId: string): Promise<string> {
    return `${apiClient.defaults.baseURL}/files/${fileId}/content`;
  },

  async getImageUrl(fileId: string): Promise<string> {
    return `${apiClient.defaults.baseURL}/files/image/${fileId}`;
  },
};