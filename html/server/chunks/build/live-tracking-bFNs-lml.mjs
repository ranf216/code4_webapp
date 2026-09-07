import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, s as setInterval } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { G as GoogleMap_default } from './GoogleMap-BcuRRAta.mjs';
import { defineComponent, ref, computed, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderAttrs, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
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

//#region app/components/live-tracking/LiveTrackingFilters.vue?vue&type=script&setup=true&lang.ts
var LiveTrackingFilters_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "LiveTrackingFilters",
	__ssrInlineRender: true,
	props: {
		modelValue: {},
		communities: {},
		officers: {},
		refreshInterval: {}
	},
	emits: ["update:modelValue", "refresh"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const { t } = useTranslation();
		const filters = computed({
			get: () => props.modelValue,
			set: (value) => emit("update:modelValue", value)
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "filters-panel" }, _attrs))} data-v-33472aec><div class="filters-header" data-v-33472aec><h3 data-v-33472aec>${ssrInterpolate(unref(t)("live_tracking.filters"))}</h3><button class="refresh-btn" data-v-33472aec>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:refresh-cw",
				size: 14
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("live_tracking.refresh_now"))}</button></div><div class="filter-section" data-v-33472aec><label class="filter-label" data-v-33472aec>${ssrInterpolate(unref(t)("live_tracking.community"))}</label><select class="filter-select" data-v-33472aec><option value="" data-v-33472aec${ssrIncludeBooleanAttr(Array.isArray(filters.value.community) ? ssrLooseContain(filters.value.community, "") : ssrLooseEqual(filters.value.community, "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("live_tracking.all_communities"))}</option><!--[-->`);
			ssrRenderList(__props.communities, (community) => {
				_push(`<option${ssrRenderAttr("value", community)} data-v-33472aec${ssrIncludeBooleanAttr(Array.isArray(filters.value.community) ? ssrLooseContain(filters.value.community, community) : ssrLooseEqual(filters.value.community, community)) ? " selected" : ""}>${ssrInterpolate(community)}</option>`);
			});
			_push(`<!--]--></select></div><div class="filter-section" data-v-33472aec><label class="filter-label" data-v-33472aec>${ssrInterpolate(unref(t)("live_tracking.officers"))}</label><div class="officer-list" data-v-33472aec><!--[-->`);
			ssrRenderList(__props.officers, (officer) => {
				_push(`<label class="checkbox-item" data-v-33472aec><input type="checkbox"${ssrIncludeBooleanAttr(filters.value.selectedOfficers.includes(officer)) ? " checked" : ""} data-v-33472aec><span data-v-33472aec>${ssrInterpolate(officer)}</span></label>`);
			});
			_push(`<!--]--></div></div><div class="filter-section" data-v-33472aec><label class="filter-label" data-v-33472aec>${ssrInterpolate(unref(t)("live_tracking.layers"))}</label><div class="layer-toggles" data-v-33472aec><label class="toggle-item" data-v-33472aec><input type="checkbox"${ssrIncludeBooleanAttr(filters.value.showOfficers) ? " checked" : ""} data-v-33472aec><span data-v-33472aec>${ssrInterpolate(unref(t)("live_tracking.layer_officers"))}</span></label><label class="toggle-item" data-v-33472aec><input type="checkbox"${ssrIncludeBooleanAttr(filters.value.showRoutes) ? " checked" : ""} data-v-33472aec><span data-v-33472aec>${ssrInterpolate(unref(t)("live_tracking.layer_routes"))}</span></label><label class="toggle-item" data-v-33472aec><input type="checkbox"${ssrIncludeBooleanAttr(filters.value.showEmergencyCalls) ? " checked" : ""} data-v-33472aec><span data-v-33472aec>${ssrInterpolate(unref(t)("live_tracking.layer_emergency_calls"))}</span></label><label class="toggle-item" data-v-33472aec><input type="checkbox"${ssrIncludeBooleanAttr(filters.value.showPosts) ? " checked" : ""} data-v-33472aec><span data-v-33472aec>${ssrInterpolate(unref(t)("live_tracking.layer_posts"))}</span></label></div></div><div class="filter-section" data-v-33472aec><label class="toggle-item toggle-item--primary" data-v-33472aec><input type="checkbox"${ssrIncludeBooleanAttr(filters.value.onDutyOnly) ? " checked" : ""} data-v-33472aec><span data-v-33472aec>${ssrInterpolate(unref(t)("live_tracking.on_duty_only"))}</span></label></div><div class="refresh-info" data-v-33472aec>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:clock",
				size: 14
			}, null, _parent));
			_push(`<span data-v-33472aec>${ssrInterpolate(unref(t)("live_tracking.refresh_interval", { seconds: String(__props.refreshInterval) }))}</span></div></div>`);
		};
	}
});
//#endregion
//#region app/components/live-tracking/LiveTrackingFilters.vue
var _sfc_setup$2 = LiveTrackingFilters_vue_vue_type_script_setup_true_lang_default.setup;
LiveTrackingFilters_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/live-tracking/LiveTrackingFilters.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var LiveTrackingFilters_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(LiveTrackingFilters_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-33472aec"]]), { __name: "LiveTrackingFilters" });
//#endregion
//#region app/components/live-tracking/OfficerInfoPanel.vue?vue&type=script&setup=true&lang.ts
var OfficerInfoPanel_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "OfficerInfoPanel",
	__ssrInlineRender: true,
	props: { officer: {} },
	emits: ["close"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const { t } = useTranslation();
		const statusClass = computed(() => {
			return `status--${props.officer.status}`;
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "info-panel-overlay" }, _attrs))} data-v-0c7f1f87><div class="info-panel" data-v-0c7f1f87><div class="info-panel__header" data-v-0c7f1f87><h3 data-v-0c7f1f87>${ssrInterpolate(unref(t)("live_tracking.officer_info"))}</h3><button class="close-btn" data-v-0c7f1f87>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:x",
				size: 20
			}, null, _parent));
			_push(`</button></div><div class="info-panel__body" data-v-0c7f1f87><div class="officer-identity" data-v-0c7f1f87><div class="officer-avatar" data-v-0c7f1f87>`);
			if (__props.officer.photo) _push(`<img${ssrRenderAttr("src", __props.officer.photo)}${ssrRenderAttr("alt", __props.officer.name)} data-v-0c7f1f87>`);
			else _push(`<span data-v-0c7f1f87>${ssrInterpolate(__props.officer.initials)}</span>`);
			_push(`</div><div class="officer-name-block" data-v-0c7f1f87><a class="officer-name officer-name--link"${ssrRenderAttr("href", `/officers?id=${__props.officer.id}`)} data-v-0c7f1f87>${ssrInterpolate(__props.officer.name)}</a><div class="${ssrRenderClass([statusClass.value, "officer-status"])}" data-v-0c7f1f87><span class="status-dot" style="${ssrRenderStyle({ background: __props.officer.statusColor })}" data-v-0c7f1f87></span> ${ssrInterpolate(__props.officer.status)}</div></div></div><div class="info-grid" data-v-0c7f1f87><div class="info-row" data-v-0c7f1f87><span class="info-label" data-v-0c7f1f87>${ssrInterpolate(unref(t)("live_tracking.community_site"))}</span><span class="info-value" data-v-0c7f1f87>${ssrInterpolate(__props.officer.community)} / ${ssrInterpolate(__props.officer.site)}</span></div><div class="info-row" data-v-0c7f1f87><span class="info-label" data-v-0c7f1f87>${ssrInterpolate(unref(t)("live_tracking.shift_time"))}</span><span class="info-value" data-v-0c7f1f87>${ssrInterpolate(__props.officer.shiftTime)}</span></div><div class="info-row" data-v-0c7f1f87><span class="info-label" data-v-0c7f1f87>${ssrInterpolate(unref(t)("live_tracking.current_post"))}</span><span class="info-value" data-v-0c7f1f87>${ssrInterpolate(__props.officer.currentPost || "—")}</span></div>`);
			if (__props.officer.activeCall) _push(`<div class="info-row" data-v-0c7f1f87><span class="info-label" data-v-0c7f1f87>${ssrInterpolate(unref(t)("live_tracking.active_call"))}</span><a class="info-link" href="#" data-v-0c7f1f87>${ssrInterpolate(__props.officer.activeCall.id)} — ${ssrInterpolate(__props.officer.activeCall.type)}</a></div>`);
			else _push(`<!---->`);
			if (__props.officer.nextWaypoint) _push(`<div class="info-row" data-v-0c7f1f87><span class="info-label" data-v-0c7f1f87>${ssrInterpolate(unref(t)("live_tracking.next_waypoint"))}</span><span class="info-value" data-v-0c7f1f87>${ssrInterpolate(__props.officer.nextWaypoint.name)} (${ssrInterpolate(__props.officer.nextWaypoint.eta)}m)</span></div>`);
			else _push(`<!---->`);
			_push(`<div class="info-row" data-v-0c7f1f87><span class="info-label" data-v-0c7f1f87>${ssrInterpolate(unref(t)("live_tracking.last_gps_update"))}</span><span class="info-value" data-v-0c7f1f87>${ssrInterpolate(__props.officer.lastGpsUpdate)}</span></div></div><div class="info-actions" data-v-0c7f1f87><button class="btn btn--secondary" data-v-0c7f1f87>${ssrInterpolate(unref(t)("common.close"))}</button><button class="btn btn--primary" data-v-0c7f1f87>${ssrInterpolate(unref(t)("live_tracking.view_profile"))}</button></div></div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/live-tracking/OfficerInfoPanel.vue
var _sfc_setup$1 = OfficerInfoPanel_vue_vue_type_script_setup_true_lang_default.setup;
OfficerInfoPanel_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/live-tracking/OfficerInfoPanel.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var OfficerInfoPanel_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(OfficerInfoPanel_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0c7f1f87"]]), { __name: "OfficerInfoPanel" });
//#endregion
//#region app/composables/useMapRefresh.ts
function useMapRefresh(onRefresh) {
	const interval = ref(30);
	const lastRefreshed = ref(/* @__PURE__ */ new Date());
	const secondsAgo = ref(0);
	let refreshTimer = null;
	let countTimer = null;
	function startTimers() {
		stopTimers();
		refreshTimer = setInterval(() => {
			lastRefreshed.value = /* @__PURE__ */ new Date();
			secondsAgo.value = 0;
			onRefresh();
		}, interval.value * 1e3);
		countTimer = setInterval();
	}
	function stopTimers() {
		if (refreshTimer) clearInterval(refreshTimer);
		if (countTimer) clearInterval(countTimer);
		refreshTimer = null;
		countTimer = null;
	}
	function refreshNow() {
		lastRefreshed.value = /* @__PURE__ */ new Date();
		secondsAgo.value = 0;
		onRefresh();
		startTimers();
	}
	return {
		interval,
		secondsAgo,
		lastRefreshed,
		refreshNow
	};
}
//#endregion
//#region app/pages/live-tracking.vue?vue&type=script&setup=true&lang.ts
var live_tracking_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "live-tracking",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const routeColors = ["#22c55e", "#4f6ef7"];
		const communities = [
			"Sunset Gardens",
			"Oakwood Residences",
			"Marina Towers",
			"Downtown Plaza"
		];
		const allOfficers = [
			"John Smith",
			"Mike Chen",
			"Sarah Johnson",
			"Robert Wilson",
			"Emma Davis"
		];
		const filters = ref({
			community: "",
			selectedOfficers: [],
			showOfficers: true,
			showRoutes: true,
			showEmergencyCalls: true,
			showPosts: true,
			onDutyOnly: true
		});
		const mapKey = ref(0);
		const { interval: refreshInterval, secondsAgo, refreshNow } = useMapRefresh(() => {
			mapKey.value++;
		});
		const officers = computed(() => {
			return [
				{
					lat: 10.7775,
					lng: 106.7012,
					status: "active",
					label: "John Smith"
				},
				{
					lat: 10.7762,
					lng: 106.7005,
					status: "responding",
					label: "Mike Chen"
				},
				{
					lat: 10.7782,
					lng: 106.7008,
					status: "idle",
					label: "Sarah Johnson"
				},
				{
					lat: 10.7758,
					lng: 106.7015,
					status: "skipped",
					label: "Robert Wilson"
				},
				{
					lat: 10.7765,
					lng: 106.6998,
					status: "offduty",
					label: "Emma Davis"
				}
			];
		});
		const routes = computed(() => {
			return [{
				id: "route-1",
				label: "John Smith - Sunset Gardens",
				path: [
					{
						lat: 10.7775,
						lng: 106.7012
					},
					{
						lat: 10.778,
						lng: 106.7018
					},
					{
						lat: 10.7785,
						lng: 106.7022
					},
					{
						lat: 10.7782,
						lng: 106.7008
					}
				],
				traveledPath: [{
					lat: 10.7775,
					lng: 106.7012
				}, {
					lat: 10.778,
					lng: 106.7018
				}],
				color: routeColors[0]
			}, {
				id: "route-2",
				label: "Mike Chen - Downtown Plaza",
				path: [
					{
						lat: 10.7762,
						lng: 106.7005
					},
					{
						lat: 10.7768,
						lng: 106.701
					},
					{
						lat: 10.7765,
						lng: 106.7015
					}
				],
				traveledPath: [{
					lat: 10.7762,
					lng: 106.7005
				}],
				color: routeColors[1]
			}];
		});
		const waypoints = computed(() => {
			return [
				{
					number: 1,
					lat: 10.778,
					lng: 106.7018,
					visited: true
				},
				{
					number: 2,
					lat: 10.7785,
					lng: 106.7022,
					visited: false
				},
				{
					number: 3,
					lat: 10.7782,
					lng: 106.7008,
					visited: false
				},
				{
					number: 4,
					lat: 10.7768,
					lng: 106.701,
					visited: true
				},
				{
					number: 5,
					lat: 10.7765,
					lng: 106.7015,
					visited: false
				}
			];
		});
		const posts = computed(() => {
			return [{
				lat: 10.7778,
				lng: 106.7015,
				type: "Main Gate"
			}, {
				lat: 10.7765,
				lng: 106.7002,
				type: "Entrance"
			}];
		});
		const emergencyCalls = computed(() => {
			return [{
				lat: 10.7773,
				lng: 106.7018,
				id: "EMG-001"
			}];
		});
		const boundaries = computed(() => {
			const list = [{
				name: "Sunset Gardens",
				paths: [
					{
						lat: 10.7755,
						lng: 106.6995
					},
					{
						lat: 10.7755,
						lng: 106.7025
					},
					{
						lat: 10.7785,
						lng: 106.7025
					},
					{
						lat: 10.7785,
						lng: 106.6995
					}
				]
			}];
			if (filters.value.community) return list.filter((b) => b.name === filters.value.community);
			return list;
		});
		const filteredOfficers = computed(() => {
			let list = officers.value;
			if (filters.value.onDutyOnly) list = list.filter((o) => o.status !== "offduty");
			if (filters.value.selectedOfficers.length > 0) list = list.filter((o) => filters.value.selectedOfficers.includes(o.label));
			if (filters.value.community) list = list.filter((o) => officerDetailsMap[o.label]?.community === filters.value.community);
			return filters.value.showOfficers ? list : [];
		});
		const filteredRoutes = computed(() => {
			if (!filters.value.showRoutes) return [];
			let list = routes.value;
			if (filters.value.selectedOfficers.length > 0) list = list.filter((r) => filters.value.selectedOfficers.some((name) => r.label.includes(name)));
			return list;
		});
		const filteredWaypoints = computed(() => {
			if (!filters.value.showRoutes) return [];
			return waypoints.value;
		});
		const filteredPosts = computed(() => {
			if (!filters.value.showPosts) return [];
			return posts.value;
		});
		const filteredEmergencyCalls = computed(() => {
			if (!filters.value.showEmergencyCalls) return [];
			return emergencyCalls.value;
		});
		const selectedOfficer = ref(null);
		const officerDetailsMap = {
			"John Smith": {
				id: "OFF-001",
				name: "John Smith",
				initials: "JS",
				community: "Sunset Gardens",
				site: "Gate A",
				shiftTime: "06:00 - 14:00",
				currentPost: "Main Gate",
				nextWaypoint: {
					name: "North Perimeter",
					eta: 8
				},
				lastGpsUpdate: "2 min ago",
				status: "On patrol route",
				statusColor: "#22c55e"
			},
			"Mike Chen": {
				id: "OFF-002",
				name: "Mike Chen",
				initials: "MC",
				community: "Downtown Plaza",
				site: "Main Entrance",
				shiftTime: "14:00 - 22:00",
				currentPost: "Entrance",
				activeCall: {
					id: "EMG-001",
					type: "Disturbance"
				},
				nextWaypoint: {
					name: "Loading Dock",
					eta: 4
				},
				lastGpsUpdate: "30 sec ago",
				status: "Responding to emergency call",
				statusColor: "#4f6ef7"
			},
			"Sarah Johnson": {
				id: "OFF-003",
				name: "Sarah Johnson",
				initials: "SJ",
				community: "Oakwood Residences",
				site: "Perimeter",
				shiftTime: "10:00 - 18:00",
				currentPost: "Perimeter Patrol",
				lastGpsUpdate: "5 min ago",
				status: "GPS signal lost",
				statusColor: "#f59e0b"
			},
			"Robert Wilson": {
				id: "OFF-004",
				name: "Robert Wilson",
				initials: "RW",
				community: "Marina Towers",
				site: "Parking",
				shiftTime: "16:00 - 00:00",
				currentPost: "Parking Level 1",
				nextWaypoint: {
					name: "Lobby Desk",
					eta: 12
				},
				lastGpsUpdate: "1 min ago",
				status: "Waypoint skipped",
				statusColor: "#ef4444"
			},
			"Emma Davis": {
				id: "OFF-005",
				name: "Emma Davis",
				initials: "ED",
				community: "Oakwood Residences",
				site: "Lobby",
				shiftTime: "22:00 - 06:00",
				currentPost: "Front Desk",
				lastGpsUpdate: "1 hr ago",
				status: "Checked out / not yet checked in",
				statusColor: "#6b7280"
			}
		};
		function handleMarkerClick(marker) {
			if (!marker.label) return;
			const info = officerDetailsMap[marker.label];
			if (info) selectedOfficer.value = info;
		}
		function closeOfficerPanel() {
			selectedOfficer.value = null;
		}
		const legend = [
			{
				color: "#22c55e",
				label: t("live_tracking.status_active")
			},
			{
				color: "#4f6ef7",
				label: t("live_tracking.status_responding")
			},
			{
				color: "#f59e0b",
				label: t("live_tracking.status_gps_lost")
			},
			{
				color: "#6b7280",
				label: t("live_tracking.status_offduty")
			},
			{
				color: "#ef4444",
				label: t("live_tracking.status_skipped")
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_LiveTrackingFilters = LiveTrackingFilters_default;
			const _component_Icon = components_default;
			const _component_GoogleMap = GoogleMap_default;
			const _component_OfficerInfoPanel = OfficerInfoPanel_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: unref(t)("nav.live_tracking"),
				breadcrumb: [{ label: "Dashboard" }, { label: unref(t)("nav.live_tracking") }]
			}, null, _parent));
			_push(`<div class="live-tracking-page" data-v-f9ef3e92><div class="live-tracking-main" data-v-f9ef3e92>`);
			_push(ssrRenderComponent(_component_LiveTrackingFilters, {
				modelValue: filters.value,
				"onUpdate:modelValue": ($event) => filters.value = $event,
				communities,
				officers: allOfficers,
				"refresh-interval": unref(refreshInterval),
				onRefresh: unref(refreshNow)
			}, null, _parent));
			_push(`<div class="live-tracking-content" data-v-f9ef3e92><div class="live-tracking-header" data-v-f9ef3e92><div class="live-badge" data-v-f9ef3e92><span class="live-badge__dot" data-v-f9ef3e92></span> ${ssrInterpolate(unref(t)("live_tracking.live"))}</div><div class="refresh-status" data-v-f9ef3e92>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:clock",
				size: 13
			}, null, _parent));
			_push(`<span data-v-f9ef3e92>${ssrInterpolate(unref(t)("live_tracking.refreshed_ago", { seconds: String(unref(secondsAgo)) }))}</span><button class="refresh-now-btn" data-v-f9ef3e92>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:refresh-cw",
				size: 13
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("live_tracking.refresh_now"))}</button></div><div class="live-tracking-legend" data-v-f9ef3e92><!--[-->`);
			ssrRenderList(legend, (item) => {
				_push(`<div class="legend-item" data-v-f9ef3e92><span class="legend-dot" style="${ssrRenderStyle({ background: item.color })}" data-v-f9ef3e92></span><span class="legend-label" data-v-f9ef3e92>${ssrInterpolate(item.label)}</span></div>`);
			});
			_push(`<!--]--></div></div><div class="live-tracking-map" data-v-f9ef3e92>`);
			_push(ssrRenderComponent(_component_GoogleMap, {
				center: {
					lat: 10.7769,
					lng: 106.7009
				},
				zoom: 16,
				markers: filteredOfficers.value,
				routes: filteredRoutes.value,
				waypoints: filteredWaypoints.value,
				posts: filteredPosts.value,
				"emergency-calls": filteredEmergencyCalls.value,
				boundaries: boundaries.value,
				height: "100%",
				onMarkerClick: handleMarkerClick
			}, null, _parent));
			_push(`</div></div></div>`);
			if (selectedOfficer.value) _push(ssrRenderComponent(_component_OfficerInfoPanel, {
				officer: selectedOfficer.value,
				onClose: closeOfficerPanel
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/live-tracking.vue
var _sfc_setup = live_tracking_vue_vue_type_script_setup_true_lang_default.setup;
live_tracking_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/live-tracking.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var live_tracking_default = /*#__PURE__*/ _plugin_vue_export_helper_default(live_tracking_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-f9ef3e92"]]);

export { live_tracking_default as default };
//# sourceMappingURL=live-tracking-bFNs-lml.mjs.map
