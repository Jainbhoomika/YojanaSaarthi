
import csv
from pathlib import Path
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from schemes.models import Scheme


class Command(BaseCommand):
    help = "Import government schemes from schemes/Data/schemes.csv"
    def add_arguments(self, parser):
        parser.add_argument(
            "--csv",
            type=str,
            help="Path to the CSV file to import.",
        )
    def handle(self, *args, **options):
        if options["csv"]:
            csv_path = Path(options["csv"]).resolve()
        else:
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
            with transaction.atomic():
                for row_number,row in enumerate(reader, start=2):
                    if not row.get("name", "").strip():
                        continue

                    date_text = row.get("last_verified", "").strip()
                    if not date_text:
                        raise CommandError(
                            f"Missing last_verified date on CSV line {row_number}."
                        )
                    
                    try:
                        datetime.strptime(date_text, "%Y-%m-%d")
                    except ValueError:
                        raise CommandError(
                            f"Invalid date '{date_text}' on CSV line {row_number}. "
                            "Expected format: YYYY-MM-DD."
                        )

                    row["last_verified"] = date_text

                    official_url = row.get("official_url", "").strip()

                    if not official_url:
                        raise CommandError(
                            f"Missing official_url on CSV line {row_number}."
                        )
                    
                    _, created = Scheme.objects.update_or_create(
                        name=row["name"].strip(),
                        defaults={
                            "description": row["description"].strip(),
                            "benefits": row["benefits"].strip(),
                            "eligibility_summary": row["eligibility_summary"].strip(),
                            "required_documents": row["required_documents"].strip(),
                            "application_process": row["application_process"].strip(),
                            "official_url": official_url,
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