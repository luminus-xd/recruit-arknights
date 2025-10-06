import React from 'react';
import { WithContext, SoftwareApplication } from 'schema-dts';

const JsonLd = () => {
    const siteUrl = process.env.BASE_URL || 'http://localhost:3000';
    const imageUrl = new URL('/img/icon.png?v=20251005-2', siteUrl).toString();
    const JsonLdData: WithContext<SoftwareApplication> = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Arknights Recruitment",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0"
        },
        "applicationCategory": "WebApplication",
        "url": siteUrl,
        "image": imageUrl,
        "description": "アークナイツの公開求人機能をシミュレーションするWebツール 追加は実装日の16時に反映されます"
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(JsonLdData) }}
        />
    );
};

export default JsonLd;
