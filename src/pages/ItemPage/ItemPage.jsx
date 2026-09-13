import { useState, useMemo, useCallback, useRef } from "react";

import KanbanComponent from "../../components/Kanban/KanbanComponent";
import Modal from "../../components/Modal/Modal";
import ItemMasukForm from "./Forms/ItemMasukForm";
import ItemProsesForm from "./Forms/ItemProsesForm";
import ItemSelesaiForm from "./Forms/ItemSelesaiForm";
import ItemSiapKirimForm from "./Forms/ItemSiapKirimForm";

import { useAuthContext } from "../../hooks/useAuthContext";
import { useCollection } from "../../hooks/useCollection";
import { useFirestore } from "../../hooks/useFirestore";

import RightSideModal from "../../components/Modal/RightSideModal";
import ItemSJForm from "./Forms/ItemSJForm";
import SearchFilter from "../../components/SearchFilter";
import ArchivedItem from "./ArchivedItem";
import { Trash2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Convert firebase timestamp into readable JS DateObject
 *
 * @param {FirebaseTimestamp} date
 * @return {DateObject} Date readable by React-datepicker
 */
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

/**
 * For Deadline Date, set the hour into 23:59,
 * so all deadline date have the same hour
 *
 * @param {DateObject} date
 */
const getDeadlineHour = (date) => new Date(date.setHours(23, 59, 0, 0));

const filterData = (data, filterValue) =>
  data?.filter(
    (data) =>
      data.klien.value.namaKlien
        .toLowerCase()
        .includes(filterValue.toLowerCase()) ||
      data.namaBarang.toLowerCase().includes(filterValue.toLowerCase()) ||
      data.id.toLowerCase().includes(filterValue.toLowerCase()),
  );

export default function ItemPage() {
  const { activeCId } = useAuthContext();
  const currentCollection = "items";

  const navigate = useNavigate();

  const [filterValue, setFilterValue] = useState([]);
  const handleFilter = useCallback((c) => setFilterValue(c), []);

  const masukClause = useMemo(() => ["itemStatus", "==", "masuk"], []);
  const masukOrder = useMemo(() => ["tanggalMasukDeadline", "asc"], []);
  const masukSecondOrder = useMemo(() => ["tanggalMasuk", "desc"], []);

  const { documents: masukRow } = useCollection(
    currentCollection,
    activeCId,
    masukOrder,
    masukClause,
    masukSecondOrder,
  );

  const masuk = filterData(masukRow, filterValue);

  const prosesClause = useMemo(() => ["itemStatus", "==", "proses"], []);
  const prosesOrder = useMemo(() => ["tanggalProsesDeadline", "asc"], []);
  const prosesSecondOrder = useMemo(() => ["tanggalProses", "desc"], []);
  const { documents: prosesRow } = useCollection(
    currentCollection,
    activeCId,
    prosesOrder,
    prosesClause,
    prosesSecondOrder,
  );

  const proses = filterData(prosesRow, filterValue);

  const selesaiClause = useMemo(() => ["itemStatus", "==", "selesai"], []);
  const selesaiOrder = useMemo(() => ["tanggalSelesaiDeadline", "asc"], []);
  const selesaiSecondOrder = useMemo(() => ["tanggalSelesai", "desc"], []);
  const { documents: selesaiRow } = useCollection(
    currentCollection,
    activeCId,
    selesaiOrder,
    selesaiClause,
    selesaiSecondOrder,
  );

  const selesai = filterData(selesaiRow, filterValue);

  const siapKirimClause = useMemo(() => ["itemStatus", "==", "siapKirim"], []);
  const siapKirimSecondClause = useMemo(() => ["statusSJ", "==", false], []);
  const siapKirimOrder = useMemo(() => ["tanggalSiapKirimDeadline", "asc"], []);
  const siapKirimSecondOrder = useMemo(() => ["tanggalSiapKirim", "desc"], []);
  const { documents: siapKirimRow } = useCollection(
    currentCollection,
    activeCId,
    siapKirimOrder,
    siapKirimClause,
    siapKirimSecondOrder,
    siapKirimSecondClause,
  );

  const siapKirim = filterData(siapKirimRow, filterValue);

  const itemCollection = "items";

  const { updateDocument } = useFirestore(itemCollection, activeCId);

  const [showModal, setShowModal] = useState(false);
  const [showSJModal, setShowSJModal] = useState(false);
  const [isDetail, setIsDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [isAddMasuk, setIsAddMasuk] = useState(false);
  const [isAddProses, setIsAddProses] = useState(false);
  const [isAddSelesai, setIsAddSelesai] = useState(false);
  const [isAddSiapKirim, setIsAddSiapKirim] = useState(false);

  const initialItemInfo = useMemo(
    () => ({
      id: "",
      namaBarang: "",
      kodeKlien: "",
      klien: {
        label: "",
        value: {
          id: "",
          namaKlien: "",
          alamatKlien: "",
        },
      },
      jumlah: "",
      jumlahProses: "",
      satuan: {
        label: "",
        value: "",
      },
      isRoll: {
        label: "",
        value: "",
      },
      jumlahFinal: "",
      jumlahSusut: "",
      tanggalMasuk: null,
      tanggalMasukDeadline: null,
      tanggalProses: null,
      tanggalProsesDeadline: null,
      tanggalSelesai: null,
      tanggalSelesaiDeadline: null,
      tanggalSiapKirim: null,
      tanggalSiapKirimDeadline: null,
      tanggalSJ: null,
      statusSJ: false,
      itemStatus: "",
      splitCounter: 0,
      companyId: activeCId,
    }),
    [activeCId],
  );
  // ANCHOR: THINGS FOR SHOWING AND GETTING THE INFO OF CLICKING EVENT

  const [itemInfo, setItemInfo] = useState(initialItemInfo);

  const handleChange = useCallback(
    (update) => {
      setItemInfo(update);
    },
    [setItemInfo],
  );

  const handleAdd = () => {
    setIsAddMasuk(true);
    setIsAddProses(false);
    setIsAddSelesai(false);
    setIsAddSiapKirim(false);

    setIsEdit(false);
    setIsDetail(false);
    setItemInfo({
      ...initialItemInfo,
      tanggalMasuk: new Date(),
      tanggalMasukDeadline: getDeadlineHour(new Date()),
      itemStatus: "masuk",
    });
    setShowModal(true);
  };

  const handleDetail = (r) => {
    switch (r.itemStatus) {
      case "masuk":
        setIsAddMasuk(true);
        setIsAddProses(false);
        setIsAddSelesai(false);
        setIsAddSiapKirim(false);
        break;
      case "proses":
        setIsAddMasuk(true);
        setIsAddProses(true);
        setIsAddSelesai(false);
        setIsAddSiapKirim(false);
        break;
      case "selesai":
        setIsAddMasuk(true);
        setIsAddProses(true);
        setIsAddSelesai(true);
        setIsAddSiapKirim(false);
        break;
      case "siapKirim":
        setIsAddMasuk(true);
        setIsAddProses(true);
        setIsAddSelesai(true);
        setIsAddSiapKirim(true);
        break;
      default:
        break;
    }
    setIsDetail(true);
    setIsEdit(false);

    setItemInfo({
      ...r,
      tanggalMasuk: getFirebaseDate(r.tanggalMasuk),
      tanggalMasukDeadline: getFirebaseDate(r.tanggalMasukDeadline),
      tanggalProses: getFirebaseDate(r.tanggalProses),
      tanggalProsesDeadline: getFirebaseDate(r.tanggalProsesDeadline),
      tanggalSelesai: getFirebaseDate(r.tanggalSelesai),
      tanggalSelesaiDeadline: getFirebaseDate(r.tanggalSelesaiDeadline),
      tanggalSiapKirim: getFirebaseDate(r.tanggalSiapKirim),
      tanggalSiapKirimDeadline: getFirebaseDate(r.tanggalSiapKirimDeadline),
      tanggalSJ: getFirebaseDate(r.tanggalSJ),
    });

    setShowModal(true);
  };

  const handleEdit = () => {
    setIsDetail(false);
    setIsEdit(true);
  };

  const handleCancel = () => {
    setIsDetail(true);
    setIsEdit(false);
  };

  // ANCHOR: MOVE TO PREVIOUS
  /**
   * Update item into previous status
   *
   * @param {itemData} data
   * @param {itemStatus} status
   */
  const handleUpdateItem = async (data, status) => {
    try {
      const { id, ...itemData } = data;
      if (status === "selesai") {
        const { error, success } = await updateDocument(id, {
          ...itemData,
          itemStatus: status,
          tanggalSiapKirim: null,
          tanggalSiapKirimDeadline: null,
        });

        if (success && !error) {
          console.log("undo success");
        }
        if (error) {
          console.log(error);
          throw new Error(error);
        }
      } else {
        const { error, success } = await updateDocument(id, {
          ...itemData,
          itemStatus: status,
        });
        if (success && !error) {
          console.log("undo success");
        }
        if (error) {
          console.log(error);
          throw new Error(error);
        }
      }
    } catch (error) {
      console.error("Error updating Client", error);
      alert(`Error: ${error.message}`);
    }
  };

  // ANCHOR: HANDLE PREVIOUS AND NEXT BUTTON
  const handlePreviousToMasuk = (data) => {
    handleUpdateItem(data, "masuk");
  };
  const handlePreviousToProses = (data) => {
    handleUpdateItem(data, "proses");
  };

  const handlePreviousToSelesai = (data) => {
    handleUpdateItem(data, "selesai");
  };

  const handleNextToProses = (r) => {
    setIsAddMasuk(false);
    setIsAddProses(true);
    setIsAddSelesai(false);
    setIsAddSiapKirim(false);

    setIsEdit(false);
    setIsDetail(false);
    setItemInfo({
      ...r,
      tanggalMasuk: getFirebaseDate(r.tanggalMasuk),
      tanggalMasukDeadline: getFirebaseDate(r.tanggalMasukDeadline),
      tanggalProses: new Date(),
      tanggalProsesDeadline: getDeadlineHour(new Date()),
      jumlahProses: r.jumlah,
    });

    setShowModal(true);
  };

  const handleNextToSelesai = (r) => {
    setIsAddMasuk(false);
    setIsAddProses(false);
    setIsAddSelesai(true);
    setIsAddSiapKirim(false);

    setIsEdit(false);
    setIsDetail(false);
    setItemInfo({
      ...r,
      tanggalMasuk: getFirebaseDate(r.tanggalMasuk),
      tanggalMasukDeadline: getFirebaseDate(r.tanggalMasukDeadline),
      tanggalProses: getFirebaseDate(r.tanggalProses),
      tanggalProsesDeadline: getFirebaseDate(r.tanggalProsesDeadline),
      tanggalSelesai: new Date(),
      tanggalSelesaiDeadline: getDeadlineHour(new Date()),
      jumlahFinal: r.jumlahProses,
      jumlahSusut: r.jumlahProses - r.jumlah,
    });

    setShowModal(true);
  };

  const handleNextToSiap = (r) => {
    setIsAddMasuk(false);
    setIsAddProses(false);
    setIsAddSelesai(false);
    setIsAddSiapKirim(true);

    setIsEdit(false);
    setIsDetail(false);
    setItemInfo({
      ...r,
      tanggalMasuk: getFirebaseDate(r.tanggalMasuk),
      tanggalMasukDeadline: getFirebaseDate(r.tanggalMasukDeadline),
      tanggalProses: getFirebaseDate(r.tanggalProses),
      tanggalProsesDeadline: getFirebaseDate(r.tanggalProsesDeadline),
      tanggalSelesai: getFirebaseDate(r.tanggalSelesai),
      tanggalSelesaiDeadline: getFirebaseDate(r.tanggalSelesaiDeadline),
      tanggalSiapKirim: new Date(),
      tanggalSiapKirimDeadline: getDeadlineHour(new Date()),
    });

    setShowModal(true);
  };

  const handleNextToSJ = (r) => {
    setIsAddMasuk(false);
    setIsAddProses(false);
    setIsAddSelesai(false);
    setIsAddSiapKirim(false);

    setIsEdit(false);
    setIsDetail(false);

    setItemInfo({
      ...r,
      tanggalMasuk: getFirebaseDate(r.tanggalMasuk),
      tanggalMasukDeadline: getFirebaseDate(r.tanggalMasukDeadline),
      tanggalProses: getFirebaseDate(r.tanggalProses),
      tanggalProsesDeadline: getFirebaseDate(r.tanggalProsesDeadline),
      tanggalSelesai: getFirebaseDate(r.tanggalSelesai),
      tanggalSelesaiDeadline: getFirebaseDate(r.tanggalSelesaiDeadline),
      tanggalSiapKirim: getFirebaseDate(r.tanggalSiapKirim),
      tanggalSiapKirimDeadline: getFirebaseDate(r.tanggalSiapKirimDeadline),
      tanggalSJ: new Date(),
    });

    setShowSJModal(true);
  };

  const scrollToRef = useRef(null);

  const [isDone, setIsDone] = useState(false);

  // ANCHOR: Render
  return (
    <div className="item-page m-2 p-2">
      <h2 className="text-center text-2xl font-bold mb-6">
        Barang Masuk dan Keluar
      </h2>
      <div className="flex justify-between">
        <button
          onClick={handleAdd}
          className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mb-4"
        >
          Tambah Barang
        </button>
        <button
          onClick={() => navigate("/trashed/items")}
          className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-1 mb-4"
        >
          <Trash2Icon />
        </button>
      </div>

      <SearchFilter setFilter={handleFilter} />

      <div className="flex">
        <div
          className={`p-2 m-1 border border-blue-400 cursor-pointer rounded-lg ${!isDone ? "bg-blue-200" : ""}`}
          onClick={() => setIsDone(false)}
        >
          Belum Selesai
        </div>
        <div
          className={`p-2 m-1 border border-blue-400 cursor-pointer rounded-lg ${isDone ? "bg-blue-200" : ""}`}
          onClick={() => setIsDone(true)}
        >
          Selesai
        </div>
      </div>

      {!isDone && (
        <div className="flex flex-col justify-center items-start rounded-lg bg-gray-100 text-black md:flex-row md:p-4 md:justify-around md:flex-wrap">
          <div className="m-2 overflow-x-hidden">
            <div
              className={`border-t-2 pt-1 px-1 text-lg ${masuk?.length > 0 ? "border-blue-700" : "border-green-500"} w-72 md:w-full`}
            >
              Masuk
            </div>
            {masuk?.length !== 0 ? (
              <div className="flex flex-row w-[88dvw] md:w-full overflow-x-auto gap-2 md:flex-col md:overflow-y-auto md:max-h-240">
                {masuk?.map((item) => (
                  <KanbanComponent
                    key={item.id}
                    data={item}
                    status="Masuk"
                    handleDetail={handleDetail}
                    handleNext={handleNextToProses}
                  />
                ))}
              </div>
            ) : (
              <p className="p-2 w-72 h-40 my-2">Tidak ada data</p>
            )}
          </div>
          <div className="m-2 overflow-x-hidden">
            <div
              className={`border-t-2 pt-1 px-1 text-lg ${proses?.length > 0 ? "border-blue-700" : "border-green-500"} w-72 md:w-full`}
            >
              Proses
            </div>
            {proses?.length !== 0 ? (
              <div className="flex flex-row w-[88dvw] md:w-full overflow-x-auto gap-2 md:flex-col md:overflow-y-auto md:max-h-240">
                {proses?.map((item) => (
                  <KanbanComponent
                    key={item.id}
                    data={item}
                    status="Proses"
                    handlePrevious={handlePreviousToMasuk}
                    handleDetail={handleDetail}
                    handleNext={handleNextToSelesai}
                  />
                ))}
              </div>
            ) : (
              <p className="p-2 w-72 h-40 my-2">Tidak ada data</p>
            )}
          </div>
          <div className="m-2 overflow-hidden">
            <div
              className={`border-t-2 pt-1 px-1 text-lg ${selesai?.length > 0 ? "border-blue-700" : "border-green-500"} w-72 md:w-full`}
            >
              Selesai
            </div>
            {selesai?.length !== 0 ? (
              <div className="flex flex-row w-[88dvw] md:w-full overflow-x-auto gap-2 md:flex-col md:overflow-y-auto md:max-h-240">
                {selesai?.map((item) => (
                  <KanbanComponent
                    key={item.id}
                    data={item}
                    status="Selesai"
                    handlePrevious={handlePreviousToProses}
                    handleDetail={handleDetail}
                    handleNext={handleNextToSiap}
                  />
                ))}
              </div>
            ) : (
              <p className="p-2 w-72 h-40 my-2">Tidak ada data</p>
            )}
          </div>
          <div className="m-2 overflow-hidden">
            <div
              className={`border-t-2 pt-1 px-1 text-lg ${siapKirim?.length > 0 ? "border-blue-700" : "border-green-500"} w-72 md:w-full`}
            >
              Siap Kirim
            </div>

            {siapKirim?.length !== 0 ? (
              <div className="flex flex-row w-[88dvw] md:w-full overflow-x-auto gap-2 md:flex-col md:overflow-y-auto md:max-h-240">
                {siapKirim?.map((item) => (
                  <KanbanComponent
                    key={item.id}
                    data={item}
                    status="SiapKirim"
                    handlePrevious={handlePreviousToSelesai}
                    handleDetail={handleDetail}
                    handleNext={handleNextToSJ}
                  />
                ))}
              </div>
            ) : (
              <p className="p-2 w-72 h-40 my-2">Tidak ada data</p>
            )}
          </div>
        </div>
      )}

      {isDone && (
        <ArchivedItem
          currentCollection={currentCollection}
          activeCId={activeCId}
          filterData={filterData}
          filterValue={filterValue}
          handleDetail={handleDetail}
        />
      )}

      {/* ANCHOR: MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        title="Barang"
        scrollInto={() =>
          scrollToRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      >
        {(isDetail || isEdit) && isAddMasuk && (
          <>
            <div className="border-t-2 border-slate-600"></div>
            <p className="text-center mb-4 text-xl bg-gray-300 p-2">
              Barang Masuk
            </p>
          </>
        )}
        <div
          className={`${isAddMasuk && !isAddProses && !isAddSelesai && !isAddSiapKirim && isDetail ? "bg-blue-50 transition-all duration-200" : "transtition-all duration-400"} p-2 mb-4`}
        >
          {isAddMasuk && (
            <ItemMasukForm
              isDetail={isDetail}
              isEdit={isEdit}
              activeCId={activeCId}
              itemInfo={itemInfo}
              onChange={handleChange}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onSubmit={() => {
                setShowModal(false);
                setItemInfo(initialItemInfo);
              }}
              isAddProses={isAddProses}
            />
          )}
        </div>
        {(isDetail || isEdit) && isAddProses && (
          <>
            <div className="border-t-2 border-slate-600"></div>
            <p
              className="text-center mb-4 text-xl bg-gray-300 p-2"
              ref={
                isAddMasuk &&
                isAddProses &&
                !isAddSelesai &&
                !isAddSiapKirim &&
                isDetail
                  ? scrollToRef
                  : null
              }
            >
              Proses Barang
            </p>
          </>
        )}
        <div
          className={`${isAddMasuk && isAddProses && !isAddSelesai && !isAddSiapKirim && isDetail ? "bg-blue-50 transition-all duration-200" : "transtition-all duration-400"} p-2 mb-4`}
        >
          {isAddProses && (
            <ItemProsesForm
              isDetail={isDetail}
              isEdit={isEdit}
              activeCId={activeCId}
              itemInfo={itemInfo}
              onChange={handleChange}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onSubmit={() => {
                setShowModal(false);
                setItemInfo(initialItemInfo);
              }}
              isAddSelesai={isAddSelesai}
            />
          )}
        </div>
        {(isDetail || isEdit) && isAddSelesai && (
          <>
            <div className="border-t-2 border-slate-600"></div>
            <p
              className="text-center mb-4 text-xl bg-gray-300 p-2"
              ref={
                isAddMasuk &&
                isAddProses &&
                isAddSelesai &&
                !isAddSiapKirim &&
                isDetail
                  ? scrollToRef
                  : null
              }
            >
              Barang Selesai
            </p>
          </>
        )}
        <div
          className={`${isAddMasuk && isAddProses && isAddSelesai && !isAddSiapKirim && isDetail ? "bg-blue-50 transition-all duration-200" : "transtition-all duration-400"} p-2 mb-4`}
        >
          {isAddSelesai && (
            <ItemSelesaiForm
              isDetail={isDetail}
              isEdit={isEdit}
              activeCId={activeCId}
              itemInfo={itemInfo}
              onChange={handleChange}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onSubmit={() => {
                setShowModal(false);
                setItemInfo(initialItemInfo);
              }}
              isAddSiapKirim={isAddSiapKirim}
            />
          )}
        </div>
        {(isDetail || isEdit) && isAddSiapKirim && (
          <>
            <div className="border-t-2 border-slate-600"></div>
            <p
              className="text-center mb-4 text-xl bg-gray-300 p-2"
              ref={
                isAddMasuk &&
                isAddProses &&
                isAddSelesai &&
                isAddSiapKirim &&
                isDetail
                  ? scrollToRef
                  : null
              }
            >
              Barang Siap Kirim
            </p>
          </>
        )}
        <div
          className={`${isAddMasuk && isAddProses && isAddSelesai && isAddSiapKirim && isDetail ? "bg-blue-50 transition-all duration-200" : "transtition-all duration-400"} p-2 mb-4`}
        >
          {isAddSiapKirim && (
            <ItemSiapKirimForm
              isDetail={isDetail}
              isEdit={isEdit}
              activeCId={activeCId}
              itemInfo={itemInfo}
              onChange={handleChange}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onSubmit={() => {
                setShowModal(false);
                setItemInfo(initialItemInfo);
              }}
              isDone={isDone}
            />
          )}
        </div>
      </Modal>
      <>
        <RightSideModal
          isOpen={showSJModal}
          onClose={() => setShowSJModal(false)}
          title="Surat Jalan"
          width="max-w-2xl"
        >
          <ItemSJForm
            activeCId={activeCId}
            itemInfo={itemInfo}
            onChange={handleChange}
          />
        </RightSideModal>
      </>
    </div>
  );
}
