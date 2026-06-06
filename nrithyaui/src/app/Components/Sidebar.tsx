import Link from "next/link";
import React from "react";

import "./Sidebar.css";
import Image from "next/image";
import nrithyaIcon from "../../../public/images/nrithya.png";

type IProps = {
  navItem: React.ReactNode;
};

const Sidebar = ({ navItem }: IProps) => {
  return (
    <div className="flex flex-col  bg-white text-black fixed w-[13rem] h-[100vh] overflow-y-scroll">
      <div className="flex h-14 items-center border-b lg:h-[60px] ">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 icon-background w-[100%] h-[100%]"
        >
          <Image width={"150"} className="" src={nrithyaIcon} alt="nrithya" />
        </Link>
      </div>
      <div className=" text-black flex flex-col gap-3 mt-2 ">{navItem}</div>
    </div>
  );
};

export default Sidebar;
