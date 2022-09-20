import {
  CurrencyDollarIcon,
  LoginIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/outline";
import clsx from "clsx";
import Image from "next/future/image";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import React from "react";

import UserAvatar from "~/assets/user-avatar.svg";
import { NextLink } from "~/components/nextLink";
import { trpc } from "~/utils/trpc";

const tabs = [
  { name: "Home", href: "/" },
  { name: "Stocks", href: "/stocks" },
  { name: "Transactions", href: "/transactions" },
];

const TabLink: React.FC<{
  href: string;
  name: string;
  hide?: boolean;
}> = ({ href, name, hide }) => {
  const router = useRouter();
  const isActive = router.route === href;

  return (
    <NextLink
      href={href}
      className={clsx(
        "w-72 bg-base-100 p-4 opacity-100 lg:tab lg:tab-bordered lg:w-max lg:py-1 lg:px-2",
        {
          "tab-active lg:opacity-80": isActive,
          hidden: hide,
        },
      )}
    >
      {name}
    </NextLink>
  );
};

export const Navbar = () => {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [isDropDownOpen, setIsDropDownOpen] = React.useState(false);
  const router = useRouter();
  React.useEffect(() => {
    setIsDropDownOpen(false);
  }, [router]);
  return (
    <div className="navbar bg-base-100 pb-8">
      <div className="navbar-start">
        {/** Mobile Dropdown Menu */}
        <div>
          <button
            className="btn btn-ghost lg:hidden"
            onClick={() => setIsDropDownOpen(!isDropDownOpen)}
          >
            <MenuIcon
              className={clsx("inline-block h-10 w-10 transition-transform", {
                "rotate-90": isDropDownOpen,
              })}
            />
          </button>
          <ul className="absolute z-10 flex flex-col lg:hidden">
            {tabs.map((tab) => (
              <TabLink key={tab.href} {...tab} hide={!isDropDownOpen} />
            ))}
          </ul>
        </div>
        {/** End Mobile Dropdown Menu */}

        {/** Logo */}
        <div className="flex-1 py-4">
          <NextLink href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <CurrencyDollarIcon className="w-8 aspect-square" />
              <h1 className="text-3xl font-bold">Stocks</h1>
            </div>
          </NextLink>
        </div>
        {/** End Logo */}
      </div>
      <div className="navbar-center">
        {/** Desktop Tab Menu */}
        <div className="hidden lg:flex">
          <ul className="menu menu-horizontal flex gap-4 p-0">
            {tabs.map((tab) => (
              <TabLink key={tab.href} {...tab} />
            ))}
          </ul>
        </div>
        {/** End Desktop Tab Menu */}
      </div>

      <div className="navbar-end gap-4">
        {/** Theme Toggle */}
        <label className="swap swap-rotate items-center">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />

          <SunIcon className="swap-on h-10 w-10 stroke-current" />
          <MoonIcon className="swap-off h-10 w-10 stroke-current" />
        </label>
        {/** End Theme Toggle */}

        <ProfileAvatar />
      </div>
    </div>
  );
};

const ProfileAvatar: React.FC = () => {
  const { data: user, isLoading } = trpc.user.me.useQuery(undefined, {
    retry: 2,
  });
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  if (isLoading) {
    return (
      <button className="avatar btn btn-circle ring ring-primary ring-offset-base-100 loading disabled" />
    );
  }

  if (!user) {
    return (
      <NextLink
        className="avatar btn btn-circle ring ring-primary ring-offset-base-100 disabled"
        href="/auth/signin"
      >
        <LoginIcon className="w-8 h-8" />
      </NextLink>
    );
  }

  const imgSrc = user.image ?? UserAvatar;

  return (
    <div className="dropdown dropdown-end">
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
        className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
      >
        <li>
          <NextLink href="/profile" className="justify-between">
            <a>
              Profile
              <span className="badge text-warning">Soon</span>
            </a>
          </NextLink>
        </li>

        <li>
          <button
            onClick={() => {
              setIsSigningOut(true);
              void signOut({ redirect: true });
              setIsSigningOut(false);
            }}
            className={clsx({ loading: isSigningOut })}
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

const useDarkMode = () => {
  const [usingDarkMode, setUsingDarkMode] = React.useState(true);

  const darkTheme = "night";
  const lightTheme = "emerald";

  React.useEffect(() => {
    const mediaMatch = window.matchMedia("(prefers-color-scheme: dark)");

    const colorSchemeChangeListener = (e: MediaQueryListEvent) => {
      setUsingDarkMode(e.matches);
      const newTheme = e.matches ? darkTheme : lightTheme;
      window.document.documentElement.setAttribute("data-theme", newTheme);
    };

    mediaMatch.addEventListener("change", colorSchemeChangeListener);

    setUsingDarkMode(mediaMatch.matches);

    return () => {
      mediaMatch.removeEventListener("change", colorSchemeChangeListener);
    };
  }, []);

  const toggleDarkMode = () => {
    setUsingDarkMode(!usingDarkMode);
    const newTheme = usingDarkMode ? lightTheme : darkTheme;
    window.document.documentElement.setAttribute("data-theme", newTheme);
  };

  return [usingDarkMode, toggleDarkMode] as const;
};
