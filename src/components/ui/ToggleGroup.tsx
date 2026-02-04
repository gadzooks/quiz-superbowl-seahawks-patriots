interface ToggleOption {
  value: string;
  label: string;
  icon?: string;
  activeClass?: string;
}

interface ToggleGroupProps {
  name: string;
  value: string;
  options: [ToggleOption, ToggleOption]; // Exactly 2 options
  onChange: (value: string) => void;
  label?: string;
}

/**
 * Two-option toggle group component
 * Used for binary choices like open/closed, visible/hidden
 */
export function ToggleGroup({ name, value, options, onChange, label }: ToggleGroupProps) {
  return (
    <div className="admin-control-row">
      {label && <span className="admin-control-label">{label}</span>}
      <div className="admin-toggle-group">
        {options.map((option) => {
          const isActive = value === option.value;
          const className = isActive
            ? option.activeClass || 'admin-toggle-active-open'
            : 'admin-toggle-inactive';

          return (
            <label key={option.value} className={`admin-toggle-option ${className}`}>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isActive}
                onChange={() => onChange(option.value)}
              />
              {option.icon && `${option.icon} `}
              {option.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
