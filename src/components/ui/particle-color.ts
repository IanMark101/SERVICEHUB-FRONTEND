/** particles.js 2 expects hex, while CSS tokens can contain color-mix(), rgb(), etc. */
export function createParticleColorResolver() {
  let context: CanvasRenderingContext2D | null | undefined;

  return (value: string, fallback: string): string => {
    const color = value.trim();
    if (/^#[\da-f]{6}$/i.test(color)) return color;
    if (/^#[\da-f]{3}$/i.test(color)) {
      return `#${[...color.slice(1)].map((channel) => channel.repeat(2)).join('')}`;
    }
    if (!color) return fallback;

    // Let the browser parse modern CSS colors, then read one sRGB pixel.
    // This runs only at initialization/theme changes, never in the animation loop.
    if (context === undefined) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      context = canvas.getContext('2d', { colorSpace: 'srgb', willReadFrequently: true });
    }
    if (!context) return fallback;

    // Invalid fillStyle assignments are ignored. Two sentinels distinguish them
    // from valid black/white colors without depending on CSS.supports().
    context.fillStyle = '#000000';
    context.fillStyle = color;
    const parsed = context.fillStyle;
    context.fillStyle = '#ffffff';
    context.fillStyle = color;
    if (context.fillStyle !== parsed) return fallback;

    context.clearRect(0, 0, 1, 1);
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
    if (!alpha) return fallback;
    return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
  };
}
