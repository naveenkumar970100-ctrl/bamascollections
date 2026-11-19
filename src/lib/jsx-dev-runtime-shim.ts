import * as jsxRuntime from "react/jsx-runtime";

export const Fragment = jsxRuntime.Fragment;
export const jsxDEV = (jsxRuntime as any).jsx || (jsxRuntime as any).default?.jsx;
export const jsx = (jsxRuntime as any).jsx || (jsxRuntime as any).default?.jsx;
export const jsxs = (jsxRuntime as any).jsxs || (jsxRuntime as any).default?.jsxs;

export default {
  Fragment,
  jsxDEV,
  jsx,
  jsxs,
};
