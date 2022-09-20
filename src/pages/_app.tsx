// src/pages/_app.tsx
import "../styles/globals.css";
import "../styles/nprogress.css";
import type { AppType } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "../layouts/navbar";
import { trpc } from "../utils/trpc";
import NProgress from "nprogress";
import { Router } from "next/router";
import type { Session } from "next-auth";

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
      <div className="w-[95%] lg:w-4/5 max-w-[2000px] mx-auto">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
