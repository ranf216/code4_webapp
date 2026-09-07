import { a as useTranslation, u as useRoute } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { P as PostOrderForm_default } from './PostOrderForm-CEhvVEJd.mjs';
import { defineComponent, computed, unref, useSSRContext } from 'vue';
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

//#region app/pages/post-orders/[id].vue?vue&type=script&setup=true&lang.ts
var _id__vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "[id]",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const route = useRoute();
		const postOrderId = computed(() => route.params.id);
		const DEMO_HISTORY = {
			"PO-001": [
				{
					version: "1.2",
					versionType: "minor",
					publishedBy: "Sarah Mitchell",
					publishedAt: "2026-05-10T09:14:00Z",
					effectiveDate: "2026-05-01",
					changeSummary: "Clarified patrol frequency during peak hours and updated radio channel."
				},
				{
					version: "1.1",
					versionType: "minor",
					publishedBy: "Sarah Mitchell",
					publishedAt: "2026-03-22T14:30:00Z",
					effectiveDate: "2026-03-22",
					changeSummary: "Added new emergency contact numbers for site manager."
				},
				{
					version: "1.0",
					versionType: "major",
					publishedBy: "James Okafor",
					publishedAt: "2026-01-15T08:00:00Z",
					effectiveDate: "2026-01-15",
					changeSummary: "Initial publish of Main Entrance Post Order."
				}
			],
			"PO-002": []
		};
		const historyEntries = computed(() => DEMO_HISTORY[postOrderId.value] ?? []);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_PostOrderForm = PostOrderForm_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: unref(t)("post_orders.edit_page_title"),
				breadcrumb: [
					{ label: unref(t)("nav.manage") },
					{
						label: unref(t)("nav.post_orders"),
						to: "/post-orders"
					},
					{ label: postOrderId.value }
				]
			}, null, _parent));
			_push(`<div class="edit-post-order-page" data-v-93d211c7>`);
			_push(ssrRenderComponent(_component_PostOrderForm, {
				mode: "edit",
				"post-order-id": postOrderId.value,
				"history-entries": historyEntries.value
			}, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/post-orders/[id].vue
var _sfc_setup = _id__vue_vue_type_script_setup_true_lang_default.setup;
_id__vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/post-orders/[id].vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _id__default = /*#__PURE__*/ _plugin_vue_export_helper_default(_id__vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-93d211c7"]]);

export { _id__default as default };
//# sourceMappingURL=_id_-CFdptv2D.mjs.map
