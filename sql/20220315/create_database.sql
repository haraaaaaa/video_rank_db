CREATE DATABASE video_rank;
CREATE USER db1@localhost IDENTIFIED BY 'dkagh1.';
GRANT ALL PRIVILEGES ON video_rank.* TO db1@localhost IDENTIFIED BY 'dkagh1.';
FLUSH PRIVILEGES;