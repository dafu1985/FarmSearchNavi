import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

type AddedVariety = {
  id: number;
  variety: string;
  character: string;
  sowing: string;
  nursery: string;
  harvest: string;
};

type NewCreateProps = {
  addVariety: (prefName: string, cropName: string, item: AddedVariety) => void;
  addCrop: (
    prefName: string,
    cropName: string,
    season: string,
    category: string
  ) => void; // 追加
};

function NewCreate({ addVariety, addCrop }: NewCreateProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const existingCropName = location.state?.cropName || "";
  const prefName = location.state?.prefName || "";

  const [cropNameInput, setCropNameInput] = useState(existingCropName);
  const [formData, setFormData] = useState({
    variety: "",
    character: "",
    sowing: "",
    nursery: "",
    harvest: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false); // 登録確認ダイアログ
  const [successPopupOpen, setSuccessPopupOpen] = useState(false); // 登録完了ポップアップ
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenConfirm = () => {
    const cropNameToUse = existingCropName || cropNameInput;
    if (!cropNameToUse) {
      setErrorMessage("作物名を入力してください");
      return;
    }
    if (
      !formData.variety ||
      !formData.character ||
      !formData.nursery ||
      !formData.harvest
    ) {
      setErrorMessage("空白の項目があるため登録できません");
      return;
    }
    setErrorMessage("");
    setConfirmOpen(true);
  };

  const handleRegister = () => {
    const cropNameToUse = existingCropName || cropNameInput;
    if (!cropNameToUse) {
      setErrorMessage("作物名を入力してください");
      return;
    }
    if (!prefName || prefName === "未選択") {
      setErrorMessage("都道府県を選択してください");
      return;
    }
    const newVariety: AddedVariety = {
      id: Date.now(),
      variety: formData.variety,
      character: formData.character,
      sowing: formData.sowing,
      nursery: formData.nursery,
      harvest: formData.harvest,
    };

    addVariety(prefName, cropNameToUse, newVariety);
    // 作物自体も追加
    addCrop(prefName, cropNameToUse, "-", "-");
    setConfirmOpen(false);
    setSuccessPopupOpen(true);
  };

  const handleAddAnother = () => {
    setFormData({
      variety: "",
      character: "",
      sowing: "",
      nursery: "",
      harvest: "",
    });
    if (!existingCropName) setCropNameInput("");
    setSuccessPopupOpen(false);
  };

  const handleGoToSearch = () => {
    navigate("/search", { state: { prefName } });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: "#e8f5e9",
          border: "2px solid",
          borderColor: "#a5d6a7",
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {!existingCropName && (
              <TextField
                label="作物名"
                placeholder="例: 米"
                value={cropNameInput}
                onChange={(e) => setCropNameInput(e.target.value)}
                fullWidth
              />
            )}
            {existingCropName && (
              <Typography variant="h5" gutterBottom>
                作物名: {existingCropName}
              </Typography>
            )}

            <TextField
              label="品種名"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="品種の特徴"
              name="character"
              value={formData.character}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="種植え時期"
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
          </Box>

          {errorMessage && (
            <Typography color="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={() =>
                setFormData({
                  variety: "",
                  character: "",
                  sowing: "",
                  nursery: "",
                  harvest: "",
                })
              }
            >
              クリア
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenConfirm}
            >
              登録
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 登録確認ダイアログ */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>登録確認</DialogTitle>
        <DialogContent>
          <Typography>作物名: {existingCropName || cropNameInput}</Typography>
          <Typography>品種名: {formData.variety}</Typography>
          <Typography>品種の特徴: {formData.character}</Typography>
          <Typography>種植え時期: {formData.sowing}</Typography>
          <Typography>育苗方法: {formData.nursery}</Typography>
          <Typography>収穫時期: {formData.harvest}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">
            キャンセル
          </Button>
          <Button onClick={handleRegister} color="primary" variant="contained">
            登録
          </Button>
        </DialogActions>
      </Dialog>

      {/* 登録完了ポップアップ */}
      <Dialog
        open={successPopupOpen}
        onClose={() => setSuccessPopupOpen(false)}
      >
        <DialogTitle>登録完了</DialogTitle>
        <DialogContent>
          <Typography>新しい品種を登録しました！</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAddAnother}
            color="primary"
            variant="contained"
          >
            続けて登録
          </Button>
          <Button onClick={handleGoToSearch} color="secondary">
            検索画面へ戻る
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default NewCreate;
