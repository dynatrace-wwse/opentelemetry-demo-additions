import { ProductTranslation, ProductTranslations, UnitProductTranslation } from "./ProductTranslation";

export interface ProductTranslationsRepository {
  all(): Promise<UnitProductTranslation[]>;
  find(id: string): Promise<UnitProductTranslation| null>;
  create(id : string, product: ProductTranslation): Promise<UnitProductTranslation | null>;
  update(id : string, updateValues : ProductTranslation): Promise<UnitProductTranslation | null>;
  delete(id: string): Promise<void>;
}