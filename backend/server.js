const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const db = require("./db");

const PORT = 5000;

// express 서버 생성
const app = express();

// json 형태로 오는 요청의 본문을 해석할 수 있게 등록
app.use(bodyParser.json());
app.use(cors({
    origin: ["http://localhost:3000",],
    credentials: true,
    optionsSuccessState: 200,
}));

// 테이블 생성하기
db.pool.query(`CREATE TABLE lists (
    id INTEGER AUTO_INCREMENT,
    value TEXT,
    PRIMARY KEY (id)
)`, (err, results, fields) => {
    console.log("result", results);
});


// db lists 테이블에 있는 모든 데이터를 프론트 서버에 보내주기
app.get("/api/values", function (req, res) {
    // db에서 모든 정보 가져오기
    db.pool.query("SELECT * FROM lists;",
        (err, results, fields) => {
            if (err)
                return res.status(500).send(err);
            else {
                return res.json(results);
            }
        });
});

// 클라이언트에서 입력한 값을 lists 테이블에 넣어주기
app.post("/api/value", function (req, res, next) {
    // db에 값 넣어주기
    db.pool.query(`INSERT INTO lists (value) VALUES("${req.body.value}")`,
        (err, results, fields) => {
            if (err)
                return res.status(500).send(err);
            else {
                db.pool.query(`SELECT * FROM lists ORDER BY id DESC LIMIT 1;`,
                    (err, results, fields) => {
                        if (err)
                            return res.status(500).send(err);
                        else {
                            const target = results[0]
                            return res.json({ success: true, id: target["id"], value: target["value"] })
                        };
                    });
            }
        });
});

app.delete(`/api/value/:id`, function (req, res) {
    db.pool.query(`DELETE FROM lists WHERE id=("${req.params.id}")`,
        (err, results, fields) => {
            if (err)
                return res.status(500).send(err);
            else {
                db.pool.query("SELECT * FROM lists;",
                    (err, results, fields) => {
                        if (err)
                            return res.status(500).send(err);
                        else
                            return res.json({ success: true, values: results });
                    });
            };
        });
});

app.listen(PORT, () => {
    console.log(`애플리케이션이 ${PORT}번 포트에서 시작되었습니다.`);
});

