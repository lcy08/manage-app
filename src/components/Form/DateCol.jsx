import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export default function DateCol({
  isTwoCol = false,
  label,
  value,
  onChange,
  startDate = null,
  endDate = null,
  showTimeSelect= false,
  isRequired = true,
  isReadOnly = false,
  children,
}) {
  return (
    <div className={isTwoCol ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <span>
          {label} {isRequired && <>*</>}
        </span>
        <DatePicker
          selected={value}
          wrapperClassName={`w-full`}
          calendarClassName="w-61"
          onChange={onChange}
          dateFormat="dd/MM/yyyy"
          className={`w-full px-3 py-2 text-sm border rounded ${
            isReadOnly ? "bg-gray-200 text-gray-600" : "bg-white"
          }`}
          minDate={startDate}
          maxDate={endDate < new Date() ? endDate : new Date()}
          disabled={isReadOnly}
          required={isRequired}
          showTimeSelect={showTimeSelect}
        />
      </label>
      {children}
    </div>
  );
}
