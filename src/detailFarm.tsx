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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { AddedVariety } from "./App"; // App.tsx の型を import
import { db } from "./firebase/firebase"; // Firebase 利用フラグと db
import { doc, getDoc } from "firebase/firestore";

// Firebase利用フラグ（true: Firebase, false: JSONファイル）
const USE_FIREBASE = false;

// 作物の詳細データ型
type CropDetail = {
  sowing: string;
  character: string; // 特徴
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

  const [confirmOpen, setConfirmOpen] = useState(false); // 戻り先ダイアログ
  // JSONデータ＋追加品種をマージした結果を保持
  const [cropData, setCropData] = useState<Record<string, CropData> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!prefName || !cropName) return;

    const prefKey = prefMap[prefName];
    if (!prefKey) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        let data: Record<string, CropData> = {};

        if (USE_FIREBASE) {
          // 🔹 Firebase 本番環境から取得
          const docRef = doc(db, "crops", `${prefName}_${cropName}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            data[cropName] = docSnap.data() as CropData;
          } else {
            data[cropName] = {
              varieties: [],
              details: {},
              season: "",
              category: "",
            };
          }
        } else {
          // 🔹 開発環境: JSON ファイルから取得
          const res = await fetch(`/data/${prefKey}Crops.json`);
          const jsonData = await res.json();
          if (jsonData[cropName]) {
            data[cropName] = jsonData[cropName];
          } else {
            data[cropName] = {
              varieties: [],
              details: {},
              season: "",
              category: "",
            };
          }
        }

        // 🔹 追加品種をマージ
        const added = getAdded(prefName, cropName);
        added.forEach((v) => {
          if (!data[cropName].varieties.includes(v.variety)) {
            data[cropName].varieties.push(v.variety);
          }
          data[cropName].details[v.variety] = {
            sowing: v.sowing,
            character: v.character,
            nursery: v.nursery,
            harvest: v.harvest,
          };
        });

        setCropData(data);
      } catch (err) {
        console.error(err);
        setCropData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prefName, cropName, getAdded]);

  if (loading) return <div>Loading...</div>;
  if (!cropData) return <div>データが読み込めませんでした</div>;
  if (!cropName || !cropData[cropName])
    return <div>作物データが見つかりません</div>;

  const cropInfo = cropData[cropName];
  const varieties = cropInfo.varieties;

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
            size="medium"
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
                        <Typography>品種の特徴</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{details.character}</Typography>
                      </AccordionDetails>
                    </Accordion>

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
          <Button
            variant="outlined"
            onClick={() => setConfirmOpen(true)} // ← 直接 navigate せず、ダイアログを開く
          >
            戻る
          </Button>
        </Box>

        {/* 登録確認ダイアログ */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>戻り先選択</DialogTitle>
          <DialogActions>
            <Button
              onClick={() => {
                setConfirmOpen(false); // ダイアログを閉じる
                navigate("/search"); // 検索画面に遷移
              }}
              color="secondary"
            >
              検索画面
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              1つ前
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Box>
  );
}

export default DetailFarm;
