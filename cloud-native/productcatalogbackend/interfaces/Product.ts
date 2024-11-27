export interface Product {
    name: string;
    description: string;
    picture: string;
    priceUsd: {
        currencyCode: string;
        units: number;
        nanos: number;
    };
    categories: string[];
}

export interface UnitProduct extends Product {
    id : string
}

export interface Products {
    [key : string] : UnitProduct
}