import { t as components_default } from './components-DWHbB934.mjs';
import { B as BaseApiClient, a as useTranslation, u as useRoute, b as useRouter, c as useToastStore, A as ApiError } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { u as useFileApi } from './useFileApi-CLWuZDlq.mjs';
import { A as AppButton_default } from './AppButton-sr0dx6mm.mjs';
import { I as ImageUpload_default } from './ImageUpload-CRnliurs.mjs';
import { A as AppDialogModal_default } from './AppDialogModal-CYp4oRY_.mjs';
import { a as adminUserApi } from './adminUser-BkDnDana.mjs';
import { defineComponent, ref, unref, computed, mergeProps, withCtx, createVNode, toDisplayString, withDirectives, withKeys, isRef, vModelText, openBlock, createBlock, createCommentVNode, watch, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderStyle, ssrLooseContain, ssrLooseEqual, ssrRenderDynamicModel } from 'vue/server-renderer';
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

//#region app/api/settings.ts
var SettingsApi = class extends BaseApiClient {
	/**
	* Get service/incident types
	* @returns List of service and incident types
	*/
	async getServiceTypes() {
		return this.request({ "#request": "Settings/get_service_types" });
	}
	/**
	* Get task/maintenance report types
	* @returns List of task/maintenance types
	*/
	async getTaskTypes() {
		return this.request({ "#request": "Settings/get_task_types" });
	}
	/**
	* Add a new service type
	* @param name - The name of the service type
	* @returns Response with the new type_id
	*/
	async addServiceType(name) {
		const request = {
			"#request": "Settings/add_service_type",
			name: name.trim()
		};
		return this.request(request);
	}
	/**
	* Add a new task type
	* @param name - The name of the task type
	* @returns Response with the new type_id
	*/
	async addTaskType(name) {
		const request = {
			"#request": "Settings/add_task_type",
			name: name.trim()
		};
		return this.request(request);
	}
	/**
	* Update a service type
	* @param typeId - The ID of the service type to update
	* @param name - The new name for the service type
	* @returns Response with success status
	*/
	async updateServiceType(typeId, name) {
		const request = {
			"#request": "Settings/update_service_type",
			type_id: typeId,
			name: name.trim()
		};
		return this.request(request);
	}
	/**
	* Update a task type
	* @param typeId - The ID of the task type to update
	* @param name - The new name for the task type
	* @returns Response with success status
	*/
	async updateTaskType(typeId, name) {
		const request = {
			"#request": "Settings/update_task_type",
			type_id: typeId,
			name: name.trim()
		};
		return this.request(request);
	}
	/**
	* Delete a service type
	* @param typeId - The ID of the service type to delete
	* @returns Response with success status
	*/
	async deleteServiceType(typeId) {
		const request = {
			"#request": "Settings/delete_service_type",
			type_id: typeId
		};
		return this.request(request);
	}
	/**
	* Delete a task type
	* @param typeId - The ID of the task type to delete
	* @returns Response with success status
	*/
	async deleteTaskType(typeId) {
		const request = {
			"#request": "Settings/delete_task_type",
			type_id: typeId
		};
		return this.request(request);
	}
	/**
	* Get asset types
	* @returns List of asset types
	*/
	async getAssetTypes() {
		return this.request({ "#request": "Settings/get_asset_types" });
	}
	/**
	* Add a new asset type
	* @param name - The name of the asset type
	* @param icon - The icon file ID for the asset type
	* @param color - The display color for the asset type (hex code, e.g. "#FF5733")
	* @returns Response with the new type_id
	*/
	async addAssetType(name, icon, color) {
		const request = {
			"#request": "Settings/add_asset_type",
			name: name.trim(),
			icon,
			color
		};
		return this.request(request);
	}
	/**
	* Update an asset type
	* @param typeId - The ID of the asset type to update
	* @param name - The new name for the asset type
	* @param icon - The updated icon file ID for the asset type
	* @param color - The updated display color for the asset type (hex code, e.g. "#FF5733")
	* @returns Response with success status
	*/
	async updateAssetType(typeId, name, icon, color) {
		const request = {
			"#request": "Settings/update_asset_type",
			type_id: typeId,
			name: name.trim(),
			icon,
			color
		};
		return this.request(request);
	}
	/**
	* Delete an asset type
	* @param typeId - The ID of the asset type to delete
	* @returns Response with success status
	*/
	async deleteAssetType(typeId) {
		const request = {
			"#request": "Settings/delete_asset_type",
			type_id: typeId
		};
		return this.request(request);
	}
	/**
	* Get post order section types
	* @returns List of post order section types
	*/
	async getPostOrderSectionTypes() {
		return this.request({ "#request": "Settings/get_po_section_types" });
	}
	/**
	* Add a new post order section type
	*/
	async addPostOrderSectionType(name, clientVisible, shortDescription, active) {
		const request = {
			"#request": "Settings/add_po_section_type",
			name: name.trim(),
			client_visible: clientVisible,
			short_description: shortDescription.trim(),
			active
		};
		return this.request(request);
	}
	/**
	* Update a post order section type
	*/
	async updatePostOrderSectionType(typeId, name, clientVisible, shortDescription, active) {
		const request = {
			"#request": "Settings/update_po_section_type",
			type_id: typeId,
			name: name.trim(),
			client_visible: clientVisible,
			short_description: shortDescription.trim(),
			active
		};
		return this.request(request);
	}
	/**
	* Delete a post order section type
	*/
	async deletePostOrderSectionType(typeId) {
		const request = {
			"#request": "Settings/delete_po_section_type",
			type_id: typeId
		};
		return this.request(request);
	}
	/**
	* Get push notification settings
	*/
	async getNotificationSettings() {
		return this.request({ "#request": "Settings/get_notification_settings" });
	}
	/**
	* Save push notification settings
	*/
	async saveNotificationSettings(settings) {
		const request = {
			"#request": "Settings/update_notification_settings",
			...settings
		};
		return this.request(request);
	}
	/**
	* Get POI & Trespass settings
	*/
	async getPoiSettings() {
		return this.request({ "#request": "Settings/get_poi_settings" });
	}
	/**
	* Update POI & Trespass settings
	*/
	async updatePoiSettings(settings) {
		const request = {
			"#request": "Settings/update_poi_settings",
			...settings
		};
		return this.request(request);
	}
	/**
	* Get GPS & tracking settings
	*/
	async getGpsSettings() {
		return this.request({ "#request": "Settings/get_gps_settings" });
	}
	/**
	* Update GPS & tracking settings
	*/
	async updateGpsSettings(settings) {
		const request = {
			"#request": "Settings/update_gps_settings",
			...settings
		};
		return this.request(request);
	}
	/**
	* Get working hours settings
	*/
	async getWorkingHoursSettings() {
		return this.request({ "#request": "Settings/get_working_hours_settings" });
	}
	/**
	* Update working hours settings
	*/
	async updateWorkingHoursSettings(max_hours_per_day) {
		const request = {
			"#request": "Settings/update_working_hours_settings",
			max_hours_per_day
		};
		return this.request(request);
	}
};
var settingsApi = new SettingsApi();

