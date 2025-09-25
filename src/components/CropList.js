import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

const CropList = () => {
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "crops"), orderBy("name"));

    // リアルタイム購読開始
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cropData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCrops(cropData);
    });

    // クリーンアップ（購読解除）
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>作物一覧</h2>
      {crops.length === 0 ? (
        <p>データがありません</p>
      ) : (
        <ul>
          {crops.map(crop => (
            <li key={crop.id}>
              <strong>{crop.name}</strong> ({crop.season}) - {crop.category}
              {crop.variety && ` | 品種名: ${crop.variety}`}
              {crop.character && ` | 特徴: ${crop.character}`}
              {crop.sowing && ` | 種まき: ${crop.sowing}`}
              {crop.nursery && ` | 育苗方法: ${crop.nursery}`}
              {crop.harvest && ` | 収穫: ${crop.harvest}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CropList;
