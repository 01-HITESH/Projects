"use client";

import NextError from "next/error";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} title={error.digest ? `Application error ${error.digest}` : "Application error"} />
      </body>
    </html>
  );
}
