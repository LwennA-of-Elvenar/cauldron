import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';

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
    <Component
      {...pageProps}
      db={{
        loaded: !!worker,
        worker,
        setError,
      }}
    />
  );
};

export default App;
