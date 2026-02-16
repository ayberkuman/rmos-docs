// Query key factory — keeps keys consistent across prefetch & useQuery
export const documentKeys = {
  all: ["documents"] as const,
  list: () => [...documentKeys.all, "list"] as const,
  detail: (slug: string) => [...documentKeys.all, "detail", slug] as const,
};
