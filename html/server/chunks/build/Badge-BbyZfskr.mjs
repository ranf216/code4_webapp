import { U as UserTypeConfig } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';

//#region app/constants/userTypes.ts
/**
* User type constants based on API response 'type' field
* Used after login or OTP verification
* Values are synchronized with UserTypeConfig in ~/utils/config
*/
var UserType = /* @__PURE__ */ function(UserType) {
	UserType[UserType["ACCOUNT_IMPERSONATION"] = UserTypeConfig.types.ACCOUNT_IMPERSONATION.value] = "ACCOUNT_IMPERSONATION";
	UserType[UserType["ADMIN"] = UserTypeConfig.types.ADMIN.value] = "ADMIN";
	UserType[UserType["MANAGER"] = UserTypeConfig.types.MANAGER.value] = "MANAGER";
	UserType[UserType["PLANNING"] = UserTypeConfig.types.PLANNING.value] = "PLANNING";
	UserType[UserType["LOGISTICS"] = UserTypeConfig.types.LOGISTICS.value] = "LOGISTICS";
	UserType[UserType["FINANCE"] = UserTypeConfig.types.FINANCE.value] = "FINANCE";
	return UserType;
}({});
var UserTypeLabels = {
	[UserType.ACCOUNT_IMPERSONATION]: UserTypeConfig.types.ACCOUNT_IMPERSONATION.label,
	[UserType.ADMIN]: UserTypeConfig.types.ADMIN.label,
	[UserType.MANAGER]: UserTypeConfig.types.MANAGER.label,
	[UserType.PLANNING]: UserTypeConfig.types.PLANNING.label,
	[UserType.LOGISTICS]: UserTypeConfig.types.LOGISTICS.label,
	[UserType.FINANCE]: UserTypeConfig.types.FINANCE.label
};
UserType.ACCOUNT_IMPERSONATION, UserType.ADMIN, UserType.MANAGER, UserType.PLANNING, UserType.LOGISTICS, UserType.FINANCE;
//#endregion
//#region app/components/Badge.vue?vue&type=script&setup=true&lang.ts
var Badge_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "Badge",
	__ssrInlineRender: true,
	props: {
		type: {},
		value: { type: [
			String,
			Number,
			Boolean
		] },
		text: {},
		color: {}
	},
	setup(__props) {
		const props = __props;
		const label = computed(() => {
			if (props.text !== void 0) return props.text;
			if (props.type === "userType") {
				const typeNum = props.value;
				if (typeNum === 1 || typeNum === 2 || typeNum === 3 || typeNum === 4 || typeNum === 5) return UserTypeLabels[typeNum] ?? "Unknown";
				return "Unknown";
			}
			if (props.type === "adminRole") return {
				2: "Super Admin",
				3: "Manager",
				4: "Planning",
				5: "Logistics",
				6: "Finance"
			}[props.value] ?? "—";
			if (props.type === "active") return props.value ? "Yes" : "No";
			if (props.type === "report") return {
				submitted: "Submitted",
				under_review: "Under Review",
				changes_requested: "Changes Requested",
				approved: "Approved",
				delivered: "Delivered"
			}[String(props.value)] || String(props.value);
			if (props.type === "review") return props.value ? "Review Required" : "No Review Required";
			if (props.type === "taskPriority") return {
				urgent: "Urgent",
				important: "Important",
				normal: "Normal",
				low: "Low"
			}[String(props.value)] || String(props.value);
			if (props.type === "taskStatus") return {
				new: "New",
				accepted: "Accepted",
				approved: "Approved",
				rejected: "Rejected",
				completed: "Completed",
				canceled: "Canceled"
			}[String(props.value)] || String(props.value);
			if (props.type === "shiftStatus") return {
				draft: "Draft",
				published: "Published",
				active: "Active",
				completed: "Completed",
				cancelled: "Cancelled"
			}[String(props.value)] || String(props.value);
			if (props.type === "shiftCount") return `${props.value} shifts`;
			if (props.type === "postOrderStatus") return {
				draft: "Draft",
				published: "Published",
				archived: "Archived"
			}[String(props.value)] || String(props.value);
			if (props.type === "poiType") return {
				poi: "POI",
				trespass: "Trespass",
				metro_red_card: "Metro Red Card"
			}[String(props.value)] || String(props.value);
			if (props.type === "poiThreat") return {
				low: "Low",
				medium: "Medium",
				high: "High",
				critical: "Critical"
			}[String(props.value)] || String(props.value);
			if (props.type === "poiStatus") return {
				draft: "Draft",
				active: "Active",
				expired: "Expired",
				inactive: "Inactive",
				archived: "Archived"
			}[String(props.value)] || String(props.value);
			if (props.type === "templateStatus") return {
				draft: "Draft",
				active: "Active",
				archived: "Archived"
			}[String(props.value)] || String(props.value);
			if (props.type === "templateCategory") return {
				incident: "Incident",
				daily_activity: "Daily Activity"
			}[String(props.value)] || String(props.value);
			return String(props.value).toUpperCase();
		});
		const badgeClass = computed(() => {
			if (props.type === "status") return `badge--status-${props.value}`;
			if (props.type === "userType") return `badge--type-${props.value}`;
			if (props.type === "adminRole") return `badge--admin-role-${props.value}`;
			if (props.type === "active") return props.value ? "badge--active-yes" : "badge--active-no";
			if (props.type === "report") return `badge--report-${props.value}`;
			if (props.type === "review") return props.value ? "badge--review-required" : "badge--no-review";
			if (props.type === "taskPriority") return `badge--priority-${props.value}`;
			if (props.type === "taskStatus") return `badge--task-${props.value}`;
			if (props.type === "shiftStatus") return `badge--shift-${props.value}`;
			if (props.type === "shiftCount") return "badge--shift-count";
			if (props.type === "postOrderStatus") return `badge--po-${props.value}`;
			if (props.type === "poiType") return `badge--poi-type-${props.value}`;
			if (props.type === "poiThreat") return `badge--poi-threat-${props.value}`;
			if (props.type === "poiStatus") return `badge--poi-status-${props.value}`;
			if (props.type === "templateStatus") return `badge--tpl-status-${props.value}`;
			if (props.type === "templateCategory") return `badge--tpl-cat-${props.value}`;
			if (props.type === "officerRole") return "badge--officer-role";
			if (props.type === "officerCert") return "badge--officer-cert";
			return "";
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<span${ssrRenderAttrs(mergeProps({
				class: ["badge", unref(badgeClass)],
				style: __props.color ? {
					color: __props.color,
					border: `1px solid ${__props.color}4d`,
					backgroundColor: `${__props.color}1f`
				} : void 0
			}, _attrs))} data-v-21b651a0>${ssrInterpolate(unref(label))}</span>`);
		};
	}
});
//#endregion
//#region app/components/Badge.vue
var _sfc_setup = Badge_vue_vue_type_script_setup_true_lang_default.setup;
Badge_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Badge.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Badge_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(Badge_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-21b651a0"]]), { __name: "Badge" });

export { Badge_default as B };
//# sourceMappingURL=Badge-BbyZfskr.mjs.map
