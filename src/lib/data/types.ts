/**
 * Contratos da camada de dados — fonte da verdade.
 * Nenhum componente, página ou Server Action importa PrismaClient direto:
 * tudo passa por estes repositórios (ver src/lib/data/index.ts).
 */

export type Role = "USER" | "ADMIN";

export type ProductSpec = { label: string; value: string };

export type ProductImage = {
  id: string;
  url: string;
  publicId: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  position: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  position: number;
  isActive: boolean;
  productCount?: number;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  /** centavos */
  price: number;
  /** centavos — valor antigo, opcional */
  compareAtPrice: number | null;
  paymentInfo: string;
  brand: string | null;
  sku: string | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  category: Pick<Category, "id" | "name" | "slug">;
  images: ProductImage[];
  specs: ProductSpec[];
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Address = {
  id: string;
  userId: string;
  label: string | null;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  isDefault: boolean;
};

export type AddressInput = Omit<Address, "id" | "userId">;

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  role: Role;
  addresses: Address[];
  createdAt: string;
};

export type AboutImage = {
  url: string;
  publicId: string;
  alt: string | null;
  caption: string | null;
};

export type AboutPage = {
  id: string;
  title: string;
  content: string;
  images: AboutImage[];
  updatedAt: string;
};

// ─── Filtros e paginação ──────────────────────────────────────────────────────

export type ProductSort = "relevance" | "price-asc" | "price-desc" | "newest";

export type ProductFilters = {
  categorySlug?: string;
  query?: string;
  /** centavos */
  minPrice?: number;
  /** centavos */
  maxPrice?: number;
  onlyFeatured?: boolean;
  onlyDiscounted?: boolean;
  /** Por padrão o repositório devolve só ativos. O admin pede `includeInactive`. */
  includeInactive?: boolean;
  sort?: ProductSort;
  limit?: number;
};

export type ListOpts = {
  page?: number;
  perPage?: number;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  includeInactive?: boolean;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

// ─── Inputs de escrita ────────────────────────────────────────────────────────

export type ProductImageInput = {
  url: string;
  publicId: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  position: number;
};

export type ProductInput = {
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  paymentInfo: string;
  brand?: string | null;
  sku?: string | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  images: ProductImageInput[];
  specs: ProductSpec[];
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  position?: number;
  isActive?: boolean;
};

export type UserInput = {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  cpf?: string | null;
  role?: Role;
  address?: AddressInput | null;
};

export type UserProfileInput = {
  name: string;
  phone?: string | null;
  cpf?: string | null;
};

export type AboutInput = {
  title: string;
  content: string;
  images: AboutImage[];
};

export type CatalogStats = {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  withoutImage: number;
  outOfStock: number;
  discounted: number;
  byCategory: { categoryId: string; name: string; slug: string; count: number }[];
};

// ─── Repositórios ─────────────────────────────────────────────────────────────

export interface ProductRepository {
  list(filters?: ProductFilters): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getById(id: string): Promise<Product | null>;
  listByCategory(categorySlug: string, opts?: ListOpts): Promise<Paginated<Product>>;
  search(query: string, opts?: ListOpts): Promise<Paginated<Product>>;
  related(productId: string, limit?: number): Promise<Product[]>;
  /** Revalidação de preço/disponibilidade do carrinho persistido. */
  getManyByIds(ids: string[]): Promise<Product[]>;
  priceRange(categorySlug?: string): Promise<{ min: number; max: number }>;
  stats(): Promise<CatalogStats>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, input: Partial<ProductInput>): Promise<Product>;
  remove(id: string): Promise<void>;
}

export interface CategoryRepository {
  list(opts?: { includeInactive?: boolean; withCounts?: boolean }): Promise<Category[]>;
  getBySlug(slug: string): Promise<Category | null>;
  getById(id: string): Promise<Category | null>;
  create(input: CategoryInput): Promise<Category>;
  update(id: string, input: Partial<CategoryInput>): Promise<Category>;
  reorder(orderedIds: string[]): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface UserRepository {
  getByEmail(email: string): Promise<User | null>;
  getById(id: string): Promise<User | null>;
  /** Verifica credenciais. Retorna null para e-mail inexistente OU senha errada. */
  verifyCredentials(email: string, password: string): Promise<User | null>;
  create(input: UserInput): Promise<User>;
  updateProfile(id: string, input: UserProfileInput): Promise<User>;
  updatePassword(id: string, password: string): Promise<void>;
  addAddress(userId: string, input: AddressInput): Promise<Address>;
  updateAddress(
    userId: string,
    addressId: string,
    input: Partial<AddressInput>,
  ): Promise<Address>;
  removeAddress(userId: string, addressId: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<void>;
}

export interface AboutRepository {
  get(): Promise<AboutPage>;
  update(input: AboutInput): Promise<AboutPage>;
}
