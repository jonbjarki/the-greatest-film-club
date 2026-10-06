# class RefreshSession(SQLModel, table=True):
#     __tablename__ = "refresh_sessions"
#     id: int = Field(primary_key=True)
#     jti: uuid.UUID = Field(unique=True, index=True)
#     user_id: uuid.UUID = Field(foreign_key="user.id")
#     expires_at: datetime = Field(
#         sa_type=DateTime(timezone=True),
#         default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=7),
#     )
#     created_at: datetime = Field(
#         sa_type=DateTime(timezone=True),
#         default_factory=lambda: datetime.now(timezone.utc),
#     )
#     revoked_at: datetime | None = Field(
#         sa_type=DateTime(timezone=True),
#         default=None,
#     )
#     # Tokens to return while refresh token is in grace period
#     # These tokens are provided to the client while the current refresh token is still valid but is about to be revoked.
#     # Work around for refresh race conditions
#     next_access_token: str | None
#     next_refresh_token: str | None
#     next_access_expires_at: datetime | None = Field(
#         sa_type=DateTime(timezone=True),
#         default=None,
#     )
