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
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState(""); 
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    fetchProperties();
  }, [search, statusFilter, typeFilter, cityFilter, minPrice, maxPrice]);

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
          <InputLabel id="city-label" shrink>Місто</InputLabel>
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
          {properties.length > 0 ? (
            properties.map((property) => (
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
