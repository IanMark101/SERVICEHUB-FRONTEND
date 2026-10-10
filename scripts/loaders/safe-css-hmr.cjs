/**
 * Next's bundled CSS HMR runtime can finish loading a replacement after React
 * has removed the old stylesheet during navigation or another refresh.
 * Scope this loader to that dev-only module; keep normal CSS replacement intact.
 */
module.exports = function safeCssHmr(source) {
  return source.replace(
    /([A-Za-z_$][\w$]*)\.parentNode\.removeChild\(\1\)/g,
    '$1.parentNode && $1.parentNode.removeChild($1)',
  );
};
