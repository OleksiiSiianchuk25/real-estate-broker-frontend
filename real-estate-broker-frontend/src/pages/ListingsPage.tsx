import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
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

const ListingsPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Фільтр за статусом
  const [typeFilter, setTypeFilter] = useState(""); // Фільтр за типом
  const [minPrice, setMinPrice] = useState(""); // Мінімальна ціна
  const [maxPrice, setMaxPrice] = useState(""); // Максимальна ціна
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get<Property[]>("/properties");
        setProperties(response.data);
      } catch (err) {
        setError("Не вдалося завантажити дані");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Фільтрація оголошень
  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? property.status === statusFilter : true;
    const matchesType = typeFilter ? property.type === typeFilter : true;
    const matchesMinPrice = minPrice ? Number(property.price) >= Number(minPrice) : true;
    const matchesMaxPrice = maxPrice ? Number(property.price) <= Number(maxPrice) : true;
    return matchesSearch && matchesStatus && matchesType && matchesMinPrice && matchesMaxPrice;
  });

  // Функція форматування ціни
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        🏡 Список оголошень
      </Typography>

      {/* Фільтри */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
  <TextField
    label="Пошук житла"
    fullWidth
    variant="outlined"
    margin="normal"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

    <FormControl fullWidth sx={{ minWidth: 200 }}>
      <InputLabel id="status-label" shrink>Статус</InputLabel>
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
      <InputLabel id="type-label" shrink>Тип житла</InputLabel>
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


      {/* Відображення списку */}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={property.imageUrl || "https://via.placeholder.com/400"}
                    alt={property.title}
                  />
                  <CardContent>
                    <Typography variant="h6">{property.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      📍 {property.city}
                    </Typography>
                    <Typography color="textSecondary">{formatPrice(property.price)}</Typography>
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
