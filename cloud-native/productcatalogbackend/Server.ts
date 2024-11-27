import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';
const product_json_file_name = process.env.PRODUCT_JSON_FILE_NAME || 'products.json';
const translationEndpointUri = process.env.TRANSLATIONS_ENDPOINT_URI || '';
const translations_json_file_name = process.env.TRANSLATIONS_JSON_FILE_NAME || 'product-translations.json';
import express, { Application, Request, Response, NextFunction } from 'express';
import { pinoHttp } from "pino-http";
import serverless from 'serverless-http';
import { AwsCredentialIdentityProvider } from "@smithy/types";
import { fromIni } from "@aws-sdk/credential-providers";
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import readline from "readline";
import ProductRoutes from './routes/ProductRoutes';
import cors from 'cors';
import { ProductsRepository } from './interfaces/ProductsRepository';
import JSONProductRepository from './repositories/JSONProductRepository';
import SubscriptionRoutes from './routes/SubscriptionRoutes';
import { Translations } from './services/Translations';
import JSONProductTranslationRepository from './repositories/JSONProductTranslationRepository';
import { ProductTranslationsRepository } from './interfaces/ProductTranslationsRepository';
import ProductTranslationRoutes from './routes/ProductTranslationRoutes';
import { DataPersistance } from './interfaces/DataPersistance';
import { AzureStorageDataPersistance } from './services/AzureStorageDataPersistance';
import Auth from './middleware/Auth';
import { logger } from './utils/Logger'

class Server {
  private app: Application;
  private handler: any;
  private aws_credentials: AwsCredentialIdentityProvider;
  private auth: Auth;
  private port: number;
  private persistance: DataPersistance;
  private productsRepository: ProductsRepository;
  private productTranslationsRepository: ProductTranslationsRepository;
  private translations: Translations;
  private jsonSettings = { limit: '50mb', type: 'application/json', strict: false };

  constructor() {
    this.app = express();
    this.handler = null;
    this.persistance = new AzureStorageDataPersistance();
    this.productsRepository = new JSONProductRepository(this.persistance, product_json_file_name);
    this.productTranslationsRepository = new JSONProductTranslationRepository(this.persistance, translations_json_file_name);
    this.port = process.env.PORT ? Number(process.env.PORT) : 3000;
    this.aws_credentials = this.getAwsCredentials();
    this.auth = new Auth();
    this.translations = new Translations(this.aws_credentials, translationEndpointUri)
    this.init();
  }

  private prompt(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(question, (ans) => {
        rl.close();
        resolve(ans);
      })
    );
  }

  private getAwsCredentials(prod = process.env.PROD): AwsCredentialIdentityProvider {
    if (prod) {
      logger.info('Using default AWS Auth provider');
      return defaultProvider();
    }
    // This assumes that you've set-up your ~/.aws/config and credentials!
    logger.info('Using local shared AWS credentials');
    return fromIni({
      mfaCodeProvider: async (mfaSerial: string): Promise<string> => {
        return await this.prompt(`Type the mfa token for the following account: ${mfaSerial}\n`);
      }
    });
  }

  private init() {
    // all environments
    this.app.set('port', this.port);

    // Setup middleware
    this.app.use(cors());

    // Log with pino
    this.app.use(pinoHttp({ logger: logger }));

    // health probe
    this.app.get('/health', (req: Request, res: Response, next: NextFunction) => {
      return res.send('OK');
    });

    // Register Routes
    this.app.use('/product', this.auth.isAuthorized, express.json(this.jsonSettings), new ProductRoutes(this.productsRepository, this.translations).router)
    this.app.use('/product-translations', this.auth.isAuthorized, new ProductTranslationRoutes(this.productTranslationsRepository).router)
    this.app.use('/subscription', new SubscriptionRoutes(this.aws_credentials, this.productTranslationsRepository).router)
  }

  public startStandalone() {
    const start = Date.now();
    // boot the express server on the required port
    this.app.listen(this.port, () => {
      const duration = Date.now() - start;
      console.log(`⚡️[server]: Server is running at http://localhost:${this.port}`)
    })
  }

  public async serverlessHandler(event: object, context: object): Promise<object | undefined> {
    if (!this.app)
      throw new Error('Express application not initialized!');

    if (!this.handler) {
      this.handler = serverless(this.app);
      console.log(`⚡️[serverless]: Serverless handler is cached`)
    }
    // return cached handler
    return this.handler(event, context);
  }
}

// Boot our server application
const server = new Server();
if (env !== "production") {
  server.startStandalone();
}

// export the handler for serverless deployment
module.exports.handler = async (event: object, context: object) => {
  // return the serverless handler
  return await server.serverlessHandler(event, context);
}
