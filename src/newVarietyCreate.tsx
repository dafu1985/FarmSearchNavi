import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

type Variety = {
  id: string;
  cropName: string;
  prefName: string;
  variety: string;
  character: string;
  sowing: string;
  nursery: string;
  harvest: string;
};

type NewVarietyCreateProps = {
  addVariety: (variety: Variety) => void;
};

const NewVarietyCreate = ({ addVariety }: NewVarietyCreateProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefName = location.state?.prefName || "";
  const cropName = location.state?.cropName || "";

  const [formData, setFormData] = useState({
    variety: "",
    character: "",
    sowing: "",
    nursery: "",
    harvest: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    if (
      !formData.variety ||
      !formData.character ||
      !formData.sowing ||
      !formData.nursery ||
      !formData.harvest
    ) {
      setErrorMessage("全ての項目を入力してください");
      return;
    }
    const newVariety: Variety = {
      id: Date.now().toString(),
      cropName,
      prefName,
      ...formData,
    };
    addVariety(newVariety);
    navigate(-1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ p: 3, backgroundColor: "#fff3e0" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h5">品種新規登録</Typography>
          <Typography>作物名: {cropName}</Typography>

          <TextField
            label="品種名"
            name="variety"
            value={formData.variety}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="特徴"
            name="character"
            value={formData.character}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="種まき時期"
            name="sowing"
            value={formData.sowing}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="育苗方法"
            name="nursery"
            value={formData.nursery}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="収穫時期"
            name="harvest"
            value={formData.harvest}
            onChange={handleChange}
            fullWidth
          />

          {errorMessage && (
            <Typography color="error">{errorMessage}</Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              戻る
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRegister}
            >
              登録
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewVarietyCreate;
