from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize Firebase Admin SDK
initialize_app()

@https_fn.on_call(region="europe-west1")
def recommend_places(req: https_fn.CallableRequest) -> any:
    """
    Kullanıcının favorilerine göre içerik tabanlı (Content-Based)
    Kosinüs benzerliği (Cosine Similarity) kullanarak mekan önerir.
    """
    db = firestore.client()
    user_id = req.data.get("userId")
    
    if not user_id:
        return {"error": "userId parametresi eksik."}
        
    try:
        # 1. Kullanıcının favorilerini çek
        favs_ref = db.collection("favorites").where("userId", "==", user_id).stream()
        favorite_place_ids = [fav.to_dict().get("placeId") for fav in favs_ref]
        
        # 2. Tüm mekanları çek
        places_ref = db.collection("places").stream()
        all_places = []
        for p in places_ref:
            p_dict = p.to_dict()
            p_dict['id'] = p.id
            all_places.append(p_dict)
            
        if not all_places:
            return {"recommendations": []}
            
        # Eğer kullanıcının hiç favorisi yoksa, rastgele veya en yüksek puanlı 3 mekanı döndür
        if not favorite_place_ids:
            # Puanı en yüksek olanlardan 3 tane al
            sorted_places = sorted(all_places, key=lambda x: x.get('rating', 0), reverse=True)
            return {"recommendations": sorted_places[:3]}

        # 3. TF-IDF ve İçerik Hazırlığı (Başlık + Kategoriler + Açıklama)
        corpus = []
        place_ids = []
        
        for place in all_places:
            title = place.get('title', '')
            cats = " ".join(place.get('categories', [])) if isinstance(place.get('categories'), list) else ""
            desc = place.get('description', '')
            # Metinleri birleştirerek mekana ait bir "İçerik Profili" oluşturuyoruz
            # Kategorilere daha fazla ağırlık vermek için 2 kez ekleyebiliriz
            combined_text = f"{title} {cats} {cats} {desc}".lower()
            corpus.append(combined_text)
            place_ids.append(place['id'])
            
        # Metinleri Vektöre Çevir
        vectorizer = TfidfVectorizer(stop_words=None)
        tfidf_matrix = vectorizer.fit_transform(corpus)
        
        # 4. Kullanıcı Profili Vektörünü Oluşturma
        # Kullanıcının favori mekanlarının vektörlerinin ortalamasını alırız
        favorite_indices = [i for i, pid in enumerate(place_ids) if pid in favorite_place_ids]
        
        if not favorite_indices:
            sorted_places = sorted(all_places, key=lambda x: x.get('rating', 0), reverse=True)
            return {"recommendations": sorted_places[:3]}
            
        user_profile_vector = np.asarray(tfidf_matrix[favorite_indices].mean(axis=0))
        
        # 5. Kosinüs Benzerliği Hesaplama
        # Kullanıcı profili ile diğer tüm mekanların vektörlerini karşılaştır
        similarities = cosine_similarity(user_profile_vector, tfidf_matrix)[0]
        
        # Skorları mekan ID'leri ile eşleştir ve yüksekten düşüğe sırala
        place_scores = [(place_ids[i], similarities[i]) for i in range(len(place_ids))]
        place_scores.sort(key=lambda x: x[1], reverse=True)
        
        # 6. Zaten favoride olan mekanları filtrele ve En iyi 3'ünü al
        recommended_places = []
        for pid, score in place_scores:
            if pid not in favorite_place_ids:
                # Orijinal mekan objesini bul
                place_obj = next((p for p in all_places if p['id'] == pid), None)
                if place_obj:
                    place_obj['matchScore'] = float(score)  # Skoru da ekleyelim
                    recommended_places.append(place_obj)
            
            if len(recommended_places) >= 3:
                break
                
        # Eğer hiç öneri kalmadıysa (tüm mekanları favorilediyse) boş dön
        return {"recommendations": recommended_places}

    except Exception as e:
        print(f"Hata oluştu: {e}")
        return {"error": str(e)}
