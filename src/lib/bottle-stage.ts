/** Upright photographic cutouts in a spatial carousel; no invented reverse labels. */
export function bottlePose(distance: number, width: number) {
  const depth = Math.min(Math.abs(distance), 3);
  const x =
    Math.sign(distance) *
    Math.min(Math.abs(distance), 2.5) *
    Math.min(width * 0.25, 290);
  const angle = Math.max(-32, Math.min(32, -distance * 22));
  return {
    transform: `translate3d(${x}px, ${depth * 10}px, ${-depth * 180}px) rotateY(${angle}deg) scale(${Math.max(0.45, 1 - depth * 0.2)})`,
    opacity: Math.max(0, 1 - Math.max(0, depth - 0.65) * 0.65),
    zIndex: Math.round(100 - depth * 20),
  };
}
