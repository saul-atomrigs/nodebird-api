/**
 * host: 인터넷 주소
 * type: 도메인 종류 (free: 무료, premium: 유료)
 * clientSecret: 클라이언트 비밀키
 */

const Sequelize = require('sequelize');

module.exports = class Domain extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      host: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('free', 'premium'),
        allowNull: false,
      },
      clientSecret: {
        type: Sequelize.STRING(36),
        allowNull: false,
      },
    }, {
      sequelize,
      timestamps: true,
      paranoid: true,
      modelName: 'Domain',
      tableName: 'domains',
    });
  }

  static associate(db) {
    // 일대다관계 (사용자 한 명이 여러 도메인을 소유할 수 있음):
    db.Domain.belongsTo(db.User);
  }
};