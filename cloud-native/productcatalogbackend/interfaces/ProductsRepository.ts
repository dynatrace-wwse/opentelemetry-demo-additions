import { Product, Products, UnitProduct } from "./Product";

export interface ProductsRepository {
  all(): Promise<UnitProduct[]>;
  find(id: string): Promise<UnitProduct | null>;
  create(product: Product): Promise<UnitProduct | null>;
  update(id : string, updateValues : Product): Promise<UnitProduct | null>;
  delete(id: string): Promise<void>;
}