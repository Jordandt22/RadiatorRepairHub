import { getConfig } from "@/lib/config";
import { jsonLdGraph, siteOrigin } from "@/lib/seo";
export function JsonLd({ breadcrumbs, }) {
    const data = jsonLdGraph(getConfig(), siteOrigin(), breadcrumbs);
    return (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}/>);
}
export function BreadcrumbJsonLd({ name, path }) {
    const origin = siteOrigin();
    const data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
            { "@type": "ListItem", position: 2, name, item: `${origin}${path}` },
        ],
    };
    return (<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}/>);
}

/** FAQPage schema for visible `/services` FAQs only. */
export function FaqJsonLd({ items }) {
    const entries = items?.filter((item) => item?.question && item?.answer);
    if (!entries?.length) return null;
    const data = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: entries.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    };
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
