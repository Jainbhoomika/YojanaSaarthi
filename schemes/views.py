from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Scheme


def scheme_list(request):
    schemes = Scheme.objects.all()

    data = []

    for scheme in schemes:
        data.append({
            "id": scheme.id,
            "name": scheme.name,
            "description": scheme.description,
            "benefits": scheme.benefits,
            "eligibility_summary": scheme.eligibility_summary,
            "required_documents": scheme.required_documents,
            "application_process": scheme.application_process,
            "official_url": scheme.official_url,
            "last_verified": scheme.last_verified.isoformat(),
        })

    return JsonResponse(data, safe=False)

def scheme_detail(request, scheme_id):
    scheme = get_object_or_404(Scheme, id=scheme_id)

    data = {
        "id": scheme.id,
        "name": scheme.name,
        "description": scheme.description,
        "benefits": scheme.benefits,
        "eligibility_summary": scheme.eligibility_summary,
        "required_documents": scheme.required_documents,
        "application_process": scheme.application_process,
        "official_url": scheme.official_url,
        "last_verified": scheme.last_verified.isoformat(),
    }

    return JsonResponse(data)