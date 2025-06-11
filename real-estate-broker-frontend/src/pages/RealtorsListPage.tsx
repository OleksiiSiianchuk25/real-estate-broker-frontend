// src/pages/RealtorsListPage.tsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Rating,
  CircularProgress,
  Alert,
  Box,
  TextField,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../utils/api";

interface RealtorDTO {
  id: number;
  fullName: string;
  agency: string;
  avatarUrl?: string;
  averageRating: number;
}

export default function RealtorsListPage() {
  const [list, setList] = useState<RealtorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"" | "name" | "rating">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    api
      .get<RealtorDTO[]>("/realtors")
      .then((res) => setList(res.data))
      .catch(() => setError("Не вдалося завантажити список рієлторів"))
      .finally(() => setLoading(false));
  }, []);

  const handleClearFilters = () => {
    setSearch("");
    setMinRating(null);
    setSortBy("");
    setSortOrder("asc");
  };

  // Фільтрація
  const filtered = list
    .filter((r) => {
      const q = search.trim().toLowerCase();
      if (
        q &&
        !(
          r.fullName.toLowerCase().includes(q) ||
          r.agency.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      if (minRating !== null && r.averageRating < minRating) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      if (sortBy === "name") {
        const cmp = a.fullName.localeCompare(b.fullName);
        return sortOrder === "asc" ? cmp : -cmp;
      } else {
        // rating
        const diff = a.averageRating - b.averageRating;
        return sortOrder === "asc" ? diff : -diff;
      }
    });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Список рієлторів
      </Typography>

      {/* Пошук, фільтри та сортування */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <TextField
            label="Пошук за іменем або агенцією"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 240 }}
          />

          <Box display="flex" alignItems="center">
            <Typography sx={{ mr: 1 }}>Мін. рейтинг:</Typography>
            <Rating
              value={minRating}
              onChange={(_, newValue) => setMinRating(newValue)}
              precision={0.5}
            />
          </Box>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Сортувати за</InputLabel>
            <Select
              value={sortBy}
              label="Сортувати за"
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <MenuItem value="">Без сортування</MenuItem>
              <MenuItem value="name">Ім'я</MenuItem>
              <MenuItem value="rating">Рейтинг</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Порядок</InputLabel>
            <Select
              value={sortOrder}
              label="Порядок"
              onChange={(e) => setSortOrder(e.target.value as any)}
            >
              <MenuItem value="asc">Зростання</MenuItem>
              <MenuItem value="desc">Спадання</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
          >
            Очистити фільтри
          </Button>
        </Box>
      </Paper>

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
        {filtered.map((r) => (
          <Card key={r.id}>
            {r.avatarUrl && (
              <CardMedia
                component="img"
                height="180"
                image={r.avatarUrl}
                alt={r.fullName}
              />
            )}
            <CardContent>
              <Typography variant="h6">{r.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {r.agency}
              </Typography>
              <Rating value={r.averageRating} precision={0.1} readOnly />
            </CardContent>
            <CardActions>
              <Button component={Link} to={`/realtors/${r.id}`} size="small">
                Деталі
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
