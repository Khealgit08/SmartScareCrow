# Google OAuth Setup Guide for SmartCrow

## Step-by-Step Instructions

### 1. Configure OAuth Consent Screen (Required First Time)

Before creating OAuth Client IDs, you need to configure the consent screen:

1. In Google Cloud Console, go to: **APIs & Services → OAuth consent screen**
2. Click **"CREATE"** or **"CONFIGURE CONSENT SCREEN"**
3. Choose **"External"** user type → Click **"CREATE"**
4. Fill in the required fields:
   - **App name**: `SmartCrow`
   - **User support email**: (select your email from dropdown)
   - **App logo**: (optional, skip for now)
   - **Developer contact information**: (enter your email)
5. Click **"SAVE AND CONTINUE"**
6. **Scopes page**: Click **"ADD OR REMOVE SCOPES"**
   - Select: `userinfo.email` and `userinfo.profile`
   - Click **"UPDATE"** → **"SAVE AND CONTINUE"**
7. **Test users page**: Click **"ADD USERS"**
   - Add your Gmail address
   - Click **"ADD"** → **"SAVE AND CONTINUE"**
8. Review and click **"BACK TO DASHBOARD"**

---

### 2. Create OAuth Client IDs

Now you can create the OAuth client IDs. You need to create **3 separate client IDs**:

#### A. WEB CLIENT ID (Most Important - Do This First!)

1. Go to: **APIs & Services → Credentials**
2. Click **"CREATE CREDENTIALS"** → **"OAuth client ID"**
3. **Application type**: Select **"Web application"**
4. **Name**: `SmartCrow Web`
5. **Authorized JavaScript origins**: (Leave empty for now)
6. **Authorized redirect URIs**: Click **"+ ADD URI"** and add these:
   ```
   https://auth.expo.io/@anonymous/SmartCrow
   http://localhost:19006
   ```
7. Click **"CREATE"**
8. **IMPORTANT**: Copy the **Client ID** that appears (it looks like: `xxxxx.apps.googleusercontent.com`)
9. Click **"OK"**

#### B. ANDROID CLIENT ID

1. Click **"CREATE CREDENTIALS"** → **"OAuth client ID"** again
2. **Application type**: Select **"Android"**
3. **Name**: `SmartCrow Android`
4. **Package name**: `com.smartcrow.app`
5. **SHA-1 certificate fingerprint**: For development, use:
   ```
   DA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09
   ```
   (This is a common debug keystore fingerprint - you can update it later)
6. Click **"CREATE"**
7. **IMPORTANT**: Copy the **Client ID**
8. Click **"OK"**

#### C. iOS CLIENT ID (If you plan to build for iOS)

1. Click **"CREATE CREDENTIALS"** → **"OAuth client ID"** again
2. **Application type**: Select **"iOS"**
3. **Name**: `SmartCrow iOS`
4. **Bundle ID**: `com.smartcrow.app`
5. Click **"CREATE"**
6. **IMPORTANT**: Copy the **Client ID**
7. Click **"OK"**

---

### 3. Update Your Login.tsx File

Replace the placeholder values in `assets/screens/Login.tsx` (around line 48-51):

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: "YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com",  // ← Replace this
  iosClientId: "YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com",  // ← Replace this
  androidClientId: "YOUR_ANDROID_CLIENT_ID_HERE.apps.googleusercontent.com",  // ← Replace this
  scopes: ["profile", "email"],
});
```

---

### 4. Test the Setup

1. Restart your Expo development server
2. Click "Continue with Google" in your app
3. You should now see a proper Google sign-in page instead of a 400 error

---

## Quick Reference

**Your App Configuration:**
- **App Name**: SmartCrow
- **Package Name (Android)**: com.smartcrow.app
- **Bundle ID (iOS)**: com.smartcrow.app
- **Scheme**: smartcrow

**Redirect URIs to configure in Google Cloud:**
- https://auth.expo.io/@anonymous/SmartCrow
- http://localhost:19006
- smartcrow://

---

## Troubleshooting

**Still getting 400 error?**
- Make sure you copied the FULL client ID including `.apps.googleusercontent.com`
- Check that redirect URIs are added correctly in Google Cloud Console
- Clear your browser cache and restart the Expo server

**Can't find OAuth consent screen?**
- You need to configure it before creating OAuth client IDs
- Go to: APIs & Services → OAuth consent screen

**Error: "Access blocked: This app's request is invalid"?**
- Make sure you added your email as a test user
- Check that the scopes include `userinfo.email` and `userinfo.profile`

---

## Next Steps After Getting Client IDs

Once you have all three client IDs:
1. Copy each client ID carefully
2. Paste them into Login.tsx (replacing the YOUR_xxx_CLIENT_ID placeholders)
3. Restart your Expo development server
4. Test the Google sign-in button

Good luck! 🚀
