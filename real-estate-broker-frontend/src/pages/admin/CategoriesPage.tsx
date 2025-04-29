import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../../utils/api";

interface Category {
  id: number;
  name: string;
}

const CategoriesPage: React.FC = () => {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<Category>>({});

  const fetch = async () => {
    setLoading(true);
    try {
      const resp = await api.get<Category[]>("/categories");
      setRows(resp.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleView = (category: Category) => {
    setCurrent(category);
    setViewOpen(true);
  };
  const handleEdit = (category: Category) => {
    setCurrent(category);
    setEditOpen(true);
  };
  const handleDelete = async (id: number) => {
    if (window.confirm("Видалити категорію?")) {
      await api.delete(`/categories/${id}`);
      fetch();
    }
  };
  const handleAdd = () => {
    setCurrent({});
    setAddOpen(true);
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Назва", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Дії",
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="Переглянути"
          onClick={() => handleView(params.row as Category)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Редагувати"
          onClick={() => handleEdit(params.row as Category)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Видалити"
          onClick={() => handleDelete(params.id as number)}
        />,
      ],
    },
  ];

  const ViewDialog: React.FC = () => (
    <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth>
      <DialogTitle>Перегляд категорії</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="ID"
          fullWidth
          margin="dense"
          value={current.id ?? ""}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Назва"
          fullWidth
          margin="dense"
          value={current.name ?? ""}
          InputProps={{ readOnly: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewOpen(false)}>Закрити</Button>
      </DialogActions>
    </Dialog>
  );

  const EditDialog: React.FC<{ open: boolean; isNew: boolean }> = ({
    open,
    isNew,
  }) => {
    const [form, setForm] = useState<Partial<Category>>(current);

    useEffect(() => {
      setForm(current);
    }, [current]);

    const save = async () => {
      try {
        if (isNew) {
          await api.post("/categories", { name: form.name });
        } else {
          await api.put(`/categories/${current.id}`, { name: form.name });
        }
        fetch();
        isNew ? setAddOpen(false) : setEditOpen(false);
      } catch (error) {
        console.error("Save error:", error);
      }
    };

    const handleClose = () => {
      isNew ? setAddOpen(false) : setEditOpen(false);
    };

    return (
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>
          {isNew ? "Додати категорію" : "Редагувати категорію"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Назва"
            fullWidth
            margin="dense"
            value={form.name ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Скасувати</Button>
          <Button variant="contained" onClick={save}>
            {isNew ? "Додати" : "Зберегти"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
        Додати категорію
      </Button>
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </div>

      <ViewDialog />
      <EditDialog open={editOpen} isNew={false} />
      <EditDialog open={addOpen} isNew={true} />
    </Box>
  );
};

export default CategoriesPage;