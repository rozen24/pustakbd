# MASTER E-COMMERCE MARKETPLACE QA & TESTING PROMPT

You are a senior QA engineer, automation engineer, security tester, API tester, database tester, and DevOps engineer.

I am developing a large-scale Alibaba-style B2B multi-vendor e-commerce marketplace.

The technology stack is:

Frontend:

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router
* TanStack Query
* React Hook Form
* Zod
* Axios

Backend:

* Node.js
* Express.js
* TypeScript
* Prisma ORM

Database:

* PostgreSQL or MySQL

Other systems:

* JWT authentication
* Refresh tokens
* Email verification
* OTP
* Google OAuth
* File/image uploads
* Supplier verification
* Shopping cart
* Checkout
* Orders
* Payments
* Bangladesh payment gateway
* RFQ
* Supplier quotations
* Reviews
* Wishlist
* Product comparison
* Messaging/chat
* Notifications
* Coupons
* Wallet
* Supplier commission
* Admin dashboard
* Reports
* SEO
* CMS
* Shipping
* Refunds
* Disputes

The platform has these roles:

1. Guest
2. Buyer
3. Supplier
4. Admin
5. Super Admin
6. Moderator
7. Support Staff
8. Delivery Staff

==================================================

1. PRIMARY TESTING OBJECTIVE
   ==================================================

Perform a complete end-to-end quality audit of the application.

Do not only test whether the UI works.

Test:

* UI
* UX
* Frontend logic
* Backend APIs
* Database
* Authentication
* Authorization
* Business logic
* Payments
* Orders
* Inventory
* Supplier workflows
* Buyer workflows
* Admin workflows
* Notifications
* Emails
* File uploads
* Search
* Filters
* Pagination
* Security
* Performance
* Accessibility
* Responsive design
* SEO
* Error handling
* Data consistency
* Concurrency
* Race conditions
* Deployment configuration

Do not assume that a feature works because the page exists.

Every feature must be tested through its complete workflow.

==================================================
2. TESTING METHODOLOGY
======================

Use the following testing levels:

A. Unit Testing
B. Component Testing
C. Integration Testing
D. API Testing
E. Database Testing
F. End-to-End Testing
G. Regression Testing
H. Security Testing
I. Performance Testing
J. Accessibility Testing
K. Responsive Testing
L. User Acceptance Testing
M. Deployment Testing

For every discovered feature, create:

* Positive test cases
* Negative test cases
* Boundary test cases
* Validation test cases
* Permission test cases
* Failure/recovery test cases
* Security test cases

==================================================
3. TEST ENVIRONMENT
===================

Create a dedicated test environment.

Use:

* TEST database
* TEST API server
* TEST frontend
* TEST email service
* TEST storage
* TEST payment sandbox
* TEST SMS/OTP provider if available

Never run destructive tests against production.

Use environment variables:

DATABASE_URL
JWT_SECRET
REFRESH_TOKEN_SECRET
SMTP_HOST
SMTP_USER
SMTP_PASSWORD
PAYMENT_API_KEY
PAYMENT_STORE_ID
PAYMENT_SECRET
STORAGE_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

Make sure production credentials are never used in tests.

==================================================
4. TEST DATA
============

Create realistic test data.

Create:

100 buyers

50 suppliers

10 admins/moderators/support users

20 categories

100 subcategories

500 products

1000 product variants

1000 product images

100 test orders

50 RFQs

200 quotations

100 reviews

100 coupons

20 shipping zones

20 warehouses

10 brands

Test different product types:

* Simple product
* Variable product
* Physical product
* Digital product
* Wholesale product
* MOQ product
* Product with discounts
* Product without inventory
* Product with multiple variants

==================================================
5. AUTHENTICATION TESTING
=========================

Test:

Registration

Login

Logout

Email verification

OTP verification

Forgot password

Reset password

Change password

Change email

Change phone

Remember session

Refresh token

Access token expiration

Session expiration

Multiple devices

Account deletion

Account recovery

Google OAuth

Test invalid:

Email

Password

OTP

Token

Refresh token

Verification link

Expired link

Expired OTP

Test:

* Brute force protection
* Rate limiting
* Account lockout
* Session invalidation
* Token rotation

Verify that passwords are never stored as plain text.

