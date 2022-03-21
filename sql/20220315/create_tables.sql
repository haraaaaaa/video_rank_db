CREATE TABLE video (
    id INT NOT NULL AUTO_INCREMENT,
    videoId VARCHAR(20),
    title NVARCHAR(100),
    channelTitle NVARCHAR(50),
    publishedAt DATETIME,
    tag TEXT,
    categoryId TINYINT,
    platform TINYINT,
    PRIMARY KEY(id),
    UNIQUE INDEX (videoId)
) CHARSET=utf8;

CREATE TABLE ranking (
    id INT NOT NULL AUTO_INCREMENT,
    videoId VARCHAR(20),
    ranking TINYINT,                       
    rankedDate DATETIME,
    platform TINYINT,
    PRIMARY KEY(id)
);

CREATE TABLE platform (
    id TINYINT NOT NULL AUTO_INCREMENT,
    siteName VARCHAR(12),
    PRIMARY KEY(id)                 
);

CREATE TABLE category (
    id TINYINT NOT NULL AUTO_INCREMENT,
    categoryName VARCHAR(50),
    categoryId TINYINT,
    PRIMARY KEY(id)
);