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
} from "@mui/material";
import api from "../utils/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Додаємо кастомний маркер
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Property {
  id: number;
  title: string;
  description: string;
  price: string;
  city: string;
  imageUrl: string;
  status: string;
  type: string;
  address: string;
  realtor: {
    full_name: string;
    phone: string;
    email: string;
  };
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
  

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get<Property>(`/properties/${id}`);
        setProperty(response.data);
      } catch (err) {
        setError("Не вдалося завантажити дані");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!property) return <Alert severity="warning">Оголошення не знайдено</Alert>;

  function SetViewOnMount({ coords }: { coords: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.setView(coords, 13);
    }, [coords, map]);
    return null;
  }

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        {property.title}
      </Typography>

      <Card>
        <CardMedia
          component="img"
          height="400"
          image={property.imageUrl || "https://via.placeholder.com/800x400"}
          alt={property.title}
        />
        <CardContent>
          <Typography variant="h6">Опис</Typography>
          <Typography>{property.description}</Typography>

          <Typography variant="h6" mt={2}>Ціна</Typography>
          <Typography color="primary">
            {new Intl.NumberFormat("uk-UA", {
              style: "currency",
              currency: "UAH",
              minimumFractionDigits: 0,
            }).format(Number(property.price))}
          </Typography>

          <Typography variant="h6" mt={2}>Тип</Typography>
          <Typography>{property.type === "apartment" ? "Квартира" : "Будинок"}</Typography>

          <Typography variant="h6" mt={2}>Статус</Typography>
          <Typography>
            {property.status === "FOR_SALE" ? "Продається" : property.status === "FOR_RENT" ? "Оренда" : "Продано"}
          </Typography>

          <Typography variant="h6" mt={2}>Місто</Typography>
          <Typography>{property.city}</Typography>

          <Typography variant="h6" mt={2}>Адреса</Typography>
          <Typography>{property.address}</Typography>

          <Typography variant="h6" mt={2}>Контакти рієлтора</Typography>
          <Typography>{property.realtor.full_name}</Typography>
          <Typography>📞 {property.realtor.phone}</Typography>
          <Typography>✉️ {property.realtor.email}</Typography>
        </CardContent>
      </Card>

      {/* Карта */}
      <Box mt={3} sx={{ height: "400px" }}>
        <Typography variant="h6" mb={2}>Локація на карті</Typography>
        <MapContainer
          center={[property.latitude, property.longitude]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <SetViewOnMount coords={[property.latitude, property.longitude]} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[property.latitude, property.longitude]} icon={customIcon as L.Icon}>
            <Popup>{property.title}</Popup>
          </Marker>
        </MapContainer>
      </Box>
    </Container>
  );
};

export default PropertyDetailsPage;
