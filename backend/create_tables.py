from database import Base, engine
import models  # noqa: F401 — import registers Link on Base's metadata

Base.metadata.create_all(engine)
print("Tables created.")
