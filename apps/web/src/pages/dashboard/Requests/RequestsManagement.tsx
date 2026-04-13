import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Calendar,
  FileText,
  Filter,
} from "lucide-react";
import { roleRequestService } from "@/services/api/roleRequestService";
import { authService } from "@/services/api/authService";
import { RoleRequest } from "@/types/request.type";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

export default function RequestsManagement() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RoleRequest[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewerId, setReviewerId] = useState<string>("");

  const { t } = useTranslation();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    headerBg: isDark ? '#111111' : '#ffffff',
    headerBorder: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    cardBg: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#e5e2de',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    reasonBg: isDark ? 'rgba(255,255,255,0.03)' : '#f5f2ee',
    reasonBorder: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    filterBtnBg: isDark ? 'rgba(255,255,255,0.04)' : '#edeae6',
    filterBtnText: isDark ? 'rgba(255,255,255,0.60)' : '#44403c',
    filterBtnHover: isDark ? 'rgba(255,255,255,0.08)' : '#e0ddd9',
    iconMuted: isDark ? 'rgba(255,255,255,0.40)' : '#9e9994',
  };

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [filter, requests]);

  const initializePage = async () => {
    try {
      setLoading(true);
      const id = await authService.getCurrentUserId();
      setReviewerId(id);

      const allRequests = await roleRequestService.getAllRequests();
      setRequests(allRequests);
    } catch (err) {
      console.error("Error loading requests:", err);
      setError(t("requestsManagement.error"));
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (filter === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((req) => req.status === filter));
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!window.confirm(t("requestsManagement.confirmations.approve"))) {
      return;
    }

    try {
      setProcessing(requestId);
      setError(null);

      await roleRequestService.approveRequest(requestId, reviewerId);
      setSuccess(t("requestsManagement.success.approve"));

      await initializePage();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || t("requestsManagement.errors.approve"));
      console.error("Error approving request:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!window.confirm(t("requestsManagement.confirmations.reject"))) {
      return;
    }

    try {
      setProcessing(requestId);
      setError(null);

      await roleRequestService.rejectRequest(requestId, reviewerId);
      setSuccess(t("requestsManagement.success.reject"));

      await initializePage();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || t("requestsManagement.errors.reject"));
      console.error("Error rejecting request:", err);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: isDark ? 'rgba(234,179,8,0.10)' : '#fefce8',
              color: isDark ? '#fbbf24' : '#854d0e',
              border: `1px solid ${isDark ? 'rgba(234,179,8,0.25)' : '#fde047'}`,
            }}
          >
            <Clock className="w-3.5 h-3.5 mr-1" />
            {t("requestsManagement.status.pending")}
          </span>
        );
      case "approved":
        return (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: isDark ? 'rgba(34,197,94,0.10)' : '#f0fdf4',
              color: isDark ? '#4ade80' : '#166534',
              border: `1px solid ${isDark ? 'rgba(34,197,94,0.25)' : '#bbf7d0'}`,
            }}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            {t("requestsManagement.status.approved")}
          </span>
        );
      case "rejected":
        return (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2',
              color: isDark ? '#f87171' : '#991b1b',
              border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : '#fecaca'}`,
            }}
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            {t("requestsManagement.status.rejected")}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
          className="flex items-center justify-center p-12 min-h-screen -m-8"
          style={{ background: tk.pageBg }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-[#e41e20]" />
        </div>
    );
  }

  return (
    <div style={{ background: tk.pageBg, color: tk.pageText }} className="-m-8 min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: tk.pageText }}>
            {t("requestsManagement.title")}
          </h1>
          <p style={{ color: tk.mutedText }}>{t("requestsManagement.subtitle")}</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-xl flex items-start gap-3 border"
            style={{
              background: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2',
              borderColor: isDark ? 'rgba(239,68,68,0.25)' : '#fecaca',
              color: isDark ? '#f87171' : '#991b1b',
            }}
          >
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div
            className="mb-6 px-4 py-3 rounded-xl flex items-start gap-3 border"
            style={{
              background: isDark ? 'rgba(34,197,94,0.10)' : '#f0fdf4',
              borderColor: isDark ? 'rgba(34,197,94,0.25)' : '#bbf7d0',
              color: isDark ? '#4ade80' : '#166534',
            }}
          >
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5" style={{ color: tk.iconMuted }} />
          {([
            { key: "all", label: t("requestsManagement.filters.status.all"), count: requests.length, activeColor: '#E8192C' },
            { key: "pending", label: t("requestsManagement.filters.status.pending"), count: requests.filter(r => r.status === "pending").length, activeColor: '#d97706' },
            { key: "approved", label: t("requestsManagement.filters.status.approved"), count: requests.filter(r => r.status === "approved").length, activeColor: '#16a34a' },
            { key: "rejected", label: t("requestsManagement.filters.status.rejected"), count: requests.filter(r => r.status === "rejected").length, activeColor: '#dc2626' },
          ] as const).map(({ key, label, count, activeColor }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={filter === key
                ? { background: activeColor, color: '#ffffff' }
                : { background: tk.filterBtnBg, color: tk.filterBtnText }
              }
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center border"
            style={{ background: tk.cardBg, borderColor: tk.cardBorder }}
          >
            <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: tk.iconMuted }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: tk.pageText }}>
              {t("requestsManagement.empty.title")}
            </h3>
            <p style={{ color: tk.mutedText }}>
              {filter === "all"
                ? t("requestsManagement.empty.noRequests")
                : t("requestsManagement.empty.noFilteredRequests", {
                    filter: t(`requestsManagement.filters.status.${filter}`),
                  })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl p-6 border transition-shadow hover:shadow-lg"
                style={{ background: tk.cardBg, borderColor: tk.cardBorder }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5" style={{ color: tk.iconMuted }} />
                      <h3 className="text-base font-semibold" style={{ color: tk.pageText }}>
                        {request.userName || t("requestsManagement.user.unknown")}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm mb-3" style={{ color: tk.mutedText }}>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {request.userEmail}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {t("requestsManagement.user.submitted")}{" "}
                        {new Date(request.submittedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    {request.reviewedAt && (
                      <div className="text-sm mb-3" style={{ color: tk.mutedText }}>
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {t("requestsManagement.user.reviewed")}{" "}
                        {new Date(request.reviewedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="rounded-lg p-4 mb-4"
                  style={{ background: tk.reasonBg, border: `1px solid ${tk.reasonBorder}` }}
                >
                  <p className="text-sm font-medium mb-2" style={{ color: tk.dimText }}>
                    {t("requestsManagement.user.reasonLabel")}
                  </p>
                  <p className="whitespace-pre-wrap text-sm" style={{ color: tk.pageText }}>
                    {request.reason}
                  </p>
                </div>

                {request.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processing === request.id}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent text-white shadow-sm hover:shadow-md"
                    >
                      {processing === request.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("requestsManagement.actions.processing")}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          {t("requestsManagement.actions.approve")}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processing === request.id}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors bg-red-600 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent text-white shadow-sm hover:shadow-md"
                    >
                      {processing === request.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("requestsManagement.actions.processing")}
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          {t("requestsManagement.actions.reject")}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
