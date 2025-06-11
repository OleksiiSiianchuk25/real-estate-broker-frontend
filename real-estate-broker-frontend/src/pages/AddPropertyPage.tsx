import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { SelectChangeEvent } from "@mui/material/Select";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Налаштовуємо кастомний маркер (за потреби)
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Компонент для вибору локації на карті
const LocationPicker = ({
  setCoordinates,
  coordinates,
}: {
  setCoordinates: (coords: { lat: number; lng: number }) => void;
  coordinates: { lat: number; lng: number } | null;
}) => {
  useMapEvents({
    click(e) {
      setCoordinates(e.latlng);
    },
  });
  return coordinates ? <Marker position={coordinates} icon={customIcon} /> : null;
};

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    address: "",
    imageUrl: "",
    status: "",
    type: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>, child: React.ReactNode) => {
    const name = e.target.name as string;
    setFormData({ ...formData, [name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    // Якщо користувач вибрав координати, оновлюємо formData
    if (mapCoordinates) {
      setFormData((prev) => ({
        ...prev,
        latitude: mapCoordinates.lat.toString(),
        longitude: mapCoordinates.lng.toString(),
      }));
    }
    try {
      const response = await api.post(
        "/properties",
        {
          ...formData,
          latitude: mapCoordinates ? mapCoordinates.lat : formData.latitude,
          longitude: mapCoordinates ? mapCoordinates.lng : formData.longitude,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccess("Оголошення створено успішно!");
      navigate(`/property/${response.data.id}`);
    } catch (err) {
      setError("Помилка створення оголошення");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Додати нове оголошення
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <TextField
          label="Назва"
          name="title"
          fullWidth
          margin="normal"
          value={formData.title}
          onChange={handleChange}
        />
        <TextField
          label="Опис"
          name="description"
          fullWidth
          margin="normal"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
        />
        <TextField
          label="Ціна"
          name="price"
          fullWidth
          margin="normal"
          value={formData.price}
          onChange={handleChange}
        />
        <TextField
          label="Місто"
          name="city"
          fullWidth
          margin="normal"
          value={formData.city}
          onChange={handleChange}
        />
        <TextField
          label="Адреса"
          name="address"
          fullWidth
          margin="normal"
          value={formData.address}
          onChange={handleChange}
        />
        <TextField
          label="URL зображення"
          name="imageUrl"
          fullWidth
          margin="normal"
          value={formData.imageUrl}
          onChange={handleChange}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="status-label">Статус</InputLabel>
          <Select
            labelId="status-label"
            name="status"
            value={formData.status}
            onChange={handleSelectChange}
            label="Статус"
          >
            <MenuItem value="">
              <em>Виберіть статус</em>
            </MenuItem>
            <MenuItem value="FOR_SALE">Продається</MenuItem>
            <MenuItem value="FOR_RENT">Оренда</MenuItem>
            <MenuItem value="SOLD">Продано</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="type-label">Тип</InputLabel>
          <Select
            labelId="type-label"
            name="type"
            value={formData.type}
            onChange={handleSelectChange}
            label="Тип"
          >
            <MenuItem value="">
              <em>Виберіть тип</em>
            </MenuItem>
            <MenuItem value="APARTMENT">Квартира</MenuItem>
            <MenuItem value="HOUSE">Будинок</MenuItem>
          </Select>
        </FormControl>

        {/* Замість полів для Latitude і Longitude додаємо карту */}
        <Box mt={2}>
          <Typography variant="subtitle1">
            Оберіть локацію на карті (натисніть, щоб поставити маркер)
          </Typography>
          <Box sx={{ height: "300px", width: "100%", mt: 1 }}>
            <MapContainer
              center={[49.2329, 28.4773]} // Початковий центр карти; змініть за потреби
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker setCoordinates={setMapCoordinates} coordinates={mapCoordinates} />
            </MapContainer>
          </Box>
          {mapCoordinates && (
            <Typography variant="body2" mt={1}>
              Вибрані координати: Latitude: {mapCoordinates.lat}, Longitude: {mapCoordinates.lng}
            </Typography>
          )}
        </Box>

        <Box mt={2} textAlign="center">
          {loading ? <CircularProgress /> : (
            <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
              Створити оголошення
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default AddPropertyPage;
