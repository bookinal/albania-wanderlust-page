import { apiClient } from "./apiClient";
import { Article, ArticleDto } from "@albania/shared-types";

export const getAllArticles = async (): Promise<Article[]> => {
  const { data, error } = await apiClient.from("articles").select("*");
  if (error) {
    console.error("[Article Service] Error fetching articles:", error);
    throw error;
  }
  console.log("[Article Service] Fetched articles:", data);
  return data;
};

export const getArticleById = async (id: string): Promise<Article> => {
  const { data, error } = await apiClient
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("[Article Service] Error fetching article:", error);
    throw error;
  }
  return data;
};

export const createArticle = async (data: ArticleDto): Promise<Article> => {
  const { data: newArticle, error } = await apiClient
    .from("articles")
    .insert([data])
    .select()
    .single();
  if (error) {
    console.error("[Article Service] Error creating article:", error);
    throw error;
  }
  return newArticle;
};

export const updateArticle = async (
  id: string,
  data: Partial<ArticleDto>,
): Promise<Article> => {
  const { data: updatedArticle, error } = await apiClient
    .from("articles")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[Article Service] Error updating article:", error);
    throw error;
  }
  return updatedArticle;
};

export const deleteArticle = async (id: string): Promise<void> => {
  const { error } = await apiClient.from("articles").delete().eq("id", id);
  if (error) {
    console.error("[Article Service] Error deleting article:", error);
    throw error;
  }
};
