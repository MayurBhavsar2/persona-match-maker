import * as React from "react";
import { useState, useMemo } from "react";
import { Check, ChevronDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SearchableDropdownOption {
  id: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface SearchableDropdownProps {
  options: SearchableDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  loading = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No options found",
  className,
}: SearchableDropdownProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return options;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowerSearchTerm) ||
        option.sublabel?.toLowerCase().includes(lowerSearchTerm) ||
        option.badge?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [options, searchTerm]);

  // Get the selected option for display
  const selectedOption = options.find((opt) => opt.id === value);

  // Reset search when dropdown closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm("");
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Prevent dropdown from closing when clicking on search input
  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled || loading}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger
        className={cn(
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : selectedOption ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex-1 text-left">
              <div className="font-medium">{selectedOption.label}</div>
              {selectedOption.sublabel && (
                <div className="text-sm text-muted-foreground">
                  {selectedOption.sublabel}
                </div>
              )}
            </div>
            {selectedOption.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded">
                {selectedOption.badge}
              </span>
            )}
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {/* Search Input */}
        <div className="p-2 border-b" onClick={handleSearchClick}>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8 h-8"
              onClick={handleSearchClick}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Options List */}
        <SelectGroup>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {option.sublabel && (
                      <div className="text-sm text-muted-foreground">
                        {option.sublabel}
                      </div>
                    )}
                  </div>
                  {option.badge && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded">
                      {option.badge}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SearchableDropdown;
