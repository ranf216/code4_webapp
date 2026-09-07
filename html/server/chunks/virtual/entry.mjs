import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { defineProdDiagnostics } from 'nostics';
import { ansiFormatter } from 'nostics/formatters/ansi';
import { getCurrentScope, ref, watchEffect, getCurrentInstance, onBeforeUnmount, onDeactivated, onActivated, shallowReactive, reactive, effectScope, hasInjectionContext, inject, toRef, createApp, provide, onErrorCaptured, onServerPrefetch, unref, createVNode, resolveDynamicComponent, defineAsyncComponent, mergeProps, defineComponent, withCtx, watch, readonly, createElementBlock, computed, shallowRef, h, isVNode, createCommentVNode, resolveComponent, isReadonly, cloneVNode, isRef, toValue, toRaw, Suspense, nextTick, Fragment, useSSRContext, isShallow, isReactive, queuePostFlushCb } from 'vue';
import { c as createError, p as parseURL, e as encodePath, l as decodePath, w as withQuery, m as hasProtocol, n as isScriptProtocol, f as joinURL, s as sanitizeStatusCode, o as defu, q as klona, t as defuFn, v as parseQuery, x as withTrailingSlash, y as withoutTrailingSlash, $ as $fetch } from '../nitro/nitro.mjs';
import { i as injectHead$1, V as VueResolver, h as headSymbol, b as baseURL } from '../routes/renderer.mjs';
import { useRoute as useRoute$1, RouterView, START_LOCATION, createMemoryHistory, createRouter } from 'vue-router';
import { isPlainObject } from '@vue/shared';
import { defineStore, setActivePinia, createPinia, shouldHydrate } from 'pinia';
import { fnv1a64Base36 } from 'fnv1a-64';
import { identify } from 'object-identity';
import { _api, addAPIProvider, setCustomIconsLoader } from '@iconify/vue';
import { ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode, ssrRenderAttrs } from 'vue/server-renderer';
import axios from 'axios';
import { walkResolver } from 'unhead/utils';

function useHead(input, options = {}) {
  const head = options.head || injectHead$1();
  return head.ssr ? head.push(input || {}, options) : clientUseHead(head, input, options);
}
function clientUseHead(head, input, options = {}) {
  const scope = getCurrentScope();
  if (scope && !scope.active) {
    return { patch() {
    }, dispose() {
    }, _i: -1 };
  }
  const deactivated = ref(false);
  if (options.onRendered && scope) {
    const _onRendered = options.onRendered;
    options = { ...options, onRendered: (ctx) => scope.run(() => _onRendered(ctx)) };
  }
  let entry;
  watchEffect(() => {
    const i = deactivated.value ? {} : walkResolver(input, VueResolver);
    if (entry) {
      entry.patch(i);
    } else {
      entry = head.push(i, options);
    }
  });
  const vm = getCurrentInstance();
  if (vm) {
    onBeforeUnmount(() => {
      entry.dispose();
    });
    onDeactivated(() => {
      deactivated.value = true;
    });
    onActivated(() => {
      deactivated.value = false;
    });
  }
  return entry;
}

function flatHooks(configHooks, hooks = {}, parentName) {
	for (const key in configHooks) {
		const subHook = configHooks[key];
		const name = parentName ? `${parentName}:${key}` : key;
		if (typeof subHook === "object" && subHook !== null) flatHooks(subHook, hooks, name);
		else if (typeof subHook === "function") hooks[name] = subHook;
	}
	return hooks;
}
const createTask = /* @__PURE__ */ (() => {
	if (console.createTask) return console.createTask;
	const defaultTask = { run: (fn) => fn() };
	return () => defaultTask;
})();
function callHooks(hooks, args, startIndex, task) {
	for (let i = startIndex; i < hooks.length; i += 1) try {
		const result = task ? task.run(() => hooks[i](...args)) : hooks[i](...args);
		if (result && typeof result.then === "function") return Promise.resolve(result).then(() => callHooks(hooks, args, i + 1, task));
	} catch (error) {
		return Promise.reject(error);
	}
}
function serialTaskCaller(hooks, args, name) {
	if (hooks.length > 0) return callHooks(hooks, args, 0, createTask(name));
}
function parallelTaskCaller(hooks, args, name) {
	if (hooks.length > 0) {
		const task = createTask(name);
		return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
	}
}
function callEachWith(callbacks, arg0) {
	for (const callback of [...callbacks]) callback(arg0);
}
var Hookable = class {
	_hooks;
	_before;
	_after;
	_deprecatedHooks;
	_deprecatedMessages;
	constructor() {
		this._hooks = {};
		this._before = void 0;
		this._after = void 0;
		this._deprecatedMessages = void 0;
		this._deprecatedHooks = {};
		this.hook = this.hook.bind(this);
		this.callHook = this.callHook.bind(this);
		this.callHookWith = this.callHookWith.bind(this);
	}
	hook(name, function_, options = {}) {
		if (!name || typeof function_ !== "function") return () => {};
		const originalName = name;
		let dep;
		while (this._deprecatedHooks[name]) {
			dep = this._deprecatedHooks[name];
			name = dep.to;
		}
		if (dep && !options.allowDeprecated) {
			let message = dep.message;
			if (!message) message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
			if (!this._deprecatedMessages) this._deprecatedMessages = /* @__PURE__ */ new Set();
			if (!this._deprecatedMessages.has(message)) {
				console.warn(message);
				this._deprecatedMessages.add(message);
			}
		}
		if (!function_.name) try {
			Object.defineProperty(function_, "name", {
				get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
				configurable: true
			});
		} catch {}
		this._hooks[name] = this._hooks[name] || [];
		this._hooks[name].push(function_);
		return () => {
			if (function_) {
				this.removeHook(name, function_);
				function_ = void 0;
			}
		};
	}
	hookOnce(name, function_) {
		let _unreg;
		let _function = (...arguments_) => {
			if (typeof _unreg === "function") _unreg();
			_unreg = void 0;
			_function = void 0;
			return function_(...arguments_);
		};
		_unreg = this.hook(name, _function);
		return _unreg;
	}
	removeHook(name, function_) {
		const hooks = this._hooks[name];
		if (hooks) {
			const index = hooks.indexOf(function_);
			if (index !== -1) hooks.splice(index, 1);
			if (hooks.length === 0) this._hooks[name] = void 0;
		}
	}
	clearHook(name) {
		this._hooks[name] = void 0;
	}
	deprecateHook(name, deprecated) {
		this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
		const _hooks = this._hooks[name] || [];
		this._hooks[name] = void 0;
		for (const hook of _hooks) this.hook(name, hook);
	}
	deprecateHooks(deprecatedHooks) {
		for (const name in deprecatedHooks) this.deprecateHook(name, deprecatedHooks[name]);
	}
	addHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		const removeFns = Object.keys(hooks).map((key) => this.hook(key, hooks[key]));
		return () => {
			for (const unreg of removeFns) unreg();
			removeFns.length = 0;
		};
	}
	removeHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		for (const key in hooks) this.removeHook(key, hooks[key]);
	}
	removeAllHooks() {
		this._hooks = {};
	}
	callHook(name, ...args) {
		return this.callHookWith(serialTaskCaller, name, args);
	}
	callHookParallel(name, ...args) {
		return this.callHookWith(parallelTaskCaller, name, args);
	}
	callHookWith(caller, name, args) {
		const event = this._before || this._after ? {
			name,
			args,
			context: {}
		} : void 0;
		if (this._before) callEachWith(this._before, event);
		const result = caller(this._hooks[name] ? [...this._hooks[name]] : [], args, name);
		if (result instanceof Promise) return result.finally(() => {
			if (this._after && event) callEachWith(this._after, event);
		});
		if (this._after && event) callEachWith(this._after, event);
		return result;
	}
	beforeEach(function_) {
		this._before = this._before || [];
		this._before.push(function_);
		return () => {
			if (this._before !== void 0) {
				const index = this._before.indexOf(function_);
				if (index !== -1) this._before.splice(index, 1);
			}
		};
	}
	afterEach(function_) {
		this._after = this._after || [];
		this._after.push(function_);
		return () => {
			if (this._after !== void 0) {
				const index = this._after.indexOf(function_);
				if (index !== -1) this._after.splice(index, 1);
			}
		};
	}
};
function createHooks() {
	return new Hookable();
}

function _getAsyncLocalStorage() {
	return globalThis.AsyncLocalStorage || globalThis.process?.getBuiltinModule?.("node:async_hooks")?.AsyncLocalStorage;
}
const _WeakRef = globalThis.WeakRef || class StrongRef {
	#value;
	constructor(value) {
		this.#value = value;
	}
	deref() {
		return this.#value;
	}
};
function createContext(opts = {}) {
	let currentInstance;
	let isSingleton = false;
	const checkConflict = (instance) => {
		if (currentInstance && currentInstance !== instance) throw new Error("Context conflict");
	};
	let als;
	if (opts.asyncContext) {
		const _AsyncLocalStorage = opts.AsyncLocalStorage || _getAsyncLocalStorage();
		if (_AsyncLocalStorage) als = new _AsyncLocalStorage();
		else console.warn("[unctx] `AsyncLocalStorage` is not provided.");
	}
	const _wrapInstance = (instance) => als && instance !== null && typeof instance === "object" ? { __unctx_weak: new _WeakRef(instance) } : instance;
	const _unwrapInstance = (store) => store && store.__unctx_weak ? store.__unctx_weak.deref() : store;
	const _getCurrentInstance = () => {
		if (als) {
			const store = als.getStore();
			if (store !== void 0) return _unwrapInstance(store);
		}
		return currentInstance;
	};
	return {
		use: () => {
			const _instance = _getCurrentInstance();
			if (_instance === void 0) throw new Error("Context is not available");
			return _instance;
		},
		tryUse: () => {
			return _getCurrentInstance() ?? null;
		},
		set: (instance, replace) => {
			if (!replace) checkConflict(instance);
			currentInstance = instance;
			isSingleton = true;
		},
		unset: () => {
			currentInstance = void 0;
			isSingleton = false;
		},
		call: (instance, callback) => {
			checkConflict(instance);
			currentInstance = instance;
			try {
				return als ? als.run(_wrapInstance(instance), callback) : callback();
			} finally {
				if (!isSingleton) currentInstance = void 0;
			}
		},
		async callAsync(instance, callback) {
			currentInstance = instance;
			const onRestore = () => {
				currentInstance = instance;
			};
			const onLeave = () => currentInstance === instance ? onRestore : void 0;
			asyncHandlers.add(onLeave);
			try {
				const r = als ? als.run(_wrapInstance(instance), callback) : callback();
				if (!isSingleton) currentInstance = void 0;
				return await r;
			} finally {
				asyncHandlers.delete(onLeave);
			}
		}
	};
}
function createNamespace(defaultOpts = {}) {
	const contexts = {};
	return { get(key, opts = {}) {
		if (!contexts[key]) contexts[key] = createContext({
			...defaultOpts,
			...opts
		});
		return contexts[key];
	} };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
	const restores = [];
	for (const leaveHandler of asyncHandlers) {
		const restore = leaveHandler();
		if (restore) restores.push(restore);
	}
	const restore = () => {
		for (const restore of restores) restore();
	};
	let awaitable = function_();
	if (awaitable && typeof awaitable === "object" && "catch" in awaitable) awaitable = awaitable.catch((error) => {
		restore();
		throw error;
	});
	return [awaitable, restore];
}

//#region node_modules/nuxt/dist/app/diagnostics/_shared.js
/**
* Shared configuration for the runtime (E<N>xxx) diagnostics catalogs.
*
* Catalogs are split by domain and imported directly where used (no barrel),
* so the browser bundle only pulls in the codes a module references. Pair the
* pure-call annotations on each `defineDiagnostics()` with dev-guarded,
* statement-level report calls so report-only diagnostics strip from production.
*
* Codes are stable, fully-qualified `NUXT_E<NNNN>` identifiers. Codes with a
* dedicated docs page resolve a `see:` URL via {@link docsBase}; the rest opt
* out with `docs: false`.
*/
function docsBase(code) {
	return `https://nuxt.com/docs/4.x/errors/${code.replace("NUXT_", "").toLowerCase()}`;
}
var ansi = (open, close) => (s) => `\x1B[${open}m${s}\x1B[${close}m`;
var colors = {
	red: ansi(31, 39),
	yellow: ansi(33, 39),
	cyan: ansi(36, 39),
	gray: ansi(90, 39),
	bold: ansi(1, 22),
	dim: ansi(2, 22)
};
ansiFormatter(colors);
var prodReporter = (diagnostic) => {
	console.error(`[${diagnostic.name}]`);
};
var prodReporters = [prodReporter];
//#endregion
//#region node_modules/nuxt/dist/app/diagnostics/core.js
/**
* E1xxx
* Core / Nuxt-instance / lifecycle runtime diagnostics.
*/
var appDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
//#endregion
//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fnuxt.config.mjs
var nuxtLinkDefaults = {
	"componentName": "NuxtLink"};
var asyncDataDefaults = { "deep": false };
var fetchDefaults = {};
//#endregion
//#region node_modules/nuxt/dist/app/nuxt.js
function getNuxtAppCtx(id = "nuxt-app") {
	return getContext(id, { asyncContext: false });
}
var NuxtPluginIndicator = "__nuxt_plugin";
/** @since 3.0.0 */
function createNuxtApp(options) {
	let hydratingCount = 0;
	const nuxtApp = {
		_id: options.id || "nuxt-app",
		_scope: effectScope(),
		provide: void 0,
		versions: {
			get nuxt() {
				return "4.5.2";
			},
			get vue() {
				return nuxtApp.vueApp.version;
			}
		},
		payload: shallowReactive({
			...options.ssrContext?.payload || {},
			data: shallowReactive({}),
			state: reactive({}),
			once: /* @__PURE__ */ new Set(),
			_errors: shallowReactive({})
		}),
		static: { data: {} },
		runWithContext(fn) {
			if (nuxtApp._scope.active && !getCurrentScope()) return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
			return callWithNuxt(nuxtApp, fn);
		},
		isHydrating: false,
		deferHydration() {
			if (!nuxtApp.isHydrating) return () => {};
			hydratingCount++;
			let called = false;
			return () => {
				if (called) return;
				called = true;
				hydratingCount--;
				if (hydratingCount === 0) {
					nuxtApp.isHydrating = false;
					return nuxtApp.callHook("app:suspense:resolve");
				}
			};
		},
		_asyncDataPromises: {},
		_asyncData: shallowReactive({}),
		_state: shallowReactive({}),
		_payloadRevivers: {},
		...options
	};
	nuxtApp.payload.serverRendered = true;
	if (nuxtApp.ssrContext) {
		nuxtApp.payload.path = nuxtApp.ssrContext.url;
		nuxtApp.ssrContext.nuxt = nuxtApp;
		nuxtApp.ssrContext.payload = nuxtApp.payload;
		nuxtApp.ssrContext.config = {
			public: nuxtApp.ssrContext.runtimeConfig.public,
			app: nuxtApp.ssrContext.runtimeConfig.app
		};
	}
	nuxtApp.hooks = createHooks();
	nuxtApp.hook = nuxtApp.hooks.hook;
	{
		const contextCaller = async function(hooks, args) {
			for (const hook of hooks) await nuxtApp.runWithContext(() => hook(...args));
		};
		nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, args);
	}
	nuxtApp.callHook = nuxtApp.hooks.callHook;
	nuxtApp.provide = (name, value) => {
		const $name = "$" + name;
		defineGetter(nuxtApp, $name, value);
		defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
	};
	defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
	defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
	const runtimeConfig = options.ssrContext.runtimeConfig;
	nuxtApp.provide("config", runtimeConfig);
	return nuxtApp;
}
/** @since 3.12.0 */
function registerPluginHooks(nuxtApp, plugin) {
	if (plugin.hooks) nuxtApp.hooks.addHooks(plugin.hooks);
}
/** @since 3.0.0 */
async function applyPlugin(nuxtApp, plugin) {
	if (typeof plugin === "function") {
		const run = () => nuxtApp.runWithContext(() => plugin(nuxtApp));
		const { provide } = await run() || {};
		if (provide && typeof provide === "object") for (const key in provide) nuxtApp.provide(key, provide[key]);
	}
}
/** @since 3.0.0 */
async function applyPlugins(nuxtApp, plugins) {
	let error;
	for (const plugin of plugins) registerPluginHooks(nuxtApp, plugin);
	for (const plugin of plugins) try {
		await applyPlugin(nuxtApp, plugin);
	} catch (e) {
		if (!nuxtApp.payload.error) throw e;
		error ||= e;
	}
	if (error) throw nuxtApp.payload.error || error;
}
/** @since 3.0.0 */
/* @__NO_SIDE_EFFECTS__ */
function defineNuxtPlugin(plugin) {
	if (typeof plugin === "function") return plugin;
	const _name = plugin._name || plugin.name;
	delete plugin.name;
	return Object.assign(plugin.setup || (() => {}), plugin, {
		[NuxtPluginIndicator]: true,
		_name
	});
}
var definePayloadPlugin = defineNuxtPlugin;
/**
* Ensures that the setup function passed in has access to the Nuxt instance via `useNuxtApp`.
* @param nuxt A Nuxt instance
* @param setup The function to call
* @since 3.0.0
*/
function callWithNuxt(nuxt, setup, args) {
	const fn = () => setup();
	const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
	return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
}
function tryUseNuxtApp(id) {
	let nuxtAppInstance;
	if (hasInjectionContext()) nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
	nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
	return nuxtAppInstance || null;
}
function useNuxtApp(id) {
	const nuxtAppInstance = tryUseNuxtApp(id);
	if (!nuxtAppInstance) throw appDiagnostics.NUXT_E1001();
	return nuxtAppInstance;
}
/** @since 3.0.0 */
/* @__NO_SIDE_EFFECTS__ */
function useRuntimeConfig(_event) {
	return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
	Object.defineProperty(obj, key, { get: () => val });
}

