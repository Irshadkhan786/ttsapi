var express = require('express');
var {sum,mul,subs} = require('./test')
var app = express();

app.get('/test',async (req,res)=>{

    var val1 = parseInt(req.query.a);
    
    var val2 = parseInt(req.query.b);
    /* sum(val1,val2,(data)=>{
        mul(data,10,(mulres)=>{
            subs(mulres,20,(subsres)=>{
                res.send('Sum resilt is'+data+" and multiply res is "+mulres+" and substract res is "+subsres);
            })
            
        })
        
    }) */
    /* var sumRes = sum(val1,val2);
    var mulRes = mul(sumRes,10);
    var subsRes = subs(mulRes,20);
    res.send('Sum resilt is'+sumRes+" and multiply res is "+mulRes+" and substract res is "+subsRes); */
   /*  sum(val1,val2).then((sumRes)=>{
        mul(sumRes,10).then((mulRes)=>{
            console.log(mulRes)
        })
    }) */
    
    var sumRes = await sum(val1,val2);
   
    var mulRes = await mul(sumRes,10);
    console.log(mulRes)
    /* var mulRes = mul(sumRes,10)
    console.log(mulRes) */

    
})

app.listen(3000,()=>{
    console.log('server is running on port 3000');
})