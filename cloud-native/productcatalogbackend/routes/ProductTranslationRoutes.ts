import express, { NextFunction, Request, Response, Router } from 'express';
import { ProductTranslationsRepository } from 'interfaces/ProductTranslationsRepository';

export default class ProductTranslationRoutes {
  public router: Router;
  private productTranslationsRepository: ProductTranslationsRepository;

  constructor(productTranslationsRepository: ProductTranslationsRepository) {
    this.router = express.Router();
    this.productTranslationsRepository = productTranslationsRepository;
    this.registerRoutes();
  }

  protected registerRoutes(): void {
    // Setup express Routes
    this.router.get('/', this.getAllProductTranslations.bind(this));
    this.router.get('/:id', this.getProductTranslations.bind(this));
  }

  private async getAllProductTranslations(req: Request, res: Response, next: NextFunction) {
    req.log.info('POST /product-translations');
    const translations = await this.productTranslationsRepository.all();
    req.log.debug(JSON.stringify(translations));
    // Call the repository to get the product
    return res.json(translations);
  }

  private async getProductTranslations(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id?.toString();

    if (!id) {
      req.log.warn('ID is required');
      return res.status(400).send('ID is required');
    }
    req.log.info('GET /product-translations/:id', req.params.id);
    const translations = await this.productTranslationsRepository.find(id);
    // Call the repository to get the product
    return res.json(translations);
  }
}
