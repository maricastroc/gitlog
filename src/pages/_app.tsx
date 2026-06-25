import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>gitlog | changelog generator</title>
        <meta
          name="description"
          content="Generate structured, exportable changelogs from your Git history."
        />
      </Head>

      <Component {...pageProps} />
    </>
  );
}
