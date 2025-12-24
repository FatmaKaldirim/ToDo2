use ToDo2Db
go 

-- ============================================================
-- TEST VERİ SETİ OLUŞTURMA SCRIPTİ
-- 50.000 Kayıt İçin Gerçekçi Veri Üretimi
-- ============================================================

SET NOCOUNT ON;

PRINT '========================================';
PRINT 'Test Veri Seti Oluşturma Başlıyor...';
PRINT '========================================';
PRINT '';

-- Değişkenler
DECLARE @StartTime DATETIME = GETDATE();
DECLARE @UserCount INT = 500;          -- 500 kullanıcı
DECLARE @ListPerUser INT = 10;         -- Her kullanıcı için 10 liste
DECLARE @TaskPerList INT = 8;          -- Her liste için 8 görev
DECLARE @TaskWithoutList INT = 1000;   -- Liste olmayan 1000 görev
DECLARE @StepPerTaskRate FLOAT = 0.3;  -- Görevlerin %30'u adımlı
DECLARE @StepsPerTask INT = 3;         -- Adımlı görevler için ortalama 3 adım
DECLARE @NoteCount INT = 5000;         -- 5000 not
DECLARE @RecurringTaskRate FLOAT = 0.1; -- Görevlerin %10'u tekrarlayan
DECLARE @PrintMsg VARCHAR(500);        -- PRINT mesajları için

-- Şifre hash için örnek değerler (gerçek uygulamada farklı olacak)
DECLARE @DefaultPasswordHash VARBINARY(64) = 0x4B6F6E75315369667265314B6F6E75315369667265314B6F6E75315369667265314B6F6E75315369667265314B6F6E75315369667265314B6F6E7531;
DECLARE @DefaultPasswordSalt VARBINARY(128) = 0x53616C743153616C743153616C743153616C743153616C743153616C743153616C743153616C743153616C743153616C743153616C743153616C743153616C743153616C743153616C743153616C7431;

-- Liste isimleri pool'u
DECLARE @ListNames TABLE (ID INT IDENTITY, Name VARCHAR(100));
INSERT INTO @ListNames (Name) VALUES
('İş Görevleri'), ('Kişisel'), ('Alışveriş'), ('Ev İşleri'), ('Okul'),
('Proje Yönetimi'), ('Fitness'), ('Seyahat'), ('Sağlık'), ('Finans'),
('Hobiler'), ('Aile'), ('Arkadaşlar'), ('Öğrenme'), ('Yaratıcılık');

-- Görev isimleri pool'u
DECLARE @TaskNames TABLE (ID INT IDENTITY, Name VARCHAR(200));
INSERT INTO @TaskNames (Name) VALUES
('E-posta kontrolü'), ('Toplantı hazırlığı'), ('Rapor yazma'), ('Kod review'), ('Test yazma'),
('Dokümantasyon güncelleme'), ('Müşteri görüşmesi'), ('Proje planlama'), ('Veri analizi'), ('Sunum hazırlama'),
('Market alışverişi'), ('Faturaları öde'), ('Temizlik yap'), ('Yemek hazırla'), ('Çamaşır yıka'),
('Spor yap'), ('Kitap oku'), ('Dil öğren'), ('Müzik dinle'), ('Film izle'),
('Arkadaşlarla buluş'), ('Aile ziyareti'), ('Doktor randevusu'), ('Araba bakımı'), ('Bahar temizliği'),
('Yeni proje başlat'), ('Teknoloji güncelle'), ('Blog yazısı yaz'), ('Fotoğraf düzenle'), ('Müzik çal');

-- Görev içerikleri pool'u
DECLARE @TaskContents TABLE (ID INT IDENTITY, Content VARCHAR(500));
INSERT INTO @TaskContents (Content) VALUES
('Bu görevi tamamlamak için gerekli adımları gözden geçir'),
('Önemli notlar ve detaylar burada yer alacak'),
('Zamanında tamamlanması gereken bir görev'),
('Dikkatli bir şekilde ele alınmalı'),
('İlgili kişilerle koordinasyon gerekli'),
('Bütçe ve kaynak planlaması yapılmalı'),
('Kalite kontrolü önemli'),
('Müşteri onayı bekleniyor'),
('Ekip toplantısında görüşülecek'),
('Acil müdahale gerektirebilir');

