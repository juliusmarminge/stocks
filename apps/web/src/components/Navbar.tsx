import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

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

const Avatar: React.FC = () => {
  const { data: session, status } = useSession();
  const buttonClasses = "btn btn-circle btn-outline btn-primary border-2";
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  if (status === "loading")
    return <button className={`${buttonClasses} loading disabled`} />;

  if (status === "unauthenticated")
    return (
      <button className={buttonClasses} onClick={toggleDropdown}>
        <Link href="/api/auth/signin">Sign In</Link>
      </button>
    );

  /** authenticated */
  const user = session?.user;
  if (!user) return null; // <-- is this possible?

  return (
    <button className={buttonClasses} onClick={toggleDropdown}>
      <div className="avatar">
        <div className="w-12 rounded-full">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User Profile"}
              layout="fill"
            />
          ) : (
            <UserIcon />
          )}
        </div>
      </div>
    </button>
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
        <TabLink href="/transactions" tabName="Transactions" />
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
        <Avatar />
      </div>
    </div>
  );
};

export default Navbar;
