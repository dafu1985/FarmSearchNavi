import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  FormHelperText,
  Drawer,
  Dialog,
  DialogTitle,
  DialogActions,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import JapanMap from "./japanMap";
import { db } from "./firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

// 🔹 JSON データの読み込み
import cropsDataJsonRaw from "./data/cropsData.json";
// 型変換: cropNameとprefNameを追加
const cropsDataJson: Record<string, Crop[]> = Object.fromEntries(
  Object.entries(cropsDataJsonRaw).map(([prefName, crops]) => [
    prefName,
    (crops as any[]).map((c) => ({
      ...c,
      cropName: c.name, // cropNameにnameを割り当て
      prefName, // prefNameを追加
    })),
  ])
);

type Crop = {
  id?: string;
  cropName: string;
  name: string;
  season: string;
  category: string;
  prefName: string;
  hasDetail?: boolean;
};

type PulldownData = {
  prefectures: string[];
  seasons: string[];
  categories: string[];
};

// type Props = {
//   addedCrops: Crop[];
// };

const itemsPerPage = 5;
const USE_FIREBASE = process.env.REACT_APP_USE_FIREBASE === "true";

type FarmSearchProps = {
  addedCrops: Crop[];
  deleteCrops: (ids: string[]) => Promise<void>; // App から渡される削除関数
};

