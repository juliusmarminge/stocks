import { getProviders, signIn, getSession, useSession } from "next-auth/react";
import type {
  NextPage,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";

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
  const session = useSession();

  console.log(session.status);

  if (!providers) return <div>Failed to load providers...</div>;

  return (
    <div className="hero min-h-[80vh] bg-base-200 rounded-box">
      <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <div className="card-body">
          <h1 className="text-center text-2xl">Sign in</h1>
          <p className="text-center mb-4">
            Select provider to sign in with below:
          </p>
          <div className="form-control">
            {Object.values(providers).map((provider) => {
              return (
                <button
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
