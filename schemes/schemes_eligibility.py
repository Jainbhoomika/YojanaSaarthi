
def check_eligibility(scheme, profile):
    """
    Basic eligibility screening for YojanaSaarthi.

    This is an initial rule-based filter, not an official
    eligibility decision. Unknown criteria remain unverified.
    """

    name = scheme.name.lower()
    age_group = profile.get("age_group", "")
    state = profile.get("state", "").strip().lower()
    occupation = profile.get("occupation", "").strip().lower()
    interests = profile.get("interests", [])

    # Normalize the interests into searchable text.
    interest_text = " ".join(interests).lower() if isinstance(
        interests, list
    ) else str(interests).lower()

    # Rajasthan-specific scheme.
    if "mukhyamantri rajshri yojana" in name:
        if state and state != "rajasthan":
            return {
                "status": "not_matched",
                "reason": "This scheme is listed for Rajasthan.",
            }

        return {
            "status": "needs_verification",
            "reason": (
                "Check the girl's birth details, registration, "
                "benefit milestones and current Rajasthan rules."
            ),
        }

    # Schemes for girls or women.
    if "sukanya samriddhi" in name:
        return {
            "status": "needs_verification",
            "reason": (
                "Check the girl's age, account-opening rules "
                "and guardian requirements."
            ),
        }

    if "mahila samriddhi" in name:
        return {
            "status": "needs_verification",
            "reason": (
                "The exact scheme variant and implementing agency "
                "must be confirmed."
            ),
        }

    # Age and occupation are not sufficient to confirm eligibility
    # for these schemes. More specific profile fields are required.
    if "shram yogi maandhan" in name:
        return {
            "status": "needs_verification",
            "reason": (
                "Check age, monthly income, occupation and "
                "applicable pension-scheme conditions."
            ),
        }

    if "pm vishwakarma" in name:
        return {
            "status": "needs_verification",
            "reason": (
                "Check eligible traditional trade, age, family "
                "conditions and other scheme exclusions."
            ),
        }

    if "suraksha bima" in name:
        return {
            "status": "needs_verification",
            "reason": (
                "Check age, bank account, consent, premium "
                "and current scheme conditions."
            ),
        }

    # Avoid falsely confirming eligibility for schemes whose
    # rules have not yet been implemented in this first version.
    return {
        "status": "needs_verification",
        "reason": (
            "Detailed eligibility rules for this scheme have "
            "not yet been implemented."
        ),
    }