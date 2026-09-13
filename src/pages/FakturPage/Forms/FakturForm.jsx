import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useDoc } from "../../../hooks/useDoc";
import { useCollection } from "../../../hooks/useCollection";
import { useReactToPrint } from "react-to-print";
import { useWindowSize } from "@uidotdev/usehooks";

import Col from "../../../components/Form/Col";
import DateCol from "../../../components/Form/DateCol";
import SelectCol from "../../../components/Form/SelectCol";
import Modal from "../../../components/Modal/Modal";

import { ArrowDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ArrowLeft, SearchXIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import FakturPrint from "../Details/FakturPrint";
import { useBatchWrite } from "../../../hooks/useBatchWrite";

const formatRupiah = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  return new Intl.NumberFormat("id-ID").format(num);
};

const unformatRupiah = (str) => {
  const cleaned = str.replace(/[^\d]/g, "");
  return cleaned === "" ? "" : Number(cleaned);
};

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

const fakturReducer = (state, action) => {
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
        tanggalFaktur: action.payload,
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
        SJ: [],
      };
    case "SELECT_SJ":
      return {
        ...state,
        jumlahSJ: action.payload.length,
        SJ: action.payload,
      };
    case "UPDATE_SELECT_SJ": {
      const { name, value } = action.payload.target;
      const updatedSJ = [...state.SJ];
      updatedSJ.map((i) => {
        if (i.value.id === action.payload.id) {
          // console.log("true");
          i.value = { ...i.value, [name]: value };
        }
      });
      return {
        ...state,
        SJ: updatedSJ,
      };
    }
    // Update the value with map function, not making a new array and putting that array to the respective position, cos thats just makina a new object
    case "UPDATE_HARGA_ITEM_SJ": {
      return {
        ...state,
        SJ: state.SJ.map((surat) => {
          if (surat.value.id !== action.payload.id) return surat;

          return {
            ...surat,
            value: {
              ...surat.value,
              items: surat.value.items.map((item) => {
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
            },
          };
        }),
      };
    }
    case "DELETE_ITEM": {
      const updatedSJ = state.SJ?.filter((i) => i !== action.payload);
      const length = updatedSJ?.length;
      return {
        ...state,
        SJ: updatedSJ,
        jumlahSJ: length,
      };
    }
    case "TOTAL":
      return {
        ...state,
        total: action.payload,
      };
  }
};

