import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, b as useRouter } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, ref, computed, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';

//#region app/components/poi/POIForm.vue?vue&type=script&setup=true&lang.ts
var POIForm_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "POIForm",
	__ssrInlineRender: true,
	props: {
		mode: {},
		record: {}
	},
	setup(__props) {
		const props = __props;
		const { t } = useTranslation();
		useRouter();
		const isSubmitting = ref(false);
		const photoFiles = ref([]);
		const photoPreviewUrls = ref([...props.record?.existingPhotos ?? []]);
		const trespassDocFile = ref(null);
		const metroCardFile = ref(null);
		ref([]);
		const isEdit = computed(() => props.mode === "edit");
		const pageTitle = computed(() => isEdit.value ? t("poi.form_title_edit") : t("poi.form_title_create"));
		function buildInitialForm() {
			const r = props.record;
			return {
				recordType: r?.recordType ?? "",
				status: r?.status ?? "draft",
				firstName: r?.firstName ?? "",
				lastName: r?.lastName ?? "",
				aliases: r?.aliases ?? "",
				dateOfBirth: r?.dateOfBirth ?? "",
				gender: r?.gender ?? "",
				physicalDescription: r?.physicalDescription ?? "",
				summary: r?.summary ?? "",
				internalNotes: r?.internalNotes ?? "",
				sites: r?.sites ? [...r.sites] : [],
				threatLevel: r?.threatLevel ?? "",
				relatedIncidentIds: r?.relatedIncidentIds ?? "",
				incidentHistorySummary: r?.incidentHistorySummary ?? "",
				watchLevelReviewDate: r?.watchLevelReviewDate ?? "",
				associatedIndividuals: r?.associatedIndividuals ?? "",
				trespassNoticeNumber: r?.trespassNoticeNumber ?? "",
				trespassIssuingAuthority: r?.trespassIssuingAuthority ?? "",
				propertyAreaCovered: r?.propertyAreaCovered ?? "",
				trespassIssueDate: r?.trespassIssueDate ?? "",
				trespassExpiryDate: r?.trespassExpiryDate ?? "",
				trespassRenewalReminder: r?.trespassRenewalReminder ?? 14,
				lawEnforcementContact: r?.lawEnforcementContact ?? "",
				conditions: r?.conditions ?? "",
				redCardNumber: r?.redCardNumber ?? "",
				metroIssuingAuthority: r?.metroIssuingAuthority ?? "",
				metroIssueDate: r?.metroIssueDate ?? "",
				metroExpiryDate: r?.metroExpiryDate ?? "",
				metroLines: r?.metroLines ?? "",
				metroRenewalReminder: r?.metroRenewalReminder ?? 14
			};
		}
		const form = reactive(buildInitialForm());
		const errors = reactive({});
		const photoError = ref("");
		const isPOI = computed(() => form.recordType === "poi");
		const isTrespass = computed(() => form.recordType === "trespass");
		const isMetro = computed(() => form.recordType === "metro_red_card");
		const hasType = computed(() => form.recordType !== "");
		const availableSites = [
			"Central Hub",
			"North Gate",
			"South Plaza",
			"Metro Station A",
			"Metro Station B",
			"West Wing",
			"East Block"
		];
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "poi-form" }, _attrs))} data-v-3474b0b8><div class="poi-form__page-header" data-v-3474b0b8><button class="back-btn" data-v-3474b0b8>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:arrow-left",
				size: 16
			}, null, _parent));
			_push(`</button><div data-v-3474b0b8><h1 class="poi-form__page-title" data-v-3474b0b8>${ssrInterpolate(pageTitle.value)}</h1><p class="poi-form__page-sub" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.form_subtitle"))}</p></div></div><div class="poi-form__body" data-v-3474b0b8><div class="form-section" data-v-3474b0b8><div class="form-section__header" data-v-3474b0b8>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:tag",
				size: 16
			}, null, _parent));
			_push(`<h2 class="form-section__title" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.section_record_type"))}</h2></div><div class="form-section__body" data-v-3474b0b8><div class="type-selector" data-v-3474b0b8><button class="${ssrRenderClass([{ "type-option--active": form.recordType === "poi" }, "type-option"])}" data-v-3474b0b8>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:user-search",
				size: 20
			}, null, _parent));
			_push(`<span class="type-option__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.type_poi"))}</span><span class="type-option__desc" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.type_poi_desc"))}</span></button><button class="${ssrRenderClass([{ "type-option--active": form.recordType === "trespass" }, "type-option"])}" data-v-3474b0b8>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:ban",
				size: 20
			}, null, _parent));
			_push(`<span class="type-option__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.type_trespass"))}</span><span class="type-option__desc" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.type_trespass_desc"))}</span></button><button class="${ssrRenderClass([{ "type-option--active": form.recordType === "metro_red_card" }, "type-option"])}" data-v-3474b0b8>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:train-front",
				size: 20
			}, null, _parent));
			_push(`<span class="type-option__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.type_metro"))}</span><span class="type-option__desc" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.type_metro_desc"))}</span></button></div>`);
			if (errors.recordType) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.recordType)}</span>`);
			else _push(`<!---->`);
			_push(`</div></div>`);
			if (hasType.value) {
				_push(`<!--[--><div class="form-section" data-v-3474b0b8><div class="form-section__header" data-v-3474b0b8>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:user",
					size: 16
				}, null, _parent));
				_push(`<h2 class="form-section__title" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.section_basic_info"))}</h2></div><div class="form-section__body" data-v-3474b0b8><div class="form-grid form-grid--2" data-v-3474b0b8><div class="${ssrRenderClass([{ "form-field--error": errors.firstName }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_first_name"))} <span class="req" data-v-3474b0b8>*</span></label><input${ssrRenderAttr("value", form.firstName)} type="text" class="form-field__input" maxlength="60" data-v-3474b0b8>`);
				if (errors.firstName) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.firstName)}</span>`);
				else _push(`<!---->`);
				_push(`</div><div class="${ssrRenderClass([{ "form-field--error": errors.lastName }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_last_name"))} <span class="req" data-v-3474b0b8>*</span></label><input${ssrRenderAttr("value", form.lastName)} type="text" class="form-field__input" maxlength="60" data-v-3474b0b8>`);
				if (errors.lastName) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.lastName)}</span>`);
				else _push(`<!---->`);
				_push(`</div><div class="form-field" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_dob"))}</label><input${ssrRenderAttr("value", form.dateOfBirth)} type="date" class="form-field__input" data-v-3474b0b8></div><div class="form-field" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_gender"))}</label><select class="form-field__select" data-v-3474b0b8><option value="" data-v-3474b0b8${ssrIncludeBooleanAttr(Array.isArray(form.gender) ? ssrLooseContain(form.gender, "") : ssrLooseEqual(form.gender, "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("common.select"))}</option><option value="male" data-v-3474b0b8${ssrIncludeBooleanAttr(Array.isArray(form.gender) ? ssrLooseContain(form.gender, "male") : ssrLooseEqual(form.gender, "male")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.gender_male"))}</option><option value="female" data-v-3474b0b8${ssrIncludeBooleanAttr(Array.isArray(form.gender) ? ssrLooseContain(form.gender, "female") : ssrLooseEqual(form.gender, "female")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.gender_female"))}</option><option value="unknown" data-v-3474b0b8${ssrIncludeBooleanAttr(Array.isArray(form.gender) ? ssrLooseContain(form.gender, "unknown") : ssrLooseEqual(form.gender, "unknown")) ? " selected" : ""}>${ssrInterpolate(unref(t)("poi.gender_unknown"))}</option></select></div><div class="form-field form-field--full" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_aliases"))}</label><input${ssrRenderAttr("value", form.aliases)} type="text" class="form-field__input" maxlength="200"${ssrRenderAttr("placeholder", unref(t)("poi.field_aliases_placeholder"))} data-v-3474b0b8></div><div class="form-field form-field--full" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_physical_desc"))}</label><textarea class="form-field__textarea" rows="3" maxlength="500" data-v-3474b0b8>${ssrInterpolate(form.physicalDescription)}</textarea></div></div></div></div><div class="form-section" data-v-3474b0b8><div class="form-section__header" data-v-3474b0b8>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:shield-alert",
					size: 16
				}, null, _parent));
				_push(`<h2 class="form-section__title" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.section_threat_sites"))}</h2></div><div class="form-section__body" data-v-3474b0b8><div class="form-grid form-grid--2" data-v-3474b0b8><div class="${ssrRenderClass([{ "form-field--error": errors.threatLevel }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_threat_level"))} <span class="req" data-v-3474b0b8>*</span></label><div class="threat-selector" data-v-3474b0b8><!--[-->`);
				ssrRenderList([
					"low",
					"medium",
					"high",
					"critical"
				], (lvl) => {
					_push(`<button class="${ssrRenderClass([[`threat-btn--${lvl}`, { "threat-btn--active": form.threatLevel === lvl }], "threat-btn"])}" type="button" data-v-3474b0b8>${ssrInterpolate(unref(t)(`poi.threat_${lvl}`))}</button>`);
				});
				_push(`<!--]--></div>`);
				if (errors.threatLevel) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.threatLevel)}</span>`);
				else _push(`<!---->`);
				_push(`</div><div class="${ssrRenderClass([{ "form-field--error": errors.sites }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_sites"))} <span class="req" data-v-3474b0b8>*</span></label><div class="sites-selector" data-v-3474b0b8><!--[-->`);
				ssrRenderList(availableSites, (site) => {
					_push(`<button type="button" class="${ssrRenderClass([{ "site-chip--active": form.sites.includes(site) }, "site-chip"])}" data-v-3474b0b8>${ssrInterpolate(site)}</button>`);
				});
				_push(`<!--]--></div>`);
				if (errors.sites) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.sites)}</span>`);
				else _push(`<!---->`);
				_push(`</div></div></div></div><div class="form-section" data-v-3474b0b8><div class="form-section__header" data-v-3474b0b8>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:image",
					size: 16
				}, null, _parent));
				_push(`<h2 class="form-section__title" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.section_photos"))}</h2><span class="section-badge" data-v-3474b0b8>${ssrInterpolate(photoFiles.value.length)}/10</span></div><div class="form-section__body" data-v-3474b0b8><div class="photo-grid" data-v-3474b0b8><!--[-->`);
				ssrRenderList(photoPreviewUrls.value, (url, idx) => {
					_push(`<div class="photo-item" data-v-3474b0b8><img${ssrRenderAttr("src", url)}${ssrRenderAttr("alt", `Photo ${idx + 1}`)} class="photo-item__img" data-v-3474b0b8><button class="photo-item__remove" type="button" data-v-3474b0b8>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:x",
						size: 12
					}, null, _parent));
					_push(`</button></div>`);
				});
				_push(`<!--]-->`);
				if (photoFiles.value.length < 10) {
					_push(`<label class="photo-add" data-v-3474b0b8>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:plus",
						size: 20
					}, null, _parent));
					_push(`<span data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.add_photo"))}</span><input type="file" accept="image/*" multiple class="hidden-input" data-v-3474b0b8></label>`);
				} else _push(`<!---->`);
				_push(`</div><p class="field-hint" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.photo_hint"))}</p>`);
				if (photoError.value) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(photoError.value)}</span>`);
				else _push(`<!---->`);
				_push(`</div></div><div class="form-section" data-v-3474b0b8><div class="form-section__header" data-v-3474b0b8>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:file-text",
					size: 16
				}, null, _parent));
				_push(`<h2 class="form-section__title" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.section_summary"))}</h2></div><div class="form-section__body" data-v-3474b0b8><div class="form-grid form-grid--1" data-v-3474b0b8><div class="${ssrRenderClass([{ "form-field--error": errors.summary }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_summary"))} <span class="req" data-v-3474b0b8>*</span></label><textarea class="form-field__textarea" rows="3" maxlength="300"${ssrRenderAttr("placeholder", unref(t)("poi.field_summary_placeholder"))} data-v-3474b0b8>${ssrInterpolate(form.summary)}</textarea><span class="char-count" data-v-3474b0b8>${ssrInterpolate(form.summary.length)}/300</span>`);
				if (errors.summary) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.summary)}</span>`);
				else _push(`<!---->`);
				_push(`</div><div class="form-field" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_internal_notes"))}</label><p class="field-hint field-hint--inline" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_internal_notes_hint"))}</p><textarea class="form-field__textarea" rows="4" maxlength="2000" data-v-3474b0b8>${ssrInterpolate(form.internalNotes)}</textarea><span class="char-count" data-v-3474b0b8>${ssrInterpolate(form.internalNotes.length)}/2000</span></div><div class="form-field" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_related_incidents"))}</label><input${ssrRenderAttr("value", form.relatedIncidentIds)} type="text" class="form-field__input"${ssrRenderAttr("placeholder", unref(t)("poi.field_related_incidents_placeholder"))} data-v-3474b0b8></div></div></div></div>`);
				if (isPOI.value) {
					_push(`<div class="form-section form-section--conditional form-section--poi" data-v-3474b0b8><div class="form-section__header" data-v-3474b0b8>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:user-search",
						size: 16
					}, null, _parent));
					_push(`<h2 class="form-section__title" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.section_poi_details"))}</h2><span class="section-type-badge section-type-badge--poi" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.type_poi"))}</span></div><div class="form-section__body" data-v-3474b0b8><div class="form-grid form-grid--1" data-v-3474b0b8><div class="form-field" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_incident_history"))}</label><textarea class="form-field__textarea" rows="4" maxlength="1000" data-v-3474b0b8>${ssrInterpolate(form.incidentHistorySummary)}</textarea><span class="char-count" data-v-3474b0b8>${ssrInterpolate(form.incidentHistorySummary.length)}/1000</span></div><div class="form-grid form-grid--2" data-v-3474b0b8><div class="form-field" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_watch_review_date"))}</label><input${ssrRenderAttr("value", form.watchLevelReviewDate)} type="date" class="form-field__input" data-v-3474b0b8><p class="field-hint" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_watch_review_date_hint"))}</p></div><div class="form-field" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_associated_individuals"))}</label><textarea class="form-field__textarea" rows="3" maxlength="500" data-v-3474b0b8>${ssrInterpolate(form.associatedIndividuals)}</textarea></div></div></div></div></div>`);
				} else _push(`<!---->`);
				if (isTrespass.value) {
					_push(`<div class="form-section form-section--conditional form-section--trespass" data-v-3474b0b8><div class="form-section__header" data-v-3474b0b8>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:ban",
						size: 16
					}, null, _parent));
					_push(`<h2 class="form-section__title" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.section_trespass_details"))}</h2><span class="section-type-badge section-type-badge--trespass" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.type_trespass"))}</span></div><div class="form-section__body" data-v-3474b0b8><div class="form-grid form-grid--2" data-v-3474b0b8><div class="${ssrRenderClass([{ "form-field--error": errors.trespassNoticeNumber }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_notice_number"))} <span class="req" data-v-3474b0b8>*</span></label><input${ssrRenderAttr("value", form.trespassNoticeNumber)} type="text" class="form-field__input" data-v-3474b0b8>`);
					if (errors.trespassNoticeNumber) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.trespassNoticeNumber)}</span>`);
					else _push(`<!---->`);
					_push(`</div><div class="${ssrRenderClass([{ "form-field--error": errors.trespassIssuingAuthority }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_issuing_authority"))} <span class="req" data-v-3474b0b8>*</span></label><input${ssrRenderAttr("value", form.trespassIssuingAuthority)} type="text" class="form-field__input" data-v-3474b0b8>`);
					if (errors.trespassIssuingAuthority) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.trespassIssuingAuthority)}</span>`);
					else _push(`<!---->`);
					_push(`</div><div class="${ssrRenderClass([{ "form-field--error": errors.propertyAreaCovered }, "form-field form-field--full"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_property_area"))} <span class="req" data-v-3474b0b8>*</span></label><textarea class="form-field__textarea" rows="2" data-v-3474b0b8>${ssrInterpolate(form.propertyAreaCovered)}</textarea>`);
					if (errors.propertyAreaCovered) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.propertyAreaCovered)}</span>`);
					else _push(`<!---->`);
					_push(`</div><div class="${ssrRenderClass([{ "form-field--error": errors.trespassIssueDate }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_issue_date"))} <span class="req" data-v-3474b0b8>*</span></label><input${ssrRenderAttr("value", form.trespassIssueDate)} type="date" class="form-field__input" data-v-3474b0b8>`);
					if (errors.trespassIssueDate) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.trespassIssueDate)}</span>`);
					else _push(`<!---->`);
					_push(`</div><div class="${ssrRenderClass([{ "form-field--error": errors.trespassExpiryDate }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_expiry_date"))} <span class="req" data-v-3474b0b8>*</span></label><input${ssrRenderAttr("value", form.trespassExpiryDate)} type="date" class="form-field__input" data-v-3474b0b8>`);
					if (errors.trespassExpiryDate) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.trespassExpiryDate)}</span>`);
					else _push(`<!---->`);
					_push(`</div><div class="form-field" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_renewal_reminder"))}</label><div class="input-with-suffix" data-v-3474b0b8><input${ssrRenderAttr("value", form.trespassRenewalReminder)} type="number" min="1" max="365" class="form-field__input" data-v-3474b0b8><span class="input-suffix" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.days_before_expiry"))}</span></div></div><div class="form-field" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_law_enforcement"))}</label><input${ssrRenderAttr("value", form.lawEnforcementContact)} type="text" class="form-field__input" data-v-3474b0b8></div><div class="form-field form-field--full" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_conditions"))}</label><textarea class="form-field__textarea" rows="3" data-v-3474b0b8>${ssrInterpolate(form.conditions)}</textarea></div><div class="form-field form-field--full" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_notice_document"))} <span class="req" data-v-3474b0b8>*</span></label><div class="file-upload-area" data-v-3474b0b8><label class="file-upload-btn" data-v-3474b0b8>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:upload",
						size: 16
					}, null, _parent));
					_push(`<span data-v-3474b0b8>${ssrInterpolate(trespassDocFile.value ? trespassDocFile.value.name : unref(t)("poi.upload_pdf"))}</span><input type="file" accept=".pdf" class="hidden-input" data-v-3474b0b8></label></div><p class="field-hint" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.notice_doc_hint"))}</p></div></div></div></div>`);
				} else _push(`<!---->`);
				if (isMetro.value) {
					_push(`<div class="form-section form-section--conditional form-section--metro" data-v-3474b0b8><div class="form-section__header" data-v-3474b0b8>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:train-front",
						size: 16
					}, null, _parent));
					_push(`<h2 class="form-section__title" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.section_metro_details"))}</h2><span class="section-type-badge section-type-badge--metro" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.type_metro"))}</span></div><div class="form-section__body" data-v-3474b0b8><div class="form-grid form-grid--2" data-v-3474b0b8><div class="${ssrRenderClass([{ "form-field--error": errors.redCardNumber }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_red_card_number"))} <span class="req" data-v-3474b0b8>*</span></label><input${ssrRenderAttr("value", form.redCardNumber)} type="text" class="form-field__input" data-v-3474b0b8>`);
					if (errors.redCardNumber) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.redCardNumber)}</span>`);
					else _push(`<!---->`);
					_push(`</div><div class="${ssrRenderClass([{ "form-field--error": errors.metroIssuingAuthority }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_issuing_authority"))} <span class="req" data-v-3474b0b8>*</span></label><input${ssrRenderAttr("value", form.metroIssuingAuthority)} type="text" class="form-field__input" data-v-3474b0b8>`);
					if (errors.metroIssuingAuthority) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.metroIssuingAuthority)}</span>`);
					else _push(`<!---->`);
					_push(`</div><div class="${ssrRenderClass([{ "form-field--error": errors.metroIssueDate }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_issue_date"))} <span class="req" data-v-3474b0b8>*</span></label><input${ssrRenderAttr("value", form.metroIssueDate)} type="date" class="form-field__input" data-v-3474b0b8>`);
					if (errors.metroIssueDate) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.metroIssueDate)}</span>`);
					else _push(`<!---->`);
					_push(`</div><div class="${ssrRenderClass([{ "form-field--error": errors.metroExpiryDate }, "form-field"])}" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_expiry_date"))} <span class="req" data-v-3474b0b8>*</span></label><input${ssrRenderAttr("value", form.metroExpiryDate)} type="date" class="form-field__input" data-v-3474b0b8>`);
					if (errors.metroExpiryDate) _push(`<span class="field-error" data-v-3474b0b8>${ssrInterpolate(errors.metroExpiryDate)}</span>`);
					else _push(`<!---->`);
					_push(`</div><div class="form-field form-field--full" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_metro_lines"))}</label><input${ssrRenderAttr("value", form.metroLines)} type="text" class="form-field__input"${ssrRenderAttr("placeholder", unref(t)("poi.field_metro_lines_placeholder"))} data-v-3474b0b8></div><div class="form-field" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_renewal_reminder"))}</label><div class="input-with-suffix" data-v-3474b0b8><input${ssrRenderAttr("value", form.metroRenewalReminder)} type="number" min="1" max="365" class="form-field__input" data-v-3474b0b8><span class="input-suffix" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.days_before_expiry"))}</span></div></div><div class="form-field form-field--full" data-v-3474b0b8><label class="form-field__label" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.field_card_document"))}</label><div class="file-upload-area" data-v-3474b0b8><label class="file-upload-btn" data-v-3474b0b8>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:upload",
						size: 16
					}, null, _parent));
					_push(`<span data-v-3474b0b8>${ssrInterpolate(metroCardFile.value ? metroCardFile.value.name : unref(t)("poi.upload_card_doc"))}</span><input type="file" accept=".pdf,image/*" class="hidden-input" data-v-3474b0b8></label></div><p class="field-hint" data-v-3474b0b8>${ssrInterpolate(unref(t)("poi.card_doc_hint"))}</p></div></div></div></div>`);
				} else _push(`<!---->`);
				_push(`<div class="poi-form__footer" data-v-3474b0b8><button type="button" class="btn-cancel" data-v-3474b0b8>${ssrInterpolate(unref(t)("common.cancel"))}</button><div class="footer-actions-right" data-v-3474b0b8>`);
				if (!isEdit.value) {
					_push(`<button type="button" class="btn-draft"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-3474b0b8>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:save",
						size: 15
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("poi.save_draft"))}</button>`);
				} else _push(`<!---->`);
				_push(`<button type="button" class="btn-publish"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-3474b0b8>`);
				if (isSubmitting.value) _push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 15,
					class: "spin"
				}, null, _parent));
				else _push(ssrRenderComponent(_component_Icon, {
					name: isEdit.value ? "lucide:save" : "lucide:send",
					size: 15
				}, null, _parent));
				_push(` ${ssrInterpolate(isEdit.value ? unref(t)("poi.save_changes") : unref(t)("poi.publish"))}</button></div></div><!--]-->`);
			} else _push(`<!---->`);
			_push(`</div></div>`);
		};
	}
});
//#endregion
//#region app/components/poi/POIForm.vue
var _sfc_setup = POIForm_vue_vue_type_script_setup_true_lang_default.setup;
POIForm_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/poi/POIForm.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var POIForm_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(POIForm_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3474b0b8"]]), { __name: "POIForm" });

export { POIForm_default as P };
//# sourceMappingURL=POIForm-Ck2f-ZSg.mjs.map
