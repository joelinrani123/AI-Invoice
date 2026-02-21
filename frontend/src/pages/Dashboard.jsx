import React, { useCallback, useEffect, useState, useMemo } from "react";
import { dashboardStyles } from "../assets/dummyStyles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import KpiCard from "../components/KpiCard";
import StatusBadge from "../components/StatusBadge";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const FileTextIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);


function normalizeClient(raw) {
  if (!raw) return { name: "", email: "", address: "", phone: "" };
  if (typeof raw === "string")
    return { name: raw, email: "", address: "", phone: "" };
  if (typeof raw === "object") {
    return {
      name: raw.name ?? raw.company ?? raw.client ?? "",
      email: raw.email ?? raw.emailAddress ?? "",
      address: raw.address ?? "",
      phone: raw.phone ?? raw.contact ?? "",
    };
  }
  return { name: "", email: "", address: "", phone: "" };
}

function currencyFmt(amount = 0, currency = "INR") {
  try {
    const n = Number(amount || 0);
    if (currency === "INR")
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(n);
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `${currency} ${amount}`;
  }
}
function getClientName(inv) {
  const c = normalizeClient(inv.client);
  return c.name || "Unknown Client";
}

function getClientInitial(inv) {
  const name = getClientName(inv);
  return name.charAt(0).toUpperCase();
}

function formatDate(date) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "—";
  }
}

// Dashboard

