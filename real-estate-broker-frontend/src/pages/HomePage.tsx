import { Container, Typography } from "@mui/material";

const HomePage = () => {
  return (
    <Container>
      <Typography variant="h3" align="center" gutterBottom>
        Вітаємо на рієлторському сайті! 🏡
      </Typography>
      <Typography variant="h6" align="center" color="textSecondary">
        Знаходьте найкраще житло для купівлі та оренди.
      </Typography>
    </Container>
  );
};

export default HomePage;
