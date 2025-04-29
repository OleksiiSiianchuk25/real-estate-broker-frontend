import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import api from "../../utils/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  totalProperties: number;
  propertiesByStatus: Record<string, number>;
  totalUsers: number;
  usersByRole: Record<string, number>;
  totalFavorites: number;
  visits: number;
  newUsersLast7Days: { date: string; count: number }[];
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Stats>("/admin/stats")
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  const statusData = Object.entries(stats.propertiesByStatus).map(
    ([name, value]) => ({ name, value })
  );
  const roleData = Object.entries(stats.usersByRole).map(
    ([name, value]) => ({ name, value })
  );
  const newUsersData = stats.newUsersLast7Days;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Адмін: Статистика сайту
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        {[
          { title: "Відвідувань", value: stats.visits },
          { title: "Оголошень", value: stats.totalProperties },
          { title: "Користувачів", value: stats.totalUsers },
          { title: "Закладок", value: stats.totalFavorites },
        ].map(({ title, value }) => (
          <Card key={title} sx={{ flex: "1 1 calc(25% - 16px)", minWidth: 150 }}>
            <CardContent>
              <Typography color="textSecondary">{title}</Typography>
              <Typography variant="h5">{value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        {/* Діаграма: Оголошення за статусом */}
        <Card sx={{ flex: "1 1 30%", minWidth: 300 }}>
          <CardContent>
            <Typography>Оголошення за статусом</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {statusData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Діаграма: Користувачі за роллю */}
        <Card sx={{ flex: "1 1 30%", minWidth: 300 }}>
          <CardContent>
            <Typography>Користувачі за роллю</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {roleData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[(idx + 1) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Стовпчикова діаграма: Нові користувачі за 7 днів */}
        <Card sx={{ flex: "1 1 30%", minWidth: 300 }}>
          <CardContent>
            <Typography>Нові користувачі за 7 днів</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={newUsersData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default StatsPage;
