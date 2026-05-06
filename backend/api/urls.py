from django.urls import path
from . import views

urlpatterns = [
    path('upload-csv/', views.upload_csv, name='upload_csv'),
    path('reconcile/', views.trigger_reconciliation, name='trigger_reconciliation'),
    path('summary/', views.summary, name='summary'),
    path('reconciliation/', views.reconciliation_list, name='reconciliation_list'),
    path('category-breakdown/', views.category_breakdown, name='category_breakdown'),
]
