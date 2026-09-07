import { t as components_default } from './components-DWHbB934.mjs';
import { a as useTranslation, b as useRouter, u as useRoute, e as useAuthStore } from '../virtual/entry.mjs';
import { _ as _plugin_vue_export_helper_default } from './_plugin-vue_export-helper-BOaGB7Aw.mjs';
import { defineComponent, mergeProps, computed, ref, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrRenderTeleport, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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

//#region app/components/PhotoLightbox.vue?vue&type=script&setup=true&lang.ts
var PhotoLightbox_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "PhotoLightbox",
	__ssrInlineRender: true,
	props: {
		photos: {},
		startIndex: {}
	},
	emits: ["close"],
	setup(__props, { emit: __emit }) {
		const currentIndex = ref(__props.startIndex ?? 0);
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			ssrRenderTeleport(_push, (_push) => {
				_push(`<div class="lightbox" data-v-98a24de1><button class="lightbox__close" data-v-98a24de1>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:x",
					size: 20
				}, null, _parent));
				_push(`</button><div class="lightbox__counter" data-v-98a24de1>${ssrInterpolate(unref(currentIndex) + 1)} / ${ssrInterpolate(__props.photos.length)}</div>`);
				if (__props.photos.length > 1) {
					_push(`<button class="lightbox__nav lightbox__nav--prev"${ssrIncludeBooleanAttr(unref(currentIndex) === 0) ? " disabled" : ""} data-v-98a24de1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:chevron-left",
						size: 24
					}, null, _parent));
					_push(`</button>`);
				} else _push(`<!---->`);
				_push(`<img${ssrRenderAttr("src", __props.photos[unref(currentIndex)])} class="lightbox__img" data-v-98a24de1>`);
				if (__props.photos.length > 1) {
					_push(`<button class="lightbox__nav lightbox__nav--next"${ssrIncludeBooleanAttr(unref(currentIndex) === __props.photos.length - 1) ? " disabled" : ""} data-v-98a24de1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:chevron-right",
						size: 24
					}, null, _parent));
					_push(`</button>`);
				} else _push(`<!---->`);
				if (__props.photos.length > 1) {
					_push(`<div class="lightbox__strip" data-v-98a24de1><!--[-->`);
					ssrRenderList(__props.photos, (url, idx) => {
						_push(`<button class="${ssrRenderClass([{ "lightbox__thumb--active": idx === unref(currentIndex) }, "lightbox__thumb"])}" data-v-98a24de1><img${ssrRenderAttr("src", url)}${ssrRenderAttr("alt", `Photo ${idx + 1}`)} data-v-98a24de1></button>`);
					});
					_push(`<!--]--></div>`);
				} else _push(`<!---->`);
				_push(`</div>`);
			}, "body", false, _parent);
		};
	}
});
//#endregion
//#region app/components/PhotoLightbox.vue
var _sfc_setup$2 = PhotoLightbox_vue_vue_type_script_setup_true_lang_default.setup;
PhotoLightbox_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PhotoLightbox.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var PhotoLightbox_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(PhotoLightbox_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-98a24de1"]]), { __name: "PhotoLightbox" });
//#endregion
//#region app/components/poi/POIDetail.vue?vue&type=script&setup=true&lang.ts
var POIDetail_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "POIDetail",
	__ssrInlineRender: true,
	setup(__props) {
		const { t } = useTranslation();
		useRouter();
		const route = useRoute();
		const authStore = useAuthStore();
		const isAdmin = computed(() => authStore.isAdmin);
		const loading = ref(true);
		const record = ref(null);
		const showVersionHistory = ref(false);
		const showInactiveModal = ref(false);
		const inactiveReason = ref("");
		const inactiveReasonError = ref("");
		const isInactivating = ref(false);
		const inactiveSuccess = ref(false);
		const lightboxOpen = ref(false);
		const lightboxIndex = ref(0);
		const showExportModal = ref(false);
		const isExporting = ref(false);
		const exportSuccess = ref(false);
		const exportLog = ref([]);
		String(route.params.id);
		const DEMO_VERSIONS = [
			{
				version: 3,
				changedBy: "A. Johnson",
				changedAt: "2026-06-18T08:15:00Z",
				summary: "Updated summary and conditions text."
			},
			{
				version: 2,
				changedBy: "A. Johnson",
				changedAt: "2026-05-10T14:30:00Z",
				summary: "Added related incident INC-2026-088."
			},
			{
				version: 1,
				changedBy: "A. Johnson",
				changedAt: "2026-04-01T10:00:00Z",
				summary: "Record created and published."
			}
		];
		function formatDate(iso) {
			if (!iso) return "—";
			return new Date(iso).toLocaleDateString("en-AU", {
				day: "2-digit",
				month: "short",
				year: "numeric"
			});
		}
		function formatDateTime(iso) {
			return new Date(iso).toLocaleString("en-AU", {
				day: "2-digit",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		}
		function isExpiringSoon(iso) {
			if (!iso) return false;
			const diff = new Date(iso).getTime() - Date.now();
			return diff > 0 && diff < 12096e5;
		}
		function isExpired(iso) {
			if (!iso) return false;
			return new Date(iso).getTime() < Date.now();
		}
		function getInitials(r) {
			return ((r.firstName[0] ?? "") + (r.lastName[0] ?? "")).toUpperCase();
		}
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			const _component_PhotoLightbox = PhotoLightbox_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "poi-detail" }, _attrs))} data-v-6f12a7b1>`);
			if (unref(loading)) {
				_push(`<div class="poi-detail__loading" data-v-6f12a7b1>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:loader-2",
					size: 28,
					class: "spin"
				}, null, _parent));
				_push(`</div>`);
			} else if (unref(record)) {
				_push(`<!--[--><div class="poi-detail__page-header" data-v-6f12a7b1><button class="back-btn" data-v-6f12a7b1>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:arrow-left",
					size: 16
				}, null, _parent));
				_push(`</button><div class="poi-detail__breadcrumb" data-v-6f12a7b1><span class="breadcrumb-link" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.title"))}</span>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:chevron-right",
					size: 14,
					class: "breadcrumb-sep"
				}, null, _parent));
				_push(`<span data-v-6f12a7b1>${ssrInterpolate(unref(record).firstName)} ${ssrInterpolate(unref(record).lastName)}</span></div><div class="poi-detail__header-actions" data-v-6f12a7b1>`);
				if (unref(record).status === "active") {
					_push(`<button class="btn-secondary btn-danger" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:ban",
						size: 15
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("poi.action_inactive"))}</button>`);
				} else _push(`<!---->`);
				if (unref(isAdmin)) {
					_push(`<button class="btn-secondary" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:download",
						size: 15
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("poi.action_export"))}</button>`);
				} else _push(`<!---->`);
				_push(`<button class="btn-primary" data-v-6f12a7b1>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:pencil",
					size: 15
				}, null, _parent));
				_push(` ${ssrInterpolate(unref(t)("common.edit"))}</button></div></div>`);
				if (unref(inactiveSuccess)) {
					_push(`<div class="status-banner status-banner--ok" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:check-circle-2",
						size: 16
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("poi.modal_inactive_success"))}</div>`);
				} else _push(`<!---->`);
				if (unref(exportSuccess)) {
					_push(`<div class="status-banner status-banner--info" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:file-check",
						size: 16
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("poi.export_success"))}</div>`);
				} else _push(`<!---->`);
				_push(`<div class="poi-detail__body" data-v-6f12a7b1><div class="hero-card" data-v-6f12a7b1><div class="hero-card__left" data-v-6f12a7b1>`);
				if (unref(record).photos.length) _push(`<div class="hero-avatar hero-avatar--photo" data-v-6f12a7b1><img${ssrRenderAttr("src", unref(record).photos[0])}${ssrRenderAttr("alt", unref(record).firstName)} data-v-6f12a7b1></div>`);
				else _push(`<div class="hero-avatar hero-avatar--initials" data-v-6f12a7b1>${ssrInterpolate(getInitials(unref(record)))}</div>`);
				_push(`</div><div class="hero-card__info" data-v-6f12a7b1><div class="hero-card__name" data-v-6f12a7b1>${ssrInterpolate(unref(record).firstName)} ${ssrInterpolate(unref(record).lastName)}</div>`);
				if (unref(record).aliases) _push(`<div class="hero-card__aliases" data-v-6f12a7b1>aka ${ssrInterpolate(unref(record).aliases)}</div>`);
				else _push(`<!---->`);
				_push(`<div class="hero-card__badges" data-v-6f12a7b1><span class="${ssrRenderClass([`type-badge--${unref(record).type}`, "type-badge"])}" data-v-6f12a7b1>${ssrInterpolate(unref(record).type === "poi" ? unref(t)("poi.type_poi") : unref(record).type === "trespass" ? unref(t)("poi.type_trespass") : unref(t)("poi.type_metro"))}</span><span class="${ssrRenderClass([`threat-badge--${unref(record).threatLevel}`, "threat-badge"])}" data-v-6f12a7b1>${ssrInterpolate(unref(t)(`poi.threat_${unref(record).threatLevel}`))}</span><span class="${ssrRenderClass([`status-badge--${unref(record).status}`, "status-badge"])}" data-v-6f12a7b1>${ssrInterpolate(unref(t)(`poi.status_${unref(record).status}`))}</span></div><div class="hero-card__meta" data-v-6f12a7b1><span data-v-6f12a7b1><strong data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.col_id"))}:</strong> ${ssrInterpolate(unref(record).id)}</span><span data-v-6f12a7b1><strong data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.col_updated"))}:</strong> ${ssrInterpolate(formatDateTime(unref(record).lastUpdated))}</span><span data-v-6f12a7b1><strong data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.detail_created_by"))}:</strong> ${ssrInterpolate(unref(record).createdBy)}, ${ssrInterpolate(formatDate(unref(record).createdAt))}</span></div></div></div>`);
				if (unref(record).photos.length) {
					_push(`<div class="section-card" data-v-6f12a7b1><div class="section-card__header" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:image",
						size: 15
					}, null, _parent));
					_push(`<h3 class="section-card__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.section_photos"))}</h3></div><div class="photo-strip" data-v-6f12a7b1><!--[-->`);
					ssrRenderList(unref(record).photos, (url, idx) => {
						_push(`<button class="photo-thumb" data-v-6f12a7b1><img${ssrRenderAttr("src", url)}${ssrRenderAttr("alt", `Photo ${idx + 1}`)} data-v-6f12a7b1></button>`);
					});
					_push(`<!--]--></div></div>`);
				} else _push(`<!---->`);
				_push(`<div class="detail-columns" data-v-6f12a7b1><div class="detail-col" data-v-6f12a7b1><div class="section-card" data-v-6f12a7b1><div class="section-card__header" data-v-6f12a7b1>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:user",
					size: 15
				}, null, _parent));
				_push(`<h3 class="section-card__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.section_basic_info"))}</h3></div><div class="kv-grid" data-v-6f12a7b1><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_dob"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(formatDate(unref(record).dateOfBirth))}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_gender"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).gender ? unref(t)(`poi.gender_${unref(record).gender}`) : "—")}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_aliases"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).aliases || "—")}</span></div><div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_physical_desc"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).physicalDescription || "—")}</span></div></div></div><div class="section-card" data-v-6f12a7b1><div class="section-card__header" data-v-6f12a7b1>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:file-text",
					size: 15
				}, null, _parent));
				_push(`<h3 class="section-card__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.section_summary"))}</h3></div><div class="kv-grid" data-v-6f12a7b1><div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_summary"))}</span><span class="kv-value kv-value--paragraph" data-v-6f12a7b1>${ssrInterpolate(unref(record).summary)}</span></div>`);
				if (unref(record).internalNotes) {
					_push(`<div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label kv-label--internal" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:lock",
						size: 11
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("poi.field_internal_notes"))}</span><span class="kv-value kv-value--paragraph kv-value--internal" data-v-6f12a7b1>${ssrInterpolate(unref(record).internalNotes)}</span></div>`);
				} else _push(`<!---->`);
				if (unref(record).relatedIncidentIds) _push(`<div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_related_incidents"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).relatedIncidentIds)}</span></div>`);
				else _push(`<!---->`);
				_push(`</div></div>`);
				if (unref(record).type === "trespass") {
					_push(`<div class="section-card section-card--trespass" data-v-6f12a7b1><div class="section-card__header" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:ban",
						size: 15
					}, null, _parent));
					_push(`<h3 class="section-card__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.section_trespass_details"))}</h3></div><div class="kv-grid" data-v-6f12a7b1><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_notice_number"))}</span><span class="kv-value kv-value--mono" data-v-6f12a7b1>${ssrInterpolate(unref(record).trespassNoticeNumber || "—")}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_issuing_authority"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).trespassIssuingAuthority || "—")}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_issue_date"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(formatDate(unref(record).issueDate))}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_expiry_date"))}</span><span class="${ssrRenderClass([{
						"kv-value--warning": isExpiringSoon(unref(record).expiryDate),
						"kv-value--danger": isExpired(unref(record).expiryDate)
					}, "kv-value"])}" data-v-6f12a7b1>${ssrInterpolate(formatDate(unref(record).expiryDate))} `);
					if (isExpiringSoon(unref(record).expiryDate)) _push(`<span class="expiry-pill expiry-pill--warning" data-v-6f12a7b1>Expiring soon</span>`);
					else _push(`<!---->`);
					if (isExpired(unref(record).expiryDate)) _push(`<span class="expiry-pill expiry-pill--danger" data-v-6f12a7b1>Expired</span>`);
					else _push(`<!---->`);
					_push(`</span></div><div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_property_area"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).propertyAreaCovered || "—")}</span></div><div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_conditions"))}</span><span class="kv-value kv-value--paragraph" data-v-6f12a7b1>${ssrInterpolate(unref(record).conditions || "—")}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_law_enforcement"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).lawEnforcementContact || "—")}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_renewal_reminder"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).trespassRenewalReminder)} ${ssrInterpolate(unref(t)("poi.days_before_expiry"))}</span></div></div></div>`);
				} else _push(`<!---->`);
				if (unref(record).type === "poi") {
					_push(`<div class="section-card section-card--poi" data-v-6f12a7b1><div class="section-card__header" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:user-search",
						size: 15
					}, null, _parent));
					_push(`<h3 class="section-card__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.section_poi_details"))}</h3></div><div class="kv-grid" data-v-6f12a7b1><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_watch_review_date"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(formatDate(unref(record).watchLevelReviewDate))}</span></div><div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_associated_individuals"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).associatedIndividuals || "—")}</span></div><div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_incident_history"))}</span><span class="kv-value kv-value--paragraph" data-v-6f12a7b1>${ssrInterpolate(unref(record).incidentHistorySummary || "—")}</span></div></div></div>`);
				} else _push(`<!---->`);
				if (unref(record).type === "metro_red_card") {
					_push(`<div class="section-card section-card--metro" data-v-6f12a7b1><div class="section-card__header" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:train-front",
						size: 15
					}, null, _parent));
					_push(`<h3 class="section-card__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.section_metro_details"))}</h3></div><div class="kv-grid" data-v-6f12a7b1><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_red_card_number"))}</span><span class="kv-value kv-value--mono" data-v-6f12a7b1>${ssrInterpolate(unref(record).redCardNumber || "—")}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_issuing_authority"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).metroIssuingAuthority || "—")}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_issue_date"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(formatDate(unref(record).issueDate))}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_expiry_date"))}</span><span class="${ssrRenderClass([{
						"kv-value--warning": isExpiringSoon(unref(record).expiryDate),
						"kv-value--danger": isExpired(unref(record).expiryDate)
					}, "kv-value"])}" data-v-6f12a7b1>${ssrInterpolate(formatDate(unref(record).expiryDate))}</span></div><div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_metro_lines"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).metroLines || "—")}</span></div><div class="kv-row" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_renewal_reminder"))}</span><span class="kv-value" data-v-6f12a7b1>${ssrInterpolate(unref(record).metroRenewalReminder)} ${ssrInterpolate(unref(t)("poi.days_before_expiry"))}</span></div></div></div>`);
				} else _push(`<!---->`);
				_push(`</div><div class="detail-col detail-col--sidebar" data-v-6f12a7b1><div class="section-card" data-v-6f12a7b1><div class="section-card__header" data-v-6f12a7b1>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:shield-alert",
					size: 15
				}, null, _parent));
				_push(`<h3 class="section-card__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.section_threat_sites"))}</h3></div><div class="kv-grid" data-v-6f12a7b1><div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_threat_level"))}</span><span class="${ssrRenderClass([`threat-badge--${unref(record).threatLevel}`, "threat-badge"])}" data-v-6f12a7b1>${ssrInterpolate(unref(t)(`poi.threat_${unref(record).threatLevel}`))}</span></div><div class="kv-row kv-row--full" data-v-6f12a7b1><span class="kv-label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.field_sites"))}</span><div class="site-tags" data-v-6f12a7b1><!--[-->`);
				ssrRenderList(unref(record).sites, (site) => {
					_push(`<span class="site-tag" data-v-6f12a7b1>${ssrInterpolate(site)}</span>`);
				});
				_push(`<!--]--></div></div></div></div>`);
				if (unref(isAdmin) && unref(exportLog).length) {
					_push(`<div class="section-card" data-v-6f12a7b1><div class="section-card__header" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:clipboard-list",
						size: 15
					}, null, _parent));
					_push(`<h3 class="section-card__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.export_log"))}</h3></div><div class="version-list" data-v-6f12a7b1><!--[-->`);
					ssrRenderList(unref(exportLog), (entry, i) => {
						_push(`<div class="version-row" data-v-6f12a7b1><div class="version-row__top" data-v-6f12a7b1>`);
						_push(ssrRenderComponent(_component_Icon, {
							name: "lucide:download",
							size: 12,
							class: "export-log-icon"
						}, null, _parent));
						_push(`<span class="version-by" data-v-6f12a7b1>${ssrInterpolate(entry.exportedBy)}</span><span class="version-at" data-v-6f12a7b1>${ssrInterpolate(formatDateTime(entry.exportedAt))}</span></div><p class="version-summary" data-v-6f12a7b1>PDF exported — CONFIDENTIAL</p></div>`);
					});
					_push(`<!--]--></div></div>`);
				} else _push(`<!---->`);
				_push(`<div class="section-card" data-v-6f12a7b1><div class="section-card__header section-card__header--clickable" data-v-6f12a7b1>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:history",
					size: 15
				}, null, _parent));
				_push(`<h3 class="section-card__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.version_history"))}</h3>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: unref(showVersionHistory) ? "lucide:chevron-up" : "lucide:chevron-down",
					size: 15,
					class: "collapse-icon"
				}, null, _parent));
				_push(`</div>`);
				if (unref(showVersionHistory)) {
					_push(`<div class="version-list" data-v-6f12a7b1><!--[-->`);
					ssrRenderList(DEMO_VERSIONS, (entry) => {
						_push(`<div class="version-row" data-v-6f12a7b1><div class="version-row__top" data-v-6f12a7b1><span class="version-badge" data-v-6f12a7b1>v${ssrInterpolate(entry.version)}</span><span class="version-by" data-v-6f12a7b1>${ssrInterpolate(entry.changedBy)}</span><span class="version-at" data-v-6f12a7b1>${ssrInterpolate(formatDateTime(entry.changedAt))}</span></div><p class="version-summary" data-v-6f12a7b1>${ssrInterpolate(entry.summary)}</p></div>`);
					});
					_push(`<!--]--></div>`);
				} else _push(`<!---->`);
				_push(`</div></div></div></div><!--]-->`);
			} else {
				_push(`<div class="poi-detail__not-found" data-v-6f12a7b1>`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "lucide:shield-off",
					size: 36,
					class: "not-found-icon"
				}, null, _parent));
				_push(`<p data-v-6f12a7b1>Record not found.</p><button class="btn-secondary" data-v-6f12a7b1>${ssrInterpolate(unref(t)("common.back"))}</button></div>`);
			}
			ssrRenderTeleport(_push, (_push) => {
				if (unref(showExportModal)) {
					_push(`<div class="modal-overlay" data-v-6f12a7b1><div class="modal" data-v-6f12a7b1><div class="modal__header" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:file-down",
						size: 18,
						class: "modal__header-icon modal__header-icon--info"
					}, null, _parent));
					_push(`<h3 class="modal__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.modal_export_title"))}</h3></div><div class="modal__body" data-v-6f12a7b1><div class="export-info-block" data-v-6f12a7b1><div class="export-info-row" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:shield-alert",
						size: 14
					}, null, _parent));
					_push(`<span data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.modal_export_watermark"))}</span></div><div class="export-info-row" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:image",
						size: 14
					}, null, _parent));
					_push(`<span data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.modal_export_includes"))}</span></div><div class="export-info-row export-info-row--warn" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:lock",
						size: 14
					}, null, _parent));
					_push(`<span data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.modal_export_excludes"))}</span></div><div class="export-info-row" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:clipboard-list",
						size: 14
					}, null, _parent));
					_push(`<span data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.modal_export_logged"))}</span></div></div></div><div class="modal__footer" data-v-6f12a7b1><button class="btn-cancel" data-v-6f12a7b1>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn-export"${ssrIncludeBooleanAttr(unref(isExporting)) ? " disabled" : ""} data-v-6f12a7b1>`);
					if (unref(isExporting)) _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:loader-2",
						size: 14,
						class: "spin"
					}, null, _parent));
					else _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:download",
						size: 14
					}, null, _parent));
					_push(` ${ssrInterpolate(unref(t)("poi.modal_export_confirm"))}</button></div></div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
			ssrRenderTeleport(_push, (_push) => {
				if (unref(showInactiveModal)) {
					_push(`<div class="modal-overlay" data-v-6f12a7b1><div class="modal" data-v-6f12a7b1><div class="modal__header" data-v-6f12a7b1>`);
					_push(ssrRenderComponent(_component_Icon, {
						name: "lucide:ban",
						size: 18,
						class: "modal__header-icon modal__header-icon--danger"
					}, null, _parent));
					_push(`<h3 class="modal__title" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.modal_inactive_title"))}</h3></div><div class="modal__body" data-v-6f12a7b1><p class="modal__desc" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.modal_inactive_desc"))}</p><div class="${ssrRenderClass([{ "form-field--error": unref(inactiveReasonError) }, "form-field"])}" data-v-6f12a7b1><label class="form-field__label" data-v-6f12a7b1>${ssrInterpolate(unref(t)("poi.modal_inactive_reason"))} <span class="req" data-v-6f12a7b1>*</span></label><textarea class="form-field__textarea" rows="3"${ssrRenderAttr("placeholder", unref(t)("poi.modal_inactive_reason_placeholder"))} data-v-6f12a7b1>${ssrInterpolate(unref(inactiveReason))}</textarea>`);
					if (unref(inactiveReasonError)) _push(`<span class="field-error" data-v-6f12a7b1>${ssrInterpolate(unref(inactiveReasonError))}</span>`);
					else _push(`<!---->`);
					_push(`</div></div><div class="modal__footer" data-v-6f12a7b1><button class="btn-cancel" data-v-6f12a7b1>${ssrInterpolate(unref(t)("common.cancel"))}</button><button class="btn-danger-solid"${ssrIncludeBooleanAttr(unref(isInactivating)) ? " disabled" : ""} data-v-6f12a7b1>`);
					if (unref(isInactivating)) _push(ssrRenderComponent(_component_Icon, {
						name: "lucide:loader-2",
						size: 14,
						class: "spin"
					}, null, _parent));
					else _push(`<!---->`);
					_push(` ${ssrInterpolate(unref(t)("poi.modal_inactive_confirm"))}</button></div></div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
			if (unref(lightboxOpen) && unref(record)) _push(ssrRenderComponent(_component_PhotoLightbox, {
				photos: unref(record).photos,
				"start-index": unref(lightboxIndex),
				onClose: ($event) => lightboxOpen.value = false
			}, null, _parent));
			else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/components/poi/POIDetail.vue
var _sfc_setup$1 = POIDetail_vue_vue_type_script_setup_true_lang_default.setup;
POIDetail_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/poi/POIDetail.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var POIDetail_default = /*#__PURE__*/ Object.assign(_plugin_vue_export_helper_default(POIDetail_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-6f12a7b1"]]), { __name: "POIDetail" });
//#endregion
//#region app/pages/poi/[id]/index.vue?vue&type=script&setup=true&lang.ts
var index_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "index",
	__ssrInlineRender: true,
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			const _component_POIDetail = POIDetail_default;
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "poi-detail-page" }, _attrs))} data-v-1129b8c5>`);
			_push(ssrRenderComponent(_component_POIDetail, null, null, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/pages/poi/[id]/index.vue
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/poi/[id]/index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _id__default = /*#__PURE__*/ _plugin_vue_export_helper_default(index_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-1129b8c5"]]);

export { _id__default as default };
//# sourceMappingURL=_id_-DxhueeD9.mjs.map
