import { User } from "./user.types";
export interface RoleRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  roleRequested: "provider" | "admin";
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerId?: string;
}

export interface CreateRoleRequestDto {
  userId: string;
  roleRequested: "provider" | "admin";
  reason: string;
}

export interface PropertyRequest {
  id: string;
  provider: User;
  propertyId: string;
  propertyType: "car" | "apartment" | "hotel";
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  rejectionReason?: string;
}
