// src/pages/admin/FavoritesPageAdmin.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import { Box, Button, TextField } from "@mui/material";
import api from "../../utils/api";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

interface Favorite {
  id: number;
  userId: number;
  propertyId: number;
}

const FavoritesPageAdmin: React.FC = () => {
  const [rows, setRows] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  // стан для пошуку
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const resp = await api.get<Favorite[]>("/admin/favorites");
      setRows(resp.data);
    } catch (error) {
      console.error("Помилка завантаження закладок:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Видалити закладку?")) {
      await api.delete(`/admin/favorites/${id}`);
      fetchFavorites();
    }
  };

  // фільтрація рядків за пошуковим терміном (userId або propertyId)
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.userId.toString().includes(term) ||
        r.propertyId.toString().includes(term)
    );
  }, [rows, searchTerm]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "userId", headerName: "User ID", width: 100 },
    { field: "propertyId", headerName: "Property ID", width: 120 },
    {
      field: "actions",
      type: "actions",
      headerName: "Дії",
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="Переглянути"
          onClick={() => alert(JSON.stringify(params.row, null, 2))}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Видалити"
          onClick={() => handleDelete(params.id as number)}
        />,
      ],
    },
  ];

  return (
    <>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <TextField
          label="Пошук (User ID або Property ID)"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => {
            /* тут можна відкрити діалог створення нової закладки, якщо потрібен */
            alert("Додавання нових закладок через адмінку наразі не реалізовано");
          }}
        >
          Додати улюблене
        </Button>
      </Box>

      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </div>
    </>
  );
};

export default FavoritesPageAdmin;
