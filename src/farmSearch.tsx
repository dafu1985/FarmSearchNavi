import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  FormHelperText,
} from "@mui/material";
import { useNavigate } from "react-router";

type PulldownData = {
  prefectures: string[];
  seasons: string[];
  categories: string[];
  months: number[];
};

type Crop = {
  name: string;
  season?: string;
  category: string;
  sowing?: { start: number; end: number };
  harvest?: { start: number; end: number };
  hasDetail?: boolean;
};

const itemsPerPage = 5;

function FarmSearch() {
  // 選択状態
  const [selectedPref, setSelectedPref] = useState(""); // 都道府県
  const [selectedSeason, setSelectedSeason] = useState(""); // 季節
  const [selectedCategory, setSelectedCategory] = useState(""); // カテゴリ

  // 結果
  const [results, setResults] = useState<Crop[]>([]);
  const [prefError, setPrefError] = useState(false); // 都道府県未選択エラー
  const [searched, setSearched] = useState(false);

  // ページング
  const [currentPage, setCurrentPage] = useState(1);
  const [pagedResults, setPagedResults] = useState<Crop[]>([]);
  const [displayStart, setDisplayStart] = useState(0);
  const [displayEnd, setDisplayEnd] = useState(0);

  // プルダウン
  const [pulldown, setPulldown] = useState<PulldownData>({
    prefectures: [],
    seasons: [],
    categories: [],
    months: [],
  });

  // 都道府県→地域マップ
  const [regionMap, setRegionMap] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  // 初期表示時にプルダウンデータと地域マップを取得
  useEffect(() => {
    fetch("/data/regionMap.json")
      .then((res) => res.json())
      .then((data) => setRegionMap(data));

    fetch("/data/pulldown.json")
      .then((res) => res.json())
      .then((data) => setPulldown(data));
  }, []);

  // 検索処理
  const handleSearch = async () => {
    if (!selectedPref) {
      setPrefError(true);
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      const res = await fetch("/data/cropsData.json"); // JSON のパス
      const data: Record<string, Crop[]> = await res.json();

      let filtered = data[selectedPref] || [];
      if (selectedSeason)
        filtered = filtered.filter((c) => c.season === selectedSeason);
      if (selectedCategory)
        filtered = filtered.filter((c) => c.category === selectedCategory);

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

  // クリア処理
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

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentItemsCount = pagedResults.length;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        農作物検索アプリ
      </Typography>

      {/* 検索条件カード */}
      <Card sx={{ p: 3, mb: 3, backgroundColor: "#e8f5e9" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            検索条件
          </Typography>

          {/* 都道府県 */}
          <FormControl sx={{ minWidth: 240, mb: 3 }}>
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
              <FormHelperText error>都道府県を選択してください</FormHelperText>
            )}
            {selectedPref && regionMap[selectedPref] && (
              <Typography sx={{ color: "red", mt: 1 }}>
                {regionMap[selectedPref]}
              </Typography>
            )}
          </FormControl>

          {/* 季節 */}
          <FormControl sx={{ minWidth: 240, mb: 3, ml: 2 }}>
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

          {/* カテゴリ */}
          <FormControl sx={{ minWidth: 240, mb: 3, ml: 2 }}>
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
        </CardContent>
      </Card>

      {/* ボタン */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button variant="outlined" color="secondary" onClick={handleClear}>
          クリア
        </Button>
        <Button variant="contained" color="primary" onClick={handleSearch}>
          検索
        </Button>
      </Box>

      {/* 検索結果 */}
      <br />
      {searched && (
        <Card sx={{ p: 3, mb: 3, backgroundColor: "#e8f5e9" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
            <Typography variant="h6">検索結果</Typography>
            {results.length > 0 && (
              <Typography variant="subtitle1">
                {`${currentItemsCount}件表示中 (${displayStart}〜${displayEnd}件中)`}
              </Typography>
            )}
          </Box>

          {pagedResults.map((crop, i) => (
            <Card key={i} sx={{ my: 1, p: 2, backgroundColor: "#f1f8e9" }}>
              <CardContent>
                <Typography variant="h6">{crop.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {crop.season ?? "-"}・{crop.category}
                </Typography>
                {/* ボタン制御 */}
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={!crop.hasDetail}
                    onClick={() =>
                      navigate(`/detail/${crop.name}/${selectedPref}`)
                    }
                  >
                    詳細
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    disabled={!!crop.hasDetail}
                    onClick={() =>
                      navigate("/newCreate", {
                        state: { cropName: crop.name, prefName: selectedPref },
                      })
                    }
                  >
                    新規作成
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* ページング */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 1,
                justifyContent: "flex-end",
              }}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}

export default FarmSearch;
