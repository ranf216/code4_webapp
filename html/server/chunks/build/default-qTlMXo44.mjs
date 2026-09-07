import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, u as useRoute, e as useAuthStore, m as AdminUserRole, N as NuxtLink, c as useToastStore } from '../virtual/entry.mjs';
import { L as LoadingModal_default } from './LoadingModal-Ca3iKXhe.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { useLoadingStore } from './loading-BV_6sFtq.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { mergeProps, unref, defineComponent, computed, ref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderTeleport, ssrRenderAttr } from 'vue/server-renderer';
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
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import 'nostics';
import 'nostics/formatters/ansi';
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
import 'axios';
import 'unhead/utils';

//#region app/components/calls/PanicCallModal.vue?vue&type=script&setup=true&lang.ts
var PanicCallModal_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PanicCallModal",
	__ssrInlineRender: true,
	props: { show: { type: Boolean } },
	emits: ["close", "assign"],
	setup(__props, { emit: __emit }) {
		const emit = __emit;
		const { t } = useTranslation();
		const panicCall = ref({
			id: "panic-001",
			callType: "Panic Call",
			userName: "Sarah Johnson",
			callDateTime: "2024-06-17 21:35:00",
			location: "123 Maple Drive, Apt 4B, Sunset Valley",
			liveLocation: "123 Maple Drive, Apt 4B",
			status: "Active"
		});
		function handleClose() {
			emit("close");
		}
		function handleAssign() {
			emit("assign");
			handleClose();
		}
		function handleCloseCall() {
			panicCall.value.status = "Close";
			handleClose();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppModal = AppModal_default;
			const _component_Icon = components_default;
			_push(ssrRenderComponent(_component_AppModal, mergeProps({
				show: __props.show,
				title: unref(t)("calls.panic_call_title"),
				"cancel-text": "",
				"ok-text": "",
				"max-width": "540px",
				onClose: handleClose
			}, _attrs), {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="panic-call-modal" data-v-41639b02${_scopeId}><div class="panic-alert" data-v-41639b02${_scopeId}><div class="alert-icon-wrapper" data-v-41639b02${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:alert-triangle",
							size: 28,
							class: "alert-icon"
						}, null, _parent, _scopeId));
						_push(`</div><div class="alert-text" data-v-41639b02${_scopeId}><h3 class="panic-title" data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.panic_alert_title"))}</h3><p class="panic-subtitle" data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.panic_subtitle"))}</p></div></div><div class="info-section panic-section" data-v-41639b02${_scopeId}><div class="info-grid" data-v-41639b02${_scopeId}><div class="info-item" data-v-41639b02${_scopeId}><label data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.call_type"))}</label><span class="panic-type" data-v-41639b02${_scopeId}>${ssrInterpolate(unref(panicCall).callType)}</span></div><div class="info-item" data-v-41639b02${_scopeId}><label data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.user_name"))}</label><span class="user-name" data-v-41639b02${_scopeId}>${ssrInterpolate(unref(panicCall).userName)}</span></div><div class="info-item" data-v-41639b02${_scopeId}><label data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.call_datetime"))}</label><span data-v-41639b02${_scopeId}>${ssrInterpolate(unref(panicCall).callDateTime)}</span></div><div class="info-item" data-v-41639b02${_scopeId}><label data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.status"))}</label><span class="${ssrRenderClass(["status-badge", unref(panicCall).status === "Active" ? "status-active" : "status-closed"])}" data-v-41639b02${_scopeId}>${ssrInterpolate(unref(panicCall).status)}</span></div></div></div><div class="location-section panic-section" data-v-41639b02${_scopeId}><h4 class="section-title" data-v-41639b02${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:map-pin",
							size: 18
						}, null, _parent, _scopeId));
						_push(` ${ssrInterpolate(unref(t)("calls.location_info"))}</h4><div class="info-grid" data-v-41639b02${_scopeId}><div class="info-item full-width" data-v-41639b02${_scopeId}><label data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.location_when_pressed"))}</label><span data-v-41639b02${_scopeId}>${ssrInterpolate(unref(panicCall).location)}</span></div><div class="info-item full-width" data-v-41639b02${_scopeId}><label data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.live_location"))}</label><span class="live-location" data-v-41639b02${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:radio",
							size: 14,
							class: "live-icon"
						}, null, _parent, _scopeId));
						_push(` ${ssrInterpolate(unref(panicCall).liveLocation)}</span></div></div></div><div class="communication-section panic-section" data-v-41639b02${_scopeId}><h4 class="section-title" data-v-41639b02${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:message-square",
							size: 18
						}, null, _parent, _scopeId));
						_push(` ${ssrInterpolate(unref(t)("calls.communication"))}</h4><div class="communication-log" data-v-41639b02${_scopeId}><div class="log-entry" data-v-41639b02${_scopeId}><span class="log-time" data-v-41639b02${_scopeId}>21:35:00</span><span class="log-user" data-v-41639b02${_scopeId}>System</span><span class="log-message" data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.panic_initiated"))}</span></div><div class="log-entry" data-v-41639b02${_scopeId}><span class="log-time" data-v-41639b02${_scopeId}>21:35:05</span><span class="log-user" data-v-41639b02${_scopeId}>${ssrInterpolate(unref(panicCall).userName)}</span><span class="log-message" data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.user_location_shared"))}</span></div></div></div><div class="panic-actions" data-v-41639b02${_scopeId}><button class="action-btn assign-btn" data-v-41639b02${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:user-plus",
							size: 18
						}, null, _parent, _scopeId));
						_push(` ${ssrInterpolate(unref(t)("calls.assign_to_officer"))}</button><button class="action-btn communicate-btn" data-v-41639b02${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:phone",
							size: 18
						}, null, _parent, _scopeId));
						_push(` ${ssrInterpolate(unref(t)("calls.correspond_user"))}</button><button class="action-btn live-location-btn" data-v-41639b02${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:navigation",
							size: 18
						}, null, _parent, _scopeId));
						_push(` ${ssrInterpolate(unref(t)("calls.view_live_location"))}</button><button class="action-btn close-btn" data-v-41639b02${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:check-circle",
							size: 18
						}, null, _parent, _scopeId));
						_push(` ${ssrInterpolate(unref(t)("calls.close_call"))}</button></div><div class="panic-note" data-v-41639b02${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:info",
							size: 14
						}, null, _parent, _scopeId));
						_push(`<span data-v-41639b02${_scopeId}>${ssrInterpolate(unref(t)("calls.panic_note"))}</span></div></div>`);
					} else return [createVNode("div", { class: "panic-call-modal" }, [
						createVNode("div", { class: "panic-alert" }, [createVNode("div", { class: "alert-icon-wrapper" }, [createVNode(_component_Icon, {
							name: "lucide:alert-triangle",
							size: 28,
							class: "alert-icon"
						})]), createVNode("div", { class: "alert-text" }, [createVNode("h3", { class: "panic-title" }, toDisplayString(unref(t)("calls.panic_alert_title")), 1), createVNode("p", { class: "panic-subtitle" }, toDisplayString(unref(t)("calls.panic_subtitle")), 1)])]),
						createVNode("div", { class: "info-section panic-section" }, [createVNode("div", { class: "info-grid" }, [
							createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.call_type")), 1), createVNode("span", { class: "panic-type" }, toDisplayString(unref(panicCall).callType), 1)]),
							createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.user_name")), 1), createVNode("span", { class: "user-name" }, toDisplayString(unref(panicCall).userName), 1)]),
							createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.call_datetime")), 1), createVNode("span", null, toDisplayString(unref(panicCall).callDateTime), 1)]),
							createVNode("div", { class: "info-item" }, [createVNode("label", null, toDisplayString(unref(t)("calls.status")), 1), createVNode("span", { class: ["status-badge", unref(panicCall).status === "Active" ? "status-active" : "status-closed"] }, toDisplayString(unref(panicCall).status), 3)])
						])]),
						createVNode("div", { class: "location-section panic-section" }, [createVNode("h4", { class: "section-title" }, [createVNode(_component_Icon, {
							name: "lucide:map-pin",
							size: 18
						}), createTextVNode(" " + toDisplayString(unref(t)("calls.location_info")), 1)]), createVNode("div", { class: "info-grid" }, [createVNode("div", { class: "info-item full-width" }, [createVNode("label", null, toDisplayString(unref(t)("calls.location_when_pressed")), 1), createVNode("span", null, toDisplayString(unref(panicCall).location), 1)]), createVNode("div", { class: "info-item full-width" }, [createVNode("label", null, toDisplayString(unref(t)("calls.live_location")), 1), createVNode("span", { class: "live-location" }, [createVNode(_component_Icon, {
							name: "lucide:radio",
							size: 14,
							class: "live-icon"
						}), createTextVNode(" " + toDisplayString(unref(panicCall).liveLocation), 1)])])])]),
						createVNode("div", { class: "communication-section panic-section" }, [createVNode("h4", { class: "section-title" }, [createVNode(_component_Icon, {
							name: "lucide:message-square",
							size: 18
						}), createTextVNode(" " + toDisplayString(unref(t)("calls.communication")), 1)]), createVNode("div", { class: "communication-log" }, [createVNode("div", { class: "log-entry" }, [
							createVNode("span", { class: "log-time" }, "21:35:00"),
							createVNode("span", { class: "log-user" }, "System"),
							createVNode("span", { class: "log-message" }, toDisplayString(unref(t)("calls.panic_initiated")), 1)
						]), createVNode("div", { class: "log-entry" }, [
							createVNode("span", { class: "log-time" }, "21:35:05"),
							createVNode("span", { class: "log-user" }, toDisplayString(unref(panicCall).userName), 1),
							createVNode("span", { class: "log-message" }, toDisplayString(unref(t)("calls.user_location_shared")), 1)
						])])]),
						createVNode("div", { class: "panic-actions" }, [
							createVNode("button", {
								class: "action-btn assign-btn",
								onClick: handleAssign
							}, [createVNode(_component_Icon, {
								name: "lucide:user-plus",
								size: 18
							}), createTextVNode(" " + toDisplayString(unref(t)("calls.assign_to_officer")), 1)]),
							createVNode("button", { class: "action-btn communicate-btn" }, [createVNode(_component_Icon, {
								name: "lucide:phone",
								size: 18
							}), createTextVNode(" " + toDisplayString(unref(t)("calls.correspond_user")), 1)]),
							createVNode("button", { class: "action-btn live-location-btn" }, [createVNode(_component_Icon, {
								name: "lucide:navigation",
								size: 18
							}), createTextVNode(" " + toDisplayString(unref(t)("calls.view_live_location")), 1)]),
							createVNode("button", {
								class: "action-btn close-btn",
								onClick: handleCloseCall
							}, [createVNode(_component_Icon, {
								name: "lucide:check-circle",
								size: 18
							}), createTextVNode(" " + toDisplayString(unref(t)("calls.close_call")), 1)])
						]),
						createVNode("div", { class: "panic-note" }, [createVNode(_component_Icon, {
							name: "lucide:info",
							size: 14
						}), createVNode("span", null, toDisplayString(unref(t)("calls.panic_note")), 1)])
					])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/calls/PanicCallModal.vue
var _sfc_setup$3 = PanicCallModal_vue_vue_type_script_setup_true_lang_default.setup;
PanicCallModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/calls/PanicCallModal.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var PanicCallModal_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PanicCallModal_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-41639b02"]]), { __name: "PanicCallModal" });
//#endregion
//#region app/components/AppSidebar.vue?vue&type=script&setup=true&lang.ts
var AppSidebar_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AppSidebar",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const route = useRoute();
		const authStore = useAuthStore();
		const baseGroups = [{
			label: t("nav.operate"),
			items: [
				{
					key: "dashboard",
					label: t("nav.dashboard"),
					icon: "lucide:layout-dashboard",
					to: "/dashboard",
					badge: null
				},
				{
					key: "live-tracking",
					label: t("nav.live_tracking"),
					icon: "lucide:map",
					to: "/live-tracking",
					badge: 24
				},
				{
					key: "calls-incidents",
					label: t("nav.calls_incidents"),
					icon: "lucide:phone",
					to: "/calls",
					badge: 1,
					badgeType: "critical"
				},
				{
					key: "tasks",
					label: t("nav.tasks"),
					icon: "lucide:check-square",
					to: "/tasks",
					badge: 12
				}
			]
		}, {
			label: t("nav.manage"),
			items: [
				{
					key: "communities",
					label: t("nav.communities"),
					icon: "lucide:home",
					to: "/communities",
					badge: null
				},
				{
					key: "officers",
					label: t("nav.officers"),
					icon: "lucide:user-round",
					to: "/officers",
					badge: null
				},
				{
					key: "shifts-routes",
					label: t("nav.shifts_routes"),
					icon: "lucide:calendar",
					to: "/shifts",
					badge: null
				},
				{
					key: "post-orders",
					label: t("nav.post_orders"),
					icon: "lucide:file-text",
					to: "/post-orders",
					badge: null
				},
				{
					key: "poi-trespass",
					label: t("nav.poi_trespass"),
					icon: "lucide:search-alert",
					to: "/poi",
					badge: null
				},
				{
					key: "report-templates",
					label: t("nav.report_templates"),
					icon: "lucide:panels-top-left",
					to: "/reports",
					badge: null
				}
			]
		}];
		const isSuperAdmin = computed(() => authStore.roles.includes(AdminUserRole.SUPER_ADMIN));
		const navGroups = computed(() => {
			const groups = [...baseGroups];
			const adminItems = [];
			if (isSuperAdmin.value) adminItems.push({
				key: "users",
				label: t("nav.users"),
				icon: "lucide:user",
				to: "/users",
				badge: null
			});
			if (authStore.isAdmin || isSuperAdmin.value) adminItems.push({
				key: "settings",
				label: t("nav.settings"),
				icon: "lucide:settings",
				to: "/settings",
				badge: null
			});
			if (adminItems.length) groups.push({
				label: t("nav.admin"),
				items: adminItems
			});
			return groups;
		});
		function isActive(to) {
			return route.path === to || route.path.startsWith(to + "/");
		}
		const showPanicModal = ref(false);
		function closePanicModal() {
			showPanicModal.value = false;
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_NuxtLink = NuxtLink;
			_push(`<aside${ssrRenderAttrs(mergeProps({ class: "sidebar" }, _attrs))} data-v-0bd025a2><div class="sidebar__brand" data-v-0bd025a2>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:locate-fixed",
				size: 20,
				class: "sidebar__brand-icon"
			}, null, _parent));
			_push(`<span class="sidebar__name" data-v-0bd025a2>AXIS</span></div><div class="sidebar__org" data-v-0bd025a2><div class="sidebar__org-avatar" data-v-0bd025a2>C4</div><div class="sidebar__org-info" data-v-0bd025a2><span class="sidebar__org-name" data-v-0bd025a2>Code 4 Operations</span><span class="sidebar__org-meta" data-v-0bd025a2>6 communities · 65 officers</span></div>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevron-right",
				size: 14,
				class: "sidebar__org-chevron"
			}, null, _parent));
			_push(`</div><nav class="sidebar__nav" data-v-0bd025a2><!--[-->`);
			ssrRenderList(unref(navGroups), (group) => {
				_push(`<div class="sidebar__group" data-v-0bd025a2><span class="sidebar__group-label" data-v-0bd025a2>${ssrInterpolate(group.label)}</span><!--[-->`);
				ssrRenderList(group.items, (item) => {
					_push(ssrRenderComponent(_component_NuxtLink, {
						key: item.key,
						to: item.to,
						class: ["sidebar__item", { "sidebar__item--active": isActive(item.to) }]
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) {
								_push(ssrRenderComponent(_component_Icon, {
									name: item.icon,
									size: 16,
									class: "sidebar__item-icon"
								}, null, _parent, _scopeId));
								_push(`<span class="sidebar__item-label" data-v-0bd025a2${_scopeId}>${ssrInterpolate(item.label)}</span>`);
								if (item.badge) _push(`<span class="${ssrRenderClass([item.badgeType === "critical" ? "sidebar__item-badge--critical" : "", "sidebar__item-badge"])}" data-v-0bd025a2${_scopeId}>${ssrInterpolate(item.badge)}</span>`);
								else _push(`<!---->`);
							} else return [
								createVNode(_component_Icon, {
									name: item.icon,
									size: 16,
									class: "sidebar__item-icon"
								}, null, 8, ["name"]),
								createVNode("span", { class: "sidebar__item-label" }, toDisplayString(item.label), 1),
								item.badge ? (openBlock(), createBlock("span", {
									key: 0,
									class: ["sidebar__item-badge", item.badgeType === "critical" ? "sidebar__item-badge--critical" : ""]
								}, toDisplayString(item.badge), 3)) : createCommentVNode("", true)
							];
						}),
						_: 2
					}, _parent));
				});
				_push(`<!--]--></div>`);
			});
			_push(`<!--]--></nav><div class="sidebar__test-section" data-v-0bd025a2><button class="test-panic-btn" data-v-0bd025a2>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:alert-triangle",
				size: 16
			}, null, _parent));
			_push(`<span data-v-0bd025a2>${ssrInterpolate(unref(t)("nav.test_panic_call"))}</span></button></div><div class="sidebar__footer" data-v-0bd025a2><button class="sidebar__logout" data-v-0bd025a2>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:log-out",
				size: 16,
				class: "sidebar__logout-icon"
			}, null, _parent));
			_push(`<span class="sidebar__logout-label" data-v-0bd025a2>${ssrInterpolate(unref(t)("common.logout"))}</span></button></div>`);
			_push(ssrRenderComponent(PanicCallModal_default, {
				show: unref(showPanicModal),
				onClose: closePanicModal
			}, null, _parent));
			_push(`</aside>`);
		};
	}
});
//#endregion
//#region app/components/AppSidebar.vue
var _sfc_setup$2 = AppSidebar_vue_vue_type_script_setup_true_lang_default.setup;
AppSidebar_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppSidebar.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var AppSidebar_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(AppSidebar_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0bd025a2"]]), { __name: "AppSidebar" });
//#endregion
//#region app/components/AppToast.vue?vue&type=script&setup=true&lang.ts
var AppToast_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AppToast",
	__ssrInlineRender: true,
	setup(__props) {
		const toastStore = useToastStore();
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			ssrRenderTeleport(_push, (_push) => {
				_push(`<div class="toast-container" aria-live="polite" aria-atomic="false" data-v-f6ec0806><div${ssrRenderAttrs({
					name: "toast",
					class: "toast-list"
				})} data-v-f6ec0806>`);
				ssrRenderList(unref(toastStore).toasts, (toast) => {
					_push(`<div class="${ssrRenderClass(["toast", `toast--${toast.type}`])}" role="alert" data-v-f6ec0806>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: toast.type === "success" ? "lucide:check-circle-2" : toast.type === "error" ? "lucide:x-circle" : toast.type === "warning" ? "lucide:alert-triangle" : "lucide:info",
						size: 16,
						class: "toast__icon"
					}, null, _parent));
					_push(`<span class="toast__message" data-v-f6ec0806>${ssrInterpolate(toast.message)}</span><button class="toast__close"${ssrRenderAttr("aria-label", "Dismiss")} data-v-f6ec0806>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 13
					}, null, _parent));
					_push(`</button></div>`);
				});
				_push(`</div></div>`);
			}, "body", false, _parent);
		};
	}
});
//#endregion
//#region app/components/AppToast.vue
var _sfc_setup$1 = AppToast_vue_vue_type_script_setup_true_lang_default.setup;
AppToast_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppToast.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var AppToast_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(AppToast_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-f6ec0806"]]), { __name: "AppToast" });
//#endregion
//#region app/layouts/default.vue
var _sfc_main = {
	__name: "default",
	__ssrInlineRender: true,
	setup(__props) {
		const loadingStore = useLoadingStore();
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppSidebar = AppSidebar_default;
			const _component_LoadingModal = LoadingModal_default;
			const _component_AppToast = AppToast_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "app-shell" }, _attrs))} data-v-3bbf22d1>`);
			_push(ssrRenderComponent(_component_AppSidebar, null, null, _parent));
			_push(`<div class="app-main" data-v-3bbf22d1>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div>`);
			_push(ssrRenderComponent(_component_LoadingModal, {
				show: unref(loadingStore).showLoading,
				message: unref(loadingStore).message
			}, null, _parent));
			_push(ssrRenderComponent(_component_AppToast, null, null, _parent));
			_push(`</div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var default_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-3bbf22d1"]]);

export { default_default as default };
//# sourceMappingURL=default-qTlMXo44.mjs.map
