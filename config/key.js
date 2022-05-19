if(process.env.NODE_ENVE ==='production'){
    module.exports = require('./prod')
}
else{
    module.exports = require('./dev')
}