//#region app/components/settings/ServiceTypes.vue?vue&type=script&setup=true&lang.ts
var ServiceTypes_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ServiceTypes",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const serviceTypes = ref([]);
		const maintenanceTypes = ref([]);
		const loading = ref(false);
		const error = ref(null);
		const serviceSearchQuery = ref("");
		const maintenanceSearchQuery = ref("");
		const showServiceAddForm = ref(false);
		const showMaintenanceAddForm = ref(false);
		const newServiceTypeName = ref("");
		const newMaintenanceTypeName = ref("");
		const editingServiceType = ref(null);
		const editingMaintenanceType = ref(null);
		async function fetchServiceTypes() {
			try {
				loading.value = true;
				const response = await settingsApi.getServiceTypes();
				if (response.rc === 0 && response.items) serviceTypes.value = response.items.map((item) => ({
					id: item.type_id,
					name: item.name
				}));
			} catch (err) {
				error.value = "Failed to load service types";
				console.error("Error fetching service types:", err);
			} finally {
				loading.value = false;
			}
		}
		async function fetchMaintenanceTypes() {
			try {
				loading.value = true;
				const response = await settingsApi.getTaskTypes();
				if (response.rc === 0 && response.items) maintenanceTypes.value = response.items.map((item) => ({
					id: item.type_id,
					name: item.name
				}));
			} catch (err) {
				error.value = "Failed to load maintenance types";
				console.error("Error fetching task types:", err);
			} finally {
				loading.value = false;
			}
		}
		const filteredServiceTypes = computed(() => {
			if (!serviceSearchQuery.value.trim()) return serviceTypes.value;
			return serviceTypes.value.filter((item) => item.name.toLowerCase().includes(serviceSearchQuery.value.toLowerCase()));
		});
		const filteredMaintenanceTypes = computed(() => {
			if (!maintenanceSearchQuery.value.trim()) return maintenanceTypes.value;
			return maintenanceTypes.value.filter((item) => item.name.toLowerCase().includes(maintenanceSearchQuery.value.toLowerCase()));
		});
		async function handleAddServiceType() {
			if (!newServiceTypeName.value.trim()) return;
			try {
				const response = await settingsApi.addServiceType(newServiceTypeName.value.trim());
				if (response.rc === 0) {
					await fetchServiceTypes();
					newServiceTypeName.value = "";
					showServiceAddForm.value = false;
				} else alert(response.message || "Failed to add service type");
			} catch (err) {
				console.error("Error adding service type:", err);
				alert("Failed to add service type");
			}
		}
		function handleCancelServiceTypeAdd() {
			showServiceAddForm.value = false;
			newServiceTypeName.value = "";
		}
		async function handleAddMaintenanceType() {
			if (!newMaintenanceTypeName.value.trim()) return;
			try {
				const response = await settingsApi.addTaskType(newMaintenanceTypeName.value.trim());
				if (response.rc === 0) {
					await fetchMaintenanceTypes();
					newMaintenanceTypeName.value = "";
					showMaintenanceAddForm.value = false;
				} else alert(response.message || "Failed to add maintenance type");
			} catch (err) {
				console.error("Error adding maintenance type:", err);
				alert("Failed to add maintenance type");
			}
		}
		function handleCancelMaintenanceTypeAdd() {
			showMaintenanceAddForm.value = false;
			newMaintenanceTypeName.value = "";
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_AppButton = AppButton_default;
			const _component_AppDialogModal = AppDialogModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "service-types-page" }, _attrs))} data-v-744a98a3><div class="service-types-columns" data-v-744a98a3><div class="types-column" data-v-744a98a3><div class="types-column__header" data-v-744a98a3><div data-v-744a98a3><h2 class="types-column__title" data-v-744a98a3>${ssrInterpolate(unref(t)("settings.service_types.list_title"))}</h2><p class="types-column__subtitle" data-v-744a98a3>${ssrInterpolate(unref(filteredServiceTypes).length)} ${ssrInterpolate(unref(t)("settings.types.types_count"))}</p></div></div><div class="types-column__actions" data-v-744a98a3><div class="types-column__search" data-v-744a98a3>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16,
				class: "types-column__search-icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", unref(serviceSearchQuery))} type="text"${ssrRenderAttr("placeholder", unref(t)("settings.types.search_placeholder"))} class="types-column__search-input" data-v-744a98a3></div>`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("settings.types.add_new"),
				icon: "lucide:plus",
				type: "primary",
				size: "sm",
				onClick: ($event) => showServiceAddForm.value = true
			}, null, _parent));
			_push(`</div><div class="types-column__table-container" data-v-744a98a3><table class="types-column__table" data-v-744a98a3><thead data-v-744a98a3><tr data-v-744a98a3><th data-v-744a98a3>${ssrInterpolate(unref(t)("settings.types.type_name"))}</th><th class="col-actions" data-v-744a98a3>${ssrInterpolate(unref(t)("common.actions"))}</th></tr></thead><tbody data-v-744a98a3><!--[-->`);
			ssrRenderList(unref(filteredServiceTypes), (type) => {
				_push(`<tr class="types-column__row" data-v-744a98a3>`);
				if (unref(editingServiceType)?.id !== type.id) {
					_push(`<!--[--><td data-v-744a98a3><span class="type-name" data-v-744a98a3>${ssrInterpolate(type.name)}</span></td><td class="col-actions" data-v-744a98a3><div class="types-column__actions-cell" data-v-744a98a3><button class="btn-icon" data-v-744a98a3>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:pencil",
						size: 14
					}, null, _parent));
					_push(`</button><button class="btn-icon btn-icon--danger" data-v-744a98a3>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:trash-2",
						size: 14
					}, null, _parent));
					_push(`</button></div></td><!--]-->`);
				} else {
					_push(`<!--[--><td data-v-744a98a3><input${ssrRenderAttr("value", unref(editingServiceType).name)} type="text" class="input input--sm" data-v-744a98a3></td><td class="col-actions" data-v-744a98a3><div class="types-column__actions-cell" data-v-744a98a3><button class="btn-icon btn-icon--success"${ssrIncludeBooleanAttr(!unref(editingServiceType).name.trim()) ? " disabled" : ""} data-v-744a98a3>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:check",
						size: 14
					}, null, _parent));
					_push(`</button><button class="btn-icon" data-v-744a98a3>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 14
					}, null, _parent));
					_push(`</button></div></td><!--]-->`);
				}
				_push(`</tr>`);
			});
			_push(`<!--]-->`);
			if (unref(filteredServiceTypes).length === 0) {
				_push(`<tr data-v-744a98a3><td colspan="2" class="types-column__empty" data-v-744a98a3>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:inbox",
					size: 24
				}, null, _parent));
				_push(`<p data-v-744a98a3>${ssrInterpolate(unref(t)("settings.types.empty"))}</p></td></tr>`);
			} else _push(`<!---->`);
			_push(`</tbody></table></div></div><div style="${ssrRenderStyle({ "width": "var(--space-6)" })}" data-v-744a98a3></div><div class="types-column" data-v-744a98a3><div class="types-column__header" data-v-744a98a3><div data-v-744a98a3><h2 class="types-column__title" data-v-744a98a3>${ssrInterpolate(unref(t)("settings.maintenance_types.list_title"))}</h2><p class="types-column__subtitle" data-v-744a98a3>${ssrInterpolate(unref(filteredMaintenanceTypes).length)} ${ssrInterpolate(unref(t)("settings.types.types_count"))}</p></div></div><div class="types-column__actions" data-v-744a98a3><div class="types-column__search" data-v-744a98a3>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16,
				class: "types-column__search-icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", unref(maintenanceSearchQuery))} type="text"${ssrRenderAttr("placeholder", unref(t)("settings.types.search_placeholder"))} class="types-column__search-input" data-v-744a98a3></div>`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("settings.types.add_new"),
				icon: "lucide:plus",
				type: "primary",
				size: "sm",
				onClick: ($event) => showMaintenanceAddForm.value = true
			}, null, _parent));
			_push(`</div><div class="types-column__table-container" data-v-744a98a3><table class="types-column__table" data-v-744a98a3><thead data-v-744a98a3><tr data-v-744a98a3><th data-v-744a98a3>${ssrInterpolate(unref(t)("settings.types.type_name"))}</th><th class="col-actions" data-v-744a98a3>${ssrInterpolate(unref(t)("common.actions"))}</th></tr></thead><tbody data-v-744a98a3><!--[-->`);
			ssrRenderList(unref(filteredMaintenanceTypes), (type) => {
				_push(`<tr class="types-column__row" data-v-744a98a3>`);
				if (unref(editingMaintenanceType)?.id !== type.id) {
					_push(`<!--[--><td data-v-744a98a3><span class="type-name" data-v-744a98a3>${ssrInterpolate(type.name)}</span></td><td class="col-actions" data-v-744a98a3><div class="types-column__actions-cell" data-v-744a98a3><button class="btn-icon" data-v-744a98a3>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:pencil",
						size: 14
					}, null, _parent));
					_push(`</button><button class="btn-icon btn-icon--danger" data-v-744a98a3>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:trash-2",
						size: 14
					}, null, _parent));
					_push(`</button></div></td><!--]-->`);
				} else {
					_push(`<!--[--><td data-v-744a98a3><input${ssrRenderAttr("value", unref(editingMaintenanceType).name)} type="text" class="input input--sm" data-v-744a98a3></td><td class="col-actions" data-v-744a98a3><div class="types-column__actions-cell" data-v-744a98a3><button class="btn-icon btn-icon--success"${ssrIncludeBooleanAttr(!unref(editingMaintenanceType).name.trim()) ? " disabled" : ""} data-v-744a98a3>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:check",
						size: 14
					}, null, _parent));
					_push(`</button><button class="btn-icon" data-v-744a98a3>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 14
					}, null, _parent));
					_push(`</button></div></td><!--]-->`);
				}
				_push(`</tr>`);
			});
			_push(`<!--]-->`);
			if (unref(filteredMaintenanceTypes).length === 0) {
				_push(`<tr data-v-744a98a3><td colspan="2" class="types-column__empty" data-v-744a98a3>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:inbox",
					size: 24
				}, null, _parent));
				_push(`<p data-v-744a98a3>${ssrInterpolate(unref(t)("settings.types.empty"))}</p></td></tr>`);
			} else _push(`<!---->`);
			_push(`</tbody></table></div></div></div>`);
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: unref(showServiceAddForm),
				title: unref(t)("settings.types.add_service_title"),
				"max-width": "480px",
				onClose: handleCancelServiceTypeAdd
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "ghost",
							onClick: handleCancelServiceTypeAdd
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.add"),
							type: "primary",
							disabled: !unref(newServiceTypeName).trim(),
							onClick: handleAddServiceType
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "ghost",
						onClick: handleCancelServiceTypeAdd
					}, null, 8, ["text"]), createVNode(_component_AppButton, {
						text: unref(t)("common.add"),
						type: "primary",
						disabled: !unref(newServiceTypeName).trim(),
						onClick: handleAddServiceType
					}, null, 8, ["text", "disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="modal-form" data-v-744a98a3${_scopeId}><div class="modal-form__field" data-v-744a98a3${_scopeId}><label class="modal-form__label" data-v-744a98a3${_scopeId}>${ssrInterpolate(unref(t)("settings.types.type_name"))}</label><input${ssrRenderAttr("value", unref(newServiceTypeName))} type="text" class="modal-form__input"${ssrRenderAttr("placeholder", unref(t)("settings.types.add_placeholder"))} data-v-744a98a3${_scopeId}></div></div>`);
					else return [createVNode("div", { class: "modal-form" }, [createVNode("div", { class: "modal-form__field" }, [createVNode("label", { class: "modal-form__label" }, toDisplayString(unref(t)("settings.types.type_name")), 1), withDirectives(createVNode("input", {
						"onUpdate:modelValue": ($event) => isRef(newServiceTypeName) ? newServiceTypeName.value = $event : null,
						type: "text",
						class: "modal-form__input",
						placeholder: unref(t)("settings.types.add_placeholder"),
						onKeyup: withKeys(handleAddServiceType, ["enter"])
					}, null, 40, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(newServiceTypeName)]])])])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: unref(showMaintenanceAddForm),
				title: unref(t)("settings.types.add_maintenance_title"),
				"max-width": "480px",
				onClose: handleCancelMaintenanceTypeAdd
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "ghost",
							onClick: handleCancelMaintenanceTypeAdd
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.add"),
							type: "primary",
							disabled: !unref(newMaintenanceTypeName).trim(),
							onClick: handleAddMaintenanceType
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "ghost",
						onClick: handleCancelMaintenanceTypeAdd
					}, null, 8, ["text"]), createVNode(_component_AppButton, {
						text: unref(t)("common.add"),
						type: "primary",
						disabled: !unref(newMaintenanceTypeName).trim(),
						onClick: handleAddMaintenanceType
					}, null, 8, ["text", "disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="modal-form" data-v-744a98a3${_scopeId}><div class="modal-form__field" data-v-744a98a3${_scopeId}><label class="modal-form__label" data-v-744a98a3${_scopeId}>${ssrInterpolate(unref(t)("settings.types.type_name"))}</label><input${ssrRenderAttr("value", unref(newMaintenanceTypeName))} type="text" class="modal-form__input"${ssrRenderAttr("placeholder", unref(t)("settings.types.add_placeholder"))} data-v-744a98a3${_scopeId}></div></div>`);
					else return [createVNode("div", { class: "modal-form" }, [createVNode("div", { class: "modal-form__field" }, [createVNode("label", { class: "modal-form__label" }, toDisplayString(unref(t)("settings.types.type_name")), 1), withDirectives(createVNode("input", {
						"onUpdate:modelValue": ($event) => isRef(newMaintenanceTypeName) ? newMaintenanceTypeName.value = $event : null,
						type: "text",
						class: "modal-form__input",
						placeholder: unref(t)("settings.types.add_placeholder"),
						onKeyup: withKeys(handleAddMaintenanceType, ["enter"])
					}, null, 40, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(newMaintenanceTypeName)]])])])];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/settings/ServiceTypes.vue
var _sfc_setup$8 = ServiceTypes_vue_vue_type_script_setup_true_lang_default.setup;
ServiceTypes_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/settings/ServiceTypes.vue");
	return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
var ServiceTypes_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(ServiceTypes_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-744a98a3"]]), { __name: "ServiceTypes" });
//#endregion
//#region app/components/settings/AssetTypes.vue?vue&type=script&setup=true&lang.ts
var DEFAULT_COLOR = "#22c55e";
var AssetTypes_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AssetTypes",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const { isLoading: isUploading } = useFileApi();
		const assetTypes = ref([]);
		const loading = ref(false);
		const error = ref(null);
		const searchQuery = ref("");
		const showModal = ref(false);
		const isEditing = ref(false);
		const editingId = ref(null);
		const showDeleteModal = ref(false);
		const deletingId = ref(null);
		const formName = ref("");
		const formIcon = ref("");
		const formColor = ref("#22c55e");
		const iconPreviewUrl = ref("");
		const formErrors = ref({});
		function isValidHex(value) {
			return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
		}
		const colorPickerRef = ref(null);
		function openColorPicker() {
			colorPickerRef.value?.click();
		}
		function onNativeColorPick(e) {
			const input = e.target;
			formColor.value = input.value.toUpperCase();
			formErrors.value.color = void 0;
		}
		function onColorInput() {
			if (formColor.value && !isValidHex(formColor.value)) formErrors.value.color = "Please enter a valid hex color (e.g. #FF5733)";
			else formErrors.value.color = void 0;
		}
		async function fetchAssetTypes() {
			try {
				loading.value = true;
				const response = await settingsApi.getAssetTypes();
				if (response.rc === 0 && response.items) assetTypes.value = response.items.map((item) => ({
					id: item.type_id,
					name: item.name,
					icon: item.icon ?? null,
					color: item.color ?? null
				}));
			} catch (err) {
				error.value = "Failed to load asset types";
				console.error("Error fetching asset types:", err);
			} finally {
				loading.value = false;
			}
		}
		const filteredAssetTypes = computed(() => {
			if (!searchQuery.value.trim()) return assetTypes.value;
			return assetTypes.value.filter((item) => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
		});
		function openAddModal() {
			isEditing.value = false;
			editingId.value = null;
			formName.value = "";
			formIcon.value = "";
			iconPreviewUrl.value = "";
			formColor.value = DEFAULT_COLOR;
			formErrors.value = {};
			showModal.value = true;
		}
		function extractFileIdFromUrl(url) {
			if (!url) return "";
			if (!url.startsWith("http")) return url;
			return url.match(/\/files\/n\/([a-f0-9]+)\.png$/)?.[1] ?? url;
		}
		async function handleSubmit() {
			formErrors.value = {};
			if (!formName.value.trim()) {
				formErrors.value.name = "Name is required.";
				return;
			}
			if (!isValidHex(formColor.value)) {
				formErrors.value.color = "Please enter a valid hex color (e.g. #FF5733)";
				return;
			}
			let fileId = null;
			if (pendingFile.value && imageUploadRef.value) {
				fileId = await imageUploadRef.value.upload();
				if (!fileId) {
					formErrors.value.icon = "Failed to upload icon. Please try again.";
					return;
				}
			} else if (formIcon.value) fileId = extractFileIdFromUrl(formIcon.value);
			if (!fileId) {
				formErrors.value.icon = "An icon is required.";
				return;
			}
			try {
				if (isEditing.value && editingId.value) {
					const response = await settingsApi.updateAssetType(editingId.value, formName.value.trim(), fileId, formColor.value);
					if (response.rc === 0) {
						pendingFile.value = null;
						await fetchAssetTypes();
						closeModal();
					} else alert(response.message || "Failed to update asset type");
				} else {
					const response = await settingsApi.addAssetType(formName.value.trim(), fileId, formColor.value);
					if (response.rc === 0) {
						pendingFile.value = null;
						await fetchAssetTypes();
						closeModal();
					} else alert(response.message || "Failed to add asset type");
				}
			} catch (err) {
				console.error("Error saving asset type:", err);
				alert(isEditing.value ? "Failed to update asset type" : "Failed to add asset type");
			}
		}
		function closeModal() {
			showModal.value = false;
			formName.value = "";
			formIcon.value = "";
			iconPreviewUrl.value = "";
			formColor.value = DEFAULT_COLOR;
			formErrors.value = {};
		}
		async function confirmDelete() {
			if (!deletingId.value) return;
			try {
				const response = await settingsApi.deleteAssetType(deletingId.value);
				if (response.rc === 0) await fetchAssetTypes();
				else alert(response.message || "Failed to delete asset type");
			} catch (err) {
				console.error("Error deleting asset type:", err);
				alert("Failed to delete asset type");
			} finally {
				closeDeleteModal();
			}
		}
		function closeDeleteModal() {
			showDeleteModal.value = false;
			deletingId.value = null;
		}
		const imageUploadRef = ref(null);
		const pendingFile = ref(null);
		function handleFileSelected(file) {
			pendingFile.value = file;
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_AppButton = AppButton_default;
			const _component_AppDialogModal = AppDialogModal_default;
			const _component_ImageUpload = ImageUpload_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "asset-types-page" }, _attrs))} data-v-f1cfc2c9><div class="asset-types-header" data-v-f1cfc2c9><div data-v-f1cfc2c9><h2 class="asset-types-title" data-v-f1cfc2c9>${ssrInterpolate(unref(t)("settings.asset_types.list_title"))}</h2><p class="asset-types-subtitle" data-v-f1cfc2c9>${ssrInterpolate(unref(t)("settings.types.total"))}: ${ssrInterpolate(unref(filteredAssetTypes).length)} ${ssrInterpolate(unref(t)("settings.asset_types.assets_count"))}</p></div><div class="asset-types-actions" data-v-f1cfc2c9><div class="asset-types-search" data-v-f1cfc2c9>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16,
				class: "search-icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", unref(searchQuery))} type="text"${ssrRenderAttr("placeholder", unref(t)("settings.types.search_placeholder"))} class="search-input" data-v-f1cfc2c9></div>`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("settings.types.add_new"),
				icon: "lucide:plus",
				type: "primary",
				size: "sm",
				onClick: openAddModal
			}, null, _parent));
			_push(`</div></div><div class="asset-types-table-container" data-v-f1cfc2c9><table class="asset-types-table" data-v-f1cfc2c9><thead data-v-f1cfc2c9><tr data-v-f1cfc2c9><th class="col-icon" data-v-f1cfc2c9>${ssrInterpolate(unref(t)("settings.asset_types.icon"))}</th><th class="col-name" data-v-f1cfc2c9>${ssrInterpolate(unref(t)("settings.types.type_name"))}</th><th class="col-colour" data-v-f1cfc2c9>${ssrInterpolate(unref(t)("settings.asset_types.colour"))}</th><th class="col-actions" data-v-f1cfc2c9>${ssrInterpolate(unref(t)("common.actions"))}</th></tr></thead><tbody data-v-f1cfc2c9><!--[-->`);
			ssrRenderList(unref(filteredAssetTypes), (type) => {
				_push(`<tr class="asset-type-row" data-v-f1cfc2c9><td class="col-icon" data-v-f1cfc2c9>`);
				if (type.icon && type.icon !== "null") _push(`<img${ssrRenderAttr("src", type.icon)} class="type-icon" alt="" data-v-f1cfc2c9>`);
				else {
					_push(`<div class="type-icon-placeholder" data-v-f1cfc2c9>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:image",
						size: 40
					}, null, _parent));
					_push(`</div>`);
				}
				_push(`</td><td class="col-name" data-v-f1cfc2c9><span class="type-name" data-v-f1cfc2c9>${ssrInterpolate(type.name)}</span></td><td class="col-colour" data-v-f1cfc2c9>`);
				if (type.color) _push(`<div class="colour-preview" style="${ssrRenderStyle({ backgroundColor: type.color })}" data-v-f1cfc2c9><span class="colour-value" data-v-f1cfc2c9>${ssrInterpolate(type.color)}</span></div>`);
				else _push(`<span class="text-muted" data-v-f1cfc2c9>—</span>`);
				_push(`</td><td class="col-actions" data-v-f1cfc2c9><div class="row-actions" data-v-f1cfc2c9><button class="btn-icon"${ssrRenderAttr("title", unref(t)("common.edit"))} data-v-f1cfc2c9>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:pencil",
					size: 14
				}, null, _parent));
				_push(`</button><button class="btn-icon btn-icon--danger"${ssrRenderAttr("title", unref(t)("common.delete"))} data-v-f1cfc2c9>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:trash-2",
					size: 14
				}, null, _parent));
				_push(`</button></div></td></tr>`);
			});
			_push(`<!--]-->`);
			if (unref(filteredAssetTypes).length === 0) {
				_push(`<tr data-v-f1cfc2c9><td colspan="4" class="empty-state" data-v-f1cfc2c9>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:inbox",
					size: 32
				}, null, _parent));
				_push(`<p data-v-f1cfc2c9>${ssrInterpolate(unref(t)("settings.types.empty"))}</p></td></tr>`);
			} else _push(`<!---->`);
			_push(`</tbody></table></div>`);
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: unref(showModal),
				title: unref(isEditing) ? unref(t)("settings.asset_types.edit_title") : unref(t)("settings.asset_types.add_title"),
				"max-width": "520px",
				onClose: closeModal
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "ghost",
							onClick: closeModal
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(isEditing) ? unref(t)("common.save") : unref(t)("common.add"),
							type: "primary",
							disabled: !unref(formName).trim() || !unref(formIcon) || !isValidHex(unref(formColor)) || unref(isUploading),
							onClick: handleSubmit
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "ghost",
						onClick: closeModal
					}, null, 8, ["text"]), createVNode(_component_AppButton, {
						text: unref(isEditing) ? unref(t)("common.save") : unref(t)("common.add"),
						type: "primary",
						disabled: !unref(formName).trim() || !unref(formIcon) || !isValidHex(unref(formColor)) || unref(isUploading),
						onClick: handleSubmit
					}, null, 8, ["text", "disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="modal-form" data-v-f1cfc2c9${_scopeId}><div class="form-field" data-v-f1cfc2c9${_scopeId}><label class="form-label" data-v-f1cfc2c9${_scopeId}>${ssrInterpolate(unref(t)("settings.types.type_name"))} *</label><input${ssrRenderAttr("value", unref(formName))} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("settings.types.add_placeholder"))} data-v-f1cfc2c9${_scopeId}></div>`);
						_push(ssrRenderComponent(_component_ImageUpload, {
							ref_key: "imageUploadRef",
							ref: imageUploadRef,
							modelValue: unref(formIcon),
							"onUpdate:modelValue": ($event) => isRef(formIcon) ? formIcon.value = $event : null,
							label: unref(t)("settings.asset_types.icon"),
							required: true,
							"auto-upload": false,
							"call-api-after-attach": true,
							"file-access-level": "protected",
							"preview-size": 80,
							onFileSelected: handleFileSelected,
							onUploadSuccess: ($event) => iconPreviewUrl.value = $event,
							onUploadError: ($event) => iconPreviewUrl.value = ""
						}, null, _parent, _scopeId));
						if (unref(formErrors).icon) _push(`<p class="field-error" data-v-f1cfc2c9${_scopeId}>${ssrInterpolate(unref(formErrors).icon)}</p>`);
						else _push(`<!---->`);
						_push(`<div class="form-field" data-v-f1cfc2c9${_scopeId}><label class="form-label" data-v-f1cfc2c9${_scopeId}>${ssrInterpolate(unref(t)("settings.asset_types.colour"))} *</label><div class="colour-input-row" data-v-f1cfc2c9${_scopeId}><div class="colour-picker-btn" style="${ssrRenderStyle({ backgroundColor: isValidHex(unref(formColor)) ? unref(formColor) : "#888" })}"${ssrRenderAttr("title", "Pick a color")} data-v-f1cfc2c9${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:pipette",
							size: 15,
							color: "white"
						}, null, _parent, _scopeId));
						_push(`<input type="color" class="native-color-input"${ssrRenderAttr("value", isValidHex(unref(formColor)) ? unref(formColor) : DEFAULT_COLOR)} tabindex="-1" data-v-f1cfc2c9${_scopeId}></div><input${ssrRenderAttr("value", unref(formColor))} type="text" class="form-input colour-input" placeholder="#22c55e" data-v-f1cfc2c9${_scopeId}></div>`);
						if (unref(formErrors).color) _push(`<p class="field-error" data-v-f1cfc2c9${_scopeId}>${ssrInterpolate(unref(formErrors).color)}</p>`);
						else _push(`<!---->`);
						_push(`</div></div>`);
					} else return [createVNode("div", { class: "modal-form" }, [
						createVNode("div", { class: "form-field" }, [createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("settings.types.type_name")) + " *", 1), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => isRef(formName) ? formName.value = $event : null,
							type: "text",
							class: "form-input",
							placeholder: unref(t)("settings.types.add_placeholder")
						}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(formName)]])]),
						createVNode(_component_ImageUpload, {
							ref_key: "imageUploadRef",
							ref: imageUploadRef,
							modelValue: unref(formIcon),
							"onUpdate:modelValue": ($event) => isRef(formIcon) ? formIcon.value = $event : null,
							label: unref(t)("settings.asset_types.icon"),
							required: true,
							"auto-upload": false,
							"call-api-after-attach": true,
							"file-access-level": "protected",
							"preview-size": 80,
							onFileSelected: handleFileSelected,
							onUploadSuccess: ($event) => iconPreviewUrl.value = $event,
							onUploadError: ($event) => iconPreviewUrl.value = ""
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"label",
							"onUploadSuccess",
							"onUploadError"
						]),
						unref(formErrors).icon ? (openBlock(), createBlock("p", {
							key: 0,
							class: "field-error"
						}, toDisplayString(unref(formErrors).icon), 1)) : createCommentVNode("", true),
						createVNode("div", { class: "form-field" }, [
							createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("settings.asset_types.colour")) + " *", 1),
							createVNode("div", { class: "colour-input-row" }, [createVNode("div", {
								class: "colour-picker-btn",
								style: { backgroundColor: isValidHex(unref(formColor)) ? unref(formColor) : "#888" },
								title: "Pick a color",
								onClick: openColorPicker
							}, [createVNode(_component_Icon, {
								name: "lucide:pipette",
								size: 15,
								color: "white"
							}), createVNode("input", {
								ref_key: "colorPickerRef",
								ref: colorPickerRef,
								type: "color",
								class: "native-color-input",
								value: isValidHex(unref(formColor)) ? unref(formColor) : DEFAULT_COLOR,
								tabindex: "-1",
								onInput: onNativeColorPick
							}, null, 40, ["value"])], 4), withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => isRef(formColor) ? formColor.value = $event : null,
								type: "text",
								class: "form-input colour-input",
								placeholder: "#22c55e",
								onInput: onColorInput
							}, null, 40, ["onUpdate:modelValue"]), [[vModelText, unref(formColor)]])]),
							unref(formErrors).color ? (openBlock(), createBlock("p", {
								key: 0,
								class: "field-error"
							}, toDisplayString(unref(formErrors).color), 1)) : createCommentVNode("", true)
						])
					])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: unref(showDeleteModal),
				title: unref(t)("settings.types.delete_asset_type_title"),
				"max-width": "400px",
				onClose: closeDeleteModal
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "ghost",
							onClick: closeDeleteModal
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.delete"),
							type: "danger",
							onClick: confirmDelete
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "ghost",
						onClick: closeDeleteModal
					}, null, 8, ["text"]), createVNode(_component_AppButton, {
						text: unref(t)("common.delete"),
						type: "danger",
						onClick: confirmDelete
					}, null, 8, ["text"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<p data-v-f1cfc2c9${_scopeId}>${ssrInterpolate(unref(t)("settings.types.delete_confirm"))}</p>`);
					else return [createVNode("p", null, toDisplayString(unref(t)("settings.types.delete_confirm")), 1)];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/settings/AssetTypes.vue
var _sfc_setup$7 = AssetTypes_vue_vue_type_script_setup_true_lang_default.setup;
AssetTypes_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/settings/AssetTypes.vue");
	return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var AssetTypes_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(AssetTypes_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-f1cfc2c9"]]), { __name: "AssetTypes" });
//#endregion
//#region app/components/settings/PostOrderSectionTypes.vue?vue&type=script&setup=true&lang.ts
var PostOrderSectionTypes_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PostOrderSectionTypes",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const sectionTypes = ref([]);
		const loading = ref(false);
		const searchQuery = ref("");
		const showModal = ref(false);
		const isEditing = ref(false);
		const editingId = ref(null);
		const showDeleteModal = ref(false);
		const deletingId = ref(null);
		const formName = ref("");
		const formClientVisible = ref(false);
		const formDescription = ref("");
		const formActive = ref(true);
		async function fetchSectionTypes() {
			try {
				loading.value = true;
				const response = await settingsApi.getPostOrderSectionTypes();
				if (response.rc === 0 && response.items) sectionTypes.value = response.items.map((item) => ({
					id: item.type_id,
					name: item.name,
					clientVisible: item.client_visible,
					description: item.short_description,
					active: item.active
				}));
			} catch (err) {
				console.error("Error fetching section types:", err);
			} finally {
				loading.value = false;
			}
		}
		const filteredSectionTypes = computed(() => {
			if (!searchQuery.value.trim()) return sectionTypes.value;
			const q = searchQuery.value.toLowerCase();
			return sectionTypes.value.filter((item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
		});
		function openAddModal() {
			isEditing.value = false;
			editingId.value = null;
			formName.value = "";
			formClientVisible.value = false;
			formDescription.value = "";
			formActive.value = true;
			showModal.value = true;
		}
		function closeModal() {
			showModal.value = false;
		}
		async function handleSubmit() {
			if (!formName.value.trim() || !formDescription.value.trim()) return;
			try {
				if (isEditing.value && editingId.value) {
					const response = await settingsApi.updatePostOrderSectionType(editingId.value, formName.value, formClientVisible.value, formDescription.value, formActive.value);
					if (response.rc === 0) {
						await fetchSectionTypes();
						closeModal();
					} else alert(response.message || "Failed to update section type");
				} else {
					const response = await settingsApi.addPostOrderSectionType(formName.value, formClientVisible.value, formDescription.value, formActive.value);
					if (response.rc === 0) {
						await fetchSectionTypes();
						closeModal();
					} else alert(response.message || "Failed to add section type");
				}
			} catch (err) {
				console.error("Error saving section type:", err);
				alert("Failed to save section type");
			}
		}
		async function confirmDelete() {
			if (!deletingId.value) return;
			try {
				const response = await settingsApi.deletePostOrderSectionType(deletingId.value);
				if (response.rc === 0) await fetchSectionTypes();
				else alert(response.message || "Failed to delete section type");
			} catch (err) {
				console.error("Error deleting section type:", err);
				alert("Failed to delete section type");
			} finally {
				closeDeleteModal();
			}
		}
		function closeDeleteModal() {
			showDeleteModal.value = false;
			deletingId.value = null;
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_AppButton = AppButton_default;
			const _component_AppDialogModal = AppDialogModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "section-types-page" }, _attrs))} data-v-22dab35f><div class="section-types-header" data-v-22dab35f><div data-v-22dab35f><h2 class="section-types-title" data-v-22dab35f>${ssrInterpolate(unref(t)("settings.post_order_sections.list_title"))}</h2><p class="section-types-subtitle" data-v-22dab35f>${ssrInterpolate(unref(t)("settings.types.total"))}: ${ssrInterpolate(unref(filteredSectionTypes).length)} ${ssrInterpolate(unref(t)("settings.post_order_sections.sections_count"))}</p></div><div class="section-types-actions" data-v-22dab35f><div class="search-wrapper" data-v-22dab35f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16,
				class: "search-icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", unref(searchQuery))} type="text"${ssrRenderAttr("placeholder", unref(t)("settings.post_order_sections.search_placeholder"))} class="search-input" data-v-22dab35f></div>`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("settings.types.add_new"),
				icon: "lucide:plus",
				type: "primary",
				size: "sm",
				onClick: openAddModal
			}, null, _parent));
			_push(`</div></div><div class="section-types-table-container" data-v-22dab35f><table class="section-types-table" data-v-22dab35f><thead data-v-22dab35f><tr data-v-22dab35f><th class="col-name" data-v-22dab35f>${ssrInterpolate(unref(t)("settings.post_order_sections.section_name"))}</th><th class="col-visible" data-v-22dab35f>${ssrInterpolate(unref(t)("settings.post_order_sections.client_visible"))}</th><th class="col-description" data-v-22dab35f>${ssrInterpolate(unref(t)("settings.post_order_sections.short_description"))}</th><th class="col-status" data-v-22dab35f>${ssrInterpolate(unref(t)("common.status"))}</th><th class="col-actions" data-v-22dab35f>${ssrInterpolate(unref(t)("common.actions"))}</th></tr></thead><tbody data-v-22dab35f><!--[-->`);
			ssrRenderList(unref(filteredSectionTypes), (section) => {
				_push(`<tr class="section-type-row" data-v-22dab35f><td class="col-name" data-v-22dab35f><span class="type-name" data-v-22dab35f>${ssrInterpolate(section.name)}</span></td><td class="col-visible" data-v-22dab35f><span class="${ssrRenderClass([section.clientVisible ? "pill--ok" : "pill--ghost", "pill"])}" data-v-22dab35f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: section.clientVisible ? "lucide:eye" : "lucide:eye-off",
					size: 12
				}, null, _parent));
				_push(` ${ssrInterpolate(section.clientVisible ? unref(t)("common.yes") : unref(t)("common.no"))}</span></td><td class="col-description" data-v-22dab35f><span class="type-description" data-v-22dab35f>${ssrInterpolate(section.description || "—")}</span></td><td class="col-status" data-v-22dab35f><span class="${ssrRenderClass([section.active ? "pill--ok" : "pill--ghost", "pill"])}" data-v-22dab35f>${ssrInterpolate(section.active ? unref(t)("common.active") : unref(t)("common.inactive"))}</span></td><td class="col-actions" data-v-22dab35f><div class="row-actions" data-v-22dab35f><button class="btn-icon"${ssrRenderAttr("title", unref(t)("common.edit"))} data-v-22dab35f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:pencil",
					size: 14
				}, null, _parent));
				_push(`</button><button class="btn-icon btn-icon--danger"${ssrRenderAttr("title", unref(t)("common.delete"))} data-v-22dab35f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:trash-2",
					size: 14
				}, null, _parent));
				_push(`</button></div></td></tr>`);
			});
			_push(`<!--]-->`);
			if (unref(filteredSectionTypes).length === 0 && !unref(loading)) {
				_push(`<tr data-v-22dab35f><td colspan="5" class="empty-state" data-v-22dab35f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:inbox",
					size: 32
				}, null, _parent));
				_push(`<p data-v-22dab35f>${ssrInterpolate(unref(t)("settings.types.empty"))}</p></td></tr>`);
			} else _push(`<!---->`);
			_push(`</tbody></table></div>`);
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: unref(showModal),
				title: unref(isEditing) ? unref(t)("settings.post_order_sections.edit_title") : unref(t)("settings.post_order_sections.add_title"),
				"max-width": "560px",
				onClose: closeModal
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "ghost",
							onClick: closeModal
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(isEditing) ? unref(t)("common.save") : unref(t)("common.add"),
							type: "primary",
							disabled: !unref(formName).trim() || !unref(formDescription).trim(),
							onClick: handleSubmit
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "ghost",
						onClick: closeModal
					}, null, 8, ["text"]), createVNode(_component_AppButton, {
						text: unref(isEditing) ? unref(t)("common.save") : unref(t)("common.add"),
						type: "primary",
						disabled: !unref(formName).trim() || !unref(formDescription).trim(),
						onClick: handleSubmit
					}, null, 8, ["text", "disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="modal-form" data-v-22dab35f${_scopeId}><div class="form-field" data-v-22dab35f${_scopeId}><label class="form-label" data-v-22dab35f${_scopeId}>${ssrInterpolate(unref(t)("settings.post_order_sections.section_name"))} *</label><input${ssrRenderAttr("value", unref(formName))} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("settings.post_order_sections.name_placeholder"))} data-v-22dab35f${_scopeId}></div><div class="form-field" data-v-22dab35f${_scopeId}><label class="form-label" data-v-22dab35f${_scopeId}>${ssrInterpolate(unref(t)("settings.post_order_sections.short_description"))} *</label><textarea class="form-textarea"${ssrRenderAttr("placeholder", unref(t)("settings.post_order_sections.description_placeholder"))} rows="3" data-v-22dab35f${_scopeId}>${ssrInterpolate(unref(formDescription))}</textarea></div><div class="form-toggles" data-v-22dab35f${_scopeId}><div class="form-toggle" data-v-22dab35f${_scopeId}><div class="form-toggle-info" data-v-22dab35f${_scopeId}><label class="form-label" data-v-22dab35f${_scopeId}>${ssrInterpolate(unref(t)("settings.post_order_sections.client_visible"))}</label><p class="form-hint" data-v-22dab35f${_scopeId}>${ssrInterpolate(unref(t)("settings.post_order_sections.client_visible_hint"))}</p></div><button class="${ssrRenderClass([{ "toggle-btn--on": unref(formClientVisible) }, "toggle-btn"])}" type="button" data-v-22dab35f${_scopeId}><span class="toggle-knob" data-v-22dab35f${_scopeId}></span></button></div><div class="form-toggle" data-v-22dab35f${_scopeId}><div class="form-toggle-info" data-v-22dab35f${_scopeId}><label class="form-label" data-v-22dab35f${_scopeId}>${ssrInterpolate(unref(t)("common.active"))}</label><p class="form-hint" data-v-22dab35f${_scopeId}>${ssrInterpolate(unref(t)("settings.post_order_sections.active_hint"))}</p></div><button class="${ssrRenderClass([{ "toggle-btn--on": unref(formActive) }, "toggle-btn"])}" type="button" data-v-22dab35f${_scopeId}><span class="toggle-knob" data-v-22dab35f${_scopeId}></span></button></div></div></div>`);
					else return [createVNode("div", { class: "modal-form" }, [
						createVNode("div", { class: "form-field" }, [createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("settings.post_order_sections.section_name")) + " *", 1), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => isRef(formName) ? formName.value = $event : null,
							type: "text",
							class: "form-input",
							placeholder: unref(t)("settings.post_order_sections.name_placeholder")
						}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(formName)]])]),
						createVNode("div", { class: "form-field" }, [createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("settings.post_order_sections.short_description")) + " *", 1), withDirectives(createVNode("textarea", {
							"onUpdate:modelValue": ($event) => isRef(formDescription) ? formDescription.value = $event : null,
							class: "form-textarea",
							placeholder: unref(t)("settings.post_order_sections.description_placeholder"),
							rows: "3"
						}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(formDescription)]])]),
						createVNode("div", { class: "form-toggles" }, [createVNode("div", { class: "form-toggle" }, [createVNode("div", { class: "form-toggle-info" }, [createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("settings.post_order_sections.client_visible")), 1), createVNode("p", { class: "form-hint" }, toDisplayString(unref(t)("settings.post_order_sections.client_visible_hint")), 1)]), createVNode("button", {
							class: ["toggle-btn", { "toggle-btn--on": unref(formClientVisible) }],
							type: "button",
							onClick: ($event) => formClientVisible.value = !unref(formClientVisible)
						}, [createVNode("span", { class: "toggle-knob" })], 10, ["onClick"])]), createVNode("div", { class: "form-toggle" }, [createVNode("div", { class: "form-toggle-info" }, [createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("common.active")), 1), createVNode("p", { class: "form-hint" }, toDisplayString(unref(t)("settings.post_order_sections.active_hint")), 1)]), createVNode("button", {
							class: ["toggle-btn", { "toggle-btn--on": unref(formActive) }],
							type: "button",
							onClick: ($event) => formActive.value = !unref(formActive)
						}, [createVNode("span", { class: "toggle-knob" })], 10, ["onClick"])])])
					])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: unref(showDeleteModal),
				title: unref(t)("settings.post_order_sections.delete_title"),
				"max-width": "400px",
				onClose: closeDeleteModal
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "ghost",
							onClick: closeDeleteModal
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.delete"),
							type: "danger",
							onClick: confirmDelete
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "ghost",
						onClick: closeDeleteModal
					}, null, 8, ["text"]), createVNode(_component_AppButton, {
						text: unref(t)("common.delete"),
						type: "danger",
						onClick: confirmDelete
					}, null, 8, ["text"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<p data-v-22dab35f${_scopeId}>${ssrInterpolate(unref(t)("settings.types.delete_confirm"))}</p>`);
					else return [createVNode("p", null, toDisplayString(unref(t)("settings.types.delete_confirm")), 1)];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/settings/PostOrderSectionTypes.vue
var _sfc_setup$6 = PostOrderSectionTypes_vue_vue_type_script_setup_true_lang_default.setup;
PostOrderSectionTypes_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/settings/PostOrderSectionTypes.vue");
	return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var PostOrderSectionTypes_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PostOrderSectionTypes_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-22dab35f"]]), { __name: "PostOrderSectionTypes" });
//#endregion
//#region app/components/settings/PushNotificationSettings.vue?vue&type=script&setup=true&lang.ts
var PushNotificationSettings_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PushNotificationSettings",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const toastStore = useToastStore();
		const channelInApp = ref(true);
		const channelEmail = ref(true);
		const channelMobile = ref(true);
		const senderName = ref("");
		const notificationTitle = ref("");
		const retentionDays = ref(90);
		const retentionError = ref("");
		const triggerStates = ref({
			new_call_enabled: true,
			call_accepted_enabled: true,
			call_edited_enabled: true,
			call_resolved_enabled: true,
			post_order_published_enabled: true,
			post_order_updated_enabled: true,
			poi_active_enabled: true,
			poi_updated_enabled: true,
			poi_inactivated_enabled: true,
			poi_expiring_enabled: true,
			poi_expired_enabled: true,
			report_submitted_enabled: true,
			report_approved_enabled: true,
			report_changes_enabled: true,
			report_delivered_enabled: true
		});
		const loading = ref(false);
		const saving = ref(false);
		const isDirty = ref(false);
		function parseChannels(methods) {
			const parts = methods.split(",").map((s) => s.trim());
			channelInApp.value = parts.includes("in_app");
			channelEmail.value = parts.includes("email");
			channelMobile.value = parts.includes("mobile");
		}
		function buildChannelsString() {
			const parts = [];
			if (channelInApp.value) parts.push("in_app");
			if (channelEmail.value) parts.push("email");
			if (channelMobile.value) parts.push("mobile");
			return parts.join(",");
		}
		async function fetchSettings() {
			try {
				loading.value = true;
				const response = await settingsApi.getNotificationSettings();
				if (response.rc === 0) {
					parseChannels(response.notification_methods || "in_app,email,mobile");
					senderName.value = response.sender_name || "";
					notificationTitle.value = response.notification_title || "";
					retentionDays.value = response.notification_retention_days ?? 90;
					triggerStates.value = {
						new_call_enabled: response.new_call_enabled,
						call_accepted_enabled: response.call_accepted_enabled,
						call_edited_enabled: response.call_edited_enabled,
						call_resolved_enabled: response.call_resolved_enabled,
						post_order_published_enabled: response.post_order_published_enabled,
						post_order_updated_enabled: response.post_order_updated_enabled,
						poi_active_enabled: response.poi_active_enabled,
						poi_updated_enabled: response.poi_updated_enabled,
						poi_inactivated_enabled: response.poi_inactivated_enabled,
						poi_expiring_enabled: response.poi_expiring_enabled,
						poi_expired_enabled: response.poi_expired_enabled,
						report_submitted_enabled: response.report_submitted_enabled,
						report_approved_enabled: response.report_approved_enabled,
						report_changes_enabled: response.report_changes_enabled,
						report_delivered_enabled: response.report_delivered_enabled
					};
				}
			} catch (err) {
				console.error("Error fetching notification settings:", err);
			} finally {
				loading.value = false;
				isDirty.value = false;
			}
		}
		const triggerList = [
			{
				key: "new_call_enabled",
				label: "New emergency call",
				defaultTitle: "A new call",
				receivers: "settings.notifications.receivers.assigned_officer",
				notifText: "#service_category was opened by #call_creator"
			},
			{
				key: "call_accepted_enabled",
				label: "Call status change to Accepted",
				defaultTitle: "Call accepted",
				receivers: "settings.notifications.receivers.call_creator_manager",
				notifText: "Your call was accepted by the #officer_name"
			},
			{
				key: "call_edited_enabled",
				label: "Call was edited",
				defaultTitle: "Call edit",
				receivers: "settings.notifications.receivers.assigned_officer",
				notifText: "#call_number was edited"
			},
			{
				key: "call_resolved_enabled",
				label: "Call status change to Resolved",
				defaultTitle: "Call resolved",
				receivers: "settings.notifications.receivers.call_creator_manager",
				notifText: "#call_number was resolved"
			},
			{
				key: "post_order_published_enabled",
				label: "Post Order Published",
				defaultTitle: "A new Post Order is published for a post (version 1.0).",
				receivers: "settings.notifications.receivers.allocated_officers",
				notifText: "A new Post Order is available"
			},
			{
				key: "post_order_updated_enabled",
				label: "Post Order Updated",
				defaultTitle: "A version update is published to a post order",
				receivers: "settings.notifications.receivers.allocated_officers",
				notifText: "Post Order was updated"
			},
			{
				key: "poi_active_enabled",
				label: "New POI Record – Active",
				defaultTitle: "A record is approved and published to one or more communities.",
				receivers: "settings.notifications.receivers.all_checked_in",
				notifText: "New POI was created: #name, #record_type, #threat level"
			},
			{
				key: "poi_updated_enabled",
				label: "POI Record Updated",
				defaultTitle: "An edited record, a new version is published.",
				receivers: "settings.notifications.receivers.officers_affected_communities",
				notifText: "#name, #record_type has been updated"
			},
			{
				key: "poi_inactivated_enabled",
				label: "POI Record Inactivated",
				defaultTitle: "A manager inactivated an Active record.",
				receivers: "settings.notifications.receivers.all_officers",
				notifText: "#name, #record_type has been inactivated"
			},
			{
				key: "poi_expiring_enabled",
				label: "Record Expiring Soon",
				defaultTitle: "A Trespass Order or Metro Red Card is within the configured renewal reminder window (default: 14 days).",
				receivers: "settings.notifications.receivers.creating_manager",
				notifText: "#name, #record_type expired soon"
			},
			{
				key: "poi_expired_enabled",
				label: "Record Expired",
				defaultTitle: "A Trespass Order or Metro Red Card reaches its expiry date.",
				receivers: "settings.notifications.receivers.manager_officers",
				notifText: "#name, #record_type expired"
			},
			{
				key: "report_submitted_enabled",
				label: "Incident Report submitted",
				defaultTitle: "",
				receivers: "settings.notifications.receivers.responsible_manager",
				notifText: ""
			},
			{
				key: "report_approved_enabled",
				label: "Incident Report Approved",
				defaultTitle: "",
				receivers: "settings.notifications.receivers.report_officer",
				notifText: ""
			},
			{
				key: "report_changes_enabled",
				label: "Incident Report required changes",
				defaultTitle: "",
				receivers: "settings.notifications.receivers.report_officer",
				notifText: ""
			},
			{
				key: "report_delivered_enabled",
				label: "Incident Report Delivered",
				defaultTitle: "",
				receivers: "settings.notifications.receivers.call_client",
				notifText: ""
			}
		];
		const allTriggersEnabled = computed(() => Object.values(triggerStates.value).every(Boolean));
		const someTriggersEnabled = computed(() => Object.values(triggerStates.value).some(Boolean) && !allTriggersEnabled.value);
		const enabledCount = computed(() => Object.values(triggerStates.value).filter(Boolean).length);
		function validateRetention() {
			const val = Number(retentionDays.value);
			if (!Number.isInteger(val) || val < 1) {
				retentionError.value = t("settings.notifications.retention_error");
				return false;
			}
			if (val > 365) {
				retentionError.value = t("settings.notifications.retention_max_error");
				return false;
			}
			retentionError.value = "";
			return true;
		}
		async function handleSave() {
			if (!validateRetention()) return;
			try {
				saving.value = true;
				const response = await settingsApi.saveNotificationSettings({
					notification_methods: buildChannelsString(),
					notification_title: notificationTitle.value,
					sender_name: senderName.value,
					notification_retention_days: Number(retentionDays.value),
					...triggerStates.value
				});
				if (response.rc === 0) {
					isDirty.value = false;
					toastStore.success(t("settings.notifications.save_success"), 3e3);
				} else if (response.rc === 103) toastStore.error(t("settings.notifications.access_denied"));
				else toastStore.error(response.message || t("settings.notifications.save_failed"));
			} catch (err) {
				if (err instanceof ApiError && err.rc === 103) toastStore.error(t("settings.notifications.access_denied"));
				else {
					console.error("Error saving notification settings:", err);
					toastStore.error(err instanceof ApiError ? err.message : t("settings.notifications.save_failed"));
				}
			} finally {
				saving.value = false;
			}
		}
		async function handleReset() {
			await fetchSettings();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppButton = AppButton_default;
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "notif-settings-page" }, _attrs))} data-v-1610a187><div class="page-header" data-v-1610a187><div data-v-1610a187><h2 class="page-title" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.page_title"))}</h2><p class="page-subtitle" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.page_subtitle"))}</p></div><div class="header-actions" data-v-1610a187>`);
			if (unref(isDirty)) _push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("common.reset"),
				type: "ghost",
				size: "sm",
				disabled: unref(saving),
				onClick: handleReset
			}, null, _parent));
			else _push(`<!---->`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(saving) ? unref(t)("common.saving") : unref(t)("common.save_changes"),
				type: "primary",
				size: "sm",
				disabled: unref(saving) || !unref(isDirty),
				onClick: handleSave
			}, null, _parent));
			_push(`</div></div><div class="settings-columns" data-v-1610a187><div class="col-left" data-v-1610a187><div class="settings-card" data-v-1610a187><div class="card-header" data-v-1610a187><div class="card-icon" data-v-1610a187>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:send",
				size: 18
			}, null, _parent));
			_push(`</div><div data-v-1610a187><h3 class="card-title" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.channels_title"))}</h3><p class="card-desc" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.channels_desc"))}</p></div></div><div class="card-body" data-v-1610a187><div class="channel-grid" data-v-1610a187><div class="${ssrRenderClass([{ "channel-item--on": unref(channelInApp) }, "channel-item"])}" data-v-1610a187><div class="channel-icon" data-v-1610a187>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:bell",
				size: 22
			}, null, _parent));
			_push(`</div><div class="channel-info" data-v-1610a187><span class="channel-name" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.channel_in_app"))}</span><span class="channel-desc" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.channel_in_app_desc"))}</span></div><button class="${ssrRenderClass([{ "toggle-btn--on": unref(channelInApp) }, "toggle-btn"])}" data-v-1610a187><span class="toggle-knob" data-v-1610a187></span></button></div><div class="${ssrRenderClass([{ "channel-item--on": unref(channelEmail) }, "channel-item"])}" data-v-1610a187><div class="channel-icon" data-v-1610a187>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:mail",
				size: 22
			}, null, _parent));
			_push(`</div><div class="channel-info" data-v-1610a187><span class="channel-name" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.channel_email"))}</span><span class="channel-desc" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.channel_email_desc"))}</span></div><button class="${ssrRenderClass([{ "toggle-btn--on": unref(channelEmail) }, "toggle-btn"])}" data-v-1610a187><span class="toggle-knob" data-v-1610a187></span></button></div><div class="${ssrRenderClass([{ "channel-item--on": unref(channelMobile) }, "channel-item"])}" data-v-1610a187><div class="channel-icon" data-v-1610a187>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:smartphone",
				size: 22
			}, null, _parent));
			_push(`</div><div class="channel-info" data-v-1610a187><span class="channel-name" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.channel_mobile"))}</span><span class="channel-desc" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.channel_mobile_desc"))}</span></div><button class="${ssrRenderClass([{ "toggle-btn--on": unref(channelMobile) }, "toggle-btn"])}" data-v-1610a187><span class="toggle-knob" data-v-1610a187></span></button></div></div></div></div><div class="settings-card" data-v-1610a187><div class="card-body" data-v-1610a187><div class="form-field" data-v-1610a187><label class="form-label" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.sender_name_label"))}</label><input${ssrRenderAttr("value", unref(senderName))} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("settings.notifications.sender_name_placeholder"))} data-v-1610a187><p class="form-hint" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.sender_name_hint"))}</p></div></div></div><div class="settings-card" data-v-1610a187><div class="card-body" data-v-1610a187><div class="form-field" data-v-1610a187><label class="form-label" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.notification_title_label"))}</label><input${ssrRenderAttr("value", unref(notificationTitle))} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("settings.notifications.notification_title_placeholder"))} data-v-1610a187><p class="form-hint" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.notification_title_hint"))}</p></div></div></div><div class="settings-card" data-v-1610a187><div class="card-header" data-v-1610a187><div class="card-icon" data-v-1610a187>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:database",
				size: 18
			}, null, _parent));
			_push(`</div><div data-v-1610a187><h3 class="card-title" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.retention_title"))}</h3><p class="card-desc" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.retention_desc"))}</p></div></div><div class="card-body" data-v-1610a187><div class="form-field" data-v-1610a187><label class="form-label" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.retention_label"))}</label><input${ssrRenderAttr("value", unref(retentionDays))} type="number" class="form-input" min="1" max="365" placeholder="90" data-v-1610a187>`);
			if (unref(retentionError)) _push(`<p class="form-error" data-v-1610a187>${ssrInterpolate(unref(retentionError))}</p>`);
			else _push(`<!---->`);
			_push(`<p class="form-hint" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.retention_hint"))}</p></div></div></div></div><div class="col-right" data-v-1610a187><div class="settings-card" data-v-1610a187><div class="card-header" data-v-1610a187><div class="card-icon" data-v-1610a187>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:zap",
				size: 18
			}, null, _parent));
			_push(`</div><div data-v-1610a187><h3 class="card-title" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.triggers_title"))}</h3><p class="card-desc" data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.triggers_desc"))}</p></div></div><div class="card-body" data-v-1610a187><div class="triggers-header" data-v-1610a187><label class="select-all-check" data-v-1610a187><input type="checkbox"${ssrIncludeBooleanAttr(unref(allTriggersEnabled)) ? " checked" : ""}${ssrRenderAttr("indeterminate", unref(someTriggersEnabled))} data-v-1610a187><span data-v-1610a187>${ssrInterpolate(unref(t)("settings.notifications.select_all"))}</span></label><span class="triggers-count" data-v-1610a187>${ssrInterpolate(unref(enabledCount))} / ${ssrInterpolate(triggerList.length)} ${ssrInterpolate(unref(t)("settings.notifications.triggers_enabled"))}</span></div><div class="trigger-list" data-v-1610a187><!--[-->`);
			ssrRenderList(triggerList, (entry) => {
				_push(`<div class="${ssrRenderClass([{ "trigger-row--disabled": !unref(triggerStates)[entry.key] }, "trigger-row"])}" data-v-1610a187><div class="trigger-main" data-v-1610a187><input${ssrIncludeBooleanAttr(unref(triggerStates)[entry.key]) ? " checked" : ""} type="checkbox" class="trigger-checkbox" data-v-1610a187><div class="trigger-info" data-v-1610a187><span class="trigger-name" data-v-1610a187>${ssrInterpolate(entry.label)}</span>`);
				if (entry.defaultTitle) {
					_push(`<span class="trigger-title" data-v-1610a187>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:bell",
						size: 11
					}, null, _parent));
					_push(` ${ssrInterpolate(entry.defaultTitle)}</span>`);
				} else _push(`<!---->`);
				_push(`<span class="trigger-receivers" data-v-1610a187>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:users",
					size: 11
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)(entry.receivers))}</span></div></div>`);
				if (entry.notifText) _push(`<div class="trigger-text" data-v-1610a187> &quot;${ssrInterpolate(entry.notifText)}&quot; </div>`);
				else _push(`<!---->`);
				_push(`</div>`);
			});
			_push(`<!--]--></div></div></div></div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/settings/PushNotificationSettings.vue
var _sfc_setup$5 = PushNotificationSettings_vue_vue_type_script_setup_true_lang_default.setup;
PushNotificationSettings_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/settings/PushNotificationSettings.vue");
	return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var PushNotificationSettings_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PushNotificationSettings_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-1610a187"]]), { __name: "PushNotificationSettings" });
//#endregion
//#region app/components/settings/PoiTrespassSettings.vue?vue&type=script&setup=true&lang.ts
var PoiTrespassSettings_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PoiTrespassSettings",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const renewalReminderDays = ref(14);
		const archiveThresholdMonths = ref(24);
		const pdfExportEnabled = ref(true);
		const defaultPoiGuidance = ref("");
		const defaultTrespassGuidance = ref("");
		const defaultRedCardGuidance = ref("");
		const saving = ref(false);
		const isDirty = ref(false);
		async function fetchSettings() {
			try {
				const response = await settingsApi.getPoiSettings();
				if (response.rc === 0) {
					renewalReminderDays.value = response.renewal_reminder_days;
					archiveThresholdMonths.value = response.archive_threshold_months;
					pdfExportEnabled.value = response.pdf_export_enabled;
					defaultPoiGuidance.value = response.default_poi_guidance;
					defaultTrespassGuidance.value = response.default_trespass_guidance;
					defaultRedCardGuidance.value = response.default_red_card_guidance;
				}
			} catch (err) {
				console.error("Error fetching POI settings:", err);
			} finally {
				isDirty.value = false;
			}
		}
		async function handleSave() {
			try {
				saving.value = true;
				const response = await settingsApi.updatePoiSettings({
					renewal_reminder_days: renewalReminderDays.value,
					archive_threshold_months: archiveThresholdMonths.value,
					pdf_export_enabled: pdfExportEnabled.value,
					default_poi_guidance: defaultPoiGuidance.value,
					default_trespass_guidance: defaultTrespassGuidance.value,
					default_red_card_guidance: defaultRedCardGuidance.value
				});
				if (response.rc === 0) isDirty.value = false;
				else alert(response.message || "Failed to save POI settings");
			} catch (err) {
				console.error("Error saving POI settings:", err);
				alert("Failed to save POI settings");
			} finally {
				saving.value = false;
			}
		}
		async function handleReset() {
			await fetchSettings();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppButton = AppButton_default;
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "poi-settings-page" }, _attrs))} data-v-3a92c7c4><div class="page-header" data-v-3a92c7c4><div data-v-3a92c7c4><h2 class="page-title" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.page_title"))}</h2><p class="page-subtitle" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.page_subtitle"))}</p></div><div class="header-actions" data-v-3a92c7c4>`);
			if (unref(isDirty)) _push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("common.reset"),
				type: "ghost",
				size: "sm",
				disabled: unref(saving),
				onClick: handleReset
			}, null, _parent));
			else _push(`<!---->`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(saving) ? unref(t)("common.saving") : unref(t)("common.save_changes"),
				type: "primary",
				size: "sm",
				disabled: unref(saving) || !unref(isDirty),
				onClick: handleSave
			}, null, _parent));
			_push(`</div></div><div class="settings-columns" data-v-3a92c7c4><div class="col-left" data-v-3a92c7c4><div class="settings-card" data-v-3a92c7c4><div class="card-header" data-v-3a92c7c4><div class="card-icon" data-v-3a92c7c4>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:sliders-horizontal",
				size: 18
			}, null, _parent));
			_push(`</div><div data-v-3a92c7c4><h3 class="card-title" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.parameters_title"))}</h3><p class="card-desc" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.parameters_desc"))}</p></div></div><div class="card-body" data-v-3a92c7c4><div class="form-field" data-v-3a92c7c4><label class="form-label" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.renewal_reminder_label"))}</label><div class="input-with-unit" data-v-3a92c7c4><input${ssrRenderAttr("value", unref(renewalReminderDays))} type="number" min="1" max="365" class="form-input" data-v-3a92c7c4><span class="input-unit" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.days"))}</span></div><p class="form-hint" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.renewal_reminder_hint"))}</p></div><div class="form-field" data-v-3a92c7c4><label class="form-label" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.archive_threshold_label"))}</label><div class="input-with-unit" data-v-3a92c7c4><input${ssrRenderAttr("value", unref(archiveThresholdMonths))} type="number" min="1" max="120" class="form-input" data-v-3a92c7c4><span class="input-unit" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.months"))}</span></div><p class="form-hint" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.archive_threshold_hint"))}</p></div><div class="form-field" data-v-3a92c7c4><label class="form-label" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.pdf_export_label"))}</label><div class="${ssrRenderClass([{ "toggle-row--on": unref(pdfExportEnabled) }, "toggle-row"])}" data-v-3a92c7c4><div class="toggle-row-info" data-v-3a92c7c4><span class="toggle-row-name" data-v-3a92c7c4>${ssrInterpolate(unref(pdfExportEnabled) ? unref(t)("common.active") : unref(t)("common.inactive"))}</span><span class="toggle-row-desc" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.pdf_export_hint"))}</span></div><button class="${ssrRenderClass([{ "toggle-btn--on": unref(pdfExportEnabled) }, "toggle-btn"])}" data-v-3a92c7c4><span class="toggle-knob" data-v-3a92c7c4></span></button></div></div></div></div></div><div class="col-right" data-v-3a92c7c4><div class="settings-card" data-v-3a92c7c4><div class="card-header" data-v-3a92c7c4><div class="card-icon" data-v-3a92c7c4>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:file-text",
				size: 18
			}, null, _parent));
			_push(`</div><div data-v-3a92c7c4><h3 class="card-title" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.guidance_title"))}</h3><p class="card-desc" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.guidance_desc"))}</p></div></div><div class="card-body" data-v-3a92c7c4><div class="form-field" data-v-3a92c7c4><label class="form-label" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.poi_guidance_label"))}</label><textarea class="form-textarea"${ssrRenderAttr("placeholder", unref(t)("settings.poi.poi_guidance_placeholder"))} rows="5" data-v-3a92c7c4>${ssrInterpolate(unref(defaultPoiGuidance))}</textarea></div><div class="form-field" data-v-3a92c7c4><label class="form-label" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.trespass_guidance_label"))}</label><textarea class="form-textarea"${ssrRenderAttr("placeholder", unref(t)("settings.poi.trespass_guidance_placeholder"))} rows="5" data-v-3a92c7c4>${ssrInterpolate(unref(defaultTrespassGuidance))}</textarea></div><div class="form-field" data-v-3a92c7c4><label class="form-label" data-v-3a92c7c4>${ssrInterpolate(unref(t)("settings.poi.red_card_guidance_label"))}</label><textarea class="form-textarea"${ssrRenderAttr("placeholder", unref(t)("settings.poi.red_card_guidance_placeholder"))} rows="5" data-v-3a92c7c4>${ssrInterpolate(unref(defaultRedCardGuidance))}</textarea></div></div></div></div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/settings/PoiTrespassSettings.vue
var _sfc_setup$4 = PoiTrespassSettings_vue_vue_type_script_setup_true_lang_default.setup;
PoiTrespassSettings_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/settings/PoiTrespassSettings.vue");
	return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var PoiTrespassSettings_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PoiTrespassSettings_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3a92c7c4"]]), { __name: "PoiTrespassSettings" });
//#endregion
//#region app/components/settings/GpsTrackingSettings.vue?vue&type=script&setup=true&lang.ts
var GpsTrackingSettings_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "GpsTrackingSettings",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const gpsIntervalNormal = ref(30);
		const gpsIntervalEmergency = ref(10);
		const gpsStaleThreshold = ref(2);
		const locationHistoryRetention = ref(90);
		const mapRefreshInterval = ref(30);
		const patrolComplianceThreshold = ref(15);
		const emergencyEtaInterval = ref(60);
		const mapProvider = ref("google_maps");
		const saving = ref(false);
		const isDirty = ref(false);
		const showRestoreModal = ref(false);
		const GPS_DEFAULTS = {
			gps_interval_normal: 30,
			gps_interval_emergency: 10,
			gps_stale_threshold: 2,
			location_history_retention: 90,
			map_refresh_interval: 30,
			patrol_compliance_threshold: 15,
			emergency_eta_interval: 60,
			map_provider: "google_maps"
		};
		const mapProviderOptions = [{
			value: "google_maps",
			label: "Google Maps"
		}];
		async function fetchSettings() {
			try {
				const response = await settingsApi.getGpsSettings();
				if (response.rc === 0) {
					gpsIntervalNormal.value = response.gps_interval_normal;
					gpsIntervalEmergency.value = response.gps_interval_emergency;
					gpsStaleThreshold.value = response.gps_stale_threshold;
					locationHistoryRetention.value = response.location_history_retention;
					mapRefreshInterval.value = response.map_refresh_interval;
					patrolComplianceThreshold.value = response.patrol_compliance_threshold;
					emergencyEtaInterval.value = response.emergency_eta_interval;
					mapProvider.value = response.map_provider;
				}
			} catch (err) {
				console.error("Error fetching GPS settings:", err);
			} finally {
				isDirty.value = false;
			}
		}
		async function handleSave() {
			try {
				saving.value = true;
				const response = await settingsApi.updateGpsSettings({
					gps_interval_normal: gpsIntervalNormal.value,
					gps_interval_emergency: gpsIntervalEmergency.value,
					gps_stale_threshold: gpsStaleThreshold.value,
					location_history_retention: locationHistoryRetention.value,
					map_refresh_interval: mapRefreshInterval.value,
					patrol_compliance_threshold: patrolComplianceThreshold.value,
					emergency_eta_interval: emergencyEtaInterval.value,
					map_provider: mapProvider.value
				});
				if (response.rc === 0) isDirty.value = false;
				else alert(response.message || "Failed to save GPS settings");
			} catch (err) {
				console.error("Error saving GPS settings:", err);
				alert("Failed to save GPS settings");
			} finally {
				saving.value = false;
			}
		}
		async function handleReset() {
			await fetchSettings();
		}
		async function handleRestoreDefaults() {
			try {
				saving.value = true;
				const response = await settingsApi.updateGpsSettings(GPS_DEFAULTS);
				if (response.rc === 0) {
					gpsIntervalNormal.value = GPS_DEFAULTS.gps_interval_normal;
					gpsIntervalEmergency.value = GPS_DEFAULTS.gps_interval_emergency;
					gpsStaleThreshold.value = GPS_DEFAULTS.gps_stale_threshold;
					locationHistoryRetention.value = GPS_DEFAULTS.location_history_retention;
					mapRefreshInterval.value = GPS_DEFAULTS.map_refresh_interval;
					patrolComplianceThreshold.value = GPS_DEFAULTS.patrol_compliance_threshold;
					emergencyEtaInterval.value = GPS_DEFAULTS.emergency_eta_interval;
					mapProvider.value = GPS_DEFAULTS.map_provider;
					isDirty.value = false;
				} else alert(response.message || "Failed to restore defaults");
			} catch (err) {
				console.error("Error restoring GPS defaults:", err);
				alert("Failed to restore defaults");
			} finally {
				saving.value = false;
				showRestoreModal.value = false;
			}
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppButton = AppButton_default;
			const _component_AppDialogModal = AppDialogModal_default;
			const _component_Icon = components_default;
			_push(`<!--[--><div class="gps-settings-page" data-v-53ec04fa><div class="page-header" data-v-53ec04fa><div data-v-53ec04fa><h2 class="page-title" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.page_title"))}</h2><p class="page-subtitle" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.page_subtitle"))}</p></div><div class="header-actions" data-v-53ec04fa>`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("settings.gps.restore_defaults"),
				type: "ghost",
				size: "sm",
				disabled: unref(saving),
				onClick: ($event) => showRestoreModal.value = true
			}, null, _parent));
			if (unref(isDirty)) _push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("common.reset"),
				type: "ghost",
				size: "sm",
				disabled: unref(saving),
				onClick: handleReset
			}, null, _parent));
			else _push(`<!---->`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(saving) ? unref(t)("common.saving") : unref(t)("common.save_changes"),
				type: "primary",
				size: "sm",
				disabled: unref(saving) || !unref(isDirty),
				onClick: handleSave
			}, null, _parent));
			_push(`</div></div><div class="settings-columns" data-v-53ec04fa><div class="col-left" data-v-53ec04fa><div class="settings-card" data-v-53ec04fa><div class="card-body" data-v-53ec04fa><div class="form-field" data-v-53ec04fa><label class="form-label" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.interval_normal_label"))}</label><div class="input-with-unit" data-v-53ec04fa><input${ssrRenderAttr("value", unref(gpsIntervalNormal))} type="number" min="10" max="120" class="form-input" data-v-53ec04fa><span class="input-unit" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.seconds"))}</span></div><p class="form-hint" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.interval_normal_hint"))}</p></div><div class="form-field" data-v-53ec04fa><label class="form-label" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.interval_emergency_label"))}</label><div class="input-with-unit" data-v-53ec04fa><input${ssrRenderAttr("value", unref(gpsIntervalEmergency))} type="number" min="5" max="30" class="form-input" data-v-53ec04fa><span class="input-unit" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.seconds"))}</span></div><p class="form-hint" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.interval_emergency_hint"))}</p></div><div class="form-field" data-v-53ec04fa><label class="form-label" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.stale_threshold_label"))}</label><div class="input-with-unit" data-v-53ec04fa><input${ssrRenderAttr("value", unref(gpsStaleThreshold))} type="number" min="1" max="60" class="form-input" data-v-53ec04fa><span class="input-unit" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.minutes"))}</span></div><p class="form-hint" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.stale_threshold_hint"))}</p></div><div class="form-field" data-v-53ec04fa><label class="form-label" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.history_retention_label"))}</label><div class="input-with-unit" data-v-53ec04fa><input${ssrRenderAttr("value", unref(locationHistoryRetention))} type="number" min="1" max="365" class="form-input" data-v-53ec04fa><span class="input-unit" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.days"))}</span></div><p class="form-hint" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.history_retention_hint"))}</p></div></div></div></div><div class="col-right" data-v-53ec04fa><div class="settings-card" data-v-53ec04fa><div class="card-body" data-v-53ec04fa><div class="form-field" data-v-53ec04fa><label class="form-label" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.map_refresh_label"))}</label><div class="input-with-unit" data-v-53ec04fa><input${ssrRenderAttr("value", unref(mapRefreshInterval))} type="number" min="5" max="300" class="form-input" data-v-53ec04fa><span class="input-unit" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.seconds"))}</span></div><p class="form-hint" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.map_refresh_hint"))}</p></div><div class="form-field" data-v-53ec04fa><label class="form-label" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.compliance_threshold_label"))}</label><div class="input-with-unit" data-v-53ec04fa><input${ssrRenderAttr("value", unref(patrolComplianceThreshold))} type="number" min="1" max="120" class="form-input" data-v-53ec04fa><span class="input-unit" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.minutes"))}</span></div><p class="form-hint" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.compliance_threshold_hint"))}</p></div><div class="form-field" data-v-53ec04fa><label class="form-label" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.eta_interval_label"))}</label><div class="input-with-unit" data-v-53ec04fa><input${ssrRenderAttr("value", unref(emergencyEtaInterval))} type="number" min="10" max="300" class="form-input" data-v-53ec04fa><span class="input-unit" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.seconds"))}</span></div><p class="form-hint" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.eta_interval_hint"))}</p></div><div class="form-field" data-v-53ec04fa><label class="form-label" data-v-53ec04fa>${ssrInterpolate(unref(t)("settings.gps.map_provider_label"))}</label><select class="form-select" data-v-53ec04fa><!--[-->`);
			ssrRenderList(mapProviderOptions, (opt) => {
				_push(`<option${ssrRenderAttr("value", opt.value)} data-v-53ec04fa${ssrIncludeBooleanAttr(Array.isArray(unref(mapProvider)) ? ssrLooseContain(unref(mapProvider), opt.value) : ssrLooseEqual(unref(mapProvider), opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
			});
			_push(`<!--]--></select></div></div></div></div></div></div>`);
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: unref(showRestoreModal),
				title: unref(t)("settings.gps.restore_defaults_title"),
				"max-width": "420px",
				onClose: ($event) => showRestoreModal.value = false
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "ghost",
							size: "sm",
							disabled: unref(saving),
							onClick: ($event) => showRestoreModal.value = false
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(saving) ? unref(t)("common.saving") : unref(t)("settings.gps.restore_defaults"),
							type: "danger",
							size: "sm",
							disabled: unref(saving),
							onClick: handleRestoreDefaults
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "ghost",
						size: "sm",
						disabled: unref(saving),
						onClick: ($event) => showRestoreModal.value = false
					}, null, 8, [
						"text",
						"disabled",
						"onClick"
					]), createVNode(_component_AppButton, {
						text: unref(saving) ? unref(t)("common.saving") : unref(t)("settings.gps.restore_defaults"),
						type: "danger",
						size: "sm",
						disabled: unref(saving),
						onClick: handleRestoreDefaults
					}, null, 8, ["text", "disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="restore-modal-body" data-v-53ec04fa${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:rotate-ccw",
							size: 20,
							class: "restore-modal-icon"
						}, null, _parent, _scopeId));
						_push(`<p data-v-53ec04fa${_scopeId}>${ssrInterpolate(unref(t)("settings.gps.restore_defaults_confirm"))}</p></div>`);
					} else return [createVNode("div", { class: "restore-modal-body" }, [createVNode(_component_Icon, {
						name: "lucide:rotate-ccw",
						size: 20,
						class: "restore-modal-icon"
					}), createVNode("p", null, toDisplayString(unref(t)("settings.gps.restore_defaults_confirm")), 1)])];
				}),
				_: 1
			}, _parent));
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region app/components/settings/GpsTrackingSettings.vue
var _sfc_setup$3 = GpsTrackingSettings_vue_vue_type_script_setup_true_lang_default.setup;
GpsTrackingSettings_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/settings/GpsTrackingSettings.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var GpsTrackingSettings_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(GpsTrackingSettings_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-53ec04fa"]]), { __name: "GpsTrackingSettings" });
//#endregion
//#region app/components/settings/WorkingHoursSettings.vue?vue&type=script&setup=true&lang.ts
var WorkingHoursSettings_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "WorkingHoursSettings",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const maxHoursPerDay = ref(8);
		const saving = ref(false);
		const isDirty = ref(false);
		async function fetchSettings() {
			try {
				const response = await settingsApi.getWorkingHoursSettings();
				if (response.rc === 0) maxHoursPerDay.value = response.max_hours_per_day;
			} catch (err) {
				console.error("Error fetching working hours settings:", err);
			} finally {
				isDirty.value = false;
			}
		}
		async function handleSave() {
			try {
				saving.value = true;
				const response = await settingsApi.updateWorkingHoursSettings(maxHoursPerDay.value);
				if (response.rc === 0) isDirty.value = false;
				else alert(response.message || "Failed to save working hours settings");
			} catch (err) {
				console.error("Error saving working hours settings:", err);
				alert("Failed to save working hours settings");
			} finally {
				saving.value = false;
			}
		}
		async function handleReset() {
			await fetchSettings();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppButton = AppButton_default;
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "working-hours-page" }, _attrs))} data-v-8a97a255><div class="page-header" data-v-8a97a255><div data-v-8a97a255><h2 class="page-title" data-v-8a97a255>${ssrInterpolate(unref(t)("settings.working_hours.page_title"))}</h2><p class="page-subtitle" data-v-8a97a255>${ssrInterpolate(unref(t)("settings.working_hours.page_subtitle"))}</p></div><div class="header-actions" data-v-8a97a255>`);
			if (unref(isDirty)) _push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("common.reset"),
				type: "ghost",
				size: "sm",
				disabled: unref(saving),
				onClick: handleReset
			}, null, _parent));
			else _push(`<!---->`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(saving) ? unref(t)("common.saving") : unref(t)("common.save_changes"),
				type: "primary",
				size: "sm",
				disabled: unref(saving) || !unref(isDirty),
				onClick: handleSave
			}, null, _parent));
			_push(`</div></div><div class="settings-card" data-v-8a97a255><div class="card-header" data-v-8a97a255><div class="card-icon" data-v-8a97a255>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:clock",
				size: 18
			}, null, _parent));
			_push(`</div><div data-v-8a97a255><h3 class="card-title" data-v-8a97a255>${ssrInterpolate(unref(t)("settings.working_hours.officers_title"))}</h3><p class="card-desc" data-v-8a97a255>${ssrInterpolate(unref(t)("settings.working_hours.officers_desc"))}</p></div></div><div class="card-body" data-v-8a97a255><div class="form-field" data-v-8a97a255><label class="form-label" data-v-8a97a255>${ssrInterpolate(unref(t)("settings.working_hours.max_hours_label"))}</label><div class="input-row" data-v-8a97a255><input${ssrRenderAttr("value", unref(maxHoursPerDay))} type="number" min="1" max="24" class="form-input" data-v-8a97a255><span class="input-unit" data-v-8a97a255>${ssrInterpolate(unref(t)("settings.working_hours.hours_per_day"))}</span></div><p class="form-hint" data-v-8a97a255>${ssrInterpolate(unref(t)("settings.working_hours.max_hours_hint"))}</p></div></div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/settings/WorkingHoursSettings.vue
var _sfc_setup$2 = WorkingHoursSettings_vue_vue_type_script_setup_true_lang_default.setup;
WorkingHoursSettings_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/settings/WorkingHoursSettings.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var WorkingHoursSettings_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(WorkingHoursSettings_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8a97a255"]]), { __name: "WorkingHoursSettings" });
//#endregion
//#region app/components/settings/ChangePasswordForm.vue?vue&type=script&setup=true&lang.ts
var ChangePasswordForm_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ChangePasswordForm",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const currentPassword = ref("");
		const newPassword = ref("");
		const confirmPassword = ref("");
		const showCurrentPassword = ref(false);
		const showNewPassword = ref(false);
		const showConfirmPassword = ref(false);
		const currentPasswordError = ref("");
		const newPasswordError = ref("");
		const confirmPasswordError = ref("");
		const isSubmitting = ref(false);
		const newPasswordCriteria = computed(() => {
			const pwd = newPassword.value;
			return [
				{
					key: "length",
					label: t("auth.password_min_length"),
					met: pwd.length >= 8
				},
				{
					key: "lowercase",
					label: t("auth.password_lowercase"),
					met: /[a-z]/.test(pwd)
				},
				{
					key: "uppercase",
					label: t("auth.password_uppercase"),
					met: /[A-Z]/.test(pwd)
				},
				{
					key: "digit",
					label: t("auth.password_digit"),
					met: /\d/.test(pwd)
				},
				{
					key: "special",
					label: t("auth.password_special"),
					met: /[^A-Za-z0-9]/.test(pwd)
				}
			];
		});
		const isNewPasswordValid = computed(() => newPasswordCriteria.value.every((c) => c.met));
		computed(() => {
			return newPassword.value && currentPassword.value && newPassword.value === currentPassword.value;
		});
		const isFormValid = computed(() => {
			return currentPassword.value.length > 0 && isNewPasswordValid.value && newPassword.value !== currentPassword.value && confirmPassword.value === newPassword.value;
		});
		function validateForm() {
			currentPasswordError.value = "";
			newPasswordError.value = "";
			confirmPasswordError.value = "";
			let valid = true;
			if (!currentPassword.value) {
				currentPasswordError.value = t("validation.required");
				valid = false;
			}
			if (!newPassword.value) {
				newPasswordError.value = t("validation.required");
				valid = false;
			} else if (!isNewPasswordValid.value) {
				newPasswordError.value = t("auth.password_requirements");
				valid = false;
			} else if (newPassword.value === currentPassword.value) {
				newPasswordError.value = t("auth.password_same_as_current");
				valid = false;
			}
			if (!confirmPassword.value) {
				confirmPasswordError.value = t("validation.required");
				valid = false;
			} else if (confirmPassword.value !== newPassword.value) {
				confirmPasswordError.value = t("auth.password_mismatch");
				valid = false;
			}
			return valid;
		}
		async function handleSubmit() {
			if (!validateForm()) return;
			isSubmitting.value = true;
			try {
				const response = await adminUserApi.changeMyPassword({
					current_password: currentPassword.value,
					new_password: newPassword.value
				});
				if (response.rc === 0) {
					alert(t("auth.change_password_success"));
					resetForm();
				} else if (response.rc === 247) currentPasswordError.value = t("auth.error_wrong_current_password");
				else if (response.rc === 242) newPasswordError.value = response.message || t("auth.password_requirements");
				else if (response.rc === 248) newPasswordError.value = t("auth.password_same_as_current");
				else alert(response.message || t("auth.change_password_error"));
			} catch (err) {
				console.error("Error changing password:", err);
				alert(t("auth.change_password_error"));
			} finally {
				isSubmitting.value = false;
			}
		}
		function resetForm() {
			currentPassword.value = "";
			newPassword.value = "";
			confirmPassword.value = "";
			showCurrentPassword.value = false;
			showNewPassword.value = false;
			showConfirmPassword.value = false;
			currentPasswordError.value = "";
			newPasswordError.value = "";
			confirmPasswordError.value = "";
		}
		watch(currentPassword, () => {
			currentPasswordError.value = "";
		});
		watch(newPassword, () => {
			newPasswordError.value = "";
		});
		watch(confirmPassword, () => {
			confirmPasswordError.value = "";
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_AppButton = AppButton_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "change-password-page" }, _attrs))} data-v-7bf22bb7><div class="page-header" data-v-7bf22bb7><div data-v-7bf22bb7><h2 class="page-title" data-v-7bf22bb7>${ssrInterpolate(unref(t)("auth.change_password_title"))}</h2><p class="page-subtitle" data-v-7bf22bb7>${ssrInterpolate(unref(t)("auth.change_password_subtitle"))}</p></div></div><div class="settings-card" data-v-7bf22bb7><div class="card-header" data-v-7bf22bb7><div class="card-icon" data-v-7bf22bb7>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:lock",
				size: 18
			}, null, _parent));
			_push(`</div><div data-v-7bf22bb7><h3 class="card-title" data-v-7bf22bb7>${ssrInterpolate(unref(t)("auth.change_password_form_title"))}</h3><p class="card-desc" data-v-7bf22bb7>${ssrInterpolate(unref(t)("auth.change_password_form_desc"))}</p></div></div><div class="card-body" data-v-7bf22bb7><form class="change-password-form" novalidate data-v-7bf22bb7><div class="form-field" data-v-7bf22bb7><label class="form-label" data-v-7bf22bb7>${ssrInterpolate(unref(t)("auth.current_password"))}</label><div class="password-input-wrapper" data-v-7bf22bb7><input${ssrRenderDynamicModel(unref(showCurrentPassword) ? "text" : "password", unref(currentPassword), null)}${ssrRenderAttr("type", unref(showCurrentPassword) ? "text" : "password")} class="form-input password-input"${ssrRenderAttr("placeholder", unref(t)("auth.current_password_placeholder"))} autocomplete="current-password" data-v-7bf22bb7><button type="button" class="password-toggle-btn" data-v-7bf22bb7>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: unref(showCurrentPassword) ? "lucide:eye-off" : "lucide:eye",
				size: 16
			}, null, _parent));
			_push(`</button></div>`);
			if (unref(currentPasswordError)) _push(`<span class="error-message" data-v-7bf22bb7>${ssrInterpolate(unref(currentPasswordError))}</span>`);
			else _push(`<!---->`);
			_push(`</div><div class="form-field" data-v-7bf22bb7><label class="form-label" data-v-7bf22bb7>${ssrInterpolate(unref(t)("auth.new_password"))}</label><div class="password-input-wrapper" data-v-7bf22bb7><input${ssrRenderDynamicModel(unref(showNewPassword) ? "text" : "password", unref(newPassword), null)}${ssrRenderAttr("type", unref(showNewPassword) ? "text" : "password")} class="${ssrRenderClass([{ "input--error": unref(newPasswordError) }, "form-input password-input"])}"${ssrRenderAttr("placeholder", unref(t)("auth.new_password_placeholder"))} autocomplete="new-password" data-v-7bf22bb7><button type="button" class="password-toggle-btn" data-v-7bf22bb7>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: unref(showNewPassword) ? "lucide:eye-off" : "lucide:eye",
				size: 16
			}, null, _parent));
			_push(`</button></div>`);
			if (unref(newPasswordError)) _push(`<span class="error-message" data-v-7bf22bb7>${ssrInterpolate(unref(newPasswordError))}</span>`);
			else _push(`<!---->`);
			_push(`<div class="password-criteria" data-v-7bf22bb7><!--[-->`);
			ssrRenderList(unref(newPasswordCriteria), (criterion) => {
				_push(`<div class="${ssrRenderClass([{ "password-criteria__item--met": criterion.met }, "password-criteria__item"])}" data-v-7bf22bb7>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: criterion.met ? "lucide:check" : "lucide:x",
					size: 12,
					class: "password-criteria__icon"
				}, null, _parent));
				_push(`<span data-v-7bf22bb7>${ssrInterpolate(criterion.label)}</span></div>`);
			});
			_push(`<!--]--></div></div><div class="form-field" data-v-7bf22bb7><label class="form-label" data-v-7bf22bb7>${ssrInterpolate(unref(t)("auth.confirm_password"))}</label><div class="password-input-wrapper" data-v-7bf22bb7><input${ssrRenderDynamicModel(unref(showConfirmPassword) ? "text" : "password", unref(confirmPassword), null)}${ssrRenderAttr("type", unref(showConfirmPassword) ? "text" : "password")} class="${ssrRenderClass([{ "input--error": unref(confirmPasswordError) }, "form-input password-input"])}"${ssrRenderAttr("placeholder", unref(t)("auth.confirm_password_placeholder"))} autocomplete="new-password" data-v-7bf22bb7><button type="button" class="password-toggle-btn" data-v-7bf22bb7>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: unref(showConfirmPassword) ? "lucide:eye-off" : "lucide:eye",
				size: 16
			}, null, _parent));
			_push(`</button></div>`);
			if (unref(confirmPasswordError)) _push(`<span class="error-message" data-v-7bf22bb7>${ssrInterpolate(unref(confirmPasswordError))}</span>`);
			else _push(`<!---->`);
			_push(`</div><div class="form-actions" data-v-7bf22bb7>`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("common.cancel"),
				type: "secondary",
				disabled: unref(isSubmitting),
				onClick: resetForm
			}, null, _parent));
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(isSubmitting) ? unref(t)("common.saving") : unref(t)("auth.change_password_button"),
				type: "primary",
				icon: "lucide:save",
				disabled: unref(isSubmitting) || !unref(isFormValid),
				onClick: handleSubmit
			}, null, _parent));
			_push(`</div></form></div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/settings/ChangePasswordForm.vue
var _sfc_setup$1 = ChangePasswordForm_vue_vue_type_script_setup_true_lang_default.setup;
ChangePasswordForm_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/settings/ChangePasswordForm.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var ChangePasswordForm_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(ChangePasswordForm_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-7bf22bb7"]]), { __name: "ChangePasswordForm" });
//#endregion
//#region app/pages/settings.vue?vue&type=script&setup=true&lang.ts
var settings_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "settings",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const route = useRoute();
		useRouter();
		const tabs = [
			{
				id: "service",
				label: t("settings.tabs.service_types"),
				icon: "lucide:file-warning"
			},
			{
				id: "assets",
				label: t("settings.tabs.asset_types"),
				icon: "lucide:box"
			},
			{
				id: "post-orders",
				label: t("settings.tabs.post_orders"),
				icon: "lucide:clipboard-list"
			},
			{
				id: "notifications",
				label: t("settings.tabs.notifications"),
				icon: "lucide:bell"
			},
			{
				id: "poi-trespass",
				label: t("settings.tabs.poi_trespass"),
				icon: "lucide:shield-alert"
			},
			{
				id: "gps-tracking",
				label: t("settings.tabs.gps_tracking"),
				icon: "lucide:map-pin"
			},
			{
				id: "working-hours",
				label: t("settings.tabs.working_hours"),
				icon: "lucide:clock"
			},
			{
				id: "security",
				label: t("settings.tabs.security"),
				icon: "lucide:shield"
			}
		];
		const validTabIds = tabs.map((tab) => tab.id);
		const activeTab = ref(validTabIds.includes(route.query.tab) ? route.query.tab : "service");
		const tabTitles = {
			service: t("settings.titles.service_types"),
			assets: t("settings.titles.asset_types"),
			"post-orders": t("settings.titles.post_orders"),
			notifications: t("settings.titles.notifications"),
			"poi-trespass": t("settings.titles.poi_trespass"),
			"gps-tracking": t("settings.titles.gps_tracking"),
			"working-hours": t("settings.titles.working_hours"),
			security: t("settings.titles.security")
		};
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_Icon = components_default;
			const _component_ServiceTypes = ServiceTypes_default;
			const _component_AssetTypes = AssetTypes_default;
			const _component_PostOrderSectionTypes = PostOrderSectionTypes_default;
			const _component_PushNotificationSettings = PushNotificationSettings_default;
			const _component_PoiTrespassSettings = PoiTrespassSettings_default;
			const _component_GpsTrackingSettings = GpsTrackingSettings_default;
			const _component_WorkingHoursSettings = WorkingHoursSettings_default;
			const _component_ChangePasswordForm = ChangePasswordForm_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: unref(t)("settings.page_title"),
				breadcrumb: [{ label: "Admin" }, { label: unref(t)("settings.page_title") }]
			}, null, _parent));
			_push(`<div class="settings-page" data-v-aa133a6d><div class="settings-tabs" data-v-aa133a6d><!--[-->`);
			ssrRenderList(tabs, (tab) => {
				_push(`<button class="${ssrRenderClass([{ "tab-btn--active": unref(activeTab) === tab.id }, "tab-btn"])}" data-v-aa133a6d>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: tab.icon,
					size: 16
				}, null, _parent));
				_push(`<span data-v-aa133a6d>${ssrInterpolate(tab.label)}</span></button>`);
			});
			_push(`<!--]--></div><div class="settings-content" data-v-aa133a6d>`);
			if (unref(activeTab) === "service") _push(ssrRenderComponent(_component_ServiceTypes, null, null, _parent));
			else if (unref(activeTab) === "assets") _push(ssrRenderComponent(_component_AssetTypes, null, null, _parent));
			else if (unref(activeTab) === "post-orders") _push(ssrRenderComponent(_component_PostOrderSectionTypes, null, null, _parent));
			else if (unref(activeTab) === "notifications") _push(ssrRenderComponent(_component_PushNotificationSettings, null, null, _parent));
			else if (unref(activeTab) === "poi-trespass") _push(ssrRenderComponent(_component_PoiTrespassSettings, null, null, _parent));
			else if (unref(activeTab) === "gps-tracking") _push(ssrRenderComponent(_component_GpsTrackingSettings, null, null, _parent));
			else if (unref(activeTab) === "working-hours") _push(ssrRenderComponent(_component_WorkingHoursSettings, null, null, _parent));
			else if (unref(activeTab) === "security") _push(ssrRenderComponent(_component_ChangePasswordForm, null, null, _parent));
			else _push(`<div class="content-card" data-v-aa133a6d><h2 class="content-title" data-v-aa133a6d>${ssrInterpolate(tabTitles[unref(activeTab)])}</h2><p class="content-placeholder text-secondary" data-v-aa133a6d>${ssrInterpolate(unref(t)("settings.placeholder", { section: tabTitles[unref(activeTab)] }))}</p></div>`);
			_push(`</div></div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/settings.vue
var _sfc_setup = settings_vue_vue_type_script_setup_true_lang_default.setup;
settings_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var settings_default = /*#__PURE__*/ _plugin_vue_export_helper_default(settings_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-aa133a6d"]]);

export { settings_default as default };
//# sourceMappingURL=settings-DI14o5Kv.mjs.map
