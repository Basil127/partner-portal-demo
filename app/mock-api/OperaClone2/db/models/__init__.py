"""operaclone2 models."""

import pkgutil
from pathlib import Path

from operaclone2.db.models.dummy_model import DummyModel as DummyModel
from operaclone2.db.models.hotel import Hotel as Hotel


def load_all_models() -> None:
    """Load all models from this folder."""
    package_dir = Path(__file__).resolve().parent
    modules = pkgutil.walk_packages(
        path=[str(package_dir)],
        prefix="operaclone2.db.models.",
    )
    for module in modules:
        __import__(module.name)
