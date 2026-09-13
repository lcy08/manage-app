import {
  useState,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
import { useBatchWrite } from "../../../hooks/useBatchWrite";

import { ArrowLeft, SearchXIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

import SJPrint from "./SJPrint";
import SideModal from "../../../components/Modal/SideModal";
import RightSideModal from "../../../components/Modal/RightSideModal";

import SJEdit from "../Forms/SJEdit";
import ItemEditForm from "../Forms/ItemEditForm";

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

export default function SJView({ activeCId }) {
  const [searchParams] = useSearchParams();
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
      namaKlien: "name",
      kodeKlien: "code",
      klien: {
        label: "Select",
        value: {
          id: "",
          namaKlien: "name",
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
      companyId: "",
    }),
    [],
  );

  const type = searchParams.get("type");
  const SJid = searchParams.get("id");
  const currentCollection = "SJ";
  const deleteCollection = "deletedSJs";

  const { document } = useDoc(currentCollection, SJid, activeCId);
  const [sjState, dispatch] = useReducer(SJReducer, initialSJInfo);
  useEffect(() => {
    if (document) {
      dispatch({ type: "DOCUMENT", payload: document });
    }
  }, [document]);

  const [showEdit, setShowEdit] = useState(false);

  const [showItemEdit, setShowItemEdit] = useState(false);

  // SECTION: Item List
  const itemCollection = "items";

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

  items &&
    type === "list" &&
    items.map((item) => {
      itemList.push({
        label: `${item.id} (${item.namaBarang} - ${item.jumlahFinal} ${item.satuan.value})`,
        value: item,
      });
    });
  // !SECTION

  const { queueSet, queueUpdate, queueDelete, queueCommit } =
    useBatchWrite(activeCId);

  const currentWidth = useWindowSize().width;

  const scale = currentWidth < 1536 ? 0.9 : 1.2;

  // SECTION: BUTTONS
  const [selectedItem, setSelectedItem] = useState(null);
  const [removedItem, setRemovedItem] = useState([]);

  const handleEditSJ = () => {
    if (document) {
      dispatch({ type: "DOCUMENT", payload: document });
      setRemovedItem([]);
    }
    setShowEdit(true);
  };

  const handleDeleteSJ = async () => {
    if (sjState) {
      if (type === "list") {
        sjState.items.forEach((i) =>
          queueUpdate(itemCollection, i.value.id, {
            ...i.value,
            statusSJ: false,
            tanggalSJ: null,
            SJid: null,
          }),
        );
      }
      queueSet(deleteCollection, sjState.id, sjState, true);
      queueDelete(currentCollection, sjState.id);
      const { success, error } = await queueCommit();
      if (success && !error) {
        navigate("/sj");
      }
    }
  };
  // !SECTION
  const handleItemChange = useCallback((update) => {
    setSelectedItem(update);
  }, []);

  const fakturCollection = "faktur";
  const { document: faktur } = useDoc(
    fakturCollection,
    sjState.fakturId,
    activeCId,
  );

  const onSave = async (e) => {
    e.preventDefault();

    if (sjState.fakturId) {
      var newFakturSJ = faktur?.SJ?.map((surat) => {
        if (surat.value.id === sjState.id) {
          return {
            label: `${surat.value.id} (${surat.value.jumlahItem} item - ${surat.value.noPol})`,
            value: sjState,
          };
        } else {
          return { ...surat };
        }
      });
    }

    try {
      if (sjState.fakturId) {
        queueUpdate(fakturCollection, faktur.id, {
          ...faktur,
          SJ: newFakturSJ,
        });
      }
      queueUpdate(currentCollection, sjState.id, sjState);
      if (type === "list") {
        sjState.items.forEach(async (item) => {
          queueUpdate(itemCollection, item.value.id, item.value);
        });
        removedItem.length > 0 &&
          removedItem.forEach(async (item) => {
            queueUpdate(itemCollection, item.value.id, {
              ...item.value,
              statusSJ: false,
              tanggalSJ: null,
              SJid: null,
            });
          });
      }

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

  const onItemSave = async (e) => {
    e.preventDefault();
    const newStateItems = sjState.items?.map((i) => {
      if (i.value.id === selectedItem.id) {
        return {
          label: `${selectedItem.id} (${selectedItem.namaBarang} - ${selectedItem.jumlahFinal} ${selectedItem.satuan.value})`,
          value: selectedItem,
        };
      } else {
        return { ...i };
      }
    });

    if (sjState.fakturId) {
      var newFakturSJ = faktur?.SJ?.map((surat) => {
        if (surat.value.id === sjState.id) {
          return {
            ...surat,
            value: {
              ...surat.value,
              items: surat.value.items.map((i) => {
                if (i.value.id === selectedItem.id) {
                  return {
                    label: `${selectedItem.id} (${selectedItem.namaBarang} - ${selectedItem.jumlahFinal} ${selectedItem.satuan.value})`,
                    value: selectedItem,
                  };
                } else {
                  return { ...i };
                }
              }),
            },
          };
        } else {
          return { ...surat };
        }
      });
    }
    // NOTE: selectedItem is from sjState which have an old or not updated item data for statusSJ, tanggalSJ and SJid (updated after SJdoc uploaded to make sure the data is uploaded first and update the item after) then we need to make sure the updateItem function still use the updated data by hardcoding the update again

    // NOTE: FIXED: NEXT STEP: update the sjState data of the items' three updated data after SJdoc successfully uploaded first at SJForm of adding the SJ (manipulate the sjState.items.value(?) to include the three updated data so we dont need to hardcode it in this updateItem function :) ) OOOOORRRR just use batchWrite and define an updated item and use the updated data for saving to firebase
    try {
      queueUpdate(itemCollection, selectedItem.id, selectedItem);
      queueUpdate(currentCollection, sjState.id, {
        ...sjState,
        items: newStateItems,
        tanggalSJ: selectedItem.tanggalSJ,
      });
      if (sjState.fakturId) {
        queueUpdate(fakturCollection, faktur.id, {
          ...faktur,
          SJ: newFakturSJ,
        });
      }
      const { success, error } = await queueCommit();
      if (success && !error) {
        setShowItemEdit(false);
      }
      if (error) {
        throw new Error(error);
      }
    } catch (err) {
      console.error("Error editing Item in SJ", err);
      alert(`Error: ${err.message}`);
    }
    // dispatch({ type: "SELECT_ITEM", payload: newState });
    // update Item (selectedItem.id) if type === list and sjDoc (sjState.id and items: newState)
  };

  const contentRef = useRef(null);
  const printFunction = useReactToPrint({ contentRef });

  return (
    <div>
      <div
        className="w-fit bg-gray-100 border border-gray-400 text-gray-800 rounded-lg flex items-center px-3 py-2 mt-3 mx-3 cursor-pointer"
        onClick={() => navigate("/sj")}
      >
        <ArrowLeft className="h-4" />
      </div>
      <SideModal
        isOpen={showEdit}
        onClose={() => {
          setShowEdit(false);
          dispatch({ type: "DOCUMENT", payload: document });
          setRemovedItem([]);
        }}
        title="Edit Surat Jalan"
      >
        <form onSubmit={onSave}>
          <SJEdit
            sjState={sjState}
            dispatch={({ type, payload }) => dispatch({ type, payload })}
            setSelectedItem={(content) => setSelectedItem(content)}
            removedItem={removedItem}
            setRemovedItem={(content) => setRemovedItem(content)}
            setShowEdit={(content) => setShowEdit(content)}
            setShowItemEdit={(content) => setShowItemEdit(content)}
            type={type}
            itemList={itemList}
          />
          <div className="w-full flex items-center justify-center gap-5 pb-10">
            <button
              className="bg-gray-200 hover:bg-gray-500 text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer"
              onClick={() => {
                setShowEdit(false);
                dispatch({ type: "DOCUMENT", payload: document });
                setRemovedItem([]);
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`${
                sjState.items.length === 0 ||
                sjState.items.some((item) => !item.value.satuan?.value)
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer"
              } bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1`}
              disabled={
                sjState.items.length === 0 ||
                sjState.items.some((item) => !item.value.satuan?.value)
              }
            >
              Simpan
            </button>
          </div>
        </form>
      </SideModal>
      <RightSideModal
        isOpen={showItemEdit}
        onClose={() => setShowItemEdit(false)}
        title={`Edit Item (${selectedItem?.id})`}
      >
        <>
          <ItemEditForm
            activeCId={activeCId}
            selectedItem={selectedItem}
            setSelectedItem={handleItemChange}
            setShowItemEdit={(content) => setShowItemEdit(content)}
          />
          <div className="w-full flex items-center justify-center gap-5 pb-10">
            <button
              className="bg-gray-100 hover:bg-gray-500 text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 cursor-pointer"
              onClick={() => setShowItemEdit(false)}
            >
              Batal
            </button>
            <button
              onClick={onItemSave}
              className="bg-blue-500 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              Simpan
            </button>
          </div>
        </>
      </RightSideModal>
      <TransformWrapper
        minScale={scale ?? initialScale}
        initialScale={scale ?? initialScale}
        centerOnInit
        maxScale={scale === 0.9 ? 2 : 3}
        centerZoomedOut
      >
        <div className="flex flex-col w-full">
          <p className="text-center m-3 text-3xl font-semibold">Preview</p>

          <div className="flex mx-auto gap-2">
            {!sjState.statusFaktur && (
              <button
                className="px-5 py-1 rounded bg-amber-500 w-fit hover:bg-amber-700 text-white text-sm sm:text-base"
                onClick={handleEditSJ}
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
            {!sjState.statusFaktur && (
              <button
                className="px-5 py-1 rounded bg-red-600 w-fit hover:bg-red-800 text-white text-sm sm:text-base"
                onClick={handleDeleteSJ}
              >
                Delete
              </button>
            )}
          </div>

          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "65dvh",
              overflow: "hidden",
            }}
          >
            <div className="" ref={contentRef} id="content-id">
              <SJPrint data={document} type="view" />
            </div>
          </TransformComponent>
          <Controls />
        </div>
      </TransformWrapper>
    </div>
  );
}
