from decimal import Decimal, InvalidOperation
from schemes.models import EligibilityCriteria


def evaluate_criterion(profile, criterion):
    """
    Compare one citizen profile value with one eligibility criterion.
    """

    criterion_type = criterion.criterion_type
    operator = criterion.operator
    expected_value = criterion.criterion_value

    actual_value = profile.get(criterion_type)

    # Missing profile information cannot be verified.
    if actual_value is None or actual_value == "":
        return {
            "matched": None,
            "reason": f"Profile information missing: {criterion_type}"
        }

    # Normalize text values for comparison.
    if isinstance(actual_value, str):
        actual_value = actual_value.strip().lower()

    if operator == "EQUALS":
        expected = expected_value
        if isinstance(expected, str):
            expected = expected.strip().lower()

        matched = actual_value == expected

    elif operator == "IN":
        if not isinstance(expected_value, list):
            return {"matched": None, "reason": "Invalid IN criterion value."}

        expected = [
            value.strip().lower() if isinstance(value, str) else value
            for value in expected_value
        ]

        matched = actual_value in expected

    elif operator in ("GREATER_THAN", "LESS_THAN", "BETWEEN"):
        try:
            actual = Decimal(str(actual_value))

            if operator == "GREATER_THAN":
                matched = actual > Decimal(str(expected_value))

            elif operator == "LESS_THAN":
                matched = actual < Decimal(str(expected_value))

            else:
                if not isinstance(expected_value, list) or len(expected_value) != 2:
                    return {"matched": None, "reason": "Invalid BETWEEN criterion value."}

                lower = Decimal(str(expected_value[0]))
                upper = Decimal(str(expected_value[1]))

                if lower > upper:
                    return {"matched": None, "reason": "Invalid BETWEEN range."}

                matched = lower <= actual <= upper

        except (InvalidOperation, TypeError, ValueError):
            return {
                "matched": None,
                "reason": f"Invalid numeric value for {criterion_type}."
            }

    else:
        return {
            "matched": None,
            "reason": f"Unsupported operator: {operator}"
        }

    return {
        "matched": matched,
        "reason": (
            f"{criterion_type} matched."
            if matched
            else f"{criterion_type} did not match."
        )
    }


def evaluate_scheme_criteria(scheme, profile):
    """
    Evaluate all database criteria associated with a scheme.
    """

    criteria = scheme.eligibility_criteria.all()

    if not criteria.exists():
        return {
            "status": "needs_verification",
            "reason": "No eligibility criteria have been added for this scheme.",
            "matched_criteria": [],
            "unmatched_criteria": [],
            "unknown_criteria": []
        }

    matched_criteria = []
    unmatched_criteria = []
    unknown_criteria = []

    for criterion in criteria:
        result = evaluate_criterion(profile, criterion)

        criterion_result = {
            "criterion": criterion.criterion_type,
            "mandatory": criterion.is_mandatory,
            "reason": result["reason"]
        }

        if result["matched"] is True:
            matched_criteria.append(criterion_result)

        elif result["matched"] is False:
            if criterion.is_mandatory:
                unmatched_criteria.append(criterion_result)
            else:
                # An optional criterion mismatch does not disqualify.
                pass

        else:
            unknown_criteria.append(criterion_result)

        if unmatched_criteria:
            status = "not_matched"
            reason = "One or more mandatory eligibility criteria were not satisfied."

        elif unknown_criteria:
            status = "needs_verification"
            reason = "Some eligibility criteria could not be verified."

        elif not scheme.eligibility_rules_verified:
            status = "needs_verification"
            reason = "The complete eligibility rules for this scheme have not been verified."

        else:
            status = "eligible"
            reason = "All verified eligibility criteria were satisfied."
    return {
        "status": status,
        "reason": reason,
        "matched_criteria": matched_criteria,
        "unmatched_criteria": unmatched_criteria,
        "unknown_criteria": unknown_criteria
    }

