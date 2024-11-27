import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { DataPersistance, ReadData } from "interfaces/DataPersistance";
import { logger } from '../utils/Logger'

export class AzureStorageDataPersistance implements DataPersistance {
    constructor() {

    }

    private getClient(): BlobServiceClient {
        logger.info('Getting Azure Blob Storage Client');
        const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
        const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

        if (!accountName) throw Error('Azure Storage accountName not found');
        if (!accountKey) throw Error('Azure Storage accountKey not found');
        logger.info('Account Name:', accountName);

        // TODO : Switch to federated identity
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

        const client = new BlobServiceClient(
            `https://${accountName}.blob.core.windows.net`,
            sharedKeyCredential
        );

        return client;
    }

    public async readData(file_name: string): Promise<ReadData> {

        // Create the client
        const client = this.getClient();

        // Get the container name
        const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

        // Check if container name is set
        if (!containerName) throw Error('Azure Storage containerName not found');
        logger.info('Container Name:', containerName);

        // create container client
        const containerClient = await client.getContainerClient(containerName);

        logger.info('Blob Name:', file_name);

        // create blob client
        const blobClient = await containerClient.getBlockBlobClient(file_name);

        // download blob content
        const downloadResponse = await blobClient.download();

        // Check if ETag is provided
        if (!downloadResponse.etag) throw Error('Azure Storage Blob ETag not found');

        // get etag for concurrency control
        const originalETag = downloadResponse.etag;

        // read downloaded content to a string
        const downloaded = await this.streamToBuffer(downloadResponse.readableStreamBody);

        // Return the content as a string
        return { etag: originalETag, contents: downloaded.toString() };
    }

    public async writeData(file_name: string, originalEtag: string, data: string): Promise<void> {
        // Create the client
        const client = this.getClient();

        // Check if ETag is provided
        if (!originalEtag) throw Error('Original Etag not provided');

        // Get the container name
        const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

        // Check if container name is set
        if (!containerName) throw Error('Azure Storage containerName not found');

        logger.info('Container Name:', containerName);

        // create container client
        const containerClient = await client.getContainerClient(containerName);

        logger.info('Blob Name:', file_name);

        // create blob client
        const blobClient = await containerClient.getBlockBlobClient(file_name);

        // Make sure the original etag matches, and the correct options are set
        const uploadOptions = {
            conditions: { 
                ifMatch: originalEtag 
            },
            blobHTTPHeaders: { 
                blobContentType: 'application/json', 
                blobContentEncoding: 'utf-8' 
            }
        }

        // upload data to blob
        await blobClient.upload(data, data.length, uploadOptions);
    }

    // Helper function to convert a  readable stream into a Buffer
    private async streamToBuffer(readableStream: NodeJS.ReadableStream | undefined): Promise<string> {
        if (!readableStream) return "";

        const chunks: Array<any> = [];
        for await (let chunk of readableStream) {
            chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks);
        return buffer.toString("utf-8")
    }

}