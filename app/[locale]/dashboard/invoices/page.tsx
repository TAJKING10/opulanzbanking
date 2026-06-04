"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  FileText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Eye,
  Mail,
  Printer,
  Trash2,
} from "lucide-react";
import { PageTour } from "@/components/page-tour";

export default function InvoicesPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [selectedInvoice, setSelectedInvoice] = React.useState<string | null>(null);

  const invoices = [
    {
      id: "INV-2023-045",
      client: "Nordic Tech AB",
      email: "billing@nordictech.se",
      amount: "€8,500.00",
      date: "Oct 21, 2023",
      dueDate: "Nov 21, 2023",
      status: "paid",
      initial: "N",
      color: "bg-purple-500",
    },
    {
      id: "INV-2023-044",
      client: "CloudTech Solutions",
      email: "accounts@cloudtech.de",
      amount: "€3,200.00",
      date: "Oct 18, 2023",
      dueDate: "Nov 18, 2023",
      status: "pending",
      initial: "C",
      color: "bg-blue-500",
    },
    {
      id: "INV-2023-043",
      client: "Digital Ventures Ltd",
      email: "finance@digitalventures.uk",
      amount: "€12,750.00",
      date: "Oct 15, 2023",
      dueDate: "Nov 15, 2023",
      status: "overdue",
      initial: "D",
      color: "bg-orange-500",
    },
    {
      id: "INV-2023-042",
      client: "Startup Innovations",
      email: "pay@startupinnovations.fi",
      amount: "€5,400.00",
      date: "Oct 10, 2023",
      dueDate: "Nov 10, 2023",
      status: "paid",
      initial: "S",
      color: "bg-green-500",
    },
    {
      id: "INV-2023-041",
      client: "Enterprise Corp",
      email: "invoices@enterprise.com",
      amount: "€25,000.00",
      date: "Oct 5, 2023",
      dueDate: "Nov 5, 2023",
      status: "draft",
      initial: "E",
      color: "bg-gray-500",
    },
  ];

  const stats = {
    total: "€54,850.00",
    paid: "€13,900.00",
    pending: "€15,950.00",
    overdue: "€12,750.00",
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Paid", color: "bg-green-100 text-green-800", icon: CheckCircle };
      case "pending":
        return { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock };
      case "overdue":
        return { label: "Overdue", color: "bg-red-100 text-red-800", icon: XCircle };
      case "draft":
        return { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800", icon: FileText };
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (filterStatus !== "all" && invoice.status !== filterStatus) return false;
    if (searchQuery && !invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !invoice.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      <PageTour
        pageKey="dashboard-invoices"
        locale={locale}
        steps={[
          { title: "Invoices", description: "Create, send, and track invoices for your clients — all in one place. Let me show you how." },
          { element: "[data-tour='invoice-stats']", title: "Invoice Summary", description: "At a glance: your total invoiced, how much has been paid, what's pending, and what's overdue.", side: "bottom" },
          { element: "[data-tour='invoice-filter']", title: "Filter Invoices", description: "Search by client name or invoice number, or filter by status (Paid, Pending, Overdue, Draft).", side: "bottom" },
          { element: "[data-tour='invoice-table']", title: "Invoice List", description: "Each row shows the invoice number, client, amount, and status. Use the action buttons to view, email, download, or manage each invoice.", side: "top" },
          { element: "button.bg-\\[\\#b59354\\]", title: "Create a New Invoice", description: "Click here to create a new invoice. Fill in your client details, line items, and due date — then send it directly from here.", side: "bottom" },
        ]}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">Create and manage your invoices</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#b59354] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#886844]">
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div data-tour="invoice-stats" className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Invoiced</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div data-tour="invoice-filter" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client or invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div data-tour="invoice-table" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-6 py-4 font-medium">Invoice</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredInvoices.map((invoice) => {
                const statusConfig = getStatusConfig(invoice.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#b59354]/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-[#b59354]" />
                        </div>
                        <span className="font-medium text-gray-900">{invoice.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${invoice.color} text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                          {invoice.initial}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{invoice.client}</p>
                          <p className="text-xs text-gray-500">{invoice.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{invoice.amount}</td>
                    <td className="px-6 py-4 text-gray-600">{invoice.date}</td>
                    <td className="px-6 py-4 text-gray-600">{invoice.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-[#b59354] text-white rounded text-sm">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Send Reminders</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Send payment reminders for overdue invoices
          </p>
          <button className="text-sm text-[#b59354] font-medium hover:underline">
            Send to 1 client →
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Invoice Templates</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Create and manage your invoice templates
          </p>
          <button className="text-sm text-[#b59354] font-medium hover:underline">
            Manage templates →
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Recurring Invoices</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Set up automatic recurring invoices
          </p>
          <button className="text-sm text-[#b59354] font-medium hover:underline">
            Configure →
          </button>
        </div>
      </div>
    </div>
  );
}
