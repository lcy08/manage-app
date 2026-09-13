import { useState, useMemo, useReducer, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWindowSize } from "@uidotdev/usehooks";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

import { useAuthContext } from "../../../hooks/useAuthContext";

import { useDoc } from "../../../hooks/useDoc";
import { useCollection } from "../../../hooks/useCollection";

import SJPrint from "../Details/SJPrint";
import Col from "../../../components/Form/Col";
import SelectCol from "../../../components/Form/SelectCol";
import UnitCol from "../../../components/Form/UnitCol";
import DateCol from "../../../components/Form/DateCol";

import { ArrowLeft, SearchXIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import Modal from "../../../components/Modal/Modal";
import { useReactToPrint } from "react-to-print";
import { useBatchWrite } from "../../../hooks/useBatchWrite";

const width = window.innerWidth;

const initialScale = width < 1536 ? 0.9 : 1.2;

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="tools flex gap-2 justify-center">
      <button
        className="py-2 px-1 bg-blue-300 rounded-full cursor-zoom-in"
        type="button"
        onClick={() => zoomIn()}
      >
        <ZoomInIcon className="h-4" />
      </button>
      <button
        className="py-2 px-1 bg-blue-300 rounded-full cursor-zoom-out"
        type="button"
        onClick={() => zoomOut()}
      >
        <ZoomOutIcon className="h-4" />
      </button>
      <button
        className="py-2 px-1 bg-blue-300 rounded-full cursor-pointer"
        type="button"
        onClick={() => {
          resetTransform();
        }}
      >
        <SearchXIcon className="h-4" />
      </button>
    </div>
  );
};

// SECTION: Reducer Function
const SJReducer = (state, action) => {
  switch (action.type) {
    case "ID":
      return {
        ...state,
        id: action.payload.id,
        dateCode: action.payload.dateCode,
        counter: action.payload.counter,
      };
    case "DATE":
      return {
        ...state,
        tanggalSJ: action.payload,
      };
    case "COMPANY":
      return {
        ...state,
        company: action.payload,
      };
    case "CLIENT":
      return {
        ...state,
        klien: action.payload,
        kodeKlien: action.payload.value.id,
        namaKlien: action.payload.label,
        items: [],
      };
    case "VEHICLE_KIND":
      return {
        ...state,
        jenisKendaraan: action.payload,
      };
    case "VEHICLE_NUMBER": {
      const upper = action.payload.toUpperCase();
      if (upper.length >= 12) {
        return { ...state };
      }
      return {
        ...state,
        noPol: upper,
      };
    }
    case "SELECT_ITEM":
      return {
        ...state,
        jumlahItem: action.payload.length,
        items: action.payload,
      };
    case "UPDATE_SELECT_ITEM": {
      const { name, value } = action.payload.target;
      const updatedItems = [...state.items];
      updatedItems.map((i) => {
        if (i.value.id === action.payload.id) {
          i.value = { ...i.value, [name]: value };
        }
      });
      return {
        ...state,
        items: updatedItems,
      };
    }
    case "ADD_ITEMS": {
      const updatedItems = [...state.items, action.payload];
      const length = updatedItems?.length;
      return {
        ...state,
        jumlahItem: length,
        items: updatedItems,
      };
    }
    case "UPDATE_ITEM": {
      const { name, value } = action.payload.target;
      const updatedItems = [...state.items];
      updatedItems[action.payload.index] = {
        value: {
          ...updatedItems[action.payload.index].value,
          [name]: value,
          id: action.payload.index + 1,
        },
      };
      return {
        ...state,
        items: updatedItems,
      };
    }
    case "UPDATE_ITEM_UNIT": {
      const { i, opt } = action.payload;
      const updatedItems = [...state.items];
      updatedItems[i] = {
        value: {
          ...updatedItems[i].value,
          satuan: opt,
        },
      };
      return {
        ...state,
        items: updatedItems,
      };
    }
    case "UPDATE_ROLL_ITEM": {
      const { i, opt } = action.payload;
      const updatedItems = [...state.items];
      updatedItems[i] = {
        value: {
          ...updatedItems[i].value,
          isRoll: opt,
        },
      };
      return {
        ...state,
        items: updatedItems,
      };
    }
    case "DELETE_ITEM": {
      const updatedItems = state.items.filter((i) => i !== action.payload);
      const length = updatedItems?.length;
      return {
        ...state,
        items: updatedItems,
        jumlahItem: length,
      };
    }
    case "CHANGE_MODE":
      return {
        ...state,
        type: action.payload,
        items: [],
      };
  }
};
// !SECTION

