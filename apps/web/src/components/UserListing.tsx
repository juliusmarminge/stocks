import { inferQueryOutput } from "../utils/trpc";

type UserWithTransactions = Exclude<
  inferQueryOutput<"user.getByNameWithTransactions">,
  null
>;
export const UserListing: React.FC<{ user: UserWithTransactions }> = ({
  user,
}) => {
  return (
    <div>
      <p>{user.name}</p>
      <b>Transactions</b>
      {user.transactions.map((transaction) => (
        <div>
          <p>{transaction.transactedAt}</p>
          <p>{transaction.stock}</p>
          <p>{transaction.units}</p>
          <p>{transaction.pricePerUnit}</p>
        </div>
      ))}
    </div>
  );
};
