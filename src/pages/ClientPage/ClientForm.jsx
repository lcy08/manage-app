import { useState, useEffectEvent, useEffect, useReducer } from "react";

import Col from "../../components/Form/Col";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";

import { useName } from "./useName";
import { useDoc } from "../../hooks/useDoc";
import { useBatchWrite } from "../../hooks/useBatchWrite";

const clientReducer = (state, action) => {
  switch (action.type) {
    case "SET_ID":
      return {
        ...state,
        id: action.payload,
      };
    case "SET_NAMEID": {
      return {
        ...state,
        nameId: action.payload,
      };
    }
    case "NULL_NAMEID":
      return {
        ...state,
        nameId: null,
      };
    case "CHANGES": {
      const name = action.payload.name;
      const value = action.payload.value;

      return {
        ...state,
        [name]: value,
      };
    }
  }
};

export default function ClientForm({
  isDetail,
  isEdit,
  activeCId,
  clientInfo,
  clientName,
  onChange,
  onEdit,
  onCancel,
  onSubmit,
}) {
  const currentCollection = "clients";
  const deleteCollection = "deletedClients";
  const countCollection = "clientCodeCount";

  const { queueSet, queueUpdate, queueDelete, queueCommit } = useBatchWrite(activeCId);

  const [clientState, dispatch] = useReducer(clientReducer, {
    ...clientInfo,
    nameId: null,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { getPrefix, getCode } = useName(activeCId);

  useEffect(() => {
    if (isDetail && clientInfo.namaKlien !== "") {
      dispatch({ type: "SET_NAMEID", payload: clientInfo.id.slice(2, 4) });
    }
  }, [clientInfo.namaKlien, clientInfo.id, isDetail]);

  const {
    document: codeData,
    // error_names
  } = useDoc(countCollection, clientState.nameId, activeCId);

  let nameList = codeData?.names;

  let codeCount = codeData?.count;

  useEffect(() => {
    onChange(clientState);
  }, [onChange, clientState]);

  const getTheCode = useEffectEvent((id, count) => {
    const code = getCode(id, count);
    return code;
  });

  useEffect(() => {
    if (!isDetail && !isEdit && clientState.nameId && codeData !== undefined) {
      const id = getTheCode(clientState.nameId, codeData?.count ?? 0);
      dispatch({ type: "SET_ID", payload: id });
    }
  }, [codeData, clientState.nameId, isDetail, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    dispatch({ type: "CHANGES", payload: e.target });

    if (name === "namaKlien") {
      if (!isEdit) {
        setNameError(null);
        dispatch({ type: "NULL_NAMEID" });
        dispatch({ type: "SET_NAMEID", payload: getPrefix(value) });

        if (nameList?.includes(value)) {
          setNameError("Nama sudah ada");
        } else {
          setNameError(null);
        }
      } else {
        if (clientName !== value) {
          setNameError(null);
          if (nameList?.includes(value)) {
            setNameError("Name sudah ada");
          } else {
            setNameError(null);
          }
        } else {
          setNameError("Nama sama seperti sebelumnya");
        }
      }
    }
  };

  const handleAddClient = async () => {
    setIsPending(true);
    setIsSubmitted(false);
    try {
      const { id, ...clientData } = clientState;
      if (codeData) {
        queueUpdate(countCollection, clientState.nameId, {
          count: (codeCount ?? 0) + 1,
          names: [...nameList, clientData.namaKlien],
        });
      } else {
        queueSet(countCollection, clientState.nameId, {
          count: (codeCount ?? 0) + 1,
          names: [clientData.namaKlien],
          companyId: activeCId
        });
      }
      queueSet(currentCollection, id, clientData);
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
      console.error("Error adding Client", error);
      alert(`Error: ${error.message}`);
      setError(error.message);
      setIsPending(false);
      setIsSubmitted(false);
    }
  };

  const handleUpdateClient = async () => {
    setIsPending(true);
    setIsSubmitted(false);
    try {
      const { id, ...clientData } = clientState;
      queueUpdate(currentCollection, id, clientData);

      const updatedNameList = nameList.filter((name) => name !== clientName);
      updatedNameList.push(clientData.namaKlien);

      queueUpdate(countCollection, id.slice(2, 4), {
        names: updatedNameList,
      });

      const { error, success } = await queueCommit();

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
      setError(error.message);
      setIsPending(false);
      setIsSubmitted(false);
    }
  };

  const handleDeleteClient = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (clientInfo) => {
    setIsPending(true);
    setIsSubmitted(false);
    try {
      const { id, ...clientData } = clientState;

      queueSet(deleteCollection, id, clientData, true);

      const updatedNameList = nameList.filter(
        (name) => name !== clientInfo.namaKlien,
      );

      queueDelete(currentCollection, id);
      queueUpdate(countCollection, id.slice(2, 4), {
        names: updatedNameList,
      });

      const { success, error } = await queueCommit();
      if (success) {
        setIsPending(false);
        setIsSubmitted(true);
        setShowDeleteModal(false);
        onSubmit();
      }
      if (error) {
        setShowDeleteModal(false);
        setIsPending(false);
        setIsSubmitted(false);
        throw new Error("Error moving to deleted folder");
      }
    } catch (error) {
      console.error("Delete error: ", error);
      alert(`Error ${error.message}`);
      setError(error.message);
      setIsPending(false);
      setIsSubmitted(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const type = e.nativeEvent.submitter.value;

    switch (type) {
      case "ADD":
        await handleAddClient();
        break
      case "UPDATE":
        await handleUpdateClient();
        break
      case "DELETE":
        await handleDeleteClient()
        break
      default:
        break
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mb-6">
        {!isPending && !isSubmitted && (
          <Col
            label="Kode Klien"
            name="id"
            value={clientState.id}
            onChange={handleChange}
            isReadOnly
          />
        )}
        {isPending && !isSubmitted && (
          <Col label="Kode Klien" name="load" value="Loading..." isReadOnly />
        )}
        {!isPending && isSubmitted && (
          <Col
            label="Kode Klien"
            name="submit"
            value="Submitted :)"
            isReadOnly
          />
        )}
        <Col
          label="Nama Klien"
          name="namaKlien"
          value={clientState.namaKlien}
          onChange={handleChange}
          isReadOnly={isDetail}
        >
          {nameError ? <p className="error text-xs">{nameError}</p> : ""}
        </Col>
        <Col
          isTwoCol={true}
          label="Alamat Klien"
          name="alamatKlien"
          value={clientState.alamatKlien}
          onChange={handleChange}
          isReadOnly={isDetail}
        />
      </div>
      {error && <p className="error">{error}</p>}
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
              className="bg-red-500 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer"
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
                setNameError(null);
              }}
              className="bg-gray-300 hover:bg-gray-500 text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              value="UPDATE"
              className={`${nameError ? "bg-blue-200 cursor-not-allowed hover:bg-blue-300" : "bg-blue-500 cursor-pointer hover:bg-blue-700"}  text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
              disabled={nameError}
            >
              Ubah Data
            </button>
          </>
        )}
        {!isEdit && !isDetail && (
          <button
            type="submit"
            value="ADD"
            className={`${nameError ? "bg-blue-200 cursor-not-allowed hover:bg-blue-300" : "bg-blue-500 cursor-pointer hover:bg-blue-700"}  text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
            disabled={nameError}
          >
            Tambahkan Klien
          </button>
        )}
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleConfirmDelete(clientInfo)}
        title="Penghapusan Klien"
        message={`Hapus klien dengan data berikut?`}
        confirmText="Hapus dan Pindahkan ke Folder Terhapus"
        cancelText="Batal"
      >
        <div className="p-4 m-3 text-left">
          <p>Kode: {clientInfo.id}</p>
          <p>Nama: {clientInfo.namaKlien}</p>
          <p>Alamat: {clientInfo.alamatKlien}</p>
        </div>
      </ConfirmationModal>
    </form>
  );
}