// SECTION: Select Option
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
// !SECTION

export default function SJForm() {
  // SECTION: important variable
  const { activeCId } = useAuthContext();
  const [searchParams] = useSearchParams();

  const [showPreview, setShowPreview] = useState(false);

  const currentCollection = "SJ";
  const navigate = useNavigate();

  const initialSJInfo = useMemo(
    () => ({
      id: "",
      type: "list",
      tanggalSJ: new Date(),
      company: {
        id: "",
        name: "",
        address: "",
        logo: "",
      },
      kodeKlien: "",
      namaKlien: "",
      klien: {
        label: "Select",
        value: {
          id: "",
          namaKlien: "",
          alamatKlien: "",
        },
      },
      jenisKendaraan: "",
      noPol: "",
      jumlahItem: 0,
      items: [],
      fakturId: null,
      statusFaktur: false,
      tanggalFaktur: null,
      companyId: activeCId,
    }),
    [activeCId],
  );

  const [sjState, dispatch] = useReducer(SJReducer, initialSJInfo);

  //!SECTION

  // SECTION: data fetching for select option
  const clientCollection = "clients";
  const itemCollection = "items";

  const { document } = useDoc("company", activeCId);
  useEffect(() => {
    if (document) {
      dispatch({
        type: "COMPANY",
        payload: {
          id: document.id,
          name: document.name,
          address: document.address,
          logo: document.logo,
        },
      });
    }
  }, [document]);

  const orderClient = useMemo(() => ["namaKlien", "asc"], []);
  const { documents: clients } = useCollection(
    clientCollection,
    activeCId,
    orderClient,
  );
  let clientList = [];

  clients &&
    clients.map((client) => {
      clientList.push({ label: client.namaKlien, value: client });
    });
  // Item List
  const whereClause = useMemo(
    () => ["kodeKlien", "==", sjState?.kodeKlien],
    [sjState.kodeKlien],
  );
  const secondWhere = useMemo(() => ["tanggalSiapKirim", "!=", null], []);
  const thirdWhere = useMemo(() => ["statusSJ", "==", false], []);
  const order = useMemo(() => ["id", "asc"], []);
  const secondOrder = useMemo(() => ["tanggalSiapKirim", "asc"], []);
  const { documents: items } = useCollection(
    itemCollection,
    activeCId,
    order,
    whereClause,
    secondOrder,
    secondWhere,
    thirdWhere,
  );

  let itemList = [];

  const [userMode, setUserMode] = useState("custom");

  const itemId = searchParams.get("item");
  const { document: itemInfo, reset } = useDoc(
    itemCollection,
    itemId,
    activeCId,
  );

  const selectedMode = itemInfo ? "list" : userMode;

  items &&
    selectedMode === "list" &&
    items.map((item) => {
      itemList.push({
        label: `${item.id} (${item.namaBarang} - ${item.jumlahFinal} ${item.satuan.value})`,
        value: item,
      });
    });

  useEffect(() => {
    if (!itemInfo) return;
    dispatch({
      type: "CLIENT",
      payload: itemInfo.klien,
    });
    dispatch({
      type: "SELECT_ITEM",
      payload: [
        {
          label: `${itemInfo.id} (${itemInfo.namaBarang} - ${itemInfo.jumlahFinal} ${itemInfo.satuan.value})`,
          value: itemInfo,
        },
      ],
    });
  }, [itemInfo]);

  //!SECTION
  // SECTION: CODE GENERATING FOR SJ
  const countCollection = "SJCount";

  const { queueSet, queueUpdate, queueCommit } = useBatchWrite(activeCId);

  const clientId = sjState.klien?.value?.id;
  const { document: SJCount } = useDoc(countCollection, clientId, activeCId);

  // TODO: refactor getDateDetail
  const getDateDetail = (date) => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return { day, month, year };
  };

  useEffect(() => {
    if (sjState.klien?.value?.id && SJCount !== undefined) {
      const { day, month, year } = getDateDetail(sjState.tanggalSJ);

      const dateCode = year.slice(2, 4) + month + day;

      const counter = (SJCount ? (SJCount[dateCode] ?? 0) : 0) + 1;

      const count = counter.toString().padStart(2, "0");

      const id = "SJ" + clientId + dateCode + count;

      // NOTE: FIXED: useReducer can be used as an alternative to synchronously using setState
      dispatch({ type: "ID", payload: { id, dateCode, counter } });
    }
  }, [clientId, SJCount, sjState.klien?.value?.id, sjState.tanggalSJ]);
  //!SECTION

  // SECTION: CHANGE INPUT OF ITEM DATA
  const onSelectedItemChange = (id, target) => {
    dispatch({ type: "UPDATE_SELECT_ITEM", payload: { id, target } });
  };
  // !SECTION

  // SECTION: ADD ITEMS
  const onAddItem = () => {
    dispatch({
      type: "ADD_ITEMS",
      payload: {
        value: {
          id: "=",
          namaBarang: "",
          jumlah: "",
          jumlahFinal: "",
          satuan: null,
          isRoll: { label: "No", value: false },
          roll: "",
          hargaSatuan: "",
          keterangan: "",
          total: 0,
        },
      },
    });
  };
  const onItemChange = (index, target) => {
    dispatch({ type: "UPDATE_ITEM", payload: { index, target } });
  };
  const onItemRemove = (item) => {
    if (item.value.id === itemId) {
      reset();
      navigate("/sj/add");
    }
    dispatch({ type: "DELETE_ITEM", payload: item });
  };
  // !SECTION
  //SECTION: handleSubmit function
  // TODO: add pending and submitted update
  // const [isPending, setIsPending] = useState(false);
  // const [isSubmitted, setIsSubmitted] = useState(null);

  const contentRef = useRef(null);
  const printFunction = useReactToPrint({ contentRef });

  const handleAddSJ = async (type) => {
    try {
      const { id, dateCode, counter, ...SJData } = sjState;
      SJData.items.forEach((item) => {
        item.value.statusSJ = true;
        item.value.tanggalSJ = SJData.tanggalSJ;
        item.value.SJid = id;
      });
      if (SJCount) {
        queueUpdate(countCollection, sjState.klien.value.id, {
          [dateCode]: counter,
        });
      } else {
        queueSet(countCollection, sjState.klien.value.id, {
          [dateCode]: counter,
          companyId: activeCId,
        });
      }

      queueSet(currentCollection, id, { ...SJData, id: id });

      if (selectedMode === "list") {
        SJData.items.forEach(async (item) => {
          queueUpdate(itemCollection, item.value.id, item.value);
        });
      }

      const { error, success } = await queueCommit();
      if (success && !error) {
        // setIsPending(false);
        // setIsSubmitted(true);
        if (type === "REDIRECT") {
          navigate("/sj");
        }
        if (type === "PRINT") {
          await printFunction();
          navigate("/sj");
        }
      }
      if (error) {
        console.log(error);
        // setIsPending(false);
        // setIsSubmitted(false);
        throw new Error(error);
      }
    } catch (err) {
      console.error("Error adding SJ", err);
      alert(`Error: ${err.message}`);
      // setIsPending(false);
      // setIsSubmitted(false);
    }
  };
  //!SECTION
  const [error, setError] = useState(null);

  const currentWidth = useWindowSize().width;

  const scale = currentWidth < 1536 ? 0.9 : 1.2;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const type = e.nativeEvent.submitter.value;
    await handleAddSJ(type);
  };

  // SECTION: template
  return (
    <div className="sj-form m-2 p-2 ">
      <div className="flex flex-col lg:flex-row h-[86dvh]">
        <div className="lg:flex-1/3 p-3 m-2 flex flex-col bg-slate-50 rounded-lg overflow-hidden">
          <div className="flex items-start ">
            <div className="flex-1">
              <div
                className="w-fit bg-gray-100 border border-gray-400 text-gray-800 rounded-lg flex items-center px-3 py-1 mr-3 cursor-pointer text-sm"
                onClick={() => navigate("/sj")}
              >
                <ArrowLeft className="h-4" />
              </div>
            </div>
            <h2 className="">Formulir</h2>
            <div className="flex-1"></div>
          </div>
          <p className="text-lg text-center font-semibold -mt-1">Surat Jalan</p>
          {!itemInfo && (
            <div className="flex justify-around gap-2 mt-3">
              <div
                onClick={() => {
                  dispatch({ type: "CHANGE_MODE", payload: "custom" });
                  setUserMode("custom");
                }}
                className={`${selectedMode === "custom" ? "bg-blue-700 text-white" : "border border-blue-600 hover:bg-blue-300"} w-full text-center p-1 rounded cursor-pointer`}
              >
                <span>Buat Item</span>
              </div>
              <div
                onClick={() => {
                  dispatch({ type: "CHANGE_MODE", payload: "list" });
                  setUserMode("list");
                }}
                className={`${selectedMode === "list" ? "bg-blue-700 text-white" : "border border-blue-600 hover:bg-blue-300"} w-full text-center p-1 rounded cursor-pointer`}
              >
                <span>Dari List Item</span>
              </div>
            </div>
          )}
          {currentWidth < 1024 && (
            <div
              className="w-full bg-amber-500 text-center text-white p-1 my-2 rounded cursor-pointer"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="overflow-y-scroll mb-6 min-h-0"
          >
            <Col
              label="Kode Surat Jalan"
              name="id"
              value={sjState.id}
              isReadOnly
            />
            <DateCol
              label="Tanggal Surat Jalan"
              name="tanggalSJ"
              value={sjState.tanggalSJ}
              endDate={new Date()}
              onChange={(opt) => dispatch({ type: "DATE", payload: opt })}
            />
            <SelectCol
              label="Klien"
              name="klien"
              value={sjState.klien}
              onChange={(opt) => dispatch({ type: "CLIENT", payload: opt })}
              data={clientList}
              isReadOnly={itemId}
            />
            <Col
              label="Alamat Klien"
              name="alamatKlien"
              value={sjState.klien?.value?.alamatKlien}
              isReadOnly
            />
            <Col
              label="Jenis Kendaraan"
              name="jenisKendaraan"
              value={sjState.jenisKendaraan}
              onChange={(e) =>
                dispatch({ type: "VEHICLE_KIND", payload: e.target.value })
              }
              style="bg-white"
            />
            <Col
              label="No. Pol"
              name="noPol"
              value={sjState.noPol}
              onChange={(e) => {
                dispatch({ type: "VEHICLE_NUMBER", payload: e.target.value });
              }}
              style="bg-white"
            />
            {selectedMode === "list" && (
              <>
                <SelectCol
                  label="Item Barang"
                  name="items"
                  value={sjState.items}
                  onChange={(opt) =>
                    dispatch({ type: "SELECT_ITEM", payload: opt })
                  }
                  data={
                    itemId
                      ? itemList.filter((item) => item.value.id !== itemId)
                      : itemList
                  }
                  isReadOnly={!sjState.kodeKlien}
                  isMulti
                  //
                />
                {/* {console.log(sjState.items)} */}
                {sjState.items &&
                  sjState.items.map((item) => (
                    <div
                      key={item.value.id}
                      className="w-[90%] bg-white py-2 px-4 rounded-xl my-5 mx-auto"
                    >
                      <div className="flex justify-between items-center">
                        <span className="italic font-semibold">
                          {item.value.id}
                        </span>
                        <span
                          className="cursor-pointer text-red-500 hover:text-red-700"
                          onClick={() => onItemRemove(item)}
                        >
                          <TrashIcon className="h-5" />
                        </span>
                      </div>
                      <span className="text-sm">
                        {item.value.namaBarang} - {item.value.jumlahFinal}{" "}
                        {item.value.satuan?.value}
                      </span>
                      {item.value.isRoll.value && (
                        <Col
                          label="Jumlah Roll"
                          name="jumlahRoll"
                          value={item.value.jumlahRoll}
                          onChange={(e) =>
                            onSelectedItemChange(item.value.id, e.target)
                          }
                        />
                      )}
                      <Col
                        label="Keterangan"
                        name="keterangan"
                        value={item.value.keterangan}
                        onChange={(e) =>
                          onSelectedItemChange(item.value.id, e.target)
                        }
                        isRequired={false}
                      />
                    </div>
                  ))}
              </>
            )}
            {selectedMode === "custom" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm text-wrap">Items*</span>
                  <button
                    type="button"
                    onClick={onAddItem}
                    className={`${!sjState.kodeKlien ? "bg-blue-100" : "bg-blue-500"} px-3 py-1 text-white rounded-md text-sm flex items-center`}
                    disabled={!sjState.kodeKlien}
                  >
                    <PlusIcon className="h-5" /> Tambah
                  </button>
                </div>

                {sjState.items &&
                  selectedMode === "custom" &&
                  sjState.items.map((item, i) => (
                    <div
                      key={i}
                      className="w-[90%] bg-white py-2 px-4 rounded-xl my-5 mx-auto"
                    >
                      <div className="flex justify-between">
                        <span>No. {i + 1}</span>
                        <span
                          className="cursor-pointer text-red-500 hover:text-red-700"
                          onClick={() => onItemRemove(item)}
                        >
                          Remove
                        </span>
                      </div>
                      <Col
                        name="namaBarang"
                        label="Nama Barang"
                        value={item.value.namaBarang}
                        onChange={(e) => onItemChange(i, e.target)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      />
                      <SelectCol
                        name="satuan"
                        label="Satuan"
                        value={item.value.satuan}
                        onChange={(opt) =>
                          dispatch({
                            type: "UPDATE_ITEM_UNIT",
                            payload: { i, opt },
                          })
                        }
                        data={unit}
                      />
                      <UnitCol
                        type="number"
                        name="jumlah"
                        label="Jumlah Masuk"
                        value={item.value.jumlah}
                        satuan={item.value.satuan?.value}
                        onChange={(e) => onItemChange(i, e.target)}
                        isReadOnly={!item.value.satuan?.value}
                      />
                      <UnitCol
                        type="number"
                        name="jumlahFinal"
                        label={`Jumlah Final ${item.jumlah && item.jumlah > 0 ? `max. ${item.value.jumlah} ${item.value.satuan?.value}` : ""}`}
                        value={item.value.jumlahFinal}
                        satuan={item.value.satuan?.value}
                        onChange={(e) => {
                          parseInt(e.target.value) > parseInt(item.value.jumlah)
                            ? setError("Jumlah Final melebihi yang masuk")
                            : setError(null);
                          onItemChange(i, e.target);
                        }}
                        isReadOnly={
                          !item.value.satuan?.value ||
                          item.value.jumlah === null ||
                          item.value.jumlah === "0" ||
                          item.value.jumlah === ""
                        }
                      >
                        {parseInt(item.value.jumlahFinal) >
                        parseInt(item.value.jumlah) ? (
                          <p className="error">{error}</p>
                        ) : (
                          ""
                        )}
                      </UnitCol>
                      <SelectCol
                        name="isRoll"
                        label="Apakah per-roll"
                        value={item.value.isRoll}
                        onChange={(opt) =>
                          dispatch({
                            type: "UPDATE_ROLL_ITEM",
                            payload: { i, opt },
                          })
                        }
                        data={trueFalse}
                      />
                      {item.value.isRoll.value && (
                        <UnitCol
                          label="Jumlah Roll"
                          name="jumlahRoll"
                          value={sjState.jumlahRoll}
                          onChange={(e) => onItemChange(i, e.target)}
                          satuan="roll"
                        />
                      )}
                      <Col
                        label="Keterangan"
                        name="keterangan"
                        value={item.value.keterangan}
                        onChange={(e) => onItemChange(i, e.target)}
                      />
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-center gap-2">
              {/* type submit and value */}

              <button
                type="submit"
                value="REDIRECT"
                className={`${
                  sjState.items.length === 0 ||
                  sjState.items.some((item) => !item.value.satuan?.value) ||
                  error
                    ? "bg-blue-100 cursor-not-allowed"
                    : "bg-blue-500 cursor-pointer hover:bg-blue-700"
                } text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
                disabled={
                  sjState.items.length === 0 ||
                  sjState.items.some((item) => !item.value.satuan?.value) ||
                  error
                }
              >
                Tambah Surat Jalan
              </button>
              <button
                type="submit"
                value="PRINT"
                className={`${
                  sjState.items.length === 0 ||
                  sjState.items.some((item) => !item.value.satuan?.value) ||
                  error
                    ? "bg-blue-100 cursor-not-allowed"
                    : "bg-blue-500 cursor-pointer hover:bg-blue-700"
                } text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
                disabled={
                  sjState.items.length === 0 ||
                  sjState.items.some((item) => !item.value.satuan?.value) ||
                  error
                }
              >
                Tambah dan Print
              </button>
            </div>
          </form>
        </div>

        <div className="hidden lg:flex-2/3 border border-gray-900 my-auto lg:h-[85dvh] max-h-screen rounded-md lg:flex lg:justify-center lg:flex-col bg-gray-100">
          <TransformWrapper
            minScale={scale ?? initialScale}
            initialScale={scale ?? initialScale}
            centerOnInit
            maxScale={scale === 0.9 ? 2 : 3}
            centerZoomedOut
          >
            <div className="flex flex-col w-full">
              <p className="text-center m-3 text-3xl font-semibold">Preview</p>

              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "70dvh",
                  overflow: "hidden",
                }}
              >
                <div className="" ref={contentRef}>
                  <SJPrint data={sjState} type="add" />
                </div>
              </TransformComponent>
              <Controls />
            </div>
          </TransformWrapper>
        </div>
      </div>
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Preview"
      >
        <div className="flex flex-col w-full">
          {" "}
          <TransformWrapper
            minScale={0.5}
            initialScale={0.5}
            centerOnInit={true}
          >
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "60dvh",
                overflow: "hidden",
              }}
            >
              <div className="border">
                <SJPrint data={sjState} type="add" />
              </div>
            </TransformComponent>
            <Controls />
          </TransformWrapper>
        </div>
      </Modal>
    </div>
  );
  //!SECTION
}
