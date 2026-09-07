import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, e as useAuthStore, c as useToastStore, B as BaseApiClient } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { F as FileUpload_default, M as MImagePreview_default } from './FileUpload-B-39JGGf.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { A as AppDialogModal_default } from './AppDialogModal-CYp4oRY_.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, Fragment, withDirectives, vModelText, createCommentVNode, renderList, createTextVNode, vModelSelect, withModifiers, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import 'nostics';
import 'nostics/formatters/ansi';
import '../routes/renderer.mjs';
import 'unhead/server';
import 'unhead/legacy';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import 'vue-router';
import '@vue/shared';
import 'pinia';
import 'fnv1a-64';
import 'object-identity';
import 'axios';
import 'unhead/utils';
import 'moment';
import './useFileApi-CLWuZDlq.mjs';

//#region app/api/task.ts
var TaskApi = class extends BaseApiClient {
	/**
	* Create a new task. The task is created with status new.
	*/
	async createTask(params, options) {
		return this.request({
			"#request": "Task/create_task",
			...params
		}, options);
	}
	/**
	* Get a paginated, filterable list of tasks.
	*/
	async getTasksList(params = {}, options) {
		return this.request({
			"#request": "Task/get_tasks_list",
			...params
		}, options);
	}
	/**
	* Get full details of a single task, including comments and media.
	*/
	async getTask(taskId, options) {
		return this.request({
			"#request": "Task/get_task",
			task_id: taskId
		}, options);
	}
	/**
	* Update task details. Only allowed while the task is in an open status.
	*/
	async updateTask(params, options) {
		return this.request({
			"#request": "Task/update_task",
			...params
		}, options);
	}
	/**
	* Accept a task. Changes status from new to accepted.
	*/
	async acceptTask(taskId, options) {
		return this.request({
			"#request": "Task/accept_task",
			task_id: taskId
		}, options);
	}
	/**
	* Approve a task that requires administrative approval.
	*/
	async approveTask(params, options) {
		return this.request({
			"#request": "Task/approve_task",
			...params
		}, options);
	}
	/**
	* Reject a task with a mandatory reason comment.
	*/
	async rejectTask(params, options) {
		return this.request({
			"#request": "Task/reject_task",
			...params
		}, options);
	}
	/**
	* Mark a task as completed. Optionally attach a resolution comment
	* and confirmation media.
	*/
	async completeTask(params, options) {
		return this.request({
			"#request": "Task/complete_task",
			...params
		}, options);
	}
	/**
	* Cancel a task. Officers can only cancel tasks they created while new.
	* Admins can cancel any open task.
	*/
	async cancelTask(taskId, options) {
		return this.request({
			"#request": "Task/cancel_task",
			task_id: taskId
		}, options);
	}
	/**
	* Reassign a task to another user.
	*/
	async reassignTask(params, options) {
		return this.request({
			"#request": "Task/reassign_task",
			...params
		}, options);
	}
	/**
	* Add a comment to a task.
	*/
	async addTaskComment(params, options) {
		return this.request({
			"#request": "Task/add_task_comment",
			...params
		}, options);
	}
	/**
	* Upload additional media to an existing task.
	*/
	async addTaskMedia(params, options) {
		return this.request({
			"#request": "Task/add_task_media",
			...params
		}, options);
	}
	/**
	* Get all available task types, statuses, and priorities.
	*/
	async getTaskMetadata(options) {
		return this.request({ "#request": "Task/get_task_metadata" }, options);
	}
};
var taskApi = new TaskApi();
//#endregion
//#region app/components/tasks/TasksManagement.vue?vue&type=script&setup=true&lang.ts
var TasksManagement_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "TasksManagement",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const tasks = ref([]);
		const totalCount = ref(0);
		const offset = ref(0);
		const limit = ref(20);
		const pageSizeOptions = [
			20,
			50,
			100
		];
		ref(null);
		function mapApiTask(task) {
			return {
				id: `TSK-${String(task.task_id).padStart(3, "0")}`,
				task_id: task.task_id,
				task_type: task.task_type,
				task_type_name: task.task_type_name,
				description: task.description,
				priority: task.priority,
				status: task.status,
				created_at: task.created_on,
				created_by: task.created_by,
				created_by_name: task.created_by_name,
				assigned_to: task.assigned_to,
				assigned_to_name: task.assigned_to_name,
				address: task.address || void 0,
				community_name: task.community_name || void 0,
				last_update: task.last_update || void 0,
				eta: task.eta || void 0,
				comments: (task.comments || []).map((c) => ({
					id: String(c.comment_id),
					text: c.text,
					created_at: c.created_on,
					user: c.user_name
				})),
				media: task.media || [],
				updated_at: task.last_update || task.created_on
			};
		}
		async function fetchTasks() {
			try {
				const isOpen = selectedStatus.value === "open" ? true : selectedStatus.value === "closed" ? false : null;
				const res = await taskApi.getTasksList({
					search_text: searchQuery.value || void 0,
					task_type: selectedTaskType.value || void 0,
					priority: selectedPriority.value || void 0,
					is_open: isOpen,
					date_from: dateFrom.value || void 0,
					date_to: dateTo.value || void 0,
					sort_by: "created_on",
					sort_dir: sortOrder.value,
					offset: offset.value,
					limit: limit.value
				}, { showLoading: false });
				if (res.rc === 0) {
					tasks.value = (res.tasks || []).map(mapApiTask);
					totalCount.value = res.total_count || 0;
				}
			} catch (err) {
				console.error("Failed to fetch tasks:", err);
			}
		}
		const searchQuery = ref("");
		const selectedTaskType = ref("");
		const selectedStatus = ref("open");
		const selectedPriority = ref("");
		ref(false);
		const dateFrom = ref("");
		const dateTo = ref("");
		const sortOrder = ref("desc");
		const taskTypeMap = ref({});
		const priorityMap = ref({});
		const taskTypes = computed(() => [{
			value: "",
			label: t("tasks.all_types")
		}, ...Object.entries(taskTypeMap.value).map(([value, label]) => ({
			value,
			label
		}))]);
		const priorities = computed(() => [{
			value: "",
			label: t("tasks.all_priorities")
		}, ...Object.entries(priorityMap.value).map(([value, label]) => ({
			value,
			label
		}))]);
		const availableTaskTypes = computed(() => Object.entries(taskTypeMap.value).map(([value, label]) => ({
			value,
			label
		})));
		const availablePriorities = computed(() => Object.entries(priorityMap.value).map(([value, label]) => ({
			value,
			label
		})));
		const taskMetadataLoading = ref(false);
		const statusOptions = [
			{
				value: "open",
				label: t("tasks.status_open")
			},
			{
				value: "closed",
				label: t("tasks.status_closed")
			},
			{
				value: "all",
				label: t("tasks.status_all")
			}
		];
		const priorityBadge = {
			urgent: "taskPriority",
			important: "taskPriority",
			normal: "taskPriority",
			low: "taskPriority"
		};
		const statusBadge = {
			new: "taskStatus",
			accepted: "taskStatus",
			approved: "taskStatus",
			completed: "taskStatus",
			rejected: "taskStatus",
			canceled: "taskStatus"
		};
		function formatDate(dateStr) {
			if (!dateStr) return "—";
			return new Date(dateStr).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		const filteredTasks = computed(() => tasks.value);
		const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1);
		const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / limit.value)));
		const showingRange = computed(() => {
			const end = Math.min(offset.value + tasks.value.length, totalCount.value);
			return `Showing ${offset.value + 1}–${end} of ${totalCount.value} tasks`;
		});
		const selectedTask = ref(null);
		const showTaskModal = ref(false);
		const showAddModal = ref(false);
		const showRejectModal = ref(false);
		const showCompleteModal = ref(false);
		const isProcessing = ref(false);
		const rejectComment = ref("");
		const completeComment = ref("");
		const newComment = ref("");
		const editEtaMode = ref(false);
		const editableEta = ref("");
		const showImagePreview = ref(false);
		const previewImages = ref([]);
		const previewInitialIndex = ref(0);
		const showApproveModal = ref(false);
		const approveReassignTo = ref("");
		const approveNotes = ref("");
		const showReassignModal = ref(false);
		const reassignTo = ref("");
		const isOpenTask = computed(() => [
			"new",
			"accepted",
			"approved"
		].includes(selectedTask.value?.status || ""));
		const taskDetailTitle = computed(() => {
			if (!selectedTask.value) return t("tasks.task_details");
			const typeName = selectedTask.value.task_type_name || taskTypeMap.value[selectedTask.value.task_type] || selectedTask.value.task_type;
			return `Task #${selectedTask.value.task_id} — ${typeName}`;
		});
		const newTaskForm = ref({
			task_type: "",
			description: "",
			priority: "normal",
			assigned_to: "",
			address: "",
			media: []
		});
		const newTaskVideoFileIds = ref([]);
		const newTaskDocumentFileIds = ref([]);
		const addTaskError = ref("");
		const mediaUploadRef = ref(null);
		const videoUploadRef = ref(null);
		const documentUploadRef = ref(null);
		const completeImageFileIds = ref([]);
		const completeVideoFileIds = ref([]);
		const completeImageUploadRef = ref(null);
		const completeVideoUploadRef = ref(null);
		const authStore = useAuthStore();
		const toastStore = useToastStore();
		const officers = ref([]);
		const assignToSearch = ref("");
		const showAssignDropdown = ref(false);
		function onAssignSearchInput() {
			newTaskForm.value.assigned_to = "";
			showAssignDropdown.value = true;
		}
		function handleAssignBlur() {
			setTimeout(() => {
				showAssignDropdown.value = false;
			}, 150);
		}
		function selectAutoAssign() {
			newTaskForm.value.assigned_to = "";
			assignToSearch.value = "";
			showAssignDropdown.value = false;
		}
		function selectAssignee(officer) {
			newTaskForm.value.assigned_to = officer.user_id;
			assignToSearch.value = `${officer.first_name} ${officer.last_name}`;
			showAssignDropdown.value = false;
		}
		const filteredOfficers = computed(() => {
			if (!assignToSearch.value.trim()) return officers.value;
			const query = assignToSearch.value.toLowerCase();
			return officers.value.filter((o) => o.first_name.toLowerCase().includes(query) || o.last_name.toLowerCase().includes(query) || o.community_name && o.community_name.toLowerCase().includes(query));
		});
		const selectedOfficer = computed(() => officers.value.find((o) => o.user_id === newTaskForm.value.assigned_to));
		watch([
			selectedTaskType,
			selectedPriority,
			selectedStatus,
			dateFrom,
			dateTo,
			sortOrder,
			limit
		], () => {
			offset.value = 0;
			fetchTasks();
		});
		let searchDebounce = null;
		watch(searchQuery, () => {
			if (searchDebounce) clearTimeout(searchDebounce);
			searchDebounce = setTimeout(() => {
				offset.value = 0;
				fetchTasks();
			}, 300);
		});
		watch(offset, fetchTasks);
		async function fetchTaskDetail(taskId) {
			try {
				const res = await taskApi.getTask(taskId);
				if (res.rc === 0 && res.task) selectedTask.value = mapApiTask(res.task);
			} catch (err) {
				console.error("Failed to fetch task detail:", err);
			}
		}
		function closeTaskModal() {
			showTaskModal.value = false;
			selectedTask.value = null;
		}
		function canAccept(task) {
			return task.status === "new" && authStore.isAdmin;
		}
		function canReject(task) {
			return ["new", "accepted"].includes(task.status) && authStore.isAdmin;
		}
		function canComplete(task) {
			return ["accepted", "approved"].includes(task.status) && authStore.isAdmin;
		}
		function canCancel(task) {
			return [
				"new",
				"accepted",
				"approved"
			].includes(task.status) && authStore.isAdmin;
		}
		function canApprove(task) {
			console.log("canApprove debug user.type:", authStore.user?.type, "isApprover:", authStore.isApprover, "status:", task.status, "task_type:", task.task_type);
			return task.status === "accepted" && ["supply_request", "damaged_equipment"].includes(task.task_type) && authStore.isApprover;
		}
		function canReassign(task) {
			return [
				"new",
				"accepted",
				"approved"
			].includes(task.status) && authStore.isAdmin;
		}
		async function acceptTask(task) {
			if (!task.task_id) return;
			isProcessing.value = true;
			try {
				await taskApi.acceptTask(task.task_id);
				await fetchTaskDetail(task.task_id);
				await fetchTasks();
			} catch (err) {
				console.error("Accept task failed:", err);
			} finally {
				isProcessing.value = false;
			}
		}
		function openRejectModal(task) {
			closeTaskModal();
			selectedTask.value = { ...task };
			showRejectModal.value = true;
			rejectComment.value = "";
		}
		function closeRejectModal() {
			showRejectModal.value = false;
			rejectComment.value = "";
		}
		async function confirmReject() {
			if (!selectedTask.value || !rejectComment.value.trim()) return;
			isProcessing.value = true;
			try {
				await taskApi.rejectTask({
					task_id: selectedTask.value.task_id,
					comment: rejectComment.value.trim()
				});
				closeRejectModal();
				closeTaskModal();
				await fetchTasks();
			} catch (err) {
				console.error("Reject task failed:", err);
			} finally {
				isProcessing.value = false;
			}
		}
		function openCompleteModal(task) {
			closeTaskModal();
			selectedTask.value = { ...task };
			showCompleteModal.value = true;
			completeComment.value = "";
		}
		function closeCompleteModal() {
			showCompleteModal.value = false;
			completeComment.value = "";
		}
		async function confirmComplete() {
			if (!selectedTask.value) return;
			isProcessing.value = true;
			try {
				await completeImageUploadRef.value?.uploadAll();
				await completeVideoUploadRef.value?.uploadAll();
				await taskApi.completeTask({
					task_id: selectedTask.value.task_id,
					comment: completeComment.value.trim() || void 0,
					confirmation_media_file_ids: completeImageFileIds.value.length ? completeImageFileIds.value : void 0,
					confirmation_video_file_id: completeVideoFileIds.value[0] || void 0
				});
				closeCompleteModal();
				closeTaskModal();
				await fetchTasks();
				toastStore.success("Task completed");
			} catch (err) {
				console.error("Complete task failed:", err);
			} finally {
				isProcessing.value = false;
			}
		}
		async function addComment() {
			if (!selectedTask.value || !newComment.value.trim()) return;
			isProcessing.value = true;
			try {
				await taskApi.addTaskComment({
					task_id: selectedTask.value.task_id,
					comment: newComment.value.trim()
				});
				newComment.value = "";
				await fetchTaskDetail(selectedTask.value.task_id);
			} catch (err) {
				console.error("Add comment failed:", err);
			} finally {
				isProcessing.value = false;
			}
		}
		async function cancelTask() {
			if (!selectedTask.value) return;
			isProcessing.value = true;
			try {
				await taskApi.cancelTask(selectedTask.value.task_id);
				await fetchTaskDetail(selectedTask.value.task_id);
				await fetchTasks();
			} catch (err) {
				console.error("Cancel task failed:", err);
			} finally {
				isProcessing.value = false;
			}
		}
		function openApproveModal() {
			if (!selectedTask.value) return;
			approveReassignTo.value = "";
			approveNotes.value = "";
			showTaskModal.value = false;
			showApproveModal.value = true;
		}
		function closeApproveModal() {
			showApproveModal.value = false;
			approveReassignTo.value = "";
			approveNotes.value = "";
			showTaskModal.value = true;
		}
		async function confirmApprove() {
			if (!selectedTask.value) return;
			isProcessing.value = true;
			try {
				if (approveNotes.value.trim()) await taskApi.addTaskComment({
					task_id: selectedTask.value.task_id,
					comment: approveNotes.value.trim()
				});
				await taskApi.approveTask({
					task_id: selectedTask.value.task_id,
					assigned_to: approveReassignTo.value || void 0
				});
				await fetchTaskDetail(selectedTask.value.task_id);
				await fetchTasks();
				toastStore.success("Task approved");
				closeApproveModal();
			} catch (err) {
				console.error("Approve task failed:", err);
			} finally {
				isProcessing.value = false;
			}
		}
		function openReassignModal() {
			if (!selectedTask.value) return;
			reassignTo.value = "";
			showTaskModal.value = false;
			showReassignModal.value = true;
		}
		function closeReassignModal() {
			showReassignModal.value = false;
			reassignTo.value = "";
			showTaskModal.value = true;
		}
		async function confirmReassign() {
			if (!selectedTask.value || !reassignTo.value) return;
			isProcessing.value = true;
			try {
				await taskApi.reassignTask({
					task_id: selectedTask.value.task_id,
					assigned_to: reassignTo.value
				});
				await fetchTaskDetail(selectedTask.value.task_id);
				await fetchTasks();
				toastStore.success("Task reassigned");
				closeReassignModal();
			} catch (err) {
				console.error("Reassign failed:", err);
			} finally {
				isProcessing.value = false;
			}
		}
		function startEditEta() {
			if (!selectedTask.value) return;
			editEtaMode.value = true;
			editableEta.value = selectedTask.value.eta ? new Date(selectedTask.value.eta).toISOString().slice(0, 16) : "";
		}
		async function saveEta() {
			if (!selectedTask.value) return;
			try {
				await taskApi.updateTask({
					task_id: selectedTask.value.task_id,
					eta: editableEta.value ? new Date(editableEta.value).toISOString() : void 0
				});
				editEtaMode.value = false;
				await fetchTaskDetail(selectedTask.value.task_id);
			} catch (err) {
				console.error("Update ETA failed:", err);
			}
		}
		function isImageMedia(media) {
			return media.media_type === "image" && media.url;
		}
		function openImagePreview(media) {
			const images = (selectedTask.value?.media || []).filter(isImageMedia);
			const index = images.findIndex((m) => m.media_id === media.media_id);
			if (index >= 0) {
				previewImages.value = images.map((m) => m.url);
				previewInitialIndex.value = index;
				showImagePreview.value = true;
			}
		}
		function closeAddModal() {
			showAddModal.value = false;
		}
		async function handleAddTask() {
			if (!newTaskForm.value.description.trim() || !newTaskForm.value.task_type.trim()) return;
			isProcessing.value = true;
			addTaskError.value = "";
			try {
				await mediaUploadRef.value?.uploadAll();
				await videoUploadRef.value?.uploadAll();
				await documentUploadRef.value?.uploadAll();
				const taskId = (await taskApi.createTask({
					task_type: newTaskForm.value.task_type,
					description: newTaskForm.value.description,
					priority: newTaskForm.value.priority,
					assigned_to: newTaskForm.value.assigned_to || void 0,
					address: newTaskForm.value.address || void 0,
					media_file_ids: newTaskForm.value.media.length ? newTaskForm.value.media : void 0,
					video_file_id: newTaskVideoFileIds.value[0] || void 0,
					document_file_ids: newTaskDocumentFileIds.value.length ? newTaskDocumentFileIds.value : void 0
				})).task_id;
				toastStore.success(`Task created: TSK-${String(taskId).padStart(3, "0")}`);
				closeAddModal();
				await fetchTasks();
			} catch (err) {
				addTaskError.value = err.message || "Failed to create task";
				console.error("Create task failed:", err);
			} finally {
				isProcessing.value = false;
			}
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_Badge = Badge_default;
			const _component_AppModal = AppModal_default;
			const _component_AppDialogModal = AppDialogModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "tasks-management" }, _attrs))} data-v-152cba8c><div class="tasks-management__header" data-v-152cba8c><h2 class="tasks-management__title" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.title"))}</h2><button class="btn btn--primary" data-v-152cba8c>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:plus",
				size: 16
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("tasks.add_new"))}</button></div><div class="tasks-filters" data-v-152cba8c><div class="filter-row" data-v-152cba8c><div class="search-box" data-v-152cba8c>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", searchQuery.value)} type="text"${ssrRenderAttr("placeholder", unref(t)("tasks.search_placeholder"))} data-v-152cba8c></div><select class="filter-select" data-v-152cba8c><!--[-->`);
			ssrRenderList(taskTypes.value, (type) => {
				_push(`<option${ssrRenderAttr("value", type.value)} data-v-152cba8c${ssrIncludeBooleanAttr(Array.isArray(selectedTaskType.value) ? ssrLooseContain(selectedTaskType.value, type.value) : ssrLooseEqual(selectedTaskType.value, type.value)) ? " selected" : ""}>${ssrInterpolate(type.label)}</option>`);
			});
			_push(`<!--]--></select><select class="filter-select" data-v-152cba8c><!--[-->`);
			ssrRenderList(statusOptions, (s) => {
				_push(`<option${ssrRenderAttr("value", s.value)} data-v-152cba8c${ssrIncludeBooleanAttr(Array.isArray(selectedStatus.value) ? ssrLooseContain(selectedStatus.value, s.value) : ssrLooseEqual(selectedStatus.value, s.value)) ? " selected" : ""}>${ssrInterpolate(s.label)}</option>`);
			});
			_push(`<!--]--></select><select class="filter-select" data-v-152cba8c><!--[-->`);
			ssrRenderList(priorities.value, (p) => {
				_push(`<option${ssrRenderAttr("value", p.value)} data-v-152cba8c${ssrIncludeBooleanAttr(Array.isArray(selectedPriority.value) ? ssrLooseContain(selectedPriority.value, p.value) : ssrLooseEqual(selectedPriority.value, p.value)) ? " selected" : ""}>${ssrInterpolate(p.label)}</option>`);
			});
			_push(`<!--]--></select><div class="date-range" data-v-152cba8c><span class="date-label" data-v-152cba8c>From</span><input${ssrRenderAttr("value", dateFrom.value)} type="date" class="date-input" data-v-152cba8c><span class="date-separator" data-v-152cba8c>-</span><span class="date-label" data-v-152cba8c>To</span><input${ssrRenderAttr("value", dateTo.value)} type="date" class="date-input" data-v-152cba8c></div></div><div class="filter-actions" data-v-152cba8c><button class="btn btn--ghost" data-v-152cba8c>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:x",
				size: 14
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("tasks.clear_filters"))}</button><button class="btn btn--ghost" data-v-152cba8c>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: sortOrder.value === "desc" ? "lucide:arrow-down" : "lucide:arrow-up",
				size: 14
			}, null, _parent));
			_push(` ${ssrInterpolate(sortOrder.value === "desc" ? unref(t)("tasks.newest_first") : unref(t)("tasks.oldest_first"))}</button></div></div><div class="tasks-list-container" data-v-152cba8c><table class="tasks-table" data-v-152cba8c><thead data-v-152cba8c><tr data-v-152cba8c><th class="col-id" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.id"))}</th><th class="col-type" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.type"))}</th><th class="col-desc" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.description"))}</th><th class="col-priority" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.priority"))}</th><th class="col-status" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.status"))}</th><th class="col-assignee" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.assigned_to"))}</th><th class="col-community" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.community"))}</th><th class="col-date sortable" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.created"))} `);
			_push(ssrRenderComponent(_component_Icon, {
				name: sortOrder.value === "desc" ? "lucide:arrow-down" : "lucide:arrow-up",
				size: 12
			}, null, _parent));
			_push(`</th><th class="col-date" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.last_update"))}</th><th class="col-actions" data-v-152cba8c>${ssrInterpolate(unref(t)("common.actions"))}</th></tr></thead><tbody data-v-152cba8c><!--[-->`);
			ssrRenderList(filteredTasks.value, (task) => {
				_push(`<tr class="task-row" data-v-152cba8c><td class="col-id" data-v-152cba8c><span class="id-link" data-v-152cba8c>${ssrInterpolate(task.id)}</span></td><td class="col-type" data-v-152cba8c><span class="col-type__text" data-v-152cba8c>${ssrInterpolate(taskTypeMap.value[task.task_type] || task.task_type)}</span></td><td class="col-desc"${ssrRenderAttr("title", task.description)} data-v-152cba8c>${ssrInterpolate(task.description)}</td><td class="col-priority" data-v-152cba8c>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: priorityBadge[task.priority] ?? "taskPriority",
					value: task.priority
				}, null, _parent));
				_push(`</td><td class="col-status" data-v-152cba8c>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: statusBadge[task.status] ?? "taskStatus",
					value: task.status
				}, null, _parent));
				_push(`</td><td class="col-assignee" data-v-152cba8c>${ssrInterpolate(task.assigned_to_name || "Unassigned")}</td><td class="col-community" data-v-152cba8c>${ssrInterpolate(task.community_name || "—")}</td><td class="col-date" data-v-152cba8c>${ssrInterpolate(formatDate(task.created_at))}</td><td class="col-date" data-v-152cba8c>${ssrInterpolate(formatDate(task.last_update))}</td><td class="col-actions" data-v-152cba8c><div class="action-badges" data-v-152cba8c><div class="action-row" data-v-152cba8c><button class="action-badge action-badge--view" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.view"))}</button>`);
				if (canComplete(task)) _push(`<button class="action-badge action-badge--complete" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.complete"))}</button>`);
				else _push(`<!---->`);
				_push(`</div><div class="action-row" data-v-152cba8c>`);
				if (canAccept(task)) _push(`<button class="action-badge action-badge--accept" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.accept"))}</button>`);
				else _push(`<!---->`);
				if (canReject(task)) _push(`<button class="action-badge action-badge--reject" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.reject"))}</button>`);
				else _push(`<!---->`);
				_push(`</div></div></td></tr>`);
			});
			_push(`<!--]--></tbody></table>`);
			if (filteredTasks.value.length === 0) {
				_push(`<div class="no-tasks" data-v-152cba8c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:inbox",
					size: 48
				}, null, _parent));
				_push(`<p data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.no_tasks"))}</p><button class="btn btn--primary" data-v-152cba8c>${ssrInterpolate(unref(t)("tasks.add_new"))}</button></div>`);
			} else _push(`<!---->`);
			if (totalCount.value > 0) {
				_push(`<div class="pagination" data-v-152cba8c><div class="pagination__info" data-v-152cba8c>${ssrInterpolate(showingRange.value)}</div><div class="pagination__controls" data-v-152cba8c><button class="btn btn--ghost"${ssrIncludeBooleanAttr(offset.value === 0) ? " disabled" : ""} data-v-152cba8c>${ssrInterpolate(unref(t)("common.previous"))}</button><span class="pagination__page" data-v-152cba8c>${ssrInterpolate(currentPage.value)} / ${ssrInterpolate(totalPages.value)}</span><button class="btn btn--ghost"${ssrIncludeBooleanAttr(currentPage.value >= totalPages.value) ? " disabled" : ""} data-v-152cba8c>${ssrInterpolate(unref(t)("common.next"))}</button><select class="filter-select" data-v-152cba8c><!--[-->`);
				ssrRenderList(pageSizeOptions, (size) => {
					_push(`<option${ssrRenderAttr("value", size)} data-v-152cba8c${ssrIncludeBooleanAttr(Array.isArray(limit.value) ? ssrLooseContain(limit.value, size) : ssrLooseEqual(limit.value, size)) ? " selected" : ""}>${ssrInterpolate(size)}/page</option>`);
				});
				_push(`<!--]--></select></div></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
			if (selectedTask.value) _push(ssrRenderComponent(_component_AppModal, {
				show: showTaskModal.value,
				title: taskDetailTitle.value,
				"cancel-text": unref(t)("common.close"),
				"ok-text": "",
				onClose: closeTaskModal,
				onCancel: closeTaskModal
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="task-detail" data-v-152cba8c${_scopeId}><div class="task-detail__header" data-v-152cba8c${_scopeId}><h3 class="task-detail__title" data-v-152cba8c${_scopeId}>${ssrInterpolate(selectedTask.value.task_type_name || taskTypeMap.value[selectedTask.value.task_type] || selectedTask.value.task_type)}</h3><div class="task-detail__badges" data-v-152cba8c${_scopeId}>`);
						_push(ssrRenderComponent(_component_Badge, {
							type: statusBadge[selectedTask.value.status] ?? "taskStatus",
							value: selectedTask.value.status
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_Badge, {
							type: priorityBadge[selectedTask.value.priority] ?? "taskPriority",
							value: selectedTask.value.priority
						}, null, _parent, _scopeId));
						_push(`</div></div><div class="task-detail__meta" data-v-152cba8c${_scopeId}><div class="detail-row" data-v-152cba8c${_scopeId}><span class="detail-label" data-v-152cba8c${_scopeId}>Community:</span><span data-v-152cba8c${_scopeId}>${ssrInterpolate(selectedTask.value.community_name || "—")}</span></div><div class="detail-row" data-v-152cba8c${_scopeId}><span class="detail-label" data-v-152cba8c${_scopeId}>Created by:</span><span data-v-152cba8c${_scopeId}>${ssrInterpolate(selectedTask.value.created_by_name || selectedTask.value.created_by)} · ${ssrInterpolate(formatDate(selectedTask.value.created_at))}</span></div><div class="detail-row" data-v-152cba8c${_scopeId}><span class="detail-label" data-v-152cba8c${_scopeId}>Assigned to:</span><span data-v-152cba8c${_scopeId}>${ssrInterpolate(selectedTask.value.assigned_to_name || "Unassigned")}</span></div><div class="detail-row" data-v-152cba8c${_scopeId}><span class="detail-label" data-v-152cba8c${_scopeId}>ETA:</span>`);
						if (!editEtaMode.value) _push(`<span data-v-152cba8c${_scopeId}>${ssrInterpolate(selectedTask.value.eta ? formatDate(selectedTask.value.eta) : "Not set")}</span>`);
						else _push(`<!--[--><input${ssrRenderAttr("value", editableEta.value)} type="datetime-local" class="form-input" data-v-152cba8c${_scopeId}><button class="btn btn--sm btn--primary" data-v-152cba8c${_scopeId}>Save</button><button class="btn btn--sm btn--ghost" data-v-152cba8c${_scopeId}>Cancel</button><!--]-->`);
						if (unref(authStore).isAdmin && isOpenTask.value && !editEtaMode.value) _push(`<button class="btn btn--link" data-v-152cba8c${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						_push(`</div><div class="detail-row detail-row--block" data-v-152cba8c${_scopeId}><span class="detail-label" data-v-152cba8c${_scopeId}>Description:</span><p class="task-detail__description" data-v-152cba8c${_scopeId}>${ssrInterpolate(selectedTask.value.description)}</p></div></div><div class="task-detail__section" data-v-152cba8c${_scopeId}><h4 class="task-detail__section-title" data-v-152cba8c${_scopeId}>Comments</h4><!--[-->`);
						ssrRenderList(selectedTask.value.comments, (c) => {
							_push(`<div class="comment-bubble" data-v-152cba8c${_scopeId}><div class="comment-bubble__header" data-v-152cba8c${_scopeId}><span class="comment-bubble__user" data-v-152cba8c${_scopeId}>${ssrInterpolate(c.user)}</span><span class="comment-bubble__time" data-v-152cba8c${_scopeId}>${ssrInterpolate(formatDate(c.created_at))}</span></div><p class="comment-bubble__text" data-v-152cba8c${_scopeId}>${ssrInterpolate(c.text)}</p></div>`);
						});
						_push(`<!--]-->`);
						if (selectedTask.value.comments.length === 0) _push(`<div class="empty-section" data-v-152cba8c${_scopeId}>No comments yet.</div>`);
						else _push(`<!---->`);
						_push(`</div><div class="task-detail__comment-form" data-v-152cba8c${_scopeId}><textarea class="form-input" rows="2" placeholder="Add a comment..." data-v-152cba8c${_scopeId}>${ssrInterpolate(newComment.value)}</textarea><button class="btn btn--primary"${ssrIncludeBooleanAttr(isProcessing.value) ? " disabled" : ""} data-v-152cba8c${_scopeId}>Send</button></div>`);
						if (selectedTask.value.media && selectedTask.value.media.length > 0) {
							_push(`<div class="task-detail__section" data-v-152cba8c${_scopeId}><h4 class="task-detail__section-title" data-v-152cba8c${_scopeId}>Media</h4><div class="media-thumbnails" data-v-152cba8c${_scopeId}><!--[-->`);
							ssrRenderList(selectedTask.value.media, (m) => {
								_push(`<!--[-->`);
								if (isImageMedia(m)) {
									_push(`<div class="media-thumb media-thumb--image" data-v-152cba8c${_scopeId}>`);
									if (m.is_confirmation) _push(`<span class="media-confirmation" data-v-152cba8c${_scopeId}>Confirmation</span>`);
									else _push(`<!---->`);
									_push(`<img${ssrRenderAttr("src", m.url)} class="media-thumb__img" alt="Task image" data-v-152cba8c${_scopeId}></div>`);
								} else {
									_push(`<a class="media-thumb"${ssrRenderAttr("href", m.url)} target="_blank" data-v-152cba8c${_scopeId}>`);
									if (m.is_confirmation) _push(`<span class="media-confirmation" data-v-152cba8c${_scopeId}>Confirmation</span>`);
									else _push(`<!---->`);
									_push(`<span class="media-type" data-v-152cba8c${_scopeId}>${ssrInterpolate(m.media_type)}</span><span class="media-name" data-v-152cba8c${_scopeId}>#${ssrInterpolate(m.media_id)}</span></a>`);
								}
								_push(`<!--]-->`);
							});
							_push(`<!--]--></div></div>`);
						} else _push(`<!---->`);
						_push(`<div class="task-detail__actions" data-v-152cba8c${_scopeId}>`);
						if (canAccept(selectedTask.value)) {
							_push(`<button class="btn btn--success"${ssrIncludeBooleanAttr(isProcessing.value) ? " disabled" : ""} data-v-152cba8c${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:check",
								size: 16
							}, null, _parent, _scopeId));
							_push(` Accept </button>`);
						} else _push(`<!---->`);
						if (canApprove(selectedTask.value)) {
							_push(`<button class="btn btn--primary"${ssrIncludeBooleanAttr(isProcessing.value) ? " disabled" : ""} data-v-152cba8c${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:thumbs-up",
								size: 16
							}, null, _parent, _scopeId));
							_push(` Approve </button>`);
						} else _push(`<!---->`);
						if (canComplete(selectedTask.value)) {
							_push(`<button class="btn btn--primary"${ssrIncludeBooleanAttr(isProcessing.value) ? " disabled" : ""} data-v-152cba8c${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:check-circle",
								size: 16
							}, null, _parent, _scopeId));
							_push(` Complete </button>`);
						} else _push(`<!---->`);
						if (canReject(selectedTask.value)) {
							_push(`<button class="btn btn--danger"${ssrIncludeBooleanAttr(isProcessing.value) ? " disabled" : ""} data-v-152cba8c${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:x",
								size: 16
							}, null, _parent, _scopeId));
							_push(` Reject </button>`);
						} else _push(`<!---->`);
						if (canCancel(selectedTask.value)) {
							_push(`<button class="btn btn--ghost"${ssrIncludeBooleanAttr(isProcessing.value) ? " disabled" : ""} data-v-152cba8c${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:ban",
								size: 16
							}, null, _parent, _scopeId));
							_push(` Cancel </button>`);
						} else _push(`<!---->`);
						if (canReassign(selectedTask.value)) {
							_push(`<button class="btn btn--ghost"${ssrIncludeBooleanAttr(isProcessing.value) ? " disabled" : ""} data-v-152cba8c${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:users",
								size: 16
							}, null, _parent, _scopeId));
							_push(` Reassign </button>`);
						} else _push(`<!---->`);
						_push(`</div></div>`);
					} else return [createVNode("div", { class: "task-detail" }, [
						createVNode("div", { class: "task-detail__header" }, [createVNode("h3", { class: "task-detail__title" }, toDisplayString(selectedTask.value.task_type_name || taskTypeMap.value[selectedTask.value.task_type] || selectedTask.value.task_type), 1), createVNode("div", { class: "task-detail__badges" }, [createVNode(_component_Badge, {
							type: statusBadge[selectedTask.value.status] ?? "taskStatus",
							value: selectedTask.value.status
						}, null, 8, ["type", "value"]), createVNode(_component_Badge, {
							type: priorityBadge[selectedTask.value.priority] ?? "taskPriority",
							value: selectedTask.value.priority
						}, null, 8, ["type", "value"])])]),
						createVNode("div", { class: "task-detail__meta" }, [
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, "Community:"), createVNode("span", null, toDisplayString(selectedTask.value.community_name || "—"), 1)]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, "Created by:"), createVNode("span", null, toDisplayString(selectedTask.value.created_by_name || selectedTask.value.created_by) + " · " + toDisplayString(formatDate(selectedTask.value.created_at)), 1)]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, "Assigned to:"), createVNode("span", null, toDisplayString(selectedTask.value.assigned_to_name || "Unassigned"), 1)]),
							createVNode("div", { class: "detail-row" }, [
								createVNode("span", { class: "detail-label" }, "ETA:"),
								!editEtaMode.value ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(selectedTask.value.eta ? formatDate(selectedTask.value.eta) : "Not set"), 1)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
									withDirectives(createVNode("input", {
										"onUpdate:modelValue": ($event) => editableEta.value = $event,
										type: "datetime-local",
										class: "form-input"
									}, null, 8, ["onUpdate:modelValue"]), [[vModelText, editableEta.value]]),
									createVNode("button", {
										class: "btn btn--sm btn--primary",
										onClick: saveEta
									}, "Save"),
									createVNode("button", {
										class: "btn btn--sm btn--ghost",
										onClick: ($event) => editEtaMode.value = false
									}, "Cancel", 8, ["onClick"])
								], 64)),
								unref(authStore).isAdmin && isOpenTask.value && !editEtaMode.value ? (openBlock(), createBlock("button", {
									key: 2,
									class: "btn btn--link",
									onClick: startEditEta
								}, "Edit")) : createCommentVNode("", true)
							]),
							createVNode("div", { class: "detail-row detail-row--block" }, [createVNode("span", { class: "detail-label" }, "Description:"), createVNode("p", { class: "task-detail__description" }, toDisplayString(selectedTask.value.description), 1)])
						]),
						createVNode("div", { class: "task-detail__section" }, [
							createVNode("h4", { class: "task-detail__section-title" }, "Comments"),
							(openBlock(true), createBlock(Fragment, null, renderList(selectedTask.value.comments, (c) => {
								return openBlock(), createBlock("div", {
									key: c.id,
									class: "comment-bubble"
								}, [createVNode("div", { class: "comment-bubble__header" }, [createVNode("span", { class: "comment-bubble__user" }, toDisplayString(c.user), 1), createVNode("span", { class: "comment-bubble__time" }, toDisplayString(formatDate(c.created_at)), 1)]), createVNode("p", { class: "comment-bubble__text" }, toDisplayString(c.text), 1)]);
							}), 128)),
							selectedTask.value.comments.length === 0 ? (openBlock(), createBlock("div", {
								key: 0,
								class: "empty-section"
							}, "No comments yet.")) : createCommentVNode("", true)
						]),
						createVNode("div", { class: "task-detail__comment-form" }, [withDirectives(createVNode("textarea", {
							"onUpdate:modelValue": ($event) => newComment.value = $event,
							class: "form-input",
							rows: "2",
							placeholder: "Add a comment..."
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, newComment.value]]), createVNode("button", {
							class: "btn btn--primary",
							disabled: isProcessing.value,
							onClick: addComment
						}, "Send", 8, ["disabled"])]),
						selectedTask.value.media && selectedTask.value.media.length > 0 ? (openBlock(), createBlock("div", {
							key: 0,
							class: "task-detail__section"
						}, [createVNode("h4", { class: "task-detail__section-title" }, "Media"), createVNode("div", { class: "media-thumbnails" }, [(openBlock(true), createBlock(Fragment, null, renderList(selectedTask.value.media, (m) => {
							return openBlock(), createBlock(Fragment, { key: m.media_id }, [isImageMedia(m) ? (openBlock(), createBlock("div", {
								key: 0,
								class: "media-thumb media-thumb--image",
								onClick: ($event) => openImagePreview(m)
							}, [m.is_confirmation ? (openBlock(), createBlock("span", {
								key: 0,
								class: "media-confirmation"
							}, "Confirmation")) : createCommentVNode("", true), createVNode("img", {
								src: m.url,
								class: "media-thumb__img",
								alt: "Task image"
							}, null, 8, ["src"])], 8, ["onClick"])) : (openBlock(), createBlock("a", {
								key: 1,
								class: "media-thumb",
								href: m.url,
								target: "_blank"
							}, [
								m.is_confirmation ? (openBlock(), createBlock("span", {
									key: 0,
									class: "media-confirmation"
								}, "Confirmation")) : createCommentVNode("", true),
								createVNode("span", { class: "media-type" }, toDisplayString(m.media_type), 1),
								createVNode("span", { class: "media-name" }, "#" + toDisplayString(m.media_id), 1)
							], 8, ["href"]))], 64);
						}), 128))])])) : createCommentVNode("", true),
						createVNode("div", { class: "task-detail__actions" }, [
							canAccept(selectedTask.value) ? (openBlock(), createBlock("button", {
								key: 0,
								class: "btn btn--success",
								disabled: isProcessing.value,
								onClick: ($event) => acceptTask(selectedTask.value)
							}, [createVNode(_component_Icon, {
								name: "lucide:check",
								size: 16
							}), createTextVNode(" Accept ")], 8, ["disabled", "onClick"])) : createCommentVNode("", true),
							canApprove(selectedTask.value) ? (openBlock(), createBlock("button", {
								key: 1,
								class: "btn btn--primary",
								disabled: isProcessing.value,
								onClick: openApproveModal
							}, [createVNode(_component_Icon, {
								name: "lucide:thumbs-up",
								size: 16
							}), createTextVNode(" Approve ")], 8, ["disabled"])) : createCommentVNode("", true),
							canComplete(selectedTask.value) ? (openBlock(), createBlock("button", {
								key: 2,
								class: "btn btn--primary",
								disabled: isProcessing.value,
								onClick: ($event) => openCompleteModal(selectedTask.value)
							}, [createVNode(_component_Icon, {
								name: "lucide:check-circle",
								size: 16
							}), createTextVNode(" Complete ")], 8, ["disabled", "onClick"])) : createCommentVNode("", true),
							canReject(selectedTask.value) ? (openBlock(), createBlock("button", {
								key: 3,
								class: "btn btn--danger",
								disabled: isProcessing.value,
								onClick: ($event) => openRejectModal(selectedTask.value)
							}, [createVNode(_component_Icon, {
								name: "lucide:x",
								size: 16
							}), createTextVNode(" Reject ")], 8, ["disabled", "onClick"])) : createCommentVNode("", true),
							canCancel(selectedTask.value) ? (openBlock(), createBlock("button", {
								key: 4,
								class: "btn btn--ghost",
								disabled: isProcessing.value,
								onClick: cancelTask
							}, [createVNode(_component_Icon, {
								name: "lucide:ban",
								size: 16
							}), createTextVNode(" Cancel ")], 8, ["disabled"])) : createCommentVNode("", true),
							canReassign(selectedTask.value) ? (openBlock(), createBlock("button", {
								key: 5,
								class: "btn btn--ghost",
								disabled: isProcessing.value,
								onClick: openReassignModal
							}, [createVNode(_component_Icon, {
								name: "lucide:users",
								size: 16
							}), createTextVNode(" Reassign ")], 8, ["disabled"])) : createCommentVNode("", true)
						])
					])];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
			_push(ssrRenderComponent(_component_AppModal, {
				show: showRejectModal.value,
				title: unref(t)("tasks.reject_task"),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(t)("tasks.confirm_reject"),
				"ok-disabled": !rejectComment.value.trim() || isProcessing.value,
				onClose: closeRejectModal,
				onCancel: closeRejectModal,
				onOk: confirmReject
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>Rejection Reason <span class="required" data-v-152cba8c${_scopeId}>*</span></label><textarea class="form-textarea" rows="4"${ssrRenderAttr("placeholder", unref(t)("tasks.reject_placeholder"))} data-v-152cba8c${_scopeId}>${ssrInterpolate(rejectComment.value)}</textarea></div>`);
					else return [createVNode("div", { class: "form-group" }, [createVNode("label", null, [createTextVNode("Rejection Reason "), createVNode("span", { class: "required" }, "*")]), withDirectives(createVNode("textarea", {
						"onUpdate:modelValue": ($event) => rejectComment.value = $event,
						class: "form-textarea",
						rows: "4",
						placeholder: unref(t)("tasks.reject_placeholder")
					}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, rejectComment.value]])])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: showCompleteModal.value,
				title: unref(t)("tasks.complete_task"),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(t)("tasks.confirm_complete"),
				"ok-disabled": isProcessing.value,
				onClose: closeCompleteModal,
				onCancel: closeCompleteModal,
				onOk: confirmComplete
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="complete-form" data-v-152cba8c${_scopeId}><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>Resolution Comment</label><textarea class="form-textarea" rows="4"${ssrRenderAttr("placeholder", unref(t)("tasks.complete_placeholder"))} data-v-152cba8c${_scopeId}>${ssrInterpolate(completeComment.value)}</textarea></div><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>Confirmation Images</label>`);
						_push(ssrRenderComponent(FileUpload_default, {
							ref_key: "completeImageUploadRef",
							ref: completeImageUploadRef,
							modelValue: completeImageFileIds.value,
							"onUpdate:modelValue": ($event) => completeImageFileIds.value = $event,
							callApi: true,
							accept: "image/*",
							maxFiles: 5,
							hint: "Max 5 images"
						}, null, _parent, _scopeId));
						_push(`</div><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>Confirmation Video</label>`);
						_push(ssrRenderComponent(FileUpload_default, {
							ref_key: "completeVideoUploadRef",
							ref: completeVideoUploadRef,
							modelValue: completeVideoFileIds.value,
							"onUpdate:modelValue": ($event) => completeVideoFileIds.value = $event,
							callApi: true,
							accept: "video/*",
							maxFiles: 1,
							hint: "Max 1 video"
						}, null, _parent, _scopeId));
						_push(`</div></div>`);
					} else return [createVNode("div", { class: "complete-form" }, [
						createVNode("div", { class: "form-group" }, [createVNode("label", null, "Resolution Comment"), withDirectives(createVNode("textarea", {
							"onUpdate:modelValue": ($event) => completeComment.value = $event,
							class: "form-textarea",
							rows: "4",
							placeholder: unref(t)("tasks.complete_placeholder")
						}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, completeComment.value]])]),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, "Confirmation Images"), createVNode(FileUpload_default, {
							ref_key: "completeImageUploadRef",
							ref: completeImageUploadRef,
							modelValue: completeImageFileIds.value,
							"onUpdate:modelValue": ($event) => completeImageFileIds.value = $event,
							callApi: true,
							accept: "image/*",
							maxFiles: 5,
							hint: "Max 5 images"
						}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, "Confirmation Video"), createVNode(FileUpload_default, {
							ref_key: "completeVideoUploadRef",
							ref: completeVideoUploadRef,
							modelValue: completeVideoFileIds.value,
							"onUpdate:modelValue": ($event) => completeVideoFileIds.value = $event,
							callApi: true,
							accept: "video/*",
							maxFiles: 1,
							hint: "Max 1 video"
						}, null, 8, ["modelValue", "onUpdate:modelValue"])])
					])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: showApproveModal.value,
				title: "Approve task",
				"cancel-text": "Cancel",
				"ok-text": "Confirm approval",
				"ok-disabled": isProcessing.value,
				onClose: closeApproveModal,
				onCancel: closeApproveModal,
				onOk: confirmApprove
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="approve-form" data-v-152cba8c${_scopeId}><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>Reassign To</label><select class="form-input" data-v-152cba8c${_scopeId}><option value="" data-v-152cba8c${ssrIncludeBooleanAttr(Array.isArray(approveReassignTo.value) ? ssrLooseContain(approveReassignTo.value, "") : ssrLooseEqual(approveReassignTo.value, "")) ? " selected" : ""}${_scopeId}>Keep current assignee</option><!--[-->`);
						ssrRenderList(officers.value, (o) => {
							_push(`<option${ssrRenderAttr("value", o.user_id)} data-v-152cba8c${ssrIncludeBooleanAttr(Array.isArray(approveReassignTo.value) ? ssrLooseContain(approveReassignTo.value, o.user_id) : ssrLooseEqual(approveReassignTo.value, o.user_id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(o.first_name)} ${ssrInterpolate(o.last_name)} — ${ssrInterpolate(o.community_name || "—")}</option>`);
						});
						_push(`<!--]--></select></div><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>Approval Notes</label><textarea class="form-textarea" rows="4" placeholder="Add approval notes (optional)" data-v-152cba8c${_scopeId}>${ssrInterpolate(approveNotes.value)}</textarea></div></div>`);
					} else return [createVNode("div", { class: "approve-form" }, [createVNode("div", { class: "form-group" }, [createVNode("label", null, "Reassign To"), withDirectives(createVNode("select", {
						"onUpdate:modelValue": ($event) => approveReassignTo.value = $event,
						class: "form-input"
					}, [createVNode("option", { value: "" }, "Keep current assignee"), (openBlock(true), createBlock(Fragment, null, renderList(officers.value, (o) => {
						return openBlock(), createBlock("option", {
							key: o.user_id,
							value: o.user_id
						}, toDisplayString(o.first_name) + " " + toDisplayString(o.last_name) + " — " + toDisplayString(o.community_name || "—"), 9, ["value"]);
					}), 128))], 8, ["onUpdate:modelValue"]), [[vModelSelect, approveReassignTo.value]])]), createVNode("div", { class: "form-group" }, [createVNode("label", null, "Approval Notes"), withDirectives(createVNode("textarea", {
						"onUpdate:modelValue": ($event) => approveNotes.value = $event,
						class: "form-textarea",
						rows: "4",
						placeholder: "Add approval notes (optional)"
					}, null, 8, ["onUpdate:modelValue"]), [[vModelText, approveNotes.value]])])])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: showReassignModal.value,
				title: "Reassign task",
				"cancel-text": "Cancel",
				"ok-text": "Confirm reassign",
				"ok-disabled": !reassignTo.value || isProcessing.value,
				onClose: closeReassignModal,
				onCancel: closeReassignModal,
				onOk: confirmReassign
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="reassign-form" data-v-152cba8c${_scopeId}><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>New Assignee <span class="required" data-v-152cba8c${_scopeId}>*</span></label><select class="form-input" data-v-152cba8c${_scopeId}><option value="" disabled data-v-152cba8c${ssrIncludeBooleanAttr(Array.isArray(reassignTo.value) ? ssrLooseContain(reassignTo.value, "") : ssrLooseEqual(reassignTo.value, "")) ? " selected" : ""}${_scopeId}>Select an officer</option><!--[-->`);
						ssrRenderList(officers.value, (o) => {
							_push(`<option${ssrRenderAttr("value", o.user_id)} data-v-152cba8c${ssrIncludeBooleanAttr(Array.isArray(reassignTo.value) ? ssrLooseContain(reassignTo.value, o.user_id) : ssrLooseEqual(reassignTo.value, o.user_id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(o.first_name)} ${ssrInterpolate(o.last_name)} — ${ssrInterpolate(o.community_name || "—")}</option>`);
						});
						_push(`<!--]--></select></div></div>`);
					} else return [createVNode("div", { class: "reassign-form" }, [createVNode("div", { class: "form-group" }, [createVNode("label", null, [createTextVNode("New Assignee "), createVNode("span", { class: "required" }, "*")]), withDirectives(createVNode("select", {
						"onUpdate:modelValue": ($event) => reassignTo.value = $event,
						class: "form-input"
					}, [createVNode("option", {
						value: "",
						disabled: ""
					}, "Select an officer"), (openBlock(true), createBlock(Fragment, null, renderList(officers.value, (o) => {
						return openBlock(), createBlock("option", {
							key: o.user_id,
							value: o.user_id
						}, toDisplayString(o.first_name) + " " + toDisplayString(o.last_name) + " — " + toDisplayString(o.community_name || "—"), 9, ["value"]);
					}), 128))], 8, ["onUpdate:modelValue"]), [[vModelSelect, reassignTo.value]])])])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: showAddModal.value,
				title: unref(t)("tasks.add_new_task"),
				onClose: closeAddModal
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="btn btn--ghost" data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn btn--primary"${ssrIncludeBooleanAttr(isProcessing.value) ? " disabled" : ""} data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("tasks.create_task"))}</button>`);
					else return [createVNode("button", {
						class: "btn btn--ghost",
						onClick: closeAddModal
					}, toDisplayString(unref(t)("common.cancel")), 1), createVNode("button", {
						class: "btn btn--primary",
						disabled: isProcessing.value,
						onClick: handleAddTask
					}, toDisplayString(unref(t)("tasks.create_task")), 9, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="add-task-form" data-v-152cba8c${_scopeId}><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("tasks.task_type"))} <span class="required" data-v-152cba8c${_scopeId}>*</span></label><select class="form-input"${ssrIncludeBooleanAttr(taskMetadataLoading.value) ? " disabled" : ""} data-v-152cba8c${_scopeId}><!--[-->`);
						ssrRenderList(availableTaskTypes.value, (type) => {
							_push(`<option${ssrRenderAttr("value", type.value)} data-v-152cba8c${ssrIncludeBooleanAttr(Array.isArray(newTaskForm.value.task_type) ? ssrLooseContain(newTaskForm.value.task_type, type.value) : ssrLooseEqual(newTaskForm.value.task_type, type.value)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(type.label)}</option>`);
						});
						_push(`<!--]--></select></div><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("tasks.description"))} <span class="required" data-v-152cba8c${_scopeId}>*</span></label><textarea class="form-input" rows="3" maxlength="500" data-v-152cba8c${_scopeId}>${ssrInterpolate(newTaskForm.value.description)}</textarea><p class="field-hint" style="${ssrRenderStyle({
							"font-size": "var(--font-size-xs)",
							"color": "var(--color-text-muted)",
							"text-align": "right",
							"margin-top": "var(--space-1)"
						})}" data-v-152cba8c${_scopeId}>${ssrInterpolate(newTaskForm.value.description.length)}/500</p></div><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("tasks.priority"))}</label><select class="form-input"${ssrIncludeBooleanAttr(taskMetadataLoading.value) ? " disabled" : ""} data-v-152cba8c${_scopeId}><!--[-->`);
						ssrRenderList(availablePriorities.value, (p) => {
							_push(`<option${ssrRenderAttr("value", p.value)} data-v-152cba8c${ssrIncludeBooleanAttr(Array.isArray(newTaskForm.value.priority) ? ssrLooseContain(newTaskForm.value.priority, p.value) : ssrLooseEqual(newTaskForm.value.priority, p.value)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(p.label)}</option>`);
						});
						_push(`<!--]--></select></div><div class="form-group assign-to-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("tasks.assigned_to"))}</label><div class="assign-to-input" data-v-152cba8c${_scopeId}><input${ssrRenderAttr("value", assignToSearch.value)} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("tasks.assigned_to_placeholder"))} data-v-152cba8c${_scopeId}>`);
						if (showAssignDropdown.value) {
							_push(`<div class="assign-to-dropdown" data-v-152cba8c${_scopeId}><div class="${ssrRenderClass([{ "is-selected": !newTaskForm.value.assigned_to }, "assign-to-option"])}" data-v-152cba8c${_scopeId}> Auto-assign (default manager) </div><!--[-->`);
							ssrRenderList(filteredOfficers.value, (o) => {
								_push(`<div class="${ssrRenderClass([{ "is-selected": newTaskForm.value.assigned_to === o.user_id }, "assign-to-option"])}" data-v-152cba8c${_scopeId}>${ssrInterpolate(o.first_name)} ${ssrInterpolate(o.last_name)} — ${ssrInterpolate(o.community_name || "—")}</div>`);
							});
							_push(`<!--]-->`);
							if (filteredOfficers.value.length === 0) _push(`<div class="assign-to-option no-results" data-v-152cba8c${_scopeId}> No users found </div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						_push(`</div></div>`);
						if (unref(authStore).isAdmin) _push(`<div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("tasks.community"))}</label><input${ssrRenderAttr("value", selectedOfficer.value?.community_name || "—")} type="text" class="form-input" disabled data-v-152cba8c${_scopeId}></div>`);
						else _push(`<!---->`);
						_push(`<div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("tasks.address"))}</label><input${ssrRenderAttr("value", newTaskForm.value.address)} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("tasks.address_placeholder"))} maxlength="500" data-v-152cba8c${_scopeId}></div><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("tasks.media"))}</label>`);
						_push(ssrRenderComponent(FileUpload_default, {
							ref_key: "mediaUploadRef",
							ref: mediaUploadRef,
							modelValue: newTaskForm.value.media,
							"onUpdate:modelValue": ($event) => newTaskForm.value.media = $event,
							callApi: true,
							accept: "image/*",
							maxFiles: 5,
							maxSizeMb: 5,
							label: unref(t)("tasks.add_image")
						}, null, _parent, _scopeId));
						_push(`</div><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("tasks.video"))}</label>`);
						_push(ssrRenderComponent(FileUpload_default, {
							ref_key: "videoUploadRef",
							ref: videoUploadRef,
							modelValue: newTaskVideoFileIds.value,
							"onUpdate:modelValue": ($event) => newTaskVideoFileIds.value = $event,
							callApi: true,
							accept: "video/*",
							maxFiles: 1,
							maxSizeMb: 20,
							label: unref(t)("tasks.add_video")
						}, null, _parent, _scopeId));
						_push(`</div><div class="form-group" data-v-152cba8c${_scopeId}><label data-v-152cba8c${_scopeId}>${ssrInterpolate(unref(t)("tasks.documents"))}</label>`);
						_push(ssrRenderComponent(FileUpload_default, {
							ref_key: "documentUploadRef",
							ref: documentUploadRef,
							modelValue: newTaskDocumentFileIds.value,
							"onUpdate:modelValue": ($event) => newTaskDocumentFileIds.value = $event,
							callApi: true,
							accept: ".pdf,.xlsx,.csv,.txt,.png,.jpg,.jpeg",
							maxFiles: 5,
							maxSizeMb: 10,
							label: unref(t)("tasks.add_document")
						}, null, _parent, _scopeId));
						_push(`</div>`);
						if (addTaskError.value) _push(`<div class="form-group" data-v-152cba8c${_scopeId}><p class="form-error" data-v-152cba8c${_scopeId}>${ssrInterpolate(addTaskError.value)}</p></div>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "add-task-form" }, [
						createVNode("div", { class: "form-group" }, [createVNode("label", null, [createTextVNode(toDisplayString(unref(t)("tasks.task_type")) + " ", 1), createVNode("span", { class: "required" }, "*")]), withDirectives(createVNode("select", {
							"onUpdate:modelValue": ($event) => newTaskForm.value.task_type = $event,
							class: "form-input",
							disabled: taskMetadataLoading.value
						}, [(openBlock(true), createBlock(Fragment, null, renderList(availableTaskTypes.value, (type) => {
							return openBlock(), createBlock("option", {
								key: type.value,
								value: type.value
							}, toDisplayString(type.label), 9, ["value"]);
						}), 128))], 8, ["onUpdate:modelValue", "disabled"]), [[vModelSelect, newTaskForm.value.task_type]])]),
						createVNode("div", { class: "form-group" }, [
							createVNode("label", null, [createTextVNode(toDisplayString(unref(t)("tasks.description")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => newTaskForm.value.description = $event,
								class: "form-input",
								rows: "3",
								maxlength: "500"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, newTaskForm.value.description]]),
							createVNode("p", {
								class: "field-hint",
								style: {
									"font-size": "var(--font-size-xs)",
									"color": "var(--color-text-muted)",
									"text-align": "right",
									"margin-top": "var(--space-1)"
								}
							}, toDisplayString(newTaskForm.value.description.length) + "/500", 1)
						]),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, toDisplayString(unref(t)("tasks.priority")), 1), withDirectives(createVNode("select", {
							"onUpdate:modelValue": ($event) => newTaskForm.value.priority = $event,
							class: "form-input",
							disabled: taskMetadataLoading.value
						}, [(openBlock(true), createBlock(Fragment, null, renderList(availablePriorities.value, (p) => {
							return openBlock(), createBlock("option", {
								key: p.value,
								value: p.value
							}, toDisplayString(p.label), 9, ["value"]);
						}), 128))], 8, ["onUpdate:modelValue", "disabled"]), [[vModelSelect, newTaskForm.value.priority]])]),
						createVNode("div", { class: "form-group assign-to-group" }, [createVNode("label", null, toDisplayString(unref(t)("tasks.assigned_to")), 1), createVNode("div", { class: "assign-to-input" }, [withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => assignToSearch.value = $event,
							type: "text",
							class: "form-input",
							placeholder: unref(t)("tasks.assigned_to_placeholder"),
							onInput: onAssignSearchInput,
							onFocus: ($event) => showAssignDropdown.value = true,
							onBlur: handleAssignBlur
						}, null, 40, [
							"onUpdate:modelValue",
							"placeholder",
							"onFocus"
						]), [[vModelText, assignToSearch.value]]), showAssignDropdown.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "assign-to-dropdown"
						}, [
							createVNode("div", {
								class: ["assign-to-option", { "is-selected": !newTaskForm.value.assigned_to }],
								onMousedown: withModifiers(() => {}, ["prevent"]),
								onClick: selectAutoAssign
							}, " Auto-assign (default manager) ", 42, ["onMousedown"]),
							(openBlock(true), createBlock(Fragment, null, renderList(filteredOfficers.value, (o) => {
								return openBlock(), createBlock("div", {
									key: o.user_id,
									class: ["assign-to-option", { "is-selected": newTaskForm.value.assigned_to === o.user_id }],
									onMousedown: withModifiers(() => {}, ["prevent"]),
									onClick: ($event) => selectAssignee(o)
								}, toDisplayString(o.first_name) + " " + toDisplayString(o.last_name) + " — " + toDisplayString(o.community_name || "—"), 43, ["onMousedown", "onClick"]);
							}), 128)),
							filteredOfficers.value.length === 0 ? (openBlock(), createBlock("div", {
								key: 0,
								class: "assign-to-option no-results"
							}, " No users found ")) : createCommentVNode("", true)
						])) : createCommentVNode("", true)])]),
						unref(authStore).isAdmin ? (openBlock(), createBlock("div", {
							key: 0,
							class: "form-group"
						}, [createVNode("label", null, toDisplayString(unref(t)("tasks.community")), 1), createVNode("input", {
							value: selectedOfficer.value?.community_name || "—",
							type: "text",
							class: "form-input",
							disabled: ""
						}, null, 8, ["value"])])) : createCommentVNode("", true),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, toDisplayString(unref(t)("tasks.address")), 1), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => newTaskForm.value.address = $event,
							type: "text",
							class: "form-input",
							placeholder: unref(t)("tasks.address_placeholder"),
							maxlength: "500"
						}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, newTaskForm.value.address]])]),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, toDisplayString(unref(t)("tasks.media")), 1), createVNode(FileUpload_default, {
							ref_key: "mediaUploadRef",
							ref: mediaUploadRef,
							modelValue: newTaskForm.value.media,
							"onUpdate:modelValue": ($event) => newTaskForm.value.media = $event,
							callApi: true,
							accept: "image/*",
							maxFiles: 5,
							maxSizeMb: 5,
							label: unref(t)("tasks.add_image")
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"label"
						])]),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, toDisplayString(unref(t)("tasks.video")), 1), createVNode(FileUpload_default, {
							ref_key: "videoUploadRef",
							ref: videoUploadRef,
							modelValue: newTaskVideoFileIds.value,
							"onUpdate:modelValue": ($event) => newTaskVideoFileIds.value = $event,
							callApi: true,
							accept: "video/*",
							maxFiles: 1,
							maxSizeMb: 20,
							label: unref(t)("tasks.add_video")
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"label"
						])]),
						createVNode("div", { class: "form-group" }, [createVNode("label", null, toDisplayString(unref(t)("tasks.documents")), 1), createVNode(FileUpload_default, {
							ref_key: "documentUploadRef",
							ref: documentUploadRef,
							modelValue: newTaskDocumentFileIds.value,
							"onUpdate:modelValue": ($event) => newTaskDocumentFileIds.value = $event,
							callApi: true,
							accept: ".pdf,.xlsx,.csv,.txt,.png,.jpg,.jpeg",
							maxFiles: 5,
							maxSizeMb: 10,
							label: unref(t)("tasks.add_document")
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"label"
						])]),
						addTaskError.value ? (openBlock(), createBlock("div", {
							key: 1,
							class: "form-group"
						}, [createVNode("p", { class: "form-error" }, toDisplayString(addTaskError.value), 1)])) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(MImagePreview_default, {
				show: showImagePreview.value,
				images: previewImages.value,
				"initial-index": previewInitialIndex.value,
				alt: "Task media",
				onClose: ($event) => showImagePreview.value = false
			}, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/tasks/TasksManagement.vue
var _sfc_setup$1 = TasksManagement_vue_vue_type_script_setup_true_lang_default.setup;
TasksManagement_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/tasks/TasksManagement.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var TasksManagement_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(TasksManagement_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-152cba8c"]]), { __name: "TasksManagement" });
//#endregion
//#region app/pages/tasks.vue?vue&type=script&setup=true&lang.ts
var tasks_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "tasks",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_TasksManagement = TasksManagement_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: "Tasks",
				breadcrumb: [{ label: "Operate" }, { label: "Tasks" }],
				"search-placeholder": "Search tasks...",
				showSearch: false
			}, null, _parent));
			_push(`<div class="tasks-page" data-v-d63b1ae6>`);
			_push(ssrRenderComponent(_component_TasksManagement, null, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/tasks.vue
var _sfc_setup = tasks_vue_vue_type_script_setup_true_lang_default.setup;
tasks_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tasks.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var tasks_default = /*#__PURE__*/ _plugin_vue_export_helper_default(tasks_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-d63b1ae6"]]);

export { tasks_default as default };
//# sourceMappingURL=tasks-CDPmnApS.mjs.map
