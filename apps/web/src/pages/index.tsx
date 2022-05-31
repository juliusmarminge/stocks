import React from "react";
import { NextPage } from "next";
import {
  CreateTransaction,
  TransactionsListing,
} from "../components/Transactions";

const HomePage: NextPage = () => {
  const [isDarkMode, setDarkMode] = React.useState(true);
  const toggleTheme = () => {
    setDarkMode(!isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "light" : "dark");
    window.document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "light" : "dark"
    );
  };

  const sectionStyle = "grid card bg-base-200 rounded-box place-items-center";
  return (
    <div className="flex flex-col w-4/5 mx-auto mt-10">
      <button onClick={() => toggleTheme()}>
        {isDarkMode ? "Set Light Theme" : "Set Dark Theme"}
      </button>
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
