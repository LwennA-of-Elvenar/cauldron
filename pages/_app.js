import { useState, useEffect } from "react";
//import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState(null);
  const clearError = () => {
    setError(null);
  }

  const worker_onerror = (e) => {
    console.log(e);
    setError(e.message);
  }

  useEffect(() => {
    (async () => {
      const dataPromise = fetch("https://e85a5072.cauldron.pages.dev/bare.sqlite3").then(res => res.arrayBuffer());
      const worker = new Worker("https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/worker.sql-wasm.js");

      worker.onerror = worker_onerror;

      worker.onmessage = (e) => {
        setWorker(worker);
      }

      const buffer = await Promise.resolve(dataPromise);
      const dbArray = new Uint8Array(buffer);

      worker.postMessage({action: 'open', buffer: dbArray});
    })();
    
  }, []);

  if (error) return <pre>{error.toString()}</pre>;
  else return <Component {...pageProps} db={{
    loaded: worker ? true : false,
    worker: worker,
    setError: setError
  }} />
}
