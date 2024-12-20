export interface XMLDocument {
    id: string;
    fileName: string;
    content: string;
    parsedContent?: any;
    createdAt: Date;
    updatedAt: Date;
}

export interface XMLParseResult {
    success: boolean;
    data?: any;
    error?: string;
} 