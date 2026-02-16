# Sidebar, Schema, Routing & Landing Page Planı

> **Kapsam:** documents schema, sidebar tree logic, URL routing (`/dashboard/:slug`), landing page, TanStack Query  
> **Kapsam dışı:** Tiptap editor entegrasyonu, role/yetki sistemi, user table

---

## 0. Rendering & Data Fetching Stratejisi

### Server Component vs Client Component

| Katman | Render | Neden |
|--------|--------|-------|
| `app/page.tsx` (Landing) | **Server** | Auth session check, statik içerik, SEO |
| `app/dashboard/layout.tsx` | **Server** | İlk veri çekme (prefetch), TanStack Query hydration |
| `app/dashboard/page.tsx` | **Server** | Statik "doc seç" placeholder |
| `app/dashboard/[slug]/page.tsx` | **Server** | Doküman content'ini prefetch eder |
| `components/app-sidebar.tsx` | **Client** | Interactive tree, collapse/expand, router.push |
| `components/doc-tree.tsx` | **Client** | Reactive tree rendering, TanStack Query cache'den okur |
| `components/doc-tree-item.tsx` | **Client** | Collapsible, click handler, active state |

### TanStack Query Entegrasyonu

TanStack Query şu amaçlarla kullanılacak:

1. **Sidebar cache:** Server component'te prefetch edilen doküman listesi TanStack Query cache'ine hydrate edilecek. Client component'ler `useQuery` ile bu cache'den okuyacak.
2. **Mutation sonrası otomatik refresh:** Doküman oluştur/güncelle/sil işlemlerinden sonra `invalidateQueries` ile sidebar otomatik güncellenecek.
3. **Optimistic updates (opsiyonel):** Sidebar'da title değişikliği gibi işlemler anında yansıyacak.

```
┌─────────────────────────────────────────────────────┐
│  Server Component (dashboard/layout.tsx)            │
│  ┌───────────────────────────────────────────────┐  │
│  │ prefetch: getAllDocumentsMeta()               │  │
│  │ → dehydrate → HydrationBoundary              │  │
│  └───────────────────────────────────────────────┘  │
│                      │                              │
│                      ▼                              │
│  ┌───────────────────────────────────────────────┐  │
│  │ Client: AppSidebar                           │  │
│  │ → useQuery(['documents']) → cache'den okur    │  │
│  │ → buildTree() → recursive render             │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  Mutations (create/update/delete)                   │
│  → useMutation → API route → invalidateQueries     │
│  → sidebar otomatik re-render                       │
└─────────────────────────────────────────────────────┘
```

### Kurulum

```bash
bun add @tanstack/react-query
```

Gerekli dosyalar:

| Dosya | Açıklama |
|-------|----------|
| `lib/react-query/provider.tsx` | `QueryClientProvider` wrapper (client component) |
| `lib/react-query/get-query-client.ts` | Singleton `QueryClient` factory (server-safe) |
| `lib/react-query/queries.ts` | Query key'ler ve `queryFn`'ler |
| `app/dashboard/layout.tsx` | `HydrationBoundary` + prefetch |

---

## 1. Database Schema

### `documents` tablosu

Mevcut `usersTable` ve `postsTable` **silinecek** (örnek verilerdi). Yerine tek bir `documents` tablosu gelecek.

```typescript
// db/schema.ts
import {
  pgTable, uuid, text, integer, boolean, timestamp, jsonb, index,
} from 'drizzle-orm/pg-core';

export const documents = pgTable('documents', {
  id:        uuid('id').primaryKey().defaultRandom(),
  title:     text('title').notNull().default('Untitled'),
  slug:      text('slug').notNull().unique(),           // URL slug - /dashboard/:slug
  content:   jsonb('content'),                          // Tiptap JSON (lazy loaded)
  icon:      text('icon'),                              // emoji: 📄 📁 etc.

  // Tree yapısı
  parentId:  uuid('parent_id').references((): any => documents.id, { onDelete: 'cascade' }),
  position:  integer('position').notNull().default(0),  // kardeşler arası sıralama

  // Soft delete
  isArchived: boolean('is_archived').notNull().default(false),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
}, (table) => [
  index('idx_documents_parent_id').on(table.parentId),
  index('idx_documents_parent_position').on(table.parentId, table.position),
  index('idx_documents_slug').on(table.slug),
]);

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
```

**Slug mantığı:**
- Yeni doc oluşturulduğunda `title` üzerinden slug üretilir (ör: `"Rezervasyon İşlemleri"` → `"rezervasyon-islemleri"`)
- Aynı slug varsa sonuna `-1`, `-2` eklenir
- Slug helper fonksiyonu `lib/slug.ts`'de olacak

> [!IMPORTANT]
> Migration: Mevcut `users_table` ve `posts_table` drop edilip `documents` tablosu oluşturulacak. Dev ortamda olduğumuz için `drizzle-kit push` veya yeni migration ile ilerlenecek.

---

## 2. Sidebar Tree Logic

### Veri Akışı

