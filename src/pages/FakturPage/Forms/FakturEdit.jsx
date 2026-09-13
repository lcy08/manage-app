import { useState } from "react";

import DateCol from "../../../components/Form/DateCol";
import Col from "../../../components/Form/Col";
import SelectCol from "../../../components/Form/SelectCol";

import { components } from "react-select";

import {
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

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

const formatRupiah = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  return new Intl.NumberFormat("id-ID").format(num);
};

const unformatRupiah = (str) => {
  const cleaned = str.replace(/[^\d]/g, "");
  return cleaned === "" ? "" : Number(cleaned);
};

const selectStyles = (props) => {
  return (
    <components.MultiValueRemove {...props}>""</components.MultiValueRemove>
  );
};

export default function FakturEdit({
  fakturState,
  dispatch,
  removedSJ,
  setRemovedSJ,
  sjList,
}) {
  // SECTION: CHANGE INPUT OF SJ DATA
  const onSelectedSJItemChange = async (id, itemId, value) => {
    await dispatch({
      type: "UPDATE_HARGA_ITEM_SJ",
      payload: { id, itemId, value },
    });
  };

  const onSelectedSJRemove = (sj) => {
    setRemovedSJ([...removedSJ, sj]);

    const arr = fakturState.SJ.filter((i) => i.label !== sj.label);
    dispatch({ type: "SELECT_SJ", payload: arr });
  };

  const onSelectedSJAddBack = (sj) => {
    const fakturSJ = [...fakturState.SJ, sj];
    dispatch({ type: "SELECT_SJ", payload: fakturSJ });
    const arr = removedSJ.filter((i) => i.label !== sj.label);
    setRemovedSJ(arr);
  };
  // !SECTION

  const [isAddSJ, setIsAddSJ] = useState(false)
  const [isDateReadOnly, setIsDateReadOnly] = useState(true);

  return (
    <>
      <Col label="Kode Faktur" name="id" value={fakturState.id} isReadOnly />
      <DateCol
        label="Tanggal Faktur"
        name="tanggalFaktur"
        value={getFirebaseDate(fakturState?.tanggalFaktur)}
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
      <>
        <div className="flex items-center justify-between my-5">
          <span className="text-sm text-wrap">Surat Jalan</span>
          <button
            type="button"
            onClick={() => setIsAddSJ(!isAddSJ)}
            className={`${!fakturState.kodeKlien ? "bg-blue-100" : "bg-blue-500"} px-3 py-1 text-white rounded-md text-sm flex items-center gap-1 transition-all duration-50`}
            disabled={!fakturState.kodeKlien}
          >
            <span
              className={`transition-transform duration-50 ${
                isAddSJ ? "rotate-45" : "rotate-0"
              }`}
            >
              <PlusIcon className="h-4" />
            </span>

            {isAddSJ ? (
              <p className="w-15 text-xs">Tutup</p>
            ) : (
              <p className="w-15 text-xs">Tambah</p>
            )}
          </button>
        </div>
        <SelectCol
          label=""
          name="SJ"
          value={fakturState?.SJ}
          onChange={(opt) => dispatch({ type: "SELECT_SJ", payload: opt })}
          data={sjList}
          isReadOnly={!fakturState?.kodeKlien || !isAddSJ}
          isMulti
          components={{ selectStyles }}
          styles={{
            multiValueRemove: (base) => ({
              ...base,
              visibility: "hidden",
              marginRight: "-18px",
            }),
          }}
          isFocused={isAddSJ}
          place="bottom"
        />
        {fakturState?.SJ.map((item) => (
          <div
            key={item.value.id}
            className="w-[90%] bg-white py-2 px-4 rounded-xl my-5 mx-auto"
          >
            <div className="flex justify-between items-center">
              <span className="italic font-semibold">{item.value.id}</span>
              <span
                className="cursor-pointer text-red-500 hover:text-red-700"
                onClick={() => onSelectedSJRemove(item)}
              >
                <TrashIcon className="h-5" />
              </span>
            </div>
            <span className="text-sm">
              {item.value.jumlahItem} item dengan kendaraan {item.value.noPol}
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
        {removedSJ.length > 0 && <p>Removed SJ?</p>}
        {removedSJ &&
          removedSJ.map((item) => (
            <div
              key={item.value.id}
              className="w-[90%] bg-white py-2 px-4 rounded-xl my-5 mx-auto"
            >
              <div className="flex justify-between items-center">
                <span className="italic font-semibold">{item.value.id}</span>
                <span
                  className="cursor-pointer text-slate-500 hover:text-slate-700"
                  onClick={() => onSelectedSJAddBack(item)}
                >
                  <PlusIcon className="h-5" />
                </span>
              </div>
              <span className="text-sm">
                {item.value.jumlahItem} item dengan kendaraan {item.value.noPol}
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
                        item.value.id,
                        i.value.id,
                        unformatRupiah(e.target.value),
                      )
                    }
                    isReadOnly
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
      </>
    </>
  );
}
