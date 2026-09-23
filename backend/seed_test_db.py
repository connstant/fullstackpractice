"""Create a local SQLite test database filled with mock links.

Usage (from backend/):
    python seed_test_db.py

Then run the API against it:
    $env:DATABASE_URL = "sqlite:///test.db"; uvicorn main:app --reload --port 8000
"""

import os
from datetime import datetime, timedelta, timezone

TEST_DB_URL = "sqlite:///test.db"

# Set before importing database.py so it never touches the real Supabase URL.
# (load_dotenv doesn't override variables that are already set.)
os.environ["DATABASE_URL"] = TEST_DB_URL

from database import Base, SessionLocal, engine  # noqa: E402
import models  # noqa: E402

MOCK_LINKS = [
    ("https://react.dev/learn", "Official React tutorial", "react,learning", True),
    ("https://react.dev/reference/react/useEffect", "useEffect reference", "react,hooks", False),
    ("https://react.dev/reference/react/useState", "useState reference", "react,hooks", True),
    ("https://tanstack.com/query/latest", "For Phase 3", "react,fetching", False),
    ("https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API", "MDN fetch docs", "javascript,fetching", True),
    ("https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS", "Read before the CORS experiment", "http,cors", False),
    ("https://developer.mozilla.org/en-US/docs/Web/HTTP/Status", "HTTP status codes", "http", False),
    ("https://fastapi.tiangolo.com/tutorial/", "FastAPI tutorial", "python,fastapi", True),
    ("https://fastapi.tiangolo.com/tutorial/cors/", None, "python,fastapi,cors", False),
    ("https://docs.sqlalchemy.org/en/20/orm/quickstart.html", "SQLAlchemy 2.0 ORM quickstart", "python,database", False),
    ("https://supabase.com/docs/guides/database/overview", "Supabase Postgres docs", "database", False),
    ("https://www.typescriptlang.org/docs/handbook/2/everyday-types.html", "TS everyday types", "typescript", True),
    ("https://vite.dev/guide/", None, None, False),
    ("https://vercel.com/docs", "For the deployment stretch goal", "deployment", False),
    ("https://github.com/Kludex/mangum", "FastAPI on Lambda", "python,deployment", False),
]


def main():
    # Start fresh every run so the data is predictable
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    now = datetime.now(timezone.utc)
    with SessionLocal() as db:
        for i, (url, note, tags, is_read) in enumerate(MOCK_LINKS):
            db.add(
                models.Link(
                    url=url,
                    note=note,
                    tags=tags,
                    is_read=is_read,
                    # Spread over the past few weeks so ordering is visible
                    created_at=now - timedelta(days=i * 2, hours=i),
                )
            )
        db.commit()

    print(f"Seeded {len(MOCK_LINKS)} links into backend/test.db")


if __name__ == "__main__":
    main()
