import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, c as useToastStore } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { A as AppModal_default } from './AppModal-DgfQAFue.mjs';
import { o as officerApi } from './officer-CPsAbV7J.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { A as AppButton_default } from './AppButton-sr0dx6mm.mjs';
import { I as ImageUpload_default } from './ImageUpload-CRnliurs.mjs';
import { defineComponent, ref, computed, reactive, watch, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, toDisplayString, createTextVNode, createCommentVNode, Fragment, withDirectives, vModelText, renderList, vModelSelect, vModelCheckbox, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';

//#region app/components/officers/OfficersManagement.vue?vue&type=script&setup=true&lang.ts
var OfficersManagement_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "OfficersManagement",
	__ssrInlineRender: true,
	props: {
		communityId: {},
		communityName: {}
	},
	setup(__props) {
		const props = __props;
		const { t } = useTranslation();
		const toastStore = useToastStore();
		function mapApiOfficer(o) {
			return {
				id: o.user_id,
				fullName: [o.first_name, o.last_name].filter(Boolean).join(" "),
				community: o.community_name || "",
				communityId: o.community_id,
				mobile: o.phone_num,
				email: o.email && !o.email.endsWith("@placeholder.local") ? o.email : "",
				address: o.address || "",
				title: o.title,
				picture: o.image_url || "",
				description: o.description || "",
				registrationDate: o.created_on ? o.created_on.split(" ")[0] : "",
				lastLogin: o.last_login,
				roles: o.roles || [],
				certifications: o.certification_badges || [],
				evaluations: [],
				active: o.is_active
			};
		}
		const ROLES = [
			"Patrol",
			"Supervisor",
			"K9 Handler",
			"Traffic Control",
			"Dispatcher",
			"CCTV Operator"
		];
		const CERTIFICATIONS = [
			"First Aid",
			"Firearms",
			"Defensive Driving",
			"Crisis Management",
			"CPR"
		];
		const officers = ref([]);
		const totalCount = ref(0);
		const isLoadingOfficers = ref(false);
		const isSearching = ref(false);
		const loadError = ref("");
		const communities = ref([]);
		const isLoadingCommunities = ref(false);
		const searchQuery = ref("");
		const filterCommunity = ref("all");
		const filterActive = ref("active");
		const sortBy = ref("");
		const sortDir = ref("");
		let searchDebounceTimer = null;
		const filteredOfficers = computed(() => officers.value);
		const showFormModal = ref(false);
		const formMode = ref("add");
		const editingId = ref(null);
		const editingOriginal = ref(null);
		const showDeleteModal = ref(false);
		const showCannotDeleteModal = ref(false);
		const deleteTarget = ref(null);
		const isDeleting = ref(false);
		const isDeactivating = ref(false);
		const editTab = ref("details");
		const showDetailModal = ref(false);
		const detailOfficer = ref(null);
		const showInlineEvalForm = ref(false);
		const isSavingEval = ref(false);
		const isLoadingEvals = ref(false);
		const inlineEvalForm = reactive({
			text: "",
			date: ""
		});
		const inlineEvalError = ref("");
		const deactivateWarning = computed(() => formMode.value === "edit" && !!editingOriginal.value && editingOriginal.value.active === true && form.active === false);
		const showPhoneConfirm = ref(false);
		const phoneChanged = computed(() => formMode.value === "edit" && !!editingOriginal.value && form.mobile.trim() !== "" && form.mobile !== editingOriginal.value.mobile);
		const showEvalDeleteModal = ref(false);
		const evalDeleteTarget = ref(null);
		function blankForm() {
			return {
				firstName: "",
				lastName: "",
				community: "",
				communityId: 0,
				mobile: "",
				email: "",
				address: "",
				title: "",
				picture: "",
				description: "",
				roles: [],
				certifications: [],
				active: true
			};
		}
		const form = reactive(blankForm());
		const formErrors = reactive({});
		const isSaving = ref(false);
		const isFormHasChanged = computed(() => {
			if (formMode.value !== "edit" || !editingOriginal.value) return true;
			const orig = editingOriginal.value;
			if (form.firstName.trim() !== (orig.firstName || "")) return true;
			if (form.lastName.trim() !== (orig.lastName || "")) return true;
			if (form.mobile !== (orig.mobile || "")) return true;
			if (form.email !== (orig.email || "")) return true;
			if (form.communityId !== (orig.communityId || 0)) return true;
			if (form.title !== (orig.title || "")) return true;
			if (form.address !== (orig.address || "")) return true;
			if (form.description !== (orig.description || "")) return true;
			if (form.active !== (orig.active ?? true)) return true;
			if (JSON.stringify(form.roles) !== JSON.stringify(orig.roles || [])) return true;
			if (JSON.stringify(form.certifications) !== JSON.stringify(orig.certifications || [])) return true;
			if (form.picture !== (orig.picture || "") && form.picture.startsWith("data:")) return true;
			if (!form.picture && orig.picture) return true;
			return false;
		});
		async function fetchOfficers(isSearch = false) {
			if (isSearch) isSearching.value = true;
			else isLoadingOfficers.value = true;
			loadError.value = "";
			try {
				const params = {};
				if (props.communityId) params.community_id = Number(props.communityId);
				else if (filterCommunity.value !== "all") params.community_id = filterCommunity.value;
				if (filterActive.value === "all") params.include_inactive = true;
				else if (filterActive.value === "inactive") params.include_inactive = true;
				if (searchQuery.value.trim()) params.search_text = searchQuery.value.trim();
				if (sortBy.value) {
					params.sort_by = sortBy.value;
					params.sort_dir = sortDir.value || "asc";
				}
				const response = await officerApi.getOfficers(params, { showLoading: !isSearch });
				if (response.rc === 0 && response.officers) {
					let mapped = response.officers.map(mapApiOfficer);
					if (filterActive.value === "inactive") mapped = mapped.filter((o) => !o.active);
					officers.value = mapped;
					totalCount.value = response.total_count ?? mapped.length;
				} else {
					loadError.value = response.message || t("officers.load_failed");
					officers.value = [];
					totalCount.value = 0;
				}
			} catch (err) {
				console.error("Failed to load officers:", err);
				loadError.value = t("officers.load_failed");
				officers.value = [];
				totalCount.value = 0;
			} finally {
				if (isSearch) isSearching.value = false;
				else isLoadingOfficers.value = false;
			}
		}
		watch([
			searchQuery,
			filterCommunity,
			filterActive,
			sortBy,
			sortDir
		], () => {
			if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
			searchDebounceTimer = setTimeout(() => {
				fetchOfficers(true);
			}, 400);
		});
		function openAdd() {
			formMode.value = "add";
			editingId.value = null;
			editTab.value = "details";
			Object.assign(form, blankForm());
			formErrors.firstName = "";
			formErrors.community = "";
			formErrors.mobile = "";
			formErrors.title = "";
			showFormModal.value = true;
		}
		function stripDataUrlPrefix(dataUrl) {
			if (dataUrl.startsWith("data:")) return dataUrl.split(",")[1] || "";
			return dataUrl;
		}
		function validateForm() {
			formErrors.firstName = !form.firstName.trim() ? t("validation.required") : "";
			formErrors.community = !form.communityId ? t("validation.required") : "";
			formErrors.mobile = !form.mobile.trim() ? t("validation.required") : "";
			formErrors.title = !form.title.trim() ? t("validation.required") : "";
			return !formErrors.firstName && !formErrors.community && !formErrors.mobile && !formErrors.title;
		}
		async function handleSave() {
			if (!validateForm()) return;
			if (formMode.value === "edit" && phoneChanged.value) {
				showPhoneConfirm.value = true;
				return;
			}
			await doSave();
		}
		async function doSave() {
			if (formMode.value === "add") {
				isSaving.value = true;
				try {
					const imageBase64 = stripDataUrlPrefix(form.picture);
					const response = await officerApi.addOfficer({
						first_name: form.firstName.trim(),
						last_name: form.lastName.trim() || void 0,
						phone_num: form.mobile,
						email: form.email || void 0,
						community_id: form.communityId,
						title: form.title,
						address: form.address || void 0,
						description: form.description || void 0,
						image: imageBase64 || void 0,
						roles: form.roles.length ? form.roles : void 0,
						certification_badges: form.certifications.length ? form.certifications : void 0
					});
					if (response.rc === 0) {
						showFormModal.value = false;
						toastStore.success(t("officers.create_success"));
						await fetchOfficers();
					} else if (response.rc === 235) formErrors.email = response.message || t("validation.invalid_email");
					else if (response.rc === 240) formErrors.email = response.message || t("users.email_already_exists");
					else if (response.rc === 241) formErrors.mobile = response.message || t("validation.phone_already_exists");
					else if (response.rc === 242) formErrors.title = response.message || t("officers.create_failed");
					else if (response.rc === 504 || response.rc === 505) formErrors.community = response.message || t("officers.community_invalid");
					else if (response.rc === 521) formErrors.mobile = response.message || t("officers.officer_already_in_community");
					else formErrors.title = response.message || t("officers.create_failed");
				} catch (err) {
					console.error("Error creating officer:", err);
					formErrors.title = t("officers.create_failed");
				} finally {
					isSaving.value = false;
				}
				return;
			}
			if (formMode.value === "edit" && editingId.value) {
				isSaving.value = true;
				try {
					const orig = editingOriginal.value;
					const payload = { user_id: editingId.value };
					if (form.firstName.trim() !== (orig?.firstName || "")) payload.first_name = form.firstName.trim();
					if (form.lastName.trim() !== (orig?.lastName || "")) payload.last_name = form.lastName.trim();
					if (form.mobile !== (orig?.mobile || "")) payload.phone_num = form.mobile;
					if (form.email !== (orig?.email || "")) payload.email = form.email || "";
					if (form.communityId !== (orig?.communityId || 0)) payload.community_id = form.communityId;
					if (form.title !== (orig?.title || "")) payload.title = form.title;
					if (form.address !== (orig?.address || "")) payload.address = form.address;
					if (form.description !== (orig?.description || "")) payload.description = form.description;
					if (form.active !== (orig?.active ?? true)) payload.is_active = form.active;
					if (JSON.stringify(form.roles) !== JSON.stringify(orig?.roles || [])) payload.roles = form.roles;
					if (JSON.stringify(form.certifications) !== JSON.stringify(orig?.certifications || [])) payload.certification_badges = form.certifications;
					if (form.picture !== (orig?.picture || "")) {
						if (!form.picture) payload.image = "";
						else if (form.picture.startsWith("data:")) payload.image = stripDataUrlPrefix(form.picture);
					}
					const response = await officerApi.updateOfficer(payload);
					if (response.rc === 0) {
						showFormModal.value = false;
						await fetchOfficers();
					} else if (response.rc === 520) {
						formErrors.title = response.message || t("officers.officer_not_found");
						showFormModal.value = false;
						await fetchOfficers();
					} else if (response.rc === 235) formErrors.email = response.message || t("validation.invalid_email");
					else if (response.rc === 240) formErrors.email = response.message || t("users.email_already_exists");
					else if (response.rc === 241) formErrors.mobile = response.message || t("validation.phone_already_exists");
					else if (response.rc === 504 || response.rc === 505) formErrors.community = response.message || t("officers.community_invalid");
					else if (response.rc === 521) formErrors.mobile = response.message || t("officers.officer_already_in_community");
					else formErrors.title = response.message || t("officers.update_failed");
				} catch (err) {
					console.error("Error updating officer:", err);
					formErrors.title = t("officers.update_failed");
				} finally {
					isSaving.value = false;
				}
			}
		}
		async function handleDelete() {
			if (!deleteTarget.value) return;
			isDeleting.value = true;
			try {
				const response = await officerApi.deleteOfficer(deleteTarget.value.id);
				if (response.rc === 0) {
					showDeleteModal.value = false;
					toastStore.success(t("officers.delete_success"));
					deleteTarget.value = null;
					await fetchOfficers();
				} else if (response.rc === 526) {
					showDeleteModal.value = false;
					showCannotDeleteModal.value = true;
				} else if (response.rc === 520) {
					showDeleteModal.value = false;
					toastStore.info(t("officers.officer_not_found"));
					deleteTarget.value = null;
					await fetchOfficers();
				} else {
					showDeleteModal.value = false;
					toastStore.error(response.message || t("officers.delete_failed"));
					deleteTarget.value = null;
				}
			} catch (err) {
				console.error("Error deleting officer:", err);
				toastStore.error(t("officers.delete_failed"));
				showDeleteModal.value = false;
			} finally {
				isDeleting.value = false;
			}
		}
		async function handleDeactivateFromDelete() {
			if (!deleteTarget.value) return;
			isDeactivating.value = true;
			try {
				const response = await officerApi.updateOfficer({
					user_id: deleteTarget.value.id,
					is_active: false
				});
				if (response.rc === 0) {
					showCannotDeleteModal.value = false;
					toastStore.success(t("officers.deactivate_success"));
					deleteTarget.value = null;
					await fetchOfficers();
				} else toastStore.error(response.message || t("officers.update_failed"));
			} catch (err) {
				console.error("Error deactivating officer:", err);
				toastStore.error(t("officers.update_failed"));
			} finally {
				isDeactivating.value = false;
			}
		}
		function toggleRole(role) {
			const idx = form.roles.indexOf(role);
			if (idx > -1) form.roles.splice(idx, 1);
			else form.roles.push(role);
		}
		function toggleCert(cert) {
			const idx = form.certifications.indexOf(cert);
			if (idx > -1) form.certifications.splice(idx, 1);
			else form.certifications.push(cert);
		}
		async function openEvaluationsTab() {
			if (!editingId.value) return;
			editTab.value = "evaluations";
			const officer = officers.value.find((o) => o.id === editingId.value);
			if (!officer) return;
			isLoadingEvals.value = true;
			try {
				const response = await officerApi.getOfficerEvaluations(editingId.value);
				if (response.rc === 0 && response.evaluations) officer.evaluations = response.evaluations.map((e) => ({
					evaluation_id: e.evaluation_id,
					text: e.text,
					date: e.date,
					evaluator_name: e.evaluator_name || ""
				}));
			} catch (err) {
				console.error("Error loading evaluations:", err);
			} finally {
				isLoadingEvals.value = false;
			}
		}
		function openInlineEvalForm() {
			inlineEvalForm.text = "";
			inlineEvalForm.date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
			inlineEvalError.value = "";
			showInlineEvalForm.value = true;
		}
		function cancelInlineEvalForm() {
			showInlineEvalForm.value = false;
			inlineEvalError.value = "";
		}
		function confirmDeleteEval(officerId, evaluationId) {
			if (!officerId) return;
			evalDeleteTarget.value = {
				officerId,
				evaluationId
			};
			showEvalDeleteModal.value = true;
		}
		async function submitInlineEvalForm() {
			if (!inlineEvalForm.text.trim()) {
				inlineEvalError.value = t("validation.required");
				return;
			}
			if (!editingId.value) return;
			isSavingEval.value = true;
			inlineEvalError.value = "";
			try {
				const response = await officerApi.addOfficerEvaluation({
					user_id: editingId.value,
					text: inlineEvalForm.text.trim(),
					date: inlineEvalForm.date
				});
				if (response.rc === 0) {
					showInlineEvalForm.value = false;
					toastStore.success(t("officers.eval_add_success"));
					const officer = officers.value.find((o) => o.id === editingId.value);
					if (officer && editingId.value) {
						isLoadingEvals.value = true;
						try {
							const evResponse = await officerApi.getOfficerEvaluations(editingId.value);
							if (evResponse.rc === 0 && evResponse.evaluations) officer.evaluations = evResponse.evaluations.map((e) => ({
								evaluation_id: e.evaluation_id,
								text: e.text,
								date: e.date,
								evaluator_name: e.evaluator_name || ""
							}));
						} finally {
							isLoadingEvals.value = false;
						}
					}
				} else if (response.rc === 520) inlineEvalError.value = t("officers.officer_not_found");
				else inlineEvalError.value = response.message || t("officers.eval_add_failed");
			} catch (err) {
				console.error("Error adding evaluation:", err);
				inlineEvalError.value = t("officers.eval_add_failed");
			} finally {
				isSavingEval.value = false;
			}
		}
		const evalList = computed(() => {
			if (!editingId.value) return [];
			return [...officers.value.find((o) => o.id === editingId.value)?.evaluations ?? []].sort((a, b) => b.date.localeCompare(a.date));
		});
		function formatEvalDate(dateStr) {
			if (!dateStr) return "";
			return new Date(dateStr).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric"
			});
		}
		async function handleDeleteEval() {
			if (!evalDeleteTarget.value) return;
			const { officerId, evaluationId } = evalDeleteTarget.value;
			showEvalDeleteModal.value = false;
			evalDeleteTarget.value = null;
			try {
				const response = await officerApi.deleteOfficerEvaluation(evaluationId);
				if (response.rc === 0 || response.rc === 527) {
					const officer = officers.value.find((o) => o.id === officerId);
					if (officer) officer.evaluations = officer.evaluations.filter((e) => e.evaluation_id !== evaluationId);
					if (response.rc === 527) toastStore.info(t("officers.eval_not_found"));
				}
			} catch (err) {
				console.error("Error deleting evaluation:", err);
			}
		}
		function getInitials(name) {
			return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppButton = AppButton_default;
			const _component_Icon = components_default;
			const _component_Badge = Badge_default;
			const _component_AppModal = AppModal_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "officers-management" }, _attrs))} data-v-a564222f><div class="page-header" data-v-a564222f><div class="header-left" data-v-a564222f><span class="total-count" data-v-a564222f>${ssrInterpolate(unref(t)("officers.total", { count: String(totalCount.value) }))}</span></div><div class="header-actions" data-v-a564222f>`);
			_push(ssrRenderComponent(_component_AppButton, {
				text: unref(t)("officers.add_officer"),
				type: "primary",
				icon: "lucide:plus",
				onClick: openAdd
			}, null, _parent));
			_push(`</div></div><div class="filters-bar" data-v-a564222f><div class="search-box" data-v-a564222f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:search",
				size: 14
			}, null, _parent));
			_push(`<input${ssrRenderAttr("value", searchQuery.value)} type="text"${ssrRenderAttr("placeholder", unref(t)("officers.search_placeholder"))} data-v-a564222f>`);
			if (isSearching.value) _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:loader-2",
				size: 14,
				class: "animate-spin search-spinner"
			}, null, _parent));
			else _push(`<!---->`);
			if (searchQuery.value) {
				_push(`<button class="search-clear-btn" data-v-a564222f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 12
				}, null, _parent));
				_push(`</button>`);
			} else _push(`<!---->`);
			_push(`</div>`);
			if (!props.communityName) {
				_push(`<select class="filter-select" data-v-a564222f><option value="all" data-v-a564222f${ssrIncludeBooleanAttr(Array.isArray(filterCommunity.value) ? ssrLooseContain(filterCommunity.value, "all") : ssrLooseEqual(filterCommunity.value, "all")) ? " selected" : ""}>${ssrInterpolate(unref(t)("officers.all_communities"))}</option><!--[-->`);
				ssrRenderList(communities.value, (c) => {
					_push(`<option${ssrRenderAttr("value", c.community_id)} data-v-a564222f${ssrIncludeBooleanAttr(Array.isArray(filterCommunity.value) ? ssrLooseContain(filterCommunity.value, c.community_id) : ssrLooseEqual(filterCommunity.value, c.community_id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
				});
				_push(`<!--]--></select>`);
			} else _push(`<!---->`);
			_push(`<div class="filter-toggle" data-v-a564222f><button class="${ssrRenderClass(["ftoggle-btn", { active: filterActive.value === "active" }])}" data-v-a564222f>${ssrInterpolate(unref(t)("common.active"))}</button><button class="${ssrRenderClass(["ftoggle-btn", { active: filterActive.value === "inactive" }])}" data-v-a564222f>${ssrInterpolate(unref(t)("common.inactive"))}</button><button class="${ssrRenderClass(["ftoggle-btn", { active: filterActive.value === "all" }])}" data-v-a564222f>${ssrInterpolate(unref(t)("officers.all"))}</button></div></div><div class="table-wrapper" data-v-a564222f><table class="data-table" data-v-a564222f><thead data-v-a564222f><tr data-v-a564222f><th class="${ssrRenderClass([{ "th--sorted": sortBy.value === "first_name" || sortBy.value === "last_name" }, "sortable"])}" data-v-a564222f><span class="th-content" data-v-a564222f>${ssrInterpolate(unref(t)("officers.full_name"))} `);
			if (sortBy.value === "first_name") _push(ssrRenderComponent(_component_Icon, {
				name: sortDir.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 12
			}, null, _parent));
			else _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevrons-up-down",
				size: 12,
				class: "th-sort-idle"
			}, null, _parent));
			_push(`</span></th>`);
			if (!props.communityName) {
				_push(`<th class="${ssrRenderClass([{ "th--sorted": sortBy.value === "community" }, "sortable"])}" data-v-a564222f><span class="th-content" data-v-a564222f>${ssrInterpolate(unref(t)("officers.community"))} `);
				if (sortBy.value === "community") _push(ssrRenderComponent(_component_Icon, {
					name: sortDir.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
					size: 12
				}, null, _parent));
				else _push(ssrRenderComponent(_component_Icon, {
					name: "lucide:chevrons-up-down",
					size: 12,
					class: "th-sort-idle"
				}, null, _parent));
				_push(`</span></th>`);
			} else _push(`<!---->`);
			_push(`<th data-v-a564222f>${ssrInterpolate(unref(t)("officers.mobile"))}</th><th data-v-a564222f>${ssrInterpolate(unref(t)("officers.title"))}</th><th data-v-a564222f>${ssrInterpolate(unref(t)("officers.roles"))}</th><th data-v-a564222f>${ssrInterpolate(unref(t)("officers.certifications"))}</th><th class="${ssrRenderClass([{ "th--sorted": sortBy.value === "created_on" }, "sortable"])}" data-v-a564222f><span class="th-content" data-v-a564222f>${ssrInterpolate(unref(t)("officers.reg_date"))} `);
			if (sortBy.value === "created_on") _push(ssrRenderComponent(_component_Icon, {
				name: sortDir.value === "asc" ? "lucide:chevron-up" : "lucide:chevron-down",
				size: 12
			}, null, _parent));
			else _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevrons-up-down",
				size: 12,
				class: "th-sort-idle"
			}, null, _parent));
			_push(`</span></th><th data-v-a564222f>${ssrInterpolate(unref(t)("officers.active"))}</th><th data-v-a564222f>${ssrInterpolate(unref(t)("officers.actions"))}</th></tr></thead><tbody data-v-a564222f>`);
			if (isLoadingOfficers.value) {
				_push(`<tr data-v-a564222f><td colspan="9" class="empty-row" data-v-a564222f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 16,
					class: "animate-spin"
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("common.loading"))}</td></tr>`);
			} else if (loadError.value) _push(`<tr data-v-a564222f><td colspan="9" class="empty-row error-row" data-v-a564222f>${ssrInterpolate(loadError.value)} <button class="retry-btn" data-v-a564222f>${ssrInterpolate(unref(t)("common.retry"))}</button></td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(filteredOfficers.value, (officer) => {
				_push(`<tr class="${ssrRenderClass({ "row--inactive": !officer.active })}" data-v-a564222f><td data-v-a564222f><div class="officer-name-cell" data-v-a564222f>`);
				if (officer.picture) _push(`<div class="avatar" data-v-a564222f><img${ssrRenderAttr("src", officer.picture)}${ssrRenderAttr("alt", officer.fullName)} data-v-a564222f></div>`);
				else _push(`<div class="avatar avatar--initials" data-v-a564222f>${ssrInterpolate(getInitials(officer.fullName))}</div>`);
				_push(`<div data-v-a564222f><div class="name-primary" data-v-a564222f>${ssrInterpolate(officer.fullName)}</div><div class="name-secondary" data-v-a564222f>${ssrInterpolate(officer.email || "—")}</div></div></div></td>`);
				if (!props.communityName) _push(`<td data-v-a564222f>${ssrInterpolate(officer.community)}</td>`);
				else _push(`<!---->`);
				_push(`<td class="mono-cell" data-v-a564222f>${ssrInterpolate(officer.mobile)}</td><td data-v-a564222f>${ssrInterpolate(officer.title)}</td><td data-v-a564222f><div class="tags-cell" data-v-a564222f><!--[-->`);
				ssrRenderList(officer.roles, (role) => {
					_push(ssrRenderComponent(_component_Badge, {
						key: role,
						type: "officerRole",
						value: role
					}, null, _parent));
				});
				_push(`<!--]-->`);
				if (!officer.roles.length) _push(`<span class="muted" data-v-a564222f>—</span>`);
				else _push(`<!---->`);
				_push(`</div></td><td data-v-a564222f><div class="tags-cell" data-v-a564222f><!--[-->`);
				ssrRenderList(officer.certifications, (cert) => {
					_push(ssrRenderComponent(_component_Badge, {
						key: cert,
						type: "officerCert",
						value: cert
					}, null, _parent));
				});
				_push(`<!--]-->`);
				if (!officer.certifications.length) _push(`<span class="muted" data-v-a564222f>—</span>`);
				else _push(`<!---->`);
				_push(`</div></td><td class="muted" data-v-a564222f>${ssrInterpolate(officer.registrationDate)}</td><td data-v-a564222f><div class="tags-cell" data-v-a564222f>`);
				_push(ssrRenderComponent(_component_Badge, {
					type: "status",
					value: officer.active ? "active" : "inactive"
				}, null, _parent));
				if (officer.lastLogin === null) _push(`<span class="badge-pending-login" data-v-a564222f>Not yet logged in</span>`);
				else _push(`<!---->`);
				_push(`</div></td><td data-v-a564222f><div class="action-group" data-v-a564222f><button class="action-btn"${ssrRenderAttr("title", unref(t)("common.view"))} data-v-a564222f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:eye",
					size: 14
				}, null, _parent));
				_push(`</button><button class="action-btn"${ssrRenderAttr("title", unref(t)("common.edit"))} data-v-a564222f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:pencil",
					size: 14
				}, null, _parent));
				_push(`</button><button class="action-btn action-btn--danger"${ssrRenderAttr("title", unref(t)("common.delete"))} data-v-a564222f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:trash-2",
					size: 14
				}, null, _parent));
				_push(`</button></div></td></tr>`);
			});
			_push(`<!--]-->`);
			if (!isLoadingOfficers.value && !loadError.value && !filteredOfficers.value.length) _push(`<tr data-v-a564222f><td colspan="9" class="empty-row" data-v-a564222f>${ssrInterpolate(unref(t)("officers.no_officers"))}</td></tr>`);
			else _push(`<!---->`);
			_push(`</tbody></table></div>`);
			_push(ssrRenderComponent(_component_AppModal, {
				show: showFormModal.value,
				title: formMode.value === "add" ? unref(t)("officers.add_title") : unref(t)("officers.edit_title"),
				"cancel-text": editTab.value === "evaluations" ? "" : unref(t)("common.cancel"),
				"ok-text": editTab.value === "evaluations" ? unref(t)("common.close") : unref(t)("common.save"),
				"ok-disabled": editTab.value === "details" && (isSaving.value || !isFormHasChanged.value),
				"max-width": "50vw",
				onClose: ($event) => showFormModal.value = false,
				onCancel: ($event) => showFormModal.value = false,
				onOk: ($event) => editTab.value === "evaluations" ? showFormModal.value = false : handleSave()
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="officer-form" data-v-a564222f${_scopeId}>`);
						if (formMode.value === "edit") {
							_push(`<div class="modal-tab-bar" data-v-a564222f${_scopeId}><button class="${ssrRenderClass(["modal-tab-btn", { "modal-tab-btn--active": editTab.value === "details" }])}" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.tab_details"))}</button><button class="${ssrRenderClass(["modal-tab-btn", { "modal-tab-btn--active": editTab.value === "evaluations" }])}" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.tab_evaluations"))} `);
							if (evalList.value.length) _push(`<span class="modal-tab-badge" data-v-a564222f${_scopeId}>${ssrInterpolate(evalList.value.length)}</span>`);
							else _push(`<!---->`);
							_push(`</button></div>`);
						} else _push(`<!---->`);
						if (formMode.value === "add" || editTab.value === "details") {
							_push(`<!--[--><div class="form-row-photo-name" data-v-a564222f${_scopeId}><div class="photo-col" data-v-a564222f${_scopeId}>`);
							_push(ssrRenderComponent(ImageUpload_default, {
								modelValue: form.picture,
								"onUpdate:modelValue": ($event) => form.picture = $event,
								label: unref(t)("officers.photo"),
								"auto-upload": false,
								"preview-size": 100
							}, null, _parent, _scopeId));
							_push(`</div><div class="name-community-col" data-v-a564222f${_scopeId}><div class="form-row-2col" data-v-a564222f${_scopeId}><div class="${ssrRenderClass([{ error: formErrors.firstName }, "form-field"])}" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.first_name"))} <span class="required" data-v-a564222f${_scopeId}>*</span></label><input${ssrRenderAttr("value", form.firstName)} type="text" class="field-input"${ssrRenderAttr("placeholder", unref(t)("officers.first_name_placeholder"))} data-v-a564222f${_scopeId}>`);
							if (formErrors.firstName) _push(`<span class="error-msg" data-v-a564222f${_scopeId}>${ssrInterpolate(formErrors.firstName)}</span>`);
							else _push(`<!---->`);
							_push(`</div><div class="form-field" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.last_name"))}</label><input${ssrRenderAttr("value", form.lastName)} type="text" class="field-input"${ssrRenderAttr("placeholder", unref(t)("officers.last_name_placeholder"))} data-v-a564222f${_scopeId}></div></div><div class="${ssrRenderClass([{ error: formErrors.community }, "form-field"])}" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.community"))} <span class="required" data-v-a564222f${_scopeId}>*</span></label><select class="field-select"${ssrIncludeBooleanAttr(isLoadingCommunities.value) ? " disabled" : ""} data-v-a564222f${_scopeId}><option${ssrRenderAttr("value", 0)} disabled data-v-a564222f${ssrIncludeBooleanAttr(Array.isArray(form.communityId) ? ssrLooseContain(form.communityId, 0) : ssrLooseEqual(form.communityId, 0)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(isLoadingCommunities.value ? unref(t)("officers.loading_communities") : unref(t)("officers.select_community"))}</option><!--[-->`);
							ssrRenderList(communities.value, (c) => {
								_push(`<option${ssrRenderAttr("value", c.community_id)} data-v-a564222f${ssrIncludeBooleanAttr(Array.isArray(form.communityId) ? ssrLooseContain(form.communityId, c.community_id) : ssrLooseEqual(form.communityId, c.community_id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(c.name)}</option>`);
							});
							_push(`<!--]--></select>`);
							if (formErrors.community) _push(`<span class="error-msg" data-v-a564222f${_scopeId}>${ssrInterpolate(formErrors.community)}</span>`);
							else _push(`<!---->`);
							_push(`</div></div></div><div class="form-row-2col" data-v-a564222f${_scopeId}><div class="${ssrRenderClass([{ error: formErrors.mobile }, "form-field"])}" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.mobile"))} <span class="required" data-v-a564222f${_scopeId}>*</span></label><input${ssrRenderAttr("value", form.mobile)} type="tel" class="field-input"${ssrRenderAttr("placeholder", unref(t)("officers.mobile_placeholder"))} data-v-a564222f${_scopeId}>`);
							if (formErrors.mobile) _push(`<span class="error-msg" data-v-a564222f${_scopeId}>${ssrInterpolate(formErrors.mobile)}</span>`);
							else _push(`<!---->`);
							if (phoneChanged.value) {
								_push(`<div class="phone-change-warning" data-v-a564222f${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:alert-triangle",
									size: 14,
									class: "phone-change-warning__icon"
								}, null, _parent, _scopeId));
								_push(`<span data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.phone_change_warning"))}</span></div>`);
							} else _push(`<!---->`);
							_push(`</div><div class="${ssrRenderClass([{ error: formErrors.title }, "form-field"])}" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.title"))} <span class="required" data-v-a564222f${_scopeId}>*</span></label><input${ssrRenderAttr("value", form.title)} type="text" class="field-input"${ssrRenderAttr("placeholder", unref(t)("officers.title_placeholder"))} data-v-a564222f${_scopeId}>`);
							if (formErrors.title) _push(`<span class="error-msg" data-v-a564222f${_scopeId}>${ssrInterpolate(formErrors.title)}</span>`);
							else _push(`<!---->`);
							_push(`</div></div><div class="form-row-2col" data-v-a564222f${_scopeId}><div class="form-field" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.email"))}</label><input${ssrRenderAttr("value", form.email)} type="email" class="field-input"${ssrRenderAttr("placeholder", unref(t)("officers.email_placeholder"))} data-v-a564222f${_scopeId}></div><div class="form-field" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.address"))}</label><input${ssrRenderAttr("value", form.address)} type="text" class="field-input"${ssrRenderAttr("placeholder", unref(t)("officers.address_placeholder"))} data-v-a564222f${_scopeId}></div></div><div class="form-field" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.description"))}</label><textarea class="field-textarea" rows="2"${ssrRenderAttr("placeholder", unref(t)("officers.description_placeholder"))} data-v-a564222f${_scopeId}>${ssrInterpolate(form.description)}</textarea></div><div class="form-field" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.roles"))}</label><div class="checkbox-group" data-v-a564222f${_scopeId}><!--[-->`);
							ssrRenderList(ROLES, (role) => {
								_push(`<label class="checkbox-item" data-v-a564222f${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(form.roles.includes(role)) ? " checked" : ""} data-v-a564222f${_scopeId}><span data-v-a564222f${_scopeId}>${ssrInterpolate(role)}</span></label>`);
							});
							_push(`<!--]--></div></div><div class="form-field" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.certifications"))}</label><div class="checkbox-group" data-v-a564222f${_scopeId}><!--[-->`);
							ssrRenderList(CERTIFICATIONS, (cert) => {
								_push(`<label class="checkbox-item" data-v-a564222f${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(form.certifications.includes(cert)) ? " checked" : ""} data-v-a564222f${_scopeId}><span data-v-a564222f${_scopeId}>${ssrInterpolate(cert)}</span></label>`);
							});
							_push(`<!--]--></div></div>`);
							if (formMode.value === "edit") {
								_push(`<div class="form-field" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.active"))}</label><label class="toggle-label" data-v-a564222f${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(form.active) ? ssrLooseContain(form.active, null) : form.active) ? " checked" : ""} type="checkbox" data-v-a564222f${_scopeId}><span data-v-a564222f${_scopeId}>${ssrInterpolate(form.active ? unref(t)("common.active") : unref(t)("common.inactive"))}</span></label>`);
								if (deactivateWarning.value) {
									_push(`<div class="phone-change-warning" data-v-a564222f${_scopeId}>`);
									_push(ssrRenderComponent(_component_Icon, {
										name: "lucide:alert-triangle",
										size: 14,
										class: "phone-change-warning__icon"
									}, null, _parent, _scopeId));
									_push(`<span data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.deactivate_warning"))}</span></div>`);
								} else _push(`<!---->`);
								_push(`</div>`);
							} else _push(`<!---->`);
							_push(`<!--]-->`);
						} else _push(`<!---->`);
						if (formMode.value === "edit" && editingId.value && editTab.value === "evaluations") {
							_push(`<div class="eval-section eval-section--tab" data-v-a564222f${_scopeId}><div class="eval-header" data-v-a564222f${_scopeId}><span class="eval-title" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.evaluations"))}</span>`);
							if (!showInlineEvalForm.value) {
								_push(`<button class="eval-add-btn" data-v-a564222f${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:plus",
									size: 12
								}, null, _parent, _scopeId));
								_push(` ${ssrInterpolate(unref(t)("officers.add_evaluation"))}</button>`);
							} else _push(`<!---->`);
							_push(`</div>`);
							if (isLoadingEvals.value) {
								_push(`<div class="eval-loading" data-v-a564222f${_scopeId}>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:loader-2",
									size: 18,
									class: "eval-loading__spinner"
								}, null, _parent, _scopeId));
								_push(`<span data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("common.loading"))}</span></div>`);
							} else _push(`<!---->`);
							if (!isLoadingEvals.value && showInlineEvalForm.value) {
								_push(`<div class="eval-inline-form" data-v-a564222f${_scopeId}><div class="${ssrRenderClass([{ error: inlineEvalError.value }, "form-field"])}" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.eval_text"))} <span class="required" data-v-a564222f${_scopeId}>*</span></label><textarea class="field-textarea" rows="3"${ssrRenderAttr("placeholder", unref(t)("officers.eval_text_placeholder"))} data-v-a564222f${_scopeId}>${ssrInterpolate(inlineEvalForm.text)}</textarea>`);
								if (inlineEvalError.value) _push(`<span class="error-msg" data-v-a564222f${_scopeId}>${ssrInterpolate(inlineEvalError.value)}</span>`);
								else _push(`<!---->`);
								_push(`</div><div class="form-field" data-v-a564222f${_scopeId}><label class="field-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.eval_date"))}</label><input${ssrRenderAttr("value", inlineEvalForm.date)} type="date" class="field-input" data-v-a564222f${_scopeId}></div><div class="eval-inline-actions" data-v-a564222f${_scopeId}><button class="btn-secondary-sm"${ssrIncludeBooleanAttr(isSavingEval.value) ? " disabled" : ""} data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn-primary-sm"${ssrIncludeBooleanAttr(isSavingEval.value) ? " disabled" : ""} data-v-a564222f${_scopeId}>${ssrInterpolate(isSavingEval.value ? unref(t)("common.saving") : unref(t)("common.save"))}</button></div></div>`);
							} else _push(`<!---->`);
							if (!isLoadingEvals.value && evalList.value.length) {
								_push(`<div class="eval-list" data-v-a564222f${_scopeId}><!--[-->`);
								ssrRenderList(evalList.value, (ev) => {
									_push(`<div class="eval-item" data-v-a564222f${_scopeId}><div class="eval-meta" data-v-a564222f${_scopeId}><span class="eval-date" data-v-a564222f${_scopeId}>${ssrInterpolate(formatEvalDate(ev.date))}</span><div class="eval-meta-right" data-v-a564222f${_scopeId}><span class="eval-evaluator" data-v-a564222f${_scopeId}>by ${ssrInterpolate(ev.evaluator_name || unref(t)("officers.unknown"))}</span><button class="eval-delete-btn"${ssrRenderAttr("title", unref(t)("common.delete"))} data-v-a564222f${_scopeId}>`);
									_push(ssrRenderComponent(_component_Icon, {
										name: "lucide:trash-2",
										size: 13
									}, null, _parent, _scopeId));
									_push(`</button></div></div><p class="eval-text" data-v-a564222f${_scopeId}>${ssrInterpolate(ev.text)}</p></div>`);
								});
								_push(`<!--]--></div>`);
							} else if (!isLoadingEvals.value && !showInlineEvalForm.value) _push(`<p class="eval-empty" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.no_evaluations"))}</p>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "officer-form" }, [
						formMode.value === "edit" ? (openBlock(), createBlock("div", {
							key: 0,
							class: "modal-tab-bar"
						}, [createVNode("button", {
							class: ["modal-tab-btn", { "modal-tab-btn--active": editTab.value === "details" }],
							onClick: ($event) => editTab.value = "details"
						}, toDisplayString(unref(t)("officers.tab_details")), 11, ["onClick"]), createVNode("button", {
							class: ["modal-tab-btn", { "modal-tab-btn--active": editTab.value === "evaluations" }],
							onClick: openEvaluationsTab
						}, [createTextVNode(toDisplayString(unref(t)("officers.tab_evaluations")) + " ", 1), evalList.value.length ? (openBlock(), createBlock("span", {
							key: 0,
							class: "modal-tab-badge"
						}, toDisplayString(evalList.value.length), 1)) : createCommentVNode("", true)], 2)])) : createCommentVNode("", true),
						formMode.value === "add" || editTab.value === "details" ? (openBlock(), createBlock(Fragment, { key: 1 }, [
							createVNode("div", { class: "form-row-photo-name" }, [createVNode("div", { class: "photo-col" }, [createVNode(ImageUpload_default, {
								modelValue: form.picture,
								"onUpdate:modelValue": ($event) => form.picture = $event,
								label: unref(t)("officers.photo"),
								"auto-upload": false,
								"preview-size": 100
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"label"
							])]), createVNode("div", { class: "name-community-col" }, [createVNode("div", { class: "form-row-2col" }, [createVNode("div", { class: ["form-field", { error: formErrors.firstName }] }, [
								createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(unref(t)("officers.first_name")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.firstName = $event,
									type: "text",
									class: "field-input",
									placeholder: unref(t)("officers.first_name_placeholder")
								}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.firstName]]),
								formErrors.firstName ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-msg"
								}, toDisplayString(formErrors.firstName), 1)) : createCommentVNode("", true)
							], 2), createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("officers.last_name")), 1), withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => form.lastName = $event,
								type: "text",
								class: "field-input",
								placeholder: unref(t)("officers.last_name_placeholder")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.lastName]])])]), createVNode("div", { class: ["form-field", { error: formErrors.community }] }, [
								createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(unref(t)("officers.community")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
								withDirectives(createVNode("select", {
									"onUpdate:modelValue": ($event) => form.communityId = $event,
									class: "field-select",
									disabled: isLoadingCommunities.value
								}, [createVNode("option", {
									value: 0,
									disabled: ""
								}, toDisplayString(isLoadingCommunities.value ? unref(t)("officers.loading_communities") : unref(t)("officers.select_community")), 1), (openBlock(true), createBlock(Fragment, null, renderList(communities.value, (c) => {
									return openBlock(), createBlock("option", {
										key: c.community_id,
										value: c.community_id
									}, toDisplayString(c.name), 9, ["value"]);
								}), 128))], 8, ["onUpdate:modelValue", "disabled"]), [[vModelSelect, form.communityId]]),
								formErrors.community ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-msg"
								}, toDisplayString(formErrors.community), 1)) : createCommentVNode("", true)
							], 2)])]),
							createVNode("div", { class: "form-row-2col" }, [createVNode("div", { class: ["form-field", { error: formErrors.mobile }] }, [
								createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(unref(t)("officers.mobile")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.mobile = $event,
									type: "tel",
									class: "field-input",
									placeholder: unref(t)("officers.mobile_placeholder")
								}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.mobile]]),
								formErrors.mobile ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-msg"
								}, toDisplayString(formErrors.mobile), 1)) : createCommentVNode("", true),
								phoneChanged.value ? (openBlock(), createBlock("div", {
									key: 1,
									class: "phone-change-warning"
								}, [createVNode(_component_Icon, {
									name: "lucide:alert-triangle",
									size: 14,
									class: "phone-change-warning__icon"
								}), createVNode("span", null, toDisplayString(unref(t)("officers.phone_change_warning")), 1)])) : createCommentVNode("", true)
							], 2), createVNode("div", { class: ["form-field", { error: formErrors.title }] }, [
								createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(unref(t)("officers.title")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.title = $event,
									type: "text",
									class: "field-input",
									placeholder: unref(t)("officers.title_placeholder")
								}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.title]]),
								formErrors.title ? (openBlock(), createBlock("span", {
									key: 0,
									class: "error-msg"
								}, toDisplayString(formErrors.title), 1)) : createCommentVNode("", true)
							], 2)]),
							createVNode("div", { class: "form-row-2col" }, [createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("officers.email")), 1), withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => form.email = $event,
								type: "email",
								class: "field-input",
								placeholder: unref(t)("officers.email_placeholder")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.email]])]), createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("officers.address")), 1), withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => form.address = $event,
								type: "text",
								class: "field-input",
								placeholder: unref(t)("officers.address_placeholder")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.address]])])]),
							createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("officers.description")), 1), withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => form.description = $event,
								class: "field-textarea",
								rows: "2",
								placeholder: unref(t)("officers.description_placeholder")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, form.description]])]),
							createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("officers.roles")), 1), createVNode("div", { class: "checkbox-group" }, [(openBlock(), createBlock(Fragment, null, renderList(ROLES, (role) => {
								return createVNode("label", {
									key: role,
									class: "checkbox-item"
								}, [createVNode("input", {
									type: "checkbox",
									checked: form.roles.includes(role),
									onChange: ($event) => toggleRole(role)
								}, null, 40, ["checked", "onChange"]), createVNode("span", null, toDisplayString(role), 1)]);
							}), 64))])]),
							createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("officers.certifications")), 1), createVNode("div", { class: "checkbox-group" }, [(openBlock(), createBlock(Fragment, null, renderList(CERTIFICATIONS, (cert) => {
								return createVNode("label", {
									key: cert,
									class: "checkbox-item"
								}, [createVNode("input", {
									type: "checkbox",
									checked: form.certifications.includes(cert),
									onChange: ($event) => toggleCert(cert)
								}, null, 40, ["checked", "onChange"]), createVNode("span", null, toDisplayString(cert), 1)]);
							}), 64))])]),
							formMode.value === "edit" ? (openBlock(), createBlock("div", {
								key: 0,
								class: "form-field"
							}, [
								createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("officers.active")), 1),
								createVNode("label", { class: "toggle-label" }, [withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => form.active = $event,
									type: "checkbox"
								}, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, form.active]]), createVNode("span", null, toDisplayString(form.active ? unref(t)("common.active") : unref(t)("common.inactive")), 1)]),
								deactivateWarning.value ? (openBlock(), createBlock("div", {
									key: 0,
									class: "phone-change-warning"
								}, [createVNode(_component_Icon, {
									name: "lucide:alert-triangle",
									size: 14,
									class: "phone-change-warning__icon"
								}), createVNode("span", null, toDisplayString(unref(t)("officers.deactivate_warning")), 1)])) : createCommentVNode("", true)
							])) : createCommentVNode("", true)
						], 64)) : createCommentVNode("", true),
						formMode.value === "edit" && editingId.value && editTab.value === "evaluations" ? (openBlock(), createBlock("div", {
							key: 2,
							class: "eval-section eval-section--tab"
						}, [
							createVNode("div", { class: "eval-header" }, [createVNode("span", { class: "eval-title" }, toDisplayString(unref(t)("officers.evaluations")), 1), !showInlineEvalForm.value ? (openBlock(), createBlock("button", {
								key: 0,
								class: "eval-add-btn",
								onClick: openInlineEvalForm
							}, [createVNode(_component_Icon, {
								name: "lucide:plus",
								size: 12
							}), createTextVNode(" " + toDisplayString(unref(t)("officers.add_evaluation")), 1)])) : createCommentVNode("", true)]),
							isLoadingEvals.value ? (openBlock(), createBlock("div", {
								key: 0,
								class: "eval-loading"
							}, [createVNode(_component_Icon, {
								name: "lucide:loader-2",
								size: 18,
								class: "eval-loading__spinner"
							}), createVNode("span", null, toDisplayString(unref(t)("common.loading")), 1)])) : createCommentVNode("", true),
							!isLoadingEvals.value && showInlineEvalForm.value ? (openBlock(), createBlock("div", {
								key: 1,
								class: "eval-inline-form"
							}, [
								createVNode("div", { class: ["form-field", { error: inlineEvalError.value }] }, [
									createVNode("label", { class: "field-label" }, [createTextVNode(toDisplayString(unref(t)("officers.eval_text")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
									withDirectives(createVNode("textarea", {
										"onUpdate:modelValue": ($event) => inlineEvalForm.text = $event,
										class: "field-textarea",
										rows: "3",
										placeholder: unref(t)("officers.eval_text_placeholder")
									}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, inlineEvalForm.text]]),
									inlineEvalError.value ? (openBlock(), createBlock("span", {
										key: 0,
										class: "error-msg"
									}, toDisplayString(inlineEvalError.value), 1)) : createCommentVNode("", true)
								], 2),
								createVNode("div", { class: "form-field" }, [createVNode("label", { class: "field-label" }, toDisplayString(unref(t)("officers.eval_date")), 1), withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => inlineEvalForm.date = $event,
									type: "date",
									class: "field-input"
								}, null, 8, ["onUpdate:modelValue"]), [[vModelText, inlineEvalForm.date]])]),
								createVNode("div", { class: "eval-inline-actions" }, [createVNode("button", {
									class: "btn-secondary-sm",
									disabled: isSavingEval.value,
									onClick: cancelInlineEvalForm
								}, toDisplayString(unref(t)("common.cancel")), 9, ["disabled"]), createVNode("button", {
									class: "btn-primary-sm",
									disabled: isSavingEval.value,
									onClick: submitInlineEvalForm
								}, toDisplayString(isSavingEval.value ? unref(t)("common.saving") : unref(t)("common.save")), 9, ["disabled"])])
							])) : createCommentVNode("", true),
							!isLoadingEvals.value && evalList.value.length ? (openBlock(), createBlock("div", {
								key: 2,
								class: "eval-list"
							}, [(openBlock(true), createBlock(Fragment, null, renderList(evalList.value, (ev) => {
								return openBlock(), createBlock("div", {
									key: ev.evaluation_id,
									class: "eval-item"
								}, [createVNode("div", { class: "eval-meta" }, [createVNode("span", { class: "eval-date" }, toDisplayString(formatEvalDate(ev.date)), 1), createVNode("div", { class: "eval-meta-right" }, [createVNode("span", { class: "eval-evaluator" }, "by " + toDisplayString(ev.evaluator_name || unref(t)("officers.unknown")), 1), createVNode("button", {
									class: "eval-delete-btn",
									title: unref(t)("common.delete"),
									onClick: ($event) => confirmDeleteEval(editingId.value, ev.evaluation_id)
								}, [createVNode(_component_Icon, {
									name: "lucide:trash-2",
									size: 13
								})], 8, ["title", "onClick"])])]), createVNode("p", { class: "eval-text" }, toDisplayString(ev.text), 1)]);
							}), 128))])) : !isLoadingEvals.value && !showInlineEvalForm.value ? (openBlock(), createBlock("p", {
								key: 3,
								class: "eval-empty"
							}, toDisplayString(unref(t)("officers.no_evaluations")), 1)) : createCommentVNode("", true)
						])) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
			if (detailOfficer.value) _push(ssrRenderComponent(_component_AppModal, {
				show: showDetailModal.value,
				title: detailOfficer.value.fullName,
				"cancel-text": unref(t)("common.close"),
				"ok-text": "",
				onClose: ($event) => showDetailModal.value = false,
				onCancel: ($event) => showDetailModal.value = false
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="detail-view" data-v-a564222f${_scopeId}><div class="detail-header" data-v-a564222f${_scopeId}><div class="detail-avatar" data-v-a564222f${_scopeId}>`);
						if (detailOfficer.value.picture) _push(`<div class="avatar avatar--lg" data-v-a564222f${_scopeId}><img${ssrRenderAttr("src", detailOfficer.value.picture)}${ssrRenderAttr("alt", detailOfficer.value.fullName)} data-v-a564222f${_scopeId}></div>`);
						else _push(`<div class="avatar avatar--lg avatar--initials" data-v-a564222f${_scopeId}>${ssrInterpolate(getInitials(detailOfficer.value.fullName))}</div>`);
						_push(`</div><div class="detail-header-info" data-v-a564222f${_scopeId}><p class="detail-title-text" data-v-a564222f${_scopeId}>${ssrInterpolate(detailOfficer.value.title)}</p><p class="detail-community" data-v-a564222f${_scopeId}>${ssrInterpolate(detailOfficer.value.community)}</p>`);
						_push(ssrRenderComponent(_component_Badge, {
							type: "status",
							value: detailOfficer.value.active ? "active" : "inactive"
						}, null, _parent, _scopeId));
						_push(`</div></div><div class="detail-grid" data-v-a564222f${_scopeId}><div class="detail-row" data-v-a564222f${_scopeId}><span class="detail-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.mobile"))}</span><span class="detail-value mono" data-v-a564222f${_scopeId}>${ssrInterpolate(detailOfficer.value.mobile)}</span></div><div class="detail-row" data-v-a564222f${_scopeId}><span class="detail-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.email"))}</span><span class="detail-value" data-v-a564222f${_scopeId}>${ssrInterpolate(detailOfficer.value.email || "—")}</span></div><div class="detail-row" data-v-a564222f${_scopeId}><span class="detail-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.address"))}</span><span class="detail-value" data-v-a564222f${_scopeId}>${ssrInterpolate(detailOfficer.value.address || "—")}</span></div><div class="detail-row" data-v-a564222f${_scopeId}><span class="detail-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.reg_date"))}</span><span class="detail-value mono" data-v-a564222f${_scopeId}>${ssrInterpolate(detailOfficer.value.registrationDate)}</span></div><div class="detail-row detail-row--full" data-v-a564222f${_scopeId}><span class="detail-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.roles"))}</span><div class="tags-cell" data-v-a564222f${_scopeId}><!--[-->`);
						ssrRenderList(detailOfficer.value.roles, (r) => {
							_push(ssrRenderComponent(_component_Badge, {
								key: r,
								type: "officerRole",
								value: r
							}, null, _parent, _scopeId));
						});
						_push(`<!--]-->`);
						if (!detailOfficer.value.roles.length) _push(`<span class="muted" data-v-a564222f${_scopeId}>—</span>`);
						else _push(`<!---->`);
						_push(`</div></div><div class="detail-row detail-row--full" data-v-a564222f${_scopeId}><span class="detail-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.certifications"))}</span><div class="tags-cell" data-v-a564222f${_scopeId}><!--[-->`);
						ssrRenderList(detailOfficer.value.certifications, (c) => {
							_push(ssrRenderComponent(_component_Badge, {
								key: c,
								type: "officerCert",
								value: c
							}, null, _parent, _scopeId));
						});
						_push(`<!--]-->`);
						if (!detailOfficer.value.certifications.length) _push(`<span class="muted" data-v-a564222f${_scopeId}>—</span>`);
						else _push(`<!---->`);
						_push(`</div></div>`);
						if (detailOfficer.value.description) _push(`<div class="detail-row detail-row--full" data-v-a564222f${_scopeId}><span class="detail-label" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.description"))}</span><span class="detail-value" data-v-a564222f${_scopeId}>${ssrInterpolate(detailOfficer.value.description)}</span></div>`);
						else _push(`<!---->`);
						_push(`</div><div class="eval-section" data-v-a564222f${_scopeId}><div class="eval-header" data-v-a564222f${_scopeId}><span class="eval-title" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.evaluations"))}</span></div>`);
						if (detailOfficer.value.evaluations.length) {
							_push(`<div class="eval-list" data-v-a564222f${_scopeId}><!--[-->`);
							ssrRenderList(detailOfficer.value.evaluations, (ev, idx) => {
								_push(`<div class="eval-item" data-v-a564222f${_scopeId}><div class="eval-meta" data-v-a564222f${_scopeId}><span class="eval-date" data-v-a564222f${_scopeId}>${ssrInterpolate(formatEvalDate(ev.date))}</span><span class="eval-evaluator" data-v-a564222f${_scopeId}>by ${ssrInterpolate(ev.evaluator_name || unref(t)("officers.unknown"))}</span></div><p class="eval-text" data-v-a564222f${_scopeId}>${ssrInterpolate(ev.text)}</p></div>`);
							});
							_push(`<!--]--></div>`);
						} else _push(`<p class="eval-empty" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.no_evaluations"))}</p>`);
						_push(`</div></div>`);
					} else return [createVNode("div", { class: "detail-view" }, [
						createVNode("div", { class: "detail-header" }, [createVNode("div", { class: "detail-avatar" }, [detailOfficer.value.picture ? (openBlock(), createBlock("div", {
							key: 0,
							class: "avatar avatar--lg"
						}, [createVNode("img", {
							src: detailOfficer.value.picture,
							alt: detailOfficer.value.fullName
						}, null, 8, ["src", "alt"])])) : (openBlock(), createBlock("div", {
							key: 1,
							class: "avatar avatar--lg avatar--initials"
						}, toDisplayString(getInitials(detailOfficer.value.fullName)), 1))]), createVNode("div", { class: "detail-header-info" }, [
							createVNode("p", { class: "detail-title-text" }, toDisplayString(detailOfficer.value.title), 1),
							createVNode("p", { class: "detail-community" }, toDisplayString(detailOfficer.value.community), 1),
							createVNode(_component_Badge, {
								type: "status",
								value: detailOfficer.value.active ? "active" : "inactive"
							}, null, 8, ["value"])
						])]),
						createVNode("div", { class: "detail-grid" }, [
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("officers.mobile")), 1), createVNode("span", { class: "detail-value mono" }, toDisplayString(detailOfficer.value.mobile), 1)]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("officers.email")), 1), createVNode("span", { class: "detail-value" }, toDisplayString(detailOfficer.value.email || "—"), 1)]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("officers.address")), 1), createVNode("span", { class: "detail-value" }, toDisplayString(detailOfficer.value.address || "—"), 1)]),
							createVNode("div", { class: "detail-row" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("officers.reg_date")), 1), createVNode("span", { class: "detail-value mono" }, toDisplayString(detailOfficer.value.registrationDate), 1)]),
							createVNode("div", { class: "detail-row detail-row--full" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("officers.roles")), 1), createVNode("div", { class: "tags-cell" }, [(openBlock(true), createBlock(Fragment, null, renderList(detailOfficer.value.roles, (r) => {
								return openBlock(), createBlock(_component_Badge, {
									key: r,
									type: "officerRole",
									value: r
								}, null, 8, ["value"]);
							}), 128)), !detailOfficer.value.roles.length ? (openBlock(), createBlock("span", {
								key: 0,
								class: "muted"
							}, "—")) : createCommentVNode("", true)])]),
							createVNode("div", { class: "detail-row detail-row--full" }, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("officers.certifications")), 1), createVNode("div", { class: "tags-cell" }, [(openBlock(true), createBlock(Fragment, null, renderList(detailOfficer.value.certifications, (c) => {
								return openBlock(), createBlock(_component_Badge, {
									key: c,
									type: "officerCert",
									value: c
								}, null, 8, ["value"]);
							}), 128)), !detailOfficer.value.certifications.length ? (openBlock(), createBlock("span", {
								key: 0,
								class: "muted"
							}, "—")) : createCommentVNode("", true)])]),
							detailOfficer.value.description ? (openBlock(), createBlock("div", {
								key: 0,
								class: "detail-row detail-row--full"
							}, [createVNode("span", { class: "detail-label" }, toDisplayString(unref(t)("officers.description")), 1), createVNode("span", { class: "detail-value" }, toDisplayString(detailOfficer.value.description), 1)])) : createCommentVNode("", true)
						]),
						createVNode("div", { class: "eval-section" }, [createVNode("div", { class: "eval-header" }, [createVNode("span", { class: "eval-title" }, toDisplayString(unref(t)("officers.evaluations")), 1)]), detailOfficer.value.evaluations.length ? (openBlock(), createBlock("div", {
							key: 0,
							class: "eval-list"
						}, [(openBlock(true), createBlock(Fragment, null, renderList(detailOfficer.value.evaluations, (ev, idx) => {
							return openBlock(), createBlock("div", {
								key: idx,
								class: "eval-item"
							}, [createVNode("div", { class: "eval-meta" }, [createVNode("span", { class: "eval-date" }, toDisplayString(formatEvalDate(ev.date)), 1), createVNode("span", { class: "eval-evaluator" }, "by " + toDisplayString(ev.evaluator_name || unref(t)("officers.unknown")), 1)]), createVNode("p", { class: "eval-text" }, toDisplayString(ev.text), 1)]);
						}), 128))])) : (openBlock(), createBlock("p", {
							key: 1,
							class: "eval-empty"
						}, toDisplayString(unref(t)("officers.no_evaluations")), 1))])
					])];
				}),
				_: 1
			}, _parent));
			else _push(`<!---->`);
			_push(ssrRenderComponent(_component_AppModal, {
				show: showPhoneConfirm.value,
				title: unref(t)("officers.phone_confirm_title"),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(t)("common.continue"),
				onClose: ($event) => showPhoneConfirm.value = false,
				onCancel: ($event) => showPhoneConfirm.value = false,
				onOk: ($event) => {
					showPhoneConfirm.value = false;
					doSave();
				}
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<p class="modal-confirm-message" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.phone_confirm_message"))}</p>`);
					else return [createVNode("p", { class: "modal-confirm-message" }, toDisplayString(unref(t)("officers.phone_confirm_message")), 1)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: showEvalDeleteModal.value,
				title: unref(t)("officers.delete_eval_title"),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": unref(t)("common.delete"),
				onClose: ($event) => showEvalDeleteModal.value = false,
				onCancel: ($event) => showEvalDeleteModal.value = false,
				onOk: handleDeleteEval
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<p class="modal-confirm-message" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.delete_eval_message"))}</p>`);
					else return [createVNode("p", { class: "modal-confirm-message" }, toDisplayString(unref(t)("officers.delete_eval_message")), 1)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: showDeleteModal.value,
				title: unref(t)("officers.delete_title"),
				"cancel-text": unref(t)("common.cancel"),
				"ok-text": isDeleting.value ? unref(t)("common.deleting") : unref(t)("common.delete"),
				"ok-disabled": isDeleting.value,
				onClose: ($event) => showDeleteModal.value = false,
				onCancel: ($event) => showDeleteModal.value = false,
				onOk: handleDelete
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<p class="modal-confirm-message" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.delete_message", { name: deleteTarget.value?.fullName ?? "" }))}</p><p class="modal-confirm-subtext" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.delete_cannot_undo"))}</p>`);
					else return [createVNode("p", { class: "modal-confirm-message" }, toDisplayString(unref(t)("officers.delete_message", { name: deleteTarget.value?.fullName ?? "" })), 1), createVNode("p", { class: "modal-confirm-subtext" }, toDisplayString(unref(t)("officers.delete_cannot_undo")), 1)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_component_AppModal, {
				show: showCannotDeleteModal.value,
				title: unref(t)("officers.cannot_delete_title"),
				"cancel-text": unref(t)("common.close"),
				"ok-text": isDeactivating.value ? unref(t)("common.deactivating") : unref(t)("officers.deactivate_officer"),
				"ok-disabled": isDeactivating.value,
				onClose: ($event) => {
					showCannotDeleteModal.value = false;
					deleteTarget.value = null;
				},
				onCancel: ($event) => {
					showCannotDeleteModal.value = false;
					deleteTarget.value = null;
				},
				onOk: handleDeactivateFromDelete
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<p class="modal-confirm-message" data-v-a564222f${_scopeId}>${ssrInterpolate(unref(t)("officers.cannot_delete_message"))}</p>`);
					else return [createVNode("p", { class: "modal-confirm-message" }, toDisplayString(unref(t)("officers.cannot_delete_message")), 1)];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/officers/OfficersManagement.vue
var _sfc_setup = OfficersManagement_vue_vue_type_script_setup_true_lang_default.setup;
OfficersManagement_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/officers/OfficersManagement.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var OfficersManagement_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(OfficersManagement_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a564222f"]]), { __name: "OfficersManagement" });

export { OfficersManagement_default as O };
//# sourceMappingURL=OfficersManagement-RMZMepGf.mjs.map
