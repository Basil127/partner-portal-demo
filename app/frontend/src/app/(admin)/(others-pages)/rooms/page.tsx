import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Rooms | Partner Portal",
  description: "Rooms page for the Partner Portal.",
};

export default function RoomsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Rooms" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Rooms
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            This empty card is ready for room content.
          </p>
        </div>
      </div>
    </div>
  );
}
