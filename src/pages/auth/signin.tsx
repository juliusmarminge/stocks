import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { getProviders, signIn } from "next-auth/react";
import toast from "react-hot-toast";
import type { IconType } from "react-icons";
import { SiDiscord, SiGithub, SiGoogle, SiTwitter } from "react-icons/si";

import { getServerSession } from "~/server/common/getServerSession";

const LazyToaster = dynamic(
  async () => (await import("react-hot-toast")).Toaster,
  {
    ssr: false,
  },
);

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerSession(ctx);

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

const Provider: React.FC<{
  provider: string;
  Icon: IconType;
  includeAltText?: boolean;
  spanFull?: boolean;
}> = ({ provider, Icon, includeAltText, spanFull }) => {
  return (
    <button
      className={`btn btn-primary gap-2 ${spanFull && "flex-1"}`}
      onClick={() => void signIn(provider)}
    >
      <Icon className="h-8 w-8" />
      {includeAltText && "Sign in with"} {provider}
    </button>
  );
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
      },
    );
  }

  if (!providers) return <div>Failed to load providers...</div>;

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <LazyToaster />
      <div className="card w-full max-w-md bg-base-200 shadow-lg">
        <div className="card-body gap-4">
          <Provider provider="github" Icon={SiGithub} includeAltText />
          <Provider provider="discord" Icon={SiDiscord} includeAltText />
          <div className="divider">or continue with</div>
          <div className="flex gap-4">
            <Provider provider="google" Icon={SiGoogle} spanFull />
            <Provider provider="twitter" Icon={SiTwitter} spanFull />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
