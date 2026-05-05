import React from "react";
import { Outlet } from "react-router-dom";

import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