-- Adım metinleri pool'u
DECLARE @StepTexts TABLE (ID INT IDENTITY, Text VARCHAR(300));
INSERT INTO @StepTexts (Text) VALUES
('İlk adımı tamamla'), ('İkinci aşamayı kontrol et'), ('Üçüncü adımı uygula'),
('Dördüncü kontrol noktası'), ('Son adımı gözden geçir'), ('Test et'),
('Dokümantasyonu güncelle'), ('Onay al'), ('Gönder'), ('Arşivle'),
('Plan yap'), ('Kaynakları hazırla'), ('Ekiple görüş'), ('Uygula'), ('Raporla');

-- Not metinleri pool'u
DECLARE @NoteTexts TABLE (ID INT IDENTITY, Text NVARCHAR(1000));
INSERT INTO @NoteTexts (Text) VALUES
('Bu konuda daha fazla araştırma yapılmalı'),
('İlgili kişiyle görüşme yapıldı, sonuçlar olumlu'),
('Bir sonraki adımda bunu göz önünde bulundur'),
('Önemli bir not: detaylar önemli'),
('Zaman planlaması revize edilmeli'),
('Ek bilgi için dokümantasyona bak'),
('Bu not ileride referans için'),
('Öncelik sırası değişti, güncelle'),
('Takım üyeleri bilgilendirildi'),
('Yeni gelişmeler oldu, durumu gözden geçir');

-- ============================================================
-- 1. KULLANICILAR OLUŞTURMA (500 kullanıcı)
-- ============================================================
SET @PrintMsg = '1. Kullanıcılar oluşturuluyor... (' + CAST(@UserCount AS VARCHAR) + ' kullanıcı)';
PRINT @PrintMsg;

DECLARE @i INT = 1;
WHILE @i <= @UserCount
BEGIN
    INSERT INTO dbo.Users (UserName, UserMail, PasswordHash, PasswordSalt, CreatedAt, IsActive)
    VALUES (
        'Kullanıcı' + CAST(@i AS VARCHAR),
        'user' + CAST(@i AS VARCHAR) + '@test.com',
        @DefaultPasswordHash,
        @DefaultPasswordSalt,
        DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 365, GETDATE()), -- Son 1 yıl içinde rastgele
        CASE WHEN @i % 50 = 0 THEN 0 ELSE 1 END -- Her 50 kullanıcıdan biri pasif
    );
    
    IF @i % 100 = 0
    BEGIN
        SET @PrintMsg = '  ' + CAST(@i AS VARCHAR) + ' kullanıcı oluşturuldu...';
        PRINT @PrintMsg;
    END;
    
    SET @i = @i + 1;
END;

DECLARE @UserRowCount INT = @@ROWCOUNT;
SET @PrintMsg = '✓ ' + CAST(@UserRowCount AS VARCHAR) + ' kullanıcı oluşturuldu';
PRINT @PrintMsg;
PRINT '';

-- ============================================================
-- 2. LİSTELER OLUŞTURMA (Her kullanıcı için 10 liste = 5000 liste)
-- ============================================================
DECLARE @TotalLists INT = @UserCount * @ListPerUser;
SET @PrintMsg = '2. Listeler oluşturuluyor... (' + CAST(@TotalLists AS VARCHAR) + ' liste)';
PRINT @PrintMsg;

DECLARE @UserId INT;
DECLARE @ListId INT;
DECLARE @ListCounter INT = 1;

DECLARE user_cursor CURSOR FOR
SELECT UserID FROM dbo.Users ORDER BY UserID;

