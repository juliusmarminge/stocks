import { getProviders, signIn, getSession } from "next-auth/react";
import type {
  NextPage,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useRouter } from "next/router";
import {
  GithubIcon,
  DiscordIcon,
  GoogleIcon,
  TwitterIcon,
} from "~/components/icons/brands";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import dynamic from "next/dynamic";

const LazyToaster = dynamic(async () => (await import("react-hot-toast")).Toaster, {
  ssr: false,
});

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getSession({ req: ctx.req });

  if (session) {
    /** redirect to home if signed in */
    return {
      redirect: {
        destination: "/",
      },
      props: {},
    };
  }

  const providers = await getProviders();
  return {
    props: { providers },
  };
};

const SignInPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ providers }) => {
  const router = useRouter();
  if (router.query.error) {
    toast.error(
      "There was an error linking your account. It's likely the registerred email adress is already linked to a different user. Please try using a different provider or use a different account.",
      {
        style: {
          background: "hsl(var(--b2, var(--b1))",
          color: "currentColor",
        },
        duration: 5000,
      }
    );
  }

  if (!providers) return <div>Failed to load providers...</div>;

  return (
    <div className="h-[80vh] flex items-center justify-center">
      <LazyToaster />
      <div className="card w-full shadow-lg max-w-md bg-base-200">
        <div className="card-body gap-4">
          <button
            className="btn btn-primary gap-2"
            onClick={() => signIn(providers.github.id)}
          >
            <GithubIcon /> Sign in with Github
          </button>
          <button
            className="btn btn-primary gap-2"
            onClick={() => signIn(providers.discord.id)}
          >
            <DiscordIcon /> Sign in with Discord
          </button>
          <div className="divider">or continue with</div>
          <div className="flex gap-4">
            <button
              className="btn btn-ghost gap-2 border-1 border-current flex-1"
              onClick={() => signIn(providers.google.id)}
            >
              <GoogleIcon /> Google
            </button>
            <button
              className="btn btn-ghost gap-2 border-1 border-current flex-1"
              onClick={() => signIn(providers.twitter.id)}
            >
              <TwitterIcon /> Twitter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;

/**
 * 
 * <button
                    key={provider.id}
                    className="btn btn-primary"
                    onClick={() =>
                      signIn(provider.id, {
                        redirect: false,
                      })
                    }
                  >
                    Sign in with {provider?.name}
                  </button>
 */
