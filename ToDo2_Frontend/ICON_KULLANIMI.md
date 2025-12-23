# İkon Kullanımı Rehberi

## Kurulum Tamamlandı ✅

`react-icons` kütüphanesi yüklendi. Artık uygulamada profesyonel ikonlar kullanabilirsiniz.

## Kullanım Örnekleri

### 1. Temel Kullanım

```jsx
import { FiCalendar, FiSearch, FiStar } from "react-icons/fi";

// Component içinde
<FiCalendar />
<FiSearch style={{ fontSize: '20px', color: '#7c3aed' }} />
```

### 2. Mevcut İkon Setleri

- **Feather Icons** (`react-icons/fi`) - Modern ve minimal (önerilen)
- **Heroicons** (`react-icons/hi` veya `react-icons/hi2`)
- **Material Design** (`react-icons/md`)
- **Font Awesome** (`react-icons/fa`)
- **Ant Design** (`react-icons/ai`)

### 3. Takvim İkonu Örnekleri

```jsx
import { FiCalendar } from "react-icons/fi";  // Feather (minimal)
import { HiCalendar } from "react-icons/hi";  // Heroicons
import { MdCalendarToday } from "react-icons/md";  // Material Design
import { AiOutlineCalendar } from "react-icons/ai";  // Ant Design
```

### 4. Stil Verme

```jsx
<FiCalendar 
  style={{ 
    fontSize: '20px', 
    color: '#7c3aed',
    marginRight: '8px'
  }} 
/>

// veya CSS class ile
<FiCalendar className="my-icon" />
```

### 5. Yaygın İkonlar

```jsx
import { 
  FiSearch,      // 🔍 Arama
  FiCalendar,    // 📅 Takvim
  FiClock,       // 🕐 Saat/Zaman
  FiStar,        // ⭐ Yıldız
  FiFileText,    // 📄 Dosya
  FiLogOut,      // 🚪 Çıkış
  FiPlus,        // ➕ Ekle
  FiEdit,        // ✏️ Düzenle
  FiTrash,       // 🗑️ Sil
  FiCheck,       // ✅ Onay
  FiX            // ❌ İptal
} from "react-icons/fi";
```

## İkonları Nereden Bulabilirsiniz?

1. **react-icons.github.io** - Tüm ikonları görsel olarak arayabilirsiniz
2. **feathericons.com** - Feather Icons resmi sitesi
3. Herhangi bir ikon seti için: `react-icons/[set-adı]`

## Önemli Notlar

- İkonlar SVG olarak render edilir, bu yüzden çok hızlıdır
- Renk ve boyut CSS ile kolayca değiştirilebilir
- Tüm ikonlar `inline-block` olarak gelir
- Erişilebilirlik için `aria-label` ekleyebilirsiniz:

```jsx
<FiCalendar aria-label="Takvim" />
```

