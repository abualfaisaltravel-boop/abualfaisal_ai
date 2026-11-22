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

## التحديث التشغيلي 1.1
- يفتح التطبيق **نفس مركز الإدارة** على الرابط الثابت، ويستلم تغييرات الواجهة والبيانات من Cloudflare عند فتح التطبيق دون إعادة تثبيت APK.
- مسارات التطبيق: الرئيسية، المهام، العملاء، الحجوزات، المزيد (بداخلها الطلبات، التأشيرات، الحسابات، دليل الفريق، التسويق، البريد، المستجدات، التقارير).
- تم إصلاح شاشة خطأ الاتصال، وحفظ ملفات الكوكيز، وضبط زر الرجوع ليغلق النماذج أو يعود للرئيسية قبل الخروج.
- بيانات الدخول والتذاكر لا تُخزن داخل حزمة التطبيق.
- لا يمكن ضمان ترقية حزمة APK التجريبية القديمة باستخدام توقيع debug جديد من بيئة GitHub عابرة. يلزم تثبيت نظيف **مرة واحدة** عند تغيير توقيع الحزمة، أو توفير مفتاح توقيع إنتاج ثابت في أسرار المستودع لتحديثات APK المستقبلية.
- تحديثات الواجهة والمحتوى لا تحتاج توقيعًا جديدًا لأنها تُنشر على مركز Cloudflare نفسه. أما تغيير الرمز الأصلي أو صلاحيات أندرويد فيحتاج إصدار APK موقع.
