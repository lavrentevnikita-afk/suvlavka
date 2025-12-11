import { _ as __nuxt_component_0 } from './nuxt-link-CqVeI7br.mjs';
import { u as useAsyncData } from './asyncData-3SaHMhLB.mjs';
import { b as useRuntimeConfig } from './server.mjs';
import { defineComponent, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
  async setup(__props) {
    let __temp, __restore;
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "categories",
      () => $fetch("/api/catalog/categories", {
        baseURL: useRuntimeConfig().public.apiBaseUrl
      })
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-3" }, _attrs))}><h1 class="text-xl font-semibold">\u041A\u0430\u0442\u0430\u043B\u043E\u0433</h1><p class="text-sm text-gray-600"> \u0421\u043F\u0438\u0441\u043E\u043A \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 (\u0434\u0430\u043D\u043D\u044B\u0435 \u0441\u0435\u0439\u0447\u0430\u0441 \u0437\u0430\u0433\u043B\u0443\u0448\u0435\u0447\u043D\u044B\u0435 \u0441 backend NestJS). </p>`);
      if (unref(pending)) {
        _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="text-sm text-red-500">\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439</div>`);
      } else {
        _push(`<ul class="space-y-2"><!--[-->`);
        ssrRenderList((_a = unref(data)) == null ? void 0 : _a.categories, (category) => {
          _push(`<li>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/catalog/${category.slug}`,
            class: "inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-brand text-sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(category.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(category.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/catalog/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-D-M69wGN.mjs.map
