// adapted for browser runtime
const { useState, useMemo, useEffect, useRef, useCallback } = React;
const { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line, ReferenceLine } = Recharts;

// State tax data - updated for 2025
const STATE_TAX_DATA = {
  'AL': { name: 'Alabama', rate: 5.0, hasCapGains: true },
  'AK': { name: 'Alaska', rate: 0, hasCapGains: false },
  'AZ': { name: 'Arizona', rate: 2.5, hasCapGains: true },
  'AR': { name: 'Arkansas', rate: 4.4, hasCapGains: true },
  'CA': { name: 'California', rate: 13.3, hasCapGains: true },
  'CO': { name: 'Colorado', rate: 4.4, hasCapGains: true },
  'CT': { name: 'Connecticut', rate: 6.99, hasCapGains: true },
  'DE': { name: 'Delaware', rate: 6.6, hasCapGains: true },
  'FL': { name: 'Florida', rate: 0, hasCapGains: false },
  'GA': { name: 'Georgia', rate: 5.49, hasCapGains: true },
  'HI': { name: 'Hawaii', rate: 11.0, hasCapGains: true },
  'ID': { name: 'Idaho', rate: 5.8, hasCapGains: true },
  'IL': { name: 'Illinois', rate: 4.95, hasCapGains: true },
  'IN': { name: 'Indiana', rate: 3.05, hasCapGains: true },
  'IA': { name: 'Iowa', rate: 5.7, hasCapGains: true },
  'KS': { name: 'Kansas', rate: 5.7, hasCapGains: true },
  'KY': { name: 'Kentucky', rate: 4.0, hasCapGains: true },
  'LA': { name: 'Louisiana', rate: 4.25, hasCapGains: true },
  'ME': { name: 'Maine', rate: 7.15, hasCapGains: true },
  'MD': { name: 'Maryland', rate: 5.75, hasCapGains: true },
  'MA': { name: 'Massachusetts', rate: 9.0, hasCapGains: true },
  'MI': { name: 'Michigan', rate: 4.25, hasCapGains: true },
  'MN': { name: 'Minnesota', rate: 9.85, hasCapGains: true },
  'MS': { name: 'Mississippi', rate: 4.7, hasCapGains: true },
  'MO': { name: 'Missouri', rate: 0, hasCapGains: false },
  'MT': { name: 'Montana', rate: 5.9, hasCapGains: true },
  'NE': { name: 'Nebraska', rate: 5.84, hasCapGains: true },
  'NV': { name: 'Nevada', rate: 0, hasCapGains: false },
  'NH': { name: 'New Hampshire', rate: 0, hasCapGains: false },
  'NJ': { name: 'New Jersey', rate: 10.75, hasCapGains: true },
  'NM': { name: 'New Mexico', rate: 5.9, hasCapGains: true },
  'NY': { name: 'New York', rate: 10.9, hasCapGains: true },
  'NC': { name: 'North Carolina', rate: 4.5, hasCapGains: true },
  'ND': { name: 'North Dakota', rate: 2.5, hasCapGains: true },
  'OH': { name: 'Ohio', rate: 3.5, hasCapGains: true },
  'OK': { name: 'Oklahoma', rate: 4.75, hasCapGains: true },
  'OR': { name: 'Oregon', rate: 9.9, hasCapGains: true },
  'PA': { name: 'Pennsylvania', rate: 3.07, hasCapGains: true },
  'RI': { name: 'Rhode Island', rate: 5.99, hasCapGains: true },
  'SC': { name: 'South Carolina', rate: 6.4, hasCapGains: true },
  'SD': { name: 'South Dakota', rate: 0, hasCapGains: false },
  'TN': { name: 'Tennessee', rate: 0, hasCapGains: false },
  'TX': { name: 'Texas', rate: 0, hasCapGains: false },
  'UT': { name: 'Utah', rate: 4.65, hasCapGains: true },
  'VT': { name: 'Vermont', rate: 8.75, hasCapGains: true },
  'VA': { name: 'Virginia', rate: 5.75, hasCapGains: true },
  'WA': { name: 'Washington', rate: 7.0, hasCapGains: true, note: '7% on gains over $250K only' },
  'WV': { name: 'West Virginia', rate: 5.12, hasCapGains: true },
  'WI': { name: 'Wisconsin', rate: 7.65, hasCapGains: true },
  'WY': { name: 'Wyoming', rate: 0, hasCapGains: false },
  'DC': { name: 'Washington D.C.', rate: 10.75, hasCapGains: true }
};

// Trading strategy templates
const STRATEGY_TEMPLATES = {
  conservative: {
    name: 'Conservative Scalper',
    description: 'Low risk, high frequency trading with tight stops. Focuses on small, consistent gains.',
    settings: {
      winRate: 65,
      riskRewardRatio: 1,
      riskPerTrade: 0.5,
      tradesPerDay: 8,
      commissionPerTrade: 1
    },
    pros: ['Lower drawdowns', 'Consistent returns', 'Easier psychologically'],
    cons: ['Lower profit potential', 'Requires high win rate', 'Commission-sensitive']
  },
  balanced: {
    name: 'Balanced Day Trader',
    description: 'Moderate risk with reasonable R:R. The most common approach for profitable traders.',
    settings: {
      winRate: 50,
      riskRewardRatio: 2,
      riskPerTrade: 1,
      tradesPerDay: 4,
      commissionPerTrade: 2
    },
    pros: ['Sustainable long-term', 'Flexible win rate', 'Good risk/reward balance'],
    cons: ['Requires discipline', 'Moderate drawdowns', 'Average returns']
  },
  aggressive: {
    name: 'Momentum Hunter',
    description: 'Higher risk, lower frequency. Targets big moves with wider stops.',
    settings: {
      winRate: 40,
      riskRewardRatio: 3,
      riskPerTrade: 2,
      tradesPerDay: 2,
      commissionPerTrade: 3
    },
    pros: ['High profit potential', 'Works with lower win rate', 'Fewer trades to manage'],
    cons: ['Larger drawdowns', 'Psychologically challenging', 'Requires patience']
  },
  swing: {
    name: 'Swing Trader',
    description: 'Multi-day holds targeting larger moves. Lower frequency, higher conviction.',
    settings: {
      winRate: 45,
      riskRewardRatio: 2.5,
      riskPerTrade: 1.5,
      tradesPerDay: 0.5, // Represents trades per day average (2-3 per week)
      commissionPerTrade: 5
    },
    pros: ['Less screen time', 'Larger moves', 'Lower commission impact'],
    cons: ['Overnight risk', 'Slower compounding', 'Requires patience']
  },
  professional: {
    name: 'Prop Firm Trader',
    description: 'Institutional-style risk management. Strict drawdown rules, consistent sizing.',
    settings: {
      winRate: 55,
      riskRewardRatio: 1.5,
      riskPerTrade: 0.75,
      tradesPerDay: 5,
      commissionPerTrade: 0.5
    },
    pros: ['Professional approach', 'Manageable drawdowns', 'Scalable'],
    cons: ['Strict rules required', 'Lower per-trade profits', 'Requires consistency']
  }
};

