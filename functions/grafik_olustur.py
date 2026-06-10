import matplotlib.pyplot as plt
import numpy as np

# Veriler
mekanlar = [
    "Rumkale (Tarihi)", 
    "Bakırcılar Çarşısı (Kültürel)", 
    "Zincirli Bedesten (Tarihi)", 
    "Kebapçı Halil (Restoran)", 
    "Katmerci Zekeriya (Tatlı)", 
    "Botanik Parkı (Doğa)"
]
skorlar = [0.89, 0.82, 0.78, 0.15, 0.12, 0.08]

# Renkler (Önerilenler yeşil/mavi, önerilmeyenler gri/kırmızı)
renkler = ['#2ecc71', '#2ecc71', '#2ecc71', '#e74c3c', '#e74c3c', '#e74c3c']

plt.figure(figsize=(10, 6))
bars = plt.barh(mekanlar, skorlar, color=renkler)

# Eksen ve Başlıklar
plt.xlabel('Kosinüs Benzerlik Skoru (Cosine Similarity)', fontsize=12)
plt.title('Kullanıcı Profiline Göre Mekanların Yapay Zeka Benzerlik Skorları\n(Senaryo: "Tarihi/Kültürel" Ağırlıklı Kullanıcı)', fontsize=14)
plt.xlim(0, 1.0)
plt.gca().invert_yaxis()  # En yüksek skor en üstte olsun

# Çubukların yanına değerleri yazdırma
for bar in bars:
    plt.text(bar.get_width() + 0.01, bar.get_y() + bar.get_height()/2, 
             f'%{int(bar.get_width()*100)}', 
             va='center', fontsize=11, fontweight='bold')

# Arka plan çizgileri
plt.grid(axis='x', linestyle='--', alpha=0.7)
plt.tight_layout()

# Resmi Masaüstüne Kaydet
plt.savefig('/Users/kes/Desktop/Oneri_Algoritmasi_Grafigi.png', dpi=300)
print("Grafik masaüstüne başarıyla kaydedildi: Oneri_Algoritmasi_Grafigi.png")
