import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, b as useRouter } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { I as ImageUpload_default } from './ImageUpload-CRnliurs.mjs';
import { O as OfficerPickerModal_default } from './OfficerPickerModal-Cn6UcFoe.mjs';
import { defineComponent, reactive, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
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
import './useFileApi-CLWuZDlq.mjs';
import './officer-CPsAbV7J.mjs';

//#region app/components/communities/AddForm.vue?vue&type=script&setup=true&lang.ts
var AddForm_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AddForm",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		useRouter();
		const form = reactive({
			name: "",
			area: "",
			mapImage: ""
		});
		const areaPredictions = ref([]);
		const showAreaPredictions = ref(false);
		const isSearchingArea = ref(false);
		ref(null);
		const showMapTool = ref(true);
		ref(false);
		const selectedOfficers = ref([]);
		const showOfficerPicker = ref(false);
		function getInitials(name) {
			return name.split(" ").map((p) => p[0] || "").join("").toUpperCase().slice(0, 2);
		}
		function handleOfficerPickerConfirm(officers) {
			selectedOfficers.value = officers;
			showOfficerPicker.value = false;
		}
		const isSubmitting = ref(false);
		const submitError = ref(null);
		const errors = reactive({});
		const isFormValid = computed(() => !!form.name.trim() && !!form.area.trim());
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<form${ssrRenderAttrs(mergeProps({ class: "community-form" }, _attrs))} data-v-fe88462a><div class="community-form__header" data-v-fe88462a><div class="community-form__header-left" data-v-fe88462a><h2 class="community-form__title" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.add_title"))}</h2><p class="community-form__subtitle" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.add_subtitle"))}</p></div><div class="community-form__header-actions" data-v-fe88462a><button type="button" class="form-actions__btn form-actions__btn--secondary" data-v-fe88462a>${ssrInterpolate(unref(t)("common.cancel"))}</button><button type="submit" class="form-actions__btn form-actions__btn--primary"${ssrIncludeBooleanAttr(isSubmitting.value || !unref(isFormValid)) ? " disabled" : ""} data-v-fe88462a>`);
			if (isSubmitting.value) _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:loader-2",
				size: 16,
				class: "spin"
			}, null, _parent));
			else _push(`<!---->`);
			_push(`<span data-v-fe88462a>${ssrInterpolate(isSubmitting.value ? unref(t)("common.saving") : unref(t)("common.save"))}</span></button></div></div>`);
			if (submitError.value) {
				_push(`<div class="form-submit-error" data-v-fe88462a>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:alert-circle",
					size: 16
				}, null, _parent));
				_push(`<span data-v-fe88462a>${ssrInterpolate(submitError.value)}</span></div>`);
			} else _push(`<!---->`);
			_push(`<div class="community-form__body" data-v-fe88462a><div class="community-form__column" data-v-fe88462a><div class="form-section" data-v-fe88462a><h3 class="form-section__title" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.basic_info"))}</h3><div class="form-row" data-v-fe88462a><div class="${ssrRenderClass([{ "form-field--error": unref(errors).name }, "form-field form-field--required"])}" data-v-fe88462a><label class="form-field__label" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.name"))}</label><input${ssrRenderAttr("value", unref(form).name)} type="text" class="form-field__input"${ssrRenderAttr("placeholder", unref(t)("communities.name_placeholder"))} data-v-fe88462a>`);
			if (unref(errors).name) _push(`<span class="form-field__error" data-v-fe88462a>${ssrInterpolate(unref(errors).name)}</span>`);
			else _push(`<!---->`);
			_push(`</div></div><div class="form-row" data-v-fe88462a><div class="${ssrRenderClass([{ "form-field--error": unref(errors).area }, "form-field form-field--required form-field--autocomplete"])}" data-v-fe88462a><label class="form-field__label" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.area"))}</label><div class="autocomplete-wrapper" data-v-fe88462a><textarea class="form-field__textarea" rows="3" required${ssrRenderAttr("placeholder", unref(t)("communities.area_placeholder"))} data-v-fe88462a>${ssrInterpolate(unref(form).area)}</textarea>`);
			if (isSearchingArea.value) _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:loader-2",
				size: 16,
				class: "autocomplete-loading spin"
			}, null, _parent));
			else _push(`<!---->`);
			if (showAreaPredictions.value) {
				_push(`<ul class="autocomplete-dropdown" data-v-fe88462a><!--[-->`);
				ssrRenderList(areaPredictions.value, (prediction) => {
					_push(`<li class="autocomplete-dropdown__item" data-v-fe88462a><strong class="autocomplete-dropdown__main" data-v-fe88462a>${ssrInterpolate(prediction.main_text)}</strong><span class="autocomplete-dropdown__secondary" data-v-fe88462a>${ssrInterpolate(prediction.secondary_text)}</span></li>`);
				});
				_push(`<!--]--></ul>`);
			} else _push(`<!---->`);
			_push(`</div>`);
			if (unref(errors).area) _push(`<span class="form-field__error" data-v-fe88462a>${ssrInterpolate(unref(errors).area)}</span>`);
			else _push(`<!---->`);
			_push(`</div></div></div><div class="form-section" data-v-fe88462a><h3 class="form-section__title" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.assignments"))}</h3><div class="form-field" style="${ssrRenderStyle({ "margin-bottom": "var(--space-4)" })}" data-v-fe88462a><label class="form-field__label" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.officers"))}</label>`);
			if (selectedOfficers.value.length) {
				_push(`<div class="add-form-officers-list" data-v-fe88462a><!--[-->`);
				ssrRenderList(selectedOfficers.value, (officer) => {
					_push(`<div class="add-form-officer-card" data-v-fe88462a>`);
					if (officer.picture) _push(`<div class="add-form-officer-avatar" data-v-fe88462a><img${ssrRenderAttr("src", officer.picture)}${ssrRenderAttr("alt", officer.fullName)} data-v-fe88462a></div>`);
					else _push(`<div class="add-form-officer-avatar add-form-officer-avatar--initials" data-v-fe88462a>${ssrInterpolate(getInitials(officer.fullName))}</div>`);
					_push(`<div class="add-form-officer-info" data-v-fe88462a><span class="add-form-officer-name" data-v-fe88462a>${ssrInterpolate(officer.fullName)}</span><span class="add-form-officer-title" data-v-fe88462a>${ssrInterpolate(officer.title)}</span></div><button type="button" class="add-form-officer-remove" data-v-fe88462a>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 13
					}, null, _parent));
					_push(`</button></div>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`<button type="button" class="add-form-officers-btn" data-v-fe88462a>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:user-plus",
				size: 15
			}, null, _parent));
			_push(`<span data-v-fe88462a>${ssrInterpolate(unref(t)("communities.add_officers"))}</span></button></div><div class="form-field" data-v-fe88462a><label class="form-field__label" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.residents"))}</label><button type="button" class="form-field__button form-field__button--secondary" disabled data-v-fe88462a>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:user-plus",
				size: 16
			}, null, _parent));
			_push(`<span data-v-fe88462a>${ssrInterpolate(unref(t)("communities.add_residents"))}</span></button><span class="form-field__hint" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.residents_hint"))}</span></div></div></div><div class="community-form__column" data-v-fe88462a><div class="form-section" data-v-fe88462a><h3 class="form-section__title" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.map_section"))}</h3><div class="map-upload" data-v-fe88462a>`);
			_push(ssrRenderComponent(ImageUpload_default, {
				modelValue: unref(form).mapImage,
				"onUpdate:modelValue": ($event) => unref(form).mapImage = $event,
				label: unref(t)("communities.map_dropzone"),
				"auto-upload": false,
				"preview-size": 200
			}, null, _parent));
			_push(`<p class="map-upload__hint" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.map_formats"))}</p><div class="map-tools" data-v-fe88462a><span class="map-tools__label" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.map_tools"))}</span><button type="button" class="${ssrRenderClass([{ "map-tools__btn--active": showMapTool.value }, "map-tools__btn"])}" data-v-fe88462a>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:hexagon",
				size: 14
			}, null, _parent));
			_push(`<span data-v-fe88462a>${ssrInterpolate(unref(t)("communities.draw_boundary"))}</span></button></div></div></div></div></div>`);
			_push(ssrRenderComponent(OfficerPickerModal_default, {
				show: showOfficerPicker.value,
				"preselected-ids": selectedOfficers.value.map((o) => o.id),
				onClose: ($event) => showOfficerPicker.value = false,
				onConfirm: handleOfficerPickerConfirm
			}, null, _parent));
			if (showMapTool.value) _push(`<div class="community-form__map-section" data-v-fe88462a><div class="form-section" data-v-fe88462a><h3 class="form-section__title" data-v-fe88462a>${ssrInterpolate(unref(t)("communities.draw_boundary"))}</h3><div id="wrapper" class="map" style="${ssrRenderStyle({ "height": "500px" })}" data-v-fe88462a><div id="map" class="map__leaflet" oncontextmenu="return false;" data-v-fe88462a></div><div id="controls" class="map__information" data-v-fe88462a><h1 class="hidden" data-v-fe88462a>Polyline Tool</h1><a class="linker disabled hidden" href="#" data-v-fe88462a><svg width="100%" height="100%" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" data-v-fe88462a><path d="M1520 1216q0-40-28-68l-208-208q-28-28-68-28-42 0-72 32 3 3 19 18.5t21.5 21.5 15 19 13 25.5 3.5 27.5q0 40-28 68t-68 28q-15 0-27.5-3.5t-25.5-13-19-15-21.5-21.5-18.5-19q-33 31-33 73 0 40 28 68l206 207q27 27 68 27 40 0 68-26l147-146q28-28 28-67zm-703-705q0-40-28-68l-206-207q-28-28-68-28-39 0-68 27l-147 146q-28 28-28 67 0 40 28 68l208 208q27 27 68 27 42 0 72-31-3-3-19-18.5t-21.5-21.5-15-19-13-25.5-3.5-27.5q0-40 28-68t68-28q15 0 27.5 3.5t25.5 13 19 15 21.5 21.5 18.5 19q33-31 33-73zm895 705q0 120-85 203l-147 146q-83 83-203 83-121 0-204-85l-206-207q-83-83-83-203 0-123 88-209l-88-88q-86 88-208 88-120 0-204-84l-208-208q-84-84-84-204t85-203l147-146q83-83 203-83 121 0 204 85l206 207q83 83 83 203 0 123-88 209l88 88q86-88 208-88 120 0 204 84l208 208q84 84 84 204z" fill="#d0e1f9" data-v-fe88462a></path></svg></a><div class="map__information__buttons" data-v-fe88462a><button type="button" id="import" class="enabled" title="Import Coordinates" data-v-fe88462a>Import</button><button type="button" id="reset" class="enabled" title="Clear all Points" data-v-fe88462a>Reset</button><button type="button" id="undo" class="enabled" title="Undo Last Edit" data-v-fe88462a>Undo</button><button type="button" id="close" class="enabled" title="Close Shape" data-v-fe88462a>Close Shape</button></div><form class="map__information__form" name="import" method="GET" data-v-fe88462a><textarea name="coordinates" placeholder="longitude1, latitude1
                                                                  longitude2, latitude2
                                                                  etc." data-v-fe88462a></textarea><p class="map__information__form__error" data-v-fe88462a></p><button type="button" class="enabled" data-v-fe88462a>Import</button><button type="button" class="enabled" data-v-fe88462a>Cancel</button></form><div class="map__information__echo" data-v-fe88462a><p class="map__information__instruction m-2-t" data-v-fe88462a>Right click on map to begin.</p><div class="map__information__output" data-v-fe88462a><p class="map__information__alert hidden" data-v-fe88462a><svg width="20" version="1.1" id="reverse" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 38 38" enable-background="new 0 0 38 38" xml:space="preserve" data-v-fe88462a><path fill="#fff" d="M24.9,13.7c0,0,3,0.9,4.2,2.6c1.4,1.8,1.5,6.3-4.3,6.6l0-4.9l-8.2,7.6l8.2,7.6l0-4.6c0,0,3.7,0.1,6.1-1.9 C35.3,23.2,34.4,14.6,24.9,13.7z" data-v-fe88462a></path><path fill="#fff" d="M21.2,13.6L13,5.9l0,4.6c0,0-3.7-0.1-6.1,1.9C2.5,16,3.4,24.6,12.9,25.5c0,0-3-0.9-4.2-2.6c-1.4-1.8-1.5-6.3,4.3-6.6l0,4.9 L21.2,13.6z" data-v-fe88462a></path></svg> Coordinate order reversed to conform to <a href="https://tools.ietf.org/html/rfc7946#section-3.1.6" data-v-fe88462a>right-hand rule</a>. </p><pre class="map__information__coordinates" id="coordinates-rs" data-v-fe88462a></pre><pre class="map__information__geojson" id="polygon-rs" data-v-fe88462a></pre></div></div></div></div></div></div>`);
			else _push(`<!---->`);
			_push(`</form>`);
		};
	}
});
//#endregion
//#region app/components/communities/AddForm.vue
var _sfc_setup$1 = AddForm_vue_vue_type_script_setup_true_lang_default.setup;
AddForm_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/communities/AddForm.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var AddForm_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(AddForm_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-fe88462a"]]), { __name: "AddForm" });
//#endregion
//#region app/pages/communities/new.vue?vue&type=script&setup=true&lang.ts
var new_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "new",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_AddForm = AddForm_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: "Add Community",
				breadcrumb: [
					{ label: "Manage" },
					{
						label: "Communities",
						to: "/communities"
					},
					{ label: "Add New" }
				],
				"show-search": true
			}, null, _parent));
			_push(`<div class="add-community-page" data-v-d30adac0>`);
			_push(ssrRenderComponent(_component_AddForm, null, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/communities/new.vue
var _sfc_setup = new_vue_vue_type_script_setup_true_lang_default.setup;
new_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/communities/new.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var new_default = /*#__PURE__*/ _plugin_vue_export_helper_default(new_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-d30adac0"]]);

export { new_default as default };
//# sourceMappingURL=new-DEfJGIaO.mjs.map
