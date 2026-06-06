"use client";
import Navbar from "@/app/Components/Navbar";
import ResetPassword from "@/app/Components/resetPassword";
const AdminResetPasswordPage = () => {
  return (
    <div>
      <Navbar name="Reset Password" />
      <ResetPassword />
    </div>
  );
};

export default AdminResetPasswordPage;
