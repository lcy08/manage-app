import { useRef, useEffect } from 'react'

import Select from "react-select";

export default function SelectCol({
  isTwoCol = false,
  label,
  name,
  value,
  onChange,
  isReadOnly = false,
  isRequired = true,
  isClearable = false,
  isRtl = false,
  isMulti = false,
  isCloseMenu = true,
  data,
  style = null,
  styles = {},
  children,
  place="top",
  isFocused = false
}) {
  const selectRef = useRef(null)

  useEffect(() => {
    if (isFocused) {
      selectRef.current?.focus()
    }
  }, [isFocused])

  return (
    <div
      className={`${isTwoCol ? "md:col-span-2" : ""} ${style ?? ""} p-0 m-0`}
    >
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <span>
          {label}
        </span>
        {/* <p className="font-bold text-blue-900 mb-3">{value}</p> */}
        <Select
          className="basic-single"
          classNamePrefix="select"
          options={data}
          name={name}
          value={value}
          onChange={(option) => {
            onChange(option);
          }}
          className={`w-full px-1 py-1 border border-gray-300 rounded-md ${
            isReadOnly ? "bg-gray-200 text-gray-600" : "bg-white"
          }`}
          isSearchable
          isDisabled={isReadOnly}
          isRequired={isRequired}
          isClearable={isClearable}
          isRtl={isRtl}
          isMulti={isMulti}
          closeMenuOnSelect={isCloseMenu}
          menuPlacement={place}
          styles={styles}
          ref={selectRef}
          openMenuOnFocus={isFocused}
        />
      </label>
      {children}
    </div>
  );
}
