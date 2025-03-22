/**
 * Game System for SkyTycoon
 * This file contains utility functions for game time, finances, and core mechanics
 */

import { formatGameTime } from './popup-system';
import { DIFFICULTY_SETTINGS } from './constants';

// Game state interface
export interface GameState {
  airlineName: string;
  ceoName: string;
  difficulty: keyof typeof DIFFICULTY_SETTINGS;
  hub: string | null;
  money: number;
  gameTime: number; // in minutes since game start
  timeMultiplier: number;
  lastSaved: Date;
}

// Transaction type
export interface Transaction {
  id: string;
  date: Date;
  type: 'PURCHASE' | 'SALE' | 'REVENUE' | 'EXPENSE' | 'LOAN' | 'LOAN_PAYMENT';
  amount: number;
  description: string;
  balance: number;
}

// Loan type
export interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  remainingPayments: number;
  nextPaymentDate: Date;
  totalPaid: number;
}

// Initialize a new game
export function initializeNewGame(
  airlineName: string,
  ceoName: string,
  difficulty: keyof typeof DIFFICULTY_SETTINGS = 'NORMAL'
): GameState {
  return {
    airlineName,
    ceoName,
    difficulty,
    hub: null,
    money: DIFFICULTY_SETTINGS[difficulty].startingMoney,
    gameTime: 0,
    timeMultiplier: 1,
    lastSaved: new Date()
  };
}

// Save game to localStorage
export function saveGame(gameState: GameState): void {
  gameState.lastSaved = new Date();
  localStorage.setItem('skyTycoonGameState', JSON.stringify(gameState));
}

// Load game from localStorage
export function loadGame(): GameState | null {
  const savedState = localStorage.getItem('skyTycoonGameState');
  if (!savedState) return null;
  
  try {
    return JSON.parse(savedState);
  } catch (e) {
    console.error('Failed to load saved game:', e);
    return null;
  }
}

// Format currency for display
export function formatCurrency(amount: number): string {
  // Handle negative numbers
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format based on size
  let formatted: string;
  if (absAmount >= 1_000_000_000) {
    formatted = `$${(absAmount / 1_000_000_000).toFixed(2)}B`;
  } else if (absAmount >= 1_000_000) {
    formatted = `$${(absAmount / 1_000_000).toFixed(2)}M`;
  } else if (absAmount >= 1_000) {
    formatted = `$${(absAmount / 1_000).toFixed(2)}K`;
  } else {
    formatted = `$${absAmount.toFixed(2)}`;
  }
  
  return isNegative ? `-${formatted}` : formatted;
}

// Advance game time by a specific number of minutes
export function advanceGameTime(gameState: GameState, minutes: number) {
  gameState.gameTime += minutes;
  return formatGameTime(gameState.gameTime);
}

// Calculate loan details
export function calculateLoan(
  principal: number,
  interestRate: number,
  termMonths: number
): { monthlyPayment: number, totalPayment: number } {
  const monthlyRate = interestRate / 12;
  const monthlyPayment = 
    principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  const totalPayment = monthlyPayment * termMonths;
  
  return {
    monthlyPayment,
    totalPayment
  };
}

// Take out a new loan
export function takeOutLoan(
  amount: number,
  interestRate: number,
  termMonths: number,
  currentDate: Date
): Loan {
  const { monthlyPayment } = calculateLoan(amount, interestRate, termMonths);
  
  // Calculate next payment date (1 month from now)
  const nextPaymentDate = new Date(currentDate);
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  
  return {
    id: `loan-${Date.now()}`,
    amount,
    interestRate,
    termMonths,
    monthlyPayment,
    remainingPayments: termMonths,
    nextPaymentDate,
    totalPaid: 0
  };
}

// Make a payment on a loan
export function makeLoanPayment(loan: Loan, currentDate: Date): Loan {
  if (loan.remainingPayments <= 0) {
    return loan; // Loan is already paid off
  }
  
  const updatedLoan = { ...loan };
  updatedLoan.remainingPayments -= 1;
  updatedLoan.totalPaid += updatedLoan.monthlyPayment;
  
  // Update next payment date
  const nextPaymentDate = new Date(currentDate);
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  updatedLoan.nextPaymentDate = nextPaymentDate;
  
  return updatedLoan;
}