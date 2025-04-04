export const ADVANCED_FEATURES = [
  {
    id: 'trade-restriction',
    name: 'Trade Restriction Mode',
    description: 'Restrict trading by setting custom rules, whitelisting addresses, and implementing cooldown periods.',
    warning: 'Enabling this feature gives you full control over who can trade your token. Misuse may harm market activity.',
    fields: [
      {
        name: 'maxWallets',
        label: 'Maximum Whitelist Size',
        description: 'Defines the maximum number of wallet addresses allowed to trade this token. Set to 0 for unlimited.',
        type: 'number',
        min: 0,
        placeholder: 'Enter maximum number of wallets'
      },
      {
        name: 'cooldownPeriod',
        label: 'Sell Cooldown Period (hours)',
        description: 'Limits how often users can sell their tokens within the specified cooldown period. Helps prevent rapid dumps.',
        type: 'number',
        min: 0,
        step: 0.5,
        placeholder: 'Enter cooldown period in hours'
      },
      {
        name: 'blockDuration',
        label: 'Trading Block Duration (hours)',
        description: 'Prevents all trading for a set number of hours after the token launch or after a restriction is applied.',
        type: 'number',
        min: 0,
        step: 0.5,
        placeholder: 'Enter block duration in hours'
      }
    ]
  },
  {
    id: 'sell-fees',
    name: 'Adjustable Sell Fees',
    description: 'Define and adjust sell transaction fees with custom distribution to treasury.',
    warning: 'Setting high sell fees may discourage trading. Ensure fair fees to maintain token stability.',
    fields: [
      {
        name: 'sellFeePercentage',
        label: 'Base Sell Fee (%)',
        description: 'The default percentage fee applied to all sell transactions. This fee is taken from each sell order.',
        type: 'number',
        min: 0,
        max: 100,
        step: 0.1,
        placeholder: 'Enter fee percentage'
      },
      {
        name: 'treasuryAllocation',
        label: 'Treasury Allocation (%)',
        description: 'Percentage of collected fees that go to the treasury wallet. Remaining fees are added to liquidity.',
        type: 'number',
        min: 0,
        max: 100,
        step: 0.1,
        placeholder: 'Enter treasury allocation percentage'
      }
    ]
  },
  {
    id: 'bot-protection',
    name: 'Bot Protection System',
    description: 'Advanced system to detect and block trading bots with customizable restrictions.',
    warning: 'Blocking legitimate users may result in lower liquidity and token adoption.',
    fields: [
      {
        name: 'tradeCooldown',
        label: 'Anti-Sniping Delay (seconds)',
        description: 'Prevents bots from buying instantly at launch by delaying trading for the specified time.',
        type: 'number',
        min: 0,
        step: 1,
        placeholder: 'Enter cooldown in seconds'
      },
      {
        name: 'maxSellAmount',
        label: 'Max Sell Size (%)',
        description: 'Limits the maximum percentage of total supply that can be sold in a single transaction.',
        type: 'number',
        min: 0,
        max: 100,
        step: 0.1,
        placeholder: 'Enter maximum sell percentage'
      }
    ]
  },
  {
    id: 'liquidity-control',
    name: 'Emergency Liquidity Control',
    description: 'Control liquidity in critical situations with voting mechanisms.',
    warning: 'This feature can prevent rug pulls but may also create liquidity risks.',
    fields: [
      {
        name: 'freezeDuration',
        label: 'Freeze Duration (hours)',
        description: 'Pauses all liquidity transactions for the specified time in case of security risks.',
        type: 'number',
        min: 0,
        step: 1,
        placeholder: 'Enter freeze duration in hours'
      },
      {
        name: 'requireVoting',
        label: 'Require Holder Voting',
        description: 'When enabled, liquidity changes require token holders to vote for approval.',
        type: 'checkbox'
      },
      {
        name: 'votingThreshold',
        label: 'Voting Threshold (%)',
        description: 'Minimum percentage of token holders that must approve liquidity changes.',
        type: 'number',
        min: 0,
        max: 100,
        step: 0.1,
        placeholder: 'Enter voting threshold percentage'
      }
    ]
  },
  {
    id: 'liquidity-management',
    name: 'Liquidity Management Tool',
    description: 'Automate liquidity distribution and rebalancing with custom thresholds.',
    warning: 'Poor liquidity management can lead to extreme volatility.',
    fields: [
      {
        name: 'autoLiquidityPercentage',
        label: 'Auto-Add Liquidity (%)',
        description: 'Percentage of each transaction automatically added to liquidity to stabilize price.',
        type: 'number',
        min: 0,
        max: 100,
        step: 0.1,
        placeholder: 'Enter auto-liquidity percentage'
      },
      {
        name: 'rebalanceFrequency',
        label: 'Rebalance Frequency',
        description: 'How often the system should automatically rebalance liquidity pools.',
        type: 'select',
        options: [
          { label: 'Every transaction', value: 'transaction' },
          { label: 'Hourly', value: 'hourly' },
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' }
        ]
      },
      {
        name: 'minLiquidityThreshold',
        label: 'Minimum Liquidity (SOL)',
        description: 'Minimum amount of SOL that must be maintained in the liquidity pool.',
        type: 'number',
        min: 0,
        step: 0.1,
        placeholder: 'Enter minimum liquidity threshold'
      }
    ]
  },
  {
    id: 'vesting',
    name: 'Vesting Unlock Settings',
    description: 'Configure token vesting schedules with custom unlock periods.',
    warning: 'Tokens locked for too long may discourage investors.',
    fields: [
      {
        name: 'lockPercentage',
        label: 'Lock Percentage',
        description: 'Percentage of total token supply to be locked in the vesting contract.',
        type: 'number',
        min: 0,
        max: 100,
        step: 0.1,
        placeholder: 'Enter lock percentage'
      },
      {
        name: 'vestingDuration',
        label: 'Vesting Duration (months)',
        description: 'Total time period over which locked tokens will gradually unlock.',
        type: 'number',
        min: 1,
        step: 1,
        placeholder: 'Enter vesting duration in months'
      },
      {
        name: 'unlockFrequency',
        label: 'Unlock Frequency',
        description: 'How often locked tokens should be released to their owners.',
        type: 'select',
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Quarterly', value: 'quarterly' }
        ]
      }
    ]
  }
];