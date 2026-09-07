import { t as components_default } from './components-DWHbB934.mjs';
import { e as useAuthStore, m as AdminUserRole, a as useTranslation, c as useToastStore } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { A as AppHeader_default } from './AppHeader-DF_nO-Tx.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { A as AppButton_default } from './AppButton-sr0dx6mm.mjs';
import { A as AppDialogModal_default } from './AppDialogModal-CYp4oRY_.mjs';
import { a as adminUserApi } from './adminUser-BkDnDana.mjs';
import { defineComponent, computed, unref, ref, reactive, mergeProps, withCtx, createVNode, toDisplayString, createTextVNode, withDirectives, isRef, vModelDynamic, openBlock, createBlock, createCommentVNode, Fragment, renderList, vModelText, vModelSelect, vModelCheckbox, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderClass, ssrRenderList, ssrRenderDynamicModel, ssrLooseEqual } from 'vue/server-renderer';
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
import 'moment';

//#region app/components/users/UsersManagement.vue?vue&type=script&setup=true&lang.ts
var UsersManagement_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "UsersManagement",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		const authStore = useAuthStore();
		const toastStore = useToastStore();
		function isValidEmail(email) {
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
		}
		function formatDate(iso) {
			if (!iso) return "—";
			return new Date(iso).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric"
			});
		}
		const users = ref([]);
		const totalCount = ref(0);
		const loading = ref(false);
		const isSearching = ref(false);
		const searchQuery = ref("");
		const includeInactive = ref(false);
		const sortKey = ref("first_name");
		const sortOrder = ref("asc");
		async function fetchUsers(isSearch = false) {
			if (isSearch) isSearching.value = true;
			else loading.value = true;
			try {
				const response = await adminUserApi.getAdminUsers({
					include_inactive: includeInactive.value,
					search_text: searchQuery.value.trim(),
					sort_by: sortKey.value,
					sort_dir: sortOrder.value
				}, { showLoading: !isSearch });
				if (response.rc === 0) {
					users.value = response.users || [];
					totalCount.value = response.total_count || users.value.length;
				} else alert(response.message || "Failed to load users");
			} catch (err) {
				console.error("Error fetching users:", err);
				alert("Failed to load users");
			} finally {
				if (isSearch) isSearching.value = false;
				else loading.value = false;
			}
		}
		const showDeleteModal = ref(false);
		const userToDelete = ref(null);
		const isDeleting = ref(false);
		const showConstraintPrompt = ref(false);
		const isDeactivating = ref(false);
		const showLastAdminPrompt = ref(false);
		function closeDeleteModal() {
			showDeleteModal.value = false;
			userToDelete.value = null;
		}
		async function handleDeleteConfirm() {
			if (!userToDelete.value || isDeleting.value) return;
			isDeleting.value = true;
			try {
				const response = await adminUserApi.deleteAdminUser(userToDelete.value.user_id);
				if (response.rc === 0) {
					alert(t("users.delete_success"));
					await fetchUsers(true);
					closeDeleteModal();
				} else if (response.rc === 770) {
					alert(t("users.delete_not_found"));
					closeDeleteModal();
					await fetchUsers(true);
				} else if (response.rc === 771) {
					closeDeleteModal();
					showConstraintPrompt.value = true;
				} else {
					alert(response.message || t("users.delete_failed"));
					closeDeleteModal();
				}
			} catch (err) {
				console.error("Error deleting user:", err);
				alert(t("users.delete_failed"));
				closeDeleteModal();
			} finally {
				isDeleting.value = false;
			}
		}
		function closeConstraintPrompt() {
			showConstraintPrompt.value = false;
			userToDelete.value = null;
			isDeactivating.value = false;
		}
		function openLastAdminPrompt() {
			showConstraintPrompt.value = false;
			showLastAdminPrompt.value = true;
		}
		function closeLastAdminPrompt() {
			showLastAdminPrompt.value = false;
			userToDelete.value = null;
			isDeactivating.value = false;
		}
		async function handleDeactivateInstead() {
			if (!userToDelete.value || isDeactivating.value) return;
			isDeactivating.value = true;
			try {
				const response = await adminUserApi.updateAdminUser({
					user_id: userToDelete.value.user_id,
					is_active: false
				});
				if (response.rc === 0) {
					alert(t("users.deactivate_success"));
					closeConstraintPrompt();
					await fetchUsers(true);
				} else if (response.rc === 771) {
					alert(t("users.last_admin_deactivate"));
					openLastAdminPrompt();
				} else {
					alert(response.message || t("users.deactivate_failed"));
					closeConstraintPrompt();
				}
			} catch (err) {
				console.error("Error deactivating user:", err);
				alert(t("users.deactivate_failed"));
				closeConstraintPrompt();
			} finally {
				isDeactivating.value = false;
			}
		}
		const showResetPasswordModal = ref(false);
		const userToReset = ref(null);
		const isResettingPassword = ref(false);
		const resetPassword = ref("");
		const showResetPassword = ref(false);
		const resetPasswordError = ref("");
		const showResetPasswordSuccessModal = ref(false);
		const resetPasswordCriteria = computed(() => {
			const pwd = resetPassword.value;
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
		const isResetPasswordValid = computed(() => resetPasswordCriteria.value.every((c) => c.met));
		function openResetPasswordModal(user) {
			userToReset.value = user;
			resetPassword.value = "";
			showResetPassword.value = false;
			resetPasswordError.value = "";
			showResetPasswordModal.value = true;
		}
		function openResetPasswordFromEditModal() {
			if (!originalEditUser.value) return;
			closeEditModal();
			openResetPasswordModal(users.value.find((u) => u.user_id === originalEditUser.value?.user_id) || originalEditUser.value);
		}
		function closeResetPasswordModal() {
			showResetPasswordModal.value = false;
			userToReset.value = null;
			isResettingPassword.value = false;
			resetPassword.value = "";
			showResetPassword.value = false;
			resetPasswordError.value = "";
		}
		function closeResetPasswordSuccessModal() {
			showResetPasswordSuccessModal.value = false;
		}
		async function handleResetPasswordConfirm() {
			if (!userToReset.value) return;
			resetPasswordError.value = "";
			if (!resetPassword.value) {
				resetPasswordError.value = t("validation.required");
				return;
			}
			if (!isResetPasswordValid.value) {
				resetPasswordError.value = t("auth.password_requirements");
				return;
			}
			isResettingPassword.value = true;
			try {
				const response = await adminUserApi.resetAdminUserPassword({
					user_id: userToReset.value.user_id,
					password: resetPassword.value
				});
				if (response.rc === 0) {
					closeResetPasswordModal();
					showResetPasswordSuccessModal.value = true;
				} else if (response.rc === 242) resetPasswordError.value = response.message || t("auth.password_requirements");
				else if (response.rc === 770) {
					alert(t("users.user_not_found"));
					closeResetPasswordModal();
					await fetchUsers(true);
				} else alert(response.message || t("users.reset_password_failed"));
			} catch (err) {
				console.error("Error resetting password:", err);
				alert(t("users.reset_password_failed"));
			} finally {
				isResettingPassword.value = false;
			}
		}
		const showAddModal = ref(false);
		const addForm = reactive({
			first_name: "",
			last_name: "",
			phone_num: "",
			email: "",
			password: "",
			role: AdminUserRole.MANAGER
		});
		const addErrors = reactive({});
		const isAdding = ref(false);
		const showAddPassword = ref(false);
		const addPasswordCriteria = computed(() => {
			const pwd = addForm.password;
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
		const isAddPasswordValid = computed(() => addPasswordCriteria.value.every((c) => c.met));
		const isAddFormValid = computed(() => {
			return addForm.first_name.trim().length > 0 && isValidEmail(addForm.email) && isAddPasswordValid.value && addForm.role !== void 0;
		});
		const showEditModal = ref(false);
		const editingId = ref(null);
		const originalEditUser = ref(null);
		const showEditPassword = ref(false);
		const editForm = reactive({
			first_name: "",
			last_name: "",
			phone_num: "",
			email: "",
			role: AdminUserRole.MANAGER,
			is_active: true,
			initial_password: ""
		});
		const editErrors = reactive({});
		const isEditing = ref(false);
		const isLoadingEditUser = ref(false);
		const editPasswordCriteria = computed(() => {
			const pwd = editForm.initial_password;
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
		const isEditPasswordValid = computed(() => editPasswordCriteria.value.every((c) => c.met));
		const isEditEmailChanged = computed(() => originalEditUser.value !== null && editForm.email.trim() !== originalEditUser.value.email);
		const isEditOwnAccount = computed(() => {
			if (!originalEditUser.value || !authStore.user?.email) return false;
			return originalEditUser.value.email === authStore.user.email;
		});
		const isCurrentUserSuperAdmin = computed(() => {
			const currentEmail = authStore.user?.email;
			if (!currentEmail) return false;
			return users.value.find((u) => u.email === currentEmail)?.role === AdminUserRole.SUPER_ADMIN;
		});
		const isEditRoleDisabled = computed(() => isEditOwnAccount.value || !isCurrentUserSuperAdmin.value);
		const isEditFormValid = computed(() => {
			if (!originalEditUser.value) return false;
			const baseValid = editForm.first_name.trim().length > 0 && isValidEmail(editForm.email) && editForm.role !== void 0;
			const emailPasswordValid = !isEditEmailChanged.value || isEditPasswordValid.value;
			return baseValid && emailPasswordValid;
		});
		const showEditDeactivateWarning = computed(() => {
			return originalEditUser.value !== null && originalEditUser.value.is_active && !editForm.is_active;
		});
		const addRoleOptions = [
			{
				value: AdminUserRole.SUPER_ADMIN,
				label: "Super Admin"
			},
			{
				value: AdminUserRole.MANAGER,
				label: "Manager"
			},
			{
				value: AdminUserRole.PLANNING,
				label: "Planning"
			},
			{
				value: AdminUserRole.LOGISTICS,
				label: "Logistics"
			},
			{
				value: AdminUserRole.FINANCE,
				label: "Finance"
			}
		];
		function openAddModal() {
			addForm.first_name = "";
			addForm.last_name = "";
			addForm.phone_num = "";
			addForm.email = "";
			addForm.password = "";
			addForm.role = AdminUserRole.MANAGER;
			Object.keys(addErrors).forEach((k) => delete addErrors[k]);
			showAddModal.value = true;
		}
		function closeAddModal() {
			showAddModal.value = false;
		}
		function validateAddForm() {
			Object.keys(addErrors).forEach((k) => delete addErrors[k]);
			if (!addForm.first_name.trim()) addErrors.first_name = t("validation.required");
			if (!addForm.email.trim()) addErrors.email = t("validation.required");
			else if (!isValidEmail(addForm.email)) addErrors.email = t("auth.error_invalid_email");
			if (!addForm.password) addErrors.password = t("validation.required");
			else if (!isAddPasswordValid.value) addErrors.password = t("auth.password_requirements");
			if (!addForm.role) addErrors.role = t("validation.required");
			return Object.keys(addErrors).length === 0;
		}
		async function handleAddSubmit() {
			if (!validateAddForm()) return;
			isAdding.value = true;
			try {
				const response = await adminUserApi.addAdminUser({
					first_name: addForm.first_name,
					last_name: addForm.last_name,
					email: addForm.email,
					phone_num: addForm.phone_num,
					role: addForm.role,
					password: addForm.password
				});
				if (response.rc === 0) {
					await fetchUsers(true);
					closeAddModal();
					toastStore.success("User created successfully.");
					return;
				}
				Object.keys(addErrors).forEach((k) => delete addErrors[k]);
				switch (response.rc) {
					case 102:
						addErrors.first_name = t("validation.required");
						addErrors.email = t("validation.required");
						addErrors.password = t("validation.required");
						addErrors.role = t("validation.required");
						break;
					case 106:
						addErrors.role = t("users.invalid_role");
						break;
					case 213:
						addErrors.first_name = t("users.first_name_required");
						break;
					case 235:
						addErrors.email = t("auth.error_invalid_email");
						break;
					case 240:
						addErrors.email = t("users.email_exists");
						break;
					case 242:
						addErrors.password = response.message || t("auth.password_requirements");
						break;
					default: alert(response.message || "Failed to add user");
				}
			} catch (err) {
				console.error("Error adding user:", err);
				alert("Failed to add user");
			} finally {
				isAdding.value = false;
			}
		}
		function closeEditModal() {
			showEditModal.value = false;
			editingId.value = null;
			originalEditUser.value = null;
			editForm.initial_password = "";
			showEditPassword.value = false;
			Object.keys(editErrors).forEach((k) => delete editErrors[k]);
		}
		function validateEditForm() {
			Object.keys(editErrors).forEach((k) => delete editErrors[k]);
			if (!editForm.first_name.trim()) editErrors.first_name = t("validation.required");
			if (!editForm.email.trim()) editErrors.email = t("validation.required");
			else if (!isValidEmail(editForm.email)) editErrors.email = t("auth.error_invalid_email");
			if (isEditEmailChanged.value && !isEditPasswordValid.value) editErrors.initial_password = t("auth.password_requirements");
			return Object.keys(editErrors).length === 0;
		}
		async function handleEditSubmit() {
			if (!validateEditForm()) return;
			if (!originalEditUser.value) return;
			isEditing.value = true;
			try {
				const original = originalEditUser.value;
				const payload = { user_id: editingId.value };
				if (editForm.first_name.trim() !== original.first_name) payload.first_name = editForm.first_name.trim();
				if (editForm.last_name.trim() !== original.last_name) payload.last_name = editForm.last_name.trim();
				if (editForm.phone_num.trim() !== original.phone_num) payload.phone_num = editForm.phone_num.trim();
				if (editForm.email.trim() !== original.email) {
					payload.email = editForm.email.trim();
					payload.initial_password = editForm.initial_password;
				}
				if (editForm.is_active !== original.is_active) payload.is_active = editForm.is_active;
				const hasUserChanges = Object.keys(payload).length > 1;
				let userResponse = null;
				if (hasUserChanges) userResponse = await adminUserApi.updateAdminUser(payload);
				let roleResponse = null;
				if (editForm.role !== original.role) roleResponse = await adminUserApi.changeAdminUserRole({
					user_id: editingId.value,
					role: editForm.role
				});
				if ((!userResponse || userResponse.rc === 0) && (!roleResponse || roleResponse.rc === 0)) {
					await fetchUsers(true);
					closeEditModal();
					toastStore.success(t("users.edit_success"));
					return;
				}
				Object.keys(editErrors).forEach((k) => delete editErrors[k]);
				const response = userResponse && userResponse.rc !== 0 ? userResponse : roleResponse;
				switch (response?.rc) {
					case 770:
						alert(t("users.user_not_found"));
						closeEditModal();
						await fetchUsers(true);
						break;
					case 771:
						editErrors.is_active = t("users.last_admin_deactivate");
						break;
					case 772:
						editErrors.role = t("users.cannot_change_own_role");
						break;
					case 102:
						editErrors.initial_password = t("users.initial_password_required");
						break;
					case 106:
						editErrors.role = t("users.invalid_role");
						break;
					case 235:
						editErrors.email = t("auth.error_invalid_email");
						break;
					case 240:
						editErrors.email = t("users.email_exists");
						break;
					case 242:
						editErrors.initial_password = response?.message || t("auth.password_requirements");
						break;
					default: alert(response?.message || "Failed to update user");
				}
			} catch (err) {
				console.error("Error updating user:", err);
				alert("Failed to update user");
			} finally {
				isEditing.value = false;
			}
		}
		const totalUsers = computed(() => totalCount.value);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_AppButton = AppButton_default;
			const _component_Badge = Badge_default;
			const _component_AppModal = AppModal_default;
			const _component_AppDialogModal = AppDialogModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "users-management" }, _attrs))} data-v-253f1930><div class="users-management__header" data-v-253f1930><div data-v-253f1930><h2 class="users-management__title" data-v-253f1930>${ssrInterpolate(unref(t)("users.management_title"))}</h2><p class="users-management__subtitle" data-v-253f1930> Total: ${ssrInterpolate(unref(totalUsers))} users in the system </p></div><div class="users-management__actions" data-v-253f1930><div class="users-management__search" data-v-253f1930>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 16,
				class: "users-management__search-icon"
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", unref(searchQuery))} type="text"${ssrRenderAttr("placeholder", unref(t)("users.search_placeholder"))} class="users-management__search-input" data-v-253f1930>`);
			if (unref(isSearching)) _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:loader-2",
				size: 16,
				class: "users-management__search-loading spin"
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</div><label class="users-management__filter users-management__filter--checkbox" data-v-253f1930><input${ssrIncludeBooleanAttr(Array.isArray(unref(includeInactive)) ? ssrLooseContain(unref(includeInactive), null) : unref(includeInactive)) ? " checked" : ""} type="checkbox" data-v-253f1930><span data-v-253f1930>${ssrInterpolate(unref(t)("users.include_inactive"))}</span></label>`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("users.add_user"),
				icon: "lucide:plus",
				type: "primary",
				onClick: openAddModal
			}, null, _parent));
			_push(`</div></div><div class="users-management__table-container" data-v-253f1930>`);
			if (unref(loading) && !unref(isSearching)) {
				_push(`<div class="loading-overlay" data-v-253f1930>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 32,
					class: "animate-spin"
				}, null, _parent));
				_push(`<span data-v-253f1930>${ssrInterpolate(unref(t)("common.loading"))}</span></div>`);
			} else {
				_push(`<table class="users-management__table" data-v-253f1930><thead data-v-253f1930><tr data-v-253f1930><th class="${ssrRenderClass([{
					"sorted": unref(sortKey) === "first_name",
					"asc": unref(sortKey) === "first_name" && unref(sortOrder) === "asc",
					"desc": unref(sortKey) === "first_name" && unref(sortOrder) === "desc"
				}, "col-first-name sortable"])}" data-v-253f1930><span class="sortable-content" data-v-253f1930><span data-v-253f1930>${ssrInterpolate(unref(t)("users.first_name"))}</span>`);
				if (unref(sortKey) === "first_name") _push(ssrRenderComponent(_component_Icon, {
					name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
					size: 14
				}, null, _parent));
				else _push(`<!---->`);
				_push(`</span></th><th class="${ssrRenderClass([{
					"sorted": unref(sortKey) === "last_name",
					"asc": unref(sortKey) === "last_name" && unref(sortOrder) === "asc",
					"desc": unref(sortKey) === "last_name" && unref(sortOrder) === "desc"
				}, "col-last-name sortable"])}" data-v-253f1930><span class="sortable-content" data-v-253f1930><span data-v-253f1930>${ssrInterpolate(unref(t)("users.last_name"))}</span>`);
				if (unref(sortKey) === "last_name") _push(ssrRenderComponent(_component_Icon, {
					name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
					size: 14
				}, null, _parent));
				else _push(`<!---->`);
				_push(`</span></th><th class="col-mobile" data-v-253f1930>${ssrInterpolate(unref(t)("users.mobile"))}</th><th class="${ssrRenderClass([{
					"sorted": unref(sortKey) === "email",
					"asc": unref(sortKey) === "email" && unref(sortOrder) === "asc",
					"desc": unref(sortKey) === "email" && unref(sortOrder) === "desc"
				}, "col-email sortable"])}" data-v-253f1930><span class="sortable-content" data-v-253f1930><span data-v-253f1930>${ssrInterpolate(unref(t)("users.email"))}</span>`);
				if (unref(sortKey) === "email") _push(ssrRenderComponent(_component_Icon, {
					name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
					size: 14
				}, null, _parent));
				else _push(`<!---->`);
				_push(`</span></th><th class="col-password" data-v-253f1930>${ssrInterpolate(unref(t)("users.password"))}</th><th class="${ssrRenderClass([{
					"sorted": unref(sortKey) === "role",
					"asc": unref(sortKey) === "role" && unref(sortOrder) === "asc",
					"desc": unref(sortKey) === "role" && unref(sortOrder) === "desc"
				}, "col-role sortable"])}" data-v-253f1930><span class="sortable-content" data-v-253f1930><span data-v-253f1930>${ssrInterpolate(unref(t)("users.role"))}</span>`);
				if (unref(sortKey) === "role") _push(ssrRenderComponent(_component_Icon, {
					name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
					size: 14
				}, null, _parent));
				else _push(`<!---->`);
				_push(`</span></th><th class="${ssrRenderClass([{
					"sorted": unref(sortKey) === "created_on",
					"asc": unref(sortKey) === "created_on" && unref(sortOrder) === "asc",
					"desc": unref(sortKey) === "created_on" && unref(sortOrder) === "desc"
				}, "col-date sortable"])}" data-v-253f1930><span class="sortable-content" data-v-253f1930><span data-v-253f1930>${ssrInterpolate(unref(t)("users.registration_date"))}</span>`);
				if (unref(sortKey) === "created_on") _push(ssrRenderComponent(_component_Icon, {
					name: unref(sortOrder) === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
					size: 14
				}, null, _parent));
				else _push(`<!---->`);
				_push(`</span></th><th class="col-active" data-v-253f1930>${ssrInterpolate(unref(t)("users.active"))}</th><th class="col-actions" data-v-253f1930>${ssrInterpolate(unref(t)("common.actions"))}</th></tr></thead><tbody data-v-253f1930><!--[-->`);
				ssrRenderList(unref(users), (user) => {
					_push(`<tr data-v-253f1930><td class="col-first-name" data-v-253f1930><span class="user-name" data-v-253f1930>${ssrInterpolate(user.first_name)}</span></td><td class="col-last-name" data-v-253f1930>${ssrInterpolate(user.last_name)}</td><td class="col-mobile" data-v-253f1930>${ssrInterpolate(user.phone_num)}</td><td class="col-email" data-v-253f1930>${ssrInterpolate(user.email)}</td><td class="col-password" data-v-253f1930><span class="password-mask" data-v-253f1930>•••••••</span>`);
					if (!user.last_login) _push(`<span class="password-initial" data-v-253f1930>Initial</span>`);
					else _push(`<!---->`);
					_push(`</td><td class="col-role" data-v-253f1930>`);
					_push(ssrRenderComponent(_component_Badge, {
						type: "adminRole",
						value: user.role
					}, null, _parent));
					_push(`</td><td class="col-date" data-v-253f1930>${ssrInterpolate(formatDate(user.created_on))}</td><td class="col-active" data-v-253f1930>`);
					_push(ssrRenderComponent(_component_Badge, {
						type: "active",
						value: user.is_active
					}, null, _parent));
					_push(`</td><td class="col-actions" data-v-253f1930><div class="action-group" data-v-253f1930><button class="action-btn action-btn--icon"${ssrRenderAttr("title", unref(t)("common.edit"))} data-v-253f1930>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:pencil",
						size: 14
					}, null, _parent));
					_push(`</button><button class="action-btn action-btn--icon"${ssrRenderAttr("title", unref(t)("users.reset_password"))} data-v-253f1930>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:key",
						size: 14
					}, null, _parent));
					_push(`</button>`);
					if (user.email !== unref(authStore).user?.email) {
						_push(`<button class="action-btn action-btn--icon"${ssrRenderAttr("title", unref(t)("common.delete"))} data-v-253f1930>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:trash-2",
							size: 14
						}, null, _parent));
						_push(`</button>`);
					} else _push(`<!---->`);
					_push(`</div></td></tr>`);
				});
				_push(`<!--]--></tbody></table>`);
			}
			_push(`</div>`);
			_push(ssrRenderComponent(_component_AppModal, {
				show: unref(showDeleteModal),
				title: unref(t)("users.delete_title"),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(isDeleting) ? unref(t)("common.deleting") : unref(t)("common.delete"),
				"ok-disabled": unref(isDeleting),
				onClose: closeDeleteModal,
				onCancel: closeDeleteModal,
				onOk: handleDeleteConfirm
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="delete-modal" data-v-253f1930${_scopeId}><p class="delete-modal__message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.delete_message", { name: `${unref(userToDelete)?.first_name} ${unref(userToDelete)?.last_name}` }))}</p><p class="delete-modal__warning" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.delete_warning"))}</p></div>`);
					else return [createVNode("div", { class: "delete-modal" }, [createVNode("p", { class: "delete-modal__message" }, toDisplayString(unref(t)("users.delete_message", { name: `${unref(userToDelete)?.first_name} ${unref(userToDelete)?.last_name}` })), 1), createVNode("p", { class: "delete-modal__warning" }, toDisplayString(unref(t)("users.delete_warning")), 1)])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: unref(showConstraintPrompt),
				title: unref(t)("users.constraint_title"),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(isDeactivating) ? unref(t)("common.deactivating") : unref(t)("users.deactivate_instead"),
				"ok-disabled": unref(isDeactivating),
				onClose: closeConstraintPrompt,
				onCancel: closeConstraintPrompt,
				onOk: handleDeactivateInstead
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="constraint-modal" data-v-253f1930${_scopeId}><p class="constraint-modal__message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.constraint_message", { name: `${unref(userToDelete)?.first_name} ${unref(userToDelete)?.last_name}` }))}</p><ul class="constraint-modal__list" data-v-253f1930${_scopeId}><li data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.constraint_reason_own_account"))}</li><li data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.constraint_reason_last_admin"))}</li></ul><p class="constraint-modal__hint" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.constraint_deactivate_hint"))}</p></div>`);
					else return [createVNode("div", { class: "constraint-modal" }, [
						createVNode("p", { class: "constraint-modal__message" }, toDisplayString(unref(t)("users.constraint_message", { name: `${unref(userToDelete)?.first_name} ${unref(userToDelete)?.last_name}` })), 1),
						createVNode("ul", { class: "constraint-modal__list" }, [createVNode("li", null, toDisplayString(unref(t)("users.constraint_reason_own_account")), 1), createVNode("li", null, toDisplayString(unref(t)("users.constraint_reason_last_admin")), 1)]),
						createVNode("p", { class: "constraint-modal__hint" }, toDisplayString(unref(t)("users.constraint_deactivate_hint")), 1)
					])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: unref(showLastAdminPrompt),
				title: unref(t)("users.constraint_title"),
				"cancel-text": "",
				"ok-text": unref(t)("common.ok"),
				onClose: closeLastAdminPrompt,
				onCancel: closeLastAdminPrompt,
				onOk: closeLastAdminPrompt
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="constraint-modal" data-v-253f1930${_scopeId}><p class="constraint-modal__message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.last_admin_deactivate"))}</p></div>`);
					else return [createVNode("div", { class: "constraint-modal" }, [createVNode("p", { class: "constraint-modal__message" }, toDisplayString(unref(t)("users.last_admin_deactivate")), 1)])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: unref(showResetPasswordModal),
				title: unref(t)("users.reset_password_title", { name: `${unref(userToReset)?.first_name} ${unref(userToReset)?.last_name}` }),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(isResettingPassword) ? unref(t)("common.saving") : unref(t)("users.reset_password"),
				"ok-disabled": unref(isResettingPassword) || !unref(isResetPasswordValid),
				onClose: closeResetPasswordModal,
				onCancel: closeResetPasswordModal,
				onOk: handleResetPasswordConfirm
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="reset-password-modal" data-v-253f1930${_scopeId}><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.reset_password_new_password"))} <span class="required" data-v-253f1930${_scopeId}>*</span></label><div class="password-input-wrapper" data-v-253f1930${_scopeId}><input${ssrRenderDynamicModel(unref(showResetPassword) ? "text" : "password", unref(resetPassword), null)}${ssrRenderAttr("type", unref(showResetPassword) ? "text" : "password")} class="form-input password-input"${ssrRenderAttr("placeholder", unref(t)("auth.password_placeholder") || "Enter password")} data-v-253f1930${_scopeId}><button type="button" class="password-toggle-btn" data-v-253f1930${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: unref(showResetPassword) ? "lucide:eye-off" : "lucide:eye",
							size: 16
						}, null, _parent, _scopeId));
						_push(`</button></div>`);
						if (unref(resetPasswordError)) _push(`<span class="error-message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(resetPasswordError))}</span>`);
						else _push(`<!---->`);
						_push(`<div class="password-criteria" data-v-253f1930${_scopeId}><!--[-->`);
						ssrRenderList(unref(resetPasswordCriteria), (criterion) => {
							_push(`<div class="${ssrRenderClass([{ "password-criteria__item--met": criterion.met }, "password-criteria__item"])}" data-v-253f1930${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: criterion.met ? "lucide:check" : "lucide:x",
								size: 12,
								class: "password-criteria__icon"
							}, null, _parent, _scopeId));
							_push(`<span data-v-253f1930${_scopeId}>${ssrInterpolate(criterion.label)}</span></div>`);
						});
						_push(`<!--]--></div></div><div class="warning-banner" data-v-253f1930${_scopeId}><div class="warning-banner__title" data-v-253f1930${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:alert-triangle",
							size: 14
						}, null, _parent, _scopeId));
						_push(`<span data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.reset_password_warning"))}</span></div><ul class="warning-banner__list" data-v-253f1930${_scopeId}><li data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.reset_password_warning_logout"))}</li><li data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.reset_password_warning_change"))}</li><li data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.reset_password_warning_communicate"))}</li></ul></div></div>`);
					} else return [createVNode("div", { class: "reset-password-modal" }, [createVNode("div", { class: "form-group" }, [
						createVNode("label", { class: "form-label" }, [createTextVNode(toDisplayString(unref(t)("users.reset_password_new_password")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
						createVNode("div", { class: "password-input-wrapper" }, [withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => isRef(resetPassword) ? resetPassword.value = $event : null,
							type: unref(showResetPassword) ? "text" : "password",
							class: "form-input password-input",
							placeholder: unref(t)("auth.password_placeholder") || "Enter password"
						}, null, 8, [
							"onUpdate:modelValue",
							"type",
							"placeholder"
						]), [[vModelDynamic, unref(resetPassword)]]), createVNode("button", {
							type: "button",
							class: "password-toggle-btn",
							onClick: ($event) => showResetPassword.value = !unref(showResetPassword)
						}, [createVNode(_component_Icon, {
							name: unref(showResetPassword) ? "lucide:eye-off" : "lucide:eye",
							size: 16
						}, null, 8, ["name"])], 8, ["onClick"])]),
						unref(resetPasswordError) ? (openBlock(), createBlock("span", {
							key: 0,
							class: "error-message"
						}, toDisplayString(unref(resetPasswordError)), 1)) : createCommentVNode("", true),
						createVNode("div", { class: "password-criteria" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(resetPasswordCriteria), (criterion) => {
							return openBlock(), createBlock("div", {
								key: criterion.key,
								class: ["password-criteria__item", { "password-criteria__item--met": criterion.met }]
							}, [createVNode(_component_Icon, {
								name: criterion.met ? "lucide:check" : "lucide:x",
								size: 12,
								class: "password-criteria__icon"
							}, null, 8, ["name"]), createVNode("span", null, toDisplayString(criterion.label), 1)], 2);
						}), 128))])
					]), createVNode("div", { class: "warning-banner" }, [createVNode("div", { class: "warning-banner__title" }, [createVNode(_component_Icon, {
						name: "lucide:alert-triangle",
						size: 14
					}), createVNode("span", null, toDisplayString(unref(t)("users.reset_password_warning")), 1)]), createVNode("ul", { class: "warning-banner__list" }, [
						createVNode("li", null, toDisplayString(unref(t)("users.reset_password_warning_logout")), 1),
						createVNode("li", null, toDisplayString(unref(t)("users.reset_password_warning_change")), 1),
						createVNode("li", null, toDisplayString(unref(t)("users.reset_password_warning_communicate")), 1)
					])])])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: unref(showResetPasswordSuccessModal),
				title: unref(t)("users.reset_password_success_title"),
				"cancel-text": "",
				"ok-text": unref(t)("common.ok"),
				onClose: closeResetPasswordSuccessModal,
				onCancel: closeResetPasswordSuccessModal,
				onOk: closeResetPasswordSuccessModal
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<p class="modal__message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.reset_password_success"))}</p>`);
					else return [createVNode("p", { class: "modal__message" }, toDisplayString(unref(t)("users.reset_password_success")), 1)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: unref(showAddModal),
				title: unref(t)("users.add_title"),
				onClose: closeAddModal
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "secondary",
							onClick: closeAddModal
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(isAdding) ? unref(t)("common.saving") : unref(t)("common.save"),
							type: "primary",
							icon: "lucide:save",
							disabled: unref(isAdding) || !unref(isAddFormValid),
							onClick: handleAddSubmit
						}, null, _parent, _scopeId));
					} else return [createVNode(_component_AppButton, {
						text: unref(t)("common.cancel"),
						type: "secondary",
						onClick: closeAddModal
					}, null, 8, ["text"]), createVNode(_component_AppButton, {
						text: unref(isAdding) ? unref(t)("common.saving") : unref(t)("common.save"),
						type: "primary",
						icon: "lucide:save",
						disabled: unref(isAdding) || !unref(isAddFormValid),
						onClick: handleAddSubmit
					}, null, 8, ["text", "disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="add-user-form" data-v-253f1930${_scopeId}><div class="form-section" data-v-253f1930${_scopeId}><h4 class="section-title" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.basic_info"))}</h4><div class="form-row" data-v-253f1930${_scopeId}><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.first_name"))} <span class="required" data-v-253f1930${_scopeId}>*</span></label><input${ssrRenderAttr("value", unref(addForm).first_name)} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("users.first_name"))} data-v-253f1930${_scopeId}>`);
						if (unref(addErrors).first_name) _push(`<span class="error-message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(addErrors).first_name)}</span>`);
						else _push(`<!---->`);
						_push(`</div><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.last_name"))}</label><input${ssrRenderAttr("value", unref(addForm).last_name)} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("users.last_name"))} data-v-253f1930${_scopeId}></div></div><div class="form-row" data-v-253f1930${_scopeId}><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.mobile"))}</label><input${ssrRenderAttr("value", unref(addForm).phone_num)} type="tel" class="form-input"${ssrRenderAttr("placeholder", unref(t)("users.mobile"))} data-v-253f1930${_scopeId}></div><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.email"))} <span class="required" data-v-253f1930${_scopeId}>*</span></label><input${ssrRenderAttr("value", unref(addForm).email)} type="email" class="form-input"${ssrRenderAttr("placeholder", unref(t)("users.email_placeholder") || "email@example.com")} data-v-253f1930${_scopeId}>`);
						if (unref(addErrors).email) _push(`<span class="error-message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(addErrors).email)}</span>`);
						else _push(`<!---->`);
						_push(`</div></div><div class="form-row" data-v-253f1930${_scopeId}><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.password"))} <span class="required" data-v-253f1930${_scopeId}>*</span></label><div class="password-input-wrapper" data-v-253f1930${_scopeId}><input${ssrRenderDynamicModel(unref(showAddPassword) ? "text" : "password", unref(addForm).password, null)}${ssrRenderAttr("type", unref(showAddPassword) ? "text" : "password")} class="form-input password-input"${ssrRenderAttr("placeholder", unref(t)("auth.password_placeholder") || "Enter password")} data-v-253f1930${_scopeId}><button type="button" class="password-toggle-btn" data-v-253f1930${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: unref(showAddPassword) ? "lucide:eye-off" : "lucide:eye",
							size: 16
						}, null, _parent, _scopeId));
						_push(`</button></div>`);
						if (unref(addErrors).password) _push(`<span class="error-message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(addErrors).password)}</span>`);
						else _push(`<!---->`);
						_push(`<span class="hint" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.password_hint") || "Initial password. User must change on first login.")}</span></div><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.role"))} <span class="required" data-v-253f1930${_scopeId}>*</span></label><select class="form-select" data-v-253f1930${_scopeId}><!--[-->`);
						ssrRenderList(addRoleOptions, (opt) => {
							_push(`<option${ssrRenderAttr("value", opt.value)} data-v-253f1930${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).role) ? ssrLooseContain(unref(addForm).role, opt.value) : ssrLooseEqual(unref(addForm).role, opt.value)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(opt.label)}</option>`);
						});
						_push(`<!--]--></select>`);
						if (unref(addErrors).role) _push(`<span class="error-message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(addErrors).role)}</span>`);
						else _push(`<!---->`);
						_push(`</div></div>`);
						if (unref(addForm).password.length > 0) {
							_push(`<div class="form-row" data-v-253f1930${_scopeId}><div class="form-group form-group--full" data-v-253f1930${_scopeId}><div class="password-criteria" data-v-253f1930${_scopeId}><!--[-->`);
							ssrRenderList(unref(addPasswordCriteria), (criterion) => {
								_push(`<div class="${ssrRenderClass([{ "password-criteria__item--met": criterion.met }, "password-criteria__item"])}" data-v-253f1930${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: criterion.met ? "lucide:check" : "lucide:x",
									size: 12,
									class: "password-criteria__icon"
								}, null, _parent, _scopeId));
								_push(`<span data-v-253f1930${_scopeId}>${ssrInterpolate(criterion.label)}</span></div>`);
							});
							_push(`<!--]--></div></div></div>`);
						} else _push(`<!---->`);
						_push(`</div><div class="form-section form-section--info" data-v-253f1930${_scopeId}><div class="info-row" data-v-253f1930${_scopeId}><span class="info-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.registration_date"))}:</span><span class="info-value" data-v-253f1930${_scopeId}>${ssrInterpolate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10))}</span></div><div class="info-row" data-v-253f1930${_scopeId}><span class="info-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.status"))}:</span>`);
						_push(ssrRenderComponent(_component_Badge, {
							type: "status",
							value: "active"
						}, null, _parent, _scopeId));
						_push(`</div></div></div>`);
					} else return [createVNode("div", { class: "add-user-form" }, [createVNode("div", { class: "form-section" }, [
						createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("users.basic_info")), 1),
						createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [
							createVNode("label", { class: "form-label" }, [createTextVNode(toDisplayString(unref(t)("users.first_name")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => unref(addForm).first_name = $event,
								type: "text",
								class: "form-input",
								placeholder: unref(t)("users.first_name")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(addForm).first_name]]),
							unref(addErrors).first_name ? (openBlock(), createBlock("span", {
								key: 0,
								class: "error-message"
							}, toDisplayString(unref(addErrors).first_name), 1)) : createCommentVNode("", true)
						]), createVNode("div", { class: "form-group" }, [createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("users.last_name")), 1), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => unref(addForm).last_name = $event,
							type: "text",
							class: "form-input",
							placeholder: unref(t)("users.last_name")
						}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(addForm).last_name]])])]),
						createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("users.mobile")), 1), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => unref(addForm).phone_num = $event,
							type: "tel",
							class: "form-input",
							placeholder: unref(t)("users.mobile")
						}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(addForm).phone_num]])]), createVNode("div", { class: "form-group" }, [
							createVNode("label", { class: "form-label" }, [createTextVNode(toDisplayString(unref(t)("users.email")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => unref(addForm).email = $event,
								type: "email",
								class: "form-input",
								placeholder: unref(t)("users.email_placeholder") || "email@example.com"
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(addForm).email]]),
							unref(addErrors).email ? (openBlock(), createBlock("span", {
								key: 0,
								class: "error-message"
							}, toDisplayString(unref(addErrors).email), 1)) : createCommentVNode("", true)
						])]),
						createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [
							createVNode("label", { class: "form-label" }, [createTextVNode(toDisplayString(unref(t)("users.password")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							createVNode("div", { class: "password-input-wrapper" }, [withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => unref(addForm).password = $event,
								type: unref(showAddPassword) ? "text" : "password",
								class: "form-input password-input",
								placeholder: unref(t)("auth.password_placeholder") || "Enter password"
							}, null, 8, [
								"onUpdate:modelValue",
								"type",
								"placeholder"
							]), [[vModelDynamic, unref(addForm).password]]), createVNode("button", {
								type: "button",
								class: "password-toggle-btn",
								onClick: ($event) => showAddPassword.value = !unref(showAddPassword)
							}, [createVNode(_component_Icon, {
								name: unref(showAddPassword) ? "lucide:eye-off" : "lucide:eye",
								size: 16
							}, null, 8, ["name"])], 8, ["onClick"])]),
							unref(addErrors).password ? (openBlock(), createBlock("span", {
								key: 0,
								class: "error-message"
							}, toDisplayString(unref(addErrors).password), 1)) : createCommentVNode("", true),
							createVNode("span", { class: "hint" }, toDisplayString(unref(t)("users.password_hint") || "Initial password. User must change on first login."), 1)
						]), createVNode("div", { class: "form-group" }, [
							createVNode("label", { class: "form-label" }, [createTextVNode(toDisplayString(unref(t)("users.role")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							withDirectives(createVNode("select", {
								"onUpdate:modelValue": ($event) => unref(addForm).role = $event,
								class: "form-select"
							}, [(openBlock(), createBlock(Fragment, null, renderList(addRoleOptions, (opt) => {
								return createVNode("option", {
									key: opt.value,
									value: opt.value
								}, toDisplayString(opt.label), 9, ["value"]);
							}), 64))], 8, ["onUpdate:modelValue"]), [[vModelSelect, unref(addForm).role]]),
							unref(addErrors).role ? (openBlock(), createBlock("span", {
								key: 0,
								class: "error-message"
							}, toDisplayString(unref(addErrors).role), 1)) : createCommentVNode("", true)
						])]),
						unref(addForm).password.length > 0 ? (openBlock(), createBlock("div", {
							key: 0,
							class: "form-row"
						}, [createVNode("div", { class: "form-group form-group--full" }, [createVNode("div", { class: "password-criteria" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(addPasswordCriteria), (criterion) => {
							return openBlock(), createBlock("div", {
								key: criterion.key,
								class: ["password-criteria__item", { "password-criteria__item--met": criterion.met }]
							}, [createVNode(_component_Icon, {
								name: criterion.met ? "lucide:check" : "lucide:x",
								size: 12,
								class: "password-criteria__icon"
							}, null, 8, ["name"]), createVNode("span", null, toDisplayString(criterion.label), 1)], 2);
						}), 128))])])])) : createCommentVNode("", true)
					]), createVNode("div", { class: "form-section form-section--info" }, [createVNode("div", { class: "info-row" }, [createVNode("span", { class: "info-label" }, toDisplayString(unref(t)("users.registration_date")) + ":", 1), createVNode("span", { class: "info-value" }, toDisplayString((/* @__PURE__ */ new Date()).toISOString().slice(0, 10)), 1)]), createVNode("div", { class: "info-row" }, [createVNode("span", { class: "info-label" }, toDisplayString(unref(t)("users.status")) + ":", 1), createVNode(_component_Badge, {
						type: "status",
						value: "active"
					})])])])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppDialogModal, {
				show: unref(showEditModal),
				title: unref(t)("users.edit_title"),
				onClose: closeEditModal
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "secondary",
							onClick: closeEditModal
						}, null, _parent, _scopeId));
						if (unref(isCurrentUserSuperAdmin) && unref(originalEditUser)) _push(ssrRenderComponent(_component_AppButton, {
							text: unref(t)("users.reset_password"),
							type: "secondary",
							icon: "lucide:key",
							disabled: unref(isEditing),
							onClick: openResetPasswordFromEditModal
						}, null, _parent, _scopeId));
						else _push(`<!---->`);
						_push(ssrRenderComponent(_component_AppButton, {
							text: unref(isEditing) ? unref(t)("common.saving") : unref(t)("common.save"),
							type: "primary",
							icon: "lucide:save",
							disabled: unref(isEditing) || unref(isLoadingEditUser) || !unref(isEditFormValid),
							onClick: handleEditSubmit
						}, null, _parent, _scopeId));
					} else return [
						createVNode(_component_AppButton, {
							text: unref(t)("common.cancel"),
							type: "secondary",
							onClick: closeEditModal
						}, null, 8, ["text"]),
						unref(isCurrentUserSuperAdmin) && unref(originalEditUser) ? (openBlock(), createBlock(_component_AppButton, {
							key: 0,
							text: unref(t)("users.reset_password"),
							type: "secondary",
							icon: "lucide:key",
							disabled: unref(isEditing),
							onClick: openResetPasswordFromEditModal
						}, null, 8, ["text", "disabled"])) : createCommentVNode("", true),
						createVNode(_component_AppButton, {
							text: unref(isEditing) ? unref(t)("common.saving") : unref(t)("common.save"),
							type: "primary",
							icon: "lucide:save",
							disabled: unref(isEditing) || unref(isLoadingEditUser) || !unref(isEditFormValid),
							onClick: handleEditSubmit
						}, null, 8, ["text", "disabled"])
					];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(isLoadingEditUser)) {
							_push(`<div class="modal-loading" data-v-253f1930${_scopeId}>`);
							_push(ssrRenderComponent(_component_Icon, {
								name: "lucide:loader-2",
								size: 32,
								class: "spin"
							}, null, _parent, _scopeId));
							_push(`<span data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("common.loading"))}</span></div>`);
						} else {
							_push(`<div class="add-user-form" data-v-253f1930${_scopeId}><div class="form-section" data-v-253f1930${_scopeId}><h4 class="section-title" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.basic_info"))}</h4><div class="form-row" data-v-253f1930${_scopeId}><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.first_name"))} <span class="required" data-v-253f1930${_scopeId}>*</span></label><input${ssrRenderAttr("value", unref(editForm).first_name)} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("users.first_name"))} data-v-253f1930${_scopeId}>`);
							if (unref(editErrors).first_name) _push(`<span class="error-message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(editErrors).first_name)}</span>`);
							else _push(`<!---->`);
							_push(`</div><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.last_name"))}</label><input${ssrRenderAttr("value", unref(editForm).last_name)} type="text" class="form-input"${ssrRenderAttr("placeholder", unref(t)("users.last_name"))} data-v-253f1930${_scopeId}></div></div><div class="form-row" data-v-253f1930${_scopeId}><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.mobile"))}</label><input${ssrRenderAttr("value", unref(editForm).phone_num)} type="tel" class="form-input"${ssrRenderAttr("placeholder", unref(t)("users.mobile"))} data-v-253f1930${_scopeId}></div><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.email"))} <span class="required" data-v-253f1930${_scopeId}>*</span></label><input${ssrRenderAttr("value", unref(editForm).email)} type="email" class="form-input"${ssrRenderAttr("placeholder", unref(t)("users.email_placeholder") || "email@example.com")} data-v-253f1930${_scopeId}>`);
							if (unref(editErrors).email) _push(`<span class="error-message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(editErrors).email)}</span>`);
							else _push(`<!---->`);
							_push(`</div></div>`);
							if (unref(isEditEmailChanged)) {
								_push(`<div class="form-row" data-v-253f1930${_scopeId}><div class="form-group form-group--full" data-v-253f1930${_scopeId}><div class="warning-banner" data-v-253f1930${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:alert-triangle",
									size: 16
								}, null, _parent, _scopeId));
								_push(`<span data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.email_change_warning"))}</span></div></div></div>`);
							} else _push(`<!---->`);
							if (unref(isEditEmailChanged)) {
								_push(`<div class="form-row" data-v-253f1930${_scopeId}><div class="form-group form-group--full" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.initial_password"))} <span class="required" data-v-253f1930${_scopeId}>*</span></label><div class="password-input-wrapper" data-v-253f1930${_scopeId}><input${ssrRenderDynamicModel(unref(showEditPassword) ? "text" : "password", unref(editForm).initial_password, null)}${ssrRenderAttr("type", unref(showEditPassword) ? "text" : "password")} class="form-input password-input"${ssrRenderAttr("placeholder", unref(t)("auth.password_placeholder") || "Enter password")} data-v-253f1930${_scopeId}><button type="button" class="password-toggle-btn" data-v-253f1930${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: unref(showEditPassword) ? "lucide:eye-off" : "lucide:eye",
									size: 16
								}, null, _parent, _scopeId));
								_push(`</button></div>`);
								if (unref(editErrors).initial_password) _push(`<span class="error-message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(editErrors).initial_password)}</span>`);
								else _push(`<!---->`);
								_push(`<div class="password-criteria" data-v-253f1930${_scopeId}><!--[-->`);
								ssrRenderList(unref(editPasswordCriteria), (criterion) => {
									_push(`<div class="${ssrRenderClass([{ "password-criteria__item--met": criterion.met }, "password-criteria__item"])}" data-v-253f1930${_scopeId}>`);
									_push(ssrRenderComponent(_component_Icon, {
										name: criterion.met ? "lucide:check" : "lucide:x",
										size: 12,
										class: "password-criteria__icon"
									}, null, _parent, _scopeId));
									_push(`<span data-v-253f1930${_scopeId}>${ssrInterpolate(criterion.label)}</span></div>`);
								});
								_push(`<!--]--></div><span class="hint" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.initial_password_hint") || "Required when changing email. The user will be logged out and must change this password on their next login.")}</span></div></div>`);
							} else _push(`<!---->`);
							_push(`<div class="form-row" data-v-253f1930${_scopeId}><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.role"))} <span class="required" data-v-253f1930${_scopeId}>*</span></label><div class="role-select-wrapper" data-v-253f1930${_scopeId}><select class="form-select"${ssrIncludeBooleanAttr(unref(isEditRoleDisabled)) ? " disabled" : ""}${ssrRenderAttr("title", unref(isEditRoleDisabled) ? unref(isEditOwnAccount) ? unref(t)("users.cannot_change_own_role") : unref(t)("users.role_super_admin_only") : "")} data-v-253f1930${_scopeId}><!--[-->`);
							ssrRenderList(addRoleOptions, (opt) => {
								_push(`<option${ssrRenderAttr("value", opt.value)} data-v-253f1930${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).role) ? ssrLooseContain(unref(editForm).role, opt.value) : ssrLooseEqual(unref(editForm).role, opt.value)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(opt.label)}</option>`);
							});
							_push(`<!--]--></select>`);
							if (unref(isEditRoleDisabled)) _push(`<span class="role-disabled-hint" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(isEditOwnAccount) ? unref(t)("users.cannot_change_own_role") : unref(t)("users.role_super_admin_only"))}</span>`);
							else _push(`<!---->`);
							_push(`</div>`);
							if (unref(editErrors).role) _push(`<span class="error-message" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(editErrors).role)}</span>`);
							else _push(`<!---->`);
							_push(`</div><div class="form-group" data-v-253f1930${_scopeId}><label class="form-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.status"))}</label><label class="toggle-switch" data-v-253f1930${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).is_active) ? ssrLooseContain(unref(editForm).is_active, null) : unref(editForm).is_active) ? " checked" : ""} type="checkbox" data-v-253f1930${_scopeId}><span class="toggle-switch__track" data-v-253f1930${_scopeId}></span><span class="toggle-switch__label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(editForm).is_active ? unref(t)("users.status_active") : unref(t)("users.status_inactive"))}</span></label></div></div>`);
							if (unref(showEditDeactivateWarning)) {
								_push(`<div class="form-row" data-v-253f1930${_scopeId}><div class="form-group form-group--full" data-v-253f1930${_scopeId}><div class="warning-banner warning-banner--critical" data-v-253f1930${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:alert-triangle",
									size: 16
								}, null, _parent, _scopeId));
								_push(`<span data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.deactivate_warning"))}</span></div></div></div>`);
							} else _push(`<!---->`);
							_push(`</div><div class="form-section form-section--info" data-v-253f1930${_scopeId}><div class="info-row" data-v-253f1930${_scopeId}><span class="info-label" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(t)("users.registration_date"))}:</span><span class="info-value" data-v-253f1930${_scopeId}>${ssrInterpolate(unref(originalEditUser)?.created_on ?? "")}</span></div></div></div>`);
						}
					} else return [unref(isLoadingEditUser) ? (openBlock(), createBlock("div", {
						key: 0,
						class: "modal-loading"
					}, [createVNode(_component_Icon, {
						name: "lucide:loader-2",
						size: 32,
						class: "spin"
					}), createVNode("span", null, toDisplayString(unref(t)("common.loading")), 1)])) : (openBlock(), createBlock("div", {
						key: 1,
						class: "add-user-form"
					}, [createVNode("div", { class: "form-section" }, [
						createVNode("h4", { class: "section-title" }, toDisplayString(unref(t)("users.basic_info")), 1),
						createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [
							createVNode("label", { class: "form-label" }, [createTextVNode(toDisplayString(unref(t)("users.first_name")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => unref(editForm).first_name = $event,
								type: "text",
								class: "form-input",
								placeholder: unref(t)("users.first_name")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(editForm).first_name]]),
							unref(editErrors).first_name ? (openBlock(), createBlock("span", {
								key: 0,
								class: "error-message"
							}, toDisplayString(unref(editErrors).first_name), 1)) : createCommentVNode("", true)
						]), createVNode("div", { class: "form-group" }, [createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("users.last_name")), 1), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => unref(editForm).last_name = $event,
							type: "text",
							class: "form-input",
							placeholder: unref(t)("users.last_name")
						}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(editForm).last_name]])])]),
						createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("users.mobile")), 1), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => unref(editForm).phone_num = $event,
							type: "tel",
							class: "form-input",
							placeholder: unref(t)("users.mobile")
						}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(editForm).phone_num]])]), createVNode("div", { class: "form-group" }, [
							createVNode("label", { class: "form-label" }, [createTextVNode(toDisplayString(unref(t)("users.email")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => unref(editForm).email = $event,
								type: "email",
								class: "form-input",
								placeholder: unref(t)("users.email_placeholder") || "email@example.com"
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, unref(editForm).email]]),
							unref(editErrors).email ? (openBlock(), createBlock("span", {
								key: 0,
								class: "error-message"
							}, toDisplayString(unref(editErrors).email), 1)) : createCommentVNode("", true)
						])]),
						unref(isEditEmailChanged) ? (openBlock(), createBlock("div", {
							key: 0,
							class: "form-row"
						}, [createVNode("div", { class: "form-group form-group--full" }, [createVNode("div", { class: "warning-banner" }, [createVNode(_component_Icon, {
							name: "lucide:alert-triangle",
							size: 16
						}), createVNode("span", null, toDisplayString(unref(t)("users.email_change_warning")), 1)])])])) : createCommentVNode("", true),
						unref(isEditEmailChanged) ? (openBlock(), createBlock("div", {
							key: 1,
							class: "form-row"
						}, [createVNode("div", { class: "form-group form-group--full" }, [
							createVNode("label", { class: "form-label" }, [createTextVNode(toDisplayString(unref(t)("users.initial_password")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							createVNode("div", { class: "password-input-wrapper" }, [withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => unref(editForm).initial_password = $event,
								type: unref(showEditPassword) ? "text" : "password",
								class: "form-input password-input",
								placeholder: unref(t)("auth.password_placeholder") || "Enter password"
							}, null, 8, [
								"onUpdate:modelValue",
								"type",
								"placeholder"
							]), [[vModelDynamic, unref(editForm).initial_password]]), createVNode("button", {
								type: "button",
								class: "password-toggle-btn",
								onClick: ($event) => showEditPassword.value = !unref(showEditPassword)
							}, [createVNode(_component_Icon, {
								name: unref(showEditPassword) ? "lucide:eye-off" : "lucide:eye",
								size: 16
							}, null, 8, ["name"])], 8, ["onClick"])]),
							unref(editErrors).initial_password ? (openBlock(), createBlock("span", {
								key: 0,
								class: "error-message"
							}, toDisplayString(unref(editErrors).initial_password), 1)) : createCommentVNode("", true),
							createVNode("div", { class: "password-criteria" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(editPasswordCriteria), (criterion) => {
								return openBlock(), createBlock("div", {
									key: criterion.key,
									class: ["password-criteria__item", { "password-criteria__item--met": criterion.met }]
								}, [createVNode(_component_Icon, {
									name: criterion.met ? "lucide:check" : "lucide:x",
									size: 12,
									class: "password-criteria__icon"
								}, null, 8, ["name"]), createVNode("span", null, toDisplayString(criterion.label), 1)], 2);
							}), 128))]),
							createVNode("span", { class: "hint" }, toDisplayString(unref(t)("users.initial_password_hint") || "Required when changing email. The user will be logged out and must change this password on their next login."), 1)
						])])) : createCommentVNode("", true),
						createVNode("div", { class: "form-row" }, [createVNode("div", { class: "form-group" }, [
							createVNode("label", { class: "form-label" }, [createTextVNode(toDisplayString(unref(t)("users.role")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							createVNode("div", { class: "role-select-wrapper" }, [withDirectives(createVNode("select", {
								"onUpdate:modelValue": ($event) => unref(editForm).role = $event,
								class: "form-select",
								disabled: unref(isEditRoleDisabled),
								title: unref(isEditRoleDisabled) ? unref(isEditOwnAccount) ? unref(t)("users.cannot_change_own_role") : unref(t)("users.role_super_admin_only") : ""
							}, [(openBlock(), createBlock(Fragment, null, renderList(addRoleOptions, (opt) => {
								return createVNode("option", {
									key: opt.value,
									value: opt.value
								}, toDisplayString(opt.label), 9, ["value"]);
							}), 64))], 8, [
								"onUpdate:modelValue",
								"disabled",
								"title"
							]), [[vModelSelect, unref(editForm).role]]), unref(isEditRoleDisabled) ? (openBlock(), createBlock("span", {
								key: 0,
								class: "role-disabled-hint"
							}, toDisplayString(unref(isEditOwnAccount) ? unref(t)("users.cannot_change_own_role") : unref(t)("users.role_super_admin_only")), 1)) : createCommentVNode("", true)]),
							unref(editErrors).role ? (openBlock(), createBlock("span", {
								key: 0,
								class: "error-message"
							}, toDisplayString(unref(editErrors).role), 1)) : createCommentVNode("", true)
						]), createVNode("div", { class: "form-group" }, [createVNode("label", { class: "form-label" }, toDisplayString(unref(t)("users.status")), 1), createVNode("label", { class: "toggle-switch" }, [
							withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => unref(editForm).is_active = $event,
								type: "checkbox"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, unref(editForm).is_active]]),
							createVNode("span", { class: "toggle-switch__track" }),
							createVNode("span", { class: "toggle-switch__label" }, toDisplayString(unref(editForm).is_active ? unref(t)("users.status_active") : unref(t)("users.status_inactive")), 1)
						])])]),
						unref(showEditDeactivateWarning) ? (openBlock(), createBlock("div", {
							key: 2,
							class: "form-row"
						}, [createVNode("div", { class: "form-group form-group--full" }, [createVNode("div", { class: "warning-banner warning-banner--critical" }, [createVNode(_component_Icon, {
							name: "lucide:alert-triangle",
							size: 16
						}), createVNode("span", null, toDisplayString(unref(t)("users.deactivate_warning")), 1)])])])) : createCommentVNode("", true)
					]), createVNode("div", { class: "form-section form-section--info" }, [createVNode("div", { class: "info-row" }, [createVNode("span", { class: "info-label" }, toDisplayString(unref(t)("users.registration_date")) + ":", 1), createVNode("span", { class: "info-value" }, toDisplayString(unref(originalEditUser)?.created_on ?? ""), 1)])])]))];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/users/UsersManagement.vue
