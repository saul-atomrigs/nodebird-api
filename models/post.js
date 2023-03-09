const Sequelize = require("sequelize");

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: Sequelize.STRING(140),
          allowNull: false,
        },
        img: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Post",
        tableName: "posts",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    // User모델과 Post모델은 1:N관계이므로 :
    db.Post.belongsTo(db.User);

    // Post모델과 Hashtag모델은 N:M관계이므로 :
    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
  }
};
