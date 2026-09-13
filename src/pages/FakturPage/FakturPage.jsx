import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TableComponent from "../../components/Table/TableComponent";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";

import { useAuthContext } from "../../hooks/useAuthContext";
import { useCollection } from "../../hooks/useCollection";
import { useFirestore } from "../../hooks/useFirestore";
import { Timestamp } from "firebase/firestore";
import SearchFilter from "../../components/SearchFilter";
import { Trash2Icon } from "lucide-react";

const formatRupiah = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  return new Intl.NumberFormat("id-ID").format(num);
};

export default function FakturPage() {
  // DATA INIT
  const { activeCId } = useAuthContext();
  const currentCollection = "faktur";

  const order = useMemo(() => ["createdAt", "desc"], []);
  const { documents: dataRow } = useCollection(
    currentCollection,
    activeCId,
    order,
  );

  const navigate = useNavigate();

  // TABLE INITIALIZATION
  const COLUMN = [
    { value: "id", style: "py-3 px-4 border-b text-center text-sm" },
    { value: "namaKlien", style: "py-3 px-4 border-b text-left text-sm" },
    { value: "jumlahSJ", style: "py-3 px-4 border-b text-center text-sm" },
    { value: "total", style: "py-3 px-4 border-b text-right text-sm" },
  ];

  // FOR BUTTONS
  const handleAdd = () => {
    navigate("/faktur/add");
  };

  const handleDetail = (faktur) => {
    navigate(`/faktur/view?id=${faktur.id}`);
  };

  const [confirmDoneModal, setConfirmDoneModal] = useState(false);
  const [fakturInfo, setFakturInfo] = useState(null);

  const { updateDocument } = useFirestore(currentCollection, activeCId);

  const handleDone = (faktur) => {
    setFakturInfo(faktur);
    setConfirmDoneModal(true);
  };

  const handleConfirmDone = async () => {
    try {
      const { success, error } = await updateDocument(fakturInfo.id, {
        ...fakturInfo,
        statusFinal: true,
        tanggalFinal: Timestamp.now(),
      });

      if (success && !error) {
        setConfirmDoneModal(false);
        setFakturInfo(null);
      }
      if (error) {
        throw new Error("Failed Updating");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const [filter, setFilter] = useState([]);
  const handleFilter = useCallback((c) => setFilter(c), []);
  const searchResults = dataRow?.filter(
    (data) =>
      data?.klien?.value?.namaKlien
        ?.toLowerCase()
        .includes(filter.toLowerCase()) ||
      data.id.toLowerCase().includes(filter.toLowerCase()),
  );
  const [currentData, setCurrentData] = useState("undone");
  let filtered;
  switch (currentData) {
    case "all":
      filtered = searchResults;
      break;
    case "undone":
      filtered = searchResults?.filter((data) => data.statusFinal !== true);
      break;
    case "done":
      filtered = searchResults?.filter((data) => data.statusFinal === true);
      break;
  }
  return (
    <div className="faktur-page m-2 p-2">
      <h2 className="text-center text-2xl mb-6 font-bold">Daftar Faktur</h2>
      <div className="flex justify-between">
        <button
          onClick={handleAdd}
          className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center mb-4 gap-2"
        >
          Tambah Faktur
        </button>
        <button
          onClick={() => navigate("/trashed/fakturs")}
          className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-1 mb-4"
        >
          <Trash2Icon />
        </button>
      </div>

      <SearchFilter setFilter={handleFilter} />
      <div className="flex">
        <div
          className={`p-2 m-1 border border-blue-400 cursor-pointer rounded-lg ${currentData === "undone" ? "bg-blue-200" : ""}`}
          onClick={() => setCurrentData("undone")}
        >
          Belum Selesai
        </div>
        <div
          className={`p-2 m-1 border border-blue-400 cursor-pointer rounded-lg ${currentData === "done" ? "bg-blue-200" : ""}`}
          onClick={() => setCurrentData("done")}
        >
          Selesai
        </div>
        <div
          className={`p-2 m-1 border border-blue-400 cursor-pointer rounded-lg ${currentData === "all" ? "bg-blue-200" : ""}`}
          onClick={() => setCurrentData("all")}
        >
          Semua
        </div>
      </div>

      {filtered && (
        <TableComponent
          title="Daftar Faktur"
          topTable={
            <tr className="bg-gray-50">
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Kode Faktur
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Nama Klien
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Jumlah Surat
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Total Harga
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Detail
              </th>
            </tr>
          }
          columnVariables={COLUMN}
          datas={filtered}
          handleDetail={handleDetail}
          isFakturDone
          handleFakturDone={handleDone}
        />
      )}
      <>
        <ConfirmationModal
          isOpen={confirmDoneModal}
          onClose={() => setConfirmDoneModal(false)}
          onConfirm={() => handleConfirmDone(fakturInfo)}
          title="Penyelesaian Faktur"
          message="Selesaikan faktur dengan data berikut? Data faktur ini tidak bisa diedit setelah diselesaikan"
          confirmText="Selesaikan dan Final"
          cancelText="Batal"
        >
          <div className="p-4 m-3 text-left">
            <p>Kode: {fakturInfo?.id} </p>
            <p>Nama Klien: {fakturInfo?.namaKlien} </p>
            <p>dengan Total Harga: Rp.{formatRupiah(fakturInfo?.total)},-</p>
          </div>
        </ConfirmationModal>
      </>
    </div>
  );
}
