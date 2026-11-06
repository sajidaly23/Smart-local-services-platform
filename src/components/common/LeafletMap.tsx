"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  id: string;
  title: string;
  subtitle?: string;
  coordinates: [number, number]; // [lng, lat]
  price?: number;
  url?: string;
}

interface LeafletMapProps {
  markers?: MapMarker[];
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  interactive?: boolean;
  onLocationSelect?: (coords: [number, number]) => void;
  height?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  markers = [],
  center = [74.3142, 35.9208], // Default to Gilgit [lng, lat]
  zoom = 12,
  interactive = true,
  onLocationSelect,
  height = "380px",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix missing default leaflet marker icons in webpack/next
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // Leaflet uses [lat, lng]
      const lat = center[1];
      const lng = center[0];

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom,
          zoomControl: interactive,
          scrollWheelZoom: interactive,
          dragging: interactive,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersGroupRef.current = markersLayer;
        mapInstanceRef.current = map;

        if (onLocationSelect) {
          map.on("click", (e: any) => {
            const clickedCoords: [number, number] = [e.latlng.lng, e.latlng.lat];
            onLocationSelect(clickedCoords);
          });
        }
      } else {
        mapInstanceRef.current.setView([lat, lng], zoom);
      }

      // Update markers
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();

        markers.forEach((m) => {
          if (!m.coordinates || m.coordinates.length < 2) return;
          const markerLat = m.coordinates[1];
          const markerLng = m.coordinates[0];

          const marker = L.marker([markerLat, markerLng]);
          const popupContent = `
            <div style="font-family: inherit; padding: 4px;">
              <h4 style="font-weight: 700; margin: 0 0 4px 0; color: #1e293b; font-size: 14px;">${m.title}</h4>
              ${m.subtitle ? `<p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px;">${m.subtitle}</p>` : ""}
              ${m.price ? `<p style="font-weight: 600; color: #4f46e5; margin: 0; font-size: 13px;">PKR ${m.price.toLocaleString()}</p>` : ""}
              ${m.url ? `<a href="${m.url}" style="display: inline-block; margin-top: 6px; font-size: 12px; color: #0d9488; text-decoration: underline;">View Service &rarr;</a>` : ""}
            </div>
          `;
          marker.bindPopup(popupContent);
          markersGroupRef.current.addLayer(marker);
        });
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, markers, interactive, onLocationSelect]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%", borderRadius: "0.75rem", overflow: "hidden", zIndex: 10 }}
      className="border border-slate-200 shadow-xs"
    />
  );
};
export default LeafletMap;

