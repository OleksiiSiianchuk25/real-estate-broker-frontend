import { useState, useEffect } from "react";
import { Container, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, CircularProgress } from "@mui/material";
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

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    try {
      const response = await api.get<Favorite[]>("/favorites");
      setFavorites(response.data);
    } catch (err) {
      console.error("Помилка завантаження закладок", err);
      setError("Не вдалося завантажити закладки");
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
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (err) {
      console.error("Помилка видалення закладки", err);
      setError("Не вдалося видалити закладку");
    }
  };

  if (loading)
    return (
      <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "2rem" }}>
        <CircularProgress />
      </Container>
    );
  if (error) return <Typography color="error">{error}</Typography>;
  if (favorites.length === 0) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 3 }}>
        Немає збережених оголошень.
      </Typography>
    );
  }

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Мої закладки
      </Typography>
      <Grid container spacing={3}>
        {favorites.map((favorite) => (
          <Grid item xs={12} sm={6} md={4} key={favorite.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={favorite.property.imageUrl || "https://via.placeholder.com/400"}
                alt={favorite.property.title}
              />
              <CardContent>
                <Typography variant="h6">{favorite.property.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  📍 {favorite.property.city}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Intl.NumberFormat("uk-UA", {
                    style: "currency",
                    currency: "UAH",
                    minimumFractionDigits: 0,
                  }).format(Number(favorite.property.price))}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {favorite.property.status === "FOR_SALE"
                    ? "Продається"
                    : favorite.property.status === "FOR_RENT"
                    ? "Оренда"
                    : "Продано"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to={`/property/${favorite.property.id}`}
                >
                  Детальніше
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => handleRemoveFavorite(favorite.id)}
                >
                  Видалити
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FavoritesPage;
