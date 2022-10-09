// src/pages/_app.tsx
import "../styles/globals.css";
import "../styles/nprogress.css";

import type { AppType } from "next/app";
import { Router } from "next/router";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import NProgress from "nprogress";

import { Navbar } from "../components/navbar";
import { trpc } from "../utils/trpc";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  NProgress.configure({ showSpinner: false });
  Router.events.on("routeChangeStart", () => NProgress.start());
  Router.events.on("routeChangeComplete", () => NProgress.done());
  Router.events.on("routeChangeError", () => NProgress.done());

  return (
    <SessionProvider session={session}>
      <div className="mx-auto w-[95%] max-w-[2000px] lg:w-4/5">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
