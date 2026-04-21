"use client";

import * as React from "react";
import {
  Search,
  Download,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  X,
} from "lucide-react";
import jsPDF from "jspdf";

// Transaction type
interface Transaction {
  id: string;
  transactionId: string;
  name: string;
  description: string;
  date: string;
  rawDate: Date;
  amount: number;
  fee: number;
  currency: string;
  isCredit: boolean;
  type: "Credit" | "Debit" | "Fee";
  senderIBAN: string;
  senderBIC: string;
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderZip: string;
  senderCountry: string;
  recipientIBAN: string;
  recipientBIC: string;
  recipientName: string;
  recipientAddress: string;
  recipientCity: string;
  recipientZip: string;
  recipientCountry: string;
}

// Account holder info
const accountHolder = {
  name: "Opulanz Banking Client",
  address: "123 Business Street, 75001 Paris, France",
  iban: "FR7630006000011234567890189",
  bic: "OPULFR2X",
};

// PDF Statement Modal Component
function PDFStatementModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string) => void;
}) {
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectingStart, setSelectingStart] = React.useState(true);

  const quickSelects = [
    { label: "This month", value: "this-month" },
    { label: "Last month", value: "last-month" },
    { label: "Last 90 days", value: "last-90" },
    { label: "This year", value: "this-year" },
  ];

  const handleQuickSelect = (value: string) => {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (value) {
      case "this-month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "last-month":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "last-90":
        start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "this-year":
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    setStartDate(formatDateInput(start));
    setEndDate(formatDateInput(end));
  };

  const formatDateInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const formatted = formatDateInput(selectedDate);

    if (selectingStart) {
      setStartDate(formatted);
      setSelectingStart(false);
    } else {
      setEndDate(formatted);
      setSelectingStart(true);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isDateInRange = (day: number): boolean => {
    if (!startDate || !endDate) return false;
    const currentDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const start = new Date(startDate);
    const end = new Date(endDate);
    return currentDate >= start && currentDate <= end;
  };

  const isStartDate = (day: number): boolean => {
    if (!startDate) return false;
    const currentDate = formatDateInput(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    );
    return currentDate === startDate;
  };

  const isEndDate = (day: number): boolean => {
    if (!endDate) return false;
    const currentDate = formatDateInput(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    );
    return currentDate === endDate;
  };

  const handleConfirm = () => {
    if (startDate && endDate) {
      onConfirm(startDate, endDate);
      onClose();
      setStartDate("");
      setEndDate("");
      setSelectingStart(true);
    }
  };

  const handleClose = () => {
    onClose();
    setStartDate("");
    setEndDate("");
    setSelectingStart(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-gray-900">PDF statement</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Quick Select */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Select date range
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {quickSelects.map((item) => (
              <button
                key={item.value}
                onClick={() => handleQuickSelect(item.value)}
                className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-700 hover:border-[#3d3270] hover:text-[#3d3270] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Date Inputs */}
          <div className="flex items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onClick={() => setSelectingStart(true)}
              className={`flex-1 px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3270]/20 focus:border-[#3d3270] ${
                selectingStart ? "border-[#3d3270] text-[#3d3270]" : "border-gray-200"
              }`}
            />
            <span className="text-gray-400">→</span>
            <input
              type="text"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onClick={() => setSelectingStart(false)}
              className={`flex-1 px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3270]/20 focus:border-[#3d3270] ${
                !selectingStart ? "border-[#3d3270] text-[#3d3270]" : "border-gray-200"
              }`}
            />
          </div>

          {/* Calendar */}
          <div className="mb-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((day, index) => (
                <div key={index} className="aspect-square">
                  {day !== null && (
                    <button
                      onClick={() => handleDateClick(day)}
                      className={`w-full h-full flex items-center justify-center text-sm rounded-lg transition-colors ${
                        isStartDate(day) || isEndDate(day)
                          ? "bg-[#3d3270] text-white"
                          : isDateInRange(day)
                          ? "bg-[#3d3270]/10 text-[#3d3270]"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="text-[#3d3270] font-semibold hover:opacity-80"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!startDate || !endDate}
              className="px-8 py-3 bg-[#3d3270] text-white font-semibold rounded-lg hover:bg-[#3d3270]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ChevronDown icon component
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<"all" | "incoming" | "outgoing">("all");
  const [showExportDropdown, setShowExportDropdown] = React.useState(false);
  const [showPDFModal, setShowPDFModal] = React.useState(false);
  const [dateRange, setDateRange] = React.useState("");
  const [fromCurrency, setFromCurrency] = React.useState("");
  const [toCurrency, setToCurrency] = React.useState("");
  const exportRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const transactions: Transaction[] = [
    {
      id: "1",
      transactionId: "OPL6Z6KUA902JQI4",
      name: "Monthly fee March 2026",
      description: "Monthly fee March 2026",
      date: "5 Mar 2026",
      rawDate: new Date(2026, 2, 5),
      amount: -25.00,
      fee: 0,
      currency: "EUR",
      isCredit: false,
      type: "Fee",
      senderIBAN: "FR7630006000011234567890189",
      senderBIC: "OPULFR2X",
      senderName: "Opulanz Banking Client",
      senderAddress: "123 Business Street",
      senderCity: "Paris",
      senderZip: "75001",
      senderCountry: "France",
      recipientIBAN: "",
      recipientBIC: "",
      recipientName: "",
      recipientAddress: "",
      recipientCity: "",
      recipientZip: "",
      recipientCountry: "",
    },
    {
      id: "2",
      transactionId: "WPOOZLE6C92EVMRH",
      name: "LATVENERGO AS",
      description: "Rekina nr 210470348149",
      date: "5 Mar 2026",
      rawDate: new Date(2026, 2, 5),
      amount: -122.40,
      fee: 0.50,
      currency: "EUR",
      isCredit: false,
      type: "Debit",
      senderIBAN: "FR7630006000011234567890189",
      senderBIC: "OPULFR2X",
      senderName: "Opulanz Banking Client",
      senderAddress: "123 Business Street",
      senderCity: "Paris",
      senderZip: "75001",
      senderCountry: "France",
      recipientIBAN: "LV12HABA0551010911816",
      recipientBIC: "HABALV22XXX",
      recipientName: "LATVENERGO AS",
      recipientAddress: "",
      recipientCity: "",
      recipientZip: "",
      recipientCountry: "",
    },
    {
      id: "3",
      transactionId: "OPL7X8YZA123BCD5",
      name: "Stripe Payout",
      description: "Merchant Settlement Q1",
      date: "27 Feb 2026",
      rawDate: new Date(2026, 1, 27),
      amount: 12500.00,
      fee: 0,
      currency: "EUR",
      isCredit: true,
      type: "Credit",
      senderIBAN: "DE89370400440532013000",
      senderBIC: "COBADEFFXXX",
      senderName: "Stripe Payments Europe Ltd",
      senderAddress: "1 Grand Canal Street Lower",
      senderCity: "Dublin",
      senderZip: "D02 H210",
      senderCountry: "Ireland",
      recipientIBAN: "FR7630006000011234567890189",
      recipientBIC: "OPULFR2X",
      recipientName: "Opulanz Banking Client",
      recipientAddress: "123 Business Street",
      recipientCity: "Paris",
      recipientZip: "75001",
      recipientCountry: "France",
    },
    {
      id: "4",
      transactionId: "OPL9K2MNA456EFG7",
      name: "Google Cloud Platform",
      description: "Invoice #GCP-2026-0215",
      date: "15 Feb 2026",
      rawDate: new Date(2026, 1, 15),
      amount: -450.20,
      fee: 0.30,
      currency: "EUR",
      isCredit: false,
      type: "Debit",
      senderIBAN: "FR7630006000011234567890189",
      senderBIC: "OPULFR2X",
      senderName: "Opulanz Banking Client",
      senderAddress: "123 Business Street",
      senderCity: "Paris",
      senderZip: "75001",
      senderCountry: "France",
      recipientIBAN: "IE29AIBK93115212345678",
      recipientBIC: "AABORSKK",
      recipientName: "Google Ireland Limited",
      recipientAddress: "Gordon House, Barrow Street",
      recipientCity: "Dublin",
      recipientZip: "D04 E5W5",
      recipientCountry: "Ireland",
    },
    {
      id: "5",
      transactionId: "OPL3H5PQR789HIJ0",
      name: "Client Payment - Nordic Tech",
      description: "Invoice #INV-2026-045",
      date: "7 Feb 2026",
      rawDate: new Date(2026, 1, 7),
      amount: 8500.00,
      fee: 0,
      currency: "EUR",
      isCredit: true,
      type: "Credit",
      senderIBAN: "NO9386011117947",
      senderBIC: "DNBANOKKXXX",
      senderName: "Nordic Tech Solutions AS",
      senderAddress: "Karl Johans gate 25",
      senderCity: "Oslo",
      senderZip: "0159",
      senderCountry: "Norway",
      recipientIBAN: "FR7630006000011234567890189",
      recipientBIC: "OPULFR2X",
      recipientName: "Opulanz Banking Client",
      recipientAddress: "123 Business Street",
      recipientCity: "Paris",
      recipientZip: "75001",
      recipientCountry: "France",
    },
    {
      id: "6",
      transactionId: "OPL4J6STU012KLM1",
      name: "Office Rent",
      description: "Monthly rent January 2026",
      date: "27 Jan 2026",
      rawDate: new Date(2026, 0, 27),
      amount: -3200.00,
      fee: 0,
      currency: "EUR",
      isCredit: false,
      type: "Debit",
      senderIBAN: "FR7630006000011234567890189",
      senderBIC: "OPULFR2X",
      senderName: "Opulanz Banking Client",
      senderAddress: "123 Business Street",
      senderCity: "Paris",
      senderZip: "75001",
      senderCountry: "France",
      recipientIBAN: "FR7610107001010123456789012",
      recipientBIC: "ABORFRPPXXX",
      recipientName: "Paris Office Properties SAS",
      recipientAddress: "45 Avenue des Champs-Elysees",
      recipientCity: "Paris",
      recipientZip: "75008",
      recipientCountry: "France",
    },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "incoming" && !tx.isCredit) return false;
    if (filterType === "outgoing" && tx.isCredit) return false;
    if (searchQuery && !tx.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Filter transactions by date range
  const filterByDateRange = (txList: Transaction[], startDate: string, endDate: string): Transaction[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return txList.filter((tx) => {
      return tx.rawDate >= start && tx.rawDate <= end;
    });
  };

  // Format date for display (like Narvi: "1 Mar 2026 CET")
  const formatStatementDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year} CET`;
  };

  // Generate PDF matching Narvi design
  const generatePDF = (startDate: string, endDate: string) => {
    const filteredByDate = filterByDateRange(filteredTransactions, startDate, endDate);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Calculate balances
    const openingBalance = 3162.10; // Example opening balance
    const totalCredit = filteredByDate
      .filter(tx => tx.isCredit)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalDebit = filteredByDate
      .filter(tx => !tx.isCredit)
      .reduce((sum, tx) => sum + Math.abs(tx.amount) + tx.fee, 0);
    const closingBalance = openingBalance + totalCredit - totalDebit;

    // === HEADER SECTION ===
    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("Account statement", margin, yPos + 5);

    // Generated date
    yPos += 12;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const now = new Date();
    const generatedDate = `Generated: ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} CET`;
    doc.text(generatedDate, margin, yPos);

    // Logo area (right side) - Opulanz branding
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(181, 147, 84); // Gold color #b59354
    doc.text("OPULANZ", pageWidth - margin - 45, margin);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Opulanz Banking S.A.", pageWidth - margin - 45, margin + 8);
    doc.setFont("helvetica", "bold");
    doc.text("opulanz.com", pageWidth - margin - 45, margin + 14);

    // Horizontal line
    yPos += 10;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // === ACCOUNT HOLDER SECTION ===
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("ACCOUNT HOLDER", margin, yPos);

    yPos += 12;
    const leftColX = margin;
    const rightColX = 130;

    // Name
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("Name", leftColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(accountHolder.name, leftColX, yPos + 5);

    // From date (right side)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("From date", rightColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(formatStatementDate(startDate), rightColX, yPos + 5);

    // To date
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("To date", rightColX + 40, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(formatStatementDate(endDate), rightColX + 40, yPos + 5);

    // Address
    yPos += 15;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("Address", leftColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(accountHolder.address, leftColX, yPos + 5);

    // IBAN
    yPos += 15;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("IBAN", leftColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(accountHolder.iban, leftColX, yPos + 5);

    // BIC
    yPos += 15;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("BIC", leftColX, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(accountHolder.bic, leftColX, yPos + 5);

    // === BALANCE SUMMARY BOX ===
    yPos += 20;
    const boxHeight = 35;
    const boxWidth = pageWidth - 2 * margin;

    // Draw rounded rectangle
    doc.setFillColor(248, 248, 250);
    doc.setDrawColor(230, 230, 235);
    doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, "FD");

    // Balance columns
    const colWidth = boxWidth / 4;
    const balanceY = yPos + 12;
    const valueY = yPos + 24;

    const balanceItems = [
      { label: "Opening balance", value: `${openingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} EUR` },
      { label: "Credit", value: `${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })} EUR` },
      { label: "Debit", value: `${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })} EUR` },
      { label: "Closing balance", value: `${closingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} EUR` },
    ];

    balanceItems.forEach((item, index) => {
      const x = margin + 10 + index * colWidth;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(item.label, x, balanceY);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(item.value, x, valueY);
    });

    // === TRANSACTIONS SECTION ===
    yPos += boxHeight + 20;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("TRANSACTIONS", margin, yPos);

    // Table header
    yPos += 10;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 235);
    doc.setLineWidth(0.3);

    // Header row
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);

    const col1 = margin;
    const col2 = margin + 35;
    const col3 = margin + 95;
    const col4 = pageWidth - margin - 30;

    doc.text("Date", col1, yPos);
    doc.text("Debtor/creditor", col2, yPos);
    doc.text("Details", col3, yPos);
    doc.text("Amount", col4, yPos);

    yPos += 5;
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Transaction rows
    filteredByDate.forEach((tx) => {
      yPos += 8;

      // Check if we need a new page
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }

      const rowStartY = yPos;

      // Date
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(`${tx.date} CET`, col1, yPos);

      // Debtor/creditor
      if (tx.type === "Fee") {
        doc.setFont("helvetica", "normal");
        doc.text("Opulanz Banking S.A.", col2, yPos);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("c/o 123 Financial District,", col2, yPos + 4);
        doc.text("75001 Paris, France", col2, yPos + 8);
      } else if (tx.isCredit) {
        doc.setFont("helvetica", "normal");
        doc.text(tx.senderName, col2, yPos);
        if (tx.senderIBAN) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(tx.senderIBAN, col2, yPos + 4);
          doc.text(tx.senderBIC, col2, yPos + 8);
        }
      } else {
        doc.setFont("helvetica", "normal");
        doc.text(tx.recipientName || tx.name, col2, yPos);
        if (tx.recipientIBAN) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(tx.recipientIBAN, col2, yPos + 4);
          doc.text(tx.recipientBIC, col2, yPos + 8);
        }
      }

      // Details
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(`Title: ${tx.description}`, col3, yPos);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`ID: ${tx.transactionId}`, col3, yPos + 4);

      // Amount
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      const amountStr = `${tx.amount >= 0 ? "" : ""}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} EUR`;
      doc.text(amountStr, col4, yPos, { align: "right" });

      // Fee and debited amount (if applicable)
      if (tx.fee > 0) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Fee: ${tx.fee.toLocaleString("en-US", { minimumFractionDigits: 2 })} EUR`, col4, yPos + 4, { align: "right" });
        doc.text("Debited:", col4, yPos + 8, { align: "right" });
        const totalDebited = Math.abs(tx.amount) + tx.fee;
        doc.text(`${totalDebited.toLocaleString("en-US", { minimumFractionDigits: 2 })} EUR`, col4, yPos + 12, { align: "right" });
      }

      // Row separator
      const rowHeight = tx.fee > 0 ? 20 : 12;
      yPos += rowHeight;
      doc.setDrawColor(240, 240, 240);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    });

    // === FOOTER ===
    const footerY = pageHeight - 15;

    // Disclaimer
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(
      "Opulanz Banking S.A. is an Authorized Electronic Money Institution (EMI). Opulanz's EMI license is granted by the",
      margin,
      footerY - 5
    );
    doc.text(
      "French Financial Supervisory Authority (ACPR) with the registration number 12345678.",
      margin,
      footerY
    );

    // Page number
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`${i}/${pageCount}`, pageWidth - margin, footerY, { align: "right" });
    }

    // Download
    const startDateFormatted = startDate.replace(/-/g, "-");
    const endDateFormatted = endDate.replace(/-/g, "-");
    const fileName = `opulanz_statement_${startDateFormatted}_${endDateFormatted}.pdf`;
    doc.save(fileName);
  };

  // Generate CSV matching Narvi format
  const handleExportCSV = () => {
    const headers = [
      "Transaction Id",
      "Transaction date",
      "Transaction type",
      "Currency",
      "Transaction amount",
      "Fee Amount",
      "Net credited amount",
      "Net debited amount",
      "Transaction description",
      "Sender IBAN",
      "Sender BIC",
      "Sender name",
      "Sender address",
      "Sender city",
      "Sender zip code",
      "Sender country",
      "Recipient IBAN",
      "Recipient BIC",
      "Recipient name",
      "Recipient address",
      "Recipient city",
      "Recipient zip code",
      "Recipient country",
    ];

    const csvRows = filteredTransactions.map((tx) => {
      const netCredited = tx.isCredit ? tx.amount.toString() : "";
      const netDebited = !tx.isCredit ? (Math.abs(tx.amount) + tx.fee).toString() : "";

      return [
        `"${tx.transactionId}"`,
        `"${tx.date}"`,
        `"${tx.type}"`,
        `"${tx.currency}"`,
        `"${tx.amount}"`,
        `"${tx.fee}"`,
        `"${netCredited}"`,
        `"${netDebited}"`,
        `"${tx.description}"`,
        `"${tx.senderIBAN}"`,
        `"${tx.senderBIC}"`,
        `"${tx.senderName}"`,
        `"${tx.senderAddress}"`,
        `"${tx.senderCity}"`,
        `"${tx.senderZip}"`,
        `"${tx.senderCountry}"`,
        `"${tx.recipientIBAN}"`,
        `"${tx.recipientBIC}"`,
        `"${tx.recipientName}"`,
        `"${tx.recipientAddress}"`,
        `"${tx.recipientCity}"`,
        `"${tx.recipientZip}"`,
        `"${tx.recipientCountry}"`,
      ].join(",");
    });

    // Add BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const today = new Date();
    const dateStr = `${today.getFullYear()}_${String(today.getMonth() + 1).padStart(2, "0")}_${String(today.getDate()).padStart(2, "0")}`;
    a.download = `Opulanz_Statement_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setShowExportDropdown(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setDateRange("");
    setFromCurrency("");
    setToCurrency("");
  };

  const hasActiveFilters = searchQuery || filterType !== "all" || dateRange || fromCurrency || toCurrency;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-8">
        {/* Header with Export */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
            <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
          </div>
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="inline-flex items-center gap-2 text-[#3d3270] font-semibold hover:opacity-80"
            >
              <Download className="h-5 w-5" />
              Export
            </button>

            {/* Export Dropdown */}
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                <button
                  onClick={() => {
                    setShowExportDropdown(false);
                    setShowPDFModal(true);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 font-medium"
                >
                  PDF statement
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 font-medium"
                >
                  CSV list
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-0">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-5 border-b border-gray-100 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.isCredit ? "bg-green-100" : "bg-orange-100"
                  }`}
                >
                  {tx.isCredit ? (
                    <ArrowDownLeft className={`h-5 w-5 text-green-600`} />
                  ) : (
                    <ArrowUpRight className={`h-5 w-5 text-orange-600`} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{tx.name}</p>
                  <p className="text-sm text-gray-500">{tx.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    tx.isCredit ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {tx.currency}
                </p>
                <p className="text-sm text-gray-500">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>

      {/* Right Sidebar - Filters */}
      <div className="w-72 bg-white border-l border-gray-100 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3270]/20 focus:border-[#3d3270]"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        {/* Date Range */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Select date range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3270]/20 focus:border-[#3d3270]"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#3d3270]" />
        </div>

        {/* Transaction Type */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterType === "all"
                ? "bg-[#3d3270] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("incoming")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterType === "incoming"
                ? "bg-[#3d3270] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Incoming
          </button>
          <button
            onClick={() => setFilterType("outgoing")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterType === "outgoing"
                ? "bg-[#3d3270] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Outgoing
          </button>
        </div>

        {/* From Currency */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="From"
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-4 py-3 pr-16 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3270]/20 focus:border-[#3d3270]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-900">
            EUR
          </span>
        </div>

        {/* To Currency */}
        <div className="relative">
          <input
            type="text"
            placeholder="To"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-4 py-3 pr-16 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3270]/20 focus:border-[#3d3270]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-900">
            EUR
          </span>
        </div>
      </div>

      {/* PDF Statement Modal */}
      <PDFStatementModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        onConfirm={generatePDF}
      />
    </div>
  );
}
