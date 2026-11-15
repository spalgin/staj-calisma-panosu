# Staj Çalışma Panosu

Stajda yapılan çalışmaları başlık, ders, tarih ve durumuyla takip eden React uygulaması. Kayıt ekleme, listeleme, düzenleme ve silme işlemleri aynı panodan yapılır. Ders, durum ve başlık araması birlikte kullanılabilir. Kayıtlar tarayıcının yerel depolama alanında saklanır ve ilk açılışta örnek kayıtlar gösterilir.

**Portföy katılımcısı** Fevzi Emre Karahan

[Canlı uygulama](https://staj-calisma-panosu.vercel.app/)

## Yerelde çalıştırma

Node.js 22.12 veya üstü ve npm ile proje klasöründe çalıştırın.

```sh
npm ci
npm run dev
```

Terminalde gösterilen yerel adresi tarayıcıda açın.

## Derleme ve yayın

```sh
npm run build
npm run preview
```

Netlify'da derleme komutu olarak `npm run build` ve yayın dizini olarak `dist` kullanılır. Uygulama statik dosyalardan çalışır.

## CRUD akışı

1. **Yeni çalışma** ile başlık, ders, tarih ve durum girin.
2. Kayıt listede görünür. Arama kutusu veya filtrelerle kayda ulaşın.
3. **Düzenle** ile başlığı veya durumu güncelleyin. Sayfayı yenileyip değişikliği kontrol edin.
4. **Sil** ile onay penceresini açın ve silmeyi onaylayın.

## Ekran görüntüleri

- [Masaüstü](marketing/2026-11-15/Web_Gelistirme_Calisma_Panosu.png)
- [Dar ekran](marketing/2026-11-15/Web_Gelistirme_Calisma_Panosu_Mobil.png)
