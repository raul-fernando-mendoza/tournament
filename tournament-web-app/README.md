firebase emulators:start

firebase init emulators

firebase login --reauth

firebase deploy

# use the followng to select the hosting option.
firebase projects:list
firebase use <project_id>
firebase init
firebase init storage
firebase init hosting


#use to deploy the app first compile for deployment
ng build --configuration="production"
firebase deploy

git push https://raul-fernando-mendoza@github.com/raul-fernando-mendoza/tournament.git


QUILL

npm install @types/quill
npm install ngx-quill
npm install quill

in the angular.json add

            "styles": [
              "@angular/material/prebuilt-themes/indigo-pink.css",
              "./node_modules/quill/dist/quill.core.css",
              "./node_modules/quill/dist/quill.bubble.css",
              "./node_modules/quill/dist/quill.snow.css",             
              "src/styles.css"
            ],

<quill-editor></quill-editor>


recaptcha:
add the path in 
https://www.google.com/recaptcha/admin/site/690039338


https://yurigentili.it/adding-google-recaptcha-v3-on-angular-without-external-modules/

**************** namecheap.com 
add the following 
Type: TXT record
host: @
value: hosting-site=rax-tournament-de
TTL: automatic

Type: A Record
Host: @
value: 199.36.158.100
TTL:Automatic

Type: A Record
Host: www
value: 199.36.158.100
TTL:Automatic

*********************

to use the custom domain on the popup login:

in environment.prod.ts
const firebaseConfig = {
  ...
  authDomain: "miscompetencias.com",

in gcp cloud console go to APIs & Services
  ->OAuth 2.0 Client IDs
    -Web client (auto created by Google Service)
      ->Authorized JavaScript origins
        -> add https://miscompetencias.com
      ->Authorized redirect URIs
        ->add https://miscompetencias.com/__/auth/handler