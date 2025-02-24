import { ImageAnnotatorClient } from '@google-cloud/vision';

let client: ImageAnnotatorClient | null = null;

/**
 * キャッシュ用のImageAnnotatorClientを取得する
 * @returns ImageAnnotatorClient
 */
export function getVisionClient(): ImageAnnotatorClient {
    if (!client) {
        const base64 = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_BASE64;
        if (!base64) {
            throw new Error('Service account credentials are not set in environment variables.');
        }

        const decodedJson = Buffer.from(base64, 'base64').toString('utf-8');
        const credentials = JSON.parse(decodedJson);

        client = new ImageAnnotatorClient({
            credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key,
            },
        });
    }
    return client;
}