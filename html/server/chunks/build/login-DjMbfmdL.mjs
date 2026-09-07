import { t as components_default } from './components-DWHbB934.mjs';
import { B as BaseApiClient, a as useTranslation, e as useAuthStore, b as useRouter, s as setInterval } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, ref, watch, mergeProps, unref, computed, readonly, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrRenderClass, ssrRenderDynamicModel, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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

//#region app/api/user.ts
var UserApi = class extends BaseApiClient {
	/**
	* User login
	* @param email User email
	* @param password User password
	* @returns Login response with second_factor_key, phone_num, email
	*/
	async login(email, password) {
		const request = {
			"#request": "User/login",
			email,
			password
		};
		return this.request(request);
	}
	/**
	* Get user profile (placeholder for future implementation)
	* @param token Authentication token
	* @param userId User ID (optional, defaults to current user)
	*/
	async getProfile(token, userId) {
		const request = {
			"#request": "User/getProfile",
			user_id: userId
		};
		return this.requestWithToken(request, token);
	}
	/**
	* Update user profile (placeholder for future implementation)
	* @param token Authentication token
	* @param profileData Profile data to update
	*/
	async updateProfile(token, profileData) {
		const request = {
			"#request": "User/updateProfile",
			...profileData
		};
		return this.requestWithToken(request, token);
	}
	/**
	* Mandatory password change after first login with restricted token (X-token)
	* @param xToken Restricted token from login response when need_change_password is true
	* @param currentPassword Current password
	* @param newPassword New password (must meet password criteria)
	* @returns Response with normal token
	*/
	async mandatoryChangePassword(xToken, currentPassword, newPassword) {
		const request = {
			"#request": "User/mandatory_change_password",
			"#token": xToken,
			curr_password: currentPassword,
			new_password: newPassword
		};
		return this.request(request);
	}
	/**
	* Logout user (placeholder for future implementation)
	* @param token Authentication token
	*/
	async logout(token) {
		return this.requestWithToken({ "#request": "User/logout" }, token);
	}
	/**
	* Get current user roles
	* @returns List of role IDs
	*/
	async getMyRoles() {
		return this.request({ "#request": "UserRole/get_my_roles" });
	}
};
var userApi = new UserApi();

