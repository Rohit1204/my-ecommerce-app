from django.urls import path
from . import views
 
urlpatterns=[
    path('',views.index,name='ShopHome'),
    path('about/',views.about,name='About'),
    path('checkout/',views.checkout,name='Checkout'),
    path('tracker/',views.tracker,name='TrackingStatus'),
    path('search/',views.search,name='search'),
    path('products/<int:myid>',views.prodView,name='ProductView'),
    path('contact/',views.contact,name='ContactUs'),
]