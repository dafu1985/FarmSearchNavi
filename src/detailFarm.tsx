import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
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

type CropDetail = {
  sowing: string;
  nursery: string;
  harvest: string;
};

type CropData = {
  varieties: string[];
  details: Record<string, CropDetail>;
  season: string;
  category: string;
};

// 日本語名 → ファイル名の対応表（コンポーネント外に出す）
const prefMap: Record<string, string> = {
  北海道: "hokkaido",
  新潟県: "niigata",
};

//メインコンポーネント
function DetailFarm() {
  const { cropName, prefName } = useParams<{
    cropName: string;
    prefName: string;
  }>();

  const navigate = useNavigate();
  const [cropData, setCropData] = useState<Record<string, CropData> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  //　詳細データの取得
  useEffect(() => {
    console.log("prefName:", prefName, "cropName:", cropName);
    if (prefName && cropName) {
      const prefKey = prefMap[prefName];
      console.log("prefKey:", prefKey);
      if (!prefKey) return setLoading(false);

      fetch(`/data/${prefKey}Crops.json`)
        .then((res) => {
          console.log("res.ok", res.ok);
          return res.json();
        })
        .then((data) => {
          console.log("data", data);
          setCropData(data);
        })
        .catch((err) => {
          console.error(err);
          setCropData(null);
        })
        .finally(() => setLoading(false));
    }
  }, [prefName, cropName]);

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
        <Typography variant="h4" gutterBottom>
          {cropName}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {prefName} の代表的な品種
        </Typography>

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
