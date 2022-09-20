import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { unstable_getServerSession } from "next-auth";

import { authOptions as nextAuthOptions } from "../../pages/api/auth/[...nextauth]";

export const getServerSession = async (
  ctx:
    | {
        req: GetServerSidePropsContext["req"];
        res: GetServerSidePropsContext["res"];
      }
    | { req: NextApiRequest; res: NextApiResponse },
) => {
  return await unstable_getServerSession(ctx.req, ctx.res, nextAuthOptions);
};
