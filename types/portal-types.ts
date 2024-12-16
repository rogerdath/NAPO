export interface District {
  Avtalekontor: string;
  AvtaleNavn: string;
  Avtaletransportor: string;
  OmradeKode: string;
  Henteomrade: string[];
  Leveringomrarde: string[];
  Kontrakttype: string;
  AndelKK: number;
  AntallLoyver: number;
  TransportType: string;
  Behov: string;
  Kmpris: number;
  MinuttPris: number;
  Minstepris: number;
  Starttakst: number;
  Tillegg: number;
  Utlegg: number;
}

export interface ResourcesData {
  contracts: any[];
  taxis: any[];
  districts: District[];
  parsed?: any[];
}

export interface ParsedCSVRow {
  [key: string]: string;
}