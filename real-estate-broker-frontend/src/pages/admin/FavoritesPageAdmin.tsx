import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import { Button } from "@mui/material";
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
          icon={<VisibilityIcon />}
          label="Переглянути"
          onClick={() => alert(JSON.stringify(params.row))}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Видалити"
          onClick={() => handleDelete(params.id as number)}
        />,
      ],
    },
  ];

  return (
    <>
      <Button variant="contained" sx={{ mb: 2 }}>
        Додати улюблене
      </Button>
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
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