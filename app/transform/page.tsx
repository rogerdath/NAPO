"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { error, info } from '@/app/lib/client-logger';
import { storeRawData } from '@/app/lib/db';
import { PageHeader } from '@/components/layout/page-header';
import { t } from '@/app/lib/i18n';
import { useLanguage } from '@/components/theme/language-provider';

export default function TransformPage() {
    const { language } = useLanguage();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadStatus(null);

        try {
            for (const file of files) {
                const content = await file.text();
                await storeRawData(file.name, content);

                await info('Transform', t('transform.uploadSuccess', language, { count: files.length }), {
                    filename: file.name,
                    size: file.size
                });
            }

            setUploadStatus({
                success: true,
                message: t('transform.uploadSuccess', language, { count: files.length })
            });
        } catch (err) {
            setUploadStatus({
                success: false,
                message: t('transform.uploadError', language)
            });
            await error('Transform', t('errors.uploadFailed', language), err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title={t('transform.title', language)}
                description={t('transform.description', language)}
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t('transform.uploadTitle', language)}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <Input
                                type="file"
                                accept=".csv"
                                multiple
                                onChange={handleFileUpload}
                                className="max-w-sm"
                                aria-label={t('transform.selectFiles', language)}
                            />
                        </div>

                        {uploadStatus && (
                            <div className={`p-4 rounded-lg ${
                                uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}>
                                {uploadStatus.message}
                            </div>
                        )}

                        {isUploading && (
                            <div className="text-muted-foreground">
                                {t('transform.processing', language)}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 