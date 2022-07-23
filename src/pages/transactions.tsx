import React from "react";
import { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { format, differenceInBusinessDays, add, isDate } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, XIcon } from "@heroicons/react/outline";

const HomePage: NextPage = () => {
  const sectionStyle = "grid card bg-base-200 rounded-box place-items-center";
  return (
    <div className="flex flex-col w-full mt-10">
      <div className={sectionStyle}>
        <CreateTransaction />
      </div>
      <div className="divider" />
      <div className={sectionStyle}>
        <TransactionsListing />
      </div>
    </div>
  );
};

/** add one day until we're on a business day */
const getNextBusinessDay = (date: Date) => {
  if (differenceInBusinessDays(date, add(date, { days: 1 })) > 0) {
    return add(date, { days: 1 });
  }
  return date;
};

/**
 * Schema for form data which is also consumed by trpc mutation
 */
export const createTransactionValidator = z.object({
  transactedAt: z.preprocess((dateString) => {
    const asDate = new Date(dateString as string);
    if (!isDate(asDate)) {
      return false;
    }
    return getNextBusinessDay(asDate);
  }, z.date()),
  stock: z.string().min(1).max(6),
  units: z.number().int().positive(),
  pricePerUnit: z.number().positive(),
  type: z.enum(["BUY", "SELL"]),
});
type FormInput = z.infer<typeof createTransactionValidator>;

export const CreateTransaction: React.FC = () => {
  const transactionMutation = trpc.useMutation("transactions.create");
  const ctx = trpc.useContext();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(createTransactionValidator),
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <div className="flex flex-col w-full p-8">
      <h1 className="text-2xl font-bold">Add new transaction</h1>
      <form
        onSubmit={handleSubmit((data, e) => {
          setIsSubmitting(true);
          e?.preventDefault();
          transactionMutation.mutate(
            {
              ...data,
              transactedAt: data.transactedAt,
            },
            {
              onSuccess: () => {
                ctx.invalidateQueries("transactions.getByAuthedUser");
                reset(); // reset form fields
                setIsSubmitting(false);
              },
            }
          );
        })}
      >
        {/** TRANSACTED AT */}
        <div className="my-4 input-group input-group-vertical">
          <span className="bg-base-300">Transacted at</span>
          <input
            {...register("transactedAt", {
              setValueAs: (v: string) => (v.length === 0 ? new Date() : new Date(v)),
            })}
            placeholder="Enter a Date-parsable string. Leave blank for Date.now()"
            className="input input-bordered placeholder:italic"
          />

          {errors.transactedAt && (
            <span className="py-1 font-bold text-error">
              {errors.transactedAt.message}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-2 ">
          {/** TRANSACTION TYPE */}
          <div className="my-4 input-group input-group-vertical">
            <span className="bg-base-300">Type</span>
            <select {...register("type")} className="select select-bordered">
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          {/** STOCK */}
          <div className="my-4 input-group input-group-vertical">
            <span className="bg-base-300">Stock</span>
            <input
              {...register("stock")}
              placeholder="Enter the stock's symbol ticker, e.g. AAPL"
              className="input input-bordered placeholder:italic"
            />
            {errors.stock && (
              <span className="py-1 font-bold text-error">
                {errors.stock.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-2 ">
          {/** UNITS */}
          <div className="my-4 input-group input-group-vertical">
            <span className="bg-base-300">Units</span>
            <input
              {...register("units", { valueAsNumber: true })}
              placeholder="Enter the number of stock transacted"
              className="input input-bordered placeholder:italic"
            />
            {errors.units && (
              <span className="py-1 font-bold text-error">
                {errors.units.message}
              </span>
            )}
          </div>

          {/** PRICE PER UNIT */}
          <div className="my-4 input-group input-group-vertical">
            <span className="bg-base-300">Price per unit</span>
            <input
              {...register("pricePerUnit", { valueAsNumber: true })}
              placeholder="Enter the price per stock"
              className="input input-bordered placeholder:italic"
            />
            {errors.pricePerUnit && (
              <span className="py-1 font-bold text-error">
                {errors.pricePerUnit.message}
              </span>
            )}
          </div>
        </div>

        {/** SUBMIT FORM */}
        <button
          className={`btn btn-primary w-full mt-4 ${isSubmitting && "loading"}`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

/**
 * Lists all available transactions
 * for the currently authenticated user
 */
export const TransactionsListing: React.FC = () => {
  const ctx = trpc.useContext();
  const { data: transactions, isLoading } = trpc.useQuery([
    "transactions.getByAuthedUser",
  ]);
  const deleteMutation = trpc.useMutation("transactions.delete");

  const [isEditing, setIsEditing] = React.useState(false);
  const [isMutating, setIsMutating] = React.useState<string>("");
  const deleteTransaction = (id: string) => {
    setIsMutating(id);
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          ctx.invalidateQueries("transactions.getByAuthedUser");
          setIsMutating("");
        },
      }
    );
  };

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }
  if (!transactions) {
    return <div>No transactions...</div>;
  }
  return (
    <div className="w-full p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button
          className="p-2 btn btn-square btn-base btn-md"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <XIcon /> : <PencilIcon />}
        </button>
      </div>
      <table className="table w-full">
        {/** table head */}
        <thead>
          <tr>
            <th className="bg-base-300">Type</th>
            <th className="bg-base-300">Transacted At</th>
            <th className="bg-base-300">Stock</th>
            <th className="bg-base-300">Units</th>
            <th className="bg-base-300">PPU</th>
            {isEditing && <th className="w-4 bg-base-300"></th>}
          </tr>
        </thead>
        {/** table body */}
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover">
              <td>{transaction.type}</td>
              <td>{format(transaction.transactedAt, "yyyy-MM-dd HH:mm:ss")}</td>
              <td className="uppercase">{transaction.stock}</td>
              <td>{transaction.units}</td>
              <td>{transaction.pricePerUnit}</td>
              {isEditing && ( // TODO: FIX GLITCHY UI
                <td className="px-0 mx-0 w-min">
                  <button
                    className={`btn btn-square btn-outline m-0 p-0 btn-sm border-0 mr-2 ${
                      isMutating === transaction.id && "loading"
                    }`}
                    onClick={() => deleteTransaction(transaction.id)}
                  >
                    {isMutating !== transaction.id && (
                      <XIcon className="h-4 stroke-error" />
                    )}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HomePage;
