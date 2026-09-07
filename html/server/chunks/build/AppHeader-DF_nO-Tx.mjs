import { t as components_default } from './components-DWHbB934.mjs';
import { g as useNotificationBadge, N as NuxtLink, a as useTranslation, c as useToastStore, b as useRouter, f as useNotificationSocket, h as notificationApi } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, withModifiers, openBlock, createBlock, createCommentVNode, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderAttr, ssrRenderSlot, ssrIncludeBooleanAttr, ssrRenderClass } from 'vue/server-renderer';
import moment from 'moment';

//#region app/components/NotificationDropdown.vue?vue&type=script&setup=true&lang.ts
var NotificationDropdown_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "NotificationDropdown",
	__ssrInlineRender: true,
	setup(__props, { expose: __expose }) {
		const { t } = useTranslation();
		useToastStore();
		const router = useRouter();
		const { decrement} = useNotificationBadge();
		const { latestNotification, urgentAlert, dismissUrgentAlert } = useNotificationSocket();
		const isOpen = ref(false);
		const notifications = ref([]);
		const loading = ref(false);
		const markingAll = ref(false);
		watch(latestNotification, (incoming) => {
			if (!incoming || !isOpen.value) return;
			if (!notifications.value.some((n) => n.notification_id === incoming.notification_id)) {
				notifications.value.unshift(incoming);
				if (notifications.value.length > 15) notifications.value.pop();
			}
		});
		function toggle() {
			isOpen.value = !isOpen.value;
			if (isOpen.value) fetchNotifications();
		}
		function close() {
			isOpen.value = false;
		}
		const dropdownRef = ref(null);
		async function fetchNotifications() {
			loading.value = true;
			try {
				const response = await notificationApi.getNotifications({
					offset: 0,
					limit: 15
				}, { showLoading: false });
				if (response.rc === 0) notifications.value = response.notifications ?? [];
			} catch {} finally {
				loading.value = false;
			}
		}
		async function handleUrgentView() {
			if (!urgentAlert.value) return;
			if (typeof urgentAlert.value.notification_id === "number" && urgentAlert.value.notification_id > 0) try {
				await notificationApi.markAsRead(urgentAlert.value.notification_id, { showLoading: false });
				decrement();
			} catch {}
			if (urgentAlert.value.payload?.entity_type && urgentAlert.value.payload?.entity_id) {
				const path = resolveEntityPath(urgentAlert.value.payload.entity_type, urgentAlert.value.payload.entity_id);
				if (path) router.push(path);
			}
			close();
			dismissUrgentAlert();
		}
		function handleUrgentDismiss() {
			dismissUrgentAlert();
		}
		function resolveEntityPath(entityType, entityId) {
			switch (entityType) {
				case "call": return `/calls/${entityId}`;
				case "report": return `/reports/${entityId}`;
				case "shift": return `/shifts/${entityId}`;
				case "post_order": return `/post-orders/${entityId}`;
				case "poi": return `/poi/${entityId}`;
				case "task": return `/tasks/${entityId}`;
				default: return null;
			}
		}
		function getTypeIcon(type) {
			switch (type) {
				case "new_emergency":
				case "new_service_call":
				case "call_accepted":
				case "call_resolved":
				case "call_updated":
				case "call_canceled":
				case "resident_like": return "lucide:phone-incoming";
				case "new_incident_report":
				case "report_submitted":
				case "report_approved":
				case "report_changes_requested":
				case "report_delivered": return "lucide:file-text";
				case "shift_published":
				case "shift_updated":
				case "shift_cancelled":
				case "shift_starting_soon": return "lucide:calendar";
				case "route_updated":
				case "officer_off_route": return "lucide:map-pin";
				case "post_order_published":
				case "post_order_updated": return "lucide:clipboard-list";
				case "poi_active":
				case "poi_updated":
				case "poi_inactivated":
				case "poi_expiring_soon":
				case "poi_expired": return "lucide:shield-alert";
				case "task_update": return "lucide:wrench";
				case "panic_button": return "lucide:alert-circle";
				case "gps_signal_lost": return "lucide:navigation";
				default: return "lucide:bell";
			}
		}
		function formatRelativeTime(utcDateStr) {
			const local = moment.utc(utcDateStr).local();
			const now = moment();
			const diffMin = Math.max(0, now.diff(local, "minutes"));
			const diffHr = Math.max(0, now.diff(local, "hours"));
			const diffDay = now.diff(local, "days");
			if (diffMin < 1) return t("notifications.time.just_now");
			if (diffMin < 60) return t("notifications.time.minutes_ago", { n: String(diffMin) });
			if (diffHr < 24) return t("notifications.time.hours_ago", { n: String(diffHr) });
			if (diffDay === 1) return t("notifications.time.yesterday");
			if (diffDay >= 2 && diffDay < 7) return t("notifications.time.days_ago", { n: String(diffDay) });
			return local.format("MMM D, YYYY");
		}
		const hasUnread = computed(() => notifications.value.some((n) => !n.is_read));
		__expose({
			toggle,
			close,
			isOpen
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_AppModal = AppModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({
				ref_key: "dropdownRef",
				ref: dropdownRef,
				class: "notif-dropdown-wrapper"
			}, _attrs))} data-v-40617d65>`);
			ssrRenderSlot(_ctx.$slots, "default", {
				toggle,
				isOpen: unref(isOpen)
			}, null, _push, _parent);
			if (unref(isOpen)) {
				_push(`<div class="notif-dropdown" data-v-40617d65><div class="notif-dropdown__header" data-v-40617d65><h3 class="notif-dropdown__title" data-v-40617d65>${ssrInterpolate(unref(t)("notifications.title"))}</h3>`);
				if (unref(hasUnread)) _push(`<button class="notif-dropdown__mark-all"${ssrIncludeBooleanAttr(unref(markingAll)) ? " disabled" : ""} data-v-40617d65>${ssrInterpolate(unref(markingAll) ? unref(t)("notifications.marking") : unref(t)("notifications.mark_all_read"))}</button>`);
				else _push(`<!---->`);
				_push(`</div>`);
				if (unref(loading)) {
					_push(`<div class="notif-dropdown__loading" data-v-40617d65>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:loader-2",
						size: 20,
						class: "notif-dropdown__spinner"
					}, null, _parent));
					_push(`</div>`);
				} else if (unref(notifications).length === 0) {
					_push(`<div class="notif-dropdown__empty" data-v-40617d65>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:bell-off",
						size: 28,
						class: "notif-dropdown__empty-icon"
					}, null, _parent));
					_push(`<span data-v-40617d65>${ssrInterpolate(unref(t)("notifications.no_notifications"))}</span></div>`);
				} else {
					_push(`<div class="notif-dropdown__list" data-v-40617d65><!--[-->`);
					ssrRenderList(unref(notifications), (item) => {
						_push(`<div class="${ssrRenderClass([{ "notif-item--unread": !item.is_read }, "notif-item"])}" data-v-40617d65><span class="${ssrRenderClass([{ "notif-item__dot--unread": !item.is_read }, "notif-item__dot"])}" data-v-40617d65></span>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: getTypeIcon(item.type),
							size: 16,
							class: ["notif-item__icon", { "notif-item__icon--emergency": item.type === "panic_button" }]
						}, null, _parent));
						_push(`<div class="notif-item__content" data-v-40617d65><div class="notif-item__top" data-v-40617d65><span class="notif-item__item-title" data-v-40617d65>${ssrInterpolate(item.title)}</span><span class="notif-item__time" data-v-40617d65>${ssrInterpolate(formatRelativeTime(item.created_on))}</span></div><p class="notif-item__message" data-v-40617d65>${ssrInterpolate(item.message)}</p></div></div>`);
					});
					_push(`<!--]--></div>`);
				}
				_push(`<div class="notif-dropdown__footer" data-v-40617d65><button class="notif-dropdown__view-all" data-v-40617d65>${ssrInterpolate(unref(t)("notifications.view_all"))}</button></div></div>`);
			} else _push(`<!---->`);
			_push(ssrRenderComponent(_component_AppModal, {
				show: !!unref(urgentAlert),
				title: unref(urgentAlert)?.title,
				"ok-text": unref(t)("notifications.urgent.view"),
				"cancel-text": unref(t)("notifications.urgent.dismiss"),
				onOk: handleUrgentView,
				onCancel: handleUrgentDismiss,
				onClose: handleUrgentDismiss
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<p class="urgent-alert__message" data-v-40617d65${_scopeId}>${ssrInterpolate(unref(urgentAlert)?.message)}</p>`);
						if (unref(urgentAlert)?.created_on) _push(`<p class="urgent-alert__time" data-v-40617d65${_scopeId}>${ssrInterpolate(formatRelativeTime(unref(urgentAlert).created_on))}</p>`);
						else _push(`<!---->`);
					} else return [createVNode("p", { class: "urgent-alert__message" }, toDisplayString(unref(urgentAlert)?.message), 1), unref(urgentAlert)?.created_on ? (openBlock(), createBlock("p", {
						key: 0,
						class: "urgent-alert__time"
					}, toDisplayString(formatRelativeTime(unref(urgentAlert).created_on)), 1)) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/NotificationDropdown.vue
var _sfc_setup$1 = NotificationDropdown_vue_vue_type_script_setup_true_lang_default.setup;
NotificationDropdown_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NotificationDropdown.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var NotificationDropdown_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(NotificationDropdown_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-40617d65"]]), { __name: "NotificationDropdown" });
//#endregion
//#region app/components/AppHeader.vue?vue&type=script&setup=true&lang.ts
var AppHeader_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "AppHeader",
	__ssrInlineRender: true,
	props: {
		title: {},
		breadcrumb: {},
		showSearch: { type: Boolean },
		searchPlaceholder: {},
		searchModelValue: {}
	},
	emits: ["update:searchModelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const { badgeText, showBadge } = useNotificationBadge();
		const breadcrumbItems = computed(() => props.breadcrumb || []);
		const showSearchBox = computed(() => props.showSearch !== false);
		const placeholder = computed(() => props.searchPlaceholder || "Search…");
		const searchValue = computed({
			get: () => props.searchModelValue || "",
			set: (val) => emit("update:searchModelValue", val)
		});
		const now = ref("");
		return (_ctx, _push, _parent, _attrs) => {
			const _component_NuxtLink = NuxtLink;
			const _component_Icon = components_default;
			const _component_NotificationDropdown = NotificationDropdown_default;
			_push(`<header${ssrRenderAttrs(mergeProps({ class: "app-header" }, _attrs))} data-v-5f0c67d2><div class="app-header__left" data-v-5f0c67d2><h1 class="app-header__title" data-v-5f0c67d2>${ssrInterpolate(__props.title)}</h1>`);
			if (unref(breadcrumbItems).length) {
				_push(`<nav class="app-header__breadcrumb" data-v-5f0c67d2><!--[-->`);
				ssrRenderList(unref(breadcrumbItems), (item, index) => {
					_push(`<!--[-->`);
					if (item.to) _push(ssrRenderComponent(_component_NuxtLink, {
						to: item.to,
						class: "app-header__breadcrumb-link"
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`${ssrInterpolate(item.label)}`);
							else return [createTextVNode(toDisplayString(item.label), 1)];
						}),
						_: 2
					}, _parent));
					else _push(`<span class="app-header__breadcrumb-text" data-v-5f0c67d2>${ssrInterpolate(item.label)}</span>`);
					if (index < unref(breadcrumbItems).length - 1) _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:chevron-right",
						size: 12
					}, null, _parent));
					else _push(`<!---->`);
					_push(`<!--]-->`);
				});
				_push(`<!--]--></nav>`);
			} else _push(`<!---->`);
			_push(`</div><div class="app-header__right" data-v-5f0c67d2>`);
			if (unref(showSearchBox)) {
				_push(`<div class="app-header__search" data-v-5f0c67d2>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:search",
					size: 14,
					class: "app-header__search-icon"
				}, null, _parent));
				_push(`<input${ssrRenderAttr("value", unref(searchValue))} class="app-header__search-input" type="text"${ssrRenderAttr("placeholder", unref(placeholder))} data-v-5f0c67d2><span class="app-header__search-kbd" data-v-5f0c67d2>⌘K</span></div>`);
			} else _push(`<!---->`);
			_push(ssrRenderComponent(_component_NotificationDropdown, null, {
				default: withCtx(({ toggle }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="app-header__icon-btn" aria-label="Notifications" data-v-5f0c67d2${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:bell",
							size: 18
						}, null, _parent, _scopeId));
						if (unref(showBadge)) _push(`<span class="app-header__notif-badge" data-v-5f0c67d2${_scopeId}>${ssrInterpolate(unref(badgeText))}</span>`);
						else _push(`<!---->`);
						_push(`</button>`);
					} else return [createVNode("button", {
						class: "app-header__icon-btn",
						"aria-label": "Notifications",
						onClick: withModifiers(toggle, ["stop"])
					}, [createVNode(_component_Icon, {
						name: "lucide:bell",
						size: 18
					}), unref(showBadge) ? (openBlock(), createBlock("span", {
						key: 0,
						class: "app-header__notif-badge"
					}, toDisplayString(unref(badgeText)), 1)) : createCommentVNode("", true)], 8, ["onClick"])];
				}),
				_: 1
			}, _parent));
			_push(`<span class="app-header__datetime" data-v-5f0c67d2>${ssrInterpolate(unref(now))}</span></div></header>`);
		};
	}
});
//#endregion
//#region app/components/AppHeader.vue
var _sfc_setup = AppHeader_vue_vue_type_script_setup_true_lang_default.setup;
AppHeader_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppHeader.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var AppHeader_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(AppHeader_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-5f0c67d2"]]), { __name: "AppHeader" });

export { AppHeader_default as A };
//# sourceMappingURL=AppHeader-DF_nO-Tx.mjs.map
