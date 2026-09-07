import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, b as useRouter } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { defineComponent, mergeProps, ref, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderTeleport } from 'vue/server-renderer';
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

//#region app/components/reports/ReportTemplateList.vue?vue&type=script&setup=true&lang.ts
var ReportTemplateList_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ReportTemplateList",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		useRouter();
		const searchQuery = ref("");
		const filterStatus = ref("all");
		const filterCategory = ref("all");
		const showArchiveModal = ref(false);
		ref(null);
		const isArchiving = ref(false);
		const templates = ref([...[
			{
				id: "TPL-001",
				name: "Standard Incident Report",
				community: "Global",
				category: "incident",
				sectionsCount: 6,
				status: "active",
				lastModified: "2026-06-20T09:14:00Z"
			},
			{
				id: "TPL-002",
				name: "Daily Activity Log",
				community: "Sunset Heights",
				category: "daily_activity",
				sectionsCount: 4,
				status: "active",
				lastModified: "2026-06-18T14:30:00Z"
			},
			{
				id: "TPL-003",
				name: "Trespass Incident",
				community: "Central Hub",
				category: "incident",
				sectionsCount: 5,
				status: "draft",
				lastModified: "2026-06-25T11:00:00Z"
			},
			{
				id: "TPL-004",
				name: "Site Observation Report",
				community: "Green Valley",
				category: "daily_activity",
				sectionsCount: 3,
				status: "archived",
				lastModified: "2026-05-10T08:00:00Z"
			},
			{
				id: "TPL-005",
				name: "Vehicle Incident Report",
				community: "Global",
				category: "incident",
				sectionsCount: 7,
				status: "active",
				lastModified: "2026-06-22T16:45:00Z"
			}
		]]);
		const filteredTemplates = computed(() => {
			return templates.value.filter((tpl) => {
				const q = searchQuery.value.toLowerCase();
				if (q && !`${tpl.name} ${tpl.community} ${tpl.id}`.toLowerCase().includes(q)) return false;
				if (filterStatus.value !== "all" && tpl.status !== filterStatus.value) return false;
				if (filterCategory.value !== "all" && tpl.category !== filterCategory.value) return false;
				return true;
			});
		});
		function formatDate(iso) {
			return new Date(iso).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric"
			});
		}
		const statusOptions = [
			{
				value: "all",
				label: "All Statuses"
			},
			{
				value: "active",
				label: "Active"
			},
			{
				value: "draft",
				label: "Draft"
			},
			{
				value: "archived",
				label: "Archived"
			}
		];
		const categoryOptions = [
			{
				value: "all",
				label: "All Categories"
			},
			{
				value: "incident",
				label: "Incident"
			},
			{
				value: "daily_activity",
				label: "Daily Activity"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_Badge = Badge_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "tpl-list" }, _attrs))} data-v-3672501c><div class="tpl-list__header" data-v-3672501c><div class="tpl-list__title-area" data-v-3672501c><h1 class="tpl-list__title" data-v-3672501c>${ssrInterpolate(unref(t)("reports.title"))}</h1><p class="tpl-list__subtitle" data-v-3672501c>${ssrInterpolate(unref(t)("reports.subtitle"))}</p></div><button class="btn-primary" data-v-3672501c>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:plus",
				size: 15
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("reports.add_new"))}</button></div><div class="tpl-list__filters" data-v-3672501c><div class="search-box" data-v-3672501c>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 14,
				class: "search-box__icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", searchQuery.value)} type="text" class="search-box__input"${ssrRenderAttr("placeholder", unref(t)("reports.search_placeholder"))} data-v-3672501c></div><select class="filter-select" data-v-3672501c><!--[-->`);
			ssrRenderList(statusOptions, (opt) => {
				_push(`<option${ssrRenderAttr("value", opt.value)} data-v-3672501c${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, opt.value) : ssrLooseEqual(filterStatus.value, opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
			});
			_push(`<!--]--></select><select class="filter-select" data-v-3672501c><!--[-->`);
			ssrRenderList(categoryOptions, (opt) => {
				_push(`<option${ssrRenderAttr("value", opt.value)} data-v-3672501c${ssrIncludeBooleanAttr(Array.isArray(filterCategory.value) ? ssrLooseContain(filterCategory.value, opt.value) : ssrLooseEqual(filterCategory.value, opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
			});
			_push(`<!--]--></select><span class="total-count" data-v-3672501c>${ssrInterpolate(filteredTemplates.value.length)} ${ssrInterpolate(unref(t)("reports.count"))}</span></div><div class="tpl-list__table-wrap" data-v-3672501c><table class="tpl-table" data-v-3672501c><thead data-v-3672501c><tr data-v-3672501c><th class="col-name" data-v-3672501c>${ssrInterpolate(unref(t)("reports.col_name"))}</th><th class="col-community" data-v-3672501c>${ssrInterpolate(unref(t)("reports.col_community"))}</th><th class="col-category" data-v-3672501c>${ssrInterpolate(unref(t)("reports.col_category"))}</th><th class="col-sections" data-v-3672501c>${ssrInterpolate(unref(t)("reports.col_sections"))}</th><th class="col-status" data-v-3672501c>${ssrInterpolate(unref(t)("reports.col_status"))}</th><th class="col-modified" data-v-3672501c>${ssrInterpolate(unref(t)("reports.col_modified"))}</th><th class="col-actions" data-v-3672501c>${ssrInterpolate(unref(t)("common.actions"))}</th></tr></thead><tbody data-v-3672501c>`);
			if (filteredTemplates.value.length === 0) {
				_push(`<tr data-v-3672501c><td colspan="7" class="empty-row" data-v-3672501c><div class="empty-state" data-v-3672501c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:file-x",
					size: 32,
					class: "empty-state__icon"
				}, null, _parent));
				_push(`<p data-v-3672501c>${ssrInterpolate(unref(t)("reports.empty"))}</p></div></td></tr>`);
			} else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(filteredTemplates.value, (tpl) => {
				_push(`<tr class="${ssrRenderClass([{ "tpl-row--archived": tpl.status === "archived" }, "tpl-row"])}" data-v-3672501c><td class="col-name" data-v-3672501c><div class="tpl-name" data-v-3672501c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:file-text",
					size: 15,
					class: "tpl-name__icon"
				}, null, _parent));
				_push(`<span class="tpl-name__text" data-v-3672501c>${ssrInterpolate(tpl.name)}</span></div><span class="tpl-id" data-v-3672501c>${ssrInterpolate(tpl.id)}</span></td><td class="col-community" data-v-3672501c>`);
				if (tpl.community === "Global") {
					_push(`<span class="community-global" data-v-3672501c>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:globe",
						size: 12
					}, null, _parent));
					_push(` Global </span>`);
				} else _push(`<span class="community-name" data-v-3672501c>${ssrInterpolate(tpl.community)}</span>`);
				_push(`</td><td class="col-category" data-v-3672501c>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "templateCategory",
					value: tpl.category
				}, null, _parent));
				_push(`</td><td class="col-sections" data-v-3672501c><span class="sections-count" data-v-3672501c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:layers",
					size: 12
				}, null, _parent));
				_push(` ${ssrInterpolate(tpl.sectionsCount)}</span></td><td class="col-status" data-v-3672501c>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "templateStatus",
					value: tpl.status
				}, null, _parent));
				_push(`</td><td class="col-modified" data-v-3672501c><span class="modified-date" data-v-3672501c>${ssrInterpolate(formatDate(tpl.lastModified))}</span></td><td class="col-actions" data-v-3672501c><div class="action-group" data-v-3672501c><button class="action-btn"${ssrRenderAttr("title", unref(t)("common.edit"))} data-v-3672501c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:pencil",
					size: 14
				}, null, _parent));
				_push(`</button><button class="action-btn"${ssrRenderAttr("title", unref(t)("reports.action_duplicate"))} data-v-3672501c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:copy",
					size: 14
				}, null, _parent));
				_push(`</button><button class="action-btn"${ssrRenderAttr("title", unref(t)("reports.action_format"))} data-v-3672501c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:sliders",
					size: 14
				}, null, _parent));
				_push(`</button>`);
				if (tpl.status !== "archived") {
					_push(`<button class="action-btn action-btn--danger"${ssrRenderAttr("title", unref(t)("reports.action_archive"))} data-v-3672501c>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:archive",
						size: 14
					}, null, _parent));
					_push(`</button>`);
				} else {
					_push(`<button class="action-btn action-btn--ok"${ssrRenderAttr("title", unref(t)("reports.action_restore"))} data-v-3672501c>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:archive-restore",
						size: 14
					}, null, _parent));
					_push(`</button>`);
				}
				_push(`</div></td></tr>`);
			});
			_push(`<!--]--></tbody></table></div>`);
			ssrRenderTeleport(_push, (_push) => {
				if (showArchiveModal.value) {
					_push(`<div class="modal-overlay" data-v-3672501c><div class="modal" data-v-3672501c><div class="modal__header" data-v-3672501c>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:archive",
						size: 18,
						class: "modal__icon--warn"
					}, null, _parent));
					_push(`<h3 class="modal__title" data-v-3672501c>${ssrInterpolate(unref(t)("reports.modal_archive_title"))}</h3></div><div class="modal__body" data-v-3672501c><p class="modal__desc" data-v-3672501c>${ssrInterpolate(unref(t)("reports.modal_archive_desc"))}</p></div><div class="modal__footer" data-v-3672501c><button class="btn-cancel" data-v-3672501c>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn-warn"${ssrIncludeBooleanAttr(isArchiving.value) ? " disabled" : ""} data-v-3672501c>`);
					if (isArchiving.value) _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:loader-2",
						size: 14,
						class: "spin"
					}, null, _parent));
					else _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:archive",
						size: 14
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("reports.modal_archive_confirm"))}</button></div></div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/reports/ReportTemplateList.vue
var _sfc_setup$1 = ReportTemplateList_vue_vue_type_script_setup_true_lang_default.setup;
ReportTemplateList_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/reports/ReportTemplateList.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var ReportTemplateList_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(ReportTemplateList_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3672501c"]]), { __name: "ReportTemplateList" });
//#endregion
//#region app/pages/reports/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_ReportTemplateList = ReportTemplateList_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "reports-page" }, _attrs))} data-v-815351eb>`);
			_push(ssrRenderComponent(_component_ReportTemplateList, null, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/reports/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reports/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var reports_default = /*#__PURE__*/ _plugin_vue_export_helper_default(index_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-815351eb"]]);

export { reports_default as default };
//# sourceMappingURL=reports-BRjD2DjA.mjs.map
