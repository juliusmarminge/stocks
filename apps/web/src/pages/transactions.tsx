import React from "react";
import { NextPage } from "next";
import {
  CreateTransaction,
  TransactionsListing,
} from "../components/Transactions";

const HomePage: NextPage = () => {
  const sectionStyle = "grid card bg-base-200 rounded-box place-items-center";
  return (
    <div className="flex flex-col mt-10 w-full">
      <div className={sectionStyle}>
        <CreateTransaction />
      </div>
      <div className="divider" />
      <div className={sectionStyle}>
        <TransactionsListing />
      </div>
    </div>
  );
};

export default HomePage;
