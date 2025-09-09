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
  sowing: string;
  nursery: string;
  harvest: string;
};

type NewCreateProps = {
  addVariety: (pref: string, crop: string, item: AddedVariety) => void;
  cropName?: string;
  prefName?: string;
};

//メインコンポーネント
function NewCreate({ addVariety }: NewCreateProps) {
  const navigate = useNavigate(); // ← ここでフックを呼ぶ
  const location = useLocation();
  // location.state から cropName と prefName を取得（存在しない場合は "未選択" にフォールバック）
  const cropName = location.state?.cropName || "未選択";
  const prefName = location.state?.prefName || "未選択";
  const [open, setOpen] = useState(false); // ダイアログの開閉状態
  const [formData, setFormData] = useState({
    variety: "",
    sowing: "",
    nursery: "",
    harvest: "",
  });
  const [successMessage, setSuccessMessage] = useState(""); // 登録完了メッセージ
  const [errorMessage, setErrorMessage] = useState(""); // エラーメッセージ

  // 入力値を管理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 登録ボタンクリック時
  const handleOpenDialog = () => {
    setOpen(true);
  };

  // クリア処理
  const handleClear = () => {
    setFormData({
      variety: "",
      sowing: "",
      nursery: "",
      harvest: "",
    });
  };
  // キャンセル（閉じる）
  const handleClose = () => {
    setOpen(false);
  };

  // 登録実行
  const handleRegister = () => {
    // 入力値が空かどうか判定
    if (!formData.variety || !formData.nursery || !formData.harvest) {
      setErrorMessage("空白の項目があるため登録できません");
    } else {
      // プロトタイプなので仮IDを作る
      const newVariety: AddedVariety = {
        id: Date.now(),
        variety: formData.variety,
        sowing: formData.sowing,
        nursery: formData.nursery,
        harvest: formData.harvest,
      };

      // 親コンポーネントの状態に追加
      addVariety(prefName, cropName, newVariety);
      // 詳細画面に遷移
      navigate(`/detail/${cropName}/${prefName}`);
      // 登録処理
      setSuccessMessage("新しい品種を登録しました");
    }
    setOpen(false);
    // TODO: 実際の登録処理(API連携など)をここに書く

    // 任意: 数秒後に消す
    setTimeout(() => setSuccessMessage(""), 4000);
    setTimeout(() => setErrorMessage(""), 4000);
  };

  //画面描画
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
          {/* 選択中の作物名 */}
          <Typography variant="h5" gutterBottom>
            作物名: {cropName}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="品種名"
              name="variety"
              placeholder="例: コシヒカリ"
              value={formData.variety}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="種植え時期"
              name="sowing"
              placeholder="例: 3月下旬〜4月上旬"
              value={formData.sowing}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="育苗方法"
              name="nursery"
              placeholder="例: セルトレイ育苗"
              value={formData.nursery}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="収穫時期"
              name="harvest"
              placeholder="例: 9月下旬〜10月上旬"
              value={formData.harvest}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          {successMessage && (
            <Box
              sx={{
                position: "fixed",
                top: "5%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "white",
                border: "2px solid #4caf50", // 緑枠
                borderRadius: 2,
                p: 4,
                boxShadow: 3,
                zIndex: 1300,
                textAlign: "center",
                minWidth: 300,
                color: "#4caf50", // 緑文字
                fontWeight: "bold",
              }}
            >
              <Typography variant="h6" color="success.main">
                {successMessage}
              </Typography>
            </Box>
          )}

          {errorMessage && (
            <Box
              sx={{
                position: "fixed",
                top: "5%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "white",
                border: "2px solid #f44336", // 赤枠
                borderRadius: 2,
                p: 4,
                boxShadow: 3,
                zIndex: 1300,
                textAlign: "center",
                minWidth: 300,
                color: "#f44336", // 赤文字
                fontWeight: "bold",
              }}
            >
              <Typography variant="h6" color="error.main">
                {errorMessage}
              </Typography>
            </Box>
          )}

          {/* 登録確認ダイアログ */}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>登録確認</DialogTitle>
            <DialogContent>
              <Typography>この内容で登録しますか？</Typography>
              <Typography>品種名: {formData.variety}</Typography>
              <Typography>種植え時期: {formData.sowing}</Typography>
              <Typography>育苗方法: {formData.nursery}</Typography>
              <Typography>収穫時期: {formData.harvest}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                キャンセル
              </Button>
              <Button
                onClick={handleRegister}
                color="primary"
                variant="contained"
              >
                登録
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <Button variant="outlined" color="secondary" onClick={handleClear}>
          クリア
        </Button>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          登録
        </Button>
      </Box>
    </Box>
  );
}

export default NewCreate;