OPEN user_cursor;
FETCH NEXT FROM user_cursor INTO @UserId;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @ListCounter = 1;
    
    WHILE @ListCounter <= @ListPerUser
    BEGIN
        DECLARE @ListName VARCHAR(100) = (SELECT TOP 1 Name FROM @ListNames ORDER BY NEWID()) + ' ' + CAST(@ListCounter AS VARCHAR);
        
        INSERT INTO todo.Lists (UserID, ListName, CreatedAt)
        VALUES (
            @UserId,
            @ListName,
            DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 180, GETDATE()) -- Son 6 ay içinde
        );
        
        SET @ListCounter = @ListCounter + 1;
    END;
    
    IF @UserId % 50 = 0
    BEGIN
        SET @PrintMsg = '  Kullanıcı ' + CAST(@UserId AS VARCHAR) + ' için listeler oluşturuldu...';
        PRINT @PrintMsg;
    END;
    
    FETCH NEXT FROM user_cursor INTO @UserId;
END;

CLOSE user_cursor;
DEALLOCATE user_cursor;

PRINT '✓ Listeler oluşturuldu';
PRINT '';

-- ============================================================
-- 3. GÖREVLER OLUŞTURMA (Listeli ve listesiz)
-- ============================================================
PRINT '3. Görevler oluşturuluyor...';

-- 3.1. Liste ile ilişkili görevler
DECLARE @ListCount INT = (SELECT COUNT(*) FROM todo.Lists);
DECLARE @TaskCounter INT = 1;
DECLARE @CurrentListId INT;

DECLARE list_cursor CURSOR FOR
SELECT ListID FROM todo.Lists ORDER BY ListID;

OPEN list_cursor;
FETCH NEXT FROM list_cursor INTO @CurrentListId;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @TaskCounter = 1;
    
    WHILE @TaskCounter <= @TaskPerList
    BEGIN
        DECLARE @TaskName VARCHAR(200) = (SELECT TOP 1 Name FROM @TaskNames ORDER BY NEWID());
        DECLARE @TaskContent VARCHAR(500) = CASE WHEN ABS(CHECKSUM(NEWID())) % 3 = 0 
                                                 THEN (SELECT TOP 1 Content FROM @TaskContents ORDER BY NEWID()) 
                                                 ELSE NULL END;
        DECLARE @DueDate DATETIME = CASE WHEN ABS(CHECKSUM(NEWID())) % 2 = 0 
                                         THEN DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 30, GETDATE()) 
                                         ELSE NULL END;
        DECLARE @ReminderDate DATETIME = CASE WHEN @DueDate IS NOT NULL AND ABS(CHECKSUM(NEWID())) % 2 = 0
                                              THEN DATEADD(HOUR, -ABS(CHECKSUM(NEWID())) % 24, @DueDate)
                                              ELSE NULL END;
        DECLARE @IsCompleted BIT = CASE WHEN ABS(CHECKSUM(NEWID())) % 3 = 0 THEN 1 ELSE 0 END;
        DECLARE @IsImportant BIT = CASE WHEN ABS(CHECKSUM(NEWID())) % 5 = 0 THEN 1 ELSE 0 END;
        DECLARE @RecurrenceType VARCHAR(20) = CASE 
            WHEN ABS(CHECKSUM(NEWID())) % 10 = 0 THEN 'daily'
            WHEN ABS(CHECKSUM(NEWID())) % 10 = 1 THEN 'weekly'
            WHEN ABS(CHECKSUM(NEWID())) % 10 = 2 THEN 'monthly'
            ELSE NULL
        END;
        DECLARE @CreatedAt DATETIME = DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 90, GETDATE());
        DECLARE @CompletedAt DATETIME = CASE WHEN @IsCompleted = 1 
                                             THEN DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 30, @CreatedAt) 
                                             ELSE NULL END;
        
        DECLARE @TaskUserId INT = (SELECT UserID FROM todo.Lists WHERE ListID = @CurrentListId);
        
        INSERT INTO todo.Tasks (
            UserID, ListID, TaskName, TaskContent, DueDate, ReminderDate,
            IsCompleted, IsImportant, RecurrenceType, CreatedAt, CompletedAt
        )
        VALUES (
            @TaskUserId, @CurrentListId, @TaskName, @TaskContent, @DueDate, @ReminderDate,
            @IsCompleted, @IsImportant, @RecurrenceType, @CreatedAt, @CompletedAt
        );
        
        SET @TaskCounter = @TaskCounter + 1;
    END;
    
    IF @CurrentListId % 500 = 0
    BEGIN
        SET @PrintMsg = '  Liste ' + CAST(@CurrentListId AS VARCHAR) + ' için görevler oluşturuldu...';
        PRINT @PrintMsg;
    END;
    
    FETCH NEXT FROM list_cursor INTO @CurrentListId;
