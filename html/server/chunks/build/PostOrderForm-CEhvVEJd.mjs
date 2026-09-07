import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, N as NuxtLink, n as navigateTo } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { F as FileUpload_default } from './FileUpload-B-39JGGf.mjs';
import { B as Badge_default } from './Badge-BbyZfskr.mjs';
import { A as AppDialogModal_default } from './AppDialogModal-CYp4oRY_.mjs';
import { defineComponent, computed, ref, unref, withCtx, createTextVNode, toDisplayString, mergeProps, createVNode, withDirectives, vModelRadio, vModelText, vModelCheckbox, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrRenderAttrs, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';

//#region app/components/post-orders/PostOrderSection.vue?vue&type=script&setup=true&lang.ts
var PostOrderSection_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PostOrderSection",
	__ssrInlineRender: true,
	props: {
		modelValue: {},
		index: {},
		total: {},
		sectionTypes: {}
	},
	emits: [
		"update:modelValue",
		"move-up",
		"move-down",
		"remove"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const { t } = useTranslation();
		const collapsed = ref(false);
		function update(key, value) {
			emit("update:modelValue", {
				...props.modelValue,
				[key]: value
			});
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_FileUpload = FileUpload_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["form-card section-card", { "section-card--collapsed": unref(collapsed) }] }, _attrs))} data-v-40c6909f><div class="form-card__header" data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:layers",
				size: 18
			}, null, _parent));
			_push(`<h3 class="form-card__title" data-v-40c6909f><span class="section-card__index" data-v-40c6909f>${ssrInterpolate(unref(t)("post_orders.section_label", { n: String(__props.index + 1) }))}</span>`);
			if (__props.modelValue.title) _push(`<span class="section-card__title-text" data-v-40c6909f>— ${ssrInterpolate(__props.modelValue.title)}</span>`);
			else _push(`<!---->`);
			_push(`</h3><div class="section-card__controls" data-v-40c6909f><button class="icon-btn"${ssrIncludeBooleanAttr(__props.index === 0) ? " disabled" : ""}${ssrRenderAttr("title", unref(t)("post_orders.move_up"))} data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevron-up",
				size: 15
			}, null, _parent));
			_push(`</button><button class="icon-btn"${ssrIncludeBooleanAttr(__props.index === __props.total - 1) ? " disabled" : ""}${ssrRenderAttr("title", unref(t)("post_orders.move_down"))} data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:chevron-down",
				size: 15
			}, null, _parent));
			_push(`</button><button class="icon-btn icon-btn--danger"${ssrIncludeBooleanAttr(__props.total === 1) ? " disabled" : ""}${ssrRenderAttr("title", unref(t)("post_orders.remove_section"))} data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:trash-2",
				size: 15
			}, null, _parent));
			_push(`</button><div class="toolbar-sep" data-v-40c6909f></div><button class="icon-btn"${ssrRenderAttr("title", unref(collapsed) ? "Expand" : "Collapse")} data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: unref(collapsed) ? "lucide:chevron-down" : "lucide:chevron-up",
				size: 15
			}, null, _parent));
			_push(`</button></div></div><div class="section-grid" style="${ssrRenderStyle(!unref(collapsed) ? null : { display: "none" })}" data-v-40c6909f><div class="field" data-v-40c6909f><label class="field__label" data-v-40c6909f>${ssrInterpolate(unref(t)("post_orders.field_section_type"))} <span class="required" data-v-40c6909f>*</span></label><select${ssrRenderAttr("value", __props.modelValue.type)} class="field__select" data-v-40c6909f><!--[-->`);
			ssrRenderList(__props.sectionTypes, (st) => {
				_push(`<option${ssrRenderAttr("value", st.name)} data-v-40c6909f>${ssrInterpolate(st.name)}</option>`);
			});
			_push(`<!--]--></select></div><div class="field" data-v-40c6909f><label class="field__label" data-v-40c6909f>${ssrInterpolate(unref(t)("post_orders.field_section_title"))} <span class="required" data-v-40c6909f>*</span></label><input${ssrRenderAttr("value", __props.modelValue.title)} type="text" class="field__input" maxlength="80"${ssrRenderAttr("placeholder", unref(t)("post_orders.field_section_title_placeholder"))} data-v-40c6909f></div><div class="field field--toggle" data-v-40c6909f><label class="field__label" data-v-40c6909f>${ssrInterpolate(unref(t)("post_orders.field_client_visible"))}</label><label class="toggle" data-v-40c6909f><input${ssrIncludeBooleanAttr(__props.modelValue.clientVisible) ? " checked" : ""} type="checkbox" class="toggle__input" data-v-40c6909f><span class="toggle__track" data-v-40c6909f><span class="toggle__thumb" data-v-40c6909f></span></span><span class="toggle__label" data-v-40c6909f>${ssrInterpolate(__props.modelValue.clientVisible ? unref(t)("common.yes") : unref(t)("common.no"))}</span></label></div><div class="field field--full" data-v-40c6909f><label class="field__label" data-v-40c6909f>${ssrInterpolate(unref(t)("post_orders.field_description"))} <span class="required" data-v-40c6909f>*</span></label><div class="rich-editor" data-v-40c6909f><div class="rich-editor__toolbar" data-v-40c6909f><button type="button" class="toolbar-btn" title="Bold" data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:bold",
				size: 14
			}, null, _parent));
			_push(`</button><button type="button" class="toolbar-btn" title="Italic" data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:italic",
				size: 14
			}, null, _parent));
			_push(`</button><button type="button" class="toolbar-btn" title="Underline" data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:underline",
				size: 14
			}, null, _parent));
			_push(`</button><div class="toolbar-sep" data-v-40c6909f></div><button type="button" class="toolbar-btn" title="Bullet List" data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:list",
				size: 14
			}, null, _parent));
			_push(`</button><button type="button" class="toolbar-btn" title="Numbered List" data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:list-ordered",
				size: 14
			}, null, _parent));
			_push(`</button><div class="toolbar-sep" data-v-40c6909f></div><button type="button" class="toolbar-btn" title="Link" data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:link",
				size: 14
			}, null, _parent));
			_push(`</button></div><textarea class="rich-editor__textarea" maxlength="10000"${ssrRenderAttr("placeholder", unref(t)("post_orders.field_description_placeholder"))} rows="6" data-v-40c6909f>${ssrInterpolate(__props.modelValue.description)}</textarea><div class="rich-editor__count" data-v-40c6909f>${ssrInterpolate(__props.modelValue.description.length)} / 10,000</div></div></div><div class="field field--full" data-v-40c6909f>`);
			_push(ssrRenderComponent(_component_FileUpload, {
				"model-value": __props.modelValue.attachments,
				accept: ".pdf,.jpg,.jpeg,.png,.mp4",
				"max-files": 5,
				"max-size-mb": 20,
				"call-api": false,
				label: unref(t)("post_orders.field_attachments"),
				hint: unref(t)("post_orders.field_attachments_hint"),
				"onUpdate:modelValue": ($event) => update("attachments", $event)
			}, null, _parent));
			_push(`</div><div class="field field--full" data-v-40c6909f><label class="field__label" data-v-40c6909f>${ssrInterpolate(unref(t)("post_orders.field_notes"))}</label><textarea class="field__textarea" maxlength="2000"${ssrRenderAttr("placeholder", unref(t)("post_orders.field_notes_placeholder"))} rows="3" data-v-40c6909f>${ssrInterpolate(__props.modelValue.notes)}</textarea><div class="field__count" data-v-40c6909f>${ssrInterpolate(__props.modelValue.notes.length)} / 2,000</div></div></div></div>`);
		};
	}
});
//#endregion
//#region app/components/post-orders/PostOrderSection.vue
var _sfc_setup$3 = PostOrderSection_vue_vue_type_script_setup_true_lang_default.setup;
PostOrderSection_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/post-orders/PostOrderSection.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var PostOrderSection_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PostOrderSection_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-40c6909f"]]), { __name: "PostOrderSection" });
//#endregion
//#region app/components/post-orders/PostOrderHistory.vue?vue&type=script&setup=true&lang.ts
var PostOrderHistory_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PostOrderHistory",
	__ssrInlineRender: true,
	props: { entries: {} },
	emits: ["view"],
	setup(__props, { emit: __emit }) {
		const { t } = useTranslation();
		const collapsed = ref(false);
		function formatDateTime(iso) {
			return new Date(iso).toLocaleString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		function formatDate(iso) {
			return new Date(iso).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric"
			});
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["history-card", { "history-card--collapsed": collapsed.value }] }, _attrs))} data-v-7f9cbf03><div class="history-card__header" data-v-7f9cbf03>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:history",
				size: 18
			}, null, _parent));
			_push(`<h3 class="history-card__title" data-v-7f9cbf03>${ssrInterpolate(unref(t)("post_orders.history_title"))}</h3><span class="history-card__count" data-v-7f9cbf03>${ssrInterpolate(__props.entries.length)} ${ssrInterpolate(unref(t)("post_orders.history_versions"))}</span><button class="icon-btn"${ssrRenderAttr("title", collapsed.value ? "Expand" : "Collapse")} data-v-7f9cbf03>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: collapsed.value ? "lucide:chevron-down" : "lucide:chevron-up",
				size: 15
			}, null, _parent));
			_push(`</button></div><div class="history-card__body" style="${ssrRenderStyle(!collapsed.value ? null : { display: "none" })}" data-v-7f9cbf03>`);
			if (__props.entries.length === 0) {
				_push(`<div class="history-empty" data-v-7f9cbf03>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:inbox",
					size: 32,
					class: "history-empty__icon"
				}, null, _parent));
				_push(`<p data-v-7f9cbf03>${ssrInterpolate(unref(t)("post_orders.history_empty"))}</p></div>`);
			} else {
				_push(`<table class="history-table" data-v-7f9cbf03><thead data-v-7f9cbf03><tr data-v-7f9cbf03><th data-v-7f9cbf03>${ssrInterpolate(unref(t)("post_orders.history_col_version"))}</th><th data-v-7f9cbf03>${ssrInterpolate(unref(t)("post_orders.history_col_type"))}</th><th data-v-7f9cbf03>${ssrInterpolate(unref(t)("post_orders.history_col_published_by"))}</th><th data-v-7f9cbf03>${ssrInterpolate(unref(t)("post_orders.history_col_published_at"))}</th><th data-v-7f9cbf03>${ssrInterpolate(unref(t)("post_orders.history_col_effective_date"))}</th><th data-v-7f9cbf03>${ssrInterpolate(unref(t)("post_orders.history_col_summary"))}</th><th class="col-actions" data-v-7f9cbf03></th></tr></thead><tbody data-v-7f9cbf03><!--[-->`);
				ssrRenderList(__props.entries, (entry) => {
					_push(`<tr class="history-row" data-v-7f9cbf03><td data-v-7f9cbf03><span class="version-badge" data-v-7f9cbf03>v${ssrInterpolate(entry.version)}</span></td><td data-v-7f9cbf03><span class="${ssrRenderClass([entry.versionType === "major" ? "type-badge--major" : "type-badge--minor", "type-badge"])}" data-v-7f9cbf03>${ssrInterpolate(entry.versionType === "major" ? unref(t)("post_orders.publish_version_major") : unref(t)("post_orders.publish_version_minor"))}</span></td><td class="cell-text" data-v-7f9cbf03>${ssrInterpolate(entry.publishedBy)}</td><td class="cell-muted" data-v-7f9cbf03>${ssrInterpolate(formatDateTime(entry.publishedAt))}</td><td class="cell-muted" data-v-7f9cbf03>${ssrInterpolate(formatDate(entry.effectiveDate))}</td><td class="cell-summary" data-v-7f9cbf03>${ssrInterpolate(entry.changeSummary)}</td><td class="col-actions" data-v-7f9cbf03><button class="view-btn"${ssrRenderAttr("title", unref(t)("common.view"))} data-v-7f9cbf03>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:eye",
						size: 14
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("common.view"))}</button></td></tr>`);
				});
				_push(`<!--]--></tbody></table>`);
			}
			_push(`</div></div>`);
		};
	}
});
//#endregion
//#region app/components/post-orders/PostOrderHistory.vue
var _sfc_setup$2 = PostOrderHistory_vue_vue_type_script_setup_true_lang_default.setup;
PostOrderHistory_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/post-orders/PostOrderHistory.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var PostOrderHistory_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PostOrderHistory_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-7f9cbf03"]]), { __name: "PostOrderHistory" });
//#endregion
//#region app/components/post-orders/PublishPostOrderModal.vue?vue&type=script&setup=true&lang.ts
var PublishPostOrderModal_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PublishPostOrderModal",
	__ssrInlineRender: true,
	props: {
		show: { type: Boolean },
		currentVersion: {}
	},
	emits: ["close", "confirm"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const { t } = useTranslation();
		const versionType = ref("minor");
		const changeSummary = ref("");
		const effectiveDate = ref((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
		const notifyOfficers = ref(true);
		const nextVersion = computed(() => {
			const [major, minor] = (props.currentVersion ?? "1.0").split(".").map(Number);
			if (versionType.value === "major") return `${(major ?? 1) + 1}.0`;
			return `${major ?? 1}.${(minor ?? 0) + 1}`;
		});
		const canSubmit = computed(() => changeSummary.value.trim().length > 0 && effectiveDate.value.length > 0);
		function handleConfirm() {
			if (!canSubmit.value) return;
			emit("confirm", {
				versionType: versionType.value,
				changeSummary: changeSummary.value.trim(),
				effectiveDate: effectiveDate.value,
				notifyOfficers: notifyOfficers.value
			});
		}
		function handleClose() {
			emit("close");
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_AppDialogModal = AppDialogModal_default;
			const _component_Icon = components_default;
			_push(ssrRenderComponent(_component_AppDialogModal, mergeProps({
				show: __props.show,
				title: unref(t)("post_orders.publish_modal_title"),
				"max-width": "520px",
				onClose: handleClose
			}, _attrs), {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="btn-secondary" data-v-812ca71f${_scopeId}>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn-primary"${ssrIncludeBooleanAttr(!canSubmit.value) ? " disabled" : ""} data-v-812ca71f${_scopeId}>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:send",
							size: 15
						}, null, _parent, _scopeId));
						_push(` ${ssrInterpolate(unref(t)("post_orders.publish_confirm"))}</button>`);
					} else return [createVNode("button", {
						class: "btn-secondary",
						onClick: handleClose
					}, toDisplayString(unref(t)("common.cancel")), 1), createVNode("button", {
						class: "btn-primary",
						disabled: !canSubmit.value,
						onClick: handleConfirm
					}, [createVNode(_component_Icon, {
						name: "lucide:send",
						size: 15
					}), createTextVNode(" " + toDisplayString(unref(t)("post_orders.publish_confirm")), 1)], 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="publish-form" data-v-812ca71f${_scopeId}><div class="pf-field" data-v-812ca71f${_scopeId}><label class="pf-label" data-v-812ca71f${_scopeId}>${ssrInterpolate(unref(t)("post_orders.publish_version_type"))} <span class="required" data-v-812ca71f${_scopeId}>*</span></label><div class="pf-radio-group" data-v-812ca71f${_scopeId}><label class="${ssrRenderClass([{ "pf-radio--active": versionType.value === "minor" }, "pf-radio"])}" data-v-812ca71f${_scopeId}><input${ssrIncludeBooleanAttr(ssrLooseEqual(versionType.value, "minor")) ? " checked" : ""} type="radio" value="minor" class="pf-radio__input" data-v-812ca71f${_scopeId}><span class="pf-radio__box" data-v-812ca71f${_scopeId}></span><span class="pf-radio__content" data-v-812ca71f${_scopeId}><span class="pf-radio__title" data-v-812ca71f${_scopeId}>${ssrInterpolate(unref(t)("post_orders.publish_version_minor"))}</span><span class="pf-radio__desc" data-v-812ca71f${_scopeId}>${ssrInterpolate(unref(t)("post_orders.publish_version_minor_desc"))}</span></span><span class="pf-radio__badge" data-v-812ca71f${_scopeId}>v${ssrInterpolate(nextVersion.value)}</span></label><label class="${ssrRenderClass([{ "pf-radio--active": versionType.value === "major" }, "pf-radio"])}" data-v-812ca71f${_scopeId}><input${ssrIncludeBooleanAttr(ssrLooseEqual(versionType.value, "major")) ? " checked" : ""} type="radio" value="major" class="pf-radio__input" data-v-812ca71f${_scopeId}><span class="pf-radio__box" data-v-812ca71f${_scopeId}></span><span class="pf-radio__content" data-v-812ca71f${_scopeId}><span class="pf-radio__title" data-v-812ca71f${_scopeId}>${ssrInterpolate(unref(t)("post_orders.publish_version_major"))}</span><span class="pf-radio__desc" data-v-812ca71f${_scopeId}>${ssrInterpolate(unref(t)("post_orders.publish_version_major_desc"))}</span></span><span class="pf-radio__badge pf-radio__badge--major" data-v-812ca71f${_scopeId}>v${ssrInterpolate(nextVersion.value)}</span></label></div></div><div class="pf-field" data-v-812ca71f${_scopeId}><label class="pf-label" data-v-812ca71f${_scopeId}>${ssrInterpolate(unref(t)("post_orders.publish_change_summary"))} <span class="required" data-v-812ca71f${_scopeId}>*</span></label><textarea class="pf-textarea" maxlength="200" rows="3"${ssrRenderAttr("placeholder", unref(t)("post_orders.publish_change_summary_placeholder"))} data-v-812ca71f${_scopeId}>${ssrInterpolate(changeSummary.value)}</textarea><span class="pf-count" data-v-812ca71f${_scopeId}>${ssrInterpolate(changeSummary.value.length)} / 200</span></div><div class="pf-field" data-v-812ca71f${_scopeId}><label class="pf-label" data-v-812ca71f${_scopeId}>${ssrInterpolate(unref(t)("post_orders.publish_effective_date"))} <span class="required" data-v-812ca71f${_scopeId}>*</span></label><input${ssrRenderAttr("value", effectiveDate.value)} type="date" class="pf-input" data-v-812ca71f${_scopeId}></div><div class="pf-field pf-field--row" data-v-812ca71f${_scopeId}><div class="pf-field__text" data-v-812ca71f${_scopeId}><span class="pf-label" data-v-812ca71f${_scopeId}>${ssrInterpolate(unref(t)("post_orders.publish_notify_officers"))}</span><span class="pf-hint" data-v-812ca71f${_scopeId}>${ssrInterpolate(unref(t)("post_orders.publish_notify_officers_hint"))}</span></div><label class="toggle" data-v-812ca71f${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(notifyOfficers.value) ? ssrLooseContain(notifyOfficers.value, null) : notifyOfficers.value) ? " checked" : ""} type="checkbox" class="toggle__input" data-v-812ca71f${_scopeId}><span class="toggle__track" data-v-812ca71f${_scopeId}><span class="toggle__thumb" data-v-812ca71f${_scopeId}></span></span></label></div></div>`);
					else return [createVNode("div", { class: "publish-form" }, [
						createVNode("div", { class: "pf-field" }, [createVNode("label", { class: "pf-label" }, [createTextVNode(toDisplayString(unref(t)("post_orders.publish_version_type")) + " ", 1), createVNode("span", { class: "required" }, "*")]), createVNode("div", { class: "pf-radio-group" }, [createVNode("label", { class: ["pf-radio", { "pf-radio--active": versionType.value === "minor" }] }, [
							withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => versionType.value = $event,
								type: "radio",
								value: "minor",
								class: "pf-radio__input"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelRadio, versionType.value]]),
							createVNode("span", { class: "pf-radio__box" }),
							createVNode("span", { class: "pf-radio__content" }, [createVNode("span", { class: "pf-radio__title" }, toDisplayString(unref(t)("post_orders.publish_version_minor")), 1), createVNode("span", { class: "pf-radio__desc" }, toDisplayString(unref(t)("post_orders.publish_version_minor_desc")), 1)]),
							createVNode("span", { class: "pf-radio__badge" }, "v" + toDisplayString(nextVersion.value), 1)
						], 2), createVNode("label", { class: ["pf-radio", { "pf-radio--active": versionType.value === "major" }] }, [
							withDirectives(createVNode("input", {
								"onUpdate:modelValue": ($event) => versionType.value = $event,
								type: "radio",
								value: "major",
								class: "pf-radio__input"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelRadio, versionType.value]]),
							createVNode("span", { class: "pf-radio__box" }),
							createVNode("span", { class: "pf-radio__content" }, [createVNode("span", { class: "pf-radio__title" }, toDisplayString(unref(t)("post_orders.publish_version_major")), 1), createVNode("span", { class: "pf-radio__desc" }, toDisplayString(unref(t)("post_orders.publish_version_major_desc")), 1)]),
							createVNode("span", { class: "pf-radio__badge pf-radio__badge--major" }, "v" + toDisplayString(nextVersion.value), 1)
						], 2)])]),
						createVNode("div", { class: "pf-field" }, [
							createVNode("label", { class: "pf-label" }, [createTextVNode(toDisplayString(unref(t)("post_orders.publish_change_summary")) + " ", 1), createVNode("span", { class: "required" }, "*")]),
							withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => changeSummary.value = $event,
								class: "pf-textarea",
								maxlength: "200",
								rows: "3",
								placeholder: unref(t)("post_orders.publish_change_summary_placeholder")
							}, null, 8, ["onUpdate:modelValue", "placeholder"]), [[vModelText, changeSummary.value]]),
							createVNode("span", { class: "pf-count" }, toDisplayString(changeSummary.value.length) + " / 200", 1)
						]),
						createVNode("div", { class: "pf-field" }, [createVNode("label", { class: "pf-label" }, [createTextVNode(toDisplayString(unref(t)("post_orders.publish_effective_date")) + " ", 1), createVNode("span", { class: "required" }, "*")]), withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => effectiveDate.value = $event,
							type: "date",
							class: "pf-input"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, effectiveDate.value]])]),
						createVNode("div", { class: "pf-field pf-field--row" }, [createVNode("div", { class: "pf-field__text" }, [createVNode("span", { class: "pf-label" }, toDisplayString(unref(t)("post_orders.publish_notify_officers")), 1), createVNode("span", { class: "pf-hint" }, toDisplayString(unref(t)("post_orders.publish_notify_officers_hint")), 1)]), createVNode("label", { class: "toggle" }, [withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => notifyOfficers.value = $event,
							type: "checkbox",
							class: "toggle__input"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, notifyOfficers.value]]), createVNode("span", { class: "toggle__track" }, [createVNode("span", { class: "toggle__thumb" })])])])
					])];
				}),
				_: 1
			}, _parent));
		};
	}
});
//#endregion
//#region app/components/post-orders/PublishPostOrderModal.vue
var _sfc_setup$1 = PublishPostOrderModal_vue_vue_type_script_setup_true_lang_default.setup;
PublishPostOrderModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/post-orders/PublishPostOrderModal.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var PublishPostOrderModal_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PublishPostOrderModal_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-812ca71f"]]), { __name: "PublishPostOrderModal" });
//#endregion
//#region app/components/post-orders/PostOrderForm.vue?vue&type=script&setup=true&lang.ts
var PostOrderForm_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PostOrderForm",
	__ssrInlineRender: true,
	props: {
		mode: { default: "create" },
		postOrderId: { default: "" },
		historyEntries: {}
	},
	setup(__props) {
		const props = __props;
		const isEditMode = computed(() => props.mode === "edit");
		const { t } = useTranslation();
		const sectionTypes = ref([]);
		const DEMO_POSTS = [
			{
				id: "P-001",
				name: "Main Entrance Post",
				community: "Sunset Gardens",
				site: "Gate A"
			},
			{
				id: "P-002",
				name: "North Perimeter Patrol",
				community: "Sunset Gardens",
				site: "Perimeter"
			},
			{
				id: "P-003",
				name: "Parking Level 1 Patrol",
				community: "Downtown Plaza",
				site: "Parking"
			},
			{
				id: "P-004",
				name: "Front Desk Procedure",
				community: "Oakwood Residences",
				site: "Lobby"
			},
			{
				id: "P-005",
				name: "Marina Entry Control",
				community: "Marina Towers",
				site: "Main Entrance"
			}
		];
		crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID();
		const selectedPostId = ref("");
		const reviewDueDate = ref("");
		const effectiveDate = ref("");
		const currentStatus = ref("draft");
		const currentVersion = ref("1.0");
		const selectedPost = computed(() => DEMO_POSTS.find((p) => p.id === selectedPostId.value) ?? null);
		const autoId = computed(() => {
			if (isEditMode.value && props.postOrderId) return props.postOrderId;
			return selectedPostId.value ? `PO-${Date.now().toString().slice(-4)}` : "—";
		});
		const sections = ref([{
			id: crypto.randomUUID(),
			type: "General Information",
			title: "General Information",
			description: "",
			clientVisible: true,
			notes: "",
			attachments: []
		}]);
		function getSection(index) {
			return sections.value[index] ?? sections.value[0];
		}
		function updateSection(index, value) {
			sections.value[index] = value;
		}
		function removeSection(id) {
			if (sections.value.length === 1) return;
			sections.value = sections.value.filter((s) => s.id !== id);
		}
		function moveSectionUp(index) {
			if (index === 0) return;
			const arr = [...sections.value];
			const tmp = arr[index - 1];
			arr[index - 1] = arr[index];
			arr[index] = tmp;
			sections.value = arr;
		}
		function moveSectionDown(index) {
			if (index === sections.value.length - 1) return;
			const arr = [...sections.value];
			const tmp = arr[index + 1];
			arr[index + 1] = arr[index];
			arr[index] = tmp;
			sections.value = arr;
		}
		const saving = ref(false);
		const showPublishModal = ref(false);
		function handlePublishConfirm(payload) {
			showPublishModal.value = false;
			navigateTo("/post-orders");
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_Badge = Badge_default;
			const _component_PostOrderSection = PostOrderSection_default;
			const _component_PostOrderHistory = PostOrderHistory_default;
			const _component_NuxtLink = NuxtLink;
			const _component_PublishPostOrderModal = PublishPostOrderModal_default;
			_push(`<!--[--><div class="po-form" data-v-d262e7b8><div class="form-card" data-v-d262e7b8><div class="form-card__header" data-v-d262e7b8>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:file-text",
				size: 18
			}, null, _parent));
			_push(`<h3 class="form-card__title" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.form_header_title"))}</h3><span class="form-card__hint" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.form_header_hint"))}</span></div><div class="header-grid" data-v-d262e7b8><div class="field field--full" data-v-d262e7b8><label class="field__label" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.field_post_name"))} <span class="required" data-v-d262e7b8>*</span></label><select class="field__select" data-v-d262e7b8><option value="" data-v-d262e7b8${ssrIncludeBooleanAttr(Array.isArray(selectedPostId.value) ? ssrLooseContain(selectedPostId.value, "") : ssrLooseEqual(selectedPostId.value, "")) ? " selected" : ""}>${ssrInterpolate(unref(t)("post_orders.field_post_placeholder"))}</option><!--[-->`);
			ssrRenderList(DEMO_POSTS, (post) => {
				_push(`<option${ssrRenderAttr("value", post.id)} data-v-d262e7b8${ssrIncludeBooleanAttr(Array.isArray(selectedPostId.value) ? ssrLooseContain(selectedPostId.value, post.id) : ssrLooseEqual(selectedPostId.value, post.id)) ? " selected" : ""}>${ssrInterpolate(post.name)} — ${ssrInterpolate(post.community)}</option>`);
			});
			_push(`<!--]--></select></div><div class="field" data-v-d262e7b8><label class="field__label" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.field_order_id"))}</label><div class="field__readonly" data-v-d262e7b8>${ssrInterpolate(autoId.value)}</div></div><div class="field" data-v-d262e7b8><label class="field__label" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.field_community"))}</label><div class="field__readonly" data-v-d262e7b8>${ssrInterpolate(selectedPost.value?.community ?? "—")}</div></div><div class="field" data-v-d262e7b8><label class="field__label" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.field_status"))}</label><div class="field__readonly" data-v-d262e7b8>`);
			_push(ssrRenderComponent(_component_Badge, {
				type: "postOrderStatus",
				value: currentStatus.value
			}, null, _parent));
			_push(`</div></div><div class="field" data-v-d262e7b8><label class="field__label" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.field_version"))}</label><div class="field__readonly" data-v-d262e7b8>${ssrInterpolate(currentVersion.value)}</div></div><div class="field" data-v-d262e7b8><label class="field__label" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.field_author"))}</label><div class="field__readonly" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.field_author_current_user"))}</div></div><div class="field" data-v-d262e7b8><label class="field__label" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.field_creation_date"))}</label><div class="field__readonly" data-v-d262e7b8>${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric"
			}))}</div></div><div class="field" data-v-d262e7b8><label class="field__label" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.field_effective_date"))} <span class="required" data-v-d262e7b8>*</span></label><input${ssrRenderAttr("value", effectiveDate.value)} type="date" class="field__input" data-v-d262e7b8></div><div class="field" data-v-d262e7b8><label class="field__label" data-v-d262e7b8>${ssrInterpolate(unref(t)("post_orders.field_review_due"))}</label><input${ssrRenderAttr("value", reviewDueDate.value)} type="date" class="field__input" data-v-d262e7b8></div></div></div><!--[-->`);
			ssrRenderList(sections.value, (section, index) => {
				_push(ssrRenderComponent(_component_PostOrderSection, {
					key: section.id,
					"model-value": getSection(index),
					"onUpdate:modelValue": ($event) => updateSection(index, $event),
					index,
					total: sections.value.length,
					"section-types": sectionTypes.value,
					onMoveUp: ($event) => moveSectionUp(index),
					onMoveDown: ($event) => moveSectionDown(index),
					onRemove: ($event) => removeSection(section.id)
				}, null, _parent));
			});
			_push(`<!--]--><button class="add-section-btn" data-v-d262e7b8>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:plus-circle",
				size: 18
			}, null, _parent));
			_push(` ${ssrInterpolate(unref(t)("post_orders.add_section"))}</button>`);
			if (isEditMode.value) _push(ssrRenderComponent(_component_PostOrderHistory, { entries: props.historyEntries ?? [] }, null, _parent));
			else _push(`<!---->`);
			_push(`<div class="action-bar" data-v-d262e7b8>`);
			_push(ssrRenderComponent(_component_NuxtLink, {
				to: "/post-orders",
				class: "btn-secondary"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(unref(t)("common.cancel"))}`);
					else return [createTextVNode(toDisplayString(unref(t)("common.cancel")), 1)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="action-bar__right" data-v-d262e7b8><button class="btn-secondary"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-v-d262e7b8>`);
			_push(ssrRenderComponent(_component_Icon, {
				name: "lucide:save",
				size: 15
			}, null, _parent));
			_push(` ${ssrInterpolate(saving.value ? unref(t)("common.saving") : unref(t)("post_orders.save_draft"))}</button>`);
			if (currentStatus.value !== "archived") {
				_push(`<button class="btn-primary"${ssrIncludeBooleanAttr(!selectedPostId.value) ? " disabled" : ""} data-v-d262e7b8>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:send",
					size: 15
				}, null, _parent));
				_push(` ${ssrInterpolate(isEditMode.value ? unref(t)("post_orders.publish_update") : unref(t)("post_orders.publish"))}</button>`);
			} else _push(`<!---->`);
			_push(`</div></div></div>`);
			_push(ssrRenderComponent(_component_PublishPostOrderModal, {
				show: showPublishModal.value,
				"current-version": currentVersion.value,
				onClose: ($event) => showPublishModal.value = false,
				onConfirm: handlePublishConfirm
			}, null, _parent));
			_push(`<!--]-->`);
		};
	}
});
//#endregion
//#region app/components/post-orders/PostOrderForm.vue
var _sfc_setup = PostOrderForm_vue_vue_type_script_setup_true_lang_default.setup;
PostOrderForm_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/post-orders/PostOrderForm.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PostOrderForm_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PostOrderForm_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-d262e7b8"]]), { __name: "PostOrderForm" });

export { PostOrderForm_default as P };
//# sourceMappingURL=PostOrderForm-CEhvVEJd.mjs.map
