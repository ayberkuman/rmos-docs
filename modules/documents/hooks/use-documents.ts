import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createDocument } from "../actions";
import type { DocumentMeta } from "../types";

async function fetchDocumentsMeta(): Promise<DocumentMeta[]> {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export function useDocuments() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const documentsQuery = useQuery<DocumentMeta[]>({
    queryKey: ["documents"],
    queryFn: fetchDocumentsMeta,
  });

  const createDocumentMutation = useMutation({
    mutationFn: async ({
      title,
      parentId,
      icon,
    }: {
      title?: string;
      parentId?: string;
      icon?: string;
    }) => {
      const result = await createDocument(title, parentId, icon);
      if (result.error) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      router.push(`/dashboard/${newDoc.slug}`);
    },
  });

  return {
    documents: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    createDocument: createDocumentMutation.mutate,
    isCreating: createDocumentMutation.isPending,
  };
}
