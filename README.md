# JWTBasics
Authentication using JWT, knex, bookshelf, bcrypt
# To run
  - npm install
  - create .env file and add 
      - SECRET_OR_KEY=<key>
      - PORT= <port number>
  - Install knex globally ( npm i -g knex)
  - Install postgress
# Generate Knex file
  - knex init (Db connection parameters)
# Generate migration file
  - knex migrate:make <File name/ table name>
# Create Databse
  - go inside psql bash
  - CREATE DATABASE <DB_Name>
# Create Table using Knex Cli
  - knex migrate:latest (picks schema from knex migration file)
