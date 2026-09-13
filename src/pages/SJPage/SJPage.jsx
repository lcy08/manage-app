import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TableComponent from "../../components/Table/TableComponent";

import { useCollection } from "../../hooks/useCollection";
import { useAuthContext } from "../../hooks/useAuthContext";

import SearchFilter from "../../components/SearchFilter";
import RightSideModal from "../../components/Modal/RightSideModal";
import SJFakturForm from "./Forms/SJFakturForm";
import { Trash2Icon } from "lucide-react";

/**
 * Convert firebase timestamp into readable JS DateObject
 *
 * @param {FirebaseTimestamp} date
 * @return {DateObject} Date readable by React-datepicker
 */
const getFirebaseDate = (date) => {
  if (date) {
    try {
      return new Date(date.toDate().toString());
    } catch (e) {
      console.log(e.message);
      return date;
    }
  } else {
    return new Date();
  }
};

export default function ClientPage() {
  // DATA INIT
  const { activeCId } = useAuthContext();
  const currentCollection = "SJ";

  const order = useMemo(() => ["createdAt", "desc"], []);
  const { documents: dataRow } = useCollection(
    currentCollection,
    activeCId,
    order,
  );

  const navigate = useNavigate();

  const [sjInfo, setSJInfo] = useState(null);
  const [showFakturModal, setShowFakturModal] = useState(false);

  // TABLE INITIALIZATION
  const COLUMN = [
    { value: "id", style: "py-3 px-4 border-b text-center text-sm" },
    { value: "namaKlien", style: "py-3 px-4 border-b text-left text-sm" },
    { value: "jumlahItem", style: "py-3 px-4 border-b text-center text-sm" },
  ];

  // FOR BUTTONS
  const handleAdd = () => {
    navigate("/sj/add");
  };

  const handleDetail = (sj) => {
    navigate(`/sj/view?type=${sj.type}&&id=${sj.id}`);
  };

  const handleNext = async (sj) => {
    await setSJInfo({
      ...sj,
      tanggalSJ: getFirebaseDate(sj.tanggalSJ),
      tanggalFaktur: new Date(),
    });
    setShowFakturModal(true);
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
      filtered = searchResults?.filter((data) => data.statusFaktur !== true);
      break;
    case "done":
      filtered = searchResults?.filter((data) => data.statusFaktur === true);
      break;
  }
  // MAIN COMPONENT
  return (
    <div className="sj-page m-2 p-2">
      <h2 className="text-center text-2xl mb-6 font-bold">
        Daftar Surat Jalan
      </h2>
      <div className="flex justify-between">
        <button
          onClick={handleAdd}
          className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center mb-4 gap-2"
        >
          Tambah SJ
        </button>
        <button
          onClick={() => navigate("/trashed/sj")}
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
          title="Daftar Surat Jalan"
          topTable={
            <tr className="bg-gray-50">
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Kode Surat Jalan
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Nama Klien
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Jumlah Item
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Detail
              </th>
            </tr>
          }
          columnVariables={COLUMN}
          datas={filtered}
          handleDetail={handleDetail}
          isSJtoFaktur
          handleNextToFaktur={handleNext}
        />
      )}
      <>
        <RightSideModal
          isOpen={showFakturModal}
          onClose={() => setShowFakturModal(false)}
          title="Faktur"
          width="max-w-2xl"
        >
          <SJFakturForm activeCId={activeCId} sjInfo={sjInfo} />
        </RightSideModal>
      </>
    </div>
  );
}
