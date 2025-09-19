// TopPage.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function TopPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh", // 画面いっぱい
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        textAlign: "center",
        backgroundImage: `url('1513532_m.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 半透明オーバーレイ */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.4)", // 黒の半透明
          zIndex: 1,
        }}
      />
      {/* コンテンツ */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Typography
          variant="h2"
          sx={{
            mb: 3,
            fontFamily: "'Yuji Syuku', sans-serif",
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
          }}
        >
          農作物ナビ
        </Typography>
        <Typography
          variant="h5"
          sx={{ mb: 5, textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}
        >
          旬の作物や品種情報、種まき時期、収穫時期を簡単にチェック
        </Typography>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => navigate("/search")}
        >
          検索スタート
        </Button>
      </Box>
    </Box>
  );
}

export default TopPage;
