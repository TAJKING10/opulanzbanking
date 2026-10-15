"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { PayPalButtons } from "@/components/paypal-buttons";
import {
  CheckCircle, Clock, Video, Shield,
  ArrowLeft, ArrowRight, Calendar, User, Mail, Phone, CreditCard,
  Download, FileText, Sparkles, ExternalLink, AlertCircle, Upload, Building, Home, Check, Trash2
} from "lucide-react";
import { PageGuidance } from "@/components/page-guidance";

const SERVICE_MAP: Record<string, { title: string; titleFr: string; price: number }> = {
  "tax-return-preparation": { title: "Tax Return Preparation", titleFr: "Préparation de déclaration fiscale", price: 299 },
  "international-tax":      { title: "International Tax Advisory", titleFr: "Conseil fiscal international", price: 250 },
  "corporate-tax":          { title: "Corporate Tax Advisory", titleFr: "Conseil fiscal d'entreprise", price: 150 },
  "tax-compliance":         { title: "Tax Compliance", titleFr: "Conformité fiscale", price: 250 },
  "personal-tax-advisory":  { title: "Personal Tax Advisory", titleFr: "Conseil fiscal personnel", price: 100 },
};
const DEFAULT_SERVICE = { title: "Tax Advisory Consultation", titleFr: "Consultation fiscale", price: 150 };

type Step = "contact" | "documents" | "payment" | "calendar" | "confirmation";

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressType: "residential" | "company";
  address: string;
  hasDifferentContactAddress?: boolean;
  differentStreetNumber?: string;
  differentPostalCodeCity?: string;
  differentCountry?: string;
  differentAddress?: string;
  idDocumentName?: string;
  idDocumentUrl?: string;
  // Tax Return Specific Fields (Luxembourg individual tax return)
  returnType?: "tax_return" | "tax_balance";
  dateOfBirth?: string;
  ssn?: string;
  profession?: string;
  placeOfBirth?: string;
  dossierNumber?: string;
  streetNumber?: string;
  postalCodeCity?: string;
  country?: string;
  hasPartner?: "no" | "yes";
  partnerLastName?: string;
  partnerFirstName?: string;
  partnerDateOfBirth?: string;
  partnerSsn?: string;
  partnerProfession?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  partnerPlaceOfBirth?: string;
  partnerDossierNumber?: string;
  relocatedSince2023?: "no" | "yes";
  previousDateOfRelocation?: string;
  previousStreetNumber?: string;
  previousPostalCodeCity?: string;
  previousCountry?: string;
  previousAddress?: string;
  bankAccountOwner?: string;
  iban?: string;
  swiftBic?: string;
  civilStatus?: "single" | "married" | "partnership" | "divorced";
  civilStatusDate?: string;
  childrenCount?: "0" | "1" | "2" | "3" | "4";
  childrenDetails?: { name: string; birth: string; ssn: string }[];
  alimonyType?: "none" | "child_in_household" | "child_outside_household";
  alimonyChildName?: string;
  alimonyChildDob?: string;
  alimonyChildAddress?: string;
  alimonyAmount?: string;
  hasAlimony?: "no" | "yes";
  alimonyDetails?: string;
  firstOccupancyDate?: string;
  constructionCompletionDate?: string;
  priorYearDossierNumber?: string;
  taxDocuments?: Record<string, { name: string; url: string }> | { name: string; url: string }[];
  // Rented Properties
  hasRentedProperties?: "no" | "yes";
  rentedProperties?: {
    address: string;
    cadastralReference: string;
    completedOn: string;
    purchasedOn: string;
    soldOn: string;
    hasUsufruct: "no" | "yes";
    firstRentalDate: string;
    owners: { name: string; nationalId: string; undividedShare: string; usufructPercent: string; bareOwnershipPercent: string; fullOwnershipPercent: string }[];
    monthsRented2025: string;
    rentsReceived2025: string;
  }[];
}
interface CalendlyData {
  eventUri?: string;
  inviteeUri?: string;
  startTime?: string;
  endTime?: string;
  meetingLink?: string;
  isPhoneCall?: boolean;
  phoneNumber?: string;
  googleMeetUrl?: string;
}
interface PaypalData { orderId?: string; status?: string; payer?: any; amount?: number; }

