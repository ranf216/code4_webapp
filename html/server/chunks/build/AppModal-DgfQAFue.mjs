import { t as components_default } from './components-DWHbB934.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderStyle, ssrInterpolate, ssrRenderComponent, ssrRenderSlot, ssrIncludeBooleanAttr } from 'vue/server-renderer';

//#region app/components/AppModal.vue?vue&type=script&setup=true&lang.ts
var AppModal_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AppModal",
	__ssrInlineRender: true,
	props: {
		show: { type: Boolean },
		title: { default: "" },
		message: { default: "" },
		cancelText: { default: "Cancel" },
		okText: { default: "OK" },
		okDisabled: {
			type: Boolean,
			default: false
		},
		maxWidth: { default: "500px" }
	},
	emits: [
		"close",
		"cancel",
		"ok"
	],
	setup(__props, { emit: __emit }) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			__props.maxWidth;
			ssrRenderTeleport(_push, (_push) => {
				if (__props.show) {
					_push(`<div class="modal-backdrop" data-v-80999336><div class="modal" style="${ssrRenderStyle({ maxWidth: __props.maxWidth })}" data-v-80999336><div class="modal__header" data-v-80999336>`);
					if (__props.title) _push(`<h3 class="modal__title" data-v-80999336>${ssrInterpolate(__props.title)}</h3>`);
					else _push(`<!---->`);
					_push(`<button class="modal__close" data-v-80999336>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:circle-x",
						size: 24
					}, null, _parent));
					_push(`</button></div><div class="modal__body" data-v-80999336>`);
					ssrRenderSlot(_ctx.$slots, "default", {}, () => {
						if (__props.message) _push(`<p class="modal__message" data-v-80999336>${ssrInterpolate(__props.message)}</p>`);
						else _push(`<!---->`);
					}, _push, _parent);
					_push(`</div>`);
					if (__props.cancelText || __props.okText) {
						_push(`<div class="modal__footer" data-v-80999336>`);
						if (__props.cancelText) _push(`<button class="modal__btn modal__btn--secondary" data-v-80999336>${ssrInterpolate(__props.cancelText)}</button>`);
						else _push(`<!---->`);
						if (__props.okText) _push(`<button class="modal__btn modal__btn--primary"${ssrIncludeBooleanAttr(__props.okDisabled) ? " disabled" : ""} data-v-80999336>${ssrInterpolate(__props.okText)}</button>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else _push(`<!---->`);
					_push(`</div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
		};
	}
});
//#endregion
//#region app/components/AppModal.vue
var _sfc_setup = AppModal_vue_vue_type_script_setup_true_lang_default.setup;
AppModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppModal.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var AppModal_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(AppModal_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-80999336"]]), { __name: "AppModal" });

export { AppModal_default as A };
//# sourceMappingURL=AppModal-DgfQAFue.mjs.map
