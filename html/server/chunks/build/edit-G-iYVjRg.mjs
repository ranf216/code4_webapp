import { u as useRoute } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { T as TemplateEditor_default } from './TemplateEditor-CHGaEnqw.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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

//#region app/pages/reports/[id]/edit.vue?vue&type=script&setup=true&lang.ts
var edit_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "edit",
	__ssrInlineRender: true,
	setup(__props) {
		const route = useRoute();
		const demoTemplate = {
			id: String(route.params.id),
			name: "Standard Incident Report",
			category: "incident",
			communities: ["Sunset Heights", "Central Hub"],
			reportTitleFormat: "Incident Report - {community} - {date}",
			status: "active",
			reviewBeforeClient: true,
			allowOfficerEditing: false
		};
		return (_ctx, _push, _parent, _attrs) => {
			const _component_TemplateEditor = TemplateEditor_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "reports-editor-page" }, _attrs))} data-v-95e5862d>`);
			_push(ssrRenderComponent(_component_TemplateEditor, {
				mode: "edit",
				template: demoTemplate
			}, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/reports/[id]/edit.vue
var _sfc_setup = edit_vue_vue_type_script_setup_true_lang_default.setup;
edit_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reports/[id]/edit.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var edit_default = /*#__PURE__*/ _plugin_vue_export_helper_default(edit_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-95e5862d"]]);

export { edit_default as default };
//# sourceMappingURL=edit-G-iYVjRg.mjs.map