==================================================
6. ROLE & PERMISSION TESTING
============================

Test every role.

Guest:

* Browse products
* Search
* View suppliers
* View categories
* Register
* Login

Buyer:

* Cart
* Checkout
* Orders
* Reviews
* RFQ
* Wishlist
* Messages
* Profile

Supplier:

* Products
* Inventory
* Orders
* RFQ
* Quotations
* Customers
* Analytics
* Wallet

Moderator:

* Product moderation
* Review moderation
* Supplier moderation

Support:

* Tickets
* Customer support
* Order support

Delivery:

* Assigned orders
* Delivery status
* Tracking

Admin:

* Full management

Super Admin:

* System-level permissions

Attempt unauthorized API calls.

Example:

Buyer attempts:

DELETE /api/products/:id

Supplier attempts:

GET /api/admin/users

Guest attempts:

GET /api/admin/orders

These must return proper authorization errors.

Do not rely only on frontend route protection.

Authorization must also be enforced on the backend.

==================================================
7. HOMEPAGE TESTING
===================

Test:

Hero slider

Search bar

Category navigation

Popular categories

Featured products

Trending products

Flash deals

Top suppliers

Featured brands

Recently viewed

Recommended products

Testimonials

Footer

Newsletter

Verify:

* Correct links
* Images load
* Lazy loading
* Responsive layout
* No broken images
* No layout shifts
* Correct API data
* Empty states
* Loading states
* Error states

==================================================
8. SEARCH TESTING
=================

Test:

Exact search

Partial search

Case-insensitive search

Typo search

Bangla search

English search

SKU search

Brand search

Supplier search

Category search

Multi-word search

Special characters

Empty search

Very long search

SQL injection attempts

XSS payloads

Search suggestions

Search history

Popular searches

Autocomplete

Verify pagination.

Verify search relevance.

Test 0 results.

Test thousands of results.

==================================================
9. CATEGORY TESTING
===================

Test:

Create category

Update category

Delete category

Subcategory

Nested categories

Category images

Category SEO

Category sorting

Category visibility

Category product count

Prevent invalid parent-child relationships.

Prevent deletion of categories that contain products unless properly handled.

==================================================
10. PRODUCT TESTING
===================

Create products with:

* Name
* Description
* SKU
* Category
* Brand
* Images
* Video
* Price
* Wholesale price
* MOQ
* Inventory
* Variants
* Specifications
* Shipping information
* SEO metadata

Test:

Create

Read

Update

Delete

Publish

Unpublish

Draft

Duplicate

Bulk import

Bulk update

Bulk delete

Excel import

Excel export

Image upload

Multiple images

Image deletion

Image replacement

Product variants

SKU uniqueness

Inventory validation

Price validation

MOQ validation

==================================================
11. PRODUCT VARIANT TESTING
===========================

Test:

Color

Size

Material

Weight

Custom attributes

Multiple combinations.

Example:

Red + Small

Red + Medium

Red + Large

Blue + Small

Blue + Medium

Blue + Large

Verify:

* Unique SKU
* Individual stock
* Individual price
* Individual image
* Variant selection
* Out-of-stock handling

==================================================
12. INVENTORY TESTING
=====================

Test:

Stock increase

Stock decrease

Stock reservation

Order cancellation

Refund

Order completion

Low-stock notification

Out-of-stock

Backorder

Concurrent orders

Test two users purchasing the final item simultaneously.

Inventory must never become negative.

Use database transactions/locking where necessary.

==================================================
13. PRODUCT DETAILS PAGE
========================

Test:

Gallery

Zoom

Video

Specifications

Variants

Quantity

Price

MOQ

Wishlist

Compare

Share

Reviews

Questions

Supplier information

RFQ

Chat

Add to cart

Buy now

Download documents

Verify all buttons and links.

==================================================
14. CART TESTING
================

Test:

Add item

Remove item

Increase quantity

Decrease quantity

Update quantity

Multiple products

Multiple suppliers

Multiple variants

Out-of-stock product

Price changes

Inventory changes

Expired product

Coupon

Shipping fee

Tax

Subtotal

Grand total

Refresh browser.

Logout/login.

Cart persistence.

Test duplicate products.

==================================================
15. CHECKOUT TESTING
====================

Test:

Guest checkout if supported

