
import csv
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from schemes.models import Scheme


class Command(BaseCommand):
    help = "Import government schemes from schemes/Data/schemes.csv"

    def handle(self, *args, **options):
        csv_path = Path(__file__).resolve().parents[2] / "Data" / "schemes.csv"

        if not csv_path.exists():
            raise CommandError(f"CSV file not found: {csv_path}")

        created_count = 0
        updated_count = 0

        with csv_path.open("r", encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)

            required_columns = [
                "name",
                "description",
                "benefits",
                "eligibility_summary",
                "required_documents",
                "application_process",
                "official_url",
                "last_verified",
            ]

            if not reader.fieldnames or not all(
                column in reader.fieldnames for column in required_columns
            ):
                raise CommandError("The CSV headers do not match the expected columns.")

            for row in reader:
                if not row.get("name", "").strip():
                    continue

                row["last_verified"] = row["last_verified"].strip()

                _, created = Scheme.objects.update_or_create(
                    name=row["name"].strip(),
                    defaults={
                        "description": row["description"].strip(),
                        "benefits": row["benefits"].strip(),
                        "eligibility_summary": row["eligibility_summary"].strip(),
                        "required_documents": row["required_documents"].strip(),
                        "application_process": row["application_process"].strip(),
                        "official_url": row["official_url"].strip(),
                        "last_verified": row["last_verified"],
                    },
                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Import complete. Created: {created_count}, Updated: {updated_count}"
            )
        )