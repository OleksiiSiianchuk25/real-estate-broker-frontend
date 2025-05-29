// src/pages/PropertyDetailsPage.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  Button,
} from "@mui/material";
import api from "../utils/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ————————————————————————————————————————————————————————
// Підключаємо дефолтні SVG-маркери Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// ————————————————————————————————————————————————————————

interface PropertyDTO {
  id: number;
  title: string;
  description: string;
  price: string;
  city: string;
  imageUrl: string;
  status: string;
  type: string;
  address: string;
  realtorFullName: string;
  realtorPhone: string;
  realtorEmail: string;
  latitude: number;
  longitude: number;
}

function SetViewOnMount({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords, map]);
  return null;
}

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<PropertyDTO>(`/properties/${id}`)
      .then((res) => setProperty(res.data))
      .catch(() => setError("Не вдалося завантажити дані"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!property) return <Alert severity="warning">Оголошення не знайдено</Alert>;

  const handleAddFavorite = async () => {
    try {
      await api.post("/favorites", { propertyId: property.id });
      alert("Додано в закладки");
    } catch {
      alert("Помилка при додаванні в закладки");
    }
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        {property.title}
      </Typography>

      <Card>
        <CardMedia
          component="img"
          height="400"
          image={property.imageUrl}
          alt={property.title}
        />
        <CardContent>
          <Typography variant="h6">Опис</Typography>
          <Typography>{property.description}</Typography>

          <Typography variant="h6" mt={2}>
            Ціна
          </Typography>
          <Typography color="primary">
            {new Intl.NumberFormat("uk-UA", {
              style: "currency",
              currency: "UAH",
              minimumFractionDigits: 0,
            }).format(Number(property.price))}
          </Typography>

          <Typography variant="h6" mt={2}>
            Тип
          </Typography>
          <Typography>
            {property.type === "APARTMENT" ? "Квартира" : "Будинок"}
          </Typography>

          <Typography variant="h6" mt={2}>
            Статус
          </Typography>
          <Typography>
            {property.status === "FOR_SALE"
              ? "Продається"
              : property.status === "FOR_RENT"
              ? "Оренда"
              : "Продано"}
          </Typography>

          <Typography variant="h6" mt={2}>
            Місто
          </Typography>
          <Typography>{property.city}</Typography>

          <Typography variant="h6" mt={2}>
            Адреса
          </Typography>
          <Typography>{property.address}</Typography>

          <Typography variant="h6" mt={2}>
            Контакти рієлтора
          </Typography>
          <Typography>{property.realtorFullName}</Typography>
          <Typography>📞 {property.realtorPhone}</Typography>
          <Typography>✉️ {property.realtorEmail}</Typography>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        color="primary"
        onClick={handleAddFavorite}
        sx={{ mt: 2 }}
      >
        Додати в закладки
      </Button>

      <Box mt={3} sx={{ height: 400 }}>
        <Typography variant="h6" mb={1}>
          Локація на карті
        </Typography>
        <MapContainer
          center={[property.latitude, property.longitude]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <SetViewOnMount coords={[property.latitude, property.longitude]} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={[property.latitude, property.longitude]}
            // без явного icon пропсу — використовується дефолтна іконка, яку ми налаштували вище
          >
            <Popup>{property.title}</Popup>
          </Marker>
        </MapContainer>
      </Box>
    </Container>
  );
}
