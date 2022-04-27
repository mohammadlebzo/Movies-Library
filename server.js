'use strict';

const express = require("express");

const app = express();

const port = 3000;
const movieData = require("./Movie Data/data.json");

//functions
const favoriteHandler = (req, res) => {
    res.send("Welcome to Favorite Page");

}

const homeHandler = (req, res) => {
    // res.send("Home Page");
    // let result = [];
    let tempMovie = new Movie(
        movieData.title,
        movieData.poster_path,
        movieData.overview
    );
    // result.push(tempMovie);

    res.json(tempMovie);
}

const notFoundHandler = (req, res) => {
    let tempError = new Error('404', 'Page Not Found');
    res.send(tempError);
}

const serverIssueHandler = (req, res) => {
    let tempError = new Error('500', 'Sorry, something went wrong');
    res.send(tempError);
}

//  http://localhost:3000/
app.get("/", homeHandler);
//  http://localhost:3000/favorite
app.get("/favorite", favoriteHandler);
//  http://localhost:3000/*
app.get("/*", notFoundHandler);


//constructor
function Movie(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}

function Error(status, responseText){
    this.status = status;
    this.responseText = responseText;
}

app.listen(port, () => {
    console.log(`listening at port ${port}`);
});