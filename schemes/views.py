
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse
from .models import Scheme
from django.views.decorators.csrf import csrf_exempt
from .ai.recommendation import recommend_schemes
import json

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
@csrf_exempt
def recommendation_api(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST requests are allowed."},
            status=405
        )

    try:
        profile = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400
        )

    if not isinstance(profile, dict):
        return JsonResponse(
            {"error": "Profile must be a JSON object."},
            status=400
        )

    try:
        results = recommend_schemes(profile)
    except ValueError as error:
        return JsonResponse(
            {"error": str(error)},
            status=400
        )

    return JsonResponse({
        "count": len(results),
        "recommendations": results
    })

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
    
    profile = request.session.get("scheme_profile")

    if not profile:
        return redirect("scheme_form")

    results = recommend_schemes(profile)

    return render(
        request,
        "schemes/recommendations.html",
        {"results": results},
    )