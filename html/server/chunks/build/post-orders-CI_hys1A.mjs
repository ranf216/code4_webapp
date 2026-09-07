import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, N as NuxtLink } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { defineComponent, unref, ref, computed, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
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

//#region app/components/post-orders/PostOrdersList.vue?vue&type=script&setup=true&lang.ts
var PostOrdersList_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PostOrdersList",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const postOrders = ref([
			{
				id: "PO-001",
				community: "Sunset Gardens",
				site: "Gate A",
				post_name: "Main Entrance Post",
				status: "published",
				current_version: "2.1",
				last_published_date: "2026-06-10",
				last_published_by: "Alice Manager",
				review_due_date: "2026-09-10",
				acknowledged_pct: 87
			},
			{
				id: "PO-002",
				community: "Sunset Gardens",
				site: "Perimeter",
				post_name: "North Perimeter Patrol",
				status: "draft",
				current_version: "1.0",
				last_published_date: null,
				last_published_by: null,
				review_due_date: null,
				acknowledged_pct: null
			},
			{
				id: "PO-003",
				community: "Downtown Plaza",
				site: "Parking",
				post_name: "Parking Level 1 Patrol",
				status: "published",
				current_version: "1.3",
				last_published_date: "2026-05-20",
				last_published_by: "Bob Supervisor",
				review_due_date: "2026-06-20",
				acknowledged_pct: 100
			},
			{
				id: "PO-004",
				community: "Oakwood Residences",
				site: "Lobby",
				post_name: "Front Desk Procedure",
				status: "archived",
				current_version: "3.0",
				last_published_date: "2026-01-15",
				last_published_by: "Alice Manager",
				review_due_date: null,
				acknowledged_pct: 72
			},
			{
				id: "PO-005",
				community: "Marina Towers",
				site: "Main Entrance",
				post_name: "Marina Entry Control",
				status: "published",
				current_version: "1.0",
				last_published_date: "2026-06-01",
				last_published_by: "Carol Admin",
				review_due_date: "2026-07-01",
				acknowledged_pct: 60
			},
			{
				id: "PO-006",
				community: "Oakwood Residences",
				site: "Perimeter",
				post_name: "Perimeter Night Patrol",
				status: "draft",
				current_version: "1.0",
				last_published_date: null,
				last_published_by: null,
				review_due_date: "2026-07-15",
				acknowledged_pct: null
			}
		]);
		const searchQuery = ref("");
		const filterCommunity = ref([]);
		const filterStatus = ref("");
		const filterReviewDue = ref("");
		const sortKey = ref("community");
		const sortOrder = ref("asc");
		const communities = [
			"Sunset Gardens",
			"Oakwood Residences",
			"Marina Towers",
			"Downtown Plaza"
		];
		const statusOptions = [
			{
				value: "",
				label: t("post_orders.filter_all_statuses")
			},
			{
				value: "draft",
				label: t("post_orders.status_draft")
			},
			{
				value: "published",
				label: t("post_orders.status_published")
			},
			{
				value: "archived",
				label: t("post_orders.status_archived")
			}
		];
		const reviewDueOptions = [
			{
				value: "",
				label: t("post_orders.filter_any_due")
			},
			{
				value: "overdue",
				label: t("post_orders.filter_overdue")
			},
			{
				value: "this_week",
				label: t("post_orders.filter_this_week")
			},
			{
				value: "this_month",
				label: t("post_orders.filter_this_month")
			}
		];
		const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const filteredPostOrders = computed(() => {
			let result = postOrders.value;
			if (filterCommunity.value.length > 0) result = result.filter((po) => filterCommunity.value.includes(po.community));
			if (filterStatus.value) result = result.filter((po) => po.status === filterStatus.value);
			if (filterReviewDue.value === "overdue") result = result.filter((po) => po.review_due_date && po.review_due_date < today);
			else if (filterReviewDue.value === "this_week") {
				const weekEnd = /* @__PURE__ */ new Date();
				weekEnd.setDate(weekEnd.getDate() + 7);
				result = result.filter((po) => po.review_due_date && po.review_due_date <= weekEnd.toISOString().slice(0, 10));
			} else if (filterReviewDue.value === "this_month") {
				const monthEnd = /* @__PURE__ */ new Date();
				monthEnd.setDate(monthEnd.getDate() + 30);
				result = result.filter((po) => po.review_due_date && po.review_due_date <= monthEnd.toISOString().slice(0, 10));
			}
			if (searchQuery.value.trim()) {
				const q = searchQuery.value.toLowerCase();
				result = result.filter((po) => po.id.toLowerCase().includes(q) || po.post_name.toLowerCase().includes(q) || po.community.toLowerCase().includes(q));
			}
			return [...result].sort((a, b) => {
				const aVal = a[sortKey.value] ?? "";
				const bVal = b[sortKey.value] ?? "";
				if (aVal < bVal) return sortOrder.value === "asc" ? -1 : 1;
				if (aVal > bVal) return sortOrder.value === "asc" ? 1 : -1;
				return 0;
			});
		});
		function isOverdue(date) {
			return !!date && date < today;
		}
		function formatDate(date) {
			if (!date) return "—";
			return new Date(date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric"
			});
		}
		const showCommunityDropdown = ref(false);
		const showDeleteModal = ref(false);
		const orderToDelete = ref(null);
		function handleDeleteConfirm() {
			if (orderToDelete.value) {
				const idx = postOrders.value.findIndex((po) => po.id === orderToDelete.value?.id);
				if (idx > -1) postOrders.value.splice(idx, 1);
			}
			showDeleteModal.value = false;
			orderToDelete.value = null;
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_NuxtLink = NuxtLink;
			const _component_Badge = Badge_default;
			const _component_AppModal = AppModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "po-list" }, _attrs))} data-v-ee9dc7b9><div class="po-list__header" data-v-ee9dc7b9><div data-v-ee9dc7b9><h2 class="po-list__title" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.list_title"))}</h2><p class="po-list__subtitle" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.list_subtitle", { count: String(filteredPostOrders.value.length) }))}</p></div><div class="po-list__actions" data-v-ee9dc7b9><div class="search-box" data-v-ee9dc7b9>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16,
				class: "search-box__icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", searchQuery.value)} type="text"${ssrRenderAttr("placeholder", unref(t)("post_orders.search_placeholder"))} class="search-box__input" data-v-ee9dc7b9></div><div class="dropdown-filter" data-v-ee9dc7b9><button class="filter-select" data-v-ee9dc7b9><span data-v-ee9dc7b9>${ssrInterpolate(filterCommunity.value.length === 0 ? unref(t)("post_orders.filter_all_communities") : unref(t)("post_orders.filter_communities_selected", { count: String(filterCommunity.value.length) }))}</span>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevron-down",
				size: 14
			}, null, _parent));
			_push(`</button>`);
			if (showCommunityDropdown.value) {
				_push(`<div class="dropdown-menu" data-v-ee9dc7b9><!--[-->`);
				ssrRenderList(communities, (c) => {
					_push(`<label class="dropdown-item" data-v-ee9dc7b9><input type="checkbox"${ssrIncludeBooleanAttr(filterCommunity.value.includes(c)) ? " checked" : ""} data-v-ee9dc7b9><span data-v-ee9dc7b9>${ssrInterpolate(c)}</span></label>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`</div><select class="filter-select" data-v-ee9dc7b9><!--[-->`);
			ssrRenderList(statusOptions, (opt) => {
				_push(`<option${ssrRenderAttr("value", opt.value)} data-v-ee9dc7b9${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, opt.value) : ssrLooseEqual(filterStatus.value, opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
			});
			_push(`<!--]--></select><select class="filter-select" data-v-ee9dc7b9><!--[-->`);
			ssrRenderList(reviewDueOptions, (opt) => {
				_push(`<option${ssrRenderAttr("value", opt.value)} data-v-ee9dc7b9${ssrIncludeBooleanAttr(Array.isArray(filterReviewDue.value) ? ssrLooseContain(filterReviewDue.value, opt.value) : ssrLooseEqual(filterReviewDue.value, opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
			});
			_push(`<!--]--></select>`);
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/post-orders/new",
				class: "btn-primary"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:plus",
							size: 16
						}, null, _parent, _scopeId));
						_push(` ${ssrInterpolate(unref(t)("post_orders.create_new"))}`);
					} else return [createVNode(_component_Icon, {
						name: "lucide:plus",
						size: 16
					}), createTextVNode(" " + toDisplayString(unref(t)("post_orders.create_new")), 1)];
				}),
				_: 1
			}, _parent));
			_push(`</div></div><div class="po-list__table-container" data-v-ee9dc7b9><table class="po-list__table" data-v-ee9dc7b9><thead data-v-ee9dc7b9><tr data-v-ee9dc7b9><th class="${ssrRenderClass([{ sorted: sortKey.value === "id" }, "col-id sortable"])}" data-v-ee9dc7b9><span class="sortable-content" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.col_id"))} `);
			if (sortKey.value === "id") _push(ssrRenderComponent(_component_Icon, {
				name: sortOrder.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 13
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="${ssrRenderClass([{ sorted: sortKey.value === "community" }, "col-community sortable"])}" data-v-ee9dc7b9><span class="sortable-content" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.col_community"))} `);
			if (sortKey.value === "community") _push(ssrRenderComponent(_component_Icon, {
				name: sortOrder.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 13
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="${ssrRenderClass([{ sorted: sortKey.value === "post_name" }, "col-post sortable"])}" data-v-ee9dc7b9><span class="sortable-content" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.col_post_name"))} `);
			if (sortKey.value === "post_name") _push(ssrRenderComponent(_component_Icon, {
				name: sortOrder.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 13
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="${ssrRenderClass([{ sorted: sortKey.value === "status" }, "col-status sortable"])}" data-v-ee9dc7b9><span class="sortable-content" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.col_status"))} `);
			if (sortKey.value === "status") _push(ssrRenderComponent(_component_Icon, {
				name: sortOrder.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 13
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="${ssrRenderClass([{ sorted: sortKey.value === "current_version" }, "col-version sortable"])}" data-v-ee9dc7b9><span class="sortable-content" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.col_version"))} `);
			if (sortKey.value === "current_version") _push(ssrRenderComponent(_component_Icon, {
				name: sortOrder.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 13
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="col-published" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.col_last_published"))}</th><th class="col-by" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.col_published_by"))}</th><th class="${ssrRenderClass([{ sorted: sortKey.value === "review_due_date" }, "col-review sortable"])}" data-v-ee9dc7b9><span class="sortable-content" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.col_review_due"))} `);
			if (sortKey.value === "review_due_date") _push(ssrRenderComponent(_component_Icon, {
				name: sortOrder.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 13
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="col-ack" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.col_acknowledged"))}</th><th class="col-actions" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.col_actions"))}</th></tr></thead><tbody data-v-ee9dc7b9><!--[-->`);
			ssrRenderList(filteredPostOrders.value, (po) => {
				_push(`<tr data-v-ee9dc7b9><td class="col-id" data-v-ee9dc7b9><span class="id-text" data-v-ee9dc7b9>${ssrInterpolate(po.id)}</span></td><td class="col-community" data-v-ee9dc7b9>${ssrInterpolate(po.community)}</td><td class="col-post" data-v-ee9dc7b9>`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: `/post-orders/${po.id}`,
					class: "post-link"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`${ssrInterpolate(po.post_name)}`);
						else return [createTextVNode(toDisplayString(po.post_name), 1)];
					}),
					_: 2
				}, _parent));
				_push(`</td><td class="col-status" data-v-ee9dc7b9>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "postOrderStatus",
					value: po.status
				}, null, _parent));
				_push(`</td><td class="col-version" data-v-ee9dc7b9>v${ssrInterpolate(po.current_version)}</td><td class="col-published" data-v-ee9dc7b9>${ssrInterpolate(formatDate(po.last_published_date))}</td><td class="col-by" data-v-ee9dc7b9>${ssrInterpolate(po.last_published_by ?? "—")}</td><td class="col-review" data-v-ee9dc7b9><span class="${ssrRenderClass({ "overdue-text": isOverdue(po.review_due_date) })}" data-v-ee9dc7b9>${ssrInterpolate(formatDate(po.review_due_date))} `);
				if (isOverdue(po.review_due_date)) _push(`<span class="overdue-tag" data-v-ee9dc7b9>Overdue</span>`);
				else _push(`<!---->`);
				_push(`</span></td><td class="col-ack" data-v-ee9dc7b9>`);
				if (po.acknowledged_pct !== null) _push(`<span class="ack-cell" data-v-ee9dc7b9><span class="ack-bar" data-v-ee9dc7b9><span class="ack-bar__fill" style="${ssrRenderStyle({ width: `${po.acknowledged_pct}%` })}" data-v-ee9dc7b9></span></span><span class="ack-pct" data-v-ee9dc7b9>${ssrInterpolate(po.acknowledged_pct)}%</span></span>`);
				else _push(`<span class="text-muted" data-v-ee9dc7b9>—</span>`);
				_push(`</td><td class="col-actions" data-v-ee9dc7b9><div class="action-group" data-v-ee9dc7b9>`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: `/post-orders/${po.id}`,
					class: "action-btn action-btn--icon",
					title: unref(t)("common.view")
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(ssrRenderComponent(_component_Icon, {
							name: "lucide:eye",
							size: 14
						}, null, _parent, _scopeId));
						else return [createVNode(_component_Icon, {
							name: "lucide:eye",
							size: 14
						})];
					}),
					_: 2
				}, _parent));
				if (po.status !== "archived") _push(ssrRenderComponent(_component_NuxtLink, {
					to: `/post-orders/${po.id}`,
					class: "action-btn action-btn--icon",
					title: unref(t)("common.edit")
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(ssrRenderComponent(_component_Icon, {
							name: "lucide:pencil",
							size: 14
						}, null, _parent, _scopeId));
						else return [createVNode(_component_Icon, {
							name: "lucide:pencil",
							size: 14
						})];
					}),
					_: 2
				}, _parent));
				else _push(`<!---->`);
				if (po.status === "draft") {
					_push(`<button class="action-btn action-btn--icon action-btn--danger"${ssrRenderAttr("title", unref(t)("common.delete"))} data-v-ee9dc7b9>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:trash-2",
						size: 14
					}, null, _parent));
					_push(`</button>`);
				} else _push(`<!---->`);
				_push(`</div></td></tr>`);
			});
			_push(`<!--]-->`);
			if (filteredPostOrders.value.length === 0) {
				_push(`<tr data-v-ee9dc7b9><td colspan="10" class="empty-state" data-v-ee9dc7b9>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:file-x",
					size: 32
				}, null, _parent));
				_push(`<span data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.no_results"))}</span></td></tr>`);
			} else _push(`<!---->`);
			_push(`</tbody></table></div><div class="po-list__pagination" data-v-ee9dc7b9><span class="pagination-info" data-v-ee9dc7b9>${ssrInterpolate(unref(t)("post_orders.showing", {
				count: String(filteredPostOrders.value.length),
				total: String(postOrders.value.length)
			}))}</span><div class="pagination-controls" data-v-ee9dc7b9><button class="pagination-btn" disabled data-v-ee9dc7b9>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevron-left",
				size: 16
			}, null, _parent));
			_push(`</button><button class="pagination-btn pagination-btn--active" data-v-ee9dc7b9>1</button><button class="pagination-btn" disabled data-v-ee9dc7b9>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevron-right",
				size: 16
			}, null, _parent));
			_push(`</button></div></div>`);
			_push(ssrRenderComponent(_component_AppModal, {
				show: showDeleteModal.value,
				title: unref(t)("post_orders.delete_title"),
				message: unref(t)("post_orders.delete_message", { name: orderToDelete.value?.post_name ?? "" }),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(t)("common.delete"),
				onClose: ($event) => showDeleteModal.value = false,
				onCancel: ($event) => showDeleteModal.value = false,
				onOk: handleDeleteConfirm
			}, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/post-orders/PostOrdersList.vue
var _sfc_setup$1 = PostOrdersList_vue_vue_type_script_setup_true_lang_default.setup;
PostOrdersList_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/post-orders/PostOrdersList.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var PostOrdersList_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PostOrdersList_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-ee9dc7b9"]]), { __name: "PostOrdersList" });
//#endregion
//#region app/pages/post-orders/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_PostOrdersList = PostOrdersList_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: unref(t)("nav.post_orders"),
				breadcrumb: [{ label: unref(t)("nav.manage") }, { label: unref(t)("nav.post_orders") }]
			}, null, _parent));
			_push(`<div class="post-orders-page" data-v-a418109a><div class="content-card" data-v-a418109a>`);
			_push(ssrRenderComponent(_component_PostOrdersList, null, null, _parent));
			_push(`</div></div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/post-orders/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/post-orders/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var post_orders_default = /*#__PURE__*/ _plugin_vue_export_helper_default(index_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a418109a"]]);

export { post_orders_default as default };
//# sourceMappingURL=post-orders-CI_hys1A.mjs.map
