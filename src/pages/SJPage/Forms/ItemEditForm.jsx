import { useCallback, useEffect, useState } from "react";
import ItemMasukForm from "../../ItemPage/Forms/ItemMasukForm";
import ItemProsesForm from "../../ItemPage/Forms/ItemProsesForm";
import ItemSelesaiForm from "../../ItemPage/Forms/ItemSelesaiForm";
import ItemSiapKirimForm from "../../ItemPage/Forms/ItemSiapKirimForm";
import ItemSJForm from "../../ItemPage/Forms/ItemSJForm";

export default function ItemEditForm({
  activeCId,
  selectedItem,
  setSelectedItem,
  setShowItemEdit,
}) {
  const [item, setItem] = useState(selectedItem);
  const handleItemChange = useCallback((update) => {
    setItem(update);
  }, []);

  useEffect(() => {
    setSelectedItem(item);
  }, [item, setSelectedItem]);

  return (
    <>
      <div className="border-t-2 border-slate-600"></div>
      <p className="text-center mb-4 text-xl bg-gray-300 p-2">Barang Masuk</p>
      <ItemMasukForm
        isDetail={false}
        isEdit={true}
        activeCId={activeCId}
        itemInfo={item}
        onChange={handleItemChange}
        onEdit={false}
        onCancel={false}
        onSubmit={() => {
          setShowItemEdit(false);
          setSelectedItem(null);
        }}
        isAddProses={false}
        isSJEdit
      />
      <div className="border-t-2 border-slate-600"></div>
      <p className="text-center mb-4 text-xl bg-gray-300 p-2">Proses Barang</p>
      <ItemProsesForm
        isDetail={false}
        isEdit={true}
        activeCId={activeCId}
        itemInfo={item}
        onChange={handleItemChange}
        onEdit={false}
        onCancel={false}
        onSubmit={() => {
          setShowItemEdit(false);
          setSelectedItem(null);
        }}
        isAddSelesai={false}
        isSJEdit
      />
      <div className="border-t-2 border-slate-600"></div>
      <p className="text-center mb-4 text-xl bg-gray-300 p-2">Barang Selesai</p>
      <ItemSelesaiForm
        isDetail={false}
        isEdit={true}
        activeCId={activeCId}
        itemInfo={item}
        onChange={handleItemChange}
        onEdit={false}
        onCancel={false}
        onSubmit={() => {
          setShowItemEdit(false);
          setSelectedItem(null);
        }}
        isAddSiapKirim={false}
        isSJEdit
      />
      <div className="border-t-2 border-slate-600"></div>
      <p className="text-center mb-4 text-xl bg-gray-300 p-2">
        Barang Siap Kirim
      </p>
      <ItemSiapKirimForm
        isDetail={false}
        isEdit={true}
        activeCId={activeCId}
        itemInfo={item}
        onChange={handleItemChange}
        onEdit={false}
        onCancel={false}
        onSubmit={() => {
          setShowItemEdit(false);
          setSelectedItem(null);
        }}
        isSJEdit
      />
      <div className="border-t-2 border-slate-600 mt-6"></div>
      <p className="text-center mb-4 text-xl bg-gray-300 p-2">
        Barang ke Surat Jalan
      </p>
      <ItemSJForm
        activeCId={activeCId}
        itemInfo={item}
        onChange={handleItemChange}
        isSJEdit
      />
    </>
  );
}
