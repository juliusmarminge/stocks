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
          <Link href="/profile" className="justify-between">
            <a>
              Profile
              <span className="badge text-warning">Soon</span>
            </a>
          </Link>
        </li>

        <li>
          <button
            onClick={() => {
              setIsSigningOut(true);
              signOut({ redirect: true });
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

  const [isDarkMode, toggleDarkMode] = useDarkMode();
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

      <div className="navbar-end gap-4">
        {/** Theme Toggle */}

        <label className="items-center swap swap-rotate">
          <input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} />

          <SunIcon className="w-10 h-10 stroke-current swap-off" />
          <MoonIcon className="w-10 h-10 stroke-current swap-on" />
        </label>

        {/** End Theme Toggle */}

        <ProfileAvatar />
      </div>
    </div>
  );
};

const useDarkMode = () => {
  const [usingDarkMode, setUsingDarkMode] = useState(true);

  const darkTheme = "night";
  const lightTheme = "emerald";
  const currentTheme = usingDarkMode ? darkTheme : lightTheme;

  /** Grab preffered theme from localStorage on mount */
  React.useEffect(() => {
    const prefersDarkMode = localStorage.getItem("prefersDarkMode");
    setUsingDarkMode(!!prefersDarkMode);
    window.document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  const toggleDarkMode = () => {
    setUsingDarkMode(!usingDarkMode);
    window.document.documentElement.setAttribute("data-theme", currentTheme);

    if (usingDarkMode) {
      localStorage.removeItem("prefersDarkMode");
    } else {
      localStorage.setItem("prefersDarkMode", "true");
    }
  };

  return [usingDarkMode, toggleDarkMode] as const;
};
