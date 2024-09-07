/**
 * use first gen 
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
 exports.captchaserver = (req, res) => {

    response.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });

    // intercept OPTIONS method
    if(request.method === 'OPTIONS') {
        response.send(200);
    }    
    else{
        const siteKeyValid= '6Lep2dkpAAAAAHSgbegNP9Vg87VzHYSgrZ3NU6dY'

        siteKey = req.body.siteKey || req.query.siteKey 
        response = req.body.response || req.query.response

        console.log("***********siteKey:" + siteKey)
        console.log("***********response:" + response)

        if( siteKeyValid == siteKey ){
            const url = 'https://www.google.com/recaptcha/api/siteverify'
            const data = {
            "secret" : "6Lep2dkpAAAAAPjhhH8AN5wigYkfB-AGilBapRfu",
            "response": response
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
            res.send({"error":"invalid siteKey"});
        }
        res.set({
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin':'*'
        })

    //  let message = req.query.message || req.body.message || 'Hello World!';
    //  res.status(200).send(message);
    }
};
