import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../utils/api";

interface Property {
  id: number;
  title: string;
  description: string;
  price: string;
  city: string;
  imageUrl: string;
  status: string;
  type: string;
}

const MyPropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const response = await api.get<Property[]>("/properties/my");
        setProperties(response.data);
      } catch (err) {
        console.error("Помилка завантаження моїх оголошень", err);
        setError("Не вдалося завантажити ваші оголошення");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

  if (loading)
    return (
      <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "2rem" }}>
        <CircularProgress />
      </Container>
    );
  if (error) return <Typography color="error">{error}</Typography>;
  if (properties.length === 0)
    return (
      <Typography variant="h6" align="center" sx={{ mt: 3 }}>
        У вас немає оголошень
      </Typography>
    );

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Мої оголошення
      </Typography>
      <Grid container spacing={3}>
        {properties.map((property) => (
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
                  {property.city}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {property.price} грн
                </Typography>
              </CardContent>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/property/${property.id}`}
                sx={{ m: 1 }}
              >
                Детальніше
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                component={Link}
                to={`/edit-property/${property.id}`}
                sx={{ m: 1 }}
              >
                Редагувати
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MyPropertiesPage;
