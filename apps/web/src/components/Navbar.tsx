import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import { CurrencyDollarIcon, UserIcon } from "@heroicons/react/outline";

// TODO: Implement NextAuth for session
const user = "Julius";

const TabLink: React.FC<{
  href: string;
  tabName: string;
}> = ({ href, tabName }) => {
  const router = useRouter();
  const isActive = router.route === href;
  return (
    <Link href={href}>
      <a className={`tab tab-bordered ${isActive && "tab-active"}`}>
        {tabName}
      </a>
    </Link>
  );
};

const Navbar = () => {
  /**
   * THEMING
   **/
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

  /**
   * GERNERAL STYLES
   **/
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
        <TabLink href="/" tabName="Home" />
        <TabLink href="/stocks" tabName="Stocks" />
      </div>

      {/* RIGHT SECTION WITH SETTINGS / AUTH */}
      <div className={`${leftRightSize} flex justify-end items-center gap-4`}>
        {/* DARK MODE TOGGLE */}
        <div className="form-control">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={isDarkMode}
            onChange={setTheme}
          />
        </div>

        {/* USER AUTH */}
        <div className="avatar">
          <div className="w-10 rounded-full relative ring ring-primary ring-offset-base-100 ring-offset-2">
            <Image
              alt="placeholder profile avatar"
              src={`https://api.lorem.space/image/face?hash=${
                Math.random() * 1e5
              }`}
              layout="fill"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
