export interface ProductTranslation {
    translations: [{ description: string, language: string }];
}

export interface UnitProductTranslation extends ProductTranslation {
    id: string
}

export interface ProductTranslations {
    [key: string]: UnitProductTranslation
}