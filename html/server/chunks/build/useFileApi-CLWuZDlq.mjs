import { F as FileUploadConfig, B as BaseApiClient } from '../virtual/entry.mjs';
import { ref, readonly } from 'vue';

//#region app/api/file.ts
/**
* File API client
* Handles file upload operations including base64 and multipart uploads
*/
var FileApi = class extends BaseApiClient {
	/**
	* Upload a file using base64 encoding
	* For small files that can be sent in a single request
	*/
	async uploadFileBase64(fileName, fileData) {
		const request = {
			"#request": "File/upload_file_base64",
			file_name: fileName,
			file_data: fileData
		};
		return this.request(request);
	}
	/**
	* Begin a multipart file upload session
	* For large files that need to be uploaded in chunks
	*/
	async beginMultipartUpload(fileName, options) {
		const request = {
			"#request": "File/begin_multipart_file_upload",
			file_name: fileName
		};
		if (options?.uploadToTempFolder !== void 0) request.upload_to_temp_folder = options.uploadToTempFolder;
		return this.request(request);
	}
	/**
	* Upload a single part (chunk) of a multipart file upload
	*/
	async uploadFilePart(uploadId, partNumber, partData) {
		const request = {
			"#request": "File/upload_file_part",
			upload_id: uploadId,
			part_number: partNumber,
			part_data: partData
		};
		return this.request(request);
	}
	/**
	* Get the status of a multipart upload
	* Returns array of successfully uploaded part numbers
	*/
	async getMultipartUploadStatus(uploadId) {
		const request = {
			"#request": "File/get_multipart_upload_status",
			upload_id: uploadId
		};
		return this.request(request);
	}
	/**
	* Finalize a multipart upload and assemble all parts into a single file
	*/
	async endMultipartUpload(uploadId, numOfParts) {
		const request = {
			"#request": "File/end_multipart_file_upload",
			upload_id: uploadId,
			num_of_parts: numOfParts
		};
		return this.request(request);
	}
	/**
	* Abort an in-progress multipart upload and clean up all uploaded parts
	*/
	async abortMultipartUpload(uploadId) {
		const request = {
			"#request": "File/abort_multipart_upload",
			upload_id: uploadId
		};
		return this.request(request);
	}
};
var fileApi = new FileApi();
var uploadFileBase64 = (fileName, fileData) => fileApi.uploadFileBase64(fileName, fileData);
var beginMultipartUpload = (fileName, options) => fileApi.beginMultipartUpload(fileName, options);
var uploadFilePart = (uploadId, partNumber, partData) => fileApi.uploadFilePart(uploadId, partNumber, partData);
var getMultipartUploadStatus = (uploadId) => fileApi.getMultipartUploadStatus(uploadId);
var endMultipartUpload = (uploadId, numOfParts) => fileApi.endMultipartUpload(uploadId, numOfParts);
var abortMultipartUpload = (uploadId) => fileApi.abortMultipartUpload(uploadId);
//#endregion
//#region app/composables/useFileApi.ts
/**
* Composable for file upload operations
* Supports both base64 (small files) and multipart (large files) uploads
*/
function useFileApi() {
	const isLoading = ref(false);
	const error = ref(null);
	/**
	* Upload a small file using base64 encoding
	* @param file - File to upload
	* @returns file_id on success
	*/
	async function uploadSmallFile(file) {
		isLoading.value = true;
		error.value = null;
		try {
			const base64Data = await fileToBase64(file);
			const response = await uploadFileBase64(file.name, base64Data);
			if (response.rc !== 0) {
				error.value = response.message;
				return null;
			}
			return response.file_id || null;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Upload failed";
			return null;
		} finally {
			isLoading.value = false;
		}
	}
	/**
	* Upload a large file using multipart upload
	* @param file - File to upload
	* @param chunkSize - Size of each chunk in bytes (default 5MB)
	* @param onProgress - Callback for upload progress (uploadedParts, totalParts)
	* @returns file_id on success
	*/
	async function uploadLargeFile(file, chunkSize = FileUploadConfig.chunkSize, onProgress) {
		isLoading.value = true;
		error.value = null;
		try {
			const beginResponse = await beginMultipartUpload(file.name);
			if (beginResponse.rc !== 0) {
				error.value = beginResponse.message;
				return null;
			}
			const uploadId = beginResponse.upload_id;
			if (!uploadId) {
				error.value = "Failed to get upload ID";
				return null;
			}
			const chunks = splitFileIntoChunks(file, chunkSize);
			const totalParts = chunks.length;
			for (let i = 0; i < chunks.length; i++) {
				const partNumber = i + 1;
				const chunk = chunks[i];
				const partResponse = await uploadFilePart(uploadId, partNumber, await blobToBase64(chunk));
				if (partResponse.rc !== 0) {
					error.value = `Part ${partNumber} failed: ${partResponse.message}`;
					await abortMultipartUpload(uploadId);
					return null;
				}
				onProgress?.(partNumber, totalParts);
			}
			const endResponse = await endMultipartUpload(uploadId, totalParts);
			if (endResponse.rc !== 0) {
				error.value = endResponse.message;
				return null;
			}
			return endResponse.file_id || null;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Upload failed";
			return null;
		} finally {
			isLoading.value = false;
		}
	}
	/**
	* Smart upload - automatically chooses base64 or multipart based on file size
	* @param file - File to upload
	* @param maxBase64Size - Max size for base64 upload (default 5MB)
	* @param onProgress - Progress callback for multipart uploads
	*/
	async function uploadFile(file, maxBase64Size = FileUploadConfig.maxBase64Size, onProgress) {
		if (file.size <= FileUploadConfig.maxBase64Size) return uploadSmallFile(file);
		else return uploadLargeFile(file, maxBase64Size, onProgress);
	}
	/**
	* Resume a multipart upload by checking status and uploading missing parts
	*/
	async function resumeMultipartUpload(uploadId, file, chunkSize = FileUploadConfig.chunkSize, onProgress) {
		isLoading.value = true;
		error.value = null;
		try {
			const statusResponse = await getMultipartUploadStatus(uploadId);
			if (statusResponse.rc !== 0) {
				error.value = statusResponse.message;
				return null;
			}
			const uploadedParts = statusResponse.uploaded_parts || [];
			const chunks = splitFileIntoChunks(file, chunkSize);
			const totalParts = chunks.length;
			for (let i = 0; i < chunks.length; i++) {
				const partNumber = i + 1;
				if (uploadedParts.includes(partNumber)) {
					onProgress?.(partNumber, totalParts);
					continue;
				}
				const chunk = chunks[i];
				const partResponse = await uploadFilePart(uploadId, partNumber, await blobToBase64(chunk));
				if (partResponse.rc !== 0) {
					error.value = `Part ${partNumber} failed: ${partResponse.message}`;
					return null;
				}
				onProgress?.(partNumber, totalParts);
			}
			const endResponse = await endMultipartUpload(uploadId, totalParts);
			if (endResponse.rc !== 0) {
				error.value = endResponse.message;
				return null;
			}
			return endResponse.file_id || null;
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Resume failed";
			return null;
		} finally {
			isLoading.value = false;
		}
	}
	return {
		isLoading: readonly(isLoading),
		error: readonly(error),
		uploadFile,
		uploadSmallFile,
		uploadLargeFile,
		resumeMultipartUpload,
		fileApi,
		uploadFileBase64,
		beginMultipartUpload,
		uploadFilePart,
		getMultipartUploadStatus,
		endMultipartUpload,
		abortMultipartUpload
	};
}
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			resolve(result.split(",")[1] || result);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}
function blobToBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			resolve(result.split(",")[1] || result);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}
function splitFileIntoChunks(file, chunkSize) {
	const chunks = [];
	let offset = 0;
	while (offset < file.size) {
		const chunk = file.slice(offset, offset + chunkSize);
		chunks.push(chunk);
		offset += chunkSize;
	}
	return chunks;
}

export { fileToBase64 as f, useFileApi as u };
//# sourceMappingURL=useFileApi-CLWuZDlq.mjs.map
