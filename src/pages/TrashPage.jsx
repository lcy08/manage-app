import { useNavigate, useParams } from "react-router-dom";
import { useCollection } from "../hooks/useCollection";
import { useAuthContext } from "../hooks/useAuthContext";
import { useCallback, useMemo, useState } from "react";
import SearchFilter from "../components/SearchFilter";
import TableComponent from "../components/Table/TableComponent";
import { ArrowLeft } from "lucide-react";
// import { useBatchWrite } from "../hooks/useBatchWrite";

export default function TrashPage() {
  const { activeCId, status } = useAuthContext();
  const params = useParams();
  const navigate = useNavigate();

  let currentCollection;
  // let prevCollection;
  let navPoint;
  let tipe;

  switch (params.type) {
    case "clients":
      if (status !== "admin") {
        navigate("/sj");
      }
      currentCollection = "deletedClients";
      // prevCollection = "clients";
      navPoint = "/client";
      tipe = "Klien";
      break;
    case "items":
      currentCollection = "deletedItems";
      // prevCollection = "items";
      navPoint = "/items";
      tipe = "Item";
      break;
    case "sj":
      currentCollection = "deletedSJs";
      // prevCollection = "SJ";
      navPoint = "/sj";
      tipe = "Surat Jalan";
      break;
    case "fakturs":
      if (status !== "admin") {
        navigate("/sj");
      }
      currentCollection = "deletedFakturs";
      // prevCollection = "faktur";
      navPoint = "/faktur";
      tipe = "Faktur";
      break;
  }

  // const [showRestoreModal, setShowRestoreModal] = useState(false);

  const order = useMemo(() => ["createdAt", "desc"], []);

  const { documents } = useCollection(currentCollection, activeCId, order);

  const [filter, setFilter] = useState([]);
  const handleFilter = useCallback((c) => setFilter(c), []);
  const searchResults = documents?.filter(
    (data) =>
      data?.klien?.value?.namaKlien
        ?.toLowerCase()
        .includes(filter.toLowerCase()) ||
      data.id.toLowerCase().includes(filter.toLowerCase()),
  );

  const COLUMN = [
    { value: "id", style: "py-3 px-4 border-b text-center text-sm" },
    {
      value: `${tipe === "Klien" ? "namaKlien" : "namaKlienSelect"}`,
      style: "py-3 px-4 border-b text-left text-sm",
    },
  ];

  // const [data, setData] = useState(null)
  // const { queueSet, queueDelete, queueCommit } = useBatchWrite();

  // const handleDetail = (info) => {
  //   setData(info);
  //   setShowRestoreModal(true)
  // }

  // const handleConfirmRestore = async () => {
  //   try {
  //     const { id, ...dataInfo } = data

  //     queueSet(prevCollection, id, {...dataInfo, id});
  //     queueDelete(currentCollection, id);

  //     const { error, success } = await queueCommit();
  //     if (success && !error) {
  //       setShowRestoreModal(false);
  //       navigate(navPoint)
  //     }
  //     if (error) {
  //       setShowRestoreModal(false);
  //       throw new Error(error.message);
  //     }

  //   } catch (error) {
  //     console.error("Delete error: ", error);
  //     alert(`Error ${error.message}`);
  //   }
  // }

  const handleDetail = (data) => {
    console.log(data)
  }

  return (
    <div className="trash-page m-2 p-2">
      <div className="flex justify-between items-center mb-6">
        <div
          className="w-fit bg-gray-100 border border-gray-400 text-gray-800 rounded-lg flex items-center px-3 py-2 mt-3 mx-3 cursor-pointer"
          onClick={() => navigate(navPoint)}
        >
          <ArrowLeft className="h-4" />
        </div>
        <h2 className="text-center text-2xl font-bold">
          Daftar {tipe} Terhapus
        </h2>
        <div
          className="w-fit bg-gray-100 border border-gray-400 text-gray-800 rounded-lg flex opacity-0 items-center px-3 py-2 mt-3 mx-3 cursor-pointer"
        >
          <ArrowLeft className="h-4" />
        </div>
      </div>
      <SearchFilter setFilter={handleFilter} />
      {searchResults && (
        <TableComponent
          title={`${tipe} Terhapus`}
          topTable={
            <tr className="bg-gray-50">
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Kode
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Nama Klien
              </th>
              {/* <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Kembalikan Data
              </th> */}
            </tr>
          }
          columnVariables={COLUMN}
          datas={searchResults}
          handleDetail={handleDetail}
          isTrash
        />
      )}
    </div>
  );
}
