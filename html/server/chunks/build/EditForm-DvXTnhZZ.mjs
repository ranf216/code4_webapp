import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, b as useRouter, N as NuxtLink } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { I as ImageUpload_default } from './ImageUpload-CRnliurs.mjs';
import { O as OfficerPickerModal_default } from './OfficerPickerModal-Cn6UcFoe.mjs';
import { defineComponent, reactive, ref, unref, mergeProps, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrLooseContain } from 'vue/server-renderer';

//#region app/components/communities/EditForm.vue?vue&type=script&setup=true&lang.ts
var EditForm_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "EditForm",
	__ssrInlineRender: true,
	props: { communityId: {} },
	setup(__props) {
		const props = __props;
		const { t } = useTranslation();
		useRouter();
		const form = reactive({
			id: props.communityId,
			name: "",
			area: "",
			officers: [],
			residents: [],
			posts: [],
			mapEnabled: false,
			active: true,
			registrationDate: "",
			callsCount: 0,
			mapImage: "",
			mapBoundaries: ""
		});
		const showMapTool = ref(true);
		ref(false);
		const existingMapImageUrl = ref(null);
		const isLoading = ref(false);
		const loadError = ref(null);
		const isSubmitting = ref(false);
		const submitError = ref(null);
		const errors = reactive({});
		const newPost = ref("");
		const communityOfficers = ref([]);
		const isLoadingOfficers = ref(false);
		function getOfficerInitials(name) {
			return name.split(" ").map((p) => p[0] || "").join("").toUpperCase().slice(0, 2);
		}
		const isRemovingOfficer = ref(null);
		const showAddOfficerModal = ref(false);
		function handleOfficerPickerConfirm(officers) {
			const existingMap = new Map(communityOfficers.value.map((o) => [o.id, o]));
			communityOfficers.value = officers.map((o) => existingMap.get(o.id) ?? {
				id: o.id,
				fullName: o.fullName,
				title: o.title,
				mobile: "",
				picture: o.picture,
				active: o.active
			});
			showAddOfficerModal.value = false;
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_NuxtLink = NuxtLink;
			const _component_OfficerPickerModal = OfficerPickerModal_default;
			if (unref(isLoading)) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "community-form-loading" }, _attrs))} data-v-0a259023>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-circle",
					size: 28,
					class: "spin"
				}, null, _parent));
				_push(`<span data-v-0a259023>Loading community...</span></div>`);
			} else if (unref(loadError)) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "community-form-error" }, _attrs))} data-v-0a259023>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:alert-circle",
					size: 18
				}, null, _parent));
				_push(`<span data-v-0a259023>${ssrInterpolate(unref(loadError))}</span><button type="button" class="form-actions__btn form-actions__btn--secondary" style="${ssrRenderStyle({
					"height": "32px",
					"padding": "0 12px",
					"font-size": "13px"
				})}" data-v-0a259023>Retry</button></div>`);
			} else {
				_push(`<form${ssrRenderAttrs(mergeProps({ class: "community-form" }, _attrs))} data-v-0a259023><div class="community-form__header" data-v-0a259023><div class="community-form__header-left" data-v-0a259023><h2 class="community-form__title" data-v-0a259023>${ssrInterpolate(unref(t)("communities.edit_title"))}</h2><p class="community-form__subtitle" data-v-0a259023>${ssrInterpolate(unref(form).name)}</p></div><div class="community-form__header-actions" data-v-0a259023><button type="button" class="form-actions__btn form-actions__btn--secondary" data-v-0a259023>${ssrInterpolate(unref(t)("common.cancel"))}</button><button type="submit" class="form-actions__btn form-actions__btn--primary"${ssrIncludeBooleanAttr(unref(isSubmitting)) ? " disabled" : ""} data-v-0a259023>`);
				if (unref(isSubmitting)) _push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 16,
					class: "spin"
				}, null, _parent));
				else _push(`<!---->`);
				_push(`<span data-v-0a259023>${ssrInterpolate(unref(isSubmitting) ? unref(t)("common.saving") : unref(t)("common.save"))}</span></button></div></div>`);
				if (unref(submitError)) {
					_push(`<div class="community-form-submit-error" data-v-0a259023>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:alert-circle",
						size: 16
					}, null, _parent));
					_push(`<span data-v-0a259023>${ssrInterpolate(unref(submitError))}</span></div>`);
				} else _push(`<!---->`);
				_push(`<div class="community-form__body" data-v-0a259023><div class="community-form__column" data-v-0a259023><div class="form-section" data-v-0a259023><h3 class="form-section__title" data-v-0a259023>${ssrInterpolate(unref(t)("communities.basic_info"))}</h3><div class="form-row" data-v-0a259023><div class="${ssrRenderClass([{ "form-field--error": unref(errors).name }, "form-field form-field--required"])}" data-v-0a259023><label class="form-field__label" data-v-0a259023>${ssrInterpolate(unref(t)("communities.name"))}</label><input${ssrRenderAttr("value", unref(form).name)} type="text" class="form-field__input"${ssrRenderAttr("placeholder", unref(t)("communities.name_placeholder"))} data-v-0a259023>`);
				if (unref(errors).name) _push(`<span class="form-field__error" data-v-0a259023>${ssrInterpolate(unref(errors).name)}</span>`);
				else _push(`<!---->`);
				_push(`</div></div><div class="form-row" data-v-0a259023><div class="${ssrRenderClass([{ "form-field--error": unref(errors).area }, "form-field form-field--required"])}" data-v-0a259023><label class="form-field__label" data-v-0a259023>${ssrInterpolate(unref(t)("communities.area"))}</label><textarea class="form-field__textarea" rows="3"${ssrRenderAttr("placeholder", unref(t)("communities.area_placeholder"))} data-v-0a259023>${ssrInterpolate(unref(form).area)}</textarea>`);
				if (unref(errors).area) _push(`<span class="form-field__error" data-v-0a259023>${ssrInterpolate(unref(errors).area)}</span>`);
				else _push(`<!---->`);
				_push(`</div></div><div class="form-row" data-v-0a259023><div class="form-field form-field--readonly" data-v-0a259023><label class="form-field__label" data-v-0a259023>${ssrInterpolate(unref(t)("communities.calls"))}</label>`);
				_push(ssrRenderComponent(_component_NuxtLink, {
					to: `/communities/${unref(form).id}/calls`,
					class: "form-field__button form-field__button--link"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:phone",
								size: 16
							}, null, _parent, _scopeId));
							_push(`<span data-v-0a259023${_scopeId}>${ssrInterpolate(unref(t)("communities.view_calls", { count: String(unref(form).callsCount) }))}</span>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:external-link",
								size: 14
							}, null, _parent, _scopeId));
						} else return [
							createVNode(_component_Icon, {
								name: "lucide:phone",
								size: 16
							}),
							createVNode("span", null, toDisplayString(unref(t)("communities.view_calls", { count: String(unref(form).callsCount) })), 1),
							createVNode(_component_Icon, {
								name: "lucide:external-link",
								size: 14
							})
						];
					}),
					_: 1
				}, _parent));
				_push(`</div></div></div><div class="form-section" data-v-0a259023><h3 class="form-section__title" data-v-0a259023>${ssrInterpolate(unref(t)("communities.officers"))}</h3>`);
				if (unref(isLoadingOfficers)) {
					_push(`<div class="officers-loading" data-v-0a259023>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:loader-2",
						size: 16,
						class: "spin"
					}, null, _parent));
					_push(`<span data-v-0a259023>${ssrInterpolate(unref(t)("common.loading"))}</span></div>`);
				} else if (unref(communityOfficers).length) {
					_push(`<div class="community-officers-list" data-v-0a259023><!--[-->`);
					ssrRenderList(unref(communityOfficers), (officer) => {
						_push(`<div class="community-officer-card" data-v-0a259023>`);
						if (officer.picture) _push(`<div class="community-officer-avatar" data-v-0a259023><img${ssrRenderAttr("src", officer.picture)}${ssrRenderAttr("alt", officer.fullName)} data-v-0a259023></div>`);
						else _push(`<div class="community-officer-avatar community-officer-avatar--initials" data-v-0a259023>${ssrInterpolate(getOfficerInitials(officer.fullName))}</div>`);
						_push(`<div class="community-officer-info" data-v-0a259023><div class="community-officer-name-row" data-v-0a259023><span class="community-officer-name" data-v-0a259023>${ssrInterpolate(officer.fullName)}</span><span class="${ssrRenderClass(["community-officer-status", officer.active ? "community-officer-status--active" : "community-officer-status--inactive"])}" data-v-0a259023>${ssrInterpolate(officer.active ? unref(t)("common.active") : unref(t)("common.inactive"))}</span></div><span class="community-officer-title" data-v-0a259023>${ssrInterpolate(officer.title)}</span><span class="community-officer-phone" data-v-0a259023>${ssrInterpolate(officer.mobile)}</span></div><button type="button" class="community-officer-remove"${ssrRenderAttr("title", unref(t)("communities.remove_officer"))}${ssrIncludeBooleanAttr(unref(isRemovingOfficer) === officer.id) ? " disabled" : ""} data-v-0a259023>`);
						if (unref(isRemovingOfficer) === officer.id) _push(ssrRenderComponent(_component_Icon, {
							name: "lucide:loader-2",
							size: 14,
							class: "spin"
						}, null, _parent));
						else _push(ssrRenderComponent(_component_Icon, {
							name: "lucide:user-minus",
							size: 14
						}, null, _parent));
						_push(`</button></div>`);
					});
					_push(`<!--]--></div>`);
				} else _push(`<span class="form-field__hint" data-v-0a259023>${ssrInterpolate(unref(t)("communities.no_officers"))}</span>`);
				_push(`<div class="community-officers-actions" data-v-0a259023><button type="button" class="community-officers-add-btn" data-v-0a259023>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:user-plus",
					size: 15
				}, null, _parent));
				_push(`<span data-v-0a259023>${ssrInterpolate(unref(t)("communities.add_officers"))}</span></button></div></div><div class="form-section" data-v-0a259023><h3 class="form-section__title" data-v-0a259023>${ssrInterpolate(unref(t)("communities.residents"))}</h3>`);
				if (unref(form).residents.length) {
					_push(`<div class="items-list" data-v-0a259023><!--[-->`);
					ssrRenderList(unref(form).residents, (resident, index) => {
						_push(`<div class="item-row" data-v-0a259023><span class="item-row__name" data-v-0a259023>${ssrInterpolate(resident)}</span><button type="button" class="item-row__remove" data-v-0a259023>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:x",
							size: 14
						}, null, _parent));
						_push(`</button></div>`);
					});
					_push(`<!--]--></div>`);
				} else _push(`<span class="form-field__hint" data-v-0a259023>${ssrInterpolate(unref(t)("communities.no_residents"))}</span>`);
				_push(`<div class="form-row form-row--inline" data-v-0a259023><button type="button" class="form-field__button form-field__button--secondary" data-v-0a259023>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:plus",
					size: 16
				}, null, _parent));
				_push(`<span data-v-0a259023>${ssrInterpolate(unref(t)("communities.add_residents"))}</span></button></div></div></div><div class="community-form__column" data-v-0a259023><div class="form-section form-section--compact" data-v-0a259023><div class="form-row form-row--inline" data-v-0a259023><div class="form-field form-field--readonly" data-v-0a259023><label class="form-field__label" data-v-0a259023>${ssrInterpolate(unref(t)("communities.registration_date"))}</label><div class="form-field__readonly" data-v-0a259023>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:calendar",
					size: 16
				}, null, _parent));
				_push(`<span data-v-0a259023>${ssrInterpolate(unref(form).registrationDate)}</span></div></div><div class="form-field" data-v-0a259023><label class="form-field__label" data-v-0a259023>${ssrInterpolate(unref(t)("common.status"))}</label><div class="active-toggle" data-v-0a259023><label class="active-toggle__label" data-v-0a259023><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).active) ? ssrLooseContain(unref(form).active, null) : unref(form).active) ? " checked" : ""} type="checkbox" class="active-toggle__input" data-v-0a259023><span class="active-toggle__switch" data-v-0a259023></span><span class="active-toggle__text" data-v-0a259023>${ssrInterpolate(unref(form).active ? unref(t)("common.active") : unref(t)("common.inactive"))}</span></label></div></div></div></div><div class="form-section" data-v-0a259023><h3 class="form-section__title" data-v-0a259023>${ssrInterpolate(unref(t)("communities.map_section"))}</h3><div class="map-upload" data-v-0a259023>`);
				_push(ssrRenderComponent(ImageUpload_default, {
					modelValue: unref(form).mapImage,
					"onUpdate:modelValue": ($event) => unref(form).mapImage = $event,
					"initial-url": unref(existingMapImageUrl) || void 0,
					label: unref(t)("communities.map_dropzone"),
					"auto-upload": false,
					"preview-size": 200
				}, null, _parent));
				_push(`<p class="map-upload__hint" data-v-0a259023>${ssrInterpolate(unref(t)("communities.map_formats"))}</p><div class="map-tools" data-v-0a259023><span class="map-tools__label" data-v-0a259023>${ssrInterpolate(unref(t)("communities.map_tools"))}</span><button type="button" class="${ssrRenderClass([{ "map-tools__btn--active": unref(showMapTool) }, "map-tools__btn"])}" data-v-0a259023>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:hexagon",
					size: 14
				}, null, _parent));
				_push(`<span data-v-0a259023>${ssrInterpolate(unref(t)("communities.draw_boundary"))}</span></button><button type="button" class="map-tools__btn" data-v-0a259023>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:door-open",
					size: 14
				}, null, _parent));
				_push(`<span data-v-0a259023>${ssrInterpolate(unref(t)("communities.add_doors"))}</span></button><button type="button" class="map-tools__btn" data-v-0a259023>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:layout-grid",
					size: 14
				}, null, _parent));
				_push(`<span data-v-0a259023>${ssrInterpolate(unref(t)("communities.add_windows"))}</span></button></div></div></div><div class="form-section" data-v-0a259023><h3 class="form-section__title" data-v-0a259023>${ssrInterpolate(unref(t)("communities.posts_section"))}</h3><div class="form-row" data-v-0a259023><div class="form-field" data-v-0a259023><label class="form-field__label" data-v-0a259023>${ssrInterpolate(unref(t)("communities.posts"))}</label><div class="posts-input" data-v-0a259023><input${ssrRenderAttr("value", unref(newPost))} type="text" class="form-field__input"${ssrRenderAttr("placeholder", unref(t)("communities.post_placeholder"))} data-v-0a259023><button type="button" class="posts-input__btn" data-v-0a259023>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:plus",
					size: 16
				}, null, _parent));
				_push(`</button></div>`);
				if (unref(form).posts.length) {
					_push(`<div class="posts-list" data-v-0a259023><!--[-->`);
					ssrRenderList(unref(form).posts, (post, index) => {
						_push(`<span class="post-tag" data-v-0a259023>${ssrInterpolate(post)} <button type="button" class="post-tag__remove" data-v-0a259023>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:x",
							size: 12
						}, null, _parent));
						_push(`</button></span>`);
					});
					_push(`<!--]--></div>`);
				} else _push(`<span class="form-field__hint" data-v-0a259023>${ssrInterpolate(unref(t)("communities.posts_hint"))}</span>`);
				_push(`</div></div></div></div></div>`);
				_push(ssrRenderComponent(_component_OfficerPickerModal, {
					show: unref(showAddOfficerModal),
					"preselected-ids": unref(communityOfficers).map((o) => o.id),
					onClose: ($event) => showAddOfficerModal.value = false,
					onConfirm: handleOfficerPickerConfirm
				}, null, _parent));
				if (unref(showMapTool)) _push(`<div class="community-form__map-section" data-v-0a259023><div class="form-section" data-v-0a259023><h3 class="form-section__title" data-v-0a259023>${ssrInterpolate(unref(t)("communities.draw_boundary"))}</h3><div id="wrapper" class="map" style="${ssrRenderStyle({ "height": "500px" })}" data-v-0a259023><div id="map" class="map__leaflet" oncontextmenu="return false;" data-v-0a259023></div><div id="controls" class="map__information" data-v-0a259023><h1 class="hidden" data-v-0a259023>Polyline Tool</h1><a class="linker disabled hidden" href="#" data-v-0a259023><svg width="100%" height="100%" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" data-v-0a259023><path d="M1520 1216q0-40-28-68l-208-208q-28-28-68-28-42 0-72 32 3 3 19 18.5t21.5 21.5 15 19 13 25.5 3.5 27.5q0 40-28 68t-68 28q-15 0-27.5-3.5t-25.5-13-19-15-21.5-21.5-18.5-19q-33 31-33 73 0 40 28 68l206 207q27 27 68 27 40 0 68-26l147-146q28-28 28-67zm-703-705q0-40-28-68l-206-207q-28-28-68-28-39 0-68 27l-147 146q-28 28-28 67 0 40 28 68l208 208q27 27 68 27 42 0 72-31-3-3-19-18.5t-21.5-21.5-15-19-13-25.5-3.5-27.5q0-40 28-68t68-28q15 0 27.5 3.5t25.5 13 19 15 21.5 21.5 18.5 19q33-31 33-73zm895 705q0 120-85 203l-147 146q-83 83-203 83-121 0-204-85l-206-207q-83-83-83-203 0-123 88-209l-88-88q-86 88-208 88-120 0-204-84l-208-208q-84-84-84-204t85-203l147-146q83-83 203-83 121 0 204 85l206 207q83 83 83 203 0 123-88 209l88 88q86-88 208-88 120 0 204 84l208 208q84 84 84 204z" fill="#d0e1f9" data-v-0a259023></path></svg></a><div class="map__information__buttons" data-v-0a259023><button type="button" id="import" class="enabled" title="Import Coordinates" data-v-0a259023>Import</button><button type="button" id="reset" class="enabled" title="Clear all Points" data-v-0a259023>Reset</button><button type="button" id="undo" class="enabled" title="Undo Last Edit" data-v-0a259023>Undo</button><button type="button" id="close" class="enabled" title="Close Shape" data-v-0a259023>Close Shape</button></div><form class="map__information__form" name="import" method="GET" data-v-0a259023><textarea name="coordinates" placeholder="longitude1, latitude1
                                                                  longitude2, latitude2
                                                                  etc." data-v-0a259023></textarea><p class="map__information__form__error" data-v-0a259023></p><button type="button" class="enabled" data-v-0a259023>Import</button><button type="button" class="enabled" data-v-0a259023>Cancel</button></form><div class="map__information__echo" data-v-0a259023><p class="map__information__instruction m-2-t" data-v-0a259023>Right click on map to begin.</p><div class="map__information__output" data-v-0a259023><p class="map__information__alert hidden" data-v-0a259023><svg width="20" version="1.1" id="reverse" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 38 38" enable-background="new 0 0 38 38" xml:space="preserve" data-v-0a259023><path fill="#fff" d="M24.9,13.7c0,0,3,0.9,4.2,2.6c1.4,1.8,1.5,6.3-4.3,6.6l0-4.9l-8.2,7.6l8.2,7.6l0-4.6c0,0,3.7,0.1,6.1-1.9 C35.3,23.2,34.4,14.6,24.9,13.7z" data-v-0a259023></path><path fill="#fff" d="M21.2,13.6L13,5.9l0,4.6c0,0-3.7-0.1-6.1,1.9C2.5,16,3.4,24.6,12.9,25.5c0,0-3-0.9-4.2-2.6c-1.4-1.8-1.5-6.3,4.3-6.6l0,4.9 L21.2,13.6z" data-v-0a259023></path></svg> Coordinate order reversed to conform to <a href="https://tools.ietf.org/html/rfc7946#section-3.1.6" data-v-0a259023>right-hand rule</a>. </p><pre class="map__information__coordinates" id="coordinates-rs" data-v-0a259023></pre><pre class="map__information__geojson" id="polygon-rs" data-v-0a259023></pre></div></div></div></div></div></div>`);
				else _push(`<!---->`);
				_push(`</form>`);
			}
		};
	}
});
//#endregion
//#region app/components/communities/EditForm.vue
var _sfc_setup = EditForm_vue_vue_type_script_setup_true_lang_default.setup;
EditForm_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/communities/EditForm.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var EditForm_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(EditForm_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0a259023"]]), { __name: "EditForm" });

export { EditForm_default as E };
//# sourceMappingURL=EditForm-DvXTnhZZ.mjs.map
