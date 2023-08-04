import { config } from "dotenv";
config();

import { createPool } from "mysql2";
const pool = createPool({
    // docker 사용 시 호스트는 docker에서 설정한 컨테이너 이름으로 해야되는 것 같다.
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
});

const _pool = pool;
export { _pool as pool };