import { useEffect, useState } from "react";

export default function SearchFilter({ setFilter }) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    setFilter(search)
  }, [search, setFilter]);

  return (
    <input
      type="text"
      name="search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white mb-3`}
      placeholder="Cari..."
    />
  );
}
