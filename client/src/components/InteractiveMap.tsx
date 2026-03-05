import { useEffect, useRef } from "react";
import L from "leaflet";
import { Event } from "@shared/types";

interface InteractiveMapProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventClick: (event: Event) => void;
}

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function InteractiveMap({ events, selectedEvent, onEventClick }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Tradução de tipos de evento
  const getEventTypeLabel = (type: string): string => {
    switch (type) {
      case "aéreo":
        return "Aéreo";
      case "terrestre":
        return "Terrestre";
      case "marítimo":
        return "Marítimo";
      default:
        return type;
    }
  };

  // Tradução de países
  const getCountryLabel = (country: string): string => {
    switch (country) {
      case "iran":
        return "Irã";
      case "israel":
        return "Israel";
      default:
        return country;
    }
  };

  // Get color based on event type
  const getMarkerColor = (type: string): string => {
    switch (type) {
      case "aéreo":
        return "#ef4444"; // Red
      case "terrestre":
        return "#f97316"; // Orange
      case "marítimo":
        return "#3b82f6"; // Blue
      default:
        return "#6b7280"; // Gray
    }
  };

  // Create custom marker icon
  const createMarkerIcon = (color: string) => {
    return L.divIcon({
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg" style="background-color: ${color};">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `,
      className: "custom-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  // Initialize map - only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = L.map(mapContainer.current, {
        preferCanvas: true,
      }).setView([32.5, 35.5], 6);

      // Add dark mode tile layer with Portuguese labels
      tileLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">Contribuidores do OpenStreetMap</a>',
        maxZoom: 19,
        minZoom: 3,
      }).addTo(map.current);

      // Invalidate size after a short delay to ensure proper rendering
      setTimeout(() => {
        map.current?.invalidateSize();
      }, 100);
    } catch (error) {
      console.error("Erro ao inicializar mapa:", error);
    }

    return () => {
      if (map.current) {
        try {
          map.current.remove();
          map.current = null;
          tileLayerRef.current = null;
        } catch (error) {
          console.error("Erro ao limpar mapa:", error);
        }
      }
    };
  }, []);

  // Update markers when events change
  useEffect(() => {
    if (!map.current) return;

    try {
      // Clear old markers
      markersRef.current.forEach((marker) => {
        try {
          map.current?.removeLayer(marker);
        } catch (error) {
          console.error("Erro ao remover marcador:", error);
        }
      });
      markersRef.current.clear();

      // Add new markers
      events.forEach((event) => {
        try {
          const lat = parseFloat(event.latitude);
          const lon = parseFloat(event.longitude);

          if (isNaN(lat) || isNaN(lon)) return;

          const color = getMarkerColor(event.type);
          const marker = L.marker([lat, lon], {
            icon: createMarkerIcon(color),
          })
            .bindPopup(`
              <div class="p-3 text-sm">
                <h3 class="font-bold text-base mb-2">${event.locationName}</h3>
                <p class="mb-1"><strong>Tipo:</strong> ${getEventTypeLabel(event.type)}</p>
                <p class="mb-1"><strong>País:</strong> ${getCountryLabel(event.country)}</p>
                <p class="mb-1"><strong>Data:</strong> ${new Date(event.eventDate).toLocaleString("pt-BR")}</p>
                <p class="mb-2"><strong>Descrição:</strong> ${event.description}</p>
                <p class="mb-1"><strong>Fonte:</strong> <a href="${event.sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${event.sourceName}</a></p>
              </div>
            `)
            .on("click", () => {
              onEventClick(event);
            })
            .addTo(map.current!);

          markersRef.current.set(event.id, marker);

          // Add ping animation for new events (created in last 5 minutes)
          const eventAge = Date.now() - new Date(event.createdAt).getTime();
          if (eventAge < 5 * 60 * 1000) {
            const pingElement = document.createElement("div");
            pingElement.className = "marker-ping";
            pingElement.style.cssText = `
              position: absolute;
              width: 32px;
              height: 32px;
              border: 2px solid ${color};
              border-radius: 50%;
              pointer-events: none;
              top: 0;
              left: 0;
            `;
            const markerElement = marker.getElement();
            if (markerElement) {
              markerElement.appendChild(pingElement);
            }
          }
        } catch (error) {
          console.error("Erro ao adicionar marcador:", error);
        }
      });

      // Highlight selected event
      if (selectedEvent && markersRef.current.has(selectedEvent.id)) {
        try {
          const selectedMarker = markersRef.current.get(selectedEvent.id);
          selectedMarker?.openPopup();
        } catch (error) {
          console.error("Erro ao abrir popup:", error);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar marcadores:", error);
    }
  }, [events, selectedEvent, onEventClick]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg overflow-hidden border border-border bg-card"
      style={{ minHeight: "600px" }}
    />
  );
}