function fmtDate(iso?: string, loc?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(loc === "fr" ? "fr-FR" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function fmtTime(iso?: string, loc?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(loc === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function BookingClient() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("taxAdvisory.booking");
  const tConf = useTranslations("taxAdvisory.confirmation");

  const serviceId = searchParams.get("service") || "";
  const svc = SERVICE_MAP[serviceId] || DEFAULT_SERVICE;
  const serviceTitle = locale === "fr" ? svc.titleFr : svc.title;
  const calendlyUrl = locale === "fr"
    ? "https://calendly.com/opulanz-banking/conseil-fiscal"
    : "https://calendly.com/opulanz-banking/tax-advisory";

  // Sequence: contact -> documents (if tax-return-preparation) -> payment -> calendar -> confirmation
  const [step, setStep] = useState<Step>("contact");
  const [contact, setContact] = useState<ContactData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressType: "residential",
    address: "",
    streetNumber: "",
    postalCodeCity: "",
    country: "Luxembourg",
    idDocumentName: "",
    idDocumentUrl: "",
    returnType: "tax_return",
    hasPartner: "no",
    relocatedSince2023: "no",
    civilStatus: "single",
    childrenCount: "0",
    childrenDetails: [],
    alimonyType: "none",
    hasAlimony: "no",
    taxDocuments: {},
    hasRentedProperties: "no",
    rentedProperties: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingDocKey, setUploadingDocKey] = useState<string | null>(null);
  const [calendly, setCalendly] = useState<CalendlyData>({});
  const [paypal, setPaypal] = useState<PaypalData>({});
  const [bookingId, setBookingId] = useState<number | string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState<string>("");
  const [paymentDone, setPaymentDone] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const [lastSelectedSlot, setLastSelectedSlot] = useState<string | null>(null);

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const dateStr = fmtDate(calendly.startTime || lastSelectedSlot || undefined, locale);
  const timeStr = fmtTime(calendly.startTime || lastSelectedSlot || undefined, locale);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  async function fetchWithTimeout(url: string, options: RequestInit, ms = 7000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  }

  // Handle ID document file upload
  async function handleIdFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(true);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.idDocument;
      return copy;
    });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "id_document");
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.data) {
        setContact((prev) => ({
          ...prev,
          idDocumentName: data.data.fileName || file.name,
          idDocumentUrl: data.data.fileUrl || data.data.url,
        }));
      } else {
        setContact((prev) => ({
          ...prev,
          idDocumentName: file.name,
          idDocumentUrl: URL.createObjectURL(file),
        }));
      }
    } catch {
      setContact((prev) => ({
        ...prev,
        idDocumentName: file.name,
        idDocumentUrl: URL.createObjectURL(file),
      }));
    } finally {
      setUploadingId(false);
    }
  }

  function getTaxDoc(key: string, idx: number) {
    if (!contact.taxDocuments) return undefined;
    if (Array.isArray(contact.taxDocuments)) {
      return (contact.taxDocuments as any)[idx] || (contact.taxDocuments as any)[key];
    }
    return (contact.taxDocuments as Record<string, { name: string; url: string }>)[key];
  }

  async function handleSingleTaxDocUpload(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDocKey(key);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "tax_document");
      const res = await fetch(`${API}/api/upload`, { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      let uploadedDoc = { name: file.name, url: URL.createObjectURL(file) };
      if (res.ok && data.success && data.data) {
        uploadedDoc = { name: data.data.fileName || file.name, url: data.data.fileUrl || data.data.url };
      }
      setContact((prev) => {
        const docs = { ...(prev.taxDocuments as any || {}) };
        docs[key] = uploadedDoc;
        return { ...prev, taxDocuments: docs };
      });
    } catch {
      const uploadedDoc = { name: file.name, url: URL.createObjectURL(file) };
      setContact((prev) => {
        const docs = { ...(prev.taxDocuments as any || {}) };
        docs[key] = uploadedDoc;
        return { ...prev, taxDocuments: docs };
      });
    } finally {
      setUploadingDocKey(null);
    }
  }

  // ── Step 1: Validate contact & Proceed to next step ─────────────────────────
  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!contact.firstName.trim()) errs.firstName = t("step1.firstNameRequired");
    if (!contact.lastName.trim())  errs.lastName  = t("step1.lastNameRequired");
    if (!contact.email.trim())     errs.email     = t("step1.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errs.email = t("step1.emailInvalid");
    if (!contact.phone.trim())     errs.phone     = t("step1.phoneRequired");
    
    // Auto-compose address from structured fields if present
    const combinedAddr = contact.address.trim() || [contact.streetNumber, contact.postalCodeCity, contact.country].filter(Boolean).join(", ").trim();
    if (!combinedAddr) {
      errs.address = t("step1.addressRequired");
    } else if (!contact.address.trim()) {
      setContact(prev => ({ ...prev, address: combinedAddr }));
    }

    if (!contact.idDocumentName)   errs.idDocument = t("step1.idDocumentRequired");

    if (contact.hasRentedProperties === "yes") {
      if (!contact.rentedProperties || contact.rentedProperties.length === 0) {
        errs.rentedProperties = t("step1.rentedPropertiesRequired");
      } else {
        contact.rentedProperties.forEach((rp, idx) => {
          if (!rp.address?.trim() || !rp.cadastralReference?.trim() || !rp.firstRentalDate?.trim() || !rp.rentsReceived2025?.trim()) {
            errs[`rentedProperty_${idx}`] = t("step1.rentedPropertyFieldsRequired");
          }
        });
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (serviceId === "tax-return-preparation") {
      setStep("documents");
    } else {
      setStep("payment");
    }
  }

  // ── Step 2: Documents Submit -> Proceed to Payment ───────────────────────
  function handleDocumentsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("payment");
  }

  // ── Step 3: Payment Success -> Save Details in DB -> Move to Calendly ─────
  async function handlePaymentSuccess(orderId: string, details: any) {
    setIsSavingPayment(true);
    const paymentDate = new Date().toISOString();
    const paypalData: PaypalData = {
      orderId: details.id || orderId,
      status: details.status || "COMPLETED",
      payer: details.payer || {},
      amount: svc.price,
    };
    setPaypal(paypalData);
    setPaymentDone(true);

    let confNum = `TAX-${Date.now().toString(36).toUpperCase()}`;
    let savedBookingId: number | string | null = null;

    // 1. Save Initial Booking to DB with Payment Info
    try {
      const res = await fetchWithTimeout(`${API}/api/tax-advisory-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tax_advisory",
          status: "confirmed",
          customer_info: {
            ...contact,
          },
          service: {
            id: serviceId || "tax-advisory",
            title: serviceTitle,
            price: svc.price,
          },
          appointment: {
            status: "pending_schedule",
            paymentDate,
          },
          payment: {
            method: "paypal",
            orderId: paypalData.orderId,
            status: paypalData.status,
            amount: svc.price,
            payer: paypalData.payer,
            paid_at: paymentDate,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.confirmation_number) confNum = data.data.confirmation_number;
        if (data.data.id) savedBookingId = data.data.id;
      }
    } catch (err) {
      console.warn("Initial tax booking save warning:", err);
    }

    setConfirmationNumber(confNum);
    setBookingId(savedBookingId);

    // Save preliminary booking info to sessionStorage
    try {
      sessionStorage.setItem("tax-advisory-booking", JSON.stringify({
        ...contact,
        serviceId,
        serviceTitle,
        servicePrice: svc.price,
        confirmationNumber: confNum,
        bookingId: savedBookingId,
        paypalOrderId: paypalData.orderId,
        paypalStatus: paypalData.status,
        paypalPayer: paypalData.payer,
        paymentDate,
        appointmentStatus: "pending_schedule",
      }));
    } catch (e) {
      console.warn("sessionStorage save error:", e);
    }

    setIsSavingPayment(false);
    // Proceed to Calendly scheduler
    setStep("calendar");
  }

  // ── Step 3: Load Calendly script when calendar step is active ─────────────
  useEffect(() => {
    if (step !== "calendar") return;
    const win = window as any;
    if (win.Calendly) {
      win.Calendly.initInlineWidgets?.();
      setCalendlyLoaded(true);
      return;
    }
    const existing = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    if (existing) {
      const poll = setInterval(() => {
        if ((window as any).Calendly) {
          clearInterval(poll);
          (window as any).Calendly.initInlineWidgets?.();
          setCalendlyLoaded(true);
        }
      }, 100);
      return () => clearInterval(poll);
    }
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = () => {
      (window as any).Calendly?.initInlineWidgets?.();
      setCalendlyLoaded(true);
    };
    document.head.appendChild(script);
  }, [step]);

  // Re-init widget when step or contact details change
  useEffect(() => {
    if (step === "calendar" && (window as any).Calendly?.initInlineWidgets) {
      const timer = setTimeout(() => {
        (window as any).Calendly.initInlineWidgets();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [step, fullName, contact.email]);

  // ── Calendly event listener (Capture date, time, and scheduled event) ─────
  const slotRef = useRef<string | null>(null);

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (!e.data) return;

      const evtName = typeof e.data === "object" ? e.data.event : null;
      const payload = typeof e.data === "object" ? e.data.payload : null;

      // 1. Capture date/time selection
      if (evtName === "calendly.date_and_time_selected") {
        const slot =
          payload?.date_and_time ||
          payload?.start_time ||
          payload?.event?.start_time ||
          (typeof payload === "string" ? payload : null);
        if (slot) {
          slotRef.current = slot;
          setLastSelectedSlot(slot);
        }
      }

      // 2. Capture final event_scheduled
      if (evtName === "calendly.event_scheduled") {
        const p = payload || {};
        const eventUri = p.event?.uri || p.event_uri || p.uri || "";
        const inviteeUri = p.invitee?.uri || p.invitee_uri || "";

        setIsSavingAppointment(true);

        // ── Fetch real start/end time from Calendly API via our backend proxy ──
        let startTime = "";
        let endTime = "";
        let locationInfo: { type?: string; join_url?: string; location?: string } | null = null;
        let calData: any = null;

        if (eventUri) {
          try {
            const calRes = await fetchWithTimeout(
              `${API}/api/calendly/event-details?event_uri=${encodeURIComponent(eventUri)}${inviteeUri ? `&invitee_uri=${encodeURIComponent(inviteeUri)}` : ""}`,
              { method: "GET", headers: { "Content-Type": "application/json" } },
              10000
            );
            if (calRes.ok) {
              const calJson = await calRes.json();
              if (calJson.success && calJson.data) {
                startTime = calJson.data.start_time || "";
                endTime = calJson.data.end_time || "";
                locationInfo = calJson.data.location || null;
                calData = calJson.data;
              }
            }
          } catch (err) {
            console.warn("Calendly API event-details fetch failed:", err);
          }
        }

        // Fallback: use slotRef or lastSelectedSlot if API didn't return a time
        if (!startTime) {
          startTime =
            p.event?.start_time ||
            p.start_time ||
            slotRef.current ||
            lastSelectedSlot ||
            "";
        }
        if (!endTime) {
          endTime =
            p.event?.end_time ||
            p.end_time ||
            (startTime ? new Date(new Date(startTime).getTime() + 3600000).toISOString() : "");
        }

        const locationType = String(locationInfo?.type || calData?.location_type || "").toLowerCase();
        const isPhoneCall = Boolean(
          calData?.is_phone_call ||
          ["outbound_call", "inbound_call", "phone_call"].includes(locationType) ||
          locationType.includes("call") ||
          locationType.includes("phone") ||
          (Boolean(locationInfo?.location) && !locationInfo?.join_url && /^[+\d\s().-]{7,}$/.test(String(locationInfo?.location || "").trim()))
        );

        const phone = calData?.phone_number || locationInfo?.location || contact.phone || "";

        const isGoogleMeet = !isPhoneCall && (
          calData?.is_google_meet ||
          locationType === "google_conference" ||
          Boolean(locationInfo?.join_url && locationInfo.join_url.includes("meet.google.com"))
        );

        const eventUuidMatch = typeof eventUri === "string" ? eventUri.match(/scheduled_events\/([a-f0-9\-]+)/i) : null;

        // DO NOT generate Google Meet link if scheduled by phone number
        const googleMeetUrl = !isPhoneCall && (isGoogleMeet || (!locationType && !locationInfo)) && eventUuidMatch && eventUuidMatch[1]
          ? (calData?.google_meet_url || locationInfo?.join_url || `https://calendly.com/events/${eventUuidMatch[1]}/google_meet`)
          : "";

        const joinUrl = !isPhoneCall ? (locationInfo?.join_url || googleMeetUrl) : "";
        const meetingLink = isPhoneCall
          ? (phone ? `Phone: ${phone}` : "Phone Consultation")
          : (joinUrl || googleMeetUrl || p.event?.location || eventUri || "Calendar invite & Google Meet link sent to your email");

        const calendlyData: CalendlyData = {
          eventUri,
          inviteeUri,
          startTime,
          endTime,
          meetingLink,
          isPhoneCall,
          phoneNumber: phone,
          googleMeetUrl,
        };
        setCalendly(calendlyData);

        const currentConf = confirmationNumber || `TAX-${Date.now().toString(36).toUpperCase()}`;
        const targetId = bookingId || currentConf;

        // Update booking in DB with appointment details
        try {
          await fetchWithTimeout(`${API}/api/tax-advisory-bookings/${targetId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "confirmed",
              appointment: {
                date: startTime,
                time: fmtTime(startTime, locale) || "",
                endTime,
                calendlyEventUrl: eventUri,
                calendlyInviteeUrl: inviteeUri,
                meetingLink,
                isPhoneCall,
                phoneNumber: isPhoneCall ? phone : undefined,
                locationType: locationType || (isPhoneCall ? "phone_call" : "google_conference"),
                googleMeetUrl: isPhoneCall ? "" : googleMeetUrl,
                status: "scheduled",
              },
            }),
          });
        } catch (err) {
          console.warn("DB Booking update with appointment failed:", err);
        }

        // Update sessionStorage
        try {
          sessionStorage.setItem("tax-advisory-booking", JSON.stringify({
            ...contact,
            serviceId,
            serviceTitle,
            servicePrice: svc.price,
            appointmentDate: startTime,
            appointmentTime: fmtTime(startTime, locale) || "",
            appointmentEndTime: endTime,
            calendlyEventUrl: eventUri,
            calendlyInviteeUrl: inviteeUri,
            meetingLink,
            isPhoneCall,
            phoneNumber: isPhoneCall ? phone : undefined,
            googleMeetUrl: isPhoneCall ? "" : googleMeetUrl,
            confirmationNumber: currentConf,
            paypalOrderId: paypal.orderId,
            paypalStatus: paypal.status,
            paypalPayer: paypal.payer,
            paymentDate: new Date().toISOString(),
          }));
        } catch (e) {
          console.warn("sessionStorage update error:", e);
        }

        setIsSavingAppointment(false);
        setStep("confirmation");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [bookingId, confirmationNumber, contact, fullName, lastSelectedSlot, locale, paypal, serviceId, serviceTitle, svc.price, API]);

  // ── Download Receipt ───────────────────────────────────────────────────────
  function handleDownloadReceipt() {
    const confNo = confirmationNumber || `TAX-${Date.now().toString(36).toUpperCase()}`;
    const receiptHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Opulanz Banking - Payment Receipt</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #252623; background: #fff; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #b59354; padding-bottom: 20px; }
    .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #b59354; margin-bottom: 6px; }
    .subtitle { color: #949ea3; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .receipt-title { font-size: 22px; font-weight: bold; color: #252623; margin-top: 15px; }
    .conf-box { background: #f6f8f8; padding: 16px; margin: 20px 0; border-left: 4px solid #b59354; border-radius: 4px; font-family: monospace; font-size: 16px; }
    .section { margin: 24px 0; }
    .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #949ea3; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f6f8f8; }
    .detail-label { color: #6b7280; font-size: 14px; }
    .detail-value { color: #252623; font-weight: 600; font-size: 14px; text-align: right; }
    .total-box { background: #f6f8f8; padding: 16px; margin-top: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-size: 16px; font-weight: bold; color: #252623; }
    .total-value { font-size: 24px; font-weight: bold; color: #b59354; }
    .status-badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; color: #949ea3; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    .print-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center; }
    .print-btn { background: #b59354; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer; margin-top: 8px; }
    @media print { body { padding: 20px; } .print-box { display: none; } }
  </style>
</head>
<body>
  <div class="print-box">
    <p style="margin:0 0 8px 0; color:#1e40af; font-weight:bold;">Print or Save as PDF</p>
    <button class="print-btn" onclick="window.print()">Print Receipt</button>
  </div>
  <div class="header">
    <div class="logo">OPULANZ BANKING</div>
    <div class="subtitle">Luxembourg Financial & Tax Advisory Services</div>
    <div class="receipt-title">PAYMENT RECEIPT</div>
  </div>
  <div class="conf-box">
    <strong>Confirmation Number:</strong> ${confNo}
  </div>
  <div class="section">
    <div class="section-title">Client Information</div>
    <div class="detail-row"><span class="detail-label">Client Name:</span><span class="detail-value">${fullName}</span></div>
    <div class="detail-row"><span class="detail-label">Email Address:</span><span class="detail-value">${contact.email}</span></div>
    <div class="detail-row"><span class="detail-label">Phone Number:</span><span class="detail-value">${contact.phone}</span></div>
    ${contact.address ? `<div class="detail-row"><span class="detail-label">Address:</span><span class="detail-value">${contact.address}</span></div>` : ""}
  </div>
  ${isTaxReturn ? `
  <div class="section">
    <div class="section-title">Tax Return Dossier Details</div>
    <div class="detail-row"><span class="detail-label">Filing Request:</span><span class="detail-value">${contact.returnType === "tax_balance" ? "Bilan Fiscal (Tax Balance)" : "Déclaration d'impôt (Tax Return)"}</span></div>
    ${contact.dossierNumber || contact.priorYearDossierNumber ? `<div class="detail-row"><span class="detail-label">Dossier Number:</span><span class="detail-value">${contact.dossierNumber || contact.priorYearDossierNumber}</span></div>` : ""}
    ${contact.hasPartner === "yes" && contact.partnerFirstName ? `<div class="detail-row"><span class="detail-label">Spouse / Partner:</span><span class="detail-value">${contact.partnerFirstName} ${contact.partnerLastName || ""}</span></div>` : ""}
    ${contact.childrenCount && contact.childrenCount !== "0" ? `<div class="detail-row"><span class="detail-label">Dependent Children:</span><span class="detail-value">${contact.childrenCount}</span></div>` : ""}
    ${contact.firstOccupancyDate ? `<div class="detail-row"><span class="detail-label">First Occupancy Date:</span><span class="detail-value">${contact.firstOccupancyDate}</span></div>` : ""}
  </div>
  ` : ""}
  <div class="section">
    <div class="section-title">Consultation Service</div>
    <div class="detail-row"><span class="detail-label">Service:</span><span class="detail-value">${serviceTitle}</span></div>
    <div class="detail-row"><span class="detail-label">Duration:</span><span class="detail-value">60 Minutes</span></div>
    ${dateStr ? `<div class="detail-row"><span class="detail-label">Scheduled Date:</span><span class="detail-value">${dateStr}</span></div>` : ""}
    ${timeStr ? `<div class="detail-row"><span class="detail-label">Scheduled Time:</span><span class="detail-value">${timeStr}</span></div>` : ""}
    <div class="detail-row"><span class="detail-label">Net Fee (excl. VAT):</span><span class="detail-value">&euro;${(svc.price / 1.17).toFixed(2)}</span></div>
    <div class="detail-row"><span class="detail-label">VAT (17% Luxembourg):</span><span class="detail-value">&euro;${(svc.price - svc.price / 1.17).toFixed(2)}</span></div>
  </div>
  <div class="total-box">
    <span class="total-label">Total Paid:</span>
    <span class="total-value">&euro;${svc.price.toFixed(2)}</span>
  </div>
  <div class="section">
    <div class="section-title">Payment Information</div>
    <div class="detail-row"><span class="detail-label">Payment Method:</span><span class="detail-value">PayPal</span></div>
    ${paypal.orderId ? `<div class="detail-row"><span class="detail-label">PayPal Order ID:</span><span class="detail-value">${paypal.orderId}</span></div>` : ""}
    <div class="detail-row"><span class="detail-label">Payment Status:</span><span class="detail-value"><span class="status-badge">${paypal.status || "PAID"}</span></span></div>
    <div class="detail-row"><span class="detail-label">Payment Date:</span><span class="detail-value">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
  </div>
  <div class="footer">
    <p><strong>Thank you for choosing Opulanz Banking.</strong></p>
    <p>If you have any questions regarding your consultation, please contact support@opulanz.com</p>
  </div>
</body>
</html>`;
    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Opulanz-Receipt-${confNo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  // ── Progress Steps Configuration ──────────────────────────────────────────
  const isTaxReturn = serviceId === "tax-return-preparation";
  const stepsList: { key: Step; label: string }[] = isTaxReturn
    ? [
        { key: "contact", label: t("steps.details") },
        { key: "documents", label: t("steps.taxDocuments") },
        { key: "payment", label: t("steps.payment") },
        { key: "calendar", label: t("steps.schedule") },
        { key: "confirmation", label: t("steps.confirmed") },
      ]
    : [
        { key: "contact", label: t("steps.details") },
        { key: "payment", label: t("steps.payment") },
        { key: "calendar", label: t("steps.schedule") },
        { key: "confirmation", label: t("steps.confirmed") },
      ];
  const currentStepIdx = stepsList.findIndex((s) => s.key === step);

  return (
    <>
      <PageGuidance
        pageKey="tax-advisory-booking"
        locale={locale}
        title="Tax Advisory Booking"
        description="Provide details, complete consultation payment, and schedule your appointment with a certified advisor."
        steps={[
          { content: "Step 1: Enter your personal details and review the consultation fee." },
          { content: "Step 2: Pay securely with PayPal or debit card. Your booking is instantly recorded in our database." },
          { content: "Step 3: Select your preferred consultation date and time directly on our Calendly scheduler." },
          { content: "Step 4: Receive your meeting confirmation and Google Meet link." },
        ]}
        tip="Your consultation slot and meeting invitation will be sent to your email immediately upon scheduling."
      />

      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle", { service: serviceTitle })}
      />

      <section className="bg-brand-off py-12">
        <div className="container mx-auto max-w-4xl px-6">

          {/* Stepper Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {stepsList.map((s, idx) => {
                const isCompleted = idx < currentStepIdx || (s.key === "confirmation" && step === "confirmation");
                const isCurrent = idx === currentStepIdx && !isCompleted;
                return (
                  <React.Fragment key={s.key}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all shadow-sm ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-brand-gold text-white ring-4 ring-brand-gold/20"
                            : "bg-white border border-brand-grayLight text-brand-grayMed"
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                      </div>
                      <span
                        className={`mt-2 text-xs font-semibold ${
                          isCompleted
                            ? "text-emerald-700"
                            : isCurrent
                            ? "text-brand-dark"
                            : "text-brand-grayMed"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < stepsList.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-3 rounded transition-all ${
                          idx < currentStepIdx || (step === "confirmation" && idx <= currentStepIdx) ? "bg-emerald-600" : "bg-brand-grayLight/60"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 1: Basic Details Form                                        */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {step === "contact" && (
            <>
              <SectionHeading
                overline="STEP 1 OF 3"
                title={t("step1.title")}
                description={t("step1.description")}
              />
              <Card className="mt-8 border border-brand-grayLight/40 bg-white shadow-md rounded-2xl">
                <CardContent className="p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="firstName" className="text-brand-dark font-medium">
                          {t("step1.firstName")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={contact.firstName}
                          onChange={(e) => setContact((p) => ({ ...p, firstName: e.target.value }))}
                          placeholder={t("step1.firstNamePlaceholder")}
                          className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.firstName ? "border-red-500" : ""}`}
                        />
                        {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-brand-dark font-medium">
                          {t("step1.lastName")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={contact.lastName}
                          onChange={(e) => setContact((p) => ({ ...p, lastName: e.target.value }))}
                          placeholder={t("step1.lastNamePlaceholder")}
                          className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.lastName ? "border-red-500" : ""}`}
                        />
                        {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-brand-dark font-medium">
                        {t("step1.email")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                        placeholder={t("step1.emailPlaceholder")}
                        className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-brand-dark font-medium">
                        {t("step1.phone")} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                        placeholder={t("step1.phonePlaceholder")}
                        className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.phone ? "border-red-500" : ""}`}
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                    </div>

                    {/* Address Type Selection & Input */}
                    <div className="space-y-3 pt-2">
                      <Label className="text-brand-dark font-medium">
                        {t("step1.addressLabel")} <span className="text-red-500">*</span>
                      </Label>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setContact((p) => ({ ...p, addressType: "residential" }))}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                            contact.addressType === "residential"
                              ? "border-brand-gold bg-brand-gold/10 text-brand-dark shadow-sm"
                              : "border-brand-grayLight/60 bg-white text-brand-grayMed hover:border-brand-gold/50"
                          }`}
                        >
                          <Home className={`h-4 w-4 ${contact.addressType === "residential" ? "text-brand-gold" : "text-gray-400"}`} />
                          <span>{t("step1.residentialAddress")}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setContact((p) => ({ ...p, addressType: "company" }))}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                            contact.addressType === "company"
                              ? "border-brand-gold bg-brand-gold/10 text-brand-dark shadow-sm"
                              : "border-brand-grayLight/60 bg-white text-brand-grayMed hover:border-brand-gold/50"
                          }`}
                        >
                          <Building className={`h-4 w-4 ${contact.addressType === "company" ? "text-brand-gold" : "text-gray-400"}`} />
                          <span>{t("step1.companyAddress")}</span>
                        </button>
                      </div>

                      <div>
                        {/* Residence / Company Address divided into 3 text boxes */}
                        <div className="grid gap-3 sm:grid-cols-3 mt-1">
                          <div>
                            <Label className="text-xs text-brand-dark font-medium">{t("taxPayerDetails.streetNumber")}</Label>
                            <Input
                              placeholder="e.g. 24 Rue de la Gare"
                              value={contact.streetNumber || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setContact((p) => {
                                  const next = { ...p, streetNumber: val };
                                  next.address = [val, next.postalCodeCity, next.country].filter(Boolean).join(", ");
                                  return next;
                                });
                              }}
                              className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.address ? "border-red-500" : ""}`}
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-brand-dark font-medium">{t("taxPayerDetails.postalCodeCity")}</Label>
                            <Input
                              placeholder="e.g. L-1610 Luxembourg"
                              value={contact.postalCodeCity || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setContact((p) => {
                                  const next = { ...p, postalCodeCity: val };
                                  next.address = [next.streetNumber, val, next.country].filter(Boolean).join(", ");
                                  return next;
                                });
                              }}
                              className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.address ? "border-red-500" : ""}`}
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-brand-dark font-medium">{t("taxPayerDetails.country")}</Label>
                            <Input
                              placeholder="e.g. Luxembourg"
                              value={contact.country || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setContact((p) => {
                                  const next = { ...p, country: val };
                                  next.address = [next.streetNumber, next.postalCodeCity, val].filter(Boolean).join(", ");
                                  return next;
                                });
                              }}
                              className={`mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold ${errors.address ? "border-red-500" : ""}`}
                            />
                          </div>
                        </div>
                        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}

                        {/* Checkbox for Contact Address (if it's a different address) */}
                        <div className="mt-3">
                          <label className="inline-flex items-center gap-2 text-xs font-medium text-brand-dark cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!contact.hasDifferentContactAddress}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setContact((p) => ({ ...p, hasDifferentContactAddress: checked }));
                              }}
                              className="rounded border-brand-grayLight text-brand-gold focus:ring-brand-gold h-4 w-4"
                            />
                            <span>{t("step1.contactAddressDifferent")}</span>
                          </label>

                          {contact.hasDifferentContactAddress && (
                            <div className="mt-3 bg-brand-off p-4 rounded-xl border border-brand-grayLight/40 space-y-4">
                              <h5 className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                                <Home className="h-3.5 w-3.5 text-brand-gold" />
                                {t("step1.contactAddressDifferent")}
                              </h5>
                              <div className="grid gap-3 sm:grid-cols-3">
                                <div>
                                  <Label className="text-xs text-brand-dark">{t("taxPayerDetails.streetNumber")}</Label>
                                  <Input
                                    placeholder="e.g. 24 Rue de la Gare"
                                    value={contact.differentStreetNumber || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setContact(p => {
                                        const next = { ...p, differentStreetNumber: val };
                                        next.differentAddress = [val, next.differentPostalCodeCity, next.differentCountry].filter(Boolean).join(", ");
                                        return next;
                                      });
                                    }}
                                    className="mt-1 bg-white text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-brand-dark">{t("taxPayerDetails.postalCodeCity")}</Label>
                                  <Input
                                    placeholder="e.g. L-1610 Luxembourg"
                                    value={contact.differentPostalCodeCity || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setContact(p => {
                                        const next = { ...p, differentPostalCodeCity: val };
                                        next.differentAddress = [next.differentStreetNumber, val, next.differentCountry].filter(Boolean).join(", ");
                                        return next;
                                      });
                                    }}
                                    className="mt-1 bg-white text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-brand-dark">{t("taxPayerDetails.country")}</Label>
                                  <Input
                                    placeholder="e.g. Luxembourg, France, Germany"
                                    value={contact.differentCountry || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setContact(p => {
                                        const next = { ...p, differentCountry: val };
                                        next.differentAddress = [next.differentStreetNumber, next.differentPostalCodeCity, val].filter(Boolean).join(", ");
                                        return next;
                                      });
                                    }}
                                    className="mt-1 bg-white text-xs"
                                  />
                                </div>
                              </div>

                              {/* Relocation Check inside Address card */}
                              <div className="pt-3 border-t border-brand-grayLight/30">
                                <Label className="text-brand-dark font-medium text-xs mb-2 block">{t("taxPayerDetails.relocated")}</Label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                      type="radio"
                                      name="relocatedSince2023"
                                      checked={contact.relocatedSince2023 === "no" || !contact.relocatedSince2023}
                                      onChange={() => setContact(p => ({ ...p, relocatedSince2023: "no" }))}
                                    />
                                    {t("taxPayerDetails.no")}
                                  </label>
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                      type="radio"
                                      name="relocatedSince2023"
                                      checked={contact.relocatedSince2023 === "yes"}
                                      onChange={() => setContact(p => ({ ...p, relocatedSince2023: "yes" }))}
                                    />
                                    {t("taxPayerDetails.yes")}
                                  </label>
                                </div>
                                {contact.relocatedSince2023 === "yes" && (
                                  <div className="mt-3 grid gap-3 sm:grid-cols-3 bg-white p-3 rounded-lg border border-brand-grayLight/40">
                                    <h5 className="sm:col-span-3 text-xs font-bold text-brand-dark border-b border-brand-grayLight/20 pb-1.5">
                                      {t("taxPayerDetails.relocationTitle")}
                                    </h5>
                                    <div className="sm:col-span-3">
                                      <Label className="text-xs">{t("taxPayerDetails.relocationDate")}</Label>
                                      <Input
                                        type="date"
                                        value={contact.previousDateOfRelocation || ""}
                                        onChange={e => setContact(p => ({ ...p, previousDateOfRelocation: e.target.value }))}
                                        className="mt-1 max-w-sm bg-white text-xs"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.previousStreetNumber")}</Label>
                                      <Input
                                        value={contact.previousStreetNumber || ""}
                                        onChange={e => setContact(p => ({ ...p, previousStreetNumber: e.target.value, previousAddress: `${e.target.value}, ${p.previousPostalCodeCity || ''}, ${p.previousCountry || ''}` }))}
                                        className="mt-1 bg-white text-xs"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.previousPostalCodeCity")}</Label>
                                      <Input
                                        value={contact.previousPostalCodeCity || ""}
                                        onChange={e => setContact(p => ({ ...p, previousPostalCodeCity: e.target.value, previousAddress: `${p.previousStreetNumber || ''}, ${e.target.value}, ${p.previousCountry || ''}` }))}
                                        className="mt-1 bg-white text-xs"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.previousCountry")}</Label>
                                      <Input
                                        value={contact.previousCountry || ""}
                                        onChange={e => setContact(p => ({ ...p, previousCountry: e.target.value, previousAddress: `${p.previousStreetNumber || ''}, ${p.previousPostalCodeCity || ''}, ${e.target.value}` }))}
                                        className="mt-1 bg-white text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tax Return Specific Information */}
                    {serviceId === "tax-return-preparation" && (
                      <div className="pt-6 mt-6 border-t border-brand-grayLight/30 space-y-8">
                        {/* Return Type Selection (Tax return vs Fiscal Balance) */}
                        <div className="bg-brand-off p-5 rounded-xl border border-brand-gold/30">
                          <Label className="text-brand-dark font-bold text-sm mb-3 block">
                            {t("taxPayerDetails.returnTypeTitle")}
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              contact.returnType === "tax_return"
                                ? "bg-white border-brand-gold shadow-xs"
                                : "bg-white/60 border-brand-grayLight/60 hover:border-brand-gold/40"
                            }`}>
                              <input
                                type="radio"
                                name="returnType"
                                checked={contact.returnType !== "tax_balance"}
                                onChange={() => setContact(p => ({ ...p, returnType: "tax_return" }))}
                                className="text-brand-gold focus:ring-brand-gold"
                              />
                              <span className="text-sm font-semibold text-brand-dark">
                                {t("taxPayerDetails.returnTypeTaxReturn")}
                              </span>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              contact.returnType === "tax_balance"
                                ? "bg-white border-brand-gold shadow-xs"
                                : "bg-white/60 border-brand-grayLight/60 hover:border-brand-gold/40"
                            }`}>
                              <input
                                type="radio"
                                name="returnType"
                                checked={contact.returnType === "tax_balance"}
                                onChange={() => setContact(p => ({ ...p, returnType: "tax_balance" }))}
                                className="text-brand-gold focus:ring-brand-gold"
                              />
                              <span className="text-sm font-semibold text-brand-dark">
                                {t("taxPayerDetails.returnTypeTaxBalance")}
                              </span>
                            </label>
                          </div>
                          <p className="text-[11px] text-brand-grayMed mt-3 italic">
                            ⓘ {t("taxPayerDetails.infoNotice")}
                          </p>
                        </div>

                        {/* Primary Tax Payer Details */}
                        <div>
                          <h4 className="text-base font-bold text-brand-dark mb-4 flex items-center gap-2">
                            <User className="h-4 w-4 text-brand-gold" />
                            {t("taxPayerDetails.taxPayerSection")}
                          </h4>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <Label className="text-brand-dark font-medium text-xs">{t("taxPayerDetails.dob")}</Label>
                              <Input
                                type="date"
                                value={contact.dateOfBirth || ""}
                                onChange={(e) => setContact(p => ({ ...p, dateOfBirth: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-brand-dark font-medium text-xs">{t("taxPayerDetails.placeOfBirth")}</Label>
                              <Input
                                placeholder="City, Country"
                                value={contact.placeOfBirth || ""}
                                onChange={(e) => setContact(p => ({ ...p, placeOfBirth: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-brand-dark font-medium text-xs">{t("taxPayerDetails.ssn")}</Label>
                              <Input
                                placeholder="13-digit Luxembourg matricule"
                                value={contact.ssn || ""}
                                onChange={(e) => setContact(p => ({ ...p, ssn: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-brand-dark font-medium text-xs">{t("taxPayerDetails.profession")}</Label>
                              <Input
                                placeholder="e.g. Employee, Consultant, Director"
                                value={contact.profession || ""}
                                onChange={(e) => setContact(p => ({ ...p, profession: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <Label className="text-brand-dark font-medium text-xs">{t("taxPayerDetails.dossierNumber")}</Label>
                              <Input
                                placeholder="e.g. 1985..."
                                value={contact.dossierNumber || ""}
                                onChange={(e) => setContact(p => ({ ...p, dossierNumber: e.target.value }))}
                                className="mt-1 max-w-sm"
                              />
                            </div>
                          </div>
                        </div>



                        {/* Partner Details */}
                        <div>
                          <Label className="text-brand-dark font-medium mb-3 block">{t("taxPayerDetails.hasPartner")}</Label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="radio"
                                name="hasPartner"
                                checked={contact.hasPartner === "no"}
                                onChange={() => setContact(p => ({ ...p, hasPartner: "no" }))}
                              />
                              {t("taxPayerDetails.no")}
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="radio"
                                name="hasPartner"
                                checked={contact.hasPartner === "yes"}
                                onChange={() => setContact(p => ({ ...p, hasPartner: "yes" }))}
                              />
                              {t("taxPayerDetails.yes")}
                            </label>
                          </div>
                          {contact.hasPartner === "yes" && (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 bg-brand-off p-5 rounded-xl border border-brand-grayLight/40">
                              <h5 className="sm:col-span-2 text-sm font-bold text-brand-dark border-b border-brand-grayLight/30 pb-2">
                                {t("taxPayerDetails.partnerSectionTitle")}
                              </h5>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.partnerFirstName")}</Label>
                                <Input value={contact.partnerFirstName || ""} onChange={e => setContact(p => ({ ...p, partnerFirstName: e.target.value }))} className="mt-1 bg-white" />
                              </div>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.partnerLastName")}</Label>
                                <Input value={contact.partnerLastName || ""} onChange={e => setContact(p => ({ ...p, partnerLastName: e.target.value }))} className="mt-1 bg-white" />
                              </div>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.partnerDob")}</Label>
                                <Input type="date" value={contact.partnerDateOfBirth || ""} onChange={e => setContact(p => ({ ...p, partnerDateOfBirth: e.target.value }))} className="mt-1 bg-white" />
                              </div>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.partnerPlaceOfBirth")}</Label>
                                <Input placeholder="City, Country" value={contact.partnerPlaceOfBirth || ""} onChange={e => setContact(p => ({ ...p, partnerPlaceOfBirth: e.target.value }))} className="mt-1 bg-white" />
                              </div>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.partnerSsn")}</Label>
                                <Input placeholder="13-digit matricule" value={contact.partnerSsn || ""} onChange={e => setContact(p => ({ ...p, partnerSsn: e.target.value }))} className="mt-1 bg-white" />
                              </div>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.partnerProfession")}</Label>
                                <Input value={contact.partnerProfession || ""} onChange={e => setContact(p => ({ ...p, partnerProfession: e.target.value }))} className="mt-1 bg-white" />
                              </div>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.partnerPhone")}</Label>
                                <Input type="tel" value={contact.partnerPhone || ""} onChange={e => setContact(p => ({ ...p, partnerPhone: e.target.value }))} className="mt-1 bg-white" />
                              </div>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.partnerEmail")}</Label>
                                <Input type="email" value={contact.partnerEmail || ""} onChange={e => setContact(p => ({ ...p, partnerEmail: e.target.value }))} className="mt-1 bg-white" />
                              </div>
                              <div className="sm:col-span-2">
                                <Label className="text-xs">{t("taxPayerDetails.partnerDossierNumber")}</Label>
                                <Input placeholder="e.g. 1985..." value={contact.partnerDossierNumber || ""} onChange={e => setContact(p => ({ ...p, partnerDossierNumber: e.target.value }))} className="mt-1 max-w-sm bg-white" />
                              </div>
                            </div>
                          )}
                        </div>



                        {/* Civil Status */}
                        <div>
                          <Label className="text-brand-dark font-medium mb-3 block">{t("taxPayerDetails.civilStatus")}</Label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold max-w-sm"
                            value={contact.civilStatus} 
                            onChange={(e) => setContact(p => ({ ...p, civilStatus: e.target.value as any }))}
                          >
                            <option value="single">{t("taxPayerDetails.single")}</option>
                            <option value="married">{t("taxPayerDetails.married")}</option>
                            <option value="partnership">{t("taxPayerDetails.partnership")}</option>
                            <option value="divorced">{t("taxPayerDetails.divorced")}</option>
                          </select>
                          {contact.civilStatus !== "single" && (
                            <div className="mt-4">
                              <Label className="text-xs">
                                {t("taxPayerDetails.civilStatusDate", {
                                  status: contact.civilStatus === "married"
                                    ? t("taxPayerDetails.marriage")
                                    : contact.civilStatus === "partnership"
                                    ? t("taxPayerDetails.civilPartnership")
                                    : t("taxPayerDetails.divorce")
                                })}
                              </Label>
                              <Input
                                type="date"
                                value={contact.civilStatusDate || ""}
                                onChange={e => setContact(p => ({ ...p, civilStatusDate: e.target.value }))}
                                className="mt-1 max-w-sm bg-white"
                              />
                            </div>
                          )}
                        </div>

                        {/* Dependent Children */}
                        <div>
                          <Label className="text-brand-dark font-medium mb-3 block">{t("taxPayerDetails.childrenCount")}</Label>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1 bg-white border-brand-grayLight/60 focus:border-brand-gold max-w-sm"
                            value={contact.childrenCount} 
                            onChange={(e) => {
                              const count = parseInt(e.target.value);
                              setContact(p => {
                                const currentKids = p.childrenDetails || [];
                                const newKids = Array(count).fill(null).map((_, i) => currentKids[i] || { name: "", birth: "", ssn: "" });
                                return { ...p, childrenCount: e.target.value as any, childrenDetails: newKids };
                              });
                            }}
                          >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                          {contact.childrenCount !== "0" && contact.childrenDetails && contact.childrenDetails.length > 0 && (
                            <div className="mt-4 space-y-4">
                              {contact.childrenDetails.map((child, idx) => (
                                <div key={idx} className="bg-brand-off p-4 rounded-xl border border-brand-grayLight/40">
                                  <h5 className="font-semibold text-sm mb-3 text-brand-dark">{t("taxPayerDetails.childNumber", { number: idx + 1 })}</h5>
                                  <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.fullName")}</Label>
                                      <Input
                                        placeholder="Last & First name"
                                        value={child.name}
                                        onChange={e => {
                                          const newKids = [...(contact.childrenDetails || [])];
                                          newKids[idx].name = e.target.value;
                                          setContact(p => ({ ...p, childrenDetails: newKids }));
                                        }}
                                        className="mt-1 bg-white"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.dob")}</Label>
                                      <Input
                                        type="date"
                                        value={child.birth}
                                        onChange={e => {
                                          const newKids = [...(contact.childrenDetails || [])];
                                          newKids[idx].birth = e.target.value;
                                          setContact(p => ({ ...p, childrenDetails: newKids }));
                                        }}
                                        className="mt-1 bg-white"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.ssn")}</Label>
                                      <Input
                                        placeholder="Matricule (if known)"
                                        value={child.ssn}
                                        onChange={e => {
                                          const newKids = [...(contact.childrenDetails || [])];
                                          newKids[idx].ssn = e.target.value;
                                          setContact(p => ({ ...p, childrenDetails: newKids }));
                                        }}
                                        className="mt-1 bg-white"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Alimony / Child Maintenance (Rentes) matching PDF exactly */}
                        <div className="bg-brand-off p-5 rounded-xl border border-brand-grayLight/40">
                          <Label className="text-brand-dark font-bold text-sm mb-2 block">{t("taxPayerDetails.hasAlimony")}</Label>
                          <p className="text-xs text-brand-grayMed mb-3">{t("taxPayerDetails.alimonyPrompt")}</p>
                          
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                              <input
                                type="radio"
                                name="alimonyType"
                                checked={contact.alimonyType === "none" || !contact.alimonyType}
                                onChange={() => setContact(p => ({ ...p, alimonyType: "none", hasAlimony: "no" }))}
                              />
                              <span>{t("taxPayerDetails.alimonyNone")}</span>
                            </label>

                            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                              <input
                                type="radio"
                                name="alimonyType"
                                checked={contact.alimonyType === "child_in_household"}
                                onChange={() => setContact(p => ({ ...p, alimonyType: "child_in_household", hasAlimony: "yes" }))}
                              />
                              <span>{t("taxPayerDetails.alimonyInHousehold")}</span>
                            </label>

                            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                              <input
                                type="radio"
                                name="alimonyType"
                                checked={contact.alimonyType === "child_outside_household"}
                                onChange={() => setContact(p => ({ ...p, alimonyType: "child_outside_household", hasAlimony: "yes" }))}
                              />
                              <span>{t("taxPayerDetails.alimonyOutsideHousehold")}</span>
                            </label>
                          </div>

                          {contact.alimonyType && contact.alimonyType !== "none" && (
                            <div className="mt-4 pt-4 border-t border-brand-grayLight/30 grid gap-3 sm:grid-cols-2">
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.alimonyChildName")}</Label>
                                <Input
                                  value={contact.alimonyChildName || ""}
                                  onChange={e => setContact(p => ({ ...p, alimonyChildName: e.target.value }))}
                                  placeholder="Last Name / First Name"
                                  className="mt-1 bg-white"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.alimonyChildDob")}</Label>
                                <Input
                                  type="date"
                                  value={contact.alimonyChildDob || ""}
                                  onChange={e => setContact(p => ({ ...p, alimonyChildDob: e.target.value }))}
                                  className="mt-1 bg-white"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.alimonyChildAddress")}</Label>
                                <Input
                                  value={contact.alimonyChildAddress || ""}
                                  onChange={e => setContact(p => ({ ...p, alimonyChildAddress: e.target.value }))}
                                  placeholder="Address"
                                  className="mt-1 bg-white"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t("taxPayerDetails.alimonyAmount")}</Label>
                                <Input
                                  value={contact.alimonyAmount || ""}
                                  onChange={e => setContact(p => ({ ...p, alimonyAmount: e.target.value, alimonyDetails: `${p.alimonyChildName || ''} - ${e.target.value}` }))}
                                  placeholder="e.g. €350 / month"
                                  className="mt-1 bg-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bank Account */}
                        <div>
                          <h4 className="text-base font-bold text-brand-dark mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-brand-gold" />
                            {t("taxPayerDetails.bankAccountTitle")}
                          </h4>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <Label className="text-xs">{t("taxPayerDetails.bankAccountOwner")}</Label>
                              <Input
                                value={contact.bankAccountOwner || ""}
                                onChange={e => setContact(p => ({ ...p, bankAccountOwner: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{t("taxPayerDetails.iban")}</Label>
                              <Input
                                placeholder="LU..."
                                value={contact.iban || ""}
                                onChange={e => setContact(p => ({ ...p, iban: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{t("taxPayerDetails.swiftBic")}</Label>
                              <Input
                                placeholder="e.g. BGLLLULL"
                                value={contact.swiftBic || ""}
                                onChange={e => setContact(p => ({ ...p, swiftBic: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Rented Properties */}
                        <div className="bg-brand-off p-5 rounded-xl border border-brand-grayLight/40 mt-6">
                          <Label className="text-brand-dark font-bold text-sm mb-3 block">{t("taxPayerDetails.hasRentedProperties")}</Label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="radio"
                                name="hasRentedProperties"
                                checked={contact.hasRentedProperties === "no"}
                                onChange={() => setContact(p => ({ ...p, hasRentedProperties: "no" }))}
                              />
                              {t("taxPayerDetails.no")}
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="radio"
                                name="hasRentedProperties"
                                checked={contact.hasRentedProperties === "yes"}
                                onChange={() => {
                                  setContact(p => ({ 
                                    ...p, 
                                    hasRentedProperties: "yes",
                                    rentedProperties: p.rentedProperties?.length ? p.rentedProperties : [{
                                      address: "", cadastralReference: "", completedOn: "", purchasedOn: "", soldOn: "", hasUsufruct: "no", firstRentalDate: "", owners: [], monthsRented2025: "", rentsReceived2025: ""
                                    }]
                                  }));
                                }}
                              />
                              {t("taxPayerDetails.yes")}
                            </label>
                          </div>
                          
                          {errors.rentedProperties && (
                              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                <span>{errors.rentedProperties}</span>
                              </div>
                            )}

                          {contact.hasRentedProperties === "yes" && contact.rentedProperties && (
                            <div className="mt-4 space-y-6">
                              {contact.rentedProperties.map((rp, idx) => (
                                <div key={idx} className="border-t border-brand-grayLight/30 pt-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <h5 className="font-semibold text-sm text-brand-dark">{t("taxPayerDetails.rentedPropertySection")} {idx + 1}</h5>
                                    {errors[`rentedProperty_${idx}`] && (
                                      <div className="mt-2 mb-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 font-medium flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                        <span>{errors[`rentedProperty_${idx}`]}</span>
                                      </div>
                                    )}
                                    {contact.rentedProperties!.length > 1 && (
                                      <button type="button" onClick={() => {
                                        setContact(p => {
                                          const next = [...(p.rentedProperties || [])];
                                          next.splice(idx, 1);
                                          return { ...p, rentedProperties: next };
                                        });
                                      }} className="text-xs text-red-500 font-medium">Remove</button>
                                    )}
                                  </div>
                                  
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                      <Label className="text-xs">{t("taxPayerDetails.rpAddress")}</Label>
                                      <Input value={rp.address} onChange={e => {
                                        const next = [...(contact.rentedProperties || [])];
                                        next[idx].address = e.target.value;
                                        setContact(p => ({ ...p, rentedProperties: next }));
                                      }} className="mt-1 bg-white" />
                                    </div>
                                    <div className="sm:col-span-2">
                                      <Label className="text-xs">{t("taxPayerDetails.rpCadastral")}</Label>
                                      <Input value={rp.cadastralReference} onChange={e => {
                                        const next = [...(contact.rentedProperties || [])];
                                        next[idx].cadastralReference = e.target.value;
                                        setContact(p => ({ ...p, rentedProperties: next }));
                                      }} className="mt-1 bg-white" />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.rpCompletedOn")}</Label>
                                      <Input type="date" value={rp.completedOn} onChange={e => {
                                        const next = [...(contact.rentedProperties || [])];
                                        next[idx].completedOn = e.target.value;
                                        setContact(p => ({ ...p, rentedProperties: next }));
                                      }} className="mt-1 bg-white" />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.rpPurchasedOn")}</Label>
                                      <Input type="date" value={rp.purchasedOn} onChange={e => {
                                        const next = [...(contact.rentedProperties || [])];
                                        next[idx].purchasedOn = e.target.value;
                                        setContact(p => ({ ...p, rentedProperties: next }));
                                      }} className="mt-1 bg-white" />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.rpSoldOn")}</Label>
                                      <Input type="date" value={rp.soldOn} onChange={e => {
                                        const next = [...(contact.rentedProperties || [])];
                                        next[idx].soldOn = e.target.value;
                                        setContact(p => ({ ...p, rentedProperties: next }));
                                      }} className="mt-1 bg-white" />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.rpFirstRentalDate")}</Label>
                                      <Input type="date" value={rp.firstRentalDate} onChange={e => {
                                        const next = [...(contact.rentedProperties || [])];
                                        next[idx].firstRentalDate = e.target.value;
                                        setContact(p => ({ ...p, rentedProperties: next }));
                                      }} className="mt-1 bg-white" />
                                    </div>
                                    <div className="sm:col-span-2 flex items-center gap-4 mt-2">
                                      <Label className="text-xs font-semibold">{t("taxPayerDetails.rpHasUsufruct")}</Label>
                                      <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" checked={rp.hasUsufruct === "yes"} onChange={() => { const next = [...(contact.rentedProperties || [])]; next[idx].hasUsufruct = "yes"; setContact(p => ({ ...p, rentedProperties: next })); }} />{t("taxPayerDetails.yes")}</label>
                                      <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" checked={rp.hasUsufruct === "no"} onChange={() => { const next = [...(contact.rentedProperties || [])]; next[idx].hasUsufruct = "no"; setContact(p => ({ ...p, rentedProperties: next })); }} />{t("taxPayerDetails.no")}</label>
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.rpMonthsRented")}</Label>
                                      <Input type="number" min="0" max="12" value={rp.monthsRented2025} onChange={e => {
                                        const next = [...(contact.rentedProperties || [])];
                                        next[idx].monthsRented2025 = e.target.value;
                                        setContact(p => ({ ...p, rentedProperties: next }));
                                      }} className="mt-1 bg-white" />
                                    </div>
                                    <div>
                                      <Label className="text-xs">{t("taxPayerDetails.rpRentsReceived")}</Label>
                                      <Input type="number" value={rp.rentsReceived2025} onChange={e => {
                                        const next = [...(contact.rentedProperties || [])];
                                        next[idx].rentsReceived2025 = e.target.value;
                                        setContact(p => ({ ...p, rentedProperties: next }));
                                      }} className="mt-1 bg-white" />
                                    </div>

                                    {/* Ownership details for Indivision / Usufruct */}
                                    <div className="sm:col-span-2 mt-2 bg-brand-gold/5 p-3 rounded-lg border border-brand-gold/20">
                                      <div className="flex justify-between items-center mb-2">
                                        <Label className="text-xs font-semibold text-brand-dark">{t("taxPayerDetails.rpOwnershipDetails")}</Label>
                                        <button type="button" className="text-[10px] bg-white border px-2 py-1 rounded" onClick={() => {
                                          const next = [...(contact.rentedProperties || [])];
                                          next[idx].owners = [...(next[idx].owners || []), { name: "", nationalId: "", undividedShare: "", usufructPercent: "", bareOwnershipPercent: "", fullOwnershipPercent: "" }];
                                          setContact(p => ({ ...p, rentedProperties: next }));
                                        }}>+ Add Owner</button>
                                      </div>
                                      {rp.owners && rp.owners.map((owner, oIdx) => (
                                        <div key={oIdx} className="grid grid-cols-2 gap-2 mt-2 p-3 bg-white rounded-lg border border-brand-grayLight/30 mb-2.5 shadow-xs">
                                          <div className="col-span-2 flex justify-between items-center pb-2 border-b border-brand-grayLight/20">
                                            <span className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">Owner #{oIdx + 1}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const next = [...(contact.rentedProperties || [])];
                                                next[idx].owners = next[idx].owners.filter((_, i) => i !== oIdx);
                                                setContact(p => ({ ...p, rentedProperties: next }));
                                              }}
                                              className="text-[11px] text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors"
                                            >
                                              <Trash2 className="h-3 w-3" /> Remove Owner
                                            </button>
                                          </div>
                                          <div>
                                            <Label className="text-[10px]">{t("taxPayerDetails.rpOwnerName")}</Label>
                                            <Input value={owner.name} onChange={e => { const n = [...(contact.rentedProperties || [])]; n[idx].owners[oIdx].name = e.target.value; setContact(p => ({ ...p, rentedProperties: n })); }} className="h-7 text-xs bg-white" />
                                          </div>
                                          <div>
                                            <Label className="text-[10px]">{t("taxPayerDetails.rpNationalId")}</Label>
                                            <Input value={owner.nationalId} onChange={e => { const n = [...(contact.rentedProperties || [])]; n[idx].owners[oIdx].nationalId = e.target.value; setContact(p => ({ ...p, rentedProperties: n })); }} className="h-7 text-xs bg-white" />
                                          </div>
                                          <div>
                                            <Label className="text-[10px]">{t("taxPayerDetails.rpUndividedShare")}</Label>
                                            <Input type="number" placeholder="%" value={owner.undividedShare} onChange={e => { const n = [...(contact.rentedProperties || [])]; n[idx].owners[oIdx].undividedShare = e.target.value; setContact(p => ({ ...p, rentedProperties: n })); }} className="h-7 text-xs bg-white" />
                                          </div>
                                          <div>
                                            <Label className="text-[10px]">{t("taxPayerDetails.rpUsufruct")}</Label>
                                            <Input type="number" placeholder="%" value={owner.usufructPercent} onChange={e => { const n = [...(contact.rentedProperties || [])]; n[idx].owners[oIdx].usufructPercent = e.target.value; setContact(p => ({ ...p, rentedProperties: n })); }} className="h-7 text-xs bg-white" />
                                          </div>
                                          <div>
                                            <Label className="text-[10px]">{t("taxPayerDetails.rpBareOwnership")}</Label>
                                            <Input type="number" placeholder="%" value={owner.bareOwnershipPercent} onChange={e => { const n = [...(contact.rentedProperties || [])]; n[idx].owners[oIdx].bareOwnershipPercent = e.target.value; setContact(p => ({ ...p, rentedProperties: n })); }} className="h-7 text-xs bg-white" />
                                          </div>
                                          <div>
                                            <Label className="text-[10px]">{t("taxPayerDetails.rpFullOwnership")}</Label>
                                            <Input type="number" placeholder="%" value={owner.fullOwnershipPercent} onChange={e => { const n = [...(contact.rentedProperties || [])]; n[idx].owners[oIdx].fullOwnershipPercent = e.target.value; setContact(p => ({ ...p, rentedProperties: n })); }} className="h-7 text-xs bg-white" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              <button type="button" onClick={() => {
                                setContact(p => ({
                                  ...p,
                                  rentedProperties: [...(p.rentedProperties || []), {
                                    address: "", cadastralReference: "", completedOn: "", purchasedOn: "", soldOn: "", hasUsufruct: "no", firstRentalDate: "", owners: [], monthsRented2025: "", rentsReceived2025: ""
                                  }]
                                }));
                              }} className="text-xs font-semibold text-brand-gold bg-brand-gold/10 px-3 py-2 rounded hover:bg-brand-gold/20 transition-all">+ {t("taxPayerDetails.addRentedProperty")}</button>
                            </div>
                          )}
                        </div>
                      </div>

                    )}

                    {/* ID Card / Passport Upload */}
                    <div className="space-y-3 pt-2 mt-6">
                      <Label className="text-brand-dark font-medium">
                        {t("step1.idCardLabel")} <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-brand-grayMed">
                        {t("step1.idCardDesc")}
                      </p>

                      <div
                        className={`relative rounded-xl border-2 border-dashed p-4 transition-all text-center ${
                          contact.idDocumentName
                            ? "border-emerald-500 bg-emerald-50/40"
                            : errors.idDocument
                            ? "border-red-500 bg-red-50/30"
                            : "border-brand-grayLight/80 hover:border-brand-gold/60 bg-gray-50/50"
                        }`}
                      >
                        <input
                          id="idDocumentUpload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleIdFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        
                        {contact.idDocumentName ? (
                          <div className="flex items-center justify-between gap-3 px-2 py-1">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Check className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div className="text-left min-w-0">
                                <p className="text-xs font-semibold text-brand-dark truncate">{contact.idDocumentName}</p>
                                <p className="text-[11px] text-emerald-600 font-medium">{t("step1.idDocumentReady")}</p>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-brand-gold hover:underline pointer-events-none">
                              {t("step1.replaceFile")}
                            </span>
                          </div>
                        ) : (
                          <div className="py-2">
                            <div className="mx-auto h-9 w-9 rounded-full bg-brand-gold/10 flex items-center justify-center mb-2">
                              {uploadingId ? (
                                <div className="h-4 w-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 text-brand-gold" />
                              )}
                            </div>
                            <p className="text-xs font-medium text-brand-dark">
                              {uploadingId ? t("step1.uploading") : t("step1.uploadPrompt")}
                            </p>
                            <p className="text-[11px] text-brand-grayMed mt-0.5">
                              {t("step1.uploadFormats")}
                            </p>
                          </div>
                        )}
                      </div>
                      {errors.idDocument && <p className="text-xs text-red-500">{errors.idDocument}</p>}
                    </div>

                    {/* Service & Price Banner */}
                    <div className="rounded-xl bg-brand-off p-5 border border-brand-gold/30 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-brand-grayMed font-semibold">Selected Consultation</p>
                        <h4 className="text-base font-bold text-brand-dark mt-0.5">{serviceTitle}</h4>
                        <p className="text-xs text-brand-grayMed mt-1">60-minute confidential 1-on-1 session with tax advisor</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-brand-gold">€{svc.price.toFixed(2)}</span>
                        <p className="text-[11px] text-brand-grayMed">incl. VAT</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-brand-grayLight/30">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/${locale}/tax-advisory`)}
                        className="border-brand-grayLight/60 text-brand-dark hover:bg-brand-off"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" /> {t("step1.backToTaxAdvisory")}
                      </Button>
                      <Button
                        type="submit"
                        className="bg-brand-gold text-white hover:bg-brand-goldDark font-semibold px-6 shadow-sm"
                      >
                        {serviceId === "tax-return-preparation" ? t("taxPayerDetails.proceedToDocs") : t("taxPayerDetails.proceedToPayment")} <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Service Features Highlights */}
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {[
                  { icon: Clock, title: t("step1.feature60min"), desc: t("step1.feature60minDesc") },
                  { icon: Video, title: t("step1.featureVideo"), desc: t("step1.featureVideoDesc") },
                  { icon: Shield, title: t("step1.featureConfidential"), desc: t("step1.featureConfidentialDesc") },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="text-center p-6 rounded-2xl bg-white border border-brand-grayLight/30 shadow-sm">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10">
                      <Icon className="h-6 w-6 text-brand-gold" />
                    </div>
                    <h3 className="mb-1 text-base font-bold text-brand-dark">{title}</h3>
                    <p className="text-xs text-brand-grayMed leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: Required Tax Documents                                   */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {step === "documents" && (
            <>
              <SectionHeading
                overline={t("docsStep.overline")}
                title={t("docsStep.title")}
                description={t("docsStep.description")}
              />

              {/* Quality & Efficiency Notice from Advensys PDF */}
              <div className="mt-8 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="text-xs sm:text-sm text-amber-900 space-y-1">
                    <p className="font-semibold">{t("docsStep.qualityNotice")}</p>
                    <p className="text-amber-700 text-xs italic">{t("docsStep.disclaimerNotice")}</p>
                  </div>
                </div>
              </div>

              <Card className="mt-6 border border-brand-grayLight/40 bg-white shadow-md rounded-2xl">
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleDocumentsSubmit} className="space-y-6">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-brand-grayLight/30 pb-3">
                        <div>
                          <Label className="text-brand-dark font-bold text-base block">{t("docsStep.checklistTitle")}</Label>
                          <p className="text-xs text-brand-grayMed mt-0.5">
                            {t("docsStep.checklistDesc")}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full self-start sm:self-auto">
                          {contact.hasRentedProperties === "yes" ? "27 Checklist Items" : "20 Checklist Items"}
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        {((t.raw("docsStep.items") as any[]) || [])
                          .filter((rawItem) => {
                            const item = typeof rawItem === "string" ? { num: "", title: rawItem, note: "" } : rawItem;
                            if (item.num?.startsWith("rp-") && contact.hasRentedProperties !== "yes") return false;
                            return true;
                          })
                          .map((rawItem, idx) => {
                          const item = typeof rawItem === "string" ? { num: String(idx + 1), title: rawItem, note: "" } : rawItem;
                          const itemKey = item.num || String(idx);
                          const uploadedDoc = getTaxDoc(itemKey, idx);
                          const isUploading = uploadingDocKey === itemKey;
                          const isIdItem = item.num === "0";

                          return (
                            <div
                              key={itemKey}
                              className={`p-4 rounded-xl border transition-all shadow-2xs ${
                                uploadedDoc || (isIdItem && contact.idDocumentName)
                                  ? "border-emerald-300 bg-emerald-50/20"
                                  : "border-brand-grayLight/60 bg-white hover:border-brand-gold/50"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold/15 text-[11px] font-bold text-brand-goldDark flex-shrink-0 mt-0.5">
                                    {item.num}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-semibold text-brand-dark leading-snug">
                                      {item.title}
                                    </p>
                                    {item.note && (
                                      <p className="text-[11px] text-brand-grayMed mt-1 leading-relaxed">
                                        {item.note}
                                      </p>
                                    )}

                                    {/* Item 0: ID Document status from Step 1 */}
                                    {isIdItem && contact.idDocumentName && !uploadedDoc && (
                                      <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1.5">
                                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                                        <span>{t("docsStep.uploadedInStep1")}: <strong className="font-semibold">{contact.idDocumentName}</strong></span>
                                      </p>
                                    )}

                                    {/* Uploaded file confirmation */}
                                    {uploadedDoc && (
                                      <p className="text-[11px] text-emerald-700 font-semibold truncate mt-1.5 flex items-center gap-1.5">
                                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                                        <span>{uploadedDoc.name}</span>
                                      </p>
                                    )}

                                    {/* Extra Specific Input (e.g. occupancy date, construction date, dossier no) */}
                                    {item.extraField === "firstOccupancyDate" && (
                                      <div className="mt-3 pt-2.5 border-t border-brand-grayLight/40 flex flex-col sm:flex-row sm:items-center gap-2">
                                        <Label className="text-xs font-semibold text-red-600 whitespace-nowrap">
                                          {item.extraFieldLabel || t("docsStep.firstOccupancyLabel")}:
                                        </Label>
                                        <Input
                                          type="date"
                                          value={contact.firstOccupancyDate || ""}
                                          onChange={(e) => setContact(p => ({ ...p, firstOccupancyDate: e.target.value }))}
                                          className="h-8 text-xs bg-white max-w-xs"
                                        />
                                      </div>
                                    )}

                                    {item.extraField === "constructionCompletionDate" && (
                                      <div className="mt-3 pt-2.5 border-t border-brand-grayLight/40 flex flex-col sm:flex-row sm:items-center gap-2">
                                        <Label className="text-xs font-semibold text-brand-dark whitespace-nowrap">
                                          {item.extraFieldLabel || t("docsStep.constructionCompletionLabel")}:
                                        </Label>
                                        <Input
                                          placeholder="MM / YYYY"
                                          value={contact.constructionCompletionDate || ""}
                                          onChange={(e) => setContact(p => ({ ...p, constructionCompletionDate: e.target.value }))}
                                          className="h-8 text-xs bg-white max-w-xs"
                                        />
                                      </div>
                                    )}

                                    {item.extraField === "priorYearDossierNumber" && (
                                      <div className="mt-3 pt-2.5 border-t border-brand-grayLight/40 flex flex-col sm:flex-row sm:items-center gap-2">
                                        <Label className="text-xs font-semibold text-brand-dark whitespace-nowrap">
                                          {item.extraFieldLabel || t("docsStep.dossierNoLabel")}:
                                        </Label>
                                        <Input
                                          placeholder="e.g. 1985..."
                                          value={contact.priorYearDossierNumber || contact.dossierNumber || ""}
                                          onChange={(e) => setContact(p => ({ ...p, priorYearDossierNumber: e.target.value }))}
                                          className="h-8 text-xs bg-white max-w-xs"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-1 sm:pt-0">
                                  {uploadedDoc ? (
                                    <button
                                      type="button"
                                      onClick={() => setContact(p => {
                                        const docs = { ...(p.taxDocuments as any || {}) };
                                        delete docs[itemKey];
                                        return { ...p, taxDocuments: docs };
                                      })}
                                      className="text-xs text-red-500 hover:underline px-2 py-1"
                                    >
                                      {t("docsStep.remove")}
                                    </button>
                                  ) : null}

                                  <label className={`relative inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                                    uploadedDoc
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                                      : "bg-brand-off text-brand-dark border border-brand-grayLight/80 hover:bg-brand-gold/10 hover:border-brand-gold/60"
                                  }`}>
                                    <input
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => handleSingleTaxDocUpload(e, itemKey)}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      disabled={isUploading}
                                    />
                                    {isUploading ? (
                                      <span className="flex items-center gap-1.5">
                                        <span className="h-3 w-3 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                                        {t("docsStep.uploading")}
                                      </span>
                                    ) : uploadedDoc ? (
                                      t("docsStep.replace")
                                    ) : (
                                      <span className="flex items-center gap-1.5">
                                        <Upload className="h-3 w-3 text-brand-gold" />
                                        {isIdItem && contact.idDocumentName ? "Add Partner ID" : t("docsStep.uploadDoc")}
                                      </span>
                                    )}
                                  </label>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-brand-grayLight/30">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep("contact")}
                        className="border-brand-grayLight/60 text-brand-dark hover:bg-brand-off"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" /> {t("docsStep.backToDetails")}
                      </Button>
                      <Button
                        type="submit"
                        className="bg-brand-gold text-white hover:bg-brand-goldDark font-semibold px-6 shadow-sm"
                      >
                        {t("docsStep.proceedToPayment")} <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: Payment (Save to DB once done -> Proceed to Calendly)    */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {step === "payment" && (
            <>
              <SectionHeading
                overline="STEP 2 OF 3"
                title="Consultation Payment"
                description="Complete your secure payment. Once confirmed, you will pick your consultation time slot."
              />

              <div className="mt-8 grid gap-8 md:grid-cols-3">
                {/* Left: Booking & Client Summary */}
                <div className="md:col-span-1 space-y-4">
                  <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-grayMed">Consultation Details</h4>
                      <div>
                        <p className="font-bold text-brand-dark text-base">{serviceTitle}</p>
                        <p className="text-xs text-brand-grayMed mt-0.5">60 Minutes Session</p>
                      </div>

                      <div className="pt-3 border-t border-brand-grayLight/30 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-brand-grayMed">Fee (excl. VAT)</span>
                          <span className="font-medium text-brand-dark">€{(svc.price / 1.17).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-grayMed">VAT (17%)</span>
                          <span className="font-medium text-brand-dark">€{(svc.price - svc.price / 1.17).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-brand-grayLight/30 text-sm font-bold">
                          <span className="text-brand-dark">Total Amount</span>
                          <span className="text-brand-gold text-lg">€{svc.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-2xl">
                    <CardContent className="p-6 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-grayMed">Client Information</h4>
                      <div className="space-y-1.5 text-xs">
                        <p className="font-semibold text-brand-dark flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-brand-gold flex-shrink-0" /> {fullName}
                        </p>
                        <p className="text-brand-grayMed flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-brand-gold flex-shrink-0" /> {contact.email}
                        </p>
                        <p className="text-brand-grayMed flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-brand-gold flex-shrink-0" /> {contact.phone}
                        </p>
                        {contact.address && (
                          <p className="text-brand-grayMed flex items-start gap-2 pt-1 border-t border-brand-grayLight/20">
                            {contact.addressType === "residential" ? (
                              <Home className="h-3.5 w-3.5 text-brand-gold flex-shrink-0 mt-0.5" />
                            ) : (
                              <Building className="h-3.5 w-3.5 text-brand-gold flex-shrink-0 mt-0.5" />
                            )}
                            <span className="truncate">{contact.address}</span>
                          </p>
                        )}
                        {contact.idDocumentName && (
                          <p className="text-emerald-700 flex items-center gap-2 pt-1 border-t border-brand-grayLight/20 font-medium">
                            <FileText className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{contact.idDocumentName}</span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: PayPal Payment Box */}
                <div className="md:col-span-2">
                  <Card className="border border-brand-grayLight/40 bg-white shadow-md rounded-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="mb-6">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10 mb-3">
                          <CreditCard className="h-6 w-6 text-brand-gold" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-dark">Complete Secure Payment</h3>
                        <p className="text-xs text-brand-grayMed mt-1">
                          Pay securely via PayPal, Credit, or Debit card to confirm your booking.
                        </p>
                      </div>

                      {/* PayPal Button Container */}
                      <div className="max-w-md mx-auto my-4">
                        <PayPalButtons
                          amount={svc.price.toFixed(2)}
                          description={`${serviceTitle} – Opulanz Tax Advisory`}
                          onSuccess={(orderId, details) => {
                            handlePaymentSuccess(orderId, details);
                          }}
                        />
                      </div>

                      {isSavingPayment && (
                        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-brand-grayMed">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
                          <p className="font-medium text-brand-dark">Recording payment & preparing scheduler…</p>
                        </div>
                      )}

                      {!isSavingPayment && (
                        <div className="mt-6 flex justify-start border-t border-brand-grayLight/30 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setStep(serviceId === "tax-return-preparation" ? "documents" : "contact")}
                            className="border-brand-grayLight/60 text-brand-dark hover:bg-brand-off"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" /> {serviceId === "tax-return-preparation" ? t("paymentStep.backToDocs") : t("paymentStep.backToDetails")}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 3: Calendly Scheduling (After Payment)                      */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {step === "calendar" && (
            <>
              {/* Payment Success & Instruction Banner */}
              <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-base">Payment Confirmed (€{svc.price.toFixed(2)})</h3>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Confirmation #{confirmationNumber} • Please pick your date and time below to finalize your meeting.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-900">
                    Client: {fullName}
                  </div>
                </div>
              </div>

              <SectionHeading
                overline="STEP 3 OF 3"
                title="Select Consultation Date & Time"
                description={`Choose your preferred slot. A calendar invitation and Google Meet link will be generated automatically.`}
              />

              <Card className="mt-6 border border-brand-grayLight/40 bg-white shadow-md rounded-2xl overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  {!calendlyLoaded && (
                    <div className="flex h-96 flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-r-transparent" />
                      <p className="text-xs text-brand-grayMed">Loading Calendly calendar…</p>
                    </div>
                  )}
                  <div
                    key={locale}
                    className="calendly-inline-widget"
                    data-url={`${calendlyUrl}?hide_event_type_details=1&primary_color=b59354&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(contact.email)}`}
                    style={{ minWidth: "320px", height: "720px" }}
                  />
                </CardContent>
              </Card>

              {isSavingAppointment && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 text-center max-w-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold border-r-transparent" />
                    <p className="font-bold text-brand-dark">Saving Meeting Details…</p>
                    <p className="text-xs text-brand-grayMed">We are linking your scheduled slot with your booking record in our system.</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STEP 4: Confirmation & Receipt                                    */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {step === "confirmation" && (
            <>
              {/* Success Hero Badge */}
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold text-brand-dark">
                  {tConf("heroTitle")}
                </h2>
                <p className="text-brand-grayMed mt-1 text-sm max-w-lg mx-auto">
                  Your tax consultation has been booked, paid, and scheduled with our certified tax advisor.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-gold/10 border border-brand-gold/30 px-6 py-2">
                  <FileText className="h-4 w-4 text-brand-gold" />
                  <span className="font-mono text-sm font-bold text-brand-dark">
                    Confirmation #{confirmationNumber}
                  </span>
                </div>
              </div>

              {/* Full Summary Card */}
              <Card className="mb-6 border border-brand-grayLight/40 bg-white shadow-md rounded-2xl">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-lg font-bold text-brand-dark border-b border-brand-grayLight/30 pb-3">
                    Booking & Meeting Summary
                  </h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Contact details */}
                    <div className="rounded-xl bg-brand-off p-5 border border-brand-grayLight/30">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-grayMed mb-3">Client Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2.5">
                          <User className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="font-semibold text-brand-dark">{fullName}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Mail className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="text-brand-dark">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Phone className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="text-brand-dark">{contact.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment details */}
                    <div className="rounded-xl bg-brand-off p-5 border border-brand-grayLight/30">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-grayMed mb-3">Scheduled Consultation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="h-4 w-4 text-brand-gold flex-shrink-0" />
                          <span className="font-semibold text-brand-dark">
                            {dateStr || "Calendar Invitation Sent"}
                          </span>
                        </div>
                        {timeStr ? (
                          <div className="flex items-center gap-2.5">
                            <Clock className="h-4 w-4 text-brand-gold flex-shrink-0" />
                            <span className="text-brand-dark">{timeStr} · 60 Minutes</span>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2.5">
                          {calendly.isPhoneCall ? (
                            <>
                              <Phone className="h-4 w-4 text-brand-gold flex-shrink-0" />
                              <span className="text-xs text-brand-grayMed">
                                Phone consultation: our advisor will call {calendly.phoneNumber || contact.phone || "your phone"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Video className="h-4 w-4 text-brand-gold flex-shrink-0" />
                              <span className="text-xs text-brand-grayMed">
                                Meeting link sent to {contact.email}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Payment Status</span>
                        <h4 className="text-base font-bold text-emerald-950 mt-0.5">{serviceTitle}</h4>
                        {paypal.orderId && (
                          <p className="text-xs text-emerald-700 font-mono mt-0.5">PayPal Order ID: {paypal.orderId}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-emerald-800">€{svc.price.toFixed(2)}</span>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold justify-end mt-0.5">
                          <CheckCircle className="h-3.5 w-3.5" /> PAID (incl. VAT)
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid gap-4 sm:grid-cols-2 mb-8">
                <Button
                  onClick={handleDownloadReceipt}
                  className="h-12 bg-brand-gold text-white hover:bg-brand-goldDark font-semibold shadow-sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {tConf("downloadPDFReceipt")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${locale}/tax-advisory`)}
                  className="h-12 border-brand-grayLight/60 text-brand-dark hover:bg-white"
                >
                  {tConf("backToTaxAdvisory")}
                </Button>
              </div>

              {/* Next Steps Guide */}
              <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-base font-bold text-brand-dark flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-gold" />
                    {tConf("whatHappensNext.title")}
                  </h3>
                  <ul className="space-y-3">
                    {[
                      { title: tConf("whatHappensNext.step1.title"), desc: tConf("whatHappensNext.step1.description") },
                      { title: tConf("whatHappensNext.step2.title"), desc: tConf("whatHappensNext.step2.description") },
                      { title: tConf("whatHappensNext.step3.title"), desc: tConf("whatHappensNext.step3.description") },
                      { title: tConf("whatHappensNext.step4.title"), desc: tConf("whatHappensNext.step4.description") },
                    ].map(({ title, desc }, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs">
                        <div className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold/10 text-brand-goldDark font-bold mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-brand-dark">{title}</p>
                          <p className="text-brand-grayMed mt-0.5">{desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

        </div>
      </section>
    </>
  );
}
