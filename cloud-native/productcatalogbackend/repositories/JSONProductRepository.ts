import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Product, Products, UnitProduct } from "interfaces/Product";
import { ProductCatalog } from 'interfaces/ProductCatalog';
import { ProductsRepository } from "interfaces/ProductsRepository";
import { DataPersistance, ReadData } from 'interfaces/DataPersistance';
import { logger } from '../utils/Logger'

export default class JSONProductRepository implements ProductsRepository {
  private persistance: DataPersistance;
  private product_json_file_name: string;


  constructor(persistance: DataPersistance, product_json_file_name: string) {
    this.persistance = persistance;
    this.product_json_file_name = product_json_file_name;
  }

  private async writeProductCatalog( persistenceEtag: string, catalog: ProductCatalog): Promise<boolean> {
    let success = false;
    try {
      logger.info(`Found ${catalog.products.length} products`);
      await this.persistance.writeData(this.product_json_file_name, persistenceEtag, JSON.stringify(catalog, null, '\t'));
      success = true;
    }
    catch (err) {
      logger.error('Failed to write catalog file', err);
    }
    return success;
  }

  private async readProductCatalog(): Promise<{ persistenceEtag: string, catalog: ProductCatalog }> {
    let products: { persistenceEtag: string, catalog: ProductCatalog } = { persistenceEtag: '', catalog: { products: [] } };
    try {
      logger.info('Reading products from catalog file');
      const data: ReadData = await this.persistance.readData(this.product_json_file_name);

      if (data) {
        try {
          products.persistenceEtag = data.etag;
          products.catalog = JSON.parse(data.contents) as ProductCatalog;
          logger.info(`Found ${products.catalog.products.length} products`);
        }
        catch (err) {
          logger.error('Failed to parse catalog file', err);
        }
      }
      else {
        logger.info('Catalog file is empty');
      }
    }
    catch (err) {
      logger.error('Failed to read catalog file', err);
    }
    return products;
  }

  public async all(): Promise<UnitProduct[]> {
    const data = await this.readProductCatalog();
    return data.catalog.products;
  }

  public async create(createValues: Product): Promise<UnitProduct | null> {
    if (!createValues) {
      return null;
    }

    const data = await this.readProductCatalog();
    logger.info('Create product', createValues);
    const product = { ...createValues, id: uuidv4() };
    data.catalog.products.push(product);

    await this.writeProductCatalog(data.persistenceEtag, data.catalog);
    return product;
  }

  public async update(id: string, updateValues: Product): Promise<UnitProduct | null> {
    const data = await this.readProductCatalog();
    const product = data.catalog.products.find((product: UnitProduct) => product.id === id);
    if (!product) {
      return null;
    }
    logger.info('Found product', product);
    logger.info('Applying product updates',updateValues);
    let index = data.catalog.products.indexOf(product);
    const updatedProduct = { ...updateValues, id: id };
    data.catalog.products.splice(index, 1, updatedProduct);
    await this.writeProductCatalog(data.persistenceEtag, data.catalog);
    return product;
  }

  public async delete(id: string): Promise<void> {
    const data = await this.readProductCatalog();
    logger.info('Delete product with ID', id);
    data.catalog.products = data.catalog.products.filter((product: UnitProduct) => product.id !== id);
    await this.writeProductCatalog(data.persistenceEtag, data.catalog);
  }

  public async find(id: string): Promise<UnitProduct | null> {
    const data = await this.readProductCatalog();
    const product = data.catalog.products.find((product: UnitProduct) => product.id === id);

    if (!product) {
      return null;
    }

    logger.info('Find product with ID', id);

    console.dir(product, { depth: null });
    return product;
  }
}