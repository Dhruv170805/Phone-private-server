# Private Phone-First Personal Assistant Server

A secure, minimal-latency personal assistant optimized for Android (Termux) with email-driven control.

## Features
- **Email Control:** Send commands like `ADD REMINDER: Buy milk` via email.
- **Mobile Dashboard:** Responsive UI built with Tailwind CSS and Alpine.js.
- **Scheduler:** Automated 7 AM daily summaries and real-time reminders.
- **Private:** Single-user focus, whitelisted email commands, local SQLite DB.

## Prerequisites
- **Android Device** with [Termux](https://termux.dev/) installed.
- **Email Account** with IMAP/SMTP enabled (e.g., Gmail with an App Password).

## Setup Instructions (Termux)
1. **Clone/Download** this repository to your device.
2. **Run the setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
3. **Configure Environment:**
   Edit `.env` and fill in:
   - `EMAIL_USER`: Your Gmail address.
   - `EMAIL_PASS`: Your Google App Password.
   - `ALLOWED_SENDER`: Your personal email allowed to send commands.
   - `WEB_PASS`: Your desired dashboard password.
4. **Start the server:**
   ```bash
   pm2 start src/server.js --name assistant
   ```

## Email Commands
Send these from your `ALLOWED_SENDER` address:
- `ADD REMINDER: Task at Time` (e.g., `ADD REMINDER: Call Mom at 5 PM`)
- `ADD BIRTHDAY: Name Date` (e.g., `ADD BIRTHDAY: John 15 June`)
- `SHOW: TODAY` - Returns your schedule for the day.
- `DELETE: Name` - Removes a birthday entry.

## Security Note
The dashboard is accessible locally on your network. If you need external access, use a tool like **Ngrok** within Termux. Ensure your `.env` is never shared.

## 🔄 Google Calendar & Contacts Sync (Detailed Setup)

To allow the server to automatically fetch your existing Google data, follow these precise steps:

### Step 1: Create a Google Cloud Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click the project dropdown at the top and select **"New Project"**.
3.  Name it `Phone-Assistant` and click **Create**.

### Step 2: Enable the Necessary APIs
1.  In the sidebar, go to **APIs & Services > Library**.
2.  Search for **"Google Calendar API"**, click it, and click **Enable**.
3.  Go back to the Library, search for **"Google People API"**, and click **Enable**.

### Step 3: Configure the OAuth Consent Screen
1.  Go to **APIs & Services > OAuth consent screen**.
2.  Select **External** (or Internal if you have a Google Workspace) and click **Create**.
3.  **App Information:** Fill in "Assistant Server" and your email.
4.  **Scopes:** Click **Add or Remove Scopes**. Add:
    - `.../auth/calendar.readonly`
    - `.../auth/contacts.readonly`
5.  **Test Users:** Click **+ Add Users** and add your own Gmail address. This is critical for the app to work in "Testing" mode.

### Step 4: Create Credentials
1.  Go to **APIs & Services > Credentials**.
2.  Click **+ Create Credentials** > **OAuth client ID**.
3.  Select **Application type: Desktop app** and name it `Assistant CLI`.
4.  Click **Create**, then click the **Download JSON** icon for the new client.
5.  Rename this file to `credentials.json`.

### Step 5: Activate on your Phone
1.  Move `credentials.json` into the `data/` folder of this project on your phone.
2.  In Termux, navigate to the project folder and run:
    ```bash
    node src/google-auth.js
    ```
3.  Copy the URL provided, paste it into your phone's browser, and sign in.
4.  **Important:** You might see a "Google hasn't verified this app" warning. Click **Advanced** > **Go to Assistant Server (unsafe)**.
5.  Copy the **Authorization Code** provided by Google and paste it back into your Termux terminal.
6.  A `google_token.json` file will be created in `data/`, and sync will now run automatically every 6 hours.

### Manual Sync Trigger
To trigger a sync immediately without waiting for the 6-hour timer, you can restart the server:
```bash
pm2 restart assistant
```
