# Email Gönderme Ayarları

Email gönderme özelliğinin çalışması için `appsettings.json` dosyasında SMTP ayarlarını yapılandırmanız gerekmektedir.

## Gmail Kullanımı

1. Google hesabınızda "2 Adımlı Doğrulama"yı açın
2. "Uygulama şifreleri" bölümünden yeni bir uygulama şifresi oluşturun
3. `appsettings.json` dosyasını düzenleyin:

```json
{
  "SmtpSettings": {
    "Host": "smtp.gmail.com",
    "Port": "587",
    "User": "your-email@gmail.com",
    "Password": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "To Do List"
  }
}
```

## Diğer Email Sağlayıcıları

- **Outlook/Hotmail**: `smtp-mail.outlook.com`, Port: `587`
- **Yahoo**: `smtp.mail.yahoo.com`, Port: `587`
- **Özel SMTP**: Kendi SMTP sunucu ayarlarınızı kullanın

## Notlar

- Email gönderme özelliği arka planda çalışır, hata durumunda uygulama çalışmaya devam eder
- Email bildirimleri kullanıcı ayarlarından açılıp kapatılabilir
- Kayıt olan kullanıcılara otomatik hoş geldin emaili gönderilir
- Hatırlatma tarihi gelen görevler için otomatik email bildirimi gönderilir