var _sfc_setup$1 = UsersManagement_vue_vue_type_script_setup_true_lang_default.setup;
UsersManagement_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/users/UsersManagement.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var UsersManagement_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(UsersManagement_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-253f1930"]]), { __name: "UsersManagement" });
//#endregion
//#region app/pages/users/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		const authStore = useAuthStore();
		const isSuperAdmin = computed(() => authStore.roles.includes(AdminUserRole.SUPER_ADMIN));
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppHeader = AppHeader_default;
			const _component_UsersManagement = UsersManagement_default;
			const _component_Icon = components_default;
			_push(`<!--[-->`);
			if (unref(isSuperAdmin)) _push(ssrRenderComponent(_component_AppHeader, {
				title: "Users",
				breadcrumb: [{ label: "Admin" }, { label: "Users" }],
				"show-search": false
			}, null, _parent));
			else _push(`<!---->`);
			if (unref(isSuperAdmin)) {
				_push(`<div class="users-page" data-v-300ab34b>`);
				_push(ssrRenderComponent(_component_UsersManagement, null, null, _parent));
				_push(`</div>`);
			} else {
				_push(`<div class="access-denied" data-v-300ab34b>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:shield-alert",
					size: 48
				}, null, _parent));
				_push(`<h1 data-v-300ab34b>Access Denied</h1><p data-v-300ab34b>You must be a Super Admin to access the Users Management page.</p></div>`);
			}
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region app/pages/users/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/users/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var users_default = /*#__PURE__*/ _plugin_vue_export_helper_default(index_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-300ab34b"]]);

export { users_default as default };
//# sourceMappingURL=users-xb5BQN8v.mjs.map