Logged-in checkout

Address creation

Address editing

Address deletion

Billing address

Shipping address

Shipping method

Coupon

Tax

Discount

Shipping cost

Order summary

Payment selection

Terms acceptance

Order confirmation

Prevent checkout when:

* Product unavailable
* Quantity exceeds stock
* Product deleted
* Supplier disabled
* Invalid coupon
* Invalid address
* Invalid payment method

==================================================
16. PAYMENT TESTING
===================

Integrate Bangladesh payment gateways in SANDBOX mode.

Test:

Successful payment

Failed payment

Cancelled payment

Expired payment

Duplicate callback

Delayed callback

Invalid callback

Wrong amount

Wrong currency

Tampered transaction ID

Payment timeout

Network failure

User closes browser during payment

User returns from gateway

Webhook/callback processing

Verify:

Payment status

Order status

Transaction status

Gateway reference

Invoice

Payment logs

Never mark an order as paid only because the frontend says payment succeeded.

Payment must be verified server-side.

Test webhook signature validation.

Test duplicate webhook events.

Payment processing must be idempotent.

==================================================
17. ORDER TESTING
=================

Test complete lifecycle:

Pending

Payment Processing

Paid

Confirmed

Processing

Packed

Shipped

Out for Delivery

Delivered

Completed

Cancelled

Refund Requested

Refunded

Disputed

Verify valid and invalid status transitions.

Example:

Delivered → Pending

must not be allowed.

==================================================
18. MULTI-VENDOR ORDER TESTING
==============================

Create a cart containing products from:

Supplier A

Supplier B

Supplier C

Checkout once.

Verify whether the system correctly creates:

Parent Order

Supplier Order A

Supplier Order B

Supplier Order C

Test:

Separate shipping

Separate status

Supplier-specific commission

Supplier-specific invoice

Supplier-specific cancellation

Supplier-specific refund

==================================================
19. SUPPLIER TESTING
====================

Supplier registration.

Supplier profile.

Company information.

Trade license.

Business documents.

Verification.

Approval.

Rejection.

Suspension.

Reactivation.

Supplier products.

Supplier orders.

Supplier customers.

Supplier analytics.

Supplier wallet.

Supplier withdrawals.

Supplier commission.

Supplier ratings.

Supplier reviews.

Test suppliers with:

* Pending verification
* Verified
* Rejected
* Suspended

Suspended suppliers must not be able to sell.

==================================================
20. RFQ TESTING
===============

Buyer creates RFQ.

Example:

Product:
Cotton T-Shirt

Quantity:
10,000

Target price:
$2

Delivery:
30 days

Suppliers receive RFQ.

Supplier submits quotation.

Buyer receives quotation.

Buyer compares quotations.

Buyer accepts quotation.

Create order from accepted quotation.

Test:

* Edit RFQ
* Cancel RFQ
* Supplier decline
* Quotation expiration
* Multiple quotations
* Counter offer
* Attachment
* Negotiation

==================================================
21. WISHLIST TESTING
====================

Test:

Add

Remove

Duplicate

Login persistence

Product deleted

Supplier disabled

Out-of-stock

Move wishlist item to cart.

==================================================
22. PRODUCT COMPARISON
======================

Compare multiple products.

Verify:

* Specifications
* Price
* Rating
* Supplier
* MOQ
* Stock

Prevent incompatible comparisons where necessary.

==================================================
23. REVIEW SYSTEM
=================

Only eligible buyers should review products.

Test:

Create review

Update review

Delete review

Image upload

Rating

Review moderation

Supplier reply

Helpful

Report

Fake review prevention

Duplicate review prevention

Verify review appears only after appropriate approval/status.

==================================================
24. COUPON SYSTEM
=================

Test:

Percentage discount

Fixed discount

Minimum order

Maximum discount

Expiry

Usage limit

Per-user limit

Product-specific

Category-specific

Supplier-specific

First-order coupon

Invalid coupon

Expired coupon

Already-used coupon

Coupon stacking

Prevent negative totals.

==================================================
25. SHIPPING TESTING
====================

Test:

Shipping zones

District

Upazila

Courier

Shipping fee

Free shipping

Weight-based shipping

Quantity-based shipping

Supplier-based shipping

Tracking number

Delivery status

Failed delivery

