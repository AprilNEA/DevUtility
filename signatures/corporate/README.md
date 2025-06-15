# Corporate CLA Records

This directory contains records of signed Corporate CLAs.

## File Naming Convention
- `{company-name}-{date}.json` - Corporate CLA record
- Example: `acme-corp-20240115.json`

## Record Format
```json
{
  "corporateName": "ACME Corporation",
  "signatory": {
    "name": "John Smith",
    "title": "CTO",
    "email": "john.smith@acme.com"
  },
  "signedDate": "2024-01-15",
  "authorizedContributors": [
    {
      "githubUsername": "jsmith-acme",
      "fullName": "John Smith",
      "email": "john.smith@acme.com"
    }
  ],
  "claVersion": "1.0",
  "status": "active"
}
