import { _ as __nuxt_component_0 } from './nuxt-link-CqVeI7br.mjs';
import { u as useRoute, b as useRuntimeConfig } from './server.mjs';
import { defineComponent, computed, withAsyncContext, unref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { u as useAsyncData } from './asyncData-3SaHMhLB.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const id = computed(() => route.params.id);
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      () => `product-${id.value}`,
      () => $fetch(`/api/catalog/products/${id.value}`, {
        baseURL: useRuntimeConfig().public.apiBaseUrl
      }),
      { watch: [id] }
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      if (unref(pending)) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "text-sm text-gray-500" }, _attrs))}> \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0442\u043E\u0432\u0430\u0440\u0430\u2026 </section>`);
      } else if (unref(error)) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "text-sm text-red-500" }, _attrs))}> \u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0442\u043E\u0432\u0430\u0440\u0430 </section>`);
      } else if ((_a = unref(data)) == null ? void 0 : _a.product) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-3" }, _attrs))}><h1 class="text-xl font-semibold">${ssrInterpolate(unref(data).product.name)}</h1><p class="text-sm text-gray-600">${ssrInterpolate(unref(data).product.description)}</p><p class="text-lg font-semibold">${ssrInterpolate(unref(data).product.price)} \u20BD</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/cart",
          class: "inline-flex items-center px-4 py-2 rounded-full bg-brand text-white text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443 (\u0437\u0430\u0433\u043B\u0443\u0448\u043A\u0430) `);
            } else {
              return [
                createTextVNode(" \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443 (\u0437\u0430\u0433\u043B\u0443\u0448\u043A\u0430) ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</section>`);
      } else {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "text-sm text-gray-500" }, _attrs))}> \u0422\u043E\u0432\u0430\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D </section>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/product/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BPtds_px.mjs.map
