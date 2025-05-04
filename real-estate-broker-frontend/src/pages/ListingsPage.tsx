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
  status: "FOR_SALE" | "FOR_RENT" | "SOLD";
  type: "APARTMENT" | "HOUSE";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Опції для селектів
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
          {/* пошук */}
          <TextField
            label="Пошук житла"
            fullWidth
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* місто */}
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel id="city-label">Місто</InputLabel>
            <Select
              labelId="city-label"
              id="city-select"
              value={cityFilter}
              label="Місто"
              onChange={(e) => setCityFilter(e.target.value)}
              renderValue={(v) =>
                cityOptions.find((o) => o.value === v)?.label
              }
            >
              {cityOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* статус */}
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel id="status-label">Статус</InputLabel>
            <Select
              labelId="status-label"
              id="status-select"
              value={statusFilter}
              label="Статус"
              onChange={(e) => setStatusFilter(e.target.value as any)}
              renderValue={(v) =>
                statusOptions.find((o) => o.value === v)?.label
              }
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* тип */}
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel id="type-label">Тип житла</InputLabel>
            <Select
              labelId="type-label"
              id="type-select"
              value={typeFilter}
              label="Тип житла"
              onChange={(e) => setTypeFilter(e.target.value as any)}
              renderValue={(v) =>
                typeOptions.find((o) => o.value === v)?.label
              }
            >
              {typeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* цінові */}
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
