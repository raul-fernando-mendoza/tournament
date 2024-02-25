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