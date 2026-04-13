import { apiClient } from "./apiClient";
import {
  UserProfile,
  UpdateUserProfileData,
  User,
  UpdateUser,
} from "@albania/shared-types";

class UserService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const { data, error } = await apiClient.auth.getUser();
    if (error) throw error;
    const response = await this.getUserById(data.user?.id!);
    //console.log( "UserService - getCurrentUser response:", response );
    return response as User;
  }

  async getUserStatus(userId: string): Promise<string> {
    const { data, error } = await apiClient
      .from("users")
      .select("status")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data.status;
  }

  async getUserById(userId: string): Promise<User> {
    const { data, error } = await apiClient
      .from("users")
      .select(
        "id, email, role, phone, created_at, updated_at, full_name, avatar_url, bio, location, status",
      )
      .eq("id", userId)
      .single();
    if (error) throw error;
    return {
      id: data.id,
      email: data.email,
      role: data.role,
      phone: data.phone,
      created_at: data.created_at,
      updated_at: data.updated_at,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      location: data.location,
      status: data.status,
    };
  }

  /**
   * Get all users with provider role
   */
  async getProviderUsers(): Promise<User[]> {
    const { data, error } = await apiClient
      .from("users")
      .select(
        "id, email, role, phone, created_at, updated_at, full_name, avatar_url, bio, location, status",
      )
      .eq("role", "provider");
    if (error) throw error;
    return data.map((user: any) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at,
      full_name: user.full_name,
      location: user.location,
      status: user.status,
      avatar_url: user.avatar_url,
      bio: user.bio,
    }));
  }

  /**
   * get all users
   */
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await apiClient
      .from("users")
      .select(
        "id, email, role, phone, created_at, updated_at, full_name, avatar_url, bio, location, status",
      );
    if (error) throw error;
    return data.map((user: any) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at,
      full_name: user.full_name,
      location: user.location,
      status: user.status,
      avatar_url: user.avatar_url,
      bio: user.bio,
    }));
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: UpdateUser): Promise<User> {
    // Update users table with new profile data
    const { data, error } = await apiClient
      .from("users")
      .update({
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        phone: updates.phone,
        bio: updates.bio,
        location: updates.location,
        role: updates.role,
        status: updates.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select(
        "id, email, role, phone, created_at, updated_at, full_name, avatar_url, bio, location, status",
      )
      .single();
    if (error) throw error;
    return {
      id: data.id,
      email: data.email,
      role: data.role,
      phone: data.phone,
      created_at: data.created_at,
      updated_at: data.updated_at,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      location: data.location,
      status: data.status,
    };
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Try uploading to the new bucket first
    try {
      const { error: uploadError } = await apiClient.storage
        .from("userAvatar")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = apiClient.storage
        .from("userAvatar")
        .getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: any) {
      // If the bucket rejects due to RLS or policy, try legacy bucket as a fallback
      const msg = err?.message || String(err);
      if (
        msg.includes("row-level security") ||
        msg.includes("policy") ||
        err?.status === 400
      ) {
        try {
          const { error: uploadError2 } = await apiClient.storage
            .from("avatars")
            .upload(filePath, file, { upsert: false });

          if (uploadError2) throw uploadError2;

          const { data } = apiClient.storage
            .from("avatars")
            .getPublicUrl(filePath);
          return data.publicUrl;
        } catch (err2) {
          // Fall through to final error below
        }
      }

      // Provide a helpful error explaining the likely cause
      throw new Error(
        "Failed to upload avatar. Check the 'userAvatar' bucket policy (allow authenticated uploads) or use the service_role key on the server. Original: " +
          msg,
      );
    }
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(avatarPath: string): Promise<void> {
    if (!avatarPath) return;

    // Support public URLs that include the bucket/folder name, e.g.
    // .../object/public/userAvatar/<filePath> or legacy /avatars/<filePath>
    const match = avatarPath.match(/\/(?:userAvatar|avatars)\/([^?#]+)/);
    const path = match ? match[1] : null;
    if (!path) return;

    // Try removing from the new bucket first, then legacy bucket
    let res = await apiClient.storage.from("userAvatar").remove([path]);
    if (res.error) {
      // attempt legacy bucket
      res = await apiClient.storage.from("avatars").remove([path]);
      if (res.error) throw res.error;
    }
  }
}

export const userService = new UserService();
