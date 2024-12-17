import { create } from 'zustand';

type Language = 'en' | 'no';

interface I18nStore {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nStore>((set) => ({
    language: 'en',
    setLanguage: (lang) => set({ language: lang }),
}));

const translations = {
    en: {
        common: {
            settings: 'Settings',
            language: 'Language',
            theme: 'Theme',
            save: 'Save',
            cancel: 'Cancel',
            light: 'Light',
            dark: 'Dark',
            system: 'System',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            actions: 'Actions',
            edit: 'Edit',
            delete: 'Delete',
            view: 'View',
            close: 'Close',
        },
        navigation: {
            transform: 'Transform',
            contracts: 'Contracts',
            history: 'History',
            dashboard: 'Dashboard',
            contractManager: 'Contract Manager',
        },
        dashboard: {
            title: 'Dashboard',
            description: 'Overview of contracts and resources',
            totalContracts: 'Total Contracts',
            totalResources: 'Total Resources',
            averageCost: 'Average Cost per KM',
            avtaleKontor: 'AvtaleKontor',
            contractTypes: 'Contract Types',
            statistics: 'Statistics',
            licenses: 'Licenses per AvtaleKontor',
        },
        transform: {
            title: 'Transform CSV',
            description: 'Upload and transform CSV files into structured contract data',
            uploadTitle: 'Upload CSV Files',
            selectFiles: 'Select CSV files',
            uploadSuccess: 'Successfully stored {count} files',
            uploadError: 'Failed to upload files. Please try again.',
            processing: 'Processing files...',
            validationError: 'Validation error in file: {filename}',
        },
        contracts: {
            title: 'Contract Manager',
            description: 'Search, edit, and manage contracts',
            search: 'Search in all fields...',
            filters: 'Search and Filters',
            advancedSearch: 'Advanced Search',
            tableView: 'Table View',
            jsonView: 'JSON View',
            formView: 'Form View',
            structureView: 'Structure',
            id: 'ID',
            avtaleKontor: 'AvtaleKontor',
            avtaleName: 'AvtaleNavn',
            type: 'Type',
            transport: 'Transport',
            location: 'Location',
            resources: 'Resources',
            cost: 'Cost',
            details: 'Details',
            filterByType: 'Filter by Type',
            filterByAvtaleKontor: 'Filter by AvtaleKontor',
            filterByPostalCode: 'Filter by Postal Code',
            noResults: 'No contracts found',
        },
        history: {
            title: 'History',
            description: 'View previous transformations and exports',
            previousExports: 'Previous Exports',
            noHistory: 'No previous exports found',
            exportDate: 'Export Date',
            fileSize: 'File Size',
            fileName: 'File Name',
            downloadFile: 'Download File',
            deleteFile: 'Delete File',
            viewDetails: 'View Details',
            confirmDelete: 'Are you sure you want to delete this file?',
        },
        errors: {
            loadingFailed: 'Failed to load data',
            savingFailed: 'Failed to save changes',
            uploadFailed: 'Failed to upload file',
            invalidFormat: 'Invalid file format',
            requiredField: 'This field is required',
            invalidValue: 'Invalid value',
            networkError: 'Network error occurred',
            unexpectedError: 'An unexpected error occurred',
        },
    },
    no: {
        common: {
            settings: 'Innstillinger',
            language: 'Språk',
            theme: 'Tema',
            save: 'Lagre',
            cancel: 'Avbryt',
            light: 'Lys',
            dark: 'Mørk',
            system: 'System',
            loading: 'Laster...',
            error: 'Feil',
            success: 'Suksess',
            actions: 'Handlinger',
            edit: 'Rediger',
            delete: 'Slett',
            view: 'Vis',
            close: 'Lukk',
        },
        navigation: {
            transform: 'Transformer',
            contracts: 'Avtaler',
            history: 'Historie',
            dashboard: 'Dashbord',
            contractManager: 'Avtalehåndtering',
        },
        dashboard: {
            title: 'Dashbord',
            description: 'Oversikt over avtaler og ressurser',
            totalContracts: 'Totalt antall avtaler',
            totalResources: 'Totalt antall ressurser',
            averageCost: 'Gjennomsnittlig km pris',
            avtaleKontor: 'AvtaleKontor',
            contractTypes: 'Avtaletyper',
            statistics: 'Statistikk',
            licenses: 'Løyver per AvtaleKontor',
        },
        transform: {
            title: 'Transform CSV',
            description: 'Last opp og transformer CSV-filer til strukturerte avtaledata',
            uploadTitle: 'Last opp CSV-filer',
            selectFiles: 'Velg CSV-filer',
            uploadSuccess: 'Vellykket lagring av {count} filer',
            uploadError: 'Kunne ikke laste opp filer. Vennligst prøv igjen.',
            processing: 'Behandler filer...',
            validationError: 'Valideringsfeil i fil: {filename}',
        },
        contracts: {
            title: 'Avtalehåndtering',
            description: 'Søk, rediger og administrer avtaler',
            search: 'Søk i alle felt...',
            filters: 'Søk og filtre',
            advancedSearch: 'Avansert søk',
            tableView: 'Tabellvisning',
            jsonView: 'JSON-visning',
            formView: 'Skjemavisning',
            structureView: 'Struktur',
            id: 'ID',
            avtaleKontor: 'AvtaleKontor',
            avtaleName: 'AvtaleNavn',
            type: 'Type',
            transport: 'Transport',
            location: 'Sted',
            resources: 'Ressurser',
            cost: 'Kostnad',
            details: 'Detaljer',
            filterByType: 'Filtrer etter type',
            filterByAvtaleKontor: 'Filtrer etter AvtaleKontor',
            filterByPostalCode: 'Filtrer etter postnummer',
            noResults: 'Ingen avtaler funnet',
        },
        history: {
            title: 'Historie',
            description: 'Se tidligere transformasjoner og eksporter',
            previousExports: 'Tidligere eksporter',
            noHistory: 'Ingen tidligere eksporter funnet',
            exportDate: 'Eksportdato',
            fileSize: 'Filstørrelse',
            fileName: 'Filnavn',
            downloadFile: 'Last ned fil',
            deleteFile: 'Slett fil',
            viewDetails: 'Vis detaljer',
            confirmDelete: 'Er du sikker på at du vil slette denne filen?',
        },
        errors: {
            loadingFailed: 'Kunne ikke laste data',
            savingFailed: 'Kunne ikke lagre endringer',
            uploadFailed: 'Kunne ikke laste opp fil',
            invalidFormat: 'Ugyldig filformat',
            requiredField: 'Dette feltet er påkrevd',
            invalidValue: 'Ugyldig verdi',
            networkError: 'Nettverksfeil oppstod',
            unexpectedError: 'En uventet feil oppstod',
        },
    },
} as const;

export function t(key: string, language: Language = 'en', params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let current: any = translations[language];
    
    for (const k of keys) {
        if (current[k] === undefined) {
            console.warn(`Translation missing for key: ${key} in language: ${language}`);
            return key;
        }
        current = current[k];
    }
    
    if (params) {
        return Object.entries(params).reduce((text, [key, value]) => {
            return text.replace(`{${key}}`, String(value));
        }, current);
    }
    
    return current;
} 