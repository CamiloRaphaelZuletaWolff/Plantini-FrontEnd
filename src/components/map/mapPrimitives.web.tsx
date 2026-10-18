/**
 * Web implementation of the map primitives (see mapPrimitives.tsx).
 *
 * Implements the subset of the react-native-maps API this app uses on top of
 * Leaflet + OpenStreetMap tiles (free, no API key):
 *   - MapView: initialRegion, onPress, onRegionChangeComplete, scrollEnabled,
 *     zoomEnabled, showsUserLocation, pointerEvents and the ref methods
 *     animateToRegion / fitToCoordinates.
 *   - Marker: coordinate, custom children as the pin, title/description,
 *     onPress, draggable + onDragEnd, anchor and the ref method showCallout.
 *   - Callout: children rendered inside a Leaflet popup, onPress, tooltip.
 *   - Polyline: coordinates, strokeColor, strokeWidth, lineDashPattern.
 *
 * Pins and callouts are regular React Native (react-native-web) trees rendered
 * through React portals into the DOM nodes Leaflet positions, so the native
 * marker components work unchanged.
 */
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import React, {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ReactElement, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = undefined;

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Region extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

interface CoordinateEvent {
  nativeEvent: { coordinate: LatLng };
}

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
const DEFAULT_CENTER: L.LatLngTuple = [-16.5, -68.15]; // La Paz
const DEFAULT_ZOOM = 12;

// Leaflet's default styles add a white box to divIcons and padding to popups;
// our pins/callouts are styled React Native views, so neutralise those.
const EXTRA_CSS = `
.rnmaps-web-marker { background: transparent; border: none; }
.rnmaps-web-pin { position: absolute; left: 0; top: 0; width: max-content; cursor: pointer; }
.rnmaps-web-callout .leaflet-popup-content-wrapper { padding: 0; background: transparent; box-shadow: none; }
.rnmaps-web-callout .leaflet-popup-content { margin: 0; width: auto !important; }
.rnmaps-web-callout .leaflet-popup-tip-container { display: none; }
.rnmaps-web-callout .leaflet-popup-close-button { display: none; }
`;

let extraCssInjected = false;
function injectExtraCss() {
  if (extraCssInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.setAttribute('data-rnmaps-web', '');
  style.textContent = EXTRA_CSS;
  document.head.appendChild(style);
  extraCssInjected = true;
}

const toLatLng = (c: LatLng): L.LatLngTuple => [c.latitude, c.longitude];

const toCoordinateEvent = (latlng: L.LatLng): CoordinateEvent => ({
  nativeEvent: { coordinate: { latitude: latlng.lat, longitude: latlng.lng } },
});

const regionToBounds = (r: Region): L.LatLngBounds =>
  L.latLngBounds(
    [r.latitude - r.latitudeDelta / 2, r.longitude - r.longitudeDelta / 2],
    [r.latitude + r.latitudeDelta / 2, r.longitude + r.longitudeDelta / 2]
  );

const mapToRegion = (map: L.Map): Region => {
  const bounds = map.getBounds();
  const center = map.getCenter();
  return {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta: bounds.getNorth() - bounds.getSouth(),
    longitudeDelta: bounds.getEast() - bounds.getWest(),
  };
};

const MapContext = createContext<L.Map | null>(null);

// ─── MapView ────────────────────────────────────────────────────────────────

export interface MapViewHandle {
  animateToRegion: (region: Region, duration?: number) => void;
  fitToCoordinates: (
    coordinates: LatLng[],
    options?: { edgePadding?: { top: number; right: number; bottom: number; left: number }; animated?: boolean }
  ) => void;
}

interface MapViewProps {
  style?: StyleProp<ViewStyle>;
  initialRegion?: Region;
  region?: Region;
  onPress?: (event: CoordinateEvent) => void;
  onRegionChangeComplete?: (region: Region) => void;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  showsUserLocation?: boolean;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  children?: ReactNode;
  // Native-only props, accepted and ignored on web.
  provider?: unknown;
  showsMyLocationButton?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
}

const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(props, ref) {
  const { style, pointerEvents, children } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const [map, setMap] = useState<L.Map | null>(null);

  // Create the Leaflet map once. Interaction flags are read at creation time,
  // like react-native-maps' initial* props.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    injectExtraCss();

    const { scrollEnabled = true, zoomEnabled = true } = propsRef.current;
    const instance = L.map(el, {
      zoomControl: zoomEnabled,
      dragging: scrollEnabled,
      scrollWheelZoom: zoomEnabled,
      doubleClickZoom: zoomEnabled,
      touchZoom: zoomEnabled,
      boxZoom: zoomEnabled,
      keyboard: scrollEnabled,
    });
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(instance);

    const initial = propsRef.current.region ?? propsRef.current.initialRegion;
    instance.setView(initial ? toLatLng(initial) : DEFAULT_CENTER, DEFAULT_ZOOM);

    // The container may still be 0×0 here (tabs, modals); fit the initial
    // region once it has a real size, and keep Leaflet in sync on resizes.
    let pendingRegion: Region | undefined = initial;
    const syncSize = () => {
      instance.invalidateSize();
      if (pendingRegion && el.clientWidth > 0 && el.clientHeight > 0) {
        instance.fitBounds(regionToBounds(pendingRegion), { animate: false });
        pendingRegion = undefined;
      }
    };
    syncSize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
    observer?.observe(el);

    instance.on('click', (e: L.LeafletMouseEvent) => {
      propsRef.current.onPress?.(toCoordinateEvent(e.latlng));
    });
    instance.on('moveend', () => {
      propsRef.current.onRegionChangeComplete?.(mapToRegion(instance));
    });

    setMap(instance);
    return () => {
      observer?.disconnect();
      instance.remove();
      setMap(null);
    };
  }, []);

  // Blue dot for the user's position, only if geolocation was already granted
  // (the app's own permission flow decides when to prompt).
  const showsUserLocation = !!props.showsUserLocation;
  useEffect(() => {
    if (!map || !showsUserLocation || typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }
    let watchId: number | null = null;
    let dot: L.CircleMarker | null = null;
    let cancelled = false;

    const startWatching = () => {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const latlng: L.LatLngTuple = [pos.coords.latitude, pos.coords.longitude];
          if (!dot) {
            dot = L.circleMarker(latlng, {
              radius: 8,
              color: '#FFFFFF',
              weight: 3,
              fillColor: '#007AFF',
              fillOpacity: 1,
              interactive: false,
            }).addTo(map);
          } else {
            dot.setLatLng(latlng);
          }
        },
        () => undefined,
        { enableHighAccuracy: false, maximumAge: 60_000 }
      );
    };

    // `navigator.permissions` is missing in some older browsers.
    const permissions: Permissions | undefined = navigator.permissions;
    if (permissions?.query) {
      permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          if (!cancelled && status.state === 'granted') startWatching();
        })
        .catch(() => undefined);
    }

    return () => {
      cancelled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      dot?.remove();
    };
  }, [map, showsUserLocation]);

  useImperativeHandle(
    ref,
    () => ({
      animateToRegion: (region, duration = 500) => {
        map?.flyToBounds(regionToBounds(region), { duration: Math.max(duration, 1) / 1000 });
      },
      fitToCoordinates: (coordinates, options) => {
        if (!map || coordinates.length === 0) return;
        const p = options?.edgePadding;
        map.fitBounds(L.latLngBounds(coordinates.map(toLatLng)), {
          paddingTopLeft: p ? [p.left, p.top] : [40, 40],
          paddingBottomRight: p ? [p.right, p.bottom] : [40, 40],
          animate: options?.animated ?? true,
        });
      },
    }),
    [map]
  );

  return (
    <View style={[styles.mapRoot, style]} pointerEvents={pointerEvents}>
      {/* zIndex 0 creates a stacking context so Leaflet's internal z-indexes
          (up to 1000) never cover the app's floating buttons. */}
      <div ref={containerRef} style={leafletContainerStyle} />
      <MapContext.Provider value={map}>{map ? children : null}</MapContext.Provider>
    </View>
  );
});

