// App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

import TopPage from "./topPage";
import FarmSearch from "./farmSearch";
import DetailFarm from "./detailFarm";
// import CropCalendar from "./CropCalendar";

function App() {
  return (
    <>
      {/* <CropCalendar />; */}
      {/* 簡易ナビバー */}
      {/* <AppBar position="static"> */}
      {/* <Toolbar> */}
      {/* <Typography variant="h6" sx={{ flexGrow: 1 }}>
          農作物ナビ
        </Typography> */}
      {/* Linkを使って画面遷移 */}
      {/* <Button color="inherit" component={Link} to="/">
          トップ
        </Button> */}
      {/* </Toolbar> */}
      {/* </AppBar> */}
      {/* 画面切り替え部分 */}
      <Box sx={{ p: 2 }}>
        <Routes>
          {/* トップ画面 */}
          <Route path="/" element={<TopPage />} />

          {/* 検索画面 */}
          <Route path="/search" element={<FarmSearch />} />

          {/* 詳細画面 */}
          <Route path="/detail/:cropName/:prefName" element={<DetailFarm />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
