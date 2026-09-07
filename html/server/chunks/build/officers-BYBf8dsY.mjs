import { u as useRoute } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { O as OfficersManagement_default } from './OfficersManagement-RMZMepGf.mjs';
import { defineComponent, ref, unref, useSSRContext } from 'vue';
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
import './officer-CPsAbV7J.mjs';
import './Badge-BbyZfskr.mjs';
import './AppButton-sr0dx6mm.mjs';
import './ImageUpload-CRnliurs.mjs';
import './useFileApi-CLWuZDlq.mjs';

//#region app/pages/communities/[id]/officers/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		const communityId = useRoute().params.id;
		const communityName = ref("Community");
		communityName.value = {
			"CM-0482": "Westridge Estates",
			"CM-0483": "Harbor Point Marina",
			"CM-0484": "Cedar Crossing HOA",
			"CM-0485": "Summit Plaza Events"
		}[communityId] ?? communityId;
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_OfficersManagement = OfficersManagement_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: "Officers",
				breadcrumb: [
					{ label: "Manage" },
					{
						label: "Communities",
						to: "/communities"
					},
					{
						label: unref(communityName),
						to: `/communities/edit/${unref(communityId)}`
					},
					{ label: "Officers" }
				],
				"show-search": false
			}, null, _parent));
			_push(`<div class="officers-page" data-v-25d2797d>`);
			_push(ssrRenderComponent(_component_OfficersManagement, {
				"community-id": unref(communityId),
				"community-name": unref(communityName)
			}, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/communities/[id]/officers/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/communities/[id]/officers/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var officers_default = /*#__PURE__*/ _plugin_vue_export_helper_default(index_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-25d2797d"]]);

export { officers_default as default };
//# sourceMappingURL=officers-BYBf8dsY.mjs.map
