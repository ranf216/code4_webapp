import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, u as useRoute, b as useRouter, f as useNotificationSocket } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { C as CallDetailsModal_default, A as AssignCallModal_default, c as callApi } from './AssignCallModal-BfoC0p2_.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { defineComponent, ref, unref, computed, watch, mergeProps, withCtx, openBlock, createBlock, createVNode, toDisplayString, createTextVNode, createCommentVNode, Fragment, renderList, withDirectives, isRef, vModelText, vModelCheckbox, reactive, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
import './FileUpload-B-39JGGf.mjs';
import './useFileApi-CLWuZDlq.mjs';
import './GoogleMap-BcuRRAta.mjs';
import './officer-CPsAbV7J.mjs';

//#region app/components/calls/CallsFilters.vue?vue&type=script&setup=true&lang.ts
var CallsFilters_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "CallsFilters",
	__ssrInlineRender: true,
	emits: ["filter-change"],
	setup(__props, { emit: __emit }) {
		const { t } = useTranslation();
		const filters = reactive({
			community: "",
			serviceType: "",
			residentName: "",
			officerName: "",
			status: "",
			scheduledStart: "",
			scheduledEnd: "",
			openStart: "",
			openEnd: "",
			search: ""
		});
		const communities = ref([]);
		const communitiesLoading = ref(false);
		const communitiesError = ref("");
		const serviceTypes = [
			{
				value: "medical_emergency",
				label: "Medical Emergency"
			},
			{
				value: "security_emergency",
				label: "Security Emergency"
			},
			{
				value: "concierge_service",
				label: "Concierge Service"
			},
			{
				value: "test",
				label: "Test Call"
			}
		];
		const statuses = [
			{
				value: "new",
				label: "New"
			},
			{
				value: "accepted",
				label: "Accepted"
			},
			{
				value: "resolved",
				label: "Resolved"
			},
			{
				value: "canceled",
				label: "Canceled"
			}
		];
		const emit = __emit;
		watch(filters, () => {
			emit("filter-change", { ...filters });
		}, { deep: true });
		const hasActiveFilters = computed(() => {
			return Object.values(filters).some((v) => v !== "");
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "calls-filters" }, _attrs))} data-v-5412b226><div class="filter-row" data-v-5412b226><div class="filter-field search-field-inline" data-v-5412b226><label class="filter-label" data-v-5412b226>${ssrInterpolate(unref(t)("calls.filters.search"))}</label><div class="search-input-wrapper" data-v-5412b226>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16,
				class: "search-icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", unref(filters).search)} type="text" class="search-input"${ssrRenderAttr("placeholder", unref(t)("calls.filters.search_placeholder"))} data-v-5412b226></div></div><div class="filter-field" data-v-5412b226><label class="filter-label" data-v-5412b226>${ssrInterpolate(unref(t)("calls.filters.community"))}</label>`);
			if (unref(communitiesLoading)) _push(`<div class="field-loading" data-v-5412b226>Loading communities...</div>`);
			else if (unref(communitiesError)) _push(`<div class="field-error" data-v-5412b226>${ssrInterpolate(unref(communitiesError))}</div>`);
			else {
				_push(`<select class="filter-select" data-v-5412b226><option value="" data-v-5412b226${ssrIncludeBooleanAttr(Array.isArray(unref(filters).community) ? ssrLooseContain(unref(filters).community, "") : ssrLooseEqual(unref(filters).community, "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("calls.filters.all"))}</option><!--[-->`);
				ssrRenderList(unref(communities), (c) => {
					_push(`<option${ssrRenderAttr("value", String(c.community_id))} data-v-5412b226${ssrIncludeBooleanAttr(Array.isArray(unref(filters).community) ? ssrLooseContain(unref(filters).community, String(c.community_id)) : ssrLooseEqual(unref(filters).community, String(c.community_id))) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
				});
				_push(`<!--]--></select>`);
			}
			_push(`</div><div class="filter-field" data-v-5412b226><label class="filter-label" data-v-5412b226>${ssrInterpolate(unref(t)("calls.filters.service_type"))}</label><select class="filter-select" data-v-5412b226><option value="" data-v-5412b226${ssrIncludeBooleanAttr(Array.isArray(unref(filters).serviceType) ? ssrLooseContain(unref(filters).serviceType, "") : ssrLooseEqual(unref(filters).serviceType, "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("calls.filters.all"))}</option><!--[-->`);
			ssrRenderList(serviceTypes, (s) => {
				_push(`<option${ssrRenderAttr("value", s.value)} data-v-5412b226${ssrIncludeBooleanAttr(Array.isArray(unref(filters).serviceType) ? ssrLooseContain(unref(filters).serviceType, s.value) : ssrLooseEqual(unref(filters).serviceType, s.value)) ? " selected" : ""}>${ssrInterpolate(s.label)}</option>`);
			});
			_push(`<!--]--></select></div><div class="filter-field" data-v-5412b226><label class="filter-label" data-v-5412b226>${ssrInterpolate(unref(t)("calls.filters.status"))}</label><select class="filter-select" data-v-5412b226><option value="" data-v-5412b226${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "") : ssrLooseEqual(unref(filters).status, "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("calls.filters.all"))}</option><!--[-->`);
			ssrRenderList(statuses, (s) => {
				_push(`<option${ssrRenderAttr("value", s.value)} data-v-5412b226${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, s.value) : ssrLooseEqual(unref(filters).status, s.value)) ? " selected" : ""}>${ssrInterpolate(s.label)}</option>`);
			});
			_push(`<!--]--></select></div>`);
			if (unref(hasActiveFilters)) {
				_push(`<div class="filter-field clear-field" data-v-5412b226><label class="filter-label" data-v-5412b226> </label><button class="clear-btn" data-v-5412b226>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("calls.filters.clear"))}</button></div>`);
			} else _push(`<!---->`);
			_push(`</div><div class="filter-row" data-v-5412b226><div class="filter-field" data-v-5412b226><label class="filter-label" data-v-5412b226>${ssrInterpolate(unref(t)("calls.filters.resident"))}</label><input${ssrRenderAttr("value", unref(filters).residentName)} type="text" class="filter-input"${ssrRenderAttr("placeholder", unref(t)("calls.filters.resident_placeholder"))} data-v-5412b226></div><div class="filter-field" data-v-5412b226><label class="filter-label" data-v-5412b226>${ssrInterpolate(unref(t)("calls.filters.officer"))}</label><input${ssrRenderAttr("value", unref(filters).officerName)} type="text" class="filter-input"${ssrRenderAttr("placeholder", unref(t)("calls.filters.officer_placeholder"))} data-v-5412b226></div><div class="filter-field date-range" data-v-5412b226><label class="filter-label" data-v-5412b226>${ssrInterpolate(unref(t)("calls.filters.scheduled_range"))}</label><div class="date-inputs" data-v-5412b226><input${ssrRenderAttr("value", unref(filters).scheduledStart)} type="datetime-local" class="filter-date" data-v-5412b226><span class="range-separator" data-v-5412b226>—</span><input${ssrRenderAttr("value", unref(filters).scheduledEnd)} type="datetime-local" class="filter-date" data-v-5412b226></div></div><div class="filter-field date-range" data-v-5412b226><label class="filter-label" data-v-5412b226>${ssrInterpolate(unref(t)("calls.filters.open_range"))}</label><div class="date-inputs" data-v-5412b226><input${ssrRenderAttr("value", unref(filters).openStart)} type="datetime-local" class="filter-date" data-v-5412b226><span class="range-separator" data-v-5412b226>—</span><input${ssrRenderAttr("value", unref(filters).openEnd)} type="datetime-local" class="filter-date" data-v-5412b226></div></div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/calls/CallsFilters.vue
var _sfc_setup$4 = CallsFilters_vue_vue_type_script_setup_true_lang_default.setup;
CallsFilters_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/calls/CallsFilters.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var CallsFilters_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(CallsFilters_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-5412b226"]]), { __name: "CallsFilters" });
//#endregion
//#region app/components/calls/CallsList.vue?vue&type=script&setup=true&lang.ts
var CallsList_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "CallsList",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const { latestNotification } = useNotificationSocket();
		const selectedCall = ref(null);
		const showDetailsModal = ref(false);
		const callToAssign = ref(null);
		const showAssignModal = ref(false);
		function closeCallDetails() {
			showDetailsModal.value = false;
			selectedCall.value = null;
		}
		async function handleResolved() {
			await fetchCalls();
			closeCallDetails();
		}
		async function handleCanceled() {
			await fetchCalls();
			closeCallDetails();
		}
		async function handleDeleted() {
			await fetchCalls();
			closeCallDetails();
		}
		function closeAssignModal() {
			showAssignModal.value = false;
			callToAssign.value = null;
		}
		async function handleAssigned() {
			await fetchCalls();
			closeAssignModal();
		}
		const activeFilters = ref({});
		function handleFilterChange(filters) {
			activeFilters.value = filters;
			fetchCalls();
		}
		const calls = ref([]);
		const loading = ref(false);
		const error = ref("");
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
			return {
				id: apiCall.call_id.toString(),
				displayId: `CL-${apiCall.call_id}`,
				category,
				serviceType: {
					name: serviceName,
					icon: category.icon
				},
				residentName: apiCall.resident_name || "",
				communityName: apiCall.community_name || "",
				communityId: apiCall.community_id,
				address: apiCall.address || "",
				currentAddress: apiCall.current_address || void 0,
				description: apiCall.description || void 0,
				scheduledDateTime: apiCall.scheduled_date ? `${apiCall.scheduled_date}${apiCall.scheduled_time_from ? " " + apiCall.scheduled_time_from : ""}` : null,
				officerName: apiCall.officer_name,
				status: apiCall.status === "resolved" ? "done" : apiCall.status,
				priority: apiCall.priority,
				createdOn: apiCall.created_on,
				callDateTime: apiCall.created_on,
				media: apiCall.media,
				audioUrl: apiCall.audio_url || void 0,
				videoUrl: apiCall.video_url || void 0
			};
		}
		function buildGetCallsRequest(filters) {
			const params = {
				is_open: true,
				limit: 100
			};
			if (filters.status) params.status = filters.status;
			if (filters.serviceType) params.category = filters.serviceType;
			if (filters.search) params.search_text = filters.search;
			if (filters.community) params.community_id = Number(filters.community);
			return params;
		}
		async function fetchCalls() {
			loading.value = true;
			error.value = "";
			try {
				const res = await callApi.getCalls(buildGetCallsRequest(activeFilters.value), { showLoading: false });
				calls.value = res.calls.map(mapCall);
			} catch (err) {
				error.value = err.message || "Failed to load calls";
			} finally {
				loading.value = false;
			}
		}
		function formatTime(iso) {
			return new Date(iso).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		function timeSince(iso) {
			const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1e3);
			if (seconds < 60) return `${seconds}s`;
			const minutes = Math.floor(seconds / 60);
			if (minutes < 60) return `${minutes}m`;
			return `${Math.floor(minutes / 60)}h`;
		}
		function formatDateTime(iso) {
			return new Date(iso).toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		const filteredCalls = computed(() => {
			return calls.value.filter((call) => {
				if (activeFilters.value.residentName && !call.residentName.toLowerCase().includes(activeFilters.value.residentName.toLowerCase())) return false;
				if (activeFilters.value.officerName) {
					if (!call.officerName) return false;
					if (!call.officerName.toLowerCase().includes(activeFilters.value.officerName.toLowerCase())) return false;
				}
				return true;
			}).sort((a, b) => {
				const aUrgent = [
					"medical",
					"security",
					"panic"
				].includes(a.category.type) && a.status === "new" ? 1 : 0;
				const bUrgent = [
					"medical",
					"security",
					"panic"
				].includes(b.category.type) && b.status === "new" ? 1 : 0;
				if (aUrgent !== bUrgent) return bUrgent - aUrgent;
				return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
			});
		});
		function isNewCall(call) {
			return call.status === "new";
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
		watch(() => latestNotification.value, (n) => {
			if (n && [
				"new_service_call",
				"new_emergency",
				"panic_button",
				"call_status_changed"
			].includes(n.type)) fetchCalls();
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "calls-list" }, _attrs))} data-v-661d7527>`);
			_push(ssrRenderComponent(CallsFilters_default, { onFilterChange: handleFilterChange }, null, _parent));
			if (unref(loading)) {
				_push(`<div class="empty-state" data-v-661d7527>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 24,
					class: "spinner"
				}, null, _parent));
				_push(`<span data-v-661d7527>Loading calls...</span></div>`);
			} else if (unref(error)) {
				_push(`<div class="empty-state" data-v-661d7527>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:alert-circle",
					size: 24
				}, null, _parent));
				_push(`<span data-v-661d7527>${ssrInterpolate(unref(error))}</span></div>`);
			} else if (unref(calls).length === 0) {
				_push(`<div class="empty-state" data-v-661d7527>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:phone-off",
					size: 24
				}, null, _parent));
				_push(`<span data-v-661d7527>No calls found</span></div>`);
			} else {
				_push(`<div class="table-wrapper" data-v-661d7527><table class="data-table" data-v-661d7527><thead data-v-661d7527><tr data-v-661d7527><th class="col-id" data-v-661d7527>Call #</th><th class="col-category" data-v-661d7527>${ssrInterpolate(unref(t)("calls.category"))}</th><th class="col-status" data-v-661d7527>${ssrInterpolate(unref(t)("calls.status"))}</th><th class="col-priority" data-v-661d7527>Priority</th><th class="col-resident" data-v-661d7527>${ssrInterpolate(unref(t)("calls.resident"))}</th><th class="col-community" data-v-661d7527>${ssrInterpolate(unref(t)("calls.community"))}</th><th class="col-address" data-v-661d7527>${ssrInterpolate(unref(t)("calls.address"))}</th><th class="col-created" data-v-661d7527>Created</th><th class="col-scheduled" data-v-661d7527>${ssrInterpolate(unref(t)("calls.scheduled_datetime"))}</th><th class="col-officer" data-v-661d7527>${ssrInterpolate(unref(t)("calls.officer"))}</th></tr></thead><tbody data-v-661d7527><!--[-->`);
				ssrRenderList(unref(filteredCalls), (call) => {
					_push(`<tr class="${ssrRenderClass([{
						"call-row--emergency": [
							"medical",
							"security",
							"panic"
						].includes(call.category.type) && call.status === "new",
						"call-row--panic": call.category.type === "panic" && call.status === "new"
					}, "call-row"])}" data-v-661d7527><td class="col-id" data-v-661d7527><span class="call-id" data-v-661d7527>${ssrInterpolate(call.displayId)}</span></td><td class="col-category" data-v-661d7527><div class="category-cell" data-v-661d7527>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: call.category.icon,
						size: 20,
						style: { color: call.category.color }
					}, null, _parent));
					_push(`<span class="category-label" data-v-661d7527>${ssrInterpolate(call.category.label)}</span></div></td><td class="col-status" data-v-661d7527><span class="${ssrRenderClass(["status-badge", getStatusClass(call.status)])}" data-v-661d7527>${ssrInterpolate(getStatusLabel(call.status))}</span></td><td class="col-priority" data-v-661d7527>`);
					if (call.priority) _push(`<span class="${ssrRenderClass(["priority-badge", getPriorityClass(call.priority)])}" data-v-661d7527>${ssrInterpolate(call.priority)}</span>`);
					else _push(`<span class="no-priority" data-v-661d7527>—</span>`);
					_push(`</td><td class="col-resident" data-v-661d7527><span class="resident-name" data-v-661d7527>${ssrInterpolate(call.residentName)}</span></td><td class="col-community" data-v-661d7527><span class="community-name" data-v-661d7527>${ssrInterpolate(call.communityName)}</span></td><td class="col-address" data-v-661d7527><span class="address-text" data-v-661d7527>${ssrInterpolate(call.address)}</span></td><td class="col-created"${ssrRenderAttr("title", formatDateTime(call.createdOn))} data-v-661d7527><span class="elapsed-time" data-v-661d7527>${ssrInterpolate(timeSince(call.createdOn))}</span><span class="created-time" data-v-661d7527>${ssrInterpolate(formatTime(call.createdOn))}</span></td><td class="col-scheduled" data-v-661d7527>`);
					if (call.scheduledDateTime) _push(`<span class="scheduled-time" data-v-661d7527>${ssrInterpolate(call.scheduledDateTime)}</span>`);
					else _push(`<span class="not-scheduled" data-v-661d7527>—</span>`);
					_push(`</td><td class="col-officer" data-v-661d7527>`);
					if (isNewCall(call)) {
						_push(`<div class="assign-btn-wrapper" data-v-661d7527><button class="assign-btn" data-v-661d7527>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:user-plus",
							size: 14
						}, null, _parent));
						_push(` ${ssrInterpolate(unref(t)("calls.assign"))}</button></div>`);
					} else _push(`<span class="officer-name" data-v-661d7527>${ssrInterpolate(call.officerName || "—")}</span>`);
					_push(`</td></tr>`);
				});
				_push(`<!--]--></tbody></table></div>`);
			}
			_push(ssrRenderComponent(CallDetailsModal_default, {
				show: unref(showDetailsModal),
				call: unref(selectedCall),
				onClose: closeCallDetails,
				onResolved: handleResolved,
				onCanceled: handleCanceled,
				onDeleted: handleDeleted
			}, null, _parent));
			_push(ssrRenderComponent(AssignCallModal_default, {
				show: unref(showAssignModal),
				call: unref(callToAssign),
				onClose: closeAssignModal,
				onAssigned: handleAssigned
			}, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/calls/CallsList.vue
var _sfc_setup$3 = CallsList_vue_vue_type_script_setup_true_lang_default.setup;
CallsList_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/calls/CallsList.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var CallsList_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(CallsList_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-661d7527"]]), { __name: "CallsList" });
//#endregion
//#region app/components/calls/CallsHistory.vue?vue&type=script&setup=true&lang.ts
var CallsHistory_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "CallsHistory",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const { latestNotification } = useNotificationSocket();
		const selectedCall = ref(null);
		const showDetailsModal = ref(false);
		function closeCallDetails() {
			showDetailsModal.value = false;
			selectedCall.value = null;
		}
		async function handleResolved() {
			await fetchHistoryCalls();
			closeCallDetails();
		}
		async function handleCanceled() {
			await fetchHistoryCalls();
			closeCallDetails();
		}
		async function handleDeleted() {
			await fetchHistoryCalls();
			closeCallDetails();
		}
		function hasConfirmationImages(call) {
			return !!(call.confirmationImages && call.confirmationImages.length > 0);
		}
		function hasOfficerComments(call) {
			return !!(call.officerComments && call.officerComments.trim().length > 0);
		}
		function hasLikeReaction(call) {
			return !!call.likeReaction;
		}
		function hasResidentComments(call) {
			return !!(call.residentComments && call.residentComments.trim().length > 0);
		}
		function getResidentCommentPreview(call) {
			if (!call.residentComments) return "";
			if (call.residentComments.length > 30) return call.residentComments.substring(0, 30) + "...";
			return call.residentComments;
		}
		const activeFilters = ref({});
		function handleFilterChange(filters) {
			activeFilters.value = filters;
			fetchHistoryCalls();
		}
		const historyCalls = ref([]);
		const loading = ref(false);
		const error = ref("");
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
		function getClosedDateTime(apiCall) {
			if (apiCall.resolved_on) return apiCall.resolved_on;
			if (apiCall.canceled_on) return apiCall.canceled_on;
		}
		function mapHistoryCall(apiCall) {
			const category = getCategoryInfo(apiCall.category);
			const serviceName = apiCall.service_type || category.label;
			const scheduledDateTime = apiCall.scheduled_date ? `${apiCall.scheduled_date}${apiCall.scheduled_time_from ? " " + apiCall.scheduled_time_from : ""}` : null;
			const closedDateTime = getClosedDateTime(apiCall);
			return {
				id: apiCall.call_id.toString(),
				displayId: `CL-${apiCall.call_id}`,
				category,
				serviceType: {
					name: serviceName,
					icon: category.icon
				},
				residentName: apiCall.resident_name || "",
				communityName: apiCall.community_name || "",
				address: apiCall.address || "",
				scheduledDateTime,
				closedDateTime,
				officerName: apiCall.officer_name,
				status: apiCall.status === "resolved" ? "done" : "canceled",
				priority: apiCall.priority,
				createdOn: apiCall.created_on,
				callDateTime: apiCall.created_on,
				currentAddress: apiCall.current_address || void 0,
				description: apiCall.description || void 0,
				media: apiCall.media,
				confirmationImages: apiCall.confirmation_media,
				audioUrl: apiCall.audio_url || void 0,
				videoUrl: apiCall.video_url || void 0,
				officerComments: apiCall.officer_comments || void 0,
				likeReaction: apiCall.reaction === 1,
				residentComments: apiCall.resident_comment || void 0
			};
		}
		function buildGetHistoryRequest(filters) {
			const params = {
				is_open: false,
				limit: 100
			};
			if (filters.status) params.status = filters.status;
			if (filters.serviceType) params.category = filters.serviceType;
			if (filters.search) params.search_text = filters.search;
			if (filters.community) params.community_id = Number(filters.community);
			return params;
		}
		async function fetchHistoryCalls() {
			loading.value = true;
			error.value = "";
			try {
				const res = await callApi.getCalls(buildGetHistoryRequest(activeFilters.value), { showLoading: false });
				historyCalls.value = res.calls.map(mapHistoryCall);
			} catch (err) {
				error.value = err.message || "Failed to load call history";
			} finally {
				loading.value = false;
			}
		}
		function formatTime(iso) {
			return new Date(iso).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		function timeSince(iso) {
			const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1e3);
			if (seconds < 60) return `${seconds}s`;
			const minutes = Math.floor(seconds / 60);
			if (minutes < 60) return `${minutes}m`;
			return `${Math.floor(minutes / 60)}h`;
		}
		function formatDateTime(iso) {
			return new Date(iso).toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		const filteredHistoryCalls = computed(() => {
			return historyCalls.value.filter((call) => {
				if (activeFilters.value.residentName && !call.residentName.toLowerCase().includes(activeFilters.value.residentName.toLowerCase())) return false;
				if (activeFilters.value.officerName) {
					if (!call.officerName) return false;
					if (!call.officerName.toLowerCase().includes(activeFilters.value.officerName.toLowerCase())) return false;
				}
				return true;
			}).sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
		});
		function getPriorityClass(priority) {
			switch (priority || "normal") {
				case "urgent": return "priority-urgent";
				case "important": return "priority-important";
				case "normal": return "priority-normal";
				case "low": return "priority-low";
				default: return "priority-normal";
			}
		}
		function getStatusClass(status) {
			switch (status) {
				case "done":
				case "resolved": return "status-done";
				case "canceled": return "status-canceled";
				default: return status;
			}
		}
		function getStatusLabel(status) {
			switch (status) {
				case "done":
				case "resolved": return t("calls.status.done");
				case "canceled": return t("calls.status.canceled");
				default: return status;
			}
		}
		watch(() => latestNotification.value, (n) => {
			if (n && [
				"new_service_call",
				"new_emergency",
				"panic_button",
				"call_status_changed"
			].includes(n.type)) fetchHistoryCalls();
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "calls-history" }, _attrs))} data-v-881cc746>`);
			_push(ssrRenderComponent(CallsFilters_default, { onFilterChange: handleFilterChange }, null, _parent));
			if (unref(loading)) {
				_push(`<div class="empty-state" data-v-881cc746>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 24,
					class: "spinner"
				}, null, _parent));
				_push(`<span data-v-881cc746>Loading history...</span></div>`);
			} else if (unref(error)) {
				_push(`<div class="empty-state" data-v-881cc746>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:alert-circle",
					size: 24
				}, null, _parent));
				_push(`<span data-v-881cc746>${ssrInterpolate(unref(error))}</span></div>`);
			} else if (unref(historyCalls).length === 0) {
				_push(`<div class="empty-state" data-v-881cc746>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:phone-off",
					size: 24
				}, null, _parent));
				_push(`<span data-v-881cc746>No history found</span></div>`);
			} else {
				_push(`<div class="table-wrapper" data-v-881cc746><table class="data-table" data-v-881cc746><thead data-v-881cc746><tr data-v-881cc746><th class="col-id" data-v-881cc746>Call #</th><th class="col-category" data-v-881cc746>${ssrInterpolate(unref(t)("calls.category"))}</th><th class="col-status" data-v-881cc746>${ssrInterpolate(unref(t)("calls.status"))}</th><th class="col-priority" data-v-881cc746>Priority</th><th class="col-resident" data-v-881cc746>${ssrInterpolate(unref(t)("calls.resident"))}</th><th class="col-community" data-v-881cc746>${ssrInterpolate(unref(t)("calls.community"))}</th><th class="col-address" data-v-881cc746>${ssrInterpolate(unref(t)("calls.address"))}</th><th class="col-created" data-v-881cc746>Created</th><th class="col-scheduled" data-v-881cc746>${ssrInterpolate(unref(t)("calls.scheduled_datetime"))}</th><th class="col-closed" data-v-881cc746>${ssrInterpolate(unref(t)("calls.closed_datetime"))}</th><th class="col-officer" data-v-881cc746>${ssrInterpolate(unref(t)("calls.officer"))}</th><th class="col-confirmation" data-v-881cc746>${ssrInterpolate(unref(t)("calls.confirmation_short"))}</th><th class="col-comments" data-v-881cc746>${ssrInterpolate(unref(t)("calls.officer_comments_short"))}</th><th class="col-feedback" data-v-881cc746>${ssrInterpolate(unref(t)("calls.resident_feedback_short"))}</th></tr></thead><tbody data-v-881cc746><!--[-->`);
				ssrRenderList(unref(filteredHistoryCalls), (call) => {
					_push(`<tr class="call-row" data-v-881cc746><td class="col-id" data-v-881cc746><span class="call-id" data-v-881cc746>${ssrInterpolate(call.displayId)}</span></td><td class="col-category" data-v-881cc746><div class="category-cell" data-v-881cc746>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: call.category.icon,
						size: 20,
						style: { color: call.category.color }
					}, null, _parent));
					_push(`<span class="category-label" data-v-881cc746>${ssrInterpolate(call.category.label)}</span></div></td><td class="col-status" data-v-881cc746><span class="${ssrRenderClass(["status-badge", getStatusClass(call.status)])}" data-v-881cc746>${ssrInterpolate(getStatusLabel(call.status))}</span></td><td class="col-priority" data-v-881cc746>`);
					if (call.priority) _push(`<span class="${ssrRenderClass(["priority-badge", getPriorityClass(call.priority)])}" data-v-881cc746>${ssrInterpolate(call.priority)}</span>`);
					else _push(`<span class="no-content" data-v-881cc746>—</span>`);
					_push(`</td><td class="col-resident" data-v-881cc746>${ssrInterpolate(call.residentName)}</td><td class="col-community" data-v-881cc746>${ssrInterpolate(call.communityName)}</td><td class="col-address" data-v-881cc746><span class="address-text" data-v-881cc746>${ssrInterpolate(call.address)}</span></td><td class="col-created"${ssrRenderAttr("title", formatDateTime(call.createdOn))} data-v-881cc746><span class="elapsed-time" data-v-881cc746>${ssrInterpolate(timeSince(call.createdOn))}</span><span class="created-time" data-v-881cc746>${ssrInterpolate(formatTime(call.createdOn))}</span></td><td class="col-scheduled" data-v-881cc746>${ssrInterpolate(call.scheduledDateTime || "—")}</td><td class="col-closed" data-v-881cc746>${ssrInterpolate(call.closedDateTime || "—")}</td><td class="col-officer" data-v-881cc746>${ssrInterpolate(call.officerName || "—")}</td><td class="col-confirmation" data-v-881cc746>`);
					if (hasConfirmationImages(call)) _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:image",
						size: 18,
						class: "has-content-icon"
					}, null, _parent));
					else _push(`<span class="no-content" data-v-881cc746>—</span>`);
					_push(`</td><td class="col-comments" data-v-881cc746>`);
					if (hasOfficerComments(call)) _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:message-square",
						size: 18,
						class: "has-content-icon"
					}, null, _parent));
					else _push(`<span class="no-content" data-v-881cc746>—</span>`);
					_push(`</td><td class="col-feedback" data-v-881cc746>`);
					if (hasLikeReaction(call) || hasResidentComments(call)) {
						_push(`<div class="feedback-cell" data-v-881cc746>`);
						if (hasLikeReaction(call)) _push(ssrRenderComponent(_component_Icon, {
							name: "lucide:thumbs-up",
							size: 16,
							class: "like-icon-small"
						}, null, _parent));
						else _push(`<!---->`);
						if (hasResidentComments(call)) _push(`<span class="comment-preview" data-v-881cc746>${ssrInterpolate(getResidentCommentPreview(call))}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else _push(`<span class="no-content" data-v-881cc746>—</span>`);
					_push(`</td></tr>`);
				});
				_push(`<!--]--></tbody></table></div>`);
			}
			_push(ssrRenderComponent(CallDetailsModal_default, {
				show: unref(showDetailsModal),
				call: unref(selectedCall),
				onClose: closeCallDetails,
				onResolved: handleResolved,
				onCanceled: handleCanceled,
				onDeleted: handleDeleted
			}, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/calls/CallsHistory.vue
var _sfc_setup$2 = CallsHistory_vue_vue_type_script_setup_true_lang_default.setup;
CallsHistory_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/calls/CallsHistory.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var CallsHistory_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(CallsHistory_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-881cc746"]]), { __name: "CallsHistory" });
//#endregion
//#region app/components/calls/IncidentReports.vue?vue&type=script&setup=true&lang.ts
var IncidentReports_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "IncidentReports",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const reports = ref([
			{
				id: "RPT-2024-001",
				title: "Suspicious Activity at Main Gate",
				template: "Security Incident Report",
				community: "Willow Creek",
				officer: "John Smith",
				submittedAt: "2024-06-15T14:30:00",
				status: "submitted",
				sourceCall: "CALL-884",
				reviewRequired: true,
				category: "incident",
				content: "Officer observed suspicious individual near the main gate. Individual was questioned and identified as a resident's guest. No further action required.",
				originalContent: "Officer observed suspicious individual near the main gate. Individual was questioned and identified as a resident's guest. No further action required.",
				managerNotes: "",
				sections: [
					{
						id: "sec1",
						title: "Incident Summary",
						clientVisible: true,
						content: "Suspicious activity at main gate"
					},
					{
						id: "sec2",
						title: "Officer Actions",
						clientVisible: true,
						content: "Questioned individual, verified identity"
					},
					{
						id: "sec3",
						title: "Resolution",
						clientVisible: false,
						content: "Individual cleared, no threat identified"
					}
				],
				auditTrail: [{
					id: "1",
					timestamp: "2024-06-15T14:30:00",
					user: "John Smith",
					action: "submit",
					details: "Report submitted"
				}]
			},
			{
				id: "RPT-2024-002",
				title: "Daily Patrol Summary",
				template: "Daily Activity Report",
				community: "Oakwood Estates",
				officer: "Sarah Johnson",
				submittedAt: "2024-06-15T18:00:00",
				status: "under_review",
				reviewRequired: false,
				category: "daily_activity",
				content: "Completed routine patrol of all sectors. All gates secure. No incidents reported. Assisted 2 residents with access issues.",
				originalContent: "Completed routine patrol of all sectors. All gates secure. No incidents reported. Assisted 2 residents with access issues.",
				managerNotes: "",
				sections: [{
					id: "sec1",
					title: "Patrol Summary",
					clientVisible: true,
					content: "Routine patrol completed"
				}],
				auditTrail: [{
					id: "1",
					timestamp: "2024-06-15T18:00:00",
					user: "Sarah Johnson",
					action: "submit",
					details: "Report submitted"
				}, {
					id: "2",
					timestamp: "2024-06-16T09:00:00",
					user: "Manager",
					action: "edit",
					details: "Report opened for review",
					field: "status",
					oldValue: "submitted",
					newValue: "under_review"
				}]
			},
			{
				id: "RPT-2024-003",
				title: "Vehicle Break-in Attempt",
				template: "Security Incident Report",
				community: "Pine Valley",
				officer: "Mike Davis",
				submittedAt: "2024-06-14T09:15:00",
				status: "changes_requested",
				sourceCall: "CALL-875",
				reviewRequired: true,
				category: "incident",
				content: "Attempted break-in reported in parking lot B. Vehicle was damaged but nothing stolen. Police notified and report filed.",
				originalContent: "Attempted break-in reported in parking lot B. Vehicle was damaged but nothing stolen. Police notified and report filed.",
				managerNotes: "Please add photos of vehicle damage and police report number.",
				sections: [{
					id: "sec1",
					title: "Incident Details",
					clientVisible: true,
					content: "Break-in attempt parking lot B"
				}, {
					id: "sec2",
					title: "Vehicle Damage",
					clientVisible: true,
					content: "Damage documented"
				}],
				auditTrail: [{
					id: "1",
					timestamp: "2024-06-14T09:15:00",
					user: "Mike Davis",
					action: "submit",
					details: "Report submitted"
				}, {
					id: "2",
					timestamp: "2024-06-14T10:30:00",
					user: "Manager",
					action: "request_changes",
					details: "Please add photos of vehicle damage and police report number."
				}]
			},
			{
				id: "RPT-2024-004",
				title: "Noise Complaint Resolution",
				template: "Custom Report",
				community: "Willow Creek",
				officer: "Emily Wilson",
				submittedAt: "2024-06-14T16:45:00",
				status: "approved",
				sourceCall: "CALL-871",
				reviewRequired: true,
				category: "custom",
				content: "Noise complaint from resident in Building C Unit 12. Spoke with residents who agreed to keep volume down after 10pm.",
				originalContent: "Noise complaint from resident in Building C Unit 12. Spoke with residents who agreed to keep volume down after 10pm.",
				managerNotes: "",
				sections: [{
					id: "sec1",
					title: "Complaint Details",
					clientVisible: true,
					content: "Noise complaint Building C Unit 12"
				}, {
					id: "sec2",
					title: "Resolution",
					clientVisible: true,
					content: "Agreement reached with residents"
				}],
				auditTrail: [{
					id: "1",
					timestamp: "2024-06-14T16:45:00",
					user: "Emily Wilson",
					action: "submit",
					details: "Report submitted"
				}, {
					id: "2",
					timestamp: "2024-06-15T10:00:00",
					user: "Manager",
					action: "approve",
					details: "Report approved"
				}]
			},
			{
				id: "RPT-2024-005",
				title: "Emergency Drill Documentation",
				template: "Daily Activity Report",
				community: "Oakwood Estates",
				officer: "John Smith",
				submittedAt: "2024-06-13T11:00:00",
				status: "delivered",
				reviewRequired: false,
				category: "daily_activity",
				content: "Emergency evacuation drill completed successfully. All residents participated. Response time improved by 15% from last quarter.",
				originalContent: "Emergency evacuation drill completed successfully. All residents participated. Response time improved by 15% from last quarter.",
				managerNotes: "",
				sections: [{
					id: "sec1",
					title: "Drill Summary",
					clientVisible: true,
					content: "Evacuation drill completed"
				}, {
					id: "sec2",
					title: "Performance Metrics",
					clientVisible: true,
					content: "15% improvement in response time"
				}],
				auditTrail: [
					{
						id: "1",
						timestamp: "2024-06-13T11:00:00",
						user: "John Smith",
						action: "submit",
						details: "Report submitted"
					},
					{
						id: "2",
						timestamp: "2024-06-14T09:00:00",
						user: "Manager",
						action: "approve",
						details: "Report approved"
					},
					{
						id: "3",
						timestamp: "2024-06-14T14:00:00",
						user: "Manager",
						action: "deliver",
						details: "Report delivered to client"
					}
				]
			}
		]);
		const selectedCommunity = ref("");
		const selectedStatus = ref("");
		const selectedCategory = ref("");
		const searchQuery = ref("");
		const dateFrom = ref("");
		const dateTo = ref("");
		const reviewRequired = ref("");
		const communities = [
			"Willow Creek",
			"Oakwood Estates",
			"Pine Valley"
		];
		const statuses = [
			{
				value: "submitted",
				label: "Submitted"
			},
			{
				value: "under_review",
				label: "Under Review"
			},
			{
				value: "changes_requested",
				label: "Changes Requested"
			},
			{
				value: "approved",
				label: "Approved"
			},
			{
				value: "delivered",
				label: "Delivered"
			}
		];
		const categories = [
			{
				value: "incident",
				label: "Incident"
			},
			{
				value: "daily_activity",
				label: "Daily Activity"
			},
			{
				value: "custom",
				label: "Custom"
			}
		];
		const filteredReports = computed(() => {
			return reports.value.filter((report) => {
				if (selectedCommunity.value && report.community !== selectedCommunity.value) return false;
				if (selectedStatus.value && report.status !== selectedStatus.value) return false;
				if (selectedCategory.value && report.category !== selectedCategory.value) return false;
				if (reviewRequired.value !== "") {
					const required = reviewRequired.value === "yes";
					if (report.reviewRequired !== required) return false;
				}
				if (dateFrom.value && new Date(report.submittedAt) < new Date(dateFrom.value)) return false;
				if (dateTo.value && new Date(report.submittedAt) > /* @__PURE__ */ new Date(dateTo.value + "T23:59:59")) return false;
				if (searchQuery.value) {
					const query = searchQuery.value.toLowerCase();
					return report.id.toLowerCase().includes(query) || report.title.toLowerCase().includes(query) || report.officer.toLowerCase().includes(query);
				}
				return true;
			});
		});
		function formatDateTime(dateStr) {
			return new Date(dateStr).toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		const selectedReport = ref(null);
		const showReportModal = ref(false);
		const isEditing = ref(false);
		const editedContent = ref("");
		const editedManagerNotes = ref("");
		const showApprovalPanel = ref(false);
		const managementSummary = ref("");
		const originalStatusBeforeReview = ref("");
		const hasActionBeenTaken = ref(false);
		const showAuditTrail = ref(false);
		const changeRequestComments = ref("");
		const showChangeRequestModal = ref(false);
		function closeReportModal() {
			if (!hasActionBeenTaken.value && originalStatusBeforeReview.value === "submitted" && selectedReport.value) {
				const originalReport = reports.value.find((r) => r.id === selectedReport.value.id);
				if (originalReport && originalReport.status === "under_review") {
					originalReport.status = "submitted";
					const auditEntry = {
						id: Date.now().toString(),
						timestamp: (/* @__PURE__ */ new Date()).toISOString(),
						user: "Manager",
						action: "edit",
						details: "Review closed without action - status reverted",
						field: "status",
						oldValue: "under_review",
						newValue: "submitted"
					};
					originalReport.auditTrail.push(auditEntry);
				}
			}
			showReportModal.value = false;
			showApprovalPanel.value = false;
			isEditing.value = false;
			showAuditTrail.value = false;
			showChangeRequestModal.value = false;
			setTimeout(() => {
				selectedReport.value = null;
			}, 300);
		}
		function toggleEditMode() {
			if (isEditing.value) {
				if (selectedReport.value) {
					const originalReport = reports.value.find((r) => r.id === selectedReport.value.id);
					if (originalReport) {
						if (originalReport.content !== editedContent.value) {
							const auditEntry = {
								id: Date.now().toString(),
								timestamp: (/* @__PURE__ */ new Date()).toISOString(),
								user: "Manager",
								action: "edit",
								details: "Content updated by manager",
								field: "content",
								oldValue: originalReport.content,
								newValue: editedContent.value
							};
							originalReport.auditTrail.push(auditEntry);
							originalReport.content = editedContent.value;
						}
						if (originalReport.managerNotes !== editedManagerNotes.value) {
							const auditEntry = {
								id: (Date.now() + 1).toString(),
								timestamp: (/* @__PURE__ */ new Date()).toISOString(),
								user: "Manager",
								action: "note",
								details: "Manager notes added/updated",
								field: "managerNotes",
								oldValue: originalReport.managerNotes,
								newValue: editedManagerNotes.value
							};
							originalReport.auditTrail.push(auditEntry);
							originalReport.managerNotes = editedManagerNotes.value;
						}
					}
				}
			}
			isEditing.value = !isEditing.value;
		}
		function handleApprove() {
			if (!selectedReport.value) return;
			if (!showApprovalPanel.value) {
				showApprovalPanel.value = true;
				return;
			}
			const originalReport = reports.value.find((r) => r.id === selectedReport.value.id);
			if (originalReport) {
				originalReport.status = "approved";
				originalReport.sections = selectedReport.value.sections;
				const auditEntry = {
					id: Date.now().toString(),
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					user: "Manager",
					action: "approve",
					details: managementSummary.value ? `Approved with summary: ${managementSummary.value}` : "Report approved"
				};
				originalReport.auditTrail.push(auditEntry);
				hasActionBeenTaken.value = true;
			}
			closeReportModal();
		}
		function handleRequestChanges() {
			if (!selectedReport.value) return;
			if (!showChangeRequestModal.value) {
				showChangeRequestModal.value = true;
				return;
			}
			if (!changeRequestComments.value.trim()) {
				alert(t("reports.comments_required"));
				return;
			}
			const originalReport = reports.value.find((r) => r.id === selectedReport.value.id);
			if (originalReport) {
				originalReport.status = "changes_requested";
				const auditEntry = {
					id: Date.now().toString(),
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					user: "Manager",
					action: "request_changes",
					details: changeRequestComments.value
				};
				originalReport.auditTrail.push(auditEntry);
				hasActionBeenTaken.value = true;
			}
			showChangeRequestModal.value = false;
			closeReportModal();
		}
		function handleDeliver() {
			if (!selectedReport.value) return;
			const originalReport = reports.value.find((r) => r.id === selectedReport.value.id);
			if (originalReport) {
				originalReport.status = "delivered";
				const auditEntry = {
					id: Date.now().toString(),
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					user: "Manager",
					action: "deliver",
					details: "Report delivered to client"
				};
				originalReport.auditTrail.push(auditEntry);
				hasActionBeenTaken.value = true;
			}
			closeReportModal();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_Badge = Badge_default;
			const _component_AppModal = AppModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "incident-reports" }, _attrs))} data-v-8b77b923><div class="filters-bar" data-v-8b77b923><div class="filter-group search-group" data-v-8b77b923><label class="filter-label" data-v-8b77b923>${ssrInterpolate(unref(t)("calls.filters.search"))}</label><div class="search-input-wrapper" data-v-8b77b923>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16,
				class: "search-icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", unref(searchQuery))} type="text" class="search-input"${ssrRenderAttr("placeholder", unref(t)("reports.filters.search_placeholder"))} data-v-8b77b923></div></div><div class="filter-group" data-v-8b77b923><label class="filter-label" data-v-8b77b923>${ssrInterpolate(unref(t)("reports.filters.community"))}</label><select class="filter-select" data-v-8b77b923><option value="" data-v-8b77b923${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCommunity)) ? ssrLooseContain(unref(selectedCommunity), "") : ssrLooseEqual(unref(selectedCommunity), "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("calls.filters.all"))}</option><!--[-->`);
			ssrRenderList(communities, (community) => {
				_push(`<option${ssrRenderAttr("value", community)} data-v-8b77b923${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCommunity)) ? ssrLooseContain(unref(selectedCommunity), community) : ssrLooseEqual(unref(selectedCommunity), community)) ? " selected" : ""}>${ssrInterpolate(community)}</option>`);
			});
			_push(`<!--]--></select></div><div class="filter-group" data-v-8b77b923><label class="filter-label" data-v-8b77b923>${ssrInterpolate(unref(t)("reports.filters.status"))}</label><select class="filter-select" data-v-8b77b923><option value="" data-v-8b77b923${ssrIncludeBooleanAttr(Array.isArray(unref(selectedStatus)) ? ssrLooseContain(unref(selectedStatus), "") : ssrLooseEqual(unref(selectedStatus), "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("calls.filters.all"))}</option><!--[-->`);
			ssrRenderList(statuses, (status) => {
				_push(`<option${ssrRenderAttr("value", status.value)} data-v-8b77b923${ssrIncludeBooleanAttr(Array.isArray(unref(selectedStatus)) ? ssrLooseContain(unref(selectedStatus), status.value) : ssrLooseEqual(unref(selectedStatus), status.value)) ? " selected" : ""}>${ssrInterpolate(status.label)}</option>`);
			});
			_push(`<!--]--></select></div><div class="filter-group" data-v-8b77b923><label class="filter-label" data-v-8b77b923>${ssrInterpolate(unref(t)("reports.filters.category"))}</label><select class="filter-select" data-v-8b77b923><option value="" data-v-8b77b923${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCategory)) ? ssrLooseContain(unref(selectedCategory), "") : ssrLooseEqual(unref(selectedCategory), "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("calls.filters.all"))}</option><!--[-->`);
			ssrRenderList(categories, (cat) => {
				_push(`<option${ssrRenderAttr("value", cat.value)} data-v-8b77b923${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCategory)) ? ssrLooseContain(unref(selectedCategory), cat.value) : ssrLooseEqual(unref(selectedCategory), cat.value)) ? " selected" : ""}>${ssrInterpolate(cat.label)}</option>`);
			});
			_push(`<!--]--></select></div><div class="filter-group" data-v-8b77b923><label class="filter-label" data-v-8b77b923>${ssrInterpolate(unref(t)("reports.filters.review_required"))}</label><select class="filter-select" data-v-8b77b923><option value="" data-v-8b77b923${ssrIncludeBooleanAttr(Array.isArray(unref(reviewRequired)) ? ssrLooseContain(unref(reviewRequired), "") : ssrLooseEqual(unref(reviewRequired), "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("calls.filters.all"))}</option><option value="yes" data-v-8b77b923${ssrIncludeBooleanAttr(Array.isArray(unref(reviewRequired)) ? ssrLooseContain(unref(reviewRequired), "yes") : ssrLooseEqual(unref(reviewRequired), "yes")) ? " selected" : ""}>${ssrInterpolate(unref(t)("common.yes"))}</option><option value="no" data-v-8b77b923${ssrIncludeBooleanAttr(Array.isArray(unref(reviewRequired)) ? ssrLooseContain(unref(reviewRequired), "no") : ssrLooseEqual(unref(reviewRequired), "no")) ? " selected" : ""}>${ssrInterpolate(unref(t)("common.no"))}</option></select></div><div class="filter-group date-range" data-v-8b77b923><label class="filter-label" data-v-8b77b923>${ssrInterpolate(unref(t)("reports.filters.date_range"))}</label><div class="date-inputs" data-v-8b77b923><input${ssrRenderAttr("value", unref(dateFrom))} type="date" class="filter-input" data-v-8b77b923><span class="date-separator" data-v-8b77b923>-</span><input${ssrRenderAttr("value", unref(dateTo))} type="date" class="filter-input" data-v-8b77b923></div></div><button class="clear-btn" data-v-8b77b923>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:x",
				size: 14
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("calls.filters.clear"))}</button></div><div class="table-container" data-v-8b77b923><table class="reports-table" data-v-8b77b923><thead data-v-8b77b923><tr data-v-8b77b923><th data-v-8b77b923>${ssrInterpolate(unref(t)("reports.report_id"))}</th><th data-v-8b77b923>${ssrInterpolate(unref(t)("reports.report_title"))}</th><th data-v-8b77b923>${ssrInterpolate(unref(t)("reports.template"))}</th><th data-v-8b77b923>${ssrInterpolate(unref(t)("reports.community"))}</th><th data-v-8b77b923>${ssrInterpolate(unref(t)("reports.officer"))}</th><th data-v-8b77b923>${ssrInterpolate(unref(t)("reports.submitted_at"))}</th><th data-v-8b77b923>${ssrInterpolate(unref(t)("reports.status"))}</th><th data-v-8b77b923>${ssrInterpolate(unref(t)("reports.source_call"))}</th><th data-v-8b77b923>${ssrInterpolate(unref(t)("reports.review_required"))}</th></tr></thead><tbody data-v-8b77b923><!--[-->`);
			ssrRenderList(unref(filteredReports), (report) => {
				_push(`<tr class="report-row clickable" data-v-8b77b923><td class="report-id" data-v-8b77b923>${ssrInterpolate(report.id)}</td><td class="report-title" data-v-8b77b923>${ssrInterpolate(report.title)}</td><td data-v-8b77b923>${ssrInterpolate(report.template)}</td><td data-v-8b77b923>${ssrInterpolate(report.community)}</td><td data-v-8b77b923>${ssrInterpolate(report.officer)}</td><td data-v-8b77b923>${ssrInterpolate(formatDateTime(report.submittedAt))}</td><td data-v-8b77b923>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "report",
					value: report.status
				}, null, _parent));
				_push(`</td><td data-v-8b77b923>`);
				if (report.sourceCall) _push(`<span class="source-call" data-v-8b77b923>${ssrInterpolate(report.sourceCall)}</span>`);
				else _push(`<span class="no-call" data-v-8b77b923>-</span>`);
				_push(`</td><td data-v-8b77b923>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "review",
					value: report.reviewRequired
				}, null, _parent));
				_push(`</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div>`);
			if (unref(filteredReports).length === 0) {
				_push(`<div class="empty-state" data-v-8b77b923>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:file-text",
					size: 48,
					class: "empty-icon"
				}, null, _parent));
				_push(`<p class="empty-text" data-v-8b77b923>${ssrInterpolate(unref(t)("reports.no_reports"))}</p></div>`);
			} else _push(`<!---->`);
			_push(ssrRenderComponent(_component_AppModal, {
				show: unref(showReportModal),
				title: unref(t)("reports.report_details"),
				"cancel-text": "",
				"ok-text": unref(t)("common.close"),
				onClose: closeReportModal,
				onOk: closeReportModal
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(selectedReport)) {
							_push(`<div class="report-details" data-v-8b77b923${_scopeId}><div class="detail-header" data-v-8b77b923${_scopeId}><div class="detail-header-main" data-v-8b77b923${_scopeId}><h3 class="detail-title" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(selectedReport).title)}</h3><div class="detail-meta" data-v-8b77b923${_scopeId}>`);
							_push(ssrRenderComponent(_component_Badge, {
								type: "report",
								value: unref(selectedReport).status
							}, null, _parent, _scopeId));
							_push(ssrRenderComponent(_component_Badge, {
								type: "review",
								value: unref(selectedReport).reviewRequired
							}, null, _parent, _scopeId));
							_push(`<span class="detail-id" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(selectedReport).id)}</span></div></div>`);
							if (unref(selectedReport).status === "under_review") {
								_push(`<button class="edit-toggle-btn" data-v-8b77b923${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: unref(isEditing) ? "lucide:save" : "lucide:edit",
									size: 16
								}, null, _parent, _scopeId));
								_push(` ${ssrInterpolate(unref(isEditing) ? unref(t)("reports.save_changes") : unref(t)("reports.edit_report"))}</button>`);
							} else _push(`<!---->`);
							_push(`</div><div class="detail-info" data-v-8b77b923${_scopeId}><div class="info-row" data-v-8b77b923${_scopeId}><span class="info-label" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.officer"))}:</span><span class="info-value" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(selectedReport).officer)}</span></div><div class="info-row" data-v-8b77b923${_scopeId}><span class="info-label" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.community"))}:</span><span class="info-value" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(selectedReport).community)}</span></div><div class="info-row" data-v-8b77b923${_scopeId}><span class="info-label" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.submitted_at"))}:</span><span class="info-value" data-v-8b77b923${_scopeId}>${ssrInterpolate(formatDateTime(unref(selectedReport).submittedAt))}</span></div><div class="info-row" data-v-8b77b923${_scopeId}><span class="info-label" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.template"))}:</span><span class="info-value" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(selectedReport).template)}</span></div></div>`);
							if (!unref(isEditing) && !unref(showApprovalPanel)) {
								_push(`<div class="detail-content" data-v-8b77b923${_scopeId}><h4 class="section-title" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.report_content"))}</h4><div class="content-box" data-v-8b77b923${_scopeId}><p data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(selectedReport).content)}</p></div>`);
								if (unref(selectedReport).managerNotes) _push(`<div class="manager-notes" data-v-8b77b923${_scopeId}><h5 class="notes-title" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.manager_notes"))}</h5><p class="notes-content" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(selectedReport).managerNotes)}</p></div>`);
								else _push(`<!---->`);
								_push(`<div class="report-sections" data-v-8b77b923${_scopeId}><h5 class="section-subtitle" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.sections"))}</h5><!--[-->`);
								ssrRenderList(unref(selectedReport).sections, (section) => {
									_push(`<div class="section-item" data-v-8b77b923${_scopeId}><div class="section-item-header" data-v-8b77b923${_scopeId}><span class="section-item-title" data-v-8b77b923${_scopeId}>${ssrInterpolate(section.title)}</span>`);
									_push(ssrRenderComponent(_component_Badge, {
										type: "active",
										value: section.clientVisible,
										class: section.clientVisible ? "badge--active-yes" : "badge--active-no"
									}, null, _parent, _scopeId));
									_push(`</div><p class="section-item-content" data-v-8b77b923${_scopeId}>${ssrInterpolate(section.content)}</p></div>`);
								});
								_push(`<!--]--></div></div>`);
							} else _push(`<!---->`);
							if (unref(isEditing)) {
								_push(`<div class="edit-mode" data-v-8b77b923${_scopeId}><h4 class="section-title" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.edit_content"))}</h4><textarea class="edit-textarea" rows="6"${ssrRenderAttr("placeholder", unref(t)("reports.content_placeholder"))} data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(editedContent))}</textarea><h4 class="section-title" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.manager_notes"))}</h4><textarea class="edit-textarea" rows="3"${ssrRenderAttr("placeholder", unref(t)("reports.notes_placeholder"))} data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(editedManagerNotes))}</textarea><div class="audit-trail-toggle" data-v-8b77b923${_scopeId}><button class="toggle-btn" data-v-8b77b923${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: unref(showAuditTrail) ? "lucide:chevron-up" : "lucide:chevron-down",
									size: 16
								}, null, _parent, _scopeId));
								_push(` ${ssrInterpolate(unref(showAuditTrail) ? unref(t)("reports.hide_audit_trail") : unref(t)("reports.show_audit_trail"))}</button></div>`);
								if (unref(showAuditTrail)) {
									_push(`<div class="audit-trail" data-v-8b77b923${_scopeId}><h5 class="section-subtitle" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.audit_trail"))}</h5><!--[-->`);
									ssrRenderList(unref(selectedReport).auditTrail, (entry) => {
										_push(`<div class="audit-entry" data-v-8b77b923${_scopeId}><div class="audit-entry-header" data-v-8b77b923${_scopeId}><span class="audit-time" data-v-8b77b923${_scopeId}>${ssrInterpolate(formatDateTime(entry.timestamp))}</span><span class="audit-user" data-v-8b77b923${_scopeId}>${ssrInterpolate(entry.user)}</span>`);
										_push(ssrRenderComponent(_component_Badge, {
											type: "report",
											value: entry.action
										}, null, _parent, _scopeId));
										_push(`</div><p class="audit-details" data-v-8b77b923${_scopeId}>${ssrInterpolate(entry.details)}</p>`);
										if (entry.field) {
											_push(`<div class="audit-field-change" data-v-8b77b923${_scopeId}><span class="field-name" data-v-8b77b923${_scopeId}>${ssrInterpolate(entry.field)}:</span><span class="old-value" data-v-8b77b923${_scopeId}>${ssrInterpolate(entry.oldValue)}</span>`);
											_push(ssrRenderComponent(_component_Icon, {
												name: "lucide:arrow-right",
												size: 14
											}, null, _parent, _scopeId));
											_push(`<span class="new-value" data-v-8b77b923${_scopeId}>${ssrInterpolate(entry.newValue)}</span></div>`);
										} else _push(`<!---->`);
										_push(`</div>`);
									});
									_push(`<!--]--></div>`);
								} else _push(`<!---->`);
								_push(`</div>`);
							} else _push(`<!---->`);
							if (unref(showApprovalPanel)) {
								_push(`<div class="approval-panel" data-v-8b77b923${_scopeId}><h4 class="section-title" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.section_delivery_panel"))}</h4><div class="section-checklist" data-v-8b77b923${_scopeId}><h5 class="section-subtitle" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.section_inclusion"))}</h5><!--[-->`);
								ssrRenderList(unref(selectedReport).sections, (section) => {
									_push(`<div class="section-check-item" data-v-8b77b923${_scopeId}><label class="check-label" data-v-8b77b923${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(section.clientVisible) ? ssrLooseContain(section.clientVisible, null) : section.clientVisible) ? " checked" : ""} type="checkbox" class="check-input" data-v-8b77b923${_scopeId}><span class="check-text" data-v-8b77b923${_scopeId}>${ssrInterpolate(section.title)}</span></label></div>`);
								});
								_push(`<!--]--></div><div class="management-summary" data-v-8b77b923${_scopeId}><h5 class="section-subtitle" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.management_summary"))}</h5><textarea class="edit-textarea" rows="3" maxlength="1000"${ssrRenderAttr("placeholder", unref(t)("reports.summary_placeholder"))} data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(managementSummary))}</textarea><span class="char-count" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(managementSummary).length)}/1000</span></div></div>`);
							} else _push(`<!---->`);
							if (unref(showChangeRequestModal)) _push(`<div class="change-request-panel" data-v-8b77b923${_scopeId}><h4 class="section-title" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.request_changes"))}</h4><p class="panel-description" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.changes_description"))}</p><textarea class="edit-textarea" rows="4" maxlength="1000"${ssrRenderAttr("placeholder", unref(t)("reports.comments_placeholder"))} data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(changeRequestComments))}</textarea><span class="char-count" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(changeRequestComments).length)}/1000</span></div>`);
							else _push(`<!---->`);
							if (!unref(showChangeRequestModal)) {
								_push(`<div class="detail-actions" data-v-8b77b923${_scopeId}>`);
								if (!unref(showApprovalPanel) && unref(selectedReport).status === "under_review") {
									_push(`<button class="action-btn approve-btn" data-v-8b77b923${_scopeId}>`);
									_push(ssrRenderComponent(_component_Icon, {
										name: "lucide:check",
										size: 16
									}, null, _parent, _scopeId));
									_push(` ${ssrInterpolate(unref(t)("reports.approve"))}</button>`);
								} else _push(`<!---->`);
								if (unref(showApprovalPanel)) {
									_push(`<button class="action-btn approve-btn" data-v-8b77b923${_scopeId}>`);
									_push(ssrRenderComponent(_component_Icon, {
										name: "lucide:check",
										size: 16
									}, null, _parent, _scopeId));
									_push(` ${ssrInterpolate(unref(t)("reports.finalize_approval"))}</button>`);
								} else _push(`<!---->`);
								if (!unref(showApprovalPanel) && unref(selectedReport).status === "under_review") {
									_push(`<button class="action-btn changes-btn" data-v-8b77b923${_scopeId}>`);
									_push(ssrRenderComponent(_component_Icon, {
										name: "lucide:edit-3",
										size: 16
									}, null, _parent, _scopeId));
									_push(` ${ssrInterpolate(unref(t)("reports.request_changes"))}</button>`);
								} else _push(`<!---->`);
								if (unref(selectedReport).status === "approved") {
									_push(`<button class="action-btn deliver-btn" data-v-8b77b923${_scopeId}>`);
									_push(ssrRenderComponent(_component_Icon, {
										name: "lucide:send",
										size: 16
									}, null, _parent, _scopeId));
									_push(` ${ssrInterpolate(unref(t)("reports.deliver"))}</button>`);
								} else _push(`<!---->`);
								if (unref(showApprovalPanel)) {
									_push(`<button class="action-btn cancel-btn" data-v-8b77b923${_scopeId}>`);
									_push(ssrRenderComponent(_component_Icon, {
										name: "lucide:x",
										size: 16
									}, null, _parent, _scopeId));
									_push(` ${ssrInterpolate(unref(t)("common.cancel"))}</button>`);
								} else _push(`<!---->`);
								_push(`</div>`);
							} else {
								_push(`<div class="detail-actions" data-v-8b77b923${_scopeId}><button class="action-btn changes-btn" data-v-8b77b923${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:send",
									size: 16
								}, null, _parent, _scopeId));
								_push(` ${ssrInterpolate(unref(t)("reports.send_request"))}</button><button class="action-btn cancel-btn" data-v-8b77b923${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:x",
									size: 16
								}, null, _parent, _scopeId));
								_push(` ${ssrInterpolate(unref(t)("common.cancel"))}</button></div>`);
							}
							if (!unref(isEditing) && !unref(showAuditTrail)) {
								_push(`<div class="detail-history" data-v-8b77b923${_scopeId}><h4 class="section-title" data-v-8b77b923${_scopeId}>${ssrInterpolate(unref(t)("reports.history"))}</h4><div class="history-list" data-v-8b77b923${_scopeId}><!--[-->`);
								ssrRenderList(unref(selectedReport).auditTrail.slice(-3), (entry) => {
									_push(`<div class="history-item" data-v-8b77b923${_scopeId}><span class="history-time" data-v-8b77b923${_scopeId}>${ssrInterpolate(formatDateTime(entry.timestamp))}</span>`);
									_push(ssrRenderComponent(_component_Badge, {
										type: "report",
										value: entry.action
									}, null, _parent, _scopeId));
									_push(`<span class="history-action" data-v-8b77b923${_scopeId}>${ssrInterpolate(entry.details)}</span></div>`);
								});
								_push(`<!--]--></div></div>`);
							} else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
					} else return [unref(selectedReport) ? (openBlock(), createBlock("div", {
						key: 0,
						class: "report-details"
					}, [
						createVNode("div", { class: "detail-header" }, [createVNode("div", { class: "detail-header-main" }, [createVNode("h3", { class: "detail-title" }, toDisplayString(unref(selectedReport).title), 1), createVNode("div", { class: "detail-meta" }, [
							createVNode(_component_Badge, {
								type: "report",
								value: unref(selectedReport).status
							}, null, 8, ["value"]),
							createVNode(_component_Badge, {
								type: "review",
								value: unref(selectedReport).reviewRequired
							}, null, 8, ["value"]),
							createVNode("span", { class: "detail-id" }, toDisplayString(unref(selectedReport).id), 1)
						])]), unref(selectedReport).status === "under_review" ? (openBlock(), createBlock("button", {
							key: 0,
							class: "edit-toggle-btn",
							onClick: toggleEditMode
						}, [createVNode(_component_Icon, {
							name: unref(isEditing) ? "lucide:save" : "lucide:edit",
							size: 16
						}, null, 8, ["name"]), createTextVNode(" " + toDisplayString(unref(isEditing) ? unref(t)("reports.save_changes") : unref(t)("reports.edit_report")), 1)])) : createCommentVNode("", true)]),
						createVNode("div", { class: "detail-info" }, [
							createVNode("div", { class: "info-row" }, [createVNode("span", { class: "info-label" }, toDisplayString(unref(t)("reports.officer")) + ":", 1), createVNode("span", { class: "info-value" }, toDisplayString(unref(selectedReport).officer), 1)]),
							createVNode("div", { class: "info-row" }, [createVNode("span", { class: "info-label" }, toDisplayString(unref(t)("reports.community")) + ":", 1), createVNode("span", { class: "info-value" }, toDisplayString(unref(selectedReport).community), 1)]),
							createVNode("div", { class: "info-row" }, [createVNode("span", { class: "info-label" }, toDisplayString(unref(t)("reports.submitted_at")) + ":", 1), createVNode("span", { class: "info-value" }, toDisplayString(formatDateTime(unref(selectedReport).submittedAt)), 1)]),
							createVNode("div", { class: "info-row" }, [createVNode("span", { class: "info-label" }, toDisplayString(unref(t)("reports.template")) + ":", 1), createVNode("span", { class: "info-value" }, toDisplayString(unref(selectedReport).template), 1)])
						]),
						!unref(isEditing) && !unref(showApprovalPanel) ? (openBlock(), createBlock("div", {
							key: 0,
							class: "detail-content"
						}, [
							createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("reports.report_content")), 1),
							createVNode("div", { class: "content-box" }, [createVNode("p", null, toDisplayString(unref(selectedReport).content), 1)]),
							unref(selectedReport).managerNotes ? (openBlock(), createBlock("div", {
								key: 0,
								class: "manager-notes"
							}, [createVNode("h5", { class: "notes-title" }, toDisplayString(unref(t)("reports.manager_notes")), 1), createVNode("p", { class: "notes-content" }, toDisplayString(unref(selectedReport).managerNotes), 1)])) : createCommentVNode("", true),
							createVNode("div", { class: "report-sections" }, [createVNode("h5", { class: "section-subtitle" }, toDisplayString(unref(t)("reports.sections")), 1), (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedReport).sections, (section) => {
								return openBlock(), createBlock("div", {
									key: section.id,
									class: "section-item"
								}, [createVNode("div", { class: "section-item-header" }, [createVNode("span", { class: "section-item-title" }, toDisplayString(section.title), 1), createVNode(_component_Badge, {
									type: "active",
									value: section.clientVisible,
									class: section.clientVisible ? "badge--active-yes" : "badge--active-no"
								}, null, 8, ["value", "class"])]), createVNode("p", { class: "section-item-content" }, toDisplayString(section.content), 1)]);
							}), 128))])
						])) : createCommentVNode("", true),
						unref(isEditing) ? (openBlock(), createBlock("div", {
							key: 1,
							class: "edit-mode"
						}, [
							createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("reports.edit_content")), 1),
							withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => isRef(editedContent) ? editedContent.value = $event : null,
								class: "edit-textarea",
								rows: "6",
								placeholder: unref(t)("reports.content_placeholder")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(editedContent)]]),
							createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("reports.manager_notes")), 1),
							withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => isRef(editedManagerNotes) ? editedManagerNotes.value = $event : null,
								class: "edit-textarea",
								rows: "3",
								placeholder: unref(t)("reports.notes_placeholder")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(editedManagerNotes)]]),
							createVNode("div", { class: "audit-trail-toggle" }, [createVNode("button", {
								class: "toggle-btn",
								onClick: ($event) => showAuditTrail.value = !unref(showAuditTrail)
							}, [createVNode(_component_Icon, {
								name: unref(showAuditTrail) ? "lucide:chevron-up" : "lucide:chevron-down",
								size: 16
							}, null, 8, ["name"]), createTextVNode(" " + toDisplayString(unref(showAuditTrail) ? unref(t)("reports.hide_audit_trail") : unref(t)("reports.show_audit_trail")), 1)], 8, ["onClick"])]),
							unref(showAuditTrail) ? (openBlock(), createBlock("div", {
								key: 0,
								class: "audit-trail"
							}, [createVNode("h5", { class: "section-subtitle" }, toDisplayString(unref(t)("reports.audit_trail")), 1), (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedReport).auditTrail, (entry) => {
								return openBlock(), createBlock("div", {
									key: entry.id,
									class: "audit-entry"
								}, [
									createVNode("div", { class: "audit-entry-header" }, [
										createVNode("span", { class: "audit-time" }, toDisplayString(formatDateTime(entry.timestamp)), 1),
										createVNode("span", { class: "audit-user" }, toDisplayString(entry.user), 1),
										createVNode(_component_Badge, {
											type: "report",
											value: entry.action
										}, null, 8, ["value"])
									]),
									createVNode("p", { class: "audit-details" }, toDisplayString(entry.details), 1),
									entry.field ? (openBlock(), createBlock("div", {
										key: 0,
										class: "audit-field-change"
									}, [
										createVNode("span", { class: "field-name" }, toDisplayString(entry.field) + ":", 1),
										createVNode("span", { class: "old-value" }, toDisplayString(entry.oldValue), 1),
										createVNode(_component_Icon, {
											name: "lucide:arrow-right",
											size: 14
										}),
										createVNode("span", { class: "new-value" }, toDisplayString(entry.newValue), 1)
									])) : createCommentVNode("", true)
								]);
							}), 128))])) : createCommentVNode("", true)
						])) : createCommentVNode("", true),
						unref(showApprovalPanel) ? (openBlock(), createBlock("div", {
							key: 2,
							class: "approval-panel"
						}, [
							createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("reports.section_delivery_panel")), 1),
							createVNode("div", { class: "section-checklist" }, [createVNode("h5", { class: "section-subtitle" }, toDisplayString(unref(t)("reports.section_inclusion")), 1), (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedReport).sections, (section) => {
								return openBlock(), createBlock("div", {
									key: section.id,
									class: "section-check-item"
								}, [createVNode("label", { class: "check-label" }, [withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => section.clientVisible = $event,
									type: "checkbox",
									class: "check-input"
								}, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, section.clientVisible]]), createVNode("span", { class: "check-text" }, toDisplayString(section.title), 1)])]);
							}), 128))]),
							createVNode("div", { class: "management-summary" }, [
								createVNode("h5", { class: "section-subtitle" }, toDisplayString(unref(t)("reports.management_summary")), 1),
								withDirectives(createVNode("textarea", {
									"onUpdate:modelValue": ($event) => isRef(managementSummary) ? managementSummary.value = $event : null,
									class: "edit-textarea",
									rows: "3",
									maxlength: "1000",
									placeholder: unref(t)("reports.summary_placeholder")
								}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(managementSummary)]]),
								createVNode("span", { class: "char-count" }, toDisplayString(unref(managementSummary).length) + "/1000", 1)
							])
						])) : createCommentVNode("", true),
						unref(showChangeRequestModal) ? (openBlock(), createBlock("div", {
							key: 3,
							class: "change-request-panel"
						}, [
							createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("reports.request_changes")), 1),
							createVNode("p", { class: "panel-description" }, toDisplayString(unref(t)("reports.changes_description")), 1),
							withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => isRef(changeRequestComments) ? changeRequestComments.value = $event : null,
								class: "edit-textarea",
								rows: "4",
								maxlength: "1000",
								placeholder: unref(t)("reports.comments_placeholder")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(changeRequestComments)]]),
							createVNode("span", { class: "char-count" }, toDisplayString(unref(changeRequestComments).length) + "/1000", 1)
						])) : createCommentVNode("", true),
						!unref(showChangeRequestModal) ? (openBlock(), createBlock("div", {
							key: 4,
							class: "detail-actions"
						}, [
							!unref(showApprovalPanel) && unref(selectedReport).status === "under_review" ? (openBlock(), createBlock("button", {
								key: 0,
								class: "action-btn approve-btn",
								onClick: handleApprove
							}, [createVNode(_component_Icon, {
								name: "lucide:check",
								size: 16
							}), createTextVNode(" " + toDisplayString(unref(t)("reports.approve")), 1)])) : createCommentVNode("", true),
							unref(showApprovalPanel) ? (openBlock(), createBlock("button", {
								key: 1,
								class: "action-btn approve-btn",
								onClick: handleApprove
							}, [createVNode(_component_Icon, {
								name: "lucide:check",
								size: 16
							}), createTextVNode(" " + toDisplayString(unref(t)("reports.finalize_approval")), 1)])) : createCommentVNode("", true),
							!unref(showApprovalPanel) && unref(selectedReport).status === "under_review" ? (openBlock(), createBlock("button", {
								key: 2,
								class: "action-btn changes-btn",
								onClick: handleRequestChanges
							}, [createVNode(_component_Icon, {
								name: "lucide:edit-3",
								size: 16
							}), createTextVNode(" " + toDisplayString(unref(t)("reports.request_changes")), 1)])) : createCommentVNode("", true),
							unref(selectedReport).status === "approved" ? (openBlock(), createBlock("button", {
								key: 3,
								class: "action-btn deliver-btn",
								onClick: handleDeliver
							}, [createVNode(_component_Icon, {
								name: "lucide:send",
								size: 16
							}), createTextVNode(" " + toDisplayString(unref(t)("reports.deliver")), 1)])) : createCommentVNode("", true),
							unref(showApprovalPanel) ? (openBlock(), createBlock("button", {
								key: 4,
								class: "action-btn cancel-btn",
								onClick: ($event) => showApprovalPanel.value = false
							}, [createVNode(_component_Icon, {
								name: "lucide:x",
								size: 16
							}), createTextVNode(" " + toDisplayString(unref(t)("common.cancel")), 1)], 8, ["onClick"])) : createCommentVNode("", true)
						])) : (openBlock(), createBlock("div", {
							key: 5,
							class: "detail-actions"
						}, [createVNode("button", {
							class: "action-btn changes-btn",
							onClick: handleRequestChanges
						}, [createVNode(_component_Icon, {
							name: "lucide:send",
							size: 16
						}), createTextVNode(" " + toDisplayString(unref(t)("reports.send_request")), 1)]), createVNode("button", {
							class: "action-btn cancel-btn",
							onClick: ($event) => showChangeRequestModal.value = false
						}, [createVNode(_component_Icon, {
							name: "lucide:x",
							size: 16
						}), createTextVNode(" " + toDisplayString(unref(t)("common.cancel")), 1)], 8, ["onClick"])])),
						!unref(isEditing) && !unref(showAuditTrail) ? (openBlock(), createBlock("div", {
							key: 6,
							class: "detail-history"
						}, [createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("reports.history")), 1), createVNode("div", { class: "history-list" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(selectedReport).auditTrail.slice(-3), (entry) => {
							return openBlock(), createBlock("div", {
								key: entry.id,
								class: "history-item"
							}, [
								createVNode("span", { class: "history-time" }, toDisplayString(formatDateTime(entry.timestamp)), 1),
								createVNode(_component_Badge, {
									type: "report",
									value: entry.action
								}, null, 8, ["value"]),
								createVNode("span", { class: "history-action" }, toDisplayString(entry.details), 1)
							]);
						}), 128))])])) : createCommentVNode("", true)
					])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/calls/IncidentReports.vue
