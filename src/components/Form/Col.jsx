export default function Col({
  isTwoCol = false,
  label,
  type = "text",
  name,
  value,
  onChange,
  list = undefined,
  style = null,
  isRequired = true,
  isReadOnly = false,
  children,
}) {
  return (
    <div className={`${isTwoCol ? "md:col-span-2" : ""}`}>
      <label className="grid grid-cols-4 text-sm font-medium text-gray-700 mb-1">
        <span>
          {label} {isRequired && <>*</>}
        </span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${isReadOnly ? "bg-gray-200 text-gray-600" : "bg-white"} ${style ?? ""}`}
          list={list}
          placeholder={label}
          required={isRequired}
          readOnly={isReadOnly}
          onInvalid={(e) =>
            e.target.setCustomValidity("Mohon isi bagian form ini")
          }
          onInput={(e) => e.target.setCustomValidity("")}
        />
      </label>

      {/* {(isRequired && !value) &&
        <p className="error">Isi data sebelum submit</p>
      } */}

      {children}
    </div>
  );
}
