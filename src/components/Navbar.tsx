import React, { type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";

import {
  CurrencyDollarIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/outline";

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

const Profile: React.FC<{
  toggleDropdown: () => void;
}> = ({ toggleDropdown }) => {
  const { data: session, status } = useSession();

  if (status === "loading")
    return (
      <button className={`btn btn-outline h-8 border-2 loading disabled`}>
        Authenticating
      </button>
    );

  if (status === "unauthenticated")
    return (
      <Link href="/api/auth/signin">
        <button className={`btn btn-outline h-8 border-2`}>Sign In</button>
      </Link>
    );

  /** authenticated */
  const user = session?.user;
  if (!user) return null; // <-- is this possible?
  const authorizedImageSources = ["avatars.githubusercontent.com"];
  const hasAllowedImage = authorizedImageSources.find((src) =>
    user.image?.includes(src)
  );
  const imgSrc = hasAllowedImage
    ? user.image!
    : `https://avatars.dicebear.com/api/micah/${Math.random()}.svg`;

  const handleSignOut = async () => {
    const data = await signOut({
      redirect: false,
    });
    console.log(data);
  };

  return (
    <div className="dropdown dropdown-end dropdown-hover">
      <label tabIndex={0} className="avatar btn btn-circle">
        <div className="w-10 relative rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <Image
            src={imgSrc}
            alt="User Profile"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full lg:w-64 text-sm"
      >
        <li>
          <a>
            Signed in as <span className="italic truncate">{user.name}</span>
          </a>
        </li>
        <li>
          <button onClick={handleSignOut}>Sign out</button>
        </li>
      </ul>
    </div>
  );
};

export const Navbar = () => {
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
   *  USER SESSION
   **/
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

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
        <label className="swap swap-rotate items-center">
          <input type="checkbox" checked={isDarkMode} onChange={setTheme} />

          <SunIcon className="swap-off stroke-current w-10 h-10" />
          <MoonIcon className="swap-on stroke-current w-10 h-10" />
        </label>

        {/* USER AUTH */}
        <Profile
          toggleDropdown={() => setProfileDropdownOpen(!profileDropdownOpen)}
        />
      </div>
    </div>
  );
};
