// src/pages/MapPage.tsx
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayerGroup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
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
import "leaflet/dist/leaflet.css";

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

function Recenter({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  map.setView([lat, lng], zoom);
  return null;
}

const charMap: Record<string, string> = {
  б: "b", Б: "b",
  в: "v", В: "v",
  г: "g", Г: "g", ґ: "g", Ґ: "g",
  д: "d", Д: "d",
  е: "e", Е: "e", є: "e", Є: "e",
  ж: "zh", Ж: "zh",
  з: "z", З: "z",
  и: "i", И: "i", і: "i", І: "i", ї: "i", Ї: "i", й: "i", Й: "i",
  к: "k", К: "k",
  л: "l", Л: "l",
  м: "m", М: "m",
  н: "n", Н: "n",
  о: "o", О: "o",
  п: "p", П: "p",
  р: "r", Р: "r",
  с: "s", С: "s",
  т: "t", Т: "t",
  у: "u", У: "u",
  ф: "f", Ф: "f",
  х: "kh", Х: "kh",
  ц: "ts", Ц: "ts",
  ч: "ch", Ч: "ch",
  ш: "sh", Ш: "sh",
  щ: "shch", Щ: "shch",
  ю: "yu", Ю: "yu",
  я: "ya", Я: "ya",
  ь: "", Ь: "",
  ъ: "", Ъ: "",
};
function normalize(str: string) {
  return str
    .split("")
    .map((c) => charMap[c] ?? c)
    .join("")
    .toLowerCase();
}

const MapPage: React.FC = () => {
  const theme = useTheme();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [streetFilter, setStreetFilter] = useState("");
  const [houseFilter, setHouseFilter] = useState("");
  const [panTo, setPanTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);

  useEffect(() => {
    api
      .get<Property[]>("/properties")
      .then((res) => {
        setProperties(res.data);
        setFiltered(res.data);
      })
      .catch(console.error);
  }, []);

  const applyFilters = async () => {
    const normCity = normalize(cityFilter);
    const normStreet = normalize(streetFilter);
    const normHouse = normalize(houseFilter);

    let result = properties.filter((p) => {
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

        <LayerGroup>
          {filtered.map((p) => (
            <Marker
              key={p.id}
              position={[p.latitude, p.longitude]}
              icon={propertyIcon}
            >
              <Popup>
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    style={{
                      width: "150px",
                      height: "auto",
                      display: "block",
                      margin: "0 auto 8px",
                    }}
                  />
                )}
                <Typography variant="h6" gutterBottom>
                  {p.title}
                </Typography>
                <Box mb={1}>
                  <Typography
                    component="span"
                    sx={{ fontSize: "1.1rem", fontWeight: "bold" }}
                  >
                    Статус:
                  </Typography>{" "}
                  <Typography
                    component="span"
                    sx={{ fontSize: "1.1rem", color: "primary.main" }}
                  >
                    {statusLabels[p.status] ?? p.status}
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  to={`/property/${p.id}`}
                  variant="contained"
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: "primary.main",
                    "&:hover": { backgroundColor: "primary.dark" },
                    color: "#fff !important",
                  }}
                >
                  Детальніше
                </Button>
              </Popup>
            </Marker>
          ))}

          {!hasHousePoi && panTo && (
            <Marker position={[panTo.lat, panTo.lng]} icon={houseIcon}>
              <Popup>
                <Typography>Вказаний будинок</Typography>
              </Popup>
            </Marker>
          )}
        </LayerGroup>
      </MapContainer>
    </>
  );
};

export default MapPage;