const Dashboard = () => {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();

  const obtainToken = useCallback(async () => {
    if (typeof getToken !== "function") return null;
    try {
      let token = await getToken().catch(() => null);
      if (!token) token = await getToken({ forceRefresh: true }).catch(() => null);
      return token;
    } catch {
      return null;
    }
  }, [getToken]);

  const [storedInvoices, setStoredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);

// To fetch invoices

  const fetchInvoices = useCallback(async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await obtainToken();
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/invoice`, {
        method: "GET",
        headers,
      });

      const json = await res.json().catch(() => null);

      if (res.status === 401) {
        setError("Unauthorized. Please sign in.");
        setStoredInvoices([]);
        return;
      }

      if (!res.ok) {
        throw new Error(json?.message || `Failed to fetch (${res.status})`);
      }

      const raw = json?.data || [];
      const mapped = (Array.isArray(raw) ? raw : []).map((inv) => ({
        ...inv,
        id: inv.invoiceNumber || inv._id,
        client: inv.client ?? {},
        amount: Number(inv.total ?? inv.amount ?? 0),
        currency: (inv.currency || "INR").toUpperCase(),
        status:
          typeof inv.status === "string"
            ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1)
            : inv.status || "Draft",
      }));

      setStoredInvoices(mapped);
    } catch (err) {
      setError(err?.message || "Failed to load invoices");
      setStoredInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [obtainToken, isSignedIn]);

  // To fetch business profile

  const fetchBusinessProfile = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await obtainToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/businessProfile/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) return;
      const json = await res.json().catch(() => null);
      if (json?.data) setBusinessProfile(json.data);
    } catch {}
  }, [obtainToken, isSignedIn]);

  useEffect(() => {
    fetchInvoices();
    fetchBusinessProfile();
  }, [fetchInvoices, fetchBusinessProfile]);


// kpi
  const kpis = useMemo(() => {
    let totalPaid = 0;
    let totalUnpaid = 0;
    let paidCount = 0;

    storedInvoices.forEach((inv) => {
      if (inv.status === "Paid") {
        totalPaid += inv.amount;
        paidCount++;
      }
      if (inv.status === "Unpaid" || inv.status === "Overdue") {
        totalUnpaid += inv.amount;
      }
    });

    const totalInvoices = storedInvoices.length;
    const totalAmount = totalPaid + totalUnpaid;
    const paidPercentage =
      totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;


    return {
      totalInvoices,
      totalPaid,
      totalUnpaid,
      paidCount,
      paidPercentage,
    };
  }, [storedInvoices]);



  const recent = useMemo(() => {
    return storedInvoices
      .slice()
      .sort(
        (a, b) =>
          (Date.parse(b.issueDate || 0) || 0) -
          (Date.parse(a.issueDate || 0) || 0)
      )
      .slice(0, 5);
  }, [storedInvoices]);

  const openInvoice = (inv) => {
    navigate(`/app/invoices/${inv.id}`, { state: { invoice: inv } });
  };

  

  return (
    <div className={dashboardStyles.pageContainer}>
      <div className={dashboardStyles.header}>
        <h1 className={dashboardStyles.headerTitle}>Dashboard Overview</h1>
        <p className={dashboardStyles.headerSubtitle}>
          Track your invoicing performance and business insights
        </p>
      </div>

      {loading ? (
        <div className="p-6">Loading invoices...</div>
      ) : error ? (
        <div className="p-6">
          <div className="text-red-600 mb-3">Error: {error}</div>
          <div className="flex gap-2">
            <button
              onClick={fetchInvoices}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Retry
            </button>
            {String(error).toLowerCase().includes("unauthorized") && (
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 bg-gray-700 text-white rounded"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      ) : null}

      <div className={dashboardStyles.kpiGrid}>
        <KpiCard
          title="Total Invoices"
          value={kpis.totalInvoices}
          hint="Active Invoices"
          iconType="document"
          trend={8.5}
        />
        <KpiCard
          title="Total Paid"
          value={currencyFmt(kpis.totalPaid, "INR")}
          hint="Received amount (INR)"
          iconType="revenue"
          trend={12.2}
        />
        <KpiCard
          title="Total Unpaid"
          value={currencyFmt(kpis.totalUnpaid, "INR")}
          hint="Outstanding balance (INR)"
          iconType="clock"
          trend={-3.1}
        />
      </div>

     <div className={dashboardStyles.mainGrid}>

  
  <div className={dashboardStyles.sidebarColumn}>

    {/* Quick Stats */}
    <div className={dashboardStyles.quickStatsCard}>
      <h3 className={dashboardStyles.quickStatsTitle}>Quick Stats</h3>

      <div className="space-y-3">
        <div className={dashboardStyles.quickStatsRow}>
          <span className={dashboardStyles.quickStatsLabel}>Paid Rate</span>
          <span className={dashboardStyles.quickStatsValue}>
            {kpis.totalInvoices > 0
              ? ((kpis.paidCount / kpis.totalInvoices) * 100).toFixed(1)
              : 0}%
          </span>
        </div>

        <div className={dashboardStyles.quickStatsRow}>
          <span className={dashboardStyles.quickStatsLabel}>Avg. Invoice</span>
          <span className={dashboardStyles.quickStatsValue}>
            {currencyFmt(
              kpis.totalInvoices > 0
                ? (kpis.totalPaid + kpis.totalUnpaid) / kpis.totalInvoices
                : 0,
              "INR"
            )}
          </span>
        </div>

        <div className={dashboardStyles.quickStatsRow}>
          <span className={dashboardStyles.quickStatsLabel}>
            Collection Eff.
          </span>
          <span className={dashboardStyles.quickStatsValue}>
            {kpis.paidPercentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>

   
    <div className={dashboardStyles.cardContainer}>
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>

        <div className={dashboardStyles.quickActionsContainer}>
          <button
            onClick={() => navigate("/app/create-invoice")}
            className={`${dashboardStyles.quickActionButton} ${dashboardStyles.quickActionBlue}`}
          >
            <div
              className={`${dashboardStyles.quickActionIconContainer} ${dashboardStyles.quickActionIconBlue}`}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14m-7-7h14" />
              </svg>
            </div>
            <span className={dashboardStyles.quickActionText}>
              Create Invoice
            </span>
          </button>

          <button
            onClick={() => navigate("/app/invoices")}
            className={`${dashboardStyles.quickActionButton} ${dashboardStyles.quickActionGray}`}
          >
            <div
              className={`${dashboardStyles.quickActionIconContainer} ${dashboardStyles.quickActionIconGray}`}
            >
              <FileTextIcon className="w-4 h-4" />
            </div>
            <span className={dashboardStyles.quickActionText}>
              View All Invoices
            </span>
          </button>

          <button
            onClick={() => navigate("/app/business")}
            className={`${dashboardStyles.quickActionButton} ${dashboardStyles.quickActionGray}`}
          >
            <div
              className={`${dashboardStyles.quickActionIconContainer} ${dashboardStyles.quickActionIconGray}`}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className={dashboardStyles.quickActionText}>
              Business Profile
            </span>
          </button>
        </div>
      </div>
    </div>

  </div>

 <div className={dashboardStyles.contentColumn}>

  <div className={dashboardStyles.cardContainerOverflow}>

    {/* Header */}
<div className={dashboardStyles.tableHeader}>
  <div className={dashboardStyles.tableHeaderContent}>
    
    {/* LEFT */}
    <div>
      <h3 className={dashboardStyles.tableTitle}>
        Recent Invoices
      </h3>
      <p className={dashboardStyles.tableSubtitle}>
        Latest 5 invoices from your account
      </p>
    </div>

    {/* RIGHT */}
    <button
      onClick={() => navigate("/app/invoices")}
      className={dashboardStyles.tableActionButton}
    >
      View all →
    </button>

  </div>
</div>

    <div className={dashboardStyles.tableContainer}>
      <table className={dashboardStyles.table}>
        <thead>
          <tr className={dashboardStyles.tableHead}>
            <th className={dashboardStyles.tableHeaderCell}>Client & ID</th>
            <th className={dashboardStyles.tableHeaderCell}>Amount</th>
            <th className={dashboardStyles.tableHeaderCell}>Status</th>
            <th className={dashboardStyles.tableHeaderCell}>Due Date</th>
            <th className={dashboardStyles.tableHeaderCell}>Actions</th>
          </tr>
        </thead>

        <tbody className={dashboardStyles.tableBody}>
          {recent.map((inv) => {
            const clientName = getClientName(inv);
            const clientInitial = getClientInitial(inv);

            return (
              <tr
                key={inv.id}
                className={dashboardStyles.tableRow}
                onClick={() => openInvoice(inv)}
              >
                <td className={dashboardStyles.tableCell}>
                  <div className="flex items-center gap-3">
                    <div className={dashboardStyles.clientAvatar}>
                      {clientInitial}
                    </div>
                    <div>
                      <div className={dashboardStyles.clientInfo}>
                        {clientName}
                      </div>
                      <div className={dashboardStyles.clientSubInfo}>
                        {inv.id}
                      </div>
                    </div>
                  </div>
                </td>

                <td className={dashboardStyles.tableCell}>
                  <div className={dashboardStyles.amountCell}>
                    {currencyFmt(inv.amount, inv.currency)}
                  </div>
                </td>

                <td className={dashboardStyles.tableCell}>
                  <StatusBadge
                    status={inv.status}
                    size="default"
                    showIcon
                  />
                </td>

                <td className={dashboardStyles.tableCell}>
                  <div className={dashboardStyles.dateCell}>
                    {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                  </div>
                </td>

                <td className={dashboardStyles.tableCell}>
                  <div className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openInvoice(inv);
                      }}
                      className={dashboardStyles.actionButton}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {recent.length === 0 && !loading && (
            <tr>
              <td colSpan="5" className={dashboardStyles.emptyState}>
                <div className={dashboardStyles.emptyStateText}>
                  <FileTextIcon
                    className={dashboardStyles.emptyStateIcon}
                  />
                  <div className={dashboardStyles.emptyStateMessage}>
                    No invoice yet
                  </div>
                  <button
                    onClick={() => navigate("/app/create-invoice")}
                    className={dashboardStyles.emptyStateAction}
                  >
                    Create Your First Invoice
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

  </div>
</div>

</div>

 </div>
     
  );
};

export default Dashboard;
