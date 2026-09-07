import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, f as useNotificationSocket } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { C as CallDetailsModal_default, A as AssignCallModal_default, c as callApi } from './AssignCallModal-BfoC0p2_.mjs';
import { G as GoogleMap_default } from './GoogleMap-BcuRRAta.mjs';
import { defineComponent, mergeProps, reactive, ref, computed, watch, unref, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'vue/server-renderer';
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
import './AppModal-DgfQAFue.mjs';
import 'moment';
import './FileUpload-B-39JGGf.mjs';
import './useFileApi-CLWuZDlq.mjs';
import './officer-CPsAbV7J.mjs';

//#region app/components/dashboard/KpiCards.vue?vue&type=script&setup=true&lang.ts
var KpiCards_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "KpiCards",
	__ssrInlineRender: true,
	setup(__props) {
		const cards = [
			{
				label: "OPEN CALLS",
				value: "6",
				sub: "↑ last 1h",
				subType: "critical"
			},
			{
				label: "OFFICERS ACTIVE",
				value: "14 / 22",
				sub: "64% allocated",
				subType: "neutral"
			},
			{
				label: "AVG RESPONSE",
				value: "3:42",
				sub: "-38s vs last week",
				subType: "ok"
			},
			{
				label: "TASKS OPEN",
				value: "12",
				sub: "3 urgent",
				subType: "neutral"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "kpi-grid" }, _attrs))} data-v-757ce2c1><!--[-->`);
			ssrRenderList(cards, (card) => {
				_push(`<div class="kpi-card card" data-v-757ce2c1><span class="kpi-card__label" data-v-757ce2c1>${ssrInterpolate(card.label)}</span><span class="kpi-card__value" data-v-757ce2c1>${ssrInterpolate(card.value)}</span><span class="${ssrRenderClass([{
					"text-critical": card.subType === "critical",
					"text-ok": card.subType === "ok",
					"text-warn": card.subType === "warn",
					"text-secondary": card.subType === "neutral"
				}, "kpi-card__sub"])}" data-v-757ce2c1>${ssrInterpolate(card.sub)}</span></div>`);
			});
			_push(`<!--]--></div>`);
		};
	}
});
//#endregion
//#region app/components/dashboard/KpiCards.vue
var _sfc_setup$4 = KpiCards_vue_vue_type_script_setup_true_lang_default.setup;
KpiCards_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/KpiCards.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var KpiCards_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(KpiCards_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-757ce2c1"]]), { __name: "KpiCards" });
//#endregion
//#region app/components/dashboard/LiveOperations.vue?vue&type=script&setup=true&lang.ts
var LiveOperations_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "LiveOperations",
	__ssrInlineRender: true,
	setup(__props) {
		const sampleMarkers = [
			{
				lat: 34.0545,
				lng: -118.245,
				status: "active"
			},
			{
				lat: 34.051,
				lng: -118.241,
				status: "responding"
			},
			{
				lat: 34.053,
				lng: -118.248,
				status: "idle"
			},
			{
				lat: 34.05,
				lng: -118.246,
				status: "active"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			const _component_GoogleMap = GoogleMap_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "live-ops card" }, _attrs))} data-v-f70c2777><div class="live-ops__header" data-v-f70c2777><span class="live-ops__title" data-v-f70c2777>LIVE OPERATIONS</span><div class="live-ops__actions" data-v-f70c2777><span class="live-badge" data-v-f70c2777><span class="live-badge__dot" data-v-f70c2777></span> Live </span><button class="live-ops__fullscreen" data-v-f70c2777> Open full screen </button></div></div><div class="live-ops__map" data-v-f70c2777>`);
			_push(ssrRenderComponent(_component_GoogleMap, {
				center: {
					lat: 34.0522,
					lng: -118.2437
				},
				zoom: 15,
				markers: sampleMarkers,
				height: "100%"
			}, null, _parent));
			_push(`</div></div>`);
		};
	}
});
//#endregion
//#region app/components/dashboard/LiveOperations.vue
var _sfc_setup$3 = LiveOperations_vue_vue_type_script_setup_true_lang_default.setup;
LiveOperations_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/LiveOperations.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var LiveOperations_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(LiveOperations_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-f70c2777"]]), { __name: "LiveOperations" });
//#endregion
//#region app/components/dashboard/ActiveCalls.vue?vue&type=script&setup=true&lang.ts
var ActiveCalls_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ActiveCalls",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const { latestNotification } = useNotificationSocket();
		const filters = reactive({
			status: "",
			category: "",
			community: "",
			search: ""
		});
		const calls = ref([]);
		const loading = ref(false);
		const error = ref("");
		const communities = ref([]);
		const urgentCount = computed(() => calls.value.filter((c) => c.isEmergency && c.status === "new").length);
		const sortedCalls = computed(() => {
			return [...calls.value].sort((a, b) => {
				const aUrgent = a.isEmergency && a.status === "new" ? 1 : 0;
				const bUrgent = b.isEmergency && b.status === "new" ? 1 : 0;
				if (aUrgent !== bUrgent) return bUrgent - aUrgent;
				return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
			});
		});
		const selectedCall = ref(null);
		const detailsCall = computed(() => selectedCall.value);
		const showDetailsModal = ref(false);
		const callToAssign = ref(null);
		const showAssignModal = ref(false);
		function closeAssignModal() {
			showAssignModal.value = false;
			callToAssign.value = null;
		}
		async function handleAssigned() {
			await fetchActiveCalls();
			closeAssignModal();
		}
		const statusOptions = [
			{
				value: "",
				label: t("calls.filters.all")
			},
			{
				value: "new",
				label: t("calls.status.new")
			},
			{
				value: "accepted",
				label: t("calls.status.accepted")
			},
			{
				value: "resolved",
				label: t("calls.status.done")
			},
			{
				value: "canceled",
				label: t("calls.status.canceled")
			}
		];
		const categoryOptions = [
			{
				value: "",
				label: t("calls.filters.all"),
				icon: "lucide:filter"
			},
			{
				value: "medical_emergency",
				label: "Medical Emergency",
				icon: "lucide:heart-pulse"
			},
			{
				value: "security_emergency",
				label: "Security Emergency",
				icon: "lucide:shield-alert"
			},
			{
				value: "panic",
				label: "Panic Button",
				icon: "lucide:siren"
			},
			{
				value: "concierge_service",
				label: "Concierge Service",
				icon: "lucide:bell-concierge"
			},
			{
				value: "test",
				label: "Test Call",
				icon: "lucide:test-tube"
			}
		];
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
		const priorityColor = {
			urgent: "pill--critical",
			important: "pill--warn",
			normal: "pill--info",
			low: "pill--ghost"
		};
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
		function formatTime(createdOn) {
			return new Date(createdOn).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		function timeSince(createdOn) {
			const seconds = Math.floor((Date.now() - new Date(createdOn).getTime()) / 1e3);
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
		function mapCall(apiCall) {
			const category = getCategoryInfo(apiCall.category);
			const serviceName = apiCall.service_type || category.label;
			return {
				id: apiCall.call_id.toString(),
				displayId: `CL-${apiCall.call_id}`,
				callId: apiCall.call_id,
				category,
				serviceType: {
					name: serviceName,
					icon: category.icon
				},
				residentName: apiCall.resident_name || "",
				communityName: apiCall.community_name || "",
				communityId: apiCall.community_id,
				address: apiCall.address || "",
				officerName: apiCall.officer_name,
				status: apiCall.status === "resolved" ? "done" : apiCall.status,
				priority: apiCall.priority,
				note: apiCall.description || "",
				time: formatTime(apiCall.created_on),
				elapsed: timeSince(apiCall.created_on),
				isEmergency: [
					"medical_emergency",
					"security_emergency",
					"panic"
				].includes(apiCall.category),
				createdOn: apiCall.created_on,
				callDateTime: apiCall.created_on,
				currentAddress: apiCall.current_address || void 0,
				description: apiCall.description || void 0,
				media: apiCall.media,
				audioUrl: apiCall.audio_url || void 0,
				videoUrl: apiCall.video_url || void 0,
				confirmationImages: apiCall.confirmation_media,
				officerComments: apiCall.officer_comments || void 0,
				residentComments: apiCall.resident_comment || void 0
			};
		}
		function buildParams(filters) {
			const params = {
				is_open: true,
				sort_by: "created_on",
				sort_dir: "desc",
				limit: 50
			};
			if (filters.status) params.status = filters.status;
			if (filters.category) params.category = filters.category;
			if (filters.community) params.community_id = Number(filters.community);
			if (filters.search) params.search_text = filters.search;
			return params;
		}
		async function fetchActiveCalls() {
			loading.value = true;
			error.value = "";
			try {
				const res = await callApi.getCalls(buildParams(filters), { showLoading: false });
				calls.value = res.calls.map(mapCall);
			} catch (err) {
				error.value = err.message || "Failed to load active calls";
			} finally {
				loading.value = false;
			}
		}
		function closeCallDetails() {
			showDetailsModal.value = false;
			selectedCall.value = null;
		}
		function handleResolved() {
			closeCallDetails();
			fetchActiveCalls();
		}
		function handleCanceled() {
			closeCallDetails();
			fetchActiveCalls();
		}
		function handleDeleted() {
			closeCallDetails();
			fetchActiveCalls();
		}
		watch(filters, () => {
			fetchActiveCalls();
		}, { deep: true });
		watch(() => latestNotification.value, (n) => {
			if (n && [
				"new_service_call",
				"new_emergency",
				"panic_button",
				"call_status_changed"
			].includes(n.type)) fetchActiveCalls();
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "active-calls card" }, _attrs))} data-v-5b00f8e8><div class="active-calls__header" data-v-5b00f8e8><span class="active-calls__title" data-v-5b00f8e8>ACTIVE CALLS</span><div class="active-calls__actions" data-v-5b00f8e8><span class="pill pill--critical" data-v-5b00f8e8>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:triangle-alert",
				size: 12
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(urgentCount))} urgent </span><button class="btn btn--ghost active-calls__view-all" data-v-5b00f8e8>View all</button></div></div><div class="active-calls__filters" data-v-5b00f8e8><select class="filter-select" data-v-5b00f8e8><!--[-->`);
			ssrRenderList(statusOptions, (o) => {
				_push(`<option${ssrRenderAttr("value", o.value)} data-v-5b00f8e8${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, o.value) : ssrLooseEqual(unref(filters).status, o.value)) ? " selected" : ""}>${ssrInterpolate(o.label)}</option>`);
			});
			_push(`<!--]--></select><select class="filter-select" data-v-5b00f8e8><!--[-->`);
			ssrRenderList(categoryOptions, (o) => {
				_push(`<option${ssrRenderAttr("value", o.value)} data-v-5b00f8e8${ssrIncludeBooleanAttr(Array.isArray(unref(filters).category) ? ssrLooseContain(unref(filters).category, o.value) : ssrLooseEqual(unref(filters).category, o.value)) ? " selected" : ""}>${ssrInterpolate(o.label)}</option>`);
			});
			_push(`<!--]--></select><select class="filter-select" data-v-5b00f8e8><option value="" data-v-5b00f8e8${ssrIncludeBooleanAttr(Array.isArray(unref(filters).community) ? ssrLooseContain(unref(filters).community, "") : ssrLooseEqual(unref(filters).community, "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("calls.filters.all"))}</option><!--[-->`);
			ssrRenderList(unref(communities), (c) => {
				_push(`<option${ssrRenderAttr("value", String(c.community_id))} data-v-5b00f8e8${ssrIncludeBooleanAttr(Array.isArray(unref(filters).community) ? ssrLooseContain(unref(filters).community, String(c.community_id)) : ssrLooseEqual(unref(filters).community, String(c.community_id))) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
			});
			_push(`<!--]--></select><div class="filter-search" data-v-5b00f8e8>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 14
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", unref(filters).search)} type="text"${ssrRenderAttr("placeholder", unref(t)("calls.filters.search"))} class="filter-input" data-v-5b00f8e8></div></div>`);
			if (unref(loading)) _push(`<div class="active-calls__state active-calls__state--loading" data-v-5b00f8e8>Loading active calls...</div>`);
			else if (unref(error)) _push(`<div class="active-calls__state active-calls__state--error" data-v-5b00f8e8>${ssrInterpolate(unref(error))}</div>`);
			else {
				_push(`<div class="active-calls__list" data-v-5b00f8e8>`);
				if (unref(calls).length === 0) _push(`<div class="active-calls__state active-calls__state--empty" data-v-5b00f8e8>No active calls</div>`);
				else _push(`<!---->`);
				_push(`<!--[-->`);
				ssrRenderList(unref(sortedCalls), (call) => {
					_push(`<div class="${ssrRenderClass([[
						`call-row--${call.status}`,
						{ "call-row--emergency": call.isEmergency && call.status === "new" },
						{ "call-row--panic": call.category.type === "panic" && call.status === "new" }
					], "call-row"])}" data-v-5b00f8e8><div class="${ssrRenderClass([`call-row__indicator--${call.status}`, "call-row__indicator"])}" data-v-5b00f8e8></div><div class="call-row__body" data-v-5b00f8e8><div class="call-row__top" data-v-5b00f8e8><div class="call-row__left" data-v-5b00f8e8>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: call.category.icon,
						size: 16,
						class: "call-row__type-icon",
						style: { color: call.category.color }
					}, null, _parent));
					_push(`<span class="call-row__name" data-v-5b00f8e8>${ssrInterpolate(call.residentName)}</span><span class="call-row__id text-muted text-xs" data-v-5b00f8e8>${ssrInterpolate(call.displayId)}</span><span class="${ssrRenderClass(["status-badge", getStatusClass(call.status)])}" data-v-5b00f8e8>${ssrInterpolate(call.status)}</span><span class="${ssrRenderClass(["pill", priorityColor[call.priority] ?? "pill--ghost"])}" data-v-5b00f8e8>${ssrInterpolate(call.priority)}</span></div><div class="call-row__right"${ssrRenderAttr("title", formatDateTime(call.createdOn))} data-v-5b00f8e8><span class="call-row__time" data-v-5b00f8e8>${ssrInterpolate(call.time)}</span><span class="call-row__elapsed" data-v-5b00f8e8>${ssrInterpolate(call.elapsed)}</span>`);
					if (call.status === "new") {
						_push(`<button class="assign-btn" data-v-5b00f8e8>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:user-plus",
							size: 12
						}, null, _parent));
						_push(` Assign </button>`);
					} else _push(`<!---->`);
					_push(`</div></div><div class="call-row__mid text-xs" data-v-5b00f8e8><span class="text-secondary text-sm" data-v-5b00f8e8>${ssrInterpolate(call.communityName)}</span><span class="text-white text-sm" data-v-5b00f8e8>·</span><span class="text-white text-sm" data-v-5b00f8e8>${ssrInterpolate(call.address)}</span>`);
					if (call.officerName) _push(`<!--[--><span class="text-muted text-sm" data-v-5b00f8e8>→</span><span class="text-muted text-sm" data-v-5b00f8e8>${ssrInterpolate(call.officerName)}</span><!--]-->`);
					else _push(`<!---->`);
					_push(`</div><div class="call-row__note text-sm text-white" data-v-5b00f8e8>${ssrInterpolate(call.note)}</div></div></div>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(ssrRenderComponent(CallDetailsModal_default, {
				show: unref(showDetailsModal),
				call: unref(detailsCall),
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
//#region app/components/dashboard/ActiveCalls.vue
var _sfc_setup$2 = ActiveCalls_vue_vue_type_script_setup_true_lang_default.setup;
ActiveCalls_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/ActiveCalls.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var ActiveCalls_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(ActiveCalls_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-5b00f8e8"]]), { __name: "ActiveCalls" });
//#endregion
//#region app/components/dashboard/RightPanel.vue?vue&type=script&setup=true&lang.ts
var RightPanel_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RightPanel",
	__ssrInlineRender: true,
	setup(__props) {
		const timeline = [
			{
				time: "21:14:05",
				color: "critical",
				title: "Call CL-2026-04822 received",
				detail: "Helena Vorster → Westridge Estates"
			},
			{
				time: "21:14:11",
				color: "accent",
				title: "Auto-routed to nearest officer",
				detail: "Aisha Whitmore (0.4 mi, ETA 2 min)"
			},
			{
				time: "21:14:32",
				color: "ok",
				title: "Officer accepted — On the way",
				detail: "GPS trace started"
			},
			{
				time: "21:15:00",
				color: "warn",
				title: "Resident updated description",
				detail: "\"I see a person in dark clothing in the side yard.\""
			},
			{
				time: "21:16:14",
				color: "info",
				title: "Continuous video upload begun",
				detail: "720p stream — secured"
			}
		];
		const communities = [
			{
				name: "Westridge Estates",
				meta: "14 officers · 6 posts",
				pct: 92
			},
			{
				name: "Harbor Point Marina",
				meta: "8 officers · 4 posts",
				pct: 74
			},
			{
				name: "Cedar Crossing HOA",
				meta: "6 officers · 3 posts",
				pct: 58
			},
			{
				name: "Summit Plaza Events",
				meta: "22 officers · 9 posts",
				pct: 100
			}
		];
		const incidents = [
			{
				title: "Vehicle break-in attempt",
				id: "IR-2026-1124",
				status: "submitted",
				reporter: "Alexa Ramirez"
			},
			{
				title: "Medical assist — fall",
				id: "IR-2026-1123",
				status: "reviewed",
				reporter: "Jordan Ramirez"
			},
			{
				title: "Trespass observation — POI-0142",
				id: "IR-2026-1122",
				status: "submitted",
				reporter: "Marcus Chen"
			}
		];
		const statusPill = {
			submitted: "pill--warn",
			reviewed: "pill--info",
			closed: "pill--ok"
		};
		const timelineColor = {
			critical: "var(--color-critical)",
			accent: "var(--color-accent)",
			ok: "var(--color-ok)",
			warn: "var(--color-warn)",
			info: "var(--color-info)"
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "right-panel" }, _attrs))} data-v-6ddec35e><div class="panel-section card" data-v-6ddec35e><div class="panel-section__header" data-v-6ddec35e><span class="panel-section__title" data-v-6ddec35e>ACTIVITY TIMELINE</span></div><div class="timeline" data-v-6ddec35e><!--[-->`);
			ssrRenderList(timeline, (item, i) => {
				_push(`<div class="timeline__item" data-v-6ddec35e><div class="timeline__dot" style="${ssrRenderStyle({ background: timelineColor[item.color] })}" data-v-6ddec35e></div><div class="timeline__content" data-v-6ddec35e><span class="timeline__time text-sm text-muted" data-v-6ddec35e>${ssrInterpolate(item.time)}</span><span class="timeline__title text-base" data-v-6ddec35e>${ssrInterpolate(item.title)}</span><span class="timeline__detail text-sm text-muted" data-v-6ddec35e>${ssrInterpolate(item.detail)}</span></div></div>`);
			});
			_push(`<!--]--></div></div><div class="panel-section card" data-v-6ddec35e><div class="panel-section__header" data-v-6ddec35e><span class="panel-section__title" data-v-6ddec35e>COVERAGE BY COMMUNITY</span></div><div class="coverage-list" data-v-6ddec35e><!--[-->`);
			ssrRenderList(communities, (c) => {
				_push(`<div class="coverage-item" data-v-6ddec35e><div class="coverage-item__info" data-v-6ddec35e><span class="coverage-item__name text-base font-medium" data-v-6ddec35e>${ssrInterpolate(c.name)}</span><span class="coverage-item__meta text-base text-muted" data-v-6ddec35e>${ssrInterpolate(c.meta)}</span></div><div class="coverage-item__right" data-v-6ddec35e><span class="coverage-item__pct text-base text-muted" data-v-6ddec35e>${ssrInterpolate(c.pct)}%</span></div></div>`);
			});
			_push(`<!--]--></div></div><div class="panel-section card" data-v-6ddec35e><div class="panel-section__header" data-v-6ddec35e><span class="panel-section__title" data-v-6ddec35e>RECENT INCIDENT REPORTS</span></div><div class="incident-list" data-v-6ddec35e><!--[-->`);
			ssrRenderList(incidents, (inc) => {
				_push(`<div class="incident-item" data-v-6ddec35e><div class="incident-item__info" data-v-6ddec35e><span class="incident-item__title text-base" data-v-6ddec35e>${ssrInterpolate(inc.title)}</span><span class="incident-item__meta text-sm text-muted" data-v-6ddec35e>${ssrInterpolate(inc.reporter)} · ${ssrInterpolate(inc.id)}</span></div><span class="${ssrRenderClass(["pill", statusPill[inc.status]])}" data-v-6ddec35e>${ssrInterpolate(inc.status)}</span></div>`);
			});
			_push(`<!--]--></div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/dashboard/RightPanel.vue
var _sfc_setup$1 = RightPanel_vue_vue_type_script_setup_true_lang_default.setup;
RightPanel_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/dashboard/RightPanel.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var RightPanel_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(RightPanel_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-6ddec35e"]]), { __name: "RightPanel" });
//#endregion
//#region app/pages/dashboard.vue?vue&type=script&setup=true&lang.ts
var dashboard_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "dashboard",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_KpiCards = KpiCards_default;
			const _component_LiveOperations = LiveOperations_default;
			const _component_ActiveCalls = ActiveCalls_default;
			const _component_RightPanel = RightPanel_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: "Dashboard",
				breadcrumb: [{ label: "Operate" }, { label: "Overview" }],
				"search-placeholder": "Search calls, residents, officers, posts…",
				showSearch: true
			}, null, _parent));
			_push(`<div class="dashboard" data-v-e512a707>`);
			_push(ssrRenderComponent(_component_KpiCards, { class: "dashboard__kpi" }, null, _parent));
			_push(`<div class="dashboard__body" data-v-e512a707><div class="dashboard__main" data-v-e512a707>`);
			_push(ssrRenderComponent(_component_LiveOperations, null, null, _parent));
			_push(ssrRenderComponent(_component_ActiveCalls, null, null, _parent));
			_push(`</div>`);
			_push(ssrRenderComponent(_component_RightPanel, null, null, _parent));
			_push(`</div></div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/dashboard.vue
var _sfc_setup = dashboard_vue_vue_type_script_setup_true_lang_default.setup;
dashboard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var dashboard_default = /*#__PURE__*/ _plugin_vue_export_helper_default(dashboard_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-e512a707"]]);

export { dashboard_default as default };
//# sourceMappingURL=dashboard-BxGqzsaN.mjs.map
