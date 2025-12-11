import { _ as __nuxt_component_0 } from './nuxt-link-CqVeI7br.mjs';
import { mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
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
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col bg-gray-50" }, _attrs))}><header class="sticky top-0 z-10 bg-white border-b border-gray-200"><div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/",
    class: "font-bold text-lg text-brand"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Souvenir Shop`);
      } else {
        return [
          createTextVNode("Souvenir Shop")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<nav class="hidden md:flex gap-4 text-sm">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/catalog",
    class: "hover:text-brand"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`\u041A\u0430\u0442\u0430\u043B\u043E\u0433`);
      } else {
        return [
          createTextVNode("\u041A\u0430\u0442\u0430\u043B\u043E\u0433")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/b2b",
    class: "opacity-80 hover:text-brand"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`\u0414\u043B\u044F \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u043E\u0432`);
      } else {
        return [
          createTextVNode("\u0414\u043B\u044F \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u043E\u0432")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</nav><div class="flex items-center gap-3 text-sm">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/cart",
    class: "hover:text-brand"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`\u041A\u043E\u0440\u0437\u0438\u043D\u0430`);
      } else {
        return [
          createTextVNode("\u041A\u043E\u0440\u0437\u0438\u043D\u0430")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></div></header><main class="flex-1 max-w-6xl mx-auto w-full px-4 py-4">`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</main><footer class="border-t border-gray-200 bg-gray-50"><div class="max-w-6xl mx-auto px-4 py-3 text-xs text-gray-500 flex justify-between"><span>\xA9 ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} Souvenir Shop</span><span>\u0421\u0442\u0435\u043A: Nuxt 3 + NestJS</span></div></footer></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _default as default };
//# sourceMappingURL=default-D8_WgRLM.mjs.map