```
Sayfa yüklenir (dashboard layout — Server Component)
       │
       ▼
prefetchQuery(['documents']) → getAllDocumentsMeta()
       │
       ▼
dehydrate(queryClient) → HydrationBoundary'ye geçir
       │
       ▼
Client Component: useQuery(['documents']) → cache'den okur
       │
       ▼
buildTree() → flat array → tree dönüşümü
       │
       ▼
Recursive <DocTreeItem /> render
```

### API: Tüm dokümanları çek (content hariç)

```typescript
// lib/queries/documents.ts
import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq, asc, isNull } from 'drizzle-orm';

export async function getAllDocumentsMeta() {
  return db
    .select({
      id: documents.id,
      title: documents.title,
      slug: documents.slug,
      icon: documents.icon,
      parentId: documents.parentId,
      position: documents.position,
      isArchived: documents.isArchived,
    })
    .from(documents)
    .where(eq(documents.isArchived, false))
    .orderBy(asc(documents.position));
}

export async function getDocumentBySlug(slug: string) {
  const results = await db
    .select()
    .from(documents)
    .where(eq(documents.slug, slug))
    .limit(1);
  return results[0] ?? null;
}
```

### Flat → Tree Dönüşümü (Client Util)

```typescript
// lib/build-tree.ts
export type DocumentMeta = {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  position: number;
};

export type TreeNode = DocumentMeta & {
  children: TreeNode[];
};

export function buildTree(docs: DocumentMeta[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Her dokümanı map'e ekle
  for (const doc of docs) {
    map.set(doc.id, { ...doc, children: [] });
  }

  // Parent-child ilişkisini kur
  for (const doc of docs) {
    const node = map.get(doc.id)!;
    if (doc.parentId && map.has(doc.parentId)) {
      map.get(doc.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
```

### Sidebar Component Yapısı

Mevcut `app-sidebar.tsx`, `nav-main.tsx`, `nav-projects.tsx` dosyaları refactor edilecek:

```
components/
├── app-sidebar.tsx        → Sidebar shell (header + content + footer)
├── doc-tree.tsx            → [NEW] Recursive tree container
├── doc-tree-item.tsx       → [NEW] Tek bir tree node (collapsible + icon + title)
├── nav-user.tsx            → Mevcut (auth ile entegre edilecek)
└── team-switcher.tsx       → Silinecek veya RMOS branding'e dönüşecek
```