//#region app/api/twoFactor.ts
var TwoFactorAuthApi = class extends BaseApiClient {
	/**
	* Send OTP code to user's phone or email
	* @param secondFactorKey The second factor key from login response
	* @param factorType Where to send the code: 'PHONE' or 'EMAIL'
	*/
	async sendOtpCode(secondFactorKey, factorType) {
		const request = {
			"#request": "TwoFactorAuth/send_otp_code",
			second_factor_key: secondFactorKey,
			factor_type: factorType
		};
		return this.request(request);
	}
	/**
	* Verify OTP code and complete authentication
	* @param secondFactorKey The second factor key from login response
	* @param factorType Where the code was sent: 'PHONE' or 'EMAIL'
	* @param verificationCode The OTP code received by user
	*/
	async verifyOtpCode(secondFactorKey, factorType, verificationCode) {
		const request = {
			"#request": "TwoFactorAuth/verify_otp_code",
			second_factor_key: secondFactorKey,
			factor_type: factorType,
			verification_code: verificationCode
		};
		return this.request(request);
	}
	/**
	* Resend OTP code to user's phone or email
	* @param secondFactorKey The second factor key from login response
	* @param factorType Where to resend the code: 'PHONE' or 'EMAIL'
	*/
	async resendOtpCode(secondFactorKey, factorType) {
		const request = {
			"#request": "TwoFactorAuth/resend_otp_code",
			second_factor_key: secondFactorKey,
			factor_type: factorType
		};
		return this.request(request);
	}
	/**
	* Change mandatory password after first login or password reset
	* @param token The restricted token from verify_otp_code when need_change_password is true
	* @param currPassword Current password
	* @param newPassword New password (must meet password criteria)
	*/
	async changePassword(token, currPassword, newPassword) {
		const request = {
			"#request": "TwoFactorAuth/mandatory_change_password",
			"#token": token,
			curr_password: currPassword,
			new_password: newPassword
		};
		return this.request(request);
	}
};
var twoFactorAuthApi = new TwoFactorAuthApi();
//#endregion
//#region app/api/types/user.ts
function isTwoFactorRequired(response) {
	return !!response && typeof response === "object" && "second_factor_key" in response;
}
//#endregion
//#region app/composables/useAuth.ts
var useAuth = () => {
	const authStore = useAuthStore();
	const router = useRouter();
	const { t } = useTranslation();
	const isLoading = ref(false);
	const error = ref(null);
	const secondFactorKey = ref("");
	const pendingEmail = ref("");
	const currentStep = ref("credentials");
	const factorType = ref("EMAIL");
	const resendCooldown = ref(60);
	let cooldownInterval = null;
	/**
	* Start the resend cooldown timer
	* @param seconds - Cooldown duration in seconds
	*/
	const startResendCooldown = (seconds = 60) => {
		if (cooldownInterval) clearInterval(cooldownInterval);
		resendCooldown.value = seconds;
		cooldownInterval = setInterval();
	};
	/**
	* Step 1: Authenticate with email and password
	* Handles both 2FA and non-2FA login flows
	* @param email - User email address
	* @param password - User password
	* @returns Promise with login result and 2FA requirement status
	*/
	const login = async (email, password) => {
		try {
			isLoading.value = true;
			error.value = null;
			const response = await userApi.login(email, password);
			if (response.rc === 0) {
				const loginData = response.data || response;
				pendingEmail.value = email;
				if (isTwoFactorRequired(loginData)) {
					secondFactorKey.value = loginData.second_factor_key;
					await sendOtpCode("EMAIL");
					currentStep.value = "otp";
					return {
						success: true,
						requiresTwoFactor: true
					};
				} else {
					authStore.setAuth(loginData.token, {
						type: loginData.type,
						first_name: loginData.first_name,
						last_name: loginData.last_name,
						email
					}, loginData.need_change_password ?? false, loginData.need_change_password ? loginData.x_token : null);
					try {
						const rolesRes = await userApi.getMyRoles();
						authStore.setRoles(rolesRes.roles || []);
					} catch (err) {
						console.error("Failed to load user roles:", err);
						authStore.setRoles([]);
					}
					currentStep.value = "success";
					if (loginData.need_change_password) await router.push("/change-password");
					else await router.push("/dashboard");
					return {
						success: true,
						requiresTwoFactor: false
					};
				}
			} else {
				error.value = response.message;
				return {
					success: false,
					error: response.message
				};
			}
		} catch (err) {
			error.value = err.message || t("auth.login_error");
			return {
				success: false,
				error: error.value
			};
		} finally {
			isLoading.value = false;
		}
	};
	/**
	* Step 2: Send one-time password code
	* @param type - Factor type (EMAIL or PHONE)
	* @returns Promise with send OTP result
	*/
	const sendOtpCode = async (type = "EMAIL") => {
		try {
			isLoading.value = true;
			error.value = null;
			const response = await twoFactorAuthApi.sendOtpCode(secondFactorKey.value, type);
			if (response.rc === 0) {
				factorType.value = type;
				startResendCooldown(60);
				return { success: true };
			} else {
				error.value = response.message;
				return {
					success: false,
					error: response.message
				};
			}
		} catch (err) {
			error.value = err.message || t("auth.send_otp_error");
			return {
				success: false,
				error: error.value
			};
		} finally {
			isLoading.value = false;
		}
	};
	/**
	* Step 3: Verify OTP code and complete authentication
	* @param code - OTP verification code
	* @returns Promise with verification result
	*/
	const verifyOtpCode = async (code) => {
		try {
			isLoading.value = true;
			error.value = null;
			const response = await twoFactorAuthApi.verifyOtpCode(secondFactorKey.value, factorType.value, code);
			if (response.rc === 0) {
				const restrictedToken = response.need_change_password ? response.token : null;
				authStore.setAuth(response.token, {
					type: response.type,
					first_name: response.first_name,
					last_name: response.last_name,
					email: pendingEmail.value
				}, response.need_change_password ?? false, restrictedToken);
				try {
					const rolesRes = await userApi.getMyRoles();
					authStore.setRoles(rolesRes.roles || []);
				} catch (err) {
					console.error("Failed to load user roles:", err);
					authStore.setRoles([]);
				}
				currentStep.value = "success";
				if (response.need_change_password) await router.push("/change-password");
				else await router.push("/dashboard");
				return { success: true };
			} else {
				error.value = response.message;
				return {
					success: false,
					error: response.message
				};
			}
		} catch (err) {
			error.value = err.message || t("auth.verify_otp_error");
			return {
				success: false,
				error: error.value
			};
		} finally {
			isLoading.value = false;
		}
	};
	/**
	* Resend OTP code to the same factor type
	* @returns Promise with resend result
	*/
	const resendOtpCode = async () => {
		try {
			isLoading.value = true;
			error.value = null;
			const response = await twoFactorAuthApi.resendOtpCode(secondFactorKey.value, factorType.value);
			if (response.rc === 0) {
				startResendCooldown(60);
				return { success: true };
			} else {
				error.value = response.message;
				return {
					success: false,
					error: response.message
				};
			}
		} catch (err) {
			error.value = err.message || t("auth.resend_otp_error");
			return {
				success: false,
				error: error.value
			};
		} finally {
			isLoading.value = false;
		}
	};
	/**
	* Logout user and clear authentication data
	* @returns Promise that resolves when logout is complete
	*/
	const logout = async () => {
		authStore.clearAuth();
		await router.push("/login");
	};
	/**
	* Reset login state for new authentication attempt
	*/
	const resetLoginState = () => {
		isLoading.value = false;
		error.value = null;
		secondFactorKey.value = "";
		currentStep.value = "credentials";
		factorType.value = "EMAIL";
		resendCooldown.value = 60;
		if (cooldownInterval) {
			clearInterval(cooldownInterval);
			cooldownInterval = null;
		}
	};
	/**
	* Initialize auth on app startup
	*/
	const initializeAuth = () => {
		authStore.initializeAuth();
	};
	return {
		isLoading: readonly(isLoading),
		error: readonly(error),
		currentStep: readonly(currentStep),
		factorType: readonly(factorType),
		resendCooldown: readonly(resendCooldown),
		isAuthenticated: computed(() => authStore.isAuthenticated),
		user: computed(() => authStore.user),
		fullName: computed(() => authStore.fullName),
		needChangePassword: computed(() => authStore.needChangePassword),
		login,
		sendOtpCode,
		verifyOtpCode,
		resendOtpCode,
		logout,
		resetLoginState,
		initializeAuth
	};
};
//#endregion
//#region app/pages/login.vue?vue&type=script&setup=true&lang.ts
var login_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "login",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const auth = useAuth();
		const email = ref("");
		const password = ref("");
		const showPassword = ref(false);
		const otpCode = ref("");
		const emailError = ref("");
		const passwordError = ref("");
		const otpError = ref("");
		watch(email, () => {
			emailError.value = "";
		});
		watch(password, () => {
			passwordError.value = "";
		});
		watch(otpCode, () => {
			otpError.value = "";
		});
		watch(() => auth.error.value, (newError) => {
			if (newError) {
				if (auth.currentStep.value === "credentials") emailError.value = newError;
				else if (auth.currentStep.value === "otp") otpError.value = newError;
			}
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "login-wrap" }, _attrs))} data-v-7c6e2b63><div class="login-brand" data-v-7c6e2b63><div class="login-brand__badge" data-v-7c6e2b63>C4</div><span class="login-brand__name" data-v-7c6e2b63>AXIS</span></div><div class="card card--pad login-card" data-v-7c6e2b63><h1 class="login-card__title" data-v-7c6e2b63>${ssrInterpolate(unref(t)("auth.sign_in"))}</h1><p class="login-card__subtitle text-secondary text-sm" data-v-7c6e2b63>${ssrInterpolate(unref(t)("auth.sign_in_subtitle"))}</p>`);
			if (unref(auth).currentStep.value === "credentials") {
				_push(`<form class="login-form" novalidate data-v-7c6e2b63><div class="form-field" data-v-7c6e2b63><label class="label" for="email" data-v-7c6e2b63>${ssrInterpolate(unref(t)("auth.email"))}</label><div class="input-wrap" data-v-7c6e2b63>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:mail",
					size: 16,
					class: "input-icon"
				}, null, _parent));
				_push(`<input id="email"${ssrRenderAttr("value", unref(email))} class="${ssrRenderClass([{ "input--error": unref(emailError) }, "input input--with-icon"])}" type="email"${ssrRenderAttr("placeholder", unref(t)("auth.email_placeholder"))} autocomplete="email" data-v-7c6e2b63></div>`);
				if (unref(emailError)) {
					_push(`<p class="field-error" data-v-7c6e2b63>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:alert-circle",
						size: 12
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(emailError))}</p>`);
				} else _push(`<!---->`);
				_push(`</div><div class="form-field" data-v-7c6e2b63><div class="label-row" data-v-7c6e2b63><label class="label" for="password" data-v-7c6e2b63>${ssrInterpolate(unref(t)("auth.password"))}</label><a href="#" class="text-accent text-sm" data-v-7c6e2b63>${ssrInterpolate(unref(t)("auth.forgot_password"))}</a></div><div class="input-wrap" data-v-7c6e2b63>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:lock",
					size: 16,
					class: "input-icon"
				}, null, _parent));
				_push(`<input id="password"${ssrRenderDynamicModel(unref(showPassword) ? "text" : "password", unref(password), null)} class="${ssrRenderClass([{ "input--error": unref(passwordError) }, "input input--with-icon input--with-icon-right"])}"${ssrRenderAttr("type", unref(showPassword) ? "text" : "password")}${ssrRenderAttr("placeholder", unref(t)("auth.password_placeholder"))} autocomplete="current-password" data-v-7c6e2b63><button type="button" class="input-icon-right"${ssrRenderAttr("aria-label", unref(showPassword) ? unref(t)("auth.hide_password") : unref(t)("auth.show_password"))} data-v-7c6e2b63>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: unref(showPassword) ? "lucide:eye-off" : "lucide:eye",
					size: 16
				}, null, _parent));
				_push(`</button></div>`);
				if (unref(passwordError)) {
					_push(`<p class="field-error" data-v-7c6e2b63>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:alert-circle",
						size: 12
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(passwordError))}</p>`);
				} else _push(`<!---->`);
				_push(`</div>`);
				if (unref(emailError) && !unref(emailError).includes("required")) {
					_push(`<div class="login-error" data-v-7c6e2b63>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:triangle-alert",
						size: 14
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(emailError))}</div>`);
				} else _push(`<!---->`);
				_push(`<button type="submit" class="btn btn--primary login-submit"${ssrIncludeBooleanAttr(unref(auth).isLoading.value) ? " disabled" : ""} data-v-7c6e2b63>`);
				if (unref(auth).isLoading.value) _push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-circle",
					size: 16,
					class: "spin"
				}, null, _parent));
				else _push(ssrRenderComponent(_component_Icon, {
					name: "lucide:log-in",
					size: 16
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(auth).isLoading.value ? unref(t)("auth.signing_in") : unref(t)("auth.sign_in"))}</button></form>`);
			} else if (unref(auth).currentStep.value === "otp") {
				_push(`<div class="otp-form" data-v-7c6e2b63><h2 class="otp-form__title" data-v-7c6e2b63>${ssrInterpolate(unref(t)("auth.otp_verification"))}</h2><p class="otp-form__subtitle text-secondary text-sm" data-v-7c6e2b63>${ssrInterpolate(unref(t)("auth.otp_subtitle"))}</p><form novalidate data-v-7c6e2b63><div class="form-field" data-v-7c6e2b63><label class="label" for="otp" data-v-7c6e2b63>Verification Code</label><div class="input-wrap" data-v-7c6e2b63>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:shield-check",
					size: 16,
					class: "input-icon"
				}, null, _parent));
				_push(`<input id="otp"${ssrRenderAttr("value", unref(otpCode))} class="${ssrRenderClass([{ "input--error": unref(otpError) }, "input input--with-icon"])}" type="text" maxlength="6"${ssrRenderAttr("placeholder", unref(t)("auth.otp_placeholder"))} autocomplete="one-time-code" data-v-7c6e2b63></div>`);
				if (unref(otpError)) {
					_push(`<p class="field-error" data-v-7c6e2b63>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:alert-circle",
						size: 12
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(otpError))}</p>`);
				} else _push(`<!---->`);
				_push(`</div>`);
				if (unref(otpError) && !unref(otpError).includes("required")) {
					_push(`<div class="login-error" data-v-7c6e2b63>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:triangle-alert",
						size: 14
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(otpError))}</div>`);
				} else _push(`<!---->`);
				_push(`<div class="otp-actions" data-v-7c6e2b63><button type="button" class="btn btn--secondary" data-v-7c6e2b63>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:arrow-left",
					size: 16
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("auth.otp_back_to_login"))}</button><button type="button" class="btn btn--ghost"${ssrIncludeBooleanAttr(unref(auth).isLoading.value || unref(auth).resendCooldown.value > 0) ? " disabled" : ""} data-v-7c6e2b63>`);
				if (unref(auth).resendCooldown.value > 0) _push(`<span data-v-7c6e2b63>${ssrInterpolate(unref(t)("auth.otp_resend_wait", { seconds: unref(auth).resendCooldown.value.toString() }))}</span>`);
				else if (unref(auth).isLoading.value) _push(`<span data-v-7c6e2b63>${ssrInterpolate(unref(t)("auth.otp_resending"))}</span>`);
				else _push(`<span data-v-7c6e2b63>${ssrInterpolate(unref(t)("auth.otp_resend"))}</span>`);
				_push(`</button><button type="submit" class="btn btn--primary"${ssrIncludeBooleanAttr(unref(auth).isLoading.value || !unref(otpCode)) ? " disabled" : ""} data-v-7c6e2b63>`);
				if (unref(auth).isLoading.value) _push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-circle",
					size: 16,
					class: "spin"
				}, null, _parent));
				else _push(ssrRenderComponent(_component_Icon, {
					name: "lucide:check",
					size: 16
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(auth).isLoading.value ? unref(t)("auth.otp_verifying") : unref(t)("auth.otp_verify"))}</button></div></form></div>`);
			} else _push(`<!---->`);
			_push(`</div><p class="login-footer text-muted text-xs" data-v-7c6e2b63>${ssrInterpolate(unref(t)("app.name"))} · ${ssrInterpolate(unref(t)("app.tagline"))}</p></div>`);
		};
	}
});
//#endregion
//#region app/pages/login.vue
var _sfc_setup = login_vue_vue_type_script_setup_true_lang_default.setup;
login_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var login_default = /*#__PURE__*/ _plugin_vue_export_helper_default(login_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-7c6e2b63"]]);

export { login_default as default };
//# sourceMappingURL=login-DjMbfmdL.mjs.map
