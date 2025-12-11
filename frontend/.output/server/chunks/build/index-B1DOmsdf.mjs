import { _ as __nuxt_component_0 } from './nuxt-link-CqVeI7br.mjs';
import { b as useRuntimeConfig } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const config = useRuntimeConfig();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div><h1 class="text-2xl font-semibold tracking-tight mb-2"> Souvenir Shop </h1><p class="text-sm text-gray-600 max-w-xl"> \u041F\u0440\u043E\u0441\u0442\u043E\u0439 \u0438 \u0431\u044B\u0441\u0442\u0440\u044B\u0439 \u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442-\u043C\u0430\u0433\u0430\u0437\u0438\u043D \u0441\u0443\u0432\u0435\u043D\u0438\u0440\u043E\u0432 \u0441 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u043E\u0439 \u0440\u043E\u0437\u043D\u0438\u0447\u043D\u044B\u0445 \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u0435\u0439 \u0438 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u043E\u0432 \u043D\u0430 \u043E\u0434\u043D\u043E\u043C \u0441\u0430\u0439\u0442\u0435. </p></div><div class="grid gap-4 md:grid-cols-2"><article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><h2 class="font-semibold mb-1">\u041A\u0430\u0442\u0430\u043B\u043E\u0433</h2><p class="text-sm text-gray-600"> \u041F\u0440\u043E\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u0439\u0442\u0435 \u0442\u043E\u0432\u0430\u0440\u044B, \u0444\u0438\u043B\u044C\u0442\u0440\u0443\u0439\u0442\u0435 \u0438 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0439\u0442\u0435 \u0438\u0445 \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443. </p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/catalog",
        class: "inline-flex mt-3 items-center px-3 py-1.5 rounded-full bg-brand text-white text-xs font-medium"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0442\u0430\u043B\u043E\u0433 `);
          } else {
            return [
              createTextVNode(" \u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0442\u0430\u043B\u043E\u0433 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</article><article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><h2 class="font-semibold mb-1">B2B-\u043A\u0430\u0431\u0438\u043D\u0435\u0442</h2><p class="text-sm text-gray-600"> \u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 \u0438 \u0438\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u043A\u0443\u043F\u043E\u043A \u0434\u043B\u044F \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u043E\u0432, \u0441 \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0446\u0435\u043D\u0430\u043C\u0438. </p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/b2b",
        class: "inline-flex mt-3 items-center px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 B2B `);
          } else {
            return [
              createTextVNode(" \u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 B2B ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</article></div><p class="text-xs text-gray-500"> API: <strong>${ssrInterpolate(unref(config).public.apiBaseUrl)}</strong></p></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B1DOmsdf.mjs.map
