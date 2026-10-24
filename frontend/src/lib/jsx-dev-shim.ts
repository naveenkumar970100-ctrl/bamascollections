// Ensure react/jsx-dev-runtime has jsxDEV defined even when NODE_ENV=production
// to prevent SSR crashes if any transformed chunk or dependency references jsxDEV.
try {
  let req: ((id: string) => any) | undefined;
  if (typeof require !== 'undefined') {
    req = require;
  } else {
    const nodeModule = await import('node:module');
    req = nodeModule.createRequire(import.meta.url);
  }
  if (req) {
    const dev = req('react/jsx-dev-runtime');
    const prod = req('react/jsx-runtime');
    if (dev && !dev.jsxDEV && prod?.jsx) {
      dev.jsxDEV = prod.jsx;
      if (dev.default && !dev.default.jsxDEV) {
        dev.default.jsxDEV = prod.jsx;
      }
    }
  }
} catch {
  // Safe no-op in client browser or edge runtimes
}
