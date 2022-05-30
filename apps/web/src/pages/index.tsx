import { type NextPage } from "next";
import { trpc } from "../utils/trpc";
import React from "react";
import { UserListing } from "../components/UserListing";

const Index: NextPage = () => {
  const [inputName, setInputName] = React.useState("");

  const { data: user, isLoading } = trpc.useQuery([
    "user.getByNameWithTransactions",
    { name: inputName },
  ]);

  return (
    <div>
      <p>Search user:</p>
      <input
        type="text"
        className="input"
        placeholder="Enter the user's name"
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
      />
      <h1>
        {isLoading ? (
          "Searching..."
        ) : !user ? (
          `User ${inputName} not found.`
        ) : (
          <UserListing user={user} />
        )}
      </h1>
    </div>
  );
};

export default Index;
