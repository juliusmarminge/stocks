import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import dynamic from "next/dynamic";
import Image, { type StaticImageData } from "next/future/image";
import { useRouter } from "next/router";
import { getProviders, signIn } from "next-auth/react";
import toast from "react-hot-toast";

import DiscordIcon from "~/assets/discord.svg";
import GithubIcon from "~/assets/github.svg";
import GoogleIcon from "~/assets/google.svg";
import TwitterIcon from "~/assets/twitter.svg";
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
  icon: StaticImageData;
  includeAltText?: boolean;
  spanFull?: boolean;
}> = ({ provider, icon, includeAltText, spanFull }) => {
  return (
    <button
      className={`btn btn-primary gap-2 ${spanFull && "flex-1"}`}
      onClick={() => void signIn(provider)}
    >
      <Image src={icon} alt="" height={32} width={32} />
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
    <div className="h-[80vh] flex items-center justify-center">
      <LazyToaster />
      <div className="w-full max-w-md shadow-lg card bg-base-200">
        <div className="gap-4 card-body">
          <Provider provider="github" icon={GithubIcon} includeAltText />
          <Provider provider="discord" icon={DiscordIcon} includeAltText />
          <div className="divider">or continue with</div>
          <div className="flex gap-4">
            <Provider provider="google" icon={GoogleIcon} spanFull />
            <Provider provider="twitter" icon={TwitterIcon} spanFull />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
