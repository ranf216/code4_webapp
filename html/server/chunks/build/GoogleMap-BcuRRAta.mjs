import { t as components_default } from './components-DWHbB934.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

//#region app/components/GoogleMap.vue?vue&type=script&setup=true&lang.ts
var GoogleMap_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "GoogleMap",
	__ssrInlineRender: true,
	props: {
		center: { default: () => ({
			lat: 34.0522,
			lng: -118.2437
		}) },
		zoom: { default: 15 },
		markers: { default: () => [] },
		routes: { default: () => [] },
		waypoints: { default: () => [] },
		posts: { default: () => [] },
		emergencyCalls: { default: () => [] },
		boundaries: { default: () => [] },
		height: { default: "100%" }
	},
	emits: ["marker-click"],
	setup(__props, { emit: __emit }) {
		ref(null);
		const error = ref(null);
		const loading = ref(true);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "gmap-wrap",
				style: { height: __props.height }
			}, _attrs))} data-v-b856f90c>`);
			if (unref(loading)) {
				_push(`<div class="gmap-state" data-v-b856f90c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-circle",
					size: 24,
					class: "gmap-state__spin text-muted"
				}, null, _parent));
				_push(`<span class="text-sm text-muted" data-v-b856f90c>Loading map…</span></div>`);
			} else if (unref(error)) {
				_push(`<div class="gmap-state" data-v-b856f90c>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:map-off",
					size: 28,
					class: "text-muted"
				}, null, _parent));
				_push(`<span class="text-sm text-muted" data-v-b856f90c>${ssrInterpolate(unref(error))}</span><span class="text-xs text-muted" data-v-b856f90c>Set NUXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env</span></div>`);
			} else _push(`<!---->`);
			_push(`<div class="gmap-el" data-v-b856f90c></div></div>`);
		};
	}
});
//#endregion
//#region app/components/GoogleMap.vue
var _sfc_setup = GoogleMap_vue_vue_type_script_setup_true_lang_default.setup;
GoogleMap_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GoogleMap.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var GoogleMap_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(GoogleMap_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-b856f90c"]]), { __name: "GoogleMap" });

export { GoogleMap_default as G };
//# sourceMappingURL=GoogleMap-BcuRRAta.mjs.map
