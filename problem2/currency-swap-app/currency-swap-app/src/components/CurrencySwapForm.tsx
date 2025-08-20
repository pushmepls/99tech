import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

// Type definitions
interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  icon: string;
}

interface ValidationErrors {
  amount?: string;
  tokens?: string;
  same?: string;
}

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  excludeToken?: Token | null;
  tokens: Token[]
}

interface FormDropdownToken {
  from: boolean;
  to: boolean
}

const CurrencySwapForm: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFromDropdown, setShowFromDropdown] = useState<FormDropdownToken>({from: false, to: false});
  const [showToDropdown, setShowToDropdown] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapComplete, setSwapComplete] = useState<boolean>(false);

  // Mock token data with real-looking prices
  const mockTokens: Token[] = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 43250.00, icon: '₿' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2680.50, icon: 'Ξ' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 315.20, icon: '💎' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.52, icon: '🔷' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', price: 98.75, icon: '🟣' },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 7.35, icon: '⚫' },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 14.80, icon: '🔗' },
    { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', price: 6.25, icon: '🦄' }
  ];
  const symbolMap: Record<string, { id: string; name: string; icon: string }> = {
    BTC: { id: "bitcoin", name: "Bitcoin", icon: "₿" },
    ETH: { id: "ethereum", name: "Ethereum", icon: "Ξ" },
    BNB: { id: "binancecoin", name: "Binance Coin", icon: "💎" },
    ADA: { id: "cardano", name: "Cardano", icon: "🔷" },
    SOL: { id: "solana", name: "Solana", icon: "🟣" },
    DOT: { id: "polkadot", name: "Polkadot", icon: "⚫" },
    LINK: { id: "chainlink", name: "Chainlink", icon: "🔗" },
    UNI: { id: "uniswap", name: "Uniswap", icon: "🦄" },
    USDC: { id: "usd-coin", name: "USD Coin", icon: "💵" },
    BUSD: { id: "binance-usd", name: "Binance USD", icon: "💵" },
    WBTC: { id: "wrapped-bitcoin", name: "Wrapped Bitcoin", icon: "₿" },
    LUNA: { id: "terra", name: "Terra", icon: "🌙" },
    ZIL: { id: "zilliqa", name: "Zilliqa", icon: "⚡" },
    GMX: { id: "gmx", name: "GMX", icon: "📈" },
    OSMO: { id: "osmosis", name: "Osmosis", icon: "🧪" },
    OKB: { id: "okb", name: "OKB", icon: "⭕" },
    // add more known ones as needed...
  };
  // Initial load on mount
  useEffect(() => {
    const loadTokens = async (): Promise<void> => {
      try {
        setIsLoading(true);
        fetch('https://interview.switcheo.com/prices.json').then(res => res.json()).then(res => console.log(res.map(({ currency, price }) => {
          const symbol = currency.toUpperCase();
          const mapped = symbolMap[symbol];

          return {
            id: mapped?.id || symbol.toLowerCase(),
            symbol,
            name: mapped?.name || symbol,
            price,
            icon: mapped?.icon || "❓",
          };
        })
        ))

        // const prices = await fetchTokenPrices();
        // const uniqueTokens = deduplicateTokens(prices);
        // setTokens(uniqueTokens);
        // setError(null);
      } catch (err) {
        console.error('Error loading tokens:', err);
        // setError('Failed to load token prices');
      } finally {
        setIsLoading(false);
      }
    };
    loadTokens();
  }, []);

  useEffect(() => {



    // Simulate API call
    setIsLoading(true);
    const timer = setTimeout(() => {
      setTokens(mockTokens);
      setFromToken(mockTokens[0]); // Default to Bitcoin
      setToToken(mockTokens[1]); // Default to Ethereum
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fromToken && toToken && fromAmount) {
      const rate = toToken.price / fromToken.price;
      setExchangeRate(rate);
      setToAmount((parseFloat(fromAmount) * rate).toFixed(6));
    } else {
      setExchangeRate(null);
      setToAmount('');
    }
  }, [fromToken, toToken, fromAmount]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (): void => {
      setShowFromDropdown(false);
      setShowToDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSwapTokens = (): void => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!fromToken || !toToken) {
      newErrors.tokens = 'Please select both tokens';
    }

    if (fromToken && toToken && fromToken.id === toToken.id) {
      newErrors.same = 'Cannot swap the same token';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<() => void> => {
    if (!validateForm()) return () => { };

    setIsSwapping(true);
    setSwapComplete(false);

    // Simulate swap transaction
    const swapTimer = setTimeout(() => {
      setIsSwapping(false);
      setSwapComplete(true);
      const completeTimer = setTimeout(() => setSwapComplete(false), 3000);
      return () => clearTimeout(completeTimer);
    }, 2500);

    return () => clearTimeout(swapTimer);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    // Only allow valid number inputs
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };



  const formatCurrency = (amount: string, price: number): string => {
    const numAmount = parseFloat(amount || '0');
    return (numAmount * price).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (isLoading) {
    return (
      <div className="min-w-screen min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600 font-medium">Loading tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-screen min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Currency Swap
          </h1>
          <p className="text-gray-600">Exchange your tokens instantly</p>
        </div>

        {/* Swap Form */}
        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-5 hover:border-gray-300 focus-within:border-indigo-500 focus-within:shadow-lg focus-within:bg-white/50 transition-all duration-300 group">
            <label className="text-sm text-gray-500 font-medium mb-3 group-focus-within:text-indigo-600 transition-colors block">
              From
            </label>
            <div className="grid grid-cols-3 items-center gap-3">
              <input
                type="text"
                placeholder="0.0"
                value={fromAmount}
                onChange={handleAmountChange}
                className="col-span-2 flex-1 bg-transparent text-2xl font-semibold text-gray-800 outline-none placeholder-gray-400 focus:placeholder-gray-300"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
              />
              <TokenSelector
                tokens={tokens}
                selectedToken={fromToken}
                onSelect={setFromToken}
                isOpen={showFromDropdown}
                setIsOpen={setShowFromDropdown}
                excludeToken={toToken}
              />
            </div>
            {fromToken && fromAmount && (
              <div className="text-sm text-gray-500 mt-2 font-medium">
                ≈ ${formatCurrency(fromAmount, fromToken.price)}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleSwapTokens}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
              aria-label="Swap tokens"
              disabled={!fromToken || !toToken}
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all duration-300">
            <label className="text-sm text-gray-500 font-medium mb-3 block">To</label>
            <div className="grid grid-cols-3 items-center gap-3">
              <input
                type="text"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="col-span-2 flex-1 bg-transparent text-2xl font-semibold text-gray-800 outline-none placeholder-gray-400 cursor-default"
                tabIndex={-1}
              />
              <TokenSelector
                tokens={tokens}
                selectedToken={toToken}
                onSelect={setToToken}
                isOpen={showToDropdown}
                setIsOpen={setShowToDropdown}
                excludeToken={fromToken}
              />
            </div>
            {toToken && toAmount && (
              <div className="text-sm text-gray-500 mt-2 font-medium">
                ≈ ${formatCurrency(toAmount, toToken.price)}
              </div>
            )}
          </div>

          {/* Exchange Rate */}
          {exchangeRate && fromToken && toToken && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-sm font-semibold text-indigo-700">
                1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}
              </div>
              <div className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Rate updated in real-time
              </div>
            </div>
          )}

          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold">Please fix the following:</span>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0"></span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSwapping || swapComplete || !fromToken || !toToken || !fromAmount}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${swapComplete
              ? 'bg-green-500 text-white focus:ring-green-500'
              : isSwapping
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : (!fromToken || !toToken || !fromAmount)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] focus:ring-indigo-500'
              }`}
          >
            {swapComplete ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Swap Complete!
              </div>
            ) : isSwapping ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Swap...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Swap Tokens</span>
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            )}
          </button>

          {/* Additional Info */}
          <div className="text-center text-xs text-gray-500 mt-6 space-y-1">
            <p className="flex items-center justify-center gap-1">
              <span className="w-1 h-1 bg-green-400 rounded-full flex-shrink-0"></span>
              Swaps are processed instantly with minimal fees
            </p>
            <p className="flex items-center justify-center gap-1">
              <span className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0"></span>
              Your transaction is secured by blockchain technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySwapForm;


const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onSelect,
  isOpen,
  setIsOpen,
  excludeToken,
  tokens
}) => (
  <div className="relative">
    <button
      type="button"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
      className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {selectedToken ? (
        <>
          <img
            key={selectedToken.symbol}
            src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${selectedToken.symbol}.svg`}
          />
          <span className="font-semibold text-gray-800">{selectedToken.symbol}</span>
        </>
      ) : (
        <span className="text-gray-500">Select</span>
      )}
      <ChevronDown
        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
          }`}
      />
    </button>

    {isOpen && (
      <div
        className=" absolute left-[calc(100%+30px)] top-1/2 -translate-y-1/2 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200"
        role="listbox"
      >
        {tokens
          .filter(token => !excludeToken || token.id !== excludeToken.id)
          .map(token => (
            <button
              key={token.id}
              type="button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelect(token);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0 focus:outline-none focus:bg-gray-50"
              role="option"
              aria-selected={selectedToken?.id === token.id}
            >
              <img
                key={token.symbol}
                src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.symbol}.svg`}
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{token.symbol}</div>
                <div className="text-sm text-gray-500">{token.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">
                  ${token.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
            </button>
          ))}
      </div>
    )}
  </div>
);