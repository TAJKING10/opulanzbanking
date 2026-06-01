"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Send,
  Shield,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Video,
  Users,
} from "lucide-react";
import { PageTour } from "@/components/page-tour";

export default function SupportPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const categories = [
    { id: "account", name: "Account & Profile", icon: Users, count: 12 },
    { id: "payments", name: "Payments & Transfers", icon: Send, count: 18 },
    { id: "cards", name: "Cards", icon: CreditCard, count: 8 },
    { id: "security", name: "Security", icon: Shield, count: 10 },
    { id: "billing", name: "Billing & Fees", icon: FileText, count: 6 },
  ];

  const popularArticles = [
    { title: "How to make an international transfer", category: "Payments", views: "2.5k" },
    { title: "Setting up two-factor authentication", category: "Security", views: "1.8k" },
    { title: "Understanding exchange rates and fees", category: "Billing", views: "1.5k" },
    { title: "How to freeze my card instantly", category: "Cards", views: "1.2k" },
    { title: "Adding a new beneficiary for transfers", category: "Payments", views: "980" },
  ];

  const recentTickets = [
    { id: "TKT-2023-089", subject: "Transfer delay inquiry", status: "open", date: "Oct 22, 2023" },
    { id: "TKT-2023-085", subject: "Card replacement request", status: "resolved", date: "Oct 18, 2023" },
    { id: "TKT-2023-081", subject: "Account verification issue", status: "resolved", date: "Oct 15, 2023" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return { label: "Open", color: "bg-yellow-100 text-yellow-800", icon: Clock };
      case "resolved":
        return { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800", icon: AlertCircle };
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <PageTour
        pageKey="dashboard-support"
        steps={[
          { title: "Help & Support", description: "Find answers fast or get in touch with our support team. Let me show you what's available here." },
          { element: "[data-tour='support-search']", title: "Search for Help", description: "Type any question or topic here to search our knowledge base — articles, FAQs, and tutorials.", side: "bottom" },
          { element: "[data-tour='support-categories']", title: "Browse by Category", description: "Click a category to see all help articles for that topic — Payments, Cards, Security, and more.", side: "bottom" },
          { element: "[data-tour='support-contact']", title: "Contact Us", description: "Use Live Chat for instant support, or call/email us. Live chat is available Mon–Fri, 8am–8pm EET.", side: "left" },
          { element: "[data-tour='support-tickets']", title: "My Support Tickets", description: "View and track all your open and resolved support tickets. Click 'Create New Ticket' to start a new request.", side: "left" },
        ]}
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-500 mt-1">Find answers or get in touch with our team</p>
      </div>

      {/* Search */}
      <div data-tour="support-search" className="bg-gradient-to-r from-[#b59354] to-[#886844] rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">How can we help you?</h2>
        <p className="text-white/70 mb-6">Search our knowledge base or browse categories below</p>
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help articles, FAQs, tutorials..."
            className="w-full pl-12 pr-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories */}
          <div data-tour="support-categories" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Browse by Category</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      selectedCategory === category.id
                        ? "border-[#b59354] bg-[#b59354]/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedCategory === category.id
                          ? "bg-[#b59354] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{category.count} articles</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Articles */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Popular Articles</h3>
            <div className="space-y-3">
              {popularArticles.map((article, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{article.title}</p>
                      <p className="text-xs text-gray-500">{article.category} • {article.views} views</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-[#b59354] font-medium hover:underline">
              View all articles →
            </button>
          </div>

          {/* Video Tutorials */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Video Tutorials</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Getting Started with Opulanz", duration: "5:32" },
                { title: "Making Your First Transfer", duration: "3:45" },
                { title: "Managing Your Cards", duration: "4:18" },
                { title: "Security Best Practices", duration: "6:12" },
              ].map((video, index) => (
                <button
                  key={index}
                  className="relative group overflow-hidden rounded-xl"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="h-6 w-6 text-[#b59354] ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white font-medium text-sm">{video.title}</p>
                    <p className="text-white/70 text-xs">{video.duration}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Options */}
          <div data-tour="support-contact" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#b59354] hover:bg-[#b59354]/5 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Live Chat</p>
                  <p className="text-xs text-green-600">Online now • ~2 min wait</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#b59354] hover:bg-[#b59354]/5 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Phone Support</p>
                  <p className="text-xs text-gray-500">+358 9 123 4567</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#b59354] hover:bg-[#b59354]/5 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Email Support</p>
                  <p className="text-xs text-gray-500">support@opulanz.com</p>
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                <strong>Support Hours:</strong><br />
                Mon-Fri: 8:00 - 20:00 (EET)<br />
                Sat-Sun: 10:00 - 18:00 (EET)
              </p>
            </div>
          </div>

          {/* My Tickets */}
          <div data-tour="support-tickets" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">My Tickets</h3>
              <button className="text-sm text-[#b59354] font-medium hover:underline">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {recentTickets.map((ticket) => {
                const statusConfig = getStatusConfig(ticket.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div
                    key={ticket.id}
                    className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">{ticket.date}</p>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-4 py-2.5 border border-[#b59354] text-[#b59354] rounded-lg font-medium text-sm hover:bg-[#b59354]/5 transition-colors">
              Create New Ticket
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              {[
                { name: "Terms of Service", href: "#" },
                { name: "Privacy Policy", href: "#" },
                { name: "Fee Schedule", href: "#" },
                { name: "API Documentation", href: "#" },
                { name: "System Status", href: "#" },
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center justify-between py-2 text-sm text-gray-600 hover:text-[#b59354] transition-colors"
                >
                  {link.name}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
