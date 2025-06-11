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
  Rating,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../utils/api";

interface Property {
  id: number;
  title: string;
  price: string;
  city: string;
  imageUrl: string;
  status: "FOR_SALE" | "FOR_RENT" | "SOLD";
  type: "APARTMENT" | "HOUSE";

  realtorName?: string;
  realtorRating?: number;
  rating?: number;
}

const fallbackImage =
  "https://cdn.britannica.com/73/114973-050-2DC46083/Midtown-Manhattan-Empire-State-Building-New-York.jpg";

const ListingsPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Property["status"]>("");
  const [typeFilter, setTypeFilter] = useState<"" | Property["type"]>("");
  const [cityFilter, setCityFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRealtorRating, setMinRealtorRating] = useState<number | null>(
    null
  );
  const [minPropertyRating, setMinPropertyRating] = useState<number | null>(
    null
  );
  const [sortField, setSortField] = useState<
    "" | "price" | "realtorRating" | "rating"
  >("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cityOptions = [
    { value: "", label: "Всі міста" },
    { value: "Київ", label: "Київ" },
    { value: "Львів", label: "Львів" },
    { value: "Одеса", label: "Одеса" },
    { value: "Дніпро", label: "Дніпро" },
    { value: "Харків", label: "Харків" },
  ];
  const statusOptions = [
    { value: "", label: "Всі статуси" },
    { value: "FOR_SALE", label: "Продається" },
    { value: "FOR_RENT", label: "Оренда" },
    { value: "SOLD", label: "Продано" },
  ];
  const typeOptions = [
    { value: "", label: "Всі типи" },
    { value: "APARTMENT", label: "Квартира" },
    { value: "HOUSE", label: "Будинок" },
  ];

  // Завантажуємо всі властивості
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await api.get<Property[]>("/properties", {
        params: {
          search,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
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
  }, [
    search,
    statusFilter,
    typeFilter,
    cityFilter,
    minPrice,
    maxPrice,
    // рейтинг фільтруємо клієнтськи, тому не додаємо тут
  ]);

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
    setMinRealtorRating(null);
    setMinPropertyRating(null);
    setSortField("");
    setSortOrder("asc");
  };

  // Клієнтська фільтрація і сортування
  const filtered = properties
    .filter((p) => {
      const rr = p.realtorRating ?? 0;
      const pr = p.rating ?? 0;
      if (minRealtorRating !== null && rr < minRealtorRating) return false;
      if (minPropertyRating !== null && pr < minPropertyRating) return false;
      return true;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let av: number, bv: number;
      if (sortField === "price") {
        av = parseFloat(a.price);
        bv = parseFloat(b.price);
      } else {
        av = a[sortField] ?? 0;
        bv = b[sortField] ?? 0;
      }
      return sortOrder === "asc" ? av - bv : bv - av;
    });

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        🏡 Список оголошень
      </Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          {/* Основні фільтри */}
          <TextField
            label="Пошук житла"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Місто</InputLabel>
            <Select
              value={cityFilter}
              label="Місто"
              onChange={(e) => setCityFilter(e.target.value)}
            >
              {cityOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusFilter}
              label="Статус"
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Тип</InputLabel>
            <Select
              value={typeFilter}
              label="Тип"
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              {typeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Мін. ціна"
            type="number"
            variant="outlined"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            sx={{ width: 100 }}
          />
          <TextField
            label="Макс. ціна"
            type="number"
            variant="outlined"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            sx={{ width: 100 }}
          />

          {/* Фільтри за рейтингом */}
          <Box display="flex" alignItems="center">
            <Typography sx={{ mr: 1 }}>Рієлтор від:</Typography>
            <Rating
              value={minRealtorRating}
              onChange={(_, nv) => setMinRealtorRating(nv)}
              precision={0.5}
            />
          </Box>
          <Box display="flex" alignItems="center">
            <Typography sx={{ mr: 1 }}>Житло від:</Typography>
            <Rating
              value={minPropertyRating}
              onChange={(_, nv) => setMinPropertyRating(nv)}
              precision={0.5}
            />
          </Box>

          {/* Сортування */}
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Сортувати за</InputLabel>
            <Select
              value={sortField}
              label="Сортувати за"
              onChange={(e) => setSortField(e.target.value as any)}
            >
              <MenuItem value="">Без сортування</MenuItem>
              <MenuItem value="price">Ціна</MenuItem>
              <MenuItem value="realtorRating">Рейтинг рієлтора</MenuItem>
              <MenuItem value="rating">Рейтинг житла</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
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
        <Typography color="error" align="center">
          {error}
        </Typography>
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
          {filtered.length > 0 ? (
            filtered.map((property) => {
              const rr = property.realtorRating ?? 0;
              const pr = property.rating ?? 0;
              const name = property.realtorName || "Н/д";

              return (
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
                    <Box display="flex" alignItems="center" mt={1}>
                      <Rating value={rr} readOnly size="small" precision={0.1} />
                      <Typography variant="body2" ml={1}>
                        Рейтинг рієлтора
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mt={1}>
                      <Rating value={pr} readOnly size="small" precision={0.1} />
                      <Typography variant="body2" ml={1}>
                        Рейтинг житла
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      component={Link}
                      to={`/property/${property.id}`}
                    >
                      Детальніше
                    </Button>
                  </CardActions>
                </Card>
              );
            })
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
