import { t as components_default } from './components-DWHbB934.mjs';
import { u as useRoute, a as useTranslation, c as useToastStore, A as ApiError, B as BaseApiClient, d as useRuntimeConfig } from '../virtual/entry.mjs';
import { L as LoadingModal_default } from './LoadingModal-Ca3iKXhe.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { c as communityApi } from './community-jevurWQo.mjs';
import { u as useFileApi } from './useFileApi-CLWuZDlq.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { A as AppButton_default } from './AppButton-sr0dx6mm.mjs';
import { I as ImageUpload_default } from './ImageUpload-CRnliurs.mjs';
import { A as AppDialogModal_default } from './AppDialogModal-CYp4oRY_.mjs';
import { defineComponent, ref, unref, computed, watch, mergeProps, reactive, withCtx, createVNode, toDisplayString, createTextVNode, withDirectives, vModelText, openBlock, createBlock, createCommentVNode, vModelCheckbox, withKeys, Fragment, renderList, vModelSelect, nextTick, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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

//#region app/api/resident.ts
var ResidentApi = class extends BaseApiClient {
	/**
	* Admin: Get list of residents with optional filters, search, and sorting
	*/
	async getResidents(params, options) {
		const request = {
			"#request": "Resident/get_residents",
			...params
		};
		return this.request(request, options);
	}
	/**
	* Admin: Get full details of a single resident
	*/
	async getResident(userId, options) {
		const request = {
			"#request": "Resident/get_resident",
			user_id: userId
		};
		return this.request(request, options);
	}
	/**
	* Admin: Create a new resident and associate them with a community
	*/
	async addResident(params, options) {
		const request = {
			"#request": "Resident/add_resident",
			...params
		};
		return this.request(request, options);
	}
	/**
	* Admin: Update an existing resident (partial update)
	*/
	async updateResident(params, options) {
		const request = {
			"#request": "Resident/update_resident",
			...params
		};
		return this.request(request, options);
	}
	/**
	* Admin: Soft-delete a resident (only allowed if never logged in)
	*/
	async deleteResident(userId, options) {
		const request = {
			"#request": "Resident/delete_resident",
			user_id: userId
		};
		return this.request(request, options);
	}
};
var residentApi = new ResidentApi();
//#endregion
//#region app/components/residents/AddForm.vue?vue&type=script&setup=true&lang.ts
var AddForm_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AddForm",
	__ssrInlineRender: true,
	props: {
		show: { type: Boolean },
		communityId: {},
		communityName: {}
	},
	emits: ["close", "submitted"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const { t } = useTranslation();
		const toastStore = useToastStore();
		const form = reactive({
			firstName: "",
			lastName: "",
			mobile: "",
			email: "",
			address: "",
			instructions: "",
			communicationTest: false,
			vehicleNumbers: [],
			communityId: Number(props.communityId) || 0
		});
		const isSubmitting = ref(false);
		const submitError = ref("");
		const errors = reactive({});
		const isFormValid = computed(() => !!form.firstName.trim() && !!form.mobile.trim() && form.communityId > 0);
		const newVehicle = ref("");
		function addVehicle() {
			if (newVehicle.value.trim()) {
				form.vehicleNumbers.push(newVehicle.value.trim());
				newVehicle.value = "";
			}
		}
		function removeVehicle(index) {
			form.vehicleNumbers.splice(index, 1);
		}
		function validate() {
			const phonePattern = /^\+?[\d\s().-]{7,}$/;
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			errors.firstName = !form.firstName.trim() ? t("validation.required") : "";
			errors.mobile = !form.mobile.trim() ? t("validation.required") : !phonePattern.test(form.mobile.trim()) ? t("residents.invalid_mobile") : "";
			errors.email = form.email.trim() && !emailPattern.test(form.email.trim()) ? t("residents.invalid_email") : "";
			errors.communityId = form.communityId <= 0 ? t("validation.required") : "";
			return !errors.firstName && !errors.mobile && !errors.email && !errors.communityId;
		}
		function handleSubmitError(error) {
			if (error instanceof ApiError) {
				if (error.rc === 224 || error.rc === 241) errors.mobile = t(error.rc === 224 ? "residents.invalid_mobile" : "residents.mobile_exists");
				else if (error.rc === 235 || error.rc === 240) errors.email = t(error.rc === 235 ? "residents.invalid_email" : "residents.email_exists");
				else if (error.rc === 500 || error.rc === 505) errors.communityId = t(error.rc === 500 ? "residents.community_not_found" : "residents.community_inactive");
				else submitError.value = error.message;
				return;
			}
			submitError.value = t("residents.create_failed");
		}
		function resetForm() {
			form.firstName = "";
			form.lastName = "";
			form.mobile = "";
			form.email = "";
			form.address = "";
			form.instructions = "";
			form.communicationTest = false;
			form.vehicleNumbers = [];
			form.communityId = Number(props.communityId) || 0;
			newVehicle.value = "";
			submitError.value = "";
			Object.keys(errors).forEach((key) => {
				errors[key] = "";
			});
		}
		function handleCancel() {
			emit("close");
		}
		async function handleSubmit() {
			if (!validate()) return;
			addVehicle();
			isSubmitting.value = true;
			submitError.value = "";
			try {
				await residentApi.addResident({
					first_name: form.firstName.trim(),
					last_name: form.lastName.trim() || void 0,
					phone_num: form.mobile.trim(),
					email: form.email.trim() || void 0,
					community_id: form.communityId,
					address: form.address.trim() || void 0,
					vehicles: form.vehicleNumbers,
					instructions: form.instructions.trim() || void 0,
					communication_test: form.communicationTest
				}, { showLoading: false });
				toastStore.success(t("residents.create_success"));
				emit("submitted");
				emit("close");
			} catch (error) {
				handleSubmitError(error);
			} finally {
				isSubmitting.value = false;
			}
		}
		watch(() => props.show, (show) => {
			if (show) resetForm();
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppDialogModal = AppDialogModal_default;
			const _component_AppButton = AppButton_default;
			const _component_Icon = components_default;
			const _component_Badge = Badge_default;
			_push(ssrRenderComponent(_component_AppDialogModal, mergeProps({
				show: __props.show,
				title: unref(t)("residents.add_title"),
				"max-width": "900px",
				onClose: handleCancel
			}, _attrs), {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "secondary",
							disabled: isSubmitting.value,
							onClick: handleCancel
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: isSubmitting.value ? unref(t)("common.saving") : unref(t)("common.save"),
							type: "primary",
							icon: "lucide:save",
							disabled: isSubmitting.value || !isFormValid.value,
							onClick: handleSubmit
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "secondary",
						disabled: isSubmitting.value,
						onClick: handleCancel
					}, null, 8, ["text", "disabled"]), createVNode(_component_AppButton, {
						text: isSubmitting.value ? unref(t)("common.saving") : unref(t)("common.save"),
						type: "primary",
						icon: "lucide:save",
						disabled: isSubmitting.value || !isFormValid.value,
						onClick: handleSubmit
					}, null, 8, ["text", "disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="add-resident-form" data-v-5a2da93b${_scopeId}>`);
						_push(ssrRenderComponent(LoadingModal_default, {
							show: isSubmitting.value,
							message: unref(t)("common.loading")
						}, null, _parent, _scopeId));
						_push(`<div class="form-body" data-v-5a2da93b${_scopeId}><div class="form-column form-column--left" data-v-5a2da93b${_scopeId}><div class="form-section" data-v-5a2da93b${_scopeId}><h3 class="section-title" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.basic_info"))}</h3><div class="form-field" data-v-5a2da93b${_scopeId}><span class="field-label" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.community"))}</span><span class="field-value" data-v-5a2da93b${_scopeId}>${ssrInterpolate(__props.communityName)}</span></div><div class="form-field" data-v-5a2da93b${_scopeId}><label class="field-label" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.first_name"))} <span class="required" data-v-5a2da93b${_scopeId}>*</span></label><input${ssrRenderAttr("value", form.firstName)} type="text"${ssrRenderAttr("placeholder", unref(t)("residents.first_name_placeholder"))} class="${ssrRenderClass([{ error: errors.firstName }, "field-input input-standard"])}" data-v-5a2da93b${_scopeId}>`);
						if (errors.firstName) _push(`<span class="error-message" data-v-5a2da93b${_scopeId}>${ssrInterpolate(errors.firstName)}</span>`);
						else _push(`<!---->`);
						_push(`</div><div class="form-field" data-v-5a2da93b${_scopeId}><label class="field-label" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.last_name"))}</label><input${ssrRenderAttr("value", form.lastName)} type="text" class="field-input input-standard"${ssrRenderAttr("placeholder", unref(t)("residents.last_name_placeholder"))} data-v-5a2da93b${_scopeId}></div><div class="form-field" data-v-5a2da93b${_scopeId}><label class="field-label" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.mobile"))} <span class="required" data-v-5a2da93b${_scopeId}>*</span></label><input${ssrRenderAttr("value", form.mobile)} type="tel"${ssrRenderAttr("placeholder", unref(t)("residents.mobile_placeholder"))} class="${ssrRenderClass([{ error: errors.mobile }, "field-input input-standard"])}" data-v-5a2da93b${_scopeId}>`);
						if (errors.mobile) _push(`<span class="error-message" data-v-5a2da93b${_scopeId}>${ssrInterpolate(errors.mobile)}</span>`);
						else _push(`<!---->`);
						_push(`<span class="field-hint" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.mobile_hint"))}</span></div><div class="form-field" data-v-5a2da93b${_scopeId}><label class="field-label" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.email"))}</label><input${ssrRenderAttr("value", form.email)} type="email"${ssrRenderAttr("placeholder", unref(t)("residents.email_placeholder"))} class="${ssrRenderClass([{ error: errors.email }, "field-input input-standard"])}" data-v-5a2da93b${_scopeId}>`);
						if (errors.email) _push(`<span class="error-message" data-v-5a2da93b${_scopeId}>${ssrInterpolate(errors.email)}</span>`);
						else _push(`<!---->`);
						_push(`</div><div class="form-field" data-v-5a2da93b${_scopeId}><label class="field-label" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.address"))}</label><input${ssrRenderAttr("value", form.address)} type="text"${ssrRenderAttr("placeholder", unref(t)("residents.address_placeholder"))} class="${ssrRenderClass([{ error: errors.address }, "field-input input-standard"])}" data-v-5a2da93b${_scopeId}>`);
						if (errors.address) _push(`<span class="error-message" data-v-5a2da93b${_scopeId}>${ssrInterpolate(errors.address)}</span>`);
						else _push(`<!---->`);
						_push(`</div></div></div><div class="form-column form-column--right" data-v-5a2da93b${_scopeId}><div class="form-section" data-v-5a2da93b${_scopeId}><h3 class="section-title" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.settings"))}</h3><div class="form-field" data-v-5a2da93b${_scopeId}><label class="field-label" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.instructions"))}</label><textarea class="field-input field-input--textarea input-standard"${ssrRenderAttr("placeholder", unref(t)("residents.instructions_placeholder"))} data-v-5a2da93b${_scopeId}>${ssrInterpolate(form.instructions)}</textarea></div><div class="form-field" data-v-5a2da93b${_scopeId}><label class="checkbox-label" data-v-5a2da93b${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(form.communicationTest) ? ssrLooseContain(form.communicationTest, null) : form.communicationTest) ? " checked" : ""} type="checkbox" data-v-5a2da93b${_scopeId}><span data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.enable_communication_test"))}</span></label><span class="field-hint" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.communication_test_hint"))}</span></div></div><div class="form-section" data-v-5a2da93b${_scopeId}><h3 class="section-title" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.vehicle_numbers"))}</h3><div class="form-field" data-v-5a2da93b${_scopeId}><div class="vehicle-input" data-v-5a2da93b${_scopeId}><input${ssrRenderAttr("value", newVehicle.value)} type="text" class="field-input input-standard"${ssrRenderAttr("placeholder", unref(t)("residents.vehicle_placeholder"))} data-v-5a2da93b${_scopeId}>`);
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.add"),
							type: "secondary",
							icon: "lucide:plus",
							onClick: addVehicle
						}, null, _parent, _scopeId));
						_push(`</div><span class="field-hint" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.vehicle_hint"))}</span>`);
						if (form.vehicleNumbers.length) {
							_push(`<div class="vehicle-tags" data-v-5a2da93b${_scopeId}><!--[-->`);
							ssrRenderList(form.vehicleNumbers, (vehicle, index) => {
								_push(`<span class="vehicle-tag" data-v-5a2da93b${_scopeId}>${ssrInterpolate(vehicle)} <button type="button" class="remove-btn" data-v-5a2da93b${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:x",
									size: 12
								}, null, _parent, _scopeId));
								_push(`</button></span>`);
							});
							_push(`<!--]--></div>`);
						} else _push(`<!---->`);
						_push(`</div></div><div class="form-section form-section--info" data-v-5a2da93b${_scopeId}><div class="info-row" data-v-5a2da93b${_scopeId}><span class="info-label" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.community"))}:</span><span class="info-value" data-v-5a2da93b${_scopeId}>${ssrInterpolate(__props.communityName)}</span></div><div class="info-row" data-v-5a2da93b${_scopeId}><span class="info-label" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.status"))}:</span>`);
						_push(ssrRenderComponent(_component_Badge, {
							type: "status",
							value: "active"
						}, null, _parent, _scopeId));
						_push(`</div><div class="info-row" data-v-5a2da93b${_scopeId}><span class="info-label" data-v-5a2da93b${_scopeId}>${ssrInterpolate(unref(t)("residents.registration_date"))}:</span><span class="info-value" data-v-5a2da93b${_scopeId}>${ssrInterpolate((/* @__PURE__ */ new Date()).toISOString().split("T")[0])}</span></div></div></div></div>`);
						if (submitError.value) _push(`<p class="submit-error" data-v-5a2da93b${_scopeId}>${ssrInterpolate(submitError.value)}</p>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "add-resident-form" }, [
						createVNode(LoadingModal_default, {
							show: isSubmitting.value,
							message: unref(t)("common.loading")
						}, null, 8, ["show", "message"]),
						createVNode("div", { class: "form-body" }, [createVNode("div", { class: "form-column form-column--left" }, [createVNode("div", { class: "form-section" }, [
							createVNode("h3", { class: "section-title" }, toDisplayString(unref(t)("residents.basic_info")), 1),
							createVNode("div", { class: "form-field" }, [createVNode("span", { class: "field-label" }, toDisplayString(unref(t)("residents.community")), 1), createVNode("span", { class: "field-value" }, toDisplayString(__props.communityName), 1)]),
							createVNode("div", { class: "form-field" }, [
								createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(unref(t)("residents.first_name")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.firstName = $event,
									type: "text",
									class: ["field-input input-standard", { error: errors.firstName }],
									placeholder: unref(t)("residents.first_name_placeholder")
								}, null, 10, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.firstName]]),
								errors.firstName ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-message"
								}, toDisplayString(errors.firstName), 1)) : createCommentVNode("", true)
							]),
							createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("residents.last_name")), 1), withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => form.lastName = $event,
								type: "text",
								class: "field-input input-standard",
								placeholder: unref(t)("residents.last_name_placeholder")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.lastName]])]),
							createVNode("div", { class: "form-field" }, [
								createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(unref(t)("residents.mobile")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.mobile = $event,
									type: "tel",
									class: ["field-input input-standard", { error: errors.mobile }],
									placeholder: unref(t)("residents.mobile_placeholder")
								}, null, 10, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.mobile]]),
								errors.mobile ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-message"
								}, toDisplayString(errors.mobile), 1)) : createCommentVNode("", true),
								createVNode("span", { class: "field-hint" }, toDisplayString(unref(t)("residents.mobile_hint")), 1)
							]),
							createVNode("div", { class: "form-field" }, [
								createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("residents.email")), 1),
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.email = $event,
									type: "email",
									class: ["field-input input-standard", { error: errors.email }],
									placeholder: unref(t)("residents.email_placeholder")
								}, null, 10, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.email]]),
								errors.email ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-message"
								}, toDisplayString(errors.email), 1)) : createCommentVNode("", true)
							]),
							createVNode("div", { class: "form-field" }, [
								createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("residents.address")), 1),
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.address = $event,
									type: "text",
									class: ["field-input input-standard", { error: errors.address }],
									placeholder: unref(t)("residents.address_placeholder")
								}, null, 10, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.address]]),
								errors.address ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-message"
								}, toDisplayString(errors.address), 1)) : createCommentVNode("", true)
							])
						])]), createVNode("div", { class: "form-column form-column--right" }, [
							createVNode("div", { class: "form-section" }, [
								createVNode("h3", { class: "section-title" }, toDisplayString(unref(t)("residents.settings")), 1),
								createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("residents.instructions")), 1), withDirectives(createVNode("textarea", {
									"onUpdate:modelValue": ($event) => form.instructions = $event,
									class: "field-input field-input--textarea input-standard",
									placeholder: unref(t)("residents.instructions_placeholder")
								}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.instructions]])]),
								createVNode("div", { class: "form-field" }, [createVNode("label", { class: "checkbox-label" }, [withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.communicationTest = $event,
									type: "checkbox"
								}, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, form.communicationTest]]), createVNode("span", null, toDisplayString(unref(t)("residents.enable_communication_test")), 1)]), createVNode("span", { class: "field-hint" }, toDisplayString(unref(t)("residents.communication_test_hint")), 1)])
							]),
							createVNode("div", { class: "form-section" }, [createVNode("h3", { class: "section-title" }, toDisplayString(unref(t)("residents.vehicle_numbers")), 1), createVNode("div", { class: "form-field" }, [
								createVNode("div", { class: "vehicle-input" }, [withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => newVehicle.value = $event,
									type: "text",
									class: "field-input input-standard",
									placeholder: unref(t)("residents.vehicle_placeholder"),
									onKeyup: withKeys(addVehicle, ["enter"])
								}, null, 40, ["onUpdate:modelValue", "placeholder"]), [[vModelText, newVehicle.value]]), createVNode(_component_AppButton, {
									text: unref(t)("common.add"),
									type: "secondary",
									icon: "lucide:plus",
									onClick: addVehicle
								}, null, 8, ["text"])]),
								createVNode("span", { class: "field-hint" }, toDisplayString(unref(t)("residents.vehicle_hint")), 1),
								form.vehicleNumbers.length ? (openBlock(), createBlock("div", {
									key: 0,
									class: "vehicle-tags"
								}, [(openBlock(true), createBlock(Fragment, null, renderList(form.vehicleNumbers, (vehicle, index) => {
									return openBlock(), createBlock("span", {
										key: index,
										class: "vehicle-tag"
									}, [createTextVNode(toDisplayString(vehicle) + " ", 1), createVNode("button", {
										type: "button",
										class: "remove-btn",
										onClick: ($event) => removeVehicle(index)
									}, [createVNode(_component_Icon, {
										name: "lucide:x",
										size: 12
									})], 8, ["onClick"])]);
								}), 128))])) : createCommentVNode("", true)
							])]),
							createVNode("div", { class: "form-section form-section--info" }, [
								createVNode("div", { class: "info-row" }, [createVNode("span", { class: "info-label" }, toDisplayString(unref(t)("residents.community")) + ":", 1), createVNode("span", { class: "info-value" }, toDisplayString(__props.communityName), 1)]),
								createVNode("div", { class: "info-row" }, [createVNode("span", { class: "info-label" }, toDisplayString(unref(t)("residents.status")) + ":", 1), createVNode(_component_Badge, {
									type: "status",
									value: "active"
								})]),
								createVNode("div", { class: "info-row" }, [createVNode("span", { class: "info-label" }, toDisplayString(unref(t)("residents.registration_date")) + ":", 1), createVNode("span", { class: "info-value" }, toDisplayString((/* @__PURE__ */ new Date()).toISOString().split("T")[0]), 1)])
							])
						])]),
						submitError.value ? (openBlock(), createBlock("p", {
							key: 0,
							class: "submit-error"
						}, toDisplayString(submitError.value), 1)) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/residents/AddForm.vue
