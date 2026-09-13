import { useMemo } from "react";
import { useCollection } from "../../hooks/useCollection";
import TableComponent from "../../components/Table/TableComponent";

export default function ArchivedItem({
  currentCollection,
  activeCId,
  filterData,
  filterValue,
  handleDetail,
}) {
  const COLUMN = [
    { value: "id", style: "py-3 px-4 border-b text-center text-sm" },
    { value: "namaKlienSelect", style: "py-3 px-4 border-b text-left text-sm" },
    { value: "namaBarang", style: "py-3 px-4 border-b text-center text-sm" },
    { value: "jumlahFinal", style: "py-3 px-4 border-b text-right text-sm" },
  ];

  const doneClause = useMemo(() => ["statusSJ", "==", true], []);
  const doneOrder = useMemo(() => ["tanggalSJ", "desc"], []);
  const { documents: doneRow } = useCollection(
    currentCollection,
    activeCId,
    doneOrder,
    doneClause,
  );

  const done = filterData(doneRow, filterValue);
  return (
    <TableComponent
      title="Item Selesai"
      topTable={
        <tr className="bg-gray-50">
          <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
            Kode Item
          </th>
          <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
            Nama Klien
          </th>
          <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
            Nama Barang
          </th>
          <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
            Jumlah Final
          </th>
          <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
            Detail
          </th>
        </tr>
      }
      columnVariables={COLUMN}
      datas={done}
      handleDetail={handleDetail}
    />
  );
}
