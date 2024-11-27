import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ProductCatalogTranslations } from 'interfaces/ProductCatalogTranslations';
import { ProductTranslation, UnitProductTranslation } from 'interfaces/ProductTranslation';
import { ProductTranslationsRepository } from 'interfaces/ProductTranslationsRepository';
import { DataPersistance, ReadData } from 'interfaces/DataPersistance';
import { logger } from '../utils/Logger'

export default class JSONProductTranslationRepository implements ProductTranslationsRepository {
  private persistance: DataPersistance;
  private translations_json_file_name: string;

  constructor(persistance: DataPersistance, translations_json_file_name: string) {
    this.persistance = persistance;
    this.translations_json_file_name = translations_json_file_name;
  }

  private async writeProductCatalogTranslations(persistenceEtag: string, catalog: ProductCatalogTranslations): Promise<boolean> {
    let success = false;
    try {
      logger.info(`Found ${catalog.products.length} products`);
      await this.persistance.writeData(this.translations_json_file_name, persistenceEtag, JSON.stringify(catalog, null, '\t'));
      success = true;
    }
    catch (err) {
      logger.error('Failed to write product catalog translations file', err);
    }
    return success;
  }

  private async readProductCatalogTranslations(): Promise<{ persistenceEtag: string, catalog: ProductCatalogTranslations }> {
    let translations: { persistenceEtag: string, catalog: ProductCatalogTranslations } = { persistenceEtag: '', catalog: { products: [] } };
    try {
      logger.info('Reading translations from product catalog translations file');
      const data: ReadData = await this.persistance.readData(this.translations_json_file_name);

      if (data) {
        try {
          translations.persistenceEtag = data.etag;
          translations.catalog = JSON.parse(data.contents) as ProductCatalogTranslations;
          logger.info(`Found ${translations.catalog.products.length} products`);
        }
        catch (err) {
          logger.error('Failed to parse product catalog translations file', err);
        }
      }
      else {
        logger.info('product catalog translations file is empty');
      }
    }
    catch (err) {
      logger.error('Failed to read product catalog translations file', err);
    }
    return translations;
  }

  public async all(): Promise<UnitProductTranslation[]> {
    const data = await this.readProductCatalogTranslations();
    return data.catalog.products;
  }

  public async create(id: string, createValues: ProductTranslation): Promise<UnitProductTranslation | null> {
    if (!createValues) {
      return null;
    }

    const data = await this.readProductCatalogTranslations();
    logger.info('Create product translations', createValues);
    const product = { ...createValues, id: id };
    data.catalog.products.push(product);

    await this.writeProductCatalogTranslations(data.persistenceEtag, data.catalog);
    return product;
  }

  public async update(id: string, updateValues: ProductTranslation): Promise<UnitProductTranslation | null> {
    const data = await this.readProductCatalogTranslations();
    const product = data.catalog.products.find((product: UnitProductTranslation) => product.id === id);
    if (!product) {
      return null;
    }
    logger.info('Update product translations with ID', id, updateValues);
    let index = data.catalog.products.indexOf(product);
    const updatedProduct = { ...updateValues, id: id };
    data.catalog.products.splice(index, 1, updatedProduct);
    await this.writeProductCatalogTranslations(data.persistenceEtag, data.catalog);
    return product;
  }

  public async delete(id: string): Promise<void> {
    const data = await this.readProductCatalogTranslations();
    logger.info('Delete product translations with ID', id);
    data.catalog.products = data.catalog.products.filter((product: UnitProductTranslation) => product.id !== id);
    await this.writeProductCatalogTranslations(data.persistenceEtag, data.catalog);
  }

  public async find(id: string): Promise<UnitProductTranslation | null> {
    const data = await this.readProductCatalogTranslations();
    const product = data.catalog.products.find((product: UnitProductTranslation) => product.id === id);

    if (!product) {
      return null;
    }

    logger.info('Find product translations with ID', id);

    console.dir(product, { depth: null });
    return product;
  }
}
