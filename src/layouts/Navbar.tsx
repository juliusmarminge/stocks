import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/future/image";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

import {
  CurrencyDollarIcon,
  SunIcon,
  MoonIcon,
  LoginIcon,
  MenuIcon,
} from "@heroicons/react/outline";
import { trpc } from "~/utils/trpc";
import UserAvatar from "~/assets/user-avatar.svg";

const TabLink: React.FC<{
  href: string;
  tabName: string;
  mobile?: boolean;
  closeTab?: () => void;
}> = ({ href, tabName, mobile, closeTab }) => {
  const router = useRouter();
  const isActive = router.route === href;
  return (
    <Link href={href}>
      <a
        className={`tab tab-bordered bg-base-200 ${isActive && "tab-active"} ${
          mobile && "w-screen py-8"
        }`}
        onClick={() => closeTab && closeTab()}
      >
        {tabName}
      </a>
    </Link>
  );
};

const ProfileAvatar: React.FC = () => {
  const { data: user, isLoading } = trpc.proxy.user.me.useQuery();
  const router = useRouter();

  if (isLoading) {
    return (
      <button className="avatar btn btn-circle ring ring-primary ring-offset-base-100 loading disabled" />
    );
  }

  if (!user) {
    return (
      <Link
        className="avatar btn btn-circle ring ring-primary ring-offset-base-100 loading disabled"
        href="/auth/signin"
      >
        <LoginIcon className="w-10 h-10" />
      </Link>
    );
  }

  const imgSrc = user.image ?? UserAvatar;

  return (
    <div className="dropdown dropdown-end dropdown-hover">
      <label tabIndex={0} className="avatar btn btn-circle">
        <div className="relative w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <Image
            src={imgSrc}
            alt={user.name ?? "Profile picture"}
            width={100}
            height={100}
          />
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
          <button
            onClick={async () => {
              await signOut({ redirect: true });
              router.push("/");
            }}
          >
            Sign out
          </button>
        </li>
      </ul>
    </div>
  );
};

type Theme = "dark" | "light";
const useTheme = (initialTheme: Theme = "dark") => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(initialTheme);

  const setTheme = React.useCallback((darkMode: boolean) => {
    const themes = { dark: "night", light: "emerald" } as const;

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
  }, []);

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const leftRightSize = "w-[200px]"; // to keep tabs centered

  return (
    <>
      <div className="flex items-center justify-between w-full">
        {/* LEFT SECTION WITH LOGO AND BURGER MENU */}
        <div className="flex-none">
          <button
            className="md:hidden flex items-center cursor-pointer hover:opacity-80"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MenuIcon className="w-12 h-12" />
          </button>
        </div>

        <div className="flex-1 py-4">
          <Link href="/">
            <div
              className={`flex ${leftRightSize} items-center gap-2 cursor-pointer hover:opacity-80`}
            >
              <CurrencyDollarIcon className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Stocks</h1>
            </div>
          </Link>
        </div>

        {/* MIDDLE SECTION OR DROPDOWN WITH NAVIGATION-TABS */}
        <div className="justify-center gap-5 my-4 tabs w-max hidden md:flex">
          <TabLink href="/" tabName="Home" />
          <TabLink href="/stocks" tabName="Stocks" />
          <TabLink href="/transactions" tabName="Transactions" />
        </div>

        {/* RIGHT SECTION WITH THEME TOGGLE AND AUTH */}
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
      {/** DROPDOWN */}
      <div
        className={`absolute z-[1000] flex-col ${
          isMenuOpen ? "flex" : "hidden"
        } md:hidden`}
      >
        <TabLink
          href="/"
          tabName="Home"
          mobile
          closeTab={() => setIsMenuOpen(false)}
        />
        <TabLink
          href="/stocks"
          tabName="Stocks"
          mobile
          closeTab={() => setIsMenuOpen(false)}
        />
        <TabLink
          href="/transactions"
          tabName="Transactions"
          mobile
          closeTab={() => setIsMenuOpen(false)}
        />
      </div>
    </>
  );
};
