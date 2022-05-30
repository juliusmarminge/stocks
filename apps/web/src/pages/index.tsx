import type { GetStaticProps, NextPage } from "next";
import { trpc } from "../utils/trpc";
import React from "react";

const Index: NextPage = () => {
  const [inputName, setInputName] = React.useState("");

  const { data, isLoading } = trpc.useQuery([
    "hello",
    {
      name: inputName,
    },
  ]);

  return (
    <div>
      <p>Enter a name and see if you're in the database</p>
      <input
        type="text"
        placeholder="Enter a name"
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
      />
      <h1>{isLoading ? "Searching..." : data}</h1>
    </div>
  );
};

export default Index;
