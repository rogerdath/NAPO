export * from "./csv-types";
export * from "./action-types"; 

export interface Contract {
    id?: string;
    avtaleKontor?: string;
    avtaleNavn?: string;
    type?: string;
    validTransport?: string;
    validNeeds?: string[];
    cost?: {
        costPerKm: number;
        minimumCost: number;
        startupCost: number;
    };
    startLocation?: {
        postalCode: string;
        city: string;
        municipality: string;
    };
    coordinate?: {
        øst: number;
        nord: number;
    };
    [key: string]: any;
} 