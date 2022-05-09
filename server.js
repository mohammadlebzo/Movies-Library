'use strict';

const express = require("express");

const app = express();
const port = 3000;
const cors = require("cors");
const axios = require("axios").default;
const bodyParser = require('body-parser');
require("dotenv").config();
app.use(cors());
let apiKey = process.env.API_KEY;
// const movieData = require("./Movie Data/data.json");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
let urlDB = process.env.PGURL;
const { Client } = require('pg');
const client = new Client(urlDB);
//functions
const favoriteHandler = (req, res) => {
    res.send("Welcome to Favorite Page");

}

const homeHandler = (req, res) => {
    let test = `Home Path`;
    res.send(test);
}

const notFoundHandler = (req, res) => {
    let tempError = new Error('404', 'Page Not Found');
    res.send(tempError);
}

const errorHandler = (error,req,res) =>{
    res.status(500).send(error)
}

const trendingHandler = (req, res) => {
    let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`;
    axios.get(url).then(result => {
        let tempMovie = result.data.results.map(item => {
            return new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview);
        })
        res.json(tempMovie);
    }).catch(error => {
        console.log('error');
        res.send("error in getting data from API")
    });
}

const searchHandler = (req, res) => {
    let name = req.query.query;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${name}&page=2`;
    axios.get(url).then(result => {
        let tempMovie = result.data.results.map(item => {
            return new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview);
        })
        res.json(tempMovie);
    }).catch(error => {
        console.log('error');
        res.send("error in getting data from API")
    });
}

const discoverHandler = (req, res) => {
    let sort_by = req.query.sort_by;

    /* Allowed Values: , popularity.asc, popularity.desc, release_date.asc, 
                        release_date.desc, revenue.asc, revenue.desc, primary_release_date.asc, 
                        primary_release_date.desc, original_title.asc, original_title.desc, 
                        vote_average.asc, vote_average.desc, vote_count.asc, vote_count.desc
                    default: popularity.desc*/
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=${sort_by}&include_adult=false&include_video=false&page=1`;

    axios.get(url).then(result => {
        let tempMovie = result.data.results.map(item => {
            return new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview);
        })
        res.json(tempMovie);
    }).catch(error => {
        console.log('error');
        res.send("error in getting data from API")
    });
}

const upcomingHandler = (req, res) => {
    let url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`;
    axios.get(url).then(result => {
        let tempMovie = result.data.results.map(item => {
            return new Movie(item.id, item.title, item.release_date, item.poster_path, item.overview);
        })
        res.json(tempMovie);
    }).catch(error => {
        console.log('error');
        res.send("error in getting data from API")
    });
}

const postDataHandler = (req, res) => {
    console.log(req.body);
    let { id, title, release_date, poster_path, overview, personal_comment } = req.body;

    let sql = `INSERT INTO movies( id, title, release_date, poster_path, overview, personal_comment ) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;`;
    let values = [id, title, release_date, poster_path, overview, personal_comment];

    client.query(sql, values).then((result) => {
        console.log(result);
        return res.status(201).json(result.rows);

    }).catch((err) => {
        errorHandler(err, req, res);
    })
}

const getDataHandler = (req, res) => {
    let sql = `SELECT * FROM movies;`;
    client.query(sql).then((result) => {
        // console.log(result);
        res.json(result.rows);
    }).catch((err) => {
        handleError(err, req, res);
    })
}

const updateDataByIDHandler = (req, res) => {
    let {id} = req.params;
    let {personal_comment} = req.body;
    
    let sql = `UPDATE movies SET personal_comment =$1 WHERE id = ${id} RETURNING *`;
    let values = [personal_comment];

    client.query(sql, values).then(result => {
        // console.log(result.rows[0]);
        res.json(result.rows)
    }).catch()
}

const deleteDataByIDHandler = (req, res) => {
    let {id} = req.params;

    let sql = `DELETE FROM movies WHERE id =${id} RETURNING *`;

    client.query(sql).then(result => {
        // console.log(result.rows[0]);
        res.json(result.rows)
        res.status(204).json([]);
    }).catch()
}

const getDataByIDHandler = (req, res) => {
    let {id} = req.params;
    let sql = `SELECT * FROM movies WHERE id = ${id};`;
    client.query(sql).then(result => {
        // console.log(result.rows[0]);
        res.json(result.rows)
    }).catch()
}

//  http://localhost:3000/
app.get("/", homeHandler);
//  http://localhost:3000/favorite
app.get("/favorite", favoriteHandler);
//  http://localhost:3000/trending
app.get("/trending", trendingHandler);
//  http://localhost:3000/search?query="The"
app.get("/search", searchHandler);
//  http://localhost:3000/discover?sort_by=popularity.desc
app.get("/discover", discoverHandler);
//  http://localhost:3000/upcoming
app.get("/upcoming", upcomingHandler);
//  http://localhost:3000/postMovieData
app.post('/postMovieData', postDataHandler);
//  http://localhost:3000/getMovieData
app.get('/getMovieData', getDataHandler);
//  http://localhost:3000/updateMovieDataByID/{id}
app.put('/updateMovieDataByID/:id', updateDataByIDHandler);
//  http://localhost:3000/deleteMovieDataByID/{id}
app.delete('/deleteMovieDataByID/:id', deleteDataByIDHandler);
//  http://localhost:3000/getMovieDataByID/{id}
app.get('/getMovieDataByID/:id', getDataByIDHandler);
//  http://localhost:3000/*
app.get("*", notFoundHandler);

app.use(errorHandler);

//constructor
function Movie(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

function Error(status, responseText) {
    this.status = status;
    this.responseText = responseText;
}

client.connect().then(() => {

    app.listen(port, () => {
        console.log(`listening at port ${port}`);
    })
})