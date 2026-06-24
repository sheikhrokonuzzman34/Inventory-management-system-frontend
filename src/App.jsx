import React, { useCallback, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NewDemandPage from "./pages/NewDemandPage";
import DemandsPage from "./pages/DemandsPage";
import IssueOrdersPage from "./pages/IssueOrdersPage";
import GatePassesPage from "./pages/GatePassesPage";
import InventoryPage from "./pages/InventoryPage";
import UsersPage from "./pages/UsersPage";
import { Spinner, Toast } from "./components/UI";

function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--layout-bg)",
        }}
      >
        <Spinner label="Preparing inventory workspace..." />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const pages = {
    dashboard: <DashboardPage setPage={setPage} />,
    "new-demand": <NewDemandPage setPage={setPage} showToast={showToast} />,
    demands: <DemandsPage setPage={setPage} showToast={showToast} />,
    approvals: <DemandsPage setPage={setPage} showToast={showToast} />,
    "issue-orders": <IssueOrdersPage showToast={showToast} />,
    "gate-passes": <GatePassesPage showToast={showToast} />,
    inventory: <InventoryPage showToast={showToast} />,
    users: <UsersPage showToast={showToast} />,
    audit: <InventoryPage showToast={showToast} auditOnly />,
  };

  return (
    <Layout currentPage={page} setPage={setPage}>
      {pages[page] || pages.dashboard}
      <Toast toast={toast} />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
