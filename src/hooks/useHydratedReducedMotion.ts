'use client';

import { useSyncExternalStore } from 'react';
import { useReducedMotion } from 'motion/react';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Device preferences are unknown to the server. Keep the initial hydrated
// markup identical, then apply Motion's preference to controls and transforms.
export default function useHydratedReducedMotion() {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const reducedMotion = useReducedMotion();
  return hydrated && !!reducedMotion;
}
