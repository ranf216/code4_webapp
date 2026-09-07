import { u as useRoute } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { P as POIForm_default } from './POIForm-Ck2f-ZSg.mjs';
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

//#region app/pages/poi/[id]/edit.vue?vue&type=script&setup=true&lang.ts
var edit_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "edit",
	__ssrInlineRender: true,
	setup(__props) {
		const route = useRoute();
		const demoRecord = {
			id: String(route.params.id),
			recordType: "trespass",
			status: "active",
			firstName: "Jane",
			lastName: "Smith",
			aliases: "Jenny S, J. Smith",
			dateOfBirth: "1988-04-15",
			gender: "female",
			physicalDescription: "Approximately 165cm, medium build, dark brown hair, usually wears glasses.",
			summary: "Subject issued formal trespass notice following repeated unauthorised access to South Plaza.",
			internalNotes: "Second offence. Previously warned in Jan 2026.",
			sites: ["South Plaza", "Central Hub"],
			threatLevel: "medium",
			relatedIncidentIds: "INC-2026-041, INC-2026-088",
			incidentHistorySummary: "",
			watchLevelReviewDate: "",
			associatedIndividuals: "",
			trespassNoticeNumber: "TN-2026-0192",
			trespassIssuingAuthority: "City Security Authority",
			propertyAreaCovered: "South Plaza levels G-3, Central Hub main entrance",
			trespassIssueDate: "2026-04-01",
			trespassExpiryDate: "2026-07-15",
			trespassRenewalReminder: 14,
			lawEnforcementContact: "Sgt. R. Thompson — City Police, ph: 0400 000 111",
			conditions: "Subject is not to enter or remain on property.",
			redCardNumber: "",
			metroIssuingAuthority: "",
			metroIssueDate: "",
			metroExpiryDate: "",
			metroLines: "",
			metroRenewalReminder: 14,
			existingPhotos: [
				"https://picsum.photos/seed/ti002a/400/400",
				"https://picsum.photos/seed/ti002b/400/400",
				"https://picsum.photos/seed/ti002c/400/400"
			]
		};
		return (_ctx, _push, _parent, _attrs) => {
			const _component_POIForm = POIForm_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "poi-edit-page" }, _attrs))} data-v-ffa9673a>`);
			_push(ssrRenderComponent(_component_POIForm, {
				mode: "edit",
				record: demoRecord
			}, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/poi/[id]/edit.vue
var _sfc_setup = edit_vue_vue_type_script_setup_true_lang_default.setup;
edit_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/poi/[id]/edit.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var edit_default = /*#__PURE__*/ _plugin_vue_export_helper_default(edit_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-ffa9673a"]]);

export { edit_default as default };
//# sourceMappingURL=edit-CPq8kyuc.mjs.map