`doc-tree-item.tsx` her node için:
- Toggle (çocuk varsa) → shadcn `Collapsible` kullanılacak
- Icon (emoji)
- Title
- Tıklanınca → `router.push(/dashboard/${slug})`
- Active state (mevcut URL'e göre)

---

## 3. Routing Yapısı

```
app/
├── page.tsx                          → Landing page
├── layout.tsx                        → Root layout
├── auth/[path]/page.tsx              → ✅ Mevcut (Neon Auth)
├── api/auth/[...path]/route.ts       → ✅ Mevcut (Neon Auth handler)
├── account/[path]/page.tsx           → ✅ Mevcut
├── dashboard/
│   ├── layout.tsx                    → [MODIFY] SidebarProvider + sidebar + content area
│   ├── page.tsx                      → [MODIFY] Dashboard home (doc seçilmemiş durum)
│   └── [slug]/
│       └── page.tsx                  → [NEW] Tiptap editor ile doküman görüntüleme
```

### `dashboard/layout.tsx` (Modify)

```typescript
// Server component — prefetch + hydration
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query/get-query-client';
import { getAllDocumentsMeta } from '@/lib/queries/documents';
import { documentKeys } from '@/lib/react-query/queries';

export default async function DashboardLayout({ children }) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: documentKeys.list(),
    queryFn: getAllDocumentsMeta,
  });

  return (
    <SidebarProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AppSidebar />
        <SidebarInset>
          <header>...</header>
          {children}
        </SidebarInset>
      </HydrationBoundary>
    </SidebarProvider>
  );
}
```

> [!NOTE]
> `AppSidebar` artık prop almıyor. İçeride `useQuery(['documents'])` ile cache'den okuyor.

### `dashboard/[slug]/page.tsx` (New)

```typescript
// Server component - slug ile doküman contentini çeker
import { getDocumentBySlug } from '@/lib/queries/documents';
import { notFound } from 'next/navigation';

export default async function DocumentPage({ params }) {
  const { slug } = await params;
  const doc = await getDocumentBySlug(slug);
  if (!doc) notFound();

  return (
    <div className="flex-1 p-4">
      <h1>{doc.icon} {doc.title}</h1>
      {/* Tiptap editor - sonraki adımda */}
      <pre>{JSON.stringify(doc.content, null, 2)}</pre>
    </div>
  );
}
```

---

## 4. Landing Page

Basit, Next.js standartlarına uygun bir landing page. **Server Component** olacak.

```
app/page.tsx → Server Component
  ├── Auth durumu kontrol et (auth.getSession())
  ├── Giriş yapılmışsa → /dashboard'a redirect button
  └── Giriş yapılmamışsa → /auth/sign-in'e yönlendiren button
```

Minimal tasarım:
- RMOS Docs başlığı
- Kısa açıklama
- Tek bir CTA butonu (Login / Dashboard)
- Dark mode uyumlu (mevcut dark class zaten root layout'ta)

---

## 5. API Routes (CRUD)

MVP için gerekli mutasyon endpoint'leri:

```
app/api/documents/
├── route.ts              → [NEW] GET (all meta), POST (create)

app/api/documents/[id]/
├── route.ts              → [NEW] GET (by id), PATCH (update), DELETE (archive)
```

**POST create** sırasında slug otomatik üretilecek. **PATCH** ile `title`, `content`, `icon`, `parentId`, `position` güncellenebilecek. **DELETE** aslında soft delete (`isArchived = true`).

---

## 6. Dosya Değişiklik Özeti

### Schema & DB
| Dosya | İşlem |
|-------|-------|
| [schema.ts](file:///Users/bartu/Desktop/apps/rmos-docs/db/schema.ts) | MODIFY — postsTable/usersTable sil, documents tablosu ekle |
| [NEW] `lib/slug.ts` | NEW — slug üretme helper |
| [NEW] `lib/queries/documents.ts` | NEW — DB query fonksiyonları |

### TanStack Query Setup
| Dosya | İşlem |
|-------|-------|
| [NEW] `lib/react-query/provider.tsx` | NEW — QueryClientProvider wrapper |
| [NEW] `lib/react-query/get-query-client.ts` | NEW — Singleton QueryClient factory |
| [NEW] `lib/react-query/queries.ts` | NEW — Query key'ler ve queryFn'ler |
| [layout.tsx](file:///Users/bartu/Desktop/apps/rmos-docs/app/layout.tsx) | MODIFY — QueryProvider ile wrap |

### Routing & Pages
| Dosya | İşlem |
|-------|-------|
| [page.tsx](file:///Users/bartu/Desktop/apps/rmos-docs/app/page.tsx) | MODIFY — Landing page (server component) |
| [layout.tsx](file:///Users/bartu/Desktop/apps/rmos-docs/app/dashboard/layout.tsx) | MODIFY — prefetch + HydrationBoundary |
| [page.tsx](file:///Users/bartu/Desktop/apps/rmos-docs/app/dashboard/page.tsx) | MODIFY — Dashboard home state |
| [NEW] `app/dashboard/[slug]/page.tsx` | NEW — Doküman detay sayfası |

### Sidebar Components
| Dosya | İşlem |
|-------|-------|
| [app-sidebar.tsx](file:///Users/bartu/Desktop/apps/rmos-docs/components/app-sidebar.tsx) | MODIFY — useQuery ile cache'den oku, örnek data sil |
| [NEW] `components/doc-tree.tsx` | NEW — Tree container |
| [NEW] `components/doc-tree-item.tsx` | NEW — Recursive tree node |
| [nav-main.tsx](file:///Users/bartu/Desktop/apps/rmos-docs/components/nav-main.tsx) | DELETE — artık kullanılmayacak |
| [nav-projects.tsx](file:///Users/bartu/Desktop/apps/rmos-docs/components/nav-projects.tsx) | DELETE — artık kullanılmayacak |
| [team-switcher.tsx](file:///Users/bartu/Desktop/apps/rmos-docs/components/team-switcher.tsx) | DELETE veya RMOS branding'e dönüştür |

### API Routes
| Dosya | İşlem |
|-------|-------|
| [NEW] `app/api/documents/route.ts` | NEW — GET all, POST create |
| [NEW] `app/api/documents/[id]/route.ts` | NEW — GET by id, PATCH, DELETE |

---

## 7. Silinecek / Temizlenecek Dosyalar

- `app/dashboard/server-component/page.tsx` — örnek sayfa, silinecek
- `components/example.tsx` — örnek component, silinecek

---

## 8. Verification Plan

### Dev Server

```bash
bun run dev
```

### Otomatik Test
Şuan projede test framework'ü kurulu değil. Aşağıdaki testler **manuel** yapılacak.

### Manuel Doğrulama

1. **Schema migration:** `bunx drizzle-kit push` veya `bunx drizzle-kit generate && bunx drizzle-kit migrate` çalıştır → Neon dashboard'dan `documents` tablosunun oluştuğunu doğrula
2. **Landing page:** `http://localhost:3000` → giriş yapılmamış durumda "Giriş Yap" butonu görünsün, tıklanınca `/auth/sign-in`'e gitsin
3. **Auth sonrası:** Giriş yaptıktan sonra landing'deki buton "Dashboard'a Git" olsun ve `/dashboard`'a yönlendirsin
4. **Sidebar tree:** `/dashboard`'a git → sidebar'da dokümanlar tree yapısında görünsün (ilk başta boş olacak)
5. **API ile doküman oluştur:** `POST /api/documents` → `{ "title": "Test Doc" }` gönder → slug otomatik üretilsin, sidebar'da görünsün
6. **Doküman sayfası:** Sidebar'dan dokümana tıkla → `/dashboard/test-doc` URL'sine git → doküman içeriği (henüz raw JSON) görünsün
7. **Nested docs:** Parent altına çocuk doküman oluştur → sidebar'da tree yapısında görünsün, collapse/expand çalışsın
