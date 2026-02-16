# RMOS Docs — Project Architecture & Developer Guide

Bu doküman, **RMOS Docs** projesinin teknik yapısını, klasör düzenini ve çalışma mantığını açıklar. Yapay zeka asistanları ve geliştiriciler için projenin **single source of truth** belgesidir.

---

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Neon PostgreSQL (Serverless)
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS v4, shadcn/ui
- **State/Data Fetching:** TanStack Query (React Query)
- **Authentication:** Neon Auth (`@neondatabase/auth`)

---

## 📂 Project Structure

Proje, Next.js App Router standartlarına uygun olarak yapılandırılmıştır.

```
/
├── app/                        # Next.js App Router sayfaları
│   ├── api/                    # API Routes (Backend logic)
│   │   ├── auth/               # Neon Auth handler'ları
│   │   └── documents/          # Document CRUD (GET, POST, PATCH, DELETE)
│   ├── dashboard/              # Ana uygulama arayüzü
│   │   ├── layout.tsx          # Sidebar + Query Prefetching
│   │   ├── page.tsx            # "Select a document" placeholder
│   │   └── [slug]/             # Dinamik doküman sayfası
│   └── page.tsx                # Landing page (Public layer)
│
├── components/                 # UI bileşenleri
│   ├── ui/                     # shadcn/ui primitifleri
│   ├── app-sidebar.tsx         # Ana sidebar shell'i
│   ├── doc-tree.tsx            # Recursive document tree container
│   ├── doc-tree-item.tsx       # Recursive tree node item
│   └── ...
│
├── db/                         # Veritabanı katmanı
│   ├── index.ts                # DB connection initialization
│   └── schema.ts               # Drizzle schema tanımları (`documents` table)
│
├── lib/                        # Yardımcı kütüphaneler ve logic
│   ├── auth/                   # Auth client/server config
│   ├── queries/                # Veritabanı sorguları (Server-side data access)
│   ├── react-query/            # QueryClient singleton & provider
│   └── utils/                  # Utility fonksiyonlar
│       ├── index.ts            # `cn` helper
│       ├── slug.ts             # Slug generation logic
│       └── tree.ts             # Flat array -> Tree conversion logic
│
└── public/                     # Statik dosyalar
```

---

## 🧠 Core Concepts & Logic

### 1. Data Fetching Strategy (Hybrid)

Proje, **Server-Side Prefetching** ve **Client-Side Hydration** stratejisini kullanır. Bu sayede SEO dostu ve hızlı ilk yükleme (FCP) sağlanırken, client tarafında SPA hissiyatı korunur.

1.  **Server (`app/dashboard/layout.tsx`):**
    *   `getAllDocumentsMeta` fonksiyonu ile tüm doküman listesini DB'den çeker.
    *   `queryClient.prefetchQuery` ile veriyi sunucuda önbelleğe alır.
    *   `HydrationBoundary` ile veriyi client'a serialize eder.

2.  **Client (`components/doc-tree.tsx`):**
    *   `useQuery({ queryKey: ["documents"] })` ile veriyi kullanır.
    *   Veri zaten prefetch edildiği için yükleme anında (loading spinner olmadan) render olur.

### 2. Sidebar & Document Tree

Sidebar, klasör yapısını simüle eden **recursive** bir yapıdadır.

*   **Veri Yapısı:** Veritabanında "Adjacency List" (parent_id) modeli kullanılır.
*   **Dönüşüm (`lib/utils/tree.ts`):** Veritabanından gelen düz liste (flat array), client tarafında `buildTree` fonksiyonu ile iç içe geçmiş (nested) bir obje yapısına dönüştürülür.
*   **Rendering:** `DocTree` bileşeni ağacı oluşturur, `DocTreeItem` bileşeni ise kendini recursive olarak çağırarak alt klasörleri render eder.

### 3. Database Schema (`documents`)

Tüm içerik tek bir tabloda tutulur.

| Sütun | Tip | Açıklama |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `title` | Text | Doküman başlığı |
| `slug` | Text | URL için benzersiz tanımlayıcı (Unique) |
| `content` | JSONB | Doküman içeriği (Tiptap JSON formatı) |
| `parentId` | UUID | Üst doküman referansı (Root ise null) |
| `position` | Integer | Sıralama indeksi |
| `isArchived` | Boolean | Soft delete bayrağı |

### 4. Routing & Slugs

*   **URL Yapısı:** `/dashboard/[slug]`
*   **Slug Generation (`lib/utils/slug.ts`):**
    *   Başlıktan otomatik üretilir (`"Proje Raporu"` -> `"proje-raporu"`).
    *   Çakışma varsa sonuna sayaç eklenir (`"proje-raporu-1"`).
    *   DB sorgusu ile unique olduğu garanti edilir.

---

## 🔌 API & Mutations

Uygulama, veri mutasyonları (Ekleme, Güncelleme, Silme) için **API Routes** kullanır.

*   `POST /api/documents`: Yeni doküman oluşturur. Slug otomatik üretilir.
*   `GET /api/documents`: Tüm doküman listesini (metadata) döner.
*   `PATCH /api/documents/[id]`: Dokümanı günceller (başlık, içerik, parent taşıma vb.).
*   `DELETE /api/documents/[id]`: Dokümanı arşivler (Soft delete).

**Mutation Akışı:**
1.  Kullanıcı arayüzde işlem yapar (örn: "+" butonuna basar).
2.  `useMutation` hook'u API'ye istek atar.
3.  Başarılı cevap gelince `queryClient.invalidateQueries(["documents"])` tetiklenir.
4.  TanStack Query arka planda listeyi günceller ve Sidebar anında yenilenir.

---

## 🛠 Developer Workflow

**Yeni Bir Özellik Eklerken:**
1.  **DB Değişikliği:** `db/schema.ts` güncelle -> `bunx drizzle-kit push`
2.  **Server Query:** `lib/queries/` altına yeni fonksiyon ekle.
3.  **API Route:** `app/api/` altında endpoint oluştur.
4.  **UI:** `components/` altında bileşeni oluştur, `useQuery` veya `useMutation` ile bağla.
