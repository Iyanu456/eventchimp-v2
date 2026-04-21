"use client";

import {
  Children,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type OptionElement = ReactElement<{
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
}>;

type SelectOption = {
  value: string;
  label: string;
  disabled: boolean;
};

type SelectChangeEvent = {
  target: {
    value: string;
  };
  currentTarget: {
    value: string;
  };
};

type SelectProps = {
  children: ReactNode;
  className?: string;
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  onChange?: (event: SelectChangeEvent) => void;
  searchPlaceholder?: string;
};

const getOptionLabel = (children: ReactNode): string => {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getOptionLabel).join("").trim();
  }

  if (isValidElement(children)) {
    return getOptionLabel(children.props.children);
  }

  return "";
};

const optionFromElement = (child: ReactNode): SelectOption | null => {
  if (!isValidElement(child)) {
    return null;
  }

  const option = child as OptionElement;
  const value = option.props.value ?? getOptionLabel(option.props.children);

  return {
    value: String(value),
    label: getOptionLabel(option.props.children),
    disabled: Boolean(option.props.disabled)
  };
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      children,
      value,
      defaultValue,
      onChange,
      disabled,
      required,
      name,
      id,
      searchPlaceholder = "Search options...",
    },
    ref
  ) => {
    const generatedId = useId();
    const triggerId = id ?? generatedId;
    const listboxId = `${triggerId}-listbox`;
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const options = useMemo(
      () => Children.toArray(children).map(optionFromElement).filter(Boolean) as SelectOption[],
      [children]
    );
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(String(defaultValue ?? value ?? ""));
    const [query, setQuery] = useState("");
    const currentValue = value !== undefined ? String(value) : internalValue;

    const selectedOption = options.find((option) => option.value === currentValue);
    const visibleOptions = options.filter((option) =>
      option.label.toLowerCase().includes(query.trim().toLowerCase())
    );

    const emitChange = (nextValue: string) => {
      setInternalValue(nextValue);
      onChange?.({
        target: { value: nextValue },
        currentTarget: { value: nextValue }
      });
    };

    const selectOption = (option: SelectOption) => {
      if (option.disabled) {
        return;
      }

      emitChange(option.value);
      setIsOpen(false);
      setQuery("");
    };

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(String(value));
      }
    }, [value]);

    useEffect(() => {
      const handlePointerDown = (event: MouseEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) {
          setIsOpen(false);
          setQuery("");
        }
      };

      document.addEventListener("mousedown", handlePointerDown);
      return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    useEffect(() => {
      if (isOpen) {
        window.setTimeout(() => searchRef.current?.focus(), 0);
      }
    }, [isOpen]);

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(true);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    return (
      <div ref={rootRef} className="relative w-full">
        <button
          ref={ref}
          id={triggerId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={() => {
            if (!disabled) {
              setIsOpen((current) => !current);
            }
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "group flex h-12 w-full items-center justify-between gap-3 rounded-[14px] border border-transparent bg-[#f3f2f6] px-4 text-left text-sm text-ink outline-none transition",
            "focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/8",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isOpen && "border-accent bg-white ring-4 ring-accent/8",
            className
          )}
        >
          <span className={cn("min-w-0 truncate", !selectedOption?.value && "text-muted")}>
            {selectedOption?.label || options[0]?.label || "Select an option"}
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#766d85]  transition group-hover:text-accent">
            <ChevronDown className={cn("h-4 w-4 transition", isOpen && "rotate-180")} />
          </span>
        </button>

        {name ? (
          <input
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            name={name}
            required={required}
            value={currentValue}
            onChange={() => undefined}
          />
        ) : null}

        {isOpen ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[18px] border border-line bg-white p-2 shadow-[0_22px_60px_rgba(39,20,63,0.16)]">
            <div className="flex h-10 items-center gap-2 rounded-[12px] bg-[#f6f3fa] px-3 text-[#8a8295]">
              <Search className="h-4 w-4 shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-[#aaa4b3]"
              />
            </div>

            <div id={listboxId} role="listbox" aria-labelledby={triggerId} className="mt-2 max-h-64 overflow-y-auto pr-1">
              {visibleOptions.length ? (
                visibleOptions.map((option) => {
                  const isSelected = option.value === currentValue;

                  return (
                    <button
                      key={`${option.value}-${option.label}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      className={cn(
                        "flex min-h-11 w-full items-center justify-between gap-3 rounded-[12px] px-3 text-left text-sm transition",
                        isSelected ? "bg-accent/10 font-semibold text-accent" : "text-[#4f485d] hover:bg-[#f6f3fa]",
                        option.disabled && "cursor-not-allowed opacity-45"
                      )}
                      onClick={() => selectOption(option)}
                    >
                      <span className="min-w-0 truncate">{option.label}</span>
                      {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-5 text-center text-sm text-muted">No matching options</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
