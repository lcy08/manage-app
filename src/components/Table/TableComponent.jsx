import React, { useState, useMemo } from "react";
import { EyeIcon } from "@heroicons/react/24/solid";
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { FileCheck } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";

const formatRupiah = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  return new Intl.NumberFormat("id-ID").format(num);
};

export default function TableComponent({
  title,
  topTable,
  columnVariables,
  datas,
  handleDetail,
  isSJtoFaktur = false,
  handleNextToFaktur = null,
  isFakturDone = false,
  handleFakturDone = null,
  isTrash = null,
}) {
  const { status } = useAuthContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { paginatedData, totalPages, startIdx, endIdx } = useMemo(() => {
    const startId = (currentPage - 1) * itemsPerPage;
    const endId = startId + itemsPerPage;
    const paginated = datas?.slice(startId, endId);

    return {
      paginatedData: paginated,
      totalPages: Math.ceil(datas?.length / itemsPerPage),
      startIdx: startId + 1,
      endIdx: Math.min(endId, datas?.length),
    };
  }, [datas, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          {title} ({datas?.length} data)
        </h3>
        <div className="felx items-center gap-2 text-sm text-gray-600">
          <span>Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={datas?.length}>All</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>{topTable}</thead>
          <tbody>
            {paginatedData?.map((row) => {
              // console.log(row.statusFaktur)
              return (
                <tr
                  key={row.id || row._timestamp}
                  className={`${row.statusFaktur || row.statusFinal ? "bg-green-200" : "bg-gray-100"} hover:bg-gray-200`}
                >
                  {/* Data */}
                  {columnVariables.map((variable) => {
                    if (variable.value === "total") {
                      return (
                        <td key={variable.value} className={variable.style}>
                          Rp.{formatRupiah(row[variable.value])},-
                        </td>
                      );
                    }
                    if (variable.value === "namaKlienSelect") {
                      return (
                        <td key={variable.value} className={variable.style}>
                          {row.klien.value.namaKlien}
                        </td>
                      );
                    }
                    if (variable.value === "jumlahFinal") {
                      return (
                        <td key={variable.value} className={variable.style}>
                          {row.jumlahFinal} {row.satuan.value}
                        </td>
                      );
                    }
                    return (
                      <td key={variable.value} className={variable.style}>
                        {row[variable.value]}
                      </td>
                    );
                  })}

                  {/* Buttons */}
                  {!isTrash && (
                    <td className="py-3 px-4 border-b">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleDetail(row)}
                          className={` text-white px-4 py-1 rounded-lg text-sm font-medium flex items-center gap-1 bg-amber-600 hover:bg-amber-700 cursor-pointer`}
                        >
                          <>
                            <EyeIcon className="block h-5 w-4" />
                            Detail
                          </>
                        </button>
                        {isSJtoFaktur && status === "admin" && (
                          <button
                            onClick={() => handleNextToFaktur(row)}
                            className={`${row.statusFaktur ? "bg-green-700 opacity-20 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 cursor-pointer"} text-white px-4 py-1 rounded-lg text-sm font-medium flex items-center gap-1`}
                            disabled={row.statusFaktur}
                          >
                            <FileCheck className="block h-5 w-4" />
                            Buat Faktur
                          </button>
                        )}
                        {isFakturDone && (
                          <button
                            onClick={() => handleFakturDone(row)}
                            className={`${row.statusFinal ? "bg-green-700 opacity-20 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 cursor-pointer"} text-white px-4 py-1 rounded-lg text-sm font-medium flex items-center gap-1`}
                            disabled={row.statusFinal}
                          >
                            <FileCheck className="block h-5 w-4" />
                            Faktur Selesai
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {datas?.length === 0 && (
              <tr className="text-center p-8 text-gray-500">
                <td colSpan={columnVariables.length + 1} className="p-4 m-4">
                  <DocumentTextIcon height={18} className="mx-auto" />{" "}
                  <p className="text-sm">data tidak ditemukan</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {datas?.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Menampilkan {startIdx} to {endIdx} of {datas.length} entries
          </div>
          bg-gray-300
          <div className="flex items-center gap-2">
            {/* Previous */}
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`${currentPage === 1 ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-white cursor-pointer"} px-3 py-1 rounded border text-sm transition-colors`}
            >
              <ArrowLeftIcon className="block h-4 w-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="px-2 py-1 text-gray-400">...</span>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-white cursor-pointer"
                      } px-3 py-1 rounded text-sm transition-colors`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`${currentPage === totalPages ? "border-gray-300 text-gray-400 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-white cursor-pointer"} px-3 py-1 rounded border text-sm transition-colors`}
            >
              <ArrowRightIcon className="block h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
