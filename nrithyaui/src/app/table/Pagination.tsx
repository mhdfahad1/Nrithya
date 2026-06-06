import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  pageNum: number;
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
  pageCount: number;
  isEnquiry?: boolean;
};

function PaginationDemo({
  pageNum,
  setPageNum,
  pageCount,
  isEnquiry,
}: PaginationProps) {
  let count: number;
  isEnquiry ? (count = pageCount / 100) : (count = pageCount / 25);
  return (
    <div>
      <Pagination>
        <PaginationContent>
          <PaginationItem className="cursor-pointer">
            <Button
              variant={"outline"}
              onClick={() => setPageNum(pageNum - 1)}
              disabled={pageNum <= 1}
            >
              <PaginationPrevious />
            </Button>
          </PaginationItem>
          {pageNum > 3 ? (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          ) : null}
          {pageNum > 2 ? (
            <PaginationItem
              onClick={() => setPageNum(pageNum - 2)}
              className="cursor-pointer"
            >
              <PaginationLink>{pageNum - 2}</PaginationLink>
            </PaginationItem>
          ) : null}

          {pageNum > 1 ? (
            <PaginationItem
              onClick={() => setPageNum(pageNum - 1)}
              className="cursor-pointer"
            >
              <PaginationLink>{pageNum - 1}</PaginationLink>
            </PaginationItem>
          ) : null}
          <PaginationItem>
            <PaginationLink isActive className="border-black">
              {pageNum <= count + 1 && pageNum}
            </PaginationLink>
          </PaginationItem>
          {pageNum < count ? (
            <PaginationItem
              onClick={() => setPageNum(pageNum + 1)}
              className="cursor-pointer"
            >
              <PaginationLink>{pageNum + 1}</PaginationLink>
            </PaginationItem>
          ) : null}
          {pageNum < count - 1 ? (
            <PaginationItem
              onClick={() => setPageNum(pageNum + 2)}
              className="cursor-pointer"
            >
              <PaginationLink>{pageNum + 2}</PaginationLink>
            </PaginationItem>
          ) : null}
          {pageNum <= count - 3 ? (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          ) : null}

          <PaginationItem className="cursor-pointer">
            <Button
              variant={"outline"}
              onClick={() => setPageNum(pageNum + 1)}
              disabled={pageNum >= count}
            >
              <PaginationNext />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export default PaginationDemo;
