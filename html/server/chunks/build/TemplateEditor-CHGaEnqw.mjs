import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, b as useRouter } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, computed, reactive, ref, unref, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';

//#region app/components/reports/TemplateEditor.vue?vue&type=script&setup=true&lang.ts
var TemplateEditor_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "TemplateEditor",
	__ssrInlineRender: true,
	props: {
		mode: {},
		template: {}
	},
	setup(__props) {
		const props = __props;
		const { t } = useTranslation();
		useRouter();
		const isEdit = computed(() => props.mode === "edit");
		const pageTitle = computed(() => isEdit.value ? t("tpl.editor_title_edit") : t("tpl.editor_title_create"));
		const DEMO_COMMUNITIES = [
			"Global",
			"Sunset Heights",
			"Central Hub",
			"Green Valley",
			"Riverside",
			"North Gate"
		];
		const PLACEHOLDER_TOKENS = [
			"{date}",
			"{community}",
			"{officer}",
			"{template_name}",
			"{incident_type}"
		];
		function buildInitialForm() {
			if (props.template) return {
				id: props.template.id,
				name: props.template.name,
				category: props.template.category,
				communities: [...props.template.communities],
				reportTitleFormat: props.template.reportTitleFormat,
				status: props.template.status,
				reviewBeforeClient: props.template.reviewBeforeClient,
				allowOfficerEditing: props.template.allowOfficerEditing
			};
			return {
				name: "",
				category: "incident",
				communities: [],
				reportTitleFormat: "",
				status: "draft",
				reviewBeforeClient: false,
				allowOfficerEditing: false
			};
		}
		const form = reactive(buildInitialForm());
		const errors = reactive({});
		const isSubmitting = ref(false);
		const activePane = ref("header");
		const communityDropdownOpen = ref(false);
		function isCommunitySelected(c) {
			return form.communities.includes(c);
		}
		const communityDisplayText = computed(() => {
			if (!form.communities.length) return t("tpl.communities_placeholder");
			if (form.communities.includes("Global")) return t("tpl.community_global");
			return form.communities.join(", ");
		});
		const isArchived = computed(() => form.status === "archived");
		const showArchiveModal = ref(false);
		const isArchiving = ref(false);
		const categoryOptions = [
			{
				value: "incident",
				label: "Incident"
			},
			{
				value: "daily_activity",
				label: "Daily Activity"
			},
			{
				value: "custom",
				label: "Custom"
			}
		];
		const INCIDENT_FIELDS = [
			{
				id: "incident_type",
				label: "Incident Type"
			},
			{
				id: "incident_date",
				label: "Incident Date & Time"
			},
			{
				id: "location",
				label: "Location"
			},
			{
				id: "description",
				label: "Description"
			},
			{
				id: "persons_involved",
				label: "Persons Involved"
			},
			{
				id: "vehicles",
				label: "Vehicles"
			},
			{
				id: "actions_taken",
				label: "Actions Taken"
			},
			{
				id: "photos",
				label: "Photos / Media"
			},
			{
				id: "police_report",
				label: "Police Report #"
			},
			{
				id: "follow_up",
				label: "Follow-up Required"
			},
			{
				id: "witness",
				label: "Witness Details"
			},
			{
				id: "property_damage",
				label: "Property Damage"
			}
		];
		function newSectionId() {
			return `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
		}
		function newFieldId() {
			return `fld-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
		}
		const sections = ref([{
			id: newSectionId(),
			title: "Incident Details",
			enabled: true,
			required: true,
			clientVisible: true,
			fields: [
				{
					id: newFieldId(),
					isCustom: false,
					incidentFieldId: "incident_type"
				},
				{
					id: newFieldId(),
					isCustom: false,
					incidentFieldId: "incident_date"
				},
				{
					id: newFieldId(),
					isCustom: false,
					incidentFieldId: "location"
				}
			]
		}, {
			id: newSectionId(),
			title: "Narrative",
			enabled: true,
			required: true,
			clientVisible: true,
			fields: [{
				id: newFieldId(),
				isCustom: false,
				incidentFieldId: "description"
			}]
		}]);
		const expandedSections = ref({});
		function isSectionExpanded(id) {
			return expandedSections.value[id] !== false;
		}
		const dragSectionId = ref(null);
		const dragOverSectionId = ref(null);
		const dragFieldKey = ref(null);
		const dragOverFieldKey = ref(null);
		function makeFieldKey(sectionId, fieldId) {
			return `${sectionId}|${fieldId}`;
		}
		const fieldPickerOpen = ref({});
		function isFieldSelected(section, fieldId) {
			return section.fields.some((f) => f.incidentFieldId === fieldId);
		}
		function getFieldLabel(fieldId) {
			return INCIDENT_FIELDS.find((f) => f.id === fieldId)?.label ?? fieldId;
		}
		const showCustomFieldModal = ref(false);
		ref(null);
		const customFieldForm = reactive({
			id: "",
			label: "",
			description: "",
			type: "text",
			maxChars: 500,
			dropdownValues: "",
			dropdownMulti: false,
			maxFiles: 5
		});
		const customFieldErrors = reactive({});
		const customFieldTypeOptions = [
			{
				value: "text",
				label: "Text",
				icon: "lucide:type"
			},
			{
				value: "date",
				label: "Date",
				icon: "lucide:calendar"
			},
			{
				value: "location",
				label: "Location",
				icon: "lucide:map-pin"
			},
			{
				value: "dropdown",
				label: "Dropdown",
				icon: "lucide:list"
			},
			{
				value: "file_upload",
				label: "File Upload",
				icon: "lucide:paperclip"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<!--[--><div class="tpl-editor" data-v-6d71b76f><div class="tpl-editor__page-header" data-v-6d71b76f><button class="back-btn" data-v-6d71b76f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:arrow-left",
				size: 16
			}, null, _parent));
			_push(`</button><div class="tpl-editor__page-title-area" data-v-6d71b76f><h1 class="tpl-editor__page-title" data-v-6d71b76f>${ssrInterpolate(pageTitle.value)}</h1><p class="tpl-editor__page-sub" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.editor_subtitle"))}</p></div><div class="tpl-editor__header-actions" data-v-6d71b76f><button class="btn-cancel" data-v-6d71b76f>${ssrInterpolate(unref(t)("common.cancel"))}</button>`);
			if (isEdit.value && isArchived.value) {
				_push(`<button class="btn-restore" data-v-6d71b76f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:rotate-ccw",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("tpl.restore"))}</button>`);
			} else _push(`<!---->`);
			if (isEdit.value && !isArchived.value) {
				_push(`<button class="btn-archive" data-v-6d71b76f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:archive",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("tpl.archive"))}</button>`);
			} else _push(`<!---->`);
			if (!isArchived.value) {
				_push(`<button class="btn-draft"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-6d71b76f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:save",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("tpl.save_draft"))}</button>`);
			} else _push(`<!---->`);
			if (!isArchived.value) {
				_push(`<button class="btn-publish"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-6d71b76f>`);
				if (isSubmitting.value) _push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 14,
					class: "spin"
				}, null, _parent));
				else _push(ssrRenderComponent(_component_Icon, {
					name: "lucide:send",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(isEdit.value ? unref(t)("tpl.save_changes") : unref(t)("tpl.publish"))}</button>`);
			} else _push(`<!---->`);
			_push(`</div></div>`);
			if (isEdit.value && isArchived.value) {
				_push(`<div class="archived-banner" data-v-6d71b76f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:archive",
					size: 15
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("tpl.archived_banner"))}</div>`);
			} else _push(`<!---->`);
			_push(`<div class="tpl-editor__body" data-v-6d71b76f><aside class="tpl-editor__left-pane" data-v-6d71b76f><div class="left-pane__section-label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.pane_settings"))}</div><button class="${ssrRenderClass([{ "left-pane__nav-item--active": activePane.value === "header" }, "left-pane__nav-item"])}" data-v-6d71b76f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:settings-2",
				size: 15
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("tpl.pane_header"))}</button><button class="${ssrRenderClass([{ "left-pane__nav-item--active": activePane.value === "sections" }, "left-pane__nav-item"])}" data-v-6d71b76f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:layers",
				size: 15
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("tpl.pane_sections"))}</button></aside><main class="tpl-editor__right-pane" data-v-6d71b76f>`);
			if (activePane.value === "header") {
				_push(`<div class="editor-panel" data-v-6d71b76f><div class="editor-panel__header" data-v-6d71b76f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:settings-2",
					size: 16
				}, null, _parent));
				_push(`<h2 class="editor-panel__title" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.pane_header"))}</h2></div><div class="editor-panel__body" data-v-6d71b76f><div class="${ssrRenderClass([{ "form-field--error": errors.name }, "form-field"])}" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.field_name"))} <span class="req" data-v-6d71b76f>*</span></label><input${ssrRenderAttr("value", form.name)} type="text" class="form-field__input" maxlength="80"${ssrRenderAttr("placeholder", unref(t)("tpl.field_name_placeholder"))} data-v-6d71b76f><div class="form-field__footer" data-v-6d71b76f><span class="field-error" data-v-6d71b76f>${ssrInterpolate(errors.name)}</span><span class="char-count" data-v-6d71b76f>${ssrInterpolate(form.name.length)}/80</span></div></div><div class="form-row" data-v-6d71b76f><div class="${ssrRenderClass([{ "form-field--error": errors.category }, "form-field"])}" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.field_category"))} <span class="req" data-v-6d71b76f>*</span></label><select class="form-field__select" data-v-6d71b76f><!--[-->`);
				ssrRenderList(categoryOptions, (opt) => {
					_push(`<option${ssrRenderAttr("value", opt.value)} data-v-6d71b76f${ssrIncludeBooleanAttr(Array.isArray(form.category) ? ssrLooseContain(form.category, opt.value) : ssrLooseEqual(form.category, opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
				});
				_push(`<!--]--></select></div><div class="form-field" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.field_status"))}</label><div class="status-toggle-group" data-v-6d71b76f><button class="${ssrRenderClass([{ "status-toggle-btn--active": form.status === "draft" }, "status-toggle-btn"])}" data-v-6d71b76f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:file-edit",
					size: 13
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("tpl.status_draft"))}</button><button class="${ssrRenderClass([{ "status-toggle-btn--active-ok": form.status === "active" }, "status-toggle-btn"])}" data-v-6d71b76f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:check-circle",
					size: 13
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("tpl.status_active"))}</button></div></div></div><div class="${ssrRenderClass([{ "form-field--error": errors.communities }, "form-field"])}" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.field_communities"))} <span class="req" data-v-6d71b76f>*</span></label><div class="${ssrRenderClass([{ "multiselect--open": communityDropdownOpen.value }, "multiselect"])}" data-v-6d71b76f><button type="button" class="multiselect__trigger" data-v-6d71b76f><span class="${ssrRenderClass([{ "multiselect__display--placeholder": !form.communities.length }, "multiselect__display"])}" data-v-6d71b76f>${ssrInterpolate(communityDisplayText.value)}</span>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:chevron-down",
					size: 14,
					class: "multiselect__chevron"
				}, null, _parent));
				_push(`</button>`);
				if (communityDropdownOpen.value) {
					_push(`<div class="multiselect__dropdown" data-v-6d71b76f><!--[-->`);
					ssrRenderList(DEMO_COMMUNITIES, (c) => {
						_push(`<label class="${ssrRenderClass([{ "multiselect__option--selected": isCommunitySelected(c) }, "multiselect__option"])}" data-v-6d71b76f><span class="multiselect__checkbox" data-v-6d71b76f>`);
						if (isCommunitySelected(c)) _push(ssrRenderComponent(_component_Icon, {
							name: "lucide:check",
							size: 11
						}, null, _parent));
						else _push(`<!---->`);
						_push(`</span><span data-v-6d71b76f>${ssrInterpolate(c === "Global" ? `🌐 ${unref(t)("tpl.community_global")}` : c)}</span></label>`);
					});
					_push(`<!--]--></div>`);
				} else _push(`<!---->`);
				_push(`</div>`);
				if (errors.communities) _push(`<span class="field-error" data-v-6d71b76f>${ssrInterpolate(errors.communities)}</span>`);
				else _push(`<!---->`);
				if (form.communities.length) {
					_push(`<div class="community-chips" data-v-6d71b76f><!--[-->`);
					ssrRenderList(form.communities, (c) => {
						_push(`<span class="community-chip" data-v-6d71b76f>${ssrInterpolate(c)} <button class="chip-remove" data-v-6d71b76f>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:x",
							size: 10
						}, null, _parent));
						_push(`</button></span>`);
					});
					_push(`<!--]--></div>`);
				} else _push(`<!---->`);
				_push(`</div><div class="${ssrRenderClass([{ "form-field--error": errors.reportTitleFormat }, "form-field"])}" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.field_title_format"))} <span class="req" data-v-6d71b76f>*</span></label><input${ssrRenderAttr("value", form.reportTitleFormat)} type="text" class="form-field__input"${ssrRenderAttr("placeholder", unref(t)("tpl.field_title_format_placeholder"))} data-v-6d71b76f>`);
				if (errors.reportTitleFormat) _push(`<span class="field-error" data-v-6d71b76f>${ssrInterpolate(errors.reportTitleFormat)}</span>`);
				else _push(`<!---->`);
				_push(`<div class="token-row" data-v-6d71b76f><span class="token-label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.insert_placeholder"))}</span><!--[-->`);
				ssrRenderList(PLACEHOLDER_TOKENS, (token) => {
					_push(`<button type="button" class="token-btn" data-v-6d71b76f>${ssrInterpolate(token)}</button>`);
				});
				_push(`<!--]--></div></div><div class="toggles-section" data-v-6d71b76f><div class="toggle-row" data-v-6d71b76f><div class="toggle-row__info" data-v-6d71b76f><span class="toggle-row__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.field_review_before_client"))}</span><span class="toggle-row__desc" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.field_review_before_client_desc"))}</span></div><button type="button" class="${ssrRenderClass([{ "toggle-switch--on": form.reviewBeforeClient }, "toggle-switch"])}" data-v-6d71b76f><span class="toggle-switch__thumb" data-v-6d71b76f></span></button></div><div class="toggle-row" data-v-6d71b76f><div class="toggle-row__info" data-v-6d71b76f><span class="toggle-row__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.field_allow_officer_editing"))}</span><span class="toggle-row__desc" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.field_allow_officer_editing_desc"))}</span></div><button type="button" class="${ssrRenderClass([{ "toggle-switch--on": form.allowOfficerEditing }, "toggle-switch"])}" data-v-6d71b76f><span class="toggle-switch__thumb" data-v-6d71b76f></span></button></div></div></div></div>`);
			} else {
				_push(`<div class="editor-panel" data-v-6d71b76f><div class="editor-panel__header" data-v-6d71b76f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:layers",
					size: 16
				}, null, _parent));
				_push(`<h2 class="editor-panel__title" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.pane_sections"))}</h2><button class="btn-add-section" data-v-6d71b76f>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:plus",
					size: 14
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("tpl.add_section"))}</button></div><div class="editor-panel__body editor-panel__body--sections" data-v-6d71b76f>`);
				if (sections.value.length === 0) {
					_push(`<div class="sections-empty" data-v-6d71b76f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:layers",
						size: 28,
						class: "empty-icon"
					}, null, _parent));
					_push(`<p data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.sections_empty"))}</p><button class="btn-add-section-inline" data-v-6d71b76f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:plus",
						size: 14
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("tpl.add_section"))}</button></div>`);
				} else _push(`<!---->`);
				_push(`<!--[-->`);
				ssrRenderList(sections.value, (sec, secIdx) => {
					_push(`<div class="${ssrRenderClass([{
						"section-card--disabled": !sec.enabled,
						"section-card--dragging": dragSectionId.value === sec.id,
						"section-card--drag-over": dragOverSectionId.value === sec.id
					}, "section-card"])}" draggable="true" data-v-6d71b76f><div class="section-card__header" data-v-6d71b76f><div class="section-order-btns" data-v-6d71b76f><span class="drag-handle"${ssrRenderAttr("title", unref(t)("tpl.drag_handle"))} data-v-6d71b76f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:grip-vertical",
						size: 14
					}, null, _parent));
					_push(`</span><button class="order-btn"${ssrIncludeBooleanAttr(secIdx === 0) ? " disabled" : ""}${ssrRenderAttr("title", unref(t)("tpl.move_up"))} data-v-6d71b76f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:chevron-up",
						size: 12
					}, null, _parent));
					_push(`</button><span class="order-num" data-v-6d71b76f>${ssrInterpolate(secIdx + 1)}</span><button class="order-btn"${ssrIncludeBooleanAttr(secIdx === sections.value.length - 1) ? " disabled" : ""}${ssrRenderAttr("title", unref(t)("tpl.move_down"))} data-v-6d71b76f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:chevron-down",
						size: 12
					}, null, _parent));
					_push(`</button></div><input${ssrRenderAttr("value", sec.title)} type="text" class="section-title-input" maxlength="80"${ssrRenderAttr("placeholder", unref(t)("tpl.section_title_placeholder"))} data-v-6d71b76f><div class="section-toggles" data-v-6d71b76f><label class="mini-toggle"${ssrRenderAttr("title", unref(t)("tpl.section_enabled"))} data-v-6d71b76f><input${ssrIncludeBooleanAttr(Array.isArray(sec.enabled) ? ssrLooseContain(sec.enabled, null) : sec.enabled) ? " checked" : ""} type="checkbox" class="sr-only" data-v-6d71b76f><span class="${ssrRenderClass([{ "mini-toggle__track--on": sec.enabled }, "mini-toggle__track"])}" data-v-6d71b76f><span class="mini-toggle__thumb" data-v-6d71b76f></span></span><span class="mini-toggle__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.section_enabled"))}</span></label><label class="mini-toggle"${ssrRenderAttr("title", unref(t)("tpl.section_required"))} data-v-6d71b76f><input${ssrIncludeBooleanAttr(Array.isArray(sec.required) ? ssrLooseContain(sec.required, null) : sec.required) ? " checked" : ""} type="checkbox" class="sr-only" data-v-6d71b76f><span class="${ssrRenderClass([{ "mini-toggle__track--on": sec.required }, "mini-toggle__track"])}" data-v-6d71b76f><span class="mini-toggle__thumb" data-v-6d71b76f></span></span><span class="mini-toggle__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.section_required"))}</span></label><label class="mini-toggle"${ssrRenderAttr("title", unref(t)("tpl.section_client_visible"))} data-v-6d71b76f><input${ssrIncludeBooleanAttr(Array.isArray(sec.clientVisible) ? ssrLooseContain(sec.clientVisible, null) : sec.clientVisible) ? " checked" : ""} type="checkbox" class="sr-only" data-v-6d71b76f><span class="${ssrRenderClass([{ "mini-toggle__track--on": sec.clientVisible }, "mini-toggle__track"])}" data-v-6d71b76f><span class="mini-toggle__thumb" data-v-6d71b76f></span></span><span class="mini-toggle__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.section_client_visible"))}</span></label></div><div class="section-header-actions" data-v-6d71b76f><button class="section-action-btn"${ssrRenderAttr("title", unref(t)("tpl.section_expand"))} data-v-6d71b76f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: isSectionExpanded(sec.id) ? "lucide:chevron-up" : "lucide:chevron-down",
						size: 14
					}, null, _parent));
					_push(`</button><button class="section-action-btn section-action-btn--danger"${ssrRenderAttr("title", unref(t)("tpl.section_delete"))} data-v-6d71b76f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:trash-2",
						size: 14
					}, null, _parent));
					_push(`</button></div></div>`);
					if (isSectionExpanded(sec.id)) {
						_push(`<div class="section-card__fields" data-v-6d71b76f>`);
						if (sec.fields.length) {
							_push(`<div class="fields-list" data-v-6d71b76f><!--[-->`);
							ssrRenderList(sec.fields, (field, fIdx) => {
								_push(`<div class="${ssrRenderClass([{
									"field-row--dragging": dragFieldKey.value === makeFieldKey(sec.id, field.id),
									"field-row--drag-over": dragOverFieldKey.value === makeFieldKey(sec.id, field.id)
								}, "field-row"])}" draggable="true" data-v-6d71b76f><span class="field-row__drag"${ssrRenderAttr("title", unref(t)("tpl.drag_handle"))} data-v-6d71b76f>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:grip-vertical",
									size: 12
								}, null, _parent));
								_push(`</span><div class="field-row__order" data-v-6d71b76f><button class="order-btn order-btn--sm"${ssrIncludeBooleanAttr(fIdx === 0) ? " disabled" : ""} data-v-6d71b76f>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:chevron-up",
									size: 11
								}, null, _parent));
								_push(`</button><button class="order-btn order-btn--sm"${ssrIncludeBooleanAttr(fIdx === sec.fields.length - 1) ? " disabled" : ""} data-v-6d71b76f>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:chevron-down",
									size: 11
								}, null, _parent));
								_push(`</button></div>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: field.isCustom ? "lucide:sparkles" : "lucide:form-input",
									size: 13,
									class: ["field-row__icon", { "field-row__icon--custom": field.isCustom }]
								}, null, _parent));
								_push(`<span class="field-row__label" data-v-6d71b76f>${ssrInterpolate(field.isCustom ? field.custom?.label : getFieldLabel(field.incidentFieldId ?? ""))}</span>`);
								if (field.isCustom) _push(`<span class="field-row__type-badge" data-v-6d71b76f>${ssrInterpolate(field.custom?.type?.replace("_", " "))}</span>`);
								else _push(`<!---->`);
								_push(`<button class="field-row__remove"${ssrRenderAttr("title", unref(t)("tpl.field_remove"))} data-v-6d71b76f>`);
								_push(ssrRenderComponent(_component_Icon, {
									name: "lucide:x",
									size: 12
								}, null, _parent));
								_push(`</button></div>`);
							});
							_push(`<!--]--></div>`);
						} else _push(`<!---->`);
						_push(`<div class="fields-add-row" data-v-6d71b76f><div class="field-picker-wrap" data-v-6d71b76f><button class="btn-add-field" data-v-6d71b76f>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:plus",
							size: 13
						}, null, _parent));
						_push(` ${ssrInterpolate(unref(t)("tpl.add_incident_field"))}</button>`);
						if (fieldPickerOpen.value[sec.id]) {
							_push(`<div class="field-picker-dropdown" data-v-6d71b76f><div class="field-picker__title" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.picker_title"))}</div><!--[-->`);
							ssrRenderList(INCIDENT_FIELDS, (iField) => {
								_push(`<label class="${ssrRenderClass([{ "field-picker__option--selected": isFieldSelected(sec, iField.id) }, "field-picker__option"])}" data-v-6d71b76f><span class="field-picker__checkbox" data-v-6d71b76f>`);
								if (isFieldSelected(sec, iField.id)) _push(ssrRenderComponent(_component_Icon, {
									name: "lucide:check",
									size: 10
								}, null, _parent));
								else _push(`<!---->`);
								_push(`</span> ${ssrInterpolate(iField.label)}</label>`);
							});
							_push(`<!--]--></div>`);
						} else _push(`<!---->`);
						_push(`</div><button class="btn-add-custom" data-v-6d71b76f>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:sparkles",
							size: 13
						}, null, _parent));
						_push(` ${ssrInterpolate(unref(t)("tpl.add_custom_field"))}</button></div></div>`);
					} else _push(`<!---->`);
					_push(`</div>`);
				});
				_push(`<!--]--></div></div>`);
			}
			_push(`</main></div></div>`);
			ssrRenderTeleport(_push, (_push) => {
				if (showArchiveModal.value) {
					_push(`<div class="modal-overlay" data-v-6d71b76f><div class="modal" data-v-6d71b76f><div class="modal__header" data-v-6d71b76f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:archive",
						size: 17,
						class: "modal__icon--warn"
					}, null, _parent));
					_push(`<h3 class="modal__title" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.archive_confirm_title"))}</h3></div><div class="modal__body" data-v-6d71b76f><p class="modal__text" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.archive_confirm_body"))}</p><p class="modal__text modal__text--muted" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.archive_confirm_note"))}</p></div><div class="modal__footer" data-v-6d71b76f><button class="btn-cancel" data-v-6d71b76f>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn-archive-confirm"${ssrIncludeBooleanAttr(isArchiving.value) ? " disabled" : ""} data-v-6d71b76f>`);
					if (isArchiving.value) _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:loader-2",
						size: 14,
						class: "spin"
					}, null, _parent));
					else _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:archive",
						size: 14
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("tpl.archive_confirm_action"))}</button></div></div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
			if (Object.values(fieldPickerOpen.value).some(Boolean)) _push(`<div class="overlay-dismiss" data-v-6d71b76f></div>`);
			else _push(`<!---->`);
			if (communityDropdownOpen.value) _push(`<div class="overlay-dismiss" data-v-6d71b76f></div>`);
			else _push(`<!---->`);
			ssrRenderTeleport(_push, (_push) => {
				if (showCustomFieldModal.value) {
					_push(`<div class="modal-overlay" data-v-6d71b76f><div class="modal modal--lg" data-v-6d71b76f><div class="modal__header" data-v-6d71b76f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:sparkles",
						size: 17,
						class: "modal__icon--accent"
					}, null, _parent));
					_push(`<h3 class="modal__title" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.custom_field_title"))}</h3></div><div class="modal__body" data-v-6d71b76f><div class="${ssrRenderClass([{ "form-field--error": customFieldErrors.label }, "form-field"])}" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.custom_field_label"))} <span class="req" data-v-6d71b76f>*</span></label><input${ssrRenderAttr("value", customFieldForm.label)} type="text" class="form-field__input"${ssrRenderAttr("placeholder", unref(t)("tpl.custom_field_label_placeholder"))} data-v-6d71b76f>`);
					if (customFieldErrors.label) _push(`<span class="field-error" data-v-6d71b76f>${ssrInterpolate(customFieldErrors.label)}</span>`);
					else _push(`<!---->`);
					_push(`</div><div class="form-field" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.custom_field_description"))}</label><input${ssrRenderAttr("value", customFieldForm.description)} type="text" class="form-field__input"${ssrRenderAttr("placeholder", unref(t)("tpl.custom_field_description_placeholder"))} data-v-6d71b76f></div><div class="form-field" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.custom_field_type"))} <span class="req" data-v-6d71b76f>*</span></label><div class="field-type-grid" data-v-6d71b76f><!--[-->`);
					ssrRenderList(customFieldTypeOptions, (opt) => {
						_push(`<button class="${ssrRenderClass([{ "field-type-btn--active": customFieldForm.type === opt.value }, "field-type-btn"])}" data-v-6d71b76f>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: opt.icon,
							size: 16
						}, null, _parent));
						_push(` ${ssrInterpolate(opt.label)}</button>`);
					});
					_push(`<!--]--></div></div>`);
					if (customFieldForm.type === "text") _push(`<div class="form-field" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.custom_field_max_chars"))}</label><input${ssrRenderAttr("value", customFieldForm.maxChars)} type="number" min="10" max="5000" class="form-field__input form-field__input--short" data-v-6d71b76f></div>`);
					else _push(`<!---->`);
					if (customFieldForm.type === "dropdown") {
						_push(`<div class="${ssrRenderClass([{ "form-field--error": customFieldErrors.dropdownValues }, "form-field"])}" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.custom_field_dropdown_values"))} <span class="req" data-v-6d71b76f>*</span></label><textarea class="form-field__textarea" rows="4"${ssrRenderAttr("placeholder", unref(t)("tpl.custom_field_dropdown_values_placeholder"))} data-v-6d71b76f>${ssrInterpolate(customFieldForm.dropdownValues)}</textarea>`);
						if (customFieldErrors.dropdownValues) _push(`<span class="field-error" data-v-6d71b76f>${ssrInterpolate(customFieldErrors.dropdownValues)}</span>`);
						else _push(`<!---->`);
						_push(`<label class="checkbox-row" data-v-6d71b76f><input${ssrIncludeBooleanAttr(Array.isArray(customFieldForm.dropdownMulti) ? ssrLooseContain(customFieldForm.dropdownMulti, null) : customFieldForm.dropdownMulti) ? " checked" : ""} type="checkbox" data-v-6d71b76f> ${ssrInterpolate(unref(t)("tpl.custom_field_multi_select"))}</label></div>`);
					} else _push(`<!---->`);
					if (customFieldForm.type === "file_upload") _push(`<div class="form-field" data-v-6d71b76f><label class="form-field__label" data-v-6d71b76f>${ssrInterpolate(unref(t)("tpl.custom_field_max_files"))}</label><input${ssrRenderAttr("value", customFieldForm.maxFiles)} type="number" min="1" max="20" class="form-field__input form-field__input--short" data-v-6d71b76f></div>`);
					else _push(`<!---->`);
					_push(`</div><div class="modal__footer" data-v-6d71b76f><button class="btn-cancel" data-v-6d71b76f>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn-publish" data-v-6d71b76f>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:plus",
						size: 14
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("tpl.custom_field_add"))}</button></div></div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region app/components/reports/TemplateEditor.vue
var _sfc_setup = TemplateEditor_vue_vue_type_script_setup_true_lang_default.setup;
TemplateEditor_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/reports/TemplateEditor.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var TemplateEditor_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(TemplateEditor_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-6d71b76f"]]), { __name: "TemplateEditor" });

export { TemplateEditor_default as T };
//# sourceMappingURL=TemplateEditor-CHGaEnqw.mjs.map
