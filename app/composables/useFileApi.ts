import {
  fileApi,
  uploadFileBase64,
  beginMultipartUpload,
  uploadFilePart,
  getMultipartUploadStatus,
  endMultipartUpload,
  abortMultipartUpload,
} from '~/api/file'
import { FileUploadConfig } from '~/utils/config'

export interface MultipartUploadState {
  uploadId: string | null
  fileName: string
  totalParts: number
  uploadedParts: number[]
  isUploading: boolean
  error: string | null
}

/**
 * Composable for file upload operations
 * Supports both base64 (small files) and multipart (large files) uploads
 */
export function useFileApi() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Upload a small file using base64 encoding
   * @param file - File to upload
   * @returns file_id on success
   */
  async function uploadSmallFile(file: File): Promise<string | null> {
    isLoading.value = true
    error.value = null

    try {
      const base64Data = await fileToBase64(file)
      const response = await uploadFileBase64(file.name, base64Data)

      if (response.rc !== 0) {
        error.value = response.message
        return null
      }

      return response.file_id || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upload failed'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Upload a large file using multipart upload
   * @param file - File to upload
   * @param chunkSize - Size of each chunk in bytes (default 5MB)
   * @param onProgress - Callback for upload progress (uploadedParts, totalParts)
   * @returns file_id on success
   */
  async function uploadLargeFile(
    file: File,
    chunkSize: number = FileUploadConfig.chunkSize,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<string | null> {
    isLoading.value = true
    error.value = null

    try {
      // Step 1: Begin multipart upload
      const beginResponse = await beginMultipartUpload(file.name)

      if (beginResponse.rc !== 0) {
        error.value = beginResponse.message
        return null
      }

      const uploadId = beginResponse.upload_id
      if (!uploadId) {
        error.value = 'Failed to get upload ID'
        return null
      }

      // Step 2: Split file into chunks and upload each part
      const chunks = splitFileIntoChunks(file, chunkSize)
      const totalParts = chunks.length

      for (let i = 0; i < chunks.length; i++) {
        const partNumber = i + 1
        const chunk = chunks[i]!
        const base64Data = await blobToBase64(chunk)

        const partResponse = await uploadFilePart(uploadId, partNumber, base64Data)

        if (partResponse.rc !== 0) {
          error.value = `Part ${partNumber} failed: ${partResponse.message}`
          await abortMultipartUpload(uploadId)
          return null
        }

        onProgress?.(partNumber, totalParts)
      }

      // Step 3: End multipart upload
      const endResponse = await endMultipartUpload(uploadId, totalParts)

      if (endResponse.rc !== 0) {
        error.value = endResponse.message
        return null
      }

      return endResponse.file_id || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upload failed'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Smart upload - automatically chooses base64 or multipart based on file size
   * @param file - File to upload
   * @param maxBase64Size - Max size for base64 upload (default 5MB)
   * @param onProgress - Progress callback for multipart uploads
   */
  async function uploadFile(
    file: File,
    maxBase64Size: number = FileUploadConfig.maxBase64Size,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<string | null> {
    if (file.size <= FileUploadConfig.maxBase64Size) {
      return uploadSmallFile(file)
    } else {
      return uploadLargeFile(file, maxBase64Size, onProgress)
    }
  }

  /**
   * Resume a multipart upload by checking status and uploading missing parts
   */
  async function resumeMultipartUpload(
    uploadId: string,
    file: File,
    chunkSize: number = FileUploadConfig.chunkSize,
    onProgress?: (uploaded: number, total: number) => void
  ): Promise<string | null> {
    isLoading.value = true
    error.value = null

    try {
      // Get current status
      const statusResponse = await getMultipartUploadStatus(uploadId)

      if (statusResponse.rc !== 0) {
        error.value = statusResponse.message
        return null
      }

      const uploadedParts = statusResponse.uploaded_parts || []
      const chunks = splitFileIntoChunks(file, chunkSize)
      const totalParts = chunks.length

      // Upload missing parts
      for (let i = 0; i < chunks.length; i++) {
        const partNumber = i + 1

        // Skip if already uploaded
        if (uploadedParts.includes(partNumber)) {
          onProgress?.(partNumber, totalParts)
          continue
        }

        const chunk = chunks[i]!
        const base64Data = await blobToBase64(chunk)

        const partResponse = await uploadFilePart(uploadId, partNumber, base64Data)

        if (partResponse.rc !== 0) {
          error.value = `Part ${partNumber} failed: ${partResponse.message}`
          return null
        }

        onProgress?.(partNumber, totalParts)
      }

      // Finalize
      const endResponse = await endMultipartUpload(uploadId, totalParts)

      if (endResponse.rc !== 0) {
        error.value = endResponse.message
        return null
      }

      return endResponse.file_id || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Resume failed'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),

    // API methods
    uploadFile,
    uploadSmallFile,
    uploadLargeFile,
    resumeMultipartUpload,

    // Raw API exports for advanced usage
    fileApi,
    uploadFileBase64,
    beginMultipartUpload,
    uploadFilePart,
    getMultipartUploadStatus,
    endMultipartUpload,
    abortMultipartUpload,
  }
}

// Helper functions
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix if present
      const base64 = result.split(',')[1] || result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1] || result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function splitFileIntoChunks(file: File, chunkSize: number): Blob[] {
  const chunks: Blob[] = []
  let offset = 0

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize)
    chunks.push(chunk)
    offset += chunkSize
  }

  return chunks
}
