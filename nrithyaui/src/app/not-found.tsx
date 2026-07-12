import { Button } from "@/components/ui/button";
import Link from "next/link";
// import "../app/not-found.css";
import Image from "next/image";
// import nrithya from "../../public/images/nrithya-full.png";
const NotFound = () => {
  return (
    <section className="not-found h-screen w-full bg-[#75172f] flex items-center justify-center text-primary-foreground">
      <Image className="w-[20%] border-r-4" src={"nrithya"} alt="Nrithya" />

      <div className="ps-10 flex flex-col gap-y-3 place-items-left">
        <h1 className="text-4xl font-bold">Oops! Page Not Found.</h1>
        <p>Sorry, we could not find the page you where looking for.</p>{" "}
        <Button
          className="w-fit bg-white text-[#75172f] font-bold hover:bg-[#773042] hover:text-white hover:shadow"
          type="button"
        >
          <Link href="/"> Back to Home</Link>
        </Button>
      </div>
    </section>
  );
};

export default NotFound;