Returned order

==================================================
26. CHAT/MESSAGING
==================

Test:

Buyer ↔ Supplier

Buyer ↔ Support

Attachments

Images

PDF

Unread messages

Read status

Typing status

Online status

Message deletion

Blocked user

Notification

Test unauthorized access to another user's conversation.

==================================================
27. NOTIFICATION SYSTEM
=======================

Test:

Email

SMS

Browser notification

Push notification

In-app notification

Events:

Registration

Verification

Order

Payment

Shipment

Delivery

Refund

RFQ

Quotation

Message

Review

Supplier verification

Low stock

Withdrawal

Test:

Unread count

Mark read

Mark all read

Delete

Notification preferences

==================================================
28. ADMIN TESTING
=================

Test admin dashboard.

Statistics:

Users

Suppliers

Products

Orders

Revenue

Commission

Payments

Refunds

RFQs

Reviews

Tickets

Test every CRUD operation.

Test bulk actions.

Test filters.

Test search.

Test pagination.

Test exports.

Test admin permissions.

==================================================
29. FINANCIAL TESTING
=====================

Verify calculations.

Test:

Subtotal

Discount

Coupon

Tax

Shipping

Commission

Payment fee

Refund

Supplier earnings

Platform revenue

Wallet balance

Withdrawal

Use decimal-safe calculations.

Never use floating-point arithmetic for financial calculations without appropriate handling.

Test:

1 item

10 items

0 items

Large quantities

Very large amounts

Decimal prices

Refund partial amount

Full refund

==================================================
30. WALLET TESTING
==================

Supplier wallet.

Test:

Credit

Debit

Commission

Refund

Withdrawal

Withdrawal pending

Withdrawal approved

Withdrawal rejected

Balance history

Transaction history

Prevent:

Negative balance

Duplicate transaction

Unauthorized withdrawal

Tampering with amount

==================================================
31. FILE UPLOAD TESTING
=======================

Test:

JPG

PNG

WEBP

PDF

Large files

Small files

Invalid extensions

Executable files

Renamed executable files

Corrupted files

Multiple uploads

Delete

Replace

Verify:

MIME validation

File-size validation

Filename sanitization

Storage permissions

Virus/malware scanning if supported

Never trust client-side file extensions.

==================================================
32. SECURITY TESTING
====================

Perform security testing for:

SQL Injection

XSS

CSRF

IDOR

Broken access control

Privilege escalation

JWT attacks

Refresh-token attacks

Session fixation

Brute force

Rate-limit bypass

File upload vulnerabilities

Path traversal

Command injection

Open redirects

CORS misconfiguration

Security headers

Sensitive information exposure

API enumeration

Mass assignment

Parameter pollution

Webhook manipulation

Payment manipulation

Test APIs directly, not only through the UI.

==================================================
33. IDOR TESTING
================

Example:

User A:

GET /api/orders/100

User B attempts:

GET /api/orders/100

User B must not receive User A's order.

Repeat for:

Orders

Invoices

Messages

Addresses

Wishlist

RFQs

Payments

Wallet

Documents

Supplier information

==================================================
34. API TESTING
===============

For every endpoint test:

GET

POST

PUT

PATCH

DELETE

Test:

Valid request

Invalid request

Missing fields

Extra fields

Wrong data type

Unauthorized request

Forbidden request

Expired token

Malformed token

Invalid ID

Non-existent ID

Duplicate request

Very large payload

Empty payload

Rate limit

Server error

Verify HTTP status codes.

==================================================
35. DATABASE TESTING
====================

Verify:

Foreign keys

Indexes

Unique constraints

NOT NULL

Default values

Transactions

Cascade behavior

Soft delete

Data consistency

Orphan records

Duplicate records

Race conditions

Database migrations

Rollback

Backup

Restore

Test database after:

Order

Refund

Cancellation

Supplier deletion

Product deletion

User deletion

==================================================
36. PERFORMANCE TESTING
=======================

Test:

Homepage

Product listing

Search

Product page

Cart

Checkout

Admin dashboard

API response times

Test:

100 concurrent users

500 concurrent users

1,000 concurrent users

Large product catalog.

Measure:

Response time

CPU

RAM

Database load

Network

Error rate

Throughput

Identify slow queries.

Add indexes where appropriate.