END;

CLOSE list_cursor;
DEALLOCATE list_cursor;

-- 3.2. Liste olmadan görevler (Günüm sayfası için)
PRINT '  Liste olmadan görevler oluşturuluyor...';

SET @TaskCounter = 1;
WHILE @TaskCounter <= @TaskWithoutList
BEGIN
    DECLARE @RandomUserId INT = (SELECT TOP 1 UserID FROM dbo.Users ORDER BY NEWID());
    DECLARE @TaskName2 VARCHAR(200) = (SELECT TOP 1 Name FROM @TaskNames ORDER BY NEWID());
    DECLARE @TaskContent2 VARCHAR(500) = CASE WHEN ABS(CHECKSUM(NEWID())) % 3 = 0 
                                              THEN (SELECT TOP 1 Content FROM @TaskContents ORDER BY NEWID()) 
                                              ELSE NULL END;
    DECLARE @DueDate2 DATETIME = CASE WHEN ABS(CHECKSUM(NEWID())) % 2 = 0 
                                      THEN DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 30, GETDATE()) 
                                      ELSE NULL END;
    DECLARE @IsCompleted2 BIT = CASE WHEN ABS(CHECKSUM(NEWID())) % 3 = 0 THEN 1 ELSE 0 END;
    DECLARE @IsImportant2 BIT = CASE WHEN ABS(CHECKSUM(NEWID())) % 5 = 0 THEN 1 ELSE 0 END;
    DECLARE @CreatedAt2 DATETIME = DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 90, GETDATE());
    DECLARE @CompletedAt2 DATETIME = CASE WHEN @IsCompleted2 = 1 
                                          THEN DATEADD(DAY, ABS(CHECKSUM(NEWID())) % 30, @CreatedAt2) 
                                          ELSE NULL END;
    
    INSERT INTO todo.Tasks (
        UserID, ListID, TaskName, TaskContent, DueDate, ReminderDate,
        IsCompleted, IsImportant, RecurrenceType, CreatedAt, CompletedAt
    )
    VALUES (
        @RandomUserId, NULL, @TaskName2, @TaskContent2, @DueDate2, NULL,
        @IsCompleted2, @IsImportant2, NULL, @CreatedAt2, @CompletedAt2
    );
    
    IF @TaskCounter % 200 = 0
    BEGIN
        SET @PrintMsg = '  ' + CAST(@TaskCounter AS VARCHAR) + ' liste olmadan görev oluşturuldu...';
        PRINT @PrintMsg;
    END;
    
    SET @TaskCounter = @TaskCounter + 1;
END;

PRINT '✓ Görevler oluşturuldu';
PRINT '';

