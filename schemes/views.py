
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse
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


def scheme_form(request):
    if request.method == "POST":
        profile = {
            "age": request.POST.get("age", ""),
            "age_group": request.POST.get("age_group", ""),
            "state": request.POST.get("state", ""),
            "education": request.POST.get("education", ""),
            "annual_income": request.POST.get("annual_income", ""),
            "occupation": request.POST.get("occupation", ""),
            "gender": request.POST.get("gender", ""),
            "interests": request.POST.getlist("interests"),
        }

        request.session["scheme_profile"] = profile
        return redirect(reverse("recommendations"))

    return render(request, "schemes/scheme_form.html")


def recommendations(request):
    from schemes.ai_engine import recommend_schemes

    profile = request.session.get("scheme_profile")

    if not profile:
        return redirect("scheme_form")

    results = recommend_schemes(profile)

    return render(
        request,
        "schemes/recommendations.html",
        {"results": results},
    )