// Comprehensive tooltip content
const TOOLTIPS = {
  // Basic Settings
  initialInvestment: {
    title: 'Initial Investment',
    description: 'The starting capital you want to simulate growth on.',
    bestPractice: 'Professional traders recommend starting with capital you can afford to lose. The PDT (Pattern Day Trader) rule requires $25,000 minimum for unlimited day trades in margin accounts.'
  },
  growthRate: {
    title: 'Growth Rate per Period',
    description: 'The percentage gain expected each compounding period.',
    bestPractice: 'Research shows successful day traders average 0.03-0.15% daily (1-4% monthly). Elite professionals achieve 40-60% annually. Even 1% daily compounds to impossible levels over time.'
  },
  compoundFrequency: {
    title: 'Compound Frequency',
    description: 'How often gains are reinvested. Weekday (252 trading days/year) is standard for active traders.',
    bestPractice: 'Day traders use weekday compounding. Swing traders may use daily or weekly. Long-term investors typically use monthly or quarterly.'
  },
  startDate: {
    title: 'Start Date',
    description: 'The date your simulation begins. Used to calculate actual trading days based on real calendar.',
    bestPractice: 'Consider market conditions and your trading schedule when setting start dates.'
  },
  timeHorizon: {
    title: 'Time Horizon',
    description: 'How many months to project your portfolio growth.',
    bestPractice: 'Longer horizons show compounding effects but increase uncertainty. 3-12 months is typical for active trading projections.'
  },
  monthlyContribution: {
    title: 'Monthly Contribution',
    description: 'Additional capital added to your portfolio each month.',
    bestPractice: 'Regular contributions leverage dollar-cost averaging and accelerate compound growth. Even small consistent additions can significantly impact long-term results.'
  },
  monthlyFees: {
    title: 'Monthly Trading Fees',
    description: 'Estimated monthly costs from commissions, spreads, and platform fees.',
    bestPractice: 'Active traders making 10 trades/day at $5/trade pay ~$1,000/month. Fees can reduce profitability by 18% or more. Many brokers now offer commission-free trading on stocks/ETFs.'
  },
  withdrawalAmount: {
    title: 'Withdrawal Amount',
    description: 'How much to withdraw each period. Can be a percentage of balance or fixed dollar amount.',
    bestPractice: 'The 4% rule suggests 3.5-4.5% annual withdrawal for portfolio longevity. For active trading income, 20-30% of profits is common.'
  },
  withdrawalFrequency: {
    title: 'Withdrawal Frequency',
    description: 'How often withdrawals occur. Monthly is most common for income replacement.',
    bestPractice: 'Monthly withdrawals align with living expenses. Quarterly reduces transaction costs but requires more cash reserves.'
  },
  
  // Advanced Settings
  winRate: {
    title: 'Win Rate',
    description: 'The percentage of trades that close profitably. A 55% win rate means 55 winning trades out of 100.',
    bestPractice: 'Most profitable traders have win rates between 40-60%. A high win rate (70%+) often indicates taking profits too early. Win rate must be balanced with risk:reward ratio.',
    formula: 'Win Rate = (Winning Trades / Total Trades) × 100'
  },
  riskRewardRatio: {
    title: 'Risk:Reward Ratio',
    description: 'The ratio of potential loss to potential gain. A 1:2 ratio means risking $1 to potentially make $2.',
    bestPractice: 'Professional traders typically aim for 1:2 or higher. A 1:3 ratio only requires 25% win rate to break even. Higher ratios allow for lower win rates.',
    formula: 'R:R = Take Profit Distance / Stop Loss Distance'
  },
  riskPerTrade: {
    title: 'Risk per Trade',
    description: 'The percentage of your account risked on each trade. This is the amount you could lose if stopped out.',
    bestPractice: 'The CFA Institute recommends max 2% per trade. Most professionals use 0.5-1%. The 1% rule: never risk more than 1% of your account on a single trade.',
    formula: 'Position Size = (Account × Risk%) / Stop Loss Distance'
  },
  tradesPerDay: {
    title: 'Trades per Day',
    description: 'Average number of trades executed daily. Affects commission costs and compounding speed.',
    bestPractice: 'Scalpers: 10-50 trades/day. Day traders: 3-10. Swing traders: 0.5-2. More trades = more commission impact but faster compounding potential.'
  },
  commissionPerTrade: {
    title: 'Commission per Trade',
    description: 'The cost charged by your broker for each trade (round-trip includes entry and exit).',
    bestPractice: 'Many brokers offer $0 commission on stocks/ETFs. Futures typically $2-5/contract. Options $0.50-0.65/contract. Factor in both entry and exit costs.'
  },
  
  // Calculated Metrics
  expectancy: {
    title: 'Expectancy',
    description: 'The average amount you expect to make (or lose) per dollar risked. Positive expectancy is required for long-term profitability.',
    bestPractice: 'Expectancy above 0.2 is good, above 0.5 is excellent. Negative expectancy means the strategy loses money over time regardless of individual wins.',
    formula: 'Expectancy = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)'
  },
  kellyPercent: {
    title: 'Kelly Criterion',
    description: 'A formula that calculates the mathematically optimal percentage of capital to risk per trade to maximize long-term growth.',
    bestPractice: 'Full Kelly is aggressive and creates high volatility. Most professionals use Half-Kelly (50%) or Quarter-Kelly (25%) for smoother equity curves.',
    formula: 'Kelly % = Win Rate - [(1 - Win Rate) / Risk:Reward]'
  },
  breakevenWinRate: {
    title: 'Breakeven Win Rate',
    description: 'The minimum win rate required to break even given your risk:reward ratio. Below this, you lose money over time.',
    bestPractice: 'At 1:1 R:R, you need 50%. At 1:2, only 33%. At 1:3, just 25%. Higher R:R ratios give more margin for error.',
    formula: 'Breakeven = 1 / (1 + Risk:Reward Ratio)'
  },
  profitFactor: {
    title: 'Profit Factor',
    description: 'The ratio of gross profits to gross losses. Above 1.0 is profitable, above 1.5 is good, above 2.0 is excellent.',
    bestPractice: 'Profit factor below 1.0 means losing money. Most successful strategies have profit factors between 1.3 and 2.0.',
    formula: 'Profit Factor = Gross Profits / Gross Losses'
  },
  maxDrawdown: {
    title: 'Maximum Drawdown',
    description: 'The largest peak-to-trough decline in account value. Critical for understanding worst-case scenarios.',
    bestPractice: 'Keep max drawdown under 20% for psychological sustainability. At 50% drawdown, you need 100% gain just to recover.',
    formula: 'Max DD = (Peak Value - Trough Value) / Peak Value × 100'
  },
  riskOfRuin: {
    title: 'Risk of Ruin',
    description: 'The probability of losing your entire account (or a defined percentage) given your strategy parameters.',
    bestPractice: 'Professional traders aim for <1% risk of ruin. Risk of ruin increases exponentially with higher risk per trade.',
    formula: 'Based on win rate, risk per trade, and R:R ratio'
  },
  
  // Tax tooltips
  federalTaxBracket: {
    title: 'Federal Tax Bracket',
    description: 'Your marginal federal income tax rate. Short-term capital gains (held <1 year) are taxed as ordinary income.',
    bestPractice: 'Day trading profits are short-term gains taxed at ordinary income rates (10-37%). Consider tax-loss harvesting to offset gains.'
  },
  state: {
    title: 'State',
    description: 'Your state of residence for tax calculations.',
    bestPractice: '9 states have no capital gains tax: AK, FL, MO, NV, NH, SD, TN, TX, WY. High-tax states like CA (13.3%) and NY (10.9%) significantly impact net returns.'
  },
  
  // Monte Carlo
  monteCarlo: {
    title: 'Monte Carlo Simulation',
    description: 'A statistical technique that runs hundreds of randomized trading scenarios based on your strategy parameters. Each run simulates individual trades with random win/loss outcomes matching your win rate.',
    bestPractice: 'Monte Carlo reveals the range of possible outcomes, not just the average. It shows best-case, worst-case, and most likely scenarios, helping you understand variance and risk of ruin.'
  },
  monteCarloRerun: {
    title: 'Re-run Simulation',
    description: 'Generates a new set of random simulations with different random seeds. Each re-run produces slightly different results, showing how randomness affects outcomes.',
    bestPractice: 'Re-running multiple times helps you see the full range of possible outcomes and whether your strategy is robust across different random sequences.'
  }
};

