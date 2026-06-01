"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  ArrowDownUp,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronDown,
  ArrowRight,
  Clock,
} from "lucide-react";
import { PageTour } from "@/components/page-tour";

export default function ExchangePage() {
  const params = useParams();
  const locale = params.locale as string;

  const [fromCurrency, setFromCurrency] = React.useState("EUR");
  const [toCurrency, setToCurrency] = React.useState("USD");
  const [fromAmount, setFromAmount] = React.useState("");
  const [toAmount, setToAmount] = React.useState("");

  const currencies = [
    { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
    { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
    { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴" },
    { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱" },
  ];

  const exchangeRates: Record<string, Record<string, number>> = {
    EUR: { USD: 1.0876, GBP: 0.8612, CHF: 0.9432, SEK: 11.42, NOK: 11.78, DKK: 7.46, PLN: 4.38 },
    USD: { EUR: 0.9195, GBP: 0.7918, CHF: 0.8673, SEK: 10.50, NOK: 10.83, DKK: 6.86, PLN: 4.03 },
    GBP: { EUR: 1.1612, USD: 1.2630, CHF: 1.0953, SEK: 13.26, NOK: 13.68, DKK: 8.66, PLN: 5.09 },
  };

  const getRate = () => {
    if (fromCurrency === toCurrency) return 1;
    return exchangeRates[fromCurrency]?.[toCurrency] || 1;
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    const numValue = parseFloat(value) || 0;
    setToAmount((numValue * getRate()).toFixed(2));
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const recentExchanges = [
    { from: "EUR", to: "USD", fromAmount: "€5,000.00", toAmount: "$5,438.00", date: "Oct 22, 2023", rate: "1.0876" },
    { from: "GBP", to: "EUR", fromAmount: "£2,000.00", toAmount: "€2,322.40", date: "Oct 18, 2023", rate: "1.1612" },
    { from: "EUR", to: "CHF", fromAmount: "€10,000.00", toAmount: "Fr9,432.00", date: "Oct 15, 2023", rate: "0.9432" },
  ];

  const popularPairs = [
    { from: "EUR", to: "USD", rate: "1.0876", change: "+0.32%", isUp: true },
    { from: "EUR", to: "GBP", rate: "0.8612", change: "-0.15%", isUp: false },
    { from: "EUR", to: "CHF", rate: "0.9432", change: "+0.08%", isUp: true },
    { from: "USD", to: "GBP", rate: "0.7918", change: "-0.21%", isUp: false },
  ];

  return (
    <div className="p-6 lg:p-8">
      <PageTour
        pageKey="dashboard-exchange"
        steps={[
          { title: "Currency Exchange", description: "Convert money between currencies at live market rates. Let me show you how to use this page." },
          { element: "[data-tour='from-currency']", title: "From Currency", description: "Select the currency you want to convert FROM — for example, Euros (EUR).", side: "bottom" },
          { element: "[data-tour='to-currency']", title: "To Currency", description: "Select the currency you want to convert TO — for example, US Dollars (USD).", side: "bottom" },
          { element: "[data-tour='exchange-amount']", title: "Enter the Amount", description: "Type the amount here. The converted amount updates automatically in real time as you type.", side: "bottom" },
          { element: "[data-tour='exchange-rate']", title: "Live Exchange Rate", description: "This shows the current market rate. Rates refresh automatically — always review before confirming.", side: "top" },
          { element: "[data-tour='exchange-btn']", title: "Confirm Exchange", description: "Click this button to execute the currency conversion. Funds are moved between your accounts instantly.", side: "top" },
        ]}
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Currency Exchange</h1>
        <p className="text-gray-500 mt-1">Convert between currencies at competitive rates</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Exchange Form - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exchange Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            {/* From Currency */}
            <div data-tour="from-currency" className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">You Send</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    data-tour="exchange-amount"
                    type="text"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-4 border border-gray-200 rounded-lg text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#b59354]/20"
                  />
                </div>
                <div className="relative">
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="h-full px-4 py-4 border border-gray-200 rounded-lg text-sm font-medium appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-[#b59354]/20 bg-white"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Available: €85,230.50
              </p>
            </div>

            {/* Swap Button & Rate */}
            <div data-tour="exchange-rate" className="flex items-center justify-between py-4">
              <button
                onClick={handleSwapCurrencies}
                className="w-12 h-12 bg-[#b59354] text-white rounded-full flex items-center justify-center hover:bg-[#886844] transition-colors"
              >
                <ArrowDownUp className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">1 {fromCurrency} = </span>
                <span className="font-semibold text-gray-900">{getRate().toFixed(4)} {toCurrency}</span>
              </div>
            </div>

            {/* To Currency */}
            <div data-tour="to-currency" className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">You Receive</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={toAmount}
                    readOnly
                    placeholder="0.00"
                    className="w-full px-4 py-4 border border-gray-200 rounded-lg text-2xl font-bold bg-gray-50 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="h-full px-4 py-4 border border-gray-200 rounded-lg text-sm font-medium appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-[#b59354]/20 bg-white"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Exchange Rate</span>
                <span className="font-medium text-gray-900">1 {fromCurrency} = {getRate().toFixed(4)} {toCurrency}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Total to receive</span>
                <span className="font-bold text-lg text-gray-900">{toAmount || "0.00"} {toCurrency}</span>
              </div>
            </div>

            <button
              data-tour="exchange-btn"
              disabled={!fromAmount || parseFloat(fromAmount) <= 0}
              className="w-full bg-[#b59354] text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#886844] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exchange Now
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Rate Info */}
          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Mid-market rates</p>
              <p>We use the real mid-market exchange rate with no hidden markups. Rate guaranteed for 30 seconds.</p>
            </div>
          </div>

          {/* Recent Exchanges */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Recent Exchanges</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {recentExchanges.map((exchange, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#b59354]/10 rounded-full flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 text-[#b59354]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {exchange.fromAmount} → {exchange.toAmount}
                      </p>
                      <p className="text-xs text-gray-500">Rate: {exchange.rate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{exchange.date}</p>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Pairs */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Popular Pairs</h3>
            <div className="space-y-3">
              {popularPairs.map((pair, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{pair.from}/{pair.to}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{pair.rate}</p>
                    <p className={`text-xs flex items-center gap-1 ${pair.isUp ? "text-green-600" : "text-red-600"}`}>
                      {pair.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {pair.change}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rate Alerts */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Rate Alerts</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get notified when rates reach your target
            </p>
            <button className="w-full py-2 px-4 border border-[#b59354] text-[#b59354] rounded-lg font-medium text-sm hover:bg-[#b59354]/5 transition-colors">
              Set Alert
            </button>
          </div>

          {/* Exchange Hours */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Trading Hours</h3>
            </div>
            <p className="text-sm text-gray-600">
              Currency exchange is available 24/7. Rates are updated in real-time during market hours.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">Markets Open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
