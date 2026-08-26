هذه النسخة مبنية مباشرة على «المشروع بدون مزامنة(7).zip».
تمت إضافة Firebase للمزامنة فقط، ولم يتم تعديل كود زر «حفظ PDF» أو أكواد الطباعة الأصلية.

Firebase:
- المشروع: elhaj-zoubir
- Anonymous Auth مطلوب أن يكون مفعلاً.
- Cloud Firestore مطلوب.
- أنشئ collection باسم hz_sync؛ التطبيق ينشئ المستندات تلقائياً.

قواعد Firestore المقترحة:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /hz_sync/{roomId} {
      allow read, write: if request.auth != null;
    }
  }
}
