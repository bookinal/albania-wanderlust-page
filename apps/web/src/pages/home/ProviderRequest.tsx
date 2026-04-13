import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  FileText,
} from "lucide-react";
import PrimarySearchAppBar from "@/components/home/AppBar";
import { roleRequestService } from "@/services/api/roleRequestService";
import { authService } from "@/services/api/authService";
import { RoleRequest } from "@/types/request.type";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

export default function ProviderRequest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb',
    inputBg: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    inputBorder: isDark ? 'rgba(255,255,255,0.12)' : '#d1d5db',
    inputText: isDark ? '#ffffff' : '#111115',
    labelText: isDark ? 'rgba(255,255,255,0.60)' : '#374151',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b7280',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#374151',
    statBg: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
    statBorder: isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb',
    historyRowBg: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    historyRowBorder: isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb',
    pendingBg: isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff',
    pendingBorder: isDark ? 'rgba(59,130,246,0.20)' : '#bfdbfe',
    pendingText: isDark ? 'rgba(147,197,253,0.9)' : '#1d4ed8',
    errorBg: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2',
    errorBorder: isDark ? 'rgba(239,68,68,0.20)' : '#fecaca',
    errorText: isDark ? 'rgba(252,165,165,0.9)' : '#b91c1c',
    successBg: isDark ? 'rgba(34,197,94,0.08)' : '#f0fdf4',
    successBorder: isDark ? 'rgba(34,197,94,0.20)' : '#bbf7d0',
    successText: isDark ? 'rgba(134,239,172,0.9)' : '#15803d',
    infoBg: isDark ? 'rgba(255,255,255,0.04)' : '#eff6ff',
    infoBorder: isDark ? 'rgba(255,255,255,0.08)' : '#bfdbfe',
    reasonBg: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
    backBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  };

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<string>("");
  const [pendingRequest, setPendingRequest] = useState<RoleRequest | null>(null);
  const [requestHistory, setRequestHistory] = useState<RoleRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({ reason: "" });

  useEffect(() => { initializePage(); }, []);

  const initializePage = async () => {
    try {
      setLoading(true);
      const id = await authService.getCurrentUserId();
      const role = await authService.getCurrentUserRole();
      setUserId(id);
      setCurrentRole(role);
      if (role === "provider" || role === "admin") {
        setError(t("provider.alreadyProvider", { role }));
        setLoading(false);
        return;
      }
      const pending = await roleRequestService.getUserPendingRequest(id);
      const history = await roleRequestService.getUserRequests(id);
      setPendingRequest(pending);
      setRequestHistory(history);
    } catch (err) {
      console.error("Error initializing page:", err);
      setError("Failed to load request information");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) { setError(t("provider.reasonRequired")); return; }
    if (formData.reason.trim().length < 50) { setError(t("provider.reasonTooShort")); return; }
    try {
      setSubmitting(true);
      setError(null);
      await roleRequestService.createRequest({ userId, roleRequested: "provider", reason: formData.reason.trim() });
      setSuccess(t("provider.requestSubmitted"));
      setFormData({ reason: "" });
      await initializePage();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || t("provider.submitFailed"));
      console.error("Error submitting request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingRequest) return;
    if (!window.confirm("Are you sure you want to cancel your pending request?")) return;
    try {
      setSubmitting(true);
      await roleRequestService.cancelRequest(pendingRequest.id, userId);
      setSuccess(t("provider.requestCancelled"));
      await initializePage();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t("provider.cancelFailed"));
      console.error("Error cancelling request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock className="w-4 h-4" />
            {t("provider.pending")}
          </span>
        );
      case "approved":
        return (
          <span style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle className="w-4 h-4" />
            {t("provider.approved")}
          </span>
        );
      case "rejected":
        return (
          <span style={{ background: 'rgba(232,25,44,0.12)', color: '#E8192C', border: '1px solid rgba(232,25,44,0.25)', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle className="w-4 h-4" />
            {t("provider.rejected")}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ background: tk.pageBg, minHeight: '100vh' }} className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E8192C' }} />
      </div>
    );
  }

  return (
    <div style={{ background: tk.pageBg, minHeight: '100vh' }}>
      <PrimarySearchAppBar />
      <div style={{ minHeight: '100vh', paddingTop: '48px', paddingBottom: '48px', paddingLeft: '16px', paddingRight: '16px' }}>
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            style={{ background: tk.backBg, color: tk.dimText }}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("provider.backToHome")}
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Briefcase className="w-8 h-8 mr-3" style={{ color: '#E8192C' }} />
              <h1 style={{ color: tk.pageText }} className="text-3xl font-bold">{t("provider.becomeProvider")}</h1>
            </div>
            <p style={{ color: tk.mutedText }}>{t("provider.becomeProviderDescription")}</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div style={{ background: tk.errorBg, border: `1px solid ${tk.errorBorder}`, color: tk.errorText }} className="mb-6 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ background: tk.successBg, border: `1px solid ${tk.successBorder}`, color: tk.successText }} className="mb-6 px-4 py-3 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Pending Request Panel */}
          {pendingRequest && (
            <div style={{ background: tk.pendingBg, border: `1px solid ${tk.pendingBorder}` }} className="mb-6 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2 gap-2">
                    <Clock className="w-5 h-5" style={{ color: tk.pendingText }} />
                    <h3 style={{ color: tk.pageText }} className="text-lg font-semibold">{t("provider.requestPending")}</h3>
                  </div>
                  <p style={{ color: tk.mutedText }} className="mb-3">{t("provider.requestPendingDescription")}</p>
                  <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}` }} className="rounded-lg p-4 mb-3">
                    <p style={{ color: tk.mutedText }} className="text-sm mb-1">{t("provider.submittedOn")}</p>
                    <p style={{ color: tk.pageText }} className="font-medium">
                      {new Date(pendingRequest.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p style={{ color: tk.mutedText }} className="text-sm mt-3 mb-1">{t("provider.yourReason")}</p>
                    <p style={{ color: tk.pageText }}>{pendingRequest.reason}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCancelRequest}
                disabled={submitting}
                style={{ background: '#E8192C', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.5 : 1, fontWeight: 500 }}
                className="mt-2 transition-opacity hover:opacity-90"
              >
                {t("provider.cancelRequest")}
              </button>
            </div>
          )}

          {/* Request Form */}
          {!pendingRequest && currentRole === "user" && (
            <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}` }} className="rounded-2xl overflow-hidden mb-8">
              <div className="p-6 sm:p-8">
                <div className="flex items-center mb-6 gap-3">
                  <FileText className="w-6 h-6" style={{ color: '#E8192C' }} />
                  <h2 style={{ color: tk.pageText }} className="text-xl font-semibold">{t("provider.submitRequest")}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label style={{ color: tk.labelText }} className="block text-sm font-medium mb-2">{t("provider.reasonLabel")}</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={8}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: `1px solid ${tk.inputBorder}`,
                        background: tk.inputBg,
                        color: tk.inputText,
                        outline: 'none',
                        resize: 'none',
                        fontSize: '14px',
                      }}
                      placeholder={t("provider.reasonPlaceholder")}
                      required
                    />
                    <p style={{ color: tk.mutedText }} className="mt-2 text-sm">
                      {t("provider.charactersCount", { count: formData.reason.length })}
                    </p>
                  </div>

                  {/* What happens next info box */}
                  <div style={{ background: tk.statBg, border: `1px solid ${tk.statBorder}` }} className="rounded-lg p-4 mb-6">
                    <h4 style={{ color: tk.pageText }} className="font-medium mb-2">{t("provider.whatHappensNext")}</h4>
                    <ul style={{ color: tk.mutedText }} className="text-sm space-y-1">
                      <li>• {t("provider.nextSteps.review")}</li>
                      <li>• {t("provider.nextSteps.notification")}</li>
                      <li>• {t("provider.nextSteps.upgrade")}</li>
                      <li>• {t("provider.nextSteps.manage")}</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || formData.reason.trim().length < 50}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      background: (submitting || formData.reason.trim().length < 50) ? tk.statBg : '#E8192C',
                      color: (submitting || formData.reason.trim().length < 50) ? tk.mutedText : '#fff',
                      cursor: (submitting || formData.reason.trim().length < 50) ? 'not-allowed' : 'pointer',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("provider.submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t("provider.submit")}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Request History */}
          {requestHistory.length > 0 && (
            <div style={{ background: tk.cardBg, border: `1px solid ${tk.cardBorder}` }} className="rounded-2xl overflow-hidden">
              <div className="p-6 sm:p-8">
                <h2 style={{ color: tk.pageText }} className="text-xl font-semibold mb-6">{t("provider.requestHistory")}</h2>
                <div className="space-y-4">
                  {requestHistory.map((request) => (
                    <div
                      key={request.id}
                      style={{ border: `1px solid ${tk.historyRowBorder}`, background: tk.historyRowBg }}
                      className="rounded-lg p-4 hover:opacity-90 transition-opacity"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p style={{ color: tk.mutedText }} className="text-sm">
                            {t("provider.submittedOnDate", {
                              date: new Date(request.submittedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                            })}
                          </p>
                          {request.reviewedAt && (
                            <p style={{ color: tk.mutedText }} className="text-sm">
                              {t("provider.reviewedOnDate", {
                                date: new Date(request.reviewedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                              })}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      <div style={{ background: tk.reasonBg, borderRadius: '8px', padding: '12px' }}>
                        <p style={{ color: tk.mutedText }} className="text-sm mb-1">{t("provider.reason")}:</p>
                        <p style={{ color: tk.pageText }}>{request.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
