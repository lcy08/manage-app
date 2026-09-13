// import { useState, useMemo } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";

const getFirebaseDate = (date) => {
  try {
    if (date) {
      return new Date(date.toDate().toString());
    }
  } catch (e) {
    console.log(e.message);
    return new Date();
  }
};

export default function KanbanComponent({
  data,
  status,
  handlePrevious,
  handleDetail,
  handleNext,
}) {
  const tanggalStatus = "tanggal" + status;
  const tanggalDeadline = "tanggal" + status + "Deadline";
  const today = new Date();
  const deadline = new Date(
    getFirebaseDate(data[tanggalDeadline]).getTime() - 24 * 60 * 60 * 1000,
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 w-72 my-2">
      <div className="flex justify-between">
        <div>
          <span className="font-bold">{data.namaBarang}</span> (
          <span className="underline px-1">{data.jumlah}</span>{" "}
          {data.satuan.value})
        </div>
        {status === "Masuk" && (
          <span
            className={`${today < deadline ? "text-green-700" : "text-red-700"} text-xs`}
          >
            proses:{" "}
            {data[tanggalDeadline]?.toDate().toLocaleDateString("id-ID")}
          </span>
        )}
        {status === "Proses" && (
          <span
            className={`${today < deadline ? "text-green-700" : "text-red-700"} text-xs`}
          >
            selesai:{" "}
            {data[tanggalDeadline]?.toDate().toLocaleDateString("id-ID")}
          </span>
        )}
        {status === "Selesai" && (
          <span
            className={`${today < deadline ? "text-green-700" : "text-red-700"} text-xs`}
          >
            pack: {data[tanggalDeadline]?.toDate().toLocaleDateString("id-ID")}
          </span>
        )}
        {status === "SiapKirim" && (
          <span
            className={`${today < deadline ? "text-green-700" : "text-red-700"} text-xs`}
          >
            kirim: {data[tanggalDeadline]?.toDate().toLocaleDateString("id-ID")}
          </span>
        )}
      </div>
      <div className="italic"> {data.klien.value?.namaKlien} </div>
      <div className="text-xs"> {data.id} </div>
      <div className="text-sm my-3">
        <p>Tanggal {status}</p>
        {data[tanggalStatus]
          ? data[tanggalStatus].toDate().toLocaleString("id-ID")
          : "Tidak ada tanggal"}
      </div>
      <div className="flex justify-center gap-1">
        <button
          onClick={() => handlePrevious(data)}
          className={`${status === "Masuk" ? "bg-rose-300 cursor-not-allowed" : "bg-rose-700 hover:bg-rose-900 cursor-pointer"} text-white px-4 py-1 rounded-lg text-sm font-medium flex items-center gap-1`}
          disabled={status === "Masuk"}
        >
          <ArrowLeftIcon className="block h-5 w-4" />
          <p className="text-xs">Undo</p>
        </button>
        <button
          onClick={() => handleDetail(data)}
          className={` text-white px-4 py-1 rounded-lg text-sm font-medium flex items-center gap-1 bg-amber-600 hover:bg-amber-700 cursor-pointer`}
        >
          <EyeIcon className="block h-5 w-4" />
          <p className="text-xs">Detail</p>
        </button>
        <button
          onClick={() => handleNext(data)}
          className={` text-white px-4 py-1 rounded-lg text-sm font-medium flex items-center gap-1 bg-green-600 hover:bg-green-800 cursor-pointer`}
        >
          {status === "SiapKirim" ? (
            <>
              <DocumentDuplicateIcon className="block h-5 w-4" />
              <p className="text-xs">Surat</p>
            </>
          ) : (
            <>
              <p className="text-xs">Lanjut</p>
              <ArrowRightIcon className="block h-5 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
