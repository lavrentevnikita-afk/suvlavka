import { _ as _export_sfc, a as __nuxt_component_0 } from './server.mjs';
import { mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
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
  const _component_NuxtLayout = __nuxt_component_0;
  _push(ssrRenderComponent(_component_NuxtLayout, mergeProps({ name: "b2b" }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<section class="space-y-3"${_scopeId}><h1 class="text-xl font-semibold"${_scopeId}>\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437</h1><p class="text-sm text-slate-300"${_scopeId}> \u0412 \u0431\u0443\u0434\u0443\u0449\u0435\u043C \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0442\u0430\u0431\u043B\u0438\u0447\u043D\u044B\u0439 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0431\u044B\u0441\u0442\u0440\u043E\u0433\u043E \u043D\u0430\u0431\u043E\u0440\u0430 \u0437\u0430\u043A\u0430\u0437\u0430 \u043F\u043E \u0430\u0440\u0442\u0438\u043A\u0443\u043B\u0430\u043C. </p></section>`);
      } else {
        return [
          createVNode("section", { class: "space-y-3" }, [
            createVNode("h1", { class: "text-xl font-semibold" }, "\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437"),
            createVNode("p", { class: "text-sm text-slate-300" }, " \u0412 \u0431\u0443\u0434\u0443\u0449\u0435\u043C \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0442\u0430\u0431\u043B\u0438\u0447\u043D\u044B\u0439 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0431\u044B\u0441\u0442\u0440\u043E\u0433\u043E \u043D\u0430\u0431\u043E\u0440\u0430 \u0437\u0430\u043A\u0430\u0437\u0430 \u043F\u043E \u0430\u0440\u0442\u0438\u043A\u0443\u043B\u0430\u043C. ")
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/quick-order.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const quickOrder = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { quickOrder as default };
//# sourceMappingURL=quick-order-kwJLAuFI.mjs.map
