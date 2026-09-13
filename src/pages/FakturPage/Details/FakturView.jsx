import { useState, useReducer, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import { useReactToPrint } from "react-to-print";

import { useWindowSize } from "@uidotdev/usehooks";

import { useCollection } from "../../../hooks/useCollection";
import { useDoc } from "../../../hooks/useDoc";

import { ArrowLeft, SearchXIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import FakturPrint from "./FakturPrint";
import SideModal from "../../../components/Modal/SideModal";
import FakturEdit from "../Forms/FakturEdit";

import { useBatchWrite } from "../../../hooks/useBatchWrite";
import { useAuthContext } from "../../../hooks/useAuthContext";

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
const fakturReducer = (state, action) => {
  switch (action.type) {
    case "DOCUMENT":
      return {
        ...action.payload,
      };
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
// !SECTION

export default function FakturView({ activeCId }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { status } = useAuthContext();

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
      statusFinal: "",
      companyId: "",
    }),
    [],
  );

  const fakturId = searchParams.get("id");
  const currentCollection = "faktur";
  const deleteCollection = "deletedFakturs";

  const { document } = useDoc(currentCollection, fakturId, activeCId);
  const [fakturState, dispatch] = useReducer(fakturReducer, initialFakturInfo);
  useEffect(() => {
    if (document) {
      dispatch({ type: "DOCUMENT", payload: document });
    }
  }, [document]);

  const [showEdit, setShowEdit] = useState(false);

  // SECTION: Item List
  const sjCollection = "SJ";

  const whereClause = useMemo(
    () => ["kodeKlien", "==", fakturState?.kodeKlien],
    [fakturState.kodeKlien],
  );
  const secondWhere = useMemo(() => ["tanggalSJ", "!=", null], []);
  const thirdWhere = useMemo(() => ["statusFaktur", "==", false], []);
  const order = useMemo(() => ["id", "asc"], []);
  const secondOrder = useMemo(() => ["tanggalSJ", "asc"], []);
  const { documents: sjs } = useCollection(
    sjCollection,
    activeCId,
    order,
    whereClause,
    secondOrder,
    secondWhere,
    thirdWhere,
  );

  let sjList = [];

  sjs &&
    sjs.map((surat) => {
      sjList.push({
        label: `${surat.id} (${surat.jumlahItem} item - ${surat.noPol})`,
        value: surat,
      });
    });
  // !SECTION

  useEffect(() => {
    const total = fakturState.SJ?.reduce((sjSum, surat) => {
      const itemsTotal = surat.value.items?.reduce((itemSum, item) => {
        return itemSum + (item.value.hargaTotal || 0);
      }, 0);
      return sjSum + itemsTotal;
    }, 0);

    dispatch({ type: "TOTAL", payload: total });
  }, [fakturState.SJ]);

  const { queueSet, queueUpdate, queueDelete, queueCommit } =
    useBatchWrite(activeCId);

  const currentWidth = useWindowSize().width;

  const scale = currentWidth < 1536 ? 0.9 : 1.2;

  // SECTION: BUTTONS
  const [removedSJ, setRemovedSJ] = useState([]);

  const handleEditFaktur = () => {
    if (document) {
      dispatch({ type: "DOCUMENT", payload: document });
      setRemovedSJ([]);
    }
    setShowEdit(true);
  };

  const handleDeleteFaktur = async () => {
    if (fakturState) {
      fakturState.SJ.forEach((i) =>
        queueUpdate(sjCollection, i.value.id, {
          ...i.value,
          statusFaktur: false,
          tanggalFaktur: null,
          fakturId: null,
        }),
      );

      queueSet(deleteCollection, fakturState.id, fakturState, true);
      queueDelete(currentCollection, fakturState.id);
      const { success, error } = await queueCommit();
      if (success && !error) {
        navigate("/faktur");
      }
    }
  };
  // !SECTION

  const onSave = async (e) => {
    e.preventDefault();
    // console.log(fakturState);

    try {
      queueUpdate(currentCollection, fakturState.id, fakturState);
      fakturState.SJ.forEach(async (item) => {
        queueUpdate(sjCollection, item.value.id, item.value);
      });
      removedSJ.length > 0 &&
        removedSJ.forEach(async (item) => {
          queueUpdate(sjCollection, item.value.id, {
            ...item.value,
            statusFaktur: false,
            tanggalFaktur: null,
            fakturId: null,
          });
        });

      const { success, error } = await queueCommit();

      if (success && !error) {
        setShowEdit(false);
      }
      if (error) {
        throw new Error(error);
      }
    } catch (err) {
      console.error("Error editing SJ", err);
      alert(`Error: ${err.message}`);
    }
  };

  const contentRef = useRef(null);
  const printFunction = useReactToPrint({ contentRef });

  return (
    <div>
      <div
        className="w-fit bg-gray-100 border border-gray-400 text-gray-800 rounded-lg flex items-center px-3 py-2 mt-3 mx-3 cursor-pointer"
        onClick={() => navigate("/faktur")}
      >
        <ArrowLeft className="h-4" />
      </div>
      <SideModal
        isOpen={showEdit}
        onClose={() => {
          setShowEdit(false);
          dispatch({ type: "DOCUMENT", payload: document });
          setRemovedSJ([]);
        }}
        title="Edit Faktur"
      >
        <form onSubmit={onSave}>
          <FakturEdit
            fakturState={fakturState}
            dispatch={({ type, payload }) => dispatch({ type, payload })}
            removedSJ={removedSJ}
            setRemovedSJ={(content) => setRemovedSJ(content)}
            sjList={sjList}
          />
          <div className="w-full flex items-center justify-center gap-5 pb-10">
            <button
              className="bg-gray-200 hover:bg-gray-500 text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer"
              onClick={() => {
                setShowEdit(false);
                dispatch({ type: "DOCUMENT", payload: document });
                setRemovedSJ([]);
              }}
            >
              Batal
            </button>
            {/* Type Submit and Value */}
            <button
              type="submit"
              className={`${fakturState.SJ.length === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
              disabled={fakturState.SJ.length === 0}
            >
              Simpan
            </button>
          </div>
        </form>
      </SideModal>

      <TransformWrapper
        minScale={scale ?? initialScale}
        initialScale={scale ?? initialScale}
        centerOnInit
        maxScale={scale === 0.9 ? 2 : 3}
        centerZoomedOut
      >
        <div className="flex flex-col w-full">
          <p className="text-center m-3 text-3xl font-semibold">Preview</p>
          {status === "admin" && (
            <div className="flex mx-auto gap-2">
              {!fakturState.statusFinal && (
                <button
                  className="px-5 py-1 rounded bg-amber-500 w-fit hover:bg-amber-700 text-white text-sm sm:text-base"
                  onClick={handleEditFaktur}
                >
                  Edit
                </button>
              )}
              <button
                className="px-5 py-1 rounded bg-blue-500 w-fit hover:bg-blue-700 text-white text-sm sm:text-base"
                onClick={printFunction}
              >
                Print
              </button>
              {/* <button
              className="px-5 py-1 rounded bg-slate-500 w-fit hover:bg-slate-700 text-white text-sm sm:text-base"
              onClick={savePDF}
            >
              Save PDF
            </button> */}
              {!fakturState.statusFinal && (
                <button
                  className="px-5 py-1 rounded bg-red-600 w-fit hover:bg-red-800 text-white text-sm sm:text-base"
                  onClick={handleDeleteFaktur}
                >
                  Delete
                </button>
              )}
            </div>
          )}

          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "65dvh",
              overflow: "hidden",
            }}
          >
            <div className="" ref={contentRef} id="content-id">
              <FakturPrint data={document} type="view" />
            </div>
          </TransformComponent>
          <Controls />
        </div>
      </TransformWrapper>
    </div>
  );
}
