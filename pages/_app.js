import { useState, useEffect } from 'react';
import '../styles/globals.css';

const App = ({ Component, pageProps }) => {
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState(null);

  /*
  const clearError = () => {
    setError(null);
  };
  */

  const worker_onerror = e => {
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