function FarmSearch({ addedCrops, deleteCrops }: FarmSearchProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPref, setSelectedPref] = useState(
    location.state?.prefName || ""
  );
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [results, setResults] = useState<Crop[]>([]);
  const [prefError, setPrefError] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagedResults, setPagedResults] = useState<Crop[]>([]);
  const [displayStart, setDisplayStart] = useState(0);
  const [displayEnd, setDisplayEnd] = useState(0);

  const [pulldown, setPulldown] = useState<PulldownData>({
    prefectures: [],
    seasons: [],
    categories: [],
  });

  const [regionMap, setRegionMap] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false); // 削除確認ダイアログ

  // 初期データ取得（プルダウン・都道府県名表示用）
  useEffect(() => {
    fetch("/data/pulldown.json")
      .then((res) => res.json())
      .then((data) => setPulldown(data));

    fetch("/data/regionMap.json")
      .then((res) => res.json())
      .then((data) => setRegionMap(data));
  }, []);

  // 都道府県クリック
  const handlePrefClick = (pref: string) => setSelectedPref(pref);

  // 検索実行
  // 検索実行
  const handleSearch = async () => {
    if (!selectedPref) {
      setPrefError(true);
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      let filtered: Crop[] = [];

      if (USE_FIREBASE) {
        // 🔹 本番環境 (Firebase)
        const q = query(
          collection(db, "crops"),
          where("prefName", "==", selectedPref)
        );
        const querySnapshot = await getDocs(q);
        filtered = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Firestore の doc.id を使用
          ...(doc.data() as Crop),
        }));
      } else {
        // 🔹 開発環境 (JSON)
        const jsonData = (cropsDataJson[selectedPref] || []).map((c) => ({
          ...c,
          cropName: c.name,
          prefName: selectedPref,
          id: `${selectedPref}_${c.name}_${c.season}_${c.category}`, // ユニーク ID
        }));

        // addedCrops をマージ
        const merged = [...jsonData, ...addedCrops];
        // id をキーにしてユニーク化
        filtered = Array.from(
          new Map(merged.map((item) => [item.id, item])).values()
        );
      }

      // React 側でのフィルタ処理
      if (selectedSeason) {
        filtered = filtered.filter((c) => c.season.includes(selectedSeason));
      }
      if (selectedCategory) {
        filtered = filtered.filter((c) => c.category === selectedCategory);
      }

      setResults(filtered);
      setPrefError(false);
      setSearched(true);
      setCurrentPage(1);
    } catch (error) {
      console.error("作物データの取得に失敗しました", error);
      setResults([]);
      setPrefError(false);
      setSearched(true);
    }
  };

  // クリア
  const handleClear = () => {
    setSelectedPref("");
    setSelectedSeason("");
    setSelectedCategory("");
    setResults([]);
    setPrefError(false);
    setSearched(false);
    setCurrentPage(1);
  };

  // ページング処理
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(currentPage * itemsPerPage, results.length);
    setPagedResults(results.slice(startIndex, endIndex));
    setDisplayStart(results.length > 0 ? startIndex + 1 : 0);
    setDisplayEnd(endIndex);
  }, [results, currentPage]);

  // addedCrops の変更を監視して検索結果に反映
  // useEffect(() => {
  //   if (!selectedPref) return;
  //   const newAdded = addedCrops.filter(
  //     (c) => c.prefName === selectedPref && !results.some((r) => r.id === c.id) // 🔹 id ベースで判定
  //   );
  //   if (newAdded.length > 0) {
  //     setResults((prev) => [...prev, ...newAdded]);
  //   }
  // }, [addedCrops, selectedPref, results]);

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentItemsCount = pagedResults.length;

  // 🔹 追加: チェックボックスの切り替え関数
  const handleCheck = (id: string) => {
    setSelectedIds(
      (prev) =>
        prev.includes(id)
          ? prev.filter((i) => i !== id) // すでに含まれていれば外す
          : [...prev, id] // 含まれていなければ追加
    );
  };

  // 🔹 削除ボタンの処理
  // 共通のユニークキーを生成する関数
  const getCropKey = (crop: any) =>
    crop.id ??
    `${crop.prefName}_${crop.cropName}_${crop.season}_${crop.category}`;

  const executeDelete = async () => {
    if (selectedIds.length === 0) return;

    if (process.env.REACT_APP_USE_FIREBASE === "true") {
      // Firestore から削除
      try {
        for (const id of selectedIds) {
          await deleteDoc(doc(collection(db, "crops"), id));
        }
        // ローカル state から削除
        setResults((prev) =>
          prev.filter((c) => !selectedIds.includes(getCropKey(c)))
        );
        setSelectedIds([]);
        console.log("選択した作物を削除しました");
      } catch (error) {
        console.error("Firestore削除エラー:", error);
      }
    } else {
      // JSON 開発環境用の削除
      setResults((prev) =>
        prev.filter((c) => !selectedIds.includes(getCropKey(c)))
      );
      setSelectedIds([]);
      console.log("選択した作物をローカルから削除しました");
    }
    setConfirmOpen(false); // ダイアログを閉じる
  };
  // ダイアログを開くだけ
  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setConfirmOpen(true);
  };

  return (
    <Box sx={{ p: 4, flexDirection: { xs: "column", md: "row" } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        農作物検索
      </Typography>

      <Button variant="outlined" onClick={() => setOpen(true)}>
        Map
      </Button>

      {/* 地図 Drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: "40vw",
            p: 2,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">都道府県検索</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ mt: 2, flexGrow: 1 }}>
            <JapanMap
              selectedPref={selectedPref}
              onPrefClick={handlePrefClick}
            />
          </Box>
        </Box>
      </Drawer>

      {/* 検索フォーム */}
      <Card sx={{ p: 3, mb: 3, backgroundColor: "#e8f5e9" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            検索条件
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>都道府県</InputLabel>
                <Select
                  value={selectedPref}
                  onChange={(e) => {
                    setSelectedPref(e.target.value);
                    setPrefError(false);
                  }}
                >
                  {pulldown.prefectures.map((pref) => (
                    <MenuItem key={pref} value={pref}>
                      {pref}
                    </MenuItem>
                  ))}
                </Select>
                {prefError && (
                  <FormHelperText error>
                    都道府県を選択してください
                  </FormHelperText>
                )}
                {selectedPref && regionMap[selectedPref] && (
                  <Typography sx={{ color: "red", mt: 1 }}>
                    {regionMap[selectedPref]}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>季節</InputLabel>
                <Select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                >
                  {pulldown.seasons.map((season) => (
                    <MenuItem key={season} value={season}>
                      {season}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>カテゴリ</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {pulldown.categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 検索・クリアボタン */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          戻る
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleClear}>
          クリア
        </Button>
        <Button variant="contained" color="primary" onClick={handleSearch}>
          検索
        </Button>
      </Box>

      {/* 検索結果 */}
      {searched && (
        <Card sx={{ p: 3, mb: 3, backgroundColor: "#e8f5e9" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
            <Typography variant="h6">検索結果</Typography>
            {results.length > 0 && (
              <Typography variant="subtitle1">{`${currentItemsCount}件表示中 (${displayStart}〜${displayEnd}件中)`}</Typography>
            )}
          </Box>
          {/* 新規作成ボタン */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button
              variant="contained"
              size="medium"
              onClick={() =>
                navigate("/newCreate", { state: { prefName: selectedPref } })
              }
            >
              新規作成
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={selectedIds.length === 0} // 選択がないと無効
              onClick={handleDeleteClick}
            >
              削除
            </Button>
          </Box>
          {/* 検索結果一覧*/}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {pagedResults.map((c) => (
              <Grid
                item
                xs={12}
                md={6}
                key={`${c.prefName}_${c.cropName}_${c.season}_${c.category}`}
              >
                <Card>
                  <CardContent>
                    {/* ✅ チェックボックスを追加 */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          // c.id が存在しない場合はユニークな ID を生成
                          checked={selectedIds.includes(
                            c.id ??
                              `${c.prefName}_${c.cropName}_${c.season}_${c.category}`
                          )}
                          onChange={() =>
                            handleCheck(
                              c.id ??
                                `${c.prefName}_${c.cropName}_${c.season}_${c.category}`
                            )
                          }
                        />
                      }
                      label={`${c.prefName} - ${c.name}`}
                    />

                    <Typography fontWeight="bold">{c.name}</Typography>
                    <Typography>季節: {c.season}</Typography>
                    <Typography>カテゴリ: {c.category}</Typography>
                    <Typography>都道府県: {c.prefName}</Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="medium"
                        disabled={!c.hasDetail}
                        onClick={() =>
                          navigate(`/detail/${c.name}/${selectedPref}`)
                        }
                      >
                        詳細
                      </Button>
                      <Button
                        variant="contained"
                        size="medium"
                        disabled={!!c.hasDetail}
                        onClick={() =>
                          navigate("/newCreate", {
                            state: { cropName: c.name, prefName: selectedPref },
                          })
                        }
                      >
                        新規作成
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* ページ切替 */}
          {results.length > itemsPerPage && (
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <Button
                    key={num}
                    variant={num === currentPage ? "contained" : "outlined"}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </Button>
                )
              )}
            </Box>
          )}
          {/* 削除確認ダイアログ */}
          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>削除確認</DialogTitle>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)} color="secondary">
                キャンセル
              </Button>
              <Button onClick={executeDelete} color="error" variant="contained">
                削除
              </Button>
            </DialogActions>
          </Dialog>
        </Card>
      )}
    </Box>
  );
}

export default FarmSearch;
