// App.tsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

import TopPage from "./topPage";
import FarmSearch from "./farmSearch";
import DetailFarm from "./detailFarm";
import NewCreate from "./newCreate";

// 追加品種の型
export type AddedVariety = {
  variety: string;
  sowing: string;
  nursery: string;
  harvest: string;
};

// キー形式: `${pref}__${crop}`
const makeKey = (pref: string, crop: string) => `${pref}__${crop}`;

function App() {
  // 追加品種を保持する共有 state（親に置く）
  const [addedVarieties, setAddedVarieties] = useState<
    Record<string, AddedVariety[]>
  >({});

  // NewCreate から呼ばれる登録関数
  const addVariety = (pref: string, crop: string, item: AddedVariety) => {
    const key = makeKey(pref, crop);
    setAddedVarieties((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), item],
    }));
  };

  // DetailFarm が参照するための取得関数
  const getAdded = (pref: string, crop: string): AddedVariety[] => {
    return addedVarieties[makeKey(pref, crop)] ?? [];
  };

  return (
    <Box sx={{ p: 2 }}>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/search" element={<FarmSearch />} />

        {/* props を受け取るコンポーネントに関数を渡す */}
        <Route
          path="/detail/:cropName/:prefName"
          element={<DetailFarm getAdded={getAdded} />}
        />

        <Route
          path="/newCreate"
          element={<NewCreate addVariety={addVariety} />}
        />
      </Routes>
    </Box>
  );
}

export default App;
