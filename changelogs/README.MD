# Changelog

## v0.3.0 | Oct 26, 2022

- Implemented /affiliates.
- /tokens is changed to /sessions.
- Removed "Authorization" header from /sessions requests (/refresh and /sign-out).
- Cors whitelist is moved from `.env` to `src/configs`.
- Changed "Invalid_Access_Token" to "Not_Authorized" for status code 401.

## v0.4.0 | Oct 30, 2022

- Implemented /orders.
- Added 'wallet' and 'affiliationSummary' to 'affiliate'.
- Changed 'commissionRate' to 'commission' in 'products'. No need to be 'between 0 and 100' anymore, but must be positive number.
- Removed 'Invalid_Parent_Id' response from '/affiliates/sign-up' (invalid parent ids will be ignored)

## v0.5.0 | Nov 02, 2022

- Implemented `/transactions`.
- Added path `/affiliates/{id}/transactions`.

## v0.6.0 | Nov 06, 2022

- Implemented `/static-web-contents`.
- Implemented `/analytics`.
- Implemented `/contact-us`.

## v0.6.1 | Nov 06, 2022

- Restricted product deletion to products with no pending orders only.
- Will return `409 : Pending_Order` if tried to delete a product with pending orders.