var _sfc_setup$3 = AddForm_vue_vue_type_script_setup_true_lang_default.setup;
AddForm_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/residents/AddForm.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var AddForm_default = /*#__PURE__*/ _plugin_vue_export_helper_default(AddForm_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-5a2da93b"]]);
//#endregion
//#region app/components/residents/EditModal.vue?vue&type=script&setup=true&lang.ts
var EditModal_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "EditModal",
	__ssrInlineRender: true,
	props: {
		show: { type: Boolean },
		residentId: {},
		communityId: {},
		communityName: {}
	},
	emits: ["close", "submitted"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const { t } = useTranslation();
		const toastStore = useToastStore();
		const { uploadSmallFile } = useFileApi();
		const config = useRuntimeConfig();
		const resident = ref(null);
		const isLoading = ref(false);
		const isSubmitting = ref(false);
		const loadError = ref("");
		const submitError = ref("");
		const newVehicle = ref("");
		const newImages = ref([]);
		const keptImages = ref([]);
		let nextImageId = 0;
		const imageUploadRefs = /* @__PURE__ */ new Map();
		function createNewImage() {
			return {
				id: nextImageId++,
				preview: "",
				file: null
			};
		}
		const errors = reactive({});
		const communities = ref([]);
		const isLoadingCommunities = ref(false);
		const form = reactive({
			firstName: "",
			lastName: "",
			mobile: "",
			email: "",
			address: "",
			instructions: "",
			vehicles: [],
			communicationTest: false,
			active: true,
			communityId: Number(props.communityId) || 0
		});
		const isPhoneChanged = computed(() => !!resident.value && form.mobile !== resident.value.phone_num && !!form.mobile);
		const isDeactivating = computed(() => !!resident.value && resident.value.is_active && !form.active);
		const hasImageChanges = computed(() => !!resident.value && (newImages.value.some((image) => !!image.file) || keptImages.value.length !== resident.value.images.length));
		const isFormValid = computed(() => !!form.firstName.trim() && !!form.mobile.trim() && form.communityId > 0);
		const imageItems = computed(() => keptImages.value.map((id) => ({
			id,
			isNew: false
		})));
		function imageUrl(imageId) {
			return imageId.startsWith("http") ? imageId : `${config.public.apiBase}/files/n/${imageId}.png`;
		}
		function resetState() {
			resident.value = null;
			loadError.value = "";
			submitError.value = "";
			newVehicle.value = "";
			newImages.value = [];
			keptImages.value = [];
			Object.keys(errors).forEach((key) => {
				errors[key] = "";
			});
		}
		function populateForm(value) {
			form.firstName = value.first_name || "";
			form.lastName = value.last_name || "";
			form.mobile = value.phone_num || "";
			form.email = value.email?.endsWith("@placeholder.local") ? "" : value.email || "";
			form.address = value.address || "";
			form.instructions = value.instructions || "";
			form.vehicles = [...value.vehicles || []];
			form.communicationTest = value.communication_test;
			form.active = value.is_active;
			form.communityId = value.community_id;
			keptImages.value = [...value.images || []];
		}
		async function loadCommunities() {
			isLoadingCommunities.value = true;
			try {
				const response = await communityApi.getCommunities({ include_inactive: false }, { showLoading: false });
				communities.value = response.communities.map((community) => ({
					id: community.community_id,
					name: community.name
				}));
			} finally {
				isLoadingCommunities.value = false;
			}
		}
		async function loadResident() {
			resetState();
			isLoading.value = true;
			try {
				const response = await residentApi.getResident(props.residentId, { showLoading: false });
				if (!response.resident) throw new Error(t("residents.not_found"));
				resident.value = response.resident;
				populateForm(response.resident);
				await loadCommunities();
			} catch (error) {
				loadError.value = error instanceof ApiError && error.rc === 540 ? t("residents.not_found") : t("residents.load_failed");
			} finally {
				isLoading.value = false;
			}
		}
		function addVehicle() {
			const vehicle = newVehicle.value.trim();
			if (vehicle) {
				form.vehicles.push(vehicle);
				newVehicle.value = "";
			}
		}
		function removeVehicle(index) {
			form.vehicles.splice(index, 1);
		}
		async function addImageUpload() {
			const image = createNewImage();
			newImages.value.push(image);
			await nextTick();
			imageUploadRefs.get(image.id)?.openFilePicker();
		}
		function setImageUploadRef(id, instance) {
			if (instance) imageUploadRefs.set(id, instance);
			else imageUploadRefs.delete(id);
		}
		function updateNewImage(index, preview) {
			const image = newImages.value[index];
			if (!image) return;
			if (!preview) {
				newImages.value.splice(index, 1);
				return;
			}
			image.preview = preview;
		}
		function selectNewImage(index, file) {
			const image = newImages.value[index];
			if (image) image.file = file;
		}
		function removeImage(imageId) {
			keptImages.value = keptImages.value.filter((id) => id !== imageId);
		}
		async function uploadNewImages() {
			const imageIds = [];
			for (const image of newImages.value) {
				if (!image.file) continue;
				const fileId = await uploadSmallFile(image.file);
				if (!fileId) throw new Error(t("residents.image_upload_failed"));
				imageIds.push(fileId);
			}
			return imageIds;
		}
		function validate() {
			const phonePattern = /^\+?[\d\s().-]{7,}$/;
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			errors.firstName = form.firstName.trim() ? "" : t("validation.required");
			errors.mobile = !form.mobile.trim() ? t("validation.required") : !phonePattern.test(form.mobile.trim()) ? t("residents.invalid_mobile") : "";
			errors.email = form.email.trim() && !emailPattern.test(form.email.trim()) ? t("residents.invalid_email") : "";
			errors.communityId = form.communityId > 0 ? "" : t("validation.required");
			return !errors.firstName && !errors.mobile && !errors.email && !errors.communityId;
		}
		function handleSubmitError(error) {
			if (error instanceof ApiError) {
				if (error.rc === 224 || error.rc === 241) errors.mobile = t(error.rc === 224 ? "residents.invalid_mobile" : "residents.mobile_exists");
				else if (error.rc === 235 || error.rc === 240) errors.email = t(error.rc === 235 ? "residents.invalid_email" : "residents.email_exists");
				else if (error.rc === 321) submitError.value = t("residents.image_not_found");
				else if (error.rc === 500 || error.rc === 505 || error.rc === 542) errors.communityId = t(error.rc === 500 ? "residents.community_not_found" : error.rc === 505 ? "residents.community_inactive" : "residents.community_already_assigned");
				else if (error.rc === 540) submitError.value = t("residents.not_found");
				else submitError.value = error.message;
				return;
			}
			submitError.value = t("residents.update_failed");
		}
		async function handleSubmit() {
			if (!resident.value || !validate()) return;
			addVehicle();
			const original = resident.value;
			const payload = { user_id: original.user_id };
			if (form.firstName !== original.first_name) payload.first_name = form.firstName.trim();
			if (form.lastName !== original.last_name) payload.last_name = form.lastName.trim();
			if (form.mobile !== original.phone_num) payload.phone_num = form.mobile.trim();
			if (form.email !== (original.email?.endsWith("@placeholder.local") ? "" : original.email || "")) payload.email = form.email.trim();
			if (form.address !== (original.address || "")) payload.address = form.address.trim();
			if (form.instructions !== (original.instructions || "")) payload.instructions = form.instructions.trim();
			if (form.communityId !== original.community_id) payload.community_id = form.communityId;
			if (JSON.stringify(form.vehicles) !== JSON.stringify(original.vehicles || [])) payload.vehicles = form.vehicles;
			if (form.communicationTest !== original.communication_test) payload.communication_test = form.communicationTest;
			if (form.active !== original.is_active) payload.is_active = form.active;
			if (Object.keys(payload).length === 1 && !hasImageChanges.value) {
				emit("close");
				return;
			}
			isSubmitting.value = true;
			submitError.value = "";
			try {
				if (hasImageChanges.value) {
					payload.keep_images = keptImages.value;
					payload.new_image_ids = await uploadNewImages();
				}
				await residentApi.updateResident(payload, { showLoading: false });
				toastStore.success(t("residents.update_success"));
				emit("submitted");
				emit("close");
			} catch (error) {
				handleSubmitError(error);
			} finally {
				isSubmitting.value = false;
			}
		}
		watch(() => props.show, (show) => {
			if (show) loadResident();
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppDialogModal = AppDialogModal_default;
			const _component_Icon = components_default;
			const _component_AppButton = AppButton_default;
			_push(ssrRenderComponent(_component_AppDialogModal, mergeProps({
				show: __props.show,
				title: resident.value ? `${unref(t)("residents.edit_title")} — ${resident.value.first_name} ${resident.value.last_name}` : unref(t)("residents.edit_title"),
				"max-width": "900px",
				onClose: ($event) => emit("close")
			}, _attrs), {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "secondary",
							disabled: isSubmitting.value,
							onClick: ($event) => emit("close")
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: isSubmitting.value ? unref(t)("common.saving") : unref(t)("common.save"),
							type: "primary",
							disabled: isLoading.value || isSubmitting.value || !isFormValid.value,
							onClick: handleSubmit
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "secondary",
						disabled: isSubmitting.value,
						onClick: ($event) => emit("close")
					}, null, 8, [
						"text",
						"disabled",
						"onClick"
					]), createVNode(_component_AppButton, {
						text: isSubmitting.value ? unref(t)("common.saving") : unref(t)("common.save"),
						type: "primary",
						disabled: isLoading.value || isSubmitting.value || !isFormValid.value,
						onClick: handleSubmit
					}, null, 8, ["text", "disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="edit-resident-modal" data-v-dd408579${_scopeId}>`);
						_push(ssrRenderComponent(LoadingModal_default, {
							show: isSubmitting.value,
							message: unref(t)("common.loading")
						}, null, _parent, _scopeId));
						if (isLoading.value) {
							_push(`<div class="modal-loading" data-v-dd408579${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:loader-2",
								size: 28,
								class: "spin"
							}, null, _parent, _scopeId));
							_push(`${ssrInterpolate(unref(t)("common.loading"))}</div>`);
						} else if (loadError.value) _push(`<p class="submit-error" data-v-dd408579${_scopeId}>${ssrInterpolate(loadError.value)}</p>`);
						else if (resident.value) {
							_push(`<!--[--><div class="form-grid" data-v-dd408579${_scopeId}><div class="form-section" data-v-dd408579${_scopeId}><div class="form-row" data-v-dd408579${_scopeId}><div class="form-field" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.first_name"))} <span class="required" data-v-dd408579${_scopeId}>*</span></label><input${ssrRenderAttr("value", form.firstName)} class="${ssrRenderClass([{ error: errors.firstName }, "input-standard"])}" data-v-dd408579${_scopeId}>`);
							if (errors.firstName) _push(`<span class="error-message" data-v-dd408579${_scopeId}>${ssrInterpolate(errors.firstName)}</span>`);
							else _push(`<!---->`);
							_push(`</div><div class="form-field" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.last_name"))}</label><input${ssrRenderAttr("value", form.lastName)} class="input-standard" data-v-dd408579${_scopeId}></div></div><div class="form-field" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.mobile"))} <span class="required" data-v-dd408579${_scopeId}>*</span></label><input${ssrRenderAttr("value", form.mobile)} type="tel" class="${ssrRenderClass([{ error: errors.mobile }, "input-standard"])}" data-v-dd408579${_scopeId}>`);
							if (errors.mobile) _push(`<span class="error-message" data-v-dd408579${_scopeId}>${ssrInterpolate(errors.mobile)}</span>`);
							else _push(`<!---->`);
							if (isPhoneChanged.value) {
								_push(`<p class="warning" data-v-dd408579${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:triangle-alert",
									size: 16
								}, null, _parent, _scopeId));
								_push(`${ssrInterpolate(unref(t)("residents.phone_change_warning"))}</p>`);
							} else _push(`<!---->`);
							_push(`</div><div class="form-field" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.email"))}</label><input${ssrRenderAttr("value", form.email)} type="email" class="${ssrRenderClass([{ error: errors.email }, "input-standard"])}" data-v-dd408579${_scopeId}>`);
							if (errors.email) _push(`<span class="error-message" data-v-dd408579${_scopeId}>${ssrInterpolate(errors.email)}</span>`);
							else _push(`<!---->`);
							_push(`</div><div class="form-field" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.address"))}</label><textarea data-v-dd408579${_scopeId}>${ssrInterpolate(form.address)}</textarea></div><div class="form-field" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.instructions"))}</label><textarea data-v-dd408579${_scopeId}>${ssrInterpolate(form.instructions)}</textarea></div></div><div class="form-section" data-v-dd408579${_scopeId}><div class="form-field" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.community"))}</label><select${ssrIncludeBooleanAttr(isLoadingCommunities.value) ? " disabled" : ""} class="${ssrRenderClass([{ error: errors.communityId }, "input-standard"])}" data-v-dd408579${_scopeId}><option${ssrRenderAttr("value", 0)} data-v-dd408579${ssrIncludeBooleanAttr(Array.isArray(form.communityId) ? ssrLooseContain(form.communityId, 0) : ssrLooseEqual(form.communityId, 0)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(unref(t)("residents.select_community"))}</option><!--[-->`);
							ssrRenderList(communities.value, (community) => {
								_push(`<option${ssrRenderAttr("value", community.id)} data-v-dd408579${ssrIncludeBooleanAttr(Array.isArray(form.communityId) ? ssrLooseContain(form.communityId, community.id) : ssrLooseEqual(form.communityId, community.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(community.name)}</option>`);
							});
							_push(`<!--]--></select>`);
							if (errors.communityId) _push(`<span class="error-message" data-v-dd408579${_scopeId}>${ssrInterpolate(errors.communityId)}</span>`);
							else _push(`<!---->`);
							_push(`</div><div class="form-field" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.vehicle_numbers"))}</label><div class="vehicle-input" data-v-dd408579${_scopeId}><input${ssrRenderAttr("value", newVehicle.value)} class="input-standard"${ssrRenderAttr("placeholder", unref(t)("residents.vehicle_placeholder"))} data-v-dd408579${_scopeId}>`);
							_push(ssrRenderComponent(_component_AppButton, {
								text: unref(t)("common.add"),
								type: "secondary",
								onClick: addVehicle
							}, null, _parent, _scopeId));
							_push(`</div><div class="chips" data-v-dd408579${_scopeId}><!--[-->`);
							ssrRenderList(form.vehicles, (vehicle, index) => {
								_push(`<span class="chip" data-v-dd408579${_scopeId}>${ssrInterpolate(vehicle)}<button data-v-dd408579${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:x",
									size: 14
								}, null, _parent, _scopeId));
								_push(`</button></span>`);
							});
							_push(`<!--]--></div></div><label class="toggle" data-v-dd408579${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(form.communicationTest) ? ssrLooseContain(form.communicationTest, null) : form.communicationTest) ? " checked" : ""} type="checkbox" data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.enable_communication_test"))}</label><label class="toggle" data-v-dd408579${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(form.active) ? ssrLooseContain(form.active, null) : form.active) ? " checked" : ""} type="checkbox" data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.active"))}</label>`);
							if (isDeactivating.value) {
								_push(`<p class="warning" data-v-dd408579${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:triangle-alert",
									size: 16
								}, null, _parent, _scopeId));
								_push(`${ssrInterpolate(unref(t)("residents.deactivate_warning"))}</p>`);
							} else _push(`<!---->`);
							_push(`<div class="form-field" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.registration_date"))}</label><p class="read-only" data-v-dd408579${_scopeId}>${ssrInterpolate(resident.value.created_on)}</p></div><div class="form-field" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.last_login"))}</label><p class="read-only" data-v-dd408579${_scopeId}>${ssrInterpolate(resident.value.last_login || unref(t)("residents.never"))}</p></div></div></div><div class="images-section" data-v-dd408579${_scopeId}><div class="images-section__header" data-v-dd408579${_scopeId}><label data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.property_images"))}</label><button type="button" class="upload-button" data-v-dd408579${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:upload",
								size: 16
							}, null, _parent, _scopeId));
							_push(`${ssrInterpolate(unref(t)("common.upload"))}</button></div>`);
							if (!imageItems.value.length && !newImages.value.length) _push(`<p class="image-empty" data-v-dd408579${_scopeId}>${ssrInterpolate(unref(t)("residents.no_property_images"))}</p>`);
							else _push(`<!---->`);
							_push(`<div class="image-grid" data-v-dd408579${_scopeId}><!--[-->`);
							ssrRenderList(imageItems.value, (image) => {
								_push(`<div class="gallery-item" data-v-dd408579${_scopeId}><img${ssrRenderAttr("src", imageUrl(image.id))} alt="Property" data-v-dd408579${_scopeId}><button class="gallery-remove" data-v-dd408579${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:x",
									size: 16
								}, null, _parent, _scopeId));
								_push(`</button></div>`);
							});
							_push(`<!--]--><!--[-->`);
							ssrRenderList(newImages.value, (image, index) => {
								_push(`<div class="gallery-item gallery-item--upload" data-v-dd408579${_scopeId}>`);
								_push(ssrRenderComponent(ImageUpload_default, {
									ref_for: true,
									ref: (instance) => setImageUploadRef(image.id, instance),
									"model-value": image.preview,
									label: "",
									"auto-upload": false,
									"call-api-after-attach": false,
									"preview-size": 120,
									"onUpdate:modelValue": ($event) => updateNewImage(index, $event),
									onFileSelected: ($event) => selectNewImage(index, $event)
								}, null, _parent, _scopeId));
								_push(`</div>`);
							});
							_push(`<!--]--></div></div>`);
							if (submitError.value) _push(`<p class="submit-error" data-v-dd408579${_scopeId}>${ssrInterpolate(submitError.value)}</p>`);
							else _push(`<!---->`);
							_push(`<!--]-->`);
						} else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "edit-resident-modal" }, [createVNode(LoadingModal_default, {
						show: isSubmitting.value,
						message: unref(t)("common.loading")
					}, null, 8, ["show", "message"]), isLoading.value ? (openBlock(), createBlock("div", {
						key: 0,
						class: "modal-loading"
					}, [createVNode(_component_Icon, {
						name: "lucide:loader-2",
						size: 28,
						class: "spin"
					}), createTextVNode(toDisplayString(unref(t)("common.loading")), 1)])) : loadError.value ? (openBlock(), createBlock("p", {
						key: 1,
						class: "submit-error"
					}, toDisplayString(loadError.value), 1)) : resident.value ? (openBlock(), createBlock(Fragment, { key: 2 }, [
						createVNode("div", { class: "form-grid" }, [createVNode("div", { class: "form-section" }, [
							createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-field" }, [
								createVNode("label", null, [createTextVNode(toDisplayString(unref(t)("residents.first_name")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.firstName = $event,
									class: ["input-standard", { error: errors.firstName }]
								}, null, 10, ["onUpdate:modelValue"]), [[vModelText, form.firstName]]),
								errors.firstName ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-message"
								}, toDisplayString(errors.firstName), 1)) : createCommentVNode("", true)
							]), createVNode("div", { class: "form-field" }, [createVNode("label", null, toDisplayString(unref(t)("residents.last_name")), 1), withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => form.lastName = $event,
								class: "input-standard"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, form.lastName]])])]),
							createVNode("div", { class: "form-field" }, [
								createVNode("label", null, [createTextVNode(toDisplayString(unref(t)("residents.mobile")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.mobile = $event,
									type: "tel",
									class: ["input-standard", { error: errors.mobile }]
								}, null, 10, ["onUpdate:modelValue"]), [[vModelText, form.mobile]]),
								errors.mobile ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-message"
								}, toDisplayString(errors.mobile), 1)) : createCommentVNode("", true),
								isPhoneChanged.value ? (openBlock(), createBlock("p", {
									key: 1,
									class: "warning"
								}, [createVNode(_component_Icon, {
									name: "lucide:triangle-alert",
									size: 16
								}), createTextVNode(toDisplayString(unref(t)("residents.phone_change_warning")), 1)])) : createCommentVNode("", true)
							]),
							createVNode("div", { class: "form-field" }, [
								createVNode("label", null, toDisplayString(unref(t)("residents.email")), 1),
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.email = $event,
									type: "email",
									class: ["input-standard", { error: errors.email }]
								}, null, 10, ["onUpdate:modelValue"]), [[vModelText, form.email]]),
								errors.email ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-message"
								}, toDisplayString(errors.email), 1)) : createCommentVNode("", true)
							]),
							createVNode("div", { class: "form-field" }, [createVNode("label", null, toDisplayString(unref(t)("residents.address")), 1), withDirectives(createVNode("textarea", { "onUpdate:modelValue": ($event) => form.address = $event }, null, 8, ["onUpdate:modelValue"]), [[vModelText, form.address]])]),
							createVNode("div", { class: "form-field" }, [createVNode("label", null, toDisplayString(unref(t)("residents.instructions")), 1), withDirectives(createVNode("textarea", { "onUpdate:modelValue": ($event) => form.instructions = $event }, null, 8, ["onUpdate:modelValue"]), [[vModelText, form.instructions]])])
						]), createVNode("div", { class: "form-section" }, [
							createVNode("div", { class: "form-field" }, [
								createVNode("label", null, toDisplayString(unref(t)("residents.community")), 1),
								withDirectives(createVNode("select", {
									"onUpdate:modelValue": ($event) => form.communityId = $event,
									class: ["input-standard", { error: errors.communityId }],
									disabled: isLoadingCommunities.value
								}, [createVNode("option", { value: 0 }, toDisplayString(unref(t)("residents.select_community")), 1), (openBlock(true), createBlock(Fragment, null, renderList(communities.value, (community) => {
									return openBlock(), createBlock("option", {
										key: community.id,
										value: community.id
									}, toDisplayString(community.name), 9, ["value"]);
								}), 128))], 10, ["onUpdate:modelValue", "disabled"]), [[vModelSelect, form.communityId]]),
								errors.communityId ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-message"
								}, toDisplayString(errors.communityId), 1)) : createCommentVNode("", true)
							]),
							createVNode("div", { class: "form-field" }, [
								createVNode("label", null, toDisplayString(unref(t)("residents.vehicle_numbers")), 1),
								createVNode("div", { class: "vehicle-input" }, [withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => newVehicle.value = $event,
									class: "input-standard",
									placeholder: unref(t)("residents.vehicle_placeholder"),
									onKeyup: withKeys(addVehicle, ["enter"])
								}, null, 40, ["onUpdate:modelValue", "placeholder"]), [[vModelText, newVehicle.value]]), createVNode(_component_AppButton, {
									text: unref(t)("common.add"),
									type: "secondary",
									onClick: addVehicle
								}, null, 8, ["text"])]),
								createVNode("div", { class: "chips" }, [(openBlock(true), createBlock(Fragment, null, renderList(form.vehicles, (vehicle, index) => {
									return openBlock(), createBlock("span", {
										key: `${vehicle}-${index}`,
										class: "chip"
									}, [createTextVNode(toDisplayString(vehicle), 1), createVNode("button", { onClick: ($event) => removeVehicle(index) }, [createVNode(_component_Icon, {
										name: "lucide:x",
										size: 14
									})], 8, ["onClick"])]);
								}), 128))])
							]),
							createVNode("label", { class: "toggle" }, [withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => form.communicationTest = $event,
								type: "checkbox"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, form.communicationTest]]), createTextVNode(toDisplayString(unref(t)("residents.enable_communication_test")), 1)]),
							createVNode("label", { class: "toggle" }, [withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => form.active = $event,
								type: "checkbox"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, form.active]]), createTextVNode(toDisplayString(unref(t)("residents.active")), 1)]),
							isDeactivating.value ? (openBlock(), createBlock("p", {
								key: 0,
								class: "warning"
							}, [createVNode(_component_Icon, {
								name: "lucide:triangle-alert",
								size: 16
							}), createTextVNode(toDisplayString(unref(t)("residents.deactivate_warning")), 1)])) : createCommentVNode("", true),
							createVNode("div", { class: "form-field" }, [createVNode("label", null, toDisplayString(unref(t)("residents.registration_date")), 1), createVNode("p", { class: "read-only" }, toDisplayString(resident.value.created_on), 1)]),
							createVNode("div", { class: "form-field" }, [createVNode("label", null, toDisplayString(unref(t)("residents.last_login")), 1), createVNode("p", { class: "read-only" }, toDisplayString(resident.value.last_login || unref(t)("residents.never")), 1)])
						])]),
						createVNode("div", { class: "images-section" }, [
							createVNode("div", { class: "images-section__header" }, [createVNode("label", null, toDisplayString(unref(t)("residents.property_images")), 1), createVNode("button", {
								type: "button",
								class: "upload-button",
								onClick: addImageUpload
							}, [createVNode(_component_Icon, {
								name: "lucide:upload",
								size: 16
							}), createTextVNode(toDisplayString(unref(t)("common.upload")), 1)])]),
							!imageItems.value.length && !newImages.value.length ? (openBlock(), createBlock("p", {
								key: 0,
								class: "image-empty"
							}, toDisplayString(unref(t)("residents.no_property_images")), 1)) : createCommentVNode("", true),
							createVNode("div", { class: "image-grid" }, [(openBlock(true), createBlock(Fragment, null, renderList(imageItems.value, (image) => {
								return openBlock(), createBlock("div", {
									key: image.id,
									class: "gallery-item"
								}, [createVNode("img", {
									src: imageUrl(image.id),
									alt: "Property"
								}, null, 8, ["src"]), createVNode("button", {
									class: "gallery-remove",
									onClick: ($event) => removeImage(image.id)
								}, [createVNode(_component_Icon, {
									name: "lucide:x",
									size: 16
								})], 8, ["onClick"])]);
							}), 128)), (openBlock(true), createBlock(Fragment, null, renderList(newImages.value, (image, index) => {
								return openBlock(), createBlock("div", {
									key: image.id,
									class: "gallery-item gallery-item--upload"
								}, [createVNode(ImageUpload_default, {
									ref_for: true,
									ref: (instance) => setImageUploadRef(image.id, instance),
									"model-value": image.preview,
									label: "",
									"auto-upload": false,
									"call-api-after-attach": false,
									"preview-size": 120,
									"onUpdate:modelValue": ($event) => updateNewImage(index, $event),
									onFileSelected: ($event) => selectNewImage(index, $event)
								}, null, 8, [
									"model-value",
									"onUpdate:modelValue",
									"onFileSelected"
								])]);
							}), 128))])
						]),
						submitError.value ? (openBlock(), createBlock("p", {
							key: 0,
							class: "submit-error"
						}, toDisplayString(submitError.value), 1)) : createCommentVNode("", true)
					], 64)) : createCommentVNode("", true)])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/residents/EditModal.vue
