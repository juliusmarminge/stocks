import type { NextPage } from "next";

const HomePage: NextPage = () => {
  return (
    <div className="hero min-h-[80vh] bg-base-200 rounded-box">
      <div className="hero-content text-center">
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold">Welcome</h1>
          <p className="py-4">
            <span className="italic">Stocks</span> is a simple web app to track your
            stocks and transactions. You will be able to add transactions you have
            made on different services and have a place to see all of them together.
          </p>
          <p className="italic pb-4">
            App is work in progress and close-source for now.
          </p>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
