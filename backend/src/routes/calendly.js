/**
 * Calendly API Proxy Routes
 *
 * Server-side proxy for Calendly API calls using the Personal Access Token.
 * The embed widget's postMessage events don't include start/end times,
 * so we fetch them from the Calendly REST API using the event URI.
 *
 * Endpoints:
 * - GET /api/calendly/event-details?event_uri=...  — Fetch scheduled event start/end time
 */

const express = require('express');
const router = express.Router();

const CALENDLY_API_BASE = 'https://api.calendly.com';

/**
 * GET /api/calendly/event-details
 *
 * Fetches the start_time, end_time, and location from the Calendly API
 * for a given scheduled event URI.
 *
 * Query params:
 * - event_uri: The full Calendly event URI (e.g. https://api.calendly.com/scheduled_events/UUID)
 *
 * Returns:
 * {
 *   success: true,
 *   data: {
 *     start_time: "2026-09-20T14:00:00.000000Z",
 *     end_time:   "2026-09-20T15:00:00.000000Z",
 *     name:       "Tax Advisory",
 *     status:     "active",
 *     location:   { type: "google_conference", join_url: "..." }
 *   }
 * }
 */
router.get('/event-details', async (req, res) => {
  try {
    const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({
        success: false,
        error: 'Calendly API token not configured',
      });
    }

    const { event_uri } = req.query;
    if (!event_uri) {
      return res.status(400).json({
        success: false,
        error: 'event_uri query parameter is required',
      });
    }

    // The event_uri is the full API URL, e.g.:
    // https://api.calendly.com/scheduled_events/UUID
    // We call it directly with our auth token.
    const apiUrl = event_uri.startsWith('http')
      ? event_uri
      : `${CALENDLY_API_BASE}/scheduled_events/${event_uri}`;

    console.log(`[Calendly] Fetching event details from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Calendly] API error ${response.status}: ${errorText}`);
      return res.status(response.status).json({
        success: false,
        error: `Calendly API returned ${response.status}`,
        details: errorText,
      });
    }

    const json = await response.json();
    const event = json.resource || json;

    // Optional: fetch invitee information to get phone number from invitee profile/questions
    let invitee = null;
    try {
      const inviteeUrl = req.query.invitee_uri || `${apiUrl}/invitees`;
      const invResponse = await fetch(inviteeUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (invResponse.ok) {
        const invJson = await invResponse.json();
        invitee = (invJson.collection && invJson.collection[0]) || invJson.resource || null;
      }
    } catch (invErr) {
      console.warn('[Calendly] Could not fetch invitee details:', invErr.message);
    }

    const location = event.location || null;
    const locationType = String(location?.type || '').toLowerCase();

    // Check for phone number from location or invitee
    let phoneNumber = '';
    if (['outbound_call', 'inbound_call', 'phone_call'].includes(locationType) || locationType.includes('call') || locationType.includes('phone')) {
      phoneNumber = location?.location || '';
    }
    if (!phoneNumber && invitee) {
      if (invitee.text_reminder_number) {
        phoneNumber = invitee.text_reminder_number;
      }
      if (!phoneNumber && Array.isArray(invitee.questions_and_answers)) {
        const phoneAnswer = invitee.questions_and_answers.find(
          qa => qa.question && /phone|mobile|tel|numéro|contact/i.test(qa.question)
        );
        if (phoneAnswer && phoneAnswer.answer) {
          phoneNumber = phoneAnswer.answer;
        }
      }
    }
    if (!phoneNumber && location?.location && /^[+\d\s().-]{7,}$/.test(String(location.location).trim())) {
      phoneNumber = String(location.location).trim();
    }

    // Determine if this event is a phone call
    const isPhoneCall = 
      ['outbound_call', 'inbound_call', 'phone_call'].includes(locationType) ||
      locationType.includes('call') ||
      locationType.includes('phone') ||
      (Boolean(location?.location) && !location?.join_url && /^[+\d\s().-]{7,}$/.test(String(location.location).trim())) ||
      (Boolean(phoneNumber) && locationType !== 'google_conference' && (!location?.join_url || !location.join_url.includes('meet.google.com')));

    const isGoogleMeet = 
      !isPhoneCall && (
        locationType === 'google_conference' ||
        Boolean(location?.join_url && location.join_url.includes('meet.google.com'))
      );

    const eventUuidMatch = apiUrl.match(/scheduled_events\/([a-f0-9\-]+)/i);
    const eventUuid = eventUuidMatch ? eventUuidMatch[1] : '';

    // If it's a phone call, google_meet_url and join_url MUST NOT be set to Google Meet
    const googleMeetUrl = isPhoneCall
      ? ''
      : (isGoogleMeet ? (location?.join_url || (eventUuid ? `https://calendly.com/events/${eventUuid}/google_meet` : '')) : '');

    const joinUrl = isPhoneCall ? '' : (location?.join_url || googleMeetUrl || '');

    const result = {
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      name: event.name || '',
      status: event.status || '',
      location: location,
      location_type: location?.type || (isPhoneCall ? 'outbound_call' : (isGoogleMeet ? 'google_conference' : '')),
      event_type: event.event_type || '',
      is_phone_call: isPhoneCall,
      is_google_meet: isGoogleMeet,
      phone_number: phoneNumber,
      google_meet_url: isPhoneCall ? null : (googleMeetUrl || null),
      join_url: isPhoneCall ? null : (joinUrl || null),
      invitee: invitee ? {
        name: invitee.name || '',
        email: invitee.email || '',
        text_reminder_number: invitee.text_reminder_number || '',
      } : null,
    };

    console.log(`[Calendly] Event details fetched: ${result.start_time} – ${result.end_time} (phone: ${isPhoneCall}, meet: ${isGoogleMeet})`);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Calendly] Error fetching event details:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
