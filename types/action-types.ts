export interface ActionState<T> {
    isSuccess: boolean;
    message: string;
    data?: T;
}

export interface UploadState extends ActionState<string> {
    fileName?: string;
}

export interface FileAction {
    id: string;
    fileName: string;
    date: string;
    fileSize: number;
    files: string[];
}

export interface DashboardAction {
    totalContracts: number;
    contractTypes: Record<string, number>;
    totalResources: number;
    averageCostPerKm: number;
    averageMinimumCost: number;
} 