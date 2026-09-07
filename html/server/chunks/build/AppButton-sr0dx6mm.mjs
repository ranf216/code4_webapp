import { t as components_default } from './components-DWHbB934.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

//#region app/components/AppButton.vue?vue&type=script&setup=true&lang.ts
var AppButton_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AppButton",
	__ssrInlineRender: true,
	props: {
		text: {},
		icon: {},
		type: { default: "primary" },
		size: { default: "md" },
		disabled: {
			type: Boolean,
			default: false
		}
	},
	emits: ["click"],
	setup(__props, { emit: __emit }) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<button${ssrRenderAttrs(mergeProps({
				class: ["app-button", [`app-button--${__props.type}`, `app-button--${__props.size}`]],
				disabled: __props.disabled
			}, _attrs))} data-v-07ae36f5>`);
			if (__props.icon) _push(ssrRenderComponent(_component_Icon, {
				name: __props.icon,
				size: __props.size === "sm" ? 14 : __props.size === "lg" ? 20 : 16
			}, null, _parent));
			else _push(`<!---->`);
			_push(`<span data-v-07ae36f5>${ssrInterpolate(__props.text)}</span></button>`);
		};
	}
});
//#endregion
//#region app/components/AppButton.vue
var _sfc_setup = AppButton_vue_vue_type_script_setup_true_lang_default.setup;
AppButton_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppButton.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var AppButton_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(AppButton_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-07ae36f5"]]), { __name: "AppButton" });

export { AppButton_default as A };
//# sourceMappingURL=AppButton-sr0dx6mm.mjs.map
