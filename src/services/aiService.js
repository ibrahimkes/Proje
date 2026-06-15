import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const generatePlaceDescription = async (placeTitle, placeCategory) => {
    if (!genAI) {
        throw new Error("Gemini API Key eksik. Lütfen .env dosyanızı kontrol edin.");
    }

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

    const prompt = `
Sen profesyonel, entelektüel ve bilgili bir turist rehberisin.
Şehir: Gaziantep
Mekan Adı: "${placeTitle}"
Kategori: "${placeCategory || 'Genel'}"

Bana bu mekan hakkında turistlere yönelik, sanki şu an mekanı gezdiriyormuşsun gibi son derece detaylı, tarihi gerçeklerle zenginleştirilmiş, ilgi çekici ve bilgilendirici 2-3 dakikalık (yaklaşık 600-750 kelime) Türkçe bir anlatım yap. 
Lütfen şu detaylara mutlaka yer ver:
- Bu mekanın geçmişi ve tarihi önemi nedir?
- İsmi nereden geliyor veya tarihi arka planında ne yatıyor?
- Kim tarafından, hangi dönemde veya neden yapılmış?
- Şu an içeride neler sergileniyor veya ziyaretçileri tam olarak ne bekliyor?
- Mimari, sanatsal veya kültürel olarak en çok dikkat çeken ince detaylar neler?

Lütfen markdown kullanma (kalın, eğik yazı vb. işaretler olmasın), sadece düz metin ver ki sesli okumada noktalama işaretleri düzgün okunsun. Yıldız (*) veya diyez (#) gibi karakterler kesinlikle kullanma.
Girişte klasik "Merhaba, hoş geldiniz" kalıplarını çok kısa tutup direkt etkileyici hikayeye giriş yap.
Önemli Not: Mekanın mutlaka Gaziantep'te olduğunu göz önünde bulundurarak anlatımı yap.
`;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message);
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
                throw error; // All models failed
            }
        }
    }
};
