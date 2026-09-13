import { useState, useReducer, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useFirestore } from "../../../hooks/useFirestore";

import Col from "../../../components/Form/Col";
import DateCol from "../../../components/Form/DateCol";
import SelectCol from "../../../components/Form/SelectCol";
import UnitCol from "../../../components/Form/UnitCol";
import { useCollection } from "../../../hooks/useCollection";
import { ArrowDown } from "lucide-react";
import { useBatchWrite } from "../../../hooks/useBatchWrite";

const itemReducer = (state, action) => {
  switch (action.type) {
    case "DATE":
      return {
        ...state,
        tanggalSJ: action.payload,
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

export default function ItemSJForm({
  activeCId,
  itemInfo,
  onChange,
  isSJEdit,
}) {
  const currentCollection = "items";
  const navigate = useNavigate();

  const { updateDocument } = useFirestore(currentCollection, activeCId);
  const { queueUpdate, queueCommit } = useBatchWrite(activeCId);

  // SYNCING CHANGES

  const [itemState, dispatch] = useReducer(itemReducer, itemInfo);
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDateReadOnly, setIsDateReadOnly] = useState(true);
  const [selectedSJ, setSelectedSJ] = useState(null);

  useEffect(() => {
    onChange(itemState);
  }, [onChange, itemState]);

  // SJ List
  const SJCollection = "SJ";

  const whereClause = useMemo(
    () => ["kodeKlien", "==", itemInfo?.kodeKlien],
    [itemInfo.kodeKlien],
  );
  const secondWhere = useMemo(() => ["tanggalSJ", "!=", null], []);
  const thirdWhere = useMemo(() => ["statusFaktur", "==", false], []);
  const order = useMemo(() => ["id", "asc"], []);
  const secondOrder = useMemo(() => ["tanggalSJ", "asc"], []);
  const { documents: sj } = useCollection(
    SJCollection,
    activeCId,
    order,
    whereClause,
    secondOrder,
    secondWhere,
    thirdWhere,
  );

  let sjList = [];

  sj &&
    sj.map((i) => {
      sjList.push({ label: i.id, value: i });
    });

  // FIREBASE INTERACTION

  const handleUpdateItemNewSJ = async () => {
    setIsPending(true);
    setIsSubmitted(false);

    try {
      const itemSJ = { ...itemInfo };
      const { error, success } = await updateDocument(itemSJ.id, itemSJ);
      if (success && !error) {
        setIsPending(false);
        setIsSubmitted(true);
        navigate(`/sj/add?item=${itemSJ.id}`);
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

  const handleUpdateItemExistingSJ = async () => {
    setIsPending(true);
    setIsSubmitted(false);

    try {
      const itemSJ = {
        ...itemInfo,
        statusSJ: true,
        tanggalSJ: itemInfo.tanggalSJ,
        SJid: selectedSJ.label,
      };

      queueUpdate(currentCollection, itemInfo.id, itemSJ);
      queueUpdate(SJCollection, selectedSJ.label, {
        ...selectedSJ.value,
        items: [
          ...selectedSJ.value.items,
          {
            label: `${itemSJ.id} (${itemSJ.namaBarang} - ${itemSJ.jumlahFinal} ${itemSJ.satuan.value})`,
            value: itemSJ,
          },
        ],
        jumlahItem: selectedSJ.value.jumlahItem + 1,
      });

      const { error, success } = await queueCommit();
      if (success && !error) {
        setIsPending(false);
        setIsSubmitted(true);
        navigate(`/sj/view?type=list&&id=${selectedSJ.label}`);
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    const type = e.nativeEvent.submitter.value;

    switch (type) {
      case "NEW":
        await handleUpdateItemNewSJ();
        break;
      case "EXISTING":
        await handleUpdateItemExistingSJ();
        break;
      default:
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-1">
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
            Jumlah Final: {itemInfo.jumlahFinal + " " + itemInfo.satuan.value}
          </span>
          <span className="mx-2 mb-1 text-sm">
            Jumlah Susut:{" "}
            {itemInfo.jumlahSusut +
              " " +
              itemInfo.satuan.value +
              " dari " +
              itemInfo.jumlahProses +
              " " +
              itemInfo.satuan.value}
          </span>
          <span className="mx-2 mb-1 text-sm">
            Apakah per-roll: {itemInfo.isRoll.label}
          </span>
        </div>

        {!isPending && !isSubmitted && (
          <DateCol
            isTwoCol
            label="Tanggal Surat Jalan"
            value={getFirebaseDate(itemInfo.tanggalSJ)}
            onChange={(opt) => dispatch({ type: "DATE", payload: opt })}
            isReadOnly={isSJEdit && isDateReadOnly}
            startDate={getFirebaseDate(itemInfo.tanggalSiapKirim)}
          >
            {isSJEdit && (
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
            isTwoCol
            label="Tanggal Siap Kirim"
            name="load"
            value="Loading..."
            isReadOnly
          />
        )}
        {!isPending && isSubmitted && (
          <Col
            isTwoCol
            label="Tanggal Siap Kirim"
            name="submit"
            value="Submitted :)"
            isReadOnly
          />
        )}
        {itemInfo.isRoll.value && (
          <UnitCol
            label="Jumlah Roll"
            name="jumlahRoll"
            value={itemInfo.jumlahRoll}
            onChange={(e) => dispatch({ type: "CHANGES", payload: e.target })}
            satuan="roll"
          />
        )}
        <Col
          isTwoCol={!itemInfo.isRoll.value}
          label="Keterangan"
          name="keterangan"
          value={itemInfo.keterangan}
          onChange={(e) => dispatch({ type: "CHANGES", payload: e.target })}
          isRequired={false}
        />
      </div>

      {!isSJEdit && (
        <div
          className={`${sjList.filter((surat) => surat.value.type === "list").length > 0 ? "bg-slate-300" : ""} w-[80%] mx-auto p-3 rounded-xl`}
        >
          {sjList.filter((surat) => surat.value.type === "list").length > 0 && (
            <SelectCol
              label="Masukkan ke Surat Jalan yang sudah ada"
              name="suratJalan"
              value={selectedSJ}
              onChange={(opt) => {
                setSelectedSJ(opt);
                dispatch({
                  type: "DATE",
                  payload: opt?.value?.tanggalSJ,
                });
                if (!opt) {
                  dispatch({
                    type: "DATE",
                    payload: new Date(),
                  });
                }
              }}
              data={sjList.filter((surat) => surat.value.type === "list")}
              isClearable
            />
          )}
          {selectedSJ && (
            <div className="flex flex-col gap-1 mb-3 bg-slate-100 rounded-xl p-2">
              <span className="mx-2 mb-1 text-sm">
                Kendaraan: {selectedSJ.value.jenisKendaraan}
              </span>
              <span className="mx-2 mb-1 text-sm">
                No. Pol: {selectedSJ.value.noPol}
              </span>
              <span className="mx-2 mb-1 text-sm">
                Jumlah Item saat ini: {selectedSJ.value.jumlahItem} item
              </span>
            </div>
          )}
          <div className="flex justify-center gap-4 mb-4">
            {selectedSJ ? (
              <button
                type="submit"
                value="EXISTING"
                className="bg-blue-500 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                Masukkan ke Surat Jalan
              </button>
            ) : (
              <div className="flex flex-col items-center text-sm">
                {sjList.filter((surat) => surat.value.type === "list").length >
                  0 && <p>atau Buat Baru? </p>}
                {sjList.filter((surat) => surat.value.type === "list").length >
                  0 && <ArrowDown className="h-4 mb-2" />}
                <button
                  type="submit"
                  value="NEW"
                  className="bg-blue-500 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
                >
                  Buat Surat Jalan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
