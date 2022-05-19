const mongoose = require('mongoose')
const bcrypt = require('bcrypt') //salt를 이용하여 암호화를 진행
const saltRounds = 10   // salt의 글자수 
const jwt = require('jsonwebtoken')


const userSchema = mongoose.Schema({              //스키마는 mongoDB와 연동되어 있고, 데이터 형식을 지정해 줌. 
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,    //space를 없애주는 역할
        unique: 1, //중복 제거
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {                //관리자와 일반 유저를 구분
        type: Number,
        default: 0,
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: {
        type: Number
    },
})

userSchema.pre('save', function (next) {                 //mongoose의 method로 저장하기 전에 함수를 실행함
    var user = this //this는 userSchema를 의미하고 mongoDB와 연동되어있음

    if (user.isModified('password')) { //isModified는 mongoose 모듈 함수로서 입력값에 해당하는 스키마의 데이터가 변경된 경우는 true를 반환
        bcrypt.genSalt(saltRounds, function (err, salt) {          //앞서 정해놓은 자리수만큼 salt를 만들고 함수를 실행
            if (err) return next(err);
            bcrypt.hash(user.password, salt, function (err, hash) {     //만들어진 salt를 이용하여 입력받은 값(DB안의 password)의 hash를 만들고 비밀번호를 암호화된 hash로 바꿔줌
                if (err) return next(err);
                user.password = hash
                next()
            })
        })
    }
    else {
        next()
    }
})

userSchema.methods.comparePassword = function (password, cb) {           //함수 이름은 임의로 만들어도 됨. 비밀번호를 입력받고 콜백함수를 실행
    bcrypt.compare(password, this.password, function (err, isMatch) {   //compare는 모듈함수로  입력값과 해시값(이미 해시처리 되어 있음)을 비교하고 콜백함수를 실행 
        if (err) return cb(err); // cb는 에러를 전달
        cb(null, isMatch) //cb에서 에러는 null이고 ismatch를 전달 ismatch는 true를 반환
    })
}

userSchema.methods.genToken = function (cb) { //함수 이름은 임의로 만들어도 됨. 비밀번호를 입력받고 콜백함수를 실행
    var user = this //this는 스키마를 의미함.
    var token = jwt.sign(user._id.toHexString(), "Myname") //모듈의 함수를 통해 입력받은 값(스키마 안의 id)과, 임의의 값(Jongjin)을 이용하여 token을 생성  

    user.token = token //DB와 연동되어있는 스키마의 'token' 데이터에 만든 token값을 입력해 줌
    user.save(function (err, user) {
        if (err) return cb(err);
        cb(null, user) // 에러는 null이고 user 스키마 자체를 반환하네...?
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this

    jwt.verify(token, 'Myname', function(err, decoded){ //token과 token생성 시 사용한 문자열을 통해 원래 데이터를 찾아낸다.
        user.findOne({"_id":decoded, "token":token}, function(err, user){ //모듈함수를 통해 id와 토큰이 일치하는 데이터를 찾아낸다.
            if(err) return cb(err)
            cb(null, user)      //찾은 경우 오류는 없고 user 스키마 자체를 반환
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }