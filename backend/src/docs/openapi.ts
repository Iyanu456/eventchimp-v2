/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Check API health
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: EventChimp API is healthy
 *
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration succeeded
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Account created successfully
 *               data:
 *                 user:
 *                   id: 6630f3e1c3d8f8b8c6d00001
 *                   name: Whitney Stone
 *                   email: whitney@example.com
 *                   role: organizer
 *                 token: eyJhbGciOi...
 *       400:
 *         description: Validation error
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       200:
 *         description: Login succeeded
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 user:
 *                   id: 6630f3e1c3d8f8b8c6d00001
 *                   name: Whitney Stone
 *                   email: whitney@example.com
 *                   role: organizer
 *                 token: eyJhbGciOi...
 *       401:
 *         description: Invalid credentials
 *
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the authenticated user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Profile fetched successfully
 *               data:
 *                 id: 6630f3e1c3d8f8b8c6d00001
 *                 name: Whitney Stone
 *                 email: whitney@example.com
 *                 role: organizer
 *                 provider: local
 *                 avatar: null
 *       401:
 *         description: Missing or invalid token
 *
 * /auth/google/initiate:
 *   get:
 *     tags: [Auth]
 *     summary: Get the Google OAuth consent URL
 *     responses:
 *       200:
 *         description: Consent URL generated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Google auth URL created
 *               data:
 *                 authUrl: https://accounts.google.com/o/oauth2/v2/auth?client_id=...
 *
 * /auth/google/callback:
 *   post:
 *     tags: [Auth]
 *     summary: Complete Google OAuth login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleCallbackRequest'
 *     responses:
 *       200:
 *         description: Google login succeeded
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Google authentication completed
 *               data:
 *                 user:
 *                   id: 6630f3e1c3d8f8b8c6d00002
 *                   name: Janet Events
 *                   email: janet@example.com
 *                   role: organizer
 *                   provider: google
 *                 token: eyJhbGciOi...
 *
 * /events:
 *   get:
 *     tags: [Events]
 *     summary: Browse published events
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Free-text event search
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by event status
 *     responses:
 *       200:
 *         description: Event list returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Events fetched successfully
 *               data:
 *                 events:
 *                   - id: 6630f3e1c3d8f8b8c6d00011
 *                     title: Summer Gala
 *                     slug: summer-gala
 *                     category: Arts & Culture
 *                     location: Times Square, New York
 *                     startDate: 2026-08-24T11:00:00.000Z
 *                     endDate: 2026-08-24T15:00:00.000Z
 *                     isFree: false
 *                     ticketPrice: 10000
 *                     attendeesCount: 220
 *                 total: 1
 *                 page: 1
 *                 limit: 12
 *   post:
 *     tags: [Events]
 *     summary: Create a new event
 *     description: Requires a verified organizer payout profile and organizer or admin access.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/EventInput'
 *               - type: object
 *                 properties:
 *                   coverImage:
 *                     type: string
 *                     format: binary
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       201:
 *         description: Event created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Event created successfully
 *               data:
 *                 id: 6630f3e1c3d8f8b8c6d00011
 *                 title: West African Architecture Summit
 *                 slug: west-african-architecture-summit
 *                 status: published
 *                 payoutReady: true
 *                 accessStatus: active
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Organizer payout profile is not verified
 *
 * /events/featured:
 *   get:
 *     tags: [Events]
 *     summary: Get featured and trending events
 *     responses:
 *       200:
 *         description: Featured events returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Featured events fetched successfully
 *               data:
 *                 trending:
 *                   - slug: summer-gala
 *                     title: Summer Gala
 *                 featured:
 *                   - slug: ifasa-book-review
 *                     title: IFASA Book Review
 *
 * /events/slug/{slug}:
 *   get:
 *     tags: [Events]
 *     summary: Get a public event by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Event fetched successfully
 *               data:
 *                 id: 6630f3e1c3d8f8b8c6d00011
 *                 title: IFASA Book Review
 *                 slug: ifasa-book-review
 *                 description: "<p>Join us for a thoughtful review session.</p>"
 *                 location: Times Square, New York
 *                 ticketTiers:
 *                   - id: regular
 *                     name: Regular
 *                     price: 0
 *                     quantity: 300
 *       404:
 *         description: Event not found
 *
 * /events/{id}:
 *   patch:
 *     tags: [Events]
 *     summary: Update an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/EventInput'
 *               - type: object
 *                 properties:
 *                   coverImage:
 *                     type: string
 *                     format: binary
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventInput'
 *     responses:
 *       200:
 *         description: Event updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Event updated successfully
 *               data:
 *                 id: 6630f3e1c3d8f8b8c6d00011
 *                 title: West African Architecture Summit
 *                 category: Education
 *                 accessStatus: active
 *   delete:
 *     tags: [Events]
 *     summary: Delete an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Event deleted successfully
 *               data: null
 *       404:
 *         description: Event not found
 *
 * /events/{id}/messages:
 *   get:
 *     tags: [Events]
 *     summary: Get an event discussion feed
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event messages returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Event messages fetched successfully
 *               data:
 *                 - id: 6630f3e1c3d8f8b8c6d00100
 *                   guestName: Janet
 *                   content: Looking forward to it
 *                   createdAt: 2026-05-05T09:15:00.000Z
 *   post:
 *     tags: [Events]
 *     summary: Post a message to an event discussion feed
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventMessageRequest'
 *     responses:
 *       201:
 *         description: Event message created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Event message posted
 *               data:
 *                 id: 6630f3e1c3d8f8b8c6d00101
 *                 guestName: Janet
 *                 content: Can’t wait for this event.
 *
 * /events/{eventId}/collaborators:
 *   get:
 *     tags: [Event Operations]
 *     summary: List collaborators for an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collaborator list returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Event collaborators fetched successfully
 *               data:
 *                 collaborators:
 *                   - userId: 6630f3e1c3d8f8b8c6d00001
 *                     name: Whitney Stone
 *                     email: whitney@example.com
 *                     role: owner
 *                 invitations:
 *                   - email: scanner@example.com
 *                     role: scanner
 *                     status: pending
 *
 * /events/{eventId}/collaborators/invite:
 *   post:
 *     tags: [Event Operations]
 *     summary: Invite an event collaborator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CollaboratorInviteRequest'
 *     responses:
 *       200:
 *         description: Invitation sent
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Collaborator invitation sent successfully
 *               data:
 *                 invitation:
 *                   email: manager@example.com
 *                   role: manager
 *                   status: pending
 *                   token: evt_inv_xxx
 *
 * /events/invitations/{token}/accept:
 *   post:
 *     tags: [Event Operations]
 *     summary: Accept an event invitation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation accepted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Invitation accepted successfully
 *               data:
 *                 eventId: 6630f3e1c3d8f8b8c6d00011
 *                 role: scanner
 *
 * /events/{eventId}/metrics:
 *   get:
 *     tags: [Event Operations]
 *     summary: Get event metrics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event metrics returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Event metrics fetched successfully
 *               data:
 *                 totalTicketsSold: 158
 *                 totalOrders: 102
 *                 grossRevenue: 1580000
 *                 organizerNetRevenue: 1500000
 *                 serviceFees: 80000
 *                 checkIns: 74
 *                 checkInRate: 46.84
 *                 refunds: 2
 *                 ticketTierBreakdown:
 *                   - tierId: vip
 *                     tierName: VIP
 *                     sold: 48
 *                 salesTimeline:
 *                   - date: 2026-05-01
 *                     orders: 8
 *                     revenue: 80000
 *
 * /events/{eventId}/settings:
 *   patch:
 *     tags: [Event Operations]
 *     summary: Update event operational settings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventSettingsRequest'
 *     responses:
 *       200:
 *         description: Event settings updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Event settings updated successfully
 *               data:
 *                 id: 6630f3e1c3d8f8b8c6d00011
 *                 accessStatus: suspended
 *                 suspensionReason: Compliance review
 *
 * /events/{eventId}/tickets/scan:
 *   post:
 *     tags: [Event Operations]
 *     summary: Scan a ticket QR token for validation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScanTicketRequest'
 *     responses:
 *       200:
 *         description: Ticket scan result returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Ticket scan completed
 *               data:
 *                 valid: true
 *                 alreadyCheckedIn: false
 *                 ticketCode: EVT-IFASA-00023
 *                 attendeeName: Whitney Stone
 *                 tierName: VIP
 *
 * /events/{eventId}/tickets/check-in:
 *   post:
 *     tags: [Event Operations]
 *     summary: Check in a scanned ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScanTicketRequest'
 *     responses:
 *       200:
 *         description: Ticket checked in
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Ticket checked in successfully
 *               data:
 *                 ticketCode: EVT-IFASA-00023
 *                 status: checked_in
 *                 checkedInAt: 2026-05-05T10:15:00.000Z
 *
 * /payments/quote:
 *   post:
 *     tags: [Payments]
 *     summary: Compute a server-side payment quote
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutQuoteRequest'
 *     responses:
 *       200:
 *         description: Pricing quote returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Checkout quote fetched successfully
 *               data:
 *                 ticketSubtotal: 10000
 *                 organizerNetAmount: 10000
 *                 estimatedTransactionFee: 250
 *                 estimatedTransferFee: 0
 *                 estimatedStampDuty: 0
 *                 platformMargin: 400
 *                 serviceFee: 650
 *                 buyerTotal: 10650
 *
 * /payments/checkout:
 *   post:
 *     tags: [Payments]
 *     summary: Create a canonical checkout order and initialize payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutInitializeRequest'
 *     responses:
 *       201:
 *         description: Checkout created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Checkout initialized successfully
 *               data:
 *                 orderId: 6630f3e1c3d8f8b8c6d01001
 *                 reference: ord_1777395055704_9w6goe
 *                 mode: paystack
 *                 authorizationUrl: https://checkout.paystack.com/abc123
 *                 pricing:
 *                   ticketSubtotal: 10000
 *                   serviceFee: 650
 *                   buyerTotal: 10650
 *       400:
 *         description: Invalid checkout payload
 *
 * /payments/verify/{reference}:
 *   get:
 *     tags: [Payments]
 *     summary: Verify a payment using its reference
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification completed
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Checkout verified successfully
 *               data:
 *                 orderReference: ord_1777395055704_9w6goe
 *                 paymentStatus: paid
 *                 fulfillmentStatus: fulfilled
 *                 ticketsIssued: 2
 *
 * /payments/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify a payment using a request body
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyReferenceRequest'
 *     responses:
 *       200:
 *         description: Verification completed
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Checkout verified successfully
 *               data:
 *                 orderReference: ord_1777395055704_9w6goe
 *                 paymentStatus: paid
 *                 fulfillmentStatus: fulfilled
 *
 * /payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Receive Paystack webhook events
 *     description: This endpoint expects a raw JSON payload and Paystack signature headers.
 *     responses:
 *       200:
 *         description: Webhook accepted
 *         content:
 *           application/json:
 *             example:
 *               received: true
 *
 * /checkout/quote:
 *   post:
 *     tags: [Checkout]
 *     summary: Compatibility pricing quote endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutQuoteRequest'
 *     responses:
 *       200:
 *         description: Pricing quote returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Checkout quote fetched successfully
 *               data:
 *                 buyerTotal: 0
 *                 serviceFee: 0
 *                 organizerNetAmount: 0
 *
 * /checkout/initialize:
 *   post:
 *     tags: [Checkout]
 *     summary: Compatibility checkout initialization endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutInitializeRequest'
 *     responses:
 *       201:
 *         description: Checkout initialized
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Checkout initialized successfully
 *               data:
 *                 reference: ord_free_1777395055704
 *                 mode: free
 *                 pricing:
 *                   buyerTotal: 0
 *
 * /checkout/verify:
 *   post:
 *     tags: [Checkout]
 *     summary: Compatibility checkout verification endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyReferenceRequest'
 *     responses:
 *       200:
 *         description: Verification completed
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Checkout verified successfully
 *               data:
 *                 paymentStatus: paid
 *                 fulfillmentStatus: fulfilled
 *
 * /checkout/verify/{reference}:
 *   get:
 *     tags: [Checkout]
 *     summary: Compatibility checkout verification endpoint with path reference
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification completed
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Checkout verified successfully
 *               data:
 *                 paymentStatus: paid
 *                 fulfillmentStatus: fulfilled
 *
 * /checkout/webhook:
 *   post:
 *     tags: [Checkout]
 *     summary: Compatibility Paystack webhook endpoint
 *     responses:
 *       200:
 *         description: Webhook accepted
 *         content:
 *           application/json:
 *             example:
 *               received: true
 *
 * /tickets/me:
 *   get:
 *     tags: [Tickets]
 *     summary: Get the authenticated user's tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Tickets fetched successfully
 *               data:
 *                 - ticketCode: EVT-IFASA-00023
 *                   status: issued
 *                   eventTitle: IFASA Book Review
 *                   qrToken: qr_4i18j4bk5
 *
 * /tickets/event/{eventId}:
 *   get:
 *     tags: [Tickets]
 *     summary: Get an event guest list
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guest list returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Guest list fetched successfully
 *               data:
 *                 guests:
 *                   - name: Whitney Stone
 *                     email: whitney@example.com
 *                     ticketCode: EVT-IFASA-00023
 *                     status: issued
 *
 * /tickets/{ticketId}/check-in:
 *   patch:
 *     tags: [Tickets]
 *     summary: Check in a ticket by ticket id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket checked in
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Guest checked in successfully
 *               data:
 *                 ticketCode: EVT-IFASA-00023
 *                 status: checked_in
 *
 * /dashboard/organizer:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get organizer dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard payload returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Organizer dashboard fetched successfully
 *               data:
 *                 overview:
 *                   totalTicketsSold: 1580
 *                   totalRevenue: 47699.75
 *                 recentTransactions:
 *                   - reference: ord_1777395055704_9w6goe
 *                     amount: 10650
 *                     status: success
 *
 * /organizer/banks:
 *   get:
 *     tags: [Organizer]
 *     summary: List supported payout banks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Supported banks returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Payout banks fetched successfully
 *               data:
 *                 - name: Guaranty Trust Bank
 *                   code: 058
 *                 - name: Access Bank
 *                   code: 044
 *
 * /organizer/payout-status:
 *   get:
 *     tags: [Organizer]
 *     summary: Get organizer payout setup status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payout status returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Payout status fetched successfully
 *               data:
 *                 payoutReady: true
 *                 payoutStatus: verified
 *                 bankCode: 058
 *                 accountNumber: "0123456789"
 *                 accountName: Whitney Stone Ventures
 *
 * /organizer/resolve-account:
 *   post:
 *     tags: [Organizer]
 *     summary: Resolve a bank account name before saving payout details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayoutProfileRequest'
 *     responses:
 *       200:
 *         description: Account resolved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Payout account resolved successfully
 *               data:
 *                 accountName: Whitney Stone Ventures
 *                 accountNumber: "0123456789"
 *                 bankCode: "058"
 *
 * /organizer/payout-profile:
 *   post:
 *     tags: [Organizer]
 *     summary: Create or update the organizer payout profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayoutProfileRequest'
 *     responses:
 *       201:
 *         description: Payout profile saved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Payout profile saved successfully
 *               data:
 *                 payoutStatus: verified
 *                 payoutReady: true
 *                 subaccountCode: ACCT_123456
 *
 * /organizer/settings:
 *   patch:
 *     tags: [Organizer]
 *     summary: Update organizer account notification settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizerSettingsRequest'
 *     responses:
 *       200:
 *         description: Organizer settings updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Organizer settings updated successfully
 *               data:
 *                 organizerNotifications:
 *                   ticketPurchaseEmail: true
 *
 * /refunds:
 *   post:
 *     tags: [Refunds]
 *     summary: Create a refund request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefundRequest'
 *     responses:
 *       201:
 *         description: Refund request created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Refund created successfully
 *               data:
 *                 orderReference: ord_1777395055704_9w6goe
 *                 status: requested
 *                 includeServiceFee: false
 *
 * /branding/templates:
 *   get:
 *     tags: [Branding Kit]
 *     summary: Get branding kit template previews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Branding templates returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Branding templates fetched successfully
 *               data:
 *                 templates:
 *                   - type: instagram_frame
 *                     previewUrl: https://res.cloudinary.com/demo/image/upload/frame.png
 *   post:
 *     tags: [Branding Kit]
 *     summary: Upsert branding metadata for a generated asset
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BrandingMetadataRequest'
 *     responses:
 *       201:
 *         description: Branding metadata saved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Branding metadata saved successfully
 *               data:
 *                 type: instagram_frame
 *                 accentColor: "#4F46E5"
 *
 * /admin/overview:
 *   get:
 *     tags: [Admin]
 *     summary: Get platform-wide admin overview metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin overview returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Admin overview fetched successfully
 *               data:
 *                 users: 420
 *                 events: 128
 *                 grossVolume: 12450000
 *
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List platform users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin users returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Admin users fetched successfully
 *               data:
 *                 users:
 *                   - id: 6630f3e1c3d8f8b8c6d00001
 *                     name: Whitney Stone
 *                     email: whitney@example.com
 *                     role: organizer
 *
 * /admin/events:
 *   get:
 *     tags: [Admin]
 *     summary: List platform events for review
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin events returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Admin events fetched successfully
 *               data:
 *                 events:
 *                   - id: 6630f3e1c3d8f8b8c6d00011
 *                     title: Summer Gala
 *                     accessStatus: active
 *
 * /admin/transactions:
 *   get:
 *     tags: [Admin]
 *     summary: List platform transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin transactions returned
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Admin transactions fetched successfully
 *               data:
 *                 transactions:
 *                   - reference: ord_1777395055704_9w6goe
 *                     amount: 10650
 *                     status: success
 *
 * /admin/events/{id}/suspend:
 *   patch:
 *     tags: [Admin]
 *     summary: Suspend or reactivate an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSuspendEventRequest'
 *     responses:
 *       200:
 *         description: Event review status updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Admin event access updated successfully
 *               data:
 *                 id: 6630f3e1c3d8f8b8c6d00011
 *                 accessStatus: suspended
 *                 suspensionReason: Chargeback investigation
 *
 * /admin/organizers/{userId}/review:
 *   patch:
 *     tags: [Admin]
 *     summary: Review an organizer payout and risk profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminOrganizerReviewRequest'
 *     responses:
 *       200:
 *         description: Organizer review updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Organizer review updated successfully
 *               data:
 *                 userId: 6630f3e1c3d8f8b8c6d00001
 *                 payoutStatus: verified
 *                 riskStatus: clear
 */
export const openApiDocsLoaded = true;
