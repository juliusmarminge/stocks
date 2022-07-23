// src/pages/_app.tsx
import "../styles/globals.css";
import type { AppType } from "next/dist/shared/lib/utils";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "../layouts/Navbar";
import { trpc } from "../utils/trpc";

const MyApp: AppType = ({ Component, pageProps: { session, ...pageProps } }) => {
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
