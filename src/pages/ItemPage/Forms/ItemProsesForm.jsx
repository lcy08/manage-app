import { useState, useEffect, useReducer } from "react";

import Col from "../../../components/Form/Col";
import UnitCol from "../../../components/Form/UnitCol";
import DateCol from "../../../components/Form/DateCol";
import ConfirmationModal from "../../../components/Modal/ConfirmationModal";

// import { useCollection } from "../../hooks/useCollection";
import { useFirestore } from "../../../hooks/useFirestore";
import { useBatchWrite } from "../../../hooks/useBatchWrite";
import { useDoc } from "../../../hooks/useDoc";

const itemReducer = (state, action) => {
  switch (action.type) {
    case "UNIT":
      return {
        ...state,
        satuan: action.payload,
      };
    case "ROLL":
      return {
        ...state,
        isRoll: action.payload,
      };
    case "DATE":
      return {
        ...state,
        tanggalProses: action.payload,
      };
    case "DEADLINE_DATE": {
      return {
        ...state,
        tanggalProsesDeadline: new Date(action.payload),
      };
    }
    case "COUNTER":
      return {
        ...state,
        splitCounter: action.payload,
      };
    case "CHANGES": {
      const { name, value } = action.payload;
      return {
        ...state,
        [name]: value,
      };
    }
  }
};

/**
 *
 *
 * @export
 * @param {*} {
 *   isDetail,
 *   isEdit,
 *   activeCId,
 *   itemInfo,
 *   onChange,
 *   onEdit,
 *   onCancel,
 *   onSubmit,
 *   isAddSelesai,
 * }
 * @return {*}
 */
export default function ItemProsesForm({
  isDetail,
  isEdit,
  activeCId,
  itemInfo,
  onChange,
  onEdit,
  onCancel,
  onSubmit,
  isAddSelesai,
  isSJEdit,
}) {
  const currentCollection = "items";
  const deleteCollection = "deletedItems";

  const { updateDocument } = useFirestore(currentCollection, activeCId);

  const { queueSet, queueUpdate, queueDelete, queueCommit } =
    useBatchWrite(activeCId);

  const { document: currentDoc } = useDoc(currentCollection, itemInfo?.id, activeCId);

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
    if (!isDetail && itemInfo.tanggalProses > itemInfo.tanggalProsesDeadline) {
      const newDeadlineDate = new Date(itemInfo.tanggalProses);

      newDeadlineDate.setHours(23, 59, 0, 0);
      dispatch({ type: "DEADLINE_DATE", payload: newDeadlineDate });
    }
  }, [
    itemInfo.tanggalProses,
    itemInfo.tanggalProsesDeadline,
    isEdit,
    isDetail,
  ]);

  // DOCUMENT SPLIT COUNTER

  useEffect(() => {
    if (!isDetail && !isEdit && currentDoc?.splitCounter !== undefined) {
      const counter = (currentDoc?.splitCounter ?? 0) + 1;

      dispatch({ type: "COUNTER", payload: counter });
    }
  }, [isDetail, isEdit, currentDoc?.splitCounter]);

  // FIREBASE INTERACTION

  const handleUpdateItem = async () => {
    setIsPending(true);
    setIsSubmitted(false);

    const jumlah = parseInt(itemInfo.jumlah);
    const jumlahProses = parseInt(itemInfo.jumlahProses);
    try {
      if (jumlah < jumlahProses) {
        throw new Error("Jumlah Proses melebihi jumlah stok");
      } else if (jumlah > jumlahProses) {
        const leftValue = jumlah - jumlahProses;
        const itemProses = {
          ...itemInfo,
          itemStatus: "proses",
          jumlah: jumlahProses,
          jumlahProses,
        };
        const itemMasuk = {
          ...currentDoc,
          jumlah: leftValue,
          itemStatus: "masuk",
          jumlahProses: "",
          splitCounter: itemInfo.splitCounter,
        };
        // const oldItem = {
        //   ...currentDoc,
        //   jumlah,
        //   jumlahProses: null,
        //   splitCounter: itemInfo.splitCounter - 1,
        // };

        const newId = itemInfo.id + "-" + itemInfo.splitCounter;

        queueSet(currentCollection, newId, itemProses);

        queueUpdate(currentCollection, itemInfo.id, itemMasuk);

        const { success, error } = await queueCommit();

        if (error) {
          console.log(error);
          throw new Error(error);
        }
        if (success) {
          onSubmit();
        }
      } else {
        const itemProses = { ...itemInfo, itemStatus: "proses" };
        const { error, success } = await updateDocument(
          itemInfo.id,
          itemProses,
        );
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
        {!isDetail && !isAddSelesai && (
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
          </div>
        )}

        {!isPending && !isSubmitted && (
          <DateCol
            label="Tanggal Proses"
            value={itemInfo.tanggalProses}
            onChange={(opt) => dispatch({ type: "DATE", payload: opt })}
            isReadOnly={(isDetail || isEdit) && isDateReadOnly}
            startDate={itemInfo.tanggalMasuk}
          >
            {isEdit && !isAddSelesai && (
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
            label="Tanggal Proses"
            name="load"
            value="Loading..."
            isReadOnly
          />
        )}
        {!isPending && isSubmitted && (
          <Col
            label="Tanggal Proses"
            name="submit"
            value="Submitted :)"
            isReadOnly
          />
        )}

        <DateCol
          label="Tanggal Deadline Proses"
          value={itemInfo.tanggalProsesDeadline}
          onChange={(opt) => dispatch({ type: "DEADLINE_DATE", payload: opt })}
          isReadOnly={isDetail || isAddSelesai}
          startDate={itemInfo.tanggalProses}
        />

        <UnitCol
          type="number"
          label={`Jumlah Proses (max. ${itemInfo.jumlah + " " + itemInfo.satuan.value})`}
          name="jumlahProses"
          value={itemInfo.jumlahProses}
          satuan={itemInfo.satuan.value}
          onChange={(e) => dispatch({ type: "CHANGES", payload: e.target })}
          isReadOnly={isDetail || isAddSelesai}
        />
        {parseInt(itemInfo.jumlahProses) > parseInt(itemInfo.jumlah) && (
          <Col
            label="Error:"
            style="bg-red-300"
            value="Jumlah melebihi stok"
            isRequired={false}
          ></Col>
        )}
      </div>
      {!isAddSelesai && !isSJEdit && (
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
                className={`${parseInt(itemInfo.jumlahProses) > parseInt(itemInfo.jumlah) ? "bg-blue-100 cursot-not-allowed hover:bg-blue-300" : "bg-blue-500 cursor-pointer hover:bg-blue-700"} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
              >
                Ubah Data
              </button>
            </>
          )}
          {!isEdit && !isDetail && (
            <button
              type="submit"
              value="UPDATE"
              className={`${parseInt(itemInfo.jumlahProses) > parseInt(itemInfo.jumlah) ? "bg-blue-100 cursot-not-allowed hover:bg-blue-300" : "bg-blue-500 cursor-pointer hover:bg-blue-700"} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
            >
              Proses Item
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
