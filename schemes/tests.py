import csv
import tempfile
from pathlib import Path

from django.core.management import call_command
from django.core.management.base import CommandError

from django.urls import reverse
from django.test import TestCase
from schemes.models import Scheme, EligibilityCriteria
from schemes.ai.eligibility import (
    evaluate_criterion,
    evaluate_scheme_criteria,
)
class SchemeModelTest(TestCase):
    def test_scheme_can_be_created(self):
        scheme = Scheme.objects.create(
            name="Test Government Scheme",
            description="A temporary test scheme",
            benefits="Testing benefits",
            eligibility_summary="Testing eligibility",
            required_documents="",
            application_process="",
            official_url="https://example.com/test",
            last_verified="2026-10-26",
        )

        self.assertEqual(scheme.name, "Test Government Scheme")
        self.assertEqual(Scheme.objects.count(), 1)

    def test_import_creates_scheme(self):
        headers = [
            "name",
            "description",
            "benefits",
            "eligibility_summary",
            "required_documents",
            "application_process",
            "official_url",
            "last_verified",
        ]

        row = {
            "name": "Automated Test Scheme",
            "description": "Test description",
            "benefits": "Test benefits",
            "eligibility_summary": "Test eligibility",
            "required_documents": "",
            "application_process": "",
            "official_url": "https://example.com/test",
            "last_verified": "2026-10-22",
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            csv_path = Path(temp_dir) / "test_schemes.csv"

            with csv_path.open("w", encoding="utf-8", newline="") as file:
                writer = csv.DictWriter(file, fieldnames=headers)
                writer.writeheader()
                writer.writerow(row)

            call_command("import_schemes", csv=str(csv_path))

        self.assertTrue(
            Scheme.objects.filter(name="Automated Test Scheme").exists()
        )

    def test_invalid_date_rolls_back_import(self):
        headers = [
            "name",
            "description",
            "benefits",
            "eligibility_summary",
            "required_documents",
            "application_process",
            "official_url",
            "last_verified",
        ]

        rows = [
            {
                "name": "Rollback Test Scheme",
                "description": "Test description",
                "benefits": "Test benefits",
                "eligibility_summary": "Test eligibility",
                "required_documents": "",
                "application_process": "",
                "official_url": "https://example.com/test",
                "last_verified": "2026-10-22",
            },
            {
                "name": "Invalid Date Test Scheme",
                "description": "Test description",
                "benefits": "Test benefits",
                "eligibility_summary": "Test eligibility",
                "required_documents": "",
                "application_process": "",
                "official_url": "https://example.com/test",
                "last_verified": "32-15-2026",
            },
        ]

        with tempfile.TemporaryDirectory() as temp_dir:
            csv_path = Path(temp_dir) / "invalid_schemes.csv"

            with csv_path.open("w", encoding="utf-8", newline="") as file:
                writer = csv.DictWriter(file, fieldnames=headers)
                writer.writeheader()
                writer.writerows(rows)

            with self.assertRaisesMessage(
                CommandError, "Invalid date"
            ):
                call_command("import_schemes", csv=str(csv_path))

        self.assertFalse(
            Scheme.objects.filter(name="Rollback Test Scheme").exists()
        )
        self.assertFalse(
            Scheme.objects.filter(name="Invalid Date Test Scheme").exists()
        )

    def test_reimport_updates_existing_scheme(self):
        Scheme.objects.create(
            name="Repeat Import Test",
            description="Old description",
            benefits="Old benefits",
            eligibility_summary="Test eligibility",
            required_documents="",
            application_process="",
            official_url="https://example.com/test",
            last_verified="2026-10-22",
        )

        headers = [
            "name",
            "description",
            "benefits",
            "eligibility_summary",
            "required_documents",
            "application_process",
            "official_url",
            "last_verified",
        ]

        row = {
            "name": "Repeat Import Test",
            "description": "Updated description",
            "benefits": "Updated benefits",
            "eligibility_summary": "Test eligibility",
            "required_documents": "",
            "application_process": "",
            "official_url": "https://example.com/test",
            "last_verified": "2026-10-26",
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            csv_path = Path(temp_dir) / "update_test.csv"

            with csv_path.open("w", encoding="utf-8", newline="") as file:
                writer = csv.DictWriter(file, fieldnames=headers)
                writer.writeheader()
                writer.writerow(row)

            call_command("import_schemes", csv=str(csv_path))

        self.assertEqual(Scheme.objects.filter(name="Repeat Import Test").count(), 1)

        scheme = Scheme.objects.get(name="Repeat Import Test")
        self.assertEqual(scheme.description, "Updated description")
        self.assertEqual(scheme.benefits, "Updated benefits")
class SchemeAPITest(TestCase):
    def setUp(self):
        self.scheme = Scheme.objects.create(
            name="Test Scheme",
            description="A test description",
            benefits="Financial assistance",
            eligibility_summary="Eligible applicants only",
            required_documents="Identity proof",
            application_process="Apply online",
            official_url="https://example.com/scheme",
            last_verified="2026-10-26",
        )

    def test_scheme_list_api(self):
        response = self.client.get(reverse("scheme-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["name"], "Test Scheme")

    def test_scheme_detail_api(self):
        response = self.client.get(
            reverse("scheme-detail", args=[self.scheme.id])
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["name"], "Test Scheme")

    def test_scheme_detail_not_found(self):
        response = self.client.get(
            reverse("scheme-detail", args=[999999])
        )

        self.assertEqual(response.status_code, 404)
class EligibilityCriterionTest(TestCase):

    def setUp(self):
        self.scheme = Scheme.objects.create(
            name="Test Scheme",
            description="Test description",
            benefits="Test benefits",
            eligibility_summary="Test eligibility",
            official_url="https://example.com",
            last_verified="2026-10-31"
        )

        self.criterion = EligibilityCriteria.objects.create(
            scheme=self.scheme,
            criterion_type="state",
            operator="EQUALS",
            criterion_value="Rajasthan",
            is_mandatory=True
        )

    def test_state_matches(self):
        result = evaluate_criterion(
            {"state": "Rajasthan"},
            self.criterion
        )
        self.assertTrue(result["matched"])

    def test_state_does_not_match(self):
        result = evaluate_criterion(
            {"state": "Gujarat"},
            self.criterion
        )
        self.assertFalse(result["matched"])

    def test_missing_profile_value(self):
        result = evaluate_criterion(
            {},
            self.criterion
        )
        self.assertIsNone(result["matched"])

    
    def test_all_mandatory_criteria_match(self):
        
        EligibilityCriteria.objects.create(
        scheme=self.scheme,
        criterion_type="gender",
        operator="EQUALS",
        criterion_value="Female",
        is_mandatory=True
    )
        self.scheme.eligibility_rules_verified = True
        self.scheme.save()


        result = evaluate_scheme_criteria(
            self.scheme,
            {"state": "Rajasthan", "gender": "Female"}
        )

        self.assertEqual(result["status"], "eligible")

    def test_mandatory_criterion_does_not_match(self):
        result = evaluate_scheme_criteria(
            self.scheme,
            {"state": "Gujarat"}
        )

        self.assertEqual(result["status"], "not_matched")

    def test_missing_mandatory_information(self):
        result = evaluate_scheme_criteria(
            self.scheme,
            {}
        )

        self.assertEqual(result["status"], "needs_verification")

    def test_no_criteria_configured(self):
        new_scheme = Scheme.objects.create(
            name="Scheme Without Criteria",
            description="Test description",
            benefits="Test benefits",
            eligibility_summary="Test eligibility",
            official_url="https://example.com",
            last_verified="2026-10-31"
        )

        result = evaluate_scheme_criteria(new_scheme, {})

        self.assertEqual(result["status"], "needs_verification")
