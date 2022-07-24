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
}> = ({ href, tabName, mobile }) => {
  const router = useRouter();
  const isActive = router.route === href;

  const classNames = mobile
    ? `py-1 px-2 ${isActive && "opacity-80"}`
    : `tab tab-bordered ${isActive && "tab-active"}`;

  return (
    <Link href={href}>
      <a className={classNames}>{tabName}</a>
    </Link>
  );
};

const ProfileAvatar: React.FC = () => {
  const { data: user, isLoading } = trpc.proxy.user.me.useQuery();
  const [isSigningOut, setIsSigningOut] = useState(false);
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
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="avatar btn btn-circle">
        <div className="relative w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <Image
            src={imgSrc}
            alt={user?.name ?? "Profile picture"}
            width={100}
            height={100}
          />
        </div>
      </label>
      <ul
        tabIndex={0}
        className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li>
          <a className="justify-between">
            Profile
            <span className="badge text-warning">Soon</span>
          </a>
        </li>

        <li>
          <button
            className={`btn btn-ghost ${isSigningOut && "loading"}`}
            onClick={async () => {
              setIsSigningOut(true);
              await signOut({ redirect: true });
              router.push("/");
              setIsSigningOut(false);
            }}
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export const Navbar = () => {
  const { data: user, isLoading } = trpc.proxy.user.me.useQuery();
  const imgSrc = user?.image ?? UserAvatar;

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        {/** Mobile Dropdown Menu */}
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden p-2">
            <MenuIcon className="w-8 aspect-square" />
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <TabLink href="/" tabName="Home" mobile />
            <TabLink href="/stocks" tabName="Stocks" mobile />
            <TabLink href="/transactions" tabName="Transactions" mobile />
          </ul>
        </div>
        {/** End Mobile Dropdown Menu */}

        {/** Logo */}
        <div className="flex-1 py-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <CurrencyDollarIcon className="w-8 aspect-square" />
              <h1 className="text-3xl font-bold">Stocks</h1>
            </div>
          </Link>
        </div>
        {/** End Logo */}
      </div>

      {/** Desktop Tab Menu */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal p-0 flex gap-4">
          <TabLink href="/" tabName="Home" />
          <TabLink href="/stocks" tabName="Stocks" />
          <TabLink href="/transactions" tabName="Transactions" />{" "}
        </ul>
      </div>
      {/** End Desktop Tab Menu */}

      {/** Profile Avatar Stuff */}
      <div className="navbar-end">
        <ProfileAvatar />
      </div>
      {/** End Profile Avatar Stuff */}
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
