import React from "react";
import Head from "next/head";

interface JsonLdProps {
  data: object;
}

const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Head>
  );
};

export default JsonLd;