var _sfc_setup$1 = IncidentReports_vue_vue_type_script_setup_true_lang_default.setup;
IncidentReports_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/calls/IncidentReports.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var IncidentReports_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(IncidentReports_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8b77b923"]]), { __name: "IncidentReports" });
//#endregion
//#region app/pages/calls.vue?vue&type=script&setup=true&lang.ts
var calls_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "calls",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const route = useRoute();
		useRouter();
		const tabs = [
			{
				id: "open",
				label: t("calls.tabs.open"),
				icon: "lucide:phone-call"
			},
			{
				id: "history",
				label: t("calls.tabs.history"),
				icon: "lucide:history"
			},
			{
				id: "reports",
				label: t("calls.tabs.reports"),
				icon: "lucide:file-text"
			}
		];
		const validTabIds = tabs.map((tab) => tab.id);
		const activeTab = ref(validTabIds.includes(route.query.tab) ? route.query.tab : "open");
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_Icon = components_default;
			const _component_CallsList = CallsList_default;
			const _component_CallsHistory = CallsHistory_default;
			const _component_IncidentReports = IncidentReports_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: unref(t)("calls.page_title"),
				breadcrumb: [{ label: "Manage" }, { label: unref(t)("calls.page_title") }]
			}, null, _parent));
			_push(`<div class="calls-page" data-v-6e6791c6><div class="calls-tabs" data-v-6e6791c6><!--[-->`);
			ssrRenderList(tabs, (tab) => {
				_push(`<button class="${ssrRenderClass([{ "tab-btn--active": unref(activeTab) === tab.id }, "tab-btn"])}" data-v-6e6791c6>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: tab.icon,
					size: 16
				}, null, _parent));
				_push(`<span data-v-6e6791c6>${ssrInterpolate(tab.label)}</span></button>`);
			});
			_push(`<!--]--></div><div class="calls-content" data-v-6e6791c6>`);
			if (unref(activeTab) === "open") {
				_push(`<div class="content-card" data-v-6e6791c6>`);
				_push(ssrRenderComponent(_component_CallsList, null, null, _parent));
				_push(`</div>`);
			} else if (unref(activeTab) === "history") {
				_push(`<div class="content-card" data-v-6e6791c6>`);
				_push(ssrRenderComponent(_component_CallsHistory, null, null, _parent));
				_push(`</div>`);
			} else if (unref(activeTab) === "reports") {
				_push(`<div class="content-card" data-v-6e6791c6>`);
				_push(ssrRenderComponent(_component_IncidentReports, null, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div></div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/calls.vue
var _sfc_setup = calls_vue_vue_type_script_setup_true_lang_default.setup;
calls_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/calls.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var calls_default = /*#__PURE__*/ _plugin_vue_export_helper_default(calls_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-6e6791c6"]]);

export { calls_default as default };
//# sourceMappingURL=calls-DarJE8HJ.mjs.map
