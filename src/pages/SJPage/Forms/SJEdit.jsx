import { useState } from "react";

import DateCol from "../../../components/Form/DateCol";
import Col from "../../../components/Form/Col";
import SelectCol from "../../../components/Form/SelectCol";
import UnitCol from "../../../components/Form/UnitCol";

import { components } from "react-select";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const getFirebaseDate = (date) => {
  try {
    if (date) {
      return new Date(date.toDate().toString());
    }
  } catch (e) {
    console.log(e.message);
    return new Date(date);
  }
};

const selectStyles = (props) => {
  return (
    <components.MultiValueRemove {...props}>""</components.MultiValueRemove>
  );
};

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

export default function SJEdit({
  sjState,
  dispatch,
  setSelectedItem,
  removedItem,
  setRemovedItem,
  setShowItemEdit,
  type,
  itemList,
}) {
  // const onSelectedItemChange = (id, target) => {
  //   console.log(id, target);
  //   dispatch({ type: "UPDATE_SELECT_ITEM", payload: { id, target } });
  // };
  const onSelectedItemEdit = (item) => {
    setSelectedItem({
      ...item,
      tanggalMasuk: getFirebaseDate(item.tanggalMasuk),
      tanggalMasukDeadline: getFirebaseDate(item.tanggalMasukDeadline),
      tanggalProses: getFirebaseDate(item.tanggalProses),
      tanggalProsesDeadline: getFirebaseDate(item.tanggalProsesDeadline),
      tanggalSelesai: getFirebaseDate(item.tanggalSelesai),
      tanggalSelesaiDeadline: getFirebaseDate(item.tanggalSelesaiDeadline),
      tanggalSiapKirim: getFirebaseDate(item.tanggalSiapKirim),
      tanggalSiapKirimDeadline: getFirebaseDate(item.tanggalSiapKirimDeadline),
    });

    setShowItemEdit(true);
  };

  const onSelectedItemRemove = (item) => {
    setRemovedItem([...removedItem, item]);

    const arr = sjState.items.filter((i) => i.label !== item.label);
    dispatch({ type: "SELECT_ITEM", payload: arr });
  };

  const onSelectedItemAddBack = (item) => {
    const sjItems = [...sjState.items, item];
    dispatch({ type: "SELECT_ITEM", payload: sjItems });
    const arr = removedItem.filter((i) => i.label !== item.label);
    setRemovedItem(arr);
  };

  const onAddItem = () => {
    dispatch({
      type: "ADD_ITEMS",
      payload: {
        value: {
          id: "=",
          namaBarang: "",
          jumlah: "",
          jumlahFinal: "",
          satuan: "",
          isRoll: { label: "No", value: false },
          roll: "",
          hargaSatuan: 0,
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
    setRemovedItem([...removedItem, item])
    dispatch({ type: "DELETE_ITEM", payload: item });
  };

  const onItemAddBack = (item) => {
    dispatch({type: "ADD_ITEMS", payload: item})
    const arr = removedItem.filter(i => i !== item)
    setRemovedItem(arr)
  }

  const [isAddItem, setIsAddItem] = useState(false);
  const [error, setError] = useState(null);
  const [isDateReadOnly, setIsDateReadOnly] = useState(true)

  return (
    <>
      <Col label="Kode Surat Jalan" name="id" value={sjState?.id} isReadOnly />
      <DateCol
        label="Tanggal Surat Jalan"
        name="tanggalSJ"
        value={getFirebaseDate(sjState?.tanggalSJ)}
        endDate={new Date()}
        isReadOnly={isDateReadOnly}
        onChange={(opt) => dispatch({ type: "DATE", payload: opt })}
      >
        <span
          className="p-2 bg-slate-700 hover:bg-slate-800 text-gray-100 rounded-xl cursor-pointer text-xs"
          onClick={() => setIsDateReadOnly(!isDateReadOnly)}
        >
          {isDateReadOnly ? "Edit Tanggal" : "Kunci Tanggal"}
        </span>
      </DateCol>
      <Col
        label="Jenis Kendaraan"
        name="jenisKendaraan"
        value={sjState?.jenisKendaraan}
        onChange={(e) =>
          dispatch({ type: "VEHICLE_KIND", payload: e.target.value })
        }
        style="bg-white"
      />
      <Col
        label="No. Pol"
        name="noPol"
        value={sjState?.noPol}
        onChange={(e) => {
          dispatch({ type: "VEHICLE_NUMBER", payload: e.target.value });
        }}
        style="bg-white"
      />
      {type === "list" && (
        <>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-wrap">Item Barang</span>
            <button
              type="button"
              onClick={() => setIsAddItem(!isAddItem)}
              className={`${!sjState.kodeKlien ? "bg-blue-100" : "bg-blue-500"} px-3 py-1 text-white rounded-md text-sm flex items-center gap-1 transition-all duration-50`}
              disabled={!sjState.kodeKlien}
            >
              <span
                className={`transition-transform duration-50 ${
                  isAddItem ? "rotate-45" : "rotate-0"
                }`}
              >
                <PlusIcon className="h-4" />
              </span>

              {isAddItem ? (
                <p className="w-15 text-xs">Tutup</p>
              ) : (
                <p className="w-15 text-xs">Tambah</p>
              )}
            </button>
          </div>
          <SelectCol
            label=""
            name="items"
            value={sjState?.items}
            onChange={(opt) => dispatch({ type: "SELECT_ITEM", payload: opt })}
            data={itemList}
            isReadOnly={!sjState?.kodeKlien || !isAddItem}
            isMulti
            components={{ selectStyles }}
            styles={{
              multiValueRemove: (base) => ({
                ...base,
                visibility: "hidden",
                marginRight: "-18px",
              }),
            }}
            isFocused={isAddItem}
            place="bottom"
          />
          {/* {console.log(sjState?.items)} */}
          {sjState?.items &&
            sjState.items.map((item) => (
              <div
                key={item.value?.id}
                className="w-[65%] bg-white py-2 px-4 rounded-xl my-5 mx-auto text-xs"
              >
                <div className="flex items-center gap-2 md:justify-between flex-col md:flex-row">
                  <div className="flex flex-col">
                    <span>{item.value?.id}</span>
                    <div className="flex flex-col md:flex-row md:gap-1">
                      <span>{item.value.namaBarang}</span>{" "}
                      <span>
                        ({item.value.jumlahFinal} {item.value.satuan.value})
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <span
                      className="cursor-pointer text-amber-500 hover:text-amber-700"
                      onClick={() => onSelectedItemEdit(item.value)}
                    >
                      Edit
                    </span>
                    <div className="">|</div>
                    <span
                      className="cursor-pointer text-red-500 hover:text-red-700"
                      onClick={() => onSelectedItemRemove(item)}
                    >
                      <TrashIcon className="h-5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          {removedItem.length > 0 && <p>Removed Item?</p>}
          {removedItem &&
            removedItem.map((item) => (
              <div
                key={item.value.id}
                className="w-[65%] bg-white py-2 px-4 rounded-xl my-5 mx-auto"
              >
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <span>{item.value.id}</span>
                    <div>
                      <span>{item.value.namaBarang}</span>{" "}
                      <span>
                        ({item.value.jumlahFinal} {item.value.satuan.value})
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="">|</div>
                    <span
                      className="cursor-pointer text-slate-500 hover:text-slate-700"
                      onClick={() => onSelectedItemAddBack(item)}
                    >
                      <PlusIcon className="h-5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </>
      )}
      {/* {console.log(sjState.items)} */}
      {type === "custom" && (
        <>
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm text-wrap">Items*</span>
              <button
                type="button"
                onClick={onAddItem}
                className={`${!sjState.kodeKlien ? "bg-blue-100" : "bg-blue-500"} px-3 py-1 text-white rounded-md text-sm flex items-center cursor-pointer`}
                disabled={!sjState.kodeKlien}
              >
                <PlusIcon className="h-5" /> Tambah
              </button>
            </div>

            {sjState.items &&
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
                    isReadOnly={item.value.satuan}
                  />
                  <span
                    className="px-2 py-1 bg-amber-400 rounded-lg cursor-pointer"
                    onClick={() =>
                      dispatch({
                        type: "UPDATE_ITEM_UNIT",
                        payload: { i, opt: null },
                      })
                    }
                  >
                    Ubah Satuan
                  </span>
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
                      value={item.value.jumlahRoll}
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
            {removedItem.length > 0 && <p>Removed Item?</p>}
            {removedItem &&
              removedItem.map((item) => (
                <div
                  key={item.id}
                  className="w-[65%] bg-white py-2 px-4 rounded-xl my-5 mx-auto"
                >
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span>{item.value.id}</span>
                      <div>
                        <span>{item.value.namaBarang}</span>{" "}
                        <span>
                          ({item.value.jumlahFinal} {item.value.satuan.value})
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <div className="">|</div>
                      <span
                        className="cursor-pointer text-slate-500 hover:text-slate-700"
                        onClick={() => onItemAddBack(item)}
                      >
                        <PlusIcon className="h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </>
  );
}
