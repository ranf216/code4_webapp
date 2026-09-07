import { L as LoadingModal_default } from './LoadingModal-Ca3iKXhe.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { useLoadingStore } from './loading-BV_6sFtq.mjs';
import { mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot, ssrRenderComponent } from 'vue/server-renderer';
import './components-DWHbB934.mjs';
import '../virtual/entry.mjs';
import 'nostics';
import 'nostics/formatters/ansi';
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
import '@iconify/vue';
import 'axios';
import 'unhead/utils';
import '@iconify/utils/lib/css/icon';

//#region app/layouts/auth.vue
var _sfc_main = {
	__name: "auth",
	__ssrInlineRender: true,
	setup(__props) {
		const loadingStore = useLoadingStore();
		return (_ctx, _push, _parent, _attrs) => {
			const _component_LoadingModal = LoadingModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "auth-shell" }, _attrs))} data-v-7822a05d>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(ssrRenderComponent(_component_LoadingModal, {
				show: unref(loadingStore).showLoading,
				message: unref(loadingStore).message
			}, null, _parent));
			_push(`</div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/auth.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var auth_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-7822a05d"]]);

export { auth_default as default };
//# sourceMappingURL=auth-q2O2NqaX.mjs.map
