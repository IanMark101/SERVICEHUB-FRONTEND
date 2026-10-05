# particles.js 2.0.0

Official runtime from https://github.com/VincentGarreau/particles.js/blob/master/particles.js, retrieved October 4, 2026. The source's version header is 2.0.0. Served locally to avoid a runtime CDN dependency. Unmodified source; original author notice and MIT license retained.

Used by `src/components/ui/particles-bg.tsx`, adapted from the user-installed 21st.dev component. The wrapper disables library-managed resize, uses scoped observers, and removes only its own canvas and animation frames. Scoped listeners on the containing surface update canvas-local pointer coordinates for grab connections and add four particles on background clicks, without intercepting links or buttons. It deliberately avoids `destroypJS()`, which clears the global instance registry.
