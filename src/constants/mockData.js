export const ANTEP_CENTER_COORDINATE = { latitude: 37.0667, longitude: 37.3833 };

export const MOCK_MARKERS = [
  {
    id: '1',
    title: "Antakya Sofrası",
    subtitle: "Hatay Yöresel Mutfağı",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    coordinate: { latitude: 37.0620, longitude: 37.3800 },
    categories: ["Kebap", "Meze"],
    description: "Hatay'ın eşsiz lezzetlerini sunan, özellikle tepsi kebabı ve künefesiyle meşhur otantik bir mekan.",
    comments: [
      { id: 'c1', user: "Ahmet Y.", rating: 5, text: "Tepsi kebabı harikaydı, kesinlikle tavsiye ederim.", date: "2 gün önce" },
      { id: 'c2', user: "Ayşe K.", rating: 4, text: "Mezeler çok taze, çalışanlar ilgili.", date: "1 hafta önce" }
    ]
  },
  {
    id: '2',
    title: "İmam Çağdaş",
    subtitle: "Kebap ve Baklava",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1544025162-811ccebe13e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    coordinate: { latitude: 37.0627, longitude: 37.3780 },
    categories: ["Kebap", "Baklava"],
    description: "Gaziantep'in en köklü ve bilinen kebapçılarından biri. Ali Nazik ve havuç dilimi baklavası efsane.",
    comments: [
      { id: 'c3', user: "Mehmet T.", rating: 5, text: "Yediğim en iyi Ali Nazik.", date: "1 ay önce" }
    ]
  },
  {
    id: '3',
    title: "Koçak Baklava",
    subtitle: "Geleneksel Tatlılar",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1628109312211-e40d04ce945f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    coordinate: { latitude: 37.0685, longitude: 37.3865 },
    categories: ["Baklava", "Tatlı"],
    description: "Günlük taze üretilen, çıtır çıtır Gaziantep baklavaları. Fıstıklı şöbiyet denemeye değer.",
    comments: [
      { id: 'c4', user: "Elif S.", rating: 5, text: "Baklavalar her zaman taze ve bol fıstıklı.", date: "3 gün önce" }
    ]
  }
];

export const CATEGORIES = [
  { id: 'all', title: 'Tümü' },
  { id: 'kebap', title: 'Kebap', icon: 'room-service' },
  { id: 'meze', title: 'Meze', icon: 'local-dining' },
  { id: 'baklava', title: 'Baklava', icon: 'cake' }
];
