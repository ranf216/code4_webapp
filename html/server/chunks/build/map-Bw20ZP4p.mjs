import { t as components_default } from './components-DWHbB934.mjs';
import { u as useRoute, a as useTranslation } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { A as AppButton_default } from './AppButton-sr0dx6mm.mjs';
import { defineComponent, ref, unref, reactive, computed, resolveComponent, mergeProps, withCtx, createVNode, toDisplayString, createTextVNode, withDirectives, vModelText, openBlock, createBlock, createCommentVNode, Fragment, renderList, vModelSelect, vModelCheckbox, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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

//#region app/components/map/MapManagement.vue?vue&type=script&setup=true&lang.ts
var MapManagement_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "MapManagement",
	__ssrInlineRender: true,
	props: {
		communityId: {},
		communityName: {}
	},
	setup(__props) {
		const { t } = useTranslation();
		const viewMode = ref("map");
		const listTab = ref("assets");
		const hasMap = ref(false);
		const activeShape = ref(null);
		const isBatchMode = ref(false);
		const pendingLocation = ref(null);
		ref(null);
		const showAddAssetModal = ref(false);
		const showAddPostModal = ref(false);
		const showAddInfoModal = ref(false);
		const infoModalType = ref("entry_exit");
		const infoModalForm = reactive({ name: "" });
		const infoModalError = ref("");
		const showDeleteModal = ref(false);
		const showTypeSelect = ref(false);
		const showItemDetail = ref(null);
		const itemToDelete = ref(null);
		const showViewModal = ref(false);
		const showEditModal = ref(false);
		const viewItem = ref(null);
		const ASSET_TYPES = [
			"Door",
			"Window",
			"Camera",
			"Gate",
			"Sensor",
			"Light",
			"Other"
		];
		const PRIORITIES = [
			"Urgent",
			"Important",
			"Normal",
			"Low"
		];
		const editAssetForm = reactive({
			type: "",
			installationDate: "",
			replacementDate: "",
			description: ""
		});
		const editPostForm = reactive({
			name: "",
			description: "",
			priority: "Normal",
			equipment: "",
			active: true
		});
		const editErrors = reactive({});
		function handleSaveEdit() {
			if (!viewItem.value) return;
			const idx = mapItems.value.findIndex((i) => i.id === viewItem.value.id);
			if (idx === -1) return;
			if (viewItem.value.type === "asset") {
				if (!editAssetForm.type) {
					editErrors.type = "Required";
					return;
				}
				const updated = {
					...mapItems.value[idx],
					assetType: editAssetForm.type,
					installationDate: editAssetForm.installationDate,
					replacementDate: editAssetForm.replacementDate,
					description: editAssetForm.description
				};
				mapItems.value.splice(idx, 1, updated);
			} else if (viewItem.value.type === "post") {
				if (!editPostForm.name.trim()) {
					editErrors.name = "Required";
					return;
				}
				const updated = {
					...mapItems.value[idx],
					name: editPostForm.name,
					description: editPostForm.description,
					priority: editPostForm.priority,
					equipment: editPostForm.equipment,
					active: editPostForm.active
				};
				mapItems.value.splice(idx, 1, updated);
			}
			showEditModal.value = false;
			viewItem.value = null;
		}
		function openDeleteFromView() {
			if (!viewItem.value) return;
			itemToDelete.value = viewItem.value;
			showViewModal.value = false;
			showDeleteModal.value = true;
		}
		const assetSearchQuery = ref("");
		const postSearchQuery = ref("");
		const postFilterActive = ref("active");
		const mapItems = ref([
			{
				id: "AST-1001",
				type: "asset",
				assetType: "Camera",
				installationDate: "2024-01-10",
				replacementDate: "",
				description: "Main entrance camera",
				location: {
					x: 35,
					y: 40
				},
				shape: "dot"
			},
			{
				id: "AST-1002",
				type: "asset",
				assetType: "Door",
				installationDate: "2024-02-15",
				replacementDate: "2026-02-15",
				description: "Security door - North wing",
				location: {
					x: 55,
					y: 25
				},
				shape: "dot"
			},
			{
				id: "AST-1003",
				type: "asset",
				assetType: "Window",
				installationDate: "2024-03-20",
				replacementDate: "",
				description: "",
				location: {
					x: 70,
					y: 60
				},
				shape: "circle"
			},
			{
				id: "PST-1001",
				type: "post",
				name: "Main Gate",
				description: "Primary entry point",
				priority: "Urgent",
				equipment: "Radio, Flashlight",
				active: true,
				location: {
					x: 20,
					y: 70
				},
				shape: "dot"
			},
			{
				id: "PST-1002",
				type: "post",
				name: "North Patrol",
				description: "Northern perimeter",
				priority: "Normal",
				equipment: "Radio",
				active: true,
				location: {
					x: 65,
					y: 15
				},
				shape: "circle"
			},
			{
				id: "PST-1003",
				type: "post",
				name: "Parking Lot B",
				description: "Secondary parking area",
				priority: "Low",
				equipment: "",
				active: false,
				location: {
					x: 80,
					y: 75
				},
				shape: "dot"
			}
		]);
		const assets = computed(() => mapItems.value.filter((i) => i.type === "asset"));
		const posts = computed(() => mapItems.value.filter((i) => i.type === "post"));
		const filteredAssets = computed(() => {
			const q = assetSearchQuery.value.toLowerCase();
			return assets.value.filter((a) => !q || a.assetType.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
		});
		const filteredPosts = computed(() => {
			let list = posts.value;
			if (postFilterActive.value === "active") list = list.filter((p) => p.active);
			if (postFilterActive.value === "inactive") list = list.filter((p) => !p.active);
			const q = postSearchQuery.value.toLowerCase();
			if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
			return list;
		});
		function selectItemType(type) {
			showTypeSelect.value = false;
			if (type === "asset") showAddAssetModal.value = true;
			else if (type === "post") showAddPostModal.value = true;
			else {
				infoModalType.value = type;
				infoModalForm.name = "";
				infoModalError.value = "";
				showAddInfoModal.value = true;
			}
		}
		function handleAddInfo() {
			if (!infoModalForm.name.trim()) {
				infoModalError.value = "Name is required";
				return;
			}
			const prefix = infoModalType.value === "entry_exit" ? "EE" : "ZN";
			mapItems.value.push({
				id: `${prefix}-${Math.floor(Math.random() * 9e3 + 1e3)}`,
				type: infoModalType.value,
				name: infoModalForm.name.trim(),
				location: pendingLocation.value ?? {
					x: 50,
					y: 50
				},
				shape: activeShape.value ?? "dot"
			});
			showAddInfoModal.value = false;
			pendingLocation.value = null;
			activeShape.value = null;
		}
		function openAddNew() {
			pendingLocation.value = null;
			showTypeSelect.value = true;
		}
		function handleAddAsset(data) {
			mapItems.value.push({
				id: data.id,
				type: "asset",
				assetType: data.type,
				installationDate: data.installationDate,
				replacementDate: data.replacementDate,
				description: data.description,
				location: pendingLocation.value ?? {
					x: 50,
					y: 50
				},
				shape: activeShape.value ?? "dot"
			});
			pendingLocation.value = null;
			activeShape.value = null;
			isBatchMode.value = false;
		}
		function handleAddPost(data) {
			mapItems.value.push({
				id: data.id,
				type: "post",
				name: data.name,
				description: data.description,
				priority: data.priority,
				equipment: data.equipment,
				active: data.active,
				location: pendingLocation.value ?? {
					x: 50,
					y: 50
				},
				shape: activeShape.value ?? "dot"
			});
			pendingLocation.value = null;
			activeShape.value = null;
			isBatchMode.value = false;
		}
		function handleDeleteItem() {
			if (!itemToDelete.value) return;
			const idx = mapItems.value.findIndex((i) => i.id === itemToDelete.value.id);
			if (idx > -1) mapItems.value.splice(idx, 1);
			showDeleteModal.value = false;
			itemToDelete.value = null;
			showItemDetail.value = null;
		}
		function getItemName(item) {
			if (item.type === "asset") return `${item.assetType} (${item.id})`;
			if (item.type === "post") return item.name;
			return item.name;
		}
		function asAsset(item) {
			return item;
		}
		function asPost(item) {
			return item;
		}
		function asInfo(item) {
			return item;
		}
		function getPriorityClass(priority) {
			return {
				Urgent: "critical",
				Important: "warn",
				Normal: "accent",
				Low: "muted"
			}[priority] ?? "muted";
		}
		function getMarkerClass(item) {
			return {
				asset: "map-marker--asset",
				post: "map-marker--post",
				entry_exit: "map-marker--entry",
				zone: "map-marker--zone"
			}[item.type] ?? "";
		}
		function getMarkerIcon(item) {
			if (item.type === "post") return "lucide:map-pin";
			if (item.type === "entry_exit") return "lucide:door-open";
			if (item.type === "zone") return "lucide:shield-alert";
			return {
				Camera: "lucide:camera",
				Door: "lucide:door-open",
				Window: "lucide:layout-dashboard",
				Gate: "lucide:gate",
				Sensor: "lucide:activity",
				Light: "lucide:lamp",
				Other: "lucide:box"
			}[item.assetType] ?? "lucide:box";
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_AppButton = AppButton_default;
			const _component_Badge = Badge_default;
			const _component_AppModal = AppModal_default;
			const _component_MapAddAssetModal = resolveComponent("MapAddAssetModal");
			const _component_MapAddPostModal = resolveComponent("MapAddPostModal");
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "map-management" }, _attrs))} data-v-5d3def61><div class="page-header" data-v-5d3def61><h2 class="page-title" data-v-5d3def61>${ssrInterpolate(unref(t)("map.title"))}</h2><div class="header-actions" data-v-5d3def61><div class="view-toggle" data-v-5d3def61><button class="${ssrRenderClass(["toggle-btn", { active: viewMode.value === "map" }])}" data-v-5d3def61>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:map",
				size: 14
			}, null, _parent));
			_push(`<span data-v-5d3def61>${ssrInterpolate(unref(t)("map.map_view"))}</span></button><button class="${ssrRenderClass(["toggle-btn", { active: viewMode.value === "list" }])}" data-v-5d3def61>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:list",
				size: 14
			}, null, _parent));
			_push(`<span data-v-5d3def61>${ssrInterpolate(unref(t)("map.list_view"))}</span></button></div>`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("map.add_new"),
				type: "primary",
				icon: "lucide:plus",
				onClick: openAddNew
			}, null, _parent));
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("map.add_multiple"),
				type: "secondary",
				icon: "lucide:layers",
				onClick: ($event) => isBatchMode.value = true
			}, null, _parent));
			_push(`</div></div>`);
			if (viewMode.value === "map") {
				_push(`<div class="map-view" data-v-5d3def61><div class="map-toolbar" data-v-5d3def61><span class="toolbar-label" data-v-5d3def61>${ssrInterpolate(unref(t)("map.shape"))}:</span><button class="${ssrRenderClass(["tool-btn", { active: activeShape.value === "dot" }])}"${ssrRenderAttr("title", unref(t)("map.shape_dot"))} data-v-5d3def61>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:dot",
					size: 16
				}, null, _parent));
				_push(`<span data-v-5d3def61>${ssrInterpolate(unref(t)("map.shape_dot"))}</span></button><button class="${ssrRenderClass(["tool-btn", { active: activeShape.value === "circle" }])}"${ssrRenderAttr("title", unref(t)("map.shape_circle"))} data-v-5d3def61>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:circle",
					size: 16
				}, null, _parent));
				_push(`<span data-v-5d3def61>${ssrInterpolate(unref(t)("map.shape_circle"))}</span></button><button class="${ssrRenderClass(["tool-btn", { active: activeShape.value === "line" }])}"${ssrRenderAttr("title", unref(t)("map.shape_line"))} data-v-5d3def61>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:minus",
					size: 16
				}, null, _parent));
				_push(`<span data-v-5d3def61>${ssrInterpolate(unref(t)("map.shape_line"))}</span></button><div class="toolbar-divider" data-v-5d3def61></div><button class="tool-btn"${ssrRenderAttr("title", unref(t)("map.undo"))} data-v-5d3def61>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:undo-2",
					size: 16
				}, null, _parent));
				_push(`<span data-v-5d3def61>${ssrInterpolate(unref(t)("map.undo"))}</span></button><div class="toolbar-divider" data-v-5d3def61></div><button class="tool-btn" title="Zoom in" data-v-5d3def61>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:zoom-in",
					size: 16
				}, null, _parent));
				_push(`</button><button class="tool-btn" title="Zoom out" data-v-5d3def61>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:zoom-out",
					size: 16
				}, null, _parent));
				_push(`</button><button class="tool-btn" title="Rotate" data-v-5d3def61>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:rotate-ccw",
					size: 16
				}, null, _parent));
				_push(`</button>`);
				if (isBatchMode.value) {
					_push(`<div class="batch-badge" data-v-5d3def61>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:layers",
						size: 12
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("map.batch_mode"))} <button class="batch-cancel" data-v-5d3def61>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 12
					}, null, _parent));
					_push(`</button></div>`);
				} else _push(`<!---->`);
				_push(`</div><div class="${ssrRenderClass([{ "cursor-crosshair": !!activeShape.value }, "map-canvas"])}" data-v-5d3def61>`);
				if (!hasMap.value) {
					_push(`<div class="map-empty" data-v-5d3def61>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:map",
						size: 48,
						class: "map-empty__icon"
					}, null, _parent));
					_push(`<h3 class="map-empty__title" data-v-5d3def61>${ssrInterpolate(unref(t)("map.no_map_title"))}</h3><p class="map-empty__subtitle" data-v-5d3def61>${ssrInterpolate(unref(t)("map.no_map_subtitle"))}</p>`);
					_push(ssrRenderComponent(_component_AppButton, {
						text: unref(t)("map.create_map"),
						type: "primary",
						icon: "lucide:plus",
						onClick: ($event) => hasMap.value = true
					}, null, _parent));
					_push(`</div>`);
				} else {
					_push(`<!--[--><div class="map-grid-bg" data-v-5d3def61></div><!--[-->`);
					ssrRenderList(mapItems.value, (item) => {
						_push(`<div class="${ssrRenderClass([[getMarkerClass(item), `map-marker--${item.shape}`], "map-marker"])}" style="${ssrRenderStyle({
							left: item.location.x + "%",
							top: item.location.y + "%"
						})}" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: getMarkerIcon(item),
							size: 16
						}, null, _parent));
						_push(`<span class="marker-label" data-v-5d3def61>${ssrInterpolate(item.type === "asset" ? asAsset(item).assetType : getItemName(item))}</span></div>`);
					});
					_push(`<!--]-->`);
					if (showItemDetail.value) {
						_push(`<div class="item-popup" style="${ssrRenderStyle({
							left: showItemDetail.value.location.x + 2 + "%",
							top: showItemDetail.value.location.y + "%"
						})}" data-v-5d3def61><div class="popup-header" data-v-5d3def61><span class="popup-title" data-v-5d3def61>${ssrInterpolate(getItemName(showItemDetail.value))}</span><button class="popup-close" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:x",
							size: 12
						}, null, _parent));
						_push(`</button></div><div class="popup-body" data-v-5d3def61>`);
						if (showItemDetail.value.type === "asset") {
							_push(`<!--[--><div class="popup-row" data-v-5d3def61><span data-v-5d3def61>Type:</span> ${ssrInterpolate(asAsset(showItemDetail.value).assetType)}</div>`);
							if (asAsset(showItemDetail.value).description) _push(`<div class="popup-row" data-v-5d3def61><span data-v-5d3def61>Desc:</span> ${ssrInterpolate(asAsset(showItemDetail.value).description)}</div>`);
							else _push(`<!---->`);
							_push(`<!--]-->`);
						} else if (showItemDetail.value.type === "post") {
							_push(`<!--[--><div class="popup-row" data-v-5d3def61><span data-v-5d3def61>Priority:</span><span class="${ssrRenderClass(`text-${getPriorityClass(asPost(showItemDetail.value).priority)}`)}" data-v-5d3def61>${ssrInterpolate(asPost(showItemDetail.value).priority)}</span></div><div class="popup-row" data-v-5d3def61><span data-v-5d3def61>Status:</span>`);
							_push(ssrRenderComponent(_component_Badge, {
								type: "status",
								value: asPost(showItemDetail.value).active ? "active" : "inactive"
							}, null, _parent));
							_push(`</div><!--]-->`);
						} else _push(`<!--[--><div class="popup-row" data-v-5d3def61><span data-v-5d3def61>Type:</span><span data-v-5d3def61>${ssrInterpolate(showItemDetail.value.type === "entry_exit" ? unref(t)("map.entry_exit") : unref(t)("map.zone"))}</span></div><div class="popup-row" data-v-5d3def61><span data-v-5d3def61>Name:</span> ${ssrInterpolate(asInfo(showItemDetail.value).name)}</div><!--]-->`);
						_push(`</div><div class="popup-actions" data-v-5d3def61><button class="popup-btn popup-btn--edit" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:eye",
							size: 12
						}, null, _parent));
						_push(` ${ssrInterpolate(unref(t)("common.view"))}</button><button class="popup-btn popup-btn--delete" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:trash-2",
							size: 12
						}, null, _parent));
						_push(` ${ssrInterpolate(unref(t)("common.delete"))}</button></div></div>`);
					} else _push(`<!---->`);
					if (activeShape.value) {
						_push(`<div class="map-hint" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:mouse-pointer-click",
							size: 14
						}, null, _parent));
						_push(` ${ssrInterpolate(isBatchMode.value ? unref(t)("map.hint_batch") : unref(t)("map.hint_single"))}</div>`);
					} else _push(`<!---->`);
					_push(`<!--]-->`);
				}
				_push(`</div>`);
				if (hasMap.value) {
					_push(`<div class="map-legend" data-v-5d3def61><span class="legend-title" data-v-5d3def61>${ssrInterpolate(unref(t)("map.legend"))}:</span><span class="legend-item legend-item--asset" data-v-5d3def61>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:box",
						size: 12
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("map.assets"))} (${ssrInterpolate(assets.value.length)})</span><span class="legend-item legend-item--post" data-v-5d3def61>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:map-pin",
						size: 12
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("map.posts"))} (${ssrInterpolate(posts.value.length)})</span><span class="legend-item legend-item--entry" data-v-5d3def61>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:door-open",
						size: 12
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("map.entry_exit"))} (${ssrInterpolate(mapItems.value.filter((i) => i.type === "entry_exit").length)})</span><span class="legend-item legend-item--zone" data-v-5d3def61>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:shield-alert",
						size: 12
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("map.zone"))} (${ssrInterpolate(mapItems.value.filter((i) => i.type === "zone").length)})</span><span class="legend-muted" data-v-5d3def61>${ssrInterpolate(unref(t)("map.total_items", { count: String(mapItems.value.length) }))}</span></div>`);
				} else _push(`<!---->`);
				_push(`</div>`);
			} else {
				_push(`<div class="list-view" data-v-5d3def61><div class="list-tabs" data-v-5d3def61><button class="${ssrRenderClass(["tab-btn", { active: listTab.value === "assets" }])}" data-v-5d3def61>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:box",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("map.assets"))} (${ssrInterpolate(assets.value.length)}) </button><button class="${ssrRenderClass(["tab-btn", { active: listTab.value === "posts" }])}" data-v-5d3def61>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:map-pin",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("map.posts"))} (${ssrInterpolate(posts.value.length)}) </button></div>`);
				if (listTab.value === "assets") {
					_push(`<div class="list-panel" data-v-5d3def61><div class="list-controls" data-v-5d3def61><div class="search-box" data-v-5d3def61>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:search",
						size: 14
					}, null, _parent));
					_push(`<input${ssrRenderAttr("value", assetSearchQuery.value)} type="text"${ssrRenderAttr("placeholder", unref(t)("map.search_assets"))} data-v-5d3def61></div>`);
					_push(ssrRenderComponent(_component_AppButton, {
						text: unref(t)("map.add_asset"),
						type: "primary",
						icon: "lucide:plus",
						onClick: ($event) => showAddAssetModal.value = true
					}, null, _parent));
					_push(`</div><table class="data-table" data-v-5d3def61><thead data-v-5d3def61><tr data-v-5d3def61><th data-v-5d3def61>${ssrInterpolate(unref(t)("map.asset_id"))}</th><th data-v-5d3def61>${ssrInterpolate(unref(t)("map.asset_type"))}</th><th data-v-5d3def61>${ssrInterpolate(unref(t)("map.installation_date"))}</th><th data-v-5d3def61>${ssrInterpolate(unref(t)("map.replacement_date"))}</th><th data-v-5d3def61>${ssrInterpolate(unref(t)("map.description"))}</th><th data-v-5d3def61>${ssrInterpolate(unref(t)("residents.actions"))}</th></tr></thead><tbody data-v-5d3def61><!--[-->`);
					ssrRenderList(filteredAssets.value, (asset) => {
						_push(`<tr data-v-5d3def61><td class="id-cell" data-v-5d3def61>${ssrInterpolate(asset.id)}</td><td data-v-5d3def61><span class="type-badge" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: getMarkerIcon(asset),
							size: 12
						}, null, _parent));
						_push(` ${ssrInterpolate(asset.assetType)}</span></td><td class="text-muted" data-v-5d3def61>${ssrInterpolate(asset.installationDate || "—")}</td><td class="text-muted" data-v-5d3def61>${ssrInterpolate(asset.replacementDate || "—")}</td><td class="text-muted desc-cell" data-v-5d3def61>${ssrInterpolate(asset.description || "—")}</td><td data-v-5d3def61><div class="action-group" data-v-5d3def61><button class="action-btn action-btn--icon" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:eye",
							size: 14
						}, null, _parent));
						_push(`</button><button class="action-btn action-btn--icon" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:pencil",
							size: 14
						}, null, _parent));
						_push(`</button><button class="action-btn action-btn--icon action-btn--danger" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:trash-2",
							size: 14
						}, null, _parent));
						_push(`</button></div></td></tr>`);
					});
					_push(`<!--]-->`);
					if (!filteredAssets.value.length) _push(`<tr data-v-5d3def61><td colspan="6" class="empty-row" data-v-5d3def61>${ssrInterpolate(unref(t)("map.no_assets"))}</td></tr>`);
					else _push(`<!---->`);
					_push(`</tbody></table></div>`);
				} else _push(`<!---->`);
				if (listTab.value === "posts") {
					_push(`<div class="list-panel" data-v-5d3def61><div class="list-controls" data-v-5d3def61><div class="search-box" data-v-5d3def61>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:search",
						size: 14
					}, null, _parent));
					_push(`<input${ssrRenderAttr("value", postSearchQuery.value)} type="text"${ssrRenderAttr("placeholder", unref(t)("map.search_posts"))} data-v-5d3def61></div><div class="filter-group" data-v-5d3def61><button class="${ssrRenderClass(["filter-btn", { active: postFilterActive.value === "active" }])}" data-v-5d3def61>${ssrInterpolate(unref(t)("common.active"))}</button><button class="${ssrRenderClass(["filter-btn", { active: postFilterActive.value === "inactive" }])}" data-v-5d3def61>${ssrInterpolate(unref(t)("common.inactive"))}</button><button class="${ssrRenderClass(["filter-btn", { active: postFilterActive.value === "all" }])}" data-v-5d3def61>${ssrInterpolate(unref(t)("map.all"))}</button></div>`);
					_push(ssrRenderComponent(_component_AppButton, {
						text: unref(t)("map.add_post"),
						type: "primary",
						icon: "lucide:plus",
						onClick: ($event) => showAddPostModal.value = true
					}, null, _parent));
					_push(`</div><table class="data-table" data-v-5d3def61><thead data-v-5d3def61><tr data-v-5d3def61><th data-v-5d3def61>${ssrInterpolate(unref(t)("map.post_id"))}</th><th data-v-5d3def61>${ssrInterpolate(unref(t)("map.post_name"))}</th><th data-v-5d3def61>${ssrInterpolate(unref(t)("map.priority"))}</th><th data-v-5d3def61>${ssrInterpolate(unref(t)("map.equipment"))}</th><th data-v-5d3def61>${ssrInterpolate(unref(t)("map.active"))}</th><th data-v-5d3def61>${ssrInterpolate(unref(t)("residents.actions"))}</th></tr></thead><tbody data-v-5d3def61><!--[-->`);
					ssrRenderList(filteredPosts.value, (post) => {
						_push(`<tr data-v-5d3def61><td class="id-cell" data-v-5d3def61>${ssrInterpolate(post.id)}</td><td class="name-cell" data-v-5d3def61>${ssrInterpolate(post.name)}</td><td data-v-5d3def61><span class="${ssrRenderClass(`priority-badge priority-badge--${getPriorityClass(post.priority)}`)}" data-v-5d3def61>${ssrInterpolate(post.priority)}</span></td><td class="text-muted" data-v-5d3def61>${ssrInterpolate(post.equipment || "—")}</td><td data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Badge, {
							type: "status",
							value: post.active ? "active" : "inactive"
						}, null, _parent));
						_push(`</td><td data-v-5d3def61><div class="action-group" data-v-5d3def61><button class="action-btn action-btn--icon" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:eye",
							size: 14
						}, null, _parent));
						_push(`</button><button class="action-btn action-btn--icon" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:pencil",
							size: 14
						}, null, _parent));
						_push(`</button><button class="action-btn action-btn--icon action-btn--danger" data-v-5d3def61>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:trash-2",
							size: 14
						}, null, _parent));
						_push(`</button></div></td></tr>`);
					});
					_push(`<!--]-->`);
					if (!filteredPosts.value.length) _push(`<tr data-v-5d3def61><td colspan="6" class="empty-row" data-v-5d3def61>${ssrInterpolate(unref(t)("map.no_posts"))}</td></tr>`);
					else _push(`<!---->`);
					_push(`</tbody></table></div>`);
				} else _push(`<!---->`);
				_push(`</div>`);
			}
			_push(ssrRenderComponent(_component_AppModal, {
				show: showTypeSelect.value,
				title: unref(t)("map.select_item_type"),
				"cancel-text": unref(t)("common.cancel"),
				onClose: ($event) => {
					showTypeSelect.value = false;
					pendingLocation.value = null;
				},
				onCancel: ($event) => {
					showTypeSelect.value = false;
					pendingLocation.value = null;
				}
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="type-select" data-v-5d3def61${_scopeId}><button class="type-select__btn" data-v-5d3def61${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:box",
							size: 28,
							class: "type-select__icon type-select__icon--asset"
						}, null, _parent, _scopeId));
						_push(`<span class="type-select__label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.asset"))}</span><span class="type-select__hint" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.asset_hint"))}</span></button><button class="type-select__btn" data-v-5d3def61${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:map-pin",
							size: 28,
							class: "type-select__icon type-select__icon--post"
						}, null, _parent, _scopeId));
						_push(`<span class="type-select__label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.post"))}</span><span class="type-select__hint" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.post_hint"))}</span></button><button class="type-select__btn" data-v-5d3def61${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:door-open",
							size: 28,
							class: "type-select__icon type-select__icon--entry"
						}, null, _parent, _scopeId));
						_push(`<span class="type-select__label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.entry_exit"))}</span><span class="type-select__hint" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.entry_exit_hint"))}</span></button><button class="type-select__btn" data-v-5d3def61${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:shield-alert",
							size: 28,
							class: "type-select__icon type-select__icon--zone"
						}, null, _parent, _scopeId));
						_push(`<span class="type-select__label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.zone"))}</span><span class="type-select__hint" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.zone_hint"))}</span></button></div>`);
					} else return [createVNode("div", { class: "type-select" }, [
						createVNode("button", {
							class: "type-select__btn",
							onClick: ($event) => selectItemType("asset")
						}, [
							createVNode(_component_Icon, {
								name: "lucide:box",
								size: 28,
								class: "type-select__icon type-select__icon--asset"
							}),
							createVNode("span", { class: "type-select__label" }, toDisplayString(unref(t)("map.asset")), 1),
							createVNode("span", { class: "type-select__hint" }, toDisplayString(unref(t)("map.asset_hint")), 1)
						], 8, ["onClick"]),
						createVNode("button", {
							class: "type-select__btn",
							onClick: ($event) => selectItemType("post")
						}, [
							createVNode(_component_Icon, {
								name: "lucide:map-pin",
								size: 28,
								class: "type-select__icon type-select__icon--post"
							}),
							createVNode("span", { class: "type-select__label" }, toDisplayString(unref(t)("map.post")), 1),
							createVNode("span", { class: "type-select__hint" }, toDisplayString(unref(t)("map.post_hint")), 1)
						], 8, ["onClick"]),
						createVNode("button", {
							class: "type-select__btn",
							onClick: ($event) => selectItemType("entry_exit")
						}, [
							createVNode(_component_Icon, {
								name: "lucide:door-open",
								size: 28,
								class: "type-select__icon type-select__icon--entry"
							}),
							createVNode("span", { class: "type-select__label" }, toDisplayString(unref(t)("map.entry_exit")), 1),
							createVNode("span", { class: "type-select__hint" }, toDisplayString(unref(t)("map.entry_exit_hint")), 1)
						], 8, ["onClick"]),
						createVNode("button", {
							class: "type-select__btn",
							onClick: ($event) => selectItemType("zone")
						}, [
							createVNode(_component_Icon, {
								name: "lucide:shield-alert",
								size: 28,
								class: "type-select__icon type-select__icon--zone"
							}),
							createVNode("span", { class: "type-select__label" }, toDisplayString(unref(t)("map.zone")), 1),
							createVNode("span", { class: "type-select__hint" }, toDisplayString(unref(t)("map.zone_hint")), 1)
						], 8, ["onClick"])
					])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: showAddInfoModal.value,
				title: infoModalType.value === "entry_exit" ? unref(t)("map.add_entry_exit_title") : unref(t)("map.add_zone_title"),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(t)("common.save"),
				onClose: ($event) => {
					showAddInfoModal.value = false;
					pendingLocation.value = null;
				},
				onCancel: ($event) => {
					showAddInfoModal.value = false;
					pendingLocation.value = null;
				},
				onOk: handleAddInfo
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="info-modal-form" data-v-5d3def61${_scopeId}><div class="${ssrRenderClass([{ error: infoModalError.value }, "form-field"])}" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(infoModalType.value === "entry_exit" ? unref(t)("map.entry_exit_name") : unref(t)("map.zone_name"))} <span class="required" data-v-5d3def61${_scopeId}>*</span></label><input${ssrRenderAttr("value", infoModalForm.name)} type="text" class="field-input"${ssrRenderAttr("placeholder", infoModalType.value === "entry_exit" ? unref(t)("map.entry_exit_placeholder") : unref(t)("map.zone_placeholder"))} data-v-5d3def61${_scopeId}>`);
						if (infoModalError.value) _push(`<span class="error-message" data-v-5d3def61${_scopeId}>${ssrInterpolate(infoModalError.value)}</span>`);
						else _push(`<!---->`);
						_push(`</div><div class="form-field form-field--readonly" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.location"))}</label><div class="readonly-value location-value" data-v-5d3def61${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:map-pin",
							size: 14
						}, null, _parent, _scopeId));
						if (pendingLocation.value) _push(`<span data-v-5d3def61${_scopeId}>x: ${ssrInterpolate(pendingLocation.value.x)}, y: ${ssrInterpolate(pendingLocation.value.y)}</span>`);
						else _push(`<span class="muted" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.location_auto"))}</span>`);
						_push(`</div></div></div>`);
					} else return [createVNode("div", { class: "info-modal-form" }, [createVNode("div", { class: ["form-field", { error: infoModalError.value }] }, [
						createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(infoModalType.value === "entry_exit" ? unref(t)("map.entry_exit_name") : unref(t)("map.zone_name")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
						withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => infoModalForm.name = $event,
							type: "text",
							class: "field-input",
							placeholder: infoModalType.value === "entry_exit" ? unref(t)("map.entry_exit_placeholder") : unref(t)("map.zone_placeholder")
						}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, infoModalForm.name]]),
						infoModalError.value ? (openBlock(), createBlock("span", {
							key: 0,
							class: "error-message"
						}, toDisplayString(infoModalError.value), 1)) : createCommentVNode("", true)
					], 2), createVNode("div", { class: "form-field form-field--readonly" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("map.location")), 1), createVNode("div", { class: "readonly-value location-value" }, [createVNode(_component_Icon, {
						name: "lucide:map-pin",
						size: 14
					}), pendingLocation.value ? (openBlock(), createBlock("span", { key: 0 }, "x: " + toDisplayString(pendingLocation.value.x) + ", y: " + toDisplayString(pendingLocation.value.y), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "muted"
					}, toDisplayString(unref(t)("map.location_auto")), 1))])])])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_MapAddAssetModal, {
				show: showAddAssetModal.value,
				location: pendingLocation.value,
				onClose: ($event) => {
					showAddAssetModal.value = false;
					pendingLocation.value = null;
				},
				onSave: handleAddAsset
			}, null, _parent));
			_push(ssrRenderComponent(_component_MapAddPostModal, {
				show: showAddPostModal.value,
				location: pendingLocation.value,
				onClose: ($event) => {
					showAddPostModal.value = false;
					pendingLocation.value = null;
				},
				onSave: handleAddPost
			}, null, _parent));
			if (viewItem.value) _push(ssrRenderComponent(_component_AppModal, {
				show: showViewModal.value,
				title: getItemName(viewItem.value),
				"cancel-text": unref(t)("common.close"),
				"ok-text": "",
				onClose: ($event) => {
					showViewModal.value = false;
					viewItem.value = null;
				},
				onCancel: ($event) => {
					showViewModal.value = false;
					viewItem.value = null;
				}
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="detail-modal" data-v-5d3def61${_scopeId}>`);
						if (viewItem.value.type === "asset") {
							_push(`<!--[--><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.asset_id"))}</span><span class="detail-value mono" data-v-5d3def61${_scopeId}>${ssrInterpolate(viewItem.value.id)}</span></div><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.asset_type"))}</span><span class="detail-value" data-v-5d3def61${_scopeId}><span class="type-badge" data-v-5d3def61${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: getMarkerIcon(viewItem.value),
								size: 12
							}, null, _parent, _scopeId));
							_push(` ${ssrInterpolate(asAsset(viewItem.value).assetType)}</span></span></div><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.installation_date"))}</span><span class="detail-value" data-v-5d3def61${_scopeId}>${ssrInterpolate(asAsset(viewItem.value).installationDate || "—")}</span></div><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.replacement_date"))}</span><span class="detail-value" data-v-5d3def61${_scopeId}>${ssrInterpolate(asAsset(viewItem.value).replacementDate || "—")}</span></div><div class="detail-row detail-row--full" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.description"))}</span><span class="detail-value" data-v-5d3def61${_scopeId}>${ssrInterpolate(asAsset(viewItem.value).description || "—")}</span></div><!--]-->`);
						} else if (viewItem.value.type === "post") {
							_push(`<!--[--><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.post_id"))}</span><span class="detail-value mono" data-v-5d3def61${_scopeId}>${ssrInterpolate(viewItem.value.id)}</span></div><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.post_name"))}</span><span class="detail-value" data-v-5d3def61${_scopeId}>${ssrInterpolate(asPost(viewItem.value).name)}</span></div><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.priority"))}</span><span class="${ssrRenderClass(`detail-value priority-badge priority-badge--${getPriorityClass(asPost(viewItem.value).priority)}`)}" data-v-5d3def61${_scopeId}>${ssrInterpolate(asPost(viewItem.value).priority)}</span></div><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.active"))}</span>`);
							_push(ssrRenderComponent(_component_Badge, {
								type: "status",
								value: asPost(viewItem.value).active ? "active" : "inactive"
							}, null, _parent, _scopeId));
							_push(`</div><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.equipment"))}</span><span class="detail-value" data-v-5d3def61${_scopeId}>${ssrInterpolate(asPost(viewItem.value).equipment || "—")}</span></div><div class="detail-row detail-row--full" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.description"))}</span><span class="detail-value" data-v-5d3def61${_scopeId}>${ssrInterpolate(asPost(viewItem.value).description || "—")}</span></div><!--]-->`);
						} else _push(`<!--[--><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>ID</span><span class="detail-value mono" data-v-5d3def61${_scopeId}>${ssrInterpolate(viewItem.value.id)}</span></div><div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.post_name"))}</span><span class="detail-value" data-v-5d3def61${_scopeId}>${ssrInterpolate(asInfo(viewItem.value).name)}</span></div><!--]-->`);
						_push(`<div class="detail-row" data-v-5d3def61${_scopeId}><span class="detail-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.location"))}</span><span class="detail-value mono" data-v-5d3def61${_scopeId}>x: ${ssrInterpolate(viewItem.value.location.x)}, y: ${ssrInterpolate(viewItem.value.location.y)}</span></div>`);
						if (viewItem.value.type === "asset" || viewItem.value.type === "post") {
							_push(`<div class="detail-danger-zone" data-v-5d3def61${_scopeId}><button class="btn-danger-outline" data-v-5d3def61${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:trash-2",
								size: 14
							}, null, _parent, _scopeId));
							_push(` ${ssrInterpolate(unref(t)("common.delete"))}</button></div>`);
						} else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "detail-modal" }, [
						viewItem.value.type === "asset" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.asset_id")), 1), createVNode("span", { class: "detail-value mono" }, toDisplayString(viewItem.value.id), 1)]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.asset_type")), 1), createVNode("span", { class: "detail-value" }, [createVNode("span", { class: "type-badge" }, [createVNode(_component_Icon, {
								name: getMarkerIcon(viewItem.value),
								size: 12
							}, null, 8, ["name"]), createTextVNode(" " + toDisplayString(asAsset(viewItem.value).assetType), 1)])])]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.installation_date")), 1), createVNode("span", { class: "detail-value" }, toDisplayString(asAsset(viewItem.value).installationDate || "—"), 1)]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.replacement_date")), 1), createVNode("span", { class: "detail-value" }, toDisplayString(asAsset(viewItem.value).replacementDate || "—"), 1)]),
							createVNode("div", { class: "detail-row detail-row--full" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.description")), 1), createVNode("span", { class: "detail-value" }, toDisplayString(asAsset(viewItem.value).description || "—"), 1)])
						], 64)) : viewItem.value.type === "post" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.post_id")), 1), createVNode("span", { class: "detail-value mono" }, toDisplayString(viewItem.value.id), 1)]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.post_name")), 1), createVNode("span", { class: "detail-value" }, toDisplayString(asPost(viewItem.value).name), 1)]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.priority")), 1), createVNode("span", { class: `detail-value priority-badge priority-badge--${getPriorityClass(asPost(viewItem.value).priority)}` }, toDisplayString(asPost(viewItem.value).priority), 3)]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.active")), 1), createVNode(_component_Badge, {
								type: "status",
								value: asPost(viewItem.value).active ? "active" : "inactive"
							}, null, 8, ["value"])]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.equipment")), 1), createVNode("span", { class: "detail-value" }, toDisplayString(asPost(viewItem.value).equipment || "—"), 1)]),
							createVNode("div", { class: "detail-row detail-row--full" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.description")), 1), createVNode("span", { class: "detail-value" }, toDisplayString(asPost(viewItem.value).description || "—"), 1)])
						], 64)) : (openBlock(), createBlock(Fragment, { key: 2 }, [createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, "ID"), createVNode("span", { class: "detail-value mono" }, toDisplayString(viewItem.value.id), 1)]), createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.post_name")), 1), createVNode("span", { class: "detail-value" }, toDisplayString(asInfo(viewItem.value).name), 1)])], 64)),
						createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("map.location")), 1), createVNode("span", { class: "detail-value mono" }, "x: " + toDisplayString(viewItem.value.location.x) + ", y: " + toDisplayString(viewItem.value.location.y), 1)]),
						viewItem.value.type === "asset" || viewItem.value.type === "post" ? (openBlock(), createBlock("div", {
							key: 3,
							class: "detail-danger-zone"
						}, [createVNode("button", {
							class: "btn-danger-outline",
							onClick: openDeleteFromView
						}, [createVNode(_component_Icon, {
							name: "lucide:trash-2",
							size: 14
						}), createTextVNode(" " + toDisplayString(unref(t)("common.delete")), 1)])])) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
			if (viewItem.value) _push(ssrRenderComponent(_component_AppModal, {
				show: showEditModal.value,
				title: viewItem.value.type === "asset" ? unref(t)("map.edit_asset_title") : unref(t)("map.edit_post_title"),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(t)("common.save"),
				onClose: ($event) => showEditModal.value = false,
				onCancel: ($event) => showEditModal.value = false,
				onOk: handleSaveEdit
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="edit-modal-form" data-v-5d3def61${_scopeId}>`);
						if (viewItem.value.type === "asset") {
							_push(`<!--[--><div class="${ssrRenderClass([{ error: editErrors.type }, "form-field"])}" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.asset_type"))} <span class="required" data-v-5d3def61${_scopeId}>*</span></label><select class="field-select" data-v-5d3def61${_scopeId}><option value="" disabled data-v-5d3def61${ssrIncludeBooleanAttr(Array.isArray(editAssetForm.type) ? ssrLooseContain(editAssetForm.type, "") : ssrLooseEqual(editAssetForm.type, "")) ? " selected" : ""}${_scopeId}>${ssrInterpolate(unref(t)("map.select_type"))}</option><!--[-->`);
							ssrRenderList(ASSET_TYPES, (tp) => {
								_push(`<option${ssrRenderAttr("value", tp)} data-v-5d3def61${ssrIncludeBooleanAttr(Array.isArray(editAssetForm.type) ? ssrLooseContain(editAssetForm.type, tp) : ssrLooseEqual(editAssetForm.type, tp)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(tp)}</option>`);
							});
							_push(`<!--]--></select>`);
							if (editErrors.type) _push(`<span class="error-message" data-v-5d3def61${_scopeId}>${ssrInterpolate(editErrors.type)}</span>`);
							else _push(`<!---->`);
							_push(`</div><div class="form-row-2col" data-v-5d3def61${_scopeId}><div class="form-field" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.installation_date"))}</label><input${ssrRenderAttr("value", editAssetForm.installationDate)} type="date" class="field-input" data-v-5d3def61${_scopeId}></div><div class="form-field" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.replacement_date"))}</label><input${ssrRenderAttr("value", editAssetForm.replacementDate)} type="date" class="field-input" data-v-5d3def61${_scopeId}></div></div><div class="form-field" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.description"))}</label><textarea class="field-textarea" rows="3" data-v-5d3def61${_scopeId}>${ssrInterpolate(editAssetForm.description)}</textarea></div><!--]-->`);
						} else if (viewItem.value.type === "post") {
							_push(`<!--[--><div class="${ssrRenderClass([{ error: editErrors.name }, "form-field"])}" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.post_name"))} <span class="required" data-v-5d3def61${_scopeId}>*</span></label><input${ssrRenderAttr("value", editPostForm.name)} type="text" class="field-input" maxlength="60" data-v-5d3def61${_scopeId}>`);
							if (editErrors.name) _push(`<span class="error-message" data-v-5d3def61${_scopeId}>${ssrInterpolate(editErrors.name)}</span>`);
							else _push(`<!---->`);
							_push(`</div><div class="form-row-2col" data-v-5d3def61${_scopeId}><div class="form-field" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.priority"))}</label><select class="field-select" data-v-5d3def61${_scopeId}><!--[-->`);
							ssrRenderList(PRIORITIES, (p) => {
								_push(`<option${ssrRenderAttr("value", p)} data-v-5d3def61${ssrIncludeBooleanAttr(Array.isArray(editPostForm.priority) ? ssrLooseContain(editPostForm.priority, p) : ssrLooseEqual(editPostForm.priority, p)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(p)}</option>`);
							});
							_push(`<!--]--></select></div><div class="form-field" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.active"))}</label><label class="toggle-label" data-v-5d3def61${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(editPostForm.active) ? ssrLooseContain(editPostForm.active, null) : editPostForm.active) ? " checked" : ""} type="checkbox" data-v-5d3def61${_scopeId}><span data-v-5d3def61${_scopeId}>${ssrInterpolate(editPostForm.active ? unref(t)("common.active") : unref(t)("common.inactive"))}</span></label></div></div><div class="form-field" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.equipment"))}</label><input${ssrRenderAttr("value", editPostForm.equipment)} type="text" class="field-input" data-v-5d3def61${_scopeId}></div><div class="form-field" data-v-5d3def61${_scopeId}><label class="field-label" data-v-5d3def61${_scopeId}>${ssrInterpolate(unref(t)("map.description"))}</label><textarea class="field-textarea" rows="3" data-v-5d3def61${_scopeId}>${ssrInterpolate(editPostForm.description)}</textarea></div><!--]-->`);
						} else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "edit-modal-form" }, [viewItem.value.type === "asset" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
						createVNode("div", { class: ["form-field", { error: editErrors.type }] }, [
							createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(unref(t)("map.asset_type")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							withDirectives(createVNode("select", {
								"onUpdate:modelValue": ($event) => editAssetForm.type = $event,
								class: "field-select"
							}, [createVNode("option", {
								value: "",
								disabled: ""
							}, toDisplayString(unref(t)("map.select_type")), 1), (openBlock(), createBlock(Fragment, null, renderList(ASSET_TYPES, (tp) => {
								return createVNode("option", {
									key: tp,
									value: tp
								}, toDisplayString(tp), 9, ["value"]);
							}), 64))], 8, ["onUpdate:modelValue"]), [[vModelSelect, editAssetForm.type]]),
							editErrors.type ? (openBlock(), createBlock("span", {
								key: 0,
								class: "error-message"
							}, toDisplayString(editErrors.type), 1)) : createCommentVNode("", true)
						], 2),
						createVNode("div", { class: "form-row-2col" }, [createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("map.installation_date")), 1), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => editAssetForm.installationDate = $event,
							type: "date",
							class: "field-input"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, editAssetForm.installationDate]])]), createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("map.replacement_date")), 1), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => editAssetForm.replacementDate = $event,
							type: "date",
							class: "field-input"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, editAssetForm.replacementDate]])])]),
						createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("map.description")), 1), withDirectives(createVNode("textarea", {
							"onUpdate:modelValue": ($event) => editAssetForm.description = $event,
							class: "field-textarea",
							rows: "3"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, editAssetForm.description]])])
					], 64)) : viewItem.value.type === "post" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
						createVNode("div", { class: ["form-field", { error: editErrors.name }] }, [
							createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(unref(t)("map.post_name")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => editPostForm.name = $event,
								type: "text",
								class: "field-input",
								maxlength: "60"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, editPostForm.name]]),
							editErrors.name ? (openBlock(), createBlock("span", {
								key: 0,
								class: "error-message"
							}, toDisplayString(editErrors.name), 1)) : createCommentVNode("", true)
						], 2),
						createVNode("div", { class: "form-row-2col" }, [createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("map.priority")), 1), withDirectives(createVNode("select", {
							"onUpdate:modelValue": ($event) => editPostForm.priority = $event,
							class: "field-select"
						}, [(openBlock(), createBlock(Fragment, null, renderList(PRIORITIES, (p) => {
							return createVNode("option", {
								key: p,
								value: p
							}, toDisplayString(p), 9, ["value"]);
						}), 64))], 8, ["onUpdate:modelValue"]), [[vModelSelect, editPostForm.priority]])]), createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("map.active")), 1), createVNode("label", { class: "toggle-label" }, [withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => editPostForm.active = $event,
							type: "checkbox"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, editPostForm.active]]), createVNode("span", null, toDisplayString(editPostForm.active ? unref(t)("common.active") : unref(t)("common.inactive")), 1)])])]),
						createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("map.equipment")), 1), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => editPostForm.equipment = $event,
							type: "text",
							class: "field-input"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, editPostForm.equipment]])]),
						createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("map.description")), 1), withDirectives(createVNode("textarea", {
							"onUpdate:modelValue": ($event) => editPostForm.description = $event,
							class: "field-textarea",
							rows: "3"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, editPostForm.description]])])
					], 64)) : createCommentVNode("", true)])];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
			_push(ssrRenderComponent(_component_AppModal, {
				show: showDeleteModal.value,
				title: unref(t)("map.delete_item_title"),
				message: unref(t)("map.delete_item_message", { name: itemToDelete.value ? getItemName(itemToDelete.value) : "" }),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(t)("common.delete"),
				onClose: ($event) => showDeleteModal.value = false,
				onCancel: ($event) => showDeleteModal.value = false,
				onOk: handleDeleteItem
			}, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/map/MapManagement.vue
var _sfc_setup$1 = MapManagement_vue_vue_type_script_setup_true_lang_default.setup;
MapManagement_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/map/MapManagement.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var MapManagement_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(MapManagement_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-5d3def61"]]), { __name: "MapManagement" });
//#endregion
//#region app/pages/communities/[id]/map.vue?vue&type=script&setup=true&lang.ts
var map_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "map",
	__ssrInlineRender: true,
	setup(__props) {
		const communityId = useRoute().params.id;
		const communityName = ref("Sunset Heights");
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_MapManagement = MapManagement_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: "2D Map",
				breadcrumb: [
					{ label: "Manage" },
					{
						label: "Communities",
						to: "/communities"
					},
					{
						label: communityName.value,
						to: `/communities/edit/${unref(communityId)}`
					},
					{ label: "2D Map" }
				],
				"show-search": false
			}, null, _parent));
			_push(`<div class="map-page" data-v-0d1e3f06>`);
			_push(ssrRenderComponent(_component_MapManagement, {
				"community-id": unref(communityId),
				"community-name": communityName.value
			}, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/communities/[id]/map.vue
var _sfc_setup = map_vue_vue_type_script_setup_true_lang_default.setup;
map_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/communities/[id]/map.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var map_default = /*#__PURE__*/ _plugin_vue_export_helper_default(map_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0d1e3f06"]]);

export { map_default as default };
//# sourceMappingURL=map-Bw20ZP4p.mjs.map
