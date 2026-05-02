from django.contrib.auth import views as auth_views
from django.urls import path, reverse_lazy

from . import views

urlpatterns=[
    path('',views.index,name='ShopHome'),
    path('about/',views.about,name='About'),
    path('checkout/',views.checkout,name='Checkout'),
    path('tracker/',views.tracker,name='TrackingStatus'),
    path('search/',views.search,name='search'),
    path('search-results/',views.search_results,name='search-results'),
    path('products/<int:myid>',views.prodView,name='ProductView'),
    path('contact/',views.contact,name='ContactUs'),
    path("handlerequest/", views.handlerequest, name="HandleRequest"),
    path('signup/', views.signup, name='signup'),
    path("login/", views.frontend_login_redirect, name="login"),
    path(
        'logout/',
        auth_views.LogoutView.as_view(next_page=reverse_lazy('login')),
        name='logout',
    ),
]
