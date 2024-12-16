"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, FileJson, Download, Trash2, Eye, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { loadHistory, readFile, deleteFile, saveHistory, saveFile } from "@/app/actions/file-actions";

interface ExportHistory {
    id: string;
    fileName: string;
    date: string;
    fileSize: number;
    files: string[];
}

export default function HistoryPage() {
    const [history, setHistory] = useState<ExportHistory[]>([]);
    const [selectedFile, setSelectedFile] = useState<{ content: string; name: string; isEditing?: boolean } | null>(null);
    const [editedContent, setEditedContent] = useState<string>('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await loadHistory();
                setHistory(data);
            } catch (error) {
                console.error('Error loading history:', error);
            }
        };

        fetchHistory();
    }, []);

    const handlePreview = async (fileName: string, isEditing = false) => {
        try {
            const content = await readFile(fileName);
            setSelectedFile({ content, name: fileName, isEditing });
            if (isEditing) {
                setEditedContent(content);
            }
        } catch (error) {
            console.error('Error loading file for preview:', error);
        }
    };

    const handleDownload = async (fileName: string) => {
        try {
            const content = await readFile(fileName);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const handleDelete = async (id: string, fileName: string) => {
        try {
            await deleteFile(fileName);
            const updatedHistory = history.filter(item => item.id !== id);
            await saveHistory(updatedHistory);
            setHistory(updatedHistory);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedFile) return;

        try {
            // Validate JSON
            JSON.parse(editedContent);

            // Save the file
            await saveFile(selectedFile.name, editedContent);

            // Update history entry's file size
            const updatedHistory = history.map(item => {
                if (item.fileName === selectedFile.name) {
                    return { ...item, fileSize: editedContent.length };
                }
                return item;
            });

            await saveHistory(updatedHistory);
            setHistory(updatedHistory);
            setSelectedFile(null);
        } catch (error) {
            alert('Invalid JSON format');
            console.error('Error saving edited file:', error);
        }
    };

    const formatFileSize = (bytes: number) => {
        const kb = bytes / 1024;
        if (kb < 1024) {
            return `${kb.toFixed(1)} KB`;
        }
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Historikk"
                description="Se tidligere transformasjoner og eksporter"
            />

            <Card className="border-brand-secondary/20">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <History className="h-5 w-5 text-brand-secondary" />
                        Tidligere eksporter
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                            Ingen tidligere eksporter funnet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 bg-brand-secondary/5 rounded-lg hover:bg-brand-secondary/10 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <FileText className="h-8 w-8 text-brand-secondary flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium">{item.fileName}</h3>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>
                                                    Eksportert {formatDistanceToNow(new Date(item.date), {
                                                        addSuffix: true,
                                                        locale: nb
                                                    })}
                                                </p>
                                                <p>Størrelse: {formatFileSize(item.fileSize)}</p>
                                                <p>Filer: {item.files.join(', ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handlePreview(item.fileName, true)}
                                            className="text-brand-secondary hover:text-brand-secondary/80"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDownload(item.fileName)}
                                            className="text-brand-secondary hover:text-brand-secondary/80"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(item.id, item.fileName)}
                                            className="text-destructive hover:text-destructive/80"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={selectedFile !== null} onOpenChange={() => setSelectedFile(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogTitle className="sr-only">
                        {selectedFile?.isEditing ? 'Edit JSON' : 'JSON Preview'}
                    </DialogTitle>
                    <div className="flex-1 overflow-auto">
                        <div className="sticky top-0 flex justify-between items-center bg-background py-2 mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FileJson className="h-5 w-5 text-brand-secondary" />
                                {selectedFile?.name}
                            </h2>
                            <div className="flex gap-2">
                                {selectedFile?.isEditing ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSaveEdit}
                                    >
                                        Lagre
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (selectedFile) {
                                                    navigator.clipboard.writeText(selectedFile.content)
                                                        .then(() => alert('Kopiert til utklippstavle!'))
                                                        .catch(err => console.error('Feil ved kopiering:', err));
                                                }
                                            }}
                                        >
                                            Kopier
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => selectedFile && handleDownload(selectedFile.name)}
                                        >
                                            Last ned
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        {selectedFile?.isEditing ? (
                            <textarea
                                className="w-full h-full p-4 font-mono text-sm bg-secondary/10 rounded-lg"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                            />
                        ) : (
                            <pre className="bg-secondary/10 p-4 rounded-lg overflow-auto">
                                <code className="text-sm">
                                    {selectedFile ? JSON.stringify(JSON.parse(selectedFile.content), null, 2) : ''}
                                </code>
                            </pre>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 