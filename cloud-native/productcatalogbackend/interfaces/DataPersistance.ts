export interface DataPersistance {
    readData(file_name: string): Promise<ReadData>;
    writeData(file_name: string, originalEtag : string, data: string): Promise<void>;
}

export interface ReadData {
    etag: string;
    contents: string;
}