import React from "react";

interface JapanMapProps {
  selectedPref: string;
  onPrefClick: (pref: string) => void;
}

interface Prefecture {
  pref: string;
  d: string;
}

// サンプルの都道府県データ
const prefectures: Prefecture[] = [
  { pref: "北海道", d: "M 559.03 223.35 560.9 224.27 ..." },
  { pref: "青森県", d: "M 791.85 341.77 793.4 341.88 ..." },
];

const JapanMap: React.FC<JapanMapProps> = ({ selectedPref, onPrefClick }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="800"
      height="691"
      viewBox="0 0 800 691"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g id="ne_10m_admin_1_states_provinces">
        {prefectures.map((pref, i) => (
          <path
            key={i}
            d={pref.d}
            fill={selectedPref === pref.pref ? "#FF6347" : "#B0C4DE"}
            stroke="#000"
            strokeWidth={0.5}
            fillRule="evenodd"
            onClick={() => onPrefClick(pref.pref)}
          >
            <title>{pref.pref}</title>
          </path>
        ))}
      </g>
    </svg>
  );
};

export default JapanMap;
