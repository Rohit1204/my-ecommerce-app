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
    path("handlerequest/", views.handlerequest, name="HandleRequest"),
    path('signup/', views.signup, name='signup'),
    path('activate/<uidb64>[0-9A-Za-z_\-]/<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20}/',
        views.activate,name='activate'),
]
