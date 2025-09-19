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
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import JapanMap from "./japanMap";

// props で追加作物を受け取る
type Crop = {
  cropName: string;
  name: string;
  season: string;
  category: string;
  prefName: string; // 都道府県
  sowing?: { start: number; end: number };
  harvest?: { start: number; end: number };
  hasDetail?: boolean;
};

type PulldownData = {
  prefectures: string[];
  seasons: string[];
  categories: string[];
  months: number[];
};

const itemsPerPage = 5;

type Props = {
  addedCrops: Crop[];
};

function FarmSearch({ addedCrops }: Props) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const initialPref = location.state?.prefName || "";
  const [selectedPref, setSelectedPref] = useState(initialPref);
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

      // json からのデータ
      let filtered = data[selectedPref] || [];

      // 新規追加分を同じ都道府県にマージ
      const added = addedCrops.filter((c) => c.prefName === selectedPref);
      console.log("マージされる追加作物:", added);
      filtered = [...filtered, ...added];

      // フィルタリング
      if (selectedSeason)
        filtered = filtered.filter((c) => c.season.includes(selectedSeason));

      if (selectedCategory)
        filtered = filtered.filter((c) => c.category === selectedCategory);

      setResults(filtered);
      setPrefError(false);
      setSearched(true);
      setCurrentPage(1);
      console.log("マージされる追加作物:", added); // 確認用
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

  useEffect(() => {
    if (selectedPref) {
      // 選択中の都道府県に追加された作物のみを取得
      const added = addedCrops.filter((c) => c.prefName === selectedPref);

      // JSON からのデータとマージ（元の results も保持する場合）
      setResults((prev) => {
        // prev の中で同じ作物が重複していたら除外
        const filteredPrev = prev.filter(
          (r) => !added.some((a) => a.name === r.name)
        );
        return [...filteredPrev, ...added];
      });

      // ページングも更新
      setCurrentPage(1);
    }
  }, [addedCrops, selectedPref]);

  //画面描画
  return (
    <Box sx={{ p: 4, flexDirection: { xs: "column", md: "row" } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        農作物検索
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
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button
              variant="contained"
              size="medium"
              onClick={() =>
                navigate("/newCreate", {
                  state: { prefName: selectedPref },
                })
              }
              sx={{ position: "relative", top: "-50px" }}
            >
              新規作成
            </Button>
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
                    size="medium"
                    disabled={!crop.hasDetail}
                    onClick={() =>
                      navigate(`/detail/${crop.name}/${selectedPref}`)
                    }
                  >
                    詳細
                  </Button>
                  <Button
                    variant="contained"
                    size="medium"
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
                    size="medium"
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
