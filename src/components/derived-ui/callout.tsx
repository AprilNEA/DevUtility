import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  InfoIcon,
  CheckCircle2Icon,
  TriangleAlert,
  AlertCircle,
  MessageSquareQuote,
} from "lucide-react"

const calloutVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-base flex items-start gap-3 [&>svg]:size-5 [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:text-current",
  {
    variants: {
      variant: {
        info: "bg-blue-100 border-blue-400 text-blue-800",
        success: "bg-green-100 border-green-400 text-green-800",
        warning: "bg-amber-50 border-amber-400 text-amber-900",
        error: "bg-red-100 border-red-400 text-red-800",
        note: "bg-purple-50 border-purple-400 text-purple-800",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const icons = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: TriangleAlert,
  error: AlertCircle,
  note: MessageSquareQuote,
} as const

type CalloutProps = React.PropsWithChildren<
  React.ComponentProps<"div"> &
    VariantProps<typeof calloutVariants> & {
      title?: React.ReactNode
      icon?: React.ReactNode
    }
>

export function Callout({
  className,
  variant = "info",
  title,
  icon,
  children,
  ...props
}: CalloutProps) {
  const Icon = icons[variant as keyof typeof icons] || InfoIcon
  return (
    <div
      data-slot="callout"
      role="note"
      className={cn(calloutVariants({ variant }), className)}
      {...props}
    >
      {icon !== undefined ? icon : <Icon aria-hidden className="mt-0.5" />}
      <div>
        {title && (
          <div className="font-semibold leading-tight mb-0.5">{title}</div>
        )}
        <div className="text-base font-normal leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
