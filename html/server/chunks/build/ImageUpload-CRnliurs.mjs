import { t as components_default } from './components-DWHbB934.mjs';
import { d as useRuntimeConfig } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { u as useFileApi } from './useFileApi-CLWuZDlq.mjs';
import { defineComponent, ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrRenderComponent } from 'vue/server-renderer';

//#region app/components/ImageUpload.vue?vue&type=script&setup=true&lang.ts
var ImageUpload_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "ImageUpload",
	__ssrInlineRender: true,
	props: {
		modelValue: { default: "" },
		initialUrl: { default: "" },
		label: { default: "Image" },
		required: {
			type: Boolean,
			default: false
		},
		callApiAfterAttach: {
			type: Boolean,
			default: true
		},
		previewSize: { default: 100 },
		autoUpload: {
			type: Boolean,
			default: true
		}
	},
	emits: [
		"update:modelValue",
		"upload-success",
		"upload-error",
		"file-selected"
	],
	setup(__props, { expose: __expose, emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const { uploadFile } = useFileApi();
		const previewUrl = ref("");
		const isUploading = ref(false);
		const fileId = ref("");
		const fileInputRef = ref(null);
		const hasImage = computed(() => !!previewUrl.value || !!props.modelValue || !!props.initialUrl);
		const selectedFile = ref(null);
		async function performUpload(file) {
			isUploading.value = true;
			try {
				const id = await uploadFile(file);
				if (id) {
					fileId.value = id;
					emit("update:modelValue", id);
					emit("upload-success", id);
					return id;
				} else {
					previewUrl.value = "";
					selectedFile.value = null;
					emit("upload-error", /* @__PURE__ */ new Error("Upload failed"));
					return null;
				}
			} catch (err) {
				previewUrl.value = "";
				selectedFile.value = null;
				emit("upload-error", err);
				return null;
			} finally {
				isUploading.value = false;
			}
		}
		async function upload() {
			if (selectedFile.value) return performUpload(selectedFile.value);
			return null;
		}
		__expose({
			upload,
			openFilePicker: triggerFileInput
		});
		function triggerFileInput() {
			fileInputRef.value?.click();
		}
		const displayUrl = computed(() => {
			if (previewUrl.value) return previewUrl.value;
			if (props.modelValue && props.modelValue.startsWith("data:")) return props.modelValue;
			if (props.modelValue && props.modelValue.startsWith("http")) return props.modelValue;
			if (props.initialUrl && props.initialUrl.startsWith("http")) return props.initialUrl;
			if (props.modelValue) return `${useRuntimeConfig().public.apiBase}/files/n/${props.modelValue}.png`;
			if (props.initialUrl) return `${useRuntimeConfig().public.apiBase}/files/n/${props.initialUrl}.png`;
			return "";
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "form-field" }, _attrs))} data-v-812f598e>`);
			if (__props.label || __props.required) {
				_push(`<label class="field-label" data-v-812f598e>${ssrInterpolate(__props.label)} `);
				if (__props.required) _push(`<span class="required" data-v-812f598e>*</span>`);
				else _push(`<!---->`);
				_push(`</label>`);
			} else _push(`<!---->`);
			_push(`<div class="image-upload" data-v-812f598e>`);
			if (hasImage.value) {
				_push(`<div class="image-preview-actions" data-v-812f598e><div class="image-preview" style="${ssrRenderStyle({
					width: `${__props.previewSize}px`,
					height: `${__props.previewSize}px`
				})}" data-v-812f598e><img${ssrRenderAttr("src", displayUrl.value)} alt="Preview" data-v-812f598e><button class="image-remove" data-v-812f598e>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 14
				}, null, _parent));
				_push(`</button></div><button type="button" class="image-change" data-v-812f598e>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:upload",
					size: 14
				}, null, _parent));
				_push(`<span data-v-812f598e>Change image</span></button><input type="file" accept="image/*" class="hidden-file-input" data-v-812f598e></div>`);
			} else if (isUploading.value) {
				_push(`<div class="upload-placeholder uploading" style="${ssrRenderStyle({
					width: `${__props.previewSize}px`,
					height: `${__props.previewSize}px`
				})}" data-v-812f598e>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 24,
					class: "animate-spin"
				}, null, _parent));
				_push(`<span data-v-812f598e>Uploading...</span></div>`);
			} else {
				_push(`<label class="upload-placeholder" style="${ssrRenderStyle({
					width: `${__props.previewSize}px`,
					height: `${__props.previewSize}px`
				})}" data-v-812f598e>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:upload",
					size: 24
				}, null, _parent));
				_push(`<span data-v-812f598e>${ssrInterpolate(__props.callApiAfterAttach ? "Upload" : "Select")}</span><input type="file" accept="image/*" data-v-812f598e></label>`);
			}
			_push(`</div></div>`);
		};
	}
});
//#endregion
//#region app/components/ImageUpload.vue
var _sfc_setup = ImageUpload_vue_vue_type_script_setup_true_lang_default.setup;
ImageUpload_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ImageUpload.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ImageUpload_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(ImageUpload_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-812f598e"]]), { __name: "ImageUpload" });

export { ImageUpload_default as I };
//# sourceMappingURL=ImageUpload-CRnliurs.mjs.map
