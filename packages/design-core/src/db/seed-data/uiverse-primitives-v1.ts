/**
 * UIverse Primitives — Curated community UI primitives inspired by UIverse.io
 * Buttons, inputs, toggles, checkboxes, and form elements.
 * All components use Tailwind CSS with embedded CSS for animations where needed.
 * License: MIT — free for commercial use.
 */
export const uiversePrimitivesV1 = {
  pack: {
    name: 'UIverse Primitives',
    slug: 'uiverse-primitives-v1',
    category: 'ui-library',
    description:
      'Curated community UI primitives — buttons, inputs, toggles, checkboxes, and form elements. Inspired by UIverse.io, MIT licensed.',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#6366F1' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#4F46E5' },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: '#8B5CF6' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#06B6D4' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#F9FAFB' },
    { tokenKey: 'color.surface-alt', tokenType: 'color' as const, tokenValue: '#F3F4F6' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#111827' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#6B7280' },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: '#D1D5DB' },
    { tokenKey: 'color.success', tokenType: 'color' as const, tokenValue: '#22C55E' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '6px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '12px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    {
      tokenKey: 'font.heading',
      tokenType: 'font' as const,
      tokenValue: 'Inter, system-ui, sans-serif',
    },
    {
      tokenKey: 'font.body',
      tokenType: 'font' as const,
      tokenValue: 'Inter, system-ui, sans-serif',
    },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'JetBrains Mono, monospace' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '24px' },
  ],
  recipes: [
    {
      name: 'Gradient Button',
      type: 'button' as const,
      codeTemplate: `interface GradientButtonProps extends React.ComponentProps<"button"> {
  label?: string
}

export function GradientButton({ label = "{label}", className, children, ...props }: GradientButtonProps) {
  return (
    <>
      <style>{\`
        @keyframes uv-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .uv-gradient-btn {
          background: linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899, #6366F1);
          background-size: 300% 300%;
          animation: uv-gradient-shift 4s ease infinite;
        }
        .uv-gradient-btn:hover {
          animation-duration: 1.5s;
        }
      \`}</style>
      <button
        className={\`uv-gradient-btn inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none \${className ?? ""}\`}
        {...props}
      >
        {children ?? label}
      </button>
    </>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Button text label' },
        },
      },
      aiUsageRules:
        'Use GradientButton for primary call-to-action buttons that need visual emphasis. The animated gradient background shifts through indigo, violet, and pink. Works on both light and dark backgrounds. Limit to 1-2 per view to maintain visual hierarchy.',
    },
    {
      name: 'Outline Button',
      type: 'button' as const,
      codeTemplate: `interface OutlineButtonProps extends React.ComponentProps<"button"> {
  label?: string
}

export function OutlineButton({ label = "{label}", className, children, ...props }: OutlineButtonProps) {
  return (
    <>
      <style>{\`
        .uv-outline-btn {
          position: relative;
          overflow: hidden;
          z-index: 0;
        }
        .uv-outline-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 0%;
          height: 100%;
          background-color: #6366F1;
          transition: width 0.35s ease;
          z-index: -1;
        }
        .uv-outline-btn:hover::before {
          width: 100%;
        }
        .uv-outline-btn:hover {
          color: #ffffff;
          border-color: #6366F1;
        }
      \`}</style>
      <button
        className={\`uv-outline-btn inline-flex items-center justify-center rounded-lg border-2 border-indigo-500 px-6 py-2.5 text-sm font-semibold text-indigo-600 transition-colors duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none \${className ?? ""}\`}
        {...props}
      >
        {children ?? label}
      </button>
    </>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Button text label' },
        },
      },
      aiUsageRules:
        'Use OutlineButton for secondary actions alongside a solid primary button. The fill-in animation on hover provides satisfying visual feedback. The border color fills the background from left to right on hover. Best on light backgrounds.',
    },
    {
      name: '3D Push Button',
      type: 'button' as const,
      codeTemplate: `interface PushButtonProps extends React.ComponentProps<"button"> {
  label?: string
}

export function PushButton({ label = "{label}", className, children, ...props }: PushButtonProps) {
  return (
    <button
      className={\`inline-flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_0_0_#4338CA] transition-all duration-100 hover:shadow-[0_2px_0_0_#4338CA] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none \${className ?? ""}\`}
      {...props}
    >
      {children ?? label}
    </button>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Button text label' },
        },
      },
      aiUsageRules:
        'Use PushButton for playful, interactive UIs such as games, onboarding flows, or creative landing pages. The 3D shadow creates a physical push-down effect on click. The translate-y and shadow reduction simulate a real button press. Works best on light backgrounds.',
    },
    {
      name: 'Floating Label Input',
      type: 'input' as const,
      codeTemplate: `interface FloatingLabelInputProps extends React.ComponentProps<"input"> {
  label?: string
}

export function FloatingLabelInput({ label = "{placeholder}", className, id, ...props }: FloatingLabelInputProps) {
  const inputId = id ?? "uv-floating-" + Math.random().toString(36).slice(2, 9)
  return (
    <>
      <style>{\`
        .uv-float-group {
          position: relative;
        }
        .uv-float-input {
          border: 1.5px solid #D1D5DB;
          border-radius: 8px;
          padding: 16px 12px 6px 12px;
          font-size: 14px;
          width: 100%;
          outline: none;
          background: transparent;
          transition: border-color 0.2s ease;
          color: #111827;
        }
        .uv-float-input:focus {
          border-color: #6366F1;
        }
        .uv-float-label {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: #6B7280;
          pointer-events: none;
          transition: all 0.2s ease;
          background: white;
          padding: 0 4px;
        }
        .uv-float-input:focus + .uv-float-label,
        .uv-float-input:not(:placeholder-shown) + .uv-float-label {
          top: 0;
          font-size: 11px;
          color: #6366F1;
          transform: translateY(-50%);
        }
      \`}</style>
      <div className={\`uv-float-group \${className ?? ""}\`}>
        <input
          id={inputId}
          className="uv-float-input"
          placeholder=" "
          {...props}
        />
        <label htmlFor={inputId} className="uv-float-label">{label}</label>
      </div>
    </>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Label text that floats above the input on focus' },
          type: { type: 'string', enum: ['text', 'email', 'password', 'number', 'tel', 'url'] },
        },
      },
      aiUsageRules:
        'Use FloatingLabelInput for forms that need a clean, modern look. The placeholder text animates up to become a persistent label on focus or when the input has a value, similar to Material Design. Use the label prop to set the floating label text. Always use a visible placeholder of " " (space) for the CSS to work correctly.',
    },
    {
      name: 'Search Input',
      type: 'input' as const,
      codeTemplate: `interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function SearchInput({ placeholder = "{placeholder}", value: controlledValue, onChange, className }: SearchInputProps) {
  const [internalValue, setInternalValue] = React.useState("")
  const value = controlledValue ?? internalValue
  const handleChange = (v: string) => {
    setInternalValue(v)
    onChange?.(v)
  }
  return (
    <div className={\`relative flex items-center transition-all duration-300 w-64 focus-within:w-80 \${className ?? ""}\`}>
      <svg className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => handleChange("")}
          className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500 transition-colors hover:bg-gray-300 hover:text-gray-700"
          aria-label="Clear search"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          placeholder: { type: 'string', description: 'Placeholder text for the search field' },
          value: { type: 'string', description: 'Controlled input value' },
        },
      },
      aiUsageRules:
        'Use SearchInput for search bars in navigation, sidebars, or filter panels. The input expands on focus to give more typing room. A clear button appears when there is a value. The magnifying glass icon is embedded inline. Use the onChange callback to handle search queries.',
    },
    {
      name: 'Password Strength Input',
      type: 'input' as const,
      codeTemplate: `interface PasswordStrengthInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: "Weak", color: "#EF4444" }
  if (score <= 2) return { score, label: "Fair", color: "#F59E0B" }
  if (score <= 3) return { score, label: "Good", color: "#3B82F6" }
  return { score, label: "Strong", color: "#22C55E" }
}

export function PasswordStrengthInput({ placeholder = "{placeholder}", value: controlledValue, onChange, className }: PasswordStrengthInputProps) {
  const [internalValue, setInternalValue] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const value = controlledValue ?? internalValue
  const strength = getStrength(value)
  const handleChange = (v: string) => {
    setInternalValue(v)
    onChange?.(v)
  }
  return (
    <div className={\`w-full \${className ?? ""}\`}>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
      {value.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: \`\${(strength.score / 5) * 100}%\`, backgroundColor: strength.color }}
            />
          </div>
        </div>
      )}
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          placeholder: { type: 'string', description: 'Placeholder text for the password field' },
          value: { type: 'string', description: 'Controlled input value' },
        },
      },
      aiUsageRules:
        'Use PasswordStrengthInput for registration and password-change forms. The component includes a show/hide toggle and a colored strength meter that evaluates length, uppercase, lowercase, digits, and special characters. The meter bar transitions smoothly between strength levels. Place below a label element.',
    },
    {
      name: 'iOS Toggle Switch',
      type: 'toggle' as const,
      codeTemplate: `interface ToggleSwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function ToggleSwitch({ checked: controlledChecked, onChange, disabled = false, className }: ToggleSwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(false)
  const checked = controlledChecked ?? internalChecked
  const toggle = () => {
    if (disabled) return
    const next = !checked
    setInternalChecked(next)
    onChange?.(next)
  }
  return (
    <button
      role="switch"
      type="button"
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      className={\`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 \${checked ? "bg-green-500" : "bg-gray-300"} \${className ?? ""}\`}
    >
      <span
        className={\`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 \${checked ? "translate-x-[22px]" : "translate-x-[2px]"}\`}
      />
    </button>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          checked: { type: 'boolean', description: 'Whether the toggle is on or off' },
          disabled: { type: 'boolean', description: 'Whether the toggle is disabled' },
        },
      },
      aiUsageRules:
        'Use ToggleSwitch for boolean settings like enabling notifications, dark mode, or feature flags. The iOS-style design features a smooth sliding circle that transitions from gray (off) to green (on). Supports both controlled and uncontrolled modes. Always pair with a visible label for accessibility.',
    },
    {
      name: 'Animated Checkbox',
      type: 'checkbox' as const,
      codeTemplate: `interface AnimatedCheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function AnimatedCheckbox({ checked: controlledChecked, onChange, label = "{label}", disabled = false, className }: AnimatedCheckboxProps) {
  const [internalChecked, setInternalChecked] = React.useState(false)
  const checked = controlledChecked ?? internalChecked
  const toggle = () => {
    if (disabled) return
    const next = !checked
    setInternalChecked(next)
    onChange?.(next)
  }
  return (
    <>
      <style>{\`
        @keyframes uv-checkmark-draw {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .uv-checkbox-checked .uv-checkmark-path {
          stroke-dasharray: 24;
          stroke-dashoffset: 0;
          animation: uv-checkmark-draw 0.3s ease forwards;
        }
        .uv-checkbox-unchecked .uv-checkmark-path {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
        }
      \`}</style>
      <label
        className={\`inline-flex items-center gap-2.5 select-none \${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} \${className ?? ""}\`}
        onClick={(e) => { e.preventDefault(); toggle(); }}
      >
        <div className={\`flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 \${checked ? "border-indigo-500 bg-indigo-500" : "border-gray-300 bg-white"} \${checked ? "uv-checkbox-checked" : "uv-checkbox-unchecked"}\`}>
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path className="uv-checkmark-path" d="M2 6l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    </>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          checked: { type: 'boolean', description: 'Whether the checkbox is checked' },
          label: { type: 'string', description: 'Label text displayed next to the checkbox' },
          disabled: { type: 'boolean', description: 'Whether the checkbox is disabled' },
        },
      },
      aiUsageRules:
        'Use AnimatedCheckbox for task lists, terms acceptance, or multi-select options. The SVG checkmark draws itself with a stroke-dasharray animation when checked, providing satisfying visual feedback. Supports both controlled and uncontrolled modes. The label prop renders text beside the checkbox.',
    },
    {
      name: 'Radio Card Group',
      type: 'radio' as const,
      codeTemplate: `interface RadioCardOption {
  value: string
  label: string
  description?: string
}

interface RadioCardGroupProps {
  options: RadioCardOption[]
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function RadioCardGroup({ options, value: controlledValue, onChange, className }: RadioCardGroupProps) {
  const [internalValue, setInternalValue] = React.useState(options[0]?.value ?? "")
  const value = controlledValue ?? internalValue
  const handleSelect = (v: string) => {
    setInternalValue(v)
    onChange?.(v)
  }
  return (
    <div className={\`grid gap-3 \${className ?? ""}\`} role="radiogroup">
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(option.value)}
            className={\`flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200 \${isSelected ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-500/10" : "border-gray-200 bg-white hover:border-gray-300"}\`}
          >
            <div className={\`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 \${isSelected ? "border-indigo-500" : "border-gray-300"}\`}>
              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />}
            </div>
            <div>
              <span className={\`text-sm font-medium \${isSelected ? "text-indigo-900" : "text-gray-900"}\`}>{option.label}</span>
              {option.description && (
                <p className={\`mt-0.5 text-xs \${isSelected ? "text-indigo-600" : "text-gray-500"}\`}>{option.description}</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                label: { type: 'string' },
                description: { type: 'string' },
              },
            },
            description: 'Array of radio options with value, label, and optional description',
          },
          value: { type: 'string', description: 'Currently selected value' },
        },
      },
      aiUsageRules:
        'Use RadioCardGroup for selecting between 2-5 mutually exclusive options such as plans, shipping methods, or payment types. Each option renders as a card with a radio indicator, label, and optional description. The selected card gets an indigo border highlight and tinted background. Supports controlled and uncontrolled modes.',
    },
    {
      name: 'OTP Input',
      type: 'input' as const,
      codeTemplate: `interface OTPInputProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function OTPInput({ length = 6, value: controlledValue, onChange, className }: OTPInputProps) {
  const [internalValue, setInternalValue] = React.useState("")
  const value = controlledValue ?? internalValue
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const digits = value.split("").concat(Array(length).fill("")).slice(0, length)

  const handleInput = (index: number, char: string) => {
    if (!/^[0-9]$/.test(char) && char !== "") return
    const arr = digits.slice()
    arr[index] = char
    const next = arr.join("")
    setInternalValue(next)
    onChange?.(next)
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\\D/g, "").slice(0, length)
    setInternalValue(pasted)
    onChange?.(pasted)
    const focusIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className={\`flex gap-2 \${className ?? ""}\`}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInput(i, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-10 rounded-lg border-2 border-gray-300 bg-white text-center text-lg font-semibold text-gray-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          aria-label={\`Digit \${i + 1}\`}
        />
      ))}
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          length: { type: 'number', description: 'Number of digit boxes, defaults to 6' },
          value: { type: 'string', description: 'Current OTP value' },
        },
      },
      aiUsageRules:
        'Use OTPInput for verification code entry during email confirmation, two-factor authentication, or phone verification flows. Each digit gets its own input box with auto-focus to the next box on input. Supports paste for the full code. The length prop controls how many boxes to render (default 6). Always provide a visible heading explaining what code to enter.',
    },
    {
      name: 'Pill Toggle Group',
      type: 'toggle' as const,
      codeTemplate: `interface PillToggleOption {
  value: string
  label: string
}

interface PillToggleGroupProps {
  options: PillToggleOption[]
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function PillToggleGroup({ options, value: controlledValue, onChange, className }: PillToggleGroupProps) {
  const [internalValue, setInternalValue] = React.useState(options[0]?.value ?? "")
  const value = controlledValue ?? internalValue
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [pillStyle, setPillStyle] = React.useState<React.CSSProperties>({})

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const activeIndex = options.findIndex((o) => o.value === value)
    const buttons = container.querySelectorAll<HTMLButtonElement>("[data-uv-pill-option]")
    const activeBtn = buttons[activeIndex]
    if (activeBtn) {
      setPillStyle({
        width: activeBtn.offsetWidth,
        transform: \`translateX(\${activeBtn.offsetLeft - container.offsetLeft}px)\`,
      })
    }
  }, [value, options])

  const handleSelect = (v: string) => {
    setInternalValue(v)
    onChange?.(v)
  }

  return (
    <div
      ref={containerRef}
      className={\`relative inline-flex items-center gap-0 rounded-full bg-gray-100 p-1 \${className ?? ""}\`}
    >
      <div
        className="absolute top-1 left-1 h-[calc(100%-8px)] rounded-full bg-white shadow-sm transition-all duration-300 ease-out"
        style={pillStyle}
      />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          data-uv-pill-option
          onClick={() => handleSelect(option.value)}
          className={\`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 \${value === option.value ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}\`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: { type: 'string' },
                label: { type: 'string' },
              },
            },
            description: 'Array of toggle options with value and label',
          },
          value: { type: 'string', description: 'Currently selected option value' },
        },
      },
      aiUsageRules:
        'Use PillToggleGroup for switching between 2-4 views or modes, such as "Monthly / Yearly" pricing toggles or tab-like navigation. The sliding pill background animates smoothly to follow the active selection. Best with short labels (1-2 words each). Place at the top of a section to control what content is displayed below.',
    },
    {
      name: 'Star Rating',
      type: 'input' as const,
      codeTemplate: `interface StarRatingProps {
  value?: number
  onChange?: (value: number) => void
  maxStars?: number
  readonly?: boolean
  className?: string
}

export function StarRating({ value: controlledValue, onChange, maxStars = 5, readonly = false, className }: StarRatingProps) {
  const [internalValue, setInternalValue] = React.useState(0)
  const [hoverValue, setHoverValue] = React.useState(0)
  const value = controlledValue ?? internalValue
  const displayValue = hoverValue || value

  const handleClick = (star: number) => {
    if (readonly) return
    setInternalValue(star)
    onChange?.(star)
  }

  return (
    <div
      className={\`inline-flex gap-1 \${readonly ? "" : "cursor-pointer"} \${className ?? ""}\`}
      onMouseLeave={() => !readonly && setHoverValue(0)}
      role="radiogroup"
      aria-label="Star rating"
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const star = i + 1
        const isFilled = star <= displayValue
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            className={\`transition-transform duration-150 \${readonly ? "cursor-default" : "hover:scale-110 active:scale-95"} disabled:opacity-100\`}
            aria-label={\`\${star} star\${star > 1 ? "s" : ""}\`}
          >
            <svg
              className={\`h-7 w-7 transition-colors duration-150 \${isFilled ? "text-amber-400" : "text-gray-300"}\`}
              fill={isFilled ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          value: { type: 'number', description: 'Current rating value (1 through maxStars)' },
          maxStars: { type: 'number', description: 'Total number of stars, defaults to 5' },
          readonly: {
            type: 'boolean',
            description: 'If true, the rating is display-only and not interactive',
          },
        },
      },
      aiUsageRules:
        'Use StarRating for product reviews, feedback forms, or displaying existing ratings. Stars fill with amber on hover for a live preview, and clicking selects the rating. Set readonly=true for display-only mode (e.g., showing average ratings). Supports controlled and uncontrolled modes. Always pair with a visible label or context explaining what is being rated.',
    },
  ],
};
