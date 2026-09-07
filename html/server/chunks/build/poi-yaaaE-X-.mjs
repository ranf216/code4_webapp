import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, b as useRouter } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { defineComponent, mergeProps, ref, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass, ssrRenderTeleport } from 'vue/server-renderer';
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

//#region app/components/poi/POIList.vue?vue&type=script&setup=true&lang.ts
var POIList_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "POIList",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		useRouter();
		const loading = ref(false);
		const inactiveTargetId = ref(null);
		const inactiveReason = ref("");
		const inactiveReasonError = ref("");
		const isInactivating = ref(false);
		const searchQuery = ref("");
		const filterType = ref("all");
		const filterStatus = ref("all");
		const filterThreat = ref("all");
		const records = ref([
			{
				id: "POI-001",
				type: "poi",
				firstName: "John",
				lastName: "Doe",
				threatLevel: "high",
				status: "active",
				sites: ["Central Hub", "North Gate"],
				photoUrl: "https://picsum.photos/seed/poi001/60/60",
				lastUpdated: "2026-06-20T10:30:00Z"
			},
			{
				id: "TI-002",
				type: "trespass",
				firstName: "Jane",
				lastName: "Smith",
				threatLevel: "medium",
				status: "active",
				sites: ["South Plaza"],
				photoUrl: "https://picsum.photos/seed/ti002/60/60",
				expiryDate: "2026-07-15T00:00:00Z",
				lastUpdated: "2026-06-18T08:15:00Z"
			},
			{
				id: "MRC-003",
				type: "metro_red_card",
				firstName: "Michael",
				lastName: "Brown",
				threatLevel: "critical",
				status: "active",
				sites: ["Metro Station A", "Metro Station B"],
				photoUrl: "https://picsum.photos/seed/mrc003/60/60",
				expiryDate: "2026-06-30T00:00:00Z",
				lastUpdated: "2026-06-10T14:00:00Z"
			},
			{
				id: "POI-004",
				type: "poi",
				firstName: "Sarah",
				lastName: "Connor",
				threatLevel: "low",
				status: "draft",
				sites: ["West Wing"],
				lastUpdated: "2026-06-25T09:00:00Z"
			},
			{
				id: "TI-005",
				type: "trespass",
				firstName: "Robert",
				lastName: "Chen",
				threatLevel: "high",
				status: "expired",
				sites: ["East Block"],
				expiryDate: "2026-06-01T00:00:00Z",
				lastUpdated: "2026-05-28T11:00:00Z"
			}
		]);
		const filteredRecords = computed(() => {
			return records.value.filter((r) => {
				const q = searchQuery.value.toLowerCase();
				if (q && !`${r.firstName} ${r.lastName} ${r.id}`.toLowerCase().includes(q)) return false;
				if (filterType.value !== "all" && r.type !== filterType.value) return false;
				if (filterStatus.value !== "all" && r.status !== filterStatus.value) return false;
				if (filterThreat.value !== "all" && r.threatLevel !== filterThreat.value) return false;
				return true;
			});
		});
		function formatDate(iso) {
			if (!iso) return "—";
			return new Date(iso).toLocaleDateString("en-AU", {
				day: "2-digit",
				month: "short",
				year: "numeric"
			});
		}
		function isExpiringSoon(iso) {
			if (!iso) return false;
			const diff = new Date(iso).getTime() - Date.now();
			return diff > 0 && diff < 12096e5;
		}
		function isExpired(iso) {
			if (!iso) return false;
			return new Date(iso).getTime() < Date.now();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_Badge = Badge_default;
			_push(`<!--[--><div class="poi-list" data-v-52a71990><div class="poi-list__header" data-v-52a71990><div class="poi-list__title-area" data-v-52a71990><h1 class="poi-list__title" data-v-52a71990>${ssrInterpolate(unref(t)("poi.title"))}</h1><p class="poi-list__subtitle" data-v-52a71990>${ssrInterpolate(unref(t)("poi.subtitle"))}</p></div><button class="btn-primary" data-v-52a71990>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:plus",
				size: 16
			}, null, _parent));
			_push(`<span data-v-52a71990>${ssrInterpolate(unref(t)("poi.create"))}</span></button></div><div class="poi-list__filters" data-v-52a71990><div class="search-wrapper" data-v-52a71990>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 15,
				class: "search-icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", searchQuery.value)} type="text" class="search-input"${ssrRenderAttr("placeholder", unref(t)("poi.search_placeholder"))} data-v-52a71990></div><select class="filter-select" data-v-52a71990><option value="all" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterType.value) ? ssrLooseContain(filterType.value, "all") : ssrLooseEqual(filterType.value, "all")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.filter_all_types"))}</option><option value="poi" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterType.value) ? ssrLooseContain(filterType.value, "poi") : ssrLooseEqual(filterType.value, "poi")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.type_poi"))}</option><option value="trespass" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterType.value) ? ssrLooseContain(filterType.value, "trespass") : ssrLooseEqual(filterType.value, "trespass")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.type_trespass"))}</option><option value="metro_red_card" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterType.value) ? ssrLooseContain(filterType.value, "metro_red_card") : ssrLooseEqual(filterType.value, "metro_red_card")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.type_metro"))}</option></select><select class="filter-select" data-v-52a71990><option value="all" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterThreat.value) ? ssrLooseContain(filterThreat.value, "all") : ssrLooseEqual(filterThreat.value, "all")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.filter_all_threats"))}</option><option value="low" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterThreat.value) ? ssrLooseContain(filterThreat.value, "low") : ssrLooseEqual(filterThreat.value, "low")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.threat_low"))}</option><option value="medium" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterThreat.value) ? ssrLooseContain(filterThreat.value, "medium") : ssrLooseEqual(filterThreat.value, "medium")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.threat_medium"))}</option><option value="high" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterThreat.value) ? ssrLooseContain(filterThreat.value, "high") : ssrLooseEqual(filterThreat.value, "high")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.threat_high"))}</option><option value="critical" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterThreat.value) ? ssrLooseContain(filterThreat.value, "critical") : ssrLooseEqual(filterThreat.value, "critical")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.threat_critical"))}</option></select><select class="filter-select" data-v-52a71990><option value="all" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "all") : ssrLooseEqual(filterStatus.value, "all")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.filter_all_statuses"))}</option><option value="draft" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "draft") : ssrLooseEqual(filterStatus.value, "draft")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.status_draft"))}</option><option value="active" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "active") : ssrLooseEqual(filterStatus.value, "active")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.status_active"))}</option><option value="expired" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "expired") : ssrLooseEqual(filterStatus.value, "expired")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.status_expired"))}</option><option value="inactive" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "inactive") : ssrLooseEqual(filterStatus.value, "inactive")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.status_inactive"))}</option><option value="archived" data-v-52a71990${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "archived") : ssrLooseEqual(filterStatus.value, "archived")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.status_archived"))}</option></select></div><div class="poi-list__table-container" data-v-52a71990>`);
			if (loading.value) {
				_push(`<div class="poi-list__loading" data-v-52a71990>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 24,
					class: "spin"
				}, null, _parent));
				_push(`<span data-v-52a71990>Loading...</span></div>`);
			} else {
				_push(`<table class="poi-table" data-v-52a71990><thead data-v-52a71990><tr data-v-52a71990><th class="col-photo" data-v-52a71990></th><th class="col-id" data-v-52a71990>${ssrInterpolate(unref(t)("poi.col_id"))}</th><th class="col-name" data-v-52a71990>${ssrInterpolate(unref(t)("poi.col_name"))}</th><th class="col-type" data-v-52a71990>${ssrInterpolate(unref(t)("poi.col_type"))}</th><th class="col-threat" data-v-52a71990>${ssrInterpolate(unref(t)("poi.col_threat"))}</th><th class="col-sites" data-v-52a71990>${ssrInterpolate(unref(t)("poi.col_sites"))}</th><th class="col-status" data-v-52a71990>${ssrInterpolate(unref(t)("poi.col_status"))}</th><th class="col-expiry" data-v-52a71990>${ssrInterpolate(unref(t)("poi.col_expiry"))}</th><th class="col-updated" data-v-52a71990>${ssrInterpolate(unref(t)("poi.col_updated"))}</th><th class="col-actions" data-v-52a71990>${ssrInterpolate(unref(t)("poi.col_actions"))}</th></tr></thead><tbody data-v-52a71990>`);
				if (filteredRecords.value.length === 0) {
					_push(`<tr data-v-52a71990><td colspan="10" class="empty-row" data-v-52a71990><div class="empty-state" data-v-52a71990>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:shield-off",
						size: 32,
						class: "empty-state__icon"
					}, null, _parent));
					_push(`<p data-v-52a71990>${ssrInterpolate(unref(t)("poi.empty"))}</p></div></td></tr>`);
				} else _push(`<!---->`);
				_push(`<!--[-->`);
				ssrRenderList(filteredRecords.value, (record) => {
					_push(`<tr class="poi-row" data-v-52a71990><td class="col-photo" data-v-52a71990>`);
					if (record.photoUrl) _push(`<div class="photo-thumb" data-v-52a71990><img${ssrRenderAttr("src", record.photoUrl)}${ssrRenderAttr("alt", record.firstName)} data-v-52a71990></div>`);
					else {
						_push(`<div class="photo-placeholder" data-v-52a71990>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:image",
							size: 25
						}, null, _parent));
						_push(`</div>`);
					}
					_push(`</td><td class="col-id" data-v-52a71990><span class="record-id" data-v-52a71990>${ssrInterpolate(record.id)}</span></td><td class="col-name" data-v-52a71990><span class="record-name" data-v-52a71990>${ssrInterpolate(record.firstName)} ${ssrInterpolate(record.lastName)}</span></td><td class="col-type" data-v-52a71990>`);
					_push(ssrRenderComponent(_component_Badge, {
						type: "poiType",
						value: record.type
					}, null, _parent));
					_push(`</td><td class="col-threat" data-v-52a71990>`);
					_push(ssrRenderComponent(_component_Badge, {
						type: "poiThreat",
						value: record.threatLevel
					}, null, _parent));
					_push(`</td><td class="col-sites" data-v-52a71990><span class="sites-list" data-v-52a71990>${ssrInterpolate(record.sites.join(", "))}</span></td><td class="col-status" data-v-52a71990>`);
					_push(ssrRenderComponent(_component_Badge, {
						type: "poiStatus",
						value: record.status
					}, null, _parent));
					_push(`</td><td class="col-expiry" data-v-52a71990>`);
					if (record.expiryDate) _push(`<span class="${ssrRenderClass([{
						"expiry-date--warning": isExpiringSoon(record.expiryDate),
						"expiry-date--expired": isExpired(record.expiryDate)
					}, "expiry-date"])}" data-v-52a71990>${ssrInterpolate(formatDate(record.expiryDate))}</span>`);
					else _push(`<span class="expiry-na" data-v-52a71990>—</span>`);
					_push(`</td><td class="col-updated" data-v-52a71990><span class="updated-date" data-v-52a71990>${ssrInterpolate(formatDate(record.lastUpdated))}</span></td><td class="col-actions" data-v-52a71990><div class="action-group" data-v-52a71990><button class="action-btn action-btn--icon"${ssrRenderAttr("title", unref(t)("common.view"))} data-v-52a71990>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:eye",
						size: 14
					}, null, _parent));
					_push(`</button><button class="action-btn action-btn--icon"${ssrRenderAttr("title", unref(t)("common.edit"))} data-v-52a71990>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:pencil",
						size: 14
					}, null, _parent));
					_push(`</button>`);
					if (record.status === "active") {
						_push(`<button class="action-btn action-btn--icon action-btn--danger"${ssrRenderAttr("title", unref(t)("poi.action_inactive"))} data-v-52a71990>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:ban",
							size: 14
						}, null, _parent));
						_push(`</button>`);
					} else _push(`<!---->`);
					_push(`</div></td></tr>`);
				});
				_push(`<!--]--></tbody></table>`);
			}
			_push(`</div></div>`);
			ssrRenderTeleport(_push, (_push) => {
				if (inactiveTargetId.value) {
					_push(`<div class="modal-overlay" data-v-52a71990><div class="modal" data-v-52a71990><div class="modal__header" data-v-52a71990>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:ban",
						size: 18,
						class: "modal__icon--danger"
					}, null, _parent));
					_push(`<h3 class="modal__title" data-v-52a71990>${ssrInterpolate(unref(t)("poi.modal_inactive_title"))}</h3></div><div class="modal__body" data-v-52a71990><p class="modal__desc" data-v-52a71990>${ssrInterpolate(unref(t)("poi.modal_inactive_desc"))}</p><div class="${ssrRenderClass([{ "form-field--error": inactiveReasonError.value }, "form-field"])}" data-v-52a71990><label class="form-field__label" data-v-52a71990>${ssrInterpolate(unref(t)("poi.modal_inactive_reason"))} <span class="req" data-v-52a71990>*</span></label><textarea class="form-field__textarea" rows="3"${ssrRenderAttr("placeholder", unref(t)("poi.modal_inactive_reason_placeholder"))} data-v-52a71990>${ssrInterpolate(inactiveReason.value)}</textarea>`);
					if (inactiveReasonError.value) _push(`<span class="field-error" data-v-52a71990>${ssrInterpolate(inactiveReasonError.value)}</span>`);
					else _push(`<!---->`);
					_push(`</div></div><div class="modal__footer" data-v-52a71990><button class="btn-cancel" data-v-52a71990>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn-danger-solid"${ssrIncludeBooleanAttr(isInactivating.value) ? " disabled" : ""} data-v-52a71990>`);
					if (isInactivating.value) _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:loader-2",
						size: 14,
						class: "spin"
					}, null, _parent));
					else _push(`<!---->`);
					_push(` ${ssrInterpolate(unref(t)("poi.modal_inactive_confirm"))}</button></div></div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region app/components/poi/POIList.vue
var _sfc_setup$1 = POIList_vue_vue_type_script_setup_true_lang_default.setup;
POIList_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/poi/POIList.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var POIList_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(POIList_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-52a71990"]]), { __name: "POIList" });
//#endregion
//#region app/pages/poi/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_POIList = POIList_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "poi-page" }, _attrs))} data-v-fcd9cf4e>`);
			_push(ssrRenderComponent(_component_POIList, null, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/poi/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/poi/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var poi_default = /*#__PURE__*/ _plugin_vue_export_helper_default(index_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-fcd9cf4e"]]);

export { poi_default as default };
//# sourceMappingURL=poi-yaaaE-X-.mjs.map
