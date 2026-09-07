import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, e as useAuthStore, b as useRouter } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderComponent, ssrRenderDynamicModel, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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

//#region app/pages/change-password.vue?vue&type=script&setup=true&lang.ts
var change_password_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "change-password",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		useAuthStore();
		useRouter();
		const currentPassword = ref("");
		const newPassword = ref("");
		const confirmPassword = ref("");
		const showCurrentPassword = ref(false);
		const showNewPassword = ref(false);
		const showConfirmPassword = ref(false);
		const currentPasswordError = ref("");
		const newPasswordError = ref("");
		const confirmPasswordError = ref("");
		const globalError = ref("");
		const isLoading = ref(false);
		const passwordCriteria = computed(() => {
			const pwd = newPassword.value;
			return [
				{
					key: "length",
					label: t("auth.password_min_length"),
					met: pwd.length >= 8
				},
				{
					key: "lowercase",
					label: t("auth.password_lowercase"),
					met: /[a-z]/.test(pwd)
				},
				{
					key: "uppercase",
					label: t("auth.password_uppercase"),
					met: /[A-Z]/.test(pwd)
				},
				{
					key: "digit",
					label: t("auth.password_digit"),
					met: /\d/.test(pwd)
				},
				{
					key: "special",
					label: t("auth.password_special"),
					met: /[^A-Za-z0-9]/.test(pwd)
				}
			];
		});
		const isPasswordValid = computed(() => passwordCriteria.value.every((c) => c.met));
		const isFormValid = computed(() => {
			return currentPassword.value.length > 0 && isPasswordValid.value && confirmPassword.value === newPassword.value && confirmPassword.value.length > 0;
		});
		watch(currentPassword, () => {
			currentPasswordError.value = "";
		});
		watch(newPassword, () => {
			newPasswordError.value = "";
		});
		watch(confirmPassword, () => {
			confirmPasswordError.value = "";
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "change-password-container" }, _attrs))} data-v-008c5c47><div class="login-brand" data-v-008c5c47><div class="brand-logo" data-v-008c5c47><svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-008c5c47><rect width="48" height="48" rx="12" fill="#E5FF44" data-v-008c5c47></rect><path d="M24 12L32 24H16L24 12Z" fill="#0A0C10" data-v-008c5c47></path><rect x="16" y="24" width="16" height="12" fill="#0A0C10" data-v-008c5c47></rect></svg></div><h1 class="brand-title" data-v-008c5c47>AXIS</h1><p class="brand-tagline" data-v-008c5c47>${ssrInterpolate(unref(t)("app.tagline"))}</p></div><div class="card card--pad change-password-card" data-v-008c5c47><h1 class="change-password-card__title" data-v-008c5c47>${ssrInterpolate(unref(t)("auth.change_password_title"))}</h1><p class="change-password-card__subtitle text-secondary text-sm" data-v-008c5c47>${ssrInterpolate(unref(t)("auth.change_password_subtitle"))}</p><form class="change-password-form" novalidate data-v-008c5c47><div class="form-field" data-v-008c5c47><div style="${ssrRenderStyle({
				"display": "flex",
				"flex-direction": "row"
			})}" data-v-008c5c47>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:lock",
				size: 16,
				class: "input-icon",
				style: { "margin-right": "10px" }
			}, null, _parent));
			_push(`<label class="label" for="current-password" data-v-008c5c47>${ssrInterpolate(unref(t)("auth.current_password"))}</label></div><div class="input-wrap" data-v-008c5c47><input id="current-password"${ssrRenderDynamicModel(unref(showCurrentPassword) ? "text" : "password", unref(currentPassword), null)}${ssrRenderAttr("type", unref(showCurrentPassword) ? "text" : "password")} class="${ssrRenderClass([{ "input--error": unref(currentPasswordError) }, "input input--with-icon input--with-suffix"])}"${ssrRenderAttr("placeholder", unref(t)("auth.current_password_placeholder"))} autocomplete="current-password" data-v-008c5c47><button type="button" class="input-suffix-btn" data-v-008c5c47>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: unref(showCurrentPassword) ? "lucide:eye-off" : "lucide:eye",
				size: 16
			}, null, _parent));
			_push(`</button></div>`);
			if (unref(currentPasswordError)) _push(`<span class="input-error" data-v-008c5c47>${ssrInterpolate(unref(currentPasswordError))}</span>`);
			else _push(`<!---->`);
			_push(`</div><div class="form-field" data-v-008c5c47><div style="${ssrRenderStyle({
				"display": "flex",
				"flex-direction": "row"
			})}" data-v-008c5c47>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:key",
				size: 16,
				class: "input-icon",
				style: { "margin-right": "10px" }
			}, null, _parent));
			_push(`<label class="label" for="new-password" data-v-008c5c47>${ssrInterpolate(unref(t)("auth.new_password"))}</label></div><div class="input-wrap" data-v-008c5c47><input id="new-password"${ssrRenderDynamicModel(unref(showNewPassword) ? "text" : "password", unref(newPassword), null)}${ssrRenderAttr("type", unref(showNewPassword) ? "text" : "password")} class="${ssrRenderClass([{ "input--error": unref(newPasswordError) }, "input input--with-icon input--with-suffix"])}"${ssrRenderAttr("placeholder", unref(t)("auth.new_password_placeholder"))} autocomplete="new-password" data-v-008c5c47><button type="button" class="input-suffix-btn" data-v-008c5c47>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: unref(showNewPassword) ? "lucide:eye-off" : "lucide:eye",
				size: 16
			}, null, _parent));
			_push(`</button></div>`);
			if (unref(newPasswordError)) _push(`<span class="input-error" data-v-008c5c47>${ssrInterpolate(unref(newPasswordError))}</span>`);
			else _push(`<!---->`);
			_push(`<div class="password-criteria" data-v-008c5c47><!--[-->`);
			ssrRenderList(unref(passwordCriteria), (criterion) => {
				_push(`<div class="${ssrRenderClass([{ "password-criteria__item--met": criterion.met }, "password-criteria__item"])}" data-v-008c5c47>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: criterion.met ? "lucide:check" : "lucide:x",
					size: 12,
					class: "password-criteria__icon"
				}, null, _parent));
				_push(`<span data-v-008c5c47>${ssrInterpolate(criterion.label)}</span></div>`);
			});
			_push(`<!--]--></div></div><div class="form-field" data-v-008c5c47><div style="${ssrRenderStyle({
				"display": "flex",
				"flex-direction": "row"
			})}" data-v-008c5c47>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:check-circle",
				size: 16,
				class: "input-icon",
				style: { "margin-right": "10px" }
			}, null, _parent));
			_push(`<label class="label" for="confirm-password" data-v-008c5c47>${ssrInterpolate(unref(t)("auth.confirm_password"))}</label></div><div class="input-wrap" data-v-008c5c47><input id="confirm-password"${ssrRenderDynamicModel(unref(showConfirmPassword) ? "text" : "password", unref(confirmPassword), null)}${ssrRenderAttr("type", unref(showConfirmPassword) ? "text" : "password")} class="${ssrRenderClass([{ "input--error": unref(confirmPasswordError) }, "input input--with-icon input--with-suffix"])}"${ssrRenderAttr("placeholder", unref(t)("auth.confirm_password_placeholder"))} autocomplete="new-password" data-v-008c5c47><button type="button" class="input-suffix-btn" data-v-008c5c47>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: unref(showConfirmPassword) ? "lucide:eye-off" : "lucide:eye",
				size: 16
			}, null, _parent));
			_push(`</button></div>`);
			if (unref(confirmPasswordError)) _push(`<span class="input-error" data-v-008c5c47>${ssrInterpolate(unref(confirmPasswordError))}</span>`);
			else _push(`<!---->`);
			_push(`</div>`);
			if (unref(globalError)) {
				_push(`<div class="login-error" data-v-008c5c47>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:triangle-alert",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(globalError))}</div>`);
			} else _push(`<!---->`);
			_push(`<button type="submit" class="btn btn--primary change-password-submit"${ssrIncludeBooleanAttr(unref(isLoading) || !unref(isFormValid)) ? " disabled" : ""} data-v-008c5c47>`);
			if (unref(isLoading)) _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:loader-circle",
				size: 16,
				class: "spin"
			}, null, _parent));
			else _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:check",
				size: 16
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(isLoading) ? unref(t)("auth.changing_password") : unref(t)("auth.change_password_button"))}</button></form></div><p class="login-footer text-muted text-xs" data-v-008c5c47>${ssrInterpolate(unref(t)("app.name"))} · ${ssrInterpolate(unref(t)("app.tagline"))}</p></div>`);
		};
	}
});
//#endregion
//#region app/pages/change-password.vue
var _sfc_setup = change_password_vue_vue_type_script_setup_true_lang_default.setup;
change_password_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/change-password.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var change_password_default = /*#__PURE__*/ _plugin_vue_export_helper_default(change_password_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-008c5c47"]]);

export { change_password_default as default };
//# sourceMappingURL=change-password-Ca2UnMaS.mjs.map
