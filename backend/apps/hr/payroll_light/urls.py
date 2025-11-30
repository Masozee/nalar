from rest_framework.routers import DefaultRouter
from .views import SalaryComponentViewSet, PayrollPeriodViewSet, PayslipViewSet

router = DefaultRouter()
router.register('salary-components', SalaryComponentViewSet, basename='salary-component')
router.register('periods', PayrollPeriodViewSet, basename='payroll-period')
router.register('payslips', PayslipViewSet, basename='payslip')

urlpatterns = router.urls