-- ============================================================
-- 4. ADIMLAR OLUŞTURMA (Görevlerin %30'u için ortalama 3 adım)
-- ============================================================
PRINT '4. Adımlar oluşturuluyor...';

DECLARE @TotalTasks INT = (SELECT COUNT(*) FROM todo.Tasks);
DECLARE @TasksWithSteps INT = CAST(@TotalTasks * @StepPerTaskRate AS INT);
DECLARE @StepCounter INT = 0;

-- Rastgele görevler seç ve adım ekle
DECLARE @TaskId INT;
DECLARE @StepsForThisTask INT;

DECLARE task_cursor CURSOR FOR
SELECT TOP (@TasksWithSteps) TaskID 
FROM todo.Tasks 
ORDER BY NEWID();

OPEN task_cursor;
FETCH NEXT FROM task_cursor INTO @TaskId;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @StepsForThisTask = 2 + (ABS(CHECKSUM(NEWID())) % 4); -- 2-5 arası adım
    
    DECLARE @StepNum INT = 1;
    WHILE @StepNum <= @StepsForThisTask
    BEGIN
        DECLARE @StepText VARCHAR(300) = (SELECT TOP 1 Text FROM @StepTexts ORDER BY NEWID());
        DECLARE @StepCompleted BIT = CASE WHEN @StepNum <= (@StepsForThisTask / 2) THEN 1 ELSE 0 END;
        
        INSERT INTO todo.Steps (TaskID, StepText, IsCompleted, CreatedAt)
        VALUES (
            @TaskId,
            @StepText + ' (' + CAST(@StepNum AS VARCHAR) + ')',
            @StepCompleted,
            DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 60, GETDATE())
        );
        
        SET @StepNum = @StepNum + 1;
        SET @StepCounter = @StepCounter + 1;
    END;
    
    IF @StepCounter % 1000 = 0
    BEGIN
        SET @PrintMsg = '  ' + CAST(@StepCounter AS VARCHAR) + ' adım oluşturuldu...';
        PRINT @PrintMsg;
    END;
    
    FETCH NEXT FROM task_cursor INTO @TaskId;
END;

CLOSE task_cursor;
DEALLOCATE task_cursor;

SET @PrintMsg = '✓ Adımlar oluşturuldu (' + CAST(@StepCounter AS VARCHAR) + ' adım)';
PRINT @PrintMsg;
PRINT '';

-- ============================================================
-- 5. TEKRARLAYAN GÖREVLER (Daily, Weekly, Monthly Plans)
-- ============================================================
PRINT '5. Tekrarlayan görev planları oluşturuluyor...';

-- Daily Tasks
DECLARE @DailyTaskCount INT = 0;
DECLARE @DailyTaskId INT;

DECLARE daily_cursor CURSOR FOR
SELECT TaskID FROM todo.Tasks 
WHERE RecurrenceType = 'daily' 
ORDER BY NEWID();

OPEN daily_cursor;
FETCH NEXT FROM daily_cursor INTO @DailyTaskId;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @DaysToAdd INT = ABS(CHECKSUM(NEWID())) % 30; -- Gelecek 30 gün içinde
    DECLARE @PlanDate DATE = DATEADD(DAY, @DaysToAdd, CAST(GETDATE() AS DATE));
    
    -- UNIQUE constraint hatası olmaması için kontrol
    IF NOT EXISTS (SELECT 1 FROM todo.DailyTasks WHERE TaskID = @DailyTaskId AND PlanDate = @PlanDate)
    BEGIN
        BEGIN TRY
            INSERT INTO todo.DailyTasks (TaskID, PlanDate)
            VALUES (@DailyTaskId, @PlanDate);
        
            SET @DailyTaskCount = @DailyTaskCount + 1;
        END TRY
        BEGIN CATCH
            -- UNIQUE constraint hatası durumunda devam et
        END CATCH
    END;
    
    FETCH NEXT FROM daily_cursor INTO @DailyTaskId;
END;

CLOSE daily_cursor;
DEALLOCATE daily_cursor;

-- Weekly Tasks
DECLARE @WeeklyTaskCount INT = 0;
DECLARE @WeeklyTaskId INT;
DECLARE @WeekStartDate DATE;

-- Haftanın başlangıcını bul (Pazartesi)
DECLARE @CurrentDate DATE = CAST(GETDATE() AS DATE);
DECLARE @DayOfWeek INT = DATEPART(WEEKDAY, @CurrentDate);
DECLARE @DaysToMonday INT = CASE WHEN @DayOfWeek = 1 THEN 6 ELSE @DayOfWeek - 2 END;
DECLARE @ThisMonday DATE = DATEADD(DAY, -@DaysToMonday, @CurrentDate);

DECLARE weekly_cursor CURSOR FOR
SELECT TaskID FROM todo.Tasks 
WHERE RecurrenceType = 'weekly' 
ORDER BY NEWID();

