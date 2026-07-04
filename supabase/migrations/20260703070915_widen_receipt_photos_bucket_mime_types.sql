-- Widen receipt-photos bucket to accept PDF/Word evidence alongside images
-- (operator request: "New receipt" should support attachments, not just camera photos).
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg','image/png','image/webp','image/heic',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
where id = 'receipt-photos';
