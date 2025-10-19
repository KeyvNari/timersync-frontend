/**
 * File Parser - SIMPLIFIED VERSION
 * Original file required mammoth, pdfjs-dist, and xlsx which were removed to reduce bundle size
 * This version provides basic functionality without file content extraction
 *
 * To restore full functionality:
 * 1. Run: npm install mammoth pdfjs-dist xlsx
 * 2. Restore from file-parser.ts.disabled
 */

export interface FileParseResult {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Simplified file content extractor - returns file metadata only
 * Full extraction requires mammoth, pdfjs-dist, and xlsx packages
 */
export async function extractFileContent(file: File): Promise<FileParseResult> {
  // Return basic file info instead of full content extraction
  return {
    success: false,
    error: 'File content extraction is disabled. Install mammoth, pdfjs-dist, and xlsx to enable.',
  };
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
