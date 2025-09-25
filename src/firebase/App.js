import React from "react";
import CropForm from "./components/CropForm";
import CropList from "./components/CropList";

function App() {
  return (
    <div className="App">
      <h1>農作物検索アプリ</h1>
      <CropForm />
      <CropList />
    </div>
  );
}

export default App;
