# Google Sheets Integration

To use the Google Sheets integration, you need to set up the following environment variables:

1. `GOOGLE_CLIENT_EMAIL` - The client email from your Google Service Account
2. `GOOGLE_PRIVATE_KEY` - The private key from your Google Service Account

## Setting up Google Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account
5. Create a key for the Service Account (JSON format)
6. Share your Google Sheet with the Service Account email address (with Editor permissions)
7. Add the client_email and private_key from the JSON file to your environment variables

