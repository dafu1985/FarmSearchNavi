import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import cropsCalendarJson from "./data/cropsCalendar.json";

// JSON の型定義
type Region = "冷涼地" | "中間地" | "暖地";
type CropCalendar = {
  [crop: string]: {
    [region in Region]: {
      種まき?: string;
      植え付け?: string;
      収穫: string;
    };
  };
};

const cropsCalendar = cropsCalendarJson as CropCalendar;

const regions: Region[] = ["冷涼地", "中間地", "暖地"];

function parseMonths(str: string) {
  if (!str) return [];
  return str.split(",").flatMap((range) => {
    if (range.includes("-")) {
      const [start, end] = range.replace("月", "").split("-");
      const startNum = parseInt(start);
      const endNum = parseInt(end);
      if (!isNaN(startNum) && !isNaN(endNum)) {
        // 連続する月を配列化
        const months = [];
        for (let i = startNum; i <= endNum; i++) months.push(i);
        return months;
      }
    }
    const num = parseInt(range.replace("月", ""));
    return !isNaN(num) ? [num] : [];
  });
}

function CropCalendar() {
  const [selectedCrop, setSelectedCrop] =
    useState<keyof typeof cropsCalendar>("にんじん");
  const [selectedRegion, setSelectedRegion] = useState<Region>("中間地");

  // 型アサーションで安全にアクセス
  const data = cropsCalendar[selectedCrop][selectedRegion];

  // チャート用に数値に変換
  const sowingMonths = parseMonths(data["種まき"] || data["植え付け"] || "");
  const harvestMonths = parseMonths(data["収穫"] || "");

  // 12ヶ月でバーの長さを表現
  const chartData = [
    {
      name: "種まき/植え付け",
      value: sowingMonths.length,
    },
    {
      name: "収穫",
      value: harvestMonths.length,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        作付けカレンダー
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>作物</InputLabel>
          <Select
            value={selectedCrop}
            onChange={(e) =>
              setSelectedCrop(e.target.value as keyof typeof cropsCalendar)
            }
          >
            {Object.keys(cropsCalendar).map((crop) => (
              <MenuItem key={crop} value={crop}>
                {crop}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>地域</InputLabel>
          <Select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as Region)}
          >
            {regions.map((region) => (
              <MenuItem key={region} value={region}>
                {region}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card sx={{ p: 2 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" domain={[0, 12]} />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
}

export default CropCalendar;