OPEN weekly_cursor;
FETCH NEXT FROM weekly_cursor INTO @WeeklyTaskId;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @WeeksToAdd INT = ABS(CHECKSUM(NEWID())) % 8; -- Gelecek 8 hafta içinde
    SET @WeekStartDate = DATEADD(WEEK, @WeeksToAdd, @ThisMonday);
    
    IF NOT EXISTS (SELECT 1 FROM todo.WeeklyTasks WHERE TaskID = @WeeklyTaskId AND WeekStartDate = @WeekStartDate)
    BEGIN
        BEGIN TRY
            INSERT INTO todo.WeeklyTasks (TaskID, WeekStartDate)
            VALUES (@WeeklyTaskId, @WeekStartDate);
            
            SET @WeeklyTaskCount = @WeeklyTaskCount + 1;
        END TRY
        BEGIN CATCH
            -- UNIQUE constraint hatası durumunda devam et
        END CATCH
    END;
    
    FETCH NEXT FROM weekly_cursor INTO @WeeklyTaskId;
END;

CLOSE weekly_cursor;
DEALLOCATE weekly_cursor;

-- Monthly Tasks
DECLARE @MonthlyTaskCount INT = 0;
DECLARE @MonthlyTaskId INT;

DECLARE monthly_cursor CURSOR FOR
SELECT TaskID FROM todo.Tasks 
WHERE RecurrenceType = 'monthly' 
ORDER BY NEWID();

OPEN monthly_cursor;
FETCH NEXT FROM monthly_cursor INTO @MonthlyTaskId;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @MonthsToAdd INT = ABS(CHECKSUM(NEWID())) % 6; -- Gelecek 6 ay içinde
    DECLARE @MonthStartDate DATE = DATEFROMPARTS(
        YEAR(DATEADD(MONTH, @MonthsToAdd, GETDATE())),
        MONTH(DATEADD(MONTH, @MonthsToAdd, GETDATE())),
        1
    );
    
    IF NOT EXISTS (SELECT 1 FROM todo.MonthlyTasks WHERE TaskID = @MonthlyTaskId AND MonthStartDate = @MonthStartDate)
    BEGIN
        BEGIN TRY
            INSERT INTO todo.MonthlyTasks (TaskID, MonthStartDate)
            VALUES (@MonthlyTaskId, @MonthStartDate);
            
            SET @MonthlyTaskCount = @MonthlyTaskCount + 1;
        END TRY
        BEGIN CATCH
            -- UNIQUE constraint hatası durumunda devam et
        END CATCH
    END;
    
    FETCH NEXT FROM monthly_cursor INTO @MonthlyTaskId;
END;

CLOSE monthly_cursor;
DEALLOCATE monthly_cursor;

PRINT '✓ Tekrarlayan görev planları oluşturuldu';
SET @PrintMsg = '  - Daily: ' + CAST(@DailyTaskCount AS VARCHAR);
PRINT @PrintMsg;
SET @PrintMsg = '  - Weekly: ' + CAST(@WeeklyTaskCount AS VARCHAR);
PRINT @PrintMsg;
SET @PrintMsg = '  - Monthly: ' + CAST(@MonthlyTaskCount AS VARCHAR);
PRINT @PrintMsg;
PRINT '';

-- ============================================================
-- 6. NOTLAR OLUŞTURMA (5000 not - göreve bağlı ve bağımsız)
-- ============================================================
SET @PrintMsg = '6. Notlar oluşturuluyor... (' + CAST(@NoteCount AS VARCHAR) + ' not)';
PRINT @PrintMsg;

DECLARE @NoteCounter INT = 1;
DECLARE @NoteUserId INT;
DECLARE @NoteTaskId INT;

