let gorevler = [];
let mevcutFiltre = 'hepsi';

// sıralama değişkenleri
let siralamaYonu = 'artan';
const siralamaButonu = document.getElementById('oncelikSirala');

// öncelik sıralaması için sayısal değerler kullandım
const oncelikDegerleri = {
    'Yüksek': 3,
    'Orta': 2,
    'Düşük': 1
};

// DOM elementlerini seçme
const gorevFormu = document.getElementById('gorevFormu');
const gorevListesi = document.getElementById('gorevListesi');
const hataMesaji = document.getElementById('hataMesaji');
const filtreButonlari = document.querySelectorAll('.filtre-buton');

// hata mesajını gösterme fonksiyonu
function hataGoster(mesaj) {
    hataMesaji.textContent = mesaj;
    hataMesaji.classList.add('goster');
}

// hata mesajını temizleme fonksiyonu
function hataTemizle() {
    hataMesaji.textContent = '';
    hataMesaji.classList.remove('goster');
}

// fform doğrulama
function formKontrol(baslik, oncelik) {
    if (!baslik.trim()) {
        hataGoster('Lütfen Bir Görev Başlığı Girin.');
        return false;
    }
    
    if (!oncelik) {
        hataGoster('Lütfen Bir Öncelik Seçin.');
        return false;
    }
    
    return true;
}

// filtreleme butonları için event listener
document.querySelector('.filtre-butonlar').addEventListener('click', function(event) {
    const target = event.target;
    
    // Filtre butonu tıklaması
    if (target.classList.contains('filtre-buton')) {
        filtreButonlari.forEach(btn => btn.classList.remove('aktif'));
        target.classList.add('aktif');
        mevcutFiltre = target.dataset.filtre;
        gorevleriListele();
    }
});

// sıralama butonu için event listener
document.querySelector('.siralama-butonlar').addEventListener('click', function(event) {
    const target = event.target;
    
    // Sıralama butonu tıklaması
    if (target.classList.contains('siralama-buton')) {
        siralamaYonu = siralamaYonu === 'artan' ? 'azalan' : 'artan';
        target.classList.toggle('azalan');
        gorevleriSirala();
        gorevleriListele();
    }
});

// görevleri filtrele
function gorevleriFiltrele() {
    switch(mevcutFiltre) {
        case 'aktif':
            return gorevler.filter(gorev => !gorev.tamamlandi);
        case 'tamamlandi':
            return gorevler.filter(gorev => gorev.tamamlandi);
        default:
            return gorevler;
    }
}

// form gönderimi için event bubbling önleme
gorevFormu.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    try {
        const baslik = document.getElementById('baslik').value;
        const aciklama = document.getElementById('aciklama').value;
        const oncelikElementi = document.querySelector('input[name="oncelik"]:checked');
        const oncelik = oncelikElementi ? oncelikElementi.value : null;
        
        if (!formKontrol(baslik, oncelik)) {
            return;
        }
        
        hataTemizle();
        
        const gorev = {
            id: Date.now(),
            baslik,
            aciklama,
            oncelik,
            tamamlandi: false
        };
        
        gorevler.unshift(gorev);
        gorevleriListele();
        gorevFormu.reset();
        
    } catch (hata) {
        hataGoster('Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.');
        console.error('Hata:', hata);
    }
});

// form inputlarına event listener ekleyerek değişiklik olduğunda hata mesajını temizliyorum
document.getElementById('baslik').addEventListener('input', hataTemizle);
document.querySelectorAll('input[name="oncelik"]').forEach(radio => {
    radio.addEventListener('change', hataTemizle);
});

// görev listesi için event delegation
gorevListesi.addEventListener('click', function(event) {
    event.stopPropagation(); // Event bubbling'i önle
    
    const target = event.target;
    
    // tamamla butonu tıklaması
    if (target.classList.contains('buton-tamamla')) {
        const gorevId = Number(target.getAttribute('data-id'));
        gorevDurumuDegistir(gorevId);
    }
    
    // sil butonu tıklaması
    if (target.classList.contains('buton-sil')) {
        const gorevId = Number(target.getAttribute('data-id'));
        gorevSil(gorevId);
    }
});

// görevleri ekrana listeleme
function gorevleriListele() {
    try {
        gorevListesi.innerHTML = '';
        const filtrelenmisGorevler = gorevleriFiltrele();
        
        filtrelenmisGorevler.forEach(gorev => {
            const gorevElementi = document.createElement('div');
            const oncelikSinifi = gorev.oncelik.toLowerCase()
                .replace('düşük', 'dusuk')
                .replace('orta', 'orta')
                .replace('yüksek', 'yuksek');
            
            gorevElementi.className = `gorev-kutu ${oncelikSinifi}`;
            
            gorevElementi.innerHTML = `
                <div class="gorev-baslik">${gorev.baslik}</div>
                ${gorev.aciklama ? `<p class="gorev-aciklama">${gorev.aciklama}</p>` : ''}
                <span class="gorev-oncelik">${gorev.oncelik}</span>
                <div class="buton-grup">
                    <button class="buton-tamamla" data-id="${gorev.id}">
                        ${gorev.tamamlandi ? 'Geri Al' : 'Tamamla'}
                    </button>
                    <button class="buton-sil" data-id="${gorev.id}">
                        Sil
                    </button>
                </div>
            `;
            
            if (gorev.tamamlandi) {
                gorevElementi.classList.add('gorev-tamamlandi');
            }
            
            gorevListesi.appendChild(gorevElementi);
        });
        
        localStorageKaydet();
    } catch (hata) {
        hataGoster('Görevler görüntülenirken bir hata oluştu.');
        console.error('Hata:', hata);
    }
}

// görev durumunu değiştirme
function gorevDurumuDegistir(gorevId) {
    try {
        const gorev = gorevler.find(g => g.id === gorevId);
        if (gorev) {
            gorev.tamamlandi = !gorev.tamamlandi;
            gorevleriListele();
        }
    } catch (hata) {
        hataGoster('Görev durumu güncellenirken bir hata oluştu.');
        console.error('Hata:', hata);
    }
}

// görevi silme
function gorevSil(gorevId) {
    try {
        gorevler = gorevler.filter(gorev => gorev.id !== gorevId);
        gorevleriListele();
    } catch (hata) {
        hataGoster('Görev silinirken bir hata oluştu.');
        console.error('Hata:', hata);
    }
}

// localStorage'a kaydetme
function localStorageKaydet() {
    try {
        localStorage.setItem('gorevler', JSON.stringify(gorevler));
    } catch (hata) {
        hataGoster('Görevler kaydedilirken bir hata oluştu.');
        console.error('Hata:', hata);
    }
}

// localStorage'dan yükleme
function localStorageYukle() {
    try {
        const kaydedilenGorevler = localStorage.getItem('gorevler');
        if (kaydedilenGorevler) {
            gorevler = JSON.parse(kaydedilenGorevler);
            gorevleriListele();
        }
    } catch (hata) {
        hataGoster('Kaydedilmiş görevler yüklenirken bir hata oluştu.');
        console.error('Hata:', hata);
    }
}

// sayfa yüklendiğinde kaydedilmiş görevleri yükleme
document.addEventListener('DOMContentLoaded', localStorageYukle);

// görevleri önceliğe göre sıralıyoruz.
function gorevleriSirala() {
    gorevler.sort((a, b) => {
        const oncelikA = oncelikDegerleri[a.oncelik];
        const oncelikB = oncelikDegerleri[b.oncelik];
        return siralamaYonu === 'artan' 
            ? oncelikB - oncelikA 
            : oncelikA - oncelikB;
    });
    localStorageKaydet();
}