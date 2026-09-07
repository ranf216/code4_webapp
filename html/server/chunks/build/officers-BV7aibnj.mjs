import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { O as OfficersManagement_default } from './OfficersManagement-RMZMepGf.mjs';
import { defineComponent, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
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
import './AppModal-DgfQAFue.mjs';
import 'moment';
import './officer-CPsAbV7J.mjs';
import './Badge-BbyZfskr.mjs';
import './AppButton-sr0dx6mm.mjs';
import './ImageUpload-CRnliurs.mjs';
import './useFileApi-CLWuZDlq.mjs';

//#region app/pages/officers/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_OfficersManagement = OfficersManagement_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: "Officers",
				breadcrumb: [{ label: "Manage" }, { label: "Officers" }],
				"show-search": true
			}, null, _parent));
			_push(`<div class="officers-page" data-v-1f69bcda>`);
			_push(ssrRenderComponent(_component_OfficersManagement, null, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/officers/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/officers/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var officers_default = /*#__PURE__*/ _plugin_vue_export_helper_default(index_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-1f69bcda"]]);

export { officers_default as default };
//# sourceMappingURL=officers-BV7aibnj.mjs.map
