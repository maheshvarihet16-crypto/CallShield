# CallShield Phase 2 — Native Android Companion Integration

This document contains the Android Kotlin code for intercepting incoming phone calls on an Android device and sending the caller phone number to CallShield's Real-time API (`/api/incoming-call`).

---

## 1. Android Manifest Permissions

Add the following permissions to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.READ_CALL_LOG" />
<uses-permission android:name="android.permission.INTERNET" />

<application ...>
    <!-- Register Call Receiver -->
    <receiver android:name=".CallShieldReceiver" android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.PHONE_STATE" />
        </intent-filter>
    </receiver>
</application>
```

---

## 2. CallShieldReceiver.kt (Kotlin Code)

Create `CallShieldReceiver.kt` inside your Android project (`app/src/main/java/org/callshield/CallShieldReceiver.kt`):

```kotlin
package org.callshield

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

class CallShieldReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
            val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)

            if (state == TelephonyManager.EXTRA_STATE_RINGING && !incomingNumber.isNullOrEmpty()) {
                Log.d("CallShield", "Incoming call detected: $incomingNumber")

                // Asynchronously notify CallShield Server API
                CoroutineScope(Dispatchers.IO).launch {
                    sendCallToCallShieldApi(incomingNumber)
                }
            }
        }
    }

    private fun sendCallToCallShieldApi(phoneNumber: String) {
        try {
            // Replace with your deployed domain or localhost tunnel URL (e.g. ngrok)
            val serverUrl = URL("https://callshield.org/api/incoming-call")
            val conn = serverUrl.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
            conn.doOutput = true

            val jsonBody = JSONObject().apply {
                put("phoneNumber", phoneNumber)
                put("source", "Android Phone Screening Service")
            }

            conn.outputStream.use { os ->
                val input = jsonBody.toString().toByteArray(Charsets.UTF_8)
                os.write(input, 0, input.size)
            }

            val responseCode = conn.responseCode
            Log.d("CallShield", "API Notification Response Code: $responseCode")
            conn.disconnect()
        } catch (e: Exception) {
            Log.e("CallShield", "Failed to send call to CallShield API", e)
        }
    }
}
```

---

## 3. How to Test Without an Android Phone

You do not need an Android phone to test Phase 2! CallShield includes a built-in **Browser Simulator Widget** at the bottom-right corner of the website.
Click **"PHASE 2 LIVE TEST"**, choose a preset scam number (e.g. `+91 99999 11111` - Fake SBI Bank), and click **Trigger**. The real-time warning pop-up will trigger instantly on your screen!
