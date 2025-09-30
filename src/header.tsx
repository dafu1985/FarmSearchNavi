import React from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  return (
    <AppBar position="static" color="success">
      <Toolbar>
        <Button color="inherit" onClick={() => navigate("/")}>
          Topページ
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
