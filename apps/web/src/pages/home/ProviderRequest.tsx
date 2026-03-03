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

export default function ProviderRequest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<string>("");
  const [pendingRequest, setPendingRequest] = useState<RoleRequest | null>(
    null,
  );
  const [requestHistory, setRequestHistory] = useState<RoleRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    reason: "",
  });

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      setLoading(true);
      const id = await authService.getCurrentUserId();
      const role = await authService.getCurrentUserRole();
      setUserId(id);
      setCurrentRole(role);

      // Check if user is already a provider or admin
      if (role === "provider" || role === "admin") {
        setError(t("provider.alreadyProvider", { role }));
        setLoading(false);
        return;
      }

      // Fetch pending request and history
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

    if (!formData.reason.trim()) {
      setError(t("provider.reasonRequired"));
      return;
    }

    if (formData.reason.trim().length < 50) {
      setError(t("provider.reasonTooShort"));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await roleRequestService.createRequest({
        userId,
        roleRequested: "provider",
        reason: formData.reason.trim(),
      });

      setSuccess(t("provider.requestSubmitted"));
      setFormData({ reason: "" });

      // Refresh the page data
      await initializePage();

      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err: any) {
      setError(err.message || t("provider.submitFailed"));
      console.error("Error submitting request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingRequest) return;

    if (
      !window.confirm("Are you sure you want to cancel your pending request?")
    ) {
      return;
    }

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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            {t("provider.pending")}
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            {t("provider.approved")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            {t("provider.rejected")}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <PrimarySearchAppBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("provider.backToHome")}
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                {t("provider.becomeProvider")}
              </h1>
            </div>
            <p className="text-gray-600">
              {t("provider.becomeProviderDescription")}
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Pending Request Alert */}
          {pendingRequest && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("provider.requestPending")}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-3">
                    {t("provider.requestPendingDescription")}
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-3">
                    <p className="text-sm text-gray-600 mb-1">
                      {t("provider.submittedOn")}
                    </p>
                    <p className="font-medium text-gray-900">
                      {new Date(pendingRequest.submittedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-3 mb-1">
                      {t("provider.yourReason")}
                    </p>
                    <p className="text-gray-900">{pendingRequest.reason}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCancelRequest}
                disabled={submitting}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("provider.cancelRequest")}
              </button>
            </div>
          )}

          {/* Request Form */}
          {!pendingRequest && currentRole === "user" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="p-6 sm:p-8">
                <div className="flex items-center mb-6">
                  <FileText className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t("provider.submitRequest")}
                  </h2>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("provider.reasonLabel")}
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder={t("provider.reasonPlaceholder")}
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      {t("provider.charactersCount", {
                        count: formData.reason.length,
                      })}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t("provider.whatHappensNext")}
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• {t("provider.nextSteps.review")}</li>
                      <li>• {t("provider.nextSteps.notification")}</li>
                      <li>• {t("provider.nextSteps.upgrade")}</li>
                      <li>• {t("provider.nextSteps.manage")}</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || formData.reason.trim().length < 50}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t("provider.requestHistory")}
                </h2>
                <div className="space-y-4">
                  {requestHistory.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            {t("provider.submittedOnDate", {
                              date: new Date(
                                request.submittedAt,
                              ).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }),
                            })}
                          </p>
                          {request.reviewedAt && (
                            <p className="text-sm text-gray-600">
                              {t("provider.reviewedOnDate", {
                                date: new Date(
                                  request.reviewedAt,
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }),
                              })}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-600 mb-1">
                          {t("provider.reason")}:
                        </p>
                        <p className="text-gray-900">{request.reason}</p>
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
