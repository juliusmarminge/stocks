import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { NextPage } from "next";
import React from "react";
import { HiOutlineX } from "react-icons/hi";

import { AutoAnimate } from "~/components/autoAnimate";
import { protectPage } from "~/server/common/gSSPPageProtection";
import { createTransactionValidator } from "~/server/trpc/validators";
import { useZodForm } from "~/utils/zodForm";

import { type InferTRPC, trpc } from "../utils/trpc";

const TransactionsPage: NextPage = () => {
  const sectionStyle = "grid card bg-base-200 rounded-box place-items-center";
  return (
    <div className="mt-10 flex w-full flex-col">
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

export const CreateTransaction: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm({
    validator: createTransactionValidator,
  });

  const utils = trpc.useContext();
  const createTransactionMutation = trpc.transactions.create.useMutation({
    onSuccess() {
      void utils.transactions.getByAuthedUser.invalidate();
      reset(); // reset form fields
    },
    onSettled() {
      setIsSubmitting(false);
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <div className="flex w-full flex-col p-8">
      <h1 className="text-2xl font-bold">Add new transaction</h1>
      <p className="text-error">{createTransactionMutation.error?.message}</p>
      <form
        onSubmit={
          void handleSubmit((data, e) => {
            setIsSubmitting(true);
            e?.preventDefault();
            createTransactionMutation.mutate(data);
          })
        }
      >
        {/** TRANSACTED AT */}
        <div className="input-group input-group-vertical my-4">
          <span className="bg-base-300">Transacted at</span>
          <input
            {...register("transactedAt", {
              setValueAs: (v: string) =>
                v.length === 0 ? new Date() : new Date(v),
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
              <span className="py-1 font-bold text-error">
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
              <span className="py-1 font-bold text-error">
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
              <span className="py-1 font-bold text-error">
                {errors.pricePerUnit.message}
              </span>
            )}
          </div>
        </div>

        {/** SUBMIT FORM */}
        <button
          className={`btn btn-primary mt-4 w-full ${isSubmitting && "loading"}`}
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
type Transaction =
  InferTRPC["transactions"]["getByAuthedUser"]["output"][number];
const columnHelper = createColumnHelper<Transaction>();

export const TransactionsListing: React.FC = () => {
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.transactions.getByAuthedUser.useQuery();
  const deleteMutation = trpc.transactions.delete.useMutation({
    async onMutate(deletedTransaction) {
      // Optimistic update, delete the transaction from the list immediately
      await utils.transactions.getByAuthedUser.cancel();
      const prevData = utils.transactions.getByAuthedUser.getData();
      utils.transactions.getByAuthedUser.setData((old) =>
        old?.filter((t) => t.id !== deletedTransaction.id),
      );
      return { prevData };
    },
    // Invalidate the query after the mutation is complete to sync with server
    onSettled() {
      void utils.transactions.getByAuthedUser.invalidate();
    },
  });

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("type", {
        cell: (t) => t.getValue(),
        header: () => <span>Type</span>,
      }),
      columnHelper.accessor("transactedAt", {
        cell: (t) => format(t.getValue(), "yyyy-MM-dd HH:mm:ss"),
        header: () => <span>Transacted at</span>,
      }),
      columnHelper.accessor("stock", {
        cell: (t) => t.getValue().toUpperCase(),
        header: () => <span>Stock</span>,
      }),
      columnHelper.accessor("units", {
        cell: (t) => t.getValue(),
        header: () => <span>Units</span>,
      }),
      columnHelper.accessor("pricePerUnit", {
        cell: (t) => `$${t.getValue()}`,
        header: () => <span>PPU</span>,
      }),
      columnHelper.display({
        id: "actions",
        cell: (t) => {
          const id = t.row.original.id;
          return (
            <button
              className="btn btn-ghost h-6"
              onClick={() => deleteMutation.mutate({ id })}
            >
              <HiOutlineX className="h-6 w-6 stroke-error" />
            </button>
          );
        },
      }),
    ],
    [deleteMutation],
  );

  const table = useReactTable({
    data: data ?? ([] as Transaction[]),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }
  if (!data) {
    return <div>No transactions...</div>;
  }
  return (
    <div className="w-full p-8">
      <h1 className="pb-4 text-2xl font-bold">Transactions</h1>

      <table className="table-compact table w-full">
        {/** table head */}
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="bg-base-300">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {/** table body */}
        <AutoAnimate as="tbody">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </AutoAnimate>
      </table>
    </div>
  );
};

export const getServerSideProps = protectPage;
export default TransactionsPage;
