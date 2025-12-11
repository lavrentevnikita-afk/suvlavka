import { _ as __nuxt_component_0 } from './nuxt-link-CqVeI7br.mjs';
import { mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
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

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-slate-950 text-slate-50 flex flex-col" }, _attrs))}><header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur"><div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/",
    class: "font-semibold text-sm text-amber-300"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Souvenir B2B`);
      } else {
        return [
          createTextVNode("Souvenir B2B")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<nav class="flex gap-4 text-xs md:text-sm">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/b2b",
    class: "hover:text-amber-300"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`\u0413\u043B\u0430\u0432\u043D\u0430\u044F`);
      } else {
        return [
          createTextVNode("\u0413\u043B\u0430\u0432\u043D\u0430\u044F")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/b2b/quick-order",
    class: "hover:text-amber-300"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437`);
      } else {
        return [
          createTextVNode("\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/b2b/orders",
    class: "hover:text-amber-300"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`\u0417\u0430\u043A\u0430\u0437\u044B`);
      } else {
        return [
          createTextVNode("\u0417\u0430\u043A\u0430\u0437\u044B")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</nav></div></header><main class="flex-1 max-w-6xl mx-auto w-full px-4 py-4">`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</main></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/b2b.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const b2b = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { b2b as default };
//# sourceMappingURL=b2b-DpiYU2_n.mjs.map
