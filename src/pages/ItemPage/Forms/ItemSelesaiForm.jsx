import { useState, useEffect, useReducer } from "react";

import Col from "../../../components/Form/Col";
import DateCol from "../../../components/Form/DateCol";
import UnitCol from "../../../components/Form/UnitCol";
import ConfirmationModal from "../../../components/Modal/ConfirmationModal";

// import { useCollection } from "../../hooks/useCollection";
import { useFirestore } from "../../../hooks/useFirestore";
import { useBatchWrite } from "../../../hooks/useBatchWrite";

const itemReducer = (state, action) => {
  switch (action.type) {
    case "DATE":
      return {
        ...state,
        tanggalSelesai: action.payload,
      };
    case "DEADLINE_DATE": {
      return {
        ...state,
        tanggalSelesaiDeadline: new Date(action.payload),
      };
    }
    case "FINAL_WEIGHT": {
      const jumlahSusut = (
        action.payload.jumlahProses - action.payload.jumlahFinal
      ).toFixed(2);
      return { ...state, jumlahSusut, jumlahFinal: action.payload.jumlahFinal };
    }
    case "CHANGES": {
      const { name, value } = action.payload;
      return {
        ...state,
        [name]: value,
      };
    }
  }
};

export default function ItemSelesaiForm({
  isDetail,
  isEdit,
  activeCId,
  itemInfo,
  onChange,
  onEdit,
  onCancel,
  onSubmit,
  isAddSiapKirim,
  isSJEdit,
}) {
  const currentCollection = "items";
  const deleteCollection = "deletedItems";

  const { updateDocument } = useFirestore(currentCollection, activeCId);
  const { queueSet, queueDelete, queueCommit } = useBatchWrite(activeCId);

  // SYNCING CHANGES

  const [itemState, dispatch] = useReducer(itemReducer, itemInfo);
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDateReadOnly, setIsDateReadOnly] = useState(true);

  useEffect(() => {
    onChange(itemState);
  }, [onChange, itemState]);

  // DEADLINE CANT BE BELOW THE DATE

  useEffect(() => {
    if (
      !isDetail &&
      itemInfo.tanggalSelesai > itemInfo.tanggalSelesaiDeadline
    ) {
      const newDeadlineDate = new Date(itemInfo.tanggalSelesai);

      newDeadlineDate.setHours(23, 59, 0, 0);
      dispatch({ type: "DEADLINE_DATE", payload: newDeadlineDate });
    }
  }, [
    itemInfo.tanggalSelesai,
    itemInfo.tanggalSelesaiDeadline,
    isEdit,
    isDetail,
  ]);

  // FIREBASE INTERACTION

  const handleUpdateItem = async () => {
    setIsPending(true);
    setIsSubmitted(false);

    try {
      const itemSelesai = { ...itemInfo, itemStatus: "selesai" };
      const { error, success } = await updateDocument(itemInfo.id, itemSelesai);
      if (success && !error) {
        setIsPending(false);
        setIsSubmitted(true);
        onSubmit();
      }
      if (error) {
        console.log(error);
        setIsPending(false);
        setIsSubmitted(false);
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error adding Item", error);
      alert(`Error: ${error.message}`);
      setIsPending(false);
      setIsSubmitted(false);
    }
  };

  const handleDeleteItem = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const { id, ...itemData } = itemState;

      queueSet(deleteCollection, id, itemData, true);
      queueDelete(currentCollection, id);

      const { error, success } = await queueCommit();
      if (success) {
        onSubmit();
        setShowDeleteModal(false);
      }
      if (error) {
        setShowDeleteModal(false);
        throw new Error("Error moving to deleted folder");
      }
    } catch (error) {
      console.error("Delete error: ", error);
      alert(`Error ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const type = e.nativeEvent.submitter.value;

    switch (type) {
      case "UPDATE":
        await handleUpdateItem();
        break;
      case "DELETE":
        await handleDeleteItem();
        break;
      default:
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-1">
        {!isDetail && !isAddSiapKirim && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 bg-slate-100 p-2 rounded-xl">
            <span className="mx-2 mb-1 text-sm">ID Barang: {itemInfo.id}</span>
            <span className="mx-2 mb-1 text-sm">
              Klien: {itemInfo.klien.value?.namaKlien}
            </span>
            <span className="mx-2 mb-1 text-sm">
              Barang: {itemInfo.namaBarang}
            </span>
            <span className="mx-2 mb-1 text-sm">
              Alamat: {itemInfo.klien.value?.alamatKlien}
            </span>
            <span className="mx-2 mb-1 text-sm">
              Jumlah Proses:{" "}
              {itemInfo.jumlahProses + " " + itemInfo.satuan.value}
            </span>
          </div>
        )}

        {!isPending && !isSubmitted && (
          <DateCol
            label="Tanggal Selesai"
            value={itemInfo.tanggalSelesai}
            onChange={(opt) => dispatch({ type: "DATE", payload: opt })}
            isReadOnly={(isDetail || isEdit) && isDateReadOnly}
            startDate={itemInfo.tanggalProses}
          >
            {isEdit && !isAddSiapKirim && (
              <span
                className="p-2 bg-slate-700 hover:bg-slate-800 text-gray-100 rounded-xl cursor-pointer text-xs"
                onClick={() => setIsDateReadOnly(!isDateReadOnly)}
              >
                {isDateReadOnly ? "Edit Tanggal" : "Kunci Tanggal"}
              </span>
            )}
          </DateCol>
        )}
        {isPending && !isSubmitted && (
          <Col
            label="Tanggal Selesai"
            name="load"
            value="Loading..."
            isReadOnly
          />
        )}
        {!isPending && isSubmitted && (
          <Col
            label="Tanggal Selesai"
            name="submit"
            value="Submitted :)"
            isReadOnly
          />
        )}
        <DateCol
          label="Tanggal Deadline Packing"
          value={itemInfo?.tanggalSelesaiDeadline}
          onChange={(opt) => dispatch({ type: "DEADLINE_DATE", payload: opt })}
          isReadOnly={isDetail || isAddSiapKirim}
          startDate={itemInfo.tanggalSelesai}
        />

        <UnitCol
          type="number"
          label={`Jumlah Final (max. ${itemInfo.jumlahProses + " " + itemInfo.satuan.value})`}
          name="jumlahFinal"
          value={itemInfo.jumlahFinal}
          satuan={itemInfo.satuan.value}
          onChange={(e) =>
            dispatch({
              type: "FINAL_WEIGHT",
              payload: {
                jumlahProses: itemInfo.jumlahProses,
                jumlahFinal: e.target.value,
              },
            })
          }
          isReadOnly={isDetail || isAddSiapKirim}
        />

        <UnitCol
          type={
            parseInt(itemInfo.jumlahFinal) > parseInt(itemInfo.jumlahProses)
              ? "text"
              : "number"
          }
          label={`Jumlah Susut`}
          name="jumlahSusut"
          value={
            parseInt(itemInfo.jumlahFinal) > parseInt(itemInfo.jumlahProses)
              ? "Jumlah melebihi barang yang diproses"
              : itemInfo.jumlahSusut
          }
          satuan={itemInfo.satuan.value}
          style={
            parseInt(itemInfo.jumlahFinal) > parseInt(itemInfo.jumlahProses)
              ? "bg-red-300"
              : ""
          }
          isReadOnly
        />
      </div>
      {!isAddSiapKirim && !isSJEdit && (
        <div className="flex justify-center gap-4 mb-4">
          {!isEdit && isDetail && (
            <>
              <button
                onClick={onEdit}
                className="bg-amber-500 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer"
              >
                Edit
              </button>
              <button
                type="submit"
                value="DELETE"
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer"
              >
                Hapus
              </button>
            </>
          )}

          {isEdit && !isDetail && (
            <>
              <button
                onClick={() => {
                  onCancel();
                }}
                className="bg-gray-300 hover:bg-gray-500 text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                value="UPDATE"
                className={`${parseInt(itemInfo.jumlahFinal) > parseInt(itemInfo.jumlahProses) ? "bg-blue-100 cursot-not-allowed hover:bg-blue-300" : "bg-blue-500 cursor-pointer hover:bg-blue-700"} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
              >
                Ubah Data
              </button>
            </>
          )}
          {!isEdit && !isDetail && (
            <button
              type="submit"
              value="UPDATE"
              className={`${parseInt(itemInfo.jumlahFinal) > parseInt(itemInfo.jumlahProses) ? "bg-blue-100 cursot-not-allowed hover:bg-blue-300" : "bg-blue-500 cursor-pointer hover:bg-blue-700"} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
            >
              Seleaikan Proses
            </button>
          )}
        </div>
      )}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleConfirmDelete(itemInfo)}
        title="Penghapusan Klien"
        message={`Hapus klien dengan data berikut?`}
        confirmText="Hapus dan Pindahkan ke Folder Terhapus"
        cancelText="Batal"
      >
        <div className="p-4 m-3 text-left">
          <p>Kode: {itemInfo.id}</p>
          <p>Nama Barang: {itemInfo.namaBarang}</p>
          <p>Klien: {itemInfo.klien.value?.namaKlien}</p>
        </div>
      </ConfirmationModal>
    </form>
  );
}
