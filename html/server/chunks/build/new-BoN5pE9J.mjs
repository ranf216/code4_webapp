import { a as useTranslation } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { P as PostOrderForm_default } from './PostOrderForm-CEhvVEJd.mjs';
import { defineComponent, unref, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
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
import './components-DWHbB934.mjs';
import '@iconify/utils/lib/css/icon';
import './AppModal-DgfQAFue.mjs';
import 'moment';
import './FileUpload-B-39JGGf.mjs';
import './useFileApi-CLWuZDlq.mjs';
import './Badge-BbyZfskr.mjs';
import './AppDialogModal-CYp4oRY_.mjs';

//#region app/pages/post-orders/new.vue?vue&type=script&setup=true&lang.ts
var new_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "new",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_PostOrderForm = PostOrderForm_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: unref(t)("post_orders.create_page_title"),
				breadcrumb: [
					{ label: unref(t)("nav.manage") },
					{
						label: unref(t)("nav.post_orders"),
						to: "/post-orders"
					},
					{ label: unref(t)("post_orders.create_new") }
				]
			}, null, _parent));
			_push(`<div class="new-post-order-page" data-v-c13416e3>`);
			_push(ssrRenderComponent(_component_PostOrderForm, null, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/post-orders/new.vue
var _sfc_setup = new_vue_vue_type_script_setup_true_lang_default.setup;
new_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/post-orders/new.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var new_default = /*#__PURE__*/ _plugin_vue_export_helper_default(new_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c13416e3"]]);

export { new_default as default };
//# sourceMappingURL=new-BoN5pE9J.mjs.map
