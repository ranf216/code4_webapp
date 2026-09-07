import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation } from '../virtual/entry.mjs';
import { o as officerApi } from './officer-CPsAbV7J.mjs';
import { defineComponent, ref, computed, watch, unref, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';

//#region app/components/communities/OfficerPickerModal.vue?vue&type=script&setup=true&lang.ts
var OfficerPickerModal_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "OfficerPickerModal",
	__ssrInlineRender: true,
	props: {
		show: { type: Boolean },
		preselectedIds: {}
	},
	emits: ["close", "confirm"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const { t } = useTranslation();
		const allOfficers = ref([]);
		const isLoading = ref(false);
		const searchQuery = ref("");
		const statusFilter = ref("all");
		const selectedIds = ref(/* @__PURE__ */ new Set());
		const isConfirming = ref(false);
		const filteredOfficers = computed(() => {
			let list = allOfficers.value;
			if (statusFilter.value === "active") list = list.filter((o) => o.active);
			else if (statusFilter.value === "inactive") list = list.filter((o) => !o.active);
			if (searchQuery.value.trim()) {
				const q = searchQuery.value.toLowerCase();
				list = list.filter((o) => o.fullName.toLowerCase().includes(q));
			}
			return list;
		});
		function getInitials(name) {
			return name.split(" ").map((p) => p[0] || "").join("").toUpperCase().slice(0, 2);
		}
		async function loadOfficers() {
			if (allOfficers.value.length) return;
			isLoading.value = true;
			try {
				const response = await officerApi.getOfficers({ include_inactive: true });
				if (response.rc === 0 && response.officers) allOfficers.value = response.officers.map((o) => ({
					id: o.user_id,
					fullName: [o.first_name, o.last_name].filter(Boolean).join(" "),
					title: o.title || "",
					picture: o.image_url || "",
					active: o.is_active,
					communityName: o.community_name || null
				}));
			} catch (err) {
				console.error("Error loading officers:", err);
			} finally {
				isLoading.value = false;
			}
		}
		watch(() => props.show, (val) => {
			if (val) {
				searchQuery.value = "";
				statusFilter.value = "all";
				selectedIds.value = new Set(props.preselectedIds || []);
				loadOfficers();
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			ssrRenderTeleport(_push, (_push) => {
				if (__props.show) {
					_push(`<div class="opm-backdrop"><div class="opm-modal"><div class="opm-header"><h3 class="opm-title">${ssrInterpolate(unref(t)("communities.add_officers"))}</h3><button type="button" class="opm-close">`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 18
					}, null, _parent));
					_push(`</button></div><div class="opm-filters"><div class="opm-search">`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:search",
						size: 15,
						class: "opm-search-icon"
					}, null, _parent));
					_push(`<input${ssrRenderAttr("value", searchQuery.value)} type="text" class="opm-search-input"${ssrRenderAttr("placeholder", unref(t)("common.search") + "…")}></div><div class="opm-status-tabs"><button type="button" class="${ssrRenderClass(["opm-tab", { "opm-tab--active": statusFilter.value === "all" }])}">${ssrInterpolate(unref(t)("common.all"))}</button><button type="button" class="${ssrRenderClass(["opm-tab", { "opm-tab--active": statusFilter.value === "active" }])}">${ssrInterpolate(unref(t)("common.active"))}</button><button type="button" class="${ssrRenderClass(["opm-tab", { "opm-tab--active": statusFilter.value === "inactive" }])}">${ssrInterpolate(unref(t)("common.inactive"))}</button></div></div><div class="opm-body">`);
					if (isLoading.value) {
						_push(`<div class="opm-loading">`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:loader-2",
							size: 20,
							class: "spin"
						}, null, _parent));
						_push(`<span>${ssrInterpolate(unref(t)("common.loading"))}</span></div>`);
					} else if (!filteredOfficers.value.length) _push(`<div class="opm-empty">${ssrInterpolate(unref(t)("officers.no_officers"))}</div>`);
					else {
						_push(`<div class="opm-list"><!--[-->`);
						ssrRenderList(filteredOfficers.value, (officer) => {
							_push(`<label class="${ssrRenderClass([{ "opm-item--selected": selectedIds.value.has(officer.id) }, "opm-item"])}"><input type="checkbox" class="opm-checkbox"${ssrIncludeBooleanAttr(selectedIds.value.has(officer.id)) ? " checked" : ""}>`);
							if (officer.picture) _push(`<div class="opm-avatar"><img${ssrRenderAttr("src", officer.picture)}${ssrRenderAttr("alt", officer.fullName)}></div>`);
							else _push(`<div class="opm-avatar opm-avatar--initials">${ssrInterpolate(getInitials(officer.fullName))}</div>`);
							_push(`<div class="opm-item-info"><span class="opm-item-name">${ssrInterpolate(officer.fullName)}</span><span class="opm-item-title">${ssrInterpolate(officer.title)}</span><span class="opm-item-community">${ssrInterpolate(officer.communityName || "—")}</span></div><span class="${ssrRenderClass(["opm-item-status", officer.active ? "opm-item-status--active" : "opm-item-status--inactive"])}">${ssrInterpolate(officer.active ? unref(t)("common.active") : unref(t)("common.inactive"))}</span></label>`);
						});
						_push(`<!--]--></div>`);
					}
					_push(`</div><div class="opm-footer"><span class="opm-selected-count">${ssrInterpolate(selectedIds.value.size ? `${selectedIds.value.size} selected` : "")}</span><button type="button" class="opm-btn opm-btn--cancel">${ssrInterpolate(unref(t)("common.cancel"))}</button><button type="button" class="opm-btn opm-btn--confirm"${ssrIncludeBooleanAttr(isConfirming.value) ? " disabled" : ""}>`);
					if (isConfirming.value) _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:loader-2",
						size: 14,
						class: "spin"
					}, null, _parent));
					else _push(`<!---->`);
					_push(`<span>${ssrInterpolate(unref(t)("communities.add_officers"))}</span></button></div></div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
		};
	}
});
//#endregion
//#region app/components/communities/OfficerPickerModal.vue
var _sfc_setup = OfficerPickerModal_vue_vue_type_script_setup_true_lang_default.setup;
OfficerPickerModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/communities/OfficerPickerModal.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var OfficerPickerModal_default = Object.assign(OfficerPickerModal_vue_vue_type_script_setup_true_lang_default, { __name: "OfficerPickerModal" });

export { OfficerPickerModal_default as O };
//# sourceMappingURL=OfficerPickerModal-Cn6UcFoe.mjs.map
