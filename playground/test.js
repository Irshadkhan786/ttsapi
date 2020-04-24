var sum = (a,b)=>{
    
    return Promise.resolve(a+b)
}

var mul = (a,b)=>{
    return Promise.resolve(a*b)
}

var subs = (a,b)=>{
    return Promise.resolve(a-b)
}
module.exports = {
    sum,mul,subs
}