WHILE @NoteCounter <= @NoteCount
BEGIN
    SET @NoteUserId = (SELECT TOP 1 UserID FROM dbo.Users ORDER BY NEWID());
    
    -- %60'ı göreve bağlı, %40'ı bağımsız
    IF ABS(CHECKSUM(NEWID())) % 100 < 60
    BEGIN
        SET @NoteTaskId = (SELECT TOP 1 TaskID FROM todo.Tasks WHERE UserID = @NoteUserId ORDER BY NEWID());
        
        IF @NoteTaskId IS NOT NULL
        BEGIN
            INSERT INTO todo.Notes (UserID, TaskID, NoteText, CreatedAt)
            VALUES (
                @NoteUserId,
                @NoteTaskId,
                (SELECT TOP 1 Text FROM @NoteTexts ORDER BY NEWID()),
                DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 90, GETDATE())
            );
        END;
    END
    ELSE
    BEGIN
        INSERT INTO todo.Notes (UserID, TaskID, NoteText, CreatedAt)
        VALUES (
            @NoteUserId,
            NULL,
            (SELECT TOP 1 Text FROM @NoteTexts ORDER BY NEWID()),
            DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 90, GETDATE())
        );
    END;
    
    IF @NoteCounter % 500 = 0
    BEGIN
        SET @PrintMsg = '  ' + CAST(@NoteCounter AS VARCHAR) + ' not oluşturuldu...';
        PRINT @PrintMsg;
    END;
    
    SET @NoteCounter = @NoteCounter + 1;
END;

PRINT '✓ Notlar oluşturuldu';
PRINT '';

-- ============================================================
-- ÖZET RAPOR
-- ============================================================
DECLARE @EndTime DATETIME = GETDATE();
DECLARE @Duration INT = DATEDIFF(SECOND, @StartTime, @EndTime);

PRINT '========================================';
PRINT 'VERİ OLUŞTURMA TAMAMLANDI!';
PRINT '========================================';
PRINT '';
PRINT 'Oluşturulan Kayıtlar:';
DECLARE @UserCountFinal INT = (SELECT COUNT(*) FROM dbo.Users);
DECLARE @ListCountFinal INT = (SELECT COUNT(*) FROM todo.Lists);
DECLARE @TaskCountFinal INT = (SELECT COUNT(*) FROM todo.Tasks);
DECLARE @StepCountFinal INT = (SELECT COUNT(*) FROM todo.Steps);
DECLARE @DailyCountFinal INT = (SELECT COUNT(*) FROM todo.DailyTasks);
DECLARE @WeeklyCountFinal INT = (SELECT COUNT(*) FROM todo.WeeklyTasks);
DECLARE @MonthlyCountFinal INT = (SELECT COUNT(*) FROM todo.MonthlyTasks);
DECLARE @NoteCountFinal INT = (SELECT COUNT(*) FROM todo.Notes);

SET @PrintMsg = '  - Kullanıcılar:        ' + CAST(@UserCountFinal AS VARCHAR);
PRINT @PrintMsg;
SET @PrintMsg = '  - Listeler:            ' + CAST(@ListCountFinal AS VARCHAR);
PRINT @PrintMsg;
SET @PrintMsg = '  - Görevler:            ' + CAST(@TaskCountFinal AS VARCHAR);
PRINT @PrintMsg;
SET @PrintMsg = '  - Adımlar:             ' + CAST(@StepCountFinal AS VARCHAR);
PRINT @PrintMsg;
SET @PrintMsg = '  - Günlük Planlar:      ' + CAST(@DailyCountFinal AS VARCHAR);
PRINT @PrintMsg;
SET @PrintMsg = '  - Haftalık Planlar:    ' + CAST(@WeeklyCountFinal AS VARCHAR);
PRINT @PrintMsg;
SET @PrintMsg = '  - Aylık Planlar:       ' + CAST(@MonthlyCountFinal AS VARCHAR);
PRINT @PrintMsg;
SET @PrintMsg = '  - Notlar:              ' + CAST(@NoteCountFinal AS VARCHAR);
PRINT @PrintMsg;
PRINT '';

DECLARE @TotalRecords INT = @UserCountFinal + @ListCountFinal + @TaskCountFinal + @StepCountFinal + @DailyCountFinal + @WeeklyCountFinal + @MonthlyCountFinal + @NoteCountFinal;
SET @PrintMsg = 'TOPLAM KAYIT: ' + CAST(@TotalRecords AS VARCHAR);
PRINT @PrintMsg;
PRINT '';
SET @PrintMsg = 'İşlem Süresi: ' + CAST(@Duration AS VARCHAR) + ' saniye';
PRINT @PrintMsg;
PRINT '========================================';

GO

