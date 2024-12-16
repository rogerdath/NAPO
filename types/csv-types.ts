// Base types for raw data
export interface OmradeData {
  AvtaleKontor: string;
  AvtaleNavn: string;
  OmradeKode: string;
  HenteOmrade: string;
  LeveringOmrade: string;
}

export interface TypeKIKKData {
  Omradekode: string;
  KI: string;
  KK: string;
  "Andel KK": string;
  kontrakttype: "KI" | "KK" | "Both";
}

export interface RessurserData {
  AvtaleKontor: string;
  AvtaleTransportor: string;
  AvtaleOmradeKode: string;
  AvtaleOmradeNavn: string;
  antall: number;
}

export interface AvtaleInnholdData {
  OmradeKode: string;
  "Andel KK": string;
  Type: "KI" | "KK" | "Both";
  AvtaleKontor: string;
  GyldigTransport: string;
  GyldigBehov: string;
  KmPris: number;
  MinPris: number;
  MinstePris: number;
  StartTakst: number;
}

// Transformed/processed types
export interface AvtaleAnalyse {
  omradeKode: string;
  avtaleType: "AB" | "ABA";
  transportType: string[];
  harRullestol: boolean;
  priskategori: "liten" | "stor";
  region: {
    hente: string[];
    levering: string[];
  };
}

// File handling types
export interface CSVFile {
  id: string;
  fileName: string;
  fileType: "omrade" | "type_kikk" | "ressurser" | "avtaleinnhold";
  content: string;
  parsedContent?: any[];
  createdAt: Date;
}

export interface TransformOptions {
  includeFields: string[];
  excludeFields?: string[];
  transformations?: {
    [key: string]: {
      type: "rename" | "format" | "calculate";
      value: string;
    };
  };
}

export interface TransformResult {
  success: boolean;
  data?: AvtaleAnalyse[];
  error?: string;
  summary?: {
    totalContracts: number;
    byType: {
      AB: number;
      ABA: number;
    };
    byRegion: {
      [key: string]: number;
    };
  };
}
