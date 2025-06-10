// src/pages/PropertyDetailsPage.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  TextField,
  List,
  ListItem,
  ListItemText,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import api from "../utils/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Підключення стандартних маркерів Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
  realtorId: number;
  realtorFullName: string;
  realtorPhone: string;
  realtorEmail: string;
  latitude: number;
  longitude: number;
}

interface ReviewDTO {
  id: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Оновлена структура відповіді бекенду
interface RealtorRatingSummary {
  averageRating: number;
  totalRatings: number;
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

  // Відгуки по нерухомості
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  // Нова форма відгуку по нерухомості
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState<number | null>(null);

  // Рейтинг рієлтора
  const [summary, setSummary] = useState<RealtorRatingSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // Стан модального вікна для оцінки рієлтора
  const [openRealtorDialog, setOpenRealtorDialog] = useState(false);
  const [realtorComment, setRealtorComment] = useState("");
  const [realtorRating, setRealtorRating] = useState<number | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    api
      .get("/users/profile")
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // --- Завантаження ---
  useEffect(() => {
    api
      .get<PropertyDTO>(`/properties/${id}`)
      .then((res) => setProperty(res.data))
      .catch(() => setError("Не вдалося завантажити дані"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setReviewsLoading(true);
    api
      .get<ReviewDTO[]>(`/properties/${id}/reviews`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviewsError("Не вдалося завантажити відгуки"))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!property) return;
    setSummaryLoading(true);
    api
      .get<RealtorRatingSummary>(
        `/realtors/${property.realtorId}/ratings/summary`
      )
      .then((res) => setSummary(res.data))
      .catch(() =>
        setSummaryError("Не вдалося завантажити рейтинг рієлтора")
      )
      .finally(() => setSummaryLoading(false));
  }, [property]);

  // --- Обробники ---
  const handleAddFavorite = async () => {
    try {
      await api.post("/favorites", { propertyId: property!.id });
      alert("Додано в закладки");
    } catch {
      alert("Помилка при додаванні в закладки");
    }
  };

  const handleAddReview = async () => {
    if (!newRating || !newComment.trim()) return;
    try {
      const res = await api.post<ReviewDTO>(
        `/properties/${id}/reviews`,
        { rating: newRating, comment: newComment }
      );
      setReviews((prev) => [res.data, ...prev]);
      setNewComment("");
      setNewRating(null);
    } catch {
      alert("Помилка при додаванні відгуку");
    }
  };

  const handleRealtorReview = async () => {
    if (!realtorRating || !realtorComment.trim() || !property) return;
    try {
      const res = await api.post<ReviewDTO>(
        `/realtors/${property.realtorId}/ratings`,
        { rating: realtorRating, comment: realtorComment }
      );
      // Оновлюємо локальний summary
      setSummary((prev) =>
        prev
          ? {
              averageRating:
                (prev.averageRating * prev.totalRatings + realtorRating) /
                (prev.totalRatings + 1),
              totalRatings: prev.totalRatings + 1,
            }
          : { averageRating: realtorRating, totalRatings: 1 }
      );
      setRealtorComment("");
      setRealtorRating(null);
      setOpenRealtorDialog(false);
    } catch {
      alert("Помилка при оцінці рієлтора");
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!property) return <Alert severity="warning">Оголошення не знайдено</Alert>;

  return (
    <Container sx={{ my: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {property.title}
      </Typography>

      {/* Картка нерухомості */}
      <Card>
        <CardMedia
          component="img"
          height="400"
          image={property.imageUrl}
          alt={property.title}
        />
        <CardContent>
          {/* Опис */}
          <Typography variant="h6">Опис</Typography>
          <Typography>{property.description}</Typography>

          {/* Інші дані */}
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
            Місто / Адреса
          </Typography>
          <Typography>
            {property.city}, {property.address}
          </Typography>

          {/* Контакти і кнопки для рієлтора */}
          <Box mt={2}>
            <Typography variant="h6">Рієлтор</Typography>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <Button
                variant="outlined"
                component={Link}
                to={`/realtors/${property.realtorId}`}
                size="small"
              >
                Переглянути профіль рієлтора
              </Button>
              {isLoggedIn && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setOpenRealtorDialog(true)}
                >
                  Залишити відгук
                </Button>
              )}
            </Box>
            <Box mt={1}>
              <Typography>{property.realtorFullName}</Typography>
              <Typography>📞 {property.realtorPhone}</Typography>
              <Typography>✉️ {property.realtorEmail}</Typography>
            </Box>
          </Box>

          {/* рейтинг рієлтора */}
          <Box mt={2}>
            <Typography variant="h6">Рейтинг рієлтора</Typography>
            {summaryLoading ? (
              <CircularProgress size={20} />
            ) : summaryError ? (
              <Alert severity="error">{summaryError}</Alert>
            ) : summary && summary.totalRatings > 0 ? (
              <Typography>
                {summary.averageRating.toFixed(1)} ★ ({summary.totalRatings})
              </Typography>
            ) : (
              <Typography>Поки що немає оцінок</Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Модальне вікно для залишення відгуку про рієлтора */}
      <Dialog
        open={openRealtorDialog}
        onClose={() => setOpenRealtorDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Залишити відгук про рієлтора</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Rating
              name="realtor-rating"
              value={realtorRating}
              onChange={(_, val) => setRealtorRating(val)}
              size="medium"
            />
            <TextField
              label="Коментар"
              multiline
              rows={3}
              value={realtorComment}
              onChange={(e) => setRealtorComment(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRealtorDialog(false)}>Скасувати</Button>
          <Button
            variant="contained"
            disabled={!realtorRating || !realtorComment.trim()}
            onClick={handleRealtorReview}
          >
            Надіслати
          </Button>
        </DialogActions>
      </Dialog>

      {/* Закладки */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddFavorite}
        sx={{ mt: 2 }}
      >
        Додати в улюблені
      </Button>

      {/* Карта */}
      <Box mt={3} sx={{ height: 400 }}>
        <Typography variant="h6" mb={1}>
          Локація
        </Typography>
        <MapContainer
          center={[property.latitude, property.longitude]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <SetViewOnMount coords={[property.latitude, property.longitude]} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[property.latitude, property.longitude]}>
            <Popup>{property.title}</Popup>
          </Marker>
        </MapContainer>
      </Box>

      {/* Відгуки нерухомості */}
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>
          Відгуки
        </Typography>

        {reviewsLoading ? (
          <CircularProgress size={24} />
        ) : reviewsError ? (
          <Alert severity="error">{reviewsError}</Alert>
        ) : (
          <List>
            {reviews.length === 0 && (
              <Typography>Поки що немає відгуків.</Typography>
            )}
            {reviews.map((rev) => (
              <ListItem key={rev.id} alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2">
                        {rev.author}
                      </Typography>
                      <Rating value={rev.rating} size="small" readOnly />
                    </Box>
                  }
                  secondary={rev.comment}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Форма нового відгуку */}
        {isLoggedIn ? (
          <Box mt={2} display="flex" flexDirection="column" gap={1}>
            <Typography>Залишити відгук:</Typography>
            <Rating
              name="property-review"
              value={newRating}
              onChange={(_, val) => setNewRating(val)}
            />
            <TextField
              label="Коментар"
              multiline
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleAddReview}
              disabled={!newRating || !newComment.trim()}
            >
              Відправити
            </Button>
          </Box>
        ) : (
          <Alert severity="info">
            Щоб залишити відгук, будь ласка, <Link to="/login">увійдіть</Link>.
          </Alert>
        )}
      </Box>
    </Container>
  );
}
