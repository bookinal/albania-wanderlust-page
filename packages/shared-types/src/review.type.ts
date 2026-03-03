export interface Review {
  id: string;
  user_id: string;
  booking_id: string;
  property_id: number;
  property_type: "car" | "apartment";
  rating: number;
  comment: string;
  reviewer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewDto {
  booking_id: string;
  property_id: number;
  property_type: "car" | "apartment";
  rating: number;
  comment: string;
  reviewer_name?: string;
}
