import express, { NextFunction, Request, Response, Router } from 'express';
import { Product } from 'interfaces/Product';
import { ProductsRepository } from 'interfaces/ProductsRepository';
import { Translations } from 'services/Translations';

export default class ProductRoutes {
  public router: Router;
  private productsRepository: ProductsRepository;
  private translations: Translations;

  constructor(productsRepository: ProductsRepository, translations: Translations) {
    this.router = express.Router();
    this.productsRepository = productsRepository;
    this.translations = translations;
    this.registerRoutes();
  }

  protected registerRoutes(): void {
    // Setup express Routes
    this.router.get('/', this.getAllProducts.bind(this));
    this.router.get('/:id', this.getProduct.bind(this));
    this.router.post('/', this.addProduct.bind(this));
    this.router.put('/:id', this.updateProduct.bind(this));
    this.router.delete('/:id', this.deleteProduct.bind(this));
  }

  private async getAllProducts(req: Request, res: Response, next: NextFunction) {
    req.log.info('GET /product');
    const products = await this.productsRepository.all();
    req.log.debug(products);
    // Call the repository to get the product
    return res.json(products);
  }

  private async getProduct(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id?.toString();

    if (!id) {
      req.log.warn('ID is required');
      return res.status(400).send('ID is required');
    }

    req.log.info('GET /product/:id', req.params.id);
    const product = await this.productsRepository.find(id);
    // Call the repository to get the product
    return res.json(product);
  }

  private async addProduct(req: Request, res: Response, next: NextFunction) {
    const product = req.body as Product;
    if (product) {
      req.log.info('POST /product', product);
      const addedProduct = await this.productsRepository.create(product);
      if (product.description &&
        addedProduct) {
        //try {
          await this.translations.requestTranslation(addedProduct.id, [{ name: "description", value: addedProduct.description }]);
        // } catch (error) {
        //   req.log.error('Error requesting translation', error);
        // }
      }
    }
    else
      req.log.warn('POST /product', 'No product data in request');
    return res.send('OK');
  }

  private async updateProduct(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id?.toString();

    if (!id) {
      req.log.warn('ID is required');
      return res.status(400).send('ID is required');
    }

    req.log.info('PUT /product/:id', id);
    const product = req.body as Product;
    if (product) {
      req.log.debug('request payload', id, product);
      const updatedProduct = await this.productsRepository.update(id, product);
      if (product.description &&
        updatedProduct) {
          req.log.info('Product description updated');
        //try {
          await this.translations.requestTranslation(updatedProduct.id, [{ name: "description", value: updatedProduct.description }]);
        // } catch (error) {
        //   req.log.error('Error requesting translation', error);
        // }
      }
      else
        req.log.info('Product does not exist', id);
    }
    else
      req.log.warn('PUT /product/:id', 'No product data in request');

    return res.send('OK');
  }

  private async deleteProduct(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id?.toString();

    if (!id) {
      req.log.warn('ID is required');
      return res.status(400).send('ID is required');
    }

    console.info('DELETE /product/:id', req.params.id);
    await this.productsRepository.delete(id);
    return res.send('OK');
  }
}
