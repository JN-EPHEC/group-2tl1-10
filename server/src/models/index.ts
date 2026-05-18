import User from "./user.model";
import Category from "./category.model";
import Question from "./question.model";
import GameSession from "./gameSession.model";
import PlayerAnswer from "./playerAnswer.model";
import Setting from "./setting.model";

// Relations Category <-> Question
Category.hasMany(Question, { foreignKey: 'categoryId', as: 'questions' });
Question.belongsTo(Category, {foreignKey: 'categoryId', as: 'category' });

// Relations User <-> GameSession 
User.hasMany(GameSession, { foreignKey: 'userId', as: 'sessions' });
GameSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relations GameSession <-> PlayerAnswer
GameSession.hasMany(PlayerAnswer, { foreignKey: 'gameSessionId', as: 'answers' });
PlayerAnswer.belongsTo(GameSession, { foreignKey: 'gameSessionId' });

// Relations Questions <-> PlayerAnswer
Question.hasMany(PlayerAnswer, { foreignKey: 'questionId' });
PlayerAnswer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

// Relations Paramètres <-> Questions
Question.hasOne(Setting, { foreignKey: 'questionId', as: 'settings' });
Setting.belongsTo(Question, { foreignKey: 'questionId' });

// Relations User <-> Category
User.hasMany(Category, { foreignKey: 'userId', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Category, Question, GameSession, PlayerAnswer };