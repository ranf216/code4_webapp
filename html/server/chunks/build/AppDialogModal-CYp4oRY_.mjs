import { t as components_default } from './components-DWHbB934.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, watch, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderStyle, ssrInterpolate, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';

//#region app/components/AppDialogModal.vue?vue&type=script&setup=true&lang.ts
var AppDialogModal_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AppDialogModal",
	__ssrInlineRender: true,
	props: {
		show: { type: Boolean },
		title: {},
		maxWidth: { default: "600px" }
	},
	emits: ["close"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		watch(() => props.show, (newVal) => {
			if (newVal) (void 0).body.style.overflow = "hidden";
			else (void 0).body.style.overflow = "";
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			ssrRenderTeleport(_push, (_push) => {
				if (__props.show) {
					_push(`<div class="dialog-modal-backdrop" data-v-c7db73b4><div class="dialog-modal" style="${ssrRenderStyle({ maxWidth: props.maxWidth })}" data-v-c7db73b4><div class="dialog-modal__header" data-v-c7db73b4><h3 class="dialog-modal__title" data-v-c7db73b4>${ssrInterpolate(__props.title)}</h3><button class="dialog-modal__close" data-v-c7db73b4>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 20
					}, null, _parent));
					_push(`</button></div><div class="dialog-modal__body" data-v-c7db73b4>`);
					ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
					_push(`</div>`);
					if (_ctx.$slots.footer) {
						_push(`<div class="dialog-modal__footer" data-v-c7db73b4>`);
						ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push, _parent);
						_push(`</div>`);
					} else _push(`<!---->`);
					_push(`</div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
		};
	}
});
//#endregion
//#region app/components/AppDialogModal.vue
var _sfc_setup = AppDialogModal_vue_vue_type_script_setup_true_lang_default.setup;
AppDialogModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppDialogModal.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var AppDialogModal_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(AppDialogModal_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c7db73b4"]]), { __name: "AppDialogModal" });

export { AppDialogModal_default as A };
//# sourceMappingURL=AppDialogModal-CYp4oRY_.mjs.map
