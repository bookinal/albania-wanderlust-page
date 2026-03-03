import { apiClient } from "./apiClient";
import { PropertyRequest } from "@albania/shared-types";
import { User } from "@albania/shared-types";

class PropertyRequestService {
  /**
   * Create a new property request
   */
  async createRequest(
    providerId: string,
    propertyId: string,
    propertyType: "car" | "apartment" | "hotel",
    reason?: string,
  ): Promise<PropertyRequest> {
    const { data, error } = await apiClient
      .from("property_requests")
      .insert({
        provider_id: providerId,
        property_id: propertyId,
        property_type: propertyType,
        reason: reason || "New property submission for review",
        status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;

    return this.mapToPropertyRequest(data);
  }

  /**
   * Get all property requests (admin only)
   */
  async getAllRequests(): Promise<PropertyRequest[]> {
    const { data, error } = await apiClient
      .from("property_requests")
      .select(
        `
                *,
                provider:users!provider_id(id, email, full_name, avatar_url, phone, role, status)
            `,
      )
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    return data.map((request: any) => this.mapToPropertyRequest(request));
  }

  /**
   * Get property requests by provider ID
   */
  async getRequestsByProviderId(
    providerId: string,
  ): Promise<PropertyRequest[]> {
    const { data, error } = await apiClient
      .from("property_requests")
      .select(
        `
                *,
                provider:users!provider_id(id, email, full_name, avatar_url, phone, role, status)
            `,
      )
      .eq("provider_id", providerId)
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    return data.map((request: any) => this.mapToPropertyRequest(request));
  }

  /**
   * Get property request by ID
   */
  async getRequestById(requestId: string): Promise<PropertyRequest | null> {
    const { data, error } = await apiClient
      .from("property_requests")
      .select(
        `
                *,
                provider:users!provider_id(id, email, full_name, avatar_url, phone, role, status)
            `,
      )
      .eq("id", requestId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return this.mapToPropertyRequest(data);
  }

  /**
   * Get pending request for a specific property
   */
  async getPendingRequestByPropertyId(
    propertyId: string,
    propertyType: "car" | "apartment" | "hotel",
  ): Promise<PropertyRequest | null> {
    const { data, error } = await apiClient
      .from("property_requests")
      .select(
        `
                *,
                provider:users!provider_id(id, email, full_name, avatar_url, phone, role, status)
            `,
      )
      .eq("property_id", propertyId)
      .eq("property_type", propertyType)
      .eq("status", "pending")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return this.mapToPropertyRequest(data);
  }

  /**
   * Approve a property request (admin only)
   */
  async approveRequest(
    requestId: string,
    reviewerId: string,
  ): Promise<PropertyRequest> {
    // Get the request first to get property details
    const request = await this.getRequestById(requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    // Update the request status
    const { data, error } = await apiClient
      .from("property_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewer_id: reviewerId,
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;

    // Update the property status to "available"
    await this.updatePropertyStatus(
      request.propertyId,
      request.propertyType,
      "available",
    );

    return this.mapToPropertyRequest(data);
  }

  /**
   * Reject a property request (admin only)
   */
  async rejectRequest(
    requestId: string,
    reviewerId: string,
    rejectionReason?: string,
  ): Promise<PropertyRequest> {
    const { data, error } = await apiClient
      .from("property_requests")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewer_id: reviewerId,
        rejection_reason: rejectionReason || "Request was rejected by admin",
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;

    return this.mapToPropertyRequest(data);
  }

  /**
   * Update property status based on property type
   */
  private async updatePropertyStatus(
    propertyId: string,
    propertyType: "car" | "apartment" | "hotel",
    status: string,
  ): Promise<void> {
    let tableName: string;

    switch (propertyType) {
      case "car":
        tableName = "car";
        break;
      case "apartment":
        tableName = "apartments";
        break;
      case "hotel":
        tableName = "hotels";
        break;
      default:
        throw new Error(`Unknown property type: ${propertyType}`);
    }

    const { error } = await apiClient
      .from(tableName)
      .update({ status })
      .eq("id", propertyId);

    if (error) throw error;
  }

  /**
   * Map database record to PropertyRequest type
   */
  private mapToPropertyRequest(data: any): PropertyRequest {
    return {
      id: data.id,
      provider: data.provider
        ? ({
            id: data.provider.id,
            email: data.provider.email,
            full_name: data.provider.full_name,
            avatar_url: data.provider.avatar_url,
            phone: data.provider.phone,
            role: data.provider.role,
            status: data.provider.status,
            created_at: data.provider.created_at || "",
            updated_at: data.provider.updated_at || "",
          } as User)
        : ({} as User),
      propertyId: data.property_id,
      propertyType: data.property_type,
      status: data.status,
      submittedAt: new Date(data.submitted_at),
      reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : undefined,
      reviewerId: data.reviewer_id,
      rejectionReason: data.rejection_reason,
    };
  }
}

export const propertyRequestService = new PropertyRequestService();
