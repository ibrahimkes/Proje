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
        favs_ref = db.collection(f"users/{user_id}/favorites").stream()
        favorite_place_ids = [str(fav.id) for fav in favs_ref]
        
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
        TURKISH_STOP_WORDS = [
            "acaba", "ama", "aslında", "az", "bazı", "belki", "biri", "birkaç", "biz", "bu", "çok", 
            "çünkü", "da", "daha", "de", "defa", "diye", "eğer", "en", "gibi", "hem", "hep", "hepsi", 
            "her", "hiç", "için", "ile", "ise", "kez", "ki", "kim", "mı", "mu", "mü", "nasıl", "ne", 
            "neden", "nerde", "nerede", "nereye", "niçin", "niye", "o", "sanki", "şey", "siz", "şu", 
            "tüm", "ve", "veya", "ya", "yani", "bir", "mekan", "yer", "iyi", "güzel", "olan", "olarak", "var", "yok"
        ]
        vectorizer = TfidfVectorizer(stop_words=TURKISH_STOP_WORDS)
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
        
        import math
        favorite_places = [p for p in all_places if p['id'] in favorite_place_ids]
        
        # Favorilerin merkez koordinatını hesapla
        lat_sum = 0
        lon_sum = 0
        valid_coords_count = 0
        for p in favorite_places:
            coord = p.get('coordinate')
            if coord and isinstance(coord, dict):
                lat = coord.get('latitude')
                lon = coord.get('longitude')
                if lat is not None and lon is not None:
                    lat_sum += float(lat)
                    lon_sum += float(lon)
                    valid_coords_count += 1
                    
        centroid_lat = lat_sum / valid_coords_count if valid_coords_count > 0 else None
        centroid_lon = lon_sum / valid_coords_count if valid_coords_count > 0 else None
        
        # Favori kategori frekanslarını hesapla (Kullanıcı hangi kategoriyi daha çok seviyor?)
        user_cat_counts = {}
        total_cats = 0
        for p in favorite_places:
            cats = p.get('categories', [])
            if isinstance(cats, list):
                for c in cats:
                    if c != 'all':
                        user_cat_counts[c] = user_cat_counts.get(c, 0) + 1
                        total_cats += 1
                        
        place_scores = []
        for i, place in enumerate(all_places):
            pid = place['id']
            if pid in favorite_place_ids:
                continue
                
            # 1. TF-IDF Skoru (Metin Benzerliği)
            tfidf_score = float(similarities[i])
            
            # 2. Kategori Skoru (Frekans Bazlı Benzerlik)
            cat_score = 0.0
            cats = place.get('categories', [])
            if isinstance(cats, list) and total_cats > 0:
                place_cats = [c for c in cats if c != 'all']
                for c in place_cats:
                    cat_score += user_cat_counts.get(c, 0) / total_cats
                if cat_score > 1.0:
                    cat_score = 1.0
                    
            # 3. Mesafe Skoru (Haversine)
            dist_score = 0.0
            coord = place.get('coordinate')
            if coord and centroid_lat is not None and centroid_lon is not None:
                lat = coord.get('latitude')
                lon = coord.get('longitude')
                if lat is not None and lon is not None:
                    R = 6371.0 # Dünya yarıçapı (km)
                    dLat = math.radians(float(lat) - centroid_lat)
                    dLon = math.radians(float(lon) - centroid_lon)
                    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(centroid_lat)) * math.cos(math.radians(float(lat))) * math.sin(dLon/2) * math.sin(dLon/2)
                    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
                    distance_km = R * c
                    
                    max_distance = 15.0 # Yakınlık limiti (km)
                    if distance_km < max_distance:
                        dist_score = 1.0 - (distance_km / max_distance)
                        
            # Toplam Skor Hesabı (Ağırlıklı: %30 Metin, %40 Kategori, %30 Konum)
            total_score = (tfidf_score * 0.30) + (cat_score * 0.40) + (dist_score * 0.30)
            
            # Sadece total skoru 0.05 üzerinde olanları dikkate al
            if total_score > 0.05:
                place['matchScore'] = total_score
                place_scores.append(place)
                
        # 6. Sırala ve en iyi 3 mekanı döndür
        place_scores.sort(key=lambda x: x.get('matchScore', 0), reverse=True)
        recommended_places = place_scores[:3]
        
        return {"recommendations": recommended_places}

    except Exception as e:
        print(f"Hata oluştu: {e}")
        return {"error": str(e)}
