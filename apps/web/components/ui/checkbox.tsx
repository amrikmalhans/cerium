import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, ...props }, ref) => {
    return (
      <div className="relative inline-block h-4 w-4">
        <input
          type="checkbox"
          checked={checked}
          className={cn(
            "absolute inset-0 h-4 w-4 cursor-pointer opacity-0 z-10",
            className
          )}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 border-2 transition-colors",
            "border-black bg-white",
            "dark:border-white dark:bg-black",
            checked && "bg-black border-black dark:bg-white dark:border-white"
          )}
        >
          {checked && (
            <svg
              className="h-full w-full"
              fill="none"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                fill="currentColor"
                className="text-white dark:text-black"
              />
            </svg>
          )}
        </div>
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
