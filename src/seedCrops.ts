import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import cropsData from "./cropsData.json"; // ← JSONを直接import

export async function seedCrops() {
  try {
    for (const [prefName, crops] of Object.entries(cropsData)) {
      for (const crop of crops as unknown as any[]) {
        await addDoc(collection(db, "crops"), {
          prefName,
          ...crop
        });
      }
    }
    console.log("✅ Firestoreに全データ登録完了！");
  } catch (e) {
    console.error("❌ Firestore登録エラー:", e);
  }
}
