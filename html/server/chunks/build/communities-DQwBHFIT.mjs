import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, N as NuxtLink } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { c as communityApi } from './community-jevurWQo.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { A as AppButton_default } from './AppButton-sr0dx6mm.mjs';
import { A as AppDialogModal_default } from './AppDialogModal-CYp4oRY_.mjs';
import { defineComponent, ref, watch, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from 'vue/server-renderer';
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

//#region app/components/communities/CommunitiesManagement.vue?vue&type=script&setup=true&lang.ts
var CommunitiesManagement_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "CommunitiesManagement",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const communities = ref([]);
		const loading = ref(false);
		const isSearching = ref(false);
		const fetchError = ref(null);
		const successMessage = ref(null);
		function mapCommunity(c) {
			return {
				id: String(c.community_id),
				name: c.name,
				area: c.area,
				status: c.is_active ? "active" : "inactive",
				posts: 0,
				officers: c.officer_count ?? 0,
				residents: c.resident_count ?? null,
				calls24h: 0,
				featuredOfficer: false,
				officerNames: [],
				residentNames: []
			};
		}
		async function fetchCommunities(searchText, includeInactive, isSearch = false) {
			if (isSearch) isSearching.value = true;
			else loading.value = true;
			fetchError.value = null;
			try {
				const response = await communityApi.getCommunities({
					include_inactive: includeInactive ?? true,
					search_text: searchText?.trim() || void 0
				}, { showLoading: !isSearch });
				if (response.rc === 0 && response.communities) communities.value = response.communities.map(mapCommunity);
				else fetchError.value = response.message || "Failed to load communities";
			} catch (err) {
				console.error("Error fetching communities:", err);
				fetchError.value = "Failed to load communities";
			} finally {
				if (isSearch) isSearching.value = false;
				else loading.value = false;
			}
		}
		const statusFilter = ref("all");
		const searchQuery = ref("");
		let searchTimer = null;
		watch([searchQuery, statusFilter], ([query, status]) => {
			if (searchTimer) clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				fetchCommunities(query, status !== "active", true);
			}, 400);
		});
		const currentPage = ref(1);
		ref(6);
		const totalEntries = computed(() => filteredCommunities.value.length);
		const showDeleteModal = ref(false);
		const communityToDelete = ref(null);
		function closeDeleteModal() {
			showDeleteModal.value = false;
			communityToDelete.value = null;
		}
		const showDeactivateModal = ref(false);
		const deactivateConstraintMessage = ref("");
		const isDeactivating = ref(false);
		async function handleDeleteConfirm() {
			if (!communityToDelete.value) return;
			try {
				const response = await communityApi.deleteCommunity(Number(communityToDelete.value.id));
				if (response.rc === 0) {
					closeDeleteModal();
					successMessage.value = t("communities.delete_success");
					await fetchCommunities(searchQuery.value, statusFilter.value !== "active", true);
				} else if (response.rc === 500) {
					fetchError.value = t("communities.not_found_error");
					closeDeleteModal();
					await fetchCommunities(searchQuery.value, statusFilter.value !== "active", true);
				} else if (response.rc === 502 || response.rc === 503 || response.rc === 504) {
					const constraintMap = {
						502: t("communities.constraint_officers"),
						503: t("communities.constraint_residents"),
						504: t("communities.constraint_calls")
					};
					deactivateConstraintMessage.value = constraintMap[response.rc] ?? (response.message || "");
					closeDeleteModal();
					showDeactivateModal.value = true;
				} else {
					fetchError.value = response.message || "Failed to delete community";
					closeDeleteModal();
				}
			} catch (err) {
				console.error("Error deleting community:", err);
				fetchError.value = "Failed to delete community";
				closeDeleteModal();
			}
		}
		function closeDeactivateModal() {
			showDeactivateModal.value = false;
			deactivateConstraintMessage.value = "";
			communityToDelete.value = null;
		}
		async function handleDeactivateConfirm() {
			if (!communityToDelete.value) return;
			isDeactivating.value = true;
			try {
				const response = await communityApi.updateCommunity({
					community_id: Number(communityToDelete.value.id),
					is_active: false
				});
				if (response.rc === 0) {
					closeDeactivateModal();
					successMessage.value = t("communities.deactivate_success");
					await fetchCommunities(searchQuery.value, statusFilter.value !== "active", true);
				} else {
					fetchError.value = response.message || "Failed to deactivate community";
					closeDeactivateModal();
				}
			} catch (err) {
				console.error("Error deactivating community:", err);
				fetchError.value = "Failed to deactivate community";
				closeDeactivateModal();
			} finally {
				isDeactivating.value = false;
			}
		}
		const sortKey = ref("name");
		const sortOrder = ref("asc");
		const filteredCommunities = computed(() => {
			let result = communities.value;
			if (statusFilter.value !== "all") result = result.filter((c) => c.status === statusFilter.value);
			return result;
		});
		const sortedCommunities = computed(() => {
			return [...filteredCommunities.value].sort((a, b) => {
				let aVal;
				let bVal;
				switch (sortKey.value) {
					case "name":
						aVal = a.name.toLowerCase();
						bVal = b.name.toLowerCase();
						break;
					case "area":
						aVal = a.area.toLowerCase();
						bVal = b.area.toLowerCase();
						break;
					case "status":
						aVal = a.status;
						bVal = b.status;
						break;
					case "posts":
						aVal = a.posts;
						bVal = b.posts;
						break;
					case "officers":
						aVal = a.officers;
						bVal = b.officers;
						break;
					case "residents":
						aVal = a.residents ?? 0;
						bVal = b.residents ?? 0;
						break;
					case "calls24h":
						aVal = a.calls24h;
						bVal = b.calls24h;
						break;
					default: return 0;
				}
				if (aVal < bVal) return sortOrder.value === "asc" ? -1 : 1;
				if (aVal > bVal) return sortOrder.value === "asc" ? 1 : -1;
				return 0;
			});
		});
		const statusOptions = [
			{
				value: "all",
				label: "All Status"
			},
			{
				value: "active",
				label: "Active"
			},
			{
				value: "inactive",
				label: "Inactive"
			},
			{
				value: "maintenance",
				label: "Maintenance"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_NuxtLink = NuxtLink;
			const _component_AppButton = AppButton_default;
			const _component_Badge = Badge_default;
			const _component_AppModal = AppModal_default;
			const _component_AppDialogModal = AppDialogModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "communities-management" }, _attrs))} data-v-1db0f2f9><div class="communities-management__header" data-v-1db0f2f9><div data-v-1db0f2f9><h2 class="communities-management__title" data-v-1db0f2f9>${ssrInterpolate(unref(t)("communities.management_title"))}</h2><p class="communities-management__subtitle" data-v-1db0f2f9> Total: ${ssrInterpolate(unref(totalEntries))} Communities active in your jurisdiction. </p></div><div class="communities-management__actions" data-v-1db0f2f9><div class="communities-management__search" data-v-1db0f2f9>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16,
				class: "communities-management__search-icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", unref(searchQuery))} type="text" placeholder="Search communities..." class="communities-management__search-input" data-v-1db0f2f9>`);
			if (unref(isSearching)) _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:loader-2",
				size: 16,
				class: "communities-management__search-loading spin"
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</div><select class="communities-management__filter" data-v-1db0f2f9><!--[-->`);
			ssrRenderList(statusOptions, (opt) => {
				_push(`<option${ssrRenderAttr("value", opt.value)} data-v-1db0f2f9${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), opt.value) : ssrLooseEqual(unref(statusFilter), opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
			});
			_push(`<!--]--></select>`);
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/communities/new",
				class: "communities-management__add-link"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(_component_AppButton, {
						text: unref(t)("communities.add_community"),
						icon: "lucide:plus",
						type: "primary"
					}, null, _parent, _scopeId));
					else return [createVNode(_component_AppButton, {
						text: unref(t)("communities.add_community"),
						icon: "lucide:plus",
						type: "primary"
					}, null, 8, ["text"])];
				}),
				_: 1
			}, _parent));
			_push(`</div></div>`);
			if (unref(successMessage)) {
				_push(`<div class="success-banner" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:check-circle",
					size: 16
				}, null, _parent));
				_push(`<span data-v-1db0f2f9>${ssrInterpolate(unref(successMessage))}</span><button class="success-banner__close" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 14
				}, null, _parent));
				_push(`</button></div>`);
			} else _push(`<!---->`);
			if (unref(fetchError)) {
				_push(`<div class="error-banner" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:alert-circle",
					size: 16
				}, null, _parent));
				_push(`<span data-v-1db0f2f9>${ssrInterpolate(unref(fetchError))}</span><button class="error-banner__close" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 14
				}, null, _parent));
				_push(`</button></div>`);
			} else _push(`<!---->`);
			_push(`<div class="communities-management__table-container" data-v-1db0f2f9>`);
			if (unref(loading) && !unref(isSearching)) {
				_push(`<div class="communities-management__table-loading" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 24,
					class: "spin"
				}, null, _parent));
				_push(`<span data-v-1db0f2f9>Loading communities...</span></div>`);
			} else _push(`<!---->`);
			_push(`<table class="communities-management__table" data-v-1db0f2f9><thead data-v-1db0f2f9><tr data-v-1db0f2f9><th class="${ssrRenderClass([{
				"sorted": unref(sortKey) === "name",
				"asc": unref(sortKey) === "name" && unref(sortOrder) === "asc",
				"desc": unref(sortKey) === "name" && unref(sortOrder) === "desc"
			}, "col-name sortable"])}" data-v-1db0f2f9><span class="sortable-content" data-v-1db0f2f9><span data-v-1db0f2f9>Community Name</span>`);
			if (unref(sortKey) === "name") _push(ssrRenderComponent(_component_Icon, {
				name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 14
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="${ssrRenderClass([{
				"sorted": unref(sortKey) === "area",
				"asc": unref(sortKey) === "area" && unref(sortOrder) === "asc",
				"desc": unref(sortKey) === "area" && unref(sortOrder) === "desc"
			}, "col-area sortable"])}" data-v-1db0f2f9><span class="sortable-content" data-v-1db0f2f9><span data-v-1db0f2f9>Area</span>`);
			if (unref(sortKey) === "area") _push(ssrRenderComponent(_component_Icon, {
				name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 14
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="${ssrRenderClass([{
				"sorted": unref(sortKey) === "status",
				"asc": unref(sortKey) === "status" && unref(sortOrder) === "asc",
				"desc": unref(sortKey) === "status" && unref(sortOrder) === "desc"
			}, "col-status sortable"])}" data-v-1db0f2f9><span class="sortable-content" data-v-1db0f2f9><span data-v-1db0f2f9>Status</span>`);
			if (unref(sortKey) === "status") _push(ssrRenderComponent(_component_Icon, {
				name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 14
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="${ssrRenderClass([{
				"sorted": unref(sortKey) === "posts",
				"asc": unref(sortKey) === "posts" && unref(sortOrder) === "asc",
				"desc": unref(sortKey) === "posts" && unref(sortOrder) === "desc"
			}, "col-posts sortable"])}" data-v-1db0f2f9><span class="sortable-content" data-v-1db0f2f9><span data-v-1db0f2f9>Posts</span>`);
			if (unref(sortKey) === "posts") _push(ssrRenderComponent(_component_Icon, {
				name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 14
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="${ssrRenderClass([{
				"sorted": unref(sortKey) === "officers",
				"asc": unref(sortKey) === "officers" && unref(sortOrder) === "asc",
				"desc": unref(sortKey) === "officers" && unref(sortOrder) === "desc"
			}, "col-officers sortable"])}" data-v-1db0f2f9><span class="sortable-content" data-v-1db0f2f9><span data-v-1db0f2f9>Officers</span>`);
			if (unref(sortKey) === "officers") _push(ssrRenderComponent(_component_Icon, {
				name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 14
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="${ssrRenderClass([{
				"sorted": unref(sortKey) === "residents",
				"asc": unref(sortKey) === "residents" && unref(sortOrder) === "asc",
				"desc": unref(sortKey) === "residents" && unref(sortOrder) === "desc"
			}, "col-residents sortable"])}" data-v-1db0f2f9><span class="sortable-content" data-v-1db0f2f9><span data-v-1db0f2f9>Residents</span>`);
			if (unref(sortKey) === "residents") _push(ssrRenderComponent(_component_Icon, {
				name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 14
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="${ssrRenderClass([{
				"sorted": unref(sortKey) === "calls24h",
				"asc": unref(sortKey) === "calls24h" && unref(sortOrder) === "asc",
				"desc": unref(sortKey) === "calls24h" && unref(sortOrder) === "desc"
			}, "col-calls sortable"])}" data-v-1db0f2f9><span class="sortable-content" data-v-1db0f2f9><span data-v-1db0f2f9>Calls (24h)</span>`);
			if (unref(sortKey) === "calls24h") _push(ssrRenderComponent(_component_Icon, {
				name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 14
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th class="col-featured" data-v-1db0f2f9>Featured Officer</th><th class="col-actions" data-v-1db0f2f9>Actions</th></tr></thead><tbody data-v-1db0f2f9><!--[-->`);
			ssrRenderList(unref(sortedCommunities), (community) => {
				_push(`<tr data-v-1db0f2f9><td class="col-name" data-v-1db0f2f9><div class="community-name" data-v-1db0f2f9><span class="community-name__text" data-v-1db0f2f9>${ssrInterpolate(community.name)}</span><span class="community-name__id" data-v-1db0f2f9>ID: ${ssrInterpolate(community.id)}</span></div></td><td class="col-area" data-v-1db0f2f9><span class="area-text" data-v-1db0f2f9>${ssrInterpolate(community.area)}</span></td><td class="col-status" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "status",
					value: community.status
				}, null, _parent));
				_push(`</td><td class="col-posts" data-v-1db0f2f9>${ssrInterpolate(community.posts)}</td><td class="col-officers" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: `/communities/${community.id}/officers`,
					class: "action-btn action-btn--show"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(` Show (${ssrInterpolate(community.officers)}) `);
						else return [createTextVNode(" Show (" + toDisplayString(community.officers) + ") ", 1)];
					}),
					_: 2
				}, _parent));
				_push(`</td><td class="col-residents" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: `/communities/${community.id}/residents`,
					class: "action-btn action-btn--show"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(` Show (${ssrInterpolate(community.residents ?? 0)}) `);
						else return [createTextVNode(" Show (" + toDisplayString(community.residents ?? 0) + ") ", 1)];
					}),
					_: 2
				}, _parent));
				_push(`</td><td class="col-calls" data-v-1db0f2f9><span class="${ssrRenderClass({ "calls-high": community.calls24h >= 10 })}" data-v-1db0f2f9>${ssrInterpolate(community.calls24h)}</span></td><td class="col-featured" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: `/communities/${community.id}/featured-officer?from=list`,
					class: "action-btn action-btn--show"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(` Manage `);
						else return [createTextVNode(" Manage ")];
					}),
					_: 2
				}, _parent));
				_push(`</td><td class="col-actions" data-v-1db0f2f9><div class="action-group" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: `/communities/edit/${community.id}`,
					class: "action-btn action-btn--icon"
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
				_push(`<button class="action-btn action-btn--icon" data-v-1db0f2f9>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:trash-2",
					size: 14
				}, null, _parent));
				_push(`</button></div></td></tr>`);
			});
			_push(`<!--]--></tbody></table></div><div class="communities-management__pagination" data-v-1db0f2f9><span class="pagination-info" data-v-1db0f2f9> Showing 1 to ${ssrInterpolate(unref(communities).length)} of ${ssrInterpolate(unref(totalEntries))} entries </span><div class="pagination-controls" data-v-1db0f2f9><button class="pagination-btn"${ssrIncludeBooleanAttr(unref(currentPage) === 1) ? " disabled" : ""} data-v-1db0f2f9>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevron-left",
				size: 16
			}, null, _parent));
			_push(`</button><!--[-->`);
			ssrRenderList([
				1,
				2,
				3
			], (page) => {
				_push(`<button class="${ssrRenderClass([{ "pagination-btn--active": unref(currentPage) === page }, "pagination-btn"])}" data-v-1db0f2f9>${ssrInterpolate(page)}</button>`);
			});
			_push(`<!--]--><span class="pagination-ellipsis" data-v-1db0f2f9>...</span><button class="pagination-btn" data-v-1db0f2f9>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevron-right",
				size: 16
			}, null, _parent));
			_push(`</button></div></div>`);
			_push(ssrRenderComponent(_component_AppModal, {
				show: unref(showDeleteModal),
				title: unref(t)("communities.delete_title"),
				message: unref(t)("communities.delete_message", { name: unref(communityToDelete)?.name || "" }),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(t)("common.delete"),
				onClose: closeDeleteModal,
				onCancel: closeDeleteModal,
				onOk: handleDeleteConfirm
			}, null, _parent));
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: unref(showDeactivateModal),
				title: unref(t)("communities.cannot_delete_title"),
				"max-width": "480px",
				onClose: closeDeactivateModal
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "ghost",
							onClick: closeDeactivateModal
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(isDeactivating) ? unref(t)("common.saving") : unref(t)("communities.deactivate_action"),
							type: "danger",
							disabled: unref(isDeactivating),
							onClick: handleDeactivateConfirm
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "ghost",
						onClick: closeDeactivateModal
					}, null, 8, ["text"]), createVNode(_component_AppButton, {
						text: unref(isDeactivating) ? unref(t)("common.saving") : unref(t)("communities.deactivate_action"),
						type: "danger",
						disabled: unref(isDeactivating),
						onClick: handleDeactivateConfirm
					}, null, 8, ["text", "disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="deactivate-modal-body" data-v-1db0f2f9${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:alert-triangle",
							size: 20,
							class: "deactivate-modal-body__icon"
						}, null, _parent, _scopeId));
						_push(`<div data-v-1db0f2f9${_scopeId}><p class="deactivate-modal-body__constraint" data-v-1db0f2f9${_scopeId}>${ssrInterpolate(unref(deactivateConstraintMessage))}</p><p class="deactivate-modal-body__suggestion" data-v-1db0f2f9${_scopeId}>${ssrInterpolate(unref(t)("communities.deactivate_suggestion"))}</p></div></div>`);
					} else return [createVNode("div", { class: "deactivate-modal-body" }, [createVNode(_component_Icon, {
						name: "lucide:alert-triangle",
						size: 20,
						class: "deactivate-modal-body__icon"
					}), createVNode("div", null, [createVNode("p", { class: "deactivate-modal-body__constraint" }, toDisplayString(unref(deactivateConstraintMessage)), 1), createVNode("p", { class: "deactivate-modal-body__suggestion" }, toDisplayString(unref(t)("communities.deactivate_suggestion")), 1)])])];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/communities/CommunitiesManagement.vue
var _sfc_setup$1 = CommunitiesManagement_vue_vue_type_script_setup_true_lang_default.setup;
CommunitiesManagement_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/communities/CommunitiesManagement.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var CommunitiesManagement_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(CommunitiesManagement_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-1db0f2f9"]]), { __name: "CommunitiesManagement" });
//#endregion
//#region app/pages/communities/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_CommunitiesManagement = CommunitiesManagement_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: "Communities",
				breadcrumb: [{ label: "Manage" }, { label: "Overview" }],
				"show-search": true
			}, null, _parent));
			_push(`<div class="communities-page" data-v-b7d54768>`);
			_push(ssrRenderComponent(_component_CommunitiesManagement, null, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/communities/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/communities/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var communities_default = /*#__PURE__*/ _plugin_vue_export_helper_default(index_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-b7d54768"]]);

export { communities_default as default };
//# sourceMappingURL=communities-DQwBHFIT.mjs.map
