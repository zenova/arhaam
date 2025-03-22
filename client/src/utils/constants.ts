/**
 * Aircraft model specifications
 */
export const AIRCRAFT_MODELS = {
  A320neo: {
    name: "Airbus A320neo",
    type: "Narrow-body",
    capacity: 180,
    range: 6500, // km
    cruisingSpeed: 870, // km/h
    fuelEfficiency: 2.4, // liters per passenger per 100km
    price: 101500000, // $101.5M
    description: "The A320neo (new engine option) is one of the best-selling single-aisle aircraft offering excellent fuel efficiency and passenger comfort."
  },
  A330300: {
    name: "Airbus A330-300",
    type: "Wide-body",
    capacity: 295,
    range: 11300, // km
    cruisingSpeed: 871, // km/h
    fuelEfficiency: 3.2, // liters per passenger per 100km
    price: 275400000, // $275.4M
    description: "The A330-300 is a wide-body twin-engine aircraft offering excellent range and passenger capacity for long-haul international routes."
  }
};

/**
 * Flight status options
 */
export const FLIGHT_STATUSES = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};

/**
 * Aircraft status options
 */
export const AIRCRAFT_STATUSES = {
  ACTIVE: "active",
  MAINTENANCE: "maintenance",
  EN_ROUTE: "en-route"
};

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
  PURCHASE: "purchase",
  REVENUE: "revenue",
  EXPENSE: "expense"
};

/**
 * Default financial values
 */
export const FINANCIAL_DEFAULTS = {
  STARTING_MONEY: 10000000, // $10M
  MAINTENANCE_COST_A320: 120000, // $120k per maintenance
  MAINTENANCE_COST_A330: 250000, // $250k per maintenance
  MAINTENANCE_INTERVAL_DAYS: 30, // Days between maintenance
  FUEL_COST_PER_LITER: 0.75 // $ per liter
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
    name: "Easy",
    demandMultiplier: 1.2,
    costMultiplier: 0.8,
    startingMoney: 15000000
  },
  NORMAL: {
    name: "Normal",
    demandMultiplier: 1.0,
    costMultiplier: 1.0,
    startingMoney: 10000000
  },
  HARD: {
    name: "Hard",
    demandMultiplier: 0.8,
    costMultiplier: 1.2,
    startingMoney: 7500000
  }
};
