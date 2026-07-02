import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Article } from "@albania/shared-types";
import {
  getAllArticles,
  getArticleById,
} from "@/services/api/articleService";

const ARTICLES_QUERY_KEY = ["articles"] as const;

export const useArticles = () => {
  return useQuery({
    queryKey: ARTICLES_QUERY_KEY,
    queryFn: getAllArticles,
    staleTime: 10 * 60 * 1000,
  });
};

export const useArticle = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...ARTICLES_QUERY_KEY, id],
    queryFn: () => getArticleById(id as string),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
    initialData: () => {
      const cachedArticles = queryClient.getQueryData<Article[]>(
        ARTICLES_QUERY_KEY,
      );
      return cachedArticles?.find((article) => article.id === id);
    },
  });
};

export { ARTICLES_QUERY_KEY };
