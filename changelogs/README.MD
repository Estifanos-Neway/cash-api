# Changelog

## v0.3.0 | Oct 26, 2022

- Implemented /affiliates.
- /tokens is changed to /sessions.
- Removed "Authorization" header from /sessions requests (/refresh and /sign-out).
- Cors whitelist is moved from `.env` to `src/config.json`.
- Changed "Invalid_Access_Token" to "Not_Authorized" for status code 401.

## v0.4.0 | Oct 30, 2022

- Implemented /orders.
- Added 'wallet' and 'affiliationSummary' to 'affiliate'.
- Changed 'commissionRate' to 'commission' in 'products'. No need to be 'between 0 and 100' anymore, but must be positive number.
- Removed 'Invalid_Parent_Id' response from '/affiliates/sign-up' (invalid parent ids will be ignored)

## v0.5.0 | Nov 02, 2022

- Implemented `/transactions`.
- Added path `/affiliates/{id}/transactions`.