from sqlmodel import SQLModel, create_engine
import os
    
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Synchronous Engine
sync_url = os.environ.get("DB_URL")
engine = create_engine(sync_url, echo=True)


