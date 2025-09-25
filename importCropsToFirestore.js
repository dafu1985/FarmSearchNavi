const fs = require("fs");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

async function importData() {
  console.log("start");

  const cropsData = JSON.parse(
    fs.readFileSync("./public/data/cropsData.json", "utf8")
  );

  for (const [prefName, crops] of Object.entries(cropsData)) {
    for (const crop of crops) {
      // 作物ごとに展開して Firestore に追加
      const docId = `${prefName}-${crop.name}`;
const docData = {
  prefName,
  cropName: crop.name ?? "-",
  season: crop.season ?? "-",
  category: crop.category ?? "-",
  hasDetail: crop.hasDetail ?? false,

  // React が期待するキーに統一
  variety: crop.variety ?? null,  // 単数
  character: crop.character ?? null,
  sowing: crop.sowing ?? null,
  nursery: crop.nursery ?? null,
  harvest: crop.harvest ?? null,
};


      await db.collection("crops").doc(docId).set(docData);
      console.log(`登録完了: ${prefName} - ${crop.name}`);
    }
  }

  console.log("すべての作物データを Firestore に登録しました。");
}

importData().catch(console.error);
