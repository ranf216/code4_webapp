import { u as useRoute } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { E as EditForm_default } from './EditForm-DvXTnhZZ.mjs';
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
import './ImageUpload-CRnliurs.mjs';
import './useFileApi-CLWuZDlq.mjs';
import './OfficerPickerModal-Cn6UcFoe.mjs';
import './officer-CPsAbV7J.mjs';

//#region app/pages/communities/[id]/residents/edit/[residentId].vue?vue&type=script&setup=true&lang.ts
var _residentId__vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "[residentId]",
	__ssrInlineRender: true,
	setup(__props) {
		const route = useRoute();
		const communityId = route.params.id;
		const residentId = route.params.residentId;
		const communityName = ref("Sunset Heights");
		const resident = ref({
			id: residentId,
			fullName: "John Smith",
			mobile: "+1 234 567 8900",
			email: "john.smith@example.com",
			address: "123 Main Street, Apt 4B",
			registrationDate: "2024-01-15",
			active: true,
			communicationTest: false,
			vehicleNumbers: ["ABC-1234", "XYZ-5678"]
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_EditForm = EditForm_default;
			_push(`<!--[-->`);
			_push(ssrRenderComponent(_component_AppHeader, {
				title: "Edit Resident",
				breadcrumb: [
					{ label: "Manage" },
					{
						label: "Communities",
						to: "/communities"
					},
					{
						label: communityName.value,
						to: `/communities/edit/${unref(communityId)}`
					},
					{
						label: "Residents",
						to: `/communities/${unref(communityId)}/residents`
					},
					{ label: resident.value.fullName }
				],
				"show-search": false
			}, null, _parent));
			_push(`<div class="edit-resident-page" data-v-ffcbd9e7>`);
			_push(ssrRenderComponent(_component_EditForm, {
				resident: resident.value,
				"community-id": unref(communityId),
				"community-name": communityName.value
			}, null, _parent));
			_push(`</div><!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/communities/[id]/residents/edit/[residentId].vue
var _sfc_setup = _residentId__vue_vue_type_script_setup_true_lang_default.setup;
_residentId__vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/communities/[id]/residents/edit/[residentId].vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _residentId__default = /*#__PURE__*/ _plugin_vue_export_helper_default(_residentId__vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-ffcbd9e7"]]);

export { _residentId__default as default };
//# sourceMappingURL=_residentId_-C80lZQGJ.mjs.map
