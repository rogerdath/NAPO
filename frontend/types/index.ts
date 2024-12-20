export * from "./csv-types";
export * from "./action-types"; 

export interface Contract {
    id: string;
    avtaleKontor: string;
    avtaleOmrade: string;
    omradeKode: string;
    type: string;
    startLocation: {
        postalCode: string;
        city: string;
    };
    resources: number;
    timestamp: number;
}

export interface Area {
    id: string;
    avtaleKontor: string;
    avtaleNavn: string;
    omradeKode: string;
    henteOmrade: string;
    leveringOmrade: string;
    timestamp: number;
}

export interface ContractType {
    id: string;
    omradeKode: string;
    ki: number;
    kk: number;
    andelKK: string;
    kontrakttype: string;
    timestamp: number;
}

export interface Resource {
    id: string;
    avtaleKontor: string;
    avtaleTransportor: string;
    avtaleOmradeKode: string;
    avtaleOmradeNavn: string;
    antall: number;
    timestamp: number;
}

export interface Location {
    id: string;
    omradeKode: string;
    // Add other fields from startsted.csv
    timestamp: number;
}

export interface ContractContent {
    id: string;
    omradeKode: string;
    // Add other fields from avtaleinnhold.csv
    timestamp: number;
}

export interface Relation {
    id: string;
    sourceType: 'area' | 'contractType' | 'resource' | 'location' | 'contractContent';
    sourceId: string;
    targetType: 'area' | 'contractType' | 'resource' | 'location' | 'contractContent';
    targetId: string;
    confidence: number;
    isAutomatic: boolean;
    timestamp: number;
}

export type DataType = 'area' | 'contractType' | 'resource' | 'location' | 'contractContent';

export interface DataFile {
    id: string;
    type: DataType;
    filename: string;
    content: string;
    timestamp: number;
} 