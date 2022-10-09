import { GetServerSidePropsContext } from "next";

import { getServerSession } from "./getServerSession";

export const protectPage = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerSession(ctx);
  if (!session) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  return { props: {} };
};
