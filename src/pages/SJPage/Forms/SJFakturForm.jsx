import { useNavigate } from "react-router-dom";
import { useState, useReducer, useMemo } from "react";

import { useBatchWrite } from "../../../hooks/useBatchWrite";

import Col from "../../../components/Form/Col";
import DateCol from "../../../components/Form/DateCol";
import SelectCol from "../../../components/Form/SelectCol";

import { useCollection } from "../../../hooks/useCollection";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { ArrowDown } from "lucide-react";

const formatRupiah = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  return new Intl.NumberFormat("id-ID").format(num);
};

const unformatRupiah = (str) => {
  const cleaned = str.replace(/[^\d]/g, "");
  return cleaned === "" ? "" : Number(cleaned);
};

const sjReducer = (state, action) => {
  switch (action.type) {
    case "DATE":
      return {
        ...state,
        tanggalFaktur: action.payload,
      };
    case "UPDATE_HARGA_ITEM_SJ": {
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.value.id !== action.payload.itemId) return item;

          return {
            ...item,
            value: {
              ...item.value,
              hargaSatuan: action.payload.value,
              hargaTotal: item.value.jumlahFinal * action.payload.value,
            },
          };
        }),
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

export default function SJFakturForm({ activeCId, sjInfo }) {
  const { queueUpdate, queueCommit } = useBatchWrite(activeCId);

  const currentCollection = "SJ";
  const navigate = useNavigate();

  const [sjState, dispatch] = useReducer(sjReducer, sjInfo);
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedFaktur, setSelectedFaktur] = useState(null);

  const fakturCollection = "faktur";

  const whereClause = useMemo(
    () => ["kodeKlien", "==", sjInfo?.klien.value?.id],
    [sjInfo.klien.value.id],
  );
  const secondWhere = useMemo(() => ["tanggalFaktur", "!=", null], []);
  const thirdWhere = useMemo(() => ["statusFinal", "==", false], []);
  const order = useMemo(() => ["id", "asc"], []);
  const secondOrder = useMemo(() => ["tanggalFaktur", "asc"], []);
  const { documents: faktur } = useCollection(
    fakturCollection,
    activeCId,
    order,
    whereClause,
    secondOrder,
    secondWhere,
    thirdWhere,
  );

  let fakturList = [];

  faktur &&
    faktur.map((f) => {
      fakturList.push({ label: f.id, value: f });
    });

  const itemCollection = "items";

  const onSelectedSJItemChange = async (itemId, value) => {
    await dispatch({
      type: "UPDATE_HARGA_ITEM_SJ",
      payload: { itemId, value },
    });
  };

  const handleUpdateSjNewFaktur = async () => {
    setIsPending(true);
    setIsSubmitted(false);

    try {
      const sjFaktur = { ...sjState };

      queueUpdate(currentCollection, sjState.id, sjFaktur);
      sjState.items.forEach((item) => {
        if (sjState.type === "list") {
          queueUpdate(itemCollection, item.value.id, item.value);
        }
      });

      const { error, success } = await queueCommit();
      if (success && !error) {
        setIsPending(false);
        setIsSubmitted(true);
        navigate(`/faktur/add?sj=${sjFaktur.id}`);
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

  const handleUpdateSjExistingFaktur = async () => {
    setIsPending(true);
    setIsSubmitted(false);

    try {
      const sjFaktur = {
        ...sjState,
        statusFaktur: true,
        tanggalFaktur: sjState.tanggalFaktur,
        fakturId: selectedFaktur.label,
      };
      queueUpdate(currentCollection, sjState.id, sjFaktur);
      sjState.items.forEach((item) => {
        if (sjState.type === "list") {
          queueUpdate(itemCollection, item.value.id, item.value);
        }
      });
      queueUpdate(fakturCollection, selectedFaktur.label, {
        ...selectedFaktur.value,
        SJ: [
          ...selectedFaktur.value.SJ,
          {
            label: `${sjFaktur.id} (${sjFaktur.jumlahItem} item - ${sjFaktur.noPol})`,
            value: sjFaktur,
          },
        ],
        jumlahSJ: selectedFaktur.value.jumlahSJ + 1,
        total:
          selectedFaktur.value.total +
          sjState.items.reduce((itemSum, item) => {
            return itemSum + (item.value.hargaTotal || 0);
          }, 0),
      });
      const { success, error } = await queueCommit();
      if (success && !error) {
        setIsPending(false);
        setIsSubmitted(true);
        navigate(`/faktur/view?id=${selectedFaktur.label}`);
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
        await handleUpdateSjNewFaktur();
        break;
      case "EXISTING":
        await handleUpdateSjExistingFaktur();
        break;
      default:
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-1">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 bg-slate-100 p-2 rounded-xl">
          <span className="mx-2 mb-1 text-sm">No. SJ: {sjState.id}</span>
          <span className="mx-2 mb-1 text-sm">
            Klien: {sjState.klien.value?.namaKlien}
          </span>
          <span className="mx-2 mb-1 text-sm">
            Alamat: {sjState.klien.value?.alamatKlien}
          </span>
          <span className="mx-2 mb-1 text-sm">
            Jumlah Item: {sjState.jumlahItem} item
          </span>
          <span className="mx-2 mb-1 text-sm">
            Kendaraan: {sjState.jenisKendaraan}
          </span>
          <span className="mx-2 mb-1 text-sm">No. Pol: {sjState.noPol}</span>
        </div>
        {!isPending && !isSubmitted && (
          <DateCol
            isTwoCol
            label="Tanggal Faktur"
            value={getFirebaseDate(sjState.tanggalFaktur)}
            onChange={(opt) => dispatch({ type: "DATE", payload: opt })}
            startDate={sjState.tanggalSJ}
          />
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
        {sjState.items.map((i) => (
          <div
            key={i.value.id}
            className="w-[95%] bg-white py-2 px-4 rounded-xl my-5 mx-auto"
          >
            <span className="italic font-semibold block">{i.value.id}</span>
            <span className="text-sm flex items-center gap-1">
              {i.value.namaBarang} (
              <span className="font-semibold">
                {i.value.jumlahProses} {i.value.satuan?.value}
              </span>
              <ArrowRightIcon className="h-3" />
              {i.value.jumlahFinal} {i.value.satuan?.value})
            </span>
            <Col
              label={`Harga per-${i.value.satuan?.value}`}
              name="hargaSatuan"
              value={formatRupiah(i.value.hargaSatuan)}
              onChange={(e) =>
                onSelectedSJItemChange(
                  i.value.id,
                  unformatRupiah(e.target.value),
                )
              }
            />
            <Col
              label="Harga Total"
              name="hargaTotal"
              value={`Rp.${formatRupiah(i.value.hargaTotal)}`}
              isReadOnly
            />
          </div>
        ))}
      </div>
      <div
        className={`${fakturList.length > 0 ? "bg-slate-300" : ""} w-lg mx-auto p-3 rounded-xl`}
      >
        {fakturList.length > 0 && (
          <SelectCol
            label="Masukkan ke Surat Jalan yang sudah ada"
            name="suratJalan"
            value={selectedFaktur}
            onChange={(opt) => {
              setSelectedFaktur(opt);
              dispatch({
                type: "DATE",
                payload: opt?.value?.tanggalFaktur,
              });
              if (!opt) {
                dispatch({
                  type: "DATE",
                  payload: new Date(),
                });
              }
            }}
            data={fakturList}
            isClearable
          />
        )}
        {selectedFaktur && (
          <div className="flex flex-col gap-1 mb-3 bg-slate-100 rounded-xl p-2">
            <span className="mx-2 mb-1 text-sm">
              Jumlah Surat saat ini: {selectedFaktur.value.jumlahSJ} surat
            </span>
          </div>
        )}
        <div className="flex justify-center gap-4 mb-4">
          {selectedFaktur ? (
            <button
              type="submit"
              value="EXISTING"
              className="bg-blue-500 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              Masukkan ke Faktur
            </button>
          ) : (
            <div className="flex flex-col items-center text-sm">
              {fakturList.length > 0 && <p>atau Buat Baru? </p>}
              {fakturList.length > 0 && <ArrowDown className="h-4 mb-2" />}
              <button
                type="submit"
                value="NEW"
                className="bg-blue-500 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
              >
                Buat Faktur
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
