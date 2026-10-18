/**
 * Map primitives used across the app (MapView, Marker, Callout, Polyline).
 *
 * Native (iOS/Android): re-exports react-native-maps unchanged.
 * Web: Metro resolves `mapPrimitives.web.tsx` instead — a Leaflet +
 * OpenStreetMap implementation of the same subset of the API, because
 * react-native-maps has no web support and breaks `expo export --platform web`.
 *
 * Import map components from here, never from 'react-native-maps' directly
 * (type-only imports are fine: they are erased at build time).
 */
export { default, Marker, Callout, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
export type { Region, LatLng } from 'react-native-maps';
