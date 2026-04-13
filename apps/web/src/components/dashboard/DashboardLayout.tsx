import React from "react";
import { Outlet } from "react-router-dom";
import Hsidebar from "./hsidebar";

const DashboardLayout = () => {
  return (
    <Hsidebar>
      <Outlet />
    </Hsidebar>
  );
};

export default DashboardLayout;