const CompoundGrowthCalculator = () => {
  // Helper to get today's date
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  
  // Mode toggle
  const [advancedMode, setAdvancedMode] = useState(false);
  
  // Basic settings state
  const [initialAmount, setInitialAmount] = useState(10000);
  const [growthRate, setGrowthRate] = useState(0.15);
  const [compoundFrequency, setCompoundFrequency] = useState('weekday');
  const [startDate, setStartDate] = useState(() => getTodayDate());
  const [timeHorizon, setTimeHorizon] = useState(12);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  
  // Withdrawal settings
  const [withdrawalEnabled, setWithdrawalEnabled] = useState(false);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [withdrawalType, setWithdrawalType] = useState('percent');
  const [withdrawalFrequency, setWithdrawalFrequency] = useState('monthly');
  
  // Advanced settings state
  const [winRate, setWinRate] = useState(50);
  const [riskRewardRatio, setRiskRewardRatio] = useState(2);
  const [riskPerTrade, setRiskPerTrade] = useState(1);
  const [tradesPerDay, setTradesPerDay] = useState(4);
  const [commissionPerTrade, setCommissionPerTrade] = useState(2);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [simulationRuns, setSimulationRuns] = useState(100);
  const [monteCarloSeed, setMonteCarloSeed] = useState(Date.now());
  
  // UI state
  const [activeTab, setActiveTab] = useState('calculator');
  const [federalTaxBracket, setFederalTaxBracket] = useState(22);
  const [selectedState, setSelectedState] = useState('FL');
  const [showCalcBreakdown, setShowCalcBreakdown] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showMonteCarloChart, setShowMonteCarloChart] = useState(true);
  
  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeTooltip && !event.target.closest('.tooltip-container')) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeTooltip]);
  
  // Apply strategy template (toggle off if already selected)
  const applyStrategy = useCallback((strategyKey) => {
    if (selectedStrategy === strategyKey) {
      // Deselect and reset to defaults
      setSelectedStrategy(null);
      setWinRate(50);
      setRiskRewardRatio(2);
      setRiskPerTrade(1);
      setTradesPerDay(4);
      setCommissionPerTrade(2);
    } else {
      const strategy = STRATEGY_TEMPLATES[strategyKey];
      if (strategy) {
        setSelectedStrategy(strategyKey);
        setWinRate(strategy.settings.winRate);
        setRiskRewardRatio(strategy.settings.riskRewardRatio);
        setRiskPerTrade(strategy.settings.riskPerTrade);
        setTradesPerDay(strategy.settings.tradesPerDay);
        setCommissionPerTrade(strategy.settings.commissionPerTrade);
      }
    }
  }, [selectedStrategy]);
  
  // Reset to defaults
  const resetScenario = useCallback(() => {
    setInitialAmount(10000);
    setGrowthRate(0.15);
    setCompoundFrequency('weekday');
    setStartDate(getTodayDate());
    setTimeHorizon(12);
    setMonthlyContribution(0);
    setWithdrawalEnabled(false);
    setWithdrawalRate(4);
    setWithdrawalType('percent');
    setWithdrawalFrequency('monthly');
    setWinRate(50);
    setRiskRewardRatio(2);
    setRiskPerTrade(1);
    setTradesPerDay(4);
    setCommissionPerTrade(2);
    setSelectedStrategy(null);
  }, []);

  // Calculate advanced metrics
  const advancedMetrics = useMemo(() => {
    const wr = winRate / 100;
    const lr = 1 - wr;
    const rr = riskRewardRatio;
    
    // Expectancy per $1 risked
    const expectancy = (wr * rr) - lr;
    
    // Kelly Criterion
    const kelly = wr - (lr / rr);
    const halfKelly = kelly / 2;
    const quarterKelly = kelly / 4;
    
    // Breakeven win rate
    const breakevenWinRate = 1 / (1 + rr) * 100;
    
    // Profit Factor
    const profitFactor = (wr * rr) / lr;
    
    // Estimated daily return based on expectancy
    const avgRiskPerDay = riskPerTrade * tradesPerDay;
    const expectedDailyReturn = expectancy * avgRiskPerDay;
    
    // Commission impact
    const dailyCommissions = commissionPerTrade * tradesPerDay * 2; // Round trip
    const monthlyCommissions = dailyCommissions * 21; // Trading days per month
    const commissionImpactPercent = (dailyCommissions / initialAmount) * 100;
    
    // Risk of Ruin approximation (simplified formula)
    const riskOfRuin = Math.pow((1 - (expectancy * riskPerTrade / 100)) / (1 + (expectancy * riskPerTrade / 100)), 100 / riskPerTrade);
    
    // Estimated max drawdown (rough estimate based on risk per trade)
    const estimatedMaxDrawdown = riskPerTrade * 10; // Rough heuristic
    
    return {
      expectancy,
      kelly: kelly * 100,
      halfKelly: halfKelly * 100,
      quarterKelly: quarterKelly * 100,
      breakevenWinRate,
      profitFactor,
      expectedDailyReturn,
      dailyCommissions,
      monthlyCommissions,
      commissionImpactPercent,
      riskOfRuin: Math.max(0, Math.min(1, riskOfRuin)) * 100,
      estimatedMaxDrawdown,
      isPositiveExpectancy: expectancy > 0,
      winRateVsBreakeven: winRate - breakevenWinRate
    };
  }, [winRate, riskRewardRatio, riskPerTrade, tradesPerDay, commissionPerTrade, initialAmount]);

  // Monte Carlo Simulation
  const monteCarloResults = useMemo(() => {
    if (!advancedMode) return null;
    
    const runs = [];
    const wr = winRate / 100;
    const rr = riskRewardRatio;
    const risk = riskPerTrade / 100;
    const tradingDays = timeHorizon * 21;
    const totalTrades = Math.floor(tradesPerDay * tradingDays);
    const commission = commissionPerTrade * 2; // Round trip
    
    // Seeded random for reproducibility
    const seededRandom = (seed) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    
    let seed = monteCarloSeed;
    
    for (let run = 0; run < simulationRuns; run++) {
      let balance = initialAmount;
      let maxBalance = balance;
      let maxDrawdown = 0;
      const equityCurve = [{ trade: 0, balance }];
      
      for (let trade = 1; trade <= totalTrades; trade++) {
        const isWin = seededRandom(seed++) < wr;
        const riskAmount = balance * risk;
        
        if (isWin) {
          balance += riskAmount * rr;
        } else {
          balance -= riskAmount;
        }
        
        // Subtract commission
        balance -= commission;
        
        // Add monthly contribution (every ~21 trades)
        if (trade % 21 === 0 && monthlyContribution > 0) {
          balance += monthlyContribution;
        }
        
        // Track max drawdown
        if (balance > maxBalance) {
          maxBalance = balance;
        }
        const currentDrawdown = ((maxBalance - balance) / maxBalance) * 100;
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown;
        }
        
        // Sample equity curve (every 10 trades to reduce data points)
        if (trade % 10 === 0 || trade === totalTrades) {
          equityCurve.push({ trade, balance: Math.round(balance * 100) / 100 });
        }
        
        // Stop if blown up
        if (balance <= 0) {
          equityCurve.push({ trade, balance: 0 });
          break;
        }
      }
      
      runs.push({
        finalBalance: Math.max(0, balance),
        maxDrawdown,
        equityCurve,
        blownUp: balance <= 0
      });
    }
    
    // Calculate statistics
    const finalBalances = runs.map(r => r.finalBalance).sort((a, b) => a - b);
    const drawdowns = runs.map(r => r.maxDrawdown);
    const blownUpCount = runs.filter(r => r.blownUp).length;
    
    const median = finalBalances[Math.floor(finalBalances.length / 2)];
    const percentile10 = finalBalances[Math.floor(finalBalances.length * 0.1)];
    const percentile90 = finalBalances[Math.floor(finalBalances.length * 0.9)];
    const average = finalBalances.reduce((a, b) => a + b, 0) / finalBalances.length;
    const avgDrawdown = drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length;
    const maxDrawdownSeen = Math.max(...drawdowns);
    
    // Get sample equity curves for chart (best, worst, median)
    const sortedRuns = [...runs].sort((a, b) => a.finalBalance - b.finalBalance);
    const worstRun = sortedRuns[0];
    const medianRun = sortedRuns[Math.floor(sortedRuns.length / 2)];
    const bestRun = sortedRuns[sortedRuns.length - 1];
    
    return {
      runs,
      statistics: {
        average: Math.round(average),
        median: Math.round(median),
        percentile10: Math.round(percentile10),
        percentile90: Math.round(percentile90),
        avgDrawdown: avgDrawdown.toFixed(1),
        maxDrawdown: maxDrawdownSeen.toFixed(1),
        blownUpPercent: ((blownUpCount / simulationRuns) * 100).toFixed(1),
        profitablePercent: ((runs.filter(r => r.finalBalance > initialAmount).length / simulationRuns) * 100).toFixed(1)
      },
      sampleCurves: { worstRun, medianRun, bestRun }
    };
  }, [advancedMode, winRate, riskRewardRatio, riskPerTrade, tradesPerDay, commissionPerTrade, initialAmount, timeHorizon, monthlyContribution, simulationRuns, monteCarloSeed]);

  // Basic compound growth calculation
  const getCompoundingDaysInMonth = (year, month, frequency) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let count = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      switch (frequency) {
        case 'daily': count++; break;
        case 'weekday': if (dayOfWeek !== 0 && dayOfWeek !== 6) count++; break;
        case 'weekly': if (dayOfWeek === 1) count++; break; // Count Mondays
        case 'monthly': if (day === 1) count++; break;
        case 'quarterly': if (day === 1 && month % 3 === 0) count++; break;
        case 'yearly': if (day === 1 && month === 0) count++; break;
        default: count++;
      }
    }
    return count;
  };

  // Calculate growth with real calendar
  const calculateGrowth = useMemo(() => {
    const data = [];
    const start = new Date(startDate);
    
    // Use advanced mode expected return if enabled, otherwise use basic growth rate
    const effectiveGrowthRate = advancedMode 
      ? advancedMetrics.expectedDailyReturn / 100
      : growthRate / 100;
    
    let currentAmount = initialAmount;
    let totalWithdrawn = 0;
    let totalContributed = 0;
    let totalFeesPaid = 0;
    let compoundingPeriods = 0;
    
    for (let month = 0; month <= timeHorizon; month++) {
      const currentDate = new Date(start);
      currentDate.setMonth(currentDate.getMonth() + month);
      const year = currentDate.getFullYear();
      const monthIndex = currentDate.getMonth();
      const compoundingDaysThisMonth = getCompoundingDaysInMonth(year, monthIndex, compoundFrequency);
      
      let monthlyWithdrawal = 0;
      let monthlyContributionAmount = 0;
      let monthlyFeesAmount = 0;
      
      if (month > 0) {
        if (monthlyContribution > 0) {
          currentAmount += monthlyContribution;
          totalContributed += monthlyContribution;
          monthlyContributionAmount = monthlyContribution;
        }
        
        for (let i = 0; i < compoundingDaysThisMonth; i++) {
          currentAmount *= (1 + effectiveGrowthRate);
          compoundingPeriods++;
        }
        
        // Deduct fees (only in advanced mode)
        if (advancedMode && advancedMetrics.monthlyCommissions > 0) {
          currentAmount -= advancedMetrics.monthlyCommissions;
          totalFeesPaid += advancedMetrics.monthlyCommissions;
          monthlyFeesAmount = advancedMetrics.monthlyCommissions;
        }
        
        // Withdrawals
        let shouldWithdraw = false;
        switch (withdrawalFrequency) {
          case 'monthly': shouldWithdraw = true; break;
          case 'quarterly': shouldWithdraw = month % 3 === 0; break;
          case 'yearly': shouldWithdraw = month % 12 === 0; break;
          default: shouldWithdraw = true;
        }
        
        if (withdrawalEnabled && shouldWithdraw && currentAmount > 0) {
          monthlyWithdrawal = withdrawalType === 'percent' 
            ? currentAmount * (withdrawalRate / 100)
            : Math.min(withdrawalRate, currentAmount);
          currentAmount -= monthlyWithdrawal;
          totalWithdrawn += monthlyWithdrawal;
        }
      }
      
      data.push({
        month,
        date: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        balance: Math.round(currentAmount * 100) / 100,
        withdrawn: Math.round(totalWithdrawn * 100) / 100,
        monthlyWithdrawal: Math.round(monthlyWithdrawal * 100) / 100,
        monthlyContribution: Math.round(monthlyContributionAmount * 100) / 100,
        totalContributed: Math.round(totalContributed * 100) / 100,
        totalFeesPaid: Math.round(totalFeesPaid * 100) / 100,
        reinvested: Math.round(currentAmount * 100) / 100,
        compoundingPeriods
      });
    }
    
    return data;
  }, [initialAmount, growthRate, compoundFrequency, withdrawalEnabled, withdrawalRate, withdrawalType, withdrawalFrequency, monthlyContribution, timeHorizon, startDate, advancedMode, advancedMetrics]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    if (calculateGrowth.length === 0) return null;
    
    const finalData = calculateGrowth[calculateGrowth.length - 1];
    const totalInvested = initialAmount + finalData.totalContributed;
    const totalGain = finalData.balance + finalData.withdrawn - totalInvested;
    const totalReturn = ((finalData.balance + finalData.withdrawn) / totalInvested - 1) * 100;
    
    const stateData = STATE_TAX_DATA[selectedState];
    const stateTaxRate = stateData.hasCapGains ? stateData.rate : 0;
    const taxableAmount = Math.max(0, finalData.withdrawn + finalData.balance - totalInvested);
    const federalTax = taxableAmount * (federalTaxBracket / 100);
    const stateTax = taxableAmount * (stateTaxRate / 100);
    const niitTax = taxableAmount > 200000 ? taxableAmount * 0.038 : 0;
    const totalTax = federalTax + stateTax + niitTax;
    
    return {
      finalBalance: finalData.balance,
      totalWithdrawn: finalData.withdrawn,
      totalContributed: finalData.totalContributed,
      totalFeesPaid: finalData.totalFeesPaid,
      totalInvested,
      totalGain,
      totalReturn,
      federalTax,
      stateTax,
      niitTax,
      totalTax,
      compoundingPeriods: finalData.compoundingPeriods
    };
  }, [calculateGrowth, initialAmount, federalTaxBracket, selectedState]);

  // Info tooltip component
  const InfoTooltip = ({ tooltipKey }) => {
    const tooltip = TOOLTIPS[tooltipKey];
    const isActive = activeTooltip === tooltipKey;
    
    return (
      <div className="relative inline-block ml-2 tooltip-container">
        <button
          onClick={(e) => { e.stopPropagation(); setActiveTooltip(isActive ? null : tooltipKey); }}
          onMouseEnter={() => setActiveTooltip(tooltipKey)}
          className="w-4 h-4 rounded-full border border-slate-500 text-slate-400 text-xs flex items-center justify-center hover:border-emerald-500 hover:text-emerald-400 transition-colors"
        >
          i
        </button>
        {isActive && tooltip && (
          <div className="absolute w-80 bg-slate-900 border border-emerald-500/30 rounded-lg p-4 shadow-2xl" style={{ zIndex: 9999, left: '24px', top: '-8px' }}>
            <h4 className="text-emerald-400 font-semibold text-sm mb-2">{tooltip.title}</h4>
            <p className="text-slate-300 text-xs mb-3">{tooltip.description}</p>
            {tooltip.formula && (
              <div className="bg-slate-800/50 rounded px-2 py-1 mb-3">
                <code className="text-amber-400 text-xs">{tooltip.formula}</code>
              </div>
            )}
            <div className="border-t border-slate-700 pt-2">
              <p className="text-slate-400 text-xs font-medium mb-1">Best Practice:</p>
              <p className="text-slate-300 text-xs">{tooltip.bestPractice}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Input field with debouncing
  const InputField = ({ label, value, onChange, type = 'number', min, max, step, suffix, prefix, options, tooltipKey, small = false }) => {
    const [localValue, setLocalValue] = useState(value);
    const timeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    
    useEffect(() => {
      if (!isTypingRef.current) setLocalValue(value);
    }, [value]);
    
    useEffect(() => {
      return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);
    
    const handleChange = (e) => {
      const rawValue = e.target.value;
      isTypingRef.current = true;
      setLocalValue(rawValue);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onChange(type === 'number' ? parseFloat(rawValue) || 0 : rawValue);
      }, 800);
    };
    
    const handleBlur = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      isTypingRef.current = false;
      if (type === 'number') {
        const numValue = parseFloat(localValue) || 0;
        onChange(numValue);
        setLocalValue(numValue);
      } else {
        onChange(localValue);
      }
    };
    
    const inputClasses = small 
      ? "w-full bg-slate-800/80 border border-slate-600/50 rounded-lg pl-3 pr-8 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
      : "w-full bg-slate-800/80 border border-slate-600/50 rounded-lg pl-4 pr-12 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";
    
    return (
      <div className={small ? "mb-3" : "mb-4"}>
        <label className="flex items-center text-slate-300 text-sm font-medium mb-2">
          {label}
          {tooltipKey && <InfoTooltip tooltipKey={tooltipKey} />}
        </label>
        <div className="relative">
          {options ? (
            <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClasses + " appearance-none cursor-pointer pr-8"}>
              {options.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>)}
            </select>
          ) : (
            <input
              type={type === 'number' ? 'text' : type}
              inputMode={type === 'number' ? 'decimal' : undefined}
              value={localValue}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClasses}
            />
          )}
          {suffix && !options && (
            <span className={`absolute ${small ? 'right-3' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm`}>{suffix}</span>
          )}
          {options && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Strategy Card Component
  const StrategyCard = ({ strategyKey, strategy, isSelected, onSelect }) => (
    <button
      onClick={() => onSelect(strategyKey)}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected 
          ? 'border-emerald-500 bg-emerald-500/10' 
          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-white">{strategy.name}</span>
        {isSelected && (
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <p className="text-slate-400 text-xs mb-3">{strategy.description}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-emerald-400 font-medium">{strategy.settings.winRate}%</div>
          <div className="text-slate-500">Win Rate</div>
        </div>
        <div className="text-center">
          <div className="text-purple-400 font-medium">1:{strategy.settings.riskRewardRatio}</div>
          <div className="text-slate-500">R:R</div>
        </div>
        <div className="text-center">
          <div className="text-amber-400 font-medium">{strategy.settings.riskPerTrade}%</div>
          <div className="text-slate-500">Risk</div>
        </div>
      </div>
    </button>
  );

  // Metric Card Component
  const MetricCard = ({ label, value, subValue, color = 'emerald', tooltipKey, warning = false }) => (
    <div className={`bg-slate-800/50 rounded-lg p-3 border ${warning ? 'border-amber-500/50' : 'border-slate-700/50'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-400 text-xs">{label}</span>
        {tooltipKey && <InfoTooltip tooltipKey={tooltipKey} />}
      </div>
      <div className={`text-lg font-bold text-${color}-400`}>{value}</div>
      {subValue && <div className="text-slate-500 text-xs">{subValue}</div>}
    </div>
  );

  // Chart tooltip
  const CustomChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      const growthPercent = ((data?.balance - initialAmount) / initialAmount * 100).toFixed(1);
      const isNegative = parseFloat(growthPercent) < 0;
      return (
        <div className="bg-slate-900/95 border border-emerald-500/30 rounded-lg p-4 shadow-xl">
          <p className="text-emerald-400 font-semibold mb-2">{data?.date}</p>
          <div className="space-y-1 text-sm">
            <p className="text-emerald-400">Balance: <span className="text-white">${data?.balance?.toLocaleString()}</span></p>
            <p className={isNegative ? "text-red-400" : "text-cyan-400"}>
              Growth: <span className="text-white">{isNegative ? '' : '+'}{growthPercent}%</span>
            </p>
            <p className="text-purple-400">Total Withdrawn: <span className="text-white">${data?.withdrawn?.toLocaleString()}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <style>{`
        input[type="text"]::-webkit-inner-spin-button,
        input[type="text"]::-webkit-outer-spin-button { -webkit-appearance: none !important; margin: 0 !important; }
        input[type="text"] { -moz-appearance: textfield !important; }
        select option { background-color: #1e293b; color: white; }
      `}</style>
      
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Compound Growth Lab
          </h1>
          <p className="text-slate-400">Trading Portfolio Simulator</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-700/50 pb-4">
          {['calculator', 'insights', 'taxCenter'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab === 'calculator' && 'Scenario Lab'}
              {tab === 'insights' && 'Pro Insights'}
              {tab === 'taxCenter' && 'Tax Center'}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-4 space-y-6">
            {activeTab === 'calculator' && (
              <>
                {/* Core Settings with Advanced Toggle */}
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Core Settings
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={resetScenario}
                        className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                      </button>
                      <button
                        onClick={() => setAdvancedMode(!advancedMode)}
                        className={`text-xs px-3 py-1 rounded-full transition-all ${
                          advancedMode 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        Advanced
                      </button>
                    </div>
                  </div>
                  
                  <InputField label="Starting Capital" value={initialAmount} onChange={setInitialAmount} min={1} step={1000} suffix="$" tooltipKey="initialInvestment" />
                  
                  {!advancedMode && (
                    <InputField label="Growth Rate per Period" value={growthRate} onChange={setGrowthRate} min={0} max={100} step={0.01} suffix="%" tooltipKey="growthRate" />
                  )}
                  
                  <InputField 
                    label="Compound Frequency" 
                    value={compoundFrequency} 
                    onChange={setCompoundFrequency}
                    tooltipKey="compoundFrequency"
                    options={[
                      { value: 'daily', label: 'Daily (365/year)' },
                      { value: 'weekday', label: 'Weekdays (252/year)' },
                      { value: 'weekly', label: 'Weekly (52/year)' },
                      { value: 'monthly', label: 'Monthly (12/year)' },
                      { value: 'quarterly', label: 'Quarterly (4/year)' }
                    ]}
                  />
                  
                  <InputField label="Start Date" value={startDate} onChange={setStartDate} type="date" tooltipKey="startDate" />
                  <InputField label="Time Horizon" value={timeHorizon} onChange={setTimeHorizon} min={1} max={120} suffix="months" tooltipKey="timeHorizon" />
                </div>

                {/* Advanced Mode: Strategy Templates */}
                {advancedMode && (
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Strategy Templates
                    </h3>
                    <p className="text-slate-400 text-xs mb-4">Select a pre-configured strategy or customize your own parameters below.</p>
                    
                    <div className="space-y-3">
                      {Object.entries(STRATEGY_TEMPLATES).map(([key, strategy]) => (
                        <StrategyCard 
                          key={key}
                          strategyKey={key}
                          strategy={strategy}
                          isSelected={selectedStrategy === key}
                          onSelect={applyStrategy}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Advanced Mode: Strategy Parameters */}
                {advancedMode && (
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Strategy Parameters
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Win Rate" value={winRate} onChange={setWinRate} min={1} max={99} step={1} suffix="%" tooltipKey="winRate" small />
                      <InputField label="Risk:Reward" value={riskRewardRatio} onChange={setRiskRewardRatio} min={0.5} max={10} step={0.1} prefix="1:" tooltipKey="riskRewardRatio" small />
                      <InputField label="Risk per Trade" value={riskPerTrade} onChange={setRiskPerTrade} min={0.1} max={10} step={0.1} suffix="%" tooltipKey="riskPerTrade" small />
                      <InputField label="Trades/Day" value={tradesPerDay} onChange={setTradesPerDay} min={0.1} max={50} step={0.5} tooltipKey="tradesPerDay" small />
                    </div>
                    
                    <InputField label="Commission per Trade (round-trip)" value={commissionPerTrade} onChange={setCommissionPerTrade} min={0} max={50} step={0.5} suffix="$" tooltipKey="commissionPerTrade" small />
                    
                    {/* Calculated Metrics */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">Calculated Metrics</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <MetricCard 
                          label="Expectancy" 
                          value={advancedMetrics.expectancy.toFixed(2)} 
                          subValue="per $1 risked"
                          color={advancedMetrics.isPositiveExpectancy ? 'emerald' : 'red'}
                          tooltipKey="expectancy"
                          warning={!advancedMetrics.isPositiveExpectancy}
                        />
                        <MetricCard 
                          label="Breakeven Win Rate" 
                          value={`${advancedMetrics.breakevenWinRate.toFixed(1)}%`}
                          subValue={advancedMetrics.winRateVsBreakeven > 0 ? `+${advancedMetrics.winRateVsBreakeven.toFixed(1)}% edge` : `${advancedMetrics.winRateVsBreakeven.toFixed(1)}% below`}
                          color={advancedMetrics.winRateVsBreakeven > 0 ? 'emerald' : 'red'}
                          tooltipKey="breakevenWinRate"
                          warning={advancedMetrics.winRateVsBreakeven < 0}
                        />
                        <MetricCard 
                          label="Kelly Criterion" 
                          value={`${Math.max(0, advancedMetrics.kelly).toFixed(1)}%`}
                          subValue={`Half: ${Math.max(0, advancedMetrics.halfKelly).toFixed(1)}%`}
                          color="purple"
                          tooltipKey="kellyPercent"
                        />
                        <MetricCard 
                          label="Profit Factor" 
                          value={advancedMetrics.profitFactor.toFixed(2)}
                          subValue={advancedMetrics.profitFactor > 1.5 ? 'Good' : advancedMetrics.profitFactor > 1 ? 'Marginal' : 'Unprofitable'}
                          color={advancedMetrics.profitFactor > 1.5 ? 'emerald' : advancedMetrics.profitFactor > 1 ? 'amber' : 'red'}
                          tooltipKey="profitFactor"
                        />
                        <MetricCard 
                          label="Expected Daily" 
                          value={`${advancedMetrics.expectedDailyReturn.toFixed(2)}%`}
                          subValue={`~${(advancedMetrics.expectedDailyReturn * 252).toFixed(0)}% annually`}
                          color="cyan"
                        />
                        <MetricCard 
                          label="Daily Commissions" 
                          value={`$${advancedMetrics.dailyCommissions.toFixed(0)}`}
                          subValue={`${advancedMetrics.commissionImpactPercent.toFixed(2)}% of capital`}
                          color="amber"
                        />
                      </div>
                      
                      {!advancedMetrics.isPositiveExpectancy && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-xs font-medium">Warning: Negative Expectancy</p>
                          <p className="text-slate-400 text-xs mt-1">This strategy loses money over time. Increase win rate or risk:reward ratio.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Monthly Additions - shown in both modes */}
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    Monthly Additions
                  </h3>
                  <InputField label="Monthly Contribution" value={monthlyContribution} onChange={setMonthlyContribution} min={0} step={50} suffix="$" tooltipKey="monthlyContribution" />
                  {advancedMode && (
                    <div className="text-xs text-slate-400 mt-2 p-2 bg-slate-900/50 rounded">
                      Trading fees calculated automatically: ${advancedMetrics.monthlyCommissions.toFixed(0)}/month based on {tradesPerDay} trades/day at ${commissionPerTrade}/trade
                    </div>
                  )}
                </div>

                {/* Withdrawals */}
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Regular Withdrawals
                    </h3>
                    <button
                      onClick={() => setWithdrawalEnabled(!withdrawalEnabled)}
                      className={`w-12 h-6 rounded-full transition-all relative ${withdrawalEnabled ? 'bg-amber-500' : 'bg-slate-700'}`}
                    >
                      <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${withdrawalEnabled ? 'left-6' : 'left-0.5'}`}></span>
                    </button>
                  </div>
                  
                  {withdrawalEnabled && (
                    <>
                      <div className="flex gap-2 mb-4">
                        <button onClick={() => setWithdrawalType('percent')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${withdrawalType === 'percent' ? 'bg-amber-500 text-white' : 'bg-slate-700/50 text-slate-400'}`}>
                          Percentage
                        </button>
                        <button onClick={() => setWithdrawalType('fixed')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${withdrawalType === 'fixed' ? 'bg-amber-500 text-white' : 'bg-slate-700/50 text-slate-400'}`}>
                          Fixed $
                        </button>
                      </div>
                      <InputField label="Withdrawal Amount" value={withdrawalRate} onChange={setWithdrawalRate} min={0} step={withdrawalType === 'percent' ? 0.5 : 10} suffix={withdrawalType === 'percent' ? '%' : '$'} tooltipKey="withdrawalAmount" />
                      <InputField 
                        label="Withdrawal Frequency" 
                        value={withdrawalFrequency} 
                        onChange={setWithdrawalFrequency}
                        tooltipKey="withdrawalFrequency"
                        options={[
                          { value: 'monthly', label: 'Monthly' },
                          { value: 'quarterly', label: 'Quarterly' },
                          { value: 'yearly', label: 'Yearly' }
                        ]}
                      />
                    </>
                  )}
                </div>
              </>
            )}

            {/* Pro Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                {/* Negative Projection Alert Section */}
                {summaryStats && summaryStats.totalReturn < 0 && (
                  <div id="negative-projection-section" className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Why Your Portfolio Is Declining
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Diagnose the problem */}
                      <div className="p-4 bg-slate-900/50 rounded-lg">
                        <h4 className="text-red-400 font-medium mb-2">Diagnosis</h4>
                        <ul className="text-slate-300 text-sm space-y-2">
                          {advancedMode && !advancedMetrics.isPositiveExpectancy && (
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span><strong className="text-red-400">Negative Expectancy:</strong> Your current win rate ({winRate}%) and risk:reward ratio (1:{riskRewardRatio}) result in an expectancy of {advancedMetrics.expectancy.toFixed(2)}. You need above 0 to be profitable.</span>
                            </li>
                          )}
                          {advancedMode && winRate < advancedMetrics.breakevenWinRate && (
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span><strong className="text-red-400">Below Breakeven:</strong> At 1:{riskRewardRatio} R:R, you need at least {advancedMetrics.breakevenWinRate.toFixed(1)}% win rate. You're at {winRate}%.</span>
                            </li>
                          )}
                          {advancedMode && advancedMetrics.commissionImpactPercent > 0.5 && (
                            <li className="flex items-start gap-2">
                              <span className="text-amber-400 mt-1">•</span>
                              <span><strong className="text-amber-400">High Commission Drag:</strong> Fees consume {advancedMetrics.commissionImpactPercent.toFixed(2)}% of your capital daily (${advancedMetrics.monthlyCommissions.toFixed(0)}/month).</span>
                            </li>
                          )}
                          {!advancedMode && growthRate <= 0 && (
                            <li className="flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span><strong className="text-red-400">Zero/Negative Growth Rate:</strong> Your growth rate is set to {growthRate}% which results in no growth or decline.</span>
                            </li>
                          )}
                          {withdrawalEnabled && (
                            <li className="flex items-start gap-2">
                              <span className="text-amber-400 mt-1">•</span>
                              <span><strong className="text-amber-400">Withdrawals Exceed Growth:</strong> Your withdrawal rate may be outpacing portfolio growth.</span>
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      {/* How to fix it */}
                      <div className="p-4 bg-slate-900/50 rounded-lg">
                        <h4 className="text-emerald-400 font-medium mb-2">How to Fix It</h4>
                        <ul className="text-slate-300 text-sm space-y-2">
                          {advancedMode && !advancedMetrics.isPositiveExpectancy && (
                            <>
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">1.</span>
                                <span><strong>Increase Win Rate:</strong> To break even at 1:{riskRewardRatio} R:R, you need {advancedMetrics.breakevenWinRate.toFixed(0)}% win rate. Target {Math.ceil(advancedMetrics.breakevenWinRate + 5)}%+ for profitability.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">2.</span>
                                <span><strong>Increase Risk:Reward:</strong> At {winRate}% win rate, you need at least 1:{(100/winRate - 1).toFixed(1)} R:R to break even. Consider wider take-profits or tighter stops.</span>
                              </li>
                            </>
                          )}
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">3.</span>
                            <span><strong>Reduce Trade Frequency:</strong> Fewer trades = less commission drag. Focus on higher-quality setups.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">4.</span>
                            <span><strong>Lower Risk Per Trade:</strong> Smaller position sizes reduce drawdowns and give more room for your edge to play out.</span>
                          </li>
                          {withdrawalEnabled && (
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 mt-1">5.</span>
                              <span><strong>Reduce Withdrawals:</strong> Let profits compound longer before taking income.</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Personalized Insights */}
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Strategy Analysis</h3>
                  
                  <div className="space-y-4">
                    {/* Growth Rate Insight */}
                    {!advancedMode && (
                      <div className={`p-4 rounded-lg ${growthRate > 0.5 ? 'bg-red-500/10 border border-red-500/30' : growthRate > 0.15 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
                        <div className="flex items-start gap-3">
                          {growthRate > 0.5 ? (
                            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : growthRate > 0.15 ? (
                            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <div>
                            <h4 className={`font-medium mb-1 ${growthRate > 0.5 ? 'text-red-400' : growthRate > 0.15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              Growth Rate: {growthRate}% per {compoundFrequency === 'weekday' ? 'trading day' : compoundFrequency === 'weekly' ? 'week' : 'period'}
                            </h4>
                            <p className="text-slate-300 text-sm">
                              {growthRate > 0.5 
                                ? `This rate (${(Math.pow(1 + growthRate/100, 252) * 100 - 100).toFixed(0)}% annually) is unrealistic. Even elite hedge funds average 15-25% annually. Research shows top day traders achieve 0.03-0.15% daily.`
                                : growthRate > 0.15 
                                ? `This is aggressive but achievable for skilled traders. At ${growthRate}% daily, you're targeting ~${(Math.pow(1 + growthRate/100, 252) * 100 - 100).toFixed(0)}% annually. Only 1-3% of traders consistently achieve this.`
                                : `This is a realistic target for profitable day traders. Research shows successful traders average 0.03-0.15% daily (1-4% monthly).`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Win Rate vs Breakeven Insight (Advanced Mode) */}
                    {advancedMode && (
                      <div className={`p-4 rounded-lg ${advancedMetrics.winRateVsBreakeven < 0 ? 'bg-red-500/10 border border-red-500/30' : advancedMetrics.winRateVsBreakeven < 5 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
                        <div className="flex items-start gap-3">
                          {advancedMetrics.winRateVsBreakeven < 0 ? (
                            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : advancedMetrics.winRateVsBreakeven < 5 ? (
                            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <div>
                            <h4 className={`font-medium mb-1 ${advancedMetrics.winRateVsBreakeven < 0 ? 'text-red-400' : advancedMetrics.winRateVsBreakeven < 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              Win Rate Edge: {advancedMetrics.winRateVsBreakeven > 0 ? '+' : ''}{advancedMetrics.winRateVsBreakeven.toFixed(1)}% above breakeven
                            </h4>
                            <p className="text-slate-300 text-sm">
                              {advancedMetrics.winRateVsBreakeven < 0 
                                ? `Your ${winRate}% win rate is below the ${advancedMetrics.breakevenWinRate.toFixed(1)}% needed to break even at 1:${riskRewardRatio} R:R. You will lose money over time. Increase win rate or R:R ratio.`
                                : advancedMetrics.winRateVsBreakeven < 5 
                                ? `You're only ${advancedMetrics.winRateVsBreakeven.toFixed(1)}% above breakeven. Small win rate fluctuations could push you into unprofitability. Consider improving your edge or increasing R:R.`
                                : `You have a healthy ${advancedMetrics.winRateVsBreakeven.toFixed(1)}% edge above breakeven. This buffer helps absorb natural variance in trading results.`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Risk Per Trade Insight (Advanced Mode) */}
                    {advancedMode && (
                      <div className={`p-4 rounded-lg ${riskPerTrade > 2 ? 'bg-red-500/10 border border-red-500/30' : riskPerTrade > 1 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
                        <div className="flex items-start gap-3">
                          {riskPerTrade > 2 ? (
                            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : riskPerTrade > 1 ? (
                            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <div>
                            <h4 className={`font-medium mb-1 ${riskPerTrade > 2 ? 'text-red-400' : riskPerTrade > 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              Risk Per Trade: {riskPerTrade}% of account
                            </h4>
                            <p className="text-slate-300 text-sm">
                              {riskPerTrade > 2 
                                ? `The CFA Institute recommends max 2% risk per trade. At ${riskPerTrade}%, a 5-trade losing streak costs ${(riskPerTrade * 5).toFixed(0)}% of your account. This dramatically increases risk of ruin.`
                                : riskPerTrade > 1 
                                ? `Moderate risk level. Professional traders often use 0.5-1%. At ${riskPerTrade}%, expect potential drawdowns of ${(riskPerTrade * 10).toFixed(0)}%+ during losing streaks.`
                                : `Conservative risk management. This gives you staying power through inevitable losing streaks while still allowing meaningful growth.`
                              }
                            </p>
                            {advancedMetrics.kelly > 0 && (
                              <p className="text-slate-400 text-xs mt-2">
                                Kelly suggests: {advancedMetrics.kelly.toFixed(1)}% (Full) | {advancedMetrics.halfKelly.toFixed(1)}% (Half) | {advancedMetrics.quarterKelly.toFixed(1)}% (Quarter)
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Commission Impact Insight (Advanced Mode) */}
                    {advancedMode && (
                      <div className={`p-4 rounded-lg ${advancedMetrics.commissionImpactPercent > 0.5 ? 'bg-red-500/10 border border-red-500/30' : advancedMetrics.commissionImpactPercent > 0.2 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
                        <div className="flex items-start gap-3">
                          <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${advancedMetrics.commissionImpactPercent > 0.5 ? 'text-red-400' : advancedMetrics.commissionImpactPercent > 0.2 ? 'text-amber-400' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h4 className={`font-medium mb-1 ${advancedMetrics.commissionImpactPercent > 0.5 ? 'text-red-400' : advancedMetrics.commissionImpactPercent > 0.2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              Commission Drag: ${advancedMetrics.monthlyCommissions.toFixed(0)}/month ({advancedMetrics.commissionImpactPercent.toFixed(2)}% daily)
                            </h4>
                            <p className="text-slate-300 text-sm">
                              {advancedMetrics.commissionImpactPercent > 0.5 
                                ? `High-frequency trading with ${tradesPerDay} trades/day at $${commissionPerTrade}/trade significantly erodes profits. Research shows fees can reduce profitability by 18%+. Consider reducing trade frequency or finding lower-cost brokers.`
                                : advancedMetrics.commissionImpactPercent > 0.2 
                                ? `Moderate commission impact. At $${(advancedMetrics.monthlyCommissions * 12).toFixed(0)}/year, ensure your edge justifies these costs. Many brokers now offer commission-free stock/ETF trading.`
                                : `Commission costs are well-managed relative to your account size and trading frequency.`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expectancy Quality Insight (Advanced Mode) */}
                    {advancedMode && advancedMetrics.isPositiveExpectancy && (
                      <div className={`p-4 rounded-lg ${advancedMetrics.expectancy > 0.5 ? 'bg-emerald-500/10 border border-emerald-500/30' : advancedMetrics.expectancy > 0.2 ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                        <div className="flex items-start gap-3">
                          <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${advancedMetrics.expectancy > 0.5 ? 'text-emerald-400' : advancedMetrics.expectancy > 0.2 ? 'text-cyan-400' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <div>
                            <h4 className={`font-medium mb-1 ${advancedMetrics.expectancy > 0.5 ? 'text-emerald-400' : advancedMetrics.expectancy > 0.2 ? 'text-cyan-400' : 'text-amber-400'}`}>
                              Expectancy: ${(advancedMetrics.expectancy * 100).toFixed(0)} per $100 risked
                            </h4>
                            <p className="text-slate-300 text-sm">
                              {advancedMetrics.expectancy > 0.5 
                                ? `Excellent expectancy. This is a strong trading edge. At ${tradesPerDay} trades/day risking ${riskPerTrade}%, you could generate ~${advancedMetrics.expectedDailyReturn.toFixed(2)}% daily returns.`
                                : advancedMetrics.expectancy > 0.2 
                                ? `Good expectancy. Your edge is solid but monitor for changes. Small shifts in win rate or R:R can significantly impact results.`
                                : `Marginal expectancy. While positive, this edge is thin. Focus on improving win rate or R:R before scaling up position sizes.`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Withdrawal Impact Insight */}
                    {withdrawalEnabled && (
                      <div className={`p-4 rounded-lg ${withdrawalType === 'percent' && withdrawalRate > 10 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-900/50'}`}>
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div>
                            <h4 className="text-amber-400 font-medium mb-1">
                              Withdrawals: {withdrawalType === 'percent' ? `${withdrawalRate}%` : `$${withdrawalRate}`} {withdrawalFrequency}
                            </h4>
                            <p className="text-slate-300 text-sm">
                              {withdrawalType === 'percent' && withdrawalRate > 10 
                                ? `High withdrawal rate. The 4% rule (Bengen study) suggests 3.5-4.5% annual withdrawal for portfolio longevity. At ${withdrawalRate}% ${withdrawalFrequency}, you risk depleting capital faster than it grows.`
                                : `Withdrawing income while growing capital requires your returns to exceed withdrawal rate. Ensure your strategy generates enough to sustain both growth and income.`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Educational Reference Section */}
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Understanding the Metrics</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                      <h4 className="text-emerald-400 font-medium mb-2">Expectancy</h4>
                      <p className="text-slate-300 text-sm mb-2">The average profit per dollar risked. A positive expectancy is required for long-term profitability. Above 0.2 is good, above 0.5 is excellent.</p>
                      <code className="text-amber-400 text-xs bg-slate-800 px-2 py-1 rounded">E = (Win% × R:R) - (Loss%)</code>
                    </div>
                    
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                      <h4 className="text-purple-400 font-medium mb-2">Kelly Criterion</h4>
                      <p className="text-slate-300 text-sm mb-2">Mathematically optimal position sizing for maximum growth. Full Kelly is aggressive with high volatility. Half-Kelly captures ~75% of growth with ~50% less drawdown. Quarter-Kelly is conservative.</p>
                      <code className="text-amber-400 text-xs bg-slate-800 px-2 py-1 rounded">K = Win% - [(1-Win%) / R:R]</code>
                    </div>
                    
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                      <h4 className="text-cyan-400 font-medium mb-2">Breakeven Win Rate</h4>
                      <p className="text-slate-300 text-sm mb-2">The minimum win rate needed to not lose money at your R:R ratio. At 1:1, you need 50%. At 1:2, only 33%. At 1:3, just 25%. Higher R:R gives more margin for error.</p>
                      <code className="text-amber-400 text-xs bg-slate-800 px-2 py-1 rounded">BE = 1 / (1 + R:R)</code>
                    </div>

                    <div className="p-4 bg-slate-900/50 rounded-lg">
                      <h4 className="text-amber-400 font-medium mb-2">Profit Factor</h4>
                      <p className="text-slate-300 text-sm mb-2">Ratio of gross profits to gross losses. Below 1.0 = losing money. 1.0-1.5 = marginal. 1.5-2.0 = good. Above 2.0 = excellent. Most successful strategies fall between 1.3-2.0.</p>
                      <code className="text-amber-400 text-xs bg-slate-800 px-2 py-1 rounded">PF = (Win% × Avg Win) / (Loss% × Avg Loss)</code>
                    </div>
                    
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                      <h4 className="text-red-400 font-medium mb-2">Risk Management Rules</h4>
                      <ul className="text-slate-300 text-sm space-y-1">
                        <li>• <strong>2% Rule:</strong> Never risk more than 2% per trade (CFA Institute recommendation)</li>
                        <li>• <strong>6% Rule:</strong> Stop trading if daily losses reach 6% of account</li>
                        <li>• <strong>20% Max Drawdown:</strong> Reassess strategy if drawdown exceeds 20%</li>
                        <li>• <strong>Half-Kelly or Less:</strong> Use fractional Kelly for smoother equity curve</li>
                        <li>• <strong>Positive Expectancy:</strong> Never trade a negative expectancy system</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-900/50 rounded-lg">
                      <h4 className="text-slate-300 font-medium mb-2">Day Trading Statistics (Research)</h4>
                      <ul className="text-slate-400 text-sm space-y-1">
                        <li>• Only 1-3% of day traders are consistently profitable long-term</li>
                        <li>• 97% of day traders lose money over time</li>
                        <li>• Successful traders average 0.03-0.15% daily (1-4% monthly)</li>
                        <li>• Elite professionals achieve 40-60% annually</li>
                        <li>• 1% daily would turn $10K into more than Elon Musk's wealth in 5 years</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Center Tab */}
            {activeTab === 'taxCenter' && (
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tax Configuration</h3>
                
                <InputField 
                  label="State" 
                  value={selectedState} 
                  onChange={setSelectedState}
                  tooltipKey="state"
                  options={Object.entries(STATE_TAX_DATA).map(([code, data]) => ({
                    value: code,
                    label: `${data.name}${!data.hasCapGains ? ' (No Cap Gains Tax)' : ` (${data.rate}%)`}`
                  }))}
                />
                
                <InputField 
                  label="Federal Tax Bracket" 
                  value={federalTaxBracket} 
                  onChange={(val) => setFederalTaxBracket(parseFloat(val))}
                  tooltipKey="federalTaxBracket"
                  options={[
                    { value: 10, label: '10% ($0 - $11,925)' },
                    { value: 12, label: '12% ($11,926 - $48,475)' },
                    { value: 22, label: '22% ($48,476 - $103,350)' },
                    { value: 24, label: '24% ($103,351 - $197,300)' },
                    { value: 32, label: '32% ($197,301 - $250,525)' },
                    { value: 35, label: '35% ($250,526 - $626,350)' },
                    { value: 37, label: '37% ($626,351+)' }
                  ]}
                />
                
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-amber-400 text-sm font-medium">Short-Term Capital Gains</p>
                    <p className="text-slate-400 text-xs">Day trading profits taxed as ordinary income (10-37%)</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-emerald-400 text-sm font-medium">Wash Sale Rule</p>
                    <p className="text-slate-400 text-xs">Can't claim loss if repurchasing within 61 days</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-purple-400 text-sm font-medium">Quarterly Estimated Taxes</p>
                    <p className="text-slate-400 text-xs">Required if owing $1,000+ annually</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-8 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-emerald-400 text-xs font-medium mb-1">Final Balance</p>
                <p className="text-2xl font-bold text-white">${summaryStats?.finalBalance?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                <p className="text-purple-400 text-xs font-medium mb-1">Total Withdrawn</p>
                <p className="text-2xl font-bold text-white">${summaryStats?.totalWithdrawn?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-4">
                <p className="text-cyan-400 text-xs font-medium mb-1">Total Return</p>
                <p className="text-2xl font-bold text-white">{summaryStats?.totalReturn?.toFixed(1) || 0}%</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-400 text-xs font-medium mb-1">Est. Total Tax</p>
                <p className="text-2xl font-bold text-white">${Math.round(summaryStats?.totalTax || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Monte Carlo Results (Advanced Mode) */}
            {advancedMode && monteCarloResults && (
              <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Monte Carlo Simulation ({simulationRuns} runs)
                    <InfoTooltip tooltipKey="monteCarlo" />
                  </h3>
                  <div className="flex items-center">
                    <button
                      onClick={() => setMonteCarloSeed(Date.now())}
                      className="text-xs text-slate-400 hover:text-purple-400 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Re-run
                    </button>
                    <InfoTooltip tooltipKey="monteCarloRerun" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <div className="text-emerald-400 text-lg font-bold">${monteCarloResults.statistics.median.toLocaleString()}</div>
                    <div className="text-slate-500 text-xs">Median Outcome</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <div className="text-cyan-400 text-lg font-bold">{monteCarloResults.statistics.profitablePercent}%</div>
                    <div className="text-slate-500 text-xs">Profitable Runs</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <div className="text-amber-400 text-lg font-bold">{monteCarloResults.statistics.avgDrawdown}%</div>
                    <div className="text-slate-500 text-xs">Avg Max Drawdown</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <div className="text-red-400 text-lg font-bold">{monteCarloResults.statistics.blownUpPercent}%</div>
                    <div className="text-slate-500 text-xs">Blown Up</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="text-center">
                    <span className="text-slate-400">10th %ile:</span>
                    <span className="text-red-400 ml-2">${monteCarloResults.statistics.percentile10.toLocaleString()}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400">Average:</span>
                    <span className="text-white ml-2">${monteCarloResults.statistics.average.toLocaleString()}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400">90th %ile:</span>
                    <span className="text-emerald-400 ml-2">${monteCarloResults.statistics.percentile90.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Equity Curve Chart */}
                {showMonteCarloChart && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="trade" type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                        <ReferenceLine y={initialAmount} stroke="#64748b" strokeDasharray="3 3" />
                        <Line data={monteCarloResults.sampleCurves.worstRun.equityCurve} dataKey="balance" stroke="#ef4444" dot={false} strokeWidth={1} name="Worst" />
                        <Line data={monteCarloResults.sampleCurves.medianRun.equityCurve} dataKey="balance" stroke="#a855f7" dot={false} strokeWidth={2} name="Median" />
                        <Line data={monteCarloResults.sampleCurves.bestRun.equityCurve} dataKey="balance" stroke="#10b981" dot={false} strokeWidth={1} name="Best" />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Main Chart */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Portfolio Growth</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calculateGrowth}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWithdrawn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="reinvested" name="Balance" stroke="#10b981" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2} />
                    <Area type="monotone" dataKey="withdrawn" name="Withdrawn" stroke="#a855f7" fillOpacity={1} fill="url(#colorWithdrawn)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Monthly Breakdown</h3>
              
              {/* Negative Trajectory Warning */}
              {summaryStats && summaryStats.totalReturn < 0 && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-red-400 text-sm font-medium">Negative Growth Projected</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Your current parameters result in portfolio decline. 
                      {advancedMode && !advancedMetrics.isPositiveExpectancy && ' Your strategy has negative expectancy. '}
                      <button 
                        onClick={() => {
                          setActiveTab('insights');
                          setTimeout(() => {
                            const section = document.getElementById('negative-projection-section');
                            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }} 
                        className="text-red-400 underline hover:text-red-300"
                      >
                        See Pro Insights
                      </button> to understand why and how to fix it.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-2 text-slate-400">Month</th>
                      <th className="text-right py-3 px-2 text-slate-400">Date</th>
                      <th className="text-right py-3 px-2 text-slate-400">Balance</th>
                      <th className="text-right py-3 px-2 text-slate-400">Growth</th>
                      {withdrawalEnabled && <th className="text-right py-3 px-2 text-slate-400">Withdrawal</th>}
                      <th className="text-right py-3 px-2 text-slate-400">Total Withdrawn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateGrowth.slice(0, 24).map((row, i) => {
                      const growthPercent = ((row.balance - initialAmount) / initialAmount * 100);
                      const isNegative = growthPercent < 0;
                      return (
                        <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="py-3 px-2 text-slate-300">{row.month}</td>
                          <td className="py-3 px-2 text-right text-slate-300">{row.date}</td>
                          <td className={`py-3 px-2 text-right ${isNegative ? 'text-red-400' : 'text-emerald-400'}`}>${row.balance.toLocaleString()}</td>
                          <td className={`py-3 px-2 text-right ${isNegative ? 'text-red-400' : 'text-cyan-400'}`}>
                            {isNegative ? '' : '+'}{growthPercent.toFixed(1)}%
                          </td>
                          {withdrawalEnabled && (
                            <td className="py-3 px-2 text-right text-amber-400">
                              {row.monthlyWithdrawal > 0 ? `$${row.monthlyWithdrawal.toLocaleString()}` : '-'}
                            </td>
                          )}
                          <td className="py-3 px-2 text-right text-purple-400">${row.withdrawn.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    ))}
                  </tbody>
                </table>
                {calculateGrowth.length > 24 && (
                  <p className="text-center text-slate-500 py-4 text-sm">Showing first 24 of {calculateGrowth.length} months</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>This calculator is for educational purposes only. Past performance does not guarantee future results.</p>
          <p className="mt-1">Consult a qualified financial advisor and tax professional before making investment decisions.</p>
        </div>
      </div>
    </div>
  );
};

window.CompoundGrowthCalculator = CompoundGrowthCalculator;