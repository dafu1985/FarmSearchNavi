import React, { useState } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Firestore インスタンス

type CropFormProps = {
  pulldown: {
    prefectures: string[];
    seasons: string[];
    categories: string[];
  };
  initialPref?: string;
};

function CropForm({ pulldown, initialPref }: CropFormProps) {
  const [name, setName] = useState("");
  const [season, setSeason] = useState("");
  const [category, setCategory] = useState("");
  const [prefName, setPrefName] = useState(initialPref || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async () => {
    if (!name || !season || !category || !prefName) {
      setErrorMessage("すべての項目を入力してください");
      setSuccessMessage("");
      return;
    }

    try {
      await addDoc(collection(db, "crops"), {
        name,
        season,
        category,
        prefName,
        createdAt: new Date(),
      });
      setSuccessMessage("作物を追加しました！");
      setErrorMessage("");
      setName("");
      setSeason("");
      setCategory("");
      if (!initialPref) setPrefName("");
    } catch (error) {
      console.error(error);
      setErrorMessage("作物の追加に失敗しました");
      setSuccessMessage("");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: 400 }}>
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
      {successMessage && (
        <Typography color="primary">{successMessage}</Typography>
      )}

      <TextField
        label="作物名"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <FormControl fullWidth>
        <InputLabel>季節</InputLabel>
        <Select value={season} onChange={(e) => setSeason(e.target.value)}>
          {pulldown.seasons.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>カテゴリ</InputLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          {pulldown.categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>都道府県</InputLabel>
        <Select value={prefName} onChange={(e) => setPrefName(e.target.value)}>
          {pulldown.prefectures.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleSubmit}>
        登録
      </Button>
    </Box>
  );
}

export default CropForm;
