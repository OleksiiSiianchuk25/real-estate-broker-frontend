import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../utils/api";

interface Favorite {
  id: number;
  userId: number;
  property: {
    id: number;
    title: string;
    price: string;
    city: string;
    imageUrl: string;
    status: string;
    type: string;
  };
}

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    try {
      const response = await api.get<Favorite[]>("/favorites");
      setFavorites(response.data);
    } catch (err) {
      console.error("Помилка завантаження улюблених", err);
      setError("Не вдалося завантажити улюблені");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      await api.delete(`/favorites/${favoriteId}`);
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
    } catch (err) {
      console.error("Помилка видалення обраного", err);
      setError("Не вдалося видалити закладку");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (error) {
    return (
      <Container maxWidth="sm">
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }
  if (favorites.length === 0) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" align="center" sx={{ mt: 3 }}>
          Немає збережених оголошень.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Мої улюблені
      </Typography>

      {/* Використовуємо CSS Grid замість MUI Grid */}
      <Box
        display="grid"
        gap={3}
        sx={{
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
          },
        }}
      >
        {favorites.map((fav) => (
          <Card key={fav.id}>
            <CardMedia
              component="img"
              height="200"
              image={fav.property.imageUrl || "https://cdn.britannica.com/73/114973-050-2DC46083/Midtown-Manhattan-Empire-State-Building-New-York.jpg"}
              alt={fav.property.title}
            />
            <CardContent>
              <Typography variant="h6">{fav.property.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                📍 {fav.property.city}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {new Intl.NumberFormat("uk-UA", {
                  style: "currency",
                  currency: "UAH",
                  minimumFractionDigits: 0,
                }).format(Number(fav.property.price))}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {fav.property.status === "FOR_SALE"
                  ? "Продається"
                  : fav.property.status === "FOR_RENT"
                  ? "Оренда"
                  : "Продано"}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="primary"
                component={Link}
                to={`/property/${fav.property.id}`}
              >
                Детальніше
              </Button>
              <Button
                size="small"
                color="secondary"
                onClick={() => handleRemoveFavorite(fav.id)}
              >
                Видалити
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default FavoritesPage;
