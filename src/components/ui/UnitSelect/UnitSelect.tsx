import React from 'react';

interface UnitSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value: string;
  onChangeValue: (value: string) => void;
}

export const UNIT_OPTIONS = [
  { value: 'uΩ', label: 'uΩ' },
  { value: 'mΩ', label: 'mΩ' },
  { value: 'Ω', label: 'Ω' },
  { value: 'kΩ', label: 'kΩ' },
  { value: 'MΩ', label: 'MΩ' },
  { value: 'GΩ', label: 'GΩ' },
  { value: 'uV', label: 'uV' },
  { value: 'mV', label: 'mV' },
  { value: 'V', label: 'V' },
  { value: 'kV', label: 'kV' },
  { value: 'uA', label: 'uA' },
  { value: 'mA', label: 'mA' },
  { value: 'A', label: 'A' },
  { value: 'ms', label: 'ms' },
  { value: 's', label: 's' },
  { value: '%', label: '%' }
];

export function UnitSelect({ value, onChangeValue, className, ...props }: UnitSelectProps) {
  return (
    <select
      className={`form-input ${className || ''}`}
      value={value}
      onChange={(e) => onChangeValue(e.target.value)}
      {...props}
    >
      {UNIT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
