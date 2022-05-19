const {User} = require('../models/User')

let auth = (req, res, next) => {
    let token = req.cookies.x_auth //쿠키에 저장된 토큰을 가져옴.

    User.findByToken(token, (err, user)=>{   //user파일에서 임의로 만든 임의의 함수로 에러와 결과값을 반환받음. 
        if(err) throw err //throw는 에러 발생 시 함수 실행이 중지되고 에러 전달
        if(!user) return res.json({
            isAuth: false,
            error: true
        })

        req.token = token        
        req.user = user
        next() //다음 미드웨어로 넘어갈 수 있다.
    })
}

module.exports = {auth}