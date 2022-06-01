import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { CurrencyDollarIcon } from "@heroicons/react/outline";

const Navbar = () => {
  const router = useRouter();
  const { route } = router;

  const [isDarkMode, setDarkMode] = React.useState(true);
  const setTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(e.target.checked);
    if (e.target.checked) {
      window.document.documentElement.setAttribute("data-theme", "dark");
      localStorage.removeItem("prefersLightTheme");
    } else {
      window.document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("prefersLightTheme", "true");
    }
  };

  React.useEffect(() => {
    // get the current theme from localStorage on mount
    const prefersLight = localStorage.getItem("prefersLightTheme");
    if (prefersLight !== null) {
      setDarkMode(false);
      window.document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const leftRightSize = "w-[200px]"; // to keep tabs centered
  return (
    <div className="w-full flex items-center justify-between">
      {/* LEFT SECTION WITH LOGO */}
      <Link href="/">
        <div
          className={`flex ${leftRightSize} items-center gap-2 cursor-pointer hover:opacity-80`}
        >
          <CurrencyDollarIcon height={40} width={40} />
          <h1 className="text-4xl font-bold">Stocks</h1>
        </div>
      </Link>

      {/* MIDDLE SECTION WITH NAVIGATION-TABS */}
      <div className="tabs w-max justify-center gap-5 my-4">
        <Link href="/">
          <a
            className={`tab tab-bordered ${route === "/" ? "tab-active" : ""}`}
          >
            Home
          </a>
        </Link>
        <Link href="/stocks">
          <a
            className={`tab tab-bordered ${
              route === "/stocks" ? "tab-active" : ""
            }`}
          >
            Stocks
          </a>
        </Link>
      </div>

      {/* RIGHT SECTION WITH SETTINGS / AUTH */}
      <div className={`${leftRightSize}`}>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Dark Mode</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isDarkMode}
              onChange={setTheme}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
