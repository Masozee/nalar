# Assets models
# Import submodule models for Django to discover them
from apps.assets.maintenance.models import Asset, MaintenanceSchedule, MaintenanceRecord  # noqa
from apps.assets.assignment.models import AssetAssignment, AssetTransfer, AssetCheckout  # noqa
