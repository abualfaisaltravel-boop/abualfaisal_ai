# أبو الفيصل — تطبيق أندرويد مستقل

Android APK wrapper for the existing secure office at
https://abualfaisal-office.abualfaisaltravel.workers.dev/

- **No second database.** Customers, tasks, and campaigns remain in Cloudflare D1.
- **Authentication:** Cloudflare Access one-time code at the original site. The app does not embed passwords, session keys or payment details.
- **Icon:** official Abu Al Faisal aircraft-and-F symbol (NOT the incorrect cross).
- **Web content updates:** The app displays live website code when opened, so routine updates need no APK rebuild.
- **Native icon changes:** Require a new signed APK release and user/system-approved installation.
- **Android:** min Android 8, targeted Android API 35.
- **GitHub build:** The workflow on android-office-native-2026 builds an installable debug-signed APK artifact.
- **Note:** Debug-signed APK is a TEST build only. Do not publish it as a Play Store release. Future native updates must use a persistent production signing key. No private signing keys are included in this public repository.
