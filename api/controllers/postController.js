const { comparePassword } = require("../helpers/passwordHashCompare");
const { connection } = require("../db");
const {
  get_access_token,
  get_refresh_token,
} = require("../helpers/jsonWebTokens");

const postController = {
  listPosts: (req, res) => {
    const getAllPostsQuery = "SELECT * FROM posts";
    connection.query(getAllPostsQuery, (err, posts) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Failed to fetch posts", errorStack: err.stack });
        return;
      }
      res.json(posts); // Return JSON response
    });
  },

  getOnePost: (req, res) => {
    const postId = req.params.id;
    if (!postId) {
      return res.status(400).json({ error: "post id required" });
    }

    const findPostQuery = "SELECT * FROM posts WHERE id=?";

    connection.query(findPostQuery, [postId], (err, post) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Failed to fetch posts", errorStack: err.stack });
        return;
      }
      res.json(post); // Return JSON response
    });
  },

  createPost: (req, res) => {
    const sendTitle = req.body.title;
    const sendDescription = req.body.description;
    const user_id = req.user.user_id;
    if (!sendTitle || !sendDescription || !user_id) {
      return res
        .status(400)
        .json({ error: "Title, Description and User ID is required" });
    }

    const createPostQuery =
      "INSERT INTO posts (user_id, title, description) VALUES (?,?,?)";
    connection.query(
      createPostQuery,
      [user_id, sendTitle, sendDescription],
      (err, result) => {
        if (err) {
          res
            .status(500)
            .json({ error: "Failed to create post", errorStack: err.stack });
          return;
        }

        // FETCH create post
        const fetchCreatedPostQuery = "SELECT * FROM posts WHERE id=?";
        const createdPostId = result.insertId;
        connection.query(
          fetchCreatedPostQuery,
          [createdPostId],
          (err, createdPost) => {
            if (err) {
              res.status(500).json({
                error: "Post created! Failed to fetch created post",
                errorStack: err.stack,
              });
              return;
            }
            res.status(201).json(createdPost);
          }
        );
      }
    );
  },

  updatePost: (req, res) => {
    const postId = req.params.id;
    const { title, description } = req.body;
    if (!postId || !title || !description) {
      return res
        .status(400)
        .json({ error: "Post Id, Title and Description required" });
    }

    // check if the post exists
    const fetchPostQuery = "SELECT * FROM posts WHERE id=?";
    connection.query(fetchPostQuery, [postId], (err, fetchedPosts) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Failed to fetch the post", errorStack: err.stack });
        return;
      }
      if (fetchedPosts.length === 0) {
        return res.status(404).json({ error: "Post Doesn't exists" });
      }

      if (fetchedPosts[0].user_id !== req.user.user_id) {
        return res
          .status(403)
          .json({ error: "Only post owner allowed to update the post" });
      }

      const updatePostQuery = "UPDATE posts SET ? WHERE id = ?";

      connection.query(
        updatePostQuery,
        [{ title, description }, fetchedPosts[0].id],
        (err, result) => {
          if (err) {
            res
              .status(500)
              .json({ error: "Failed to update post", errorStack: err.stack });
            return;
          }

          // FETCH updated post
          const fetchCreatedPostQuery = "SELECT * FROM posts WHERE id=?";
          const updatedPostId = postId;
          connection.query(
            fetchCreatedPostQuery,
            [updatedPostId],
            (err, updatedPost) => {
              if (err) {
                res.status(500).json({
                  error: "Post updated! Failed to fetch updated post",
                  errorStack: err.stack,
                });
                return;
              }
              res.status(200).json(updatedPost);
            }
          );
        }
      );
    });
  },

  deletPost: (req, res) => {
    const postId = req.params.id;
    if (!postId) {
      return res.status(400).json({ error: "post id is required" });
    }

    // fetch the post
    const fetchPostQuery = "SELECT * FROM posts WHERE id=?";
    connection.query(fetchPostQuery, [postId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: "post not found" });
      }
      if (result[0].user_id !== req.user.user_id) {
        return res
          .status(403)
          .json({ error: "Only post owner can delete the post" });
      }

      const deletePostQuery = "DELETE FROM posts WHERE id=?";
      connection.query(deletePostQuery, [postId], (err) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        return res.sendStatus(204);
      });
    });
  },
};

module.exports = postController;
