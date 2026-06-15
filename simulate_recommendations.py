import json
import numpy as np
import math
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def simulate():
    # Load mockData.js and extract JSON
    with open('src/constants/mockData.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Very hacky way to extract places from mockData.js since it's JS, not JSON.
    # Let's just use the JS script to print JSON.
    pass

if __name__ == "__main__":
    simulate()
