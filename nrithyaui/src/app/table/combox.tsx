import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandList, 
  CommandItem 
} from "@/components/ui/command";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { UseFormSetValue } from "react-hook-form";
import { FrameworkType } from "./tableList";

interface ComboboxDemoProps {
  frameworks: FrameworkType[];
  name: string;
  resetFilter: boolean;
  setResetFilter: React.Dispatch<React.SetStateAction<boolean>>;
  setValue: UseFormSetValue<any>;
  field: string;
  isUpdate?: boolean;
}

const ComboboxDemo: React.FC<ComboboxDemoProps> = ({ 
  frameworks, 
  name, 
  resetFilter, 
  setResetFilter, 
  setValue, 
  field, 
  isUpdate 
}) => {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState("");
  const commandGroupRef = React.useRef<HTMLDivElement>(null);
  const commandListRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (resetFilter) {
      setValues("");
    }
  }, [resetFilter]);

  React.useEffect(() => {
    const scrollToTop = () => {
      // Multiple scroll methods to ensure top positioning
      if (commandGroupRef.current) {
        commandGroupRef.current.scrollTop = 0;
      }
      if (commandListRef.current) {
        commandListRef.current.scrollTop = 0;
      }
    };

    if (open) {
      // Use setTimeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        scrollToTop();
        // Attempt scroll multiple times to overcome rendering delays
        setTimeout(scrollToTop, 50);
        setTimeout(scrollToTop, 100);
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {values ? (
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open} 
            className="w-full justify-between overflow-hidden"
          >
            {frameworks?.find((framework) => framework?.label === values)?.label}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        ) : (
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={
              isUpdate 
                ? "w-full justify-between overflow-hidden"
                : "w-full justify-between overflow-hidden text-slate-400 hover:text-slate-400"
            }
          >
            {name}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Search" className="h-9" />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup 
            ref={commandGroupRef}
            className="overflow-y-scroll" 
            style={{ 
              maxHeight: "300px", 
              overflowY: "auto" 
            }}
          >
            <div ref={commandListRef}>
              {frameworks?.map((framework) => (
                <CommandList key={framework?.label}>
                  <CommandItem 
                    value={framework?.label} 
                    onSelect={(currentValue) => {
                      setValues(currentValue === values ? "" : currentValue);
                      setOpen(false);
                      setResetFilter(false);
                      setValue(field, framework.value);
                    }}
                  >
                    {framework?.label}
                    <Check 
                      className={cn(
                        "ml-auto h-4 w-4",
                        values === framework?.label ? "opacity-100" : "opacity-0"
                      )} 
                    />
                  </CommandItem>
                </CommandList>
              ))}
            </div>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboboxDemo;