"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  Clock, CheckCircle, XCircle, Building2, User, DollarSign,
  Calendar, AlertCircle, Mail, ArrowLeft, Loader2, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  getPendingInvestments,
  approveInvestment,
  rejectInvestment,
  getCurrentAdmin,
  type Investment,
} from "@/lib/investment-api";

interface PendingInvestment extends Investment {
  investor_name?: string;
  investor_email?: string;
  investor_type?: string;
  property_title?: string;
  property_location?: string;
  images?: string[];
}

export default function InvestmentRequestsPage() {
  const locale = useLocale();
  const [requests, setRequests] = React.useState<PendingInvestment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [processingId, setProcessingId] = React.useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = React.useState<number | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const result = await getPendingInvestments();
      setRequests(result.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (investmentId: number) => {
    setProcessingId(investmentId);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const admin = getCurrentAdmin();
      const result = await approveInvestment(investmentId, admin?.id);

      if (result.success) {
        setSuccessMessage(result.message || "Investment approved successfully!");
        // Remove from list
        setRequests(prev => prev.filter(r => r.id !== investmentId));
      } else {
        setErrorMessage(result.error || "Failed to approve investment");
      }
    } catch (error) {
      setErrorMessage("An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (investmentId: number) => {
    setProcessingId(investmentId);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const admin = getCurrentAdmin();
      const result = await rejectInvestment(investmentId, admin?.id, rejectReason);

      if (result.success) {
        setSuccessMessage(result.message || "Investment rejected");
        // Remove from list
        setRequests(prev => prev.filter(r => r.id !== investmentId));
        setShowRejectModal(null);
        setRejectReason("");
      } else {
        setErrorMessage(result.error || "Failed to reject investment");
      }
    } catch (error) {
      setErrorMessage("An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/spv-investment/admin/dashboard`}
                className="text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Investment Requests</h1>
                <p className="text-sm text-slate-500">
                  Review and process pending investment requests
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                <Clock className="h-4 w-4" />
                {requests.length} Pending
              </span>
              <Button onClick={fetchRequests} variant="outline" size="sm">
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-4 text-slate-500">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="py-20 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">All Caught Up!</h3>
              <p className="mt-2 text-slate-500">No pending investment requests to review.</p>
              <Button asChild className="mt-6" variant="outline">
                <Link href={`/${locale}/spv-investment/admin/dashboard`}>
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request.id} className="border-none shadow-sm overflow-hidden">
                <div className="flex">
                  {/* Property Image */}
                  <div className="relative w-48 shrink-0">
                    <Image
                      src={request.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"}
                      alt={request.property_title || "Property"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            <Clock className="h-3 w-3" />
                            Pending Approval
                          </span>
                          <span className="text-xs text-slate-400">
                            Request #{request.id}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {request.property_title || "Investment Property"}
                        </h3>
                        <p className="text-sm text-slate-500">{request.property_location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">
                          €{parseFloat(request.amount_invested?.toString() || "0").toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-500">
                          {request.ownership_percentage}% ownership
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Investor</p>
                          <p className="text-sm font-medium text-slate-900">{request.investor_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="text-sm font-medium text-slate-900 truncate">{request.investor_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Type</p>
                          <p className="text-sm font-medium text-slate-900 capitalize">{request.investor_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Requested</p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(request.created_at || "").toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-100">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === request.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Approve Investment
                      </Button>
                      <Button
                        onClick={() => setShowRejectModal(request.id)}
                        disabled={processingId === request.id}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Link
                        href={`/${locale}/spv-investment/admin/customers/${request.investor_id}`}
                        className="ml-auto text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View Investor Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Reject Investment Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Please provide a reason for rejecting this investment request. The investor will be notified via email.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="reason">Rejection Reason (optional)</Label>
                  <Input
                    id="reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., Investment limit reached, documentation incomplete..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowRejectModal(null);
                      setRejectReason("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleReject(showRejectModal)}
                    disabled={processingId === showRejectModal}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {processingId === showRejectModal ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirm Rejection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
