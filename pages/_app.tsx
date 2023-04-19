import { useState, useEffect } from 'react';
import { NextIntlProvider } from 'next-intl';
import type { AppProps } from 'next/app';
import { Roboto } from 'next/font/google';
import '@/styles/globals.css';

const font = Roboto({ subsets: ['latin'], weight: '400' });

export type DBType = {
  loaded: boolean;
  worker: Worker;
  setError: (msg: null | string) => void;
};

const App = ({ Component, pageProps }: AppProps) => {
  const [worker, setWorker] = useState<null | Worker>(null);
  const [error, setError] = useState<null | string>(null);

  /*
  const clearError = () => {
    setError(null);
  };
  */

  const worker_onerror = (e: ErrorEvent) => {
    console.log(e); // eslint-disable-line no-console
    setError(e.message);
  };

  useEffect(() => {
    (async () => {
      const dataPromise = fetch('/bare.sqlite3').then(res => res.arrayBuffer());
      const newWorker = new Worker('/worker.sql-wasm.js');

      newWorker.onerror = worker_onerror;

      newWorker.onmessage = () => {
        setWorker(newWorker);
      };

      const buffer = await Promise.resolve(dataPromise);
      const dbArray = new Uint8Array(buffer);

      newWorker.postMessage({ action: 'open', buffer: dbArray });
    })();
  }, []);

  if (error) return <pre>{error.toString()}</pre>;
  return (
    <NextIntlProvider messages={pageProps.messages}>
      <style jsx global>{`
        html {
          font-family: ${font.style.fontFamily};
        }
      `}</style>
      <Component
        {...pageProps}
        db={{
          loaded: !!worker,
          worker,
          setError,
        }}
      />
    </NextIntlProvider>
  );
};

export default App;
