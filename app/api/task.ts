import { BaseApiClient } from './base'
import type { ApiResponse } from './base'
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  GetTasksListRequest,
  GetTasksListResponse,
  GetTaskRequest,
  GetTaskResponse,
  UpdateTaskRequest,
  AcceptTaskRequest,
  ApproveTaskRequest,
  RejectTaskRequest,
  CompleteTaskRequest,
  CancelTaskRequest,
  ReassignTaskRequest,
  AddTaskCommentRequest,
  AddTaskCommentResponse,
  AddTaskMediaRequest,
  GetTaskMetadataRequest,
  GetTaskMetadataResponse,
} from './types/task'

class TaskApi extends BaseApiClient {
  /**
   * Create a new task. The task is created with status new.
   */
  async createTask(
    params: Omit<CreateTaskRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<CreateTaskResponse>> {
    return this.request<CreateTaskResponse>(
      {
        '#request': 'Task/create_task',
        ...params,
      },
      options
    )
  }

  /**
   * Get a paginated, filterable list of tasks.
   */
  async getTasksList(
    params: Omit<GetTasksListRequest, '#request'> = {},
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetTasksListResponse>> {
    return this.request<GetTasksListResponse>(
      {
        '#request': 'Task/get_tasks_list',
        ...params,
      },
      options
    )
  }

  /**
   * Get full details of a single task, including comments and media.
   */
  async getTask(
    taskId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetTaskResponse>> {
    return this.request<GetTaskResponse>(
      {
        '#request': 'Task/get_task',
        task_id: taskId,
      },
      options
    )
  }

  /**
   * Update task details. Only allowed while the task is in an open status.
   */
  async updateTask(
    params: Omit<UpdateTaskRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Task/update_task',
        ...params,
      },
      options
    )
  }

  /**
   * Accept a task. Changes status from new to accepted.
   */
  async acceptTask(
    taskId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Task/accept_task',
        task_id: taskId,
      },
      options
    )
  }

  /**
   * Approve a task that requires administrative approval.
   */
  async approveTask(
    params: Omit<ApproveTaskRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Task/approve_task',
        ...params,
      },
      options
    )
  }

  /**
   * Reject a task with a mandatory reason comment.
   */
  async rejectTask(
    params: Omit<RejectTaskRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Task/reject_task',
        ...params,
      },
      options
    )
  }

  /**
   * Mark a task as completed. Optionally attach a resolution comment
   * and confirmation media.
   */
  async completeTask(
    params: Omit<CompleteTaskRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Task/complete_task',
        ...params,
      },
      options
    )
  }

  /**
   * Cancel a task. Officers can only cancel tasks they created while new.
   * Admins can cancel any open task.
   */
  async cancelTask(
    taskId: number,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Task/cancel_task',
        task_id: taskId,
      },
      options
    )
  }

  /**
   * Reassign a task to another user.
   */
  async reassignTask(
    params: Omit<ReassignTaskRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Task/reassign_task',
        ...params,
      },
      options
    )
  }

  /**
   * Add a comment to a task.
   */
  async addTaskComment(
    params: Omit<AddTaskCommentRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<AddTaskCommentResponse>> {
    return this.request<AddTaskCommentResponse>(
      {
        '#request': 'Task/add_task_comment',
        ...params,
      },
      options
    )
  }

  /**
   * Upload additional media to an existing task.
   */
  async addTaskMedia(
    params: Omit<AddTaskMediaRequest, '#request'>,
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      {
        '#request': 'Task/add_task_media',
        ...params,
      },
      options
    )
  }

  /**
   * Get all available task types, statuses, and priorities.
   */
  async getTaskMetadata(
    options?: { showLoading?: boolean; loadingMessage?: string }
  ): Promise<ApiResponse<GetTaskMetadataResponse>> {
    return this.request<GetTaskMetadataResponse>(
      {
        '#request': 'Task/get_task_metadata',
      },
      options
    )
  }
}

export const taskApi = new TaskApi()
export default taskApi
