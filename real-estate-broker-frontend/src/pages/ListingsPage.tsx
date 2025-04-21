import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
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

const fallbackImage = "https://cdn.britannica.com/73/114973-050-2DC46083/Midtown-Manhattan-Empire-State-Building-New-York.jpg";

const ListingsPage = () => {
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
          status: statusFilter ? statusFilter.toUpperCase() : null,
          type: typeFilter ? typeFilter.toUpperCase() : null,
          city: cityFilter,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        },
      });
      setProperties(response.data);
    } catch (err) {
      setError("Не вдалося завантажити дані");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search, statusFilter, typeFilter, cityFilter, minPrice, maxPrice]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

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

      {/* Фільтри */}
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
            <InputLabel id="city-label" shrink>
              Місто
            </InputLabel>
            <Select
              labelId="city-label"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              displayEmpty
              notched
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
            <InputLabel id="status-label" shrink>
              Статус
            </InputLabel>
            <Select
              labelId="status-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              notched
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
            <InputLabel id="type-label" shrink>
              Тип житла
            </InputLabel>
            <Select
              labelId="type-label"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              displayEmpty
              notched
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
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button variant="outlined" color="secondary" onClick={handleClearFilters}>
            Очистити фільтри
          </Button>
        </Box>
      </Paper>

      {/* Відображення списку */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3}>
          {properties.length > 0 ? (
            properties.map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <Card>
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
                    <Typography variant="body2" color="textSecondary">
                      {property.status === "FOR_SALE"
                        ? "Продається"
                        : property.status === "FOR_RENT"
                        ? "Оренда"
                        : "Продано"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" component={Link} to={`/property/${property.id}`}>
                      Детальніше
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="h6" align="center" sx={{ width: "100%", mt: 3 }}>
              Немає результатів за вашими фільтрами.
            </Typography>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default ListingsPage;
