import React, { useState } from "react";
import { ReactComponent as JapanSvg } from "./assets/jp.svg";
import rawPrefMap from "./prefMap.json";

// JSONの型を明示して、TSで安全に参照できるようにする
const prefMap: Record<string, string> = rawPrefMap;

interface JapanMapProps {
  selectedPref: string | null;
  onPrefClick: (pref: string) => void;
}

// 都道府県ごとの地域区分
const regionMap: Record<string, string> = {
  北海道: "冷涼地",
  青森県: "冷涼地",
  岩手県: "冷涼地",
  秋田県: "冷涼地",
  山形県: "冷涼地",
  宮城県: "冷涼地",
  福島県: "中間地",
  茨城県: "中間地",
  栃木県: "中間地",
  群馬県: "中間地",
  埼玉県: "中間地",
  千葉県: "中間地",
  東京都: "中間地",
  神奈川県: "中間地",
  新潟県: "中間地",
  富山県: "中間地",
  石川県: "中間地",
  福井県: "中間地",
  山梨県: "中間地",
  長野県: "冷涼地",
  岐阜県: "中間地",
  静岡県: "中間地",
  愛知県: "中間地",
  三重県: "中間地",
  滋賀県: "中間地",
  京都府: "中間地",
  大阪府: "中間地",
  兵庫県: "中間地",
  奈良県: "中間地",
  和歌山県: "暖地",
  鳥取県: "中間地",
  島根県: "中間地",
  岡山県: "中間地",
  広島県: "中間地",
  山口県: "中間地",
  徳島県: "暖地",
  香川県: "暖地",
  愛媛県: "暖地",
  高知県: "暖地",
  福岡県: "中間地",
  佐賀県: "中間地",
  長崎県: "中間地",
  熊本県: "中間地",
  大分県: "中間地",
  宮崎県: "暖地",
  鹿児島県: "暖地",
  沖縄県: "暖地",
};

// 色分けロジック
function getPrefColor(
  pref: string,
  hoveredPref: string | null,
  selectedPref: string | null
): string {
  if (selectedPref === pref) return "#FF69B4"; // 選択中 → ピンク
  if (hoveredPref === pref) {
    const zone = regionMap[pref];
    if (zone === "冷涼地") return "#87CEFA"; // 水色
    if (zone === "中間地") return "#98FB98"; // 薄緑
    if (zone === "暖地") return "#FFDAB9"; // 薄オレンジ
  }
  const zone = regionMap[pref];
  if (zone === "冷涼地") return "#5CACEE"; // 濃い水色
  if (zone === "中間地") return "#66CD66"; // 濃い緑
  if (zone === "暖地") return "#FF8C42"; // 濃いオレンジ
  return "#D3D3D3"; // その他（未定義）
}

function JapanMap({ selectedPref, onPrefClick }: JapanMapProps) {
  const [hoveredPref, setHoveredPref] = useState<string | null>(null);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <JapanSvg
        style={{
          width: "100%",
          height: "auto",
          minHeight: "300px", // スマホでも最低限の高さ
          maxHeight: "70vh", // 画面高さの7割まで
          cursor: "pointer",
        }}
        preserveAspectRatio="xMidYMid meet"
        onClick={(e: React.MouseEvent<SVGElement, MouseEvent>) => {
          const code = (e.target as SVGElement).id;
          const pref = prefMap[code];
          if (pref) onPrefClick(pref);
        }}
        onMouseOver={(e: React.MouseEvent<SVGElement, MouseEvent>) => {
          const code = (e.target as SVGElement).id;
          const pref = prefMap[code];
          if (pref) setHoveredPref(pref);
        }}
        onMouseOut={() => setHoveredPref(null)}
      />

      <style>
        {Object.keys(prefMap)
          .map((code) => {
            const pref = prefMap[code];
            return `#${code} { fill: ${getPrefColor(
              pref,
              hoveredPref,
              selectedPref
            )}; transition: fill 0.2s ease; }`;
          })
          .join("\n")}
      </style>
    </div>
  );
}

export default JapanMap;
