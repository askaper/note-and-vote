import {ActionHandler, handleActions} from '../actionHandler';

const addKnocker = new ActionHandler('ADD_KNOCKER', (knockers, action) => {
  return [...knockers, {id: action.id, message: action.message}];
});

const rejectKnocker = new ActionHandler('REJECT_KNOCKER', (knockers, action) => {
  return knockers.filter(knocker => knocker.id !== action.id);
});

const approveKnocker = new ActionHandler('APPROVE_KNOCKER', (knockers, action) => {
  return knockers.filter(knocker => knocker.id !== action.id);
});

const actions = [addKnocker, rejectKnocker, approveKnocker];

const KnockerReducer = (knockers = [], action) => {
  const newKnockers = handleActions(actions, knockers, action);
  newKnockers.each(knocker => Object.freeze(knocker));
  Object.freeze(newKnockers);
  return newKnockers;
};

export default KnockerReducer;
