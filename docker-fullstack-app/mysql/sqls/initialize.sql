DROP DATABASE IF EXISTS myapp;

CREATE DATABASE myapp;

USE myapp;

CREATE TABLE
    main_comment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user VARCHAR(10) NOT NULL,
        pw VARCHAR(16) NOT NULL,
        content VARCHAR(100) NOT NULL
    );

CREATE TABLE
    sub_comment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user VARCHAR(10) NOT NULL,
        pw VARCHAR(16) NOT NULL,
        content VARCHAR(100) NOT NULL,
        main_comment_id INT NOT NULL,
        FOREIGN KEY(main_comment_id) REFERENCES main_comment(id) ON DELETE CASCADE
    );