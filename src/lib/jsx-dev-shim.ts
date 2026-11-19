// Ensure react/jsx-dev-runtime has jsxDEV defined even when NODE_ENV=production
// to prevent SSR crashes if any transformed chunk or dependency references jsxDEV.
import * as jsxRuntime from "react/jsx-runtime";

try {
  const jsxFn = (jsxRuntime as any).jsx || (jsxRuntime as any).default?.jsx;
  if (jsxFn) {
    if (typeof (globalThis as any).jsxDEV === "undefined") {
      (globalThis as any).jsxDEV = jsxFn;
    }
    if (typeof process !== "undefined" && process.versions?.node) {
      import("node:module")
        .then(({ createRequire }) => {
          try {
            const req = createRequire(import.meta.url);
            const dev = req("react/jsx-dev-runtime");
            if (dev && !dev.jsxDEV) {
              dev.jsxDEV = jsxFn;
              if (dev.default && !dev.default.jsxDEV) {
                dev.default.jsxDEV = jsxFn;
              }
            }
          } catch {}
        })
        .catch(() => {});
    }
  }
} catch {
  // Safe no-op in client browser or edge runtimes
}
