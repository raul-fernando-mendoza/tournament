const express = require('express')
var cors = require('cors')
const path = require('path');

const app = express()
app.use(cors())
const port = 3000

const siteKey= '6Lep2dkpAAAAAHSgbegNP9Vg87VzHYSgrZ3NU6dY'

app.get('/your-page.html', cors(), function (req, res) {

    console.log(req.query.response)

    if( siteKey == req.query.siteKey ){
        const url = 'https://www.google.com/recaptcha/api/siteverify'
        const data = {
        secret : "6Lep2dkpAAAAAPjhhH8AN5wigYkfB-AGilBapRfu",
        response: req.query.response
        };
        const customHeaders = {
            "Content-Type": 'application/x-www-form-urlencoded'
        }
        
        fetch(url, {
            method: "POST",
            headers: customHeaders,
            body: `secret=${data.secret}&response=${data.response}`
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                res.send(data);
            });
    }
    else{
        res.send({"error":"invalid sitekey"});
    }
    res.set('Content-Type', 'text/html');
});

app.listen(port, () => console.log(`Local Server listening on port ${port}!`))