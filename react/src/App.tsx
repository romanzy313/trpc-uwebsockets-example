import { useState } from "react";
import { makeClient } from "./trpc";

function App() {
  const [values, setValues] = useState<string[]>([]);
  const client = makeClient();

  function pushValue(value: string) {
    setValues((old) => [...old, value]);
  }

  const run = async () => {
    try {
      const hello = await client.hello.query();
      pushValue(`hello.query: ${hello}`);

      client.count.subscribe(
        { from: 3, to: 7 },
        {
          onData(value) {
            pushValue(`count.subscribe: ${value}`);
          },
          onStopped() {
            pushValue(`count.stopped`);
          },
        },
      );
    } catch (err) {
      pushValue(`ERROR: ${err}`);
    }
  };

  return (
    <div>
      <button onClick={run}>Run</button>
      <div>
        {values.map((value, i) => (
          <div key={i}>{value}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
