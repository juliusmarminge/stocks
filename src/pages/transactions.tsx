import { XIcon } from "@heroicons/react/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { add, differenceInBusinessDays, format, isDate } from "date-fns";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AutoAnimate } from "~/components/autoAnimate";
import { getServerSession } from "~/server/common/getServerSession";

import { type InferTRPC, trpc } from "../utils/trpc";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerSession(ctx);
  if (!session) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }
  return { props: {} };
};

const TransactionsPage: NextPage = () => {
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(createTransactionValidator),
  });

  const utils = trpc.useContext();
  const { mutate: createMutate, error } = trpc.transactions.create.useMutation({
    onSuccess() {
      void utils.transactions.getByAuthedUser.invalidate();
      reset(); // reset form fields
      setIsSubmitting(false);
    },
    onError: (e) => {
      console.error(e);
      setIsSubmitting(false);
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <div className="flex flex-col w-full p-8">
      <h1 className="text-2xl font-bold">Add new transaction</h1>
      <p className="text-error">{error?.message}</p>
      <form
        onSubmit={
          void handleSubmit((data, e) => {
            setIsSubmitting(true);
            e?.preventDefault();
            createMutate(data);
          })
        }
      >
        {/** TRANSACTED AT */}
        <div className="my-4 input-group input-group-vertical">
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
type Transaction =
  InferTRPC["transactions"]["getByAuthedUser"]["output"][number];
const columnHelper = createColumnHelper<Transaction>();

export const TransactionsListing: React.FC = () => {
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.transactions.getByAuthedUser.useQuery();
  const { mutate: deleteMutate } = trpc.transactions.delete.useMutation({
    async onMutate(deletedTransaction) {
      // Optimistic update, delete the transaction from the list immediately
      await utils.transactions.getByAuthedUser.cancel();
      const prevData = utils.transactions.getByAuthedUser.getData();
      // FIXME: REMOVE EXPLICIT TYPE
      utils.transactions.getByAuthedUser.setData(
        (old: Transaction[] | undefined) =>
          old?.filter((t) => t.id !== deletedTransaction.id),
      );
      return { prevData };
    },
    // Invalidate the query after the mutation is complete to sync wit server
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
              onClick={() => deleteMutate({ id })}
            >
              <XIcon className="h-6 w-6 stroke-error" />
            </button>
          );
        },
      }),
    ],
    [deleteMutate],
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
      <h1 className="text-2xl font-bold pb-4">Transactions</h1>

      <table className="table table-compact w-full">
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

export default TransactionsPage;
