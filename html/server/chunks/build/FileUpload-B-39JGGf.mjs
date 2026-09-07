import { t as components_default } from './components-DWHbB934.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { u as useFileApi } from './useFileApi-CLWuZDlq.mjs';
import { defineComponent, ref, computed, mergeProps, watch, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderComponent, ssrRenderStyle, ssrRenderAttr, ssrRenderTeleport } from 'vue/server-renderer';

//#region app/components/MImagePreview.vue?vue&type=script&setup=true&lang.ts
var MImagePreview_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "MImagePreview",
	__ssrInlineRender: true,
	props: {
		show: { type: Boolean },
		images: {},
		initialIndex: {},
		alt: {}
	},
	emits: ["close"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const currentIndex = ref(props.initialIndex ?? 0);
		watch(() => props.show, (show) => {
			if (show) currentIndex.value = props.initialIndex ?? 0;
		});
		watch(() => props.initialIndex, (index) => {
			if (index !== void 0) currentIndex.value = index;
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			ssrRenderTeleport(_push, (_push) => {
				if (__props.show) {
					_push(`<div class="image-preview-overlay" data-v-1f7a9fb8><button class="preview-close" data-v-1f7a9fb8>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 24
					}, null, _parent));
					_push(`</button>`);
					if (__props.images.length > 1) _push(`<div class="preview-counter" data-v-1f7a9fb8>${ssrInterpolate(unref(currentIndex) + 1)} / ${ssrInterpolate(__props.images.length)}</div>`);
					else _push(`<!---->`);
					if (__props.images.length > 1) {
						_push(`<button class="preview-nav preview-nav--prev" data-v-1f7a9fb8>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:chevron-left",
							size: 32
						}, null, _parent));
						_push(`</button>`);
					} else _push(`<!---->`);
					if (__props.images.length > 1) {
						_push(`<button class="preview-nav preview-nav--next" data-v-1f7a9fb8>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:chevron-right",
							size: 32
						}, null, _parent));
						_push(`</button>`);
					} else _push(`<!---->`);
					_push(`<div class="preview-image-wrapper" data-v-1f7a9fb8><img${ssrRenderAttr("src", __props.images[unref(currentIndex)])}${ssrRenderAttr("alt", __props.alt || "Preview image")} class="preview-image" data-v-1f7a9fb8></div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
		};
	}
});
//#endregion
//#region app/components/MImagePreview.vue
var _sfc_setup$1 = MImagePreview_vue_vue_type_script_setup_true_lang_default.setup;
MImagePreview_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MImagePreview.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var MImagePreview_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(MImagePreview_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-1f7a9fb8"]]), { __name: "MImagePreview" });
//#endregion
//#region app/components/FileUpload.vue?vue&type=script&setup=true&lang.ts
var FileUpload_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "FileUpload",
	__ssrInlineRender: true,
	props: {
		modelValue: { default: () => [] },
		accept: { default: ".pdf,.jpg,.jpeg,.png,.mp4" },
		maxFiles: { default: 5 },
		maxSizeMb: { default: 20 },
		callApi: {
			type: Boolean,
			default: false
		},
		label: { default: "" },
		hint: { default: "" }
	},
	emits: [
		"update:modelValue",
		"upload-success",
		"upload-error"
	],
	setup(__props, { expose: __expose, emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const { uploadFile } = useFileApi();
		const attachedFiles = ref([]);
		const isUploading = ref(false);
		const imagePreviews = ref({});
		const videoPreviews = ref({});
		const showImagePreview = ref(false);
		const previewImages = ref([]);
		const previewInitialIndex = ref(0);
		const showVideoPreview = ref(false);
		const currentVideoUrl = ref("");
		const canAddMore = computed(() => attachedFiles.value.length < props.maxFiles);
		const hasThumbnails = computed(() => attachedFiles.value.some((f) => isImageFile(f.file) || isVideoFile(f.file)));
		function fileIcon(file) {
			if (file.type.startsWith("image/")) return "lucide:image";
			if (file.type === "application/pdf") return "lucide:file-text";
			if (file.type.startsWith("video/")) return "lucide:video";
			return "lucide:file";
		}
		function formatSize(bytes) {
			if (bytes < 1024) return `${bytes} B`;
			if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
			return `${(bytes / 1048576).toFixed(1)} MB`;
		}
		function emitValue() {
			const ids = attachedFiles.value.filter((f) => f.fileId !== null).map((f) => f.fileId);
			emit("update:modelValue", ids);
		}
		/**
		* Upload all pending files.
		* Called externally (e.g. on form submit) or automatically if callApi=true.
		* Returns array of uploaded file_ids.
		*/
		async function uploadAll() {
			if (!props.callApi) return [];
			isUploading.value = true;
			const errors = [];
			for (const item of attachedFiles.value) {
				if (item.status === "done") continue;
				item.status = "uploading";
				item.progress = 0;
				const fileId = await uploadFile(item.file, void 0, (uploaded, total) => {
					item.progress = Math.round(uploaded / total * 100);
				});
				if (fileId) {
					item.fileId = fileId;
					item.status = "done";
					item.progress = 100;
				} else {
					item.status = "error";
					item.errorMsg = "Upload failed";
					errors.push(item.file.name);
				}
			}
			isUploading.value = false;
			emitValue();
			const successIds = attachedFiles.value.filter((f) => f.fileId !== null).map((f) => f.fileId);
			if (errors.length) emit("upload-error", errors);
			else emit("upload-success", successIds);
			return successIds;
		}
		/**
		* Returns the local File objects (for use when callApi=false).
		*/
		function getFiles() {
			return attachedFiles.value.map((f) => f.file);
		}
		function isImageFile(file) {
			return file.type.startsWith("image/");
		}
		function isVideoFile(file) {
			return file.type.startsWith("video/");
		}
		__expose({
			uploadAll,
			getFiles
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "file-upload" }, _attrs))} data-v-0418df24>`);
			if (__props.label) _push(`<label class="file-upload__label" data-v-0418df24>${ssrInterpolate(__props.label)}</label>`);
			else _push(`<!---->`);
			if (attachedFiles.value.length > 0) {
				_push(`<div class="${ssrRenderClass([{ "file-upload__list--thumbnails": hasThumbnails.value }, "file-upload__list"])}" data-v-0418df24><!--[-->`);
				ssrRenderList(attachedFiles.value, (item) => {
					_push(`<!--[-->`);
					if (!isImageFile(item.file) && !isVideoFile(item.file)) {
						_push(`<div class="${ssrRenderClass([`file-item--${item.status}`, "file-item"])}" data-v-0418df24>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: fileIcon(item.file),
							size: 16,
							class: "file-item__icon"
						}, null, _parent));
						_push(`<div class="file-item__info" data-v-0418df24><span class="file-item__name" data-v-0418df24>${ssrInterpolate(item.file.name)}</span><span class="file-item__meta" data-v-0418df24>${ssrInterpolate(formatSize(item.file.size))}</span></div>`);
						if (item.status === "uploading") _push(`<div class="file-item__progress" data-v-0418df24><div class="file-item__progress-bar" style="${ssrRenderStyle({ width: `${item.progress}%` })}" data-v-0418df24></div></div>`);
						else _push(`<!---->`);
						if (item.status === "done") _push(ssrRenderComponent(_component_Icon, {
							name: "lucide:check-circle",
							size: 15,
							class: "file-item__status file-item__status--done"
						}, null, _parent));
						else if (item.status === "error") _push(ssrRenderComponent(_component_Icon, {
							name: "lucide:alert-circle",
							size: 15,
							class: "file-item__status file-item__status--error",
							title: item.errorMsg ?? ""
						}, null, _parent));
						else if (item.status === "uploading") _push(ssrRenderComponent(_component_Icon, {
							name: "lucide:loader-2",
							size: 15,
							class: "file-item__status animate-spin"
						}, null, _parent));
						else _push(`<!---->`);
						if (item.status !== "uploading") {
							_push(`<button class="file-item__remove" type="button" title="Remove" data-v-0418df24>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:x",
								size: 13
							}, null, _parent));
							_push(`</button>`);
						} else _push(`<!---->`);
						_push(`</div>`);
					} else if (isImageFile(item.file)) {
						_push(`<div class="${ssrRenderClass([`file-thumb--${item.status}`, "file-thumb"])}" data-v-0418df24><img${ssrRenderAttr("src", imagePreviews.value[item.id])}${ssrRenderAttr("alt", item.file.name)} class="file-thumb__img" data-v-0418df24>`);
						if (item.status === "uploading") _push(`<div class="file-thumb__progress" data-v-0418df24><div class="file-thumb__progress-bar" style="${ssrRenderStyle({ width: `${item.progress}%` })}" data-v-0418df24></div></div>`);
						else _push(`<!---->`);
						if (item.status !== "uploading") {
							_push(`<button class="file-thumb__remove" type="button" title="Remove" data-v-0418df24>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:x",
								size: 13
							}, null, _parent));
							_push(`</button>`);
						} else _push(`<!---->`);
						_push(`</div>`);
					} else {
						_push(`<div class="${ssrRenderClass([`file-thumb--${item.status}`, "file-thumb file-thumb--video"])}" data-v-0418df24><video${ssrRenderAttr("src", videoPreviews.value[item.id])} class="file-thumb__img file-thumb__video" preload="metadata" playsinline muted data-v-0418df24></video>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:play",
							size: 24,
							class: "file-thumb__play"
						}, null, _parent));
						if (item.status === "uploading") _push(`<div class="file-thumb__progress" data-v-0418df24><div class="file-thumb__progress-bar" style="${ssrRenderStyle({ width: `${item.progress}%` })}" data-v-0418df24></div></div>`);
						else _push(`<!---->`);
						if (item.status !== "uploading") {
							_push(`<button class="file-thumb__remove" type="button" title="Remove" data-v-0418df24>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:x",
								size: 13
							}, null, _parent));
							_push(`</button>`);
						} else _push(`<!---->`);
						_push(`</div>`);
					}
					_push(`<!--]-->`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(ssrRenderComponent(MImagePreview_default, {
				show: showImagePreview.value,
				images: previewImages.value,
				initialIndex: previewInitialIndex.value,
				onClose: ($event) => showImagePreview.value = false
			}, null, _parent));
			ssrRenderTeleport(_push, (_push) => {
				if (showVideoPreview.value) {
					_push(`<div class="video-preview-overlay" data-v-0418df24><button class="preview-close" data-v-0418df24>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 24
					}, null, _parent));
					_push(`</button><video${ssrRenderAttr("src", currentVideoUrl.value)} class="video-preview-player" controls autoplay playsinline data-v-0418df24></video></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
			if (canAddMore.value && !isUploading.value) {
				_push(`<label class="file-upload__add" data-v-0418df24>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:upload",
					size: 14
				}, null, _parent));
				_push(`<span data-v-0418df24>${ssrInterpolate(attachedFiles.value.length === 0 ? "Add Files" : "Add More")}</span><input type="file"${ssrRenderAttr("accept", __props.accept)} multiple class="file-upload__input" data-v-0418df24></label>`);
			} else _push(`<!---->`);
			if (__props.hint) _push(`<p class="file-upload__hint" data-v-0418df24>${ssrInterpolate(__props.hint)}</p>`);
			else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/FileUpload.vue
var _sfc_setup = FileUpload_vue_vue_type_script_setup_true_lang_default.setup;
FileUpload_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FileUpload.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var FileUpload_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(FileUpload_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0418df24"]]), { __name: "FileUpload" });

export { FileUpload_default as F, MImagePreview_default as M };
//# sourceMappingURL=FileUpload-B-39JGGf.mjs.map
