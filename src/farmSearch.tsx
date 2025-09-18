import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import JapanMap from "./japanMap";

// useNavigateを安全にインポート（テスト環境でモック可能）
// let useNavigate: () => (path: string, options?: any) => void;
// try {
//   // 本番環境
//   // eslint-disable-next-line @typescript-eslint/no-var-requires
//   useNavigate = require("react-router-dom").useNavigate;
// } catch (e) {
//   // テスト環境ではモック
//   useNavigate = () => () => {};
// }

type PulldownData = {
  prefectures: string[];
  seasons: string[];
  categories: string[];
  months: number[];
};

type Crop = {
  name: string;
  season: string;
  category: string;
  sowing?: { start: number; end: number };
  harvest?: { start: number; end: number };
  hasDetail?: boolean;
};

const itemsPerPage = 5;

function FarmSearch() {
  const [open, setOpen] = useState(false);
  const [selectedPref, setSelectedPref] = useState("");
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
    months: [],
  });
  const [regionMap, setRegionMap] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/data/regionMap.json")
      .then((res) => res.json())
      .then((data) => setRegionMap(data));

    fetch("/data/pulldown.json")
      .then((res) => res.json())
      .then((data) => setPulldown(data));
  }, []);

  const handlePrefClick = (pref: string) => setSelectedPref(pref);

  const handleSearch = async () => {
    if (!selectedPref) {
      setPrefError(true);
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      const res = await fetch("/data/cropsData.json");
      const data: Record<string, Crop[]> = await res.json();

      let filtered = data[selectedPref] || [];
      if (selectedSeason)
        filtered = filtered.filter((c) => c.season.includes(selectedSeason));

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

  const handleClear = () => {
    setSelectedPref("");
    setSelectedSeason("");
    setSelectedCategory("");
    setResults([]);
    setPrefError(false);
    setSearched(false);
    setCurrentPage(1);
  };

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
    <Box sx={{ p: 4, flexDirection: { xs: "column", md: "row" } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        農作物検索アプリ
      </Typography>

      <Button variant="outlined" onClick={() => setOpen(true)}>
        Map
      </Button>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <div
          style={{
            width: "40vw",
            padding: 16,
            height: "100vh",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h3>都道府県検索</h3>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>

          <div style={{ marginTop: 16, flexGrow: 1 }}>
            <JapanMap
              selectedPref={selectedPref}
              onPrefClick={handlePrefClick}
            />
          </div>
        </div>
      </Drawer>

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

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button variant="outlined" color="secondary" onClick={handleClear}>
          クリア
        </Button>
        <Button variant="contained" color="primary" onClick={handleSearch}>
          検索
        </Button>
      </Box>

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