export default MapView;

// ─── Callout ────────────────────────────────────────────────────────────────

interface CalloutProps {
  tooltip?: boolean;
  onPress?: () => void;
  children?: ReactNode;
}

/** Marker reads this element's props; it renders nothing by itself. */
export function Callout(_props: CalloutProps): null {
  return null;
}

// ─── Marker ─────────────────────────────────────────────────────────────────

export interface MarkerHandle {
  showCallout: () => void;
  hideCallout: () => void;
  redraw: () => void;
}

interface MarkerProps {
  coordinate: LatLng;
  title?: string;
  description?: string;
  onPress?: (event: CoordinateEvent) => void;
  draggable?: boolean;
  onDragEnd?: (event: CoordinateEvent) => void;
  /** Point of the pin that sits on the coordinate (0–1). Default bottom-center. */
  anchor?: { x: number; y: number };
  children?: ReactNode;
  // Native-only, ignored on web.
  tracksViewChanges?: boolean;
}

export const Marker = forwardRef<MarkerHandle, MarkerProps>(function Marker(props, ref) {
  const { coordinate, title, description, draggable = false, anchor, children } = props;
  const map = useContext(MapContext);
  const propsRef = useRef(props);
  propsRef.current = props;
  const markerRef = useRef<L.Marker | null>(null);

  // DOM nodes Leaflet positions; React renders into them via portals.
  const [pinEl] = useState(() => {
    const el = document.createElement('div');
    el.className = 'rnmaps-web-pin';
    return el;
  });
  const [popupEl] = useState(() => document.createElement('div'));

  // Split <Callout> from the pin content.
  let callout: ReactElement<CalloutProps> | null = null;
  const pinChildren: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Callout) {
      callout = child as ReactElement<CalloutProps>;
    } else if (child !== null && child !== undefined && child !== false) {
      pinChildren.push(child);
    }
  });
  const calloutEl = callout as ReactElement<CalloutProps> | null;
  const calloutPropsRef = useRef<CalloutProps | null>(null);
  calloutPropsRef.current = calloutEl ? calloutEl.props : null;

  const hasPopup = !!calloutEl || !!title;
  const isTooltip = !!calloutEl?.props.tooltip;
  const anchorX = anchor?.x ?? 0.5;
  const anchorY = anchor?.y ?? 1;

  useEffect(() => {
    if (!map) return;

    pinEl.style.transform = `translate(${-anchorX * 100}%, ${-anchorY * 100}%)`;
    const icon = L.divIcon({
      html: pinEl,
      className: 'rnmaps-web-marker',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const { latitude, longitude } = propsRef.current.coordinate;
    const marker = L.marker([latitude, longitude], {
      icon,
      draggable,
      riseOnHover: true,
      bubblingMouseEvents: false,
    }).addTo(map);

    if (hasPopup) {
      marker.bindPopup(popupEl, {
        className: isTooltip ? 'rnmaps-web-callout' : '',
        maxWidth: 320,
        minWidth: isTooltip ? 0 : 120,
        autoPanPadding: [24, 24],
      });
      // Open the popup just above the pin, whatever its rendered height.
      marker.on('popupopen', (e: L.PopupEvent) => {
        const offsetY = -pinEl.offsetHeight * anchorY + (isTooltip ? -4 : 7);
        e.popup.options.offset = L.point(0, offsetY);
        e.popup.update();
      });
    }

    marker.on('click', (e: L.LeafletMouseEvent) => {
      propsRef.current.onPress?.(toCoordinateEvent(e.latlng));
    });
    marker.on('dragend', () => {
      propsRef.current.onDragEnd?.(toCoordinateEvent(marker.getLatLng()));
    });

    // Leaflet stops click propagation inside popups, so listen on the DOM
    // node directly instead of relying on React's root event delegation.
    const handleCalloutClick = () => calloutPropsRef.current?.onPress?.();
    popupEl.addEventListener('click', handleCalloutClick);

    markerRef.current = marker;
    return () => {
      popupEl.removeEventListener('click', handleCalloutClick);
      marker.remove();
      markerRef.current = null;
    };
  }, [map, pinEl, popupEl, draggable, hasPopup, isTooltip, anchorX, anchorY]);

  // Keep the marker in place when the coordinate prop changes.
  useEffect(() => {
    markerRef.current?.setLatLng([coordinate.latitude, coordinate.longitude]);
  }, [coordinate.latitude, coordinate.longitude]);

  useImperativeHandle(
    ref,
    () => ({
      showCallout: () => markerRef.current?.openPopup(),
      hideCallout: () => markerRef.current?.closePopup(),
      redraw: () => undefined,
    }),
    []
  );

  let popupContent: ReactNode = null;
  if (calloutEl) {
    popupContent = calloutEl.props.children;
  } else if (title) {
    popupContent = (
      <View style={styles.defaultCallout}>
        <Text style={styles.defaultCalloutTitle}>{title}</Text>
        {description ? <Text style={styles.defaultCalloutDescription}>{description}</Text> : null}
      </View>
    );
  }

  return (
    <>
      {createPortal(
        pinChildren.length > 0 ? pinChildren : <View style={styles.defaultPin} />,
        pinEl
      )}
      {popupContent ? createPortal(popupContent, popupEl) : null}
    </>
  );
});

