import { TranslatedField } from "./destination.types";

export interface Article {
  id: string;
  title: TranslatedField;
  excerpt: TranslatedField;
  content: TranslatedField;
  imageUrls: string[];
  category: string;
  author?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleDto {
  title: TranslatedField;
  excerpt: TranslatedField;
  content: TranslatedField;
  imageUrls: string[];
  category: string;
  author?: string;
  publishedAt?: string;
}
