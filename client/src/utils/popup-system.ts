/**
 * Popup System for SkyTycoon
 * This file contains utility functions for creating and managing popup dialogs
 */

/**
 * Creates a popup alert with a message and OK button
 */
export function showAlert(title: string, message: string): Promise<void> {
  return new Promise((resolve) => {
    // In a real browser environment, this would create a DOM popup
    // For now, we'll use a simpler approach
    console.log(`ALERT: ${title} - ${message}`);
    
    // In React environment, we'd use a modal component instead
    // This is just a simulation for the game logic
    setTimeout(() => {
      resolve();
    }, 100);
  });
}

/**
 * Creates a confirmation dialog with yes/no buttons
 */
export function showConfirm(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    // In a real browser environment, this would create a DOM popup
    // For now, we'll use a simpler approach
    console.log(`CONFIRM: ${title} - ${message}`);
    
    // In React environment, we'd use a modal component instead
    // This is just a simulation for the game logic
    setTimeout(() => {
      // Default to true for simulation purposes
      resolve(true);
    }, 100);
  });
}

/**
 * Creates an input dialog with a text field
 */
export function showInput(title: string, message: string, placeholder = ''): Promise<string | null> {
  return new Promise((resolve) => {
    // In a real browser environment, this would create a DOM popup
    // For now, we'll use a simpler approach
    console.log(`INPUT: ${title} - ${message} [${placeholder}]`);
    
    // In React environment, we'd use a modal component instead
    // This is just a simulation for the game logic
    setTimeout(() => {
      // Simulate user input for testing purposes
      resolve("Sample Input");
    }, 100);
  });
}

/**
 * Checks if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Returns the number of days in a month
 */
export function getDaysInMonth(month: number, year: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return daysInMonth[month - 1];
}

/**
 * Formats game time (minutes) into human-readable date and time
 */
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
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  };
}