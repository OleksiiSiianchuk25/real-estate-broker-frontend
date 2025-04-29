// src/pages/ListingsPage.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../utils/api";

interface Property {
  id: number;
  title: string;
  price: string;
  city: string;
  imageUrl: string;
  status: string;
  type: string;
}

const fallbackImage =
  "https://cdn.britannica.com/73/114973-050-2DC46083/Midtown-Manhattan-Empire-State-Building-New-York.jpg";

const ListingsPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await api.get<Property[]>("/properties", {
        params: {
          search,
          status: statusFilter ? statusFilter.toUpperCase() : undefined,
          type: typeFilter ? typeFilter.toUpperCase() : undefined,
          city: cityFilter || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        },
      });
      setProperties(response.data);
    } catch {
      setError("Не вдалося завантажити дані");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search, statusFilter, typeFilter, cityFilter, minPrice, maxPrice]);

  const formatPrice = (price: string) =>
    new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      minimumFractionDigits: 0,
    }).format(Number(price));

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setCityFilter("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        🏡 Список оголошень
      </Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <TextField
            label="Пошук житла"
            fullWidth
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel id="city-label">Місто</InputLabel>
            <Select
              labelId="city-label"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Всі</em>
              </MenuItem>
              <MenuItem value="Київ">Київ</MenuItem>
              <MenuItem value="Львів">Львів</MenuItem>
              <MenuItem value="Одеса">Одеса</MenuItem>
              <MenuItem value="Дніпро">Дніпро</MenuItem>
              <MenuItem value="Харків">Харків</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel id="status-label">Статус</InputLabel>
            <Select
              labelId="status-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Всі</em>
              </MenuItem>
              <MenuItem value="FOR_SALE">Продається</MenuItem>
              <MenuItem value="FOR_RENT">Оренда</MenuItem>
              <MenuItem value="SOLD">Продано</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel id="type-label">Тип житла</InputLabel>
            <Select
              labelId="type-label"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Всі</em>
              </MenuItem>
              <MenuItem value="apartment">Квартира</MenuItem>
              <MenuItem value="house">Будинок</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Мін. ціна"
            type="number"
            variant="outlined"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            sx={{ minWidth: 120 }}
          />

          <TextField
            label="Макс. ціна"
            type="number"
            variant="outlined"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            sx={{ minWidth: 120 }}
          />
        </Box>
        <Box mt={2} textAlign="right">
          <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
            Очистити фільтри
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
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
          {properties.length > 0 ? (
            properties.map((property) => (
              <Card key={property.id}>
                <CardMedia
                  component="img"
                  height="200"
                  image={property.imageUrl || fallbackImage}
                  alt={property.title}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = fallbackImage;
                  }}
                />
                <CardContent>
                  <Typography variant="h6">{property.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    📍 {property.city}
                  </Typography>
                  <Typography color="textSecondary">
                    {formatPrice(property.price)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" component={Link} to={`/property/${property.id}`}>
                    Детальніше
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography variant="h6" align="center" sx={{ mt: 3 }}>
              Немає результатів за вашими фільтрами.
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
};

export default ListingsPage;
