
from functools import lru_cache

from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

from schemes.models import Scheme
from .eligibility import check_eligibility


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_model():
    """Load the pretrained AI model only once."""
    return SentenceTransformer(MODEL_NAME)


def build_profile_text(profile):
    """Convert structured form answers into a search description."""

    fields = [
        ("Age group", "age_group"),
        ("State", "state"),
        ("Education", "education"),
        ("Annual family income", "annual_income"),
        ("Occupation", "occupation"),
        ("Gender", "gender"),
    ]

    parts = []

    for label, key in fields:
        value = profile.get(key)

        if value and value != "Prefer not to say":
            parts.append(f"{label}: {value}")

    interests = profile.get("interests", [])

    if isinstance(interests, list) and interests:
        parts.append("Support needed: " + ", ".join(interests))

    return ". ".join(parts)


def recommend_schemes(profile, top_k=5):
    """
    Rank schemes using a structured form profile.

    This ranks relevance only. It does not confirm eligibility.
    """

    if not isinstance(profile, dict):
        raise ValueError("Profile must be a dictionary.")

    user_text = build_profile_text(profile)

    if not user_text.strip():
        return []

    schemes = list(Scheme.objects.all())

    if not schemes:
        return []

    scheme_texts = [
        (
            f"Scheme: {scheme.name}. "
            f"Description: {scheme.description}. "
            f"Benefits: {scheme.benefits}. "
            f"Eligibility: {scheme.eligibility_summary}."
        )
        for scheme in schemes
    ]

    model = get_model()

    user_embedding = model.encode(
        user_text,
        convert_to_tensor=True,
        normalize_embeddings=True,
    )

    scheme_embeddings = model.encode(
        scheme_texts,
        convert_to_tensor=True,
        normalize_embeddings=True,
    )

    scores = cos_sim(user_embedding, scheme_embeddings)[0]
    ranked_indices = scores.argsort(descending=True).tolist()

    
    results = []

    for index in ranked_indices[:max(1, top_k)]:
        scheme = schemes[index]

        eligibility = check_eligibility(scheme, profile)

        results.append({
            "name": scheme.name,
            "description": scheme.description,
            "benefits": scheme.benefits,
            "eligibility": scheme.eligibility_summary,
            "official_url": scheme.official_url,
            "similarity_score": round(scores[index].item(), 4),
            "eligibility_status": eligibility["status"],
            "eligibility_reason": eligibility["reason"],
        })

    return results