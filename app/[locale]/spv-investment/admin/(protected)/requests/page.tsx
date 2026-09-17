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
    <div className="min-h-screen bg-brand-off">
      {/* Header */}
      <div className="bg-white border-b border-brand-grayLight/40">
        <div className="container mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/${locale}/spv-investment/admin/dashboard`}
                className="text-brand-grayMed hover:text-brand-gold transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-brand-dark">Investment Requests</h1>
                <p className="text-sm text-brand-grayMed">
                  Review and process pending investment requests
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">
                <Clock className="h-4 w-4" />
                {requests.length} Pending
              </span>
              <Button onClick={fetchRequests} variant="outline" size="sm" className="border-brand-grayLight/50 text-brand-dark hover:bg-brand-off">
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
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <p className="text-emerald-800 text-sm font-medium">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-gold" />
            <p className="mt-4 text-brand-grayMed">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="border border-brand-grayLight/30 bg-white shadow-sm">
            <CardContent className="py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-brand-dark">All Caught Up!</h3>
              <p className="mt-2 text-sm text-brand-grayMed">No pending investment requests to review.</p>
              <Button asChild className="mt-6 border-brand-grayLight/50 text-brand-dark hover:bg-brand-off" variant="outline">
                <Link href={`/${locale}/spv-investment/admin/dashboard`}>
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request.id} className="border border-brand-grayLight/40 bg-white shadow-sm rounded-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Property Image */}
                  <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0">
                    <Image
                      src={request.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"}
                      alt={request.property_title || "Property"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                            <Clock className="h-3 w-3" />
                            Pending Approval
                          </span>
                          <span className="text-xs text-brand-grayMed">
                            Request #{request.id}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-brand-dark">
                          {request.property_title || "Investment Property"}
                        </h3>
                        <p className="text-sm text-brand-grayMed">{request.property_location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-brand-gold">
                          €{parseFloat(request.amount_invested?.toString() || "0").toLocaleString()}
                        </p>
                        <p className="text-xs text-brand-grayMed">
                          {request.ownership_percentage}% ownership
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-brand-grayMed" />
                        <div>
                          <p className="text-xs text-brand-grayMed">Investor</p>
                          <p className="text-sm font-medium text-brand-dark">{request.investor_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-brand-grayMed" />
                        <div>
                          <p className="text-xs text-brand-grayMed">Email</p>
                          <p className="text-sm font-medium text-brand-dark truncate">{request.investor_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-brand-grayMed" />
                        <div>
                          <p className="text-xs text-brand-grayMed">Type</p>
                          <p className="text-sm font-medium text-brand-dark capitalize">{request.investor_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-brand-grayMed" />
                        <div>
                          <p className="text-xs text-brand-grayMed">Requested</p>
                          <p className="text-sm font-medium text-brand-dark">
                            {new Date(request.created_at || "").toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-brand-grayLight/30">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
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
                        className="ml-auto text-sm text-brand-gold hover:text-brand-goldDark font-semibold transition-colors"
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
            <Card className="w-full max-w-md mx-4 border border-brand-grayLight/40 bg-white shadow-2xl rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Reject Investment Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-brand-grayMed">
                  Please provide a reason for rejecting this investment request. The investor will be notified via email.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-brand-dark font-medium">Rejection Reason (optional)</Label>
                  <Input
                    id="reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., Investment limit reached, documentation incomplete..."
                    className="border-brand-grayLight/60 focus:border-brand-gold"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowRejectModal(null);
                      setRejectReason("");
                    }}
                    variant="outline"
                    className="flex-1 border-brand-grayLight/50 text-brand-dark hover:bg-brand-off"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleReject(showRejectModal)}
                    disabled={processingId === showRejectModal}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
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
