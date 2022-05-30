import { withTRPC } from "@trpc/next";
import { AppType } from "next/dist/shared/lib/utils";
import type { AppRouter } from "@stocks/api";
//import superjson from "superjson";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

function getBaseUrl() {
  if (process.browser) return ""; // Browser should use current path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const url = `${getBaseUrl()}/api/trpc`;
    return {
      url,
      //transformer: superjson,
    };
  },
  ssr: true,
})(MyApp);