export default function FakturForm() {
  // SECTION: important variable
  const { activeCId } = useAuthContext();
  const [searchParams] = useSearchParams();

  const [showPreview, setShowPreview] = useState(false);

  const currentCollection = "faktur";
  const navigate = useNavigate();

  const initialFakturInfo = useMemo(
    () => ({
      id: "",
      tanggalFaktur: new Date(),
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
      jumlahSJ: "",
      SJ: [],
      total: "",
      statusFinal: false,
      companyId: activeCId,
    }),
    [activeCId],
  );

  const [fakturState, dispatch] = useReducer(fakturReducer, initialFakturInfo);
  // !SECTION
  // SECTION: data fetching for select option
  const clientCollection = "clients";
  const sjCollection = "SJ";
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

  const whereClause = useMemo(
    () => ["kodeKlien", "==", fakturState?.kodeKlien],
    [fakturState.kodeKlien],
  );
  const secondWhere = useMemo(() => ["statusFaktur", "==", false], []);
  const order = useMemo(() => ["id", "asc"], []);
  const secondOrder = useMemo(() => ["tanggalSJ", "asc"], []);
  const { documents: sj } = useCollection(
    sjCollection,
    activeCId,
    order,
    whereClause,
    secondOrder,
    secondWhere,
  );

  let sjList = [];

  sj &&
    sj.map((item) => {
      sjList.push({
        label: `${item.id} (${item.jumlahItem} item - ${item.noPol})`,
        value: item,
      });
    });

  const sjId = searchParams.get("sj");
  const { document: sjInfo } = useDoc(sjCollection, sjId, activeCId);
  useEffect(() => {
    if (sjInfo) {
      dispatch({
        type: "CLIENT",
        payload: sjInfo.klien,
      });
      dispatch({
        type: "SELECT_SJ",
        payload: [
          {
            label: `${sjInfo.id} (${sjInfo.jumlahItem} item - ${sjInfo.noPol})`,
            value: sjInfo,
          },
        ],
      });
    }
  }, [sjInfo]);
  // !SECTION
  // SECTION: CODE GENERATING FOR FAKTUR
  const countCollection = "fakturCount";

  const clientId = fakturState.klien?.value?.id;
  const { document: fakturCount } = useDoc(
    countCollection,
    clientId,
    activeCId,
  );

  // TODO: refactor getDateDetail
  const getDateDetail = (date) => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return { day, month, year };
  };

  useEffect(() => {
    if (fakturState.klien?.value?.id && fakturCount !== undefined) {
      const { day, month, year } = getDateDetail(fakturState.tanggalFaktur);

      const dateCode = year.slice(2, 4) + month + day;

      const counter = (fakturCount ? (fakturCount[dateCode] ?? 0) : 0) + 1;

      const count = counter.toString().padStart(2, "0");

      const id = "FT" + clientId + dateCode + count;

      dispatch({ type: "ID", payload: { id, dateCode, counter } });
    }
  }, [
    clientId,
    fakturCount,
    fakturState.klien?.value?.id,
    fakturState.tanggalFaktur,
  ]);
  // !SECTION
  // SECTION: CHANGE INPUT OF SJ DATA
  // const onSelectedSJChange = (id, target) => {
  //   dispatch({ type: "UPDATE_SELECT_SJ", payload: { id, target } });
  // };
  const onSelectedSJItemChange = async (id, itemId, value) => {
    await dispatch({
      type: "UPDATE_HARGA_ITEM_SJ",
      payload: { id, itemId, value },
    });
  };
  const onItemRemove = (item) => {
    if (item.value.id === sjId) {
      navigate("/faktur/add");
    }
    dispatch({ type: "DELETE_ITEM", payload: item });
  };
  // !SECTION

  // SECTION: handleSubmit
  const contentRef = useRef(null);
  const printFunction = useReactToPrint({ contentRef });
  const { queueSet, queueUpdate, queueCommit } = useBatchWrite(activeCId);

  const handleAddFaktur = async (type) => {
    try {
      const { id, dateCode, counter, ...fakturData } = fakturState;
      fakturData.SJ.forEach((surat) => {
        surat.value.tanggalFaktur = fakturData.tanggalFaktur;
        surat.value.statusFaktur = true;
        surat.value.fakturId = id;
      });
      if (fakturCount) {
        queueUpdate(countCollection, fakturState.kodeKlien, {
          [dateCode]: counter,
        });
      } else {
        queueSet(countCollection, fakturState.kodeKlien, {
          [dateCode]: counter,
          companyId: activeCId,
        });
      }
      queueSet(currentCollection, id, {
        ...fakturData,
        id: id,
      });
      fakturData.SJ.forEach((surat) => {
        queueUpdate(sjCollection, surat.value.id, surat.value);

        if (surat.value.type === "list") {
          surat.value.items.forEach((item) => {
            queueUpdate(itemCollection, item.value.id, item.value);
          });
        }
      });

      const { success, error } = await queueCommit();
      if (success && !error) {
        if (type === "REDIRECT") {
          navigate("/faktur");
        }
        if (type === "PRINT") {
          await printFunction();
          navigate("/faktur");
        }
      }
      if (error) {
        console.log(error);
        throw new Error(error);
      }
    } catch (err) {
      console.error("Error adding SJ", err);
      alert(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    const total = fakturState.SJ?.reduce((sjSum, surat) => {
      const itemsTotal = surat.value.items?.reduce((itemSum, item) => {
        return itemSum + (item.value.hargaTotal || 0);
      }, 0);
      return sjSum + itemsTotal;
    }, 0);

    dispatch({ type: "TOTAL", payload: total });
  }, [fakturState.SJ]);

  const currentWidth = useWindowSize().width;

  const scale = currentWidth < 1536 ? 0.9 : 1.2;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const type = e.nativeEvent.submitter.value;
    await handleAddFaktur(type);
  };

  return (
    <div className="faktur-form m-2 p-2">
      <div className="flex flex-col lg:flex-row h-[86dvh]">
        <div className="lg:flex-1/3 p-3 m-2 flex flex-col bg-slate-50 rounded-lg overflow-hidden">
          <div className="flex items-center ">
            <div className="flex-1">
              <div
                className="w-fit bg-gray-100 border border-gray-400 text-gray-800 rounded-lg flex items-center px-3 py-1 mr-3 cursor-pointer text-sm"
                onClick={() => navigate("/faktur")}
              >
                <ArrowLeft className="h-4" />
              </div>
            </div>
            <h2 className="">Formulir</h2>
            <div className="flex-1"></div>
          </div>
          <p className="text-xl text-center font-semibold -mt-1">Faktur</p>
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
              label="Kode Faktur"
              name="id"
              value={fakturState.id}
              isReadOnly
            />
            <DateCol
              label="Tanggal Faktur"
              name="tanggalSJ"
              value={fakturState.tanggalFaktur}
              endDate={new Date()}
              onChange={(opt) => dispatch({ type: "DATE", payload: opt })}
            />
            <SelectCol
              label="Klien"
              name="klien"
              value={fakturState.klien}
              onChange={(opt) => dispatch({ type: "CLIENT", payload: opt })}
              data={clientList}
              isReadOnly={sjId}
            />
            <Col
              label="Alamat Klien"
              name="alamatKlien"
              value={fakturState.klien?.value?.alamatKlien}
              isReadOnly
            />

            <SelectCol
              label="Surat Jalan"
              name="SJ"
              value={fakturState.SJ}
              onChange={(opt) => dispatch({ type: "SELECT_SJ", payload: opt })}
              data={
                sjId
                  ? sjList.filter((surat) => surat.value.id !== sjId)
                  : sjList
              }
              isReadOnly={!fakturState.kodeKlien}
              isMulti
              //
            />
            {/* {console.log(fakturState.SJ)} */}
            {fakturState.SJ &&
              fakturState.SJ.map((item) => (
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
                    {item.value.jumlahItem} item dengan kendaraan{" "}
                    {item.value.noPol}
                  </span>
                  {/* {console.log(item.value.items)} */}
                  <Col
                    label="Total"
                    name="total"
                    value={`Rp.${formatRupiah(fakturState.total)}`}
                    isReadOnly
                  />
                  {item.value.items.map((i) => (
                    <div
                      key={i.value.id}
                      className="w-[95%] bg-white py-2 px-4 rounded-xl my-5 mx-auto"
                    >
                      <span className="italic font-semibold block">
                        {i.value.id}
                      </span>
                      <span className="text-sm flex flex-col items-center gap-1">
                        {i.value.namaBarang}
                        <span className="font-semibold">
                          {i.value.jumlah} {i.value.satuan?.value}
                        </span>
                        <ArrowDownIcon className="h-3" />
                        {i.value.jumlahFinal} {i.value.satuan?.value}
                      </span>
                      <Col
                        label={`Harga per-${i.value.satuan?.value}`}
                        name="hargaSatuan"
                        value={formatRupiah(i.value.hargaSatuan)}
                        onChange={(e) =>
                          onSelectedSJItemChange(
                            item.value.id,
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
              ))}

            <div className="flex justify-center gap-2">
              <button
                type="submit"
                value="REDIRECT"
                className={`${fakturState?.SJ.length === 0 ? "bg-blue-100 cursor-not-allowed" : "bg-blue-500 cursor-pointer hover:bg-blue-700"} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
                disabled={fakturState?.SJ.length === 0}
              >
                Tambah Faktur
              </button>
              <button
                type="submit"
                value="PRINT"
                className={`${fakturState?.SJ.length === 0 ? "bg-blue-100 cursor-not-allowed" : "bg-blue-500 cursor-pointer hover:bg-blue-700"} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
                disabled={fakturState?.SJ.length === 0}
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
                  <FakturPrint data={fakturState} type="add" />
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
                <FakturPrint data={fakturState} type="add" />
              </div>
            </TransformComponent>
            <Controls />
          </TransformWrapper>
        </div>
      </Modal>
    </div>
  );
}
