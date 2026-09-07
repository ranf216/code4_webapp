import { t as components_default } from './components-DWHbB934.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

//#region app/components/LoadingModal.vue?vue&type=script&setup=true&lang.ts
var LoadingModal_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "LoadingModal",
	__ssrInlineRender: true,
	props: {
		show: { type: Boolean },
		message: { default: "Loading..." }
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			ssrRenderTeleport(_push, (_push) => {
				if (__props.show) {
					_push(`<div class="loading-modal-overlay" data-v-bcf0b29f><div class="loading-modal" data-v-bcf0b29f><div class="loading-modal__spinner" data-v-bcf0b29f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:loader-circle",
						size: 48,
						class: "spin"
					}, null, _parent));
					_push(`</div>`);
					if (__props.message) _push(`<p class="loading-modal__message" data-v-bcf0b29f>${ssrInterpolate(__props.message)}</p>`);
					else _push(`<!---->`);
					_push(`</div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
		};
	}
});
//#endregion
//#region app/components/LoadingModal.vue
var _sfc_setup = LoadingModal_vue_vue_type_script_setup_true_lang_default.setup;
LoadingModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LoadingModal.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var LoadingModal_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(LoadingModal_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-bcf0b29f"]]), { __name: "LoadingModal" });

export { LoadingModal_default as L };
//# sourceMappingURL=LoadingModal-Ca3iKXhe.mjs.map
