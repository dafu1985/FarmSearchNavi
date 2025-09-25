import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase/firebase"; // Firebase 利用フラグと db

import TopPage from "./topPage";
import FarmSearch from "./farmSearch";
import DetailFarm from "./detailFarm";
import NewCreate from "./newCreate";
// import { seedCrops } from "./seedCrops";

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

// 作物キー生成（ローカルstate用）
const makeKey = (pref: string, crop: string) => `${pref}__${crop}`;
const handleDeleteCrops = async (ids: string[]) => {
  // Firestore削除 or ローカル配列更新処理を書く
  console.log("削除対象ID:", ids);
};
function App() {
  useEffect(() => {}, []);

  const [addedVarieties, setAddedVarieties] = useState<
    Record<string, AddedVariety[]>
  >({});
  const [addedCrops, setAddedCrops] = useState<Crop[]>([]);

  // 品種追加（Firestoreにも保存）
  const addVariety = async (pref: string, crop: string, item: AddedVariety) => {
    const key = makeKey(pref, crop);
    setAddedVarieties((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), item],
    }));

    try {
      await addDoc(collection(db, "varieties"), {
        prefName: pref,
        cropName: crop,
        ...item,
      });
      console.log("品種をFirestoreに保存しました");
    } catch (error) {
      console.error("品種のFirestore保存に失敗:", error);
    }
  };

  // 作物追加（Firestoreにも保存）
  const addCrop = async (
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

    try {
      await addDoc(collection(db, "crops"), newCrop);
      console.log("作物をFirestoreに保存しました");
    } catch (error) {
      console.error("作物のFirestore保存に失敗:", error);
    }
  };

  // ローカル state 用：品種取得
  const getAdded = (pref: string, crop: string): AddedVariety[] => {
    return addedVarieties[makeKey(pref, crop)] ?? [];
  };

  // ローカル state 用：FarmSearch に渡す作物
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
          element={
            <FarmSearch
              addedCrops={getAddedCropsAsCrop()}
              deleteCrops={handleDeleteCrops}
            />
          }
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
