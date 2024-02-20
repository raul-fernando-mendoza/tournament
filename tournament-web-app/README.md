firebase emulators:start

firebase init emulators

firebase login --reauth

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