var _sfc_setup$2 = EditModal_vue_vue_type_script_setup_true_lang_default.setup;
EditModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/residents/EditModal.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var EditModal_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(EditModal_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-dd408579"]]), { __name: "EditModal" });
//#endregion
//#region app/components/residents/ResidentsManagement.vue?vue&type=script&setup=true&lang.ts
var ResidentsManagement_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ResidentsManagement",
	__ssrInlineRender: true,
	props: {
		communityId: {},
		communityName: {}
	},
	setup(__props) {
		const props = __props;
		const { t } = useTranslation();
		const toastStore = useToastStore();
		const residents = ref([]);
		const totalCount = ref(0);
		const isLoadingResidents = ref(false);
		const isLoadingCommunities = ref(false);
		const loadError = ref("");
		const communities = ref([]);
		const selectedCommunityId = ref(Number(props.communityId));
		const includeInactive = ref(false);
		const searchQuery = ref("");
		let searchDebounceTimer;
		function mapApiResident(resident) {
			return {
				id: resident.user_id,
				fullName: [resident.first_name, resident.last_name].filter(Boolean).join(" "),
				mobile: resident.phone_num || "",
				email: resident.email?.endsWith("@placeholder.local") ? "" : resident.email || "",
				address: resident.address || "",
				registrationDate: resident.created_on || "",
				active: resident.is_active,
				communicationTest: resident.communication_test,
				vehicleNumbers: resident.vehicles || []
			};
		}
		async function loadResidents() {
			isLoadingResidents.value = true;
			loadError.value = "";
			try {
				const response = await residentApi.getResidents({
					community_id: selectedCommunityId.value,
					include_inactive: includeInactive.value,
					search_text: searchQuery.value.trim(),
					sort_by: sortKey.value,
					sort_dir: sortOrder.value
				}, { showLoading: false });
				residents.value = response.residents.map(mapApiResident);
				totalCount.value = response.total_count;
			} catch (error) {
				console.error("Failed to load residents:", error);
				residents.value = [];
				totalCount.value = 0;
				loadError.value = t("residents.load_failed");
			} finally {
				isLoadingResidents.value = false;
			}
		}
		const sortKey = ref("first_name");
		const sortOrder = ref("asc");
		const sortedResidents = computed(() => residents.value);
		watch([selectedCommunityId, includeInactive], loadResidents);
		watch(searchQuery, () => {
			if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
			searchDebounceTimer = setTimeout(loadResidents, 400);
		});
		const totalEntries = computed(() => totalCount.value);
		const showAddModal = ref(false);
		const showEditModal = ref(false);
		const showDeleteModal = ref(false);
		const showCannotDeleteModal = ref(false);
		const selectedResident = ref(null);
		const isDeleting = ref(false);
		const isDeactivating = ref(false);
		function handleResidentCreated() {
			showAddModal.value = false;
			loadResidents();
		}
		function handleResidentUpdated() {
			showEditModal.value = false;
			selectedResident.value = null;
			loadResidents();
		}
		function closeDeleteModal() {
			showDeleteModal.value = false;
			selectedResident.value = null;
		}
		async function handleDeleteResident() {
			if (!selectedResident.value) return;
			isDeleting.value = true;
			try {
				await residentApi.deleteResident(selectedResident.value.id, { showLoading: false });
				toastStore.success(t("residents.delete_success"));
				closeDeleteModal();
				await loadResidents();
			} catch (error) {
				if (error instanceof ApiError && error.rc === 543) {
					showDeleteModal.value = false;
					showCannotDeleteModal.value = true;
				} else if (error instanceof ApiError && error.rc === 540) {
					toastStore.info(t("residents.not_found"));
					closeDeleteModal();
					await loadResidents();
				} else toastStore.error(error instanceof ApiError ? error.message : t("residents.delete_failed"));
			} finally {
				isDeleting.value = false;
			}
		}
		async function deactivateSelectedResident() {
			if (!selectedResident.value) return;
			isDeactivating.value = true;
			try {
				await residentApi.updateResident({
					user_id: selectedResident.value.id,
					is_active: false
				}, { showLoading: false });
				toastStore.success(t("residents.deactivate_success"));
				showCannotDeleteModal.value = false;
				selectedResident.value = null;
				await loadResidents();
			} catch (error) {
				toastStore.error(error instanceof ApiError ? error.message : t("residents.update_failed"));
			} finally {
				isDeactivating.value = false;
			}
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppButton = AppButton_default;
			const _component_Icon = components_default;
			const _component_Badge = Badge_default;
			const _component_AppModal = AppModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "residents-management" }, _attrs))} data-v-3cc20d03>`);
			_push(ssrRenderComponent(LoadingModal_default, {
				show: isLoadingResidents.value,
				message: unref(t)("common.loading")
			}, null, _parent));
			_push(`<div class="residents-management__header" data-v-3cc20d03><div class="residents-management__header-left" data-v-3cc20d03><h2 class="residents-management__title" data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.management_title"))}</h2><p class="residents-management__subtitle" data-v-3cc20d03>${ssrInterpolate(__props.communityName)} • ${ssrInterpolate(unref(t)("residents.total", { count: String(unref(totalEntries)) }))}</p></div>`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("residents.add_resident"),
				icon: "lucide:plus",
				type: "primary",
				onClick: ($event) => showAddModal.value = true
			}, null, _parent));
			_push(`</div><div class="residents-management__toolbar" data-v-3cc20d03><div class="residents-management__search" data-v-3cc20d03>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16,
				class: "residents-management__search-icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", searchQuery.value)} type="text" class="residents-management__search-input input-standard"${ssrRenderAttr("placeholder", unref(t)("residents.search_placeholder"))} data-v-3cc20d03>`);
			if (searchQuery.value) {
				_push(`<button class="residents-management__clear-search"${ssrRenderAttr("aria-label", unref(t)("common.close"))} data-v-3cc20d03>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 16
				}, null, _parent));
				_push(`</button>`);
			} else _push(`<!---->`);
			_push(`</div><select class="residents-management__filter"${ssrIncludeBooleanAttr(isLoadingCommunities.value) ? " disabled" : ""} data-v-3cc20d03><option${ssrRenderAttr("value", 0)} data-v-3cc20d03${ssrIncludeBooleanAttr(Array.isArray(selectedCommunityId.value) ? ssrLooseContain(selectedCommunityId.value, 0) : ssrLooseEqual(selectedCommunityId.value, 0)) ? " selected" : ""}>${ssrInterpolate(unref(t)("residents.all_communities"))}</option><!--[-->`);
			ssrRenderList(communities.value, (community) => {
				_push(`<option${ssrRenderAttr("value", community.id)} data-v-3cc20d03${ssrIncludeBooleanAttr(Array.isArray(selectedCommunityId.value) ? ssrLooseContain(selectedCommunityId.value, community.id) : ssrLooseEqual(selectedCommunityId.value, community.id)) ? " selected" : ""}>${ssrInterpolate(community.name)}</option>`);
			});
			_push(`<!--]--></select><div class="residents-management__active-toggle" role="group"${ssrRenderAttr("aria-label", unref(t)("residents.active_filter"))} data-v-3cc20d03><button class="${ssrRenderClass({ active: !includeInactive.value })}" data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.active_only"))}</button><button class="${ssrRenderClass({ active: includeInactive.value })}" data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.all_statuses"))}</button></div></div><div class="residents-management__table-container" data-v-3cc20d03><table class="residents-management__table" data-v-3cc20d03><thead data-v-3cc20d03><tr data-v-3cc20d03><th class="${ssrRenderClass([{ sorted: sortKey.value === "first_name" }, "sortable"])}" data-v-3cc20d03><span class="sortable-content" data-v-3cc20d03><span data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.full_name"))}</span>`);
			if (sortKey.value === "first_name") _push(ssrRenderComponent(_component_Icon, {
				name: sortOrder.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 14
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.mobile"))}</th><th data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.email"))}</th><th data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.address"))}</th><th class="${ssrRenderClass([{ sorted: sortKey.value === "created_on" }, "sortable"])}" data-v-3cc20d03><span class="sortable-content" data-v-3cc20d03><span data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.registration_date"))}</span>`);
			if (sortKey.value === "created_on") _push(ssrRenderComponent(_component_Icon, {
				name: sortOrder.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 14
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</span></th><th data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.active"))}</th><th data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.communication_test"))}</th><th data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.vehicle_numbers"))}</th><th data-v-3cc20d03>${ssrInterpolate(unref(t)("residents.actions"))}</th></tr></thead><tbody data-v-3cc20d03>`);
			if (isLoadingResidents.value) {
				_push(`<tr data-v-3cc20d03><td colspan="9" class="empty-row" data-v-3cc20d03>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 16,
					class: "animate-spin"
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("common.loading"))}</td></tr>`);
			} else if (loadError.value) _push(`<tr data-v-3cc20d03><td colspan="9" class="empty-row error-row" data-v-3cc20d03>${ssrInterpolate(loadError.value)} <button class="retry-btn" data-v-3cc20d03>${ssrInterpolate(unref(t)("common.retry"))}</button></td></tr>`);
			else {
				_push(`<!--[-->`);
				ssrRenderList(unref(sortedResidents), (resident) => {
					_push(`<tr data-v-3cc20d03><td data-v-3cc20d03><div class="resident-name" data-v-3cc20d03><span class="resident-name__text" data-v-3cc20d03>${ssrInterpolate(resident.fullName)}</span></div></td><td data-v-3cc20d03>${ssrInterpolate(resident.mobile)}</td><td data-v-3cc20d03>${ssrInterpolate(resident.email)}</td><td data-v-3cc20d03>${ssrInterpolate(resident.address)}</td><td data-v-3cc20d03>${ssrInterpolate(resident.registrationDate)}</td><td data-v-3cc20d03>`);
					_push(ssrRenderComponent(_component_Badge, {
						type: "status",
						value: resident.active ? "active" : "inactive"
					}, null, _parent));
					_push(`</td><td data-v-3cc20d03><button class="${ssrRenderClass([{ enabled: resident.communicationTest }, "comm-test-toggle"])}" data-v-3cc20d03>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: resident.communicationTest ? "lucide:check" : "lucide:x",
						size: 14
					}, null, _parent));
					_push(`<span data-v-3cc20d03>${ssrInterpolate(resident.communicationTest ? unref(t)("common.yes") : unref(t)("common.no"))}</span></button></td><td data-v-3cc20d03>`);
					if (resident.vehicleNumbers.length) {
						_push(`<div class="vehicle-tags" data-v-3cc20d03><!--[-->`);
						ssrRenderList(resident.vehicleNumbers, (vehicle, index) => {
							_push(ssrRenderComponent(_component_Badge, {
								key: index,
								text: vehicle,
								color: "#119ca6"
							}, null, _parent));
						});
						_push(`<!--]--></div>`);
					} else _push(`<span class="text-muted" data-v-3cc20d03>—</span>`);
					_push(`</td><td data-v-3cc20d03><div class="action-group" data-v-3cc20d03><button class="action-btn action-btn--icon"${ssrRenderAttr("title", unref(t)("common.edit"))} data-v-3cc20d03>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:pencil",
						size: 14
					}, null, _parent));
					_push(`</button><button class="action-btn action-btn--icon" data-v-3cc20d03>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:trash-2",
						size: 14
					}, null, _parent));
					_push(`</button></div></td></tr>`);
				});
				_push(`<!--]-->`);
			}
			if (!isLoadingResidents.value && !loadError.value && !unref(sortedResidents).length) _push(`<tr data-v-3cc20d03><td colspan="9" class="empty-row" data-v-3cc20d03>No residents found</td></tr>`);
			else _push(`<!---->`);
			_push(`</tbody></table></div>`);
			_push(ssrRenderComponent(AddForm_default, {
				show: showAddModal.value,
				"community-id": __props.communityId,
				"community-name": __props.communityName,
				onClose: ($event) => showAddModal.value = false,
				onSubmitted: handleResidentCreated
			}, null, _parent));
			_push(ssrRenderComponent(EditModal_default, {
				show: showEditModal.value,
				"resident-id": selectedResident.value?.id || "",
				"community-id": __props.communityId,
				"community-name": __props.communityName,
				onClose: ($event) => showEditModal.value = false,
				onSubmitted: handleResidentUpdated
			}, null, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: showDeleteModal.value,
				title: unref(t)("residents.delete_title"),
				message: unref(t)("residents.delete_message", { name: selectedResident.value?.fullName || "" }),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": isDeleting.value ? unref(t)("common.deleting") : unref(t)("common.delete"),
				"ok-disabled": isDeleting.value,
				onClose: closeDeleteModal,
				onCancel: closeDeleteModal,
				onOk: handleDeleteResident
			}, null, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: showCannotDeleteModal.value,
				title: unref(t)("residents.cannot_delete_title"),
				message: unref(t)("residents.cannot_delete_message"),
				"cancel-text": unref(t)("common.close"),
				"ok-text": isDeactivating.value ? unref(t)("common.saving") : unref(t)("residents.deactivate"),
				"ok-disabled": isDeactivating.value,
				onClose: ($event) => showCannotDeleteModal.value = false,
				onCancel: ($event) => showCannotDeleteModal.value = false,
				onOk: deactivateSelectedResident
			}, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/residents/ResidentsManagement.vue
var _sfc_setup$1 = ResidentsManagement_vue_vue_type_script_setup_true_lang_default.setup;
ResidentsManagement_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/residents/ResidentsManagement.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var ResidentsManagement_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(ResidentsManagement_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3cc20d03"]]), { __name: "ResidentsManagement" });
//#endregion
//#region app/pages/communities/[id]/residents/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		const communityId = useRoute().params.id;
		const communityName = ref("Loading...");
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_ResidentsManagement = ResidentsManagement_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: "Residents",
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
					{ label: "Residents" }
				],
				"show-search": false
			}, null, _parent));
			_push(`<div class="residents-page" data-v-21a03bfb>`);
			_push(ssrRenderComponent(_component_ResidentsManagement, {
				"community-id": unref(communityId),
				"community-name": communityName.value
			}, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/communities/[id]/residents/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/communities/[id]/residents/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var residents_default = /*#__PURE__*/ _plugin_vue_export_helper_default(index_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-21a03bfb"]]);

export { residents_default as default };
//# sourceMappingURL=residents-ciqFH72I.mjs.map
