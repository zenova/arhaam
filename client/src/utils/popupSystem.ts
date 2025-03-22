/**
 * Popup System for SkyTycoon
 * This file contains utility functions for creating and managing popup dialogs
 */

import { toast } from "@/hooks/use-toast";

// Define simpler interfaces to avoid JSX issues
interface PopupButton {
  text: string;
  primary?: boolean;
  onClick?: () => boolean | void;
}

/**
 * Creates a popup alert with a message and OK button
 */
export function showAlert(title: string, message: string): Promise<void> {
  return new Promise<void>((resolve) => {
    toast({
      title,
      description: message,
      duration: 5000,
      action: (
        <button 
          onClick={() => resolve()}
          className="bg-primary/80 hover:bg-primary/90 text-white transition-colors px-3 py-2 rounded-md"
        >
          OK
        </button>
      ),
    });
  });
}

/**
 * Creates a confirmation dialog with yes/no buttons
 */
export function showConfirm(title: string, message: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    toast({
      title,
      description: message,
      duration: 100000,
      action: (
        <div className="flex gap-2">
          <button 
            onClick={() => {
              resolve(false);
              toast({
                title: "Cancelled",
                description: "Operation cancelled",
                duration: 2000,
              });
            }}
            className="bg-gray-500/20 hover:bg-gray-500/30 transition-colors px-3 py-2 rounded-md"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              resolve(true);
              toast({
                title: "Confirmed",
                description: "Operation confirmed",
                duration: 2000,
              });
            }}
            className="bg-primary/80 hover:bg-primary/90 text-white transition-colors px-3 py-2 rounded-md"
          >
            Confirm
          </button>
        </div>
      ),
    });
  });
}

/**
 * Creates an input dialog with a text field
 */
export function showInput(title: string, message: string, placeholder = ''): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    // Implementation will be done with a modal dialog
    // For now, we'll use a simple prompt as a placeholder
    const value = prompt(message, placeholder);
    resolve(value);
  });
}

/**
 * Time-related utility functions
 */

// Check if year is a leap year
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Get days in a month
export function getDaysInMonth(month: number, year: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return daysInMonth[month - 1];
}

// Format game time from minutes to date and time
export function formatGameTime(minutes: number) {
  let totalMinutes = minutes;
  let year = 2026;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;

  // Calculate year
  while (totalMinutes >= 365 * 24 * 60) {
    const daysInYear = isLeapYear(year) ? 366 : 365;
    totalMinutes -= daysInYear * 24 * 60;
    year++;
  }

  // Calculate month
  while (totalMinutes >= getDaysInMonth(month, year) * 24 * 60) {
    totalMinutes -= getDaysInMonth(month, year) * 24 * 60;
    month++;
  }

  // Calculate day
  while (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
    day++;
  }

  // Calculate hour and minute
  hour = Math.floor(totalMinutes / 60);
  minute = totalMinutes % 60;

  return {
    date: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    fullDate: new Date(year, month - 1, day, hour, minute),
    year,
    month,
    day,
    hour,
    minute
  };
}