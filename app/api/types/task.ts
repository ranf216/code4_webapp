// Task type definitions based on API_Task.md and Task API Integration Guide

export type TaskStatus =
  | 'new'
  | 'accepted'
  | 'approved'
  | 'completed'
  | 'rejected'
  | 'canceled'

export type TaskPriority = 'urgent' | 'important' | 'normal' | 'low'

export interface TaskComment {
  comment_id: number
  user_id: string
  user_name: string
  text: string
  created_on: string
}

export interface TaskMedia {
  media_id: number
  url: string
  media_type: 'image' | 'video' | 'document'
  is_confirmation: boolean
  uploaded_by: string
  created_on: string
}

export interface Task {
  task_id: number
  community_id: number
  community_name: string | null
  task_type: string
  task_type_name: string
  status: TaskStatus
  priority: TaskPriority
  description: string
  address: string | null
  created_by: string
  created_by_name: string | null
  assigned_to: string
  assigned_to_name: string | null
  accepted_by: string | null
  eta: string | null
  accepted_on: string | null
  completed_on: string | null
  rejected_on: string | null
  canceled_on: string | null
  created_on: string
  last_update: string | null
  comments?: TaskComment[]
  media?: TaskMedia[]
}

// Request: Task/create_task
export interface CreateTaskRequest {
  '#request': 'Task/create_task'
  task_type: string
  description: string
  priority?: TaskPriority
  address?: string
  assigned_to?: string
  media_file_ids?: string[]
  video_file_id?: string
  document_file_ids?: string[]
}

// Response: Task/create_task
export interface CreateTaskResponse {
  task_id: number
}

// Request: Task/get_tasks_list
export interface GetTasksListRequest {
  '#request': 'Task/get_tasks_list'
  status?: TaskStatus
  task_type?: string
  priority?: TaskPriority
  community_id?: number
  is_open?: boolean | null
  scope?: 'all' | 'assigned_to_me' | 'created_by_me'
  search_text?: string
  date_from?: string
  date_to?: string
  sort_by?: 'created_on' | 'priority' | 'status' | 'task_type' | string
  sort_dir?: 'asc' | 'desc' | string
  offset?: number
  limit?: number
}

// Response: Task/get_tasks_list
export interface GetTasksListResponse {
  tasks: Task[]
  total_count: number
}

// Request: Task/get_task
export interface GetTaskRequest {
  '#request': 'Task/get_task'
  task_id: number
}

// Response: Task/get_task
export interface GetTaskResponse {
  task: Task
}

// Request: Task/update_task
export interface UpdateTaskRequest {
  '#request': 'Task/update_task'
  task_id: number
  description?: string
  priority?: TaskPriority
  address?: string
  eta?: string
}

// Request: Task/accept_task
export interface AcceptTaskRequest {
  '#request': 'Task/accept_task'
  task_id: number
}

// Request: Task/approve_task
export interface ApproveTaskRequest {
  '#request': 'Task/approve_task'
  task_id: number
  assigned_to?: string
}

// Request: Task/reject_task
export interface RejectTaskRequest {
  '#request': 'Task/reject_task'
  task_id: number
  comment: string
}

// Request: Task/complete_task
export interface CompleteTaskRequest {
  '#request': 'Task/complete_task'
  task_id: number
  comment?: string
  confirmation_media_file_ids?: string[]
  confirmation_video_file_id?: string
}

// Request: Task/cancel_task
export interface CancelTaskRequest {
  '#request': 'Task/cancel_task'
  task_id: number
}

// Request: Task/reassign_task
export interface ReassignTaskRequest {
  '#request': 'Task/reassign_task'
  task_id: number
  assigned_to: string
}

// Request: Task/add_task_comment
export interface AddTaskCommentRequest {
  '#request': 'Task/add_task_comment'
  task_id: number
  comment: string
}

// Response: Task/add_task_comment
export interface AddTaskCommentResponse {
  comment_id: number
}

// Request: Task/add_task_media
export interface AddTaskMediaRequest {
  '#request': 'Task/add_task_media'
  task_id: number
  media_file_ids?: string[]
  video_file_id?: string
  document_file_ids?: string[]
  is_confirmation?: boolean
}

// Request: Task/get_task_metadata
export interface GetTaskMetadataRequest {
  '#request': 'Task/get_task_metadata'
}

// Response: Task/get_task_metadata
export interface GetTaskMetadataResponse {
  task_types: Record<string, string>
  task_statuses: Record<string, string>
  task_priorities: Record<string, string>
}

// Task module error codes
export const TaskErrorCodes = {
  ERR_NO_TOKEN: 113,
  ERR_INVALID_TOKEN: 201,
  ERR_NO_PRIVILEGES: 103,
  ERR_DB_INSERT: 401,
  ERR_DB_UPDATE: 402,
  ERR_COMMUNITY_NOT_FOUND: 500,
  ERR_FILE_NOT_FOUND: 321,
  ERR_INVALID_FILE_TYPE: 324,
  ERR_TASK_NOT_FOUND: 590,
  ERR_TASK_INVALID_STATUS: 591,
  ERR_TASK_CANNOT_ACCEPT: 592,
  ERR_TASK_CANNOT_COMPLETE: 593,
  ERR_TASK_CANNOT_CANCEL: 594,
  ERR_TASK_CANNOT_REJECT: 595,
  ERR_TASK_INVALID_TYPE: 596,
  ERR_TASK_INVALID_PRIORITY: 597,
  ERR_TASK_MEDIA_LIMIT_REACHED: 598,
  ERR_TASK_CANNOT_REASSIGN: 599,
  ERR_TASK_ASSIGNEE_NOT_FOUND: 600,
  ERR_TASK_COMMENT_NOT_FOUND: 601,
} as const
