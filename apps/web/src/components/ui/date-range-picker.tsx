import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, isWithinInterval } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    disabledDates?: Date[];
    minDate?: Date;
}

export function DateRangePicker({
    dateRange,
    onDateRangeChange,
    placeholder = "Select dates",
    className,
    disabled = false,
    disabledDates = [],
    minDate,
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(
        dateRange
    );

    // Reset draft when opening
    React.useEffect(() => {
        if (isOpen) setDraftRange(dateRange);
    }, [isOpen, dateRange]);

    const isDisabled = (date: Date) => {
        if (minDate && date < minDate) return true;

        return disabledDates.some(
            (d) => d.toDateString() === date.toDateString()
        );
    };

    const isRangeValid = (range?: DateRange) => {
        if (!range?.from || !range?.to) return true;

        return !disabledDates.some((d) =>
            isWithinInterval(d, { start: range.from!, end: range.to! })
        );
    };

    const applyRange = () => {
        if (!isRangeValid(draftRange)) return;
        onDateRangeChange(draftRange);
        setIsOpen(false);
    };

    const clearRange = () => {
        setDraftRange(undefined);
        onDateRangeChange(undefined);
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                            "w-full justify-start text-left font-normal px-4 py-3 rounded-lg",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} –{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            placeholder
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="p-4 w-auto space-y-3">
                    <Calendar
                        mode="range"
                        numberOfMonths={2}
                        selected={draftRange}
                        onSelect={(range) => {
                            // Clicking inside an existing range = restart selection
                            if (draftRange?.from && draftRange?.to && range?.from && !range.to) {
                                setDraftRange({ from: range.from });
                                return;
                            }
                            setDraftRange(range);
                        }}
                        disabled={isDisabled}
                        defaultMonth={draftRange?.from}
                    />

                    {!isRangeValid(draftRange) && (
                        <p className="text-sm text-red-500">
                            Selected range contains unavailable dates
                        </p>
                    )}

                    <div className="flex justify-between items-center pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearRange}
                            className="text-slate-500"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                disabled={!draftRange?.from || !draftRange?.to || !isRangeValid(draftRange)}
                                onClick={applyRange}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
