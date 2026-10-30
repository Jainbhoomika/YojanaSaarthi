
import { useState } from 'react'
import './App.css'

function CustomSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="custom-select">
      <button
        type="button"
        className="custom-select-trigger"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>{value || placeholder}</span>
        <span className="custom-select-arrow">
          {open ? '⌃' : '⌄'}
        </span>
      </button>

      {open && (
        <div className="custom-select-menu" role="listbox">
         {(options || []).map((option) => (
            <button
              type="button"
              key={option}
              className={`custom-select-option ${
                value === option ? 'selected' : ''
              }`}
              role="option"
              aria-selected={value === option}
              onClick={() => {
                onChange({
                  target: { name, value: option },
                })
                setOpen(false)
              }}
            >
              {option}
              {value === option && <span>✓</span>}
            </button>
          ))}
        </div>
      )}

      {required && (
        <input
          type="text"
          tabIndex={-1}
          value={value}
          required
          aria-hidden="true"
          className="custom-select-validation"
          onChange={() => {}}
        />
      )}
    </div>
  )
}

export default CustomSelect
