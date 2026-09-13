import { useState, useCallback, useMemo } from "react";

import TableComponent from "../../components/Table/TableComponent";
import Modal from "../../components/Modal/Modal";
import ClientForm from "./ClientForm";
import SearchFilter from "../../components/SearchFilter";

import { useCollection } from "../../hooks/useCollection";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ClientPage() {
  // DATA INIT
  const { activeCId } = useAuthContext();
  const navigate = useNavigate();
  const currentCollection = "clients";

  const order = useMemo(() => ["namaKlien", "asc"], []);

  const { documents: dataRow, error } = useCollection(
    currentCollection,
    activeCId,
    order,
  );

  const initialClientInfo = useMemo(
    () => ({
      id: "",
      namaKlien: "",
      alamatKlien: "",
      companyId: activeCId,
    }),
    [activeCId],
  );

  const [clientInfo, setClientInfo] = useState(initialClientInfo);

  // TABLE INITIALIZATION
  const COLUMN = [
    { value: "id", style: "py-3 px-4 border-b text-center text-sm" },
    { value: "namaKlien", style: "py-3 px-4 border-b text-left text-sm" },
    { value: "alamatKlien", style: "py-3 px-4 border-b text-left text-sm" },
  ];

  // MODAL SHOW
  const [showModal, setShowModal] = useState(false);

  const [isDetail, setIsDetail] = useState(false);

  // EDITING
  const [isEdit, setIsEdit] = useState(false);
  const [clientName, setClientName] = useState(null);

  // HANDLE FUNCTION FOR FORMS
  const handleChange = useCallback((update) => {
    setClientInfo(update);
  }, []);

  // FOR BUTTONS
  const handleAdd = () => {
    setIsEdit(false);
    setIsDetail(false);
    setClientInfo(initialClientInfo);
    setShowModal(true);
  };

  const handleDetail = (r) => {
    setIsDetail(true);
    setIsEdit(false);

    setClientInfo({
      ...r,
    });
    setShowModal(true);
  };

  const handleEdit = () => {
    setIsDetail(false);
    setIsEdit(true);
    setClientName(clientInfo.namaKlien);
  };

  const handleCancel = () => {
    setIsDetail(true);
    setIsEdit(false);
  };

  const [filter, setFilter] = useState([]);
  const handleFilter = useCallback((c) => setFilter(c), []);
  const filtered = dataRow?.filter(
    (data) =>
      data.namaKlien.toLowerCase().includes(filter.toLowerCase()) ||
      data.id.toLowerCase().includes(filter.toLowerCase()),
  );

  // MAIN COMPONENT
  return (
    <div className="client-page m-2 p-2">
      <h2 className="text-center text-2xl mb-6 font-bold">Daftar Klien</h2>
      <div className="flex justify-between">
        <button
          onClick={handleAdd}
          className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center mb-4 gap-2"
        >
          Tambah Klien
        </button>
        <button
          onClick={() => navigate("/trashed/clients")}
          className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-1 mb-4"
        >
          <Trash2Icon />
        </button>
      </div>
      <SearchFilter setFilter={handleFilter} />

      {filtered && (
        <TableComponent
          title="Daftar Klien"
          topTable={
            <tr className="bg-gray-50">
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Kode Klien
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Nama Klien
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Alamat Klien
              </th>
              <th className="py-2 px-3 border-b text-center text-sm font-medium bg-gray-300 text-gray-700">
                Detail
              </th>
            </tr>
          }
          columnVariables={COLUMN}
          datas={filtered}
          handleDetail={handleDetail}
        />
      )}
      {error && <p className="error">Tidak bisa mengambil data</p>}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setClientName(null);
        }}
        title="Klien"
      >
        <ClientForm
          isDetail={isDetail}
          isEdit={isEdit}
          activeCId={activeCId}
          clientInfo={clientInfo}
          clientName={clientName}
          onChange={(update) => handleChange(update)}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSubmit={() => {
            setClientInfo(initialClientInfo);
            setShowModal(false);
          }}
        />
      </Modal>
    </div>
  );
}

export default ClientPage;
