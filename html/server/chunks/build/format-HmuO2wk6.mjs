import { t as components_default } from './components-DWHbB934.mjs';
import { u as useRoute, a as useTranslation, b as useRouter } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, mergeProps, reactive, ref, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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

//#region app/components/reports/TemplateFormatting.vue?vue&type=script&setup=true&lang.ts
var TemplateFormatting_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "TemplateFormatting",
	__ssrInlineRender: true,
	props: { styleSettings: {} },
	setup(__props) {
		const props = __props;
		const { t } = useTranslation();
		useRouter();
		function buildForm() {
			return {
				templateId: props.styleSettings.templateId,
				templateName: props.styleSettings.templateName,
				logoUrl: props.styleSettings.logoUrl,
				accentColour: props.styleSettings.accentColour,
				headerLayout: props.styleSettings.headerLayout,
				font: props.styleSettings.font,
				pageNumbering: props.styleSettings.pageNumbering,
				confidentialityFooter: props.styleSettings.confidentialityFooter,
				dateFormat: props.styleSettings.dateFormat,
				sectionBreaks: props.styleSettings.sectionBreaks,
				includeCoverPage: props.styleSettings.includeCoverPage
			};
		}
		const form = reactive(buildForm());
		const isSubmitting = ref(false);
		const logoPreview = ref(form.logoUrl);
		ref(null);
		const PRESET_COLOURS = [
			"#1d4ed8",
			"#2563eb",
			"#0ea5e9",
			"#14b8a6",
			"#10b981",
			"#84cc16",
			"#f59e0b",
			"#ef4444",
			"#8b5cf6",
			"#ec4899",
			"#64748b",
			"#1e293b"
		];
		const accentPreview = computed(() => form.accentColour || "#1d4ed8");
		const headerLayouts = [
			{
				value: "compact",
				label: "Compact",
				desc: "Logo + title on one line",
				icon: "lucide:layout-template"
			},
			{
				value: "standard",
				label: "Standard",
				desc: "Logo left, title & metadata right",
				icon: "lucide:layout-dashboard"
			},
			{
				value: "full_banner",
				label: "Full-Width Banner",
				desc: "Logo and title in a wide header strip",
				icon: "lucide:layout-panel-top"
			}
		];
		const fontOptions = [
			{
				value: "arial",
				label: "Arial (default)"
			},
			{
				value: "calibri",
				label: "Calibri"
			},
			{
				value: "times_new_roman",
				label: "Times New Roman"
			}
		];
		const dateFormats = [
			{
				value: "MM/DD/YYYY",
				label: "MM/DD/YYYY"
			},
			{
				value: "DD/MM/YYYY",
				label: "DD/MM/YYYY"
			},
			{
				value: "YYYY-MM-DD",
				label: "YYYY-MM-DD"
			}
		];
		const sectionBreakOptions = [{
			value: "continuous",
			label: "Continuous",
			desc: "Sections separated by a divider line only"
		}, {
			value: "new_page",
			label: "New Page",
			desc: "Each section starts on a new page"
		}];
		const todayFormatted = computed(() => {
			const d = /* @__PURE__ */ new Date();
			const mm = String(d.getMonth() + 1).padStart(2, "0");
			const dd = String(d.getDate()).padStart(2, "0");
			const yyyy = d.getFullYear();
			return {
				"MM/DD/YYYY": `${mm}/${dd}/${yyyy}`,
				"DD/MM/YYYY": `${dd}/${mm}/${yyyy}`,
				"YYYY-MM-DD": `${yyyy}-${mm}-${dd}`
			}[form.dateFormat] ?? `${dd}/${mm}/${yyyy}`;
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "tpl-fmt" }, _attrs))} data-v-0a56b8e2><div class="tpl-fmt__page-header" data-v-0a56b8e2><button class="back-btn" data-v-0a56b8e2>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:arrow-left",
				size: 16
			}, null, _parent));
			_push(`</button><div class="tpl-fmt__page-title-area" data-v-0a56b8e2><h1 class="tpl-fmt__page-title" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.title"))}</h1><p class="tpl-fmt__page-sub" data-v-0a56b8e2>${ssrInterpolate(form.templateName)}</p></div><div class="tpl-fmt__header-actions" data-v-0a56b8e2><button class="btn-cancel" data-v-0a56b8e2>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn-save"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-0a56b8e2>`);
			if (isSubmitting.value) _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:loader-2",
				size: 14,
				class: "spin"
			}, null, _parent));
			else _push(ssrRenderComponent(_component_Icon, {
				name: "lucide:check",
				size: 14
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("fmt.save"))}</button></div></div><div class="tpl-fmt__body" data-v-0a56b8e2><div class="tpl-fmt__settings" data-v-0a56b8e2><section class="fmt-section" data-v-0a56b8e2><h3 class="fmt-section__title" data-v-0a56b8e2>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:image",
				size: 15
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("fmt.section_branding"))}</h3><div class="fmt-field" data-v-0a56b8e2><label class="fmt-field__label" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.logo"))}</label><div class="logo-upload-area" data-v-0a56b8e2>`);
			if (logoPreview.value) {
				_push(`<div class="logo-preview-wrap" data-v-0a56b8e2><img${ssrRenderAttr("src", logoPreview.value)} alt="logo" class="logo-preview-img" data-v-0a56b8e2><button class="logo-remove-btn" data-v-0a56b8e2>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 12
				}, null, _parent));
				_push(`</button></div>`);
			} else {
				_push(`<div class="logo-upload-placeholder" data-v-0a56b8e2>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:upload-cloud",
					size: 24,
					class: "upload-icon"
				}, null, _parent));
				_push(`<span data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.logo_upload_hint"))}</span><span class="logo-upload-sub" data-v-0a56b8e2>PNG, JPG up to 2 MB</span></div>`);
			}
			_push(`</div><input type="file" accept="image/png,image/jpeg,image/svg+xml" class="sr-only" data-v-0a56b8e2></div><div class="fmt-field" data-v-0a56b8e2><label class="fmt-field__label" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.accent_colour"))}</label><div class="colour-row" data-v-0a56b8e2><div class="colour-input-wrap" data-v-0a56b8e2><input${ssrRenderAttr("value", form.accentColour)} type="color" class="colour-picker" data-v-0a56b8e2><input${ssrRenderAttr("value", form.accentColour)} type="text" class="colour-hex-input" maxlength="7" placeholder="#1d4ed8" data-v-0a56b8e2></div><div class="colour-presets" data-v-0a56b8e2><!--[-->`);
			ssrRenderList(PRESET_COLOURS, (c) => {
				_push(`<button class="${ssrRenderClass([{ "colour-preset--active": form.accentColour === c }, "colour-preset"])}" style="${ssrRenderStyle({ background: c })}"${ssrRenderAttr("title", c)} data-v-0a56b8e2></button>`);
			});
			_push(`<!--]--></div></div></div></section><section class="fmt-section" data-v-0a56b8e2><h3 class="fmt-section__title" data-v-0a56b8e2>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:layout-template",
				size: 15
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("fmt.section_layout"))}</h3><div class="fmt-field" data-v-0a56b8e2><label class="fmt-field__label" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.header_layout"))}</label><div class="layout-cards" data-v-0a56b8e2><!--[-->`);
			ssrRenderList(headerLayouts, (opt) => {
				_push(`<button class="${ssrRenderClass([{ "layout-card--active": form.headerLayout === opt.value }, "layout-card"])}" data-v-0a56b8e2>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: opt.icon,
					size: 20
				}, null, _parent));
				_push(`<span class="layout-card__label" data-v-0a56b8e2>${ssrInterpolate(opt.label)}</span><span class="layout-card__desc" data-v-0a56b8e2>${ssrInterpolate(opt.desc)}</span></button>`);
			});
			_push(`<!--]--></div></div><div class="fmt-field" data-v-0a56b8e2><label class="fmt-field__label" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.font"))}</label><select class="fmt-select" data-v-0a56b8e2><!--[-->`);
			ssrRenderList(fontOptions, (f) => {
				_push(`<option${ssrRenderAttr("value", f.value)} data-v-0a56b8e2${ssrIncludeBooleanAttr(Array.isArray(form.font) ? ssrLooseContain(form.font, f.value) : ssrLooseEqual(form.font, f.value)) ? " selected" : ""}>${ssrInterpolate(f.label)}</option>`);
			});
			_push(`<!--]--></select></div></section><section class="fmt-section" data-v-0a56b8e2><h3 class="fmt-section__title" data-v-0a56b8e2>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:file-text",
				size: 15
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("fmt.section_page"))}</h3><div class="fmt-field" data-v-0a56b8e2><label class="fmt-field__label" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.date_format"))}</label><div class="segmented-group" data-v-0a56b8e2><!--[-->`);
			ssrRenderList(dateFormats, (df) => {
				_push(`<button class="${ssrRenderClass([{ "segmented-btn--active": form.dateFormat === df.value }, "segmented-btn"])}" data-v-0a56b8e2>${ssrInterpolate(df.label)}</button>`);
			});
			_push(`<!--]--></div><span class="fmt-field__hint" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.date_format_preview"))}: <strong data-v-0a56b8e2>${ssrInterpolate(todayFormatted.value)}</strong></span></div><div class="fmt-field" data-v-0a56b8e2><label class="fmt-field__label" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.section_breaks"))}</label><div class="radio-group" data-v-0a56b8e2><!--[-->`);
			ssrRenderList(sectionBreakOptions, (opt) => {
				_push(`<label class="${ssrRenderClass([{ "radio-option--active": form.sectionBreaks === opt.value }, "radio-option"])}" data-v-0a56b8e2><span class="${ssrRenderClass([{ "radio-dot--on": form.sectionBreaks === opt.value }, "radio-dot"])}" data-v-0a56b8e2></span><span class="radio-option__text" data-v-0a56b8e2><span class="radio-option__label" data-v-0a56b8e2>${ssrInterpolate(opt.label)}</span><span class="radio-option__desc" data-v-0a56b8e2>${ssrInterpolate(opt.desc)}</span></span></label>`);
			});
			_push(`<!--]--></div></div><div class="toggle-list" data-v-0a56b8e2><div class="toggle-row" data-v-0a56b8e2><div class="toggle-row__info" data-v-0a56b8e2><span class="toggle-row__label" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.page_numbering"))}</span><span class="toggle-row__desc" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.page_numbering_desc"))}</span></div><button class="${ssrRenderClass([{ "toggle-switch--on": form.pageNumbering }, "toggle-switch"])}" data-v-0a56b8e2><span class="toggle-switch__thumb" data-v-0a56b8e2></span></button></div><div class="toggle-row" data-v-0a56b8e2><div class="toggle-row__info" data-v-0a56b8e2><span class="toggle-row__label" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.include_cover_page"))}</span><span class="toggle-row__desc" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.include_cover_page_desc"))}</span></div><button class="${ssrRenderClass([{ "toggle-switch--on": form.includeCoverPage }, "toggle-switch"])}" data-v-0a56b8e2><span class="toggle-switch__thumb" data-v-0a56b8e2></span></button></div></div><div class="fmt-field" data-v-0a56b8e2><label class="fmt-field__label" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.confidentiality_footer"))}</label><input${ssrRenderAttr("value", form.confidentialityFooter)} type="text" class="fmt-input"${ssrRenderAttr("placeholder", unref(t)("fmt.confidentiality_footer_placeholder"))} data-v-0a56b8e2><span class="fmt-field__hint" data-v-0a56b8e2>${ssrInterpolate(unref(t)("fmt.confidentiality_footer_hint"))}</span></div></section></div><div class="tpl-fmt__preview" data-v-0a56b8e2><div class="preview-label" data-v-0a56b8e2>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:eye",
				size: 13
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("fmt.preview_label"))}</div><div class="preview-doc" style="${ssrRenderStyle({ "--preview-accent": accentPreview.value })}" data-v-0a56b8e2>`);
			if (form.includeCoverPage) {
				_push(`<div class="preview-cover" data-v-0a56b8e2><div class="preview-cover__accent-bar" data-v-0a56b8e2></div>`);
				if (logoPreview.value) _push(`<div class="preview-cover__logo-wrap" data-v-0a56b8e2><img${ssrRenderAttr("src", logoPreview.value)} class="preview-cover__logo" alt="logo" data-v-0a56b8e2></div>`);
				else _push(`<!---->`);
				_push(`<div class="preview-cover__title" data-v-0a56b8e2>${ssrInterpolate(form.templateName)}</div><div class="preview-cover__meta" data-v-0a56b8e2><span data-v-0a56b8e2>Sunset Heights</span><span data-v-0a56b8e2>Officer: J. Smith</span><span data-v-0a56b8e2>${ssrInterpolate(todayFormatted.value)}</span></div></div>`);
			} else _push(`<!---->`);
			_push(`<div class="${ssrRenderClass([{
				"preview-header--compact": form.headerLayout === "compact",
				"preview-header--standard": form.headerLayout === "standard",
				"preview-header--full-banner": form.headerLayout === "full_banner"
			}, "preview-header"])}" data-v-0a56b8e2>`);
			if (logoPreview.value) _push(`<div class="preview-header__logo-wrap" data-v-0a56b8e2><img${ssrRenderAttr("src", logoPreview.value)} class="preview-header__logo" alt="logo" data-v-0a56b8e2></div>`);
			else _push(`<div class="preview-header__logo-placeholder" data-v-0a56b8e2>LOGO</div>`);
			_push(`<div class="preview-header__text" data-v-0a56b8e2><div class="preview-header__report-title" data-v-0a56b8e2>${ssrInterpolate(form.templateName)}</div><div class="preview-header__meta" data-v-0a56b8e2>Sunset Heights · ${ssrInterpolate(todayFormatted.value)} · J. Smith</div></div></div><div class="preview-section" data-v-0a56b8e2><div class="preview-section__heading" data-v-0a56b8e2>Incident Details</div><div class="preview-field-row" data-v-0a56b8e2><span class="preview-field__label" data-v-0a56b8e2>Incident Type</span><span class="preview-field__value" data-v-0a56b8e2>Trespassing</span></div><div class="preview-field-row" data-v-0a56b8e2><span class="preview-field__label" data-v-0a56b8e2>Date &amp; Time</span><span class="preview-field__value" data-v-0a56b8e2>${ssrInterpolate(todayFormatted.value)}, 14:32</span></div><div class="preview-field-row" data-v-0a56b8e2><span class="preview-field__label" data-v-0a56b8e2>Location</span><span class="preview-field__value" data-v-0a56b8e2>Gate B, North Entrance</span></div></div>`);
			if (form.sectionBreaks === "new_page") _push(`<div class="preview-page-break" data-v-0a56b8e2><span data-v-0a56b8e2>— page break —</span></div>`);
			else _push(`<div class="preview-section-divider" data-v-0a56b8e2></div>`);
			_push(`<div class="preview-section" data-v-0a56b8e2><div class="preview-section__heading" data-v-0a56b8e2>Narrative</div><div class="preview-field-row preview-field-row--full" data-v-0a56b8e2><span class="preview-field__value" data-v-0a56b8e2>At approximately 14:32, the officer observed an individual attempting to climb the perimeter fence at Gate B...</span></div></div><div class="preview-footer" data-v-0a56b8e2><span class="preview-footer__confidential" data-v-0a56b8e2>${ssrInterpolate(form.confidentialityFooter || "")}</span>`);
			if (form.pageNumbering) _push(`<span class="preview-footer__page" data-v-0a56b8e2>Page 1 of 3</span>`);
			else _push(`<!---->`);
			_push(`</div></div></div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/reports/TemplateFormatting.vue
var _sfc_setup$1 = TemplateFormatting_vue_vue_type_script_setup_true_lang_default.setup;
TemplateFormatting_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/reports/TemplateFormatting.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var TemplateFormatting_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(TemplateFormatting_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-0a56b8e2"]]), { __name: "TemplateFormatting" });
//#endregion
//#region app/pages/reports/[id]/format.vue?vue&type=script&setup=true&lang.ts
var format_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "format",
	__ssrInlineRender: true,
	setup(__props) {
		const route = useRoute();
		const demoStyle = {
			templateId: String(route.params.id),
			templateName: "Standard Incident Report",
			logoUrl: null,
			accentColour: "#1d4ed8",
			headerLayout: "standard",
			font: "arial",
			pageNumbering: true,
			confidentialityFooter: "CONFIDENTIAL – FOR AUTHORISED RECIPIENTS ONLY",
			dateFormat: "DD/MM/YYYY",
			sectionBreaks: "continuous",
			includeCoverPage: false
		};
		return (_ctx, _push, _parent, _attrs) => {
			const _component_TemplateFormatting = TemplateFormatting_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "reports-format-page" }, _attrs))} data-v-59215430>`);
			_push(ssrRenderComponent(_component_TemplateFormatting, { "style-settings": demoStyle }, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/reports/[id]/format.vue
var _sfc_setup = format_vue_vue_type_script_setup_true_lang_default.setup;
format_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reports/[id]/format.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var format_default = /*#__PURE__*/ _plugin_vue_export_helper_default(format_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-59215430"]]);

export { format_default as default };
//# sourceMappingURL=format-HmuO2wk6.mjs.map
