const express = require('express')
const app = express()
const port = 3000
const { User } = require('./models/User')
const bodyParser = require('body-parser')
const config = require('./config/key')
const cookieParser = require('cookie-parser')
const {auth} = require('./middleware/auth')


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())                              //bodyParser에 대한 옵션 설정
app.use(cookieParser())   //cookieParser에 대한 설정

const mongoose = require('mongoose')
const { cookie } = require('express/lib/response')
mongoose.connect(config.mongoURI)        //mongoDB 연결
    .then(() => console.log("DB연결 성공!"))
    .catch((err) => console.log("err"))

app.get('/', (req, res) => {
    res.send("안녕!")
})

app.post('/api/users/register', (req, res) => { //정보 등록 경로
    const user = new User(req.body) //입력된 요청 정보를 통해 user라는 클래스 생성
    user.save((err, userInfo) => {                             //save는 mongoDB의 method userinfo는 입력된 유저의 정보임.
        if (err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/api/users/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, userInfo) => {  //findOne은 mongoose 모듈 함수로, 정보가 일치하는 데이터를 찾고 함수를 실행. userinfo에는 해당하는 스키마를 저장함.
        if (!userInfo) {  //해당 유저정보가 존재하지 않은 경우
            return res.json({
                login: false,
                message: '해당하는 유저가 없습니다.'
            })
        }
        userInfo.comparePassword(req.body.password, (err, isMatch) => {      //comparePassword는 User모델 파일에서 내가 만든 임의의 함수로 에러와 결과값(isMatch)을 반환받음. 
            if (!isMatch) {
                return res.json({
                    login: false, 
                    message: "비밀번호가 틀렸습니다."
                })
            }

        userInfo.genToken((err, user) => { //user파일에서 임의로 만든 임의의 함수로 에러와 결과값을 반환받음. 
            if(err) return res.status(400).send(err) //에러발생   
            res.cookie("x_auth", user.token)         //브라우저의 쿠키에 x_auth라는 이름에 토큰을 저장
                .status(200)
                .json({login: true, userId : user._id})
            })
        })
    })
})

app.get('/api/users/auth', auth, (req, res)=>{ 
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role===0? false:true, //role이 0이라면 일반 유저(false), 0이 아니면 관리자(true) 
        isAuth: true,
        email:req.user.email,
        name:req.user.name,
        lastname:req.user.lastname,
        role:req.user.role,
        image:req.user.image

    })
})

app.get('/api/users/logout', auth, (req,res)=>{
    User.findOneAndUpdate({_id:req.user._id}, {token: ""}, //id를 통해 해당하는 데이터의 스키마를 찾고 token을 업데이트 해준 뒤, 함수를 실행
    (err, user)=> {
        if (err) return res.json({success: false, err});
        return res.status(200).send({
            success: true
        })
    })
})

app.listen(port, () => console.log('서버가 돌아감!'))