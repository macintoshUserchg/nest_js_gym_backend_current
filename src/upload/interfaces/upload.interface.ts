export interface UploadedFile {
  url: string;
  key: string;
  size: number;
  mimetype: string;
  originalName: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  category?: string;
}
