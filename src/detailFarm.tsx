import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { AddedVariety } from "./App"; // App.tsx の型を import

// 作物の詳細データ型
type CropDetail = {
  sowing: string;
  nursery: string;
  harvest: string;
};

// 作物データ型
type CropData = {
  varieties: string[];
  details: Record<string, CropDetail>;
  season: string;
  category: string;
};

// 日本語県名 → JSONファイル名の対応表
const prefMap: Record<string, string> = {
  北海道: "hokkaido",
  新潟県: "niigata",
};

// DetailFarm の Props 型
type DetailFarmProps = {
  getAdded: (pref: string, crop: string) => AddedVariety[];
};

// メインコンポーネント
function DetailFarm({ getAdded }: DetailFarmProps) {
  const { cropName, prefName } = useParams<{
    cropName: string;
    prefName: string;
  }>();
  const navigate = useNavigate();

  // JSONデータ＋追加品種をマージした結果を保持
  const [cropData, setCropData] = useState<Record<string, CropData> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // 詳細データ取得＋追加品種をマージ
  useEffect(() => {
    if (prefName && cropName) {
      const prefKey = prefMap[prefName];
      if (!prefKey) {
        setLoading(false);
        return;
      }

      fetch(`/data/${prefKey}Crops.json`)
        .then((res) => res.json())
        .then((data) => {
          // 新規登録された追加品種を取得
          const added = getAdded(prefName, cropName);

          //jsonにcropがない場合→からデータを作らずSkip
          // let cropdata = data[cropName] || {
          //   varieties: [],
          //   details: {},
          //   season: "",
          //   category: "",
          // };

          // JSON データに追加品種をマージ
          added.forEach((v) => {
            // すでに存在する品種名は追加しない
            if (!data[cropName].varieties.includes(v.variety)) {
              data[cropName].varieties.push(v.variety);
            }

            data[cropName].details[v.variety] = {
              sowing: "",
              nursery: v.nursery,
              harvest: v.harvest,
            };
          });

          setCropData(data);
        })
        .catch((err) => {
          console.error(err);
          const added = getAdded(prefName, cropName);
          if (added.length > 0) {
            const tempData = {
              [cropName]: {
                varieties: added.map((v) => v.variety),
                details: Object.fromEntries(
                  added.map((v) => [
                    v.variety,
                    { sowing: "", nursery: v.nursery, harvest: v.harvest },
                  ])
                ),
                season: "",
                category: "",
              },
            };
            setCropData(tempData);
          } else {
            setCropData(null);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [prefName, cropName, getAdded]);

  if (loading) return <div>Loading...</div>;
  if (!cropData) return <div>データが読み込めませんでした</div>;
  if (!cropName || !cropData[cropName])
    return <div>作物データが見つかりません</div>;

  const cropInfo = cropData[cropName];
  const varieties = cropInfo.varieties;
  //　画面描画
  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: "#e8f5e9",
          border: "2px solid",
          borderColor: "#a5d6a7",
          borderRadius: 2,
        }}
      >
        {/* 作物名と県名 */}
        <Typography variant="h4" gutterBottom>
          {cropName}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {prefName} の代表的な品種
        </Typography>

        {/* 新規作成ボタン */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "50px",
            mb: "-20px",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            sx={{
              position: "relative",
              top: "-50px",
              color: "orange",
              borderColor: "orange",
              "&:hover": {
                backgroundColor: "orange",
                color: "white",
                borderColor: "orange",
              },
            }}
            onClick={() =>
              navigate("/newCreate", { state: { cropName, prefName } })
            }
          >
            新規作成
          </Button>
        </Box>

        {/* 品種ごとのカード表示 */}
        {varieties.map((v, i) => {
          const details = cropInfo.details[v];
          return (
            <Card
              key={i}
              sx={{
                p: 3,
                mb: 3,
                backgroundColor: "#e8f5e9",
                border: "2px solid",
                borderColor: "#a5d6a7",
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6">{v}</Typography>

                {details && (
                  <>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>種植え時期</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{details.sowing}</Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>育苗方法</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{details.nursery}</Typography>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>収穫時期</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{details.harvest}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* 戻るボタン */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
        >
          <Button variant="outlined" onClick={() => navigate(-1)}>
            戻る
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

export default DetailFarm;
