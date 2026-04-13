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
  Car,
  Home,
  Hotel,
  Filter,
  Eye,
  Phone,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  X,
  Star,
} from "lucide-react";
import { propertyRequestService } from "@/services/api/propertyRequest";
import { authService } from "@/services/api/authService";
import { PropertyRequest } from "@/types/request.type";
import { Car as CarType } from "@/types/car.types";
import { Apartment as ApartmentType } from "@/types/apartment.type";
import { getCarById } from "@/services/api/carService";
import { getApartmentById } from "@/services/api/apartmentService";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTheme } from "@/context/ThemeContext";

// Property type icon mapping
const PropertyTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "car":
      return <Car className="w-5 h-5" />;
    case "apartment":
      return <Home className="w-5 h-5" />;
    case "hotel":
      return <Hotel className="w-5 h-5" />;
    default:
      return null;
  }
};

export default function PropertyRequestsManagement() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PropertyRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<"all" | "car" | "apartment" | "hotel">("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewerId, setReviewerId] = useState<string>("");

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<PropertyRequest | null>(null);
  const [propertyDetails, setPropertyDetails] = useState<CarType | ApartmentType | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminRating, setAdminRating] = useState<number>(0);

  const { t } = useTranslation();
  const { isDark } = useTheme();

  const tk = {
    pageBg: isDark ? '#0d0d0d' : '#f5f4f1',
    pageText: isDark ? '#ffffff' : '#111115',
    cardBg: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255,255,255,0.07)' : '#e5e2de',
    mutedText: isDark ? 'rgba(255,255,255,0.40)' : '#6b6663',
    dimText: isDark ? 'rgba(255,255,255,0.70)' : '#44403c',
    filterBtnBg: isDark ? 'rgba(255,255,255,0.04)' : '#edeae6',
    filterBtnText: isDark ? 'rgba(255,255,255,0.60)' : '#44403c',
    iconMuted: isDark ? 'rgba(255,255,255,0.40)' : '#9e9994',
    reasonBg: isDark ? 'rgba(255,255,255,0.03)' : '#f5f2ee',
    reasonBorder: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    providerBg: isDark ? 'rgba(255,255,255,0.03)' : '#f5f2ee',
    divider: isDark ? 'rgba(255,255,255,0.05)' : '#e5e2de',
    inputBg: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
    inputBorder: isDark ? 'rgba(255,255,255,0.10)' : '#ddd9d5',
    inputText: isDark ? '#ffffff' : '#111115',
    dialogBg: isDark ? '#1a1a1a' : '#ffffff',
    dialogText: isDark ? '#ffffff' : '#111115',
    labelText: isDark ? 'rgba(255,255,255,0.50)' : '#6b6663',
    avatarBg: isDark ? 'rgba(255,255,255,0.08)' : '#e5e2de',
    hintBg: isDark ? 'rgba(59,130,246,0.10)' : '#eff6ff',
    hintText: isDark ? '#93c5fd' : '#1d4ed8',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 10,
    border: `1px solid ${tk.inputBorder}`,
    background: tk.inputBg,
    padding: '8px 12px',
    fontSize: 14,
    color: tk.inputText,
    outline: 'none',
  };

  useEffect(() => { initializePage(); }, []);
  useEffect(() => { filterRequests(); }, [filter, propertyTypeFilter, requests]);

  const initializePage = async () => {
    try {
      setLoading(true);
      const id = await authService.getCurrentUserId();
      setReviewerId(id);
      const allRequests = await propertyRequestService.getAllRequests();
      setRequests(allRequests);
    } catch (err) {
      console.error("Error loading property requests:", err);
      setError(t("propertyRequestsManagement.error"));
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;
    if (filter !== "all") filtered = filtered.filter((req) => req.status === filter);
    if (propertyTypeFilter !== "all") filtered = filtered.filter((req) => req.propertyType === propertyTypeFilter);
    setFilteredRequests(filtered);
  };

  const loadPropertyDetails = async (request: PropertyRequest) => {
    setDetailsLoading(true);
    setSelectedRequest(request);
    setShowDetailsModal(true);
    try {
      if (request.propertyType === "car") {
        const car = await getCarById(parseInt(request.propertyId));
        setPropertyDetails(car);
      } else if (request.propertyType === "apartment") {
        const apartment = await getApartmentById(parseInt(request.propertyId));
        setPropertyDetails(apartment);
      }
    } catch (err) {
      console.error("Error loading property details:", err);
      setError("Failed to load property details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async (requestId: string, rating?: number) => {
    if (!window.confirm(t("propertyRequestsManagement.confirmations.approve"))) return;
    try {
      setProcessing(requestId);
      setError(null);
      await propertyRequestService.approveRequest(requestId, reviewerId, rating);
      setSuccess(t("propertyRequestsManagement.success.approve"));
      await initializePage();
      setShowDetailsModal(false);
      setShowApproveModal(false);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || t("propertyRequestsManagement.errors.approve"));
      console.error("Error approving request:", err);
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (request: PropertyRequest) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const openApproveModal = (request: PropertyRequest) => {
    setSelectedRequest(request);
    if (request.propertyType === "apartment" && propertyDetails && "rating" in propertyDetails) {
      setAdminRating(propertyDetails.rating || 0);
    } else {
      setAdminRating(0);
    }
    setShowApproveModal(true);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      setError(t("propertyRequestsManagement.errors.rejectionReasonRequired"));
      return;
    }
    try {
      setProcessing(selectedRequest.id);
      setError(null);
      await propertyRequestService.rejectRequest(selectedRequest.id, reviewerId, rejectionReason);
      setSuccess(t("propertyRequestsManagement.success.reject"));
      await initializePage();
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || t("propertyRequestsManagement.errors.reject"));
      console.error("Error rejecting request:", err);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: isDark ? 'rgba(234,179,8,0.10)' : '#fefce8', color: isDark ? '#fbbf24' : '#854d0e', border: `1px solid ${isDark ? 'rgba(234,179,8,0.25)' : '#fde047'}` }}>
            <Clock className="w-3.5 h-3.5 mr-1" />{t("propertyRequestsManagement.status.pending")}
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: isDark ? 'rgba(34,197,94,0.10)' : '#f0fdf4', color: isDark ? '#4ade80' : '#166534', border: `1px solid ${isDark ? 'rgba(34,197,94,0.25)' : '#bbf7d0'}` }}>
            <CheckCircle className="w-3.5 h-3.5 mr-1" />{t("propertyRequestsManagement.status.approved")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2', color: isDark ? '#f87171' : '#991b1b', border: `1px solid ${isDark ? 'rgba(239,68,68,0.25)' : '#fecaca'}` }}>
            <XCircle className="w-3.5 h-3.5 mr-1" />{t("propertyRequestsManagement.status.rejected")}
          </span>
        );
      default:
        return null;
    }
  };

  const getPropertyTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      car: { bg: isDark ? 'rgba(59,130,246,0.10)' : '#eff6ff', text: isDark ? '#93c5fd' : '#1d4ed8', border: isDark ? 'rgba(59,130,246,0.25)' : '#bfdbfe' },
      apartment: { bg: isDark ? 'rgba(139,92,246,0.10)' : '#f5f3ff', text: isDark ? '#c4b5fd' : '#6d28d9', border: isDark ? 'rgba(139,92,246,0.25)' : '#ddd6fe' },
      hotel: { bg: isDark ? 'rgba(249,115,22,0.10)' : '#fff7ed', text: isDark ? '#fdba74' : '#c2410c', border: isDark ? 'rgba(249,115,22,0.25)' : '#fed7aa' },
    };
    const s = styles[type] || { bg: tk.filterBtnBg, text: tk.filterBtnText, border: tk.cardBorder };
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium gap-1" style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
        <PropertyTypeIcon type={type} />
        {t(`propertyRequestsManagement.propertyTypes.${type}`)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen -m-8" style={{ background: tk.pageBg }}>
          <Loader2 className="w-8 h-8 animate-spin text-[#e41e20]" />
        </div>
    );
  }

  return (
    <div style={{ background: tk.pageBg, color: tk.pageText }} className="-m-8 min-h-screen p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: tk.pageText }}>
            {t("propertyRequestsManagement.title")}
          </h1>
          <p style={{ color: tk.mutedText }}>{t("propertyRequestsManagement.subtitle")}</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl flex items-start gap-3 border" style={{ background: isDark ? 'rgba(239,68,68,0.10)' : '#fef2f2', borderColor: isDark ? 'rgba(239,68,68,0.25)' : '#fecaca', color: isDark ? '#f87171' : '#991b1b' }}>
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="mb-6 px-4 py-3 rounded-xl flex items-start gap-3 border" style={{ background: isDark ? 'rgba(34,197,94,0.10)' : '#f0fdf4', borderColor: isDark ? 'rgba(34,197,94,0.25)' : '#bbf7d0', color: isDark ? '#4ade80' : '#166534' }}>
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 space-y-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5" style={{ color: tk.iconMuted }} />
            <span className="text-sm font-medium mr-2" style={{ color: tk.dimText }}>
              {t("propertyRequestsManagement.filters.status.label")}:
            </span>
            {([
              { key: "all", label: t("propertyRequestsManagement.filters.status.all"), count: requests.length, activeColor: '#E8192C' },
              { key: "pending", label: t("propertyRequestsManagement.filters.status.pending"), count: requests.filter(r => r.status === "pending").length, activeColor: '#d97706' },
              { key: "approved", label: t("propertyRequestsManagement.filters.status.approved"), count: requests.filter(r => r.status === "approved").length, activeColor: '#16a34a' },
              { key: "rejected", label: t("propertyRequestsManagement.filters.status.rejected"), count: requests.filter(r => r.status === "rejected").length, activeColor: '#dc2626' },
            ] as const).map(({ key, label, count, activeColor }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={filter === key ? { background: activeColor, color: '#ffffff' } : { background: tk.filterBtnBg, color: tk.filterBtnText }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Property Type Filter */}
          <div className="flex items-center gap-2 flex-wrap ml-7">
            <span className="text-sm font-medium mr-2" style={{ color: tk.dimText }}>
              {t("propertyRequestsManagement.filters.type.label")}:
            </span>
            {([
              { key: "all", label: "All", activeColor: isDark ? '#374151' : '#374151', icon: null },
              { key: "car", label: t("propertyRequestsManagement.filters.type.car"), activeColor: '#2563eb', icon: <Car className="w-4 h-4" /> },
              { key: "apartment", label: t("propertyRequestsManagement.filters.type.apartment"), activeColor: '#7c3aed', icon: <Home className="w-4 h-4" /> },
              { key: "hotel", label: t("propertyRequestsManagement.filters.type.hotel"), activeColor: '#ea580c', icon: <Hotel className="w-4 h-4" /> },
            ] as const).map(({ key, label, activeColor, icon }) => (
              <button
                key={key}
                onClick={() => setPropertyTypeFilter(key)}
                style={propertyTypeFilter === key ? { background: activeColor, color: '#ffffff' } : { background: tk.filterBtnBg, color: tk.filterBtnText }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1"
              >
                {icon}{label}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-xl p-12 text-center border" style={{ background: tk.cardBg, borderColor: tk.cardBorder }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: tk.reasonBg }}>
              <Clock className="w-8 h-8" style={{ color: tk.iconMuted }} />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: tk.pageText }}>
              {t("propertyRequestsManagement.empty.title")}
            </h3>
            <p style={{ color: tk.mutedText }}>
              {filter === "pending"
                ? t("propertyRequestsManagement.empty.noPendingRequests")
                : t("propertyRequestsManagement.empty.noFilteredRequests")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl p-6 border transition-shadow hover:shadow-lg hover:-translate-y-0.5 transform duration-200"
                style={{ background: tk.cardBg, borderColor: tk.cardBorder }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Request Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getPropertyTypeBadge(request.propertyType)}
                      {getStatusBadge(request.status)}
                    </div>

                    {/* Provider Info */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ background: tk.avatarBg }}>
                        {request.provider?.avatar_url ? (
                          <img src={request.provider.avatar_url} alt={request.provider.full_name || "Provider"} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" style={{ color: tk.iconMuted }} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: tk.pageText }}>
                          {request.provider?.full_name || t("propertyRequestsManagement.provider.unknown")}
                        </p>
                        <p className="text-xs flex items-center gap-1" style={{ color: tk.mutedText }}>
                          <Mail className="w-3 h-3" />
                          {request.provider?.email || t("propertyRequestsManagement.provider.noEmail")}
                        </p>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-wrap gap-4 text-xs" style={{ color: tk.mutedText }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {t("propertyRequestsManagement.provider.submitted")}: {request.submittedAt.toLocaleDateString()}
                      </span>
                      {request.reviewedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t("propertyRequestsManagement.provider.reviewed")}: {request.reviewedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Rejection Reason */}
                    {request.status === "rejected" && request.rejectionReason && (
                      <div className="mt-3 p-3 rounded-lg border" style={{ background: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2', borderColor: isDark ? 'rgba(239,68,68,0.20)' : '#fecaca' }}>
                        <p className="text-xs" style={{ color: isDark ? '#f87171' : '#991b1b' }}>
                          <strong>{t("propertyRequestsManagement.provider.rejectionReason")}:</strong>{" "}
                          {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => loadPropertyDetails(request)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                      style={{ background: tk.filterBtnBg, color: tk.filterBtnText, borderColor: tk.cardBorder }}
                    >
                      <Eye className="w-4 h-4" />
                      {t("propertyRequestsManagement.actions.viewDetails")}
                    </button>

                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => request.propertyType === "apartment" ? openApproveModal(request) : handleApprove(request.id)}
                          disabled={processing === request.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                          style={{ background: '#16a34a', color: '#ffffff' }}
                        >
                          {processing === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          {t("propertyRequestsManagement.actions.approve")}
                        </button>
                        <button
                          onClick={() => openRejectModal(request)}
                          disabled={processing === request.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                          style={{ background: '#dc2626', color: '#ffffff' }}
                        >
                          <XCircle className="w-4 h-4" />
                          {t("propertyRequestsManagement.actions.reject")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Property Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent style={{ background: tk.dialogBg, color: tk.dialogText, maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ color: tk.dialogText }}>
                <PropertyTypeIcon type={selectedRequest?.propertyType || ""} />
                {t("propertyRequestsManagement.modal.details.title")}
              </DialogTitle>
              <DialogDescription style={{ color: tk.mutedText }}>
                {t("propertyRequestsManagement.modal.details.description")}
              </DialogDescription>
            </DialogHeader>

            {detailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#e41e20]" />
              </div>
            ) : selectedRequest?.propertyType === "car" && propertyDetails && "brand" in propertyDetails ? (
              <div className="space-y-6">
                {/* Car Images */}
                {propertyDetails.imageUrls && propertyDetails.imageUrls.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: tk.pageText }}>
                      <ImageIcon className="w-4 h-4" /> Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {propertyDetails.imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`Car image ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" style={{ borderColor: tk.cardBorder }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Car Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Car Name", value: propertyDetails.name },
                    { label: "Brand", value: propertyDetails.brand },
                    { label: "Type", value: propertyDetails.type },
                    { label: "Year", value: propertyDetails.year },
                    { label: "Transmission", value: propertyDetails.transmission },
                    { label: "Fuel Type", value: propertyDetails.fuelType },
                    { label: "Seats", value: propertyDetails.seats },
                    { label: "Mileage", value: `${propertyDetails.mileage?.toLocaleString()} km` },
                    { label: "Color", value: propertyDetails.color },
                    { label: "Plate Number", value: propertyDetails.plateNumber },
                    { label: "Status", value: propertyDetails.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1">
                      <p className="text-xs" style={{ color: tk.labelText }}>{label}</p>
                      <p className="font-medium text-sm" style={{ color: tk.pageText }}>{value}</p>
                    </div>
                  ))}
                  <div className="space-y-1">
                    <p className="text-xs flex items-center gap-1" style={{ color: tk.labelText }}><DollarSign className="w-3 h-3" /> Price Per Day</p>
                    <p className="font-medium text-sm text-green-500">${propertyDetails.pricePerDay}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <p className="text-xs flex items-center gap-1" style={{ color: tk.labelText }}><MapPin className="w-3 h-3" /> Pick-up Location</p>
                  <p className="font-medium text-sm" style={{ color: tk.pageText }}>{propertyDetails.pickUpLocation || "Not specified"}</p>
                  {propertyDetails.lat && propertyDetails.lng && (
                    <p className="text-xs" style={{ color: tk.mutedText }}>
                      Coordinates: {propertyDetails.lat.toFixed(6)}, {propertyDetails.lng.toFixed(6)}
                    </p>
                  )}
                </div>

                {/* Features */}
                {propertyDetails.features && propertyDetails.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs" style={{ color: tk.labelText }}>Features</p>
                    <div className="flex flex-wrap gap-2">
                      {propertyDetails.features.map((feature, index) => (
                        <span key={index} className="px-3 py-1 rounded-full text-sm" style={{ background: isDark ? 'rgba(59,130,246,0.10)' : '#eff6ff', color: isDark ? '#93c5fd' : '#1d4ed8' }}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Provider Info */}
                <div style={{ borderTop: `1px solid ${tk.divider}` }} className="pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: tk.pageText }}>
                    <User className="w-4 h-4" /> Provider Information
                  </h4>
                  <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: tk.providerBg }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{ background: tk.avatarBg }}>
                      {selectedRequest?.provider?.avatar_url ? (
                        <img src={selectedRequest.provider.avatar_url} alt="Provider" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6" style={{ color: tk.iconMuted }} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: tk.pageText }}>{selectedRequest?.provider?.full_name || "Unknown"}</p>
                      <p className="text-xs flex items-center gap-1" style={{ color: tk.mutedText }}><Mail className="w-3 h-3" />{selectedRequest?.provider?.email}</p>
                      {selectedRequest?.provider?.phone && (
                        <p className="text-xs flex items-center gap-1" style={{ color: tk.mutedText }}><Phone className="w-3 h-3" />{selectedRequest.provider.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedRequest?.propertyType === "apartment" && propertyDetails && "rooms" in propertyDetails ? (
              <div className="space-y-6">
                {/* Apartment Images */}
                {propertyDetails.imageUrls && propertyDetails.imageUrls.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: tk.pageText }}>
                      <ImageIcon className="w-4 h-4" /> Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {propertyDetails.imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`Apartment image ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" style={{ borderColor: tk.cardBorder }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Apartment Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Apartment Name", value: propertyDetails.name },
                    { label: "Address", value: propertyDetails.address || "Not specified" },
                    { label: "Location", value: propertyDetails.location || "Not specified" },
                    { label: "Rating", value: `${propertyDetails.rating} / 5` },
                    { label: "Rooms", value: propertyDetails.rooms },
                    { label: "Beds", value: propertyDetails.beds || 0 },
                    { label: "Bathrooms", value: propertyDetails.bathrooms || 0 },
                    { label: "Kitchens", value: propertyDetails.kitchens || 0 },
                    { label: "Living Rooms", value: propertyDetails.livingRooms || 0 },
                    { label: "Status", value: propertyDetails.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1">
                      <p className="text-xs" style={{ color: tk.labelText }}>{label}</p>
                      <p className="font-medium text-sm capitalize" style={{ color: tk.pageText }}>{value}</p>
                    </div>
                  ))}
                  <div className="space-y-1">
                    <p className="text-xs flex items-center gap-1" style={{ color: tk.labelText }}><DollarSign className="w-3 h-3" /> Price Per Day</p>
                    <p className="font-medium text-sm text-green-500">${propertyDetails.price}</p>
                  </div>
                </div>

                {/* Coordinates */}
                {propertyDetails.lat && propertyDetails.lng && (
                  <div className="space-y-1">
                    <p className="text-xs flex items-center gap-1" style={{ color: tk.labelText }}><MapPin className="w-3 h-3" /> Location Coordinates</p>
                    <p className="text-sm" style={{ color: tk.mutedText }}>{propertyDetails.lat.toFixed(6)}, {propertyDetails.lng.toFixed(6)}</p>
                  </div>
                )}

                {/* Description */}
                {propertyDetails.description && (
                  <div className="space-y-2">
                    <p className="text-xs" style={{ color: tk.labelText }}>Description</p>
                    <p className="text-sm" style={{ color: tk.dimText }}>{propertyDetails.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {propertyDetails.amenities && propertyDetails.amenities.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs" style={{ color: tk.labelText }}>Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {propertyDetails.amenities.map((amenity, index) => (
                        <span key={index} className="px-3 py-1 rounded-full text-sm" style={{ background: isDark ? 'rgba(139,92,246,0.10)' : '#f5f3ff', color: isDark ? '#c4b5fd' : '#6d28d9' }}>
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Provider Info */}
                <div style={{ borderTop: `1px solid ${tk.divider}` }} className="pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2" style={{ color: tk.pageText }}>
                    <User className="w-4 h-4" /> Provider Information
                  </h4>
                  <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: tk.providerBg }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{ background: tk.avatarBg }}>
                      {selectedRequest?.provider?.avatar_url ? (
                        <img src={selectedRequest.provider.avatar_url} alt="Provider" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6" style={{ color: tk.iconMuted }} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: tk.pageText }}>{selectedRequest?.provider?.full_name || "Unknown"}</p>
                      <p className="text-xs flex items-center gap-1" style={{ color: tk.mutedText }}><Mail className="w-3 h-3" />{selectedRequest?.provider?.email}</p>
                      {selectedRequest?.provider?.phone && (
                        <p className="text-xs flex items-center gap-1" style={{ color: tk.mutedText }}><Phone className="w-3 h-3" />{selectedRequest.provider.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center" style={{ color: tk.mutedText }}>
                Property details not available
              </div>
            )}

            {selectedRequest?.status === "pending" && (
              <DialogFooter className="gap-2">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={{ background: tk.filterBtnBg, color: tk.filterBtnText, borderColor: tk.cardBorder }}
                >
                  {t("propertyRequestsManagement.modal.details.close")}
                </button>
                <button
                  onClick={() => { setShowDetailsModal(false); openRejectModal(selectedRequest); }}
                  disabled={processing === selectedRequest.id}
                  className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  style={{ background: '#dc2626', color: '#ffffff' }}
                >
                  <XCircle className="w-4 h-4 inline mr-1" />
                  {t("propertyRequestsManagement.actions.reject")}
                </button>
                <button
                  onClick={() => selectedRequest.propertyType === "apartment" ? openApproveModal(selectedRequest) : handleApprove(selectedRequest.id)}
                  disabled={processing === selectedRequest.id}
                  className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  style={{ background: '#16a34a', color: '#ffffff' }}
                >
                  {processing === selectedRequest.id ? <Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 inline mr-1" />}
                  {t("propertyRequestsManagement.modal.details.approve")}
                </button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent style={{ background: tk.dialogBg, color: tk.dialogText }}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-500">
                <XCircle className="w-5 h-5" />
                {t("propertyRequestsManagement.modal.reject.title")}
              </DialogTitle>
              <DialogDescription style={{ color: tk.mutedText }}>
                {t("propertyRequestsManagement.modal.reject.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                  {t("propertyRequestsManagement.modal.reject.reasonLabel")}
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t("propertyRequestsManagement.modal.reject.placeholder")}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>

            <DialogFooter>
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{ background: tk.filterBtnBg, color: tk.filterBtnText, borderColor: tk.cardBorder }}
              >
                {t("propertyRequestsManagement.modal.reject.cancel")}
              </button>
              <button
                onClick={handleReject}
                disabled={processing === selectedRequest?.id || !rejectionReason.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                style={{ background: '#dc2626', color: '#ffffff' }}
              >
                {processing === selectedRequest?.id ? <Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> : <XCircle className="w-4 h-4 inline mr-1" />}
                {t("propertyRequestsManagement.modal.reject.confirm")}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Rating Modal (for apartments) */}
        <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
          <DialogContent style={{ background: tk.dialogBg, color: tk.dialogText }}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                {t("propertyRequestsManagement.modal.approve.title")}
              </DialogTitle>
              <DialogDescription style={{ color: tk.mutedText }}>
                {t("propertyRequestsManagement.modal.approve.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Provider's suggested rating hint */}
              {propertyDetails && "rating" in propertyDetails && propertyDetails.rating > 0 && (
                <div className="p-3 rounded-lg" style={{ background: tk.hintBg }}>
                  <p className="text-sm flex items-center gap-2" style={{ color: tk.hintText }}>
                    <Star className="w-4 h-4 fill-current" />
                    {t("propertyRequestsManagement.modal.approve.providerRating")}: {propertyDetails.rating}/5
                  </p>
                </div>
              )}

              {/* Admin rating input */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: tk.labelText }}>
                  {t("propertyRequestsManagement.modal.approve.adminRatingLabel")}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setAdminRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= adminRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "hover:text-yellow-300"
                        }`}
                        style={star > adminRating ? { color: tk.iconMuted } : undefined}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-lg font-medium" style={{ color: tk.pageText }}>{adminRating}/5</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                style={{ background: tk.filterBtnBg, color: tk.filterBtnText, borderColor: tk.cardBorder }}
              >
                {t("propertyRequestsManagement.modal.approve.cancel")}
              </button>
              <button
                onClick={() => selectedRequest && handleApprove(selectedRequest.id, adminRating)}
                disabled={processing === selectedRequest?.id || adminRating === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                style={{ background: '#16a34a', color: '#ffffff' }}
              >
                {processing === selectedRequest?.id ? <Loader2 className="w-4 h-4 inline mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 inline mr-1" />}
                {t("propertyRequestsManagement.modal.approve.confirm")}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
