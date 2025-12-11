import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
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
  _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-2" }, _attrs))}><h1 class="text-xl font-semibold">\u041A\u043E\u0440\u0437\u0438\u043D\u0430</h1><p class="text-sm text-gray-600"> \u0417\u0434\u0435\u0441\u044C \u0431\u0443\u0434\u0435\u0442 \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u043A\u043E\u0440\u0437\u0438\u043D\u044B. \u041F\u043E\u043A\u0430 \u044D\u0442\u043E \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430-\u0437\u0430\u0433\u043B\u0443\u0448\u043A\u0430. </p></section>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/cart.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const cart = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { cart as default };
//# sourceMappingURL=cart-gkR_nbnF.mjs.map
