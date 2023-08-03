const express = require("express");
const cors = require("cors"); // >>> 개발 환경용
const bodyParser = require("body-parser");

const db = require("./db");

const PORT = 5000;

// express 서버 생성
const app = express();

// json 형태로 오는 요청의 본문을 해석할 수 있게 등록
app.use(bodyParser.json());

// cors 정책 설정 >>> 개발 환경용
app.use(cors({
    origin: ["http://localhost:3000",],
    credentials: true,
    optionsSuccessState: 200,
}));

//////////////////////////////////////////////////////////////////////////// 테이블 생성하기
console.log("DB연결 성공.");
console.log("테이블 생성: main_comments");
db.pool.query(`CREATE TABLE main_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user VARCHAR(10) NOT NULL,
    pw VARCHAR(16) NOT NULL,
    content VARCHAR(100) NOT NULL
)`, (err, results, fields) => {
    if (err) {
        console.log(err);
    } else {
        console.log("main_comments 테이블:", results);
        console.log("테이블 생성: sub_comments");
        db.pool.query(`CREATE TABLE sub_comments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user VARCHAR(10) NOT NULL,
            pw VARCHAR(16) NOT NULL,
            content VARCHAR(100) NOT NULL,
            main_comments_id INT NOT NULL,
            FOREIGN KEY(main_comments_id)
            REFERENCES main_comments(id) ON DELETE CASCADE
        )`, (err, results, fields) => {
            if (err) {
                console.log(err);
            } else {
                console.log("sub_comments 테이블:", results);
            }
        });
    };
});
//////////////////////////////////////////////////////////////////////////// 테이블 생성 끝

// db main_comments 테이블에 있는 모든 데이터를 프론트 서버에 보내주기
app.get("/api/all-comments", function (req, res) {
    // db에서 모든 정보 가져오기
    db.pool.query("SELECT * FROM main_comments;",
        (err, results, fields) => {
            if (err)
                return res.status(500).send(err);
            else {
                return res.json(results);
            }
        });
});

// 클라이언트에서 입력한 값을 lists 테이블에 넣어주기
app.post("/api/add-main-comment", function (req, res) {
    // db에 값 넣어주기
    db.pool.query(`INSERT INTO main_comments VALUES("${req.body.user}, ${req.body.pw}, ${req.body.content}")`,
        (err, results, fields) => {
            if (err)
                return res.status(500).send(err);
            else {
                db.pool.query(`SELECT * FROM lists ORDER BY id DESC LIMIT 1;`,
                    (err, results, fields) => {
                        if (err)
                            return res.status(500).send(err);
                        else {
                            const returnedRecord = results[0]
                            return res.json({
                                success: true,
                                id: returnedRecord["id"],
                                user: returnedRecord["user"],
                                pw: returnedRecord["pw"],
                                content: returnedRecord["content"]
                            });
                        };
                    });
            }
        });
});

// 댓글 수정
app.patch(`/api/comment-update/:id`, function (req, res) {
    db.pool.query(`UPDATE main_comments SET content = ("${req.params.content}") WHERE id=("${req.params.id}")`,
        (err, results, fields) => {
            if (err)
                return res.status(500).send(err);
            else {
                db.pool.query("SELECT * FROM main_comments;",
                    (err, results, fields) => {
                        if (err)
                            return res.status(500).send(err);
                        else {
                            db.pool.query("SELECT * FROM main_comments;",
                                (err, results, fields) => {
                                    if (err)
                                        return res.status(500).send(err);
                                    else {
                                        return res.json({ success: true, comments: results });
                                    }
                                });
                        }
                    });
            };
        });
});

// 댓글 삭제
app.delete(`/api/comment-delete/:id`, function (req, res) {
    db.pool.query(`DELETE FROM main_comments WHERE id=("${req.params.id}")`,
        (err, results, fields) => {
            if (err)
                return res.status(500).send(err);
            else {
                db.pool.query("SELECT * FROM main_comments;",
                    (err, results, fields) => {
                        if (err)
                            return res.status(500).send(err);
                        else
                            return res.json({ success: true, comments: results });
                    });
            };
        });
});

app.listen(PORT, () => {
    console.log(`애플리케이션이 ${PORT}번 포트에서 시작되었습니다.`);
});

