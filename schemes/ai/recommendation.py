
from functools import lru_cache

from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

from schemes.models import Scheme
from .eligibility import evaluate_scheme_criteria


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_model():
    """Load the pretrained AI model only once."""
    return SentenceTransformer(MODEL_NAME)


def build_profile_text(profile):
    """Convert the citizen's profile into richer text for semantic matching."""

    parts = []

    if profile.get("occupation"):
        parts.append(
            f"The applicant is a {profile['occupation']}."
        )

    if profile.get("education"):
        parts.append(
            f"Education level is {profile['education']}."
        )

    if profile.get("age_group"):
        parts.append(
            f"Age group: {profile['age_group']}."
        )

    if profile.get("state"):
        parts.append(
            f"Lives in {profile['state']}."
        )

    if profile.get("gender") and profile["gender"] != "Prefer not to say":
        parts.append(
            f"Gender: {profile['gender']}."
        )

    if profile.get("annual_income"):
        parts.append(
            f"Annual family income: {profile['annual_income']}."
        )

    interests = profile.get("interests", [])

    if isinstance(interests, list) and interests:
        parts.append(
            "Looking for schemes related to "
            + ", ".join(interests)
            + "."
        )

    return " ".join(parts)


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

    for index in ranked_indices:
        scheme = schemes[index]

        eligibility = evaluate_scheme_criteria(scheme, profile)

        results.append({
            "id": scheme.id,
            "name": scheme.name,
            "description": scheme.description,
            "benefits": scheme.benefits,
            "eligibility": scheme.eligibility_summary,
            "required_documents": scheme.required_documents,
            "application_process": scheme.application_process,
            "official_url": scheme.official_url,
            "last_verified": scheme.last_verified.isoformat() if scheme.last_verified else None,
            "similarity_score": round(scores[index].item(), 4),
            "eligibility_status": eligibility["status"],
            "eligibility_reason": eligibility["reason"],
        })

    # Prioritize verified eligible schemes, then schemes requiring verification.
    status_priority = {
        "eligible": 0,
        "needs_verification": 1,
        "not_matched": 2,
    }

    results.sort(
        key=lambda item: (
            status_priority.get(item["eligibility_status"], 3),
            -item["similarity_score"],
        )
    )

    return results[:max(1, top_k)]