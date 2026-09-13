import { useState, useEffect, useReducer, useMemo } from "react";

import Col from "../../../components/Form/Col";
import SelectCol from "../../../components/Form/SelectCol";
import DateCol from "../../../components/Form/DateCol";
import ConfirmationModal from "../../../components/Modal/ConfirmationModal";

import { useCollection } from "../../../hooks/useCollection";
import { useFirestore } from "../../../hooks/useFirestore";
import { useDoc } from "../../../hooks/useDoc";
import { useBatchWrite } from "../../../hooks/useBatchWrite";

const itemReducer = (state, action) => {
  switch (action.type) {
    case "ID":
      return {
        ...state,
        id: action.payload.id,
        dateCode: action.payload.dateCode,
        counter: action.payload.counter,
      };
    case "CLIENT":
      return {
        ...state,
        klien: action.payload,
        kodeKlien: action.payload.value.id,
      };
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
        tanggalMasuk: action.payload,
      };
    case "DEADLINE_DATE": {
      return {
        ...state,
        tanggalMasukDeadline: new Date(action.payload),
      };
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

const unit = [
  { label: "Kg", value: "kg" },
  { label: "Ton", value: "ton" },
  { label: "Liter", value: "liter" },
  { label: "Pcs", value: "pcs" },
  { label: "Dus", value: "dus" },
  { label: "Unit", value: "unit" },
  { label: "Paket", value: "paket" },
];

const trueFalse = [
  { label: "No", value: false },
  { label: "Yes", value: true },
];

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
 *   isAddProses,
 * }
 * @return {*}
 */
export default function ItemMasukForm({
  isDetail,
  isEdit,
  activeCId,
  itemInfo,
  onChange,
  onEdit,
  onCancel,
  onSubmit,
  isAddProses,
  isSJEdit,
}) {
  const currentCollection = "items";
  const deleteCollection = "deletedItems";
  const clientCollection = "clients";
  const countCollection = "itemClientCount";

  const { updateDocument } = useFirestore(currentCollection, activeCId);
  const { queueSet, queueUpdate, queueDelete, queueCommit } =
    useBatchWrite(activeCId);

  // Data INIT
  const order = useMemo(() => ["namaKlien", "asc"], []);
  const { documents: clients } = useCollection(
    clientCollection,
    activeCId,
    order,
  );
  let clientList = [];

  clients &&
    clients.map((client) => {
      clientList.push({ label: client.namaKlien, value: client });
    });

  const clientId = itemInfo?.klien?.value?.id;
  const { document: itemCount } = useDoc(countCollection, clientId, activeCId);

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
    if (!isDetail && itemInfo?.tanggalMasuk > itemInfo?.tanggalMasukDeadline) {
      const newDeadlineDate = new Date(itemInfo?.tanggalMasuk);

      newDeadlineDate.setHours(23, 59, 0, 0);
      dispatch({ type: "DEADLINE_DATE", payload: newDeadlineDate });
    }
  }, [
    itemInfo?.tanggalMasuk,
    itemInfo?.tanggalMasukDeadline,
    isEdit,
    isDetail,
  ]);

  // CODE GENERATING FOR ITEM

  const getDateDetail = (date) => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return { day, month, year };
  };

  useEffect(() => {
    if (
      !isDetail &&
      !isEdit &&
      itemInfo?.klien?.value?.id &&
      itemCount !== undefined
    ) {
      const { day, month, year } = getDateDetail(itemInfo?.tanggalMasuk);

      const dateCode = year.slice(2, 4) + month + day;

      const counter = (itemCount ? (itemCount[dateCode] ?? 0) : 0) + 1;

      const count = counter.toString().padStart(3, "0");

      const id = "I" + clientId + dateCode + count;

      // FIXED: useReducer can be used as an alternative to synchronously using setState
      dispatch({ type: "ID", payload: { id, dateCode, counter } });
    }
  }, [
    clientId,
    itemCount,
    itemInfo?.klien?.value?.id,
    itemInfo?.tanggalMasuk,
    isEdit,
    isDetail,
  ]);

  // FIREBASE INTERACTION

  const handleAddItem = async () => {
    setIsPending(true);
    setIsSubmitted(false);
    try {
      const { id, dateCode, counter, ...itemData } = itemState;
      if (itemCount) {
        queueUpdate(countCollection, itemState.klien?.value.id, {
          [dateCode]: counter,
        });
      } else {
        queueSet(countCollection, itemState.klien?.value.id, {
          [dateCode]: counter,
          companyId: activeCId
        });
      }
      queueSet(currentCollection, id, itemData);
      const { success, error } = await queueCommit();

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

  const handleUpdateItem = async () => {
    setIsPending(true);
    setIsSubmitted(false);
    try {
      const { id, ...itemData } = itemState;
      const { error, success } = await updateDocument(id, itemData);

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
      console.error("Error updating Client", error);
      alert(`Error: ${error.message}`);
      setIsPending(false);
      setIsSubmitted(false);
    }
  };

  const handleDeleteItem = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsPending(true);
    setIsSubmitted(false);
    try {
      const { id, ...itemData } = itemState;

      queueSet(deleteCollection, id, itemData, true);
      queueDelete(currentCollection, id);

      const { error, success } = await queueCommit();
      if (success && !error) {
        setIsPending(false);
        setIsSubmitted(true);
        setShowDeleteModal(false);
        onSubmit();
      }
      if (error) {
        setShowDeleteModal(false);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Delete error: ", error);
      alert(`Error ${error.message}`);
      setIsPending(false);
      setIsSubmitted(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const type = e.nativeEvent.submitter.value;

    switch (type) {
      case "ADD":
        await handleAddItem();
        break;
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
        {!isPending && !isSubmitted && (
          <Col
            isTwoCol
            label="ID Barang"
            name="id"
            value={itemInfo?.id}
            isReadOnly
          />
        )}
        {isPending && !isSubmitted && (
          <Col
            isTwoCol
            label="ID Barang"
            name="load"
            value="Loading..."
            isReadOnly
          />
        )}
        {!isPending && isSubmitted && (
          <Col
            isTwoCol
            label="ID Barang"
            name="submit"
            value="Submitted :)"
            isReadOnly
          />
        )}
        {!isPending && !isSubmitted && (
          <DateCol
            label="Tanggal Masuk"
            value={itemInfo?.tanggalMasuk}
            onChange={(opt) => dispatch({ type: "DATE", payload: opt })}
            isReadOnly={((isDetail || isEdit) && isDateReadOnly) || isAddProses}
            endDate={new Date()}
          >
            {isEdit && !isAddProses && (
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
            label="Tanggal Masuk"
            name="load"
            value="Loading..."
            isReadOnly
          />
        )}
        {!isPending && isSubmitted && (
          <Col
            label="Tanggal Masuk"
            name="submit"
            value="Submitted :)"
            isReadOnly
          />
        )}

        <DateCol
          label="Tanggal Deadline ke Proses"
          value={itemInfo?.tanggalMasukDeadline}
          onChange={(opt) => dispatch({ type: "DEADLINE_DATE", payload: opt })}
          isReadOnly={isDetail || isAddProses}
          startDate={itemInfo?.tanggalMasuk}
        />

        <Col
          isTwoCol
          label="Nama Barang"
          name="namaBarang"
          value={itemInfo?.namaBarang}
          onChange={(e) => dispatch({ type: "CHANGES", payload: e.target })}
          isReadOnly={isDetail || isAddProses}
        />

        <SelectCol
          label="Klien"
          name="klien"
          value={itemInfo?.klien}
          onChange={(opt) => dispatch({ type: "CLIENT", payload: opt })}
          data={clientList}
          isReadOnly={isDetail || isEdit}
        />

        <Col
          label="Alamat Klien"
          name="alamatKlien"
          value={itemInfo?.klien?.value?.alamatKlien}
          isReadOnly
        />

        <Col
          type="number"
          label="Jumlah"
          name="jumlah"
          value={itemInfo?.jumlah}
          onChange={(e) => dispatch({ type: "CHANGES", payload: e.target })}
          isReadOnly={isDetail || isAddProses}
        />

        <SelectCol
          label="Satuan"
          name="satuan"
          value={itemInfo?.satuan}
          onChange={(opt) => dispatch({ type: "UNIT", payload: opt })}
          data={unit}
          isReadOnly={isDetail || isAddProses}
        />

        <SelectCol
          label="Apakah per-roll"
          name="isRoll"
          value={itemInfo?.isRoll}
          onChange={(opt) => dispatch({ type: "ROLL", payload: opt })}
          data={trueFalse}
          isReadOnly={isDetail || isAddProses}
        />
      </div>
      {!isAddProses && !isSJEdit && (
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
                className="bg-blue-500 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                Ubah Data
              </button>
            </>
          )}
          {!isEdit && !isDetail && (
            <button
              type="submit"
              value="ADD"
              className={`${itemInfo.kodeKlien === "" || itemInfo.satuan.value === "" || itemInfo.isRoll.value === "" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
              disabled={
                itemInfo.kodeKlien === "" ||
                itemInfo.satuan.value === "" ||
                itemInfo.isRoll.value === ""
              }
            >
              Tambahkan Item
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
          <p>Kode: {itemInfo?.id}</p>
          <p>Nama Barang: {itemInfo?.namaBarang}</p>
          <p>Klien: {itemInfo?.klien?.value?.namaKlien}</p>
        </div>
      </ConfirmationModal>
    </form>
  );
}
