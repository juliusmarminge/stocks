import React from "react";
import { trpc } from "../utils/trpc";
import { format, isValid } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionValidator } from "@stocks/api/src/validators/transaction";

/** the user id is not inputted by the form but instead retrieved by auth */
const FormValidator = createTransactionValidator.omit({ transactedBy: true });
type FormInput = z.infer<typeof FormValidator>;

export const CreateTransaction: React.FC = () => {
  const transactionMutation = trpc.useMutation("transaction.create");
  const ctx = trpc.useContext();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(FormValidator),
  });

  return (
    <div className="flex flex-col w-full p-8">
      <h1 className="text-2xl font-bold mb-4">Add new transaction</h1>
      <form
        onSubmit={handleSubmit((data, e) => {
          e?.preventDefault();
          transactionMutation.mutate(
            {
              ...data,
              transactedAt: data.transactedAt || new Date(),
              transactedBy: "891efa5c-bc14-49b5-8968-051622bc7835",
            },
            {
              onSuccess: () => {
                ctx.invalidateQueries("transaction.getAll");
                reset(); // reset form fields
              },
            }
          );
        })}
      >
        {/** TRANSACTED AT */}
        <div className="input-group input-group-vertical my-4">
          <span className="bg-base-300">Transacted at</span>
          <div className="flex flex-col lg:flex-row">
            <input
              {...register("transactedAt", {
                setValueAs: (v: string) =>
                  v.length === 0 ? new Date() : new Date(v),
              })}
              placeholder="Enter a Date-parsable string. Leave blank for Date.now()"
              className="input lg:w-1/2 input-bordered placeholder:italic rounded-t-none"
            />
            <span className="lg:w-1/2 input input-bordered bg-base-100">
              Parsed as:{" "}
              {isValid(watch("transactedAt"))
                ? format(watch("transactedAt"), "yyyy-MM-dd HH:mm:ss")
                : "Invalid date"}
            </span>
          </div>

          {errors.transactedAt && (
            <span className="font-bold text-error py-1">
              {errors.transactedAt.message}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-2 ">
          {/** TRANSACTION TYPE */}
          <div className="input-group input-group-vertical my-4">
            <span className="bg-base-300">Type</span>
            <select {...register("type")} className="select select-bordered">
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          {/** STOCK */}
          <div className="input-group input-group-vertical my-4">
            <span className="bg-base-300">Stock</span>
            <input
              {...register("stock")}
              placeholder="Enter the stock's symbol ticker, e.g. AAPL"
              className="input input-bordered placeholder:italic"
            />
            {errors.stock && (
              <span className="font-bold text-error py-1">
                {errors.stock.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-2 ">
          {/** UNITS */}
          <div className="input-group input-group-vertical my-4">
            <span className="bg-base-300">Units</span>
            <input
              {...register("units", { valueAsNumber: true })}
              placeholder="Enter the number of stock transacted"
              className="input input-bordered placeholder:italic"
            />
            {errors.units && (
              <span className="font-bold text-error py-1">
                {errors.units.message}
              </span>
            )}
          </div>

          {/** PRICE PER UNIT */}
          <div className="input-group input-group-vertical my-4">
            <span className="bg-base-300">Price per unit</span>
            <input
              {...register("pricePerUnit", { valueAsNumber: true })}
              placeholder="Enter the price per stock"
              className="input input-bordered placeholder:italic"
            />
            {errors.pricePerUnit && (
              <span className="font-bold text-error py-1">
                {errors.pricePerUnit.message}
              </span>
            )}
          </div>
        </div>

        {/** SUBMIT FORM */}
        <input
          type="submit"
          value="Submit"
          className="btn btn-primary w-full mt-4"
        />
      </form>
    </div>
  );
};

export const TransactionsListing: React.FC = () => {
  const { data: transactions, isLoading } = trpc.useQuery([
    "transaction.getAll",
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!transactions) {
    return <div>No transactions...</div>;
  }
  return (
    <div className="w-full p-8">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <table className="table w-full">
        {/** head */}
        <thead>
          <tr>
            <th className="bg-base-300">Type</th>
            <th className="bg-base-300">Transacted At</th>
            <th className="bg-base-300">Stock</th>
            <th className="bg-base-300">Units</th>
            <th className="bg-base-300">PPU</th>
          </tr>
        </thead>
        {/** body */}
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover">
              <td>{transaction.type}</td>
              <td>{format(transaction.transactedAt, "yyyy-MM-dd HH:mm:ss")}</td>
              <td>{transaction.stock}</td>
              <td>{transaction.units}</td>
              <td>{transaction.pricePerUnit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
