/**
 * Constants for SkyTycoon game
 * This file contains settings and configuration values for the game
 */

/**
 * Aircraft model specifications
 */
export const AIRCRAFT_MODELS = {
  A320NEO: "a320neo",
  A330_300: "a330-300"
};

/**
 * Flight status options
 */
export const FLIGHT_STATUSES = {
  SCHEDULED: "scheduled",
  BOARDING: "boarding",
  IN_AIR: "in_air",
  LANDING: "landing",
  ARRIVED: "arrived",
  DELAYED: "delayed",
  CANCELLED: "cancelled"
};

/**
 * Aircraft status options
 */
export const AIRCRAFT_STATUSES = {
  AVAILABLE: "Available",
  SCHEDULED: "Scheduled",
  IN_FLIGHT: "In Flight",
  MAINTENANCE: "Maintenance",
  GROUNDED: "Grounded"
};

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
  PURCHASE: "PURCHASE",
  SALE: "SALE",
  REVENUE: "REVENUE",
  EXPENSE: "EXPENSE",
  LOAN: "LOAN",
  LOAN_PAYMENT: "LOAN_PAYMENT"
};

/**
 * Default financial values
 */
export const FINANCIAL_DEFAULTS = {
  STARTING_MONEY: 5000000000, // $5B
  TRANSACTION_LOG_LIMIT: 100,
  DAILY_OPERATIONAL_COST_PER_AIRCRAFT: 150000,
  AIRCRAFT_VALUE_DEPRECIATION_RATE: 0.15, // 15% per year
  LOAN_DEFAULT_INTEREST_RATE: 0.05, // 5%
  LOAN_DEFAULT_TERM_MONTHS: 36 // 3 years
};

/**
 * Calendar view options
 */
export const CALENDAR_VIEWS = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month"
};

/**
 * Game difficulty settings
 */
export const DIFFICULTY_SETTINGS = {
  EASY: {
    name: 'Easy',
    startingMoney: 7000000000, // $7B
    loanInterest: 0.03, // 3%
    demandMultiplier: 1.2, // 20% higher demand
    costMultiplier: 0.9, // 10% lower costs
    description: 'Start with more cash and enjoy favorable business conditions'
  },
  NORMAL: {
    name: 'Normal',
    startingMoney: 5000000000, // $5B
    loanInterest: 0.05, // 5%
    demandMultiplier: 1.0,
    costMultiplier: 1.0,
    description: 'Balanced gameplay experience'
  },
  HARD: {
    name: 'Hard',
    startingMoney: 3000000000, // $3B
    loanInterest: 0.07, // 7%
    demandMultiplier: 0.9, // 10% lower demand
    costMultiplier: 1.1, // 10% higher costs
    description: 'Begin with less capital and face tougher market conditions'
  }
};