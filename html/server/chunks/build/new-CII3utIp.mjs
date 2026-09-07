import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { P as POIForm_default } from './POIForm-Ck2f-ZSg.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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

//#region app/pages/poi/new.vue?vue&type=script&setup=true&lang.ts
var new_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "new",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_POIForm = POIForm_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "poi-new-page" }, _attrs))} data-v-0dd24695>`);
			_push(ssrRenderComponent(_component_POIForm, { mode: "create" }, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/poi/new.vue
var _sfc_setup = new_vue_vue_type_script_setup_true_lang_default.setup;
new_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/poi/new.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var new_default = /*#__PURE__*/ _plugin_vue_export_helper_default(new_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0dd24695"]]);

export { new_default as default };
//# sourceMappingURL=new-CII3utIp.mjs.map
