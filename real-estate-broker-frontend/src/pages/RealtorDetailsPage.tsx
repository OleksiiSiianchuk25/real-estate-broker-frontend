// src/pages/RealtorDetailsPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Box,
  Rating,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
} from "@mui/material";
import api from "../utils/api";

interface RealtorDTO {
  id: number;
  fullName: string;
  agency: string;
  avatarUrl?: string;
  averageRating: number;
}

interface PropertyBriefDTO {
  id: number;
  title: string;
  price: string;
  imageUrl: string;
}

interface ReviewDTO {
  id: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function RealtorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [realtor, setRealtor] = useState<RealtorDTO | null>(null);
  const [propsList, setPropsList] = useState<PropertyBriefDTO[]>([]);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const fallbackImage =
    "https://cdn.britannica.com/73/114973-050-2DC46083/Midtown-Manhattan-Empire-State-Building-New-York.jpg";

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    api
      .get("/users/profile")
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Load realtor, their properties and reviews
  useEffect(() => {
    Promise.all([
      api.get<RealtorDTO>(`/realtors/${id}`),
      api.get<PropertyBriefDTO[]>(`/realtors/${id}/properties`),
      api.get<ReviewDTO[]>(`/realtors/${id}/reviews`),
    ])
      .then(([r, p, rev]) => {
        setRealtor(r.data);
        setPropsList(p.data);
        setReviews(rev.data);
      })
      .catch(() => setError("Не вдалося завантажити дані"))
      .finally(() => setLoading(false));
  }, [id]);

  // Upsert review: replace any existing from same author
  const handleSubmitReview = async () => {
    if (!newRating || !newComment.trim()) return;
    try {
      const res = await api.post<ReviewDTO>(`/realtors/${id}/reviews`, {
        rating: newRating,
        comment: newComment,
      });
      setReviews((prev) => [
        res.data,
        ...prev.filter((r) => r.author !== res.data.author),
      ]);
      setNewRating(null);
      setNewComment("");
    } catch {
      alert("Не вдалося додати відгук");
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!realtor) return <Alert severity="warning">Рієлтор не знайдений</Alert>;

  return (
    <Container sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
        }}
      >
        {/* Профіль рієлтора */}
        <Card>
          <CardContent>
            <Typography variant="h5">{realtor.fullName}</Typography>
            <Typography color="text.secondary">{realtor.agency}</Typography>
            <Rating
              value={realtor.averageRating}
              precision={0.1}
              readOnly
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>

        {/* Оголошення */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Оголошення рієлтора
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
            }}
          >
            {propsList.map((p) => (
              <Card key={p.id}>
                <CardMedia
                  component="img"
                  height="140"
                  image={p.imageUrl || fallbackImage}
                  alt={p.title}
                />
                <CardContent>
                  <Typography variant="subtitle1">{p.title}</Typography>
                  <Typography variant="body2" color="primary">
                    {new Intl.NumberFormat("uk-UA", {
                      style: "currency",
                      currency: "UAH",
                      minimumFractionDigits: 0,
                    }).format(Number(p.price))}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button component={Link} to={`/property/${p.id}`} size="small">
                    Деталі
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>

          {/* Відгуки клієнтів */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Відгуки клієнтів
            </Typography>
            <List>
              {reviews.length === 0 && (
                <Typography>Поки що немає відгуків.</Typography>
              )}
              {reviews.map((rev) => (
                <ListItem key={rev.id} alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">{rev.author}</Typography>
                        <Rating value={rev.rating} readOnly size="small" />
                      </Box>
                    }
                    secondary={rev.comment}
                  />
                </ListItem>
              ))}
            </List>

            {/* Форма додавання відгуку — тільки для залогінених */}
            {isLoggedIn ? (
              <Box mt={2} display="flex" flexDirection="column" gap={2}>
                <Typography>Залишити відгук рієлтору:</Typography>
                <Rating
                  name="new-realtor-rating"
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
                  onClick={handleSubmitReview}
                  disabled={!newRating || !newComment.trim()}
                >
                  Відправити
                </Button>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                Щоб залишити відгук, будь ласка,{" "}
                <Link to="/login">увійдіть у свій акаунт</Link>.
              </Alert>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export {};
