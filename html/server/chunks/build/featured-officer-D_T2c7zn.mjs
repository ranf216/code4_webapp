import { t as components_default } from './components-DWHbB934.mjs';
import { u as useRoute, b as useRouter, a as useTranslation } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { c as communityApi } from './community-jevurWQo.mjs';
import { f as fileToBase64 } from './useFileApi-CLWuZDlq.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { A as AppButton_default } from './AppButton-sr0dx6mm.mjs';
import { defineComponent, ref, unref, reactive, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
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

//#region app/components/communities/FeaturedOfficer.vue?vue&type=script&setup=true&lang.ts
var FeaturedOfficer_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "FeaturedOfficer",
	__ssrInlineRender: true,
	props: {
		communityId: {},
		communityName: {}
	},
	emits: ["success", "cancel"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const { t } = useTranslation();
		useRouter();
		const hasBanner = ref(false);
		const featuredOfficer = ref(null);
		const isLoading = ref(true);
		const isSubmitting = ref(false);
		const isDeleting = ref(false);
		const showDeleteModal = ref(false);
		const showNoBannerModal = ref(false);
		const errorMessage = ref(null);
		const form = reactive({
			description: "",
			imageUrl: "",
			imageFile: null,
			imagePreview: ""
		});
		const errors = reactive({});
		ref(null);
		function validate() {
			errors.description = !form.description.trim() ? t("validation.required") : "";
			errors.image = !form.imagePreview ? t("validation.required") : "";
			return !errors.description && !errors.image;
		}
		function openDeleteModal() {
			showDeleteModal.value = true;
		}
		function handleCancel() {
			emit("cancel");
		}
		async function handleDelete() {
			isDeleting.value = true;
			errorMessage.value = null;
			try {
				const response = await communityApi.deleteFeaturedOfficer(Number(props.communityId));
				if (response.rc === 0) {
					showDeleteModal.value = false;
					hasBanner.value = false;
					featuredOfficer.value = null;
					form.description = "";
					form.imagePreview = "";
					form.imageFile = null;
					form.imageUrl = "";
				} else if (response.rc === 506) {
					showDeleteModal.value = false;
					hasBanner.value = false;
					featuredOfficer.value = null;
				}
			} catch (error) {
				console.error("Error deleting featured officer:", error);
				errorMessage.value = "Failed to delete featured officer banner";
			} finally {
				isDeleting.value = false;
			}
		}
		async function handleSubmit() {
			if (!validate()) return;
			isSubmitting.value = true;
			errorMessage.value = null;
			try {
				let imageBase64 = form.imageUrl;
				if (form.imageFile) imageBase64 = await fileToBase64(form.imageFile);
				if ((await communityApi.setFeaturedOfficer(Number(props.communityId), imageBase64, form.description)).rc === 0) {
					const successMessage = hasBanner.value ? "Featured officer banner updated successfully!" : "Featured officer banner created successfully!";
					emit("success", successMessage);
				}
			} catch (error) {
				console.error("Error saving featured officer:", error);
				errorMessage.value = "Failed to save featured officer banner";
			} finally {
				isSubmitting.value = false;
			}
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_AppButton = AppButton_default;
			const _component_Badge = Badge_default;
			const _component_AppModal = AppModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "featured-officer" }, _attrs))} data-v-6c693bb7>`);
			if (isLoading.value) {
				_push(`<div class="loading-state" data-v-6c693bb7>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 24,
					class: "spin"
				}, null, _parent));
				_push(`<span data-v-6c693bb7>Loading featured officer...</span></div>`);
			} else _push(`<!---->`);
			if (errorMessage.value) {
				_push(`<div class="error-banner" data-v-6c693bb7>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:alert-circle",
					size: 16
				}, null, _parent));
				_push(`<span data-v-6c693bb7>${ssrInterpolate(errorMessage.value)}</span></div>`);
			} else _push(`<!---->`);
			if (!isLoading.value) {
				_push(`<!--[--><div class="form-header" data-v-6c693bb7><h2 class="form-title" data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.title"))}</h2><div class="form-actions" data-v-6c693bb7>`);
				_push(ssrRenderComponent(_component_AppButton, {
					text: unref(t)("common.cancel"),
					type: "secondary",
					onClick: handleCancel
				}, null, _parent));
				if (hasBanner.value) _push(ssrRenderComponent(_component_AppButton, {
					text: unref(t)("common.delete"),
					type: "danger",
					icon: "lucide:trash-2",
					disabled: isDeleting.value,
					onClick: openDeleteModal
				}, null, _parent));
				else _push(`<!---->`);
				_push(ssrRenderComponent(_component_AppButton, {
					text: unref(t)("common.save"),
					type: "primary",
					icon: "lucide:save",
					disabled: isSubmitting.value,
					onClick: handleSubmit
				}, null, _parent));
				_push(`</div></div><p class="form-description" data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.description"))}</p><div class="form-body" data-v-6c693bb7><div class="form-column" data-v-6c693bb7><div class="form-section" data-v-6c693bb7><h3 class="section-title" data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.image"))} <span class="required" data-v-6c693bb7>*</span></h3><div class="${ssrRenderClass([{
					"image-upload-area--error": errors.image,
					"image-upload-area--has-image": form.imagePreview
				}, "image-upload-area"])}" data-v-6c693bb7>`);
				if (form.imagePreview) {
					_push(`<div class="image-preview" data-v-6c693bb7><img${ssrRenderAttr("src", form.imagePreview)} alt="Banner preview" class="preview-img" data-v-6c693bb7><button type="button" class="image-remove-btn" data-v-6c693bb7>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 16
					}, null, _parent));
					_push(`</button></div>`);
				} else {
					_push(`<div class="upload-placeholder" data-v-6c693bb7>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:image-plus",
						size: 40,
						class: "upload-icon"
					}, null, _parent));
					_push(`<p class="upload-text" data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.upload_hint"))}</p><p class="upload-subtext" data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.upload_formats"))}</p></div>`);
				}
				_push(`</div>`);
				if (!form.imagePreview) {
					_push(`<button type="button" class="upload-btn" data-v-6c693bb7>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:upload",
						size: 16
					}, null, _parent));
					_push(`<span data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.choose_image"))}</span></button>`);
				} else {
					_push(`<button type="button" class="upload-btn upload-btn--secondary" data-v-6c693bb7>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:refresh-cw",
						size: 16
					}, null, _parent));
					_push(`<span data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.change_image"))}</span></button>`);
				}
				_push(`<input type="file" accept="image/*" class="hidden-input" data-v-6c693bb7>`);
				if (errors.image) _push(`<span class="error-message" data-v-6c693bb7>${ssrInterpolate(errors.image)}</span>`);
				else _push(`<!---->`);
				_push(`<span class="field-hint" data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.image_hint"))}</span></div></div><div class="form-column" data-v-6c693bb7><div class="form-section" data-v-6c693bb7><h3 class="section-title" data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.description_label"))} <span class="required" data-v-6c693bb7>*</span></h3><div class="form-field" data-v-6c693bb7><textarea class="${ssrRenderClass([{ error: errors.description }, "field-textarea"])}" rows="6"${ssrRenderAttr("placeholder", unref(t)("featured_officer.description_placeholder"))} data-v-6c693bb7>${ssrInterpolate(form.description)}</textarea>`);
				if (errors.description) _push(`<span class="error-message" data-v-6c693bb7>${ssrInterpolate(errors.description)}</span>`);
				else _push(`<!---->`);
				_push(`<span class="field-hint" data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.description_hint"))}</span></div></div><div class="form-section form-section--info" data-v-6c693bb7><div class="info-row" data-v-6c693bb7><span class="info-label" data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.community"))}:</span><span class="info-value" data-v-6c693bb7>${ssrInterpolate(__props.communityName)}</span></div><div class="info-row" data-v-6c693bb7><span class="info-label" data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.banner_status"))}:</span>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "status",
					value: hasBanner.value ? "active" : "inactive"
				}, null, _parent));
				_push(`</div><div class="info-note" data-v-6c693bb7>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:info",
					size: 14,
					class: "info-note__icon"
				}, null, _parent));
				_push(`<span data-v-6c693bb7>${ssrInterpolate(unref(t)("featured_officer.default_note"))}</span></div></div></div></div>`);
				_push(ssrRenderComponent(_component_AppModal, {
					show: showDeleteModal.value,
					title: unref(t)("featured_officer.delete_title"),
					message: unref(t)("featured_officer.delete_message"),
					"cancel-text": unref(t)("common.cancel"),
					"ok-text": unref(t)("common.delete"),
					onClose: ($event) => showDeleteModal.value = false,
					onCancel: ($event) => showDeleteModal.value = false,
					onOk: handleDelete
				}, null, _parent));
				_push(ssrRenderComponent(_component_AppModal, {
					show: showNoBannerModal.value,
					title: "No Active Banner",
					message: "This community currently has no active featured officer banner. You can create one by uploading an image and adding a description.",
					"cancel-text": void 0,
					"ok-text": "Got it",
					onClose: ($event) => showNoBannerModal.value = false,
					onOk: ($event) => showNoBannerModal.value = false
				}, null, _parent));
				_push(`<!--]-->`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/communities/FeaturedOfficer.vue
var _sfc_setup$1 = FeaturedOfficer_vue_vue_type_script_setup_true_lang_default.setup;
FeaturedOfficer_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/communities/FeaturedOfficer.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var FeaturedOfficer_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(FeaturedOfficer_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-6c693bb7"]]), { __name: "FeaturedOfficer" });
//#endregion
//#region app/pages/communities/[id]/featured-officer.vue?vue&type=script&setup=true&lang.ts
var featured_officer_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "featured-officer",
	__ssrInlineRender: true,
	setup(__props) {
		const route = useRoute();
		const router = useRouter();
		const communityId = route.params.id;
		const communityName = ref("Loading...");
		ref(true);
		const showSuccessModal = ref(false);
		const successMessage = ref("");
		function handleSuccess(message) {
			successMessage.value = message;
			showSuccessModal.value = true;
		}
		function handleCancel() {
			navigateBack();
		}
		function navigateBack() {
			if (useRoute().query.from === "list") router.push("/communities?refresh=true");
			else router.push(`/communities/edit/${communityId}`);
		}
		function handleSuccessModalOk() {
			showSuccessModal.value = false;
			navigateBack();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_FeaturedOfficer = FeaturedOfficer_default;
			const _component_AppModal = AppModal_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: "Featured Officer",
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
					{ label: "Featured Officer" }
				],
				"show-search": false
			}, null, _parent));
			_push(`<div class="featured-officer-page" data-v-4ff8b493>`);
			_push(ssrRenderComponent(_component_FeaturedOfficer, {
				"community-id": unref(communityId),
				"community-name": communityName.value,
				onSuccess: handleSuccess,
				onCancel: handleCancel
			}, null, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: showSuccessModal.value,
				title: "Success",
				message: successMessage.value,
				"cancel-text": void 0,
				"ok-text": "OK",
				onClose: handleSuccessModalOk,
				onOk: handleSuccessModalOk
			}, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/communities/[id]/featured-officer.vue
var _sfc_setup = featured_officer_vue_vue_type_script_setup_true_lang_default.setup;
featured_officer_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/communities/[id]/featured-officer.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var featured_officer_default = /*#__PURE__*/ _plugin_vue_export_helper_default(featured_officer_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-4ff8b493"]]);

export { featured_officer_default as default };
//# sourceMappingURL=featured-officer-D_T2c7zn.mjs.map
