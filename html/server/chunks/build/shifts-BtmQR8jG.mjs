import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { defineComponent, ref, unref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttrs, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
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

//#region app/components/shifts/AllocationBoard.vue?vue&type=script&setup=true&lang.ts
var AllocationBoard_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AllocationBoard",
	__ssrInlineRender: true,
	props: {
		shifts: {},
		currentDate: {},
		selectedCommunity: {},
		officers: {}
	},
	emits: ["close", "allocate"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const { t } = useTranslation();
		ref(null);
		const hoveredShiftId = ref(null);
		const targetOfficer = ref(null);
		const showPostModal = ref(false);
		const targetShift = ref(null);
		const selectedPost = ref("");
		const showConflictModal = ref(false);
		const conflicts = ref([]);
		const conflictAcknowledged = ref(false);
		ref(null);
		const officerRoles = {
			"John Smith": "Security Supervisor",
			"Sarah Johnson": "Patrol Officer",
			"Mike Chen": "Gate Officer",
			"Emma Davis": "Patrol Officer",
			"Robert Wilson": "Night Supervisor"
		};
		const officerList = computed(() => {
			return props.officers.map((officer) => ({
				name: officer,
				role: officerRoles[officer] || "Security Officer",
				weekly_hours: Math.floor(Math.random() * 20) + 10
			}));
		});
		const dateStr = computed(() => {
			return props.currentDate.toISOString().split("T")[0] || "";
		});
		const dayShifts = computed(() => {
			return props.shifts.filter((shift) => shift.date === dateStr.value);
		});
		function formatShiftTime(shift) {
			return `${shift.start_time} - ${shift.end_time}`;
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "allocation-overlay" }, _attrs))} data-v-c3526c5c><div class="allocation-board" data-v-c3526c5c><div class="allocation-header" data-v-c3526c5c><h3 data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.allocation_board"))}</h3><button class="close-btn" data-v-c3526c5c>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:x",
				size: 20
			}, null, _parent));
			_push(`</button></div><div class="allocation-body" data-v-c3526c5c><div class="officers-panel" data-v-c3526c5c><div class="panel-title" data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.available_officers"))} <span class="panel-subtitle" data-v-c3526c5c>${ssrInterpolate(dateStr.value)}</span></div><div class="officers-list" data-v-c3526c5c><!--[-->`);
			ssrRenderList(officerList.value, (officer) => {
				_push(`<div class="officer-card" draggable="true" data-v-c3526c5c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:grip-vertical",
					size: 16,
					class: "drag-handle"
				}, null, _parent));
				_push(`<div class="officer-info" data-v-c3526c5c><div class="officer-name" data-v-c3526c5c>${ssrInterpolate(officer.name)}</div><div class="officer-role" data-v-c3526c5c>${ssrInterpolate(officer.role)}</div></div><div class="officer-hours" data-v-c3526c5c><span class="hours-value" data-v-c3526c5c>${ssrInterpolate(officer.weekly_hours)}h</span><span class="hours-label" data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.weekly_hours"))}</span></div></div>`);
			});
			_push(`<!--]--></div></div><div class="shifts-panel" data-v-c3526c5c><div class="panel-title" data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.shift_timeline"))} <span class="panel-subtitle" data-v-c3526c5c>${ssrInterpolate(__props.selectedCommunity || unref(t)("shifts.all_communities"))}</span></div><div class="shifts-list" data-v-c3526c5c><!--[-->`);
			ssrRenderList(dayShifts.value, (shift) => {
				_push(`<div class="${ssrRenderClass([{ "allocation-shift--droppable": hoveredShiftId.value === shift.id }, "allocation-shift"])}" data-v-c3526c5c><div class="shift-main" data-v-c3526c5c><div class="shift-time" data-v-c3526c5c>${ssrInterpolate(formatShiftTime(shift))}</div><div class="shift-community" data-v-c3526c5c>${ssrInterpolate(shift.community)}</div></div><div class="shift-allocations" data-v-c3526c5c>`);
				if (shift.officers.length === 0) _push(`<div class="empty-allocation" data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.drop_officer_here"))}</div>`);
				else _push(`<!---->`);
				_push(`<!--[-->`);
				ssrRenderList(shift.officers, (officer) => {
					_push(`<div class="allocated-officer" data-v-c3526c5c>${ssrInterpolate(officer)}</div>`);
				});
				_push(`<!--]--></div></div>`);
			});
			_push(`<!--]-->`);
			if (dayShifts.value.length === 0) _push(`<div class="no-shifts" data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.no_shifts_for_day"))}</div>`);
			else _push(`<!---->`);
			_push(`</div></div></div></div>`);
			if (showPostModal.value) {
				_push(`<div class="post-modal-overlay" data-v-c3526c5c><div class="post-modal" data-v-c3526c5c><div class="post-modal-header" data-v-c3526c5c><h4 data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.post_assignment"))}</h4><button class="close-btn" data-v-c3526c5c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 18
				}, null, _parent));
				_push(`</button></div><div class="post-modal-body" data-v-c3526c5c><p class="post-modal-text" data-v-c3526c5c>${ssrInterpolate(targetOfficer.value && targetShift.value ? unref(t)("shifts.assign_officer_to_post", {
					officer: targetOfficer.value,
					shift: targetShift.value.id
				}) : "")}</p><div class="form-group" data-v-c3526c5c><label class="form-label" data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.select_post"))}</label><select class="form-input" data-v-c3526c5c><option value="" data-v-c3526c5c${ssrIncludeBooleanAttr(Array.isArray(selectedPost.value) ? ssrLooseContain(selectedPost.value, "") : ssrLooseEqual(selectedPost.value, "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("shifts.no_specific_post"))}</option><!--[-->`);
				ssrRenderList(targetShift.value?.posts, (post) => {
					_push(`<option${ssrRenderAttr("value", post)} data-v-c3526c5c${ssrIncludeBooleanAttr(Array.isArray(selectedPost.value) ? ssrLooseContain(selectedPost.value, post) : ssrLooseEqual(selectedPost.value, post)) ? " selected" : ""}>${ssrInterpolate(post)}</option>`);
				});
				_push(`<!--]--></select></div></div><div class="post-modal-footer" data-v-c3526c5c><button class="btn btn--secondary" data-v-c3526c5c>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn btn--primary" data-v-c3526c5c>${ssrInterpolate(unref(t)("common.confirm"))}</button></div></div></div>`);
			} else _push(`<!---->`);
			if (showConflictModal.value) {
				_push(`<div class="post-modal-overlay" data-v-c3526c5c><div class="post-modal" data-v-c3526c5c><div class="post-modal-header" data-v-c3526c5c><h4 data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.allocation_conflicts"))}</h4><button class="close-btn" data-v-c3526c5c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 18
				}, null, _parent));
				_push(`</button></div><div class="post-modal-body" data-v-c3526c5c><div class="conflict-warning" data-v-c3526c5c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:alert-triangle",
					size: 20
				}, null, _parent));
				_push(`<span data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.conflict_warning_text"))}</span></div><ul class="conflict-list" data-v-c3526c5c><!--[-->`);
				ssrRenderList(conflicts.value, (conflict, index) => {
					_push(`<li class="conflict-item" data-v-c3526c5c>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:alert-circle",
						size: 16
					}, null, _parent));
					_push(` ${ssrInterpolate(conflict)}</li>`);
				});
				_push(`<!--]--></ul><label class="checkbox-label" data-v-c3526c5c><input${ssrIncludeBooleanAttr(Array.isArray(conflictAcknowledged.value) ? ssrLooseContain(conflictAcknowledged.value, null) : conflictAcknowledged.value) ? " checked" : ""} type="checkbox" data-v-c3526c5c> ${ssrInterpolate(unref(t)("shifts.conflict_acknowledge"))}</label></div><div class="post-modal-footer" data-v-c3526c5c><button class="btn btn--secondary" data-v-c3526c5c>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn btn--danger"${ssrIncludeBooleanAttr(!conflictAcknowledged.value) ? " disabled" : ""} data-v-c3526c5c>${ssrInterpolate(unref(t)("shifts.proceed_with_conflict"))}</button></div></div></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/shifts/AllocationBoard.vue
var _sfc_setup$4 = AllocationBoard_vue_vue_type_script_setup_true_lang_default.setup;
AllocationBoard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/shifts/AllocationBoard.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var AllocationBoard_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(AllocationBoard_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c3526c5c"]]), { __name: "AllocationBoard" });
//#endregion
//#region app/components/shifts/PatrolRoutePanel.vue?vue&type=script&setup=true&lang.ts
var PatrolRoutePanel_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PatrolRoutePanel",
	__ssrInlineRender: true,
	props: { shift: {} },
	emits: [
		"close",
		"generate",
		"save"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const { t } = useTranslation();
		const localRoute = ref(props.shift.route ? [...props.shift.route] : []);
		ref(null);
		const hasRoute = computed(() => localRoute.value.length > 0);
		function priorityClass(priority) {
			return `badge--priority-${priority}`;
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "route-overlay" }, _attrs))} data-v-72f8d912><div class="route-panel" data-v-72f8d912><div class="route-header" data-v-72f8d912><div data-v-72f8d912><h3 data-v-72f8d912>${ssrInterpolate(unref(t)("shifts.patrol_route"))}</h3><p class="route-subtitle" data-v-72f8d912>${ssrInterpolate(__props.shift.community)} — ${ssrInterpolate(__props.shift.id)}</p></div><button class="close-btn" data-v-72f8d912>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:x",
				size: 20
			}, null, _parent));
			_push(`</button></div><div class="route-body" data-v-72f8d912><div class="route-actions" data-v-72f8d912><button class="btn btn--primary" data-v-72f8d912>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:sparkles",
				size: 16
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("shifts.regenerate_route"))}</button>`);
			if (!hasRoute.value) _push(`<span class="route-hint" data-v-72f8d912>${ssrInterpolate(unref(t)("shifts.no_route_hint"))}</span>`);
			else _push(`<!---->`);
			_push(`</div>`);
			if (hasRoute.value) {
				_push(`<div class="waypoints-list" data-v-72f8d912><!--[-->`);
				ssrRenderList(localRoute.value, (waypoint, index) => {
					_push(`<div class="waypoint-card" draggable="true" data-v-72f8d912><div class="waypoint-number" data-v-72f8d912>${ssrInterpolate(waypoint.number)}</div><div class="waypoint-info" data-v-72f8d912><div class="waypoint-name" data-v-72f8d912>${ssrInterpolate(waypoint.location_name)}</div><div class="waypoint-meta" data-v-72f8d912><span data-v-72f8d912>${ssrInterpolate(unref(t)("shifts.eta"))} ${ssrInterpolate(waypoint.eta_minutes)}m</span><span data-v-72f8d912>${ssrInterpolate(unref(t)("shifts.dwell"))} ${ssrInterpolate(waypoint.dwell_minutes)}m</span><span class="${ssrRenderClass(["badge", priorityClass(waypoint.priority)])}" data-v-72f8d912>${ssrInterpolate(waypoint.priority)}</span></div>`);
					if (waypoint.notes) _push(`<div class="waypoint-notes" data-v-72f8d912>${ssrInterpolate(waypoint.notes)}</div>`);
					else _push(`<!---->`);
					_push(`</div><button class="remove-btn" data-v-72f8d912>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 16
					}, null, _parent));
					_push(`</button></div>`);
				});
				_push(`<!--]--></div>`);
			} else {
				_push(`<div class="route-empty" data-v-72f8d912>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:map-pin",
					size: 48
				}, null, _parent));
				_push(`<p data-v-72f8d912>${ssrInterpolate(unref(t)("shifts.route_empty"))}</p></div>`);
			}
			_push(`</div><div class="route-footer" data-v-72f8d912><button class="btn btn--secondary" data-v-72f8d912>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn btn--primary" data-v-72f8d912>${ssrInterpolate(unref(t)("common.save"))}</button></div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/shifts/PatrolRoutePanel.vue
var _sfc_setup$3 = PatrolRoutePanel_vue_vue_type_script_setup_true_lang_default.setup;
PatrolRoutePanel_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/shifts/PatrolRoutePanel.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var PatrolRoutePanel_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PatrolRoutePanel_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-72f8d912"]]), { __name: "PatrolRoutePanel" });
//#endregion
//#region app/composables/useShifts.ts
var shifts = ref([
	{
		id: "SHF-001",
		community: "Sunset Gardens",
		site: "Gate A",
		officers: ["John Smith", "Mike Chen"],
		start_time: "06:00",
		end_time: "14:00",
		date: "2026-06-15",
		status: "published",
		posts: ["Main Gate", "Patrol"],
		notes: "Regular morning shift"
	},
	{
		id: "SHF-002",
		community: "Oakwood Residences",
		site: "Lobby",
		officers: ["Sarah Johnson"],
		start_time: "14:00",
		end_time: "22:00",
		date: "2026-06-15",
		status: "active",
		posts: ["Front Desk"],
		notes: ""
	},
	{
		id: "SHF-003",
		community: "Marina Towers",
		site: "Parking",
		officers: ["Emma Davis", "Robert Wilson"],
		start_time: "22:00",
		end_time: "06:00",
		date: "2026-06-15",
		status: "draft",
		posts: ["Parking Level 1", "Parking Level 2"],
		notes: "Overnight shift"
	},
	{
		id: "SHF-004",
		community: "Sunset Gardens",
		site: "Gate A",
		officers: ["John Smith"],
		start_time: "06:00",
		end_time: "14:00",
		date: "2026-06-16",
		status: "completed",
		posts: ["Main Gate"],
		notes: ""
	},
	{
		id: "SHF-005",
		community: "Downtown Plaza",
		site: "Main Entrance",
		officers: ["Mike Chen"],
		start_time: "08:00",
		end_time: "16:00",
		date: "2026-06-17",
		status: "cancelled",
		posts: ["Entrance"],
		notes: "Cancelled due to event"
	},
	{
		id: "SHF-006",
		community: "Oakwood Residences",
		site: "Perimeter",
		officers: ["Sarah Johnson", "Emma Davis"],
		start_time: "10:00",
		end_time: "18:00",
		date: "2026-06-18",
		status: "published",
		posts: ["Perimeter Patrol"],
		notes: ""
	},
	{
		id: "SHF-007",
		community: "Marina Towers",
		site: "Lobby",
		officers: ["Robert Wilson"],
		start_time: "16:00",
		end_time: "00:00",
		date: "2026-06-18",
		status: "active",
		posts: ["Lobby Desk"],
		notes: ""
	},
	{
		id: "SHF-008",
		community: "Sunset Gardens",
		site: "Gate A",
		officers: ["John Smith", "Sarah Johnson"],
		start_time: "06:00",
		end_time: "14:00",
		date: "2026-06-19",
		status: "published",
		posts: ["Main Gate", "Patrol"],
		notes: "Weekend shift"
	},
	{
		id: "SHF-009",
		community: "Downtown Plaza",
		site: "Main Entrance",
		officers: ["Mike Chen"],
		start_time: "14:00",
		end_time: "22:00",
		date: "2026-06-20",
		status: "draft",
		posts: ["Entrance"],
		notes: ""
	},
	{
		id: "SHF-010",
		community: "Oakwood Residences",
		site: "Lobby",
		officers: ["Emma Davis"],
		start_time: "22:00",
		end_time: "06:00",
		date: "2026-06-21",
		status: "published",
		posts: ["Front Desk"],
		notes: "Sunday night"
	},
	{
		id: "SHF-011",
		community: "Sunset Gardens",
		site: "Gate A",
		officers: [],
		start_time: "06:00",
		end_time: "14:00",
		date: "2026-06-21",
		status: "published",
		posts: ["Main Gate"],
		notes: ""
	},
	{
		id: "SHF-012",
		community: "Sunset Gardens",
		site: "Gate B",
		officers: [],
		start_time: "08:00",
		end_time: "16:00",
		date: "2026-06-21",
		status: "published",
		posts: ["Secondary Gate"],
		notes: "Overlaps with SHF-011 from 08:00 to 14:00"
	},
	{
		id: "SHF-013",
		community: "Marina Towers",
		site: "Parking",
		officers: [],
		start_time: "14:00",
		end_time: "22:00",
		date: "2026-06-21",
		status: "published",
		posts: ["Parking Level 1"],
		notes: ""
	},
	{
		id: "SHF-014",
		community: "Downtown Plaza",
		site: "Main Entrance",
		officers: [],
		start_time: "16:00",
		end_time: "00:00",
		date: "2026-06-21",
		status: "published",
		posts: ["Entrance"],
		notes: "Overlaps with SHF-013 from 16:00 to 22:00"
	},
	{
		id: "SHF-015",
		community: "Oakwood Residences",
		site: "Perimeter",
		officers: [],
		start_time: "22:00",
		end_time: "06:00",
		date: "2026-06-21",
		status: "published",
		posts: ["Perimeter Patrol"],
		notes: ""
	}
]);
var baseLat = 10.7769;
var baseLng = 106.7009;
var defaultCheckpointNames = [
	"North Perimeter - Camera 4",
	"East Gate Checkpoint",
	"South Parking Patrol",
	"West Entrance",
	"Central Courtyard",
	"Building A Lobby",
	"Emergency Exit B",
	"Rooftop Access",
	"Loading Dock",
	"Visitor Parking"
];
var checkpointNotes = [
	"Check perimeter fence",
	"Verify ID badges",
	"Inspect fire extinguishers",
	"Monitor entry logs",
	"Patrol high traffic area",
	"Check lighting systems",
	"Verify emergency exits",
	"Scan for suspicious activity",
	"Inspect cargo area",
	"Check vehicle permits"
];
function generateRoute(shiftId) {
	const shift = shifts.value.find((s) => s.id === shiftId);
	if (!shift) return [];
	const priorities = [
		"low",
		"medium",
		"high",
		"critical"
	];
	const postWaypoints = shift.posts.map((post, index) => ({
		number: index + 1,
		location_name: post,
		lat: baseLat + index * .002,
		lng: baseLng + index * .003,
		eta_minutes: index === 0 ? 0 : 5 + index * 3,
		dwell_minutes: 10 + index % 3 * 5,
		priority: priorities[index % priorities.length] || "low",
		notes: index === 0 ? "Start point" : `Mandatory post: ${post}`
	}));
	const targetCount = Math.floor(Math.random() * 4) + 5;
	const extraNeeded = Math.max(0, targetCount - postWaypoints.length);
	const extraWaypoints = [];
	for (let i = 0; i < extraNeeded; i++) {
		const index = postWaypoints.length + i;
		const checkpointIndex = (index + shift.id.charCodeAt(shift.id.length - 1)) % defaultCheckpointNames.length;
		const locationName = defaultCheckpointNames[checkpointIndex] || "Patrol Checkpoint";
		const note = checkpointNotes[checkpointIndex] || "Standard patrol checkpoint";
		extraWaypoints.push({
			number: index + 1,
			location_name: locationName,
			lat: baseLat + index * .0018,
			lng: baseLng + index * .0025,
			eta_minutes: 5 + index * 3,
			dwell_minutes: 8 + index % 4 * 4,
			priority: priorities[index % priorities.length] || "low",
			notes: note
		});
	}
	const route = [...postWaypoints, ...extraWaypoints].map((wp, index) => ({
		...wp,
		number: index + 1
	}));
	shift.route = route;
	return route;
}
function saveRoute(shiftId, route) {
	const shift = shifts.value.find((s) => s.id === shiftId);
	if (shift) shift.route = route;
}
//#endregion
//#region app/components/shifts/ShiftsManagement.vue?vue&type=script&setup=true&lang.ts
var ShiftsManagement_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ShiftsManagement",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const viewMode = ref("week");
		const currentDate = ref(/* @__PURE__ */ new Date("2026-06-21"));
		const selectedShift = ref(null);
		const showDetailsPanel = ref(false);
		const showAllocationBoard = ref(false);
		const showRoutePanel = ref(false);
		const emptyShiftForm = () => ({
			id: "",
			community: "",
			site: "",
			date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] || "",
			start_time: "08:00",
			end_time: "16:00",
			officers: [],
			posts: [],
			notes: "",
			status: "draft",
			recurring: false,
			recurrence_pattern: "daily",
			repeat_on: [],
			end_condition: "no_end",
			end_date: "",
			occurrences: 1
		});
		const shiftForm = ref(emptyShiftForm());
		const postsInput = computed({
			get: () => shiftForm.value.posts.join(", "),
			set: (value) => {
				shiftForm.value.posts = value.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
			}
		});
		const selectedCommunity = ref("");
		const selectedOfficer = ref("");
		const selectedStatus = ref([]);
		const dateFrom = ref("");
		const dateTo = ref("");
		const communities = [
			"Sunset Gardens",
			"Oakwood Residences",
			"Marina Towers",
			"Downtown Plaza"
		];
		const officers = [
			"John Smith",
			"Sarah Johnson",
			"Mike Chen",
			"Emma Davis",
			"Robert Wilson"
		];
		const allStatuses = [
			"draft",
			"published",
			"active",
			"completed",
			"cancelled"
		];
		const filteredShifts = computed(() => {
			return shifts.value.filter((shift) => {
				if (selectedCommunity.value && shift.community !== selectedCommunity.value) return false;
				if (selectedOfficer.value && !shift.officers.some((o) => o.toLowerCase().includes(selectedOfficer.value.toLowerCase()))) return false;
				if (selectedStatus.value.length > 0 && !selectedStatus.value.includes(shift.status)) return false;
				if (dateFrom.value && shift.date < dateFrom.value) return false;
				if (dateTo.value && shift.date > dateTo.value) return false;
				return true;
			});
		});
		const weekDays = computed(() => {
			const start = new Date(currentDate.value);
			const day = start.getDay();
			const diff = start.getDate() - day + (day === 0 ? -6 : 1);
			start.setDate(diff);
			start.setHours(0, 0, 0, 0);
			const days = [];
			for (let i = 0; i < 7; i++) {
				const d = new Date(start);
				d.setDate(start.getDate() + i);
				days.push({
					date: d,
					label: d.toLocaleDateString("en-US", { weekday: "short" }),
					dateStr: d.toISOString().split("T")[0] || ""
				});
			}
			return days;
		});
		const monthDays = computed(() => {
			const year = currentDate.value.getFullYear();
			const month = currentDate.value.getMonth();
			const firstDay = new Date(year, month, 1);
			const start = new Date(firstDay);
			start.setDate(start.getDate() - firstDay.getDay());
			const days = [];
			for (let i = 0; i < 42; i++) {
				const d = new Date(start);
				d.setDate(start.getDate() + i);
				const dateStr = d.toISOString().split("T")[0] || "";
				const count = filteredShifts.value.filter((shift) => shift.date === dateStr).length;
				days.push({
					date: d,
					dateStr,
					count
				});
			}
			return days;
		});
		const dayLabel = computed(() => {
			return currentDate.value.toLocaleDateString("en-US", {
				weekday: "long",
				month: "short",
				day: "numeric"
			});
		});
		const currentRangeLabel = computed(() => {
			if (viewMode.value === "day") return currentDate.value.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric"
			});
			if (viewMode.value === "week") {
				const start = weekDays.value[0]?.date ?? /* @__PURE__ */ new Date();
				const end = weekDays.value[6]?.date ?? /* @__PURE__ */ new Date();
				return `${start.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric"
				})} - ${end.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric"
				})}`;
			}
			return currentDate.value.toLocaleDateString("en-US", {
				month: "long",
				year: "numeric"
			});
		});
		function getShiftsForDate(dateStr) {
			return filteredShifts.value.filter((shift) => shift.date === dateStr);
		}
		function getShiftsForOfficerDay(officer, dateStr) {
			return filteredShifts.value.filter((shift) => shift.date === dateStr && shift.officers.includes(officer));
		}
		function getDayViewColumns() {
			const dateStr = currentDate.value.toISOString().split("T")[0] || "";
			const usedOfficers = Array.from(new Set(filteredShifts.value.filter((shift) => shift.date === dateStr).flatMap((shift) => shift.officers)));
			if (usedOfficers.length === 0) return officers.map((officer) => ({
				officer,
				shifts: []
			}));
			return usedOfficers.map((officer) => ({
				officer,
				shifts: getShiftsForOfficerDay(officer, dateStr)
			}));
		}
		function closeAllocationBoard() {
			showAllocationBoard.value = false;
		}
		function closeRoutePanel() {
			showRoutePanel.value = false;
		}
		function handleSaveRoute(shiftId, route) {
			saveRoute(shiftId, route);
			closeRoutePanel();
		}
		function handleAllocate(shiftId, officer, post) {
			const shift = shifts.value.find((s) => s.id === shiftId);
			if (shift && !shift.officers.includes(officer)) {
				shift.officers.push(officer);
				if (post && !shift.posts.includes(post)) shift.posts.push(post);
			}
		}
		function formatTimeRange(start, end) {
			return `${start} - ${end}`;
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Badge = Badge_default;
			const _component_Icon = components_default;
			const _component_AllocationBoard = AllocationBoard_default;
			const _component_PatrolRoutePanel = PatrolRoutePanel_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "shifts-management" }, _attrs))} data-v-9b9dd166><div class="shifts-filters" data-v-9b9dd166><div class="filter-row" data-v-9b9dd166><select class="filter-select" data-v-9b9dd166><option value="" data-v-9b9dd166${ssrIncludeBooleanAttr(Array.isArray(selectedCommunity.value) ? ssrLooseContain(selectedCommunity.value, "") : ssrLooseEqual(selectedCommunity.value, "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("shifts.all_communities"))}</option><!--[-->`);
			ssrRenderList(communities, (community) => {
				_push(`<option${ssrRenderAttr("value", community)} data-v-9b9dd166${ssrIncludeBooleanAttr(Array.isArray(selectedCommunity.value) ? ssrLooseContain(selectedCommunity.value, community) : ssrLooseEqual(selectedCommunity.value, community)) ? " selected" : ""}>${ssrInterpolate(community)}</option>`);
			});
			_push(`<!--]--></select><input${ssrRenderAttr("value", selectedOfficer.value)} type="text" class="filter-input"${ssrRenderAttr("placeholder", unref(t)("shifts.officer_placeholder"))} data-v-9b9dd166><div class="status-filter" data-v-9b9dd166><span class="filter-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.status"))}:</span><!--[-->`);
			ssrRenderList(allStatuses, (status) => {
				_push(`<button class="${ssrRenderClass([{ "status-chip--active": selectedStatus.value.includes(status) }, "status-chip"])}" data-v-9b9dd166>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "shiftStatus",
					value: status
				}, null, _parent));
				_push(`</button>`);
			});
			_push(`<!--]--></div><div class="date-range" data-v-9b9dd166><input${ssrRenderAttr("value", dateFrom.value)} type="date" class="date-input" data-v-9b9dd166><span data-v-9b9dd166>-</span><input${ssrRenderAttr("value", dateTo.value)} type="date" class="date-input" data-v-9b9dd166></div><button class="btn btn--primary add-shift-btn" data-v-9b9dd166>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:plus",
				size: 16
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("shifts.add_new"))}</button></div></div><div class="calendar-toolbar" data-v-9b9dd166><div class="calendar-nav" data-v-9b9dd166><button class="nav-btn" data-v-9b9dd166>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevron-left",
				size: 18
			}, null, _parent));
			_push(`</button><button class="today-btn" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.today"))}</button><button class="nav-btn" data-v-9b9dd166>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevron-right",
				size: 18
			}, null, _parent));
			_push(`</button></div><div class="calendar-range" data-v-9b9dd166>${ssrInterpolate(currentRangeLabel.value)}</div><div class="view-tabs" data-v-9b9dd166><button class="${ssrRenderClass([{ "view-tab--active": viewMode.value === "day" }, "view-tab"])}" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.day_view"))}</button><button class="${ssrRenderClass([{ "view-tab--active": viewMode.value === "week" }, "view-tab"])}" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.week_view"))}</button><button class="${ssrRenderClass([{ "view-tab--active": viewMode.value === "month" }, "view-tab"])}" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.month_view"))}</button></div><button class="btn btn--secondary allocation-board-btn" data-v-9b9dd166>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:users",
				size: 16
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("shifts.allocation_board"))}</button></div><div class="calendar-container" data-v-9b9dd166>`);
			if (viewMode.value === "week") {
				_push(`<div class="week-view" data-v-9b9dd166><div class="week-header" data-v-9b9dd166><div class="week-header-cell time-column" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.time"))}</div><!--[-->`);
				ssrRenderList(weekDays.value, (day) => {
					_push(`<div class="${ssrRenderClass([{ "week-header-cell--today": day.dateStr === (/* @__PURE__ */ new Date()).toISOString().split("T")[0] }, "week-header-cell"])}" data-v-9b9dd166><div class="day-label" data-v-9b9dd166>${ssrInterpolate(day.label)}</div><div class="day-number" data-v-9b9dd166>${ssrInterpolate(day.date.getDate())}</div></div>`);
				});
				_push(`<!--]--></div><div class="week-body" data-v-9b9dd166><!--[-->`);
				ssrRenderList(weekDays.value, (day) => {
					_push(`<div class="week-day-column" data-v-9b9dd166><!--[-->`);
					ssrRenderList(getShiftsForDate(day.dateStr), (shift) => {
						_push(`<div class="${ssrRenderClass([`shift-block--${shift.status}`, "shift-block"])}" data-v-9b9dd166><div class="shift-time" data-v-9b9dd166>${ssrInterpolate(formatTimeRange(shift.start_time, shift.end_time))}</div><div class="shift-officers" data-v-9b9dd166>${ssrInterpolate(shift.officers.join(", "))}</div><div class="shift-site" data-v-9b9dd166>${ssrInterpolate(shift.community)} - ${ssrInterpolate(shift.site)}</div><div class="shift-meta" data-v-9b9dd166>`);
						_push(ssrRenderComponent(_component_Badge, {
							type: "shiftStatus",
							value: shift.status
						}, null, _parent));
						if (shift.posts.length) _push(`<span class="shift-posts" data-v-9b9dd166>${ssrInterpolate(shift.posts.join(", "))}</span>`);
						else _push(`<!---->`);
						_push(`</div></div>`);
					});
					_push(`<!--]-->`);
					if (getShiftsForDate(day.dateStr).length === 0) _push(`<div class="no-shifts-day" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.no_shifts"))}</div>`);
					else _push(`<!---->`);
					_push(`</div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			if (viewMode.value === "day") {
				_push(`<div class="day-view" data-v-9b9dd166><div class="day-view-header" data-v-9b9dd166>${ssrInterpolate(dayLabel.value)}</div><div class="day-view-columns" data-v-9b9dd166><!--[-->`);
				ssrRenderList(getDayViewColumns(), (col) => {
					_push(`<div class="day-officer-column" data-v-9b9dd166><div class="day-officer-name" data-v-9b9dd166>${ssrInterpolate(col.officer)}</div><!--[-->`);
					ssrRenderList(col.shifts, (shift) => {
						_push(`<div class="${ssrRenderClass([`shift-block--${shift.status}`, "shift-block"])}" data-v-9b9dd166><div class="shift-time" data-v-9b9dd166>${ssrInterpolate(formatTimeRange(shift.start_time, shift.end_time))}</div><div class="shift-site" data-v-9b9dd166>${ssrInterpolate(shift.community)} - ${ssrInterpolate(shift.site)}</div><div class="shift-meta" data-v-9b9dd166>`);
						_push(ssrRenderComponent(_component_Badge, {
							type: "shiftStatus",
							value: shift.status
						}, null, _parent));
						if (shift.posts.length) _push(`<span class="shift-posts" data-v-9b9dd166>${ssrInterpolate(shift.posts.join(", "))}</span>`);
						else _push(`<!---->`);
						_push(`</div></div>`);
					});
					_push(`<!--]-->`);
					if (col.shifts.length === 0) _push(`<div class="no-shifts-day" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.no_shifts"))}</div>`);
					else _push(`<!---->`);
					_push(`</div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			if (viewMode.value === "month") {
				_push(`<div class="month-view" data-v-9b9dd166><div class="month-weekdays" data-v-9b9dd166><!--[-->`);
				ssrRenderList([
					"Sun",
					"Mon",
					"Tue",
					"Wed",
					"Thu",
					"Fri",
					"Sat"
				], (day) => {
					_push(`<div class="month-weekday" data-v-9b9dd166>${ssrInterpolate(day)}</div>`);
				});
				_push(`<!--]--></div><div class="month-grid" data-v-9b9dd166><!--[-->`);
				ssrRenderList(monthDays.value, (day) => {
					_push(`<div class="${ssrRenderClass([{
						"month-cell--today": day.dateStr === (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
						"month-cell--other": day.date.getMonth() !== currentDate.value.getMonth()
					}, "month-cell"])}" data-v-9b9dd166><div class="month-cell-date" data-v-9b9dd166>${ssrInterpolate(day.date.getDate())}</div>`);
					if (day.count > 0) {
						_push(`<div class="month-shift-count" data-v-9b9dd166>`);
						_push(ssrRenderComponent(_component_Badge, {
							type: "shiftCount",
							value: day.count
						}, null, _parent));
						_push(`</div>`);
					} else _push(`<div class="month-empty" data-v-9b9dd166>-</div>`);
					_push(`</div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
			if (showDetailsPanel.value) {
				_push(`<div class="slide-over-overlay" data-v-9b9dd166><div class="slide-over" data-v-9b9dd166><div class="slide-over__header" data-v-9b9dd166><h3 data-v-9b9dd166>${ssrInterpolate(selectedShift.value ? unref(t)("shifts.shift_details") : unref(t)("shifts.add_new_shift"))}</h3><button class="close-btn" data-v-9b9dd166>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 20
				}, null, _parent));
				_push(`</button></div><div class="slide-over__body" data-v-9b9dd166><div class="shift-form" data-v-9b9dd166><div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.shift_id"))}</label><input${ssrRenderAttr("value", shiftForm.value.id)} type="text" class="form-input"${ssrIncludeBooleanAttr(true) ? " disabled" : ""}${ssrRenderAttr("placeholder", unref(t)("shifts.auto_generated"))} data-v-9b9dd166></div><div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.community"))} *</label><select class="form-input" data-v-9b9dd166><option value="" data-v-9b9dd166${ssrIncludeBooleanAttr(Array.isArray(shiftForm.value.community) ? ssrLooseContain(shiftForm.value.community, "") : ssrLooseEqual(shiftForm.value.community, "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("shifts.select_community"))}</option><!--[-->`);
				ssrRenderList(communities, (community) => {
					_push(`<option${ssrRenderAttr("value", community)} data-v-9b9dd166${ssrIncludeBooleanAttr(Array.isArray(shiftForm.value.community) ? ssrLooseContain(shiftForm.value.community, community) : ssrLooseEqual(shiftForm.value.community, community)) ? " selected" : ""}>${ssrInterpolate(community)}</option>`);
				});
				_push(`<!--]--></select></div><div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.shift_date"))} *</label><input${ssrRenderAttr("value", shiftForm.value.date)} type="date" class="form-input" data-v-9b9dd166></div><div class="form-row" data-v-9b9dd166><div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.start_time"))} *</label><input${ssrRenderAttr("value", shiftForm.value.start_time)} type="time" class="form-input" data-v-9b9dd166></div><div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.end_time"))} *</label><input${ssrRenderAttr("value", shiftForm.value.end_time)} type="time" class="form-input" data-v-9b9dd166></div></div><div class="form-group form-group--inline" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.recurring"))}</label><label class="toggle" data-v-9b9dd166><input${ssrIncludeBooleanAttr(Array.isArray(shiftForm.value.recurring) ? ssrLooseContain(shiftForm.value.recurring, null) : shiftForm.value.recurring) ? " checked" : ""} type="checkbox" data-v-9b9dd166><span class="toggle-slider" data-v-9b9dd166></span></label></div>`);
				if (shiftForm.value.recurring) {
					_push(`<div class="recurring-section" data-v-9b9dd166><div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.recurrence_pattern"))}</label><select class="form-input" data-v-9b9dd166><option value="daily" data-v-9b9dd166${ssrIncludeBooleanAttr(Array.isArray(shiftForm.value.recurrence_pattern) ? ssrLooseContain(shiftForm.value.recurrence_pattern, "daily") : ssrLooseEqual(shiftForm.value.recurrence_pattern, "daily")) ? " selected" : ""}>${ssrInterpolate(unref(t)("shifts.daily"))}</option><option value="specific_days" data-v-9b9dd166${ssrIncludeBooleanAttr(Array.isArray(shiftForm.value.recurrence_pattern) ? ssrLooseContain(shiftForm.value.recurrence_pattern, "specific_days") : ssrLooseEqual(shiftForm.value.recurrence_pattern, "specific_days")) ? " selected" : ""}>${ssrInterpolate(unref(t)("shifts.specific_days"))}</option><option value="every_x_days" data-v-9b9dd166${ssrIncludeBooleanAttr(Array.isArray(shiftForm.value.recurrence_pattern) ? ssrLooseContain(shiftForm.value.recurrence_pattern, "every_x_days") : ssrLooseEqual(shiftForm.value.recurrence_pattern, "every_x_days")) ? " selected" : ""}>${ssrInterpolate(unref(t)("shifts.every_x_days"))}</option></select></div>`);
					if (shiftForm.value.recurrence_pattern === "specific_days") {
						_push(`<div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.repeat_on"))}</label><div class="day-selector" data-v-9b9dd166><!--[-->`);
						ssrRenderList([
							"Mon",
							"Tue",
							"Wed",
							"Thu",
							"Fri",
							"Sat",
							"Sun"
						], (day) => {
							_push(`<button type="button" class="${ssrRenderClass([{ "day-chip--active": shiftForm.value.repeat_on.includes(day) }, "day-chip"])}" data-v-9b9dd166>${ssrInterpolate(day)}</button>`);
						});
						_push(`<!--]--></div></div>`);
					} else _push(`<!---->`);
					_push(`<div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.end_condition"))}</label><div class="radio-group" data-v-9b9dd166><label class="radio-label" data-v-9b9dd166><input${ssrIncludeBooleanAttr(ssrLooseEqual(shiftForm.value.end_condition, "end_date")) ? " checked" : ""} type="radio" value="end_date" data-v-9b9dd166> ${ssrInterpolate(unref(t)("shifts.end_date_option"))}</label><label class="radio-label" data-v-9b9dd166><input${ssrIncludeBooleanAttr(ssrLooseEqual(shiftForm.value.end_condition, "occurrences")) ? " checked" : ""} type="radio" value="occurrences" data-v-9b9dd166> ${ssrInterpolate(unref(t)("shifts.occurrences_option"))}</label><label class="radio-label" data-v-9b9dd166><input${ssrIncludeBooleanAttr(ssrLooseEqual(shiftForm.value.end_condition, "no_end")) ? " checked" : ""} type="radio" value="no_end" data-v-9b9dd166> ${ssrInterpolate(unref(t)("shifts.no_end_option"))}</label></div></div>`);
					if (shiftForm.value.end_condition === "end_date") _push(`<div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.end_date"))}</label><input${ssrRenderAttr("value", shiftForm.value.end_date)} type="date" class="form-input" data-v-9b9dd166></div>`);
					else _push(`<!---->`);
					if (shiftForm.value.end_condition === "occurrences") _push(`<div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.occurrences"))}</label><input${ssrRenderAttr("value", shiftForm.value.occurrences)} type="number" min="1" max="365" class="form-input" data-v-9b9dd166></div>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`<div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.officers"))} *</label><div class="officer-selector" data-v-9b9dd166><!--[-->`);
				ssrRenderList(officers, (officer) => {
					_push(`<button type="button" class="${ssrRenderClass([{ "officer-chip--active": shiftForm.value.officers.includes(officer) }, "officer-chip"])}" data-v-9b9dd166>${ssrInterpolate(officer)}</button>`);
				});
				_push(`<!--]--></div></div><div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.posts"))}</label><input${ssrRenderAttr("value", postsInput.value)} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("shifts.posts_placeholder"))} data-v-9b9dd166><span class="form-hint" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.posts_hint"))}</span></div><div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.patrol_route"))}</label><button type="button" class="btn btn--secondary" data-v-9b9dd166>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:map",
					size: 16
				}, null, _parent));
				_push(` ${ssrInterpolate(selectedShift.value?.route ? unref(t)("shifts.view_route") : unref(t)("shifts.generate_route"))}</button></div><div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.notes"))}</label><textarea class="form-textarea" rows="3" maxlength="500"${ssrRenderAttr("placeholder", unref(t)("shifts.notes_placeholder"))} data-v-9b9dd166>${ssrInterpolate(shiftForm.value.notes)}</textarea></div><div class="form-group" data-v-9b9dd166><label class="form-label" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.status"))}</label>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "shiftStatus",
					value: shiftForm.value.status
				}, null, _parent));
				_push(`</div></div></div><div class="slide-over__footer" data-v-9b9dd166><div class="footer-actions" data-v-9b9dd166><button type="button" class="btn btn--secondary" data-v-9b9dd166>${ssrInterpolate(unref(t)("common.cancel"))}</button><button type="button" class="btn btn--primary" data-v-9b9dd166>${ssrInterpolate(unref(t)("common.save"))}</button></div>`);
				if (selectedShift.value) {
					_push(`<div class="footer-actions footer-actions--status" data-v-9b9dd166>`);
					if (shiftForm.value.status === "draft") _push(`<button type="button" class="btn btn--success" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.publish"))}</button>`);
					else _push(`<!---->`);
					if (shiftForm.value.status === "draft" || shiftForm.value.status === "published") _push(`<button type="button" class="btn btn--danger" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.cancel_shift"))}</button>`);
					else _push(`<!---->`);
					if (shiftForm.value.status === "active") _push(`<button type="button" class="btn btn--success" data-v-9b9dd166>${ssrInterpolate(unref(t)("shifts.complete"))}</button>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`</div></div></div>`);
			} else _push(`<!---->`);
			if (showAllocationBoard.value) _push(ssrRenderComponent(_component_AllocationBoard, {
				shifts: filteredShifts.value,
				"current-date": currentDate.value,
				"selected-community": selectedCommunity.value,
				officers,
				onClose: closeAllocationBoard,
				onAllocate: handleAllocate
			}, null, _parent));
			else _push(`<!---->`);
			if (showRoutePanel.value && selectedShift.value) _push(ssrRenderComponent(_component_PatrolRoutePanel, {
				shift: selectedShift.value,
				onClose: closeRoutePanel,
				onGenerate: unref(generateRoute),
				onSave: handleSaveRoute
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/shifts/ShiftsManagement.vue
var _sfc_setup$2 = ShiftsManagement_vue_vue_type_script_setup_true_lang_default.setup;
ShiftsManagement_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/shifts/ShiftsManagement.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var ShiftsManagement_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(ShiftsManagement_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-9b9dd166"]]), { __name: "ShiftsManagement" });
//#endregion
//#region app/components/shifts/RoutesManagement.vue?vue&type=script&setup=true&lang.ts
var RoutesManagement_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "RoutesManagement",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const selectedRouteShift = ref(null);
		const showRouteDetail = ref(false);
		const shiftsWithRoutes = computed(() => {
			return shifts.value.filter((shift) => shift.route && shift.route.length > 0);
		});
		const shiftsWithoutRoutes = computed(() => {
			return shifts.value.filter((shift) => !shift.route || shift.route.length === 0);
		});
		function closeRouteDetail() {
			showRouteDetail.value = false;
			selectedRouteShift.value = null;
		}
		function handleGenerateRoute(shiftId) {
			generateRoute(shiftId);
			const shift = shifts.value.find((s) => s.id === shiftId);
			if (shift) selectedRouteShift.value = shift;
		}
		function handleSaveRoute(shiftId, route) {
			saveRoute(shiftId, route);
			closeRouteDetail();
		}
		function priorityClass(priority) {
			return `badge--priority-${priority}`;
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Badge = Badge_default;
			const _component_Icon = components_default;
			const _component_PatrolRoutePanel = PatrolRoutePanel_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "routes-management" }, _attrs))} data-v-9f0a7b20><div class="routes-header" data-v-9f0a7b20><h2 data-v-9f0a7b20>${ssrInterpolate(unref(t)("shifts.routes_title"))}</h2><span class="routes-count" data-v-9f0a7b20>${ssrInterpolate(shiftsWithRoutes.value.length)} ${ssrInterpolate(unref(t)("shifts.routes_count"))}</span></div><div class="routes-grid" data-v-9f0a7b20><!--[-->`);
			ssrRenderList(shiftsWithRoutes.value, (shift) => {
				_push(`<div class="route-card" data-v-9f0a7b20><div class="route-card-header" data-v-9f0a7b20><div data-v-9f0a7b20><div class="route-shift-id" data-v-9f0a7b20>${ssrInterpolate(shift.id)}</div><div class="route-shift-meta" data-v-9f0a7b20>${ssrInterpolate(shift.date)} · ${ssrInterpolate(shift.start_time)} - ${ssrInterpolate(shift.end_time)}</div></div>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "shiftStatus",
					value: shift.status
				}, null, _parent));
				_push(`</div><div class="route-location" data-v-9f0a7b20>${ssrInterpolate(shift.community)} — ${ssrInterpolate(shift.site)}</div><div class="route-officers" data-v-9f0a7b20>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:users",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(shift.officers.length > 0 ? shift.officers.join(", ") : unref(t)("shifts.no_officers"))}</div><div class="waypoints-list" data-v-9f0a7b20><!--[-->`);
				ssrRenderList(shift.route?.slice(0, 2), (waypoint) => {
					_push(`<div class="waypoint-item" data-v-9f0a7b20><div class="waypoint-number" data-v-9f0a7b20>${ssrInterpolate(waypoint.number)}</div><div class="waypoint-info" data-v-9f0a7b20><div class="waypoint-name" data-v-9f0a7b20>${ssrInterpolate(waypoint.location_name)}</div><div class="waypoint-meta" data-v-9f0a7b20><span data-v-9f0a7b20>${ssrInterpolate(unref(t)("shifts.eta"))} ${ssrInterpolate(waypoint.eta_minutes)}m</span><span data-v-9f0a7b20>${ssrInterpolate(unref(t)("shifts.dwell"))} ${ssrInterpolate(waypoint.dwell_minutes)}m</span><span class="${ssrRenderClass(["badge", priorityClass(waypoint.priority)])}" data-v-9f0a7b20>${ssrInterpolate(waypoint.priority)}</span></div></div></div>`);
				});
				_push(`<!--]-->`);
				if ((shift.route?.length || 0) > 2) _push(`<div class="waypoints-more" data-v-9f0a7b20> +${ssrInterpolate((shift.route?.length || 0) - 2)} ${ssrInterpolate(unref(t)("shifts.waypoints"))}</div>`);
				else _push(`<!---->`);
				_push(`</div><div class="route-card-actions" data-v-9f0a7b20><button class="btn btn--secondary" data-v-9f0a7b20>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:sparkles",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("shifts.regenerate_route"))}</button><button class="btn btn--danger" data-v-9f0a7b20>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:trash-2",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("shifts.remove_route"))}</button></div></div>`);
			});
			_push(`<!--]--><!--[-->`);
			ssrRenderList(shiftsWithoutRoutes.value, (shift) => {
				_push(`<div class="route-card route-card--empty" data-v-9f0a7b20><div class="route-card-header" data-v-9f0a7b20><div data-v-9f0a7b20><div class="route-shift-id" data-v-9f0a7b20>${ssrInterpolate(shift.id)}</div><div class="route-shift-meta" data-v-9f0a7b20>${ssrInterpolate(shift.date)} · ${ssrInterpolate(shift.start_time)} - ${ssrInterpolate(shift.end_time)}</div></div>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "shiftStatus",
					value: shift.status
				}, null, _parent));
				_push(`</div><div class="route-location" data-v-9f0a7b20>${ssrInterpolate(shift.community)} — ${ssrInterpolate(shift.site)}</div><div class="route-empty-message" data-v-9f0a7b20>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:map-pin",
					size: 24
				}, null, _parent));
				_push(`<p data-v-9f0a7b20>${ssrInterpolate(unref(t)("shifts.route_empty"))}</p></div><button class="btn btn--primary" data-v-9f0a7b20>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:sparkles",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("shifts.generate_route"))}</button></div>`);
			});
			_push(`<!--]--></div>`);
			if (shiftsWithRoutes.value.length === 0 && shiftsWithoutRoutes.value.length === 0) {
				_push(`<div class="routes-placeholder" data-v-9f0a7b20>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:route",
					size: 48
				}, null, _parent));
				_push(`<h3 data-v-9f0a7b20>${ssrInterpolate(unref(t)("shifts.routes_title"))}</h3><p data-v-9f0a7b20>${ssrInterpolate(unref(t)("shifts.routes_placeholder"))}</p></div>`);
			} else _push(`<!---->`);
			if (showRouteDetail.value && selectedRouteShift.value) _push(ssrRenderComponent(_component_PatrolRoutePanel, {
				shift: selectedRouteShift.value,
				onClose: closeRouteDetail,
				onGenerate: handleGenerateRoute,
				onSave: handleSaveRoute
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/shifts/RoutesManagement.vue
var _sfc_setup$1 = RoutesManagement_vue_vue_type_script_setup_true_lang_default.setup;
RoutesManagement_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/shifts/RoutesManagement.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var RoutesManagement_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(RoutesManagement_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-9f0a7b20"]]), { __name: "RoutesManagement" });
//#endregion
//#region app/pages/shifts.vue?vue&type=script&setup=true&lang.ts
var shifts_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "shifts",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const tabs = [{
			id: "shifts",
			label: t("shifts.tabs.shift_management"),
			icon: "lucide:calendar"
		}, {
			id: "routes",
			label: t("shifts.tabs.routes"),
			icon: "lucide:route"
		}];
		const activeTab = ref("shifts");
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_Icon = components_default;
			const _component_ShiftsManagement = ShiftsManagement_default;
			const _component_RoutesManagement = RoutesManagement_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: unref(t)("nav.shifts_routes"),
				breadcrumb: [{ label: "Manage" }, { label: unref(t)("nav.shifts_routes") }]
			}, null, _parent));
			_push(`<div class="shifts-page" data-v-7bfc0719><div class="shifts-tabs" data-v-7bfc0719><!--[-->`);
			ssrRenderList(tabs, (tab) => {
				_push(`<button class="${ssrRenderClass([{ "tab-btn--active": activeTab.value === tab.id }, "tab-btn"])}" data-v-7bfc0719>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: tab.icon,
					size: 16
				}, null, _parent));
				_push(`<span data-v-7bfc0719>${ssrInterpolate(tab.label)}</span></button>`);
			});
			_push(`<!--]--></div><div class="shifts-content" data-v-7bfc0719>`);
			if (activeTab.value === "shifts") {
				_push(`<div class="content-card" data-v-7bfc0719>`);
				_push(ssrRenderComponent(_component_ShiftsManagement, null, null, _parent));
				_push(`</div>`);
			} else if (activeTab.value === "routes") {
				_push(`<div class="content-card" data-v-7bfc0719>`);
				_push(ssrRenderComponent(_component_RoutesManagement, null, null, _parent));
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div></div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/shifts.vue
var _sfc_setup = shifts_vue_vue_type_script_setup_true_lang_default.setup;
shifts_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/shifts.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var shifts_default = /*#__PURE__*/ _plugin_vue_export_helper_default(shifts_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-7bfc0719"]]);

export { shifts_default as default };
//# sourceMappingURL=shifts-BtmQR8jG.mjs.map
