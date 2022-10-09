import { protectPage } from "~/server/common/gSSPPageProtection";

const ProfilePage = () => {
  return (
    <div>
      <h1>Profile</h1>
    </div>
  );
};

export default ProfilePage;
export const getServerSideProps = protectPage;
