// layout for login section
import "../not-found.css";
import { ReactNode } from "react";

import Image from "next/image";
import nrithya from "../../../public/images/nrithya.png";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="not-found h-screen w-full bg-[#75172f] flex items-center justify-center text-primary-foreground">
      <Image className="w-[40%] p-24 border-r-4" src={nrithya} alt="Nrithya" />

      <section className="ps-10 flex w-[50%] flex-col gap-y-3 place-items-left">
        {children}
      </section>
    </section>
  );
};

export default AuthLayout;
