import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

import TopPage from "./topPage";
import FarmSearch from "./farmSearch";
import DetailFarm from "./detailFarm";
import NewCreate from "./newCreate";

export type AddedVariety = {
  id: number;
  variety: string;
  character: string;
  sowing: string;
  nursery: string;
  harvest: string;
};

export type Crop = {
  cropName: string;
  name: string;
  season: string;
  prefName: string;
  category: string;
  sowing?: { start: number; end: number };
  harvest?: { start: number; end: number };
  hasDetail?: boolean;
};

// 作物キー生成
const makeKey = (pref: string, crop: string) => `${pref}__${crop}`;

function App() {
  const [addedVarieties, setAddedVarieties] = useState<
    Record<string, AddedVariety[]>
  >({});
  const [addedCrops, setAddedCrops] = useState<Crop[]>([]);

  // 品種追加
  const addVariety = (pref: string, crop: string, item: AddedVariety) => {
    const key = makeKey(pref, crop);
    setAddedVarieties((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), item],
    }));
  };

  // 作物追加
  const addCrop = (
    prefName: string,
    cropName: string,
    season: string,
    category: string
  ) => {
    if (!prefName || prefName === "未選択") {
      console.warn("都道府県が選択されていない為追加できません");
      return;
    }

    const newCrop: Crop = {
      cropName,
      name: cropName,
      prefName,
      season,
      category,
      hasDetail: true,
    };

    setAddedCrops((prev) => [...prev, newCrop]);
  };

  const getAdded = (pref: string, crop: string): AddedVariety[] => {
    return addedVarieties[makeKey(pref, crop)] ?? [];
  };

  // FarmSearch に渡す際に最新の追加作物を返す
  const getAddedCropsAsCrop = (): Crop[] => {
    return addedCrops.map((c) => ({
      cropName: c.cropName,
      name: c.name,
      prefName: c.prefName,
      season: c.season || "-",
      category: c.category || "-",
      hasDetail: true,
    }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route
          path="/search"
          element={<FarmSearch addedCrops={getAddedCropsAsCrop()} />}
        />
        <Route
          path="/detail/:cropName/:prefName"
          element={<DetailFarm getAdded={getAdded} />}
        />
        <Route
          path="/newCreate"
          element={<NewCreate addVariety={addVariety} addCrop={addCrop} />}
        />
      </Routes>
    </Box>
  );
}

export default App;