// ─── Polyline ───────────────────────────────────────────────────────────────

interface PolylineProps {
  coordinates: LatLng[];
  strokeColor?: string;
  strokeWidth?: number;
  lineDashPattern?: number[];
}

export function Polyline({
  coordinates,
  strokeColor = '#000000',
  strokeWidth = 1,
  lineDashPattern,
}: PolylineProps): null {
  const map = useContext(MapContext);
  const coordsKey = coordinates.map((c) => `${c.latitude},${c.longitude}`).join('|');
  const dashKey = lineDashPattern?.join(' ');

  useEffect(() => {
    if (!map || coordinates.length < 2) return;
    const line = L.polyline(coordinates.map(toLatLng), {
      color: strokeColor,
      weight: strokeWidth,
      dashArray: dashKey,
      interactive: false,
    }).addTo(map);
    return () => {
      line.remove();
    };
    // coordsKey captures the coordinate values (the array identity may change
    // on every render), so `coordinates` itself is intentionally not a dep.
  }, [map, coordsKey, strokeColor, strokeWidth, dashKey]);

  return null;
}

const leafletContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 0,
};

const styles = StyleSheet.create({
  mapRoot: {
    position: 'relative',
    overflow: 'hidden',
  },
  defaultPin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  defaultCallout: {
    paddingVertical: 2,
    maxWidth: 260,
  },
  defaultCalloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  defaultCalloutDescription: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
});
