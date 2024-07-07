DROP DATABASE IF EXISTS crawled_spec;
CREATE DATABASE crawled_spec;
USE crawled_spec;
CREATE TABLE spec_sheet (
    id INTEGER AUTO_INCREMENT,
    main_board VARCHAR,
    CPU VARCHAR,
    RAM VARCHAR,
    VGA VARCHAR,
    storage VARCHAR,
    power_supply VARCHAR,,
    PRIMARY KEY (id)
);