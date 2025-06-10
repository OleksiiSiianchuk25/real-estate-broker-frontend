// src/pages/MapPage.tsx

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Leaflet MarkerCluster plugin
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Link } from "react-router-dom";
import {
  Button,
  Typography,
  Box,
  TextField,
  Paper,
  useTheme,
} from "@mui/material";
import api from "../utils/api";

// Іконки для маркерів
const propertyIcon = new L.Icon({
  iconUrl: require("../assets/icons/location.png"),
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});
const houseIcon = new L.Icon({
  iconUrl: require("../assets/icons/gps.png"),
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  status: "FOR_RENT" | "FOR_SALE" | string;
  imageUrl?: string;
}

const statusLabels: Record<string, string> = {
  FOR_RENT: "Оренда",
  FOR_SALE: "Продаж",
};

// Компонент для переміщення карти
function Recenter({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
}

// Мапа для нормалізації українського тексту
const charMap: Record<string, string> = {
  б: "b", Б: "b", в: "v", В: "v", г: "g", Г: "g", ґ: "g", Ґ: "g",
  д: "d", Д: "d", е: "e", Е: "e", є: "e", Є: "e",
  ж: "zh", Ж: "zh", з: "z", З: "z", и: "i", И: "i",
  і: "i", І: "i", ї: "i", Ї: "i", й: "i", Й: "i",
  к: "k", К: "k", л: "l", Л: "l", м: "m", М: "m",
  н: "n", Н: "n", о: "o", О: "o", п: "p", П: "p",
  р: "r", Р: "r", с: "s", С: "s", т: "t", Т: "t",
  у: "u", У: "u", ф: "f", Ф: "f", х: "kh", Х: "kh",
  ц: "ts", Ц: "ts", ч: "ch", Ч: "ch", ш: "sh", Ш: "sh",
  щ: "shch", Щ: "shch", ю: "yu", Ю: "yu", я: "ya", Я: "ya",
  ь: "", Ь: "", ъ: "", Ъ: "",
};
function normalize(str: string) {
  return str
    .split("")
    .map((c) => charMap[c] ?? c)
    .join("")
    .toLowerCase();
}

// Компонент, що напряму використовує leaflet.markercluster
const ClusterMarkers: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const map = useMap();

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup();

    properties.forEach((p) => {
      const marker = L.marker([p.latitude, p.longitude], { icon: propertyIcon });
      const popupContent = `
        <div style="text-align:center">
          ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.title}" style="width:150px; height:auto; display:block; margin:0 auto 8px;" />` : ''}
          <h3 style="margin:0 0 8px">${p.title}</h3>
          <p style="margin:0 0 8px"><strong>Статус:</strong> ${statusLabels[p.status] ?? p.status}</p>
          <a href="/property/${p.id}" style="color:#1976d2; text-decoration:none">Детальніше</a>
        </div>
      `;
      marker.bindPopup(popupContent);
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, properties]);

  return null;
};

const MapPage: React.FC = () => {
  const theme = useTheme();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [streetFilter, setStreetFilter] = useState("");
  const [houseFilter, setHouseFilter] = useState("");
  const [panTo, setPanTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  // Завантажуємо оголошення
  useEffect(() => {
    api
      .get("/properties")
      .then((res) => {
        const data: Property[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.properties)
          ? res.data.properties
          : [];
        setProperties(data);
        setFiltered(data);
      })
      .catch(console.error);
  }, []);

  // Застосування фільтрів і центрування карти
  const applyFilters = async () => {
    const normCity = normalize(cityFilter);
    const normStreet = normalize(streetFilter);
    const normHouse = normalize(houseFilter);

    const result = properties.filter((p) => {
      const np = normalize(p.address);
      const nc = normalize(p.city);
      if (cityFilter && nc !== normCity) return false;
      if (streetFilter && !np.includes(normStreet)) return false;
      if (houseFilter && !np.includes(normHouse)) return false;
      return true;
    });
    setFiltered(result);

    const parts = [houseFilter, streetFilter, cityFilter].filter(Boolean).join(" ");
    if (!parts) return;
    const query = encodeURIComponent(parts);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`
      );
      const places = (await resp.json()) as Array<{ lat: string; lon: string }>;
      if (places.length) {
        const lat = parseFloat(places[0].lat);
        const lng = parseFloat(places[0].lon);
        const zoom = houseFilter ? 18 : streetFilter ? 16 : 13;
        setPanTo({ lat, lng, zoom });
      }
    } catch (e) {
      console.error("Geocoding error:", e);
    }
  };

  const resetFilters = () => {
    setCityFilter("");
    setStreetFilter("");
    setHouseFilter("");
    setFiltered(properties);
    setPanTo(null);
  };

  const hasHousePoi =
    panTo &&
    filtered.some(
      (p) =>
        Math.abs(p.latitude - panTo.lat) < 1e-4 &&
        Math.abs(p.longitude - panTo.lng) < 1e-4
    );

  return (
    <>
      {/* Панель фільтрів */}
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          top: {
            xs: `calc(${theme.mixins.toolbar.minHeight}px + 8px)`,
            sm: `calc(${theme.mixins.toolbar.minHeight}px + 16px)`,
          },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          p: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          width: { xs: "calc(100% - 16px)", sm: "auto" },
        }}
      >
        <TextField
          label="Місто"
          size="small"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          sx={{ flex: { xs: "1 1 100%", sm: "1 1 120px" } }}
        />
        <TextField
          label="Вулиця"
          size="small"
          value={streetFilter}
          onChange={(e) => setStreetFilter(e.target.value)}
          sx={{ flex: { xs: "1 1 100%", sm: "1 1 120px" } }}
        />
        <TextField
          label="Номер будинку"
          size="small"
          value={houseFilter}
          onChange={(e) => setHouseFilter(e.target.value)}
          sx={{ flex: { xs: "1 1 100%", sm: "1 1 80px" } }}
        />
        <Button variant="contained" onClick={applyFilters}>
          Застосувати
        </Button>
        <Button variant="outlined" onClick={resetFilters}>
          Скинути
        </Button>
      </Paper>

      <MapContainer
        center={[49.8397, 24.0297]}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        {panTo && <Recenter {...panTo} />}
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Кластеризовані маркери */}
        <ClusterMarkers properties={filtered} />

        {/* Маркер вказаного будинку */}
        {!hasHousePoi && panTo && (
          <Marker position={[panTo.lat, panTo.lng]} icon={houseIcon}>
            <Popup>Вказаний будинок</Popup>
          </Marker>
        )}
      </MapContainer>
    </>
  );
};

export default MapPage;
