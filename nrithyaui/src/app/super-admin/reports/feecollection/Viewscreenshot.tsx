import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
type Props = {
  imageUrl: string;
};

const Viewscreenshot = ({ imageUrl }: Props) => {
  const [open, setOpen] = useState(false);

  function downloadImage(imageUrl: string, fileName: string): void {
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading the image:", error));
  }

  // Example usage
  const fileName = "paymentScreenshot";
  const isPdf = (url: string) => {
    return url.toLowerCase().endsWith(".pdf");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center cursor-pointer justify-center w-[100%] text-lg">
          <i className="fa-solid fa-eye text-[#75172F]"></i>
        </button>
      </DialogTrigger>
      {open ? (
        <DialogContent className="sm:max-w-sm min-h-[140px]">
          <DialogHeader>
            {/* <DialogTitle>View Payment Screenshot</DialogTitle> */}
            {imageUrl ? (
              <div className="relative object-cover flex justify-center">
                {isPdf(imageUrl) ? (
                  <embed
                    type="application/pdf"
                    src={imageUrl}
                    className="w-[69%] h-[100%] object-cover"
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt="Payment Receipt"
                    className="w-[69%] h-[100%] object-cover"
                  />
                )}
              </div>
            ) : (
              <p className="flex items-center justify-center  font-bold">
                No Screenshot Available
              </p>
            )}
          </DialogHeader>
          {/* <a href={imageUrl} download="">
            Download
          </a> */}
          <div className="flex justify-center">
            <Button
              onClick={() => downloadImage(imageUrl, fileName)}
              className="p-1 w-[50%] "
              variant={"primary"}
            >
              Download
            </Button>
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild></DialogClose>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
};

export default Viewscreenshot;
