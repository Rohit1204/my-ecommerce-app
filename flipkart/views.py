from django.shortcuts import HttpResponse

from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic import View, UpdateView
from flipkart.forms import SignUpForm
from django.contrib.auth.models import User

from django.contrib import messages
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.template.loader import render_to_string
from flipkart.tokens import account_activation_token
from django.core.mail import EmailMessage
from .models import Product,Contact
from math import ceil
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)
# Create your views here.
def index(request):
    allProds = []
    catprods = Product.objects.values('category', 'id')
    cats = {item['category'] for item in catprods}
    for cat in cats:
        prod = Product.objects.filter(category=cat)
        n = len(prod)
        nSlides = n // 4 + ceil((n / 4) - (n // 4))
        allProds.append([prod, range(1, nSlides), nSlides])
    params = {'allProds':allProds}   
    return render(request,'flipkart/index.html',params)

def about(request):
      return render(request,'flipkart/about.html')

def checkout(request):
      return render(request,'flipkart/checkout.html')

def contact(request):
    if request.method=="POST":
        name = request.POST.get('name', '')
        email = request.POST.get('email', '')
        phone = request.POST.get('phone', '')
        desc = request.POST.get('desc', '')
        contact = Contact(name=name, email=email, phone=phone, desc=desc)
        contact.save()
    return render(request,'flipkart/contact.html')

def tracker(request):
      return render(request,'flipkart/tracker.html')

def search(request):
      return render(request,'flipkart/search.html')

def prodView(request,myid):
      product = Product.objects.filter(id=myid)
      return render(request,'flipkart/prodView.html',{'product':product[0]})

class ActivateAccount(View):

    def get(self, request, uidb64, token, *args, **kwargs):
        try:
            uid = force_bytes(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.profile.email_confirmed = True
            user.save()
            login(request, user)
            messages.success(request, ('Your account have been confirmed.'))
            return redirect('index')
        else:
            messages.warning(request, ('The confirmation link was invalid, possibly because it has already been used.'))
            return redirect('index')

# Sign Up View
class SignUpView(View):
    form_class = SignUpForm
    template_name = 'flipkart/signup.html'

    def get(self, request, *args, **kwargs):
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST)
        if form.is_valid():

            user = form.save(commit=False)
            user.is_active = False # Deactivate account till it is confirmed
            user.save()

            current_site = get_current_site(request)
            subject = 'Activate Your Flipkart Account'
            message = render_to_string('flipkart/account_activation_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': account_activation_token.make_token(user),
            })
            # user.email_user(subject, message)
            to_email= form.cleaned_data.get('email')
            email=EmailMessage(subject,message,to=[to_email])
            email.send()
            if(email==1):
                return HttpResponse("mail sent")
            else:
                return HttpResponse("mail could not be send")
            HttpResponse('Please Confirm your email to complete registration.')

            return redirect('index')

        return render(request, self.template_name, {'form': form})
