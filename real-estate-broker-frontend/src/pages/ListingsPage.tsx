import { useState } from "react";
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
} from "@mui/material";

// Тимчасові дані (імітація оголошень)
const mockListings = [
  {
    id: 1,
    title: "Сучасна квартира у центрі",
    price: "$1200 / місяць",
    image: "https://source.unsplash.com/400x300/?apartment",
  },
  {
    id: 2,
    title: "Будинок біля моря",
    price: "$250,000",
    image: "https://source.unsplash.com/400x300/?house",
  },
  {
    id: 3,
    title: "Котедж у лісі",
    price: "$1,500 / місяць",
    image: "https://source.unsplash.com/400x300/?cottage",
  },
];

const ListingsPage = () => {
  const [search, setSearch] = useState("");

  const filteredListings = mockListings.filter((listing) =>
    listing.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        🏡 Список оголошень
      </Typography>

      <TextField
        label="Пошук житла"
        fullWidth
        variant="outlined"
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Grid container spacing={3}>
        {filteredListings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} key={listing.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={listing.image}
                alt={listing.title}
              />
              <CardContent>
                <Typography variant="h6">{listing.title}</Typography>
                <Typography color="textSecondary">{listing.price}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Детальніше
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ListingsPage;
