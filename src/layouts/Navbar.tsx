import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/future/image";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

import { CurrencyDollarIcon, SunIcon, MoonIcon } from "@heroicons/react/outline";
import { trpc } from "~/utils/trpc";

const TabLink: React.FC<{
  href: string;
  tabName: string;
}> = ({ href, tabName }) => {
  const router = useRouter();
  const isActive = router.route === href;
  return (
    <Link href={href}>
      <a className={`tab tab-bordered ${isActive && "tab-active"}`}>{tabName}</a>
    </Link>
  );
};

const ProfileAvatar: React.FC = () => {
  const { data: user, isLoading } = trpc.proxy.user.me.useQuery();
  const router = useRouter();

  if (isLoading) {
    return (
      <button
        className={`avatar btn btn-circle ring ring-primary ring-offset-base-100 loading disabled`}
      />
    );
  }

  if (!user) {
    return (
      <Link className={`btn btn-outline h-8 border-2`} href="/auth/signin">
        Sign In
      </Link>
    );
  }

  const imgSrc =
    user.image ?? `https://avatars.dicebear.com/api/micah/${Math.random()}.svg`;

  const handleSignOut = async () => {
    await signOut({ redirect: true });
    router.push("/");
  };

  return (
    <div className="dropdown dropdown-end dropdown-hover">
      <label tabIndex={0} className="avatar btn btn-circle">
        <div className="relative w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <Image src={imgSrc} alt="User Profile" height={200} width={200} />
        </div>
      </label>
      <ul
        tabIndex={0}
        className="w-full p-2 text-sm shadow dropdown-content menu bg-base-100 rounded-box lg:w-64"
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

type Theme = "dark" | "light";
const useTheme = (initialTheme: Theme = "dark") => {
  const themes = { dark: "night", light: "emerald" } as const;
  const [currentTheme, setCurrentTheme] = useState<Theme>(initialTheme);

  const setTheme = (darkMode: boolean) => {
    window.document.documentElement.setAttribute(
      "data-theme",
      darkMode ? themes.dark : themes.light
    );

    if (darkMode) {
      localStorage.removeItem("prefersLightTheme");
    } else {
      localStorage.setItem("prefersLightTheme", "true");
    }

    setCurrentTheme(darkMode ? "dark" : "light");
  };

  React.useEffect(() => {
    const prefersLightTheme = localStorage.getItem("prefersLightTheme");
    if (prefersLightTheme) {
      setTheme(false);
    }
  }, [setTheme]);

  return [currentTheme, setTheme] as const;
};

export const Navbar = () => {
  const [theme, setTheme] = useTheme();

  const leftRightSize = "w-[200px]"; // to keep tabs centered

  return (
    <div className="flex items-center justify-between w-full">
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
      <div className="justify-center gap-5 my-4 tabs w-max">
        <TabLink href="/" tabName="Home" />
        <TabLink href="/stocks" tabName="Stocks" />
        <TabLink href="/transactions" tabName="Transactions" />
      </div>

      {/* RIGHT SECTION WITH SETTINGS / AUTH */}
      <div className={`${leftRightSize} flex justify-end items-center gap-4`}>
        {/* DARK MODE TOGGLE */}
        <label className="items-center swap swap-rotate">
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={(e) => setTheme(e.target.checked)}
          />

          <SunIcon className="w-10 h-10 stroke-current swap-off" />
          <MoonIcon className="w-10 h-10 stroke-current swap-on" />
        </label>

        {/* USER AUTH */}
        <ProfileAvatar />
      </div>
    </div>
  );
};
