export default function UnitCol({
  isTwoCol = false,
  label,
  type = "text",
  name,
  value,
  satuan,
  onChange,
  list = undefined,
  style = null,
  isRequired = true,
  isReadOnly = false,
  children,
}) {
  return (
    <div className={isTwoCol ? "md:col-span-2" : ""}>
      <label className="grid grid-cols-4 text-sm font-medium text-gray-700 mb-1">
        <span>
          {label} {isRequired && <>*</>}
        </span>
        <div className="flex items-center rounded-md bg-white/5 pr-3 outline-1 -outline-offset-1 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-500">
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isReadOnly ? "bg-gray-200 text-gray-600" : "bg-white"} pr-3 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6 ${style ?? ""}`}
            list={list}
            placeholder={label}
            required={isRequired}
            readOnly={isReadOnly}
            onInvalid={(e) =>
              e.target.setCustomValidity("Mohon isi bagian form ini")
            }
            onInput={(e) => e.target.setCustomValidity("")}
          />
          <div className="shrink-0 ml-3 text-base text-gray-600 select-none sm:text-sm/6">
            {satuan}
          </div>
        </div>
      </label>

      {/* {(isRequired && !value) &&
        <p className="error">Isi data sebelum submit</p>
      } */}

      {children}
    </div>
  );
}
