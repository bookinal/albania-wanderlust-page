import { apiClient } from "./apiClient";
import { RoleRequest, CreateRoleRequestDto } from "@albania/shared-types";

class RoleRequestService {
    /**
     * Create a new provider/admin role request
     */
    async createRequest(requestData: CreateRoleRequestDto): Promise<RoleRequest> {
        // Check if user already has a pending request
        const existingRequest = await this.getUserPendingRequest(requestData.userId);
        if (existingRequest) {
            throw new Error("You already have a pending request. Please wait for admin review.");
        }

        const { data, error } = await apiClient
            .from("role_requests")
            .insert({
                user_id: requestData.userId,
                roleRequested: requestData.roleRequested,
                reason: requestData.reason,
                status: "pending",
                submittedAt: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            userId: data.user_id,
            roleRequested: data.roleRequested,
            reason: data.reason,
            status: data.status,
            submittedAt: new Date(data.submittedAt),
            reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : undefined,
            reviewerId: data.reviewer_id,
        };
    }

    /**
     * Get user's pending request
     */
    async getUserPendingRequest(userId: string): Promise<RoleRequest | null> {
        const { data, error } = await apiClient
            .from("role_requests")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "pending")
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                // No rows returned
                return null;
            }
            throw error;
        }

        return {
            id: data.id,
            userId: data.user_id,
            roleRequested: data.roleRequested,
            reason: data.reason,
            status: data.status,
            submittedAt: new Date(data.submittedAt),
            reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : undefined,
            reviewerId: data.reviewer_id,
        };
    }

    /**
     * Get user's request history
     */
    async getUserRequests(userId: string): Promise<RoleRequest[]> {
        const { data, error } = await apiClient
            .from("role_requests")
            .select("*")
            .eq("user_id", userId)
            .order("submittedAt", { ascending: false });

        if (error) throw error;

        return data.map((request: any) => ({
            id: request.id,
            userId: request.user_id,
            roleRequested: request.roleRequested,
            reason: request.reason,
            status: request.status,
            submittedAt: new Date(request.submittedAt),
            reviewedAt: request.reviewed_at ? new Date(request.reviewed_at) : undefined,
            reviewerId: request.reviewer_id,
        }));
    }

    /**
     * Get all requests (admin only)
     */
    async getAllRequests(): Promise<RoleRequest[]> {
        const { data, error } = await apiClient
            .from("role_requests")
            .select(`
        *,
        users!requests_user_id_fkey (
          full_name,
          email
        )
      `)
            .order("submittedAt", { ascending: false });

        if (error) throw error;

        return data.map((request: any) => ({
            id: request.id,
            userId: request.user_id,
            userName: request.users?.full_name,
            userEmail: request.users?.email,
            roleRequested: request.roleRequested,
            reason: request.reason,
            status: request.status,
            submittedAt: new Date(request.submittedAt),
            reviewedAt: request.reviewed_at ? new Date(request.reviewed_at) : undefined,
            reviewerId: request.reviewer_id,
        }));
    }

    /**
     * Get pending requests (admin only)
     */
    async getPendingRequests(): Promise<RoleRequest[]> {
        const { data, error } = await apiClient
            .from("role_requests")
            .select(`
        *,
        users!requests_user_id_fkey (
          full_name,
          email
        )
      `)
            .eq("status", "pending")
            .order("submittedAt", { ascending: false });

        if (error) throw error;

        return data.map((request: any) => ({
            id: request.id,
            userId: request.user_id,
            userName: request.users?.full_name,
            userEmail: request.users?.email,
            roleRequested: request.roleRequested,
            reason: request.reason,
            status: request.status,
            submittedAt: new Date(request.submittedAt),
            reviewedAt: request.reviewed_at ? new Date(request.reviewed_at) : undefined,
            reviewerId: request.reviewer_id,
        }));
    }

    /**
     * Approve a request (admin only)
     */
    async approveRequest(requestId: string, reviewerId: string): Promise<RoleRequest> {
        // Get the request first
        const { data: requestData, error: fetchError } = await apiClient
            .from("role_requests")
            .select("*")
            .eq("id", requestId)
            .single();

        if (fetchError) throw fetchError;

        // Update user role
        const { error: userError } = await apiClient
            .from("users")
            .update({ role: requestData.roleRequested })
            .eq("id", requestData.user_id);

        if (userError) throw userError;

        // Update request status
        const { data, error } = await apiClient
            .from("role_requests")
            .update({
                status: "approved",
                reviewed_at: new Date().toISOString(),
                reviewer_id: reviewerId,
            })
            .eq("id", requestId)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            userId: data.user_id,
            roleRequested: data.roleRequested,
            reason: data.reason,
            status: data.status,
            submittedAt: new Date(data.submittedAt),
            reviewedAt: new Date(data.reviewed_at),
            reviewerId: data.reviewer_id,
        };
    }

    /**
     * Reject a request (admin only)
     */
    async rejectRequest(requestId: string, reviewerId: string): Promise<RoleRequest> {
        const { data, error } = await apiClient
            .from("role_requests")
            .update({
                status: "rejected",
                reviewed_at: new Date().toISOString(),
                reviewer_id: reviewerId,
            })
            .eq("id", requestId)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            userId: data.user_id,
            roleRequested: data.roleRequested,
            reason: data.reason,
            status: data.status,
            submittedAt: new Date(data.submittedAt),
            reviewedAt: new Date(data.reviewed_at),
            reviewerId: data.reviewer_id,
        };
    }

    /**
     * Cancel a pending request (user can cancel their own request)
     */
    async cancelRequest(requestId: string, userId: string): Promise<void> {
        const { error } = await apiClient
            .from("role_requests")
            .delete()
            .eq("id", requestId)
            .eq("user_id", userId)
            .eq("status", "pending");

        if (error) throw error;
    }
}

export const roleRequestService = new RoleRequestService();
