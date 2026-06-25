import { BaseApiClient, type ApiResponse } from './base'

// Response types
interface BaseResponse {
  rc: number
  message: string
}

export interface UploadFileBase64Response extends BaseResponse {
  file_id?: string
}

export interface BeginMultipartResponse extends BaseResponse {
  upload_id?: string
}

export interface GetMultipartStatusResponse extends BaseResponse {
  uploaded_parts?: number[]
}

export interface EndMultipartResponse extends BaseResponse {
  file_id?: string
}

/**
 * File API client
 * Handles file upload operations including base64 and multipart uploads
 */
class FileApi extends BaseApiClient {
  /**
   * Upload a file using base64 encoding
   * For small files that can be sent in a single request
   */
  async uploadFileBase64(
    fileName: string,
    fileData: string
  ): Promise<ApiResponse<UploadFileBase64Response>> {
    const request: Record<string, unknown> = {
      '#request': 'File/upload_file_base64',
      file_name: fileName,
      file_data: fileData,
    }

    return this.request<UploadFileBase64Response>(request as any)
  }

  /**
   * Begin a multipart file upload session
   * For large files that need to be uploaded in chunks
   */
  async beginMultipartUpload(
    fileName: string,
    options?: {
      uploadToTempFolder?: boolean
    }
  ): Promise<ApiResponse<BeginMultipartResponse>> {
    const request: Record<string, unknown> = {
      '#request': 'File/begin_multipart_file_upload',
      file_name: fileName,
    }

    if (options?.uploadToTempFolder !== undefined) {
      request.upload_to_temp_folder = options.uploadToTempFolder
    }

    return this.request<BeginMultipartResponse>(request as any)
  }

  /**
   * Upload a single part (chunk) of a multipart file upload
   */
  async uploadFilePart(
    uploadId: string,
    partNumber: number,
    partData: string
  ): Promise<ApiResponse<BaseResponse>> {
    const request = {
      '#request': 'File/upload_file_part',
      upload_id: uploadId,
      part_number: partNumber,
      part_data: partData,
    }

    return this.request<BaseResponse>(request as any)
  }

  /**
   * Get the status of a multipart upload
   * Returns array of successfully uploaded part numbers
   */
  async getMultipartUploadStatus(
    uploadId: string
  ): Promise<ApiResponse<GetMultipartStatusResponse>> {
    const request = {
      '#request': 'File/get_multipart_upload_status',
      upload_id: uploadId,
    }

    return this.request<GetMultipartStatusResponse>(request as any)
  }

  /**
   * Finalize a multipart upload and assemble all parts into a single file
   */
  async endMultipartUpload(
    uploadId: string,
    numOfParts: number
  ): Promise<ApiResponse<EndMultipartResponse>> {
    const request = {
      '#request': 'File/end_multipart_file_upload',
      upload_id: uploadId,
      num_of_parts: numOfParts,
    }

    return this.request<EndMultipartResponse>(request as any)
  }

  /**
   * Abort an in-progress multipart upload and clean up all uploaded parts
   */
  async abortMultipartUpload(uploadId: string): Promise<ApiResponse<BaseResponse>> {
    const request = {
      '#request': 'File/abort_multipart_upload',
      upload_id: uploadId,
    }

    return this.request<BaseResponse>(request as any)
  }
}

// Export singleton instance
export const fileApi = new FileApi()

// Backward compatible exports
export const uploadFileBase64 = (fileName: string, fileData: string) =>
  fileApi.uploadFileBase64(fileName, fileData)
export const beginMultipartUpload = (fileName: string, options?: { uploadToTempFolder?: boolean }) =>
  fileApi.beginMultipartUpload(fileName, options)
export const uploadFilePart = (uploadId: string, partNumber: number, partData: string) =>
  fileApi.uploadFilePart(uploadId, partNumber, partData)
export const getMultipartUploadStatus = (uploadId: string) =>
  fileApi.getMultipartUploadStatus(uploadId)
export const endMultipartUpload = (uploadId: string, numOfParts: number) =>
  fileApi.endMultipartUpload(uploadId, numOfParts)
export const abortMultipartUpload = (uploadId: string) =>
  fileApi.abortMultipartUpload(uploadId)
