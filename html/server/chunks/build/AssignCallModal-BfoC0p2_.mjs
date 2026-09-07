import { t as components_default } from './components-DWHbB934.mjs';
import { B as BaseApiClient, a as useTranslation, e as useAuthStore } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { F as FileUpload_default, M as MImagePreview_default } from './FileUpload-B-39JGGf.mjs';
import { G as GoogleMap_default } from './GoogleMap-BcuRRAta.mjs';
import { o as officerApi } from './officer-CPsAbV7J.mjs';
import { defineComponent, ref, computed, watch, unref, withCtx, openBlock, createBlock, createVNode, toDisplayString, Fragment, createCommentVNode, renderList, isRef, createTextVNode, withDirectives, vModelText, mergeProps, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderClass, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';

//#region app/api/call.ts
var CallApi = class extends BaseApiClient {
	/**
	* Get a paginated, role-filtered list of calls.
	* Admins can filter by status, category, community, open/closed, and search text.
	*/
	async getCalls(params = {}, options) {
		return this.request({
			"#request": "Call/get_calls",
			...params
		}, options);
	}
	/**
	* Get full details of a single call including media and comments.
	*/
	async getCall(callId, options) {
		return this.request({
			"#request": "Call/get_call",
			call_id: callId
		}, options);
	}
	/**
	* Resolve a call. Admins can resolve any accepted call, including panic calls.
	*/
	async resolveCall(params, options) {
		return this.request({
			"#request": "Call/resolve_call",
			...params
		}, options);
	}
	/**
	* Admin assigns an officer to a call. The call status changes from new to accepted.
	*/
	async assignCall(params, options) {
		return this.request({
			"#request": "Call/assign_call",
			...params
		}, options);
	}
	/**
	* Cancel a concierge service call. Admins can cancel any concierge call
	* that is in new or accepted status.
	*/
	async cancelCall(callId, options) {
		return this.request({
			"#request": "Call/cancel_call",
			call_id: callId
		}, options);
	}
	/**
	* Soft-delete a test call. Admin only.
	*/
	async deleteTestCall(callId, options) {
		return this.request({
			"#request": "Call/delete_test_call",
			call_id: callId
		}, options);
	}
};
var callApi = new CallApi();
//#endregion
//#region app/components/calls/CallDetailsModal.vue?vue&type=script&setup=true&lang.ts
var CallDetailsModal_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "CallDetailsModal",
	__ssrInlineRender: true,
	props: {
		show: { type: Boolean },
		call: {}
	},
	emits: [
		"close",
		"resolved",
		"canceled",
		"deleted"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		function formatDateTime(iso) {
			if (!iso) return "—";
			return new Date(iso).toLocaleString(void 0, {
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		const { t } = useTranslation();
		const loading = ref(false);
		const error = ref("");
		const fetchedCall = ref(null);
		const call = computed(() => fetchedCall.value ?? props.call);
		const showImagePreview = ref(false);
		const previewImages = ref([]);
		const previewInitialIndex = ref(0);
		function openImagePreview(images, index) {
			previewImages.value = images;
			previewInitialIndex.value = index;
			showImagePreview.value = true;
		}
		function closeImagePreview() {
			showImagePreview.value = false;
		}
		const resolving = ref(false);
		const canceling = ref(false);
		const deletingTest = ref(false);
		const showResolveModal = ref(false);
		const showCancelModal = ref(false);
		const showDeleteTestModal = ref(false);
		const cancelError = ref("");
		const deleteTestError = ref("");
		const resolveComments = ref("");
		const resolvePhotoIds = ref([]);
		const resolveVideoIds = ref([]);
		const resolveError = ref("");
		const photoUploadRef = ref(null);
		const videoUploadRef = ref(null);
		const authStore = useAuthStore();
		const canResolve = computed(() => call.value?.status === "accepted" && (call.value?.category.type !== "panic" || authStore.isAdmin));
		const canCancel = computed(() => (call.value?.status === "new" || call.value?.status === "accepted") && call.value?.category.type === "concierge");
		const canDeleteTest = computed(() => call.value?.category.type === "test" && authStore.isAdmin);
		const okDisabled = computed(() => resolving.value || canceling.value || deletingTest.value);
		const okText = computed(() => canDeleteTest.value ? "Delete Test Call" : canResolve.value ? "Resolve Call" : "");
		const cancelText = computed(() => canCancel.value ? "Cancel Call" : "");
		function handleOk() {
			if (canDeleteTest.value) openDeleteTestModal();
			else if (canResolve.value) openResolveModal();
		}
		function openResolveModal() {
			if (!canResolve.value) return;
			resolveComments.value = "";
			resolvePhotoIds.value = [];
			resolveVideoIds.value = [];
			resolveError.value = "";
			showResolveModal.value = true;
		}
		function openDeleteTestModal() {
			if (!canDeleteTest.value) return;
			deleteTestError.value = "";
			showDeleteTestModal.value = true;
		}
		function closeDeleteTestModal() {
			showDeleteTestModal.value = false;
		}
		async function confirmDeleteTest() {
			if (!call.value) return;
			deletingTest.value = true;
			deleteTestError.value = "";
			try {
				await callApi.deleteTestCall(Number(call.value.id));
				showDeleteTestModal.value = false;
				emit("deleted");
			} catch (err) {
				deleteTestError.value = err.message || "Delete test call failed";
				console.error("Delete test call failed:", err);
			} finally {
				deletingTest.value = false;
			}
		}
		function closeResolveModal() {
			showResolveModal.value = false;
		}
		async function submitResolve() {
			if (!call.value) return;
			resolving.value = true;
			resolveError.value = "";
			try {
				const photoIds = photoUploadRef.value ? await photoUploadRef.value.uploadAll() : [];
				const videoIds = videoUploadRef.value ? await videoUploadRef.value.uploadAll() : [];
				await callApi.resolveCall({
					call_id: Number(call.value.id),
					officer_comments: resolveComments.value || void 0,
					confirmation_media_file_ids: photoIds.length ? photoIds : void 0,
					confirmation_video_file_id: videoIds[0] || void 0
				});
				resolveComments.value = "";
				resolvePhotoIds.value = [];
				resolveVideoIds.value = [];
				showResolveModal.value = false;
				emit("resolved");
			} catch (err) {
				resolveError.value = err.message || "Resolve call failed";
				console.error("Resolve call failed:", err);
			} finally {
				resolving.value = false;
			}
		}
		function openCancelModal() {
			if (!canCancel.value) return;
			cancelError.value = "";
			showCancelModal.value = true;
		}
		function closeCancelModal() {
			showCancelModal.value = false;
		}
		async function confirmCancel() {
			if (!call.value) return;
			canceling.value = true;
			cancelError.value = "";
			try {
				await callApi.cancelCall(Number(call.value.id));
				showCancelModal.value = false;
				emit("canceled");
			} catch (err) {
				cancelError.value = err.message || "Cancel call failed";
				console.error("Cancel call failed:", err);
			} finally {
				canceling.value = false;
			}
		}
		function getCategoryInfo(category) {
			return {
				medical_emergency: {
					type: "medical",
					label: "Medical Emergency",
					icon: "lucide:heart-pulse",
					color: "#ef4444"
				},
				security_emergency: {
					type: "security",
					label: "Security Emergency",
					icon: "lucide:shield-alert",
					color: "#f97316"
				},
				panic: {
					type: "panic",
					label: "Panic Button",
					icon: "lucide:siren",
					color: "#ef4444"
				},
				concierge_service: {
					type: "concierge",
					label: "Concierge Service",
					icon: "lucide:bell-concierge",
					color: "#3b82f6"
				},
				test: {
					type: "test",
					label: "Test Call",
					icon: "lucide:test-tube",
					color: "#8b5cf6"
				}
			}[category];
		}
		function mapCall(apiCall) {
			const category = getCategoryInfo(apiCall.category);
			const serviceName = apiCall.service_type || category.label;
			const serviceIcon = apiCall.category === "concierge_service" ? "lucide:bell-concierge" : category.icon;
			const scheduledDateTime = apiCall.scheduled_date ? `${apiCall.scheduled_date}${apiCall.scheduled_time_from ? " " + apiCall.scheduled_time_from : ""}` : null;
			return {
				id: apiCall.call_id.toString(),
				displayId: `CL-${apiCall.call_id}`,
				category,
				serviceType: {
					name: serviceName,
					icon: serviceIcon
				},
				priority: apiCall.priority,
				callDateTime: apiCall.created_on,
				createdOn: apiCall.created_on,
				lastUpdate: apiCall.last_update || void 0,
				residentName: apiCall.resident_name || "",
				communityName: apiCall.community_name || "",
				address: apiCall.address || "",
				currentAddress: apiCall.current_address || void 0,
				latitude: apiCall.latitude,
				longitude: apiCall.longitude,
				description: apiCall.description || void 0,
				scheduledDateTime,
				officerName: apiCall.officer_name,
				assignedBy: apiCall.assigned_by || void 0,
				acceptedOn: apiCall.accepted_on || void 0,
				resolvedOn: apiCall.resolved_on || void 0,
				status: apiCall.status === "resolved" ? "done" : apiCall.status,
				media: apiCall.media,
				confirmationImages: apiCall.confirmation_media,
				confirmationVideoUrl: apiCall.confirmation_video_url || void 0,
				audioUrl: apiCall.audio_url || void 0,
				videoUrl: apiCall.video_url || void 0,
				officerComments: apiCall.officer_comments || void 0,
				likeReaction: apiCall.reaction === 1,
				residentComments: apiCall.resident_comment || void 0
			};
		}
		async function fetchCallDetails() {
			if (!props.call) return;
			loading.value = true;
			error.value = "";
			try {
				const res = await callApi.getCall(Number(props.call.id));
				fetchedCall.value = mapCall(res.call);
			} catch (err) {
				error.value = err.message || "Failed to load call details";
			} finally {
				loading.value = false;
			}
		}
		watch(() => props.show, (show) => {
			if (show && props.call) {
				fetchedCall.value = null;
				fetchCallDetails();
			}
		});
		function handleClose() {
			emit("close");
		}
		function getStatusClass(status) {
			switch (status) {
				case "new": return "status-new";
				case "accepted": return "status-accepted";
				case "resolved":
				case "done": return "status-done";
				case "canceled": return "status-canceled";
				default: return "status-new";
			}
		}
		function getStatusLabel(status) {
			switch (status) {
				case "new": return t("calls.status.new");
				case "accepted": return t("calls.status.accepted");
				case "resolved":
				case "done": return t("calls.status.done");
				case "canceled": return t("calls.status.canceled");
				default: return status;
			}
		}
		function getPriorityClass(priority) {
			switch (priority || "normal") {
				case "urgent": return "priority-urgent";
				case "important": return "priority-important";
				case "normal": return "priority-normal";
				case "low": return "priority-low";
				default: return "priority-normal";
			}
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppModal = AppModal_default;
			const _component_Icon = components_default;
			const _component_MImagePreview = MImagePreview_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppModal, {
				show: __props.show,
				title: unref(t)("calls.call_details_title"),
				"cancel-text": unref(cancelText),
				"ok-text": unref(okText),
				"ok-disabled": unref(okDisabled),
				"max-width": "50vw",
				onClose: handleClose,
				onOk: handleOk,
				onCancel: openCancelModal
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(call)) {
							_push(`<div class="call-details-modal" data-v-055099a2${_scopeId}>`);
							if (unref(loading)) {
								_push(`<div class="loading-state" data-v-055099a2${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:loader-2",
									size: 24,
									class: "spinner"
								}, null, _parent, _scopeId));
								_push(`<span data-v-055099a2${_scopeId}>Loading call details...</span></div>`);
							} else if (unref(error)) {
								_push(`<div class="error-state" data-v-055099a2${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:alert-circle",
									size: 24
								}, null, _parent, _scopeId));
								_push(`<span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(error))}</span></div>`);
							} else {
								_push(`<!--[--><div class="details-header" data-v-055099a2${_scopeId}><div class="category-service" data-v-055099a2${_scopeId}><div class="category-badge" style="${ssrRenderStyle({
									backgroundColor: unref(call).category.color + "20",
									color: unref(call).category.color
								})}" data-v-055099a2${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: unref(call).category.icon,
									size: 20
								}, null, _parent, _scopeId));
								_push(`<span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).category.label)}</span></div><div class="service-type" data-v-055099a2${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: unref(call).serviceType.icon,
									size: 16
								}, null, _parent, _scopeId));
								_push(`<span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).serviceType.name)}</span></div></div><div class="header-badges" data-v-055099a2${_scopeId}><span class="text-muted text-sm" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).displayId)}</span><span class="${ssrRenderClass(["status-badge", getStatusClass(unref(call).status)])}" data-v-055099a2${_scopeId}>${ssrInterpolate(getStatusLabel(unref(call).status))}</span><span class="${ssrRenderClass(["status-badge", getPriorityClass(unref(call).priority)])}" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).priority)}</span></div></div><div class="details-meta" data-v-055099a2${_scopeId}><span class="text-muted text-xs" data-v-055099a2${_scopeId}>Created: ${ssrInterpolate(formatDateTime(unref(call).createdOn))}</span>`);
								if (unref(call).lastUpdate) _push(`<span class="text-muted text-xs" data-v-055099a2${_scopeId}>Updated: ${ssrInterpolate(formatDateTime(unref(call).lastUpdate))}</span>`);
								else _push(`<!---->`);
								_push(`</div><div class="details-content" data-v-055099a2${_scopeId}><div class="details-section" data-v-055099a2${_scopeId}><h4 class="section-title" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.call_info"))}</h4><div class="info-grid" data-v-055099a2${_scopeId}><div class="info-item" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.resident"))}</label><span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).residentName)}</span></div><div class="info-item" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.community"))}</label><span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).communityName)}</span></div><div class="info-item" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.address"))}</label><span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).address)}</span></div>`);
								if (unref(call).currentAddress) _push(`<div class="info-item info-item--highlight" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.current_address"))}</label><span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).currentAddress)}</span></div>`);
								else _push(`<!---->`);
								if (unref(call).latitude != null && unref(call).longitude != null) {
									_push(`<div class="info-item info-item--full" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>GPS coordinates</label><span class="gps-coords" data-v-055099a2${_scopeId}>${ssrInterpolate(Number(unref(call).latitude).toFixed(6))}, ${ssrInterpolate(Number(unref(call).longitude).toFixed(6))}</span><div class="map-container" data-v-055099a2${_scopeId}>`);
									_push(ssrRenderComponent(GoogleMap_default, {
										center: {
											lat: Number(unref(call).latitude),
											lng: Number(unref(call).longitude)
										},
										zoom: 16,
										height: "100%",
										markers: [
											"medical",
											"security",
											"panic"
										].includes(unref(call).category.type) ? [] : [{
											lat: Number(unref(call).latitude),
											lng: Number(unref(call).longitude),
											status: "active",
											label: unref(call).displayId || unref(call).id
										}],
										"emergency-calls": [
											"medical",
											"security",
											"panic"
										].includes(unref(call).category.type) ? [{
											lat: Number(unref(call).latitude),
											lng: Number(unref(call).longitude),
											id: unref(call).displayId || unref(call).id
										}] : []
									}, null, _parent, _scopeId));
									_push(`</div></div>`);
								} else _push(`<!---->`);
								_push(`<div class="info-item" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.officer"))}</label><span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).officerName || "—")}</span></div>`);
								if (unref(call).assignedBy) _push(`<div class="info-item" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>Assigned by</label><span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).assignedBy)}</span></div>`);
								else _push(`<!---->`);
								if (unref(call).acceptedOn) _push(`<div class="info-item" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>Accepted on</label><span data-v-055099a2${_scopeId}>${ssrInterpolate(formatDateTime(unref(call).acceptedOn))}</span></div>`);
								else _push(`<!---->`);
								_push(`<div class="info-item" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.scheduled_datetime"))}</label><span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).scheduledDateTime || "—")}</span></div></div></div>`);
								if (unref(call).description) _push(`<div class="details-section" data-v-055099a2${_scopeId}><h4 class="section-title" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.description"))}</h4><p class="description-text" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).description)}</p></div>`);
								else _push(`<!---->`);
								if (unref(call).media && unref(call).media.length > 0) {
									_push(`<div class="details-section" data-v-055099a2${_scopeId}><h4 class="section-title" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.media"))}</h4><div class="media-gallery" data-v-055099a2${_scopeId}><!--[-->`);
									ssrRenderList(unref(call).media, (img, idx) => {
										_push(`<img${ssrRenderAttr("src", img)} class="media-thumb" alt="Call media" data-v-055099a2${_scopeId}>`);
									});
									_push(`<!--]--></div></div>`);
								} else _push(`<!---->`);
								if (unref(call).audioUrl) _push(`<div class="details-section" data-v-055099a2${_scopeId}><h4 class="section-title" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.audio_recording"))}</h4><audio controls class="audio-player" data-v-055099a2${_scopeId}><source${ssrRenderAttr("src", unref(call).audioUrl)} type="audio/mpeg" data-v-055099a2${_scopeId}></audio></div>`);
								else _push(`<!---->`);
								if (unref(call).videoUrl) _push(`<div class="details-section" data-v-055099a2${_scopeId}><h4 class="section-title" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.video"))}</h4><video controls class="video-player" data-v-055099a2${_scopeId}><source${ssrRenderAttr("src", unref(call).videoUrl)} type="video/mp4" data-v-055099a2${_scopeId}></video></div>`);
								else _push(`<!---->`);
								if (unref(call).status === "done") {
									_push(`<div class="details-section resolution-section" data-v-055099a2${_scopeId}><h4 class="section-title" data-v-055099a2${_scopeId}>Resolution</h4>`);
									if (unref(call).resolvedOn) _push(`<div class="info-item" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>Resolved on</label><span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).resolvedOn)}</span></div>`);
									else _push(`<!---->`);
									if (unref(call).officerComments) _push(`<p class="description-text" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(call).officerComments)}</p>`);
									else _push(`<!---->`);
									if (unref(call).confirmationImages && unref(call).confirmationImages.length > 0) {
										_push(`<div class="media-gallery" data-v-055099a2${_scopeId}><!--[-->`);
										ssrRenderList(unref(call).confirmationImages, (img, idx) => {
											_push(`<img${ssrRenderAttr("src", img)} class="media-thumb" alt="Confirmation" data-v-055099a2${_scopeId}>`);
										});
										_push(`<!--]--></div>`);
									} else _push(`<!---->`);
									if (unref(call).confirmationVideoUrl) _push(`<div class="media-gallery" data-v-055099a2${_scopeId}><video controls class="video-player" data-v-055099a2${_scopeId}><source${ssrRenderAttr("src", unref(call).confirmationVideoUrl)} type="video/mp4" data-v-055099a2${_scopeId}></video></div>`);
									else _push(`<!---->`);
									_push(`</div>`);
								} else _push(`<!---->`);
								if (unref(call).status === "done" && (unref(call).likeReaction || unref(call).residentComments)) {
									_push(`<div class="details-section feedback-section" data-v-055099a2${_scopeId}><h4 class="section-title" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.resident_feedback"))}</h4><div class="feedback-content" data-v-055099a2${_scopeId}>`);
									if (unref(call).likeReaction) {
										_push(`<div class="like-reaction" data-v-055099a2${_scopeId}>`);
										_push(ssrRenderComponent(_component_Icon, {
											name: "lucide:thumbs-up",
											size: 20,
											class: "like-icon"
										}, null, _parent, _scopeId));
										_push(`<span data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.like_given"))}</span></div>`);
									} else _push(`<!---->`);
									if (unref(call).residentComments) _push(`<p class="resident-comment" data-v-055099a2${_scopeId}>&quot;${ssrInterpolate(unref(call).residentComments)}&quot;</p>`);
									else _push(`<!---->`);
									_push(`</div></div>`);
								} else _push(`<!---->`);
								_push(`<div class="details-section admin-section" data-v-055099a2${_scopeId}><h4 class="section-title" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.admin_only"))}</h4><div class="info-item" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.documents"))}</label><span class="placeholder-text" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.no_documents"))}</span></div><div class="info-item" data-v-055099a2${_scopeId}><label data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.transcription"))}</label><span class="placeholder-text" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(t)("calls.no_transcription"))}</span></div></div></div><!--]-->`);
							}
							_push(`</div>`);
						} else _push(`<!---->`);
					} else return [unref(call) ? (openBlock(), createBlock("div", {
						key: 0,
						class: "call-details-modal"
					}, [unref(loading) ? (openBlock(), createBlock("div", {
						key: 0,
						class: "loading-state"
					}, [createVNode(_component_Icon, {
						name: "lucide:loader-2",
						size: 24,
						class: "spinner"
					}), createVNode("span", null, "Loading call details...")])) : unref(error) ? (openBlock(), createBlock("div", {
						key: 1,
						class: "error-state"
					}, [createVNode(_component_Icon, {
						name: "lucide:alert-circle",
						size: 24
					}), createVNode("span", null, toDisplayString(unref(error)), 1)])) : (openBlock(), createBlock(Fragment, { key: 2 }, [
						createVNode("div", { class: "details-header" }, [createVNode("div", { class: "category-service" }, [createVNode("div", {
							class: "category-badge",
							style: {
								backgroundColor: unref(call).category.color + "20",
								color: unref(call).category.color
							}
						}, [createVNode(_component_Icon, {
							name: unref(call).category.icon,
							size: 20
						}, null, 8, ["name"]), createVNode("span", null, toDisplayString(unref(call).category.label), 1)], 4), createVNode("div", { class: "service-type" }, [createVNode(_component_Icon, {
							name: unref(call).serviceType.icon,
							size: 16
						}, null, 8, ["name"]), createVNode("span", null, toDisplayString(unref(call).serviceType.name), 1)])]), createVNode("div", { class: "header-badges" }, [
							createVNode("span", { class: "text-muted text-sm" }, toDisplayString(unref(call).displayId), 1),
							createVNode("span", { class: ["status-badge", getStatusClass(unref(call).status)] }, toDisplayString(getStatusLabel(unref(call).status)), 3),
							createVNode("span", { class: ["status-badge", getPriorityClass(unref(call).priority)] }, toDisplayString(unref(call).priority), 3)
						])]),
						createVNode("div", { class: "details-meta" }, [createVNode("span", { class: "text-muted text-xs" }, "Created: " + toDisplayString(formatDateTime(unref(call).createdOn)), 1), unref(call).lastUpdate ? (openBlock(), createBlock("span", {
							key: 0,
							class: "text-muted text-xs"
						}, "Updated: " + toDisplayString(formatDateTime(unref(call).lastUpdate)), 1)) : createCommentVNode("", true)]),
						createVNode("div", { class: "details-content" }, [
							createVNode("div", { class: "details-section" }, [createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("calls.call_info")), 1), createVNode("div", { class: "info-grid" }, [
								createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.resident")), 1), createVNode("span", null, toDisplayString(unref(call).residentName), 1)]),
								createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.community")), 1), createVNode("span", null, toDisplayString(unref(call).communityName), 1)]),
								createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.address")), 1), createVNode("span", null, toDisplayString(unref(call).address), 1)]),
								unref(call).currentAddress ? (openBlock(), createBlock("div", {
									key: 0,
									class: "info-item info-item--highlight"
								}, [createVNode("label", null, toDisplayString(unref(t)("calls.current_address")), 1), createVNode("span", null, toDisplayString(unref(call).currentAddress), 1)])) : createCommentVNode("", true),
								unref(call).latitude != null && unref(call).longitude != null ? (openBlock(), createBlock("div", {
									key: 1,
									class: "info-item info-item--full"
								}, [
									createVNode("label", null, "GPS coordinates"),
									createVNode("span", { class: "gps-coords" }, toDisplayString(Number(unref(call).latitude).toFixed(6)) + ", " + toDisplayString(Number(unref(call).longitude).toFixed(6)), 1),
									createVNode("div", { class: "map-container" }, [createVNode(GoogleMap_default, {
										center: {
											lat: Number(unref(call).latitude),
											lng: Number(unref(call).longitude)
										},
										zoom: 16,
										height: "100%",
										markers: [
											"medical",
											"security",
											"panic"
										].includes(unref(call).category.type) ? [] : [{
											lat: Number(unref(call).latitude),
											lng: Number(unref(call).longitude),
											status: "active",
											label: unref(call).displayId || unref(call).id
										}],
										"emergency-calls": [
											"medical",
											"security",
											"panic"
										].includes(unref(call).category.type) ? [{
											lat: Number(unref(call).latitude),
											lng: Number(unref(call).longitude),
											id: unref(call).displayId || unref(call).id
										}] : []
									}, null, 8, [
										"center",
										"markers",
										"emergency-calls"
									])])
								])) : createCommentVNode("", true),
								createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.officer")), 1), createVNode("span", null, toDisplayString(unref(call).officerName || "—"), 1)]),
								unref(call).assignedBy ? (openBlock(), createBlock("div", {
									key: 2,
									class: "info-item"
								}, [createVNode("label", null, "Assigned by"), createVNode("span", null, toDisplayString(unref(call).assignedBy), 1)])) : createCommentVNode("", true),
								unref(call).acceptedOn ? (openBlock(), createBlock("div", {
									key: 3,
									class: "info-item"
								}, [createVNode("label", null, "Accepted on"), createVNode("span", null, toDisplayString(formatDateTime(unref(call).acceptedOn)), 1)])) : createCommentVNode("", true),
								createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.scheduled_datetime")), 1), createVNode("span", null, toDisplayString(unref(call).scheduledDateTime || "—"), 1)])
							])]),
							unref(call).description ? (openBlock(), createBlock("div", {
								key: 0,
								class: "details-section"
							}, [createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("calls.description")), 1), createVNode("p", { class: "description-text" }, toDisplayString(unref(call).description), 1)])) : createCommentVNode("", true),
							unref(call).media && unref(call).media.length > 0 ? (openBlock(), createBlock("div", {
								key: 1,
								class: "details-section"
							}, [createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("calls.media")), 1), createVNode("div", { class: "media-gallery" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(call).media, (img, idx) => {
								return openBlock(), createBlock("img", {
									key: idx,
									src: img,
									class: "media-thumb",
									alt: "Call media",
									onClick: ($event) => openImagePreview(unref(call).media, idx)
								}, null, 8, ["src", "onClick"]);
							}), 128))])])) : createCommentVNode("", true),
							unref(call).audioUrl ? (openBlock(), createBlock("div", {
								key: 2,
								class: "details-section"
							}, [createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("calls.audio_recording")), 1), createVNode("audio", {
								controls: "",
								class: "audio-player"
							}, [createVNode("source", {
								src: unref(call).audioUrl,
								type: "audio/mpeg"
							}, null, 8, ["src"])])])) : createCommentVNode("", true),
							unref(call).videoUrl ? (openBlock(), createBlock("div", {
								key: 3,
								class: "details-section"
							}, [createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("calls.video")), 1), createVNode("video", {
								controls: "",
								class: "video-player"
							}, [createVNode("source", {
								src: unref(call).videoUrl,
								type: "video/mp4"
							}, null, 8, ["src"])])])) : createCommentVNode("", true),
							unref(call).status === "done" ? (openBlock(), createBlock("div", {
								key: 4,
								class: "details-section resolution-section"
							}, [
								createVNode("h4", { class: "section-title" }, "Resolution"),
								unref(call).resolvedOn ? (openBlock(), createBlock("div", {
									key: 0,
									class: "info-item"
								}, [createVNode("label", null, "Resolved on"), createVNode("span", null, toDisplayString(unref(call).resolvedOn), 1)])) : createCommentVNode("", true),
								unref(call).officerComments ? (openBlock(), createBlock("p", {
									key: 1,
									class: "description-text"
								}, toDisplayString(unref(call).officerComments), 1)) : createCommentVNode("", true),
								unref(call).confirmationImages && unref(call).confirmationImages.length > 0 ? (openBlock(), createBlock("div", {
									key: 2,
									class: "media-gallery"
								}, [(openBlock(true), createBlock(Fragment, null, renderList(unref(call).confirmationImages, (img, idx) => {
									return openBlock(), createBlock("img", {
										key: idx,
										src: img,
										class: "media-thumb",
										alt: "Confirmation",
										onClick: ($event) => openImagePreview(unref(call).confirmationImages, idx)
									}, null, 8, ["src", "onClick"]);
								}), 128))])) : createCommentVNode("", true),
								unref(call).confirmationVideoUrl ? (openBlock(), createBlock("div", {
									key: 3,
									class: "media-gallery"
								}, [createVNode("video", {
									controls: "",
									class: "video-player"
								}, [createVNode("source", {
									src: unref(call).confirmationVideoUrl,
									type: "video/mp4"
								}, null, 8, ["src"])])])) : createCommentVNode("", true)
							])) : createCommentVNode("", true),
							unref(call).status === "done" && (unref(call).likeReaction || unref(call).residentComments) ? (openBlock(), createBlock("div", {
								key: 5,
								class: "details-section feedback-section"
							}, [createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("calls.resident_feedback")), 1), createVNode("div", { class: "feedback-content" }, [unref(call).likeReaction ? (openBlock(), createBlock("div", {
								key: 0,
								class: "like-reaction"
							}, [createVNode(_component_Icon, {
								name: "lucide:thumbs-up",
								size: 20,
								class: "like-icon"
							}), createVNode("span", null, toDisplayString(unref(t)("calls.like_given")), 1)])) : createCommentVNode("", true), unref(call).residentComments ? (openBlock(), createBlock("p", {
								key: 1,
								class: "resident-comment"
							}, "\"" + toDisplayString(unref(call).residentComments) + "\"", 1)) : createCommentVNode("", true)])])) : createCommentVNode("", true),
							createVNode("div", { class: "details-section admin-section" }, [
								createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("calls.admin_only")), 1),
								createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.documents")), 1), createVNode("span", { class: "placeholder-text" }, toDisplayString(unref(t)("calls.no_documents")), 1)]),
								createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.transcription")), 1), createVNode("span", { class: "placeholder-text" }, toDisplayString(unref(t)("calls.no_transcription")), 1)])
							])
						])
					], 64))])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: unref(showResolveModal),
				title: "Resolve Call",
				"cancel-text": "Cancel",
				"ok-text": "Resolve",
				"ok-disabled": unref(resolving),
				"max-width": "500px",
				onClose: closeResolveModal,
				onCancel: closeResolveModal,
				onOk: submitResolve
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(call)) {
							_push(`<div class="resolve-call-modal" data-v-055099a2${_scopeId}>`);
							if (unref(call).category.type === "panic") {
								_push(`<div class="panic-notice" data-v-055099a2${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:alert-triangle",
									size: 18
								}, null, _parent, _scopeId));
								_push(`<span data-v-055099a2${_scopeId}><strong data-v-055099a2${_scopeId}>Security Notice:</strong> You are closing a panic alert. Please confirm that safety has been verified via direct communication with the officer on scene.</span></div>`);
							} else _push(`<!---->`);
							_push(`<div class="form-field" data-v-055099a2${_scopeId}><label class="field-label" data-v-055099a2${_scopeId}>Officer Comments</label><textarea class="field-textarea" rows="4" placeholder="Optional comments..." data-v-055099a2${_scopeId}>${ssrInterpolate(unref(resolveComments))}</textarea></div><div class="form-field" data-v-055099a2${_scopeId}><label class="field-label" data-v-055099a2${_scopeId}>Confirmation Photos (max 5)</label>`);
							_push(ssrRenderComponent(FileUpload_default, {
								ref_key: "photoUploadRef",
								ref: photoUploadRef,
								modelValue: unref(resolvePhotoIds),
								"onUpdate:modelValue": ($event) => isRef(resolvePhotoIds) ? resolvePhotoIds.value = $event : null,
								accept: "image/*",
								"max-files": 5,
								"call-api": true,
								hint: "Upload up to 5 confirmation photos"
							}, null, _parent, _scopeId));
							_push(`</div><div class="form-field" data-v-055099a2${_scopeId}><label class="field-label" data-v-055099a2${_scopeId}>Confirmation Video (max 1)</label>`);
							_push(ssrRenderComponent(FileUpload_default, {
								ref_key: "videoUploadRef",
								ref: videoUploadRef,
								modelValue: unref(resolveVideoIds),
								"onUpdate:modelValue": ($event) => isRef(resolveVideoIds) ? resolveVideoIds.value = $event : null,
								accept: "video/*",
								"max-files": 1,
								"call-api": true,
								hint: "Upload one confirmation video"
							}, null, _parent, _scopeId));
							_push(`</div>`);
							if (unref(resolving)) {
								_push(`<div class="resolve-loading" data-v-055099a2${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:loader-2",
									size: 18,
									class: "spinner"
								}, null, _parent, _scopeId));
								_push(`<span data-v-055099a2${_scopeId}>Resolving call...</span></div>`);
							} else _push(`<!---->`);
							if (unref(resolveError)) _push(`<div class="resolve-error" data-v-055099a2${_scopeId}>${ssrInterpolate(unref(resolveError))}</div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
					} else return [unref(call) ? (openBlock(), createBlock("div", {
						key: 0,
						class: "resolve-call-modal"
					}, [
						unref(call).category.type === "panic" ? (openBlock(), createBlock("div", {
							key: 0,
							class: "panic-notice"
						}, [createVNode(_component_Icon, {
							name: "lucide:alert-triangle",
							size: 18
						}), createVNode("span", null, [createVNode("strong", null, "Security Notice:"), createTextVNode(" You are closing a panic alert. Please confirm that safety has been verified via direct communication with the officer on scene.")])])) : createCommentVNode("", true),
						createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, "Officer Comments"), withDirectives(createVNode("textarea", {
							"onUpdate:modelValue": ($event) => isRef(resolveComments) ? resolveComments.value = $event : null,
							class: "field-textarea",
							rows: "4",
							placeholder: "Optional comments..."
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(resolveComments)]])]),
						createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, "Confirmation Photos (max 5)"), createVNode(FileUpload_default, {
							ref_key: "photoUploadRef",
							ref: photoUploadRef,
							modelValue: unref(resolvePhotoIds),
							"onUpdate:modelValue": ($event) => isRef(resolvePhotoIds) ? resolvePhotoIds.value = $event : null,
							accept: "image/*",
							"max-files": 5,
							"call-api": true,
							hint: "Upload up to 5 confirmation photos"
						}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
						createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, "Confirmation Video (max 1)"), createVNode(FileUpload_default, {
							ref_key: "videoUploadRef",
							ref: videoUploadRef,
							modelValue: unref(resolveVideoIds),
							"onUpdate:modelValue": ($event) => isRef(resolveVideoIds) ? resolveVideoIds.value = $event : null,
							accept: "video/*",
							"max-files": 1,
							"call-api": true,
							hint: "Upload one confirmation video"
						}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
						unref(resolving) ? (openBlock(), createBlock("div", {
							key: 1,
							class: "resolve-loading"
						}, [createVNode(_component_Icon, {
							name: "lucide:loader-2",
							size: 18,
							class: "spinner"
						}), createVNode("span", null, "Resolving call...")])) : createCommentVNode("", true),
						unref(resolveError) ? (openBlock(), createBlock("div", {
							key: 2,
							class: "resolve-error"
						}, toDisplayString(unref(resolveError)), 1)) : createCommentVNode("", true)
					])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: unref(showCancelModal),
				title: "Cancel Call",
				message: unref(call) ? unref(cancelError) || "Are you sure you want to cancel this call?" : "",
				"cancel-text": "No",
				"ok-text": "Yes, Cancel",
				"ok-disabled": unref(canceling),
				"max-width": "400px",
				onClose: closeCancelModal,
				onCancel: closeCancelModal,
				onOk: confirmCancel
			}, null, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: unref(showDeleteTestModal),
				title: "Delete Test Call",
				message: unref(call) ? unref(deleteTestError) || "Are you sure you want to delete this test call?" : "",
				"cancel-text": "No",
				"ok-text": "Yes, Delete",
				"ok-disabled": unref(deletingTest),
				"max-width": "400px",
				onClose: closeDeleteTestModal,
				onCancel: closeDeleteTestModal,
				onOk: confirmDeleteTest
			}, null, _parent));
			_push(ssrRenderComponent(_component_MImagePreview, {
				show: unref(showImagePreview),
				images: unref(previewImages),
				"initial-index": unref(previewInitialIndex),
				onClose: closeImagePreview
			}, null, _parent));
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region app/components/calls/CallDetailsModal.vue
var _sfc_setup$1 = CallDetailsModal_vue_vue_type_script_setup_true_lang_default.setup;
CallDetailsModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/calls/CallDetailsModal.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var CallDetailsModal_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(CallDetailsModal_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-055099a2"]]), { __name: "CallDetailsModal" });
//#endregion
//#region app/components/calls/AssignCallModal.vue?vue&type=script&setup=true&lang.ts
var AssignCallModal_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AssignCallModal",
	__ssrInlineRender: true,
	props: {
		show: { type: Boolean },
		call: {}
	},
	emits: ["close", "assigned"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const { t } = useTranslation();
		const officers = ref([]);
		const officersLoading = ref(false);
		const officersError = ref("");
		const assigning = ref(false);
		const assignError = ref("");
		const selectedOfficer = ref("");
		watch(() => props.show, async (show) => {
			if (show && props.call) {
				selectedOfficer.value = "";
				officersLoading.value = true;
				officersError.value = "";
				try {
					const res = await officerApi.getOfficers({
						community_id: props.call.communityId,
						include_inactive: false
					});
					officers.value = res.officers;
				} catch (err) {
					officersError.value = err.message || "Failed to load officers";
				} finally {
					officersLoading.value = false;
				}
			}
		});
		const selectedOfficerName = computed(() => {
			const officer = officers.value.find((o) => o.user_id === selectedOfficer.value);
			return officer ? `${officer.first_name} ${officer.last_name}`.trim() : "";
		});
		const canSubmit = computed(() => {
			return !!selectedOfficer.value && !assigning.value;
		});
		function handleClose() {
			assignError.value = "";
			emit("close");
		}
		async function handleAssign() {
			if (!canSubmit.value || !props.call) return;
			assigning.value = true;
			assignError.value = "";
			try {
				await callApi.assignCall({
					call_id: Number(props.call.id),
					officer_user_id: selectedOfficer.value
				});
				selectedOfficer.value = "";
				emit("assigned");
				emit("close");
			} catch (err) {
				const message = err.message || "Assign call failed";
				if (message.toLowerCase().includes("already") || message.includes("568")) assignError.value = "This call has already been assigned to an officer.";
				else assignError.value = message;
				console.error("Assign call failed:", err);
			} finally {
				assigning.value = false;
			}
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppModal = AppModal_default;
			const _component_Icon = components_default;
			_push(ssrRenderComponent(_component_AppModal, mergeProps({
				show: __props.show,
				title: unref(t)("calls.assign_title"),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(t)("calls.assign_button"),
				"ok-disabled": !unref(canSubmit),
				"max-width": "400px",
				onClose: handleClose,
				onCancel: handleClose,
				onOk: handleAssign
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (__props.call) {
							_push(`<div class="assign-call-modal" data-v-8fe64d4d${_scopeId}><div class="call-summary" data-v-8fe64d4d${_scopeId}><div class="category-badge" style="${ssrRenderStyle({
								backgroundColor: __props.call.category.color + "20",
								color: __props.call.category.color
							})}" data-v-8fe64d4d${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: __props.call.category.icon,
								size: 18
							}, null, _parent, _scopeId));
							_push(`<span data-v-8fe64d4d${_scopeId}>${ssrInterpolate(__props.call.category.label)}</span></div><div class="service-type" data-v-8fe64d4d${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: __props.call.serviceType.icon,
								size: 14
							}, null, _parent, _scopeId));
							_push(`<span data-v-8fe64d4d${_scopeId}>${ssrInterpolate(__props.call.serviceType.name)}</span></div></div>`);
							if (__props.call.displayId) _push(`<div class="call-id" data-v-8fe64d4d${_scopeId}>Call ID: ${ssrInterpolate(__props.call.displayId)}</div>`);
							else _push(`<!---->`);
							if (__props.call.description) _push(`<div class="description-section" data-v-8fe64d4d${_scopeId}><p class="description-text" data-v-8fe64d4d${_scopeId}>${ssrInterpolate(__props.call.description)}</p></div>`);
							else _push(`<!---->`);
							_push(`<div class="info-section" data-v-8fe64d4d${_scopeId}><div class="info-row" data-v-8fe64d4d${_scopeId}><label data-v-8fe64d4d${_scopeId}>${ssrInterpolate(unref(t)("calls.resident"))}:</label><span data-v-8fe64d4d${_scopeId}>${ssrInterpolate(__props.call.residentName)}</span></div><div class="info-row" data-v-8fe64d4d${_scopeId}><label data-v-8fe64d4d${_scopeId}>${ssrInterpolate(unref(t)("calls.community"))}:</label><span data-v-8fe64d4d${_scopeId}>${ssrInterpolate(__props.call.communityName)}</span></div><div class="info-row" data-v-8fe64d4d${_scopeId}><label data-v-8fe64d4d${_scopeId}>${ssrInterpolate(unref(t)("calls.address"))}:</label><span data-v-8fe64d4d${_scopeId}>${ssrInterpolate(__props.call.address)}</span></div><div class="info-row" data-v-8fe64d4d${_scopeId}><label data-v-8fe64d4d${_scopeId}>Scheduled:</label><span data-v-8fe64d4d${_scopeId}>${ssrInterpolate(__props.call.scheduledDateTime || "—")}</span></div></div><div class="form-section" data-v-8fe64d4d${_scopeId}><h4 class="form-title" data-v-8fe64d4d${_scopeId}>${ssrInterpolate(unref(t)("calls.assign_form_title"))}</h4><div class="form-field" data-v-8fe64d4d${_scopeId}><label class="field-label" data-v-8fe64d4d${_scopeId}>${ssrInterpolate(unref(t)("calls.officer"))} <span class="required" data-v-8fe64d4d${_scopeId}>*</span></label>`);
							if (unref(officersLoading)) _push(`<div class="field-loading" data-v-8fe64d4d${_scopeId}>Loading officers...</div>`);
							else if (unref(officersError)) _push(`<div class="field-error" data-v-8fe64d4d${_scopeId}>${ssrInterpolate(unref(officersError))}</div>`);
							else {
								_push(`<select class="field-select" data-v-8fe64d4d${_scopeId}><option value="" data-v-8fe64d4d${ssrIncludeBooleanAttr(Array.isArray(unref(selectedOfficer)) ? ssrLooseContain(unref(selectedOfficer), "") : ssrLooseEqual(unref(selectedOfficer), "")) ? " selected" : ""}${_scopeId}>${ssrInterpolate(unref(t)("calls.select_officer"))}</option><!--[-->`);
								ssrRenderList(unref(officers), (officer) => {
									_push(`<option${ssrRenderAttr("value", officer.user_id)} data-v-8fe64d4d${ssrIncludeBooleanAttr(Array.isArray(unref(selectedOfficer)) ? ssrLooseContain(unref(selectedOfficer), officer.user_id) : ssrLooseEqual(unref(selectedOfficer), officer.user_id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(officer.first_name)} ${ssrInterpolate(officer.last_name)}</option>`);
								});
								_push(`<!--]--></select>`);
							}
							if (unref(selectedOfficerName)) _push(`<p class="selected-officer" data-v-8fe64d4d${_scopeId}>${ssrInterpolate(unref(t)("calls.selected"))}: <strong data-v-8fe64d4d${_scopeId}>${ssrInterpolate(unref(selectedOfficerName))}</strong></p>`);
							else _push(`<!---->`);
							if (unref(assigning)) _push(`<p class="field-loading" data-v-8fe64d4d${_scopeId}>Assigning...</p>`);
							else _push(`<!---->`);
							if (unref(assignError)) _push(`<p class="field-error" data-v-8fe64d4d${_scopeId}>${ssrInterpolate(unref(assignError))}</p>`);
							else _push(`<!---->`);
							_push(`</div></div><div class="note-section" data-v-8fe64d4d${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:info",
								size: 14
							}, null, _parent, _scopeId));
							_push(`<span data-v-8fe64d4d${_scopeId}>${ssrInterpolate(unref(t)("calls.assign_note"))}</span></div></div>`);
						} else _push(`<!---->`);
					} else return [__props.call ? (openBlock(), createBlock("div", {
						key: 0,
						class: "assign-call-modal"
					}, [
						createVNode("div", { class: "call-summary" }, [createVNode("div", {
							class: "category-badge",
							style: {
								backgroundColor: __props.call.category.color + "20",
								color: __props.call.category.color
							}
						}, [createVNode(_component_Icon, {
							name: __props.call.category.icon,
							size: 18
						}, null, 8, ["name"]), createVNode("span", null, toDisplayString(__props.call.category.label), 1)], 4), createVNode("div", { class: "service-type" }, [createVNode(_component_Icon, {
							name: __props.call.serviceType.icon,
							size: 14
						}, null, 8, ["name"]), createVNode("span", null, toDisplayString(__props.call.serviceType.name), 1)])]),
						__props.call.displayId ? (openBlock(), createBlock("div", {
							key: 0,
							class: "call-id"
						}, "Call ID: " + toDisplayString(__props.call.displayId), 1)) : createCommentVNode("", true),
						__props.call.description ? (openBlock(), createBlock("div", {
							key: 1,
							class: "description-section"
						}, [createVNode("p", { class: "description-text" }, toDisplayString(__props.call.description), 1)])) : createCommentVNode("", true),
						createVNode("div", { class: "info-section" }, [
							createVNode("div", { class: "info-row" }, [createVNode("label", null, toDisplayString(unref(t)("calls.resident")) + ":", 1), createVNode("span", null, toDisplayString(__props.call.residentName), 1)]),
							createVNode("div", { class: "info-row" }, [createVNode("label", null, toDisplayString(unref(t)("calls.community")) + ":", 1), createVNode("span", null, toDisplayString(__props.call.communityName), 1)]),
							createVNode("div", { class: "info-row" }, [createVNode("label", null, toDisplayString(unref(t)("calls.address")) + ":", 1), createVNode("span", null, toDisplayString(__props.call.address), 1)]),
							createVNode("div", { class: "info-row" }, [createVNode("label", null, "Scheduled:"), createVNode("span", null, toDisplayString(__props.call.scheduledDateTime || "—"), 1)])
						]),
						createVNode("div", { class: "form-section" }, [createVNode("h4", { class: "form-title" }, toDisplayString(unref(t)("calls.assign_form_title")), 1), createVNode("div", { class: "form-field" }, [
							createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(unref(t)("calls.officer")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							unref(officersLoading) ? (openBlock(), createBlock("div", {
								key: 0,
								class: "field-loading"
							}, "Loading officers...")) : unref(officersError) ? (openBlock(), createBlock("div", {
								key: 1,
								class: "field-error"
							}, toDisplayString(unref(officersError)), 1)) : withDirectives((openBlock(), createBlock("select", {
								key: 2,
								"onUpdate:modelValue": ($event) => isRef(selectedOfficer) ? selectedOfficer.value = $event : null,
								class: "field-select"
							}, [createVNode("option", { value: "" }, toDisplayString(unref(t)("calls.select_officer")), 1), (openBlock(true), createBlock(Fragment, null, renderList(unref(officers), (officer) => {
								return openBlock(), createBlock("option", {
									key: officer.user_id,
									value: officer.user_id
								}, toDisplayString(officer.first_name) + " " + toDisplayString(officer.last_name), 9, ["value"]);
							}), 128))], 8, ["onUpdate:modelValue"])), [[vModelSelect, unref(selectedOfficer)]]),
							unref(selectedOfficerName) ? (openBlock(), createBlock("p", {
								key: 3,
								class: "selected-officer"
							}, [createTextVNode(toDisplayString(unref(t)("calls.selected")) + ": ", 1), createVNode("strong", null, toDisplayString(unref(selectedOfficerName)), 1)])) : createCommentVNode("", true),
							unref(assigning) ? (openBlock(), createBlock("p", {
								key: 4,
								class: "field-loading"
							}, "Assigning...")) : createCommentVNode("", true),
							unref(assignError) ? (openBlock(), createBlock("p", {
								key: 5,
								class: "field-error"
							}, toDisplayString(unref(assignError)), 1)) : createCommentVNode("", true)
						])]),
						createVNode("div", { class: "note-section" }, [createVNode(_component_Icon, {
							name: "lucide:info",
							size: 14
						}), createVNode("span", null, toDisplayString(unref(t)("calls.assign_note")), 1)])
					])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/calls/AssignCallModal.vue
var _sfc_setup = AssignCallModal_vue_vue_type_script_setup_true_lang_default.setup;
AssignCallModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/calls/AssignCallModal.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var AssignCallModal_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(AssignCallModal_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8fe64d4d"]]), { __name: "AssignCallModal" });

export { AssignCallModal_default as A, CallDetailsModal_default as C, callApi as c };
//# sourceMappingURL=AssignCallModal-BfoC0p2_.mjs.map
