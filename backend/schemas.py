from datetime import datetime

from pydantic import BaseModel


class LinkCreate(BaseModel):
    url: str
    note: str | None = None
    tags: str | None = None


class LinkUpdate(BaseModel):
    url: str | None = None
    note: str | None = None
    tags: str | None = None
    is_read: bool | None = None


class LinkOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    url: str
    note: str | None
    tags: str | None
    created_at: datetime
    is_read: bool