==================================================
37. LOAD TESTING
================

Use tools such as:

k6

Artillery

Playwright

Postman/Newman

Test:

Login load

Search load

Product load

Cart load

Checkout load

Order creation load

Payment callback load

Concurrent inventory purchases

==================================================
38. RESPONSIVE TESTING
======================

Test:

320px

375px

390px

414px

768px

1024px

1280px

1440px

1920px

Devices:

Mobile

Tablet

Laptop

Desktop

Test:

Navigation

Menus

Search

Product cards

Tables

Forms

Dialogs

Checkout

Dashboard

Admin panel

==================================================
39. BROWSER TESTING
===================

Test:

Chrome

Firefox

Edge

Safari

Mobile Chrome

Mobile Safari

Test:

Login

Search

Cart

Checkout

Payment

Dashboard

Upload

Chat

==================================================
40. ACCESSIBILITY TESTING
=========================

Check:

Keyboard navigation

Focus state

Focus trapping

ARIA labels

Button labels

Form labels

Color contrast

Screen reader compatibility

Alt text

Heading hierarchy

Semantic HTML

Error messages

Accessible dialogs

WCAG compliance.

==================================================
41. SEO TESTING
===============

Test:

Title

Meta description

Canonical URL

Open Graph

Twitter cards

Schema.org

Product schema

Organization schema

Breadcrumb schema

Sitemap

Robots.txt

404

301 redirects

Clean URLs

Pagination SEO

Duplicate content

Image alt text

Page speed

Structured data validation.

==================================================
42. ERROR HANDLING
==================

Every page must have:

Loading state

Empty state

Error state

Success state

Retry option where appropriate

Test:

API unavailable

Database unavailable

Payment gateway unavailable

Storage unavailable

Email unavailable

Network disconnected

Timeout

Invalid response

Unexpected server error

Do not expose stack traces or secrets to users.

==================================================
43. UI/UX TESTING
=================

Check:

Consistent spacing

Typography

Buttons

Cards

Forms

Dropdowns

Dialogs

Toast notifications

Loading skeletons

Error messages

Empty states

Breadcrumbs

Pagination

Filters

Mobile navigation

Sticky elements

Hover states

Focus states

Disabled states

Animations

Make sure the interface feels like a professional B2B marketplace.

==================================================
44. ADMIN AUDIT LOG TESTING
===========================

Record important administrative actions.

Test:

Login

Product deletion

User suspension

Supplier approval

Order modification

Refund

Payment changes

Commission changes

Settings changes

Each audit log should contain:

User

Action

Target

Timestamp

IP if appropriate

Before/after values where appropriate.

==================================================
45. CONCURRENCY TESTING
=======================

This is extremely important.

Simulate:

Two users buying the final product.

Two users applying the same coupon.

Two payment callbacks arriving simultaneously.

Supplier updating inventory while buyer checks out.

Admin deleting product while buyer purchases it.

Two users submitting the same RFQ action.

Verify database consistency.

==================================================
46. BACKUP & RECOVERY TESTING
=============================

Test:

Database backup

Database restore

File backup

Restore files

Migration recovery

Server failure

Application restart

Database restart

Payment recovery

Order recovery

Verify that no critical data is lost.

==================================================
47. EMAIL TESTING
=================

Test:

Registration email

Verification email

Password reset

Order confirmation

Payment confirmation

Shipping notification

Delivery notification

Refund

RFQ

Quotation

Supplier approval

Supplier rejection

Withdrawal

Support ticket

Verify:

Subject

Sender

Recipient

HTML

Mobile layout

Links

Attachments

Unsubscribe/preferences where applicable.

==================================================
48. AUTOMATED E2E TESTING
=========================

Use Playwright.

Create complete workflows.

TEST 01:

Guest → Browse → Search → Product → Register

TEST 02:

Buyer → Login → Search → Product → Cart → Checkout

TEST 03:

Buyer → Payment → Order

TEST 04:

Supplier → Register → Verification → Add Product

TEST 05:

Supplier → Receive Order → Process → Ship

TEST 06:

Buyer → RFQ → Supplier quotation → Accept → Order

TEST 07:

Buyer → Order → Delivery → Review

TEST 08:

Buyer → Refund → Refund completion

TEST 09:

Admin → Approve Supplier

TEST 10:

Admin → Moderate Product

TEST 11:

Admin → Refund Order

TEST 12:

Supplier → Wallet → Withdrawal

==================================================
49. TEST CASE FORMAT
====================

Create a test case database/document using this structure:

Test ID

Module

Feature

Role

Precondition

Test Steps

Test Data

Expected Result

Actual Result

Status

Severity

Priority

Screenshot

API

Database Validation

Notes

Example:

TC-AUTH-001

Module:
Authentication

Feature:
Login

Role:
Buyer

Precondition:
Registered buyer exists

Steps:

1. Open login page
2. Enter email
3. Enter password
4. Click login

Expected:

User is authenticated and redirected to buyer dashboard.

Status:

PASS/FAIL

==================================================
50. BUG CLASSIFICATION
======================

Severity:

CRITICAL

HIGH

MEDIUM

LOW

Priority:

P0

P1

P2

P3

CRITICAL examples:

* Payment manipulation
* Data loss
* Unauthorized admin access
* Password exposure
* Order duplication
* Financial calculation error
* Supplier wallet corruption

HIGH:

* Checkout failure
* Login failure
* Product creation failure
* Order status corruption

MEDIUM:

* Filter failure
* Notification issue
* UI problems

LOW:

* Minor visual inconsistencies.

==================================================
51. TEST EXECUTION RULES
========================

Do not stop after finding one bug.

Continue testing the entire module.

When a bug is found:

1. Reproduce it.
2. Record exact steps.
3. Identify expected behavior.
4. Identify actual behavior.
5. Capture relevant logs.
6. Identify API involved.
7. Identify database table involved.
8. Determine severity.
9. Determine likely root cause.
10. Suggest a fix.
11. Retest after fixing.

Never mark a feature as PASS merely because the frontend displays correctly.

==================================================
52. REGRESSION TESTING
======================

After every major fix, rerun:

Authentication

Products

Cart

Checkout

Payments

Orders

Supplier

RFQ

Reviews

Admin

Notifications

Wallet

Permissions

Security

Do not introduce regressions.

==================================================
53. FINAL TEST REPORT
=====================

At the end generate:

1. Executive Summary

2. Total Test Cases

3. Passed

4. Failed

5. Blocked

6. Critical Bugs

7. High Bugs

8. Medium Bugs

9. Low Bugs

10. Security Vulnerabilities

11. Performance Problems

12. Accessibility Problems

13. SEO Problems

14. Database Problems

15. API Problems

16. Payment Problems

17. UX Problems

18. Browser Compatibility

19. Mobile Compatibility

20. Deployment Problems

21. Recommended Fixes

22. Overall Quality Score

==================================================
54. QUALITY GATE
================

Do not declare the project production-ready unless:

* No critical bugs
* No high-severity security vulnerabilities
* Payment workflows pass
* Order workflows pass
* Inventory remains consistent
* Authorization works
* Financial calculations are correct
* Database integrity is maintained
* Critical E2E workflows pass
* Backup/restore works
* Production environment variables are secure
* HTTPS is enabled
* Error handling is implemented
* Rate limiting is enabled
* Security headers are configured
* Logs and monitoring are available

==================================================
55. FINAL COMMAND
=================

Start by inspecting the entire project.

Do NOT immediately modify code.

First:

1. Analyze the project structure.
2. Identify frontend modules.
3. Identify backend modules.
4. Identify API routes.
5. Identify database schema.
6. Identify authentication system.
7. Identify payment implementation.
8. Identify all user roles.
9. Identify missing features.
10. Identify existing tests.
11. Identify test framework.
12. Identify environment configuration.

Then create a complete:

TEST PLAN

TEST CASE MATRIX

AUTOMATION PLAN

SECURITY TEST PLAN

PERFORMANCE TEST PLAN

DATABASE TEST PLAN

API TEST PLAN

E2E TEST PLAN

After creating the plan, begin testing module-by-module.

Do not skip modules.

Do not assume functionality.

Test the application exactly as a real:

Guest

Buyer

Supplier

Admin

Moderator

Support Staff

Delivery Staff

would use it.

At the end, provide a detailed QA report and clearly state:

PRODUCTION READY

or

NOT PRODUCTION READY

with the exact reasons.
