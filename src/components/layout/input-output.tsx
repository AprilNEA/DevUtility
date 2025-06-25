import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";

export type InputOutputLayoutProps = {
  inputLabel?: MessageDescriptor;
  inputToolbar?: React.ReactNode;
  inputProps?: React.ComponentProps<"textarea">;

  outputLabel?: MessageDescriptor;
  outputToolbar?: React.ReactNode;
  outputBottomBar?: React.ReactNode;
  outputProps?: React.ComponentProps<"textarea">;
};

const InputOutputLayout = ({
  inputLabel = msg`Input`,
  inputToolbar,
  inputProps,
  outputLabel = msg`Output`,
  outputToolbar,
  outputBottomBar,
  outputProps,
}: InputOutputLayoutProps) => {
  const { t } = useLingui();
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        {/* Input Section */}
        <div className="flex flex-col gap-2 bg-background/95 p-3 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-foreground/80">
              {t(inputLabel)}
            </span>
            <div className="flex items-center gap-1">{inputToolbar}</div>
          </div>
          <Textarea
            {...inputProps}
            className={cn(
              "flex-grow border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring",
              inputProps?.className,
            )}
            spellCheck="false"
          />
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-2 bg-background/95 p-3 rounded-lg">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-foreground/80">
              {t(outputLabel)}
            </span>
            <div className="flex items-center gap-1">{outputToolbar}</div>
          </div>
          <Textarea
            {...outputProps}
            className={cn(
              "flex-grow border-input text-foreground font-mono text-sm resize-none focus:ring-ring focus:border-ring",
              outputProps?.className,
            )}
            spellCheck="false"
          />
          {outputBottomBar}
        </div>
      </div>
    </div>
  );
};

export default InputOutputLayout;
