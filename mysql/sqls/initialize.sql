DROP DATABASE IF EXISTS crawling;
CREATE DATABASE crawling;
USE crawling;
CREATE TABLE computer_specs (
    id INTEGER AUTO_INCREMENT,
    main_board VARCHAR,
    CPU VARCHAR,
    RAM VARCHAR,
    VGA VARCHAR,
    storage VARCHAR,
    power_supply VARCHAR,,
    PRIMARY KEY (id)
);