//#region node_modules/nuxt/dist/app/utils.js
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
//#endregion
//#region node_modules/nuxt/dist/app/components/injections.js
var LayoutMetaSymbol = Symbol("layout-meta");
var LayoutSymbol = Symbol("layout");
var PageRouteSymbol = Symbol("route");
//#endregion
//#region node_modules/nuxt/dist/app/diagnostics/navigation.js
/**
* E2xxx
* Navigation / routing / middleware runtime diagnostics.
*/
var navigationDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
//#endregion
//#region node_modules/nuxt/dist/app/composables/router.js
/** @since 3.0.0 */
var useRouter = () => {
	return useNuxtApp()?.$router;
};
/**
* Whether the current effect scope is (a descendant of) the component instance's scope.
* A detached scope (e.g. `createSharedComposable`) outlives the component, so the
* per-page route injected there would freeze after navigation (#18903).
*/
function isScopeWithinInstance(instance) {
	const instanceScope = instance.scope;
	let scope = getCurrentScope();
	while (scope) {
		if (scope === instanceScope) return true;
		scope = scope.parent;
	}
	return false;
}
/** @since 3.0.0 */
var useRoute = (() => {
	if (hasInjectionContext()) {
		const instance = getCurrentInstance();
		if (!instance || isScopeWithinInstance(instance)) return inject(PageRouteSymbol, useNuxtApp()._route);
	}
	return useNuxtApp()._route;
});
/** @since 3.0.0 */
/* @__NO_SIDE_EFFECTS__ */
function defineNuxtRouteMiddleware(middleware) {
	return middleware;
}
/** @since 3.0.0 */
var isProcessingMiddleware = () => {
	try {
		if (useNuxtApp()._processingMiddleware) return true;
	} catch {
		return false;
	}
	return false;
};
var HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
var HTML_ATTR_ENCODE_MAP = {
	"&": "&amp;",
	"\"": "&quot;",
	"'": "&#x27;",
	"<": "&lt;",
	">": "&gt;"
};
function encodeForHtmlAttr(value) {
	return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
/**
* A helper that aids in programmatic navigation within your Nuxt application.
*
* Can be called on the server and on the client, within pages, route middleware, plugins, and more.
* @param {RouteLocationRaw | undefined | null} [to] - The route to navigate to. Accepts a route object, string path, `undefined`, or `null`. Defaults to '/'.
* @param {NavigateToOptions} [options] - Optional customization for controlling the behavior of the navigation.
* @returns {Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw} The navigation result, which varies depending on context and options.
* @see https://nuxt.com/docs/4.x/api/utils/navigate-to
* @since 3.0.0
*/
var navigateTo = (to, options) => {
	to ||= "/";
	const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
	const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
	const isExternal = options?.external || isExternalHost;
	if (isExternal) {
		if (!options?.external) throw navigationDiagnostics.NUXT_E2001({ toPath });
		const { protocol } = new URL(toPath, "http://localhost");
		if (protocol && isScriptProtocol(protocol)) throw navigationDiagnostics.NUXT_E2002({
			toPath,
			protocol
		});
	}
	const inMiddleware = isProcessingMiddleware();
	const router = useRouter();
	const nuxtApp = useNuxtApp();
	if (nuxtApp.ssrContext) {
		const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
		const location = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
		const redirect = async function(response) {
			await nuxtApp.callHook("app:redirected");
			const encodedHeader = encodeURL(location, isExternalHost);
			const encodedLoc = encodeForHtmlAttr(encodedHeader);
			nuxtApp.ssrContext["~renderResponse"] = {
				statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
				body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
				headers: { location: encodedHeader }
			};
			return response;
		};
		if (!isExternal && inMiddleware) {
			router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
			return to;
		}
		return redirect(!inMiddleware ? void 0 : false);
	}
	if (isExternal) {
		nuxtApp._scope.stop();
		if (options?.replace) (void 0).replace(toPath);
		else (void 0).href = toPath;
		if (inMiddleware) {
			if (!nuxtApp.isHydrating) return false;
			return new Promise(() => {});
		}
		return Promise.resolve();
	}
	const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
	return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
/**
* @internal
*/
function resolveRouteObject(to) {
	return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
/**
* @internal
*/
function encodeURL(location, isExternalHost = false) {
	const url = new URL(location, "http://localhost");
	if (!isExternalHost) return url.pathname.replace(/^\/{2,}/, "/") + url.search + url.hash;
	if (location.startsWith("//")) return url.toString().replace(url.protocol, "");
	return url.toString();
}
/**
* Encode the pathname of a route location string. Ensures decoded paths like
* `/café` are percent-encoded to match vue-router's encoded route records.
* Already-encoded paths are not double-encoded.
* @internal
*/
function encodeRoutePath(url) {
	const parsed = parseURL(url);
	return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
//#endregion
//#region node_modules/nuxt/dist/app/composables/error.js
var NUXT_ERROR_SIGNATURE = "__nuxt_error";
/** @since 3.0.0 */
var useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
/** @since 3.0.0 */
var showError = (error) => {
	const nuxtError = createError$1(error);
	try {
		const error = /* @__PURE__ */ useError();
		error.value ||= nuxtError;
	} catch {
		throw nuxtError;
	}
	return nuxtError;
};
/**
* Show the error page unless the current client is a crawler, in which case the
* bot receives the already server-rendered HTML instead (#32137, #35338).
*
* @internal
*/
var _showErrorUnlessCrawler = async (nuxtApp, error) => {
	await nuxtApp.runWithContext(() => showError(error));
};
/** @since 3.0.0 */
var isNuxtError = (error) => !!error && typeof error === "object" && "__nuxt_error" in error;
/** @since 3.0.0 */
var createError$1 = (error) => {
	if (typeof error !== "string" && error.statusText) error.message ??= error.statusText;
	const nuxtError = createError(error);
	Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
		value: true,
		configurable: false,
		writable: false
	});
	Object.defineProperty(nuxtError, "status", {
		get: () => nuxtError.statusCode,
		configurable: true
	});
	Object.defineProperty(nuxtError, "statusText", {
		get: () => nuxtError.statusMessage,
		configurable: true
	});
	return nuxtError;
};

//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Ffetch.mjs
if (!globalThis.$fetch) globalThis.$fetch = $fetch.create({ baseURL: baseURL() });
var $fetch$2 = globalThis.$fetch;
//#endregion
//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fglobal-polyfills.mjs
if (!("global" in globalThis)) globalThis.global = globalThis;
//#endregion
//#region node_modules/nuxt/dist/app/diagnostics/head.js
/**
* E6xxx
* Head / unhead runtime diagnostics.
*/
var unheadDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
//#endregion
//#region node_modules/nuxt/dist/head/runtime/composables.js
/**
* Injects the head client from the Nuxt context or Vue inject.
*/
function injectHead(nuxtApp) {
	const nuxt = nuxtApp || useNuxtApp();
	return nuxt.ssrContext?.head || nuxt.runWithContext(() => {
		if (hasInjectionContext()) {
			const head = inject(headSymbol);
			if (!head) throw unheadDiagnostics.NUXT_E6001();
			return head;
		}
	});
}
function useHead$1(input, options = {}) {
	const head = options.head || injectHead(options.nuxt);
	return useHead(input, {
		head,
		...options
	});
}
//#endregion
//#region node_modules/nuxt/dist/app/diagnostics/manifest.js
/**
* E5xxx
* App manifest / route-rules runtime diagnostics.
*/
var manifestDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
//#endregion
//#region node_modules/nuxt/dist/app/components/utils.js
/**
* Internal utility
* @private
*/
var _wrapInTransition = (props, children) => {
	return { default: () => children.default?.() };
};
var ROUTE_KEY_PARENTHESES_RE$1 = /(:\w+)\([^)]+\)/g;
var ROUTE_KEY_SYMBOLS_RE$1 = /(:\w+)[?+*]/g;
var ROUTE_KEY_NORMAL_RE$1 = /:\w+/g;
function generateRouteKey$1(route) {
	const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE$1, "$1").replace(ROUTE_KEY_SYMBOLS_RE$1, "$1").replace(ROUTE_KEY_NORMAL_RE$1, (r) => route.params[r.slice(1)]?.toString() || "");
	return typeof source === "function" ? source(route) : source;
}
/**
* Utility used within router guards
* return true if the route has been changed with a page change during navigation
*/
function isChangingPage(to, from) {
	if (to === from || from === START_LOCATION) return false;
	if (generateRouteKey$1(to) !== generateRouteKey$1(from)) return true;
	if (to.matched.every((comp, index) => comp.components && comp.components.default === from.matched[index]?.components?.default)) return false;
	return true;
}
var VALID_TAG_RE = /^[a-z][a-z0-9-]*$/i;
/** Return `tag` if it is a safe HTML tag name, otherwise `fallback`. */
function sanitizeTag(tag, fallback) {
	return tag && VALID_TAG_RE.test(tag) ? tag : fallback;
}
function toArray$1(value) {
	return Array.isArray(value) ? value : [value];
}
/**
* Internal utility
* @private
*/
function _mergeTransitionProps(routeProps) {
	const _props = [];
	for (const prop of routeProps) {
		if (!prop) continue;
		_props.push({
			...prop,
			onAfterLeave: prop.onAfterLeave ? toArray$1(prop.onAfterLeave) : void 0,
			onBeforeLeave: prop.onBeforeLeave ? toArray$1(prop.onBeforeLeave) : void 0
		});
	}
	return defu(..._props);
}
//#endregion
//#region node_modules/nuxt/dist/pages/runtime/router.options.js
var router_options_default = { scrollBehavior(to, from, savedPosition) {
	const nuxtApp = useNuxtApp();
	const router = useRouter();
	const hashScrollBehaviour = router.options?.scrollBehaviorType ?? "auto";
	if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
		if (from.hash && !to.hash) return savedPosition ?? {
			left: 0,
			top: 0
		};
		if (to.hash) return {
			el: to.hash,
			top: _getHashElementScrollMarginTop(to.hash),
			behavior: hashScrollBehaviour
		};
		return false;
	}
	if ((typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop) === false) return false;
	if (from === START_LOCATION) return _calculatePosition(to, from, savedPosition, hashScrollBehaviour);
	return new Promise((resolve) => {
		const doScroll = () => {
			requestAnimationFrame(() => {
				if (router.currentRoute.value.fullPath !== to.fullPath) {
					resolve(false);
					return;
				}
				resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour));
			});
		};
		nuxtApp.hooks.hookOnce("page:loading:end", () => {
			const transitionPromise = nuxtApp["~transitionPromise"];
			if (transitionPromise) transitionPromise.then(doScroll);
			else doScroll();
		});
	});
} };
function _getHashElementScrollMarginTop(selector) {
	try {
		const elem = (void 0).querySelector(selector);
		if (elem) return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
	} catch {}
	return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
	if (savedPosition) return savedPosition;
	if (to.hash) return {
		el: to.hash,
		top: _getHashElementScrollMarginTop(to.hash),
		behavior: isChangingPage(to, from) ? defaultHashScrollBehaviour : "instant"
	};
	return {
		left: 0,
		top: 0
	};
}
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default = {
	hashMode: false,
	scrollBehaviorType: "auto",
	...router_options_default
};
//#endregion
//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Froute-rules.mjs
var sensitiveMatcher = (m, p) => {
	return [];
};
var foldedMatcher = sensitiveMatcher;
var decodeRoutePath = function decodeRoutePath(path) {
	if (!path.includes("%")) return path;
	const queryIndex = path.indexOf("?");
	const pathname = queryIndex === -1 ? path : path.slice(0, queryIndex);
	try {
		return queryIndex === -1 ? decodeURI(pathname) : decodeURI(pathname) + path.slice(queryIndex);
	} catch {
		return path;
	}
};
var normalizePath = (path, fold) => {
	if (typeof path !== "string") return path;
	const decoded = decodeRoutePath(path);
	return fold ? decoded.toLowerCase() : decoded;
};
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froute_rules_default = (path) => virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.sensitive ? defu({}, ...sensitiveMatcher("", normalizePath(path, false)).map((r) => r.data).reverse()) : defu({}, ...foldedMatcher("", normalizePath(path, true)).map((r) => r.data).reverse());
//#endregion
//#region node_modules/nuxt/dist/app/composables/manifest.js
var routeRulesMatcher$1 = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froute_rules_default;
function getRouteRules(arg) {
	const path = typeof arg === "string" ? arg : arg.path;
	try {
		return routeRulesMatcher$1(path);
	} catch (e) {
		manifestDiagnostics.NUXT_E5003({
			path,
			cause: e
		});
		return {};
	}
}
//#endregion
//#region node_modules/nuxt/dist/app/composables/payload.js
/**
* This is an experimental function for configuring passing rich data from server -> client.
* @since 3.4.0
*/
function definePayloadReducer(name, reduce) {
	useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
}
//#endregion
//#region node_modules/@pinia/nuxt/dist/runtime/payload-plugin.js
var payloadPlugin = definePayloadPlugin(() => {
	definePayloadReducer("skipHydrate", (data) => !shouldHydrate(data) && 1);
});
//#endregion
//#region node_modules/nuxt/dist/head/runtime/island-head.js
/**
* No-op `head.push` until the returned `unfreeze` runs. Plugin/transformer
* augmentations on the same head are unaffected.
*/
function freezeHead(head) {
	const realPush = head.push;
	head.push = () => ({
		dispose: () => {},
		patch: () => {},
		_i: 0
	});
	return () => {
		head.push = realPush;
	};
}
//#endregion
//#region node_modules/nuxt/dist/head/runtime/plugins/unhead.server.js
var plugin$3 = defineNuxtPlugin({
	name: "nuxt:head",
	enforce: "pre",
	setup(nuxtApp) {
		const head = nuxtApp.ssrContext.head;
		if (nuxtApp.ssrContext.islandContext) {
			const unfreeze = freezeHead(head);
			nuxtApp.hooks.hookOnce("app:created", unfreeze);
		}
		nuxtApp.vueApp.use(head);
	}
});
//#endregion
//#region node_modules/nuxt/dist/pages/runtime/utils.js
var ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
var ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
var ROUTE_KEY_NORMAL_RE = /:\w+/g;
var interpolatePath = (route, match) => {
	return match.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
};
var generateRouteKey = (routeProps, override) => {
	const matchedRoute = routeProps.route.matched.find((m) => m.components?.default === routeProps.Component.type);
	const source = matchedRoute?.meta.key ?? (matchedRoute && interpolatePath(routeProps.route, matchedRoute));
	return typeof source === "function" ? source(routeProps.route) : source;
};
/** @since 3.9.0 */
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
Object.assign(Object.create(null), {});
var pageIslandRoutes = Object.assign(Object.create(null), {});
//#endregion
//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fmiddleware.mjs
var globalMiddleware = [defineNuxtRouteMiddleware(async (to) => {
	let __temp, __restore;
	if (!to.meta?.validate) return;
	const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
	if (result === true) return;
	return createError$1({
		fatal: false,
		status: result && (result.status || result.statusCode) || 404,
		statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
		data: { path: to.fullPath }
	});
}), /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {})];
var namedMiddleware = {};
//#endregion
//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Froutes.mjs
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froutes_default = [
	{
		name: "communities-edit-id",
		path: "/communities/edit/:id()",
		meta: { layout: "default" },
		component: () => import('../build/_id_-tSl6hsJc.mjs')
	},
	{
		name: "communities-new",
		path: "/communities/new",
		meta: { layout: "default" },
		component: () => import('../build/new-DEfJGIaO.mjs')
	},
	{
		name: "poi-new",
		path: "/poi/new",
		meta: { layout: "default" },
		component: () => import('../build/new-CII3utIp.mjs')
	},
	{
		name: "post-orders-new",
		path: "/post-orders/new",
		meta: { layout: "default" },
		component: () => import('../build/new-BoN5pE9J.mjs')
	},
	{
		name: "reports-new",
		path: "/reports/new",
		meta: { layout: "default" },
		component: () => import('../build/new-CbR2lVxE.mjs')
	},
	{
		name: "communities-id-residents-edit-residentId",
		path: "/communities/:id()/residents/edit/:residentId()",
		meta: { layout: "default" },
		component: () => import('../build/_residentId_-C80lZQGJ.mjs')
	},
	{
		name: "communities-id-residents-new",
		path: "/communities/:id()/residents/new",
		meta: {
			layout: "default",
			middleware: (to) => navigateTo(`/communities/${to.params.id}/residents`, { replace: true })
		},
		component: () => import('../build/new-CNscEAig.mjs')
	},
	{
		name: "communities-id-featured-officer",
		path: "/communities/:id()/featured-officer",
		meta: { layout: "default" },
		component: () => import('../build/featured-officer-D_T2c7zn.mjs')
	},
	{
		name: "communities-id-map",
		path: "/communities/:id()/map",
		meta: { layout: "default" },
		component: () => import('../build/map-Bw20ZP4p.mjs')
	},
	{
		name: "communities-id-officers",
		path: "/communities/:id()/officers",
		meta: { layout: "default" },
		component: () => import('../build/officers-BYBf8dsY.mjs')
	},
	{
		name: "communities-id-residents",
		path: "/communities/:id()/residents",
		meta: { layout: "default" },
		component: () => import('../build/residents-ciqFH72I.mjs')
	},
	{
		name: "poi-id-edit",
		path: "/poi/:id()/edit",
		meta: { layout: "default" },
		component: () => import('../build/edit-CPq8kyuc.mjs')
	},
	{
		name: "reports-id-edit",
		path: "/reports/:id()/edit",
		meta: { layout: "default" },
		component: () => import('../build/edit-G-iYVjRg.mjs')
	},
	{
		name: "reports-id-format",
		path: "/reports/:id()/format",
		meta: { layout: "default" },
		component: () => import('../build/format-HmuO2wk6.mjs')
	},
	{
		name: "poi-id",
		path: "/poi/:id()",
		meta: { layout: "default" },
		component: () => import('../build/_id_-DxhueeD9.mjs')
	},
	{
		name: "post-orders-id",
		path: "/post-orders/:id()",
		meta: { layout: "default" },
		component: () => import('../build/_id_-CFdptv2D.mjs')
	},
	{
		name: "calls",
		path: "/calls",
		meta: { layout: "default" },
		component: () => import('../build/calls-DarJE8HJ.mjs')
	},
	{
		name: "change-password",
		path: "/change-password",
		meta: { layout: "auth" },
		component: () => import('../build/change-password-Ca2UnMaS.mjs')
	},
	{
		name: "communities",
		path: "/communities",
		meta: { layout: "default" },
		component: () => import('../build/communities-DQwBHFIT.mjs')
	},
	{
		name: "dashboard",
		path: "/dashboard",
		meta: { layout: "default" },
		component: () => import('../build/dashboard-BxGqzsaN.mjs')
	},
	{
		name: "live-tracking",
		path: "/live-tracking",
		meta: { layout: "default" },
		component: () => import('../build/live-tracking-bFNs-lml.mjs')
	},
	{
		name: "login",
		path: "/login",
		meta: { layout: "auth" },
		component: () => import('../build/login-DjMbfmdL.mjs')
	},
	{
		name: "officers",
		path: "/officers",
		meta: { layout: "default" },
		component: () => import('../build/officers-BV7aibnj.mjs')
	},
	{
		name: "poi",
		path: "/poi",
		meta: { layout: "default" },
		component: () => import('../build/poi-yaaaE-X-.mjs')
	},
	{
		name: "post-orders",
		path: "/post-orders",
		meta: { layout: "default" },
		component: () => import('../build/post-orders-CI_hys1A.mjs')
	},
	{
		name: "reports",
		path: "/reports",
		meta: { layout: "default" },
		component: () => import('../build/reports-BRjD2DjA.mjs')
	},
	{
		name: "settings",
		path: "/settings",
		meta: { layout: "default" },
		component: () => import('../build/settings-DI14o5Kv.mjs')
	},
	{
		name: "shifts",
		path: "/shifts",
		meta: { layout: "default" },
		component: () => import('../build/shifts-BtmQR8jG.mjs')
	},
	{
		name: "tasks",
		path: "/tasks",
		meta: { layout: "default" },
		component: () => import('../build/tasks-CDPmnApS.mjs')
	},
	{
		name: "users",
		path: "/users",
		meta: { layout: "default" },
		component: () => import('../build/users-xb5BQN8v.mjs')
	},
	{
		name: "index",
		path: "/",
		component: () => import('../build/pages-C556uukk.mjs')
	}
];
//#endregion
//#region node_modules/nuxt/dist/pages/runtime/plugins/router.js
var plugin$2 = defineNuxtPlugin({
	name: "nuxt:router",
	enforce: "pre",
	async setup(nuxtApp) {
		let __temp, __restore;
		let routerBase = useRuntimeConfig().app.baseURL;
		const history = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.history?.(routerBase) ?? createMemoryHistory(routerBase);
		const routes = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.routes ? ([__temp, __restore] = executeAsync(() => virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.routes(virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froutes_default)), __temp = await __temp, __restore(), __temp) ?? virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froutes_default : virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froutes_default;
		let startPosition;
		const router = createRouter({
			...virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default,
			scrollBehavior: (to, from, savedPosition) => {
				if (from === START_LOCATION) {
					startPosition = savedPosition;
					return;
				}
				if (virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.scrollBehavior) {
					router.options.scrollBehavior = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.scrollBehavior;
					if ("scrollRestoration" in (void 0).history) {
						const unsub = router.beforeEach(() => {
							unsub();
							(void 0).history.scrollRestoration = "manual";
						});
					}
					return virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
				}
			},
			history,
			routes
		});
		nuxtApp.vueApp.use(router);
		const previousRoute = shallowRef(router.currentRoute.value);
		router.afterEach((_to, from) => {
			previousRoute.value = from;
		});
		Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", { get: () => previousRoute.value });
		const initialURL = nuxtApp.ssrContext.url;
		const _route = shallowRef(router.currentRoute.value);
		const syncCurrentRoute = () => {
			_route.value = router.currentRoute.value;
		};
		router.afterEach((to, from) => {
			const lastTo = to.matched.at(-1)?.components?.default;
			const lastFrom = from.matched.at(-1)?.components?.default;
			if (lastTo === lastFrom) {
				if (generateRouteKey({
					route: to,
					Component: { type: lastTo }
				}) === generateRouteKey({
					route: from,
					Component: { type: lastFrom }
				})) syncCurrentRoute();
				return;
			}
			if (to.matched.length < from.matched.length && to.matched.every((m, i) => m.components?.default === from.matched[i]?.components?.default)) syncCurrentRoute();
		});
		const route = { sync: syncCurrentRoute };
		for (const key in _route.value) Object.defineProperty(route, key, {
			get: () => _route.value[key],
			enumerable: true
		});
		nuxtApp._route = shallowReactive(route);
		nuxtApp._middleware ||= {
			global: [],
			named: {}
		};
		const error = useError();
		const isServerPage = nuxtApp.ssrContext?.islandContext?.name?.startsWith("page_");
		if (!nuxtApp.ssrContext?.islandContext || isServerPage) router.afterEach(async (to, _from, failure) => {
			delete nuxtApp._processingMiddleware;
			delete nuxtApp._middlewareTo;
			if (failure) await nuxtApp.callHook("page:loading:end");
			if (failure?.type === 4) return;
			if (to.redirectedFrom && to.fullPath !== initialURL) await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
		});
		try {
			[__temp, __restore] = executeAsync(() => router.push(initialURL)), __temp = await __temp, __restore();
			[__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
		} catch (error) {
			[__temp, __restore] = executeAsync(() => _showErrorUnlessCrawler(nuxtApp, error)), await __temp, __restore();
		}
		const resolvedInitialRoute = router.currentRoute.value;
		syncCurrentRoute();
		if (nuxtApp.ssrContext?.islandContext && !isServerPage) return { provide: { router } };
		const initialLayout = nuxtApp.payload.state._layout;
		router.beforeEach(async (to, from) => {
			await nuxtApp.callHook("page:loading:start");
			to.meta = reactive(to.meta);
			if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) to.meta.layout = initialLayout;
			nuxtApp._processingMiddleware = true;
			nuxtApp._middlewareTo = to;
			if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
				const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
				for (const component of to.matched) {
					const componentMiddleware = component.meta.middleware;
					if (!componentMiddleware) continue;
					for (const entry of toArray(componentMiddleware)) middlewareEntries.add(entry);
				}
				const routeRules = getRouteRules({ path: to.path });
				if (routeRules.appMiddleware) for (const key in routeRules.appMiddleware) if (routeRules.appMiddleware[key]) middlewareEntries.add(key);
				else middlewareEntries.delete(key);
				for (const entry of middlewareEntries) {
					const middleware = typeof entry === "string" ? nuxtApp._middleware.named[entry] || await namedMiddleware[entry]?.().then((r) => r.default || r) : entry;
					if (!middleware) throw navigationDiagnostics.NUXT_E2004({
						entry: String(entry),
						validMiddleware: void 0
					});
					try {
						const result = await nuxtApp.runWithContext(() => middleware(to, from));
						if (result === false || result instanceof Error) {
							const error = result || createError$1({
								status: 404,
								statusText: `Page Not Found: ${initialURL}`
							});
							await nuxtApp.runWithContext(() => showError(error));
							return false;
						}
						if (result === true) continue;
						if (result === false) return result;
						if (result) {
							if (isNuxtError(result) && result.fatal) await nuxtApp.runWithContext(() => showError(result));
							return result;
						}
					} catch (err) {
						const error = createError$1(err);
						if (error.fatal) await nuxtApp.runWithContext(() => showError(error));
						return error;
					}
				}
			}
		});
		if (isServerPage) router.beforeResolve((to) => {
			const expected = pageIslandRoutes[nuxtApp.ssrContext.islandContext.name];
			const actual = to.matched.find((m) => (m.components?.default)?.__nuxt_island)?.components?.default;
			if (!expected || expected !== actual?.__nuxt_island) {
				nuxtApp.ssrContext["~renderResponse"] = {
					statusCode: 400,
					statusMessage: "Invalid island request path"
				};
				return false;
			}
		});
		router.onError(async () => {
			delete nuxtApp._processingMiddleware;
			delete nuxtApp._middlewareTo;
			await nuxtApp.callHook("page:loading:end");
		});
		router.afterEach((to) => {
			if (to.matched.length === 0 && !error.value) return nuxtApp.runWithContext(() => showError(createError$1({
				status: 404,
				fatal: false,
				statusText: `Page not found: ${to.fullPath}`,
				data: { path: to.fullPath }
			})));
		});
		nuxtApp.hooks.hookOnce("app:created", async () => {
			try {
				if ("name" in resolvedInitialRoute) resolvedInitialRoute.name = void 0;
				await router.replace({
					...resolvedInitialRoute,
					force: true
				});
				router.options.scrollBehavior = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Frouter_options_default.scrollBehavior;
			} catch (error) {
				await _showErrorUnlessCrawler(nuxtApp, error);
			}
		});
		return { provide: { router } };
	}
});
//#endregion
//#region node_modules/nuxt/dist/app/plugins/revive-payload.server.js
var reducers = [
	["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
	["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
	["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
	["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
	["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
	["Ref", (data) => isRef(data) && data.value],
	["Reactive", (data) => isReactive(data) && toRaw(data)]
];
var plugin$1 = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:revive-payload:server",
	setup() {
		for (const [reducer, fn] of reducers) definePayloadReducer(reducer, fn);
	}
});
/** client-end **/
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Fapp_config_default = /*@__PURE__*/ defuFn({
	"nuxt": {},
	"icon": {
		"provider": "server",
		"class": "",
		"aliases": {},
		"iconifyApiEndpoint": "https://api.iconify.design",
		"localApiEndpoint": "/api/_nuxt_icon",
		"fallbackToApi": true,
		"cssSelectorPrefix": "i-",
		"cssWherePseudo": true,
		"mode": "css",
		"attrs": { "aria-hidden": true },
		"collections": [
			"academicons",
			"akar-icons",
			"ant-design",
			"arcticons",
			"basil",
			"bi",
			"bitcoin-icons",
			"bpmn",
			"brandico",
			"bx",
			"bxl",
			"bxs",
			"bytesize",
			"carbon",
			"catppuccin",
			"cbi",
			"charm",
			"ci",
			"cib",
			"cif",
			"cil",
			"circle-flags",
			"circum",
			"clarity",
			"codex",
			"codicon",
			"covid",
			"cryptocurrency",
			"cryptocurrency-color",
			"cuida",
			"dashicons",
			"devicon",
			"devicon-plain",
			"dinkie-icons",
			"duo-icons",
			"ei",
			"el",
			"emojione",
			"emojione-monotone",
			"emojione-v1",
			"entypo",
			"entypo-social",
			"eos-icons",
			"ep",
			"et",
			"eva",
			"f7",
			"fa",
			"fa-brands",
			"fa-regular",
			"fa-solid",
			"fa6-brands",
			"fa6-regular",
			"fa6-solid",
			"fa7-brands",
			"fa7-regular",
			"fa7-solid",
			"fad",
			"famicons",
			"fe",
			"feather",
			"file-icons",
			"flag",
			"flagpack",
			"flat-color-icons",
			"flat-ui",
			"flowbite",
			"fluent",
			"fluent-color",
			"fluent-emoji",
			"fluent-emoji-flat",
			"fluent-emoji-high-contrast",
			"fluent-mdl2",
			"fontelico",
			"fontisto",
			"formkit",
			"foundation",
			"fxemoji",
			"gala",
			"game-icons",
			"garden",
			"geo",
			"gg",
			"gis",
			"gravity-ui",
			"gridicons",
			"grommet-icons",
			"guidance",
			"healthicons",
			"heroicons",
			"heroicons-outline",
			"heroicons-solid",
			"hugeicons",
			"humbleicons",
			"ic",
			"icomoon-free",
			"icon-park",
			"icon-park-outline",
			"icon-park-solid",
			"icon-park-twotone",
			"iconamoon",
			"iconoir",
			"icons8",
			"il",
			"ion",
			"iwwa",
			"ix",
			"jam",
			"la",
			"lets-icons",
			"line-md",
			"lineicons",
			"logos",
			"ls",
			"lsicon",
			"lucide",
			"lucide-lab",
			"mage",
			"majesticons",
			"maki",
			"map",
			"marketeq",
			"material-icon-theme",
			"material-symbols",
			"material-symbols-light",
			"mdi",
			"mdi-light",
			"medical-icon",
			"memory",
			"meteocons",
			"meteor-icons",
			"mi",
			"mingcute",
			"mono-icons",
			"mynaui",
			"nimbus",
			"nonicons",
			"noto",
			"noto-v1",
			"nrk",
			"octicon",
			"oi",
			"ooui",
			"openmoji",
			"oui",
			"pajamas",
			"pepicons",
			"pepicons-pencil",
			"pepicons-pop",
			"pepicons-print",
			"ph",
			"picon",
			"pixel",
			"pixelarticons",
			"prime",
			"proicons",
			"ps",
			"qlementine-icons",
			"quill",
			"radix-icons",
			"raphael",
			"ri",
			"rivet-icons",
			"roentgen",
			"si",
			"si-glyph",
			"sidekickicons",
			"simple-icons",
			"simple-line-icons",
			"skill-icons",
			"solar",
			"stash",
			"streamline",
			"streamline-block",
			"streamline-color",
			"streamline-cyber",
			"streamline-cyber-color",
			"streamline-emojis",
			"streamline-flex",
			"streamline-flex-color",
			"streamline-freehand",
			"streamline-freehand-color",
			"streamline-kameleon-color",
			"streamline-logos",
			"streamline-pixel",
			"streamline-plump",
			"streamline-plump-color",
			"streamline-sharp",
			"streamline-sharp-color",
			"streamline-stickies-color",
			"streamline-ultimate",
			"streamline-ultimate-color",
			"subway",
			"svg-spinners",
			"system-uicons",
			"tabler",
			"tdesign",
			"teenyicons",
			"temaki",
			"token",
			"token-branded",
			"topcoat",
			"twemoji",
			"typcn",
			"uil",
			"uim",
			"uis",
			"uit",
			"uiw",
			"unjs",
			"vaadin",
			"vs",
			"vscode-icons",
			"websymbol",
			"weui",
			"whh",
			"wi",
			"wpf",
			"zmdi",
			"zondicons"
		],
		"fetchTimeout": 1500
	}
});
//#endregion
//#region node_modules/nuxt/dist/app/config.js
function useAppConfig() {
	const nuxtApp = useNuxtApp();
	nuxtApp._appConfig ||= klona(virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Fapp_config_default);
	return nuxtApp._appConfig;
}
//#endregion
//#region node_modules/nuxt/dist/app/utils/hash.js
/**
* Hash an arbitrary value into a short, stable string key.
*
* Values are serialized to a canonical, locale-independent representation
* (equal structures hash equally regardless of key order or runtime locale),
* then digested with a fast non-cryptographic hash. This is what `useFetch` and
* `useAsyncData` use internally to derive their cache keys, so it is safe to use
* for the same purpose in your own code.
*
* The digest is non-cryptographic and must not be used for integrity checks.
*
* @since 4.5.0
*/
function hashKey(value) {
	return fnv1a64Base36(identify(value));
}
//#endregion
//#region node_modules/nuxt/dist/app/utils/debounce-tick.js
/**
* Debounce an async function so that repeated calls within the same tick are
* collapsed into a single call (plus a trailing call if arguments arrived
* while the debounced call was still pending).
*
* Adapted from https://github.com/unjs/perfect-debounce with the timeout
* replaced by Vue's post-flush callback queue.
*/
function debounceTick(fn, options = {}) {
	let leadingValue;
	let active = false;
	let resolveList = [];
	let currentPromise;
	let trailingArgs;
	const applyFn = (_this, args) => {
		const promise = _applyPromised(fn, _this, args);
		currentPromise = promise;
		promise.finally(() => {
			currentPromise = void 0;
			if (trailingArgs && !active) {
				const args = trailingArgs;
				trailingArgs = void 0;
				applyFn(_this, args);
			}
		});
		return promise;
	};
	return function(...args) {
		trailingArgs = args;
		if (currentPromise) return currentPromise;
		return new Promise((resolve) => {
			const shouldCallNow = options.leading && !active;
			if (!active) {
				active = true;
				queuePostFlushCb(() => {
					active = false;
					const flushArgs = trailingArgs ?? args;
					trailingArgs = void 0;
					const promise = options.leading ? leadingValue : applyFn(this, flushArgs);
					for (const _resolve of resolveList) _resolve(promise);
					resolveList = [];
				});
			}
			if (shouldCallNow) {
				leadingValue = applyFn(this, args);
				resolve(leadingValue);
			} else resolveList.push(resolve);
		});
	};
}
async function _applyPromised(fn, _this, args) {
	return await fn.apply(_this, args);
}
//#endregion
//#region node_modules/nuxt/dist/app/components/server-placeholder.js
var ServerPlaceholder = defineComponent({
	name: "ServerPlaceholder",
	render() {
		return createElementBlock("div");
	}
});
//#endregion
//#region node_modules/nuxt/dist/app/components/client-only.js
var clientOnlySymbol = Symbol.for("nuxt:client-only");
defineComponent({
	name: "ClientOnly",
	inheritAttrs: false,
	props: [
		"fallback",
		"placeholder",
		"placeholderTag",
		"fallbackTag"
	],
	setup(props, { slots, attrs }) {
		const mounted = shallowRef(false);
		const vm = getCurrentInstance();
		if (vm) vm._nuxtClientOnly = true;
		provide(clientOnlySymbol, true);
		return () => {
			if (mounted.value) {
				const vnodes = slots.default?.();
				if (vnodes && vnodes.length === 1) return [cloneVNode(vnodes[0], attrs)];
				return vnodes;
			}
			const slot = slots.fallback || slots.placeholder;
			if (slot) return h(slot);
			const fallbackStr = props.fallback || props.placeholder || "";
			const fallbackTag = sanitizeTag(props.fallbackTag || props.placeholderTag, "span");
			return createElementBlock(fallbackTag, attrs, fallbackStr);
		};
	}
});
//#endregion
//#region node_modules/nuxt/dist/compiler/runtime/index.js
/**
* Define a factory for a function that should be registered for automatic key injection.
* @since 4.2.0
* @param factory
*/
function defineKeyedFunctionFactory(factory) {
	const placeholder = function() {
		throw appDiagnostics.NUXT_E1007({ name: factory.name });
	};
	return Object.defineProperty(placeholder, "__nuxt_factory", {
		enumerable: false,
		get: () => factory.factory
	});
}
//#endregion
//#region node_modules/nuxt/dist/app/diagnostics/data.js
/**
* E3xxx
* Data fetching (useFetch / useAsyncData) runtime diagnostics.
*/
var dataDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
//#endregion
//#region node_modules/nuxt/dist/app/composables/asyncData.js
var createUseAsyncData = defineKeyedFunctionFactory({
	name: "createUseAsyncData",
	factory(options = {}) {
		function useAsyncData(...args) {
			const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
			if (_isAutoKeyNeeded(args[0], args[1])) args.unshift(autoKey);
			let [_key, _handler, opts = {}] = args;
			const key = isRef(_key) || typeof _key === "function" ? computed(() => toValue(_key)) : { value: _key };
			if (!key.value || typeof key.value !== "string") throw dataDiagnostics.NUXT_E3008();
			if (typeof _handler !== "function") throw dataDiagnostics.NUXT_E3009();
			const shouldFactoryOptionsOverride = typeof options === "function";
			const nuxtApp = useNuxtApp();
			const factoryOptions = shouldFactoryOptionsOverride ? options(opts) : options;
			if (!shouldFactoryOptionsOverride) for (const key in factoryOptions) {
				if (factoryOptions[key] === void 0) continue;
				if (opts[key] !== void 0) continue;
				opts[key] = factoryOptions[key];
			}
			opts.server ??= true;
			opts.default ??= getDefault;
			opts.getCachedData ??= getDefaultCachedData;
			opts.lazy ??= false;
			opts.immediate ??= true;
			opts.deep ??= asyncDataDefaults.deep;
			opts.dedupe ??= "cancel";
			opts.enabled ??= true;
			if (shouldFactoryOptionsOverride) for (const key in factoryOptions) {
				if (factoryOptions[key] === void 0) continue;
				opts[key] = factoryOptions[key];
			}
			nuxtApp._asyncData[key.value];
			function createInitialFetch() {
				const initialFetchOptions = {
					cause: "initial",
					dedupe: opts.dedupe
				};
				const existing = nuxtApp._asyncData[key.value];
				if (!existing?._init) {
					initialFetchOptions.cachedData = opts.getCachedData(key.value, nuxtApp, { cause: "initial" });
					nuxtApp._asyncData[key.value] = buildAsyncData(nuxtApp, key.value, _handler, opts, initialFetchOptions.cachedData);
					nuxtApp._asyncData[key.value]._initialCachedData = initialFetchOptions.cachedData;
				} else if (nuxtApp._asyncDataPromises[key.value]) initialFetchOptions.cachedData = existing._initialCachedData;
				return () => nuxtApp._asyncData[key.value].execute(initialFetchOptions);
			}
			const initialFetch = createInitialFetch();
			const asyncData = nuxtApp._asyncData[key.value];
			asyncData._deps++;
			if (opts.server !== false && nuxtApp.payload.serverRendered && opts.immediate) {
				const promise = initialFetch();
				if (getCurrentInstance()) onServerPrefetch(() => promise);
				else nuxtApp.hook("app:created", async () => {
					await promise;
				});
			}
			const asyncReturn = {
				data: writableComputedRef(() => nuxtApp._asyncData[key.value]?.data),
				pending: writableComputedRef(() => nuxtApp._asyncData[key.value]?.pending),
				status: writableComputedRef(() => nuxtApp._asyncData[key.value]?.status),
				error: writableComputedRef(() => nuxtApp._asyncData[key.value]?.error),
				refresh: (...args) => {
					if (!nuxtApp._asyncData[key.value]?._init) return createInitialFetch()();
					return nuxtApp._asyncData[key.value].execute(...args);
				},
				execute: (...args) => asyncReturn.refresh(...args),
				clear: () => {
					const entry = nuxtApp._asyncData[key.value];
					if (entry?._abortController) try {
						entry._abortController.abort(new DOMException("AsyncData aborted by user.", "AbortError"));
					} finally {
						entry._abortController = void 0;
					}
					clearNuxtDataByKey(nuxtApp, key.value);
				}
			};
			const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key.value]).then(() => asyncReturn);
			Object.assign(asyncDataPromise, asyncReturn);
			Object.defineProperties(asyncDataPromise, {
				then: {
					enumerable: true,
					value: asyncDataPromise.then.bind(asyncDataPromise)
				},
				catch: {
					enumerable: true,
					value: asyncDataPromise.catch.bind(asyncDataPromise)
				},
				finally: {
					enumerable: true,
					value: asyncDataPromise.finally.bind(asyncDataPromise)
				}
			});
			return asyncDataPromise;
		}
		return useAsyncData;
	}
});
var useAsyncData = createUseAsyncData.__nuxt_factory();
createUseAsyncData.__nuxt_factory({
	lazy: true,
	_functionName: "useLazyAsyncData"
});
function writableComputedRef(getter) {
	return computed({
		get() {
			return getter()?.value;
		},
		set(value) {
			const ref = getter();
			if (ref) ref.value = value;
		}
	});
}
function _isAutoKeyNeeded(keyOrFetcher, fetcher) {
	if (typeof keyOrFetcher === "string") return false;
	if (typeof keyOrFetcher === "object" && keyOrFetcher !== null) return false;
	if (typeof keyOrFetcher === "function" && typeof fetcher === "function") return false;
	return true;
}
function clearNuxtDataByKey(nuxtApp, key) {
	delete nuxtApp.payload.data[key];
	delete nuxtApp.payload._errors[key];
	if (nuxtApp._asyncData[key]) {
		nuxtApp._asyncData[key].data.value = unref(nuxtApp._asyncData[key]._default());
		nuxtApp._asyncData[key].error.value = void 0;
		nuxtApp._asyncData[key].status.value = "idle";
		nuxtApp._asyncData[key]._initialCachedData = void 0;
	}
	delete nuxtApp._asyncDataPromises[key];
}
function pick(obj, keys) {
	const newObj = {};
	for (const key of keys) newObj[key] = obj[key];
	return newObj;
}
function buildAsyncData(nuxtApp, key, _handler, options, initialCachedData) {
	nuxtApp.payload._errors[key] ??= void 0;
	const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData;
	const handler = _handler ;
	const _ref = options.deep ? ref : shallowRef;
	const hasCachedData = initialCachedData !== void 0;
	const unsubRefreshAsyncData = nuxtApp.hook("app:data:refresh", async (keys) => {
		if (!keys || keys.includes(key)) await asyncData.execute({ cause: "refresh:hook" });
	});
	const asyncData = {
		data: _ref(hasCachedData ? initialCachedData : options.default()),
		pending: computed(() => asyncData.status.value === "pending"),
		error: toRef(nuxtApp.payload._errors, key),
		status: shallowRef("idle"),
		execute: (...args) => {
			const [_opts, newValue = void 0] = args;
			const opts = _opts && newValue === void 0 && typeof _opts === "object" ? _opts : {};
			if (nuxtApp._asyncDataPromises[key]) {
				if ((opts.dedupe ?? options.dedupe) === "defer") return nuxtApp._asyncDataPromises[key];
			}
			{
				const cachedData = "cachedData" in opts ? opts.cachedData : options.getCachedData(key, nuxtApp, { cause: opts.cause ?? "refresh:manual" });
				if (cachedData !== void 0) {
					nuxtApp.payload.data[key] = asyncData.data.value = cachedData;
					asyncData.error.value = void 0;
					asyncData.status.value = "success";
					return Promise.resolve(cachedData);
				}
			}
			if (toValue(options.enabled) === false) return Promise.resolve(asyncData.data.value);
			if (asyncData._abortController) asyncData._abortController.abort(new DOMException("AsyncData request cancelled by deduplication", "AbortError"));
			asyncData._abortController = new AbortController();
			asyncData.status.value = "pending";
			const cleanupController = new AbortController();
			const promise = new Promise((resolve, reject) => {
				try {
					const timeout = opts.timeout ?? options.timeout;
					const mergedSignal = mergeAbortSignals([asyncData._abortController?.signal, opts?.signal], cleanupController.signal, timeout);
					if (mergedSignal.aborted) {
						const reason = mergedSignal.reason;
						reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
						return;
					}
					mergedSignal.addEventListener("abort", () => {
						const reason = mergedSignal.reason;
						reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
					}, {
						once: true,
						signal: cleanupController.signal
					});
					return Promise.resolve(handler(nuxtApp, { signal: mergedSignal })).then(resolve, reject);
				} catch (err) {
					reject(err);
				}
			}).then(async (_result) => {
				if (nuxtApp._asyncDataPromises[key] !== promise) return;
				let result = _result;
				if (options.transform) result = await options.transform(_result);
				if (options.pick) result = pick(result, options.pick);
				nuxtApp.payload.data[key] = result;
				asyncData.data.value = result;
				asyncData.error.value = void 0;
				asyncData.status.value = "success";
			}).catch((error) => {
				if (nuxtApp._asyncDataPromises[key] !== promise) return nuxtApp._asyncDataPromises[key];
				if (asyncData._abortController?.signal.aborted) return nuxtApp._asyncDataPromises[key];
				if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
					asyncData.status.value = "idle";
					return nuxtApp._asyncDataPromises[key];
				}
				asyncData.error.value = createError$1(error);
				asyncData.data.value = unref(options.default());
				asyncData.status.value = "error";
			}).finally(() => {
				cleanupController.abort();
				if (nuxtApp._asyncDataPromises[key] === promise) delete nuxtApp._asyncDataPromises[key];
			});
			nuxtApp._asyncDataPromises[key] = promise;
			return nuxtApp._asyncDataPromises[key];
		},
		_execute: debounceTick((...args) => asyncData.execute(...args)),
		_default: options.default,
		_deps: 0,
		_init: true,
		_hash: void 0,
		_off: () => {
			unsubRefreshAsyncData();
			if (nuxtApp._asyncData[key]?._init) nuxtApp._asyncData[key]._init = false;
			if (nuxtApp._asyncDataPromises[key]) {
				asyncData._abortController?.abort(new DOMException("AsyncData request cancelled by unmount", "AbortError"));
				delete nuxtApp._asyncDataPromises[key];
				if (asyncData.status.value === "pending") asyncData.status.value = "idle";
			}
			if (!hasCustomGetCachedData) nextTick(() => {
				if (!nuxtApp._asyncData[key]?._init) {
					clearNuxtDataByKey(nuxtApp, key);
					asyncData.execute = () => Promise.resolve();
				}
			});
		}
	};
	return asyncData;
}
var getDefault = () => void 0;
var getDefaultCachedData = (key, nuxtApp, ctx) => {
	if (nuxtApp.isHydrating) return nuxtApp.payload.data[key];
	if (ctx.cause !== "refresh:manual" && ctx.cause !== "refresh:hook") return nuxtApp.static.data[key];
};
function mergeAbortSignals(signals, cleanupSignal, timeout) {
	const list = signals.filter((s) => !!s);
	if (typeof timeout === "number" && timeout >= 0) {
		const timeoutSignal = AbortSignal.timeout?.(timeout);
		if (timeoutSignal) list.push(timeoutSignal);
	}
	if (AbortSignal.any) return AbortSignal.any(list);
	const controller = new AbortController();
	for (const sig of list) if (sig.aborted) {
		const reason = sig.reason ?? new DOMException("Aborted", "AbortError");
		try {
			controller.abort(reason);
		} catch {
			controller.abort();
		}
		return controller.signal;
	}
	const onAbort = () => {
		const reason = list.find((s) => s.aborted)?.reason ?? new DOMException("Aborted", "AbortError");
		try {
			controller.abort(reason);
		} catch {
			controller.abort();
		}
	};
	for (const sig of list) sig.addEventListener?.("abort", onAbort, {
		once: true,
		signal: cleanupSignal
	});
	return controller.signal;
}
//#endregion
//#region node_modules/nuxt/dist/app/composables/ssr.js
var $fetch$1$1 = $fetch$2;
/** @since 3.0.0 */
function useRequestEvent(nuxtApp) {
	nuxtApp ||= useNuxtApp();
	return nuxtApp.ssrContext?.event;
}
/** @since 3.2.0 */
function useRequestFetch() {
	return useRequestEvent()?.$fetch || $fetch$1$1;
}
//#endregion
//#region node_modules/nuxt/dist/app/composables/fetch.js
var $fetch$1 = $fetch$2;
var MAYBE_REF_OR_GETTER_OPTION_KEYS = [
	"method",
	"baseURL",
	"query",
	"params",
	"body",
	"headers"
];
function generateOptionSegments(opts) {
	const segments = [toValue(opts.method)?.toUpperCase() || "GET", toValue(opts.baseURL)];
	for (const _obj of [opts.query || opts.params]) {
		const obj = toValue(_obj);
		if (!obj) continue;
		const unwrapped = {};
		for (const [key, value] of Object.entries(obj)) unwrapped[toValue(key)] = toValue(value);
		segments.push(unwrapped);
	}
	if (opts.body) {
		const value = toValue(opts.body);
		if (!value) segments.push(hashKey(value));
		else if (value instanceof ArrayBuffer) segments.push(hashKey(Object.fromEntries([...new Uint8Array(value).entries()].map(([k, v]) => [k, v.toString()]))));
		else if (value instanceof FormData) {
			const entries = [];
			for (const entry of value.entries()) {
				const [key, val] = entry;
				entries.push([key, val instanceof File ? `${val.name}:${val.size}:${val.lastModified}` : val]);
			}
			segments.push(hashKey(entries));
		} else if (isPlainObject(value)) segments.push(hashKey(reactive(value)));
		else try {
			segments.push(hashKey(value));
		} catch {
			dataDiagnostics.NUXT_E3002({ cause: value });
		}
	}
	return segments;
}
/**
* A factory function to create a custom `useFetch` composable with pre-defined default options.
* @since 4.2.0
*/
var createUseFetch = defineKeyedFunctionFactory({
	name: "createUseFetch",
	factory(options = {}) {
		function useFetch(request, arg1, arg2) {
			const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
			const factoryOptions = typeof options === "function" ? options(opts) : options;
			const { server, lazy, default: defaultFn, transform, pick, watch: watchSources, immediate, getCachedData, deep, dedupe, timeout, enabled, ...fetchOptions } = {
				...typeof options === "function" ? {} : factoryOptions,
				...opts,
				...typeof options === "function" ? factoryOptions : {}
			};
			const _request = computed(() => toValue(request));
			const key = computed(() => toValue(fetchOptions.key) || "$f" + hashKey([
				autoKey,
				typeof _request.value === "string" ? _request.value : "",
				...generateOptionSegments(fetchOptions)
			]));
			if (!fetchOptions.baseURL && typeof _request.value === "string" && _request.value[0] === "/" && _request.value[1] === "/") throw dataDiagnostics.NUXT_E3001({ url: _request.value });
			const _fetchOptions = reactive({
				...fetchDefaults,
				...fetchOptions,
				cache: typeof fetchOptions.cache === "boolean" ? void 0 : fetchOptions.cache
			});
			const _asyncDataOptions = {
				server,
				lazy,
				default: defaultFn,
				transform,
				pick,
				immediate,
				getCachedData,
				deep,
				dedupe,
				timeout,
				enabled,
				watch: watchSources === false ? [] : [...watchSources || [], _fetchOptions]
			};
			if (watchSources === false) _asyncDataOptions._keyTriggersExecute = false;
			return useAsyncData(key, (_, { signal }) => {
				let _$fetch = fetchOptions.$fetch || $fetch$1;
				if (!fetchOptions.$fetch) {
					if (typeof _request.value === "string" && _request.value[0] === "/" && (!toValue(fetchOptions.baseURL) || toValue(fetchOptions.baseURL)[0] === "/")) _$fetch = useRequestFetch();
				}
				const resolvedOptions = {
					signal,
					..._fetchOptions
				};
				for (const key of MAYBE_REF_OR_GETTER_OPTION_KEYS) if (typeof resolvedOptions[key] === "function") resolvedOptions[key] = toValue(resolvedOptions[key]);
				return _$fetch(_request.value, resolvedOptions);
			}, _asyncDataOptions);
		}
		return useFetch;
	}
});
createUseFetch.__nuxt_factory();
createUseFetch.__nuxt_factory({
	lazy: true,
	_functionName: "useLazyFetch"
});
//#endregion
//#region node_modules/nuxt/dist/app/composables/layout.js
var routeRulesMatcher = virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Froute_rules_default;
function resolveLayoutName(route, name) {
	return unref(name) ?? route?.meta.layout ?? routeRulesMatcher(route?.path ?? "/").appLayout ?? "default";
}
//#endregion
//#region node_modules/nuxt/dist/app/components/nuxt-link.js
var firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
/**
* Reject URL strings that would resolve to a script-capable protocol when used as the
* `href` of an anchor element. Returns the value unchanged when safe, or `null`.
*
* The denylist is delegated to `ufo`'s `isScriptProtocol` so it stays in sync with the
* check used by `navigateTo` (currently `javascript:`, `data:`, `vbscript:`, `blob:`).
* ASCII whitespace and control characters are stripped first because browser URL
* parsers tolerate them before the scheme, and `view-source:` is peeled recursively
* because Chromium resolves it transparently to the inner URL.
*/
function sanitizeExternalHref(value) {
	let candidate = value.replace(/[\u0000-\u001F\s]+/g, "");
	while (candidate.toLowerCase().startsWith("view-source:")) candidate = candidate.slice(12);
	const colon = candidate.indexOf(":");
	if (colon > 0 && isScriptProtocol(candidate.slice(0, colon + 1))) return null;
	return value;
}
/* @__NO_SIDE_EFFECTS__ */
function defineNuxtLink(options) {
	const componentName = options.componentName || "NuxtLink";
	function isHashLinkWithoutHashMode(link) {
		return typeof link === "string" && link.startsWith("#");
	}
	function resolveTrailingSlashBehavior(to, resolve, trailingSlash) {
		const effectiveTrailingSlash = trailingSlash ?? options.trailingSlash;
		if (!to || effectiveTrailingSlash !== "append" && effectiveTrailingSlash !== "remove") return to;
		if (typeof to === "string") return applyTrailingSlashBehavior(to, effectiveTrailingSlash);
		const path = "path" in to && to.path !== void 0 ? to.path : resolve(to).path;
		return {
			...to,
			name: void 0,
			path: applyTrailingSlashBehavior(path, effectiveTrailingSlash)
		};
	}
	function useNuxtLink(props) {
		const router = useRouter();
		const config = /* @__PURE__ */ useRuntimeConfig();
		const hasTarget = computed(() => !!unref(props.target) && unref(props.target) !== "_self");
		const isAbsoluteUrl = computed(() => {
			const path = unref(props.to) || unref(props.href) || "";
			return typeof path === "string" && hasProtocol(path, { acceptRelative: true });
		});
		const builtinRouterLink = resolveComponent("RouterLink");
		const useBuiltinLink = builtinRouterLink && typeof builtinRouterLink !== "string" ? builtinRouterLink.useLink : void 0;
		const isExternal = computed(() => {
			if (unref(props.external)) return true;
			const path = unref(props.to) || unref(props.href) || "";
			if (typeof path === "object") return false;
			return path === "" || isAbsoluteUrl.value;
		});
		const to = computed(() => {
			const path = unref(props.to) || unref(props.href) || "";
			if (isExternal.value) return path;
			return resolveTrailingSlashBehavior(path, router.resolve, unref(props.trailingSlash));
		});
		const link = isExternal.value ? void 0 : useBuiltinLink?.({
			...props,
			to,
			viewTransition: unref(props.viewTransition)
		});
		const href = computed(() => {
			const effectiveTrailingSlash = unref(props.trailingSlash) ?? options.trailingSlash;
			if (!to.value || isAbsoluteUrl.value || isHashLinkWithoutHashMode(to.value)) {
				const raw = to.value;
				return typeof raw === "string" ? sanitizeExternalHref(raw) : raw;
			}
			if (isExternal.value) {
				const path = typeof to.value === "object" && "path" in to.value ? resolveRouteObject(to.value) : to.value;
				const href = typeof path === "object" ? router.resolve(path).href : path;
				const safe = typeof href === "string" ? sanitizeExternalHref(href) : href;
				return safe === null ? null : applyTrailingSlashBehavior(safe, effectiveTrailingSlash);
			}
			if (typeof to.value === "object") return router.resolve(to.value)?.href ?? null;
			return applyTrailingSlashBehavior(joinURL(config.app.baseURL, to.value), effectiveTrailingSlash);
		});
		return {
			to,
			hasTarget,
			isAbsoluteUrl,
			isExternal,
			href,
			isActive: link?.isActive ?? computed(() => to.value === router.currentRoute.value.path),
			isExactActive: link?.isExactActive ?? computed(() => to.value === router.currentRoute.value.path),
			route: link?.route ?? computed(() => router.resolve(to.value)),
			async navigate(_e) {
				if (href.value === null) return;
				await navigateTo(href.value, {
					replace: unref(props.replace),
					external: isExternal.value || hasTarget.value
				});
			}
		};
	}
	return defineComponent({
		name: componentName,
		props: {
			to: {
				type: [String, Object],
				default: void 0,
				required: false
			},
			href: {
				type: [String, Object],
				default: void 0,
				required: false
			},
			target: {
				type: String,
				default: void 0,
				required: false
			},
			rel: {
				type: String,
				default: void 0,
				required: false
			},
			noRel: {
				type: Boolean,
				default: void 0,
				required: false
			},
			prefetch: {
				type: Boolean,
				default: void 0,
				required: false
			},
			prefetchOn: {
				type: [String, Object],
				default: void 0,
				required: false
			},
			noPrefetch: {
				type: Boolean,
				default: void 0,
				required: false
			},
			activeClass: {
				type: String,
				default: void 0,
				required: false
			},
			exactActiveClass: {
				type: String,
				default: void 0,
				required: false
			},
			prefetchedClass: {
				type: String,
				default: void 0,
				required: false
			},
			replace: {
				type: Boolean,
				default: void 0,
				required: false
			},
			ariaCurrentValue: {
				type: String,
				default: void 0,
				required: false
			},
			external: {
				type: Boolean,
				default: void 0,
				required: false
			},
			custom: {
				type: Boolean,
				default: void 0,
				required: false
			},
			trailingSlash: {
				type: String,
				default: void 0,
				required: false
			}
		},
		useLink: useNuxtLink,
		setup(props, { slots }) {
			const router = useRouter();
			const { to, href, navigate, isExternal, hasTarget, isAbsoluteUrl } = useNuxtLink(props);
			const prefetched = shallowRef(false);
			const el = void 0;
			const elRef = void 0;
			function shouldPrefetch(mode) {
				return false;
			}
			async function prefetch(nuxtApp = useNuxtApp()) {}
			return () => {
				const target = props.target || null;
				const rel = firstNonUndefined(props.noRel ? "" : props.rel, options.externalRelAttribute, isAbsoluteUrl.value || hasTarget.value ? "noopener noreferrer" : "") || null;
				const getCustomSlotProps = (routerLinkSlotProps) => ({
					href: href.value,
					navigate,
					get route() {
						if (!href.value) return;
						const url = new URL(href.value, "http://localhost");
						return {
							path: url.pathname,
							fullPath: url.pathname,
							get query() {
								return parseQuery(url.search);
							},
							hash: url.hash,
							params: {},
							name: void 0,
							matched: [],
							redirectedFrom: void 0,
							meta: {},
							href: href.value
						};
					},
					rel,
					target,
					isExternal: isExternal.value || hasTarget.value,
					isActive: false,
					isExactActive: false,
					...routerLinkSlotProps,
					prefetch,
					prefetched: prefetched.value,
					shouldPrefetch
				});
				if (!isExternal.value && !hasTarget.value && !isHashLinkWithoutHashMode(to.value)) {
					const routerLinkProps = {
						ref: elRef,
						to: to.value,
						activeClass: props.activeClass || options.activeClass,
						exactActiveClass: props.exactActiveClass || options.exactActiveClass,
						replace: props.replace,
						ariaCurrentValue: props.ariaCurrentValue,
						custom: props.custom
					};
					if (!props.custom) routerLinkProps.rel = props.rel || void 0;
					return h(resolveComponent("RouterLink"), routerLinkProps, props.custom && slots.default ? { default: (slotProps) => slots.default(getCustomSlotProps(slotProps)) } : slots.default);
				}
				if (props.custom) {
					if (!slots.default) return null;
					return slots.default(getCustomSlotProps());
				}
				return h("a", {
					ref: el,
					href: href.value || null,
					rel,
					target,
					onClick: async (event) => {
						if (isExternal.value || hasTarget.value) return;
						event.preventDefault();
						try {
							const encodedHref = encodeRoutePath(href.value ?? "");
							return await (props.replace ? router.replace(encodedHref) : router.push(encodedHref));
						} finally {}
					}
				}, slots.default?.());
			};
		}
	});
}
var NuxtLink = /* @__PURE__ */ defineNuxtLink(nuxtLinkDefaults);
function applyTrailingSlashBehavior(to, trailingSlash) {
	if (trailingSlash !== "append" && trailingSlash !== "remove") return to;
	const normalizeFn = trailingSlash === "append" ? withTrailingSlash : withoutTrailingSlash;
	if (hasProtocol(to) && !to.startsWith("http")) return to;
	return normalizeFn(to, true);
}
//#endregion
//#region node_modules/@pinia/nuxt/dist/runtime/plugin.vue3.js
var plugin = defineNuxtPlugin({
	name: "pinia",
	setup(nuxtApp) {
		const pinia = createPinia();
		nuxtApp.vueApp.use(pinia);
		setActivePinia(pinia);
		if (nuxtApp.payload && nuxtApp.payload.pinia) pinia.state.value = nuxtApp.payload.pinia;
		return { provide: { pinia } };
	},
	hooks: { "app:rendered"() {
		const nuxtApp = useNuxtApp();
		nuxtApp.payload.pinia = toRaw(nuxtApp.$pinia).state.value;
		setActivePinia(void 0);
	} }
});
//#endregion
//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fcomponents.plugin.mjs
var lazyGlobalComponents = [["Icon", defineAsyncComponent(() => import('../build/components-DWHbB934.mjs').then((n) => n.n).then((r) => r["default"] || r.default || r))]];
//#endregion
//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fplugins.server.mjs
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Fplugins_server_default = [
	payloadPlugin,
	plugin$3,
	plugin$2,
	plugin$1,
	plugin,
	defineNuxtPlugin({
		name: "nuxt:global-components",
		setup(nuxtApp) {
			for (const [name, component] of lazyGlobalComponents) {
				nuxtApp.vueApp.component(name, component);
				nuxtApp.vueApp.component("Lazy" + name, component);
			}
		}
	}),
	defineNuxtPlugin({
		name: "@nuxt/icon",
		setup() {
			const configs = useRuntimeConfig();
			const options = useAppConfig().icon;
			const requestFetch = useRequestFetch();
			const nativeFetch = requestFetch.native;
			_api.setFetch((input, init) => {
				const nitroFetch = globalThis.$fetch?.native;
				return (nativeFetch || nitroFetch || globalThis.fetch)(input, init);
			});
			const resources = [];
			if (options.provider === "server") {
				const baseURL = configs.app?.baseURL?.replace(/\/$/, "") ?? "";
				resources.push(baseURL + (options.localApiEndpoint || "/api/_nuxt_icon"));
				if (options.fallbackToApi === true || options.fallbackToApi === "client-only") resources.push(options.iconifyApiEndpoint);
			} else if (options.provider === "none") _api.setFetch(() => Promise.resolve(new Response()));
			else resources.push(options.iconifyApiEndpoint);
			async function customIconLoader(icons, prefix) {
				try {
					const data = await requestFetch(resources[0] + "/" + prefix + ".json", { query: { icons: icons.join(",") } });
					if (!data || data.prefix !== prefix || !data.icons) throw new Error("Invalid data" + JSON.stringify(data));
					return data;
				} catch (e) {
					console.error("Failed to load custom icons", e);
					return null;
				}
			}
			addAPIProvider("", { resources });
			for (const prefix of options.customCollections || []) if (prefix) setCustomIconsLoader(customIconLoader, prefix);
		}
	})
];
//#endregion
//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Flayouts.mjs
var virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Flayouts_default = {
	auth: defineAsyncComponent(() => import('../build/auth-q2O2NqaX.mjs').then((m) => m.default || m)),
	default: defineAsyncComponent(() => import('../build/default-qTlMXo44.mjs').then((m) => m.default || m))
};
//#endregion
//#region node_modules/nuxt/dist/app/components/nuxt-layout.js
var LayoutLoader = defineComponent({
	name: "LayoutLoader",
	inheritAttrs: false,
	props: {
		name: String,
		layoutProps: Object
	},
	setup(props, context) {
		return () => h(virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Flayouts_default[props.name], props.layoutProps, context.slots);
	}
});
var nuxt_layout_default = defineComponent({
	name: "NuxtLayout",
	inheritAttrs: false,
	props: {
		name: {
			type: [
				String,
				Boolean,
				Object
			],
			default: null
		},
		fallback: {
			type: [String, Object],
			default: null
		}
	},
	setup(props, context) {
		const nuxtApp = useNuxtApp();
		const injectedRoute = inject(PageRouteSymbol);
		const route = !injectedRoute || injectedRoute === useRoute() ? useRoute$1() : injectedRoute;
		const layout = computed(() => {
			let layout = resolveLayoutName(route, props.name);
			if (layout && !(layout in virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Flayouts_default)) {
				if (props.fallback) layout = unref(props.fallback);
			}
			return layout;
		});
		provide(LayoutSymbol, layout);
		const layoutRef = shallowRef();
		context.expose({ layoutRef });
		const done = nuxtApp.deferHydration();
		let lastLayout;
		return () => {
			const hasTransition = !!layout.value && layout.value in virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Flayouts_default && !!(route?.meta.layoutTransition ?? false);
			const transitionProps = hasTransition && _mergeTransitionProps([
				route?.meta.layoutTransition,
				false,
				{
					onBeforeLeave() {
						nuxtApp["~transitionPromise"] = new Promise((resolve) => {
							nuxtApp["~transitionFinish"] = resolve;
						});
					},
					onAfterLeave() {
						nuxtApp["~transitionFinish"]?.();
						delete nuxtApp["~transitionFinish"];
						delete nuxtApp["~transitionPromise"];
					}
				}
			]);
			const previouslyRenderedLayout = lastLayout;
			lastLayout = layout.value;
			return _wrapInTransition(transitionProps, { default: () => h(Suspense, {
				suspensible: true,
				onResolve: async () => {
					await nextTick(done);
				}
			}, { default: () => h(LayoutProvider, {
				layoutProps: mergeProps(context.attrs, route.meta.layoutProps ?? {}, { ref: layoutRef }),
				key: layout.value || void 0,
				name: layout.value,
				shouldProvide: !props.name,
				isRenderingNewLayout: (name) => {
					return name !== previouslyRenderedLayout && name === layout.value;
				},
				hasTransition
			}, context.slots) }) }).default();
		};
	}
});
var LayoutProvider = defineComponent({
	name: "NuxtLayoutProvider",
	inheritAttrs: false,
	props: {
		name: { type: [String, Boolean] },
		layoutProps: { type: Object },
		hasTransition: { type: Boolean },
		shouldProvide: { type: Boolean },
		isRenderingNewLayout: {
			type: Function,
			required: true
		}
	},
	setup(props, context) {
		const name = props.name;
		if (props.shouldProvide) provide(LayoutMetaSymbol, { isCurrent: (route) => name === false || name === resolveLayoutName(route) });
		const injectedRoute = inject(PageRouteSymbol);
		const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
		const enclosingLayout = inject(LayoutMetaSymbol, null);
		if (isNotWithinNuxtPage) {
			const vueRouterRoute = useRoute$1();
			const reactiveChildRoute = {};
			for (const _key in vueRouterRoute) {
				const key = _key;
				Object.defineProperty(reactiveChildRoute, key, {
					enumerable: true,
					get: () => {
						return props.isRenderingNewLayout(props.name) && (!enclosingLayout || enclosingLayout.isCurrent(vueRouterRoute)) ? vueRouterRoute[key] : injectedRoute[key];
					}
				});
			}
			provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
		}
		return () => {
			if (!name || typeof name === "string" && !(name in virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Flayouts_default)) return context.slots.default?.();
			return h(LayoutLoader, {
				key: name,
				layoutProps: props.layoutProps,
				name
			}, context.slots);
		};
	}
});
//#endregion
//#region node_modules/nuxt/dist/app/components/route-provider.js
var defineRouteProvider = (name = "RouteProvider") => defineComponent({
	name,
	props: {
		route: {
			type: Object,
			required: true
		},
		vnode: Object,
		vnodeRef: Object,
		renderKey: String,
		trackRootNodes: Boolean,
		routeRecord: Object
	},
	setup(props) {
		const previousKey = props.renderKey;
		const previousRoute = props.route;
		const route = {};
		for (const key in props.route) Object.defineProperty(route, key, {
			get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
			enumerable: true
		});
		provide(PageRouteSymbol, shallowReactive(route));
		return () => {
			if (!props.vnode) return props.vnode;
			return h(props.vnode, { ref: props.vnodeRef });
		};
	}
});
var RouteProvider = defineRouteProvider();
//#endregion
//#region node_modules/nuxt/dist/pages/runtime/page.js
var page_default = defineComponent({
	name: "NuxtPage",
	inheritAttrs: false,
	props: {
		name: { type: String },
		transition: {
			type: [Boolean, Object],
			default: void 0
		},
		keepalive: {
			type: [Boolean, Object],
			default: void 0
		},
		route: { type: Object },
		pageKey: {
			type: [Function, String],
			default: null
		}
	},
	setup(props, { attrs, slots, expose }) {
		const nuxtApp = useNuxtApp();
		const pageRef = ref();
		inject(PageRouteSymbol, null);
		expose({ pageRef });
		inject(LayoutMetaSymbol, null);
		nuxtApp.deferHydration();
		return () => {
			return h(RouterView, {
				name: props.name,
				route: props.route,
				...attrs
			}, { default: markStableSlot((routeProps) => {
				return h(Suspense, { suspensible: true }, { default() {
					return h(RouteProvider, {
						vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
						route: routeProps.route,
						vnodeRef: pageRef
					});
				} });
			}) });
		};
	}
});
function markStableSlot(fn) {
	const wrapped = ((routeProps) => {
		const result = fn(routeProps);
		if (Array.isArray(result)) return result;
		if (result == null || !isVNode(result)) return [createCommentVNode()];
		return [result];
	});
	wrapped._n = true;
	return wrapped;
}
function normalizeSlot(slot, data) {
	const slotContent = slot(data);
	return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
//#endregion
//#region app/composables/useI18n.ts
var translations = { en: {
	"app.name": "AXIS",
	"app.tagline": "Code 4 Axis",
	"auth.sign_in": "Sign in",
	"auth.sign_in_subtitle": "Sign in to your account to continue",
	"auth.email": "Email address",
	"auth.email_placeholder": "you@example.com",
	"auth.password": "Password",
	"auth.password_placeholder": "Enter your password",
	"auth.show_password": "Show password",
	"auth.hide_password": "Hide password",
	"auth.forgot_password": "Forgot password?",
	"auth.signing_in": "Signing in…",
	"auth.error_invalid": "Invalid email or password.",
	"auth.error_required_email": "Email is required.",
	"auth.error_required_password": "Password is required.",
	"auth.error_invalid_email": "Please enter a valid email address.",
	"auth.otp_verification": "Verification Code",
	"auth.otp_subtitle": "We sent a 6-digit code to your email",
	"auth.otp_placeholder": "Enter 6-digit code",
	"auth.otp_resend": "Resend code",
	"auth.otp_resending": "Sending…",
	"auth.otp_resend_wait": "Resend code in {seconds}s",
	"auth.otp_verify": "Verify",
	"auth.otp_verifying": "Verifying…",
	"auth.otp_back_to_login": "Back to login",
	"auth.login_error": "Login failed. Please try again.",
	"auth.send_otp_error": "Failed to send verification code.",
	"auth.verify_otp_error": "Invalid or expired code.",
	"auth.resend_otp_error": "Failed to resend code.",
	"auth.change_password_title": "Change Password",
	"auth.change_password_subtitle": "Update your password to keep your account secure",
	"auth.change_password_form_title": "Change Your Password",
	"auth.change_password_form_desc": "Enter your current password and choose a new one",
	"auth.current_password": "Current Password",
	"auth.current_password_placeholder": "Enter your current password",
	"auth.new_password": "New Password",
	"auth.new_password_placeholder": "Enter your new password",
	"auth.confirm_password": "Confirm New Password",
	"auth.confirm_password_placeholder": "Re-enter your new password",
	"auth.password_required": "Password is required",
	"auth.password_min_length": "Password must be at least 8 characters",
	"auth.password_uppercase": "Password must contain an uppercase letter",
	"auth.password_lowercase": "Password must contain a lowercase letter",
	"auth.password_digit": "Password must contain a number",
	"auth.password_special": "Password must contain a special character",
	"auth.password_mismatch": "Passwords do not match",
	"auth.password_same_as_current": "Your new password must be different from your current password",
	"auth.password_requirements": "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
	"auth.change_password_button": "Change Password",
	"auth.changing_password": "Changing password…",
	"auth.change_password_error": "Failed to change password. Please try again.",
	"auth.change_password_success": "Password changed successfully.",
	"auth.error_wrong_current_password": "The current password you entered is incorrect.",
	"nav.operate": "Operate",
	"nav.manage": "Manage",
	"nav.admin": "Admin",
	"nav.dashboard": "Dashboard",
	"nav.live_tracking": "Live Tracking",
	"nav.calls_incidents": "Calls & Incidents",
	"nav.tasks": "Tasks",
	"nav.communities": "Communities",
	"nav.officers": "Officers",
	"nav.shifts_routes": "Shifts & Routes",
	"nav.post_orders": "Post Orders",
	"nav.poi_trespass": "POI & Trespass",
	"nav.report_templates": "Report Templates",
	"nav.users": "Users",
	"nav.settings": "Settings",
	"nav.test_panic_call": "Test Panic Call",
	"live_tracking.live": "Live",
	"live_tracking.status_active": "On patrol route",
	"live_tracking.status_responding": "Responding to emergency call",
	"live_tracking.status_gps_lost": "GPS signal lost",
	"live_tracking.status_offduty": "Checked out / not yet checked in",
	"live_tracking.status_skipped": "Waypoint skipped",
	"live_tracking.officer_info": "Officer Info",
	"live_tracking.community_site": "Community / Site",
	"live_tracking.shift_time": "Shift Time",
	"live_tracking.current_post": "Current Post",
	"live_tracking.active_call": "Active Call",
	"live_tracking.next_waypoint": "Next Waypoint",
	"live_tracking.last_gps_update": "Last GPS Update",
	"live_tracking.view_profile": "View Profile",
	"live_tracking.filters": "Filters",
	"live_tracking.community": "Community",
	"live_tracking.all_communities": "All Communities",
	"live_tracking.officers": "Officers",
	"live_tracking.layers": "Layers",
	"live_tracking.layer_officers": "Officers",
	"live_tracking.layer_routes": "Patrol Routes",
	"live_tracking.layer_emergency_calls": "Emergency Calls",
	"live_tracking.layer_posts": "Posts",
	"live_tracking.on_duty_only": "On Duty Only",
	"live_tracking.refresh_now": "Refresh Now",
	"live_tracking.refresh_interval": "Auto-refresh every {seconds}s",
	"live_tracking.refreshed_ago": "Refreshed {seconds}s ago",
	"post_orders.list_title": "Post Orders",
	"post_orders.list_subtitle": "{count} post orders in your jurisdiction",
	"post_orders.search_placeholder": "Search by ID, post name, or community…",
	"post_orders.create_new": "New Post Order",
	"post_orders.filter_all_communities": "All Communities",
	"post_orders.filter_communities_selected": "{count} communities",
	"post_orders.filter_all_statuses": "All Statuses",
	"post_orders.filter_any_due": "Any Review Due",
	"post_orders.filter_overdue": "Overdue",
	"post_orders.filter_this_week": "Due This Week",
	"post_orders.filter_this_month": "Due This Month",
	"post_orders.col_id": "Post Order ID",
	"post_orders.col_community": "Community / Site",
	"post_orders.col_post_name": "Post Name",
	"post_orders.col_status": "Status",
	"post_orders.col_version": "Version",
	"post_orders.col_last_published": "Last Published",
	"post_orders.col_published_by": "Published By",
	"post_orders.col_review_due": "Review Due",
	"post_orders.col_acknowledged": "Acknowledged",
	"post_orders.col_actions": "Actions",
	"post_orders.status_draft": "Draft",
	"post_orders.status_published": "Published",
	"post_orders.status_archived": "Archived",
	"post_orders.no_results": "No post orders match the current filters.",
	"post_orders.showing": "Showing {count} of {total} post orders",
	"post_orders.delete_title": "Delete Post Order",
	"post_orders.delete_message": "Are you sure you want to permanently delete \"{name}\"? This action cannot be undone.",
	"post_orders.create_page_title": "Create Post Order",
	"post_orders.edit_page_title": "Edit Post Order",
	"post_orders.save_draft": "Save as Draft",
	"post_orders.publish": "Publish",
	"post_orders.publish_update": "Publish Update",
	"post_orders.publish_modal_title": "Publish Post Order",
	"post_orders.publish_version_type": "Version Type",
	"post_orders.publish_version_minor": "Minor Update",
	"post_orders.publish_version_minor_desc": "Small corrections or additions (e.g. 1.0 → 1.1)",
	"post_orders.publish_version_major": "Major Update",
	"post_orders.publish_version_major_desc": "Significant changes to duties or procedures (e.g. 1.1 → 2.0)",
	"post_orders.publish_change_summary": "Change Summary",
	"post_orders.publish_change_summary_placeholder": "Brief description of what changed (included in push notification)…",
	"post_orders.publish_effective_date": "Effective Date",
	"post_orders.publish_notify_officers": "Notify Officers",
	"post_orders.publish_notify_officers_hint": "Send push notification to all allocated officers",
	"post_orders.publish_confirm": "Confirm & Publish",
	"post_orders.history_title": "Version History",
	"post_orders.history_versions": "versions",
	"post_orders.history_empty": "No published versions yet.",
	"post_orders.history_col_version": "Version",
	"post_orders.history_col_type": "Type",
	"post_orders.history_col_published_by": "Published By",
	"post_orders.history_col_published_at": "Published At",
	"post_orders.history_col_effective_date": "Effective Date",
	"post_orders.history_col_summary": "Change Summary",
	"post_orders.add_section": "Add Section",
	"post_orders.section_label": "Section {n}",
	"post_orders.move_up": "Move Up",
	"post_orders.move_down": "Move Down",
	"post_orders.remove_section": "Remove Section",
	"post_orders.form_header_title": "Post Order Header",
	"post_orders.form_header_hint": "Auto-populated fields are read-only after creation",
	"post_orders.field_post_name": "Post Name",
	"post_orders.field_post_placeholder": "Select a post…",
	"post_orders.field_order_id": "Post Order ID",
	"post_orders.field_community": "Community",
	"post_orders.field_site": "Site",
	"post_orders.field_status": "Status",
	"post_orders.field_version": "Current Version",
	"post_orders.field_author": "Author",
	"post_orders.field_author_current_user": "Current User",
	"post_orders.field_creation_date": "Creation Date",
	"post_orders.field_effective_date": "Effective Date",
	"post_orders.field_effective_date_hint": "Defaults to publish date",
	"post_orders.field_review_due": "Review Due Date",
	"post_orders.field_section_type": "Section Type",
	"post_orders.field_section_title": "Section Title",
	"post_orders.field_section_title_placeholder": "Enter section title…",
	"post_orders.field_client_visible": "Client-Visible",
	"post_orders.field_description": "Description",
	"post_orders.field_description_placeholder": "Enter section content…",
	"post_orders.field_attachments": "Attachments",
	"post_orders.field_attachments_add": "Add File",
	"post_orders.field_attachments_hint": "PDF, JPEG, PNG, or video up to 1 min. Max 5 files, 20 MB each.",
	"post_orders.field_notes": "Internal Notes",
	"post_orders.field_notes_placeholder": "Visible to managers and admins only…",
	"common.view": "View",
	"common.close": "Close",
	"common.loading": "Loading…",
	"common.save": "Save",
	"common.saving": "Saving…",
	"common.save_changes": "Save Changes",
	"common.reset": "Reset",
	"common.cancel": "Cancel",
	"common.continue": "Continue",
	"common.confirm": "Confirm",
	"common.delete": "Delete",
	"common.deleting": "Deleting…",
	"common.deactivate": "Deactivate",
	"common.deactivating": "Deactivating…",
	"common.edit": "Edit",
	"common.add": "Add",
	"common.upload": "Upload",
	"common.search": "Search",
	"common.filter": "Filter",
	"common.view_all": "View all",
	"common.ok": "OK",
	"common.all": "All",
	"common.active": "Active",
	"common.inactive": "Inactive",
	"common.status": "Status",
	"common.actions": "Actions",
	"common.yes": "Yes",
	"common.no": "No",
	"common.logout": "Logout",
	"communities.management_title": "Communities Management",
	"communities.add_community": "Add Community",
	"communities.add_title": "Add New Community",
	"communities.add_subtitle": "Create a new community with details and assignments.",
	"communities.basic_info": "Basic Information",
	"communities.name": "Community Name",
	"communities.name_placeholder": "Enter community name",
	"communities.area": "Area / Address",
	"communities.area_placeholder": "Enter address or neighborhood boundaries",
	"communities.area_hint": "Use Google Places API or polygon service to define boundaries",
	"communities.assignments": "Assignments",
	"communities.officers": "Officers",
	"communities.select_officers": "Select Officers",
	"communities.officers_hint": "Choose officers to assign to this community",
	"communities.residents": "Residents / Clients",
	"communities.add_residents": "Add Residents",
	"communities.residents_hint": "Add residents to this community",
	"communities.map_section": "Community Map",
	"communities.enable_map": "Enable 2D Map",
	"communities.map_dropzone": "Upload community map",
	"communities.map_formats": "Supported: PNG, JPG, SVG",
	"communities.browse_files": "Browse Files",
	"communities.map_tools": "Map Tools:",
	"communities.draw_boundary": "Draw Boundary",
	"communities.add_doors": "Add Doors",
	"communities.add_windows": "Add Windows",
	"communities.posts_section": "Posts",
	"communities.posts": "Community Posts",
	"communities.post_placeholder": "e.g., Main Gate, North Entrance",
	"communities.posts_hint": "Add posts in this community (for example: main gate...)",
	"communities.edit_title": "Edit Community",
	"communities.registration_date": "Registration Date",
	"communities.calls": "Calls",
	"communities.view_calls": "View {count} calls",
	"communities.add_officers": "Add Officers",
	"communities.no_officers": "No officers assigned",
	"communities.no_residents": "No residents added",
	"communities.map_entry_title": "2D Map Management",
	"communities.map_entry_hint": "Upload map, add assets, posts, entry/exit points and high-priority zones.",
	"communities.open_map": "Open Map",
	"communities.delete_title": "Delete Community",
	"communities.delete_message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
	"communities.cannot_delete_title": "Cannot Delete Community",
	"communities.constraint_officers": "This community has active officers assigned to it.",
	"communities.constraint_residents": "This community has active residents assigned to it.",
	"communities.constraint_calls": "This community has open calls that have not been resolved.",
	"communities.deactivate_suggestion": "You can deactivate the community instead, which will prevent new activity while preserving existing data.",
	"communities.deactivate_action": "Deactivate Community",
	"communities.delete_success": "Community deleted successfully",
	"communities.deactivate_success": "Community deactivated successfully",
	"communities.not_found_error": "Community not found. It may have already been deleted.",
	"residents.management_title": "Residents / Customers",
	"residents.total": "{count} residents",
	"residents.add_resident": "Add Resident",
	"residents.search_placeholder": "Search by name, phone, email, address...",
	"residents.filter_all": "All Status",
	"residents.filter_active": "Active",
	"residents.filter_inactive": "Inactive",
	"residents.all_communities": "All Communities",
	"residents.active_filter": "Resident status filter",
	"residents.active_only": "Active Only",
	"residents.all_statuses": "All",
	"residents.full_name": "Full Name",
	"residents.full_name_placeholder": "Enter full name",
	"residents.first_name": "First Name",
	"residents.first_name_placeholder": "Enter first name",
	"residents.last_name": "Last Name",
	"residents.last_name_placeholder": "Enter last name",
	"residents.mobile": "Mobile Number",
	"residents.mobile_placeholder": "Enter mobile number",
	"residents.email": "Email",
	"residents.email_placeholder": "Enter email address",
	"residents.address": "Address",
	"residents.address_placeholder": "Enter address",
	"residents.registration_date": "Registration Date",
	"residents.active": "Active",
	"residents.communication_test": "Comm. Test",
	"residents.vehicle_numbers": "Vehicle Numbers",
	"residents.vehicle_placeholder": "e.g., ABC-1234",
	"residents.actions": "Actions",
	"residents.add_title": "Add New Resident",
	"residents.edit_title": "Edit Resident",
	"residents.delete_title": "Delete Resident",
	"residents.delete_message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
	"residents.enable_communication_test": "Enable communication test",
	"residents.basic_info": "Basic Information",
	"residents.settings": "Settings",
	"residents.mobile_hint": "Used by the resident to enter the app",
	"residents.communication_test_hint": "Allows resident to send emergency test calls",
	"residents.community": "Community",
	"residents.status": "Status",
	"residents.vehicle_hint": "Press Enter or click Add to add multiple vehicles",
	"residents.mobile_change_warning": "If mobile number is changed, the resident must be identified again before login",
	"residents.vehicle_readonly_hint": "Vehicle numbers cannot be edited from this screen",
	"residents.no_vehicles": "No vehicles registered",
	"residents.no_residents": "No residents found",
	"residents.load_failed": "Failed to load residents. Please try again.",
	"residents.select_community": "Select a community",
	"residents.instructions": "Instructions",
	"residents.instructions_placeholder": "Enter special instructions for officers",
	"residents.invalid_mobile": "Please enter a valid mobile number",
	"residents.invalid_email": "Please enter a valid email address",
	"residents.mobile_exists": "This phone number is already registered in the system",
	"residents.email_exists": "This email is already in use by another user",
	"residents.community_not_found": "Selected community was not found. Please refresh and try again.",
	"residents.community_inactive": "Selected community is not active. Please choose an active community.",
	"residents.community_already_assigned": "Resident is already in this community.",
	"residents.load_communities_failed": "Failed to load communities. Please try again.",
	"residents.create_failed": "Failed to create resident. Please try again.",
	"residents.create_success": "Resident created successfully",
	"residents.update_success": "Resident updated successfully",
	"residents.update_failed": "Failed to update resident. Please try again.",
	"residents.delete_success": "Resident deleted successfully",
	"residents.delete_failed": "Failed to delete resident. Please try again.",
	"residents.not_found": "Resident not found. They may have been deleted. Please refresh the page.",
	"residents.cannot_delete_title": "Cannot Delete Resident",
	"residents.cannot_delete_message": "This resident has already logged into the mobile app and cannot be deleted. Deactivate them instead to remove their access while preserving historical data.",
	"residents.deactivate": "Deactivate Resident",
	"residents.deactivate_success": "Resident deactivated successfully",
	"residents.phone_change_warning": "Changing the mobile number logs this resident out. They must sign in again using OTP.",
	"residents.deactivate_warning": "Deactivating this resident logs them out and prevents future logins until reactivated.",
	"residents.last_login": "Last Login",
	"residents.never": "Never",
	"residents.property_images": "Property Images",
	"residents.no_property_images": "No property images uploaded.",
	"residents.image_upload_failed": "Failed to upload image. Please try again.",
	"residents.image_not_found": "One or more uploaded images could not be found. Please re-upload.",
	"map.title": "2D Map Management",
	"map.map_view": "Map View",
	"map.list_view": "List View",
	"map.add_new": "Add New",
	"map.add_multiple": "Add Multiple",
	"map.add_asset": "Add Asset",
	"map.add_post": "Add Post",
	"map.shape": "Shape",
	"map.shape_dot": "Place (dot)",
	"map.shape_circle": "Circle",
	"map.shape_line": "Line",
	"map.undo": "Undo",
	"map.batch_mode": "Batch Mode",
	"map.no_map_title": "No Map Uploaded",
	"map.no_map_subtitle": "Click \"Create a map\" to upload the area map for this community.",
	"map.create_map": "Create a map",
	"map.hint_single": "Click on the map to place a marker",
	"map.hint_batch": "Click to mark multiple locations, then complete",
	"map.legend": "Legend",
	"map.assets": "Assets",
	"map.posts": "Posts",
	"map.total_items": "{count} total items",
	"map.search_assets": "Search assets...",
	"map.search_posts": "Search posts...",
	"map.all": "All",
	"map.add_asset_title": "Add Asset",
	"map.add_post_title": "Add Post",
	"map.asset_id": "Asset ID",
	"map.asset_type": "Asset Type",
	"map.select_type": "Select asset type",
	"map.installation_date": "Installation Date",
	"map.replacement_date": "Replacement Date",
	"map.description": "Description",
	"map.asset_description_placeholder": "e.g., manufacturer, model, serial number...",
	"map.location": "Location",
	"map.location_auto": "Auto-set from map click",
	"map.post_id": "Post ID",
	"map.post_name": "Post Name",
	"map.post_name_placeholder": "e.g., Main Gate, North Entrance",
	"map.post_name_max": "Post name must be 60 characters or less",
	"map.post_description_placeholder": "Optional description (max 200 chars)",
	"map.priority": "Priority",
	"map.equipment": "Equipment",
	"map.equipment_placeholder": "e.g., Radio, Flashlight",
	"map.active": "Active",
	"map.chars": "chars",
	"map.no_assets": "No assets found",
	"map.no_posts": "No posts found",
	"map.delete_item_title": "Delete Item",
	"map.delete_item_message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
	"map.select_item_type": "What would you like to add?",
	"map.asset": "Asset",
	"map.asset_hint": "Doors, windows, cameras, sensors and other physical items",
	"map.post": "Post",
	"map.post_hint": "Officer posts and patrol locations on site",
	"map.entry_exit": "Entry / Exit",
	"map.entry_exit_hint": "Mark entry and exit points of the community area",
	"map.entry_exit_name": "Point Name",
	"map.entry_exit_placeholder": "e.g., Main Entrance, North Gate",
	"map.add_entry_exit_title": "Add Entry / Exit Point",
	"map.zone": "High Priority Zone",
	"map.zone_hint": "Mark areas that require special attention or high priority",
	"map.zone_name": "Zone Name",
	"map.zone_placeholder": "e.g., VIP Area, Server Room",
	"map.add_zone_title": "Add High Priority Zone",
	"map.edit_asset_title": "Edit Asset",
	"map.edit_post_title": "Edit Post",
	"featured_officer.title": "Featured Officer",
	"featured_officer.description": "Manage the banner displayed in the community resident app, under the Officer Information screen.",
	"featured_officer.image": "Banner Image",
	"featured_officer.image_hint": "Recommended size: 600×300px. Max 5MB. JPG, PNG, WEBP.",
	"featured_officer.upload_hint": "Click to upload an image",
	"featured_officer.upload_formats": "JPG, PNG, WEBP — max 5MB",
	"featured_officer.choose_image": "Choose Image",
	"featured_officer.change_image": "Change Image",
	"featured_officer.description_label": "Description",
	"featured_officer.description_placeholder": "Enter a description to display under the banner image...",
	"featured_officer.description_hint": "Plain text only — no special formatting.",
	"featured_officer.community": "Community",
	"featured_officer.banner_status": "Banner Status",
	"featured_officer.default_note": "If the banner is deleted or empty, the app will display the default banner design.",
	"featured_officer.delete_title": "Delete Featured Officer Banner",
	"featured_officer.delete_message": "Are you sure you want to delete the current banner? The app will show the default banner instead.",
	"featured_officer.error_image_type": "Please upload a valid image file (JPG, PNG, WEBP).",
	"featured_officer.error_image_size": "Image size must be less than 5MB.",
	"officers.page_title": "Officers",
	"officers.total": "{count} officers",
	"officers.add_officer": "Add Officer",
	"officers.add_title": "Add New Officer",
	"officers.edit_title": "Edit Officer",
	"officers.delete_title": "Delete Officer",
	"officers.delete_message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
	"officers.delete_failed": "Failed to delete officer. Please try again.",
	"officers.delete_failed_logged_in": "This officer cannot be deleted because they have already logged in.",
	"officers.no_officers": "No officers found",
	"officers.all_communities": "All Communities",
	"officers.all": "All",
	"officers.search_placeholder": "Search name, mobile, email, title…",
	"officers.full_name": "Full Name",
	"officers.full_name_placeholder": "e.g., James Carter",
	"officers.first_name": "First Name",
	"officers.first_name_placeholder": "e.g., James",
	"officers.last_name": "Last Name",
	"officers.last_name_placeholder": "e.g., Carter",
	"officers.loading_communities": "Loading communities...",
	"officers.create_success": "Officer created successfully.",
	"officers.deactivate_warning": "Deactivating this officer will immediately log them out of the mobile app. They will not be able to log in until reactivated.",
	"officers.phone_change_warning": "Changing the mobile number will immediately log this officer out of their mobile app. They must re-authenticate using the new number via OTP.",
	"officers.phone_confirm_title": "Change Mobile Number?",
	"officers.phone_confirm_message": "You are about to change this officer's login phone number. They will be immediately logged out and must re-authenticate with the new number. Continue?",
	"officers.create_failed": "Failed to create officer. Please try again.",
	"officers.update_failed": "Failed to update officer. Please try again.",
	"officers.delete_success": "Officer deleted successfully.",
	"officers.deactivate_success": "Officer deactivated successfully.",
	"officers.delete_cannot_undo": "This action cannot be undone.",
	"officers.cannot_delete_title": "⚠️ Cannot Delete Officer",
	"officers.cannot_delete_message": "This officer has already logged into the mobile app and cannot be deleted from the system. To remove their access, please set their status to Inactive instead. This will immediately log them out and prevent future logins while preserving their historical data.",
	"officers.deactivate_officer": "Deactivate Officer",
	"officers.load_failed": "Failed to load officers. Please try again.",
	"officers.officer_not_found": "Officer not found.",
	"officers.community_invalid": "Selected community is invalid or inactive.",
	"officers.officer_already_in_community": "This phone number is already registered in this community.",
	"officers.community": "Community",
	"officers.select_community": "Select community",
	"officers.photo": "Photo",
	"officers.add_photo": "Add Photo",
	"calls.page_title": "Calls",
	"calls.tabs.open": "Open Calls",
	"calls.tabs.history": "History",
	"calls.tabs.reports": "Incident Reports",
	"calls.open_calls_title": "Open Calls",
	"calls.open_calls_placeholder": "Open calls list will be displayed here",
	"calls.history_title": "Call History",
	"calls.history_placeholder": "Call history will be displayed here",
	"calls.category": "Category",
	"calls.service_type": "Service Type",
	"calls.resident": "Resident",
	"calls.community": "Community",
	"calls.address": "Address",
	"calls.scheduled_datetime": "Scheduled Date & Time",
	"calls.officer": "Officer",
	"calls.status": "Status",
	"calls.status.new": "New",
	"calls.status.accepted": "Accepted",
	"calls.status.done": "Done",
	"calls.status.canceled": "Canceled",
	"calls.closed_datetime": "Closed Date & Time",
	"calls.confirmation_short": "Confirmation",
	"calls.officer_comments_short": "Comments",
	"calls.resident_feedback_short": "Feedback",
	"calls.call_details_title": "Call Details",
	"calls.call_info": "Call Information",
	"calls.call_datetime": "Call Date & Time",
	"calls.current_address": "Current Address",
	"calls.media": "Media",
	"calls.audio_recording": "Audio Recording",
	"calls.video": "Video",
	"calls.description": "Description",
	"calls.confirmation_images": "Confirmation Images",
	"calls.officer_comments": "Officer's Comments",
	"calls.resident_feedback": "Resident Feedback",
	"calls.like_given": "Like given",
	"calls.assign": "Assign",
	"calls.assign_title": "Assign Call to Officer",
	"calls.assign_button": "Assign",
	"calls.assign_form_title": "Assignment Details",
	"calls.select_officer": "Select an officer",
	"calls.selected": "Selected",
	"calls.schedule_date": "Schedule Date",
	"calls.schedule_time": "Schedule Time",
	"calls.assign_note": "After assignment, the officer will receive a notification",
	"calls.admin_only": "Admin Only",
	"calls.documents": "Documents",
	"calls.no_documents": "No documents uploaded",
	"calls.transcription": "Document Transcription",
	"calls.no_transcription": "No transcription available",
	"calls.filters.search": "Search",
	"calls.filters.search_placeholder": "Search across all columns...",
	"calls.filters.clear": "Clear",
	"calls.filters.all": "All",
	"calls.filters.community": "Community",
	"calls.filters.service_type": "Service Type",
	"calls.filters.status": "Status",
	"calls.filters.resident": "Resident",
	"calls.filters.resident_placeholder": "Resident name",
	"calls.filters.officer": "Officer",
	"calls.filters.officer_placeholder": "Officer name",
	"calls.filters.scheduled_range": "Scheduled Time Range",
	"calls.filters.open_range": "Open Time Range",
	"calls.panic_call_title": "Panic Call Alert",
	"calls.panic_alert_title": "PANIC CALL IN PROGRESS",
	"calls.panic_subtitle": "Emergency assistance required immediately",
	"calls.call_type": "Call Type",
	"calls.user_name": "User Name",
	"calls.location_info": "Location Information",
	"calls.location_when_pressed": "Location when pressed",
	"calls.live_location": "Live location",
	"calls.communication": "Communication",
	"calls.panic_initiated": "Panic call initiated",
	"calls.user_location_shared": "User shared live location",
	"calls.assign_to_officer": "Assign to Officer",
	"calls.correspond_user": "Correspond with User",
	"calls.view_live_location": "View Live Location",
	"calls.close_call": "Close Call",
	"calls.panic_note": "This is a high-priority emergency call. Immediate response is critical.",
	"tpl.editor_title_create": "Create New Template",
	"tpl.editor_title_edit": "Edit Template",
	"tpl.editor_subtitle": "Configure the template header settings, then define the sections and fields.",
	"tpl.save_draft": "Save as Draft",
	"tpl.save_changes": "Save Changes",
	"tpl.publish": "Publish Template",
	"tpl.pane_settings": "Template Settings",
	"tpl.pane_header": "Header Settings",
	"tpl.pane_sections": "Sections & Fields",
	"tpl.coming_soon": "Next",
	"tpl.sections_coming_soon": "Section & field configuration coming in the next step.",
	"tpl.field_name": "Template Name",
	"tpl.field_name_placeholder": "e.g. Standard Incident Report",
	"tpl.field_category": "Report Category",
	"tpl.field_status": "Status",
	"tpl.status_draft": "Draft",
	"tpl.status_active": "Active",
	"tpl.field_communities": "Community / Site",
	"tpl.communities_placeholder": "Select communities...",
	"tpl.community_global": "Global (all communities)",
	"tpl.field_title_format": "Report Title Format",
	"tpl.field_title_format_placeholder": "e.g. Incident Report - {community} - {date}",
	"tpl.insert_placeholder": "Insert token:",
	"tpl.field_review_before_client": "Review Before Client",
	"tpl.field_review_before_client_desc": "If on, completed reports are routed to manager review before being sent to the client.",
	"tpl.field_allow_officer_editing": "Allow Officer Editing After Submit",
	"tpl.field_allow_officer_editing_desc": "If on, officers can edit a submitted report before a manager picks it up for review.",
	"tpl.add_section": "Add Section",
	"tpl.sections_empty": "No sections yet. Add one to define the report structure.",
	"tpl.section_title_placeholder": "Section title (e.g. Incident Details)",
	"tpl.section_enabled": "Enabled",
	"tpl.section_required": "Required",
	"tpl.section_client_visible": "Client Visible",
	"tpl.section_expand": "Expand / Collapse",
	"tpl.section_delete": "Delete Section",
	"tpl.move_up": "Move Up",
	"tpl.move_down": "Move Down",
	"tpl.add_incident_field": "+ Incident Field",
	"tpl.add_custom_field": "+ Custom Field",
	"tpl.picker_title": "Incident Fields",
	"tpl.field_remove": "Remove field",
	"tpl.custom_field_title": "Add Custom Field",
	"tpl.custom_field_label": "Field Label",
	"tpl.custom_field_label_placeholder": "e.g. Reference Number",
	"tpl.custom_field_description": "Description (hint for officers)",
	"tpl.custom_field_description_placeholder": "e.g. Enter the internal reference number...",
	"tpl.custom_field_type": "Field Type",
	"tpl.custom_field_max_chars": "Max Characters",
	"tpl.custom_field_dropdown_values": "Dropdown Options (one per line)",
	"tpl.custom_field_dropdown_values_placeholder": "Option A\nOption B\nOption C",
	"tpl.custom_field_multi_select": "Allow multiple selections",
	"tpl.custom_field_max_files": "Max Number of Files",
	"tpl.custom_field_add": "Add Field",
	"tpl.drag_handle": "Drag to reorder",
	"tpl.archive": "Archive Template",
	"tpl.restore": "Restore to Active",
	"tpl.archive_confirm_title": "Archive Template",
	"tpl.archive_confirm_body": "This template will no longer be available for new reports. Officers will not see it when creating a new report.",
	"tpl.archive_confirm_note": "Reports already created using this template retain their structure and display correctly — archiving does not alter historical records.",
	"tpl.archive_confirm_action": "Confirm Archive",
	"tpl.archived_banner": "This template is archived. It is not visible to officers and cannot be used for new reports.",
	"fmt.title": "Report Style Settings",
	"fmt.save": "Save Style",
	"fmt.preview_label": "Live Preview",
	"fmt.section_branding": "Branding",
	"fmt.section_layout": "Layout & Typography",
	"fmt.section_page": "Page Options",
	"fmt.logo": "Company Logo",
	"fmt.logo_upload_hint": "Click to upload logo",
	"fmt.accent_colour": "Accent Colour",
	"fmt.header_layout": "Header Layout",
	"fmt.font": "Font",
	"fmt.date_format": "Date Format",
	"fmt.date_format_preview": "Preview",
	"fmt.section_breaks": "Section Breaks",
	"fmt.page_numbering": "Page Numbering",
	"fmt.page_numbering_desc": "Show page numbers in the footer.",
	"fmt.include_cover_page": "Include Cover Page",
	"fmt.include_cover_page_desc": "Generates a dedicated cover page with report title, site name, officer name, date, and logo.",
	"fmt.confidentiality_footer": "Confidentiality Footer",
	"fmt.confidentiality_footer_placeholder": "e.g. CONFIDENTIAL – FOR AUTHORISED RECIPIENTS ONLY",
	"fmt.confidentiality_footer_hint": "Appears on every page footer.",
	"reports.title": "Report Templates",
	"reports.subtitle": "Manage incident report templates for your communities.",
	"reports.add_new": "New Template",
	"reports.search_placeholder": "Search by name, community, ID...",
	"reports.count": "templates",
	"reports.col_name": "Template Name",
	"reports.col_community": "Community / Site",
	"reports.col_category": "Category",
	"reports.col_sections": "Sections",
	"reports.col_status": "Status",
	"reports.col_modified": "Last Modified",
	"reports.category_incident": "Incident",
	"reports.category_daily": "Daily Activity",
	"reports.status_active": "Active",
	"reports.status_draft": "Draft",
	"reports.status_archived": "Archived",
	"reports.action_duplicate": "Duplicate",
	"reports.action_archive": "Archive",
	"reports.action_restore": "Restore to Active",
	"reports.action_format": "Format Settings",
	"reports.empty": "No templates found. Create one to get started.",
	"reports.modal_archive_title": "Archive Template",
	"reports.modal_archive_desc": "This template will no longer be available for new reports. Existing reports using this template will not be affected. You can restore it at any time.",
	"reports.modal_archive_confirm": "Archive",
	"reports.report_id": "Report ID",
	"reports.report_title": "Report Title",
	"reports.template": "Template",
	"reports.community": "Community",
	"reports.officer": "Officer",
	"reports.submitted_at": "Submitted At",
	"reports.status": "Status",
	"reports.source_call": "Source Call",
	"reports.review_required": "Review Required",
	"reports.no_reports": "No incident reports found.",
	"reports.report_details": "Report Details",
	"reports.report_content": "Report Content",
	"reports.content_placeholder": "Report content will be displayed here.",
	"reports.approve": "Approve",
	"reports.request_changes": "Request Changes",
	"reports.deliver": "Deliver",
	"reports.history": "History",
	"reports.submitted_by": "Submitted by {officer}",
	"reports.filters.community": "Community",
	"reports.filters.status": "Status",
	"reports.filters.category": "Category",
	"reports.filters.review_required": "Review Required",
	"reports.filters.date_range": "Date Range",
	"reports.filters.search_placeholder": "Search by ID, title, officer...",
	"reports.edit_report": "Edit Report",
	"reports.save_changes": "Save Changes",
	"reports.edit_content": "Edit Content",
	"reports.manager_notes": "Manager Notes",
	"reports.notes_placeholder": "Add notes about this report (visible to managers only)...",
	"reports.show_audit_trail": "Show Audit Trail",
	"reports.hide_audit_trail": "Hide Audit Trail",
	"reports.audit_trail": "Audit Trail",
	"reports.sections": "Report Sections",
	"reports.section_delivery_panel": "Section & Delivery Panel",
	"reports.section_inclusion": "Section Inclusion Checklist",
	"reports.management_summary": "Management Summary",
	"reports.summary_placeholder": "Add an optional summary to appear at the beginning of the client-facing report (max 1000 chars)...",
	"reports.finalize_approval": "Finalize Approval",
	"reports.send_request": "Send Request",
	"reports.changes_description": "Describe what changes are needed. This will be sent to the officer.",
	"reports.comments_placeholder": "Enter detailed comments about required changes (max 1000 chars)...",
	"reports.comments_required": "Comments are required when requesting changes.",
	"officers.mobile": "Mobile",
	"officers.mobile_placeholder": "+1 555-0000",
	"officers.email": "Email",
	"officers.email_placeholder": "officer@example.com",
	"officers.address": "Address",
	"officers.address_placeholder": "Street, City",
	"officers.title": "Title",
	"officers.title_placeholder": "e.g., Senior Officer",
	"officers.description": "Description",
	"officers.description_placeholder": "Long text about this officer (optional)",
	"officers.roles": "Roles",
	"officers.certifications": "Certifications",
	"officers.active": "Active",
	"officers.reg_date": "Registration Date",
	"officers.actions": "Actions",
	"officers.tab_details": "Details",
	"officers.tab_evaluations": "Evaluations",
	"officers.evaluations": "Evaluations",
	"officers.no_evaluations": "No evaluations yet.",
	"officers.add_evaluation": "Add Evaluation",
	"officers.eval_text": "Evaluation",
	"officers.eval_text_placeholder": "Write your evaluation…",
	"officers.eval_date": "Date",
	"officers.eval_evaluator": "Evaluator Name",
	"officers.eval_evaluator_placeholder": "Your name",
	"officers.unknown": "Unknown",
	"officers.eval_add_success": "Evaluation added successfully.",
	"officers.eval_add_failed": "Failed to add evaluation. Please try again.",
	"officers.eval_not_found": "Evaluation not found — it may have already been deleted.",
	"officers.delete_eval_title": "Delete Evaluation",
	"officers.delete_eval_message": "Are you sure you want to delete this evaluation? This action cannot be undone.",
	"tasks.title": "Tasks",
	"tasks.add_new": "Add New Task",
	"tasks.id": "Task ID",
	"tasks.type": "Type",
	"tasks.task_type": "Task Type",
	"tasks.description": "Description",
	"tasks.description_placeholder": "Enter task description (up to 200 chars)",
	"tasks.priority": "Priority",
	"tasks.created": "Created",
	"tasks.created_by": "Created By",
	"tasks.status": "Status",
	"tasks.assigned_to": "Assigned To",
	"tasks.assigned_to_placeholder": "Enter username to assign",
	"tasks.actions": "Actions",
	"tasks.view": "View",
	"tasks.accept": "Accept",
	"tasks.reject": "Reject",
	"tasks.complete": "Complete",
	"tasks.comments": "Comments",
	"tasks.task_details": "Task Details",
	"tasks.search_placeholder": "Search by ID, description, user...",
	"tasks.clear_filters": "Clear Filters",
	"tasks.newest_first": "Newest First",
	"tasks.oldest_first": "Oldest First",
	"tasks.no_tasks": "No tasks found.",
	"tasks.assign_to_me": "My Tasks Only",
	"tasks.from": "From",
	"tasks.to": "To",
	"tasks.all_types": "All Types",
	"tasks.all_priorities": "All Priorities",
	"tasks.status_open": "Open",
	"tasks.status_closed": "Closed",
	"tasks.status_all": "All",
	"tasks.type_maintenance": "Maintenance",
	"tasks.type_inspection": "Inspection",
	"tasks.type_damaged_equipment": "Damaged Equipment",
	"tasks.type_operational_report": "Operational Report",
	"tasks.type_supply_request": "Supply Request",
	"tasks.priority_urgent": "Urgent",
	"tasks.priority_important": "Important",
	"tasks.priority_normal": "Normal",
	"tasks.priority_low": "Low",
	"tasks.reject_task": "Reject Task",
	"tasks.reject_description": "Please provide a reason for rejecting this task.",
	"tasks.reject_placeholder": "Enter rejection reason...",
	"tasks.confirm_reject": "Confirm Reject",
	"tasks.complete_task": "Complete Task",
	"tasks.complete_description": "Add resolution details (optional).",
	"tasks.complete_placeholder": "Enter completion notes...",
	"tasks.confirm_complete": "Confirm Complete",
	"tasks.add_new_task": "Add New Task",
	"tasks.create_task": "Create Task",
	"tasks.address": "Address",
	"tasks.address_placeholder": "Enter location address",
	"tasks.eta": "ETA",
	"tasks.media": "Images",
	"tasks.add_image": "Add Image",
	"tasks.video": "Video",
	"tasks.add_video": "Add Video",
	"tasks.video_added": "Video added",
	"shifts.title": "Shift Management",
	"shifts.add_new": "Add Shift",
	"shifts.add_new_shift": "Add New Shift",
	"shifts.shift_details": "Shift Details",
	"shifts.shift_id": "Shift ID",
	"shifts.community": "Community / Site",
	"shifts.all_communities": "All Communities",
	"shifts.site": "Site",
	"shifts.time": "Time",
	"shifts.officers": "Officers",
	"shifts.officer_placeholder": "Search officer name...",
	"shifts.status": "Status",
	"shifts.posts": "Posts",
	"shifts.notes": "Notes",
	"shifts.no_shifts": "No shifts",
	"shifts.today": "Today",
	"shifts.day_view": "Day",
	"shifts.week_view": "Week",
	"shifts.month_view": "Month",
	"shifts.form_placeholder": "Shift form will be implemented here.",
	"shifts.status_draft": "Draft",
	"shifts.status_published": "Published",
	"shifts.status_active": "Active",
	"shifts.status_completed": "Completed",
	"shifts.status_cancelled": "Cancelled",
	"shifts.tabs.shift_management": "Shift Management",
	"shifts.tabs.routes": "Routes",
	"shifts.routes_title": "Routes",
	"shifts.routes_placeholder": "Routes will appear here once patrol routes are generated for shifts.",
	"shifts.shift_date": "Shift Date",
	"shifts.start_time": "Start Time",
	"shifts.end_time": "End Time",
	"shifts.recurring": "Recurring",
	"shifts.recurrence_pattern": "Recurrence Pattern",
	"shifts.daily": "Daily",
	"shifts.specific_days": "Specific Days",
	"shifts.every_x_days": "Every X Days",
	"shifts.repeat_on": "Repeat On",
	"shifts.end_condition": "End Condition",
	"shifts.end_date_option": "End Date",
	"shifts.occurrences_option": "Occurrences",
	"shifts.no_end_option": "No End",
	"shifts.end_date": "End Date",
	"shifts.occurrences": "Occurrences",
	"shifts.select_community": "Select Community",
	"shifts.site_placeholder": "Enter site / post location",
	"shifts.posts_placeholder": "e.g. Main Gate, Patrol",
	"shifts.posts_hint": "Separate posts with commas",
	"shifts.patrol_route": "Patrol Route",
	"shifts.generate_route": "Generate Patrol Route",
	"shifts.view_route": "View Route",
	"shifts.regenerate_route": "Regenerate Route",
	"shifts.no_route_hint": "Click to generate an AI-suggested route",
	"shifts.route_empty": "No route generated yet",
	"shifts.eta": "ETA",
	"shifts.dwell": "Dwell",
	"shifts.waypoints": "waypoints",
	"shifts.remove_route": "Remove Route",
	"shifts.no_officers": "No officers assigned",
	"shifts.routes_count": "routes",
	"shifts.auto_generated": "Auto-generated",
	"shifts.publish": "Publish",
	"shifts.cancel_shift": "Cancel Shift",
	"shifts.complete": "Complete",
	"shifts.notes_placeholder": "Enter notes visible to officers",
	"shifts.allocation_board": "Allocation Board",
	"shifts.available_officers": "Available Officers",
	"shifts.weekly_hours": "Weekly Hours",
	"shifts.shift_timeline": "Shift Timeline",
	"shifts.drop_officer_here": "Drop officer here",
	"shifts.no_shifts_for_day": "No shifts for this day",
	"shifts.post_assignment": "Post Assignment",
	"shifts.assign_officer_to_post": "Assign {officer} to shift {shift}",
	"shifts.select_post": "Select Post",
	"shifts.no_specific_post": "No specific post",
	"shifts.allocation_conflicts": "Allocation Conflicts",
	"shifts.conflict_warning_text": "This allocation has the following warnings:",
	"shifts.conflict_acknowledge": "I understand and want to proceed",
	"shifts.proceed_with_conflict": "Proceed Anyway",
	"shifts.conflict_double_booking": "Officer is already allocated to an overlapping shift on the same day",
	"shifts.conflict_overtime": "Allocation would exceed weekly hours limit ({hours}h / {max}h)",
	"shifts.conflict_rest_gap": "Rest period between shifts falls below {hours} hours",
	"validation.required": "This field is required",
	"settings.page_title": "General Settings",
	"settings.page_subtitle": "Manage system-wide configuration and settings",
	"settings.tabs.service_types": "Service Types",
	"settings.tabs.asset_types": "Asset Types",
	"settings.tabs.post_orders": "Post Orders",
	"settings.tabs.notifications": "Notifications",
	"settings.tabs.poi_trespass": "POI & Trespass",
	"settings.tabs.gps_tracking": "GPS & Tracking",
	"settings.tabs.working_hours": "Working Hours",
	"settings.tabs.security": "Account Settings",
	"settings.titles.service_types": "Service & Incident Types",
	"settings.titles.asset_types": "Asset Types",
	"settings.titles.post_orders": "Post Order Sections",
	"settings.titles.notifications": "Push Notifications",
	"settings.titles.poi_trespass": "POI & Trespass Settings",
	"settings.titles.gps_tracking": "GPS & Tracking Settings",
	"settings.titles.working_hours": "Working Hours",
	"settings.titles.security": "Account Settings",
	"poi.title": "Persons of Interest & Trespass",
	"poi.subtitle": "Manage POI records, trespass orders, and Metro Red Cards",
	"poi.create": "Create Record",
	"poi.search_placeholder": "Search by name, alias or Record ID…",
	"poi.filter_all_types": "All Types",
	"poi.filter_all_threats": "All Threat Levels",
	"poi.filter_all_statuses": "All Statuses",
	"poi.empty": "No records found",
	"poi.col_id": "Record ID",
	"poi.col_name": "Name",
	"poi.col_type": "Type",
	"poi.col_threat": "Threat",
	"poi.col_sites": "Sites",
	"poi.col_status": "Status",
	"poi.col_expiry": "Expiry Date",
	"poi.col_updated": "Last Updated",
	"poi.col_actions": "Actions",
	"poi.type_poi": "POI",
	"poi.type_trespass": "Trespass",
	"poi.type_metro": "Metro Red Card",
	"poi.threat_low": "Low",
	"poi.threat_medium": "Medium",
	"poi.threat_high": "High",
	"poi.threat_critical": "Critical",
	"poi.status_draft": "Draft",
	"poi.status_active": "Active",
	"poi.status_expired": "Expired",
	"poi.status_inactive": "Inactive",
	"poi.status_archived": "Archived",
	"poi.action_inactive": "Inactive Record",
	"poi.form_title_create": "Create New Record",
	"poi.form_title_edit": "Edit Record",
	"poi.save_changes": "Save Changes",
	"poi.form_subtitle": "Fill in the details below. Select a record type to reveal the relevant fields.",
	"poi.section_record_type": "Record Type",
	"poi.section_basic_info": "Basic Information",
	"poi.section_threat_sites": "Threat Level & Sites",
	"poi.section_photos": "Photos",
	"poi.section_summary": "Summary & Notes",
	"poi.section_poi_details": "POI Details",
	"poi.section_trespass_details": "Trespass Order Details",
	"poi.section_metro_details": "Metro Red Card Details",
	"poi.type_poi_desc": "Individual flagged for monitoring",
	"poi.type_trespass_desc": "Formal trespass notice or court order",
	"poi.type_metro_desc": "Transit authority exclusion notice",
	"poi.field_first_name": "First Name",
	"poi.field_last_name": "Last Name",
	"poi.field_dob": "Date of Birth",
	"poi.field_gender": "Gender",
	"poi.field_aliases": "Known Aliases",
	"poi.field_aliases_placeholder": "Comma-separated list of known aliases...",
	"poi.field_physical_desc": "Physical Description",
	"poi.field_threat_level": "Threat Level",
	"poi.field_sites": "Sites / Communities",
	"poi.field_summary": "Summary",
	"poi.field_summary_placeholder": "Brief description visible to officers...",
	"poi.field_internal_notes": "Internal Notes",
	"poi.field_internal_notes_hint": "Visible to managers and admins only. Not shown to officers.",
	"poi.field_related_incidents": "Related Incident IDs",
	"poi.field_related_incidents_placeholder": "e.g. INC-001, INC-002",
	"poi.field_incident_history": "Incident History Summary",
	"poi.field_watch_review_date": "Watch Level Review Date",
	"poi.field_watch_review_date_hint": "A reminder will be sent on this date.",
	"poi.field_associated_individuals": "Associated Individuals",
	"poi.field_notice_number": "Trespass Notice Number",
	"poi.field_issuing_authority": "Issuing Authority",
	"poi.field_property_area": "Property / Area Covered",
	"poi.field_issue_date": "Issue Date",
	"poi.field_expiry_date": "Expiry Date",
	"poi.field_renewal_reminder": "Renewal Reminder",
	"poi.field_law_enforcement": "Law Enforcement Contact",
	"poi.field_conditions": "Conditions",
	"poi.field_notice_document": "Notice Document (PDF)",
	"poi.field_red_card_number": "Red Card Number",
	"poi.field_metro_lines": "Lines / Stations Covered",
	"poi.field_metro_lines_placeholder": "e.g. Line 1, Central Station...",
	"poi.field_card_document": "Card Document",
	"poi.gender_male": "Male",
	"poi.gender_female": "Female",
	"poi.gender_unknown": "Unknown",
	"poi.add_photo": "Add Photo",
	"poi.photo_hint": "At least 1 photo required. Max 10 photos, 5 MB each.",
	"poi.upload_pdf": "Upload PDF...",
	"poi.upload_card_doc": "Upload Document...",
	"poi.notice_doc_hint": "PDF only. Max 20 MB. Accessible to managers and supervisors only.",
	"poi.card_doc_hint": "PDF or image. Accessible to managers and supervisors only.",
	"poi.days_before_expiry": "days before expiry",
	"poi.save_draft": "Save as Draft",
	"poi.publish": "Publish Record",
	"poi.action_export": "Export PDF",
	"poi.detail_created_by": "Created by",
	"poi.version_history": "Version History",
	"poi.modal_inactive_title": "Inactive Record",
	"poi.modal_inactive_desc": "This will immediately remove the record from all officer devices and send a push notification. This action cannot be undone.",
	"poi.modal_inactive_reason": "Reason for inactivating",
	"poi.modal_inactive_reason_placeholder": "e.g. Trespass order lifted, individual no longer a concern...",
	"poi.modal_inactive_confirm": "Confirm Inactive",
	"poi.modal_inactive_success": "Record has been inactivated. Officers have been notified and the record is no longer visible on their devices.",
	"poi.modal_export_title": "Export Record as PDF",
	"poi.modal_export_watermark": "The PDF will be watermarked with your name, export date/time, and \"CONFIDENTIAL – AUTHORISED USE ONLY\".",
	"poi.modal_export_includes": "Includes: photos, summary, threat level, and all record details.",
	"poi.modal_export_excludes": "Excludes: Internal Notes (not shown in exported PDF).",
	"poi.modal_export_logged": "This export will be logged with your name and timestamp.",
	"poi.modal_export_confirm": "Export PDF",
	"poi.export_success": "PDF export initiated. The file will download shortly.",
	"poi.export_log": "Export Log",
	"settings.placeholder": "{section} configuration will be displayed here",
	"settings.service_types.tab_label": "Service & Incident",
	"settings.service_types.list_title": "Service / Incident Types",
	"settings.maintenance_types.tab_label": "Maintenance",
	"settings.maintenance_types.list_title": "Maintenance Report Types",
	"settings.types.add_new": "Add Type",
	"settings.types.add_placeholder": "Enter type name...",
	"settings.types.search_placeholder": "Search types...",
	"settings.types.total": "Total",
	"settings.types.types_count": "types",
	"settings.types.type_name": "Type Name",
	"settings.types.delete_asset_type_title": "Delete Asset Type",
	"settings.post_order_sections.delete_title": "Delete Post Order Section",
	"settings.types.delete_confirm": "Are you sure you want to delete this type?",
	"settings.types.empty": "No types found. Add your first type above.",
	"settings.types.add_service_title": "Add Service / Incident Type",
	"settings.types.add_service_description": "Create a new service or incident type for residents to report.",
	"settings.types.add_maintenance_title": "Add Maintenance Report Type",
	"settings.types.add_maintenance_description": "Create a new maintenance report type for officers to use.",
	"settings.asset_types.tab_label": "Asset Types",
	"settings.asset_types.list_title": "Asset Types",
	"settings.asset_types.assets_count": "assets",
	"settings.asset_types.icon": "Icon",
	"settings.asset_types.colour": "Colour",
	"settings.asset_types.add_title": "Add Asset Type",
	"settings.asset_types.add_description": "Create a new asset type with icon and colour for the map.",
	"settings.asset_types.edit_title": "Edit Asset Type",
	"settings.asset_types.edit_description": "Update the asset type details.",
	"settings.asset_types.upload_icon": "Upload Icon",
	"settings.post_order_sections.list_title": "Post Order Section Types",
	"settings.post_order_sections.sections_count": "sections",
	"settings.post_order_sections.search_placeholder": "Search section types...",
	"settings.post_order_sections.section_name": "Section Name",
	"settings.post_order_sections.client_visible": "Client Visible",
	"settings.post_order_sections.client_visible_hint": "Visible to clients when viewing post orders",
	"settings.post_order_sections.short_description": "Short Description",
	"settings.post_order_sections.active_hint": "Only active types appear when creating new post orders",
	"settings.post_order_sections.add_title": "Add Section Type",
	"settings.post_order_sections.add_description": "Create a new post order section type.",
	"settings.post_order_sections.edit_title": "Edit Section Type",
	"settings.post_order_sections.edit_description": "Update the post order section type details.",
	"settings.post_order_sections.name_placeholder": "e.g. General Information",
	"settings.post_order_sections.description_placeholder": "Brief description of this section...",
	"settings.notifications.page_title": "Push Notification Settings",
	"settings.notifications.page_subtitle": "Configure how and when push notifications are sent to users.",
	"settings.notifications.channels_title": "Notification Channels",
	"settings.notifications.channels_desc": "Select which channels notifications are sent through. Default is all channels.",
	"settings.notifications.channel_in_app": "In-App",
	"settings.notifications.channel_in_app_desc": "Notifications shown within the portal and officer app",
	"settings.notifications.channel_email": "Email",
	"settings.notifications.channel_email_desc": "Notifications delivered to the user's email address",
	"settings.notifications.channel_mobile": "Mobile Push",
	"settings.notifications.channel_mobile_desc": "Push notifications on the officer's mobile device",
	"settings.notifications.sender_name_label": "Sender Name",
	"settings.notifications.sender_name_placeholder": "e.g. Code 4 Operations",
	"settings.notifications.sender_name_hint": "Defaults to the contractor company name if left empty.",
	"settings.notifications.notification_title_label": "Notification Title",
	"settings.notifications.notification_title_placeholder": "e.g. Code 4 Alert",
	"settings.notifications.notification_title_hint": "Defaults to the app name if left empty.",
	"settings.notifications.triggers_title": "Notification Triggers",
	"settings.notifications.triggers_desc": "Select which events trigger a push notification. Default is all events.",
	"settings.notifications.select_all": "Select all",
	"settings.notifications.triggers_enabled": "triggers enabled",
	"settings.notifications.triggers.new_emergency_call": "New Emergency Call",
	"settings.notifications.triggers.call_accepted": "Call Status → Accepted",
	"settings.notifications.triggers.call_edited": "Call Edited",
	"settings.notifications.triggers.call_resolved": "Call Status → Resolved",
	"settings.notifications.triggers.post_order_published": "Post Order Published",
	"settings.notifications.triggers.post_order_updated": "Post Order Updated",
	"settings.notifications.triggers.poi_record_active": "New POI Record – Active",
	"settings.notifications.triggers.poi_record_updated": "POI Record Updated",
	"settings.notifications.triggers.poi_record_inactivated": "POI Record Inactivated",
	"settings.notifications.triggers.record_expiring_soon": "Record Expiring Soon",
	"settings.notifications.triggers.record_expired": "Record Expired",
	"settings.notifications.triggers.incident_report_submitted": "Incident Report Submitted",
	"settings.notifications.triggers.incident_report_approved": "Incident Report Approved",
	"settings.notifications.triggers.incident_report_changes": "Incident Report – Changes Required",
	"settings.notifications.triggers.incident_report_delivered": "Incident Report – Delivered",
	"settings.notifications.receivers.assigned_officer": "Assigned officer",
	"settings.notifications.receivers.call_creator_manager": "Call creator & site manager",
	"settings.notifications.receivers.allocated_officers": "Officers allocated to the post",
	"settings.notifications.receivers.all_checked_in": "All officers checked in",
	"settings.notifications.receivers.officers_affected_communities": "Officers at affected communities",
	"settings.notifications.receivers.all_officers": "All officers",
	"settings.notifications.receivers.creating_manager": "Creating manager (and admin)",
	"settings.notifications.receivers.manager_officers": "Creating manager (and admin) & officers",
	"settings.notifications.receivers.responsible_manager": "Responsible manager",
	"settings.notifications.receivers.report_officer": "Officer who generated the report",
	"settings.notifications.receivers.call_client": "Client who opened the call",
	"settings.notifications.save_success": "Notification settings saved successfully.",
	"settings.notifications.save_failed": "Failed to save notification settings.",
	"settings.notifications.access_denied": "Access denied — admin privileges required.",
	"settings.notifications.retention_title": "Data Retention",
	"settings.notifications.retention_desc": "Configure how long notifications are kept before automatic cleanup.",
	"settings.notifications.retention_label": "Notification Retention (Days)",
	"settings.notifications.retention_hint": "The number of days to keep notifications before they are automatically archived. Notifications older than this threshold are removed during the nightly cleanup. Default: 90 days.",
	"settings.notifications.retention_error": "Notification retention must be at least 1 day.",
	"settings.notifications.retention_max_error": "Notification retention cannot exceed 365 days.",
	"notifications.title": "Notifications",
	"notifications.mark_all_read": "Mark all read",
	"notifications.marking": "Marking...",
	"notifications.all_marked_read": "All notifications marked as read.",
	"notifications.mark_all_failed": "Failed to mark notifications as read.",
	"notifications.no_notifications": "No notifications",
	"notifications.view_all": "View All Notifications",
	"notifications.time.just_now": "Just now",
	"notifications.time.minutes_ago": "{n}m ago",
	"notifications.time.hours_ago": "{n}h ago",
	"notifications.time.yesterday": "Yesterday",
	"notifications.time.days_ago": "{n} days ago",
	"notifications.urgent.view": "View",
	"notifications.urgent.dismiss": "Dismiss",
	"settings.poi.page_title": "POI & Trespass Settings",
	"settings.poi.page_subtitle": "Configure record management parameters and default response guidance texts.",
	"settings.poi.parameters_title": "General Parameters",
	"settings.poi.parameters_desc": "Configure renewal reminders, archive thresholds, and export options.",
	"settings.poi.renewal_reminder_label": "Renewal Reminder Lead Time",
	"settings.poi.renewal_reminder_hint": "Days before Trespass/Red Card expiry to send renewal reminder. Default: 14 days.",
	"settings.poi.archive_threshold_label": "Archive Threshold",
	"settings.poi.archive_threshold_hint": "Months after expiry or inactivating before a record becomes eligible for archiving. Default: 24 months.",
	"settings.poi.pdf_export_label": "PDF Export",
	"settings.poi.pdf_export_hint": "Whether admin PDF export is available for POI records.",
	"settings.poi.days": "days",
	"settings.poi.months": "months",
	"settings.poi.guidance_title": "Default Response Guidance Texts",
	"settings.poi.guidance_desc": "Default guidance displayed to officers for each record type. Can be edited per record.",
	"settings.poi.poi_guidance_label": "Person of Interest",
	"settings.poi.poi_guidance_placeholder": "Enter default guidance for POI records...",
	"settings.poi.trespass_guidance_label": "Trespass Order",
	"settings.poi.trespass_guidance_placeholder": "Enter default guidance for Trespass Order records...",
	"settings.poi.red_card_guidance_label": "Metro Red Card",
	"settings.poi.red_card_guidance_placeholder": "Enter default guidance for Metro Red Card records...",
	"settings.gps.page_title": "GPS & Tracking Settings",
	"settings.gps.page_subtitle": "Configure GPS transmission intervals, alert thresholds, and map provider.",
	"settings.gps.intervals_title": "GPS Transmission Intervals",
	"settings.gps.intervals_desc": "How often officer location updates are sent during patrol and emergency response.",
	"settings.gps.interval_normal_label": "GPS Transmission Interval (Normal)",
	"settings.gps.interval_normal_hint": "How often the officer app sends a location update during a standard patrol. Default: 30s. Range: 10–120s.",
	"settings.gps.interval_emergency_label": "GPS Transmission Interval (Emergency)",
	"settings.gps.interval_emergency_hint": "Update interval when an officer is responding to an emergency call. Default: 10s. Range: 5–30s.",
	"settings.gps.eta_interval_label": "Emergency ETA Recalculation Interval",
	"settings.gps.eta_interval_hint": "How often ETA is recalculated using the Maps API during an emergency response. Default: 60s.",
	"settings.gps.map_refresh_label": "Map Auto-Refresh Interval (Portal)",
	"settings.gps.map_refresh_hint": "How often the Live Tracking map reloads data in the manager portal. Default: 30s.",
	"settings.gps.thresholds_title": "Alert Thresholds & Retention",
	"settings.gps.thresholds_desc": "Configure when alerts are triggered and how long data is retained.",
	"settings.gps.stale_threshold_label": "GPS Stale Alert Threshold",
	"settings.gps.stale_threshold_hint": "How long without a GPS update before an amber alert is triggered. Default: 2 min.",
	"settings.gps.compliance_threshold_label": "Patrol Compliance Alert Threshold",
	"settings.gps.compliance_threshold_hint": "Minutes overdue at a waypoint before triggering a skip alert. Default: 15 min.",
	"settings.gps.history_retention_label": "Location History Retention",
	"settings.gps.history_retention_hint": "How long raw GPS tracks are stored. Default: 90 days.",
	"settings.gps.map_provider_title": "Map Provider",
	"settings.gps.map_provider_desc": "Map service used for live tracking and route optimisation.",
	"settings.gps.map_provider_label": "Map Provider",
	"settings.gps.seconds": "seconds",
	"settings.gps.minutes": "minutes",
	"settings.gps.days": "days",
	"settings.gps.restore_defaults": "Restore Defaults",
	"settings.gps.restore_defaults_title": "Restore Default Settings",
	"settings.gps.restore_defaults_confirm": "This will reset all GPS & Tracking settings to their factory defaults. This action cannot be undone.",
	"settings.working_hours.page_title": "Working Hours",
	"settings.working_hours.page_subtitle": "Configure maximum working hour limits for officers.",
	"settings.working_hours.officers_title": "Officers",
	"settings.working_hours.officers_desc": "Set the maximum number of hours an officer can work per day.",
	"settings.working_hours.max_hours_label": "Max working hours per day",
	"settings.working_hours.max_hours_hint": "Default: 8 hours. Allowed range: 1–24.",
	"settings.working_hours.hours_per_day": "hours / day",
	"users.management_title": "Users Management",
	"users.search_placeholder": "Search users...",
	"users.include_inactive": "Include Inactive",
	"users.add_user": "Add User",
	"users.add_title": "Add New User",
	"users.edit_title": "Edit User",
	"users.edit_success": "User updated successfully.",
	"users.basic_info": "Basic Information",
	"users.email_placeholder": "email@example.com",
	"users.password_hint": "Initial password. User must change on first login.",
	"users.status": "Status",
	"users.status_active": "Active",
	"users.status_inactive": "Inactive",
	"users.first_name": "First Name",
	"users.last_name": "Last Name",
	"users.mobile": "Mobile",
	"users.email": "Email",
	"users.password": "Password",
	"users.role": "Role",
	"users.registration_date": "Registration Date",
	"users.active": "Active",
	"users.reset_password": "Reset Password",
	"users.reset_password_title": "Reset Password for {name}",
	"users.reset_password_new_password": "New Initial Password",
	"users.reset_password_warning": "Warning:",
	"users.reset_password_warning_logout": "The user will be logged out immediately.",
	"users.reset_password_warning_change": "They must change this password on their next login.",
	"users.reset_password_warning_communicate": "You must communicate the new password to the user through a secure channel.",
	"users.reset_password_success": "Password reset successfully. The user must change it on their next login.",
	"users.reset_password_success_title": "Password Reset Complete",
	"users.reset_password_failed": "Failed to reset password. Please try again.",
	"users.delete_title": "Delete User",
	"users.delete_message": "Are you sure you want to delete {name}? This action cannot be undone.",
	"users.delete_warning": "The user will be permanently removed from the system.",
	"users.delete_success": "User deleted successfully.",
	"users.delete_failed": "Failed to delete user. Please try again.",
	"users.delete_not_found": "User not found — they may have already been deleted.",
	"users.constraint_title": "Cannot Delete User",
	"users.constraint_message": "{name} cannot be deleted.",
	"users.constraint_reason_own_account": "You cannot delete your own account.",
	"users.constraint_reason_last_admin": "This is the last active admin in the system. At least one admin must remain at all times.",
	"users.constraint_deactivate_hint": "You can deactivate the user instead, which will prevent their access while preserving the account.",
	"users.deactivate_instead": "Deactivate Instead",
	"users.deactivate_success": "User deactivated successfully.",
	"users.deactivate_failed": "Failed to deactivate user. Please try again.",
	"users.invalid_role": "Invalid role selected",
	"users.first_name_required": "First name is required",
	"users.email_exists": "A user with this email already exists",
	"users.initial_password": "Initial Password",
	"users.initial_password_hint": "Required when changing email. The user will be logged out and must change this password on their next login.",
	"users.email_change_warning": "Changing the email will immediately log this user out. They must log back in with the new email and initial password, then set a new permanent password.",
	"users.deactivate_warning": "Deactivating this user will immediately log them out and prevent them from logging in until reactivated.",
	"users.user_not_found": "User not found — they may have been deleted.",
	"users.last_admin_deactivate": "Cannot deactivate — this user is the last active admin in the system.",
	"users.cannot_change_own_role": "You cannot change your own role.",
	"users.role_super_admin_only": "Only Super Admin can change user roles."
} };
function getNestedValue(obj, key) {
	return obj[key] ?? key;
}
function useTranslation() {
	const lang = ref("en");
	function t(key, replacements) {
		let str = getNestedValue(translations[lang.value] ?? translations["en"], key);
		if (replacements) for (const [k, v] of Object.entries(replacements)) str = str.replace(new RegExp(`{${k}}`, "g"), v);
		return str;
	}
	function setLang(newLang) {
		lang.value = newLang;
	}
	return {
		t,
		lang: readonly(lang),
		setLang
	};
}
//#endregion
//#region app/api/types/adminUser.ts
var AdminUserRole = {
	SUPER_ADMIN: 2,
	MANAGER: 3,
	PLANNING: 4,
	LOGISTICS: 5,
	FINANCE: 6
};
//#endregion
//#region app/stores/auth.ts
var STORAGE_KEYS = {
	USER: "auth_user",
	ROLES: "auth_roles",
	NEED_CHANGE_PASSWORD: "auth_need_change_password"
};
var storage = {
	get(key) {
		return null;
	},
	set(key, value) {},
	remove(key) {},
	clear() {}
};
var useAuthStore = defineStore("auth", {
	state: () => ({
		token: null,
		xToken: null,
		user: null,
		roles: [],
		isAuthenticated: false,
		needChangePassword: false
	}),
	getters: {
		/** Get user's full name */
		fullName: (state) => {
			if (!state.user) return "";
			return `${state.user.first_name} ${state.user.last_name}`.trim();
		},
		/** Check if user has authentication token */
		hasToken: (state) => !!state.token,
		/** Check if user is admin (type === 1) */
		isAdmin: (state) => {
			if (!state.user) return false;
			return state.user.type === 1;
		},
		/** Check if user can approve tasks (admin or planning/logistics/finance) */
		isApprover: (state) => {
			if (!state.user) return false;
			if (state.user.type === 1) return true;
			const approverRoles = [
				AdminUserRole.PLANNING,
				AdminUserRole.LOGISTICS,
				AdminUserRole.FINANCE
			];
			return state.roles.some((role) => approverRoles.includes(role));
		}
	},
	actions: {
		/**
		* Set authentication data after successful login
		* @param token - JWT authentication token
		* @param user - User information
		* @param needChangePassword - Whether user needs to change password
		* @param xToken - Restricted token for mandatory password change
		*/
		setAuth(token, user, needChangePassword = false, xToken) {
			this.token = token;
			this.xToken = xToken || null;
			this.user = user;
			this.roles = [];
			this.isAuthenticated = true;
			this.needChangePassword = needChangePassword;
			storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
			storage.set(STORAGE_KEYS.ROLES, JSON.stringify([]));
			storage.set(STORAGE_KEYS.NEED_CHANGE_PASSWORD, needChangePassword.toString());
		},
		/**
		* Set user roles after login
		* @param roles - Array of role IDs
		*/
		setRoles(roles) {
			this.roles = roles;
			storage.set(STORAGE_KEYS.ROLES, JSON.stringify(roles));
		},
		/** Clear authentication data and logout user */
		clearAuth() {
			this.token = null;
			this.xToken = null;
			this.user = null;
			this.roles = [];
			this.isAuthenticated = false;
			this.needChangePassword = false;
		},
		/**
		* Update user information
		* @param user - Partial user data to update
		*/
		updateUser(user) {
			if (this.user) {
				this.user = {
					...this.user,
					...user
				};
				storage.set(STORAGE_KEYS.USER, JSON.stringify(this.user));
			}
		},
		/** Mark password as changed after successful password update */
		passwordChanged() {
			this.needChangePassword = false;
			this.xToken = null;
		},
		/**
		* Initialize authentication state from sessionStorage
		* Called on app startup to restore user session
		*/
		initializeAuth() {
		}
	}
});
//#endregion
//#region app/stores/toast.ts
var _nextId = 1;
var useToastStore = defineStore("toast", () => {
	const toasts = ref([]);
	function show(message, type = "info", duration = 3500) {
		const id = _nextId++;
		toasts.value.push({
			id,
			message,
			type,
			duration
		});
	}
	function success(message, duration = 3500) {
		show(message, "success", duration);
	}
	function error(message, duration = 4500) {
		show(message, "error", duration);
	}
	function info(message, duration = 3500) {
		show(message, "info", duration);
	}
	function warning(message, duration = 3500) {
		show(message, "warning", duration);
	}
	function remove(id) {
		const idx = toasts.value.findIndex((t) => t.id === id);
		if (idx > -1) toasts.value.splice(idx, 1);
	}
	return {
		toasts,
		show,
		success,
		error,
		info,
		warning,
		remove
	};
});
//#endregion
//#region node_modules/nuxt/dist/app/compat/interval.js
var setInterval = (() => {
	appDiagnostics.NUXT_E1004();
});
//#endregion
//#region app/api/base.ts
var apiClient = axios.create({
	headers: { "Content-Type": "application/json" },
	timeout: 3e4
});
var getApiBaseUrl = () => {
	return useRuntimeConfig().public.apiUrl || "http://localhost:3001";
};
apiClient.interceptors.request.use((config) => {
	return config;
}, (error) => {
	return Promise.reject(error);
});
apiClient.interceptors.response.use((response) => {
	return response;
}, (error) => {
	if (error.response?.data?.rc) {
		error.response.data.rc;
	}
	if (error.response?.status === 401);
	return Promise.reject(error);
});
var ApiError = class extends Error {
	rc;
	data;
	type;
	constructor(rc, message, data, type = "unknown") {
		super(message);
		this.rc = rc;
		this.data = data;
		this.type = type;
		this.name = "ApiError";
	}
};
var BaseApiClient = class {
	/**
	* Make API request with envelope handling and optional loading state
	* @param request - API request envelope
	* @param options - Request options including loading state control
	* @returns Promise resolving to API response
	*/
	async request(request, options) {
		const { showLoading = true, loadingMessage } = options || {};
		let loadingStore = null;
		if (showLoading) {
			const { useLoadingStore } = await import('../build/loading-BV_6sFtq.mjs');
			loadingStore = useLoadingStore();
		}
		try {
			if (loadingStore) loadingStore.show(loadingMessage);
			const baseURL = getApiBaseUrl();
			const response = await apiClient.post("", request, { baseURL });
			if (response.data.rc !== 0) {
				if (response.data.rc === 102 && typeof response.data.param === "string" && response.data.param.startsWith("#token")) throw new ApiError(102, "Session expired. Please log in again.", response.data, "authentication");
				if ([506].includes(response.data.rc)) return response.data;
				const { getErrorMessage, getErrorType } = await import('../build/errors-CkVe_rFw.mjs');
				const messageType = getErrorType(response.data.rc);
				const userMessage = getErrorMessage(response.data.rc, response.data.message);
				throw new ApiError(response.data.rc, userMessage, response.data, messageType);
			}
			return response.data;
		} catch (error) {
			if (error instanceof ApiError) throw error;
			if (axios.isAxiosError(error)) {
				if (error.code === "ECONNABORTED") throw new ApiError(-1, "Request timeout. Please try again.", error, "network");
				if (!error.response) throw new ApiError(-1, "Network error. Please check your connection.", error, "network");
				throw new ApiError(-1, error.response.data?.message || error.message || "Network error", error.response?.data, "network");
			}
			const err = error;
			throw new ApiError(-1, err.message || "Unknown error occurred", err, "unknown");
		} finally {
			if (loadingStore) loadingStore.hide();
		}
	}
	/**
	* Make API request with authentication token
	* @param request - API request without token
	* @param token - Authentication token
	* @returns Promise resolving to API response
	*/
	async requestWithToken(request, token) {
		return this.request({
			"#request": request["#request"],
			"#token": token,
			...request
		});
	}
};
//#endregion
//#region app/api/notification.ts
var NotificationApi = class extends BaseApiClient {
	/**
	* Get paginated list of notifications for the authenticated user.
	* Supports filtering by read status, type, and date range.
	*/
	async getNotifications(params = {}, options) {
		return this.request({
			"#request": "Notification/get_notifications",
			...params
		}, options);
	}
	/**
	* Get total count of unread notifications for the authenticated user.
	*/
	async getUnreadCount(options) {
		return this.request({ "#request": "Notification/get_unread_count" }, options);
	}
	/**
	* Mark a single notification as read. Only the notification owner can do this.
	*/
	async markAsRead(notificationId, options) {
		return this.request({
			"#request": "Notification/mark_as_read",
			notification_id: notificationId
		}, options);
	}
	/**
	* Mark all unread notifications as read for the authenticated user.
	*/
	async markAllAsRead(options) {
		return this.request({ "#request": "Notification/mark_all_as_read" }, options);
	}
	/**
	* Create a notification for a single target user.
	* Optionally triggers push delivery (FCM, email) and real-time WebSocket event.
	*/
	async createNotification(params, options) {
		return this.request({
			"#request": "Notification/create_notification",
			...params
		}, options);
	}
	/**
	* Create notifications for multiple target users at once.
	* More efficient than calling createNotification in a loop.
	*/
	async createBulkNotifications(params, options) {
		return this.request({
			"#request": "Notification/create_bulk_notifications",
			...params
		}, options);
	}
	/**
	* Soft-delete a notification. Only the notification owner can delete their own notifications.
	*/
	async deleteNotification(notificationId, options) {
		return this.request({
			"#request": "Notification/delete_notification",
			notification_id: notificationId
		}, options);
	}
};
var notificationApi = new NotificationApi();
//#endregion
//#region app/utils/config.ts
/**
* Application Configuration
* Centralized config for file upload, user types, and other app settings
*/
var FileUploadConfig = {
	/** Maximum file size for base64 upload (2MB) - larger files use multipart */
	maxBase64Size: 2097152,
	/** Default chunk size for multipart upload (1MB) */
	chunkSize: 1048576
};
var UserTypeConfig = {
	types: {
		ACCOUNT_IMPERSONATION: {
			value: 1,
			label: "Account Impersonation"},
		ADMIN: {
			value: 2,
			label: "Super Admin"},
		MANAGER: {
			value: 3,
			label: "Manager"},
		PLANNING: {
			value: 4,
			label: "Planning"},
		LOGISTICS: {
			value: 5,
			label: "Logistics"},
		FINANCE: {
			value: 6,
			label: "Finance"}
	}};
var NotificationConfig = {
	/** WebSocket server URL for real-time notification events */
	socketUrl: "https://stg.ws.code4.iuetechnologies.com/"
};
var unreadCount = ref(0);
ref(false);
/**
* Composable to manage the notification badge unread count.
* Fetches on mount, polls every 60s, and exposes a refresh method
* for use after mark_as_read / mark_all_as_read / delete_notification.
*/
function useNotificationBadge() {
	async function fetchUnreadCount() {
		try {
			const response = await notificationApi.getUnreadCount({ showLoading: false });
			if (response.rc === 0) unreadCount.value = response.unread_count ?? 0;
		} catch {}
	}
	/** Increment badge optimistically (e.g., on WebSocket new_notification event) */
	function increment(amount = 1) {
		unreadCount.value += amount;
	}
	/** Reset badge to zero (e.g., after mark_all_as_read) */
	function reset() {
		unreadCount.value = 0;
	}
	/** Decrement badge by 1 (e.g., after marking a single notification as read) */
	function decrement(amount = 1) {
		unreadCount.value = Math.max(0, unreadCount.value - amount);
	}
	const badgeText = computed(() => {
		if (unreadCount.value <= 0) return "";
		if (unreadCount.value > 99) return "99+";
		return String(unreadCount.value);
	});
	const showBadge = computed(() => unreadCount.value > 0);
	return {
		unreadCount: readonly(unreadCount),
		badgeText,
		showBadge,
		refresh: fetchUnreadCount,
		increment,
		decrement,
		reset
	};
}
//#endregion
//#region app/composables/useNotificationSocket.ts
var SOCKET_URL = NotificationConfig.socketUrl;
var socket = ref(null);
var isConnected = ref(false);
var latestNotification = ref(null);
var urgentAlert = ref(null);
var isConnecting = false;
function normalizeMessage(data) {
	if (!data) return null;
	if (typeof data === "string") try {
		return JSON.parse(data);
	} catch {
		return null;
	}
	return data;
}
function createNotificationFromMessage(msg) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	let payload = null;
	if (msg.payload) try {
		payload = typeof msg.payload === "string" ? JSON.parse(msg.payload) : msg.payload;
	} catch {
		payload = null;
	}
	return {
		notification_id: msg.notification_id ?? Date.now(),
		type: msg.type ?? "general",
		title: msg.title ?? "",
		message: msg.message ?? "",
		payload,
		is_read: false,
		read_on: null,
		sender_id: "",
		community_id: null,
		created_on: now
	};
}
function playAlarm() {
	try {
		const AudioContext = (void 0).AudioContext || (void 0).webkitAudioContext;
		if (!AudioContext) return;
		const ctx = new AudioContext();
		if (ctx.state === "suspended") ctx.resume();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(880, ctx.currentTime);
		gain.gain.setValueAtTime(.4, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .4);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + .4);
	} catch {}
}
function useNotificationSocket() {
	const authStore = useAuthStore();
	const toastStore = useToastStore();
	useTranslation();
	const { increment } = useNotificationBadge();
	const URGENT_TYPES = ["panic_button", "new_emergency"];
	function disconnect() {
		if (socket.value) {
			socket.value.disconnect();
			socket.value = null;
		}
		isConnected.value = false;
	}
	async function connect() {
		if (socket.value || isConnecting || !authStore.isAuthenticated || !authStore.token) return;
		isConnecting = true;
		const { io: createSocket } = await import('socket.io-client').finally(() => {
			isConnecting = false;
		});
		const newSocket = createSocket(SOCKET_URL, { transports: ["websocket"] });
		newSocket.on("connect", () => {
			isConnected.value = true;
			console.log("[NotificationSocket] Connected, socket id:", newSocket.id);
			console.log("[NotificationSocket] Emitting #token");
			newSocket.emit("#token", authStore.token);
		});
		newSocket.on("disconnect", (reason) => {
			isConnected.value = false;
			console.log("[NotificationSocket] Disconnected:", reason);
		});
		newSocket.on("connect_error", (err) => {
			console.error("[NotificationSocket] Connect error:", err.message);
		});
		newSocket.on("#token", (data) => {
			console.log("[NotificationSocket] #token event received:", data);
			newSocket.emit("echo", "Echo message");
			console.log("[NotificationSocket] Emitted echo response");
		});
		newSocket.on("message", (data) => {
			console.log("[NotificationSocket] Raw message:", data);
			if (typeof data === "string") {
				const trimmed = data.trim();
				try {
					JSON.parse(trimmed);
				} catch {
					console.log("[NotificationSocket] Heartbeat/string message received:", trimmed);
					return;
				}
			}
			const msg = normalizeMessage(data);
			console.log("[NotificationSocket] Parsed message:", msg);
			if (!msg || msg.event !== "new_notification") {
				const eventName = msg?.event || "unknown";
				console.log("[NotificationSocket] Received event:", eventName);
				if (msg?.event && [
					"test",
					"connection_check",
					"connection_checking",
					"ping"
				].includes(msg.event)) {
					newSocket.emit("echo", {
						received: msg.event,
						timestamp: Date.now()
					});
					console.log("[NotificationSocket] Acknowledged event:", msg.event);
				}
				return;
			}
			const notification = createNotificationFromMessage(msg);
			console.log("[NotificationSocket] Created notification:", notification);
			latestNotification.value = notification;
			increment();
			console.log("[NotificationSocket] Badge incremented");
			const toastMessage = notification.title ? `${notification.title}: ${notification.message}` : notification.message;
			if (URGENT_TYPES.includes(notification.type)) {
				toastStore.error(toastMessage, 8e3);
				urgentAlert.value = notification;
				playAlarm();
				notification.title, notification.message;
				console.log("[NotificationSocket] Urgent alert set:", notification.type);
			} else if (notification.type === "new_service_call") {
				toastStore.info(toastMessage, 4500);
				notification.title, notification.message;
				console.log("[NotificationSocket] Info toast shown:", notification.type);
			} else {
				toastStore.info(toastMessage, 4500);
				console.log("[NotificationSocket] Info toast shown:", notification.type);
			}
		});
		socket.value = newSocket;
	}
	watch(() => authStore.isAuthenticated, (authenticated) => {
		if (authenticated && authStore.token) connect();
		else disconnect();
	});
	function dismissUrgentAlert() {
		urgentAlert.value = null;
	}
	return {
		isConnected: readonly(isConnected),
		latestNotification: readonly(latestNotification),
		urgentAlert: readonly(urgentAlert),
		connect,
		disconnect,
		dismissUrgentAlert
	};
}
//#endregion
//#region app/app.vue?vue&type=script&setup=true&lang.ts
var app_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "app",
	__ssrInlineRender: true,
	setup(__props) {
		useNotificationSocket();
		return (_ctx, _push, _parent, _attrs) => {
			const _component_NuxtRouteAnnouncer = ServerPlaceholder;
			const _component_NuxtLayout = nuxt_layout_default;
			const _component_NuxtPage = page_default;
			_push(`<div${ssrRenderAttrs(_attrs)}>`);
			_push(ssrRenderComponent(_component_NuxtRouteAnnouncer, null, null, _parent));
			_push(ssrRenderComponent(_component_NuxtLayout, null, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent, _scopeId));
					else return [createVNode(_component_NuxtPage)];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
//#endregion
//#region app/app.vue
var _sfc_setup$2 = app_vue_vue_type_script_setup_true_lang_default.setup;
app_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var app_default = app_vue_vue_type_script_setup_true_lang_default;
//#endregion
//#region node_modules/nuxt/dist/app/components/nuxt-error-page.vue
var _sfc_main$1 = {
	__name: "nuxt-error-page",
	__ssrInlineRender: true,
	props: { error: Object },
	setup(__props) {
		const _error = __props.error;
		const status = Number(_error.statusCode || 500);
		const is404 = status === 404;
		const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
		const description = _error.message || _error.toString();
		const stack = void 0;
		const _Error404 = defineAsyncComponent(() => import('../build/error-404-MU-Piz-I.mjs'));
		const _Error = defineAsyncComponent(() => import('../build/error-500-WSZdJful.mjs'));
		const ErrorTemplate = is404 ? _Error404 : _Error;
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({
				status: unref(status),
				statusText: unref(statusText),
				statusCode: unref(status),
				statusMessage: unref(statusText),
				description: unref(description),
				stack: unref(stack)
			}, _attrs), null, _parent));
		};
	}
};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
//#endregion
//#region virtual:nuxt:node_modules%2F.cache%2Fnuxt%2F.nuxt%2Fisland-renderer.mjs
var IslandRenderer = () => null;
//#endregion
//#region node_modules/nuxt/dist/app/components/nuxt-root.vue
var _sfc_main = {
	__name: "nuxt-root",
	__ssrInlineRender: true,
	setup(__props) {
		const nuxtApp = useNuxtApp();
		nuxtApp.deferHydration();
		nuxtApp.ssrContext.url;
		const SingleRenderer = false;
		provide(PageRouteSymbol, useRoute());
		nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
		const error = useError();
		const abortRender = error.value && !nuxtApp.ssrContext.error;
		function invokeAppErrorHandler(err, target, info) {
			const errorHandler = nuxtApp.vueApp.config.errorHandler;
			if (errorHandler && !errorHandler.__nuxt_default) try {
				errorHandler(err, target, info);
			} catch (handlerError) {
				console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
			}
		}
		onErrorCaptured((err, target, info) => {
			nuxtApp.hooks.callHook("vue:error", err, target, info)?.catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
			{
				const p = nuxtApp.runWithContext(() => showError(err));
				onServerPrefetch(() => p);
				invokeAppErrorHandler(err, target, info);
				return false;
			}
		});
		const islandContext = nuxtApp.ssrContext.islandContext;
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderSuspense(_push, {
				default: () => {
					if (unref(abortRender)) _push(`<div></div>`);
					else if (unref(error)) _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
					else if (unref(islandContext)) _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
					else if (unref(SingleRenderer)) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
					else _push(ssrRenderComponent(unref(app_default), null, null, _parent));
				},
				_: 1
			});
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-root.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
//#region node_modules/nuxt/dist/app/entry.js
var entry$1 = async function createNuxtAppServer(ssrContext) {
	const vueApp = createApp(_sfc_main);
	const nuxt = createNuxtApp({
		vueApp,
		ssrContext
	});
	try {
		await applyPlugins(nuxt, virtual_nuxt_node_modules_2F_cache_2Fnuxt_2F_nuxt_2Fplugins_server_default);
		await nuxt.hooks.callHook("app:created", vueApp);
	} catch (error) {
		await nuxt.hooks.callHook("app:error", error);
		nuxt.payload.error ||= createError$1(error);
	}
	if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) throw new Error("skipping render");
	return vueApp;
};
var entry_default = ((ssrContext) => entry$1(ssrContext));

const entry = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: entry_default
}, Symbol.toStringTag, { value: 'Module' }));

export { ApiError as A, BaseApiClient as B, FileUploadConfig as F, NuxtLink as N, UserTypeConfig as U, useTranslation as a, useRouter as b, useToastStore as c, useRuntimeConfig as d, useAuthStore as e, useNotificationSocket as f, useNotificationBadge as g, notificationApi as h, useNuxtApp as i, useAppConfig as j, useAsyncData as k, useHead$1 as l, AdminUserRole as m, navigateTo as n, entry as o, setInterval as s, useRoute as u };
//# sourceMappingURL=entry.mjs.map
