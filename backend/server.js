const cors = require("cors"); // >>> 개발 환경용
const express = require("express");
const bodyParser = require("body-parser");

const db = require("./db");

const PORT = 5000;

// express 서버 생성
const app = express();

// json 형태로 오는 요청의 본문을 해석할 수 있게 등록
app.use(bodyParser.json());

// cors 정책 설정 >>> 개발 환경용
app.use(cors({
    origin: ["http://localhost:3000", "http://frontend",],
    credentials: true,
    optionsSuccessState: 200,
}));

// 서버 열기
app.listen(PORT, () => {
    console.log(`애플리케이션이 ${PORT}번 포트에서 시작되었습니다.`);
});

//////////////////////////////////////////////////////////////////////////// 테이블 생성하기
db.pool.query(`CREATE TABLE main_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user VARCHAR(10) NOT NULL,
    pw VARCHAR(16) NOT NULL,
    content VARCHAR(100) NOT NULL
)`, (err, results) => {
    if (err) {
        console.log(err);
    } else {
        console.log("main_comments 테이블:", results);
        db.pool.query(`CREATE TABLE sub_comments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user VARCHAR(10) NOT NULL,
            pw VARCHAR(16) NOT NULL,
            content VARCHAR(100) NOT NULL,
            main_comments_id INT NOT NULL,
            FOREIGN KEY(main_comments_id)
            REFERENCES main_comments(id) ON DELETE CASCADE
        )`, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                console.log("sub_comments 테이블:", results);
                console.log("DB연결 성공.");
            }
        });
    };
});
//////////////////////////////////////////////////////////////////////////// 테이블 생성 끝

// 유틸리티 함수: 객체에서 pw만 빼주는 함수
const commentListWithoutPw = (comments) => {
    const result = comments.map(comment => {
        const { pw, ...commentWithoutPw } = comment;
        return commentWithoutPw;
    });
    return result;
};

// 서버
// db main_comments 테이블에 있는 모든 데이터를 프론트 서버에 보내주기
app.get("/api/all-comments", function (req, res) {
    // db에서 모든 정보 가져오기
    db.pool.query("SELECT * FROM main_comments;",
        (err, results) => {
            if (err)
                return res.status(500).json({
                    statusCode: res.statusCode,
                    message: err,
                });
            else {
                return res.status(200).json(commentListWithoutPw(results));
            }
        });
});

// 클라이언트에서 입력한 값을 main_comments 테이블에 넣어주기
app.post("/api/add-main-comment", function (req, res) {
    // db에 값 넣어주기
    db.pool.query(`INSERT INTO main_comments VALUES(NULL,"${req.body.user}", "${req.body.pw}", "${req.body.content}")`,
        (err) => {
            if (err) {
                return res.status(500).json({
                    statusCode: res.statusCode,
                    message: err,
                });
            } else {
                db.pool.query(`SELECT * FROM main_comments ORDER BY id DESC LIMIT 1;`,
                    (err, results) => {
                        if (err)
                            return res.status(500).json({
                                statusCode: res.statusCode,
                                message: err,
                            });
                        else {
                            const comment = results[0]
                            return res.status(200).json({
                                success: true,
                                id: comment["id"],
                                user: comment["user"],
                                content: comment["content"]
                            });
                        };
                    });
            }
        });
});

// 댓글 수정
app.patch(`/api/comment-update/:id`, function (req, res) {
    // db에서 id로 불러온다.
    db.pool.query(`SELECT * FROM main_comments WHERE id=("${req.params.id}")`,
        (err, results) => {
            if (err) {
                // id로 불러오지 못함
                console.log("id로 불러오지 못함")
                console.log(err)
                return res.status(500).json({
                    statusCode: res.statusCode,
                    message: err,
                });
            } else {
                // 성공적으로 불러옴
                const comment = results[0]
                // 요청으로 받은 암호와 원래의 암호가 같은지 확인
                if (req.body.pw === comment["pw"]) {
                    // 암호가 같아서 수정함
                    db.pool.query(`UPDATE main_comments SET content = ("${req.body.content}") WHERE id=("${req.params.id}")`,
                        (err) => {
                            if (err) {
                                // 수정에 실패함
                                console.log("수정에 실패함")
                                console.log(err)
                                return res.status(500).json({
                                    statusCode: res.statusCode,
                                    message: err,
                                });
                            }
                            else {
                                // 수정에 성공하여 댓글을 업데이트한 목록을 가져옴
                                db.pool.query("SELECT * FROM main_comments;",
                                    (err, results) => {
                                        if (err)
                                            // 새 목록 가져오기 실패
                                            return res.status(500).json({
                                                statusCode: res.statusCode,
                                                message: err,
                                            });
                                        else {
                                            // 목록 가져오기 성공
                                            return res.status(200).json({
                                                success: true,
                                                comments: commentListWithoutPw(results)
                                            });
                                        }
                                    }
                                );
                            };
                        }
                    );
                } else {
                    // 암호가 다름
                    return res.status(400).json({
                        statusCode: res.statusCode,
                        message: "올바른 암호를 입력하세요."
                    });
                }
            }
        }
    )
});

// 댓글 삭제
app.delete(`/api/comment-delete/:id`, function (req, res) {
    // db에서 id로 불러온다.
    db.pool.query(`SELECT * FROM main_comments WHERE id=("${req.params.id}")`,
        (err, results) => {
            if (err)
                // id로 불러오지 못함
                return res.status(500).json({
                    statusCode: res.statusCode,
                    message: err,
                });
            else {
                // 성공적으로 불러옴
                const comment = results[0]
                // 요청으로 받은 암호와 원래의 암호가 같은지 확인
                if (req.body.pw === comment["pw"]) {
                    // 암호가 같아서 삭제
                    db.pool.query(`DELETE FROM main_comments WHERE id=("${req.params.id}")`,
                        (err) => {
                            if (err)
                                // 삭제 실패
                                return res.status(500).json({
                                    statusCode: res.statusCode,
                                    message: err,
                                });
                            else {
                                // 삭제 성공하여 업데이트한 목록을 가져옴
                                db.pool.query("SELECT * FROM main_comments;",
                                    (err, results) => {
                                        if (err)
                                            // 가져오기 실패
                                            return res.status(500).json({
                                                statusCode: res.statusCode,
                                                message: err,
                                            });
                                        else
                                            // 성공
                                            return res.status(200).json({
                                                success: true,
                                                comments: commentListWithoutPw(results),
                                            });
                                    });
                            };
                        });
                } else {
                    // 암호가 다름
                    return res.status(400).json({
                        statusCode: res.statusCode,
                        message: "올바른 암호를 입력하세요.",
                    });
                }
            }
        }
    )
});