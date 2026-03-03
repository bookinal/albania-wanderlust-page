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
} from "lucide-react";
import { propertyRequestService } from "@/services/api/propertyRequest";
import { authService } from "@/services/api/authService";
import { PropertyRequest } from "@/types/request.type";
import { Car as CarType } from "@/types/car.types";
import { getCarById } from "@/services/api/carService";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Hsidebar from "@/components/dashboard/hsidebar";

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
  const [filteredRequests, setFilteredRequests] = useState<PropertyRequest[]>(
    [],
  );
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<
    "all" | "car" | "apartment" | "hotel"
  >("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewerId, setReviewerId] = useState<string>("");

  // Modal states
  const [selectedRequest, setSelectedRequest] =
    useState<PropertyRequest | null>(null);
  const [propertyDetails, setPropertyDetails] = useState<CarType | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [filter, propertyTypeFilter, requests]);

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

    // Filter by status
    if (filter !== "all") {
      filtered = filtered.filter((req) => req.status === filter);
    }

    // Filter by property type
    if (propertyTypeFilter !== "all") {
      filtered = filtered.filter(
        (req) => req.propertyType === propertyTypeFilter,
      );
    }

    setFilteredRequests(filtered);
  };

  const loadPropertyDetails = async (request: PropertyRequest) => {
    setDetailsLoading(true);
    setSelectedRequest(request);
    setShowDetailsModal(true);

    try {
      // For now, only car details are implemented
      if (request.propertyType === "car") {
        const car = await getCarById(parseInt(request.propertyId));
        setPropertyDetails(car);
      }
      // TODO: Add apartment and hotel loading when implemented
    } catch (err) {
      console.error("Error loading property details:", err);
      setError("Failed to load property details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (
      !window.confirm(t("propertyRequestsManagement.confirmations.approve"))
    ) {
      return;
    }

    try {
      setProcessing(requestId);
      setError(null);

      await propertyRequestService.approveRequest(requestId, reviewerId);
      setSuccess(t("propertyRequestsManagement.success.approve"));

      // Refresh requests
      await initializePage();
      setShowDetailsModal(false);

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

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!rejectionReason.trim()) {
      setError(t("propertyRequestsManagement.errors.rejectionReasonRequired"));
      return;
    }

    try {
      setProcessing(selectedRequest.id);
      setError(null);

      await propertyRequestService.rejectRequest(
        selectedRequest.id,
        reviewerId,
        rejectionReason,
      );
      setSuccess(t("propertyRequestsManagement.success.reject"));

      // Refresh requests
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            {t("propertyRequestsManagement.status.pending")}
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            {t("propertyRequestsManagement.status.approved")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            {t("propertyRequestsManagement.status.rejected")}
          </span>
        );
      default:
        return null;
    }
  };

  const getPropertyTypeBadge = (type: string) => {
    const colors = {
      car: "bg-blue-100 text-blue-800",
      apartment: "bg-purple-100 text-purple-800",
      hotel: "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}
      >
        <PropertyTypeIcon type={type} />
        <span className="ml-1">
          {t(`propertyRequestsManagement.propertyTypes.${type}`)}
        </span>
      </span>
    );
  };

  if (loading) {
    return (
      <Hsidebar>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Hsidebar>
    );
  }

  return (
    <Hsidebar>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("propertyRequestsManagement.title")}
          </h1>
          <p className="text-gray-600">
            {t("propertyRequestsManagement.subtitle")}
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 mr-2">
              {t("propertyRequestsManagement.filters.status.label")}:
            </span>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("propertyRequestsManagement.filters.status.all")} (
              {requests.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("propertyRequestsManagement.filters.status.pending")} (
              {requests.filter((r) => r.status === "pending").length})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("propertyRequestsManagement.filters.status.approved")} (
              {requests.filter((r) => r.status === "approved").length})
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("propertyRequestsManagement.filters.status.rejected")} (
              {requests.filter((r) => r.status === "rejected").length})
            </button>
          </div>

          {/* Property Type Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 mr-2 ml-7">
              {t("propertyRequestsManagement.filters.type.label")}:
            </span>
            <button
              onClick={() => setPropertyTypeFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                propertyTypeFilter === "all"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cars
            </button>
            <button
              onClick={() => setPropertyTypeFilter("car")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-1 ${
                propertyTypeFilter === "car"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Car className="w-4 h-4" />
              {t("propertyRequestsManagement.filters.type.car")}
            </button>
            <button
              onClick={() => setPropertyTypeFilter("apartment")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-1 ${
                propertyTypeFilter === "apartment"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Home className="w-4 h-4" />
              {t("propertyRequestsManagement.filters.type.apartment")}
            </button>
            <button
              onClick={() => setPropertyTypeFilter("hotel")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-1 ${
                propertyTypeFilter === "hotel"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Hotel className="w-4 h-4" />
              {t("propertyRequestsManagement.filters.type.hotel")}
            </button>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("propertyRequestsManagement.empty.title")}
            </h3>
            <p className="text-gray-500">
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
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {request.provider?.avatar_url ? (
                          <img
                            src={request.provider.avatar_url}
                            alt={request.provider.full_name || "Provider"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.provider?.full_name ||
                            t("propertyRequestsManagement.provider.unknown")}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {request.provider?.email ||
                            t("propertyRequestsManagement.provider.noEmail")}
                        </p>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t(
                          "propertyRequestsManagement.provider.submitted",
                        )}: {request.submittedAt.toLocaleDateString()}
                      </span>
                      {request.reviewedAt && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {t(
                            "propertyRequestsManagement.provider.reviewed",
                          )}: {request.reviewedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Rejection Reason */}
                    {request.status === "rejected" &&
                      request.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-sm text-red-700">
                            <strong>
                              {t(
                                "propertyRequestsManagement.provider.rejectionReason",
                              )}
                              :
                            </strong>{" "}
                            {request.rejectionReason}
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPropertyDetails(request)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      {t("propertyRequestsManagement.actions.viewDetails")}
                    </Button>

                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={processing === request.id}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                        >
                          {processing === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {t("propertyRequestsManagement.actions.approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectModal(request)}
                          disabled={processing === request.id}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          {t("propertyRequestsManagement.actions.reject")}
                        </Button>
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <PropertyTypeIcon type={selectedRequest?.propertyType || ""} />
                {t("propertyRequestsManagement.modal.details.title")}
              </DialogTitle>
              <DialogDescription>
                {t("propertyRequestsManagement.modal.details.description")}
              </DialogDescription>
            </DialogHeader>

            {detailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : selectedRequest?.propertyType === "car" && propertyDetails ? (
              <div className="space-y-6">
                {/* Car Images */}
                {propertyDetails.imageUrls &&
                  propertyDetails.imageUrls.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Images
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {propertyDetails.imageUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Car image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Car Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">Car Name</Label>
                    <p className="font-medium">{propertyDetails.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">Brand</Label>
                    <p className="font-medium">{propertyDetails.brand}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">Type</Label>
                    <p className="font-medium">{propertyDetails.type}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">Year</Label>
                    <p className="font-medium">{propertyDetails.year}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">
                      Transmission
                    </Label>
                    <p className="font-medium">
                      {propertyDetails.transmission}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">Fuel Type</Label>
                    <p className="font-medium">{propertyDetails.fuelType}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">Seats</Label>
                    <p className="font-medium">{propertyDetails.seats}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">Mileage</Label>
                    <p className="font-medium">
                      {propertyDetails.mileage?.toLocaleString()} km
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">Color</Label>
                    <p className="font-medium">{propertyDetails.color}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">
                      Plate Number
                    </Label>
                    <p className="font-medium">{propertyDetails.plateNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Price Per Day
                    </Label>
                    <p className="font-medium text-green-600">
                      ${propertyDetails.pricePerDay}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-gray-500">Status</Label>
                    <p className="font-medium capitalize">
                      {propertyDetails.status}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Pick-up Location
                  </Label>
                  <p className="font-medium">
                    {propertyDetails.pickUpLocation || "Not specified"}
                  </p>
                  {propertyDetails.lat && propertyDetails.lng && (
                    <p className="text-sm text-gray-500">
                      Coordinates: {propertyDetails.lat.toFixed(6)},{" "}
                      {propertyDetails.lng.toFixed(6)}
                    </p>
                  )}
                </div>

                {/* Features */}
                {propertyDetails.features &&
                  propertyDetails.features.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-500">Features</Label>
                      <div className="flex flex-wrap gap-2">
                        {propertyDetails.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Provider Info */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Provider Information
                  </h4>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {selectedRequest?.provider?.avatar_url ? (
                        <img
                          src={selectedRequest.provider.avatar_url}
                          alt="Provider"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedRequest?.provider?.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedRequest?.provider?.email}
                      </p>
                      {selectedRequest?.provider?.phone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {selectedRequest.provider.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Property details not available
              </div>
            )}

            {selectedRequest?.status === "pending" && (
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  {t("propertyRequestsManagement.modal.details.close")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetailsModal(false);
                    openRejectModal(selectedRequest);
                  }}
                  disabled={processing === selectedRequest.id}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {t("propertyRequestsManagement.actions.reject")}
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={processing === selectedRequest.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing === selectedRequest.id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  {t("propertyRequestsManagement.modal.details.approve")}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {t("propertyRequestsManagement.modal.reject.title")}
              </DialogTitle>
              <DialogDescription>
                {t("propertyRequestsManagement.modal.reject.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">
                  {t("propertyRequestsManagement.modal.reject.reasonLabel")}
                </Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t(
                    "propertyRequestsManagement.modal.reject.placeholder",
                  )}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
              >
                {t("propertyRequestsManagement.modal.reject.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={
                  processing === selectedRequest?.id || !rejectionReason.trim()
                }
              >
                {processing === selectedRequest?.id ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-1" />
                )}
                {t("propertyRequestsManagement.modal.reject.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Hsidebar>
  );
}
