import React from 'react';
import { WithContext, SoftwareApplication } from 'schema-dts';

const JsonLd = () => {
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
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(JsonLdData) }}
        />
    );
};

export default JsonLd;