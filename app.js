const express = require("express");
const app = express();
app.use(express.json());
module.exports = app;

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const moviesdbPath = path.join(__dirname, "moviesData.db");

let db = null;

let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: moviesdbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running Successfully");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
};

initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  let sql_query = `
    SELECT movie_name FROM movie;`;
  let result = await db.all(sql_query);
  response.send(
    result.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  let movieDetailsObject = request.body;
  let { directorId, movieName, leadActor } = movieDetailsObject;
  let sql_query = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(sql_query);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieID/", async (request, response) => {
  let { movieID } = request.params;
  let sql_query = `
    SELECT movie_id AS movieId, director_id AS directorId, movie_name AS movieName, lead_actor AS leadActor FROM movie
    WHERE movie_id = ${movieID};
    `;
  let result = await db.get(sql_query);
  response.send(result);
});

app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let { directorId, movieName, leadActor } = request.body;
  let sql_query = `
    UPDATE movie
    SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(sql_query);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let sql_query = `
  DELETE FROM movie
  WHERE movie_id = ${movieId};`;
  await db.run(sql_query);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  let sql_query = `
        SELECT
            director_id AS directorId,
            director_name AS directorName
        FROM director;`;
  let result = await db.all(sql_query);
  response.send(result);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  let sql_query = `
    SELECT movie_name AS movieName
    FROM movie WHERE director_id = ${directorId};`;
  let result = await db.all(sql_query);
  response.send(result);
});
