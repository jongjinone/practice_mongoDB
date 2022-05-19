const express = require('express')
const app = express()
const port = 3000
const {User} = require('./models/User')
const bodyParser = require('body-parser')
const config = require('./config/key')

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())                              //bodyParser에 대한 옵션 설정

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)        //mongoDB 연결
.then(()=>console.log("DB연결 성공!"))
.catch((err)=>console.log("err"))

app.get('/', (req, res) => {   
    res.send("안녕!")
})

app.post('/register', (req, res) => {
    const user = new User(req.body)
    user.save((err, userInfo)=>{                             //save는 mongoDB의 method
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })   
})

app.listen(port, ()=> console.log('서버가 돌아감!'))