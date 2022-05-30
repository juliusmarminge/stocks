import React, { useEffect } from "react";
import { trpc } from "../utils/trpc";
import { format } from "date-fns";
import { useForm, SubmitHandler } from "react-hook-form";

type FormInputs = {
  name: string;
};

export const CreateUser: React.FC = () => {
  const userMutation = trpc.useMutation("user.create");
  const ctx = trpc.useContext();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ name: string }>();

  useEffect(() => console.log(watch("name")));

  return (
    <div className="flex flex-col w-full p-8">
      <h1 className="text-2xl font-bold mb-4">Register User</h1>
      <form
        onSubmit={handleSubmit((data, e) => {
          e?.preventDefault();
          userMutation.mutate(data, {
            onSuccess: () => {
              ctx.invalidateQueries("user.getAll");
            },
          });
        })}
      >
        <div className="input-group input-group-vertical my-4">
          <span className="bg-base-300">Name</span>
          <input
            {...register("name", { required: true })}
            className="input input-bordered"
          />
          {errors.name && (
            <span className="font-bold text-error py-1">
              This field is required
            </span>
          )}
        </div>

        <input
          type="submit"
          value="Submit"
          className="btn btn-primary w-full mt-4"
        />
      </form>
    </div>
  );
};

export const UsersListing: React.FC = () => {
  const { data: users, isLoading } = trpc.useQuery(["user.getAll"]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!users) {
    return <div>No users...</div>;
  }
  return (
    <div className="w-full p-8">
      <h1 className="text-2xl font-bold mb-4">Measurements</h1>
      <table className="table w-full">
        {/** head */}
        <thead>
          <tr>
            <th className="bg-base-300"></th>
            <th className="bg-base-300">Id</th>
            <th className="bg-base-300">Name</th>
          </tr>
        </thead>
        {/** body */}
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id}>
              <th>{idx + 1}</th>
              <td>{user.id}</td>
              <td>{user.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
